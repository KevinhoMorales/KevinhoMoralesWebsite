'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/components/admin/admin-auth-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const links = [
  { href: '/admin', label: 'Inicio' },
  { href: '/admin/conferences', label: 'Charlas' },
  { href: '/admin/projects', label: 'Proyectos' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background sticky top-14 z-10">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <nav className="flex flex-wrap gap-1">
            {links.map(({ href, label }) => {
              const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Ver sitio</Link>
            </Button>
            <Button variant="outline" size="sm" type="button" onClick={() => logout()}>
              Salir
            </Button>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8 max-w-4xl">{children}</div>
    </div>
  );
}
