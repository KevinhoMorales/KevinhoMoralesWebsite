/**
 * Import LinkedIn testimonials into content/testimonials.json
 * Run: npx tsx scripts/import-linkedin-testimonials.ts
 *
 * Usage:
 * 1. Copy testimonials from LinkedIn (recommendations section)
 * 2. Paste into the TESTIMONIALS_INPUT below or pass via stdin
 * 3. Run the script - it will parse and merge with existing testimonials
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const TESTIMONIALS_FILE = path.join(CONTENT_DIR, 'testimonials.json');

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company?: string;
  linkedinUrl?: string;
  avatar?: string;
}

// Example format from LinkedIn:
// "Quote text here" - Author Name, Role at Company
// https://linkedin.com/in/...

function parseTestimonialBlock(block: string): Testimonial | null {
  const lines = block.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return null;

  const quoteMatch = lines[0].match(/^["']?(.+?)["']?\s*[-–—]\s*(.+)$/);
  if (!quoteMatch) return null;

  const [, quote, authorPart] = quoteMatch;
  const linkedinUrl = lines.find((l) => l.includes('linkedin.com'));
  const nameRoleMatch = authorPart.match(/^(.+?),\s*(.+?)(?:\s+at\s+(.+))?$/i) ||
    authorPart.match(/^(.+?)\s+[-–]\s*(.+)$/);

  let author = authorPart;
  let role = '';
  let company = '';

  if (nameRoleMatch) {
    author = nameRoleMatch[1].trim();
    role = (nameRoleMatch[2] || '').trim();
    company = (nameRoleMatch[3] || '').trim();
  }

  return {
    id: `linkedin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    quote: quote.trim(),
    author,
    role,
    company: company || undefined,
    linkedinUrl: linkedinUrl || undefined,
  };
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function main(): Promise<void> {
  let input = '';

  if (process.stdin.isTTY) {
    console.log('Paste LinkedIn testimonials (one per block). End with Ctrl+D or empty line twice:\n');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const lines: string[] = [];
    for await (const line of rl) lines.push(line);
    input = lines.join('\n');
  } else {
    input = await new Promise<string>((resolve) => {
      let data = '';
      process.stdin.on('data', (chunk) => (data += chunk));
      process.stdin.on('end', () => resolve(data));
    });
  }

  const blocks = input.split(/\n\s*\n/).filter((b) => b.trim());
  const newTestimonials: Testimonial[] = [];

  for (const block of blocks) {
    const t = parseTestimonialBlock(block);
    if (t) newTestimonials.push(t);
  }

  let existing: Testimonial[] = [];
  if (fs.existsSync(TESTIMONIALS_FILE)) {
    existing = JSON.parse(fs.readFileSync(TESTIMONIALS_FILE, 'utf-8'));
  }

  const merged = [...existing];
  for (const t of newTestimonials) {
    const exists = merged.some((e) => e.quote === t.quote || (e.author === t.author && e.quote.slice(0, 50) === t.quote.slice(0, 50)));
    if (!exists) {
      t.id = `linkedin-${slugify(t.author)}-${Date.now().toString(36)}`;
      merged.push(t);
    }
  }

  if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });
  fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(merged, null, 2));

  console.log(`\nImported ${newTestimonials.length} new testimonials. Total: ${merged.length}`);
  console.log(`Saved to ${TESTIMONIALS_FILE}`);
}

main().catch(console.error);
