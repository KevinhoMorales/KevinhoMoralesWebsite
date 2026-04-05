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
  let res = await fetch(path, { ...init, headers: authFetchHeaders(token, init) });
  if (res.status === 401) {
    token = await getAdminIdToken(true);
    res = await fetch(path, { ...init, headers: authFetchHeaders(token, init) });
  }

  if (res.status === 401) {
    let code: string | undefined;
    try {
      const j = (await res.json()) as { code?: string };
      code = typeof j?.code === 'string' ? j.code : undefined;
    } catch {
      /* cuerpo vacío o no JSON */
    }
    if (code === 'email_not_allowed') {
      throw new Error('Correo no autorizado para el panel');
    }
    if (typeof window !== 'undefined' && !path.includes('/login')) {
      window.location.href = '/admin/login';
    }
    throw new Error('No autorizado');
  }
  const ct = res.headers.get('content-type');
  const json = ct?.includes('application/json') ? await res.json() : null;
  if (!res.ok) {
    const msg = json && typeof json === 'object' && 'error' in json ? String(json.error) : res.statusText;
    throw new Error(msg || 'Error de red');
  }
  return json as T;
}
