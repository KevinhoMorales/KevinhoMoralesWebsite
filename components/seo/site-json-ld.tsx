import { getProfile } from '@/lib/content';
import { SITE_URL } from '@/lib/site';

/** Person + WebSite para rich results y coherencia con Search / redes. */
export function SiteJsonLd() {
  const profile = getProfile();
  const sl = profile.socialLinks;
  const sameAs = [
    sl?.linkedin,
    sl?.twitter,
    sl?.github,
    sl?.youtube,
    sl?.medium,
    sl?.instagram,
    sl?.sessionize,
  ].filter((u): u is string => Boolean(u));

  const profileImg = profile.profileImageLocal ?? '/images/profile-main.png';
  const imageUrl = profileImg.startsWith('http') ? profileImg : `${SITE_URL}${profileImg}`;

  const description = profile.shortBio ?? profile.bio.slice(0, 280);

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: SITE_URL,
    image: imageUrl,
    jobTitle: profile.title,
    description,
    sameAs,
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${profile.name}`,
    url: SITE_URL,
    description,
    publisher: {
      '@type': 'Person',
      name: profile.name,
      url: SITE_URL,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
    </>
  );
}
