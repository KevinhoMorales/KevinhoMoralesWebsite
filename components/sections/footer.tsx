'use client'

import { Separator } from '@/components/ui/separator'
import { ScrollReveal } from '@/components/scroll-reveal'
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

const SOCIAL_USERNAME = 'kevinhomorales'

const socialIconConfig = [
  { name: 'LinkedIn', icon: FaLinkedinIn, key: 'linkedin' as const },
  { name: 'X', icon: SiX, key: 'twitter' as const },
  { name: 'GitHub', icon: SiGithub, key: 'github' as const },
  { name: 'YouTube', icon: SiYoutube, key: 'youtube' as const },
  { name: 'Instagram', icon: SiInstagram, key: 'instagram' as const },
  { name: 'Sessionize', icon: SiSessionize, key: 'sessionize' as const },
]

export function Footer({ profile }: FooterProps) {
  const links = profile.socialLinks || {}
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-4 sm:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 bg-secondary/20">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-6">
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">{profile.name}</h3>
            <div className="mb-4 sm:mb-6">
              <p className="text-xs font-medium text-muted-foreground tracking-wider mb-3">
                @{SOCIAL_USERNAME}
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
          <p>© {currentYear} {profile.name}. All rights reserved.</p>
        </div>
        </ScrollReveal>
      </div>
    </footer>
  )
}
