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
  details: string;
  photos: string;
  viewEvent: string;
  watchVideo: string;
  types: Record<Conference['type'], string>;
  platforms: Record<(typeof CONFERENCE_LOCATION_PLATFORMS)[number], string>;
};

const PRIMARY: [number, number, number] = [14, 110, 92];
const SLATE_50: [number, number, number] = [248, 250, 252];
const SLATE_200: [number, number, number] = [226, 232, 240];
const SLATE_500: [number, number, number] = [100, 116, 139];
const SLATE_900: [number, number, number] = [15, 23, 42];

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
    details: 'Talk details',
    photos: 'Photos',
    viewEvent: 'Open event page →',
    watchVideo: 'Watch recording →',
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
    photosNote: 'más fotos en el admin',
    footer: 'Exportado desde Kevin Morales — Admin de charlas',
    details: 'Detalle de la charla',
    photos: 'Fotografías',
    viewEvent: 'Ver página del evento →',
    watchVideo: 'Ver grabación →',
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
    details: 'Detalhes da palestra',
    photos: 'Fotografias',
    viewEvent: 'Abrir página do evento →',
    watchVideo: 'Assistir gravação →',
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

type LoadedPdfImage = {
  dataUrl: string;
  fmt: 'PNG' | 'JPEG' | 'WEBP';
  width: number;
  height: number;
};

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

function drawMetaCard(
  doc: jsPDF,
  y: number,
  m: number,
  maxW: number,
  label: string,
  value: string,
  labelGap: number,
  bodyLh: number
): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const valueW = maxW - labelGap - 6;
  const wrapped = value.trim()
    ? (doc.splitTextToSize(value.trim(), valueW) as string[])
    : ['—'];
  const valueH = Math.max(bodyLh, wrapped.length * bodyLh);
  const totalH = valueH + 8;

  doc.setFillColor(...SLATE_50);
  doc.rect(m, y, maxW, totalH, 'F');
  doc.setDrawColor(...SLATE_200);
  doc.setLineWidth(0.15);
  doc.rect(m, y, maxW, totalH, 'S');
  doc.setFillColor(...PRIMARY);
  doc.rect(m, y, 1.4, totalH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...SLATE_500);
  doc.text(label.toUpperCase(), m + 5, y + 5.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...SLATE_900);
  let vy = y + 5;
  for (const line of wrapped) {
    doc.text(line, m + labelGap, vy);
    vy += bodyLh;
  }

  return y + totalH + 2.5;
}

function drawLinkCard(
  doc: jsPDF,
  y: number,
  m: number,
  maxW: number,
  label: string,
  linkText: string,
  url: string,
  labelGap: number
): number {
  const totalH = 14;

  doc.setFillColor(...SLATE_50);
  doc.rect(m, y, maxW, totalH, 'F');
  doc.setDrawColor(...SLATE_200);
  doc.setLineWidth(0.15);
  doc.rect(m, y, maxW, totalH, 'S');
  doc.setFillColor(...PRIMARY);
  doc.rect(m, y, 1.4, totalH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...SLATE_500);
  doc.text(label.toUpperCase(), m + 5, y + 5.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY);
  doc.textWithLink(linkText, m + labelGap, y + 5.2, { url });
  doc.setTextColor(...SLATE_900);

  return y + totalH + 2.5;
}

function drawPhotoGrid(
  doc: jsPDF,
  y: number,
  m: number,
  maxW: number,
  yMax: number,
  items: LoadedPdfImage[]
): number {
  const gap = 3.5;
  const n = items.length;
  if (n === 0) return y;

  const availableH = yMax - y;
  if (availableH < 24) return y;

  const maxRowH = Math.min(52, availableH - 2);

  if (n === 1) {
    const props = items[0];
    let hUse = Math.min(maxRowH, (props.height * maxW) / props.width);
    let wUse = (props.width * hUse) / props.height;
    if (wUse > maxW) {
      wUse = maxW;
      hUse = (props.height * wUse) / props.width;
    }
    doc.setDrawColor(...SLATE_200);
    doc.setLineWidth(0.2);
    doc.roundedRect(m, y, wUse, hUse, 1.2, 1.2, 'S');
    doc.addImage(items[0].dataUrl, items[0].fmt, m, y, wUse, hUse);
    return y + hUse + 5;
  }

  const cols = n;
  const cellW = (maxW - (cols - 1) * gap) / cols;
  let rowMaxH = 0;
  const layout: { x: number; y: number; w: number; h: number; idx: number }[] = [];

  for (let i = 0; i < n; i++) {
    const props = items[i];
    let hUse = Math.min(maxRowH, (props.height * cellW) / props.width);
    let wUse = (props.width * hUse) / props.height;
    if (wUse > cellW) {
      wUse = cellW;
      hUse = (props.height * wUse) / props.width;
    }
    const x = m + i * (cellW + gap) + (cellW - wUse) / 2;
    layout.push({ x, y, w: wUse, h: hUse, idx: i });
    rowMaxH = Math.max(rowMaxH, hUse);
  }

  for (const p of layout) {
    doc.setDrawColor(...SLATE_200);
    doc.setLineWidth(0.2);
    doc.roundedRect(p.x, y, p.w, p.h, 1, 1, 'S');
    const im = items[p.idx];
    doc.addImage(im.dataUrl, im.fmt, p.x, y, p.w, p.h);
  }

  return y + rowMaxH + 5;
}

export async function buildConferencesPdfBuffer(
  conferences: Conference[],
  locale: ConferencePdfLocale
): Promise<Buffer> {
  const L = LABELS[locale];
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const m = 14;
  const maxW = W - 2 * m;
  const bodyLh = 4.8;
  const labelGap = 42;
  const footerH = 11;

  for (let i = 0; i < conferences.length; i++) {
    const c = conferences[i];
    if (i > 0) doc.addPage();

    const title = (c.title || '').trim() || L.untitled;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    const titleLines = doc.splitTextToSize(title, maxW) as string[];
    const headerH = Math.max(30, 11 + titleLines.length * 6.8 + 10);

    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, W, headerH, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    let ty = 12;
    for (const line of titleLines) {
      doc.text(line, m, ty);
      ty += 6.8;
    }
    doc.setTextColor(...SLATE_900);

    let y = headerH + 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...PRIMARY);
    doc.text(L.details.toUpperCase(), m, y);
    y += 5;

    const row = (label: string, value: string | undefined | null) => {
      const v = (value ?? '').trim();
      if (!v) return;
      y = drawMetaCard(doc, y, m, maxW, label, v, labelGap, bodyLh);
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

    if (hasWatchableVideoUrl(c.videoUrl) && c.videoUrl?.trim()) {
      y = drawLinkCard(doc, y, m, maxW, L.video, L.watchVideo, c.videoUrl.trim(), labelGap);
    }

    if (c.eventUrl?.trim()) {
      y = drawLinkCard(doc, y, m, maxW, L.event, L.viewEvent, c.eventUrl.trim(), labelGap);
    }

    y += 4;

    const imgPaths = (c.images ?? []).map((r) => storageObjectPathToPublicUrl(r)).filter(Boolean);
    const maxPhotosInPdf = 3;
    const loaded: LoadedPdfImage[] = [];

    for (let j = 0; j < imgPaths.length && loaded.length < maxPhotosInPdf; j++) {
      const got = await fetchImageForPdf(imgPaths[j]);
      if (!got) continue;
      try {
        const props = doc.getImageProperties(got.dataUrl);
        loaded.push({
          dataUrl: got.dataUrl,
          fmt: got.fmt,
          width: props.width,
          height: props.height,
        });
      } catch {
        /* formato no soportado */
      }
    }

    const yContentMax = H - m - footerH;

    if (loaded.length > 0) {
      if (y > yContentMax - 35) {
        doc.addPage();
        y = m;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...PRIMARY);
      doc.text(L.photos.toUpperCase(), m, y);
      y += 5;

      y = drawPhotoGrid(doc, y, m, maxW, yContentMax, loaded);
    }

    if (imgPaths.length > loaded.length) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(...SLATE_500);
      doc.text(`+${imgPaths.length - loaded.length} ${L.photosNote}`, m, Math.min(y, yContentMax - 2));
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...SLATE_900);
    }

    doc.setDrawColor(...SLATE_200);
    doc.setLineWidth(0.25);
    doc.line(m, H - 10, W - m, H - 10);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(L.footer, m, H - 5.5);
  }

  const out = doc.output('arraybuffer');
  return Buffer.from(out);
}
