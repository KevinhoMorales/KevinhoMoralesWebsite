import { getStorage } from 'firebase-admin/storage';

import { tryGetAdminApp } from '@/lib/firebase-admin';
import { storageObjectPathToPublicUrl } from '@/lib/storage-public-url';
import type { Conference } from '@/types';

const SIGNED_READ_TTL_MS = 365 * 24 * 60 * 60 * 1000;

function looksLikeSignedStorageUrl(url: string): boolean {
  if (!url.includes('?')) return false;
  return /[?&](X-Goog-Algorithm|X-Goog-Signature|GoogleAccessId|Signature)=/i.test(url);
}

/**
 * URL estilo alojamiento virtual GCS: `https://storage.googleapis.com/<bucket>/<object path>`.
 * El primer segmento del pathname es siempre el nombre del bucket (incl. `*.firebasestorage.app` o `*.appspot.com`).
 */
function parseStorageGoogleapisUrl(url: string): { bucket: string; objectPath: string } | null {
  try {
    const u = new URL(url);
    if (u.hostname !== 'storage.googleapis.com') return null;
    const parts = u.pathname.replace(/^\/+/, '').split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const bucket = parts[0];
    const objectPath = parts
      .slice(1)
      .map((seg) => {
        try {
          return decodeURIComponent(seg);
        } catch {
          return seg;
        }
      })
      .join('/');
    if (!objectPath) return null;
    return { bucket, objectPath };
  } catch {
    return null;
  }
}

/**
 * Objetos no públicos devuelven 403 con la URL GCS “simple”. Firma en servidor cuando hay Admin SDK.
 * URLs ya firmadas o `firebasestorage.googleapis.com` se dejan igual.
 * El bucket se toma del pathname de la URL, no solo del env (evita desajuste appspot vs firebasestorage.app).
 */
export async function signConferenceImagesForPublicRead(conferences: Conference[]): Promise<Conference[]> {
  if (conferences.length === 0) return conferences;

  const app = tryGetAdminApp();
  if (!app) return conferences;

  const adminApp = app;
  const expires = Date.now() + SIGNED_READ_TTL_MS;

  async function toReadableUrl(ref: string): Promise<string> {
    const s = ref.trim().replace(/^\/+/, '');
    if (!s) return s;

    if (/^https?:\/\//i.test(s)) {
      if (looksLikeSignedStorageUrl(s) || s.includes('firebasestorage.googleapis.com')) return s;
      const parsed = parseStorageGoogleapisUrl(s);
      if (!parsed) return s;
      try {
        const bucketRef = getStorage(adminApp).bucket(parsed.bucket);
        const [signed] = await bucketRef.file(parsed.objectPath).getSignedUrl({ action: 'read', expires });
        return signed;
      } catch {
        return s;
      }
    }

    const publicUrl = storageObjectPathToPublicUrl(s);
    const parsed = parseStorageGoogleapisUrl(publicUrl);
    if (!parsed) return publicUrl;
    try {
      const bucketRef = getStorage(adminApp).bucket(parsed.bucket);
      const [signed] = await bucketRef.file(parsed.objectPath).getSignedUrl({ action: 'read', expires });
      return signed;
    } catch {
      return publicUrl;
    }
  }

  const out: Conference[] = [];
  for (const c of conferences) {
    const imgs = c.images;
    if (!imgs?.length) {
      out.push(c);
      continue;
    }
    const next = await Promise.all(imgs.map(toReadableUrl));
    out.push({ ...c, images: next });
  }
  return out;
}
