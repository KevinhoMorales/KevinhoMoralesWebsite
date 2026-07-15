'use client'

import type { ReactNode } from 'react'
import { Search } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type BrowseListModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  showSearch?: boolean
  toolbar?: ReactNode
  emptyMessage?: string
  isEmpty?: boolean
  children: ReactNode
}

export function BrowseListModal({
  open,
  onOpenChange,
  title,
  description,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  showSearch = true,
  toolbar,
  emptyMessage,
  isEmpty = false,
  children,
}: BrowseListModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[min(90dvh,calc(100vh-1.25rem))] flex-col gap-0 overflow-hidden p-0',
          'sm:max-w-5xl md:max-w-6xl'
        )}
        onOpenAutoFocus={(e) => {
          if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
            e.preventDefault()
          }
        }}
      >
        <div className="shrink-0 border-b border-border/60 px-5 pt-12 pb-4 sm:px-6">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-balance pr-8">
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription className="text-sm text-muted-foreground text-pretty">
                {description}
              </DialogDescription>
            ) : (
              <DialogDescription className="sr-only">{title}</DialogDescription>
            )}
          </DialogHeader>

          {showSearch ? (
            <div className="relative mt-4">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          ) : null}

          {toolbar ? <div className="mt-4">{toolbar}</div> : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 [scrollbar-gutter:stable]">
          {isEmpty && emptyMessage ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
          ) : (
            children
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
