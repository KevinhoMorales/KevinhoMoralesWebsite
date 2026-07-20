import * as fs from 'fs';
import * as path from 'path';
import type { Profile, Experience, Project, ProjectCaseStudy, ProjectCategory, Conference, Testimonial, Achievement, SkillCategory, LearnHubItem, GithubRepo } from '@/types';
import { projectMatchesCategory } from '@/lib/project-category-match';
import { PROJECT_CATEGORY_PARAMS } from '@/lib/projects-order';
import { sortConferencesForDisplay } from '@/lib/conference-sort';
import { signConferenceImagesForPublicRead } from '@/lib/conference-image-read-urls';
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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Proyectos duplicados u obsoletos que no deben mostrarse (p. ej. `devlokos-web` sin imagen). */
const EXCLUDED_PROJECT_IDS = new Set(['devlokos-web', 'elite-padel-ranking-oficial']);

function getProjectDescriptionOverrides(): Record<string, string> {
  try {
    return readJson<Record<string, string>>('project-descriptions.json');
  } catch {
    return {};
  }
}

function getProjectCaseStudyOverrides(): Record<string, ProjectCaseStudy> {
  try {
    return readJson<Record<string, ProjectCaseStudy>>('project-case-studies.json');
  } catch {
    return {};
  }
}

function applyProjectEnrichments(projects: Project[]): Project[] {
  const descriptions = getProjectDescriptionOverrides();
  const caseStudies = getProjectCaseStudyOverrides();

  return projects
    .filter((project) => !EXCLUDED_PROJECT_IDS.has(project.id))
    .map((project) => ({
      ...project,
      description: isNonEmptyString(descriptions[project.id])
        ? descriptions[project.id]
        : project.description,
      caseStudy: caseStudies[project.id] ?? project.caseStudy,
    }));
}

/** Fusiona Firestore con `projects.json`: añade faltantes y enriquece image, links, caseStudy, etc. */
function mergeProjectsFromJson(remote: Project[], local: Project[]): Project[] {
  if (local.length === 0) return remote;

  const byId = new Map(remote.map((project) => [project.id, project]));

  for (const localProject of local) {
    if (EXCLUDED_PROJECT_IDS.has(localProject.id)) continue;

    const existing = byId.get(localProject.id);
    if (!existing) {
      byId.set(localProject.id, localProject);
      continue;
    }

    const links =
      (localProject.links?.length ?? 0) >= (existing.links?.length ?? 0)
        ? localProject.links
        : existing.links;

    byId.set(localProject.id, {
      ...existing,
      title: localProject.title || existing.title,
      description: isNonEmptyString(localProject.description)
        ? localProject.description
        : existing.description,
      image: localProject.image || existing.image,
      technologies: localProject.technologies?.length
        ? localProject.technologies
        : existing.technologies,
      category: localProject.category || existing.category,
      links: links ?? existing.links,
      sortOrder: localProject.sortOrder ?? existing.sortOrder,
      experience: localProject.experience || existing.experience,
      platforms: localProject.platforms?.length ? localProject.platforms : existing.platforms,
      tags: localProject.tags?.length ? localProject.tags : existing.tags,
      language: localProject.language || existing.language,
      releaseDate: localProject.releaseDate || existing.releaseDate,
      webFramework: localProject.webFramework || existing.webFramework,
      webHosting: localProject.webHosting || existing.webHosting,
      caseStudy: localProject.caseStudy ?? existing.caseStudy,
    });
  }

  return Array.from(byId.values());
}

export function getProfile(): Profile {
  return readJson<Profile>('profile.json');
}

export function getExperience(): Experience[] {
  return readJson<Experience[]>('experience.json');
}

export async function getProjects(): Promise<Project[]> {
  const jsonProjects = readJson<Project[]>('projects.json');
  if (ssrSkipRemoteFirestoreForProjects()) {
    return applyProjectEnrichments(jsonProjects);
  }
  try {
    const fromDb = await withSsrBudget(adminFetchProjectsSafe());
    if (fromDb === null) return applyProjectEnrichments(jsonProjects);
    if (fromDb.length > 0) {
      return applyProjectEnrichments(mergeProjectsFromJson(fromDb, jsonProjects));
    }
    return applyProjectEnrichments(jsonProjects);
  } catch (e) {
    console.error('[content] getProjects:', e);
    return applyProjectEnrichments(jsonProjects);
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
    const expanded = fromDb.map(expandConferenceImagesForPublic);
    const withImages = await signConferenceImagesForPublicRead(expanded);
    return sortConferencesForDisplay(withImages);
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

export function getSkills(): SkillCategory[] {
  return readJson<SkillCategory[]>('skills.json');
}

export function getLearnHubItems(): LearnHubItem[] {
  return readJson<LearnHubItem[]>('learn-hub.json');
}

export function getGithubRepos(): GithubRepo[] {
  return readJson<GithubRepo[]>('github-repos.json');
}

export async function getProjectsByCategory(category?: string): Promise<Project[]> {
  const projects = await getProjects();
  if (!category) return projects;
  if (!PROJECT_CATEGORY_PARAMS.includes(category as ProjectCategory)) return projects;
  return projects.filter((p) => projectMatchesCategory(p, category as ProjectCategory));
}
