
"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User as AppUser } from '@/lib/types';

interface AuthState {
    user: (FirebaseUser & AppUser) | null;
    loading: boolean;
    isAdmin: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
      user: null,
      loading: true,
      isAdmin: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, get their app-specific data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const appUser = userDoc.data() as AppUser;
          setAuthState({
              user: { ...firebaseUser, ...appUser },
              loading: false,
              isAdmin: appUser.role === 'admin'
          });
        } else {
          // This case might happen if user exists in Auth but not Firestore
          // This could be an error state, or you might create the doc here.
          // For now, we'll treat it as not fully logged in.
          setAuthState({ user: null, loading: false, isAdmin: false });
        }
      } else {
        // User is signed out
        setAuthState({ user: null, loading: false, isAdmin: false });
      }
    });

    return () => unsubscribe();
  }, []);

  return authState;
}
