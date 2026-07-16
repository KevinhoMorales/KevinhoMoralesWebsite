'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExperienceBlockCard } from '@/components/experience-block-card'
import { ExperienceModal } from '@/components/experience-modal'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/scroll-reveal'
import { useI18n } from '@/components/i18n/locale-provider'
import { ArrowRight } from 'lucide-react'
import type { MergedExperience } from '@/types'

interface ExperienceProps {
  experiences: MergedExperience[]
  /** En la home (desktop): primeros N bloques; el resto en modal "Ver más" */
  previewLimit?: number
  /** En viewports < lg: cuántos bloques mostrar antes de "Ver más" */
  previewLimitMobile?: number
}

function useIsLgUp(): boolean {
  const [isLgUp, setIsLgUp] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsLgUp(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return isLgUp
}

export function ExperienceSection({
  experiences,
  previewLimit,
  previewLimitMobile,
}: ExperienceProps) {
  const { t } = useI18n()
  const [modalOpen, setModalOpen] = useState(false)
  const isLgUp = useIsLgUp()

  const effectiveLimit =
    previewLimit != null
      ? isLgUp
        ? previewLimit
        : (previewLimitMobile ?? previewLimit)
      : undefined

  const visible =
    effectiveLimit != null ? experiences.slice(0, effectiveLimit) : experiences
  const showSeeMore =
    effectiveLimit != null && experiences.length > effectiveLimit

  return (
    <section
      id="experience"
      data-analytics-section="experience"
      className="py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24"
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-4 sm:mb-6">
          <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3">{t('experience.kicker')}</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
            {t('experience.title')}
          </h2>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5">
          {visible.map((block, index) => (
            <StaggerItem key={block.id} delay={index * 0.05} className="w-full min-h-0 h-full">
              <ExperienceBlockCard block={block} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {showSeeMore ? (
          <ScrollReveal delay={0.12} className="mt-8 sm:mt-10 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="default"
              className="h-9 gap-2 rounded-xl sm:h-10"
              onClick={() => setModalOpen(true)}
            >
              {t('experience.seeMore')}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </ScrollReveal>
        ) : null}
      </div>

      <ExperienceModal
        experiences={experiences}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  )
}
