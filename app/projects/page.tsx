import { getProjects } from '@/lib/content';
import { ProjectsPageClient } from '@/components/pages/projects-page-client';
import type { Metadata } from 'next';

import { withCanonical } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Projects | Kevin Morales',
  description: 'Mobile and web projects - iOS, Android, Flutter apps by Kevin Morales',
  ...withCanonical('/projects'),
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsPageClient projects={projects} />;
}
