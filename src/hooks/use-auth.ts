
"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User as AppUser } from '@/lib/types';

export type AuthUser = FirebaseUser & AppUser;

interface AuthState {
    user: AuthUser | null;
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
    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, get their app-specific data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Use onSnapshot to listen for real-time updates to user document
        const firestoreUnsubscribe = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            const appUser = userDoc.data() as AppUser;
            setAuthState({
                user: { ...firebaseUser, ...appUser, id: userDoc.id },
                loading: false,
                isAdmin: appUser.role === 'admin'
            });
          } else {
            // This case might happen if user exists in Auth but not Firestore
            // e.g. during sign up process before doc is created.
            // Treat as not fully logged in until doc exists.
            setAuthState({ user: null, loading: false, isAdmin: false });
          }
        }, (error) => {
            console.error("Error fetching user data from Firestore:", error);
            setAuthState({ user: null, loading: false, isAdmin: false });
        });

        // Return the firestore unsubscribe function to clean up the listener
        return () => firestoreUnsubscribe();

      } else {
        // User is signed out
        setAuthState({ user: null, loading: false, isAdmin: false });
      }
    });

    // Return the auth unsubscribe function to clean up on component unmount
    return () => authUnsubscribe();
  }, []);

  return authState;
}
