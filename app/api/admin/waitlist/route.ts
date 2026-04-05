import { NextResponse } from 'next/server';
import { adminFetchWaitlistEntries } from '@/lib/firestore-admin-waitlist';
import { AdminUnauthorized, assertAdminUser, adminUnauthorizedResponse } from '@/lib/admin-api-server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await assertAdminUser(req);
  } catch (e) {
    if (e instanceof AdminUnauthorized) {
      return adminUnauthorizedResponse(e);
    }
    throw e;
  }

  const list = await adminFetchWaitlistEntries();
  if (list === null) {
    return NextResponse.json({ error: 'Firebase Admin no configurado' }, { status: 503 });
  }
  return NextResponse.json(list);
}
