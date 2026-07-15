'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExperienceBlockCard } from '@/components/experience-block-card'
import { ExperienceModal } from '@/components/experience-modal'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/scroll-reveal'
import { useI18n } from '@/components/i18n/locale-provider'
import { ArrowRight } from 'lucide-react'
import type { MergedExperience } from '@/types'

interface ExperienceProps {
  experiences: MergedExperience[]
  /** En la home: solo los primeros `previewLimit` bloques; el resto en modal "Ver más" */
  previewLimit?: number
}

export function ExperienceSection({ experiences, previewLimit }: ExperienceProps) {
  const { t } = useI18n()
  const [modalOpen, setModalOpen] = useState(false)

  const visible =
    previewLimit != null ? experiences.slice(0, previewLimit) : experiences
  const showSeeMore =
    previewLimit != null && experiences.length > previewLimit

  return (
    <section
      id="experience"
      data-analytics-section="experience"
      className="py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24"
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-8 sm:mb-10">
          <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3">{t('experience.kicker')}</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
            {t('experience.title')}
          </h2>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
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
              size="lg"
              className="gap-2 rounded-xl"
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
