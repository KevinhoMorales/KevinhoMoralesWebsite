import type { NextRequest } from 'next/server';

/** RFC 5321-ish práctico para la API (no intenta cubrir todos los TLD raros). */
export const WAITLIST_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_EMAIL_LEN = 254;
const MAX_NAME_LEN = 120;
const MAX_ORG_LEN = 120;
const MAX_JSON_BYTES = 12_288;

/** Valores permitidos para atribución (opcional). */
export const WAITLIST_HEARD_FROM_VALUES = [
  '',
  'site',
  'twitter',
  'linkedin',
  'youtube',
  'podcast',
  'friend',
  'search',
  'other',
] as const;

const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 12;
const STORE_MAX_KEYS = 40_000;

type Bucket = { count: number; windowEnd: number };

const buckets = new Map<string, Bucket>();

function pruneBuckets(now: number): void {
  if (buckets.size <= STORE_MAX_KEYS) return;
  buckets.forEach((b, k) => {
    if (now > b.windowEnd) buckets.delete(k);
  });
  if (buckets.size > STORE_MAX_KEYS) {
    const drop = buckets.size - STORE_MAX_KEYS;
    const keys = Array.from(buckets.keys());
    for (let j = 0; j < drop && j < keys.length; j++) {
      buckets.delete(keys[j]!);
    }
  }
}

/**
 * Identificador estable por cliente (IP detrás de proxy). No es identidad fuerte;
 * en serverless multi-instancia cada instancia tiene su propia memoria — combina con WAF/captcha si hace falta.
 */
export function getWaitlistClientKey(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first && first.length <= 128) return `ip:${first}`;
  }
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp && realIp.length <= 128) return `ip:${realIp}`;
  return 'ip:unknown';
}

export function checkWaitlistRateLimit(clientKey: string): { allowed: true } | { allowed: false; retryAfterSec: number } {
  const now = Date.now();
  pruneBuckets(now);

  let b = buckets.get(clientKey);
  if (!b || now > b.windowEnd) {
    b = { count: 0, windowEnd: now + RATE_WINDOW_MS };
    buckets.set(clientKey, b);
  }
  if (b.count >= RATE_MAX) {
    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((b.windowEnd - now) / 1000)) };
  }
  b.count += 1;
  return { allowed: true };
}

export function assertWaitlistJsonSize(request: NextRequest): { ok: true } | { ok: false; status: 413 } {
  const raw = request.headers.get('content-length');
  if (!raw) return { ok: true };
  const n = parseInt(raw, 10);
  if (Number.isFinite(n) && n > MAX_JSON_BYTES) {
    return { ok: false, status: 413 };
  }
  return { ok: true };
}

export type WaitlistFields = {
  email: string;
  firstName: string;
  lastName: string;
  organization: string;
  heardFrom: string;
  botcheck: string;
};

export function normalizeWaitlistFields(body: Record<string, unknown>): { ok: false; message: string } | { ok: true; fields: WaitlistFields } {
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
  const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : '';
  const organization = typeof body.organization === 'string' ? body.organization.trim() : '';
  const heardFromRaw = typeof body.heardFrom === 'string' ? body.heardFrom.trim() : '';
  const botcheck = typeof body.botcheck === 'string' ? body.botcheck : '';

  if (!email || email.length > MAX_EMAIL_LEN || !WAITLIST_EMAIL_RE.test(email)) {
    return { ok: false, message: 'Introduce un correo válido.' };
  }
  if (!firstName || firstName.length > MAX_NAME_LEN || !lastName || lastName.length > MAX_NAME_LEN) {
    return { ok: false, message: 'Indica nombre y apellido.' };
  }
  if (organization.length > MAX_ORG_LEN) {
    return { ok: false, message: 'El campo de comunidad es demasiado largo.' };
  }
  const allowedHeard = WAITLIST_HEARD_FROM_VALUES as readonly string[];
  if (!allowedHeard.includes(heardFromRaw)) {
    return { ok: false, message: 'Selección de origen no válida.' };
  }
  if (/\r|\n/.test(email)) {
    return { ok: false, message: 'Introduce un correo válido.' };
  }
  if (botcheck) {
    return { ok: false, message: 'Spam detectado.' };
  }

  return {
    ok: true,
    fields: { email, firstName, lastName, organization, heardFrom: heardFromRaw, botcheck },
  };
}
