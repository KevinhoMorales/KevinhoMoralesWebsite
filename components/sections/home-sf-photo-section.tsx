'use client'

import { useMemo } from 'react'
import { useI18n } from '@/components/i18n/locale-provider'
import { HomePhotoCarousel } from '@/components/sections/home-photo-carousel'

export function HomeSfPhotoSection() {
  const { t } = useI18n()

  const slides = useMemo(
    () => [
      {
        src: '/images/kevin-san-francisco.jpg',
        alt: t('homePhotos.sf.alt'),
        caption: t('homePhotos.sf.caption'),
      },
      {
        src: '/images/kevin-cursor-talk.jpg',
        alt: t('homePhotos.cursor.alt'),
        caption: t('homePhotos.cursor.caption'),
      },
    ],
    [t]
  )

  return (
    <HomePhotoCarousel
      slides={slides}
      variant="fade-up"
      aspect="square"
      standalone
      autoPlayMs={8000}
    />
  )
}
