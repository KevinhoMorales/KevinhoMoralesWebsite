import { Resend } from 'resend';

import { adminCountWaitlistSignups } from '@/lib/firestore-admin-waitlist';
import { getResendApiKeyFromRemoteConfig } from '@/lib/firebase-admin';
import { LAUNCH_DATE, PREORDER_END, formatPreorderDay } from '@/lib/waitlist-preorder';
import { WAITLIST_EMAIL_RE } from '@/lib/waitlist-api-security';

const MAX_TO_LEN = 254;
const MAX_FIRST_NAME_LEN = 80;

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

/**
 * Correo de agradecimiento tras una reserva nueva.
 * Nunca lanza; no registra PII ni la clave API. Clave Resend: env o Remote Config.
 * Con RESEND_WAITLIST_TEMPLATE_ID usa plantilla (en dev, desactivada si RESEND_DEV_OVERRIDE_TO redirige el destino).
 * RESEND_DEV_OVERRIDE_TO (solo NODE_ENV=development): envía el correo a esa dirección para sortear el límite de prueba de Resend.
 */
export async function sendWaitlistThankYouEmail(input: {
  to: string;
  firstName: string;
}): Promise<void> {
  let apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey || apiKey.length < 10) {
    try {
      apiKey = (await getResendApiKeyFromRemoteConfig()).trim();
    } catch {
      console.warn(
        '[resend] waitlist thank-you skipped: set RESEND_API_KEY or resend_api_key en Remote Config (Firebase Admin)'
      );
      return;
    }
  }
  if (!apiKey || apiKey.length < 10) {
    console.warn('[resend] waitlist thank-you skipped: API key vacío o inválida');
    return;
  }

  const to = input.to.trim();
  if (!to || to.length > MAX_TO_LEN || !WAITLIST_EMAIL_RE.test(to) || /\r|\n/.test(to)) {
    return;
  }

  /** Resend en prueba solo entrega a tu correo verificado; en local redirige el envío si hace falta. */
  const devOverrideRaw =
    process.env.NODE_ENV === 'development' ? (process.env.RESEND_DEV_OVERRIDE_TO || '').trim() : '';
  const devOverride =
    devOverrideRaw &&
    devOverrideRaw.length <= MAX_TO_LEN &&
    WAITLIST_EMAIL_RE.test(devOverrideRaw) &&
    !/\r|\n/.test(devOverrideRaw)
      ? devOverrideRaw
      : '';
  const redirectResendTest =
    Boolean(devOverride) && devOverride.toLowerCase() !== to.toLowerCase();
  const sendTo = redirectResendTest ? devOverride : to;
  const devBannerHtml = redirectResendTest
    ? `<p style="margin:0 0 16px;padding:12px;background:#fff7ed;border:1px solid #fdba74;border-radius:8px;font-size:13px;color:#9a3412;line-height:1.5;">Prueba Resend: este correo se envió a <strong>${escapeHtml(sendTo)}</strong> porque con <code>onboarding@resend.dev</code> solo puedes destinar a tu cuenta verificada. El alta en lista quedó registrada con <strong>${escapeHtml(to)}</strong>.</p>`
    : '';

  const rawFrom = process.env.RESEND_FROM?.trim();
  const from = rawFrom && rawFrom.length > 0 ? rawFrom : 'onboarding@resend.dev';
  if (!isReasonableResendFrom(from)) {
    console.warn('[resend] waitlist thank-you skipped: RESEND_FROM con formato inválido (usa email@dominio o Nombre <email@dominio>)');
    return;
  }

  const first = input.firstName.trim().slice(0, MAX_FIRST_NAME_LEN);
  const name = escapeHtml(first || 'hola');
  const preorderUntil = escapeHtml(formatPreorderDay(PREORDER_END, 'es'));
  const launchDay = escapeHtml(formatPreorderDay(LAUNCH_DATE, 'es'));
  const preorderTotalRaw = await adminCountWaitlistSignups();
  const preorderTotal = Math.max(1, preorderTotalRaw ?? 1);

  const subject = 'Gracias por reservar — lista de espera del libro';
  const templateIdRaw = (process.env.RESEND_WAITLIST_TEMPLATE_ID || '').trim();
  const templateId = redirectResendTest ? '' : templateIdRaw;

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:12px;border:1px solid #e8ecf0;overflow:hidden;">
        <tr><td style="padding:28px 24px;background:#0d9488;">
          <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">Lista de espera — libro</p>
        </td></tr>
        <tr><td style="padding:28px 24px;">
          ${devBannerHtml}
          <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#0f172a;">Hola <strong>${name}</strong>,</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Gracias por reservar tu lugar. Ya estás en la lista para novedades del libro <strong>Dominando Kotlin, Swift y Dart</strong>.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;"><tr><td style="padding:14px 16px;background:#f0fdfa;border-radius:10px;border:1px solid #99f6e4;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#0f766e;">Reservas de preventa</p>
            <p style="margin:0;font-size:20px;font-weight:800;color:#0d9488;">${preorderTotal}</p>
            <p style="margin:8px 0 0;font-size:13px;line-height:1.5;color:#475569;">Tu registro es la reserva número <strong style="color:#0f172a;">${preorderTotal}</strong> en la lista.</p>
          </td></tr></table>
          <p style="margin:0 0 8px;font-size:14px;line-height:1.55;color:#475569;">Te enviaremos un correo con los detalles de la <strong>preventa</strong> a más tardar el <strong>${preorderUntil}</strong>. El lanzamiento oficial está previsto para el <strong>${launchDay}</strong>.</p>
          <p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#64748b;">Revisa también la carpeta de spam o promociones por si el mensaje llega ahí.</p>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#94a3b8;">— Kevin Morales<br/>kevinhomorales.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const resend = new Resend(apiKey);
    // Resend reserva FIRST_NAME / LAST_NAME / EMAIL / UNSUBSCRIBE_URL — usar READER_NAME en la plantilla.
    let { error } = templateId
      ? await resend.emails.send({
          from,
          to: sendTo,
          subject,
          template: {
            id: templateId,
            variables: {
              READER_NAME: name,
              PREORDER_UNTIL: preorderUntil,
              LAUNCH_DAY: launchDay,
              PREORDER_TOTAL: preorderTotal,
            },
          },
        })
      : await resend.emails.send({
          from,
          to: sendTo,
          subject,
          html,
        });

    if (error && templateId) {
      const msg = 'message' in error && typeof error.message === 'string' ? error.message.slice(0, 120) : 'error';
      console.warn('[resend] template send failed, retrying inline html:', msg);
      ({ error } = await resend.emails.send({ from, to: sendTo, subject, html }));
    }

    if (error) {
      const rawMsg = 'message' in error && typeof error.message === 'string' ? error.message : '';
      const code = rawMsg ? rawMsg.slice(0, 200) : 'error';
      console.warn('[resend] waitlist thank-you failed:', code);
      if (/testing emails only|only send testing emails/i.test(rawMsg)) {
        console.warn(
          '[resend] Modo prueba: verifica un dominio en Resend y usa RESEND_FROM con ese dominio, o en local define RESEND_DEV_OVERRIDE_TO=tu_correo_verificado_resend'
        );
      }
    }
  } catch (e) {
    console.warn('[resend] waitlist thank-you failed: exception');
    if (process.env.NODE_ENV === 'development' && e instanceof Error) {
      console.warn('[resend]', e.message);
    }
  }
}
