import { useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import { authenticateWithPi, isPiBrowserAvailable, initPiSdk } from '@/lib/piSdk';
import { apiClient } from '@/lib/apiClient';

export type FactionId = 'astrolabe' | 'horizon' | 'nebula' | null;

export interface PioneerProfile {
  pi_uid: string;
  username: string;
  faction: FactionId;
  commander_rank: string;
  role: 'pioneer' | 'moderator' | 'admin';
  stats: {
    games_completed: number;
    wins: number;
    losses: number;
    draws: number;
    completion_rate: number;
    sportsmanship_points: number;
    daily_signal_streak: number;
  };
  badges: string[];
  muted_users: string[];
  moderation?: {
    status: 'active' | 'chat_muted' | 'suspended';
    warning_count: number;
  };
}

interface PiLoginResponse {
  custom_token: string;
  profile: PioneerProfile;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PioneerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isPiBrowser, setIsPiBrowser] = useState(false);

  useEffect(() => {
    setIsPiBrowser(isPiBrowserAvailable());
    initPiSdk();
  }, []);

  useEffect(() => {
    if (!auth || !db || !isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser && db) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeProfile = onSnapshot(
          userRef,
          (snap) => {
            if (snap.exists()) {
              setProfile(snap.data() as PioneerProfile);
            }
            setLoading(false);
          },
          (err) => {
            console.error('[Starfield] Profile listener error:', err);
            setLoading(false);
          }
        );
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const signInWithPi = useCallback(async () => {
    setAuthError(null);
    setLoading(true);
    try {
      if (!auth || !isFirebaseConfigured) {
        throw new Error('Firebase is not configured yet. Add your Firebase keys to .env.');
      }
      const piResult = await authenticateWithPi();
      const loginResp = await apiClient.post<PiLoginResponse>(
        '/api/v1/auth/pi-login',
        { access_token: piResult.accessToken },
        false
      );
      await signInWithCustomToken(auth, loginResp.custom_token);
      setProfile(loginResp.profile);
      return loginResp.profile;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to sign in with Pi.';
      setAuthError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const selectFaction = useCallback(async (faction: Exclude<FactionId, null>) => {
    await apiClient.patch('/api/v1/profile/faction', { faction });
  }, []);

  const signOut = useCallback(async () => {
    if (auth) {
      await firebaseSignOut(auth);
    }
    setProfile(null);
  }, []);

  return {
    user,
    profile,
    loading,
    authError,
    isPiBrowser,
    signInWithPi,
    selectFaction,
    signOut,
  };
}
