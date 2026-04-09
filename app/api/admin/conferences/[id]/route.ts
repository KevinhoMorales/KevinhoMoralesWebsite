import { FieldValue } from 'firebase-admin/firestore';
import { applyConferencePayloadForFirestore } from '@/lib/admin-conference-firestore-write';
import { NextResponse } from 'next/server';
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

export async function PUT(
  req: Request,
  ctx: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    await assertAdminUser(req);
  } catch (e) {
    if (e instanceof AdminUnauthorized) {
      return adminUnauthorizedResponse(e);
    }
    throw e;
  }
  const { id } = await Promise.resolve(ctx.params);
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
    .collection(CONFERENCES_SUBCOLLECTION)
    .doc(id);
  const { createdAt: _c, updatedAt: _u, ...payload } = data as Record<string, unknown>;
  const write = applyConferencePayloadForFirestore(
    { ...(payload as Record<string, unknown>), id },
    { merge: true }
  );
  try {
    await ref.set({ ...write, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/conferences PUT] Firestore set failed:', id, msg);
    return NextResponse.json({ error: `Firestore: ${msg}` }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: Request,
  ctx: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    await assertAdminUser(req);
  } catch (e) {
    if (e instanceof AdminUnauthorized) {
      return adminUnauthorizedResponse(e);
    }
    throw e;
  }
  const { id } = await Promise.resolve(ctx.params);
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  const db = getAdminFirestore();
  await db
    .collection(PROD_COLLECTION)
    .doc(PROD_ADMIN_DOC_ID)
    .collection(CONFERENCES_SUBCOLLECTION)
    .doc(id)
    .delete();
  return NextResponse.json({ ok: true });
}
