import { getProjects } from '@/lib/content';
import { orderProjectsForDisplay, parseProjectsCategoryParam } from '@/lib/projects-order';
import { ProjectGrid } from '@/components/project-grid';
import { TranslatedPageHeader } from '@/components/i18n/translated-page-header';
import type { Metadata } from 'next';

import { withCanonical } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Projects | Kevin Morales',
  description: 'Mobile and web projects - iOS, Android, Flutter apps by Kevin Morales',
  ...withCanonical('/projects'),
};

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function ProjectsPage({ searchParams }: PageProps) {
  const initialCategory = parseProjectsCategoryParam(searchParams.category);
  const projects = orderProjectsForDisplay(await getProjects());

  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl">
      <TranslatedPageHeader titleKey="pages.projects.title" descKey="pages.projects.desc" />
      <ProjectGrid projects={projects} initialCategory={initialCategory} />
    </main>
  );
}
