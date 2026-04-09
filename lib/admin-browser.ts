import { getFirebaseAuth } from '@/lib/firebase';

export async function getAdminIdToken(forceRefresh = false): Promise<string> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('No autenticado');
  try {
    await auth.authStateReady();
  } catch {
    throw new Error('No autenticado');
  }
  if (!auth.currentUser) throw new Error('No autenticado');
  return auth.currentUser.getIdToken(forceRefresh);
}

function authFetchHeaders(token: string, init?: RequestInit): Record<string, string> {
  const base =
    init?.headers && typeof init.headers === 'object' && !Array.isArray(init.headers)
      ? { ...(init.headers as Record<string, string>) }
      : {};
  base.Authorization = `Bearer ${token}`;
  return base;
}

/** Peticiones al panel con ID token de Firebase Auth */
export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('No autenticado');
  try {
    await auth.authStateReady();
  } catch {
    throw new Error('No autenticado');
  }
  if (!auth.currentUser) throw new Error('No autenticado');

  let token = await getAdminIdToken(false);
  let res = await fetch(path, {
    ...init,
    cache: 'no-store',
    headers: authFetchHeaders(token, init),
  });
  if (res.status === 401) {
    token = await getAdminIdToken(true);
    res = await fetch(path, {
      ...init,
      cache: 'no-store',
      headers: authFetchHeaders(token, init),
    });
  }

  /** Una sola lectura del cuerpo; no depender de Content-Type (charset, proxies, edge). */
  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      /* no JSON */
    }
  }

  if (res.status === 401) {
    let code: string | undefined;
    if (json && typeof json === 'object' && json !== null && 'code' in json) {
      const c = (json as { code?: unknown }).code;
      code = typeof c === 'string' ? c : undefined;
    }
    if (code === 'email_not_allowed') {
      throw new Error('Correo no autorizado para el panel');
    }
    // Sesión cliente válida pero el servidor no validó el JWT (p. ej. FIREBASE_ADMIN_SDK_KEY de otro proyecto).
    if (code === 'invalid_token' || code === 'no_email' || code === 'missing_token') {
      throw new Error('TOKEN_REJECTED_BY_SERVER');
    }
    if (typeof window !== 'undefined' && !path.includes('/login')) {
      window.location.href = '/admin/login';
    }
    throw new Error('No autorizado');
  }

  if (!res.ok) {
    const msg =
      json && typeof json === 'object' && json !== null && 'error' in json
        ? String((json as { error: unknown }).error)
        : res.statusText;
    throw new Error(msg || 'Error de red');
  }

  return json as T;
}
