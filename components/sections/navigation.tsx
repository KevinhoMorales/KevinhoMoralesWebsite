'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/theme-toggle'
import { Menu } from 'lucide-react'

const navItems = [
  { name: 'About', href: '/#about' },
  { name: 'Experience', href: '/#experience' },
  { name: 'Projects', href: '/#projects' },
  { name: 'Articles', href: '/#articles' },
  { name: 'Podcast', href: '/#podcast' },
  { name: 'Speaking', href: '/#conferences' },
  { name: 'Contact', href: '/#connect' },
  { name: 'Acceso', href: '/admin/login' },
]

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/5'
          : 'bg-background/95 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 h-14 sm:h-16 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tight hover:text-primary transition-colors shrink-0 min-w-0"
        >
          <Image
            src="/images/profile-main.png"
            alt="Kevin Morales"
            width={36}
            height={36}
            className="rounded-full object-cover ring-2 ring-primary/30 w-8 h-8 sm:w-9 sm:h-9"
          />
          <span className="hidden xs:inline truncate">Kevin Morales</span>
        </Link>

        {/* Un solo ThemeToggle: evita duplicados si el CSS responsive no aplica (p. ej. Simple Browser) */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 flex-1 min-w-0">
          <ThemeToggle />
          {/* Desktop: pill links */}
          <div className="hidden lg:flex items-center gap-1 bg-secondary/30 rounded-full px-2 py-1.5 max-w-[min(100%,52vw)] overflow-x-auto shrink [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="shrink-0 px-3 xl:px-4 py-2 text-xs xl:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-colors whitespace-nowrap"
              >
                {item.name}
              </Link>
            ))}
          </div>
          {/* Mobile: menú */}
          <div className="flex lg:hidden items-center shrink-0">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Abrir menú">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(300px,85vw)] sm:w-[320px]">
                <div className="flex flex-col gap-1 mt-8">
                  {navItems.map((item) => (
                    <Button key={item.name} variant="ghost" className="justify-start text-lg h-12" asChild>
                      <Link href={item.href} onClick={() => setIsOpen(false)}>
                        {item.name}
                      </Link>
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  )
}
