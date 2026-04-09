/** Valor guardado en Firestore cuando el evento es presencial (Conference/Talk) y no hay URL de video. */
export const VIDEO_URL_PRESENCIAL_NONE = '__presencial_no_video__';

export function isPresencialNoVideoUrl(url: string | undefined): boolean {
  return url?.trim() === VIDEO_URL_PRESENCIAL_NONE;
}

/** Hay enlace de video reproducible (no es el marcador presencial). */
export function hasWatchableVideoUrl(url: string | undefined): boolean {
  const u = url?.trim();
  if (!u) return false;
  return !isPresencialNoVideoUrl(u);
}
