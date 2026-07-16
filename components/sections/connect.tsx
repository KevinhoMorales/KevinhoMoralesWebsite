'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from '@/components/scroll-reveal'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Coffee,
  Loader2,
  Mail,
  MessageSquare,
  Send,
  User,
} from 'lucide-react'
import { FaLinkedinIn } from 'react-icons/fa'
import { SiGithub, SiInstagram, SiMedium, SiX, SiYoutube } from 'react-icons/si'
import { BuyMeACoffeeModal } from '@/components/buymeacoffee-modal'
import { openCalendlyPopup } from '@/components/calendly-widget'
import { useI18n } from '@/components/i18n/locale-provider'
import { cn } from '@/lib/utils'
import { getPublicWeb3FormsAccessKey } from '@/lib/web3forms-submit'
import type { Profile } from '@/types'

interface ConnectProps {
  profile: Profile
}

const fieldClass = cn(
  'h-11 rounded-xl border-border/60 bg-background/60 pl-10 shadow-sm',
  'transition-[border-color,box-shadow,background-color]',
  'hover:border-primary/25 hover:bg-background/80',
  'focus-visible:border-primary/45 focus-visible:ring-[3px] focus-visible:ring-primary/15'
)

const textareaClass = cn(
  'min-h-[120px] resize-y rounded-xl border-border/60 bg-background/60 pl-10 pt-3 shadow-sm sm:min-h-[140px]',
  'transition-[border-color,box-shadow,background-color]',
  'hover:border-primary/25 hover:bg-background/80',
  'focus-visible:border-primary/45 focus-visible:ring-[3px] focus-visible:ring-primary/15'
)

const socialIconConfig = [
  { name: 'LinkedIn', icon: FaLinkedinIn, key: 'linkedin' as const },
  { name: 'X', icon: SiX, key: 'twitter' as const },
  { name: 'GitHub', icon: SiGithub, key: 'github' as const },
  { name: 'YouTube', icon: SiYoutube, key: 'youtube' as const },
  { name: 'Instagram', icon: SiInstagram, key: 'instagram' as const },
]

const cardShellClass =
  'relative overflow-hidden rounded-2xl border-border/50 bg-card/70 shadow-xl shadow-black/5 backdrop-blur-xl dark:shadow-black/25'

export function Connect({ profile }: ConnectProps) {
  const { t } = useI18n()
  const pathname = usePathname()
  const isContactPage = pathname === '/contact'
  const links = profile.socialLinks || {}
  const hasSchedulingAside = Boolean(links.calendly || links.buymeacoffee)
  const socialLinks = socialIconConfig
    .map(({ name, icon, key }) => ({ name, icon, href: links[key] }))
    .filter((item): item is { name: string; icon: typeof FaLinkedinIn; href: string } => Boolean(item.href))
  const hasSocialAside = socialLinks.length > 0 || links.medium
  const hasAside = hasSchedulingAside || hasSocialAside

  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [result, setResult] = useState('')
  const [bmcModalOpen, setBmcModalOpen] = useState(false)
  const [calendlyDialogOpen, setCalendlyDialogOpen] = useState(false)

  function onCalendlyConfirm() {
    if (!links.calendly) return
    openCalendlyPopup(links.calendly)
    setCalendlyDialogOpen(false)
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
      className={cn(
        'relative overflow-hidden px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24',
        isContactPage ? 'py-10 sm:py-16 md:py-20' : 'py-8 sm:py-20 md:py-24'
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-30%,rgba(13,148,136,0.18),transparent_55%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-30%,rgba(13,148,136,0.12),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/25 via-background to-background dark:from-secondary/15"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal className="mb-10 text-center sm:mb-12 lg:mb-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary sm:text-sm">
            {t('connect.kicker')}
          </p>
          <h2 className="mb-4 text-balance text-2xl font-bold tracking-tight sm:text-3xl md:text-5xl">
            {t('connect.title')}
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t('connect.subtitle')}
          </p>
        </ScrollReveal>

        <div
          className={cn(
            'mx-auto w-full',
            hasAside
              ? 'grid max-w-5xl items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-8 xl:gap-10'
              : 'max-w-2xl'
          )}
        >
          <ScrollReveal variant="scale" className="min-w-0">
            <Card className={cn(cardShellClass, 'gap-0 py-0')}>
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
                aria-hidden
              />
              <CardContent className="space-y-6 p-5 sm:p-6 md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                      <Mail className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h3 className="text-lg font-semibold sm:text-xl">{t('connect.formCardTitle')}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{t('connect.formCardHint')}</p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="shrink-0 rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-primary sm:text-[11px]"
                  >
                    <Clock className="mr-1 inline h-3 w-3" aria-hidden />
                    24–48h
                  </Badge>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="min-w-0 space-y-2">
                      <Label htmlFor="connect-name">{t('connect.name')}</Label>
                      <div className="relative">
                        <User
                          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
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
                    </div>
                    <div className="min-w-0 space-y-2">
                      <Label htmlFor="connect-email">{t('connect.email')}</Label>
                      <div className="relative">
                        <Mail
                          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="connect-message">{t('connect.message')}</Label>
                    <div className="relative">
                      <MessageSquare
                        className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground"
                        aria-hidden
                      />
                      <Textarea
                        id="connect-message"
                        name="message"
                        required
                        placeholder={t('connect.messagePh')}
                        disabled={status === 'sending'}
                        className={textareaClass}
                      />
                    </div>
                  </div>

                  {result ? (
                    <div
                      className={cn(
                        'flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm',
                        status === 'success'
                          ? 'border-primary/25 bg-primary/10 text-primary'
                          : 'border-destructive/25 bg-destructive/10 text-destructive'
                      )}
                      role="status"
                    >
                      {status === 'success' ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      ) : null}
                      <p>{result}</p>
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 w-full gap-2 rounded-xl font-semibold shadow-md shadow-primary/15"
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        {t('connect.sending')}
                      </>
                    ) : (
                      <>
                        {t('connect.send')}
                        <Send className="h-4 w-4" aria-hidden />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </ScrollReveal>

          {hasAside ? (
            <ScrollReveal delay={0.08} variant="scale" className="min-w-0">
              <div className="flex flex-col gap-4">
                {links.calendly ? (
                  <button
                    type="button"
                    onClick={() => setCalendlyDialogOpen(true)}
                    className={cn(
                      cardShellClass,
                      'group w-full border-border/50 p-5 text-left transition-[border-color,transform,box-shadow]',
                      'hover:-translate-y-0.5 hover:border-[#0069ff]/35 hover:shadow-2xl hover:shadow-[#0069ff]/10 sm:p-6'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0069ff]/15 text-[#0069ff] ring-1 ring-[#0069ff]/20">
                        <Calendar className="h-5 w-5" aria-hidden />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h3 className="text-base font-semibold sm:text-lg">{t('connect.asideTitle')}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{t('connect.asideBody')}</p>
                        <span className="inline-flex items-center gap-1 pt-2 text-sm font-medium text-[#0069ff] transition-colors group-hover:text-[#0052cc]">
                          {t('connect.calendlyCta')}
                          <Send className="h-3.5 w-3.5 rotate-[-45deg]" aria-hidden />
                        </span>
                      </div>
                    </div>
                  </button>
                ) : null}

                {links.buymeacoffee ? (
                  <button
                    type="button"
                    onClick={() => setBmcModalOpen(true)}
                    className={cn(
                      cardShellClass,
                      'group w-full border-border/50 p-5 text-left transition-[border-color,transform,box-shadow]',
                      'hover:-translate-y-0.5 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/10 sm:p-6'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-400">
                        <Coffee className="h-5 w-5" aria-hidden />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h3 className="text-base font-semibold sm:text-lg">{t('connect.bmcTitle')}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{t('connect.bmcBody')}</p>
                        <span className="inline-flex items-center gap-1 pt-2 text-sm font-medium text-amber-600 transition-colors group-hover:text-amber-500 dark:text-amber-400">
                          {t('connect.bmc')}
                          <Send className="h-3.5 w-3.5 rotate-[-45deg]" aria-hidden />
                        </span>
                      </div>
                    </div>
                  </button>
                ) : null}

                {hasSocialAside ? (
                  <Card className={cn(cardShellClass, 'gap-0 py-0')}>
                    <CardContent className="p-5 sm:p-6">
                      <p className="mb-4 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
                        {t('connect.socialLabel')}
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        {socialLinks.map(({ name, icon: Icon, href }) => (
                          <a
                            key={name}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={name}
                            aria-label={name}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background/50 text-foreground transition-[transform,border-color,background-color] hover:scale-105 hover:border-primary/30 hover:bg-primary/10"
                          >
                            <Icon className="h-4 w-4" />
                          </a>
                        ))}
                        {links.medium ? (
                          <a
                            href={links.medium}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Medium"
                            aria-label="Medium"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background/50 text-foreground transition-[transform,border-color,background-color] hover:scale-105 hover:border-primary/30 hover:bg-primary/10"
                          >
                            <SiMedium className="h-4 w-4" />
                          </a>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            </ScrollReveal>
          ) : null}
        </div>
      </div>

      <AlertDialog open={calendlyDialogOpen} onOpenChange={setCalendlyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('connect.asideTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('hero.calendlyConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('hero.cvDialogCancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={onCalendlyConfirm}>{t('connect.calendlyCta')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BuyMeACoffeeModal
        open={bmcModalOpen}
        onClose={() => setBmcModalOpen(false)}
        href={links.buymeacoffee}
      />
    </section>
  )
}
