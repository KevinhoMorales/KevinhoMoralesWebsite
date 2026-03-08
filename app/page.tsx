import {
  getProfile,
  getProjects,
  getExperience,
  getConferences,
  getTestimonials,
  getAchievements,
} from '@/lib/content';
import { Hero } from '@/components/sections/hero';
import { About } from '@/components/sections/about';
import { ExperienceSection } from '@/components/sections/experience';
import { ProjectsSection } from '@/components/sections/projects';
import { PodcastSectionUI } from '@/components/sections/podcast-section';
import { ArticlesSection } from '@/components/sections/articles-section';
import { ConferencesSection } from '@/components/sections/conferences';
import { Recommendations } from '@/components/sections/recommendations';
import { Connect } from '@/components/sections/connect';
import { Footer } from '@/components/sections/footer';

export default function Home() {
  const profile = getProfile();
  const projects = getProjects();
  const experience = getExperience();
  const conferences = getConferences();
  const testimonials = getTestimonials();
  const achievements = getAchievements();

  return (
    <main className="min-h-screen">
      <Hero profile={profile} />
      <About profile={profile} />
      <ExperienceSection experiences={experience} />
      <ProjectsSection projects={projects} />
      <ArticlesSection />
      <PodcastSectionUI />
      <ConferencesSection conferences={conferences} achievements={achievements} />
      <Recommendations testimonials={testimonials} />
      <Connect profile={profile} />
      <Footer profile={profile} />
    </main>
  );
}
