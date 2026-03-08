export interface Conference {
  id: string;
  title: string;
  topic?: string;
  type: 'conference' | 'virtual' | 'talk' | 'meetup';
  date?: string;
  location?: string;
  city?: string;
  country?: string;
  audience?: number;
  videoUrl?: string;
  eventUrl?: string;
  tags?: string[];
  images?: string[];
}
