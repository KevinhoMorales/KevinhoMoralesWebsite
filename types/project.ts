export type ProjectCategory = 'ios' | 'android' | 'web' | 'flutter';

export interface ProjectLink {
  type: 'appStore' | 'playStore' | 'website' | 'github' | 'other';
  url: string;
  label?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  technologies: string[];
  category: ProjectCategory;
  links: ProjectLink[];
  /** Optional: higher = shown first on home when set; omit to use file / collection order (last N). */
  sortOrder?: number;
  experience?: string;
  platforms?: string[];
  tags?: string[];
}
