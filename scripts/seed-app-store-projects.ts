/**
 * Importa un JSON de proyectos a Firestore (`prod/admin/projects` o tu raíz en env).
 *
 * Por defecto: `content/app-store-projects-seed.json` (App Store / iOS).
 * Otro archivo: `--file content/play-store-projects-seed.json`
 *
 * Requisitos:
 * - `.env.local` con `FIREBASE_ADMIN_SDK_KEY` (JSON en una línea) o `GOOGLE_APPLICATION_CREDENTIALS`
 * - `NEXT_PUBLIC_FIRESTORE_ROOT_COLLECTION` si no usas `prod`
 *
 * Uso: npx tsx scripts/seed-app-store-projects.ts
 *      npx tsx scripts/seed-app-store-projects.ts --file content/play-store-projects-seed.json
 *
 * Por defecto hace merge por id de documento (mismo `id` que en el JSON). Usa `--replace` para sobrescribir por completo cada doc.
 */

import * as fs from 'fs';
import * as path from 'path';
import { getFirestore } from 'firebase-admin/firestore';
import { tryGetAdminApp } from '@/lib/firebase-admin';
import {
  PROD_ADMIN_DOC_ID,
  PROD_COLLECTION,
  PROJECTS_SUBCOLLECTION,
} from '@/lib/firebase-paths';
import type { Project, ProjectCategory, ProjectLink } from '@/types';

function loadEnvLocal(): void {
  const p = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(p)) return;
  const text = fs.readFileSync(p, 'utf8');
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

type SeedRow = Omit<Project, 'id'> & { id: string };

const CATEGORIES: ProjectCategory[] = ['ios', 'android', 'web', 'flutter'];

function normalizeRow(raw: Record<string, unknown>): SeedRow | null {
  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : null;
  const title = typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : null;
  if (!id || !title) return null;
  const cat =
    typeof raw.category === 'string' && CATEGORIES.includes(raw.category as ProjectCategory)
      ? (raw.category as ProjectCategory)
      : 'ios';
  const links: ProjectLink[] = Array.isArray(raw.links)
    ? raw.links
        .filter((x): x is Record<string, unknown> => x !== null && typeof x === 'object')
        .map((x) => ({
          type: (['appStore', 'playStore', 'website', 'github', 'other'].includes(x.type as string)
            ? x.type
            : 'other') as ProjectLink['type'],
          url: typeof x.url === 'string' ? x.url : '',
          label: typeof x.label === 'string' ? x.label : undefined,
        }))
        .filter((l) => l.url.length > 0)
    : [];
  return {
    id,
    title,
    description: typeof raw.description === 'string' ? raw.description : '',
    category: cat,
    technologies: Array.isArray(raw.technologies)
      ? raw.technologies.filter((x): x is string => typeof x === 'string')
      : [],
    links,
    sortOrder: typeof raw.sortOrder === 'number' ? raw.sortOrder : undefined,
    experience: typeof raw.experience === 'string' ? raw.experience : undefined,
    platforms: Array.isArray(raw.platforms)
      ? raw.platforms.filter((x): x is string => typeof x === 'string')
      : undefined,
    tags: Array.isArray(raw.tags) ? raw.tags.filter((x): x is string => typeof x === 'string') : undefined,
    language: typeof raw.language === 'string' ? raw.language : undefined,
    releaseDate: typeof raw.releaseDate === 'string' && raw.releaseDate.trim() ? raw.releaseDate.trim() : undefined,
  };
}

function resolveSeedJsonPath(): string {
  const args = process.argv;
  const eq = args.find((a) => a.startsWith('--file='));
  if (eq) {
    const p = eq.slice('--file='.length).trim();
    return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  }
  const i = args.indexOf('--file');
  if (i >= 0 && args[i + 1]) {
    const p = args[i + 1].trim();
    return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  }
  return path.join(process.cwd(), 'content', 'app-store-projects-seed.json');
}

async function main(): Promise<void> {
  loadEnvLocal();
  const replace = process.argv.includes('--replace');
  const app = tryGetAdminApp();
  if (!app) {
    console.error('Firebase Admin no disponible: configura FIREBASE_ADMIN_SDK_KEY o GOOGLE_APPLICATION_CREDENTIALS.');
    process.exit(1);
  }
  const jsonPath = resolveSeedJsonPath();
  if (!fs.existsSync(jsonPath)) {
    console.error('No existe', jsonPath);
    process.exit(1);
  }
  const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as unknown[];
  if (!Array.isArray(parsed)) {
    console.error('El seed debe ser un array JSON.');
    process.exit(1);
  }
  const rows: SeedRow[] = [];
  for (const item of parsed) {
    if (item && typeof item === 'object') {
      const n = normalizeRow(item as Record<string, unknown>);
      if (n) rows.push(n);
    }
  }
  if (rows.length === 0) {
    console.error('No hay filas válidas en el seed.');
    process.exit(1);
  }

  const db = getFirestore(app);
  const col = db.collection(PROD_COLLECTION).doc(PROD_ADMIN_DOC_ID).collection(PROJECTS_SUBCOLLECTION);

  function toFirestorePayload(row: SeedRow): Record<string, unknown> {
    const { id, ...rest } = row;
    const payload: Record<string, unknown> = { id, title: rest.title, description: rest.description, category: rest.category, technologies: rest.technologies, links: rest.links };
    if (rest.sortOrder != null) payload.sortOrder = rest.sortOrder;
    if (rest.experience) payload.experience = rest.experience;
    if (rest.platforms?.length) payload.platforms = rest.platforms;
    if (rest.tags?.length) payload.tags = rest.tags;
    if (rest.language) payload.language = rest.language;
    if (rest.releaseDate) payload.releaseDate = rest.releaseDate;
    return payload;
  }

  let n = 0;
  for (const row of rows) {
    const id = row.id;
    const payload = toFirestorePayload(row);
    const ref = col.doc(id);
    if (replace) {
      await ref.set(payload);
    } else {
      await ref.set(payload, { merge: true });
    }
    n += 1;
    console.log(`OK ${n}/${rows.length}`, id);
  }
  console.log(`Listo: ${rows.length} documentos en ${PROD_COLLECTION}/${PROD_ADMIN_DOC_ID}/${PROJECTS_SUBCOLLECTION}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
