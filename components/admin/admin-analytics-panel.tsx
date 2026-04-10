'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Loader2 } from 'lucide-react';
import { adminFetch } from '@/lib/admin-browser';
import { useI18n } from '@/components/i18n/locale-provider';
import { translateAdminError } from '@/lib/i18n/admin-errors';
import { WAITLIST_HEARD_FROM_VALUES } from '@/lib/waitlist-api-security';
import type { WaitlistAnalytics } from '@/lib/waitlist-analytics';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const CHART_PRIMARY = 'var(--primary)';
const CHART_GRID = 'var(--border)';
const CHART_TICK = 'var(--muted-foreground)';

export function AdminAnalyticsPanel() {
  const { t } = useI18n();
  const [data, setData] = useState<WaitlistAnalytics | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const json = await adminFetch<WaitlistAnalytics>('/api/admin/waitlist/analytics');
      setData(json);
    } catch (e) {
      setData(null);
      const raw = e instanceof Error ? e.message : t('admin.analytics.loadFailed');
      setError(translateAdminError(raw, t));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const heardFromLabel = useCallback(
    (key: string) => {
      if (!key) return t('admin.analytics.heardUnknown');
      const allowed = (WAITLIST_HEARD_FROM_VALUES as readonly string[]).filter((v) => v !== '');
      if (!allowed.includes(key)) return key;
      return t(`waitlist.heardFrom_${key}` as 'waitlist.heardFrom_site');
    },
    [t]
  );

  const heardChartData = useMemo(() => {
    if (!data) return [];
    return data.byHeardFrom.map((row) => ({
      ...row,
      label: heardFromLabel(row.key),
    }));
  }, [data, heardFromLabel]);

  const communityChartData = useMemo(() => {
    if (!data?.topCommunities.length) return [];
    return data.topCommunities.map((row) => ({
      ...row,
      shortName: row.name.length > 28 ? `${row.name.slice(0, 26)}…` : row.name,
    }));
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t('admin.analytics.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('admin.analytics.intro')}</p>
          {!loading && !error && data ? (
            <p className="text-sm text-muted-foreground mt-2">
              {t('admin.analytics.sampleNote', {
                sample: String(data.sampleSize),
                total: String(data.totalInFirestore),
              })}
            </p>
          ) : null}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden /> : null}
          {loading ? t('admin.waitlistPanel.loading') : t('admin.waitlistPanel.refresh')}
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && data && data.sampleSize === 0 ? (
        <p className="text-sm text-muted-foreground">{t('admin.waitlistPanel.empty')}</p>
      ) : null}

      {!loading && !error && data && data.sampleSize > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-4 sm:p-5 min-w-0">
              <h2 className="text-sm font-medium text-foreground mb-1">{t('admin.analytics.chartHeardFrom')}</h2>
              <p className="text-xs text-muted-foreground mb-4">{t('admin.analytics.chartHeardFromHint')}</p>
              <div className="h-[280px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={heardChartData}
                    margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} strokeOpacity={0.55} horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: CHART_TICK }} />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={112}
                      tick={{ fontSize: 11, fill: CHART_TICK }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--card)',
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" name={t('admin.analytics.tooltipCount')} fill={CHART_PRIMARY} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4 sm:p-5 min-w-0">
              <h2 className="text-sm font-medium text-foreground mb-1">{t('admin.analytics.chartCommunities')}</h2>
              <p className="text-xs text-muted-foreground mb-4">{t('admin.analytics.chartCommunitiesHint')}</p>
              {communityChartData.length === 0 ? (
                <p className="text-sm text-muted-foreground py-12 text-center">{t('admin.analytics.noCommunities')}</p>
              ) : (
                <div className="h-[280px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={communityChartData}
                      margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} strokeOpacity={0.55} horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: CHART_TICK }} />
                      <YAxis
                        type="category"
                        dataKey="shortName"
                        width={120}
                        tick={{ fontSize: 11, fill: CHART_TICK }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                          background: 'var(--card)',
                          fontSize: 12,
                        }}
                        formatter={(value: number) => [value, t('admin.analytics.tooltipCount')]}
                        labelFormatter={(_, payload) => {
                          const row = payload?.[0]?.payload as { name?: string } | undefined;
                          return row?.name ?? '';
                        }}
                      />
                      <Bar dataKey="count" name={t('admin.analytics.tooltipCount')} fill={CHART_PRIMARY} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
        </div>
      ) : null}
    </div>
  );
}
