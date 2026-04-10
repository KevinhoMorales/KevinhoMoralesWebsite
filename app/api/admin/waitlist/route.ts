import { NextResponse } from 'next/server';
import {
  adminCountWaitlistSignups,
  adminFetchWaitlistEntries,
} from '@/lib/firestore-admin-waitlist';
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

  const [list, aggregateTotal] = await Promise.all([
    adminFetchWaitlistEntries(),
    adminCountWaitlistSignups(),
  ]);
  if (list === null) {
    return NextResponse.json({ error: 'Firebase Admin no configurado' }, { status: 503 });
  }
  const totalCount = aggregateTotal ?? list.length;
  return NextResponse.json({ entries: list, totalCount });
}
