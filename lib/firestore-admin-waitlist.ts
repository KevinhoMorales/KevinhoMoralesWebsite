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

export async function adminSaveWaitlistSignup(input: {
  email: string;
  firstName: string;
  lastName: string;
  userAgent?: string;
}): Promise<{ id: string } | null> {
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
  const displayName = `${firstName} ${lastName}`.trim().slice(0, 120);
  const userAgent = input.userAgent?.trim().slice(0, 512);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = FieldValue.serverTimestamp();

    if (!snap.exists) {
      tx.set(ref, {
        email,
        emailLower,
        firstName,
        lastName,
        displayName,
        source: 'waitlist_modal',
        createdAt: now,
        updatedAt: now,
        ...(userAgent ? { userAgent } : {}),
      });
      return;
    }

    const upd: Record<string, unknown> = {
      email,
      emailLower,
      firstName,
      lastName,
      displayName,
      updatedAt: now,
      organization: FieldValue.delete(),
    };
    if (userAgent) upd.userAgent = userAgent;
    tx.update(ref, upd);
  });

  return { id };
}

function millisFromFirestoreValue(v: unknown): number {
  if (v instanceof Timestamp) return v.toMillis();
  return 0;
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
        emailLower: typeof d.emailLower === 'string' ? d.emailLower : undefined,
        firstName: typeof d.firstName === 'string' ? d.firstName : undefined,
        lastName: typeof d.lastName === 'string' ? d.lastName : undefined,
        displayName: typeof d.displayName === 'string' ? d.displayName : undefined,
        organization: typeof d.organization === 'string' ? d.organization : undefined,
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
