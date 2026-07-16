import type { Metadata } from 'next';

import {
  getProfile,
  getProjects,
  getExperience,
  getConferences,
  getTestimonials,
  getAchievements,
  getSkills,
  getLearnHubItems,
  getGithubRepos,
} from '@/lib/content';
import { mergeExperienceByCompany, sortExperienceForPreview } from '@/lib/experience-merge';
import { orderProjectsForDisplay } from '@/lib/projects-order';
import { withCanonical } from '@/lib/site';
import { Hero } from '@/components/sections/hero';
import { About } from '@/components/sections/about';
import { SkillsSection } from '@/components/sections/skills-section';
import { ExperienceSection } from '@/components/sections/experience';
import { SpeakingSection } from '@/components/sections/speaking-section';
import { ProjectsSection } from '@/components/sections/projects';
import { PodcastSectionUI } from '@/components/sections/podcast-section';
import { ArticlesSection } from '@/components/sections/articles-section';
import { BookSection } from '@/components/sections/book-section';
import { AchievementsSection } from '@/components/sections/achievements-section';
import { ConferencesSection } from '@/components/sections/conferences';
import { LearnHubSection } from '@/components/sections/learn-hub-section';
import { GithubSection } from '@/components/sections/github-section';
import { Recommendations } from '@/components/sections/recommendations';
import { Connect } from '@/components/sections/connect';
import { Footer } from '@/components/sections/footer';
import { HomeSectionAnalytics } from '@/components/home-section-analytics';
import { HomeSfPhotoSection } from '@/components/sections/home-sf-photo-section';

export const metadata: Metadata = {
  title: 'Senior Software Engineer',
  description:
    'Kevin Morales — Senior Software Engineer at SoFi building mobile banking platforms. Speaker, EDteam instructor, Cursor Ambassador. DevLokos, GDG, fintech & mobile architecture.',
  ...withCanonical('/'),
};

export default async function Home() {
  const profile = getProfile();
  const experience = sortExperienceForPreview(mergeExperienceByCompany(getExperience()));
  const testimonials = getTestimonials();
  const achievements = getAchievements();
  const skills = getSkills();
  const learnHubItems = getLearnHubItems();
  const githubRepos = getGithubRepos();
  const [projectsRaw, conferences] = await Promise.all([getProjects(), getConferences()]);
  const projects = orderProjectsForDisplay(projectsRaw);

  return (
    <main className="min-h-screen min-w-0">
      <HomeSectionAnalytics />
      <Hero profile={profile} achievements={achievements} />
      <About profile={profile} />
      <SkillsSection categories={skills} />
      <ExperienceSection experiences={experience} previewLimit={6} previewLimitMobile={3} />
      <SpeakingSection profile={profile} />
      <HomeSfPhotoSection />
      <ProjectsSection projects={projects} />
      <ConferencesSection conferences={conferences} />
      <LearnHubSection items={learnHubItems} />
      <GithubSection repos={githubRepos} profileUrl={profile.socialLinks?.github} />
      <PodcastSectionUI />
      <ArticlesSection />
      <BookSection />
      <AchievementsSection achievements={achievements} />
      <Recommendations testimonials={testimonials} />
      <Connect profile={profile} />
      <Footer profile={profile} />
    </main>
  );
}
