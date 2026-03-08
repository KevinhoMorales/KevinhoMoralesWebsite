export interface ProfileBadge {
  label: string;
  href?: string;
}

export interface Profile {
  name: string;
  title?: string;
  badges?: ProfileBadge[];
  bio: string;
  shortBio?: string;
  education?: string;
  cvLinks?: {
    english?: string;
    spanish?: string;
  };
  motto?: string;
  aboutMe?: string;
  familyImage?: string;
  images?: string[];
  profileImageLocal?: string;
  heroImage?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    youtube?: string;
    instagram?: string;
    medium?: string;
    calendly?: string;
    buymeacoffee?: string;
    website?: string;
    sessionize?: string;
  };
}
