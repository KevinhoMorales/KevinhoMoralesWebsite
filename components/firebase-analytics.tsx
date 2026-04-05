'use client';

import { useEffect } from 'react';
import { getFirebaseAnalytics } from '@/lib/firebase';

export function FirebaseAnalytics() {
  useEffect(() => {
    void getFirebaseAnalytics().catch(() => {
      /* Analytics opcional; config inválida no debe tumbar la página */
    });
  }, []);
  return null;
}
