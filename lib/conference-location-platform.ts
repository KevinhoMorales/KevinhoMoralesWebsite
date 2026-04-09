import type { Conference, ConferenceLocationPlatform } from '@/types/conference';
import { CONFERENCE_LOCATION_PLATFORMS } from '@/types/conference';

export { CONFERENCE_LOCATION_PLATFORMS, type ConferenceLocationPlatform } from '@/types/conference';

export function isConferenceLocationPlatform(v: string | undefined): v is ConferenceLocationPlatform {
  return !!v && (CONFERENCE_LOCATION_PLATFORMS as readonly string[]).includes(v);
}

/** Línea de lugar: plataforma (virtual) + texto libre + ciudad · país. */
export function formatConferenceVenueLine(c: Conference, t: (key: string) => string): string | null {
  const bits: string[] = [];
  if (c.locationPlatform && isConferenceLocationPlatform(c.locationPlatform)) {
    bits.push(t(`conferenceLocationPlatform.${c.locationPlatform}`));
  }
  if (c.location?.trim()) bits.push(c.location.trim());
  const cc = [c.city, c.country].filter(Boolean).join(', ');
  if (cc) bits.push(cc);
  if (bits.length === 0) return null;
  return Array.from(new Set(bits)).join(' · ');
}
