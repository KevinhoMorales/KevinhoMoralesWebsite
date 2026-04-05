import * as fs from 'fs';
import * as path from 'path';
import type { Profile, Experience, Project, Conference, Testimonial, Achievement } from '@/types';

const CONTENT_DIR = path.join(process.cwd(), 'content');

/**
 * En `next dev`, por defecto NO se llama a Firestore en la home: evita 5–15s de compilación + gRPC en frío
 * (parece que "no carga"). Para forzar Firestore en local: DEV_FETCH_FIRESTORE=1 en .env.local
 */
function ssrSkipRemoteFirestore(): boolean {
  if (process.env.DEV_FETCH_FIRESTORE === '1') return false;
  return process.env.NODE_ENV === 'development';
}

/**
 * En producción: no bloquear el SSR más de esto; luego se usa JSON local.
 */
const SSR_FIRESTORE_BUDGET_MS = 2000;

function withSsrBudget<T>(promise: Promise<T | null>): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), SSR_FIRESTORE_BUDGET_MS)),
  ]);
}

/** Import dinámico: evita que un fallo al cargar firebase-admin rompa todo el módulo en SSR. */
async function adminFetchProjectsSafe(): Promise<Project[] | null> {
  try {
    const { adminFetchProjects } = await import('@/lib/firestore-admin-content');
    return await adminFetchProjects();
  } catch (e) {
    console.warn('[content] Firestore projects omitido:', e);
    return null;
  }
}

async function adminFetchConferencesSafe(): Promise<Conference[] | null> {
  try {
    const { adminFetchConferences } = await import('@/lib/firestore-admin-content');
    return await adminFetchConferences();
  } catch (e) {
    console.warn('[content] Firestore conferences omitido:', e);
    return null;
  }
}

function readJson<T>(filename: string): T {
  const filePath = path.join(CONTENT_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export function getProfile(): Profile {
  return readJson<Profile>('profile.json');
}

export function getExperience(): Experience[] {
  return readJson<Experience[]>('experience.json');
}

export async function getProjects(): Promise<Project[]> {
  if (ssrSkipRemoteFirestore()) {
    return readJson<Project[]>('projects.json');
  }
  try {
    const fromDb = await withSsrBudget(adminFetchProjectsSafe());
    if (fromDb === null) return readJson<Project[]>('projects.json');
    if (fromDb.length > 0) return fromDb;
    return readJson<Project[]>('projects.json');
  } catch (e) {
    console.error('[content] getProjects:', e);
    return readJson<Project[]>('projects.json');
  }
}

export async function getConferences(): Promise<Conference[]> {
  if (ssrSkipRemoteFirestore()) {
    return readJson<Conference[]>('conferences.json');
  }
  try {
    const fromDb = await withSsrBudget(adminFetchConferencesSafe());
    if (fromDb === null) return readJson<Conference[]>('conferences.json');
    if (fromDb.length > 0) return fromDb;
    return readJson<Conference[]>('conferences.json');
  } catch (e) {
    console.error('[content] getConferences:', e);
    return readJson<Conference[]>('conferences.json');
  }
}

export function getTestimonials(): Testimonial[] {
  return readJson<Testimonial[]>('testimonials.json');
}

export function getAchievements(): Achievement[] {
  return readJson<Achievement[]>('achievements.json');
}

export async function getProjectsByCategory(category?: string): Promise<Project[]> {
  const projects = await getProjects();
  if (!category) return projects;
  return projects.filter((p) => p.category === category);
}
