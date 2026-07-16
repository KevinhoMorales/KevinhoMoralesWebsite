'use client'

import { useState } from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { resolveInitialTheme, THEME_STORAGE_KEY } from '@/lib/theme-default'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [defaultTheme] = useState<'light' | 'dark'>(() => resolveInitialTheme())

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={false}
      storageKey={THEME_STORAGE_KEY}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
