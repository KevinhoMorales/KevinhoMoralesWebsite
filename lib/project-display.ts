import type { Project, ProjectCategory, ProjectLink } from '@/types';

const IOS_LINK_TYPES: ProjectLink['type'][] = ['appStore', 'website', 'github', 'other'];
const ANDROID_LINK_TYPES: ProjectLink['type'][] = ['playStore', 'website', 'github', 'other'];
const WEB_LINK_TYPES: ProjectLink['type'][] = ['website', 'github', 'other'];

const ANDROID_LEAN_TECH = new Set(['Kotlin', 'Java', 'Jetpack Compose']);
const IOS_LEAN_TECH = new Set(['Swift', 'SwiftUI', 'Objective-C', 'Objective C']);
const FLUTTER_TECH = new Set(['Dart', 'Flutter']);
const MOBILE_TECH = new Set<string>([
  ...Array.from(ANDROID_LEAN_TECH),
  ...Array.from(IOS_LEAN_TECH),
  ...Array.from(FLUTTER_TECH),
  'React Native',
]);

export type PlatformBadge = 'ios' | 'android' | 'web';

function hasLinkType(project: Project, type: ProjectLink['type']): boolean {
  return project.links?.some((l) => l.type === type) ?? false;
}

function isFlutterProject(project: Project): boolean {
  return (
    project.category === 'flutter' ||
    project.technologies.some((t) => FLUTTER_TECH.has(t))
  );
}

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

function flutterTechnologies(technologies: string[]): string[] {
  const out = technologies.filter((t) => FLUTTER_TECH.has(t));
  const result: string[] = [];
  if (out.includes('Dart') || technologies.includes('Dart') || out.length === 0) {
    result.push('Dart');
  }
  if (out.includes('Flutter') || technologies.includes('Flutter')) {
    result.push('Flutter');
  }
  return result.length > 0 ? result : ['Dart', 'Flutter'];
}

function webTechnologies(technologies: string[], language?: string): string[] {
  const out = technologies.filter((t) => !MOBILE_TECH.has(t));
  if (out.length === 0 && language?.trim() && !MOBILE_TECH.has(language.trim())) {
    return [language.trim()];
  }
  return out.length > 0 ? out : [...technologies];
}

function technologiesForMode(technologies: string[], mode: ProjectCategory, language?: string): string[] {
  let out: string[];
  if (mode === 'ios') {
    out = technologies.filter((t) => !ANDROID_LEAN_TECH.has(t) && !FLUTTER_TECH.has(t));
  } else if (mode === 'android') {
    out = technologies.filter((t) => !IOS_LEAN_TECH.has(t) && !FLUTTER_TECH.has(t));
  } else if (mode === 'web') {
    return webTechnologies(technologies, language);
  } else {
    out = [...technologies];
  }
  if (out.length === 0 && language?.trim()) {
    return [language.trim()];
  }
  return out;
}

function technologiesForAll(project: Project): string[] {
  if (isFlutterProject(project)) {
    return flutterTechnologies(project.technologies);
  }

  if (project.category === 'web') {
    return webTechnologies(project.technologies, project.language);
  }

  const hasApp = hasLinkType(project, 'appStore');
  const hasPlay = hasLinkType(project, 'playStore');

  if (hasApp && hasPlay) {
    const ios = technologiesForMode(project.technologies, 'ios', project.language);
    const android = technologiesForMode(project.technologies, 'android', project.language);
    return Array.from(new Set([...ios, ...android]));
  }

  if (hasApp) {
    return technologiesForMode(project.technologies, 'ios', project.language);
  }

  if (hasPlay) {
    return technologiesForMode(project.technologies, 'android', project.language);
  }

  return project.technologies;
}

function technologiesForFilter(project: Project, filter: ProjectCategory | 'all'): string[] {
  if (filter === 'all') {
    return technologiesForAll(project);
  }

  if (isFlutterProject(project)) {
    return flutterTechnologies(project.technologies);
  }

  return technologiesForMode(project.technologies, filter, project.language);
}

/** Badges de plataforma derivados de links y categoría (no solo `project.category`). */
export function getProjectPlatformBadges(project: Project): PlatformBadge[] {
  if (project.category === 'web') {
    return ['web'];
  }

  if (isFlutterProject(project)) {
    return ['ios', 'android'];
  }

  const badges: PlatformBadge[] = [];
  if (hasLinkType(project, 'appStore')) badges.push('ios');
  if (hasLinkType(project, 'playStore')) badges.push('android');
  if (badges.length === 0 && hasLinkType(project, 'website')) {
    badges.push('web');
  }

  if (badges.length === 0) {
    if (project.category === 'ios') badges.push('ios');
    else if (project.category === 'android') badges.push('android');
  }

  return badges;
}

/**
 * Ajusta enlaces y tecnologías mostrados según el filtro de la UI.
 */
export function displayProjectForFilter(project: Project, filter: ProjectCategory | 'all'): Project {
  const links = filter === 'all' || filter === 'flutter' ? project.links : linksForMode(project.links, filter);
  const technologies = technologiesForFilter(project, filter);
  return { ...project, links, technologies };
}
