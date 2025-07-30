
"use client";

import * as React from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import AppSidebar from "@/components/app-sidebar";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import MobileHeader from "@/components/mobile-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getRedirectResult, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

function AppLoadingSkeleton() {
    return (
        <div className="flex min-h-screen bg-background">
             <div className="hidden md:flex w-64 flex-shrink-0 border-r border-border/60 flex-col p-4 bg-card">
                 <Skeleton className="h-8 w-3/4 mb-8" />
                 <div className="flex-1 space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                 </div>
                 <div className="mt-auto space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-12 w-full" />
                 </div>
             </div>
             <main className="flex-1 max-w-2xl mx-auto py-8 px-4 space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-64 w-full" />
             </main>
        </div>
    )
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const { user, loading } = useAuth();
  const router = useRouter();
  
  React.useEffect(() => {
    // This effect only handles redirecting away if the user is NOT authenticated *after* loading is complete.
    // It avoids the race condition of redirecting before the auth state is fully resolved.
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  React.useEffect(() => {
    const handleRedirectResult = async () => {
        try {
            const result = await getRedirectResult(auth);
            if (result && result.user) {
                const user = result.user;
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    const username = user.email?.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') || `user${Date.now()}`;
                    await setDoc(userDocRef, {
                        uid: user.uid,
                        name: user.displayName,
                        username: username,
                        email: user.email,
                        bio: 'Welcome to UmmahConnect!',
                        avatarUrl: user.photoURL || '',
                        coverPhotoUrl: '',
                        followers: [],
                        following: [],
                        createdAt: serverTimestamp(),
                        role: 'user',
                        theme: 'light',
                        language: 'en',
                    });
                }
            }
        } catch (error) {
            console.error("Error handling redirect result:", error);
        }
    };
    handleRedirectResult();
  }, []);


  // While authentication is in progress, always display a loading skeleton.
  // This is the key to preventing the "flicker" or "redirect loop".
  if (loading || !user) {
    return <AppLoadingSkeleton />;
  }

  // If loading is done and we have a user, render the app.
  return (
    <div className="flex bg-background">
      {isMobile ? (
        <div className="flex flex-col w-full">
          <MobileHeader />
          <main className="flex-1 pb-20">{children}</main>
          <MobileBottomNav />
        </div>
      ) : (
        <>
          <div className="sticky top-0 h-screen">
            <AppSidebar />
          </div>
          <main className="flex-1 max-w-2xl mx-auto py-8 px-4">{children}</main>
          <div className="hidden lg:block lg:flex-1" />
        </>
      )}
    </div>
  );
}
