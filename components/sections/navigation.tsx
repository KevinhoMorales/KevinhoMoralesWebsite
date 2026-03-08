'use client'

import Image from 'next/image'
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
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 h-14 sm:h-16 flex items-center justify-between">
        <a
          href="/"
          className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tight hover:text-primary transition-colors"
        >
          <Image
            src="/images/profile-main.png"
            alt="Kevin Morales"
            width={36}
            height={36}
            className="rounded-full object-cover ring-2 ring-primary/30 w-8 h-8 sm:w-9 sm:h-9"
          />
          <span className="hidden xs:inline">Kevin Morales</span>
        </a>

        <div className="hidden lg:flex items-center gap-2">
          <ThemeToggle />
          <div className="flex items-center gap-1 bg-secondary/30 rounded-full px-2 py-1.5">
          {navItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="px-3 xl:px-4 py-2 text-xs xl:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-colors"
          >
              {item.name}
            </a>
          ))}
          </div>
        </div>

        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(300px,85vw)] sm:w-[320px]">
            <div className="flex flex-col gap-1 mt-8">
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className="justify-start text-lg h-12"
                  onClick={() => setIsOpen(false)}
                  asChild
                >
                  <a href={item.href}>{item.name}</a>
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        </div>
      </nav>
    </header>
  )
}
