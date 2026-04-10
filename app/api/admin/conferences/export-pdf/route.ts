import { NextResponse } from 'next/server';
import { adminFetchConferences } from '@/lib/firestore-admin-content';
import {
  AdminUnauthorized,
  assertAdminUser,
  adminUnauthorizedResponse,
} from '@/lib/admin-api-server';
import { sortConferencesForDisplay } from '@/lib/conference-sort';
import { buildConferencesPdfBuffer, parseLocale, type ConferencePdfLocale } from '@/lib/conferences-pdf-export';

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

  const list = await adminFetchConferences();
  if (list === null) {
    return NextResponse.json({ error: 'Firebase Admin no configurado' }, { status: 503 });
  }
  if (list.length === 0) {
    return NextResponse.json({ error: 'No hay charlas para exportar' }, { status: 400 });
  }

  const url = new URL(req.url);
  const conferenceId = url.searchParams.get('id')?.trim();
  if (!conferenceId) {
    return NextResponse.json({ error: 'Falta el id de la charla a exportar' }, { status: 400 });
  }

  const conference = list.find((c) => c.id === conferenceId);
  if (!conference) {
    return NextResponse.json({ error: 'Charla no encontrada' }, { status: 404 });
  }

  const langParam = url.searchParams.get('lang');
  const locale: ConferencePdfLocale = parseLocale(langParam);

  const sorted = sortConferencesForDisplay([conference]);
  const buffer = await buildConferencesPdfBuffer(sorted, locale);

  const day = new Date().toISOString().slice(0, 10);
  const safeId = conferenceId.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80);
  const filename = `talk-${safeId}-${day}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
