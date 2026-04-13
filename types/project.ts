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
  /** Cliente / empresa (p. ej. Notion "Experience"). */
  experience?: string;
  /** Dispositivos soportados: iPhone, iPad, Mac, iMessage, … */
  platforms?: string[];
  tags?: string[];
  /** Lenguaje principal: Swift, SwiftUI, Objective-C, Dart, … */
  language?: string;
  /** Fecha de publicación en App Store / Play Store (YYYY-MM-DD o texto libre). */
  releaseDate?: string;
  /** Categoría web: framework principal (Next.js, React, Vite…). */
  webFramework?: string;
  /** Categoría web: hosting o despliegue (Vercel, Netlify…). */
  webHosting?: string;
}
