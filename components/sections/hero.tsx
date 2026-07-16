'use client'

import Image from 'next/image'
import { useState } from 'react'
import { TypeAnimation } from 'react-type-animation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ArrowDown, MessageCircle, FileText } from 'lucide-react'
import { useI18n } from '@/components/i18n/locale-provider'
import { handleHomeHashLinkClick } from '@/lib/section-scroll'
import { HeroCredentialsStrip } from '@/components/hero-credentials-strip'
import type { Profile } from '@/types'
import type { Achievement } from '@/types'

interface HeroProps {
  profile: Profile
  achievements?: Achievement[]
}

function openCvInNewTab(href: string): void {
  window.open(href, '_blank', 'noopener,noreferrer')
}

export function Hero({ profile, achievements = [] }: HeroProps) {
  const { t, locale } = useI18n()
  const pathname = usePathname()
  const [cvDialogOpen, setCvDialogOpen] = useState(false)
  const cvHref =
    locale === 'es'
      ? profile.cvLinks?.spanish ?? profile.cvLinks?.english
      : profile.cvLinks?.english ?? profile.cvLinks?.spanish
  const avatarSrc =
    (profile as { heroImage?: string }).heroImage ||
    (profile as { profileImageLocal?: string }).profileImageLocal ||
    profile.images?.[1] ||
    profile.images?.[0] ||
    '/images/profile-main.png'
  const heroBackground = profile.heroBackground || '/images/hero-background-nyc.jpg'

  return (
    <section
      id="hero"
      data-analytics-section="hero"
      className="relative isolate flex min-h-0 flex-col justify-center overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:min-h-[58vh] lg:px-12 lg:py-14 xl:min-h-[62vh] xl:px-24 xl:py-16"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <Image
          src={heroBackground}
          alt=""
          fill
          priority
          className="object-cover object-[center_35%] scale-105 sm:object-[center_40%] lg:object-[72%_42%] xl:object-[68%_40%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-background/65 dark:bg-background/78" />
        <div className="absolute inset-0 bg-gradient-to-r from-background from-0% via-background/88 via-40% to-background/50 to-100% lg:via-32% lg:to-background/20 dark:from-background dark:via-background/92 dark:lg:to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent dark:from-background dark:via-background/45 lg:via-background/25" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-20%,rgba(13,148,136,0.16),transparent_58%)] dark:bg-[radial-gradient(ellipse_90%_70%_at_50%_-20%,rgba(13,148,136,0.1),transparent_58%)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="grid w-full min-w-0 items-center gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-12 xl:gap-16 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          {/* Avatar primero en móvil para mejor jerarquía visual */}
          <div className="flex justify-center lg:hidden order-first motion-hero-in">
            <div className="relative">
              <div className="absolute -inset-2 sm:-inset-3 bg-primary/20 rounded-full blur-2xl sm:blur-3xl" />
              <div className="relative h-28 w-28 xs:h-32 xs:w-32 sm:h-40 sm:w-40 md:h-44 md:w-44 rounded-full overflow-hidden border-4 border-primary/25 shadow-xl shadow-black/15 ring-2 ring-background/80 dark:shadow-black/40">
                <Image
                  src={avatarSrc}
                  alt={profile.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 375px) 112px, (max-width: 640px) 128px, (max-width: 768px) 160px, 176px"
                  priority
                />
              </div>
            </div>
          </div>
          <div className="order-2 min-w-0 space-y-4 motion-hero-stagger sm:space-y-6 lg:max-w-xl lg:space-y-7 xl:max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-wide text-primary sm:text-sm lg:tracking-[0.14em]">
              {profile.title || 'Mobile & Software Engineer'}
            </p>
            <h1 className="min-w-0 w-full text-3xl font-bold leading-tight text-balance max-lg:break-words xs:text-4xl sm:text-4xl md:text-5xl lg:text-5xl lg:leading-[1.08] lg:whitespace-nowrap xl:text-[3.35rem] 2xl:text-6xl">
              <TypeAnimation
                key={locale}
                sequence={[t('hero.hiIm', { name: profile.name || 'Kevin Morales' })]}
                wrapper="span"
                speed={50}
                cursor={true}
                repeat={0}
                className="inline-block min-w-0 max-w-full"
                preRenderFirstString
              />
            </h1>

            {profile.shortBio ? (
              <p className="hidden max-w-lg text-base leading-relaxed text-muted-foreground lg:block xl:max-w-xl xl:text-lg">
                {profile.shortBio}
              </p>
            ) : null}

            <div className="flex flex-col flex-wrap gap-2 pt-1 xs:flex-row sm:gap-3 lg:gap-3">
              <Button size="default" className="h-9 gap-2 sm:h-10 sm:px-6" asChild>
                <Link href="/#projects" onClick={(e) => handleHomeHashLinkClick(e, pathname, '/#projects')}>
                  {t('hero.exploreWork')}
                  <ArrowDown className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button variant="outline" size="default" className="h-9 gap-2 sm:h-10 sm:px-6" asChild>
                <Link href="/#connect" onClick={(e) => handleHomeHashLinkClick(e, pathname, '/#connect')}>
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  {t('hero.letsTalk')}
                </Link>
              </Button>
              {(cvHref || profile.socialLinks?.website) && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    className="h-9 gap-2 sm:h-10 sm:px-6"
                    onClick={() => setCvDialogOpen(true)}
                  >
                    <FileText className="h-4 w-4" />
                    {t('hero.downloadResume')}
                  </Button>
                  <AlertDialog open={cvDialogOpen} onOpenChange={setCvDialogOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('hero.cvDialogTitle')}</AlertDialogTitle>
                        <AlertDialogDescription className="text-left">
                          {t('hero.cvDialogDescription')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('hero.cvDialogCancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.preventDefault()
                            const href = cvHref || profile.socialLinks?.website || ''
                            if (!href) return
                            openCvInNewTab(href)
                            setCvDialogOpen(false)
                          }}
                        >
                          {t('hero.cvDialogConfirm')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
            <HeroCredentialsStrip achievements={achievements} />
          </div>

          {/* Avatar oculto en móvil (ya mostrado arriba), visible en desktop */}
          <div className="order-2 hidden motion-hero-in motion-hero-delay lg:flex lg:items-center lg:justify-center xl:justify-end">
            <div className="relative">
              <div className="absolute -inset-5 rounded-full bg-primary/15 blur-3xl xl:-inset-6" />
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/35 via-primary/10 to-transparent opacity-80" />
              <div className="relative h-60 w-60 rounded-full overflow-hidden border-4 border-primary/30 shadow-2xl shadow-black/20 ring-2 ring-background/90 dark:border-primary/25 dark:shadow-black/50 xl:h-[17.5rem] xl:w-[17.5rem] 2xl:h-80 2xl:w-80">
                <Image
                  src={avatarSrc}
                  alt={profile.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1280px) 240px, (max-width: 1536px) 280px, 320px"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
