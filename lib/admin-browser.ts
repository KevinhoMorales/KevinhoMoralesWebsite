import { getFirebaseAuth } from '@/lib/firebase';

export async function getAdminIdToken(): Promise<string> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('No autenticado');
  try {
    await auth.authStateReady();
  } catch {
    throw new Error('No autenticado');
  }
  if (!auth.currentUser) throw new Error('No autenticado');
  return auth.currentUser.getIdToken();
}

/** Peticiones al panel con ID token de Firebase Auth */
export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAdminIdToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers as Record<string, string>),
    },
  });
  if (res.status === 401) {
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
