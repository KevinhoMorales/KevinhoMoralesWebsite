'use client'

import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { ScrollReveal } from '@/components/scroll-reveal'
import { useI18n } from '@/components/i18n/locale-provider'
import { FaLinkedinIn } from 'react-icons/fa'
import {
  SiX,
  SiGithub,
  SiYoutube,
  SiInstagram,
  SiMedium,
  SiSessionize,
} from 'react-icons/si'
import type { Profile } from '@/types'

interface FooterProps {
  profile: Profile
}

function footerSocialHandle(profile: Profile): string {
  const raw = profile.socialHandle?.trim()
  if (raw) return raw.replace(/^@+/, '')
  const tw = profile.socialLinks?.twitter
  if (tw) {
    try {
      const seg = new URL(tw).pathname.replace(/^\//, '').split('/').filter(Boolean)[0]
      if (seg) return seg
    } catch {
      /* invalid url */
    }
  }
  return 'kevinhomorales'
}

const socialIconConfig = [
  { name: 'LinkedIn', icon: FaLinkedinIn, key: 'linkedin' as const },
  { name: 'X', icon: SiX, key: 'twitter' as const },
  { name: 'GitHub', icon: SiGithub, key: 'github' as const },
  { name: 'YouTube', icon: SiYoutube, key: 'youtube' as const },
  { name: 'Instagram', icon: SiInstagram, key: 'instagram' as const },
  { name: 'Sessionize', icon: SiSessionize, key: 'sessionize' as const },
]

export function Footer({ profile }: FooterProps) {
  const { t } = useI18n()
  const links = profile.socialLinks || {}
  const handle = footerSocialHandle(profile)
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-4 sm:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 bg-secondary/20">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-6">
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">{profile.name}</h3>
            <div className="mb-4 sm:mb-6">
              <p className="text-xs font-medium text-muted-foreground tracking-wider mb-3">
                @{handle}
              </p>
              <div className="flex flex-wrap gap-3">
                {socialIconConfig.map(({ name, icon: Icon, key }) => {
                  const href = links[key]
                  if (!href) return null
                  return (
                    <a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary/50 hover:scale-110 transition-transform duration-200 text-black dark:text-white"
                      title={name}
                      aria-label={name}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  )
                })}
                {links.medium && (
                  <a
                    href={links.medium}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary/50 hover:scale-110 transition-transform duration-200 text-black dark:text-white"
                    title="Medium"
                    aria-label="Medium"
                  >
                    <SiMedium className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
        <Separator className="mb-6" />

        <div className="text-center text-xs sm:text-sm text-muted-foreground">
          <p className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span>
              © {currentYear} {profile.name}. {t('common.rights')}
            </span>
            <span className="text-muted-foreground/25 select-none" aria-hidden>
              ·
            </span>
            <Link
              href="/admin/login"
              className="text-[10px] uppercase tracking-widest text-muted-foreground/35 hover:text-muted-foreground/70 transition-colors"
              aria-label={t('common.adminAccess')}
            >
              {t('common.access')}
            </Link>
          </p>
        </div>
        </ScrollReveal>
      </div>
    </footer>
  )
}
