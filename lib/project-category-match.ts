import type { Project, ProjectCategory } from '@/types';

/**
 * Un mismo proyecto puede tener enlaces App Store y Play Store tras fusionar documentos.
 * En ese caso debe aparecer en los filtros iOS y Android aunque `category` sea solo uno (p. ej. `ios`).
 */
export function projectMatchesCategory(project: Project, category: ProjectCategory | 'all'): boolean {
  if (category === 'all') return true;
  const cat = project.category;
  const hasApp = project.links?.some((l) => l.type === 'appStore');
  const hasPlay = project.links?.some((l) => l.type === 'playStore');
  switch (category) {
    case 'ios':
      return cat === 'ios' || cat === 'flutter' || Boolean(hasApp);
    case 'android':
      return cat === 'android' || cat === 'flutter' || Boolean(hasPlay);
    case 'web':
      return cat === 'web';
    case 'flutter':
      return cat === 'flutter';
    default:
      return false;
  }
}
