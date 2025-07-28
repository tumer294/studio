"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Bell, User, LogOut, PenSquare } from "lucide-react";
import { UmmahConnectLogo } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile/me", label: "Profile", icon: User },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border/60 flex flex-col p-4 bg-card">
      <div className="flex items-center gap-2 mb-8">
        <UmmahConnectLogo className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-headline font-bold text-primary">UmmahConnect</h1>
      </div>
      
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} legacyBehavior passHref>
            <a
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span>{item.label}</span>
            </a>
          </Link>
        ))}
        <Button size="lg" className="mt-4 flex items-center gap-3 justify-start text-lg px-4 py-3 h-auto">
            <PenSquare className="w-6 h-6" />
            <span>Create Post</span>
        </Button>
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-3 mb-4">
            <Avatar>
                <AvatarImage src="https://placehold.co/100x100/17633D/E0E5DA" alt="User Avatar" data-ai-hint="woman portrait" />
                <AvatarFallback>UA</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-bold">Aisha Bint Abu Bakr</p>
                <p className="text-sm text-muted-foreground">@aisha_bint_abubakr</p>
            </div>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}
