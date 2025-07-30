
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Compass, Bell, User, LogOut, PenSquare, Settings, Languages, Palette, Shield } from "lucide-react";
import { UmmahConnectLogo } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { languages } from "@/app-strings";
import { useTheme } from "@/hooks/use-theme-provider";
import { useCreatePost } from "@/hooks/use-create-post";
import { Separator } from "./ui/separator";


const themes = [
    { name: "Islamic Green", class: "theme-default" },
    { name: "Islamic Yellow", class: "theme-islamic-yellow" },
    { name: "Light", class: "light" },
    { name: "Dark", class: "dark" },
]

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const { setLanguage, t } = useTranslation();
  const { setTheme } = useTheme();
  const { onOpen } = useCreatePost();

  const navItems = [
    { href: "/", label: t.home, icon: Home },
    { href: "/explore", label: t.explore, icon: Compass },
    { href: "/notifications", label: t.notifications, icon: Bell },
    { href: "/profile/me", label: t.profile, icon: User },
  ];
  
  if(isAdmin) {
    navItems.push({ href: "/admin", label: "Admin Panel", icon: Shield });
  }


  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast({ title: t.loggedOut, description: t.loggedOutDesc });
      router.push('/login');
    } catch (error) {
      console.error("Logout Error:", error);
      toast({ variant: 'destructive', title: t.error, description: t.logoutError });
    }
  }

  if (!user) {
    return null; // Or a loading skeleton
  }

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border/60 flex flex-col p-4 bg-card h-full">
      <div className="flex items-center gap-2 mb-4">
        <UmmahConnectLogo className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-headline font-bold text-primary">UmmahConnect</h1>
      </div>
      
       <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary">
            <Avatar>
                <AvatarImage src={user.avatarUrl || user.photoURL || undefined} alt="User Avatar" data-ai-hint="person portrait" />
                <AvatarFallback>{user.name ? user.name.charAt(0) : user.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-bold">{user.name || user.displayName}</p>
                <p className="text-sm text-muted-foreground">@{user.username || user.email?.split('@')[0]}</p>
            </div>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="justify-start gap-3 text-muted-foreground hover:text-foreground">
                    <Settings className="w-5 h-5" />
                    <span>{t.settings}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>{t.appearance}</DropdownMenuLabel>
                 <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Palette className="mr-2 h-4 w-4" />
                        <span>{t.colorTheme}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            {themes.map(theme => (
                                <DropdownMenuItem key={theme.class} onClick={() => setTheme(theme.class)}>{theme.name}</DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                 <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Languages className="mr-2 h-4 w-4" />
                        <span>{t.language}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            {languages.map((lang) => (
                                <DropdownMenuItem key={lang.code} onClick={() => setLanguage(lang.code)}>
                                    {lang.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                 <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t.logout}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator className="mb-4" />

      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-foreground/70 hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <Button size="lg" className="w-full flex items-center gap-3 justify-center text-lg px-4 py-3 h-auto" onClick={onOpen}>
            <PenSquare className="w-6 h-6" />
            <span>{t.createPost}</span>
        </Button>
       </div>

    </aside>
  );
}
