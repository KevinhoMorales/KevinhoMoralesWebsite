'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useI18n } from '@/components/i18n/locale-provider'
import type { Achievement } from '@/types'

type HeroCredentialsStripProps = {
  achievements: Achievement[]
  sessionizeUrl?: string
}

export function HeroCredentialsStrip({ achievements, sessionizeUrl }: HeroCredentialsStripProps) {
  const { t } = useI18n()
  const top = achievements.slice(0, 4)

  if (top.length === 0) return null

  return (
    <div className="pt-4 sm:pt-5">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
        {t('hero.credentialsLabel')}
      </p>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {top.map((item) => {
          const inner = (
            <>
              <div className="relative h-10 w-16 sm:h-11 sm:w-[4.5rem]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="72px"
                  className="object-contain object-left"
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
              className="rounded-lg opacity-80 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring"
              title={item.title}
            >
              {inner}
            </a>
          ) : (
            <div key={item.id} className="opacity-80" title={item.title}>
              {inner}
            </div>
          )
        })}
        {sessionizeUrl ? (
          <Link
            href={sessionizeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary hover:underline sm:text-sm"
          >
            {t('hero.sessionizeProfile')}
          </Link>
        ) : null}
      </div>
    </div>
  )
}
