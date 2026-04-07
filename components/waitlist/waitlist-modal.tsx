'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/components/i18n/locale-provider';
import { toBcp47 } from '@/lib/i18n/bcp47';
import { getPublicWeb3FormsAccessKey } from '@/lib/web3forms-submit';
import { LAUNCH_DATE, PREORDER_END, formatPreorderDay } from '@/lib/waitlist-preorder';
import { isWaitlistAcceptingSubmissions } from '@/lib/waitlist-signups-config';

import { useWaitlist } from './waitlist-context';

const BOOK_SRC = '/images/book-waitlist.png';

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
  const { dialogOpen, setDialogOpen, markJoined } = useWaitlist();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [community, setCommunity] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setFirstName('');
    setLastName('');
    setCommunity('');
    setStatus('idle');
    setMessage(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    setDialogOpen(open);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!acceptingSignup) return;

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
          botcheck,
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        code?: string;
      };

      if (data.success && res.ok) {
        markJoined();
        const preorderDeadline = formatPreorderDay(PREORDER_END, toBcp47(locale));
        let alertMessage = t('waitlist.successAlert', { date: preorderDeadline });

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
            const full = `${fn} ${ln}`.trim();
            const lines = [
              'Nuevo registro en la lista de espera del libro.',
              '',
              `Correo: ${e}`,
              `Nombre: ${fn}`,
              `Apellido: ${ln}`,
              `Comunidad: ${org}`,
            ];
            const fd = new FormData();
            fd.append('access_key', pubKey);
            fd.append('botcheck', '');
            fd.append('name', full || e);
            fd.append('email', e);
            fd.append('from_name', full || e);
            fd.append(
              'subject',
              'Lista de espera — libro Kotlin / Swift / Dart (kevinhomorales.com)'
            );
            fd.append('message', lines.join('\n'));
            fd.append('firstName', fn);
            fd.append('lastName', ln);
            fd.append('organization', org);

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
                alertMessage += `\n\n${t('waitlist.web3NotifyFail', { detail })}`;
              }
            } catch (w3Err) {
              console.warn('[waitlist] Web3Forms fetch error:', w3Err);
              alertMessage += `\n\n${t('waitlist.web3NotifyFail', { detail: t('waitlist.errorNetwork') })}`;
            }
          }
        } else {
          console.warn(
            '[waitlist] Falta NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY: Web3Forms no recibe el envío desde el navegador.'
          );
          alertMessage += `\n\n${t('waitlist.web3KeyMissing')}`;
        }

        setStatus('idle');
        resetForm();
        setDialogOpen(false);
        window.setTimeout(() => {
          window.alert(alertMessage);
        }, 200);
        return;
      }

      setStatus('error');
      setMessage(
        data.code === 'duplicate_email'
          ? t('waitlist.duplicateEmail')
          : (data.message ?? t('waitlist.errorSend'))
      );
    } catch {
      setStatus('error');
      setMessage(t('waitlist.errorNetwork'));
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(90dvh,calc(100vh-1.25rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {acceptingSignup ? <WaitlistPreorderOffer /> : null}

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
                    className="h-11 rounded-xl border-border/80 bg-background/80"
                    aria-invalid={status === 'error'}
                  />
                </div>
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
                      className="h-11 rounded-xl border-border/80 bg-background/80"
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
                      className="h-11 rounded-xl border-border/80 bg-background/80"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="waitlist-community" className="text-sm font-medium text-foreground">
                    {t('waitlist.community')}
                    {acceptingSignup ? <span className="text-destructive"> *</span> : null}
                  </label>
                  <Input
                    id="waitlist-community"
                    name="organization"
                    type="text"
                    autoComplete="organization"
                    required={acceptingSignup}
                    placeholder={t('waitlist.communityPh')}
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    disabled={!acceptingSignup || status === 'loading'}
                    maxLength={120}
                    className="h-11 rounded-xl border-border/80 bg-background/80"
                  />
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
                  className="h-11 w-full rounded-xl font-semibold disabled:opacity-80"
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
      </DialogContent>
    </Dialog>
  );
}
