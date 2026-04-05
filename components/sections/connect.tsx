'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from '@/components/scroll-reveal'
import { Card, CardContent } from '@/components/ui/card'
import { Coffee } from 'lucide-react'
import { BuyMeACoffeeModal } from '@/components/buymeacoffee-modal'
import { useI18n } from '@/components/i18n/locale-provider'
import { cn } from '@/lib/utils'
import { getPublicWeb3FormsAccessKey } from '@/lib/web3forms-submit'
import type { Profile } from '@/types'

interface ConnectProps {
  profile: Profile
}

const inputClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

export function Connect({ profile }: ConnectProps) {
  const { t } = useI18n()
  const links = profile.socialLinks || {}
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [result, setResult] = useState('')
  const [bmcModalOpen, setBmcModalOpen] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setStatus('sending')
    setResult(t('connect.sending'))

    const accessKey = getPublicWeb3FormsAccessKey()
    if (!accessKey) {
      setStatus('error')
      setResult(t('connect.missingWeb3Key'))
      return
    }

    const formData = new FormData(form)
    formData.append('access_key', accessKey)
    const name = String(formData.get('name') || '').trim()
    formData.append('subject', `Contact from ${name} - kevinhomorales.com`)
    formData.append('from_name', name)

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      })

      const data = (await response.json()) as {
        success?: boolean
        message?: string
        body?: { message?: string }
      }

      if (data.success) {
        setStatus('success')
        setResult(t('connect.success'))
        form.reset()
      } else {
        setStatus('error')
        setResult(data.body?.message || data.message || t('connect.fail'))
      }
    } catch {
      setStatus('error')
      setResult(t('connect.network'))
    }
  }

  return (
    <section id="connect" className="scroll-mt-20 py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 bg-secondary/30">
      <div className="max-w-4xl mx-auto text-center">
        <ScrollReveal className="mb-6 sm:mb-8">
          <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3 sm:mb-4">{t('connect.kicker')}</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-balance">
            {t('connect.title')}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-1">
            {t('connect.subtitle')}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1} variant="scale">
        <Card className="bg-card/50 border-border/50 max-w-2xl mx-auto mb-6">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <form onSubmit={onSubmit} className="space-y-4 text-left">
              <div>
                <label htmlFor="connect-name" className="block text-sm font-medium mb-2">
                  {t('connect.name')}
                </label>
                <input
                  id="connect-name"
                  name="name"
                  type="text"
                  required
                  placeholder={t('connect.namePh')}
                  className={inputClassName}
                  disabled={status === 'sending'}
                  autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="connect-email" className="block text-sm font-medium mb-2">
                  {t('connect.email')}
                </label>
                <input
                  id="connect-email"
                  name="email"
                  type="email"
                  required
                  placeholder={t('connect.emailPh')}
                  className={inputClassName}
                  disabled={status === 'sending'}
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="connect-message" className="block text-sm font-medium mb-2">
                  {t('connect.message')}
                </label>
                <textarea
                  id="connect-message"
                  name="message"
                  required
                  placeholder={t('connect.messagePh')}
                  rows={4}
                  className={cn(inputClassName, 'min-h-[100px] resize-y')}
                  disabled={status === 'sending'}
                />
              </div>
              {result ? (
                <p
                  className={cn(
                    'text-sm',
                    status === 'success' ? 'text-primary' : 'text-destructive'
                  )}
                >
                  {result}
                </p>
              ) : null}
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? t('connect.sending') : t('connect.send')}
              </Button>
            </form>
          </CardContent>
        </Card>
        </ScrollReveal>

        {links.buymeacoffee && (
          <ScrollReveal delay={0.2} className="pt-4">
            <Button
              size="lg"
              className="gap-2 bg-[#FFDD00] hover:bg-[#FFE44D] text-black"
              onClick={() => setBmcModalOpen(true)}
            >
              <Coffee className="h-5 w-5" />
              {t('connect.bmc')}
            </Button>
          </ScrollReveal>
        )}
        <BuyMeACoffeeModal open={bmcModalOpen} onClose={() => setBmcModalOpen(false)} />
      </div>
    </section>
  )
}
