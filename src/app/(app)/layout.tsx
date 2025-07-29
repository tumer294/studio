
"use client";

import * as React from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import AppSidebar from "@/components/app-sidebar";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import MobileHeader from "@/components/mobile-header";
import { Skeleton } from "@/components/ui/skeleton";

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
    // We don't want to run this check on the server or while loading.
    if (typeof window === 'undefined' || loading) {
      return;
    }

    // If loading is complete and there is still no user, redirect to login.
    if (!user) {
      router.replace('/login');
    }
  }, [user, loading, router]);


  // While authentication is in progress, display a loading skeleton.
  // This is the key to preventing the "flicker" or "redirect loop".
  if (loading) {
    return <AppLoadingSkeleton />;
  }

  // If loading is done and we have a user, render the app.
  if (user) {
    return (
      <div className="flex min-h-screen bg-background">
        {isMobile ? (
          <div className="flex flex-col w-full">
            <MobileHeader />
            <main className="flex-1 pb-20">{children}</main>
            <MobileBottomNav />
          </div>
        ) : (
          <>
            <AppSidebar />
            <main className="flex-1 max-w-2xl mx-auto py-8 px-4">{children}</main>
            <div className="hidden lg:block lg:flex-1" />
          </>
        )}
      </div>
    );
  }

  // If loading is done and there's no user, the useEffect will handle the redirect.
  // We can return the skeleton until the redirect happens to avoid rendering children.
  return <AppLoadingSkeleton />;
}
