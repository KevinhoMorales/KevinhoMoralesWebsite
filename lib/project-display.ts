import type { Project, ProjectCategory, ProjectLink } from '@/types';

const IOS_LINK_TYPES: ProjectLink['type'][] = ['appStore', 'website', 'github', 'other'];
const ANDROID_LINK_TYPES: ProjectLink['type'][] = ['playStore', 'website', 'github', 'other'];
const WEB_LINK_TYPES: ProjectLink['type'][] = ['website', 'github', 'other'];

const ANDROID_LEAN_TECH = new Set(['Kotlin', 'Java', 'Jetpack Compose']);
const IOS_LEAN_TECH = new Set(['Swift', 'SwiftUI', 'Objective-C', 'Objective C']);

function linksForMode(links: ProjectLink[], mode: ProjectCategory): ProjectLink[] {
  const allow =
    mode === 'ios'
      ? IOS_LINK_TYPES
      : mode === 'android'
        ? ANDROID_LINK_TYPES
        : mode === 'web'
          ? WEB_LINK_TYPES
          : null;
  if (allow === null) return links;
  return links.filter((l) => allow.includes(l.type));
}

function technologiesForMode(technologies: string[], mode: ProjectCategory, language?: string): string[] {
  let out: string[];
  if (mode === 'ios') {
    out = technologies.filter((t) => !ANDROID_LEAN_TECH.has(t));
  } else if (mode === 'android') {
    out = technologies.filter((t) => !IOS_LEAN_TECH.has(t));
  } else {
    out = [...technologies];
  }
  if (out.length === 0 && language?.trim()) {
    return [language.trim()];
  }
  return out;
}

/**
 * Ajusta enlaces y tecnologías mostrados según el filtro de la UI.
 * En "all" se muestra el proyecto completo (p. ej. App Store + Play tras fusionar duplicados).
 */
export function displayProjectForFilter(project: Project, filter: ProjectCategory | 'all'): Project {
  if (filter === 'all') {
    return { ...project, links: project.links, technologies: project.technologies };
  }
  const mode: ProjectCategory = filter;
  const links = mode === 'flutter' ? project.links : linksForMode(project.links, mode);
  const technologies =
    mode === 'flutter' ? project.technologies : technologiesForMode(project.technologies, mode, project.language);
  return { ...project, links, technologies };
}
