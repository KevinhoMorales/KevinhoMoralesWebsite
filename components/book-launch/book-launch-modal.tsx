'use client'

import Image from 'next/image'
import { useEffect } from 'react'

import { BookStoreButtons } from '@/components/book/book-store-buttons'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useI18n } from '@/components/i18n/locale-provider'
import { logAnalyticsEvent } from '@/lib/analytics-events'
import { BOOK_LAUNCH_POPUP_PATH } from '@/lib/book-cover-path'
import { cn } from '@/lib/utils'

import { useBookLaunch } from './book-launch-context'

export function BookLaunchModal() {
  const { t } = useI18n()
  const { dialogOpen, setDialogOpen, markSeen } = useBookLaunch()

  useEffect(() => {
    if (!dialogOpen) return
    void logAnalyticsEvent('book_launch_open', { source: 'auto' })
  }, [dialogOpen])

  function handleOpenChange(open: boolean) {
    if (!open) void logAnalyticsEvent('book_launch_close', {})
    setDialogOpen(open)
  }

  function handleBuyClick(store: 'amazon' | 'gumroad') {
    markSeen()
    void logAnalyticsEvent('book_launch_buy', { store })
    setDialogOpen(false)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[min(90dvh,calc(100vh-1.25rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg',
          'border-2 border-primary/40 shadow-[0_0_0_1px_rgba(13,148,136,0.2)]'
        )}
      >
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-muted">
          <Image
            src={BOOK_LAUNCH_POPUP_PATH}
            alt={t('bookSection.promoAlt')}
            width={1024}
            height={576}
            className="h-full w-full object-cover object-center"
            sizes="(max-width: 640px) 100vw, 512px"
            priority
          />
        </div>

        <div className="flex flex-col items-center gap-4 px-5 pb-6 pt-5 text-center sm:px-6">
          <DialogHeader className="w-full space-y-2 text-center">
            <DialogTitle className="text-xl font-semibold tracking-tight text-balance sm:text-2xl">
              {t('bookLaunch.title')}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t('bookLaunch.body')}
            </DialogDescription>
          </DialogHeader>

          <BookStoreButtons
            className="justify-center pt-1"
            buttonClassName="w-full rounded-xl sm:w-auto sm:rounded-full"
            onBuyClick={handleBuyClick}
          />

          <Button
            type="button"
            variant="ghost"
            className="h-10 w-full max-w-xs text-muted-foreground"
            onClick={() => handleOpenChange(false)}
          >
            {t('bookLaunch.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
