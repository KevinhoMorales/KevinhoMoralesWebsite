import { FieldValue } from 'firebase-admin/firestore';

export type ApplyConferencePayloadOptions = {
  /**
   * `false` = creación (POST, `set` sin merge): no usar `FieldValue.delete()` en campos vacíos
   * (el Admin SDK puede rechazar `delete` en el primer `set` del documento). Se omiten las claves.
   * `true` = actualización (PUT, `merge: true`): cadenas vacías → `delete` para borrar claves antiguas.
   */
  merge: boolean;
};

/**
 * Normaliza `location` y `locationPlatform`: vacíos → borrado u omisión según `merge`.
 * También sanea tipos que Firestore rechaza (`NaN`, arrays con basura).
 */
export function applyConferencePayloadForFirestore(
  payload: Record<string, unknown>,
  options: ApplyConferencePayloadOptions
): Record<string, unknown> {
  const { merge } = options;
  const { locationPlatform, location, ...rest } = payload;
  const out: Record<string, unknown> = { ...rest };
  delete out.location_platform;

  if (locationPlatform === '') {
    if (merge) {
      out.locationPlatform = FieldValue.delete();
    }
  } else if (typeof locationPlatform === 'string' && locationPlatform.trim()) {
    out.locationPlatform = locationPlatform.trim();
  }

  if (location === '') {
    if (merge) {
      out.location = FieldValue.delete();
    }
  } else if (typeof location === 'string' && location.trim()) {
    out.location = location.trim();
  }

  if (Array.isArray(out.tags)) {
    out.tags = (out.tags as unknown[]).filter((t): t is string => typeof t === 'string' && t.length > 0);
  }
  if (Array.isArray(out.images)) {
    out.images = (out.images as unknown[]).filter((t): t is string => typeof t === 'string' && t.length > 0);
  }

  if (typeof out.audience === 'number' && Number.isNaN(out.audience)) {
    delete out.audience;
  }

  /** Firestore Admin rechaza `undefined` en el documento. */
  for (const k of Object.keys(out)) {
    if (out[k] === undefined) delete out[k];
  }

  return out;
}
