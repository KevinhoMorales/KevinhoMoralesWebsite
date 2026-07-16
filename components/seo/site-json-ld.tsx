import { getProfile, getSkills } from '@/lib/content';
import { BOOK_AMAZON_URL } from '@/lib/book-store-links';
import { SITE_URL } from '@/lib/site';

/** Person + WebSite + Book + Podcast for rich results and coherencia con Search / redes. */
export function SiteJsonLd() {
  const profile = getProfile();
  const skills = getSkills();
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

  const skillNames = skills.flatMap((cat) => cat.skills);

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: SITE_URL,
    image: imageUrl,
    jobTitle: profile.title,
    description,
    sameAs,
    knowsAbout: skillNames.length > 0 ? skillNames : undefined,
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

  const book = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: 'Dominando Kotlin, Swift y Dart',
    author: {
      '@type': 'Person',
      name: profile.name,
      url: SITE_URL,
    },
    inLanguage: 'es',
    url: BOOK_AMAZON_URL,
    description:
      'A practical Spanish-language guide to shipping solid mobile apps with Kotlin, Swift, and Dart.',
  };

  const podcast = sl?.youtube
    ? {
        '@context': 'https://schema.org',
        '@type': 'PodcastSeries',
        name: 'DevLokos',
        url: sl.youtube,
        author: {
          '@type': 'Person',
          name: profile.name,
          url: SITE_URL,
        },
        webFeed: sl.youtube,
        description: 'Podcast conversations with developers and tech leaders from Latin America.',
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(book) }} />
      {podcast ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(podcast) }} />
      ) : null}
    </>
  );
}
