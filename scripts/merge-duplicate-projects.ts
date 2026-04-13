/**
 * Fusiona en Firestore proyectos con el mismo título (normalizado): une links, tech, plataformas, etc.
 * y borra los documentos duplicados.
 *
 * Uso:
 *   npx tsx scripts/merge-duplicate-projects.ts           # solo plan
 *   npx tsx scripts/merge-duplicate-projects.ts --apply # escribe y borra
 *
 * Requisitos: misma config Admin que el seed (.env.local).
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
import { adminFetchProjects } from '@/lib/firestore-admin-content';

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

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ');
}

function mergeLinks(groups: ProjectLink[][]): ProjectLink[] {
  const seen = new Set<string>();
  const out: ProjectLink[] = [];
  for (const arr of groups) {
    for (const l of arr) {
      if (!l.url?.trim()) continue;
      const key = `${l.type}\t${l.url.trim()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ type: l.type, url: l.url.trim(), label: l.label });
    }
  }
  return out;
}

function uniqStrings(a: (string | undefined)[]): string[] {
  const s = new Set<string>();
  for (const x of a) {
    if (x?.trim()) s.add(x.trim());
  }
  return Array.from(s);
}

function mergeCategory(cats: ProjectCategory[]): ProjectCategory {
  const u = Array.from(new Set(cats));
  if (u.includes('flutter')) return 'flutter';
  if (u.includes('ios') && u.includes('android')) return 'ios';
  if (u.length === 1) return u[0];
  if (u.includes('ios')) return 'ios';
  if (u.includes('android')) return 'android';
  return 'web';
}

function pickCanonicalId(group: Project[]): string {
  const ids = group.map((g) => g.id);
  const preferred = ids.filter((id) => !/-android$/i.test(id));
  const pool = preferred.length ? preferred : ids;
  return Array.from(pool).sort((a, b) => a.length - b.length || a.localeCompare(b))[0];
}

function longerDescription(a: string, b: string): string {
  const ta = a.trim();
  const tb = b.trim();
  if (tb.length > ta.length) return tb;
  return ta;
}

function mergeProjectGroup(group: Project[]): Project {
  if (group.length === 1) return group[0];
  const canonicalId = pickCanonicalId(group);
  const anchor = group.find((p) => p.id === canonicalId) ?? group[0];

  let description = '';
  for (const p of group) description = longerDescription(description, p.description);

  const technologies = uniqStrings(group.flatMap((p) => p.technologies ?? []));
  const platforms = uniqStrings(group.flatMap((p) => p.platforms ?? []));
  const tags = uniqStrings(group.flatMap((p) => p.tags ?? []));
  const links = mergeLinks(group.map((p) => p.links ?? []));

  const sortOrders = group.map((p) => p.sortOrder).filter((n): n is number => n != null);
  const sortOrder = sortOrders.length ? Math.max(...sortOrders) : anchor.sortOrder;

  const langs = uniqStrings(group.map((p) => p.language));
  const language =
    langs.length === 0 ? undefined : langs.length === 1 ? langs[0] : langs.join(' · ');

  const rel = group
    .map((p) => p.releaseDate?.trim())
    .filter((s): s is string => Boolean(s))
    .sort()
    .pop();

  const image = group.map((p) => p.image?.trim()).find(Boolean);
  const experience = group.map((p) => p.experience?.trim()).find(Boolean);

  return {
    id: canonicalId,
    title: anchor.title,
    description: description || anchor.description,
    image,
    technologies,
    category: mergeCategory(group.map((p) => p.category)),
    links,
    sortOrder,
    experience,
    platforms: platforms.length ? platforms : undefined,
    tags: tags.length ? tags : undefined,
    language,
    releaseDate: rel,
  };
}

function toFirestorePayload(p: Project): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    technologies: p.technologies,
    links: p.links,
  };
  if (p.sortOrder != null) payload.sortOrder = p.sortOrder;
  if (p.image) payload.image = p.image;
  if (p.experience) payload.experience = p.experience;
  if (p.platforms?.length) payload.platforms = p.platforms;
  if (p.tags?.length) payload.tags = p.tags;
  if (p.language) payload.language = p.language;
  if (p.releaseDate) payload.releaseDate = p.releaseDate;
  return payload;
}

async function main(): Promise<void> {
  loadEnvLocal();
  const apply = process.argv.includes('--apply');
  const app = tryGetAdminApp();
  if (!app) {
    console.error('Firebase Admin no disponible.');
    process.exit(1);
  }

  const projects = await adminFetchProjects();
  if (!projects?.length) {
    console.error('No hay proyectos en Firestore.');
    process.exit(1);
  }

  const byTitle = new Map<string, Project[]>();
  for (const p of projects) {
    const k = normalizeTitle(p.title);
    const arr = byTitle.get(k) ?? [];
    arr.push(p);
    byTitle.set(k, arr);
  }

  const merges: { key: string; merged: Project; removeIds: string[] }[] = [];
  for (const [key, arr] of Array.from(byTitle.entries())) {
    if (arr.length < 2) continue;
    const merged = mergeProjectGroup(arr);
    const removeIds = arr.map((p) => p.id).filter((id) => id !== merged.id);
    merges.push({ key, merged, removeIds });
  }

  if (merges.length === 0) {
    console.log('No hay títulos duplicados.');
    return;
  }

  console.log(`Grupos a fusionar: ${merges.length}`);
  for (const m of merges) {
    console.log('\n---', m.merged.title, `(${m.key})`);
    console.log('  canonical id:', m.merged.id);
    console.log('  borrar docs:', m.removeIds.join(', ') || '(ninguno)');
    console.log('  links:', m.merged.links.length, '| tech:', m.merged.technologies.join(', '));
  }

  if (!apply) {
    console.log('\nDry-run. Añade --apply para escribir en Firestore.');
    return;
  }

  const db = getFirestore(app);
  const col = db.collection(PROD_COLLECTION).doc(PROD_ADMIN_DOC_ID).collection(PROJECTS_SUBCOLLECTION);

  for (const m of merges) {
    const payload = toFirestorePayload(m.merged);
    await col.doc(m.merged.id).set(payload);
    console.log('OK set', m.merged.id);
    for (const rid of m.removeIds) {
      await col.doc(rid).delete();
      console.log('OK delete', rid);
    }
  }
  console.log('\nListo.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
