'use client';

import Link from 'next/link';
import { useI18n } from '@/components/i18n/locale-provider';
import { Card } from '@/components/ui/card';

export function AdminHome() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('admin.home.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('admin.home.intro')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/analytics">
          <Card className="p-6 hover:bg-muted/50 transition-colors h-full">
            <h2 className="font-medium">{t('admin.home.analyticsTitle')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('admin.home.analyticsDesc')}</p>
          </Card>
        </Link>
        <Link href="/admin/waitlist">
          <Card className="p-6 hover:bg-muted/50 transition-colors h-full">
            <h2 className="font-medium">{t('admin.home.waitlistTitle')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('admin.home.waitlistDesc')}</p>
          </Card>
        </Link>
        <Link href="/admin/conferences">
          <Card className="p-6 hover:bg-muted/50 transition-colors">
            <h2 className="font-medium">{t('admin.home.conferencesTitle')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('admin.home.conferencesDesc')}</p>
          </Card>
        </Link>
        <Link href="/admin/projects">
          <Card className="p-6 hover:bg-muted/50 transition-colors">
            <h2 className="font-medium">{t('admin.home.projectsTitle')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('admin.home.projectsDesc')}</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
