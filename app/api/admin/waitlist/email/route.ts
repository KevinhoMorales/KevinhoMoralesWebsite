import { NextResponse } from 'next/server';

import { AdminUnauthorized, assertAdminUser, adminUnauthorizedResponse } from '@/lib/admin-api-server';
import { sendWaitlistAdminBulkEmails } from '@/lib/send-waitlist-admin-bulk';

/** Hasta ~100 destinatarios con pausas de 10s entre lotes de 5 puede tardar >2 min (requiere límite de función en Vercel, p. ej. Pro). */
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    await assertAdminUser(req);
  } catch (e) {
    if (e instanceof AdminUnauthorized) {
      return adminUnauthorizedResponse(e);
    }
    throw e;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const recipients = (body as { recipients?: unknown }).recipients;
  const subject = (body as { subject?: unknown }).subject;
  const bodyText = (body as { bodyText?: unknown }).bodyText;

  if (!Array.isArray(recipients) || recipients.some((r) => typeof r !== 'string')) {
    return NextResponse.json({ error: 'invalid_recipients' }, { status: 400 });
  }
  if (typeof subject !== 'string' || typeof bodyText !== 'string') {
    return NextResponse.json({ error: 'invalid_fields' }, { status: 400 });
  }

  const result = await sendWaitlistAdminBulkEmails({ recipients, subject, bodyText });

  if (!result.ok) {
    const status =
      result.error === 'resend_not_configured' || result.error === 'invalid_from' ? 503 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  const sent = result.results.filter((r) => r.ok).length;
  const failed = result.results
    .filter((r) => !r.ok)
    .map((r) => ({ email: r.email, error: r.error ?? 'unknown' }));

  return NextResponse.json({ ok: true as const, sent, total: result.results.length, failed });
}
