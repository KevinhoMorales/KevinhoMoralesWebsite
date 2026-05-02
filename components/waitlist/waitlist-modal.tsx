'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { logAnalyticsEvent } from '@/lib/analytics-events';
import { CheckCircle2, Loader2 } from 'lucide-react';

import { WAITLIST_HEARD_FROM_VALUES } from '@/lib/waitlist-api-security';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { useI18n } from '@/components/i18n/locale-provider';
import { toBcp47 } from '@/lib/i18n/bcp47';
import { getPublicWeb3FormsAccessKey } from '@/lib/web3forms-submit';
import {
  LAUNCH_DATE,
  PREORDER_END,
  WAITLIST_SUCCESS_EMAIL_BY_DATE,
  formatPreorderDay,
} from '@/lib/waitlist-preorder';
import { isWaitlistAcceptingSubmissions } from '@/lib/waitlist-signups-config';
import { cn } from '@/lib/utils';

import { useWaitlist } from './waitlist-context';

import { BOOK_COVER_PATH } from '@/lib/book-cover-path';

const BOOK_SRC = BOOK_COVER_PATH;

const HEARD_FROM_SELECT_KEYS = WAITLIST_HEARD_FROM_VALUES.filter((v) => v !== '');

function PreorderCountdown({ endAt }: { endAt: Date }) {
  const { t } = useI18n();
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((x) => x + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  const ms = endAt.getTime() - Date.now();
  if (ms <= 0) {
    return (
      <div className="mt-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2.5 sm:px-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{t('waitlist.preorder.ended')}</p>
      </div>
    );
  }
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const time = `${hh}:${mm}:${ss}`;
  const line =
    days > 1
      ? t('waitlist.preorder.countdownMany', { days: String(days), time })
      : days === 1
        ? t('waitlist.preorder.countdownOne', { days: '1', time })
        : t('waitlist.preorder.countdownSoon', { time });
  return (
    <div
      className="mt-2 rounded-lg border border-primary/50 bg-primary/15 px-3 py-2.5 sm:px-4 sm:py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ring-1 ring-primary/15"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm sm:text-base font-semibold text-foreground tabular-nums leading-snug tracking-tight text-balance">
        {line}
      </p>
    </div>
  );
}

function WaitlistPreorderOffer() {
  const { t, locale } = useI18n();
  const localeTag = toBcp47(locale);
  const preventaHasta = formatPreorderDay(PREORDER_END, localeTag);
  const lanzamiento = formatPreorderDay(LAUNCH_DATE, localeTag);

  return (
    <div
      className="rounded-xl border border-primary/25 bg-gradient-to-b from-primary/8 via-primary/[0.04] to-transparent px-3 py-3 sm:px-4 sm:py-3.5 shadow-[0_0_0_1px_rgba(45,212,191,0.06),0_12px_40px_-16px_rgba(45,212,191,0.35)]"
      aria-labelledby="waitlist-preorder-title"
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-md border border-primary/20 bg-primary/15 text-foreground text-[11px] uppercase tracking-wide">
          {t('waitlist.preorder.badge')}
        </Badge>
      </div>
      <h3 id="waitlist-preorder-title" className="text-[0.95rem] sm:text-base font-semibold text-foreground text-balance leading-snug">
        {t('waitlist.preorder.offerTitle')}
      </h3>
      <p className="text-sm text-muted-foreground mt-1.5 leading-snug text-pretty">
        {t('waitlist.preorder.offerBody')}
      </p>
      <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
        <li>
          <span className="text-foreground/80 font-medium">{t('waitlist.preorder.until')}</span>{' '}
          <time dateTime={PREORDER_END.toISOString()}>{preventaHasta}</time>
        </li>
        <li>
          <span className="text-foreground/80 font-medium">{t('waitlist.preorder.launch')}</span>{' '}
          <time dateTime={LAUNCH_DATE.toISOString()}>{lanzamiento}</time>
        </li>
      </ul>
      <div className="mt-3 rounded-lg border border-border/60 bg-background/40 px-2.5 py-2.5 text-sm">
        <p className="text-xs font-medium text-foreground/90">{t('waitlist.preorder.prices')}</p>
        <p className="text-muted-foreground line-through decoration-muted-foreground/70 mt-1.5">$7.99</p>
        <p className="text-lg font-semibold text-primary">$4.99</p>
      </div>
      <PreorderCountdown endAt={PREORDER_END} />
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{t('waitlist.preorder.gratitude')}</p>
    </div>
  );
}

export function WaitlistModal() {
  const { t, locale } = useI18n();
  const acceptingSignup = isWaitlistAcceptingSubmissions();
  const { dialogOpen, setDialogOpen, markJoined, waitlistOpenSource } = useWaitlist();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [community, setCommunity] = useState('');
  const [heardFrom, setHeardFrom] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [phase, setPhase] = useState<'form' | 'success'>('form');
  const [successAux, setSuccessAux] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setFirstName('');
    setLastName('');
    setCommunity('');
    setHeardFrom('');
    setStatus('idle');
    setMessage(null);
  };

  const resetModal = () => {
    resetForm();
    setPhase('form');
    setSuccessAux(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      void logAnalyticsEvent('book_waitlist_close', {
        result: phase === 'success' ? 'completed_success' : 'abandoned',
      });
      resetModal();
    }
    setDialogOpen(open);
  };

  useEffect(() => {
    if (!dialogOpen || !waitlistOpenSource) return;
    void logAnalyticsEvent('book_waitlist_open', { source: waitlistOpenSource });
  }, [dialogOpen, waitlistOpenSource]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!acceptingSignup) return;

    void logAnalyticsEvent('book_waitlist_submit_attempt', {});
    setStatus('loading');
    setMessage(null);

    const form = e.currentTarget;
    const botcheck = (form.elements.namedItem('botcheck') as HTMLInputElement)?.value ?? '';

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          organization: community.trim(),
          heardFrom,
          botcheck,
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        code?: string;
      };

      if (data.success && res.ok) {
        void logAnalyticsEvent('book_waitlist_submit', { result: 'success' });
        markJoined();
        const auxParts: string[] = [];

        const pubKey = getPublicWeb3FormsAccessKey();
        if (pubKey) {
          const trap = (form.elements.namedItem('botcheck') as HTMLInputElement)?.value ?? '';
          if (trap) {
            console.warn('[waitlist] Web3Forms omitido (botcheck)');
          } else {
            /** Inputs controlados: no usar `new FormData(form)` (React no siempre sincroniza al DOM a tiempo). */
            const fn = firstName.trim();
            const ln = lastName.trim();
            const e = email.trim();
            const org = community.trim();
            const hf = heardFrom;
            const heardFromLabel = (() => {
              const v = hf.trim();
              if (!v) return '—';
              const allowed = WAITLIST_HEARD_FROM_VALUES as readonly string[];
              if (allowed.includes(v) && v !== '') {
                return t(`waitlist.heardFrom_${v}` as 'waitlist.heardFrom_site');
              }
              return v.charAt(0).toUpperCase() + v.slice(1);
            })();
            const full = `${fn} ${ln}`.trim();
            const displayName = full || e;
            const messageBody = t('waitlist.web3FormMessage', { displayName });
            const fd = new FormData();
            fd.append('access_key', pubKey);
            fd.append('botcheck', '');
            fd.append('name', displayName);
            fd.append('email', e);
            fd.append('from_name', displayName);
            fd.append(
              'subject',
              'Lista de espera — libro Kotlin / Swift / Dart (kevinhomorales.com)'
            );
            /** Cuerpo legible para el dueño del formulario; datos pormenorizados en campos con nombre claro (Web3Forms). */
            fd.append('message', messageBody);
            fd.append('FIRSTNAME', fn);
            fd.append('LASTNAME', ln);
            fd.append('ORIGEN', heardFromLabel);
            fd.append('COMMUNITY', org || '—');

            try {
              const w3Res = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: fd,
              });
              const w3Data = (await w3Res.json()) as {
                success?: boolean;
                message?: string;
                body?: { message?: string };
              };
              if (!w3Data.success) {
                const detail =
                  w3Data.body?.message || w3Data.message || `HTTP ${w3Res.status}`;
                console.warn('[waitlist] Web3Forms:', detail);
                auxParts.push(t('waitlist.web3NotifyFail', { detail }));
              }
            } catch (w3Err) {
              console.warn('[waitlist] Web3Forms fetch error:', w3Err);
              auxParts.push(
                t('waitlist.web3NotifyFail', { detail: t('waitlist.errorNetwork') })
              );
            }
          }
        } else {
          console.warn(
            '[waitlist] Falta NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY: Web3Forms no recibe el envío desde el navegador.'
          );
          auxParts.push(t('waitlist.web3KeyMissing'));
        }

        setStatus('idle');
        resetForm();
        setSuccessAux(auxParts.length > 0 ? auxParts.join('\n\n') : null);
        setPhase('success');
        return;
      }

      setStatus('error');
      if (data.code === 'duplicate_email') {
        void logAnalyticsEvent('book_waitlist_submit', { result: 'duplicate' });
        setMessage(t('waitlist.duplicateEmail'));
      } else {
        void logAnalyticsEvent('book_waitlist_submit', { result: 'error' });
        setMessage(data.message ?? t('waitlist.errorSend'));
      }
    } catch {
      void logAnalyticsEvent('book_waitlist_submit', { result: 'network_error' });
      setStatus('error');
      setMessage(t('waitlist.errorNetwork'));
    }
  };

  const successDate = formatPreorderDay(WAITLIST_SUCCESS_EMAIL_BY_DATE, toBcp47(locale));

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[min(90dvh,calc(100vh-1.25rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl',
          'border-2 border-yellow-400 shadow-[0_0_0_1px_rgba(250,204,21,0.25)] dark:border-yellow-400/90'
        )}
        onOpenAutoFocus={(e) => {
          /** En móvil el autofocus del primer input abre el teclado al instante; el usuario prefiere ver el modal primero. */
          if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
            e.preventDefault();
          }
        }}
      >
        {phase === 'success' ? (
          <div className="flex flex-col items-center gap-4 px-6 pb-8 pt-14 text-center sm:px-10">
            <CheckCircle2 className="h-14 w-14 shrink-0 text-primary" aria-hidden />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{t('waitlist.successTitle')}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                {t('waitlist.successMessage', { date: successDate })}
              </p>
            </div>
            {successAux ? (
              <p className="w-full max-w-md text-left text-xs text-muted-foreground whitespace-pre-wrap rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                {successAux}
              </p>
            ) : null}
            <Button type="button" size="lg" className="mt-1 h-11 w-full max-w-xs rounded-xl font-semibold" onClick={() => setDialogOpen(false)}>
              {t('waitlist.successDone')}
            </Button>
          </div>
        ) : (
          <>
            <div className="shrink-0 border-b border-border/60 bg-gradient-to-br from-primary/20 via-primary/8 to-muted/40 px-5 pt-12 pb-5">
              <div className="relative mx-auto aspect-[3/2] w-full max-w-[min(100%,320px)] rounded-lg bg-card shadow-2xl shadow-primary/20 ring-2 ring-primary/25 overflow-hidden">
                <Image
                  src={BOOK_SRC}
                  alt="Portada: Dominando Kotlin, Swift y Dart — Kevin Morales"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 640px) 90vw, 320px"
                  priority
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-4 [scrollbar-gutter:stable] sm:px-6">
              <div className="flex flex-col gap-4">
                <DialogHeader className="text-left space-y-2">
                  <DialogTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-balance">
                    {t('waitlist.title')}
                  </DialogTitle>
                  <DialogDescription className="text-sm sm:text-base text-muted-foreground text-pretty leading-relaxed">
                    {t('waitlist.description')}
                  </DialogDescription>
                  <p className="text-sm font-medium text-primary/95 text-pretty leading-snug">
                    {t('waitlist.editionNote')}
                  </p>
                  {!acceptingSignup ? (
                    <p className="text-sm text-amber-600/95 dark:text-amber-400/90 text-pretty leading-snug rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2">
                      {t('waitlist.closedNotice')}
                    </p>
                  ) : null}
                </DialogHeader>

                {acceptingSignup ? (
                  <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/35 pl-3">
                    {t('waitlist.privacyNote')}
                  </p>
                ) : null}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {acceptingSignup ? <WaitlistPreorderOffer /> : null}

                  <div
                    role="group"
                    aria-labelledby="waitlist-section-contact"
                    className="space-y-4"
                  >
                    <h3
                      id="waitlist-section-contact"
                      className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {t('waitlist.sectionContact')}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2 min-w-0">
                        <label htmlFor="waitlist-first-name" className="text-sm font-medium text-foreground">
                          {t('waitlist.firstName')}
                          {acceptingSignup ? <span className="text-destructive"> *</span> : null}
                        </label>
                        <Input
                          id="waitlist-first-name"
                          name="firstName"
                          type="text"
                          autoComplete="given-name"
                          required={acceptingSignup}
                          placeholder={t('waitlist.firstNamePh')}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          disabled={!acceptingSignup || status === 'loading'}
                          maxLength={120}
                          className="h-11 rounded-xl border-border/80 bg-background/80 text-base md:text-sm"
                        />
                      </div>
                      <div className="space-y-2 min-w-0">
                        <label htmlFor="waitlist-last-name" className="text-sm font-medium text-foreground">
                          {t('waitlist.lastName')}
                          {acceptingSignup ? <span className="text-destructive"> *</span> : null}
                        </label>
                        <Input
                          id="waitlist-last-name"
                          name="lastName"
                          type="text"
                          autoComplete="family-name"
                          required={acceptingSignup}
                          placeholder={t('waitlist.lastNamePh')}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          disabled={!acceptingSignup || status === 'loading'}
                          maxLength={120}
                          className="h-11 rounded-xl border-border/80 bg-background/80 text-base md:text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="waitlist-email" className="text-sm font-medium text-foreground">
                        {t('waitlist.email')}
                        {acceptingSignup ? <span className="text-destructive"> *</span> : null}
                      </label>
                      <Input
                        id="waitlist-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        required={acceptingSignup}
                        placeholder={t('waitlist.emailPh')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!acceptingSignup || status === 'loading'}
                        className="h-11 rounded-xl border-border/80 bg-background/80 text-base md:text-sm"
                        aria-invalid={status === 'error'}
                      />
                    </div>
                  </div>

                  <div
                    role="group"
                    aria-labelledby="waitlist-section-optional"
                    className="space-y-4 border-t border-border/60 pt-4"
                  >
                    <h3
                      id="waitlist-section-optional"
                      className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {t('waitlist.sectionOptional')}
                    </h3>
                    <div className="space-y-2">
                      <label htmlFor="waitlist-heard-from" className="text-sm font-medium text-foreground">
                        {t('waitlist.heardFrom')}{' '}
                        {acceptingSignup ? (
                          <span className="font-normal text-muted-foreground">{t('waitlist.communityOptional')}</span>
                        ) : null}
                      </label>
                      <NativeSelect
                        id="waitlist-heard-from"
                        name="heardFrom"
                        value={heardFrom}
                        onChange={(e) => setHeardFrom(e.target.value)}
                        disabled={!acceptingSignup || status === 'loading'}
                      >
                        <option value="">{t('waitlist.heardFromPlaceholder')}</option>
                        {HEARD_FROM_SELECT_KEYS.map((key) => (
                          <option key={key} value={key}>
                            {t(`waitlist.heardFrom_${key}` as 'waitlist.heardFrom_site')}
                          </option>
                        ))}
                      </NativeSelect>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="waitlist-community" className="text-sm font-medium text-foreground">
                        {t('waitlist.community')}{' '}
                        {acceptingSignup ? (
                          <span className="font-normal text-muted-foreground">{t('waitlist.communityOptional')}</span>
                        ) : null}
                      </label>
                      <Input
                        id="waitlist-community"
                        name="organization"
                        type="text"
                        autoComplete="organization"
                        placeholder={t('waitlist.communityPh')}
                        value={community}
                        onChange={(e) => setCommunity(e.target.value)}
                        disabled={!acceptingSignup || status === 'loading'}
                        maxLength={120}
                        className="h-11 rounded-xl border-border/80 bg-background/80 text-base md:text-sm"
                      />
                    </div>
                  </div>

                  <input type="text" name="botcheck" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden />

                  {message && status === 'error' ? (
                    <p className="text-sm text-destructive" role="alert">
                      {message}
                    </p>
                  ) : null}

                  <Button
                    type="submit"
                    variant="default"
                    size="lg"
                    disabled={!acceptingSignup || status === 'loading'}
                    className="h-11 w-full rounded-xl border-2 border-yellow-400 font-semibold shadow-md shadow-primary/25 transition-colors hover:border-yellow-300 disabled:opacity-80 dark:border-yellow-400/90"
                  >
                    {!acceptingSignup ? (
                      t('waitlist.submitClosed')
                    ) : status === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden />
                        {t('waitlist.submitting')}
                      </>
                    ) : (
                      t('waitlist.submit')
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
