'use client'

import Image from 'next/image'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/scroll-reveal'
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
      data-analytics-section="achievements"
      className="bg-secondary/20 py-6 sm:py-10 md:py-14 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24"
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-6 sm:mb-8">
          <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-4">
            {t('conferences.achievements')}
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 justify-items-center">
          {achievements.map((achievement, index) => {
            const frame = (
              <div className="relative mx-auto h-24 w-36 sm:h-32 sm:w-56">
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
            const content = (
              <>
                {frame}
                {caption}
              </>
            )

            return (
              <StaggerItem key={achievement.id} staggerIndex={index} className="w-full max-w-[15rem]">
                {achievement.url ? (
                  <a
                    href={achievement.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full flex-col items-center text-center transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-xl"
                  >
                    {content}
                  </a>
                ) : (
                  <div className="flex w-full flex-col items-center text-center transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02]">
                    {content}
                  </div>
                )}
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </div>
    </section>
  )
}
