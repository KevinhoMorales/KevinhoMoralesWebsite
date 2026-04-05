import { getFirestore } from 'firebase-admin/firestore';
import { tryGetAdminApp } from '@/lib/firebase-admin';
import {
  PROD_COLLECTION,
  PROD_ADMIN_DOC_ID,
  CONFERENCES_SUBCOLLECTION,
  PROJECTS_SUBCOLLECTION,
} from '@/lib/firebase-paths';
import type { Project, Conference, ProjectCategory, ProjectLink } from '@/types';

const FIRESTORE_READ_MS = 5_000;

function withFirestoreTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} (${FIRESTORE_READ_MS}ms)`)), FIRESTORE_READ_MS);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

const CATEGORIES: ProjectCategory[] = ['ios', 'android', 'web', 'flutter'];
const CONF_TYPES: Conference['type'][] = ['conference', 'virtual', 'talk', 'meetup'];

function asString(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v : undefined;
}

function asNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  return undefined;
}

function asStringArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v.filter((x): x is string => typeof x === 'string' && x.length > 0);
  return out.length ? out : undefined;
}

function asLinks(v: unknown): ProjectLink[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is Record<string, unknown> => x !== null && typeof x === 'object')
    .map((x) => ({
      type: (['appStore', 'playStore', 'website', 'github', 'other'].includes(
        x.type as string
      )
        ? x.type
        : 'other') as ProjectLink['type'],
      url: asString(x.url) ?? '',
      label: asString(x.label),
    }))
    .filter((l) => l.url.length > 0);
}

function normalizeProject(data: Record<string, unknown>, docId: string): Project | null {
  const title = asString(data.title);
  if (!title) return null;
  const rawCat = asString(data.category);
  const category: ProjectCategory = rawCat && CATEGORIES.includes(rawCat as ProjectCategory)
    ? (rawCat as ProjectCategory)
    : 'web';
  return {
    id: asString(data.id) ?? docId,
    title,
    description: asString(data.description) ?? '',
    image: asString(data.image),
    technologies: asStringArray(data.technologies) ?? [],
    category,
    links: asLinks(data.links),
    sortOrder: asNumber(data.sortOrder),
    experience: asString(data.experience),
    platforms: asStringArray(data.platforms),
    tags: asStringArray(data.tags),
  };
}

function normalizeConference(data: Record<string, unknown>, docId: string): Conference | null {
  const title = asString(data.title);
  if (!title) return null;
  const rawType = asString(data.type);
  const type: Conference['type'] =
    rawType && CONF_TYPES.includes(rawType as Conference['type'])
      ? (rawType as Conference['type'])
      : 'talk';
  return {
    id: asString(data.id) ?? docId,
    title,
    topic: asString(data.topic),
    type,
    date: asString(data.date),
    location: asString(data.location),
    city: asString(data.city),
    country: asString(data.country),
    audience: asNumber(data.audience),
    videoUrl: asString(data.videoUrl),
    eventUrl: asString(data.eventUrl),
    tags: asStringArray(data.tags),
    images: asStringArray(data.images),
  };
}

export async function adminFetchProjects(): Promise<Project[] | null> {
  const app = tryGetAdminApp();
  if (!app) return null;
  try {
    const db = getFirestore(app);
    const snap = await withFirestoreTimeout(
      db.collection(PROD_COLLECTION).doc(PROD_ADMIN_DOC_ID).collection(PROJECTS_SUBCOLLECTION).get(),
      'firestore projects'
    );
    const out: Project[] = [];
    for (const doc of snap.docs) {
      const row = normalizeProject(doc.data() as Record<string, unknown>, doc.id);
      if (row) out.push(row);
    }
    return out;
  } catch (err) {
    console.warn('[firestore-admin] projects read failed, using JSON fallback:', err);
    return null;
  }
}

export async function adminFetchConferences(): Promise<Conference[] | null> {
  const app = tryGetAdminApp();
  if (!app) return null;
  try {
    const db = getFirestore(app);
    const snap = await withFirestoreTimeout(
      db.collection(PROD_COLLECTION).doc(PROD_ADMIN_DOC_ID).collection(CONFERENCES_SUBCOLLECTION).get(),
      'firestore conferences'
    );
    const out: Conference[] = [];
    for (const doc of snap.docs) {
      const row = normalizeConference(doc.data() as Record<string, unknown>, doc.id);
      if (row) out.push(row);
    }
    return out;
  } catch (err) {
    console.warn('[firestore-admin] conferences read failed, using JSON fallback:', err);
    return null;
  }
}
