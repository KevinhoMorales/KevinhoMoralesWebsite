/**
 * Updates profile.json to use local image paths from images-manifest.json
 * Run after: npm run scrape-images
 */

import * as fs from 'fs';
import * as path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const PROFILE_PATH = path.join(CONTENT_DIR, 'profile.json');
const MANIFEST_PATH = path.join(CONTENT_DIR, 'images-manifest.json');

interface ManifestEntry {
  originalUrl: string;
  localPath: string;
  index: number;
}

function main(): void {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.log('No images-manifest.json found. Run npm run scrape-images first.');
    return;
  }

  const manifest: ManifestEntry[] = JSON.parse(
    fs.readFileSync(MANIFEST_PATH, 'utf-8')
  );
  const profile = JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf-8'));

  const urlToLocal = new Map(manifest.map((m) => [m.originalUrl, m.localPath]));

  const localImages: string[] = [];
  for (const url of profile.images || []) {
    const local = urlToLocal.get(url);
    if (local) localImages.push(local);
    else localImages.push(url);
  }

  if (localImages.length > 0) {
    profile.images = localImages;
    profile.profileImageLocal = localImages[1] || localImages[0];
    fs.writeFileSync(PROFILE_PATH, JSON.stringify(profile, null, 2));
    console.log(`Updated profile with ${localImages.length} local image paths.`);
    console.log('Profile image:', profile.profileImageLocal);
  }
}

main();
