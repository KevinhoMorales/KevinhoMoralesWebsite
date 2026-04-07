import type { Conference } from '@/types';

/**
 * Ruta de objeto en el bucket (p. ej. prod/conferences/conference001/123.png) → URL pública HTTPS.
 * Si ya es http(s), se devuelve igual.
 */
export function storageObjectPathToPublicUrl(ref: string): string {
  const s = ref.trim();
  if (!s) return s;
  if (/^https?:\/\//i.test(s)) return s;
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  if (!bucket) return s;
  const encoded = s.split('/').map(encodeURIComponent).join('/');
  return `https://storage.googleapis.com/${bucket}/${encoded}`;
}

/** Para la web pública: mismas rutas en Firestore que en Storage. */
export function expandConferenceImagesForPublic(c: Conference): Conference {
  const imgs = c.images;
  if (!imgs?.length) return c;
  return { ...c, images: imgs.map(storageObjectPathToPublicUrl) };
}
