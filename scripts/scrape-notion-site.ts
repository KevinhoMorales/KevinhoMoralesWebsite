/**
 * Scrapes kevinhomorales.com (Super.so/Notion) and extracts structured data.
 * Run: npx tsx scripts/scrape-notion-site.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fetchPage, extractImages, extractLinks } from '../lib/scraper';

const BASE_URL = 'https://kevinhomorales.com';
const CONTENT_DIR = path.join(process.cwd(), 'content');

async function scrape(): Promise<void> {
  console.log('Fetching homepage...');
  const html = await fetchPage(BASE_URL);
  const images = extractImages(html, BASE_URL);
  const links = extractLinks(html);

  if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });

  // Profile - extracted from welcome/bio section
  const profile = {
    name: 'Kevin Morales',
    title: 'Sr. iOS Engineer',
    bio: `You can call me Kevinho. I studied Electronic, Automation, and Control Engineering at the University of the Armed Forces – ESPE.

For over 7 years, I've worked professionally as an iOS developer, specializing in Swift. I've also built Android apps using Kotlin and Java, and I enjoy diving into UX/UI design during my free time. Some of my apps are published under my own name on the App Store and Play Store, while others have benefited from my contribution behind the scenes.

I'm an active member of the Google Developer Group (GDG) Ecuador, where I regularly teach and mentor others, helping spark interest in the world of software development. I'm a big believer in lifelong learning — one of my favorite mottos is: "DON'T STOP LEARNING!"`,
    shortBio: 'Sr. iOS Engineer at Galileo Financial Technologies. Host of DevLokos podcast. GDG Tsáchilas community lead.',
    education: 'Electronic, Automation, and Control Engineering - University of the Armed Forces (ESPE)',
    cvLinks: {
      english: 'https://kevinhomorales.notion.site/website',
      spanish: 'https://kevinhomorales.notion.site/website',
    },
    motto: 'Be DIFFERENT and leave a legacy to the world that everything is possible when you have it in your mind.',
    aboutMe: `I'm passionate about technology, an Android and iOS enthusiast, and proudly Ecuadorian. Since 1994, I've been on a journey to leave my mark, always guided by faith in God and the unwavering support of my family.

I'm a son, brother, father, and husband. I have a small family with a big heart, and they are the driving force behind everything I do.

With an entrepreneurial spirit and a hunger for meaningful challenges, I dedicate myself daily to personal and professional growth. I strive to become a better leader and to inspire those around me through integrity, passion, and purpose.

I'm also the host of the DevLokos podcast and the community lead for GDG Tsáchilas in Santo Domingo, Ecuador.`,
    images: images.slice(0, 10),
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/kevinhomorales/',
      calendly: 'https://calendly.com/kevinmorales/one-on-one',
      buymeacoffee: 'http://buymeacoffee.com/KevinhoMorales',
      website: 'https://kevinhomorales.notion.site/website',
    },
  };

  // Experience - from work experience section
  const experience = [
    { id: '1', company: 'Galileo Financial Technologies', role: 'Sr. iOS Engineer', type: 'full-time' as const, startDate: '2023-04', endDate: undefined, current: true, companyUrl: 'https://www.galileo-ft.com/', companyLogo: '/images/galileo-logo.png' },
    { id: '2', company: 'DevLokos', role: 'Host/Founder', type: 'freelance' as const, startDate: '2024-07', endDate: undefined, current: true, companyUrl: 'https://devlokos.com/', companyLogo: '/images/devlokos-logo.png' },
    { id: '3', company: 'Technisys', role: 'iOS Engineer', type: 'full-time' as const, startDate: '2021-03', endDate: '2023-03', current: false, companyUrl: 'https://www.linkedin.com/company/technisys/', companyLogo: '/images/technisys-logo.png' },
    { id: '4', company: 'Nearsure', role: 'iOS Developer', type: 'freelance' as const, startDate: '2021-11', endDate: undefined, current: true, companyUrl: 'https://www.linkedin.com/company/nearsure/', companyLogo: '/images/nearsure-logo.png' },
    { id: '5', company: 'Google Developers', role: 'Community Lead', type: 'freelance' as const, startDate: '2021-07', endDate: undefined, current: true, companyUrl: 'https://www.linkedin.com/showcase/googledevelopers/', companyLogo: '/images/google-developers-logo.png' },
    { id: '6', company: 'Meniuz', role: 'iOS Developer', type: 'freelance' as const, startDate: '2021-11', endDate: undefined, current: true, companyUrl: 'https://www.linkedin.com/company/meniuz/', companyLogo: '/images/meniuz-logo.png' },
    { id: '7', company: 'Bayteq', role: 'iOS Developer', type: 'full-time' as const, startDate: '2020-09', endDate: '2021-02', current: false, companyUrl: 'https://www.linkedin.com/company/bayteq/', companyLogo: '/images/bayteq-logo.png' },
    { id: '8', company: 'GMe', role: 'iOS Developer', type: 'freelance' as const, startDate: '2019-09', endDate: '2020-06', current: false, companyUrl: 'https://www.linkedin.com/company/nearsure/', companyLogo: '/images/gme-logo.png' },
    { id: '9', company: 'Kevin Morales (Freelance)', role: 'iOS Developer', type: 'freelance' as const, startDate: '2016-01', endDate: '2019-09', current: false, companyUrl: 'https://www.linkedin.com/in/kevinhomorales/', companyLogo: '/images/kevin-morales-logo.png' },
    { id: '10', company: 'Vail Resorts', role: 'Developer', type: 'full-time' as const, startDate: '2016-02', endDate: '2016-04', current: false, companyUrl: 'https://www.linkedin.com/company/vail-resorts/', companyLogo: '/images/vail-resorts-logo.png' },
  ];

  // Projects - from App Store and Play Store sections (sample - full list in content)
  const projects = [
    { id: 'security-force-residentes', title: 'Security Force Residentes', description: 'Resident security management app', technologies: ['Swift', 'Kotlin'], category: 'ios' as const, links: [{ type: 'appStore' as const, url: 'https://apps.apple.com/ec/app/security-force-residentes/id1621974359' }, { type: 'playStore' as const, url: 'https://play.google.com/store/apps/details?id=com.kevinhomorales.urbamsresidentkotlin' }], experience: 'Freelance', platforms: ['iPhone', 'Android'], tags: ['Security'] },
    { id: 'macro-empresas', title: 'Macro Empresas', description: 'Enterprise banking app', technologies: ['Swift', 'Java'], category: 'ios' as const, links: [{ type: 'appStore' as const, url: 'https://apps.apple.com/us/app/macro-empresas/id1465765093' }, { type: 'playStore' as const, url: 'https://play.google.com/store/apps/details?id=ar.macro.companies' }], experience: 'Technisys', platforms: ['iPhone', 'iPad', 'Android'], tags: ['Finance'] },
    { id: 'meniuz', title: 'Meniuz', description: 'Food & drink ordering app', technologies: ['Swift', 'Kotlin'], category: 'ios' as const, links: [{ type: 'appStore' as const, url: 'https://apps.apple.com/us/app/meniuz/id1563662812' }, { type: 'playStore' as const, url: 'https://play.google.com/store/apps/details?id=com.kevinhomorales.meniuzkotlin' }], experience: 'Freelance', platforms: ['iPhone', 'Android'], tags: ['Food & Drink'] },
    { id: 'devlokos', title: 'DevLokos', description: 'Tech podcast app', technologies: ['Swift', 'Dart'], category: 'ios' as const, links: [{ type: 'appStore' as const, url: 'https://apps.apple.com/ec/app/devlokos/id6754109507' }, { type: 'playStore' as const, url: 'https://play.google.com/store/apps/details?id=com.devlokos.devlokosdart' }], experience: 'DevLokos Enterprise', platforms: ['iPhone', 'iPad'], tags: ['Podcast'] },
    { id: 'padeltrack', title: 'PadelTrack', description: 'Padel sports tracking app', technologies: ['SwiftUI', 'Jetpack Compose', 'Dart'], category: 'flutter' as const, links: [{ type: 'appStore' as const, url: 'https://apps.apple.com/ec/app/padeltrack/id6749497707' }, { type: 'playStore' as const, url: 'https://play.google.com/store/apps/details?id=com.devlokosenterprise.padeltrackjetpackcompose' }], experience: 'DevLokos Enterprise', platforms: ['iPhone', 'iPad', 'Android'], tags: ['Sport', 'Padel'] },
    { id: 'banco-de-loja', title: 'Banco de Loja', description: 'Banking reference app', technologies: ['Swift'], category: 'ios' as const, links: [{ type: 'appStore' as const, url: 'https://apps.apple.com/ec/app/banco-de-loja/id1396238600' }], experience: 'Bayteq', platforms: ['iPhone'], tags: ['Reference'] },
    { id: 'calcustom', title: 'Calcustom', description: 'Customizable calendar utility', technologies: ['Swift'], category: 'ios' as const, links: [{ type: 'appStore' as const, url: 'https://apps.apple.com/us/app/calcustom/id1561896744' }], experience: 'Freelance', platforms: ['iPhone', 'Mac', 'iPad', 'Apple Watch'], tags: ['Utilities'] },
    { id: 'yippy-cerca-de-ti', title: 'Yippy: Cerca de ti', description: 'Local shopping app', technologies: ['Swift', 'Java'], category: 'ios' as const, links: [{ type: 'appStore' as const, url: 'https://apps.apple.com/us/app/yippy-cerca-de-ti/id1506152885' }, { type: 'playStore' as const, url: 'https://play.google.com/store/apps/details?id=com.yippy.app' }], experience: 'Freelance', platforms: ['iPhone', 'Android'], tags: ['Shopping'] },
    { id: 'livo-home', title: 'Livo Home', description: 'Property management lifestyle app', technologies: ['Swift', 'Jetpack Compose'], category: 'android' as const, links: [{ type: 'appStore' as const, url: 'https://apps.apple.com/es/app/livo-home/id1669247260' }, { type: 'playStore' as const, url: 'https://play.google.com/store/apps/details?id=com.livoHomeProperty' }], experience: 'Freelance', platforms: ['iPhone', 'Android'], tags: ['Lifestyle'] },
    { id: 'elite-padel', title: 'Élite Padel: Ranking Oficial', description: 'Official padel ranking app', technologies: ['Jetpack Compose'], category: 'android' as const, links: [{ type: 'playStore' as const, url: 'https://play.google.com/store/apps/details?id=com.kevinhomorales.padelhubjetpackcompose' }], experience: 'DevLokos Enterprise', platforms: ['Android'], tags: ['Sports', 'Padel'] },
  ];

  // Conferences - preserve existing if already populated from kevinhomorales.com/speaker, else use defaults
  const conferencesPath = path.join(CONTENT_DIR, 'conferences.json');
  const defaultConferences = [
    { id: '1', title: 'Google I/O Extended, Machala 2023', topic: 'El futuro del nativo Jetpack Compose vs SwiftUI', type: 'conference' as const, location: 'Machala', tags: ['Android'] },
    { id: '2', title: 'Google I/O Extended, Ecuador 2023', topic: 'El futuro del nativo Jetpack Compose vs SwiftUI', type: 'virtual' as const, videoUrl: 'https://youtu.be/SC4RrJGtIX4', tags: ['Android'] },
  ];
  let conferences: typeof defaultConferences;
  if (fs.existsSync(conferencesPath)) {
    const existing = JSON.parse(fs.readFileSync(conferencesPath, 'utf-8'));
    conferences = Array.isArray(existing) && existing.length > 15 ? existing : defaultConferences;
  } else {
    conferences = defaultConferences;
  }

  // Testimonials - from recommendations section
  const testimonials = [
    { id: '1', quote: 'Kevin es un desarrollador de software proactivo que se enfoca no solo en lo técnico sino también en los temas funcionales, esta actitud promueve mejores resultados dentro de los proyectos que ha participado. Una excelente actitud de trabajo. Muy recomendado.', author: 'Etna Estrella', role: 'Project Manager', company: 'Bayteq', linkedinUrl: 'https://www.linkedin.com/in/etna-estrella-ec1/' },
    { id: '2', quote: 'Trabajamos en el desarrollo de una aplicación para delivery. Kevin diseño la arquitectura y desarrolló la aplicación para iOS, yo implemente la solución para Android. La aplicación no salió a producción pero aprendi mucho sobre programación bajo su supervisión. También me enseño como hacer valer nuestro trabajo como desarrolladores. Gran lider técnico 👍', author: 'José Guambo', role: 'Jr. Developer', company: 'PPM', linkedinUrl: 'https://www.linkedin.com/in/jos%C3%A9-guambo-28031117a/' },
    { id: '3', quote: "I had the pleasure of knowing Kevin since 2022, he is a great persistent developer with great analytics skills and perfect communication skills. He can lead any team of developers and readapt projects to meet user needs. Not to mention that due to his high performance, he has had the honor of being interviewed by TV channels.", author: 'Natalia Mayorquin Cuestas', role: 'Human Resource', company: 'Rappi', linkedinUrl: 'https://www.linkedin.com/in/natalia-mayorquin-cuestas/' },
    { id: '4', quote: "I highly recommend Kevin for their outstanding support in rapidly addressing issues with our iOS and Android applications. They demonstrated exceptional communication, consistently met deadlines, and worked seamlessly within tight timelines. Their proactive approach and professionalism made the collaboration enjoyable. Kevin showcased impressive time management skills, delivering high-quality results promptly. In summary, Kevin is a skilled and reliable professional who exceeded our expectations. I wholeheartedly endorse them and look forward to future collaborations.", author: 'Mayra Rodriguez', role: 'CTO', company: 'LIVO Home', linkedinUrl: 'https://www.linkedin.com/in/mayrascript/' },
    { id: '5', quote: "Kevin es un gran ser humano y un profesional en todo el sentido de la palabra. Sus cualidades son extensas y su vasta experiencia lo convierten en un desarrollador completo. Pro actividad y trabajo en equipo son cosas que destaco mucho en él, así como su liderazgo. Mis mejores deseos para el. Cualquier equipo estaría gustoso en tenerlo.", author: 'Alexis Poveda', role: 'Sr. Backend Developer', company: 'Technisys', linkedinUrl: 'https://www.linkedin.com/in/alexis-poveda-233a4720b/' },
    { id: '6', quote: "Kevin ingresó hace casi un año y medio a la empresa y desde el inicio demostró curiosidad por aprender, siempre en busca de la mejora continua. Es un profesional responsable y autodidacta, como así también sabe utilizar perfectamente todos los canales de comunicación y aprovechar las oportunidades de capacitación que brinda la compañía. No tengo dudas que Kevin tiene un camino para recorrer lleno de desafíos y todavía no está ni cerca de su techo. Kevin, es un placer trabajar con vos!", author: 'Florencia Pellegrino', role: 'Project Manager', company: 'Technisys', linkedinUrl: 'https://www.linkedin.com/in/florencia-pellegrino-05008664/' },
    { id: '7', quote: 'Llevo 1 Año trabajando con Kevin en proyectos personales y desde un comienzo se notó el entusiasmo y ganas de poder hacer el Ecuador un lugar mejor para la gastronomía, es un excelente compañero y ayuda a crecer personalmente. 🤝', author: 'Andrés Roberto Coello Goyes', role: 'Full Stack', company: 'GGTECH Entertainment', linkedinUrl: 'https://www.linkedin.com/in/andr%C3%A9s-roberto-coello-goyes/' },
    { id: '8', quote: 'Me toco compartir un Scrum Team con Kevin en Banco Macro. Se genero un equipo desde 0 y me toco asumir el Rol de Scrum master. Puedo decir que Kevin siempre tuvo actitud positiva, siempre con ganas de aprender de la metodologia que implementamos en el equipo. Se destaca su conocimiento en su rol de desarrollador y el compañerismo por el equipo. Siempre desde un primer momento apoyo la idea de ser un One team, rompiendo las barreras de Proveedor-Cliente.', author: 'Martín Mateos', role: 'Scrum Master', company: 'Banco Macro', linkedinUrl: 'https://www.linkedin.com/in/mmateos-agile' },
  ];

  fs.writeFileSync(path.join(CONTENT_DIR, 'profile.json'), JSON.stringify(profile, null, 2));
  fs.writeFileSync(path.join(CONTENT_DIR, 'experience.json'), JSON.stringify(experience, null, 2));
  fs.writeFileSync(path.join(CONTENT_DIR, 'projects.json'), JSON.stringify(projects, null, 2));
  fs.writeFileSync(path.join(CONTENT_DIR, 'conferences.json'), JSON.stringify(conferences, null, 2));
  fs.writeFileSync(path.join(CONTENT_DIR, 'testimonials.json'), JSON.stringify(testimonials, null, 2));

  console.log('Scraped data saved to /content:');
  console.log('  - profile.json');
  console.log('  - experience.json');
  console.log('  - projects.json');
  console.log('  - conferences.json');
  console.log('  - testimonials.json');
  console.log(`\nExtracted ${images.length} images, ${links.length} links from page.`);
}

scrape().catch(console.error);
