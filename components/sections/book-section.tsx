'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, ExternalLink, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal } from '@/components/scroll-reveal'
import { useI18n } from '@/components/i18n/locale-provider'
import { BOOK_SECTION_PROMO_PATH } from '@/lib/book-cover-path'

export function BookSection() {
  const { t } = useI18n()
  const storeUrl = (process.env.NEXT_PUBLIC_BOOK_STORE_URL ?? '').trim()

  return (
    <section
      id="book"
      data-analytics-section="book"
      className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/20 to-background px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-12 xl:px-24"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_70%_20%,rgba(13,148,136,0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_70%_50%_at_70%_20%,rgba(13,148,136,0.08),transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal className="mb-8 sm:mb-10">
          <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary sm:mb-4 sm:text-sm">
            <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
            {t('bookSection.kicker')}
          </p>
          <h2 className="mb-3 text-balance text-2xl font-bold sm:text-3xl md:text-4xl">{t('bookSection.title')}</h2>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">{t('bookSection.subtitle')}</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12">
          <ScrollReveal variant="fade-right" delay={0.08} className="flex justify-center lg:justify-start">
            <Card className="w-full max-w-xl overflow-hidden border-border/50 bg-card/60 shadow-md">
              <CardContent className="p-0">
                <Image
                  src={BOOK_SECTION_PROMO_PATH}
                  alt={t('bookSection.promoAlt')}
                  width={1024}
                  height={682}
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 576px"
                  priority
                />
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal variant="fade-left" delay={0.12} className="space-y-5 sm:space-y-6">
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{t('bookSection.body')}</p>
            <ul className="space-y-2.5 text-sm text-muted-foreground sm:text-base">
              <li className="flex gap-2">
                <span className="mt-0.5 font-semibold text-primary" aria-hidden>
                  ·
                </span>
                {t('bookSection.bulletArchitecture')}
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 font-semibold text-primary" aria-hidden>
                  ·
                </span>
                {t('bookSection.bulletInterop')}
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 font-semibold text-primary" aria-hidden>
                  ·
                </span>
                {t('bookSection.bulletCareer')}
              </li>
            </ul>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
              {storeUrl ? (
                <Button asChild className="rounded-full">
                  <a href={storeUrl} target="_blank" rel="noopener noreferrer">
                    {t('bookSection.ctaStore')}
                    <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground sm:self-center">{t('bookSection.storeSoon')}</p>
              )}
              <Button variant="outline" asChild className="rounded-full">
                <Link href="/#connect">
                  <Mail className="mr-2 h-4 w-4" aria-hidden />
                  {t('bookSection.ctaContact')}
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
