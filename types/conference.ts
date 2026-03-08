export interface Conference {
  id: string;
  title: string;
  topic?: string;
  type: 'conference' | 'virtual' | 'talk' | 'meetup';
  date?: string;
  location?: string;
  videoUrl?: string;
  eventUrl?: string;
  tags?: string[];
}
