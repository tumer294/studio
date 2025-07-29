
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
    // Only run this check on the client-side after the initial loading phase.
    if (typeof window !== 'undefined' && !loading) {
      if (!user) {
        // If loading is complete and there's no user, redirect to login.
        router.replace('/login');
      }
    }
  }, [user, loading, router]);


  // While loading is true, or if the mobile state is not yet determined,
  // show the skeleton. This prevents any premature rendering or flicker.
  if (loading || typeof isMobile === 'undefined') {
    return <AppLoadingSkeleton />;
  }

  // If we reach here, it means loading is false. If there's still no user,
  // the useEffect above will handle the redirection. We can return null
  // for this brief moment to avoid rendering children before redirecting.
  if (!user) {
    return <AppLoadingSkeleton />;
  }
  
  // If we have a user and loading is false, render the full app layout.
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

