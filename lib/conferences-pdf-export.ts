import { jsPDF } from 'jspdf';
import type { Conference } from '@/types/conference';
import { CONFERENCE_LOCATION_PLATFORMS } from '@/types/conference';
import { hasWatchableVideoUrl } from '@/lib/conference-video-url';
import { storageObjectPathToPublicUrl } from '@/lib/storage-public-url';

export type ConferencePdfLocale = 'en' | 'es' | 'pt';

type Labels = {
  untitled: string;
  topic: string;
  type: string;
  date: string;
  audience: string;
  location: string;
  city: string;
  country: string;
  tags: string;
  video: string;
  event: string;
  attendees: string;
  photosNote: string;
  footer: string;
  types: Record<Conference['type'], string>;
  platforms: Record<(typeof CONFERENCE_LOCATION_PLATFORMS)[number], string>;
};

const LABELS: Record<ConferencePdfLocale, Labels> = {
  en: {
    untitled: '(Untitled)',
    topic: 'Topic',
    type: 'Type',
    date: 'Date',
    audience: 'Audience',
    location: 'Location',
    city: 'City',
    country: 'Country',
    tags: 'Tags',
    video: 'Video',
    event: 'Event',
    attendees: 'Attendees',
    photosNote: 'more photos in admin',
    footer: 'Exported from Kevin Morales — Talks admin',
    types: {
      virtual_conference: 'Virtual conference',
      conference: 'Conference',
      virtual_talk: 'Virtual talk',
      talk: 'Talk',
    },
    platforms: {
      google_meet: 'Google Meet',
      zoom: 'Zoom',
      bevy: 'Bevy',
      twitch: 'Twitch',
      youtube: 'YouTube',
      streamyard: 'StreamYard',
      gather: 'Gather',
      discord: 'Discord',
    },
  },
  es: {
    untitled: '(Sin título)',
    topic: 'Tema',
    type: 'Tipo',
    date: 'Fecha',
    audience: 'Audiencia',
    location: 'Ubicación',
    city: 'Ciudad',
    country: 'País',
    tags: 'Etiquetas',
    video: 'Video',
    event: 'Evento',
    attendees: 'Asistentes',
    photosNote: 'fotos más en el admin',
    footer: 'Exportado desde Kevin Morales — Admin de charlas',
    types: {
      virtual_conference: 'Conferencia virtual',
      conference: 'Conferencia',
      virtual_talk: 'Charla virtual',
      talk: 'Charla',
    },
    platforms: {
      google_meet: 'Google Meet',
      zoom: 'Zoom',
      bevy: 'Bevy',
      twitch: 'Twitch',
      youtube: 'YouTube',
      streamyard: 'StreamYard',
      gather: 'Gather',
      discord: 'Discord',
    },
  },
  pt: {
    untitled: '(Sem título)',
    topic: 'Tema',
    type: 'Tipo',
    date: 'Data',
    audience: 'Público',
    location: 'Local',
    city: 'Cidade',
    country: 'País',
    tags: 'Tags',
    video: 'Vídeo',
    event: 'Evento',
    attendees: 'Participantes',
    photosNote: 'mais fotos no admin',
    footer: 'Exportado de Kevin Morales — Admin de palestras',
    types: {
      virtual_conference: 'Conferência virtual',
      conference: 'Conferência',
      virtual_talk: 'Palestra virtual',
      talk: 'Palestra',
    },
    platforms: {
      google_meet: 'Google Meet',
      zoom: 'Zoom',
      bevy: 'Bevy',
      twitch: 'Twitch',
      youtube: 'YouTube',
      streamyard: 'StreamYard',
      gather: 'Gather',
      discord: 'Discord',
    },
  },
};

function venueLine(c: Conference, L: Labels): string | null {
  const bits: string[] = [];
  if (
    c.locationPlatform &&
    (CONFERENCE_LOCATION_PLATFORMS as readonly string[]).includes(c.locationPlatform)
  ) {
    bits.push(L.platforms[c.locationPlatform]);
  }
  if (c.location?.trim()) bits.push(c.location.trim());
  const cc = [c.city, c.country].filter(Boolean).join(', ');
  if (cc) bits.push(cc);
  if (bits.length === 0) return null;
  return Array.from(new Set(bits)).join(' · ');
}

function drawLines(doc: jsPDF, lines: string[], x: number, y: number, lh: number): number {
  let cy = y;
  for (const line of lines) {
    doc.text(line, x, cy);
    cy += lh;
  }
  return cy;
}

async function fetchImageForPdf(
  url: string
): Promise<{ dataUrl: string; fmt: 'PNG' | 'JPEG' | 'WEBP' } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 14_000);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 8) return null;
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    const b64 = buf.toString('base64');
    const isPng = ct.includes('png') || (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47);
    const isWebp =
      ct.includes('webp') ||
      (buf[0] === 0x52 &&
        buf[1] === 0x49 &&
        buf[2] === 0x46 &&
        buf[3] === 0x46 &&
        buf[8] === 0x57 &&
        buf[9] === 0x45 &&
        buf[10] === 0x42 &&
        buf[11] === 0x50);
    if (isPng) return { dataUrl: `data:image/png;base64,${b64}`, fmt: 'PNG' };
    if (isWebp) return { dataUrl: `data:image/webp;base64,${b64}`, fmt: 'WEBP' };
    return { dataUrl: `data:image/jpeg;base64,${b64}`, fmt: 'JPEG' };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function parseLocale(v: string | null): ConferencePdfLocale {
  if (v === 'en' || v === 'pt') return v;
  return 'es';
}

export { parseLocale };

export async function buildConferencesPdfBuffer(
  conferences: Conference[],
  locale: ConferencePdfLocale
): Promise<Buffer> {
  const L = LABELS[locale];
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const m = 16;
  const maxW = W - 2 * m;
  const bodyLh = 5;
  const labelGap = 34;

  for (let i = 0; i < conferences.length; i++) {
    const c = conferences[i];
    if (i > 0) doc.addPage();

    let y = m;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(15, 23, 42);
    const title = (c.title || '').trim() || L.untitled;
    const titleLines = doc.splitTextToSize(title, maxW);
    y = drawLines(doc, titleLines, m, y + 6, 7);
    y += 3;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    const row = (label: string, value: string | undefined | null) => {
      const v = (value ?? '').trim();
      if (!v) return;
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, m, y);
      doc.setFont('helvetica', 'normal');
      const wrapped = doc.splitTextToSize(v, maxW - labelGap);
      let vy = y;
      for (const line of wrapped) {
        doc.text(line, m + labelGap, vy);
        vy += bodyLh;
      }
      y = Math.max(y + bodyLh, vy) + 2;
    };

    row(L.topic, c.topic);
    row(L.type, L.types[c.type] ?? c.type);
    row(L.date, c.date);
    if (c.audience != null && Number.isFinite(c.audience)) {
      row(L.audience, String(c.audience));
    }
    const vLine = venueLine(c, L);
    row(L.location, vLine);
    row(L.city, c.city);
    row(L.country, c.country);
    if (c.tags?.length) row(L.tags, c.tags.join(', '));
    if (hasWatchableVideoUrl(c.videoUrl)) row(L.video, c.videoUrl);
    if (c.eventUrl?.trim()) row(L.event, c.eventUrl);

    y += 3;

    const imgs = (c.images ?? []).map((r) => storageObjectPathToPublicUrl(r)).filter(Boolean);
    const yImgStart = y;
    const yMax = H - m - 14;
    const maxImagesOnPage = 4;
    let shown = 0;

    for (let j = 0; j < imgs.length && shown < maxImagesOnPage; j++) {
      const got = await fetchImageForPdf(imgs[j]);
      if (!got) continue;
      try {
        const props = doc.getImageProperties(got.dataUrl);
        const remaining = yMax - y;
        if (remaining < 22) break;
        const targetH = Math.min(48, remaining - 2, (props.height * maxW) / props.width);
        const targetW = (props.width * targetH) / props.height;
        const wUse = Math.min(maxW, targetW);
        const hUse = (props.height * wUse) / props.width;
        doc.addImage(got.dataUrl, got.fmt, m, y, wUse, hUse);
        y += hUse + 4;
        shown += 1;
      } catch {
        /* formato no soportado por el motor PDF */
      }
    }

    if (imgs.length > shown) {
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`+${imgs.length - shown} ${L.photosNote}`, m, Math.max(y, yImgStart + 6));
      doc.setTextColor(30, 41, 59);
    }

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(L.footer, m, H - 8);
    doc.setTextColor(0, 0, 0);
  }

  const out = doc.output('arraybuffer');
  return Buffer.from(out);
}
