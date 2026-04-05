'use client';

import { ProjectGrid } from '@/components/project-grid';
import { TranslatedPageHeader } from '@/components/i18n/translated-page-header';
import type { Project } from '@/types';

export function ProjectsPageClient({ projects }: { projects: Project[] }) {
  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl">
      <TranslatedPageHeader titleKey="pages.projects.title" descKey="pages.projects.desc" />
      <ProjectGrid projects={projects} />
    </main>
  );
}
