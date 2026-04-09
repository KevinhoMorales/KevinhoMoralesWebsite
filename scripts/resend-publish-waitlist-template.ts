/**
 * Publica (crea + publish) la plantilla de agradecimiento waitlist en Resend.
 * Ejecutar una vez por entorno (o tras cambiar el HTML), luego copia el `id` al .env como RESEND_WAITLIST_TEMPLATE_ID.
 *
 *   RESEND_API_KEY=re_xxx npm run resend:publish-waitlist-template
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { Resend } from 'resend';

async function main() {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey || apiKey.length < 10) {
    console.error('Falta RESEND_API_KEY en el entorno.');
    process.exit(1);
  }

  const htmlPath = join(process.cwd(), 'emails', 'resend-waitlist-thank-you-template.html');
  const html = readFileSync(htmlPath, 'utf8');

  const resend = new Resend(apiKey);
  const from = (process.env.RESEND_FROM || '').trim() || 'onboarding@resend.dev';

  const { data, error } = await resend.templates
    .create({
      name: 'waitlist-thank-you-book',
      alias: 'waitlist-thank-you-book',
      from,
      subject: 'Gracias por reservar — lista de espera del libro',
      html,
      variables: [
        { key: 'READER_NAME', type: 'string', fallbackValue: 'hola' },
        { key: 'EMAIL_LINK_DAY', type: 'string', fallbackValue: '1 de mayo' },
        { key: 'LAUNCH_DAY', type: 'string', fallbackValue: 'el lanzamiento' },
        {
          key: 'FOOTER_BLOCK',
          type: 'string',
          fallbackValue:
            '<p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#94a3b8;text-align:center;">— Kevin Morales<br />kevinhomorales.com</p>',
        },
      ],
    })
    .publish();

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log('Plantilla publicada. Añade a .env / Vercel:');
  console.log(`RESEND_WAITLIST_TEMPLATE_ID=${data?.id ?? '(ver dashboard Resend)'}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
