"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import AppSidebar from "@/components/app-sidebar";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import MobileHeader from "@/components/mobile-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  if (typeof isMobile === "undefined") {
    return null; // Or a loading skeleton
  }

  return (
    <div className="flex min-h-screen">
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
          <div className="flex-1" />
        </>
      )}
    </div>
  );
}
