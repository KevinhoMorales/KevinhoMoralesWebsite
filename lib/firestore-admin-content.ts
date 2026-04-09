import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { tryGetAdminApp } from '@/lib/firebase-admin';
import {
  PROD_COLLECTION,
  PROD_ADMIN_DOC_ID,
  CONFERENCES_SUBCOLLECTION,
  PROJECTS_SUBCOLLECTION,
} from '@/lib/firebase-paths';
import type { Project, Conference, ProjectCategory, ProjectLink } from '@/types';
import {
  CONFERENCE_LOCATION_PLATFORMS,
  type ConferenceLocationPlatform,
} from '@/types/conference';

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
const CONF_TYPES: Conference['type'][] = ['virtual_conference', 'conference', 'virtual_talk', 'talk'];

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

function asIsoDateFromFirestore(v: unknown): string | undefined {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (typeof v === 'string' && v.trim()) return v.trim();
  return undefined;
}

/** Rutas/URLs de imágenes de conferencia: tolera array, mapa indexado o objetos `{ url | path }`. */
function conferenceImagesFromFirestore(raw: unknown): string[] | undefined {
  if (raw == null) return undefined;

  const pushFromItem = (x: unknown, bucket: string[]) => {
    if (typeof x === 'string' && x.trim()) {
      bucket.push(x.trim());
      return;
    }
    if (x !== null && typeof x === 'object') {
      const o = x as Record<string, unknown>;
      for (const key of ['url', 'path', 'src', 'storagePath'] as const) {
        const v = o[key];
        if (typeof v === 'string' && v.trim()) {
          bucket.push(v.trim());
          return;
        }
      }
    }
  };

  if (Array.isArray(raw)) {
    const out: string[] = [];
    for (const x of raw) pushFromItem(x, out);
    return out.length ? out : undefined;
  }

  if (typeof raw === 'object') {
    const rec = raw as Record<string, unknown>;
    const keys = Object.keys(rec);
    const allNumeric = keys.length > 0 && keys.every((k) => /^\d+$/.test(k));
    if (allNumeric) {
      const ordered = [...keys].sort((a, b) => Number(a) - Number(b));
      const out: string[] = [];
      for (const k of ordered) pushFromItem(rec[k], out);
      return out.length ? out : undefined;
    }
  }

  return undefined;
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
  const title = (() => {
    const v = data.title;
    if (typeof v === 'string') return v.trim();
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    return '';
  })();
  const rawType = asString(data.type);
  /** Registros antiguos en Firestore. */
  const legacyMapped =
    rawType === 'virtual'
      ? 'virtual_talk'
      : rawType === 'meetup'
        ? 'talk'
        : rawType;
  const type: Conference['type'] =
    legacyMapped && CONF_TYPES.includes(legacyMapped as Conference['type'])
      ? (legacyMapped as Conference['type'])
      : 'talk';
  return {
    id: asString(data.id) ?? docId,
    title,
    topic: asString(data.topic),
    type,
    createdAt: asIsoDateFromFirestore(data.createdAt),
    updatedAt: asIsoDateFromFirestore(data.updatedAt),
    date: asString(data.date),
    locationPlatform: (() => {
      const raw = data.locationPlatform ?? data.location_platform;
      const p = typeof raw === 'string' ? raw.trim() : '';
      return p && (CONFERENCE_LOCATION_PLATFORMS as readonly string[]).includes(p)
        ? (p as ConferenceLocationPlatform)
        : undefined;
    })(),
    location: asString(data.location),
    city: asString(data.city),
    country: asString(data.country),
    audience: asNumber(data.audience),
    videoUrl: asString(data.videoUrl),
    eventUrl: asString(data.eventUrl),
    tags: asStringArray(data.tags),
    images: conferenceImagesFromFirestore(data.images),
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
