import { Resend } from 'resend';

import { getResendApiKeyFromRemoteConfig } from '@/lib/firebase-admin';
import { WAITLIST_EMAIL_RE } from '@/lib/waitlist-api-security';
import { ADMIN_WAITLIST_BULK_MAX } from '@/lib/waitlist-admin-bulk-constants';

const MAX_TO_LEN = 254;
const MAX_SUBJECT_LEN = 200;
const MAX_BODY_LEN = 50_000;

/** Resend suele limitar ~5 req/s; lotes de 5 y pausa entre lotes evitan 429. */
const RESEND_BULK_BATCH_SIZE = 5;
const RESEND_BULK_BATCH_PAUSE_MS = 10_000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

/** Paleta alineada con el panel admin (zinc + teal). */
const E = {
  pageBg: '#09090b',
  cardBg: '#18181b',
  cardBorder: '#27272a',
  text: '#e4e4e7',
  textMuted: '#a1a1aa',
  accent: '#2dd4bf',
  accentStrong: '#5eead4',
  shadow: '0 12px 40px rgba(0,0,0,0.45)',
} as const;

const LONG_BLOCK_MIN = 320;
const MIN_SENTENCES_TO_SPLIT = 5;

/** `**texto**` → negrita (resto escapado). */
function escapeWithOptionalBold(text: string): string {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts
    .map((part) => {
      const m = /^\*\*([^*]+)\*\*$/.exec(part);
      if (m) {
        return `<strong style="color:${E.accentStrong};font-weight:600;">${escapeHtml(m[1])}</strong>`;
      }
      return escapeHtml(part);
    })
    .join('');
}

function splitIntoSentenceGroups(text: string): string[] {
  const sep = '\u001e';
  const sentences = text
    .replace(/([.!?])\s+/g, `$1${sep}`)
    .split(sep)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (sentences.length < MIN_SENTENCES_TO_SPLIT) {
    return [text];
  }
  const groups: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    groups.push(sentences.slice(i, i + 2).join(' '));
  }
  return groups;
}

/**
 * Párrafos desde texto plano: bloques separados por línea en blanco; saltos simples → <br>.
 * Un solo bloque muy largo se parte por frases para legibilidad.
 */
function bodyTextToReadableHtml(body: string): string {
  const normalized = body.trim().replace(/\r\n/g, '\n');
  let paragraphs = normalized
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 1 && paragraphs[0].length >= LONG_BLOCK_MIN) {
    paragraphs = splitIntoSentenceGroups(paragraphs[0]);
  }

  return paragraphs
    .map((block, idx, arr) => {
      const lines = block.split('\n').map((l) => l.trim());
      const joined = lines
        .map((line) => (line.length ? escapeWithOptionalBold(line) : ''))
        .filter(Boolean)
        .join('<br />\n');
      const bottom = idx === arr.length - 1 ? '0' : '20px';
      return `<p style="margin:0 0 ${bottom};font-size:16px;line-height:1.7;color:${E.text};letter-spacing:-0.01em;">${joined}</p>`;
    })
    .join('\n');
}

function buildBulkEmailDocument(bodyText: string, devBannerHtml: string): string {
  const main = bodyTextToReadableHtml(bodyText);
  const inner = `${devBannerHtml}${main}`;
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="dark" />
<meta name="supported-color-schemes" content="dark" />
</head>
<body style="margin:0;background:${E.pageBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${E.pageBg};padding:28px 16px 40px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${E.cardBg};border-radius:16px;border:1px solid ${E.cardBorder};overflow:hidden;box-shadow:${E.shadow};">
        <tr><td style="padding:0;">
          <div style="height:4px;background:linear-gradient(90deg,#0f766e,${E.accent},#5eead4);font-size:0;line-height:0;mso-line-height-rule:exactly;">&nbsp;</div>
        </td></tr>
        <tr><td style="padding:32px 28px 36px;">
          ${inner}
        </td></tr>
      </table>
      <p style="margin:20px 0 0;font-size:12px;line-height:1.5;color:${E.textMuted};text-align:center;letter-spacing:0.02em;">
        DevLokos
      </p>
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
 * Envía correo en HTML a cada destinatario vía Resend, en lotes de 5 con pausa de 10s entre lotes
 * (evita el límite típico de ~5 req/s de Resend).
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

  const resend = new Resend(apiKey);
  const results: AdminBulkSendItemResult[] = [];

  for (let i = 0; i < recipients.length; i++) {
    const to = recipients[i];
    const redirectResendTest =
      Boolean(devOverride) && devOverride.toLowerCase() !== to.toLowerCase();
    const sendTo = redirectResendTest ? devOverride : to;
    const devBannerHtml = redirectResendTest
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:separate;background:rgba(251,191,36,0.08);border:1px solid rgba(234,179,8,0.35);border-radius:12px;"><tr><td style="padding:14px 16px;font-size:13px;line-height:1.55;color:#fcd34d;">Prueba Resend: entrega a <strong style="color:#fef08a;">${escapeHtml(sendTo)}</strong>. Destinatario previsto: <strong style="color:#fef08a;">${escapeHtml(to)}</strong>.</td></tr></table>`
      : '';
    const htmlFinal = buildBulkEmailDocument(bodyText, devBannerHtml);

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

    const sentCount = i + 1;
    if (sentCount % RESEND_BULK_BATCH_SIZE === 0 && sentCount < recipients.length) {
      await delay(RESEND_BULK_BATCH_PAUSE_MS);
    }
  }

  return { ok: true, results };
}
