import * as admin from 'firebase-admin';

const YOUTUBE_API_KEY_PARAM_NAMES = [
  'youtube_api_key',
  'youtube-api-key',
  'YOUTUBE_API_KEY',
];

const WEB3FORMS_ACCESS_KEY_PARAM_NAMES = [
  'web_3_form',
  'web3forms_access_key',
  'WEB3FORMS_ACCESS_KEY',
];

interface RemoteConfigParameter {
  defaultValue?: { value?: string };
  conditionalValues?: Record<string, { value?: string }>;
}

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

    const parameters = template.parameters as Record<string, RemoteConfigParameter> | undefined;
    if (parameters) {
      for (const name of namesToTry) {
        const parameter = parameters[name];
        const value = extractRemoteConfigValue(parameter);
        if (value) return value;
      }
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
 * Obtiene la Web3Forms Access Key desde Firebase Remote Config.
 * Fallback a WEB3FORMS_ACCESS_KEY en env.
 */
export async function getWeb3FormsAccessKeyFromRemoteConfig(): Promise<string> {
  try {
    const app = getAdminApp();
    const remoteConfig = admin.remoteConfig(app);
    const template = await remoteConfig.getTemplate();

    const parameters = template.parameters as Record<string, RemoteConfigParameter> | undefined;
    if (parameters) {
      for (const name of WEB3FORMS_ACCESS_KEY_PARAM_NAMES) {
        const parameter = parameters[name];
        const value = extractRemoteConfigValue(parameter);
        if (value) return value;
      }
    }

    throw new Error(
      `No se encontró parámetro web3forms en Remote Config (probados: ${WEB3FORMS_ACCESS_KEY_PARAM_NAMES.join(', ')})`
    );
  } catch (error) {
    const envKey = (process.env.WEB3FORMS_ACCESS_KEY || '').trim();
    if (envKey) return envKey;
    throw error;
  }
}
