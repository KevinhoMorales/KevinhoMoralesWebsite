/**
 * Access key pública para Web3Forms en el navegador (contacto + lista de espera).
 * Define NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY en .env.local / Vercel y reinicia o redespliega.
 */

export function getPublicWeb3FormsAccessKey(): string | undefined {
  const k = (process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || '').trim();
  return k || undefined;
}
