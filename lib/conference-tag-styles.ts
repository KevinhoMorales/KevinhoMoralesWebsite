/**
 * Estilos de “bombitas” para tags de charlas: colores fijos para stacks conocidos
 * y una paleta rotativa por hash para el resto (siempre con fondo visible).
 */

const KNOWN_TAGS: Record<string, string> = {
  Android: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  iOS: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  Flutter: 'bg-sky-500/20 text-sky-600 dark:text-sky-400',
  Kotlin: 'bg-violet-500/20 text-violet-600 dark:text-violet-400',
  ML: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  AI: 'bg-rose-500/20 text-rose-600 dark:text-rose-400',
}

/** Misma intensidad que KNOWN_TAGS; una entrada por tag no listado. */
const TAG_PALETTE: string[] = [
  'bg-teal-500/20 text-teal-600 dark:text-teal-400',
  'bg-orange-500/20 text-orange-600 dark:text-orange-400',
  'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',
  'bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400',
  'bg-lime-500/20 text-lime-800 dark:text-lime-400',
  'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
  'bg-pink-500/20 text-pink-600 dark:text-pink-400',
  'bg-yellow-500/20 text-yellow-800 dark:text-yellow-400',
]

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function getConferenceTagClassName(tag: string): string {
  const key = tag.trim()
  if (!key) return TAG_PALETTE[0]
  const lower = key.toLowerCase()
  const entry = Object.entries(KNOWN_TAGS).find(([k]) => k.toLowerCase() === lower)
  if (entry) return entry[1]
  return TAG_PALETTE[hashString(key) % TAG_PALETTE.length]
}
