import * as fs from 'fs';
import * as path from 'path';
import type { Profile, Experience, Project, Conference, Testimonial, Achievement } from '@/types';

const CONTENT_DIR = path.join(process.cwd(), 'content');

function readJson<T>(filename: string): T {
  const filePath = path.join(CONTENT_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export function getProfile(): Profile {
  return readJson<Profile>('profile.json');
}

export function getExperience(): Experience[] {
  return readJson<Experience[]>('experience.json');
}

export function getProjects(): Project[] {
  return readJson<Project[]>('projects.json');
}

export function getConferences(): Conference[] {
  return readJson<Conference[]>('conferences.json');
}

export function getTestimonials(): Testimonial[] {
  return readJson<Testimonial[]>('testimonials.json');
}

export function getAchievements(): Achievement[] {
  return readJson<Achievement[]>('achievements.json');
}

export function getProjectsByCategory(category?: string): Project[] {
  const projects = getProjects();
  if (!category) return projects;
  return projects.filter((p) => p.category === category);
}
