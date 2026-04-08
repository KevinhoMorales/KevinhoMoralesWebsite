import { createHash } from 'crypto';
import { FieldValue, getFirestore, Timestamp, type QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { tryGetAdminApp } from '@/lib/firebase-admin';
import {
  PROD_ADMIN_DOC_ID,
  PROD_COLLECTION,
  WAITLIST_SUBCOLLECTION,
} from '@/lib/firebase-paths';
import type { WaitlistEntry } from '@/types/waitlist';

const FIRESTORE_READ_MS = 5_000;

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} (${FIRESTORE_READ_MS}ms)`)), FIRESTORE_READ_MS);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

function tsToIso(v: unknown): string | null {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  return null;
}

function waitlistDocRef(emailLower: string): string {
  return createHash('sha256').update(emailLower).digest('hex');
}

export type WaitlistSignupSaveResult =
  | { status: 'created'; id: string }
  | { status: 'exists'; id: string };

export async function adminSaveWaitlistSignup(input: {
  email: string;
  firstName: string;
  lastName: string;
  organization: string;
  heardFrom?: string;
  userAgent?: string;
}): Promise<WaitlistSignupSaveResult | null> {
  const app = tryGetAdminApp();
  if (!app) return null;

  const email = input.email.trim();
  const emailLower = email.toLowerCase();
  const id = waitlistDocRef(emailLower);
  const db = getFirestore(app);
  const ref = db
    .collection(PROD_COLLECTION)
    .doc(PROD_ADMIN_DOC_ID)
    .collection(WAITLIST_SUBCOLLECTION)
    .doc(id);

  const firstName = input.firstName.trim().slice(0, 120);
  const lastName = input.lastName.trim().slice(0, 120);
  const organization = input.organization.trim().slice(0, 120);
  const heardFrom = input.heardFrom?.trim();
  const heardFromStored =
    heardFrom && heardFrom.length > 0 ? heardFrom.slice(0, 32) : undefined;
  const displayName = `${firstName} ${lastName}`.trim().slice(0, 120);
  const userAgent = input.userAgent?.trim().slice(0, 512);

  let created = false;
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);

    if (!snap.exists) {
      created = true;
      const now = FieldValue.serverTimestamp();
      tx.set(ref, {
        email,
        firstName,
        lastName,
        organization,
        displayName,
        source: 'waitlist_modal',
        createdAt: now,
        updatedAt: now,
        ...(userAgent ? { userAgent } : {}),
        ...(heardFromStored ? { heardFrom: heardFromStored } : {}),
      });
      return;
    }

    // Siguiente envío con el mismo correo: no sobrescribir ni duplicar notificación.
  });

  return created ? { status: 'created', id } : { status: 'exists', id };
}

function millisFromFirestoreValue(v: unknown): number {
  if (v instanceof Timestamp) return v.toMillis();
  return 0;
}

/**
 * Conteo vía agregado `count()` (barato; puede verse menos alineado que una lectura completa en casos raros).
 * Ruta: `{PROD_COLLECTION}/{PROD_ADMIN_DOC_ID}/waitlist` (por defecto `prod/admin/waitlist`).
 */
export async function adminCountWaitlistSignups(): Promise<number | null> {
  const app = tryGetAdminApp();
  if (!app) return null;
  const db = getFirestore(app);
  const col = db
    .collection(PROD_COLLECTION)
    .doc(PROD_ADMIN_DOC_ID)
    .collection(WAITLIST_SUBCOLLECTION);

  try {
    const snap = await withTimeout(col.count().get(), 'firestore waitlist count');
    return snap.data().count;
  } catch (err) {
    console.warn('[firestore-admin] waitlist count failed:', err);
    return null;
  }
}

/**
 * Conteo leyendo la subcolección entera (`QuerySnapshot#size`). Refleja lo mismo que ves en la consola
 * al listar documentos en `prod/admin/waitlist`. Preferible para el número del correo de thank-you.
 * En consola hay que borrar **los documentos dentro de esa subcolección**; borrar solo el doc `admin`
 * no elimina `waitlist`.
 */
export async function adminCountWaitlistSignupsDirect(): Promise<number | null> {
  const app = tryGetAdminApp();
  if (!app) return null;
  const db = getFirestore(app);
  const col = db
    .collection(PROD_COLLECTION)
    .doc(PROD_ADMIN_DOC_ID)
    .collection(WAITLIST_SUBCOLLECTION);

  try {
    const snap = await withTimeout(col.get(), 'firestore waitlist direct count');
    return snap.size;
  } catch (err) {
    console.warn('[firestore-admin] waitlist direct count failed:', err);
    return null;
  }
}

const WAITLIST_COUNT_AFTER_WRITE_ATTEMPTS = 4;
const WAITLIST_COUNT_AFTER_WRITE_DELAY_MS = 100;
const WAITLIST_COUNT_BEFORE_FIRST_READ_MS = 100;

/**
 * Tras un alta nuevo: lectura **directa** de la subcolección varias veces con pausa (el write debe verse
 * en `get()`). Se usa el **último** valor; no el máximo, para no quedar con conteos obsoletos altos.
 */
export async function adminCountWaitlistSignupsAfterWrite(): Promise<number | null> {
  await new Promise((r) => setTimeout(r, WAITLIST_COUNT_BEFORE_FIRST_READ_MS));
  let last: number | null = null;
  for (let i = 0; i < WAITLIST_COUNT_AFTER_WRITE_ATTEMPTS; i++) {
    const n = await adminCountWaitlistSignupsDirect();
    if (n != null) {
      last = n;
    }
    if (i < WAITLIST_COUNT_AFTER_WRITE_ATTEMPTS - 1) {
      await new Promise((r) => setTimeout(r, WAITLIST_COUNT_AFTER_WRITE_DELAY_MS));
    }
  }
  return last;
}

export async function adminFetchWaitlistEntries(): Promise<WaitlistEntry[] | null> {
  const app = tryGetAdminApp();
  if (!app) return null;
  const db = getFirestore(app);
  const col = db
    .collection(PROD_COLLECTION)
    .doc(PROD_ADMIN_DOC_ID)
    .collection(WAITLIST_SUBCOLLECTION);

  try {
    let docs: QueryDocumentSnapshot[];
    try {
      const snap = await withTimeout(
        col.orderBy('createdAt', 'desc').limit(500).get(),
        'firestore waitlist'
      );
      docs = snap.docs;
    } catch (orderErr) {
      console.warn('[firestore-admin] waitlist orderBy falló, usando lectura sin índice:', orderErr);
      const snap = await withTimeout(col.limit(500).get(), 'firestore waitlist (sin orderBy)');
      docs = [...snap.docs].sort(
        (a, b) => millisFromFirestoreValue(b.data().createdAt) - millisFromFirestoreValue(a.data().createdAt)
      );
    }

    const out: WaitlistEntry[] = [];
    for (const doc of docs) {
      const d = doc.data() as Record<string, unknown>;
      out.push({
        id: doc.id,
        email: typeof d.email === 'string' ? d.email : '',
        firstName: typeof d.firstName === 'string' ? d.firstName : undefined,
        lastName: typeof d.lastName === 'string' ? d.lastName : undefined,
        displayName: typeof d.displayName === 'string' ? d.displayName : undefined,
        organization: typeof d.organization === 'string' ? d.organization : undefined,
        heardFrom: typeof d.heardFrom === 'string' ? d.heardFrom : undefined,
        source: typeof d.source === 'string' ? d.source : undefined,
        userAgent: typeof d.userAgent === 'string' ? d.userAgent : undefined,
        createdAt: tsToIso(d.createdAt),
        updatedAt: tsToIso(d.updatedAt),
      });
    }
    return out;
  } catch (err) {
    console.warn('[firestore-admin] waitlist read failed:', err);
    return null;
  }
}
