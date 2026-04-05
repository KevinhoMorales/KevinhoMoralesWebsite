import { NextResponse } from 'next/server';
import {
  AdminUnauthorized,
  assertAdminUser,
  adminUnauthorizedResponse,
  getAdminFirestore,
} from '@/lib/admin-api-server';
import {
  PROD_ADMIN_DOC_ID,
  PROD_COLLECTION,
  PROJECTS_SUBCOLLECTION,
} from '@/lib/firebase-paths';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await assertAdminUser(req);
  } catch (e) {
    if (e instanceof AdminUnauthorized) {
      return adminUnauthorizedResponse(e);
    }
    throw e;
  }
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
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
  const ref = db
    .collection(PROD_COLLECTION)
    .doc(PROD_ADMIN_DOC_ID)
    .collection(PROJECTS_SUBCOLLECTION)
    .doc(id);
  await ref.set({ ...data, id }, { merge: true });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await assertAdminUser(req);
  } catch (e) {
    if (e instanceof AdminUnauthorized) {
      return adminUnauthorizedResponse(e);
    }
    throw e;
  }
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  const db = getAdminFirestore();
  await db
    .collection(PROD_COLLECTION)
    .doc(PROD_ADMIN_DOC_ID)
    .collection(PROJECTS_SUBCOLLECTION)
    .doc(id)
    .delete();
  return NextResponse.json({ ok: true });
}
