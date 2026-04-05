'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/components/admin/admin-auth-provider';
import { LocaleSwitcher } from '@/components/i18n/locale-switcher';
import { useI18n } from '@/components/i18n/locale-provider';
import { getFirebaseAuth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLoginPage() {
  const { t } = useI18n();
  const { signIn, isAdmin, loading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [missingFirebase, setMissingFirebase] = useState(false);

  useEffect(() => {
    setMissingFirebase(!getFirebaseAuth());
  }, []);

  useEffect(() => {
    if (loading || !isAdmin) return;
    window.location.assign('/admin');
  }, [isAdmin, loading]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(email, password);
      window.location.assign('/admin');
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('admin.login.genericError');
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-12">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold">{t('admin.login.title')}</h1>
        <LocaleSwitcher />
      </div>
      <p className="text-muted-foreground text-sm mb-6">{t('admin.login.intro')}</p>
      {missingFirebase && (
        <p className="text-sm text-destructive mb-4">{t('admin.login.missingFirebase')}</p>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('admin.login.email')}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t('admin.login.password')}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <p className="text-sm text-destructive whitespace-pre-wrap break-words leading-relaxed">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? t('admin.login.signingIn') : t('admin.login.signIn')}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/" className="underline hover:text-foreground">
          {t('admin.login.backToSite')}
        </Link>
      </p>
    </main>
  );
}
