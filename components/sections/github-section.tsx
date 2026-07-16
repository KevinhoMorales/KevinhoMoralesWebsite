'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal } from '@/components/scroll-reveal'
import { useI18n } from '@/components/i18n/locale-provider'
import { SECTION_PADDING } from '@/lib/section-layout'
import { cn } from '@/lib/utils'
import { ExternalLink, Github, Star } from 'lucide-react'
import type { GithubRepo } from '@/types'

type GithubSectionProps = {
  repos: GithubRepo[]
  profileUrl?: string
}

function languageTone(language: string): string {
  const map: Record<string, string> = {
    TypeScript: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    Swift: 'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300',
    Kotlin: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
    Dart: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
    JavaScript: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  }
  return map[language] ?? 'border-border/60 bg-muted/50 text-muted-foreground'
}

function GithubRepoCard({ repo, viewLabel }: { repo: GithubRepo; viewLabel: string }) {
  return (
    <Card
      className={cn(
        'group/card relative h-full gap-0 overflow-hidden border-border/50 bg-card/65 py-0 shadow-sm backdrop-blur-sm',
        'transition-[transform,box-shadow,border-color] duration-300',
        'hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg hover:shadow-primary/5'
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent opacity-80"
        aria-hidden
      />
      <CardContent className="flex h-full min-h-[7.5rem] flex-col gap-2 p-3 sm:min-h-[8rem] sm:gap-2.5 sm:p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
              <Github className="h-4 w-4" aria-hidden />
            </div>
            <h3 className="line-clamp-1 text-sm font-semibold leading-tight tracking-tight group-hover/card:text-primary">
              {repo.name}
            </h3>
          </div>
          {repo.stars != null ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-border/50 bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
              <Star className="h-3 w-3 fill-amber-400/80 text-amber-500" aria-hidden />
              {repo.stars}
            </span>
          ) : null}
        </div>

        {repo.language ? (
          <Badge
            variant="outline"
            className={cn('w-fit rounded-full px-2 py-0 text-[10px] font-medium', languageTone(repo.language))}
          >
            {repo.language}
          </Badge>
        ) : null}

        <p className="line-clamp-2 min-h-[2.25rem] flex-1 text-xs leading-snug text-muted-foreground sm:min-h-[2.5rem] sm:text-[13px] sm:leading-relaxed">
          {repo.description}
        </p>

        <div className="mt-auto flex items-center justify-end border-t border-border/40 pt-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary transition-colors group-hover/card:text-primary/80 sm:text-xs">
            {viewLabel}
            <ExternalLink className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function GithubSection({ repos, profileUrl }: GithubSectionProps) {
  const { t } = useI18n()

  const topRepos = useMemo(
    () => [...repos].sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0)),
    [repos]
  )
  const loop = useMemo(() => [...topRepos, ...topRepos], [topRepos])

  if (topRepos.length === 0) return null

  return (
    <section
      id="github"
      data-analytics-section="github"
      className={cn('overflow-x-hidden', SECTION_PADDING)}
    >
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-3 sm:mb-5">
          <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary sm:mb-3 sm:text-sm">
            <Github className="h-4 w-4" aria-hidden />
            {t('githubSection.kicker')}
          </p>
          <h2 className="text-2xl font-bold text-balance sm:text-3xl md:text-4xl">{t('githubSection.title')}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-3 sm:text-base">
            {t('githubSection.description')}
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={0.08}>
          <div
            className={cn(
              'group/carousel relative -mx-4 sm:-mx-6 md:-mx-8',
              'motion-reduce:overflow-x-auto motion-reduce:snap-x motion-reduce:snap-mandatory motion-reduce:pb-2 motion-reduce:px-1'
            )}
          >
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent sm:w-14"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent sm:w-14"
              aria-hidden
            />

            <div className="overflow-hidden py-1 motion-reduce:overflow-x-auto motion-reduce:snap-x">
              <div
                className={cn(
                  'flex w-max items-stretch gap-3 sm:gap-4',
                  'motion-safe:animate-testimonials-marquee motion-safe:group-hover/carousel:[animation-play-state:paused]'
                )}
              >
                {loop.map((repo, index) => (
                  <article
                    key={`${repo.id}-${index}`}
                    className="motion-reduce:snap-start motion-reduce:snap-always w-[220px] shrink-0 sm:w-[252px] md:w-[272px]"
                  >
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'group block h-full rounded-xl outline-none',
                        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                      )}
                      aria-label={`${repo.name} — ${t('githubSection.viewOnGithub')}`}
                    >
                      <GithubRepoCard repo={repo} viewLabel={t('githubSection.viewOnGithub')} />
                    </a>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {profileUrl ? (
          <ScrollReveal delay={0.12} className="mt-5 flex justify-center sm:mt-6">
            <Button variant="outline" size="default" className="h-9 gap-2 sm:h-10" asChild>
              <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" aria-hidden />
                {t('githubSection.viewProfile')}
              </a>
            </Button>
          </ScrollReveal>
        ) : null}
      </div>
    </section>
  )
}
