import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { tryGetAdminApp } from '@/lib/firebase-admin';

export class AdminUnauthorized extends Error {
  constructor() {
    super('Unauthorized');
    this.name = 'AdminUnauthorized';
  }
}

export function requireAdminApp() {
  const app = tryGetAdminApp();
  if (!app) {
    throw new Error('Firebase Admin no configurado (FIREBASE_ADMIN_SDK_KEY o GOOGLE_APPLICATION_CREDENTIALS)');
  }
  return app;
}

export function getAdminFirestore() {
  return getFirestore(requireAdminApp());
}

function bearerToken(req: Request): string | null {
  const h = req.headers.get('authorization');
  if (!h?.toLowerCase().startsWith('bearer ')) return null;
  const t = h.slice(7).trim();
  return t || null;
}

/**
 * Valida el ID token de Firebase Auth (cabecera Authorization: Bearer …).
 * Opcional: ADMIN_ALLOWED_EMAILS=correo@x.com,otro@y.com para restringir el panel.
 */
export async function assertAdminUser(req: Request): Promise<{ uid: string; email: string }> {
  const idToken = bearerToken(req);
  if (!idToken) throw new AdminUnauthorized();

  const app = requireAdminApp();
  const auth = getAuth(app);
  let decoded: DecodedIdToken;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch {
    throw new AdminUnauthorized();
  }

  const email = decoded.email?.trim().toLowerCase() ?? '';
  if (!email) throw new AdminUnauthorized();

  const allow = process.env.ADMIN_ALLOWED_EMAILS?.trim();
  if (allow) {
    const set = new Set(
      allow
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    );
    if (!set.has(email)) throw new AdminUnauthorized();
  }

  return { uid: decoded.uid, email };
}
