'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import { safeLocalGet, safeLocalSet } from '@/components/waitlist/waitlist-storage'

const STORAGE_SEEN = 'km-book-launch-seen-v1'
const AUTO_OPEN_DELAY_MS = 2600

type BookLaunchContextValue = {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  markSeen: () => void
}

const BookLaunchContext = createContext<BookLaunchContextValue | null>(null)

export function BookLaunchProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [dialogOpen, setDialogOpenState] = useState(false)

  const markSeen = useCallback(() => {
    safeLocalSet(STORAGE_SEEN, '1')
  }, [])

  const setDialogOpen = useCallback(
    (open: boolean) => {
      setDialogOpenState(open)
      if (!open) markSeen()
    },
    [markSeen]
  )

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return
    if (safeLocalGet(STORAGE_SEEN) === '1') return

    const timer = window.setTimeout(() => {
      if (safeLocalGet(STORAGE_SEEN) === '1') return
      setDialogOpenState(true)
    }, AUTO_OPEN_DELAY_MS)

    return () => clearTimeout(timer)
  }, [pathname])

  const value: BookLaunchContextValue = {
    dialogOpen,
    setDialogOpen,
    markSeen,
  }

  return <BookLaunchContext.Provider value={value}>{children}</BookLaunchContext.Provider>
}

export function useBookLaunch() {
  const ctx = useContext(BookLaunchContext)
  if (!ctx) throw new Error('useBookLaunch must be used within BookLaunchProvider')
  return ctx
}
