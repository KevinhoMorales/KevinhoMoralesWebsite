import { NextResponse } from 'next/server';
import { adminDeleteWaitlistEntryByDocId } from '@/lib/firestore-admin-waitlist';
import {
  AdminUnauthorized,
  assertAdminUser,
  adminUnauthorizedResponse,
} from '@/lib/admin-api-server';

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await assertAdminUser(req);
  } catch (e) {
    if (e instanceof AdminUnauthorized) {
      return adminUnauthorizedResponse(e);
    }
    throw e;
  }

  const id = params.id?.trim();
  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  try {
    const ok = await adminDeleteWaitlistEntryByDocId(id);
    if (!ok) {
      return NextResponse.json({ error: 'Firebase Admin no configurado' }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al borrar';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
