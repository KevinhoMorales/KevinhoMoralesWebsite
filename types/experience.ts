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
