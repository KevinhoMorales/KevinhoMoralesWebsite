'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { Loader2, Mail } from 'lucide-react';
import { adminFetch } from '@/lib/admin-browser';
import { getFirebaseAuth } from '@/lib/firebase';
import type { WaitlistEntry } from '@/types/waitlist';
import { useI18n } from '@/components/i18n/locale-provider';
import { translateAdminError } from '@/lib/i18n/admin-errors';
import { WAITLIST_HEARD_FROM_VALUES } from '@/lib/waitlist-api-security';
import { ADMIN_WAITLIST_BULK_MAX } from '@/lib/waitlist-admin-bulk-constants';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

function mapBulkEmailApiError(raw: string, t: (key: string) => string): string {
  const key = `admin.waitlistPanel.emailErr_${raw}`;
  const resolved = t(key);
  if (resolved !== key) return resolved;
  return translateAdminError(raw, t);
}

export function WaitlistPanel() {
  const { t, locale } = useI18n();
  const { email: adminEmail } = useAdminAuth();
  const [list, setList] = useState<WaitlistEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<
    | null
    | { type: 'error'; message: string }
    | { type: 'ok'; sent: number; total: number; failed: { email: string; error: string }[] }
  >(null);

  const [deleteTarget, setDeleteTarget] = useState<WaitlistEntry | null>(null);
  const [credEmail, setCredEmail] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [credError, setCredError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const rowsWithEmail = useMemo(
    () => list.filter((r) => (r.email ?? '').trim().length > 0),
    [list]
  );

  const selectedInView = useMemo(
    () => rowsWithEmail.filter((r) => selectedIds.has(r.id)).length,
    [rowsWithEmail, selectedIds]
  );

  const allVisibleSelected =
    rowsWithEmail.length > 0 && selectedInView === rowsWithEmail.length;

  useEffect(() => {
    const el = selectAllRef.current;
    if (!el) return;
    el.indeterminate = selectedInView > 0 && !allVisibleSelected;
  }, [selectedInView, allVisibleSelected]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => {
        if (list.some((r) => r.id === id)) next.add(id);
      });
      return next;
    });
  }, [list]);

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
      const data = await adminFetch<{ entries: WaitlistEntry[]; totalCount: number }>(
        '/api/admin/waitlist'
      );
      setList(data.entries);
      setTotalCount(data.totalCount);
    } catch (e) {
      setList([]);
      setTotalCount(0);
      const raw = e instanceof Error ? e.message : t('admin.waitlistPanel.loadFailed');
      setError(translateAdminError(raw, t));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(rowsWithEmail.map((r) => r.id)));
  }

  const selectedRecipientCount = useMemo(() => {
    return list.filter((r) => selectedIds.has(r.id) && (r.email ?? '').trim()).length;
  }, [list, selectedIds]);

  async function sendBulkEmail() {
    setEmailFeedback(null);
    const emails = list
      .filter((r) => selectedIds.has(r.id) && (r.email ?? '').trim())
      .map((r) => r.email!.trim());
    if (emails.length === 0) {
      setEmailFeedback({ type: 'error', message: t('admin.waitlistPanel.emailNoneSelected') });
      return;
    }
    if (emails.length > ADMIN_WAITLIST_BULK_MAX) {
      setEmailFeedback({
        type: 'error',
        message: t('admin.waitlistPanel.emailTooManySelected', {
          max: String(ADMIN_WAITLIST_BULK_MAX),
        }),
      });
      return;
    }
    setEmailSending(true);
    try {
      const data = await adminFetch<{
        ok: true;
        sent: number;
        total: number;
        failed: { email: string; error: string }[];
      }>('/api/admin/waitlist/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: emails,
          subject: emailSubject,
          bodyText: emailBody,
        }),
      });
      setEmailFeedback({
        type: 'ok',
        sent: data.sent,
        total: data.total,
        failed: data.failed,
      });
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Error';
      setEmailFeedback({ type: 'error', message: mapBulkEmailApiError(raw, t) });
    } finally {
      setEmailSending(false);
    }
  }

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
          <p className="text-muted-foreground mt-1 text-sm">{t('admin.waitlistPanel.intro')}</p>
          {!loading && !error ? (
            <p className="mt-2 text-sm font-medium text-foreground">
              {t('admin.waitlistPanel.totalCount', { count: String(totalCount) })}
            </p>
          ) : null}
          {!loading && !error && totalCount > list.length ? (
            <p className="text-muted-foreground mt-1 text-xs">
              {t('admin.waitlistPanel.tableSubset', {
                shown: String(list.length),
                total: String(totalCount),
              })}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="gap-1.5"
            disabled={loading || selectedRecipientCount === 0}
            onClick={() => {
              setEmailFeedback(null);
              setEmailDialogOpen(true);
            }}
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden />
            {t('admin.waitlistPanel.emailSelected')}
            {selectedRecipientCount > 0 ? (
              <span className="ml-0.5 rounded-full bg-primary-foreground/20 px-1.5 text-xs tabular-nums">
                {selectedRecipientCount}
              </span>
            ) : null}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
            {loading ? t('admin.waitlistPanel.loading') : t('admin.waitlistPanel.refresh')}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b text-left">
              <th className="w-10 p-2 sm:p-3">
                <span className="sr-only">{t('admin.waitlistPanel.colSelect')}</span>
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  disabled={loading || rowsWithEmail.length === 0}
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  className="border-input accent-primary h-4 w-4 rounded"
                  aria-label={t('admin.waitlistPanel.selectAllVisible')}
                />
              </th>
              <th className="p-3 font-medium whitespace-nowrap">{t('admin.waitlistPanel.colEmail')}</th>
              <th className="p-3 font-medium whitespace-nowrap">{t('admin.waitlistPanel.colFirstName')}</th>
              <th className="p-3 font-medium whitespace-nowrap">{t('admin.waitlistPanel.colLastName')}</th>
              <th className="p-3 font-medium whitespace-nowrap">{t('admin.waitlistPanel.colCommunity')}</th>
              <th className="p-3 font-medium whitespace-nowrap">{t('admin.waitlistPanel.colHeardFrom')}</th>
              <th className="p-3 font-medium whitespace-nowrap">{t('admin.waitlistPanel.colCreated')}</th>
              <th className="p-3 text-right font-medium whitespace-nowrap">
                {t('admin.waitlistPanel.colActions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && !loading ? (
              <tr>
                <td colSpan={8} className="text-muted-foreground p-8 text-center">
                  {t('admin.waitlistPanel.empty')}
                </td>
              </tr>
            ) : null}
            {list.map((row) => {
              const nombre = row.firstName ?? row.displayName ?? '—';
              const apellido = row.lastName ?? '—';
              const hasEmail = (row.email ?? '').trim().length > 0;
              return (
                <tr key={row.id} className="border-border/60 border-b last:border-0">
                  <td className="p-2 align-top sm:p-3">
                    <input
                      type="checkbox"
                      disabled={!hasEmail}
                      checked={hasEmail && selectedIds.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                      className="border-input accent-primary h-4 w-4 rounded"
                      aria-label={hasEmail ? row.email : t('admin.waitlistPanel.colSelect')}
                    />
                  </td>
                  <td className="max-w-[200px] break-all p-3 align-top">{row.email || '—'}</td>
                  <td className="text-muted-foreground p-3 align-top">{nombre}</td>
                  <td className="text-muted-foreground p-3 align-top">{apellido}</td>
                  <td className="text-muted-foreground max-w-[160px] break-words p-3 align-top">
                    {row.organization || '—'}
                  </td>
                  <td className="text-muted-foreground max-w-[120px] whitespace-nowrap p-3 align-top">
                    {heardFromLabel(row.heardFrom)}
                  </td>
                  <td className="text-muted-foreground whitespace-nowrap p-3 align-top">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="p-3 text-right align-top">
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

      <Dialog
        open={emailDialogOpen}
        onOpenChange={(open) => {
          setEmailDialogOpen(open);
          if (!open) {
            setEmailFeedback(null);
          }
        }}
      >
        <DialogContent className="flex max-h-[min(90vh,720px)] flex-col sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('admin.waitlistPanel.emailDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('admin.waitlistPanel.emailDialogDesc', { max: String(ADMIN_WAITLIST_BULK_MAX) })}
            </DialogDescription>
            <p className="text-foreground pt-1 text-sm font-medium">
              {t('admin.waitlistPanel.emailDialogRecipientCount', { count: String(selectedRecipientCount) })}
            </p>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col space-y-3 overflow-y-auto py-1">
            <div className="space-y-2">
              <Label htmlFor="waitlist-bulk-subject">{t('admin.waitlistPanel.emailDialogSubject')}</Label>
              <Input
                id="waitlist-bulk-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder={t('admin.waitlistPanel.emailDialogSubjectPlaceholder')}
                disabled={emailSending}
                autoComplete="off"
              />
            </div>
            <div className="flex min-h-0 flex-1 flex-col space-y-2">
              <Label htmlFor="waitlist-bulk-body">{t('admin.waitlistPanel.emailDialogBody')}</Label>
              <Textarea
                id="waitlist-bulk-body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder={t('admin.waitlistPanel.emailDialogBodyPlaceholder')}
                disabled={emailSending}
                className="min-h-[200px] flex-1 resize-y"
              />
            </div>
            {emailFeedback?.type === 'error' ? (
              <p className="text-destructive text-sm" role="alert">
                {emailFeedback.message}
              </p>
            ) : null}
            {emailFeedback?.type === 'ok' ? (
              <div className="space-y-1 text-sm" role="status">
                <p className="font-medium text-emerald-600 dark:text-emerald-400">
                  {t('admin.waitlistPanel.emailResultOk', {
                    sent: String(emailFeedback.sent),
                    total: String(emailFeedback.total),
                  })}
                </p>
                {emailFeedback.failed.length > 0 ? (
                  <p className="text-destructive break-words">
                    {t('admin.waitlistPanel.emailResultFailures', {
                      count: String(emailFeedback.failed.length),
                      detail: emailFeedback.failed
                        .slice(0, 5)
                        .map((f) => `${f.email}: ${f.error}`)
                        .join('; '),
                    })}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setEmailDialogOpen(false)} disabled={emailSending}>
              {t('admin.common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={() => void sendBulkEmail()}
              disabled={
                emailSending ||
                selectedRecipientCount === 0 ||
                !emailSubject.trim() ||
                !emailBody.trim()
              }
            >
              {emailSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  {t('admin.waitlistPanel.emailDialogSending')}
                </>
              ) : (
                t('admin.waitlistPanel.emailDialogSend')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <p className="text-foreground break-all text-sm font-medium">{deleteTarget.email}</p>
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
                <p className="text-destructive text-sm" role="alert">
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
              {deleteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
              {t('admin.waitlistPanel.confirmDelete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
