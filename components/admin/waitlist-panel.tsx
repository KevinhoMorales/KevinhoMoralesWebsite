'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-browser';
import type { WaitlistEntry } from '@/types/waitlist';
import { useI18n } from '@/components/i18n/locale-provider';
import { translateAdminError } from '@/lib/i18n/admin-errors';
import { WAITLIST_HEARD_FROM_VALUES } from '@/lib/waitlist-api-security';
import { toBcp47 } from '@/lib/i18n/bcp47';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function WaitlistPanel() {
  const { t, locale } = useI18n();
  const [list, setList] = useState<WaitlistEntry[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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
              <th className="p-3 font-medium whitespace-nowrap">{t('admin.waitlistPanel.colUpdated')}</th>
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
                  <td className="p-3 align-top whitespace-nowrap text-muted-foreground">
                    {formatDate(row.updatedAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
