# Kevin Morales - Personal Website

Modern developer portfolio built with Next.js 14, TypeScript, TailwindCSS, and shadcn/ui. Showcases projects, DevLokos podcast, Medium articles, conferences, and testimonials.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Components:** shadcn/ui
- **Data:** Firebase, YouTube Data API, Medium RSS
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Run Locally

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) **en Chrome, Safari o Firefox** (no uses el Simple Browser de VS Code; puede mostrar la página en blanco).

### Build for Production

```bash
npm run build
npm start
```

## Connecting APIs

### YouTube API (Podcast Episodes)

**Opción A: Firebase Remote Config (recomendado)**

1. En Firebase Console → Remote Config → Crear parámetro
2. Nombre: `youtube_api_key` (o `youtube-api-key`, `YOUTUBE_API_KEY`)
3. Valor: tu API key de YouTube
4. Publicar cambios
5. Configurar Firebase Admin SDK (ver abajo)

**Opción B: Variable de entorno (fallback)**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **YouTube Data API v3**
3. Create credentials (API key)
4. Add `YOUTUBE_API_KEY` to `.env.local`

El orden de prioridad: Remote Config → `YOUTUBE_API_KEY` en env.

### Formulario de Contacto (Web3Forms)

El formulario usa **Web3Forms**, no YouTube. Son configuraciones distintas:

| Parámetro | Uso | Origen |
|----------|-----|--------|
| `youtube_api_key` | Podcast / videos | Google Cloud Console |
| `web_3_form` | Formulario de contacto | [web3forms.com](https://web3forms.com) |

**Pasos para configurar:**

1. **Obtener access key:** Ir a [web3forms.com](https://web3forms.com) → crear cuenta o iniciar sesión → crear access key → copiar.

2. **Opción A – Firebase Remote Config:**
   - Firebase Console → Remote Config → Crear parámetro `web_3_form`
   - Valor: la access key de Web3Forms
   - Publicar cambios

3. **Opción B – Variable de entorno (sin Remote Config):**
   - Añadir `WEB3FORMS_ACCESS_KEY=tu_access_key` en `.env.local`

4. **Firebase Admin SDK** (si usas Remote Config):
   - Necesario para que el servidor lea `web_3_form` desde Remote Config
   - Ver sección "Firebase Admin SDK" más abajo

5. Reiniciar el servidor después de cambiar `.env.local`

### Firebase (Optional)

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Add a web app and copy the config
3. Add all `NEXT_PUBLIC_FIREBASE_*` variables to `.env.local`

**Firebase Admin SDK (para Remote Config en servidor)**

Para obtener la YouTube API key desde Remote Config en las API routes:

1. Firebase Console → Project Settings → Service accounts → Generate new private key
2. En Vercel: agregar `FIREBASE_ADMIN_SDK_KEY` con el JSON completo como string
3. En local: `GOOGLE_APPLICATION_CREDENTIALS=./service-account.json` o `FIREBASE_ADMIN_SDK_KEY='{"type":"service_account",...}'`
4. La cuenta de servicio debe tener permiso para leer Remote Config

Firebase se usa para: Remote Config (YouTube key), podcast cache, analytics.

### Medium RSS

No configuration needed. Articles are fetched from `https://medium.com/feed/@kevinhomorales`.

## Content Management

### Adding Projects

Edit `/content/projects.json`:

```json
{
  "id": "my-app",
  "title": "My App",
  "description": "App description",
  "technologies": ["Swift", "SwiftUI"],
  "category": "ios",
  "links": [
    { "type": "appStore", "url": "https://apps.apple.com/..." }
  ]
}
```

**Categories:** `ios` | `android` | `web` | `flutter`

### Updating Profile

Edit `/content/profile.json` with your bio, links, and social URLs.

### Updating Experience

Edit `/content/experience.json`. Set `current: true` for active roles.

### Conferences & talks

Talks are stored in **Firestore** and edited in the admin panel at `/admin/conferences` (not in `/content`). The `conferences.json` file stays empty as a placeholder for scripts.

### Importing LinkedIn Testimonials

```bash
npx tsx scripts/import-linkedin-testimonials.ts
```

Paste testimonials in the format:
```
"Quote text" - Author Name, Role at Company
https://linkedin.com/in/...
```

Press Ctrl+D to finish. New testimonials are merged into `/content/testimonials.json`.

## Scraping Current Site

To re-scrape kevinhomorales.com (Notion/Super.so) and regenerate content:

```bash
npm run scrape
```

This updates all JSON files in `/content`.

### Downloading Images

To scrape and download images from the site:

```bash
npm run scrape-images
```

Images are saved to `/public/images/`. A manifest is created at `/content/images-manifest.json`.

To limit downloads (e.g. first 50 images):

```bash
npx tsx scripts/scrape-images.ts --limit 50
```

After scraping images, update the profile to use local paths:

```bash
npm run update-profile-images
```

## Project Structure

```
/app          - Next.js App Router pages
/components   - React components
/lib          - Utilities (youtube, medium, firebase, content)
/content      - JSON content (profile, projects, etc.)
/scripts      - Scraping and import scripts
/types        - TypeScript types
/public       - Static assets
```

## SEO & Performance

- **Metadata:** OpenGraph, Twitter cards, canonical URLs
- **Sitemap:** Auto-generated at `/sitemap.xml`
- **Robots:** `/robots.txt` allows all, disallows `/api/`
- **Images:** Next.js Image with lazy loading, remote patterns for YouTube/Medium
- **Caching:** API routes use `Cache-Control` for edge caching
- **Dynamic imports:** Client components load data on demand

## Deployment (Vercel)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables: `YOUTUBE_API_KEY`, `WEB3FORMS_ACCESS_KEY` (o `web_3_form` en Remote Config), `FIREBASE_ADMIN_SDK_KEY`, Firebase config
4. Deploy

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npx tsx scripts/scrape-notion-site.ts` | Scrape current site |
| `npx tsx scripts/import-linkedin-testimonials.ts` | Import testimonials |

## License

Private - Kevin Morales
