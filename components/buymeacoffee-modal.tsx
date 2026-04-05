'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { BmcThemedButtonGraphic } from '@/components/bmc-themed-button-graphic'
import { useI18n } from '@/components/i18n/locale-provider'

interface BuyMeACoffeeModalProps {
  open: boolean
  onClose: () => void
  /** Buy Me a Coffee profile URL (e.g. from profile.socialLinks.buymeacoffee) */
  href?: string
}

export function BuyMeACoffeeModal({
  open,
  onClose,
  href = 'https://www.buymeacoffee.com/KevinhoMorales',
}: BuyMeACoffeeModalProps) {
  const { t } = useI18n()
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    if (open) document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <Script
        id="bmc-widget"
        src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
        data-name="BMC-Widget"
        data-cfasync="false"
        data-id="KevinhoMorales"
        data-description="Support me on Buy me a coffee!"
        data-message=""
        data-color="#40DCA5"
        data-position="Right"
        data-x_margin="18"
        data-y_margin="18"
        strategy="lazyOnload"
      />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bmc-modal-title"
      >
        <div
          className="relative w-full max-w-md rounded-lg overflow-hidden bg-background shadow-xl p-6 sm:p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="bmc-modal-title" className="text-xl sm:text-2xl font-bold mb-3">
            {t('bmc.title')}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t('bmc.body')}
          </p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('connect.bmc')}
            className="mx-auto block overflow-hidden rounded-full shadow-sm ring-1 ring-black/10 transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:ring-white/15"
          >
            <BmcThemedButtonGraphic
              className="h-auto w-full max-w-full"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="block w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </>
  )
}
