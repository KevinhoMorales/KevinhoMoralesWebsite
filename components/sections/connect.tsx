'use client'

import { useState, type ReactNode } from 'react'
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
  Lightbulb,
  Loader2,
  Mail,
  MessageSquare,
  Send,
  User,
} from 'lucide-react'
import { BuyMeACoffeeModal } from '@/components/buymeacoffee-modal'
import { openCalendlyPopup } from '@/components/calendly-widget'
import { useI18n } from '@/components/i18n/locale-provider'
import { cn } from '@/lib/utils'
import { getPublicWeb3FormsAccessKey } from '@/lib/web3forms-submit'
import { SECTION_PADDING_X, SECTION_PADDING_Y_CONNECT_HOME } from '@/lib/section-layout'
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

const cardShellClass =
  'relative overflow-hidden rounded-2xl border border-border/50 bg-card/70 shadow-xl shadow-black/5 backdrop-blur-xl dark:shadow-black/25'

const asideCardContentClass = 'p-5 sm:p-6'

const asideIconWrapClass = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1'

const asideTitleClass = 'text-lg font-semibold leading-tight sm:text-xl'

const asideBodyClass = 'text-sm leading-relaxed text-muted-foreground'

type ConnectAsideCardProps = {
  icon: ReactNode
  iconWrapClassName: string
  title: string
  body: string
  onClick?: () => void
  cta?: { label: string; className: string }
  cardHoverClassName?: string
  children?: ReactNode
}

function ConnectAsideCard({
  icon,
  iconWrapClassName,
  title,
  body,
  onClick,
  cta,
  cardHoverClassName,
  children,
}: ConnectAsideCardProps) {
  const interactive = Boolean(onClick)

  return (
    <Card
      className={cn(
        cardShellClass,
        'gap-0 py-0',
        interactive &&
          cn(
            'group cursor-pointer transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:shadow-2xl',
            cardHoverClassName
          )
      )}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        aria-hidden
      />
      <CardContent className={asideCardContentClass}>
        <div className="flex items-start gap-3 sm:gap-4">
          <div className={cn(asideIconWrapClass, iconWrapClassName)}>{icon}</div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className={asideTitleClass}>{title}</h3>
            <p className={asideBodyClass}>{body}</p>
            {cta ? (
              <span className={cn('inline-flex items-center gap-1 pt-2 text-sm font-medium', cta.className)}>
                {cta.label}
                <Send className="h-3.5 w-3.5 rotate-[-45deg]" aria-hidden />
              </span>
            ) : null}
          </div>
        </div>
        {children ? <div className="mt-4 border-t border-border/40 pt-4">{children}</div> : null}
      </CardContent>
    </Card>
  )
}

const helpTopicKeys = [
  'connect.helpTopicMobile',
  'connect.helpTopicSpeaking',
  'connect.helpTopicPodcast',
  'connect.helpTopicMentoring',
] as const

export function Connect({ profile }: ConnectProps) {
  const { t } = useI18n()
  const pathname = usePathname()
  const isContactPage = pathname === '/contact'
  const links = profile.socialLinks || {}

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
        'relative overflow-hidden',
        SECTION_PADDING_X,
        isContactPage ? 'py-8 sm:py-12 md:py-16' : SECTION_PADDING_Y_CONNECT_HOME
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

        <div className="mx-auto grid w-full max-w-5xl items-stretch gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-6 xl:gap-8">
          <ScrollReveal variant="scale" className="flex h-full min-w-0 w-full">
            <Card className={cn(cardShellClass, 'h-full w-full gap-0 py-0')}>
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

          <ScrollReveal delay={0.08} variant="scale" className="flex h-full min-w-0 w-full">
            <div className="flex h-full w-full flex-col gap-4 sm:gap-5">
              {links.calendly ? (
                <ConnectAsideCard
                  icon={<Calendar className="h-5 w-5" aria-hidden />}
                  iconWrapClassName="bg-[#0069ff]/15 text-[#0069ff] ring-[#0069ff]/20"
                  cardHoverClassName="hover:border-[#0069ff]/35 hover:shadow-[#0069ff]/10"
                  title={t('connect.asideTitle')}
                  body={t('connect.asideBody')}
                  onClick={() => setCalendlyDialogOpen(true)}
                  cta={{
                    label: t('connect.calendlyCta'),
                    className: 'text-[#0069ff] transition-colors group-hover:text-[#0052cc]',
                  }}
                />
              ) : null}

              {links.buymeacoffee ? (
                <ConnectAsideCard
                  icon={<Coffee className="h-5 w-5" aria-hidden />}
                  iconWrapClassName="bg-amber-500/15 text-amber-600 ring-amber-500/20 dark:text-amber-400"
                  cardHoverClassName="hover:border-amber-500/30 hover:shadow-amber-500/10"
                  title={t('connect.bmcTitle')}
                  body={t('connect.bmcBody')}
                  onClick={() => setBmcModalOpen(true)}
                  cta={{
                    label: t('connect.bmc'),
                    className: 'text-amber-600 transition-colors group-hover:text-amber-500 dark:text-amber-400',
                  }}
                />
              ) : null}

              <ConnectAsideCard
                icon={<Lightbulb className="h-5 w-5" aria-hidden />}
                iconWrapClassName="bg-primary/10 text-primary ring-primary/15"
                title={t('connect.helpTitle')}
                body={t('connect.helpBody')}
              >
                <ul className="space-y-2.5">
                  {helpTopicKeys.map((key) => (
                    <li key={key} className="flex items-start gap-2.5 text-sm text-foreground/90">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </ConnectAsideCard>
            </div>
          </ScrollReveal>
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
