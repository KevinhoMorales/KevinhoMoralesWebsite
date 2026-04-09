import { getProfile } from '@/lib/content';
import type { Profile } from '@/types';

const SOCIAL_ORDER = [
  'linkedin',
  'twitter',
  'youtube',
  'github',
  'instagram',
] as const satisfies readonly (keyof NonNullable<Profile['socialLinks']>)[];

const SOCIAL_LABELS: Record<(typeof SOCIAL_ORDER)[number], string> = {
  linkedin: 'LinkedIn',
  twitter: 'X / Twitter',
  youtube: 'YouTube',
  github: 'GitHub',
  instagram: 'Instagram',
};

function escapeAttr(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Bloque “Conecta” + firma, alineado con el estilo del correo (#0E6E5C, tipografía del header).
 */
export function buildWaitlistThankYouFooterBlockHtml(): string {
  let socialLinks: Profile['socialLinks'] | undefined;
  try {
    socialLinks = getProfile().socialLinks;
  } catch {
    socialLinks = undefined;
  }

  const anchors: string[] = [];
  if (socialLinks) {
    for (const key of SOCIAL_ORDER) {
      const href = socialLinks[key];
      if (!href || typeof href !== 'string') continue;
      const label = SOCIAL_LABELS[key];
      anchors.push(
        `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer" style="color:#0E6E5C;font-weight:600;text-decoration:none;border-bottom:1px solid rgba(14,110,92,0.32);">${label}</a>`
      );
    }
  }

  const socialHtml =
    anchors.length > 0
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0 0;border-collapse:collapse;border-top:1px solid #e8ecf0;"><tr><td style="padding:20px 0 0 0;">
  <p style="margin:0 0 10px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;">Conecta</p>
  <p style="margin:0;font-size:13px;line-height:1.85;color:#475569;text-align:left;">${anchors.join(
    '<span style="color:#cbd5e1;padding:0 5px;">·</span>'
  )}</p>
</td></tr></table>`
      : '';

  const sigTop = socialHtml ? '20px' : '24px';
  const siteUrl = 'https://kevinhomorales.com';
  const signatureHtml = `<p style="margin:${sigTop} 0 0;font-size:13px;line-height:1.5;color:#94a3b8;text-align:center;">— Kevin Morales<br /><a href="${escapeAttr(
    siteUrl
  )}" target="_blank" rel="noopener noreferrer" style="color:#0E6E5C;font-weight:600;text-decoration:none;border-bottom:1px solid rgba(14,110,92,0.25);">kevinhomorales.com</a></p>`;

  return `${socialHtml}${signatureHtml}`;
}
