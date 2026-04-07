'use client'

import Image from 'next/image'
import { ScrollReveal } from '@/components/scroll-reveal'
import { useI18n } from '@/components/i18n/locale-provider'
import type { Achievement } from '@/types'

export function AchievementsSection({ achievements }: { achievements: Achievement[] }) {
  const { t } = useI18n()

  if (achievements.length === 0) {
    return null
  }

  return (
    <section
      id="achievements"
      className="scroll-mt-20 bg-secondary/20 py-10 sm:py-12 md:py-14 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24"
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-4">
            {t('conferences.achievements')}
          </p>
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12 xl:-mx-24 xl:px-24 [scrollbar-width:thin]">
            <div className="flex items-stretch gap-8 sm:gap-10 min-w-max">
              {achievements.map((achievement) => {
                const frame = (
                  <div className="relative h-28 w-44 shrink-0 sm:h-32 sm:w-56">
                    <Image
                      src={achievement.image}
                      alt={achievement.title}
                      fill
                      sizes="(max-width: 640px) 176px, 224px"
                      className="rounded-lg object-contain object-center drop-shadow-md"
                    />
                  </div>
                )
                const caption = (
                  <span className="mt-2 block max-w-[11rem] sm:max-w-[14rem] text-center text-xs sm:text-sm font-medium text-foreground leading-snug">
                    {achievement.title}
                  </span>
                )
                return achievement.url ? (
                  <a
                    key={achievement.id}
                    href={achievement.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 flex-col items-center text-center transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-xl"
                  >
                    {frame}
                    {caption}
                  </a>
                ) : (
                  <div
                    key={achievement.id}
                    className="flex shrink-0 flex-col items-center text-center transition-transform hover:scale-[1.02]"
                  >
                    {frame}
                    {caption}
                  </div>
                )
              })}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
