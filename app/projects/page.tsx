import { getProjects } from '@/lib/content';
import { ProjectGrid } from '@/components/project-grid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects | Kevin Morales',
  description: 'Mobile and web projects - iOS, Android, Flutter apps by Kevin Morales',
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Projects</h1>
      <p className="text-muted-foreground mb-8">
        Apps published on App Store, Play Store, and web platforms.
      </p>
      <ProjectGrid projects={projects} />
    </main>
  );
}
