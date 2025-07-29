
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
    // This listener is for Firebase Auth state changes (login/logout)
    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      let firestoreUnsubscribe: () => void = () => {};

      if (firebaseUser) {
        // User is signed in, now get their app-specific data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Use onSnapshot to listen for real-time updates to the user document
        firestoreUnsubscribe = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            const appUser = userDoc.data() as AppUser;
            setAuthState({
                // Combine Firebase Auth user and Firestore user data
                user: { ...firebaseUser, ...appUser, id: userDoc.id },
                loading: false,
                isAdmin: appUser.role === 'admin'
            });
          } else {
            // This case might happen if a user exists in Auth but not Firestore
            // This can happen if the signup process was interrupted.
            // We treat them as not fully logged in.
             setAuthState({ user: null, loading: false, isAdmin: false });
          }
        }, (error) => {
            console.error("Error fetching user data from Firestore:", error);
            setAuthState({ user: null, loading: false, isAdmin: false });
        });

      } else {
        // User is signed out, clear all state
        setAuthState({ user: null, loading: false, isAdmin: false });
      }

      // Cleanup function for the effect
      return () => {
        firestoreUnsubscribe(); // Unsubscribe from Firestore listener
      };
    });

    // Return the auth unsubscribe function to clean up on component unmount
    return () => authUnsubscribe();
  }, []);

  return authState;
}
