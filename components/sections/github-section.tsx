'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/scroll-reveal'
import { useI18n } from '@/components/i18n/locale-provider'
import { ExternalLink, Github, Star } from 'lucide-react'
import type { GithubRepo } from '@/types'

type GithubSectionProps = {
  repos: GithubRepo[]
  profileUrl?: string
}

export function GithubSection({ repos, profileUrl }: GithubSectionProps) {
  const { t } = useI18n()

  if (repos.length === 0) return null

  return (
    <section
      id="github"
      data-analytics-section="github"
      className="py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24"
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-4 sm:mb-6">
          <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3 flex items-center gap-2">
            <Github className="h-4 w-4" aria-hidden />
            {t('githubSection.kicker')}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">{t('githubSection.title')}</h2>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t('githubSection.description')}
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6">
          {repos.map((repo, index) => (
            <StaggerItem key={repo.id} delay={index * 0.06} className="h-full">
              <Card className="h-full border-border/50 bg-card/50 transition-colors hover:border-primary/40">
                <CardContent className="flex h-full flex-col gap-2 p-2.5 sm:gap-3 sm:p-4 md:p-5">
                  <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                    <h3 className="line-clamp-1 text-xs font-semibold leading-snug sm:line-clamp-2 sm:text-sm md:text-base">{repo.name}</h3>
                    {repo.stars != null ? (
                      <span className="inline-flex shrink-0 items-center gap-0.5 text-[10px] text-muted-foreground sm:gap-1 sm:text-xs">
                        <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
                        {repo.stars}
                      </span>
                    ) : null}
                  </div>
                  <p className="hidden flex-1 text-sm text-muted-foreground leading-relaxed sm:block">{repo.description}</p>
                  <div className="flex justify-end pt-1 sm:pt-2">
                    <Button variant="ghost" size="sm" className="h-7 gap-1 px-1.5 text-[10px] sm:h-8 sm:px-2 sm:text-xs" asChild>
                      <a href={repo.url} target="_blank" rel="noopener noreferrer">
                        <span className="hidden xs:inline sm:inline">{t('githubSection.viewOnGithub')}</span>
                        <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {profileUrl ? (
          <ScrollReveal delay={0.12} className="mt-6 sm:mt-8 flex justify-center">
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
