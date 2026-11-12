export interface Experience {
  id: string;
  company: string;
  role: string;
  type: 'full-time' | 'freelance' | 'part-time' | 'volunteer' | 'self-employed';
  startDate: string;
  endDate?: string;
  current?: boolean;
  companyUrl?: string;
  companyLogo?: string;
  companyFormerName?: string;
  description?: string;
  /** Spanish description when the site locale is `es`. Falls back to `description`. */
  descriptionEs?: string;
  roleUrl?: string;
  location?: string;
  skills?: string[];
}

/** Una empresa con uno o más cargos (misma compañía, distintos roles). */
export interface ExperienceRoleLine {
  role: string;
  type: Experience['type'];
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  descriptionEs?: string;
  roleUrl?: string;
  location?: string;
  skills?: string[];
}

export interface MergedExperience {
  id: string;
  company: string;
  companyUrl?: string;
  companyLogo?: string;
  companyFormerName?: string;
  roles: ExperienceRoleLine[];
}
