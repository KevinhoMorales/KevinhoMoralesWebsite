import * as admin from 'firebase-admin';

const YOUTUBE_API_KEY_PARAM_NAMES = [
  'youtube_api_key',
  'youtube-api-key',
  'YOUTUBE_API_KEY',
];

const RESEND_API_KEY_PARAM_NAMES = [
  'resend_api_key',
  'RESEND_API_KEY',
  'resend-api-key',
];

interface RemoteConfigParameter {
  defaultValue?: { value?: string };
  conditionalValues?: Record<string, { value?: string }>;
}

/** Plantilla mínima para buscar en raíz y en `parameterGroups` (Firebase Console). */
type RemoteConfigTemplateLike = {
  parameters?: Record<string, RemoteConfigParameter>;
  parameterGroups?: Record<string, { parameters?: Record<string, RemoteConfigParameter> }>;
};

function extractRemoteConfigValue(
  parameter: RemoteConfigParameter | undefined
): string | undefined {
  if (!parameter) return undefined;

  const defaultVal = parameter.defaultValue?.value;
  if (defaultVal && defaultVal.trim()) return defaultVal.trim();

  const conditional = parameter.conditionalValues;
  if (conditional && typeof conditional === 'object') {
    for (const key of Object.keys(conditional)) {
      const val = conditional[key]?.value;
      if (val && val.trim()) return val.trim();
    }
  }

  return undefined;
}

function getRemoteConfigParameter(
  template: RemoteConfigTemplateLike,
  name: string
): RemoteConfigParameter | undefined {
  const top = template.parameters?.[name];
  if (top) return top;
  const groups = template.parameterGroups;
  if (!groups) return undefined;
  for (const group of Object.values(groups)) {
    const p = group?.parameters?.[name];
    if (p) return p;
  }
  return undefined;
}

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0] as admin.app.App;
  }

  const serviceAccountJson = process.env.FIREBASE_ADMIN_SDK_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (serviceAccountJson) {
    try {
      const credentials = JSON.parse(serviceAccountJson) as admin.ServiceAccount & {
        project_id?: string;
      };
      return admin.initializeApp({
        credential: admin.credential.cert(credentials),
        projectId: credentials.projectId || credentials.project_id || projectId,
      });
    } catch (e) {
      console.error('Firebase Admin: invalid FIREBASE_ADMIN_SDK_KEY JSON', e);
    }
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId,
    });
  }

  throw new Error(
    'Firebase Admin not configured. Set FIREBASE_ADMIN_SDK_KEY (JSON string) or GOOGLE_APPLICATION_CREDENTIALS.'
  );
}

/** Inicializa Admin solo si hay credenciales; si no, null (sin lanzar). */
export function tryGetAdminApp(): admin.app.App | null {
  if (admin.apps.length > 0) {
    return admin.apps[0] as admin.app.App;
  }
  const serviceAccountJson = process.env.FIREBASE_ADMIN_SDK_KEY;
  const hasADC = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  if (!serviceAccountJson?.trim() && !hasADC) {
    return null;
  }
  try {
    return getAdminApp();
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[firebase-admin] tryGetAdminApp:', e);
    }
    return null;
  }
}

/**
 * Obtiene el YouTube API Key desde Firebase Remote Config (versión servidor).
 * Prueba varios nombres de parámetro y hace fallback a YOUTUBE_API_KEY en env.
 */
export async function getYouTubeApiKeyFromRemoteConfig(
  paramName?: string
): Promise<string> {
  const namesToTry = paramName
    ? [paramName, ...YOUTUBE_API_KEY_PARAM_NAMES.filter((n) => n !== paramName)]
    : YOUTUBE_API_KEY_PARAM_NAMES;

  try {
    const app = getAdminApp();
    const remoteConfig = admin.remoteConfig(app);
    const template = await remoteConfig.getTemplate();

    for (const name of namesToTry) {
      const parameter = getRemoteConfigParameter(template as RemoteConfigTemplateLike, name);
      const value = extractRemoteConfigValue(parameter);
      if (value) return value;
    }

    throw new Error(
      `No se encontró parámetro de YouTube API key en Remote Config (probados: ${namesToTry.join(', ')})`
    );
  } catch (error) {
    const envKey = (process.env.YOUTUBE_API_KEY || '').trim();
    if (envKey) {
      return envKey;
    }
    throw error;
  }
}

/**
 * Obtiene la API key de Resend desde Firebase Remote Config (servidor).
 * Prueba varios nombres de parámetro y hace fallback a RESEND_API_KEY en env.
 */
export async function getResendApiKeyFromRemoteConfig(
  paramName?: string
): Promise<string> {
  const namesToTry = paramName
    ? [paramName, ...RESEND_API_KEY_PARAM_NAMES.filter((n) => n !== paramName)]
    : RESEND_API_KEY_PARAM_NAMES;

  try {
    const app = getAdminApp();
    const remoteConfig = admin.remoteConfig(app);
    const template = await remoteConfig.getTemplate();

    for (const name of namesToTry) {
      const parameter = getRemoteConfigParameter(template as RemoteConfigTemplateLike, name);
      const value = extractRemoteConfigValue(parameter);
      if (value) return value;
    }

    throw new Error(
      `No se encontró parámetro de Resend API key en Remote Config (probados: ${namesToTry.join(', ')})`
    );
  } catch (error) {
    const envKey = (process.env.RESEND_API_KEY || '').trim();
    if (envKey) {
      return envKey;
    }
    throw error;
  }
}
