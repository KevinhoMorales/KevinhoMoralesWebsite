'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import {
  safeLocalGet,
  safeLocalRemove,
  safeLocalSet,
  safeSessionGet,
  safeSessionSet,
} from '@/components/waitlist/waitlist-storage';
import { isWaitlistAutoPopupAllowed } from '@/lib/waitlist-signups-config';

const STORAGE_DISMISSED = 'km-waitlist-dismissed-v1';
const STORAGE_JOINED = 'km-waitlist-joined-v1';
const SESSION_POPUP_KEY = 'km-waitlist-session-popup-v1';

type WaitlistContextValue = {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  /** Origen de la última apertura del modal (analytics). */
  waitlistOpenSource: 'nav' | 'mobile_nav' | 'auto' | null;
  /** Usuario ya envió el formulario (no mostrar CTA). */
  waitlistJoined: boolean;
  /** Cerró el modal sin unirse: puede usarse para resaltar el CTA en nav. */
  navTeaserVisible: boolean;
  openWaitlist: (source?: 'nav' | 'mobile_nav') => void;
  markJoined: () => void;
};

const WaitlistContext = createContext<WaitlistContextValue | null>(null);

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [waitlistOpenSource, setWaitlistOpenSource] = useState<'nav' | 'mobile_nav' | 'auto' | null>(null);
  const [waitlistJoined, setWaitlistJoined] = useState(false);
  const [navTeaserVisible, setNavTeaserVisible] = useState(false);

  const syncFromStorage = useCallback(() => {
    const joined = safeLocalGet(STORAGE_JOINED) === '1';
    const dismissed = safeLocalGet(STORAGE_DISMISSED) === '1';
    setWaitlistJoined(joined);
    setNavTeaserVisible(dismissed && !joined);
    return { joined, dismissed };
  }, []);

  useEffect(() => {
    syncFromStorage();
  }, [syncFromStorage]);

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    if (!isWaitlistAutoPopupAllowed()) return;

    const joined = safeLocalGet(STORAGE_JOINED) === '1';
    const dismissed = safeLocalGet(STORAGE_DISMISSED) === '1';
    if (joined || dismissed) return;
    if (safeSessionGet(SESSION_POPUP_KEY) === '1') return;

    const timer = window.setTimeout(() => {
      safeSessionSet(SESSION_POPUP_KEY, '1');
      setWaitlistOpenSource('auto');
      setDialogOpen(true);
    }, 2600);
    return () => clearTimeout(timer);
  }, [pathname]);

  const recordDismiss = useCallback(() => {
    if (safeLocalGet(STORAGE_JOINED) === '1') return;
    safeLocalSet(STORAGE_DISMISSED, '1');
    setNavTeaserVisible(true);
  }, []);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      setDialogOpen(open);
      if (!open) {
        setWaitlistOpenSource(null);
        recordDismiss();
      }
    },
    [recordDismiss]
  );

  const openWaitlist = useCallback((source: 'nav' | 'mobile_nav' = 'nav') => {
    setWaitlistOpenSource(source);
    setDialogOpen(true);
  }, []);

  const markJoined = useCallback(() => {
    safeLocalSet(STORAGE_JOINED, '1');
    safeLocalRemove(STORAGE_DISMISSED);
    setWaitlistJoined(true);
    setNavTeaserVisible(false);
  }, []);

  const value: WaitlistContextValue = {
    dialogOpen,
    setDialogOpen: handleDialogOpenChange,
    waitlistOpenSource,
    waitlistJoined,
    navTeaserVisible,
    openWaitlist,
    markJoined,
  };

  return <WaitlistContext.Provider value={value}>{children}</WaitlistContext.Provider>;
}

export function useWaitlist() {
  const ctx = useContext(WaitlistContext);
  if (!ctx) throw new Error('useWaitlist must be used within WaitlistProvider');
  return ctx;
}
