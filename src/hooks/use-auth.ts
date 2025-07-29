
"use client";

import { useEffect, useState, useContext } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User as AppUser } from '@/lib/types';
import { AuthContext } from '@/hooks/use-auth-provider';


export type AuthUser = FirebaseUser & AppUser;

export interface AuthState {
    user: AuthUser | null;
    loading: boolean;
    isAdmin: boolean;
}

// This is the hook that will be used by components
export function useAuth(): AuthState {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}


// This is the internal hook that provides the auth state
export function useAuthProvider(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
      user: null,
      loading: true,
      isAdmin: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in.
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const appUser = userDoc.data() as AppUser;
            setAuthState({
              user: { ...firebaseUser, ...appUser, id: userDoc.id },
              loading: false,
              isAdmin: appUser.role === 'admin'
            });
          } else {
             // This case might happen if a user exists in Auth but not Firestore
            // For example, if the signup process was interrupted.
            // We treat them as not fully logged in.
            setAuthState({ user: null, loading: false, isAdmin: false });
          }
        } catch (error) {
           console.error("Error fetching user data:", error);
           setAuthState({ user: null, loading: false, isAdmin: false });
        }
      } else {
        // User is signed out.
        setAuthState({ user: null, loading: false, isAdmin: false });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return authState;
}

