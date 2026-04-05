'use client';

import type { ReactNode } from 'react';

import { WaitlistModal } from './waitlist-modal';
import { WaitlistProvider } from './waitlist-context';

export function WaitlistRoot({ children }: { children: ReactNode }) {
  return (
    <WaitlistProvider>
      {children}
      <WaitlistModal />
    </WaitlistProvider>
  );
}
