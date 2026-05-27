'use client'

import Link from 'next/link'
import { Mail } from 'lucide-react'
import { FaAmazon } from 'react-icons/fa'
import { SiGumroad } from 'react-icons/si'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/components/i18n/locale-provider'
import { BOOK_AMAZON_URL, BOOK_GUMROAD_URL } from '@/lib/book-store-links'
import { cn } from '@/lib/utils'

type BookStoreButtonsProps = {
  className?: string
  /** Amazon/Gumroad: rounded-full en sección, rounded-xl en modal */
  buttonClassName?: string
  showContact?: boolean
  onBuyClick?: (store: 'amazon' | 'gumroad') => void
}

export function BookStoreButtons({
  className,
  buttonClassName = 'rounded-full',
  showContact = false,
  onBuyClick,
}: BookStoreButtonsProps) {
  const { t } = useI18n()

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:flex-wrap', className)}>
      <Button asChild className={buttonClassName}>
        <a
          href={BOOK_AMAZON_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('bookSection.ctaAmazonAria')}
          onClick={() => onBuyClick?.('amazon')}
        >
          <FaAmazon className="mr-2 h-4 w-4" aria-hidden />
          {t('bookSection.ctaAmazon')}
        </a>
      </Button>
      <Button variant="outline" asChild className={buttonClassName}>
        <a
          href={BOOK_GUMROAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('bookSection.ctaGumroadAria')}
          onClick={() => onBuyClick?.('gumroad')}
        >
          <SiGumroad className="mr-2 h-4 w-4" aria-hidden />
          {t('bookSection.ctaGumroad')}
        </a>
      </Button>
      {showContact ? (
        <Button variant="outline" asChild className={buttonClassName}>
          <Link href="/#connect">
            <Mail className="mr-2 h-4 w-4" aria-hidden />
            {t('bookSection.ctaContact')}
          </Link>
        </Button>
      ) : null}
    </div>
  )
}
