export const CONFERENCE_LOCATION_PLATFORMS = [
  'google_meet',
  'zoom',
  'bevy',
  'twitch',
  'youtube',
  'streamyard',
  'gather',
  'discord',
] as const;

export type ConferenceLocationPlatform = (typeof CONFERENCE_LOCATION_PLATFORMS)[number];

export interface Conference {
  id: string;
  title: string;
  topic?: string;
  type: 'virtual_conference' | 'conference' | 'virtual_talk' | 'talk';
  /** ISO 8601; orden de lista: más reciente subida primero. */
  createdAt?: string;
  /** ISO 8601; última edición en admin (desempate cuando la fecha del evento coincide). */
  updatedAt?: string;
  date?: string;
  /** Plataforma (virtual): selector en admin; mutuamente excluyente con `location` libre en presencial. */
  locationPlatform?: ConferenceLocationPlatform;
  location?: string;
  city?: string;
  country?: string;
  audience?: number;
  videoUrl?: string;
  eventUrl?: string;
  tags?: string[];
  images?: string[];
}
