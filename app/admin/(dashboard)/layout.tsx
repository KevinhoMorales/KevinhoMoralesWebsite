import { AuthGate } from '@/components/admin/auth-gate';
import { AdminShell } from '@/components/admin/admin-shell';

/** Sesión en cliente (Firebase Auth); forzar dinámico evita HTML estático obsoleto del shell. */
export const dynamic = 'force-dynamic';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <AdminShell>{children}</AdminShell>
    </AuthGate>
  );
}
