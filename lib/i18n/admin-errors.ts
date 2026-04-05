/** Mensajes exactos de APIs `/api/admin/*` y utilidades cliente (`admin-browser`). */
const TO_KEY: Record<string, string> = {
  'Firebase Admin no configurado': 'admin.errors.api.firebaseAdmin',
  'Firebase Admin no configurado (FIREBASE_ADMIN_SDK_KEY o GOOGLE_APPLICATION_CREDENTIALS)':
    'admin.errors.api.firebaseAdmin',
  Unauthorized: 'admin.errors.api.unauthorized',
  'No autorizado': 'admin.errors.api.unauthorized',
  'Correo no autorizado para el panel': 'admin.errors.api.emailNotAllowed',
  'No autenticado': 'admin.errors.notAuthenticated',
  'Error de red': 'admin.errors.network',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET no configurado': 'admin.errors.api.storageBucket',
  'Multipart inválido': 'admin.errors.api.invalidMultipart',
  'Archivo requerido (campo file)': 'admin.errors.api.fileRequired',
  'ID requerido': 'admin.errors.api.idRequired',
  'JSON inválido': 'admin.errors.api.invalidJson',
  'Campo data requerido': 'admin.errors.api.dataRequired',
  'Sin URL': 'admin.errors.noUrl',
};

export function translateAdminError(message: string, t: (key: string) => string): string {
  const key = TO_KEY[message];
  return key ? t(key) : message;
}
