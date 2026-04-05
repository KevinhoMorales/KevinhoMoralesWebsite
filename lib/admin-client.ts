import { collection, deleteDoc, doc, type Firestore, setDoc } from 'firebase/firestore';
import {
  CONFERENCES_SUBCOLLECTION,
  PROD_ADMIN_DOC_ID,
  PROD_COLLECTION,
  PROJECTS_SUBCOLLECTION,
  STORAGE_ADMIN_PREFIX,
} from '@/lib/firebase-paths';

export function prodAdminRoot(db: Firestore) {
  return doc(db, PROD_COLLECTION, PROD_ADMIN_DOC_ID);
}

export function conferencesCollection(db: Firestore) {
  return collection(prodAdminRoot(db), CONFERENCES_SUBCOLLECTION);
}

export function projectsCollection(db: Firestore) {
  return collection(prodAdminRoot(db), PROJECTS_SUBCOLLECTION);
}

export function conferenceDocRef(db: Firestore, id: string) {
  return doc(prodAdminRoot(db), CONFERENCES_SUBCOLLECTION, id);
}

export function projectDocRef(db: Firestore, id: string) {
  return doc(prodAdminRoot(db), PROJECTS_SUBCOLLECTION, id);
}

/** Ruta en Storage relativa al bucket: admin/admin/uploads/{uid}/... */
export function storageUploadPath(uid: string, fileName: string) {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${STORAGE_ADMIN_PREFIX}/${uid}/${Date.now()}_${safe}`;
}

export async function persistWithId(
  db: Firestore,
  col: 'conferences' | 'projects',
  id: string,
  data: Record<string, unknown>
) {
  const root = prodAdminRoot(db);
  const sub = col === 'conferences' ? CONFERENCES_SUBCOLLECTION : PROJECTS_SUBCOLLECTION;
  await setDoc(doc(root, sub, id), data, { merge: true });
}

export async function removeDoc(db: Firestore, col: 'conferences' | 'projects', id: string) {
  const root = prodAdminRoot(db);
  const sub = col === 'conferences' ? CONFERENCES_SUBCOLLECTION : PROJECTS_SUBCOLLECTION;
  await deleteDoc(doc(root, sub, id));
}
