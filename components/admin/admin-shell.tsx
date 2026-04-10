'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/components/admin/admin-auth-provider';
import { useI18n } from '@/components/i18n/locale-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function navLinkClass(active: boolean) {
  return cn(
    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
    active
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAdminAuth();
  const { t } = useI18n();

  const links = [
    { href: '/admin', label: t('admin.shell.home'), match: (p: string) => p === '/admin' },
    {
      href: '/admin/waitlist',
      label: t('admin.shell.waitlist'),
      match: (p: string) => p === '/admin/waitlist' || p.startsWith('/admin/waitlist/'),
    },
    {
      href: '/admin/conferences',
      label: t('admin.shell.conferences'),
      match: (p: string) => p === '/admin/conferences' || p.startsWith('/admin/conferences/'),
    },
    {
      href: '/admin/projects',
      label: t('admin.shell.projects'),
      match: (p: string) => p === '/admin/projects' || p.startsWith('/admin/projects/'),
    },
  ] as const;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-14 z-10 border-b border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <nav className="flex flex-wrap gap-1" aria-label="Admin">
            {links.map(({ href, label, match }) => (
              <Link key={href} href={href} className={navLinkClass(match(pathname))}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">{t('admin.shell.viewSite')}</Link>
            </Button>
            <Button variant="outline" size="sm" type="button" onClick={() => logout()}>
              {t('admin.shell.signOut')}
            </Button>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8 max-w-6xl">{children}</div>
    </div>
  );
}
