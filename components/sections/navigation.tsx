'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/theme-toggle'
import { LocaleSwitcher } from '@/components/i18n/locale-switcher'
import { useI18n } from '@/components/i18n/locale-provider'
import { useWaitlist } from '@/components/waitlist/waitlist-context'
import { handleHomeHashLinkClick } from '@/lib/section-scroll'
import { cn } from '@/lib/utils'
import { ChevronDown, Menu, Sparkles } from 'lucide-react'

function NavMoreDropdown({
  items,
  admin,
  moreLabel,
  moreAria,
  pathname,
  onNavigate,
}: {
  items: { name: string; href: string }[]
  /** Si se omite, el menú solo muestra `items` (p. ej. Articles, Podcast, About). */
  admin?: { name: string; href: string }
  moreLabel: string
  moreAria: string
  pathname: string | null
  onNavigate?: () => void
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={moreAria}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-0.5 px-3 xl:px-4 py-2 text-xs xl:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-colors whitespace-nowrap"
      >
        {moreLabel}
        <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform duration-200', open && 'rotate-180')} aria-hidden />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-[100] mt-1.5 min-w-[12rem] overflow-hidden rounded-xl border border-border bg-popover py-1 text-popover-foreground shadow-lg"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className="block px-3 py-2 text-sm hover:bg-muted"
              onClick={(e) => {
                handleHomeHashLinkClick(e, pathname, item.href)
                setOpen(false)
                onNavigate?.()
              }}
            >
              {item.name}
            </Link>
          ))}
          {admin ? (
            <>
              <div className="my-1 h-px bg-border" role="separator" />
              <Link
                href={admin.href}
                role="menuitem"
                className="block px-3 py-2 text-sm hover:bg-muted"
                onClick={() => {
                  setOpen(false)
                  onNavigate?.()
                }}
              >
                {admin.name}
              </Link>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export function Navigation() {
  const { t } = useI18n()
  const pathname = usePathname()
  const { navTeaserVisible, openWaitlist, waitlistJoined } = useWaitlist()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const navMain = useMemo(
    () => [
      { name: t('nav.experience'), href: '/#experience' },
      { name: t('nav.speaking'), href: '/#conferences' },
      { name: t('nav.projects'), href: '/#projects' },
    ],
    [t]
  )

  const navMore = useMemo(
    () => [
      { name: t('nav.articles'), href: '/#articles' },
      { name: t('nav.podcast'), href: '/#podcast' },
      { name: t('nav.about'), href: '/#about' },
    ],
    [t]
  )

  const navAdmin = useMemo(
    () => ({ name: t('nav.adminLogin'), href: '/admin/login' }),
    [t]
  )

  /** CTA del libro: visible siempre (excepto admin). Siempre estilo primario (gradiente); el estado “joined” no debe apagar el CTA en la barra. */
  const showBookNav = pathname != null && !pathname.startsWith('/admin')

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-50 overflow-visible transition-all duration-300',
        isScrolled
          ? 'border-b border-border/50 bg-background/95 shadow-lg shadow-black/5 backdrop-blur-xl'
          : 'border-b border-transparent bg-background/95 backdrop-blur-md'
      )}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:h-16 sm:gap-3 sm:px-6 md:px-8 lg:px-12 xl:px-24">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2 text-lg font-bold tracking-tight transition-colors hover:text-primary sm:text-xl"
        >
          <Image
            src="/images/profile-main.png"
            alt="Kevin Morales"
            width={36}
            height={36}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/30 sm:h-9 sm:w-9"
          />
          <span
            className={cn(
              'hidden truncate',
              /* Con CTA del libro en barra: en móvil solo avatar + chip; el nombre vuelve desde sm */
              showBookNav ? 'sm:inline' : 'xs:inline'
            )}
          >
            Kevin Morales
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2">
          <div className="hidden shrink-0 items-center gap-0.5 rounded-full bg-secondary/30 px-1.5 py-1 lg:flex">
            {navMain.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-full px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground xl:px-3 xl:text-sm"
                onClick={(e) => handleHomeHashLinkClick(e, pathname, item.href)}
              >
                {item.name}
              </Link>
            ))}
            <NavMoreDropdown
              items={navMore}
              moreLabel={t('nav.more')}
              moreAria={t('nav.moreAria')}
              pathname={pathname}
            />
          </div>

          {showBookNav ? (
            <button
              type="button"
              onClick={() => openWaitlist('nav')}
              aria-label={t('nav.waitlist')}
              className={cn(
                'group relative inline-flex shrink-0 items-center rounded-full border-2 border-yellow-400 bg-gradient-to-r from-primary via-teal-600 to-primary bg-[length:200%_100%] font-semibold tracking-tight text-primary-foreground shadow-md shadow-primary/40 shadow-[0_0_0_1px_rgba(250,204,21,0.35)]',
                'gap-1.5 px-2.5 py-1.5 text-[11px] sm:gap-2 sm:px-3.5 sm:py-2 sm:text-xs',
                'animate-shimmer transition-[filter,transform] hover:brightness-110 hover:border-yellow-300 hover:shadow-lg hover:shadow-primary/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 active:scale-[0.98] dark:border-yellow-400/95'
              )}
            >
              <span className="pointer-events-none absolute -inset-px rounded-full bg-gradient-to-r from-primary/0 via-white/25 to-primary/0 opacity-0 blur-px transition-opacity group-hover:opacity-100" aria-hidden />
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary-foreground opacity-95 sm:h-4 sm:w-4" aria-hidden />
              <span className="truncate sm:hidden">{t('nav.waitlistChip')}</span>
              <span className="hidden whitespace-nowrap sm:inline">{t('nav.waitlist')}</span>
              {navTeaserVisible && !waitlistJoined ? (
                <>
                  <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 rounded-full bg-primary-foreground/90 motion-safe:animate-ping" aria-hidden />
                  <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 rounded-full bg-amber-300 ring-2 ring-primary" aria-hidden />
                </>
              ) : null}
            </button>
          ) : null}

          <span className="inline-flex shrink-0">
            <LocaleSwitcher />
          </span>
          <span className="inline-flex shrink-0">
            <ThemeToggle />
          </span>

          <div className="flex shrink-0 items-center lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('nav.openMenu')}>
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">{t('nav.toggleMenu')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(300px,85vw)] sm:w-[320px]">
                <div className="mt-8 flex flex-col gap-1">
                  {showBookNav ? (
                    <Button
                      type="button"
                      className="mb-2 h-12 gap-2 rounded-xl border-2 border-yellow-400 bg-gradient-to-r from-primary to-teal-600 font-semibold text-primary-foreground shadow-md shadow-primary/30 hover:border-yellow-300 hover:from-primary/95 hover:to-teal-600/95 dark:border-yellow-400/95"
                      onClick={() => {
                        openWaitlist('mobile_nav')
                        setIsOpen(false)
                      }}
                    >
                      <Sparkles className="h-4 w-4" aria-hidden />
                      {t('nav.waitlistBook')}
                    </Button>
                  ) : null}

                  <p className="px-3 pb-1 pt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t('nav.site')}
                  </p>
                  {navMain.map((item) => (
                    <Button key={item.href} variant="ghost" className="h-11 justify-start text-base" asChild>
                      <Link
                        href={item.href}
                        onClick={(e) => {
                          handleHomeHashLinkClick(e, pathname, item.href)
                          setIsOpen(false)
                        }}
                      >
                        {item.name}
                      </Link>
                    </Button>
                  ))}

                  <Separator className="my-2" />

                  <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t('nav.content')}
                  </p>
                  {navMore.map((item) => (
                    <Button key={item.href} variant="ghost" className="h-11 justify-start text-base" asChild>
                      <Link
                        href={item.href}
                        onClick={(e) => {
                          handleHomeHashLinkClick(e, pathname, item.href)
                          setIsOpen(false)
                        }}
                      >
                        {item.name}
                      </Link>
                    </Button>
                  ))}

                  <Separator className="my-2" />

                  <Button variant="ghost" className="h-11 justify-start text-base" asChild>
                    <Link href={navAdmin.href} onClick={() => setIsOpen(false)}>
                      {navAdmin.name}
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  )
}
