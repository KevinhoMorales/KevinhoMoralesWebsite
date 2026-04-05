'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/components/admin/admin-auth-provider';
import { useI18n } from '@/components/i18n/locale-provider';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin } = useAdminAuth();
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      router.replace('/admin/login');
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        {t('admin.authGate.loading')}
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 px-4 text-center text-muted-foreground">
        <p>{t('admin.authGate.redirecting')}</p>
      </div>
    );
  }

  return <>{children}</>;
}
