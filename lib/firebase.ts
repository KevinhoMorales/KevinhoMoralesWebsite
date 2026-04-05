import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return null;
  if (!app) {
    try {
      app = getApps().length ? (getApps()[0] as FirebaseApp) : initializeApp(firebaseConfig);
    } catch (e) {
      console.error('[firebase] initializeApp failed:', e);
      return null;
    }
  }
  return app;
}

export function getFirebaseDb(): Firestore | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!db) db = getFirestore(firebaseApp);
  return db;
}

export function getFirebaseAuth(): Auth | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!auth) auth = getAuth(firebaseApp);
  return auth;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!storage) storage = getStorage(firebaseApp);
  return storage;
}

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null;
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp || !firebaseConfig.measurementId) return null;
  if (!analytics && (await isSupported())) {
    analytics = getAnalytics(firebaseApp);
  }
  return analytics;
}

/** Vista de página en navegación cliente (App Router); el primer paint lo cubre el SDK de Analytics. */
export async function logAnalyticsPageView(pathWithSearch: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const a = await getFirebaseAnalytics();
    if (!a) return;
    const { logEvent } = await import('firebase/analytics');
    logEvent(a, 'page_view', {
      page_path: pathWithSearch,
      page_location: window.location.href,
      page_title: typeof document !== 'undefined' ? document.title : undefined,
    });
  } catch {
    /* opcional */
  }
}

export const COLLECTIONS = {
  PODCAST_CACHE: 'podcast_cache',
  ANALYTICS: 'analytics',
  CONTENT: 'content',
} as const;
