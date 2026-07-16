import { cn } from '@/lib/utils'

type FilterChipRowProps = {
  children: React.ReactNode
  className?: string
}

export function FilterChipRow({ children, className }: FilterChipRowProps) {
  return (
    <div
      className={cn(
        'flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 snap-x scrollbar-none',
        'sm:flex-wrap sm:overflow-visible sm:mx-0 sm:px-0',
        className
      )}
    >
      {children}
    </div>
  )
}

export const filterChipClass =
  'shrink-0 h-7 px-2.5 text-xs gap-1.5 sm:h-8 sm:px-3 sm:gap-2 [&_svg]:hidden sm:[&_svg]:inline'
