"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Bell, User, PenSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile/me", label: "Profile", icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-t">
      <nav className="flex justify-around items-center h-16">
        {navItems.slice(0, 2).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-md transition-colors",
              pathname === item.href ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}

        <Button size="icon" className="w-14 h-14 -mt-6 rounded-full shadow-lg" aria-label="Create Post">
            <PenSquare className="w-6 h-6" />
        </Button>
        
        {navItems.slice(2).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-md transition-colors",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
      </nav>
    </div>
  );
}
