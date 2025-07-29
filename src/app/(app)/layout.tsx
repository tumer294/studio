
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
    // This effect handles redirection. It will only run on the client side.
    // We wait until the loading is false.
    if (!loading) {
      // If loading is finished and there's still no user, redirect to login.
      if (!user) {
        router.push('/login');
      }
    }
  }, [user, loading, router]);


  // While loading, or if there's no user yet (which might be the case before the effect runs),
  // show a skeleton screen. This prevents any flash of content or premature rendering.
  if (loading || !user) {
    return <AppLoadingSkeleton />;
  }

  // This check is for when the mobile state is not yet determined.
  if (typeof isMobile === "undefined") {
    return <AppLoadingSkeleton />;
  }

  // If we reach here, it means loading is false and a user object exists.
  // We can safely render the main app layout.
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
