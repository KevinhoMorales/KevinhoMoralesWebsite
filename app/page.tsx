import type { Metadata } from 'next';

import {
  getProfile,
  getProjects,
  getExperience,
  getConferences,
  getTestimonials,
  getAchievements,
} from '@/lib/content';
import { withCanonical } from '@/lib/site';
import { orderProjectsForDisplay } from '@/lib/projects-order';
import { Hero } from '@/components/sections/hero';
import { About } from '@/components/sections/about';
import { ExperienceSection } from '@/components/sections/experience';
import { ProjectsSection } from '@/components/sections/projects';
import { PodcastSectionUI } from '@/components/sections/podcast-section';
import { ArticlesSection } from '@/components/sections/articles-section';
import { AchievementsSection } from '@/components/sections/achievements-section';
import { ConferencesSection } from '@/components/sections/conferences';
import { Recommendations } from '@/components/sections/recommendations';
import { Connect } from '@/components/sections/connect';
import { Footer } from '@/components/sections/footer';

export const metadata: Metadata = {
  title: 'Mobile & Software Engineer',
  description:
    'Kevin Morales — Mobile engineer, community builder, and speaker. iOS, Android, Flutter, and web. DevLokos, GDG, conference talks.',
  ...withCanonical('/'),
};

export default async function Home() {
  const profile = getProfile();
  const experience = getExperience();
  const testimonials = getTestimonials();
  const achievements = getAchievements();
  const [projectsRaw, conferences] = await Promise.all([getProjects(), getConferences()]);
  const projects = orderProjectsForDisplay(projectsRaw);

  return (
    <main className="min-h-screen">
      <Hero profile={profile} />
      <About profile={profile} />
      <ExperienceSection experiences={experience} />
      <ProjectsSection projects={projects} />
      <ArticlesSection />
      <PodcastSectionUI />
      <ConferencesSection conferences={conferences} />
      <Recommendations testimonials={testimonials} />
      <AchievementsSection achievements={achievements} />
      <Connect profile={profile} />
      <Footer profile={profile} />
    </main>
  );
}
