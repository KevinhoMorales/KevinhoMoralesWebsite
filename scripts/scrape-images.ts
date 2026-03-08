/**
 * Scrapes images from kevinhomorales.com (Notion/Super.so) and downloads them.
 * Run: npx tsx scripts/scrape-images.ts
 * Run with limit: npx tsx scripts/scrape-images.ts --limit 50
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  fetchPage,
  extractImages,
  downloadImage,
  getImageExtension,
  slugifyForFilename,
} from '../lib/scraper';

const BASE_URL = 'https://kevinhomorales.com';
const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
const MANIFEST_PATH = path.join(process.cwd(), 'content', 'images-manifest.json');

function getLimit(): number | null {
  const idx = process.argv.indexOf('--limit');
  if (idx !== -1 && process.argv[idx + 1]) {
    return parseInt(process.argv[idx + 1], 10) || null;
  }
  return null;
}

async function scrapeImages(): Promise<void> {
  const limit = getLimit();

  console.log('Fetching kevinhomorales.com...');
  const html = await fetchPage(BASE_URL);
  let imageUrls = extractImages(html, BASE_URL);

  if (limit) {
    imageUrls = imageUrls.slice(0, limit);
    console.log(`Found ${imageUrls.length} images (limited to ${limit}).`);
  } else {
    console.log(`Found ${imageUrls.length} images.`);
  }

  if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
    fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
  }

  const manifest: { originalUrl: string; localPath: string; index: number }[] = [];
  let downloaded = 0;
  let failed = 0;

  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    const ext = getImageExtension(url);
    const filename = `notion-${String(i + 1).padStart(3, '0')}-${slugifyForFilename(url.slice(-30))}.${ext}`;
    const outputPath = path.join(PUBLIC_IMAGES_DIR, filename);
    const localPath = `/images/${filename}`;

    process.stdout.write(`  [${i + 1}/${imageUrls.length}] ${filename}... `);

    const success = await downloadImage(url, outputPath);
    if (success) {
      manifest.push({ originalUrl: url, localPath, index: i + 1 });
      downloaded++;
      console.log('OK');
    } else {
      failed++;
      console.log('FAILED');
    }

    await new Promise((r) => setTimeout(r, 200));
  }

  const contentDir = path.join(process.cwd(), 'content');
  if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(`\nDone. Downloaded ${downloaded} images, ${failed} failed.`);
  console.log(`Images saved to: ${PUBLIC_IMAGES_DIR}`);
  console.log(`Manifest: ${MANIFEST_PATH}`);
}

scrapeImages().catch(console.error);
