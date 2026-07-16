import { NextResponse } from 'next/server';

import { getExperience, getProfile, getProjects } from '@/lib/content';
import { mergeExperienceByCompany } from '@/lib/experience-merge';

export type SearchIndexItem = {
  id: string;
  group: 'projects' | 'experience' | 'pages';
  title: string;
  description: string;
  href: string;
};

export async function GET() {
  const profile = getProfile();
  const experience = mergeExperienceByCompany(getExperience());
  const projects = await getProjects();

  const items: SearchIndexItem[] = [
    {
      id: 'page-about',
      group: 'pages',
      title: 'About',
      description: profile.shortBio ?? profile.title ?? '',
      href: '/#about',
    },
    {
      id: 'page-projects',
      group: 'pages',
      title: 'Projects',
      description: 'Featured apps and products',
      href: '/#projects',
    },
    {
      id: 'page-experience',
      group: 'pages',
      title: 'Experience',
      description: profile.title ?? '',
      href: '/#experience',
    },
    {
      id: 'page-speaking',
      group: 'pages',
      title: 'Speaking',
      description: 'Talks and workshops',
      href: '/#speaking',
    },
    {
      id: 'page-learn',
      group: 'pages',
      title: 'Learn & Build',
      description: 'Courses, articles, podcast, book',
      href: '/#learn',
    },
  ];

  for (const project of projects) {
    items.push({
      id: `project-${project.id}`,
      group: 'projects',
      title: project.title,
      description: [project.description, project.caseStudy?.problem].filter(Boolean).join(' '),
      href: '/#projects',
    });
  }

  for (const block of experience) {
    for (const role of block.roles) {
      items.push({
        id: `exp-${block.id}-${role.role}`,
        group: 'experience',
        title: `${role.role} @ ${block.company}`,
        description: role.description ?? block.company,
        href: '/#experience',
      });
    }
  }

  return NextResponse.json({ items });
}
