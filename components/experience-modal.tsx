'use client'

import { useEffect, useMemo, useState } from 'react'
import { BrowseListModal } from '@/components/ui/browse-list-modal'
import { ExperienceBlockCard } from '@/components/experience-block-card'
import { useI18n } from '@/components/i18n/locale-provider'
import { normalizeForSearch } from '@/lib/normalize-for-search'
import type { MergedExperience } from '@/types'

interface ExperienceModalProps {
  experiences: MergedExperience[]
  open: boolean
  onClose: () => void
}

export function ExperienceModal({ experiences, open, onClose }: ExperienceModalProps) {
  const { t } = useI18n()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!open) setSearch('')
  }, [open])

  const filteredExperiences = useMemo(() => {
    const q = normalizeForSearch(search.trim())
    if (!q) return experiences

    return experiences.filter((block) => {
      const roleText = block.roles
        .map(
          (role) =>
            `${role.role} ${role.startDate} ${role.endDate ?? ''} ${role.type} ${role.description ?? ''} ${role.current ? t('common.present') : ''}`
        )
        .join(' ')
      const haystack = normalizeForSearch(
        [block.company, block.companyFormerName ?? '', roleText].join(' ')
      )
      return haystack.includes(q)
    })
  }, [experiences, search, t])

  return (
    <BrowseListModal
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={t('experienceModal.title')}
      searchPlaceholder={t('experienceModal.searchPlaceholder')}
      searchValue={search}
      onSearchChange={setSearch}
      emptyMessage={t('browseModal.noResults')}
      isEmpty={filteredExperiences.length === 0}
    >
      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5">
        {filteredExperiences.map((block) => (
          <ExperienceBlockCard key={block.id} block={block} />
        ))}
      </div>
    </BrowseListModal>
  )
}
