'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { getFirebaseAuth } from '@/lib/firebase';

type AdminAuthContextValue = {
  email: string | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function mapAuthError(err: unknown): string {
  const code =
    err instanceof FirebaseError
      ? err.code
      : err && typeof err === 'object' && 'code' in err
        ? String((err as {code:string}).code)
        : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Correo o contraseña incorrectos';
    case 'auth/unauthorized-domain':
      return 'Dominio no autorizado: en Firebase Console → Authentication → Settings añade "localhost".';
    case 'auth/operation-not-allowed':
      return 'El método correo/contraseña no está activado en Firebase Authentication.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
    case 'auth/user-disabled':
      return 'Esta cuenta está deshabilitada.';
    default:
      if (err instanceof FirebaseError) return err.message || 'Error de autenticación';
      if (err instanceof Error) return err.message;
      return 'Error al iniciar sesión';
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      setEmail(null);
      setIsAdmin(false);
      return;
    }

    let unsub: (() => void) | undefined;
    const safety = window.setTimeout(() => setLoading(false), 10_000);

    void auth
      .authStateReady()
      .then(() => {
        clearTimeout(safety);
        unsub = onAuthStateChanged(auth, (user) => {
          setEmail(user?.email?.toLowerCase() ?? null);
          setIsAdmin(!!user);
          setLoading(false);
        });
      })
      .catch(() => {
        clearTimeout(safety);
        setLoading(false);
      });

    return () => {
      clearTimeout(safety);
      unsub?.();
    };
  }, []);

  const signIn = useCallback(async (loginEmail: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase no está configurado (NEXT_PUBLIC_*).');
    try {
      await signInWithEmailAndPassword(auth, loginEmail.trim(), password);
    } catch (e) {
      throw new Error(mapAuthError(e));
    }
  }, []);

  const logout = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
    setEmail(null);
    setIsAdmin(false);
    if (typeof window !== 'undefined') window.location.assign('/admin/login');
  }, []);

  const value = useMemo(
    () => ({ email, loading, isAdmin, signIn, logout }),
    [email, loading, isAdmin, signIn, logout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
