'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

const NativeSelect = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(
  ({ className, children, disabled, ...props }, ref) => (
    <div className="relative w-full">
      <select
        ref={ref}
        disabled={disabled}
        data-slot="native-select"
        className={cn(
          'h-11 w-full min-w-0 appearance-none rounded-xl border border-border/80 bg-background/80 py-2 pl-3 pr-10 text-base text-foreground shadow-sm',
          'transition-[color,box-shadow] outline-none md:text-sm',
          'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
          !disabled && 'cursor-pointer hover:border-border',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className={cn(
          'pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground',
          disabled && 'opacity-50'
        )}
        aria-hidden
      />
    </div>
  )
);
NativeSelect.displayName = 'NativeSelect';

export { NativeSelect };
