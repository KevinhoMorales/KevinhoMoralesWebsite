import { Resend } from 'resend';

import { getResendApiKeyFromRemoteConfig } from '@/lib/firebase-admin';
import { WAITLIST_EMAIL_RE } from '@/lib/waitlist-api-security';
import { ADMIN_WAITLIST_BULK_MAX } from '@/lib/waitlist-admin-bulk-constants';

const MAX_TO_LEN = 254;
const MAX_SUBJECT_LEN = 200;
const MAX_BODY_LEN = 50_000;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Comprueba formato `Name <email@domain>` o `email@domain`. */
function isReasonableResendFrom(from: string): boolean {
  const s = from.trim();
  if (s.length < 3 || s.length > 320) return false;
  const m = s.match(/^(.+)<([^>]+)>$/);
  const addr = m ? m[2].trim() : s;
  return WAITLIST_EMAIL_RE.test(addr) && !/\r|\n/.test(s);
}

function plainTextToEmailHtml(body: string): string {
  const inner = escapeHtml(body);
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e8ecf0;padding:28px 24px;">
        <tr><td style="font-size:16px;line-height:1.6;color:#0f172a;white-space:pre-wrap;">${inner}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function resolveResendApiKey(): Promise<string | null> {
  let apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (apiKey.length >= 10) return apiKey;
  try {
    apiKey = (await getResendApiKeyFromRemoteConfig()).trim();
  } catch {
    return null;
  }
  return apiKey.length >= 10 ? apiKey : null;
}

export type AdminBulkSendItemResult = { email: string; ok: boolean; error?: string };

/**
 * Envía un correo de texto plano (envuelto en HTML mínimo) a cada destinatario por separado vía Resend.
 * En desarrollo, `RESEND_DEV_OVERRIDE_TO` redirige cada envío como en el thank-you de waitlist.
 */
export async function sendWaitlistAdminBulkEmails(input: {
  recipients: string[];
  subject: string;
  bodyText: string;
}): Promise<{ ok: false; error: string } | { ok: true; results: AdminBulkSendItemResult[] }> {
  const subject = input.subject.trim().slice(0, MAX_SUBJECT_LEN);
  const bodyText = input.bodyText.trim();
  if (!subject) {
    return { ok: false, error: 'missing_subject' };
  }
  if (!bodyText) {
    return { ok: false, error: 'missing_body' };
  }
  if (bodyText.length > MAX_BODY_LEN) {
    return { ok: false, error: 'body_too_long' };
  }

  const seen = new Set<string>();
  const recipients: string[] = [];
  for (const raw of input.recipients) {
    const e = raw.trim();
    if (!e || e.length > MAX_TO_LEN || !WAITLIST_EMAIL_RE.test(e) || /\r|\n/.test(e)) continue;
    const low = e.toLowerCase();
    if (seen.has(low)) continue;
    seen.add(low);
    recipients.push(e);
  }
  if (recipients.length === 0) {
    return { ok: false, error: 'no_valid_recipients' };
  }
  if (recipients.length > ADMIN_WAITLIST_BULK_MAX) {
    return { ok: false, error: 'too_many_recipients' };
  }

  const apiKey = await resolveResendApiKey();
  if (!apiKey) {
    return { ok: false, error: 'resend_not_configured' };
  }

  const rawFrom = process.env.RESEND_FROM?.trim();
  const from = rawFrom && rawFrom.length > 0 ? rawFrom : 'onboarding@resend.dev';
  if (!isReasonableResendFrom(from)) {
    return { ok: false, error: 'invalid_from' };
  }

  const devOverrideRaw =
    process.env.NODE_ENV === 'development' ? (process.env.RESEND_DEV_OVERRIDE_TO || '').trim() : '';
  const devOverride =
    devOverrideRaw &&
    devOverrideRaw.length <= MAX_TO_LEN &&
    WAITLIST_EMAIL_RE.test(devOverrideRaw) &&
    !/\r|\n/.test(devOverrideRaw)
      ? devOverrideRaw
      : '';

  const htmlBase = plainTextToEmailHtml(bodyText);
  const resend = new Resend(apiKey);
  const results: AdminBulkSendItemResult[] = [];

  for (const to of recipients) {
    const redirectResendTest =
      Boolean(devOverride) && devOverride.toLowerCase() !== to.toLowerCase();
    const sendTo = redirectResendTest ? devOverride : to;
    const devBannerHtml = redirectResendTest
      ? `<p style="margin:0 0 16px;padding:12px;background:#fff7ed;border:1px solid #fdba74;border-radius:8px;font-size:13px;color:#9a3412;line-height:1.5;">Prueba Resend: entrega a <strong>${escapeHtml(sendTo)}</strong>. Destinatario previsto: <strong>${escapeHtml(to)}</strong>.</p>`
      : '';
    const htmlFinal = devBannerHtml
      ? `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e8ecf0;padding:28px 24px;">
        <tr><td style="font-size:16px;line-height:1.6;color:#0f172a;">${devBannerHtml}<div style="white-space:pre-wrap;">${escapeHtml(bodyText)}</div></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
      : htmlBase;

    try {
      const { error } = await resend.emails.send({
        from,
        to: sendTo,
        subject: redirectResendTest ? `[DEV] ${subject}` : subject,
        html: htmlFinal,
      });
      if (error) {
        const rawMsg = 'message' in error && typeof error.message === 'string' ? error.message : 'send_failed';
        results.push({ email: to, ok: false, error: rawMsg.slice(0, 300) });
      } else {
        results.push({ email: to, ok: true });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message.slice(0, 300) : 'exception';
      results.push({ email: to, ok: false, error: msg });
    }
  }

  return { ok: true, results };
}
