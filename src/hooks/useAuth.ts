import { useEffect, useMemo, useState } from 'react';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import type { AuthUser } from '../types';

const demoEnabled = import.meta.env.DEV && new URLSearchParams(window.location.search).has('demo');

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(
    demoEnabled ? { uid: 'demo-owner', email: 'demo@kayla.local', isDemo: true } : null,
  );
  const [loading, setLoading] = useState(!demoEnabled);

  useEffect(() => {
    if (demoEnabled) return undefined;
    const fallbackTimer = window.setTimeout(() => setLoading(false), 2500);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      window.clearTimeout(fallbackTimer);
      setUser(
        firebaseUser
          ? { uid: firebaseUser.uid, email: firebaseUser.email }
          : null,
      );
      setLoading(false);
    });
    return () => {
      window.clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, []);

  return useMemo(
    () => ({
      user,
      loading,
      isDemo: demoEnabled,
      login: async (loginId: string, password: string, remember: boolean) => {
        const email = loginId.includes('@') ? loginId.trim() : `${loginId.trim()}@gmail.com`;
        await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
        await signInWithEmailAndPassword(auth, email, password);
      },
      logout: async () => {
        if (demoEnabled) {
          window.location.href = window.location.pathname;
          return;
        }
        await firebaseSignOut(auth);
      },
    }),
    [user, loading],
  );
}
