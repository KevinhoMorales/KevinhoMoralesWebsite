'use client'

import Image from 'next/image'
import { TypeAnimation } from 'react-type-animation'
import { Button } from '@/components/ui/button'
import { ArrowDown, MessageCircle, FileText } from 'lucide-react'
import { openCalendlyPopup } from '@/components/calendly-widget'
import type { Profile } from '@/types'

interface HeroProps {
  profile: Profile
}

export function Hero({ profile }: HeroProps) {
  const avatarSrc =
    (profile as { heroImage?: string }).heroImage ||
    (profile as { profileImageLocal?: string }).profileImageLocal ||
    profile.images?.[1] ||
    profile.images?.[0] ||
    '/images/profile-main.png'

  return (
    <section className="min-h-[60vh] sm:min-h-[65vh] lg:min-h-[50vh] xl:min-h-[45vh] flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-3 sm:py-4 md:py-4">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-10 items-center">
          {/* Avatar primero en móvil para mejor jerarquía visual */}
          <div className="flex justify-center lg:hidden order-first">
            <div className="relative">
              <div className="absolute -inset-2 sm:-inset-3 bg-primary/20 rounded-full blur-2xl sm:blur-3xl" />
              <div className="relative h-32 w-32 xs:h-36 xs:w-36 sm:h-40 sm:w-40 md:h-44 md:w-44 rounded-full overflow-hidden border-4 border-primary/20">
                <Image
                  src={avatarSrc}
                  alt={profile.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 375px) 128px, (max-width: 640px) 144px, (max-width: 768px) 160px, 176px"
                  priority
                />
              </div>
            </div>
          </div>
          <div className="space-y-4 sm:space-y-6 order-2">
            <div className="space-y-2 sm:space-y-3">
              <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm">
                {profile.title || 'Mobile & Software Engineer'}
              </p>
              <h1 className="text-3xl xs:text-4xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold leading-tight whitespace-nowrap">
                <TypeAnimation
                  sequence={[`Hi, I'm ${profile.name || 'Kevin Morales'}`]}
                  wrapper="span"
                  speed={50}
                  cursor={true}
                  repeat={0}
                  className="inline-block"
                />
              </h1>
            </div>

            <div className="flex flex-col xs:flex-row flex-wrap gap-2 sm:gap-3 pt-1">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore my work
                <ArrowDown className="h-4 w-4" />
              </Button>
              {profile.socialLinks?.calendly ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={() => {
                    if (window.confirm('Se abrirá Calendly para agendar una reunión. ¿Continuar?')) {
                      openCalendlyPopup()
                    }
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Let&apos;s talk
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={() => {
                    if (window.confirm('Irás a la sección de contacto para conectarte. ¿Continuar?')) {
                      document.getElementById('connect')?.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Let&apos;s talk
                </Button>
              )}
              {(profile.cvLinks?.english || profile.socialLinks?.website) && (
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={() => {
                    if (window.confirm('Se descargará el currículum de Kevin Morales (PDF). ¿Continuar?')) {
                      const link = document.createElement('a')
                      link.href = profile.cvLinks?.english || profile.socialLinks?.website || '#'
                      link.download = 'Kevin-Morales-Resume.pdf'
                      link.target = '_blank'
                      link.rel = 'noopener noreferrer'
                      link.click()
                    }
                  }}
                >
                  <FileText className="h-4 w-4" />
                  Download Resume
                </Button>
              )}
            </div>
          </div>

          {/* Avatar oculto en móvil (ya mostrado arriba), visible en desktop */}
          <div className="hidden lg:flex justify-center xl:justify-end order-2">
            <div className="relative">
              <div className="absolute -inset-3 xl:-inset-4 bg-primary/20 rounded-full blur-3xl" />
              <div className="relative h-56 w-56 xl:h-64 xl:w-64 rounded-full overflow-hidden border-4 border-primary/20">
                <Image
                  src={avatarSrc}
                  alt={profile.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1280px) 224px, 256px"
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
