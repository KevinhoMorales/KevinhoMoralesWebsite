export type LearnHubItemType = 'courses' | 'writing' | 'podcast' | 'book';

export interface LearnHubItem {
  id: string;
  type: LearnHubItemType;
  title: string;
  description: string;
  url: string;
  internalLink?: string;
  image?: string;
}
