import { getWeb3FormsAccessKeyFromRemoteConfig } from '@/lib/firebase-admin';

/**
 * Misma resolución de clave que el formulario de contacto (Remote Config → WEB3FORMS_ACCESS_KEY).
 */
export async function resolveWeb3FormsAccessKey(): Promise<{
  key: string | null;
  remoteConfigError?: string;
}> {
  let key: string | undefined;
  let remoteConfigError: string | undefined;
  try {
    key = await getWeb3FormsAccessKeyFromRemoteConfig();
  } catch (error) {
    remoteConfigError = error instanceof Error ? error.message : String(error);
    console.error('Web3Forms Remote Config error:', error);
  }
  if (!key) {
    key = (process.env.WEB3FORMS_ACCESS_KEY || '').trim() || undefined;
  }
  return { key: key || null, remoteConfigError };
}
