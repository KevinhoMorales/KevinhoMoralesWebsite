'use client';

import { useCallback, useEffect, useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { Loader2 } from 'lucide-react';
import { adminFetch } from '@/lib/admin-browser';
import { getFirebaseAuth } from '@/lib/firebase';
import type { WaitlistEntry } from '@/types/waitlist';
import { useI18n } from '@/components/i18n/locale-provider';
import { translateAdminError } from '@/lib/i18n/admin-errors';
import { WAITLIST_HEARD_FROM_VALUES } from '@/lib/waitlist-api-security';
import { toBcp47 } from '@/lib/i18n/bcp47';
import { useAdminAuth } from '@/components/admin/admin-auth-provider';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

function mapReauthError(err: unknown, t: (key: string) => string): string {
  const code =
    err instanceof FirebaseError
      ? err.code
      : err && typeof err === 'object' && 'code' in err
        ? String((err as { code: string }).code)
        : '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return t('admin.waitlistPanel.credentialInvalid');
    case 'auth/too-many-requests':
      return t('admin.waitlistPanel.credentialTooMany');
    default:
      if (err instanceof Error) return err.message;
      return t('admin.waitlistPanel.deleteFailed');
  }
}

export function WaitlistPanel() {
  const { t, locale } = useI18n();
  const { email: adminEmail } = useAdminAuth();
  const [list, setList] = useState<WaitlistEntry[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<WaitlistEntry | null>(null);
  const [credEmail, setCredEmail] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [credError, setCredError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (deleteTarget) {
      setCredEmail((adminEmail ?? '').trim());
      setCredPassword('');
      setCredError('');
    }
  }, [deleteTarget, adminEmail]);

  const formatDate = useCallback(
    (iso: string | null) => {
      if (!iso) return '—';
      try {
        return new Date(iso).toLocaleString(toBcp47(locale), {
          dateStyle: 'short',
          timeStyle: 'short',
        });
      } catch {
        return iso;
      }
    },
    [locale]
  );

  const heardFromLabel = useCallback(
    (key: string | undefined) => {
      if (!key) return '—';
      const allowed = (WAITLIST_HEARD_FROM_VALUES as readonly string[]).filter((v) => v !== '');
      if (!allowed.includes(key)) return key;
      return t(`waitlist.heardFrom_${key}` as 'waitlist.heardFrom_site');
    },
    [t]
  );

  const refresh = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const rows = await adminFetch<WaitlistEntry[]>('/api/admin/waitlist');
      setList(rows);
    } catch (e) {
      setList([]);
      const raw = e instanceof Error ? e.message : t('admin.waitlistPanel.loadFailed');
      setError(translateAdminError(raw, t));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function confirmDeleteWaitlist() {
    if (!deleteTarget) return;
    setCredError('');
    const email = credEmail.trim();
    const password = credPassword;
    if (!email || !password) {
      setCredError(t('admin.waitlistPanel.credentialRequired'));
      return;
    }

    setDeleteLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth?.currentUser) {
        setCredError(t('admin.waitlistPanel.credentialInvalid'));
        return;
      }
      await reauthenticateWithCredential(
        auth.currentUser,
        EmailAuthProvider.credential(email, password)
      );
      await adminFetch<{ ok: boolean }>(
        `/api/admin/waitlist/${encodeURIComponent(deleteTarget.id)}`,
        { method: 'DELETE' }
      );
      setDeleteTarget(null);
      await refresh();
    } catch (e) {
      if (e instanceof FirebaseError) {
        setCredError(mapReauthError(e, t));
      } else {
        const raw = e instanceof Error ? e.message : t('admin.waitlistPanel.deleteFailed');
        setCredError(translateAdminError(raw, t));
      }
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t('admin.waitlistPanel.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('admin.waitlistPanel.intro')}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
          {loading ? t('admin.waitlistPanel.loading') : t('admin.waitlistPanel.refresh')}
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="p-3 font-medium whitespace-nowrap">{t('admin.waitlistPanel.colEmail')}</th>
              <th className="p-3 font-medium whitespace-nowrap">{t('admin.waitlistPanel.colFirstName')}</th>
              <th className="p-3 font-medium whitespace-nowrap">{t('admin.waitlistPanel.colLastName')}</th>
              <th className="p-3 font-medium whitespace-nowrap">{t('admin.waitlistPanel.colCommunity')}</th>
              <th className="p-3 font-medium whitespace-nowrap">{t('admin.waitlistPanel.colHeardFrom')}</th>
              <th className="p-3 font-medium whitespace-nowrap">{t('admin.waitlistPanel.colCreated')}</th>
              <th className="p-3 font-medium whitespace-nowrap text-right">{t('admin.waitlistPanel.colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && !loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  {t('admin.waitlistPanel.empty')}
                </td>
              </tr>
            ) : null}
            {list.map((row) => {
              const nombre = row.firstName ?? row.displayName ?? '—';
              const apellido = row.lastName ?? '—';
              return (
                <tr key={row.id} className="border-b border-border/60 last:border-0">
                  <td className="p-3 align-top break-all max-w-[200px]">{row.email || '—'}</td>
                  <td className="p-3 align-top text-muted-foreground">{nombre}</td>
                  <td className="p-3 align-top text-muted-foreground">{apellido}</td>
                  <td className="p-3 align-top text-muted-foreground max-w-[160px] break-words">
                    {row.organization || '—'}
                  </td>
                  <td className="p-3 align-top text-muted-foreground max-w-[120px] whitespace-nowrap">
                    {heardFromLabel(row.heardFrom)}
                  </td>
                  <td className="p-3 align-top whitespace-nowrap text-muted-foreground">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="p-3 align-top text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/40 hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(row)}
                    >
                      {t('admin.waitlistPanel.delete')}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleteLoading) {
            setDeleteTarget(null);
            setCredPassword('');
            setCredError('');
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.waitlistPanel.confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('admin.waitlistPanel.confirmDeleteDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          {deleteTarget ? (
            <div className="space-y-3 text-left">
              <p className="text-sm font-medium text-foreground break-all">{deleteTarget.email}</p>
              <div className="space-y-2">
                <Label htmlFor="waitlist-delete-email">{t('admin.waitlistPanel.labelAdminEmail')}</Label>
                <Input
                  id="waitlist-delete-email"
                  type="email"
                  autoComplete="email"
                  value={credEmail}
                  onChange={(e) => setCredEmail(e.target.value)}
                  disabled={deleteLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waitlist-delete-password">{t('admin.waitlistPanel.labelPassword')}</Label>
                <Input
                  id="waitlist-delete-password"
                  type="password"
                  autoComplete="current-password"
                  value={credPassword}
                  onChange={(e) => setCredPassword(e.target.value)}
                  disabled={deleteLoading}
                />
              </div>
              {credError ? (
                <p className="text-sm text-destructive" role="alert">
                  {credError}
                </p>
              ) : null}
            </div>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>{t('admin.common.cancel')}</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteLoading || !deleteTarget}
              onClick={() => void confirmDeleteWaitlist()}
            >
              {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden /> : null}
              {t('admin.waitlistPanel.confirmDelete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
