import { NextResponse } from 'next/server';
import {
  adminCountWaitlistSignups,
  adminFetchWaitlistEntries,
} from '@/lib/firestore-admin-waitlist';
import { buildWaitlistAnalytics } from '@/lib/waitlist-analytics';
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

  const totalInFirestore = aggregateTotal ?? list.length;
  const analytics = buildWaitlistAnalytics(list, totalInFirestore);
  return NextResponse.json(analytics);
}
