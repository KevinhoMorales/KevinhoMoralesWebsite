'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/i18n/locale-provider';
import { cn } from '@/lib/utils';

function tabClass(active: boolean) {
  return cn(
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    active
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  );
}

export function WaitlistSubnav() {
  const pathname = usePathname();
  const { t } = useI18n();

  /** Solo la raíz /admin/waitlist es “Registros”; /admin/waitlist/analytics es analíticas. */
  const isRegistrations = pathname === '/admin/waitlist';
  const isAnalytics =
    pathname === '/admin/waitlist/analytics' || pathname.startsWith('/admin/waitlist/analytics/');

  return (
    <nav
      className="mb-6 flex flex-wrap items-center gap-1 rounded-xl border border-border/60 bg-muted/20 p-1"
      aria-label={t('admin.shell.waitlist')}
    >
      <Link href="/admin/waitlist" className={tabClass(isRegistrations)}>
        {t('admin.shell.waitlistRegistrations')}
      </Link>
      <Link href="/admin/waitlist/analytics" className={tabClass(isAnalytics)}>
        {t('admin.shell.analytics')}
      </Link>
    </nav>
  );
}
