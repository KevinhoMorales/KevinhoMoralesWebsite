'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/components/admin/admin-auth-provider';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      router.replace('/admin/login');
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        Cargando…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 px-4 text-center text-muted-foreground">
        <p>Redirigiendo al inicio de sesión…</p>
      </div>
    );
  }

  return <>{children}</>;
}
