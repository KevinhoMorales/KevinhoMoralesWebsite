'use client'

import Image from 'next/image'
import { useI18n } from '@/components/i18n/locale-provider'
import type { Achievement } from '@/types'

type HeroCredentialsStripProps = {
  achievements: Achievement[]
}

const credentialFrameClass =
  'relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-background p-1.5 shadow-md shadow-black/10 ring-1 ring-black/5 transition-[opacity,box-shadow,transform] hover:scale-105 hover:shadow-lg hover:shadow-black/15 dark:bg-card/70 dark:shadow-black/45 dark:ring-white/10 dark:hover:shadow-black/60 sm:h-14 sm:w-14 lg:h-[3.75rem] lg:w-[3.75rem]'

export function HeroCredentialsStrip({ achievements }: HeroCredentialsStripProps) {
  const { t } = useI18n()
  const top = achievements.slice(0, 4)

  if (top.length === 0) return null

  return (
    <div className="pt-4 sm:pt-5 lg:rounded-2xl lg:border lg:border-border/40 lg:bg-card/35 lg:px-4 lg:py-3 lg:backdrop-blur-sm xl:px-5 xl:py-4">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs lg:mb-3">
        {t('hero.credentialsLabel')}
      </p>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-5">
        {top.map((item) => {
          const inner = (
            <>
              <div className={credentialFrameClass}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </div>
              <span className="sr-only">{item.title}</span>
            </>
          )

          return item.url ? (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg opacity-90 hover:opacity-100 focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring"
              title={item.title}
            >
              {inner}
            </a>
          ) : (
            <div key={item.id} className="opacity-90" title={item.title}>
              {inner}
            </div>
          )
        })}
      </div>
    </div>
  )
}
