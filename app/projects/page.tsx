import { getProjects } from '@/lib/content';
import { orderProjectsForDisplay, parseProjectsCategoryParam } from '@/lib/projects-order';
import { withCanonical } from '@/lib/site';
import { TranslatedPageHeader } from '@/components/i18n/translated-page-header';
import { ProjectGrid } from '@/components/project-grid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects | Kevin Morales',
  description: 'Mobile and web projects — iOS, Android, Flutter apps by Kevin Morales',
  ...withCanonical('/projects'),
};

type PageProps = { searchParams: { category?: string | string[] } };

export default async function ProjectsPage({ searchParams }: PageProps) {
  const initialCategory = parseProjectsCategoryParam(searchParams.category);
  const projects = orderProjectsForDisplay(await getProjects());

  return (
    <main className="min-h-screen min-w-0 px-4 py-10 sm:px-6 md:px-8 lg:px-12">
      <TranslatedPageHeader titleKey="pages.projects.title" descKey="pages.projects.desc" />
      <ProjectGrid projects={projects} initialCategory={initialCategory} />
    </main>
  );
}
