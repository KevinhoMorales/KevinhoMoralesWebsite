'use client'

import type { ReactNode } from 'react'

import { BookLaunchModal } from './book-launch-modal'
import { BookLaunchProvider } from './book-launch-context'

export function BookLaunchRoot({ children }: { children: ReactNode }) {
  return (
    <BookLaunchProvider>
      {children}
      <BookLaunchModal />
    </BookLaunchProvider>
  )
}
