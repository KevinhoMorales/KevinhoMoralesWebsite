/**
 * Primer nivel en Firestore (colección raíz en la consola, típicamente `prod`).
 */
const rawRoot = process.env.NEXT_PUBLIC_FIRESTORE_ROOT_COLLECTION?.trim();
export const PROD_COLLECTION = rawRoot && rawRoot.length > 0 ? rawRoot : 'prod';

export const PROD_ADMIN_DOC_ID = 'admin';

export const CONFERENCES_SUBCOLLECTION = 'conferences';
export const PROJECTS_SUBCOLLECTION = 'projects';

export const STORAGE_ADMIN_PREFIX = `${PROD_COLLECTION}/admin/uploads`;
