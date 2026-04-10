'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from '@/components/scroll-reveal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar, Coffee, Mail } from 'lucide-react'
import { BuyMeACoffeeModal } from '@/components/buymeacoffee-modal'
import { openCalendlyPopup } from '@/components/calendly-widget'
import { useI18n } from '@/components/i18n/locale-provider'
import { cn } from '@/lib/utils'
import { getPublicWeb3FormsAccessKey } from '@/lib/web3forms-submit'
import type { Profile } from '@/types'

interface ConnectProps {
  profile: Profile
}

const fieldClass = 'rounded-xl h-11 border-border/80 bg-background/50 shadow-sm'
const textareaClass = 'rounded-xl min-h-[128px] resize-y border-border/80 bg-background/50 shadow-sm'

export function Connect({ profile }: ConnectProps) {
  const { t } = useI18n()
  const links = profile.socialLinks || {}
  const hasSchedulingAside = Boolean(links.calendly || links.buymeacoffee)
  const asideRowWithCalendlyAndBmc = Boolean(links.calendly && links.buymeacoffee)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [result, setResult] = useState('')
  const [bmcModalOpen, setBmcModalOpen] = useState(false)

  function onCalendlyClick() {
    if (!links.calendly) return
    if (typeof window !== 'undefined' && window.confirm(t('hero.calendlyConfirm'))) {
      openCalendlyPopup(links.calendly)
    }
  }

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
    <section
      id="connect"
      data-analytics-section="connect"
      className="scroll-mt-20 relative overflow-hidden py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-30%,rgba(13,148,136,0.18),transparent_55%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-30%,rgba(13,148,136,0.12),transparent_55%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/25 via-background to-background dark:from-secondary/15" aria-hidden />

      <div className="relative max-w-6xl mx-auto">
        <ScrollReveal className="text-center mb-12 sm:mb-14 lg:mb-16">
          <p className="text-primary font-semibold tracking-wide uppercase text-xs sm:text-sm mb-3">
            {t('connect.kicker')}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance tracking-tight">
            {t('connect.title')}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('connect.subtitle')}
          </p>
        </ScrollReveal>

        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 lg:gap-8">
          <ScrollReveal variant="scale" className="min-w-0">
            <Card className="border-border/60 bg-card/85 backdrop-blur-md shadow-xl shadow-black/5 dark:shadow-black/20 rounded-2xl overflow-hidden">
              <CardHeader className="space-y-1 pb-2">
                <div className="flex items-center gap-2 text-primary">
                  <Mail className="h-5 w-5 shrink-0" aria-hidden />
                  <CardTitle className="text-lg sm:text-xl font-semibold">{t('connect.formCardTitle')}</CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed">{t('connect.formCardHint')}</CardDescription>
              </CardHeader>
              <CardContent className="pt-2 pb-6 sm:pb-8 px-5 sm:px-6">
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="connect-name">{t('connect.name')}</Label>
                      <Input
                        id="connect-name"
                        name="name"
                        type="text"
                        required
                        placeholder={t('connect.namePh')}
                        disabled={status === 'sending'}
                        autoComplete="name"
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="connect-email">{t('connect.email')}</Label>
                      <Input
                        id="connect-email"
                        name="email"
                        type="email"
                        required
                        placeholder={t('connect.emailPh')}
                        disabled={status === 'sending'}
                        autoComplete="email"
                        className={fieldClass}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="connect-message">{t('connect.message')}</Label>
                    <Textarea
                      id="connect-message"
                      name="message"
                      required
                      placeholder={t('connect.messagePh')}
                      disabled={status === 'sending'}
                      className={textareaClass}
                    />
                  </div>
                  {result ? (
                    <p
                      className={cn(
                        'text-sm rounded-lg px-3 py-2',
                        status === 'success'
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-destructive/10 text-destructive border border-destructive/20'
                      )}
                    >
                      {result}
                    </p>
                  ) : null}
                  <Button type="submit" size="lg" className="w-full rounded-xl h-12 font-semibold gap-2" disabled={status === 'sending'}>
                    {status === 'sending' ? t('connect.sending') : t('connect.send')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </ScrollReveal>

          {hasSchedulingAside ? (
            <ScrollReveal delay={0.08} variant="scale" className="min-w-0">
              <Card className="border-border/60 bg-card/85 backdrop-blur-md shadow-xl shadow-black/5 dark:shadow-black/20 rounded-2xl overflow-hidden">
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Calendar className="h-5 w-5 shrink-0" aria-hidden />
                    <CardTitle className="text-lg sm:text-xl font-semibold">{t('connect.asideTitle')}</CardTitle>
                  </div>
                  <CardDescription className="text-sm leading-relaxed">{t('connect.asideBody')}</CardDescription>
                </CardHeader>
                <CardContent
                  className={cn(
                    'flex flex-col gap-3 pt-0 pb-6 sm:pb-8 px-5 sm:px-6',
                    asideRowWithCalendlyAndBmc && 'sm:flex-row sm:items-stretch sm:gap-3'
                  )}
                >
                  {links.calendly ? (
                    <Button
                      type="button"
                      size="lg"
                      className={cn(
                        'h-12 w-full rounded-xl border-0 bg-[#0069ff] font-semibold text-white shadow-sm',
                        'hover:bg-[#0052cc] hover:text-white',
                        'focus-visible:ring-[#0069ff]/50 [&_svg]:text-white',
                        asideRowWithCalendlyAndBmc && 'sm:flex-1 sm:min-w-0'
                      )}
                      onClick={onCalendlyClick}
                    >
                      <Calendar className="h-4 w-4 opacity-95" aria-hidden />
                      {t('connect.calendlyCta')}
                    </Button>
                  ) : null}

                  {links.buymeacoffee ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className={cn(
                        'h-12 w-full rounded-xl border-border/80 bg-background font-semibold text-foreground shadow-sm',
                        'hover:border-border hover:bg-muted hover:text-foreground',
                        'dark:bg-card/80 dark:hover:bg-muted/90 dark:hover:text-foreground',
                        '[&_svg]:text-amber-600 dark:[&_svg]:text-amber-400',
                        asideRowWithCalendlyAndBmc && 'sm:flex-1 sm:min-w-0'
                      )}
                      onClick={() => setBmcModalOpen(true)}
                    >
                      <Coffee className="h-4 w-4" aria-hidden />
                      {t('connect.bmc')}
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            </ScrollReveal>
          ) : null}
        </div>
      </div>

      <BuyMeACoffeeModal
        open={bmcModalOpen}
        onClose={() => setBmcModalOpen(false)}
        href={links.buymeacoffee}
      />
    </section>
  )
}
