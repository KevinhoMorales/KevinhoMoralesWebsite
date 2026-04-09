import * as fs from 'fs';
import * as path from 'path';
import type { Profile, Experience, Project, Conference, Testimonial, Achievement } from '@/types';
import { sortConferencesForDisplay } from '@/lib/conference-sort';
import { expandConferenceImagesForPublic } from '@/lib/storage-public-url';

const CONTENT_DIR = path.join(process.cwd(), 'content');

/**
 * Solo afecta a **proyectos**: en `next dev` se lee `projects.json` por defecto (evita gRPC en frío en cada recarga).
 * Las **conferencias** siempre intentan Firestore si hay Admin SDK (no tienen JSON de respaldo).
 * Para leer proyectos desde Firestore también en dev: `DEV_FETCH_FIRESTORE=1` en `.env.local`.
 */
function ssrSkipRemoteFirestoreForProjects(): boolean {
  if (process.env.DEV_FETCH_FIRESTORE === '1') return false;
  return process.env.NODE_ENV === 'development';
}

/** SSR: no bloquear demasiado; proyectos tienen fallback JSON. */
const SSR_FIRESTORE_BUDGET_MS = 2000;

/** Conferencias solo en Firestore — presupuesto alineado con la lectura admin (sin fallback si cortamos antes). */
const SSR_CONFERENCES_BUDGET_MS = 5000;

function withSsrBudget<T>(promise: Promise<T | null>, budgetMs = SSR_FIRESTORE_BUDGET_MS): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), budgetMs)),
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
  if (ssrSkipRemoteFirestoreForProjects()) {
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

/**
 * Charlas / conferencias: solo Firestore (`prod/admin/conferences` o raíz en env).
 * En dev también se consulta si `FIREBASE_ADMIN_SDK_KEY` / ADC están configurados (antes se devolvía [] siempre).
 */
export async function getConferences(): Promise<Conference[]> {
  try {
    const fromDb = await withSsrBudget(adminFetchConferencesSafe(), SSR_CONFERENCES_BUDGET_MS);
    if (fromDb == null || fromDb.length === 0) {
      return [];
    }
    return sortConferencesForDisplay(fromDb.map(expandConferenceImagesForPublic));
  } catch (e) {
    console.error('[content] getConferences:', e);
    return [];
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
