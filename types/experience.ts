export interface Experience {
  id: string;
  company: string;
  role: string;
  type: 'full-time' | 'freelance' | 'part-time';
  startDate: string;
  endDate?: string;
  current?: boolean;
  companyUrl?: string;
  companyLogo?: string;
  description?: string;
}

/** Una empresa con uno o más cargos (misma compañía, distintos roles). */
export interface ExperienceRoleLine {
  role: string;
  type: Experience['type'];
  startDate: string;
  endDate?: string;
  current?: boolean;
}

export interface MergedExperience {
  id: string;
  company: string;
  companyUrl?: string;
  companyLogo?: string;
  roles: ExperienceRoleLine[];
}
