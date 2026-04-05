import { NextResponse } from 'next/server';
import { adminFetchConferences } from '@/lib/firestore-admin-content';
import {
  AdminUnauthorized,
  assertAdminUser,
  adminUnauthorizedResponse,
  getAdminFirestore,
} from '@/lib/admin-api-server';
import {
  CONFERENCES_SUBCOLLECTION,
  PROD_ADMIN_DOC_ID,
  PROD_COLLECTION,
} from '@/lib/firebase-paths';

export async function GET(req: Request) {
  try {
    await assertAdminUser(req);
  } catch (e) {
    if (e instanceof AdminUnauthorized) {
      return adminUnauthorizedResponse(e);
    }
    throw e;
  }
  const list = await adminFetchConferences();
  if (list === null) {
    return NextResponse.json({ error: 'Firebase Admin no configurado' }, { status: 503 });
  }
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  try {
    await assertAdminUser(req);
  } catch (e) {
    if (e instanceof AdminUnauthorized) {
      return adminUnauthorizedResponse(e);
    }
    throw e;
  }
  let body: { data?: Record<string, unknown> };
  try {
    body = (await req.json()) as { data?: Record<string, unknown> };
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }
  const data = body.data;
  if (!data || typeof data !== 'object') {
    return NextResponse.json({ error: 'Campo data requerido' }, { status: 400 });
  }
  const db = getAdminFirestore();
  const col = db
    .collection(PROD_COLLECTION)
    .doc(PROD_ADMIN_DOC_ID)
    .collection(CONFERENCES_SUBCOLLECTION);
  const ref = col.doc();
  await ref.set({ ...data, id: ref.id });
  return NextResponse.json({ id: ref.id });
}
