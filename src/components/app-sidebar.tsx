
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Compass, Bell, User, LogOut, PenSquare, Settings, Moon, Sun, Languages, Palette } from "lucide-react";
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


const themes = [
    { name: "Islamic Green", class: "theme-default" },
    { name: "Islamic Yellow", class: "theme-islamic-yellow" },
    { name: "Light", class: "light" },
    { name: "Dark", class: "dark" },
]

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { setLanguage, t } = useTranslation();

  const navItems = [
    { href: "/", label: t.home, icon: Home },
    { href: "/explore", label: t.explore, icon: Compass },
    { href: "/notifications", label: t.notifications, icon: Bell },
    { href: "/profile/me", label: t.profile, icon: User },
  ];

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login');
    } catch (error) {
      console.error("Logout Error:", error);
      toast({ variant: 'destructive', title: "Error", description: "Failed to log out." });
    }
  }

  const handleThemeChange = (themeClass: string) => {
    // Remove any existing theme classes
    document.documentElement.classList.remove(...themes.map(t => t.class));
    document.documentElement.classList.remove('light', 'dark');

    // Add the new theme class
    if (themeClass === 'light' || themeClass === 'dark') {
      document.documentElement.classList.add(themeClass);
    } else {
      document.documentElement.classList.add(themeClass);
    }
  }

  if (!user) {
    return null; // Or a loading skeleton
  }

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border/60 flex flex-col p-4 bg-card">
      <div className="flex items-center gap-2 mb-8">
        <UmmahConnectLogo className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-headline font-bold text-primary">UmmahConnect</h1>
      </div>
      
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
        <Button size="lg" className="mt-4 flex items-center gap-3 justify-start text-lg px-4 py-3 h-auto">
            <PenSquare className="w-6 h-6" />
            <span>{t.createPost}</span>
        </Button>
      </nav>

      <div className="mt-auto flex flex-col gap-2">
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
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="ml-2">{t.toggleTheme}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => document.documentElement.classList.remove('dark')}>Light</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => document.documentElement.classList.add('dark')}>Dark</DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                 <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Palette className="mr-2 h-4 w-4" />
                        <span>{t.colorTheme}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            {themes.map(theme => (
                                <DropdownMenuItem key={theme.class} onClick={() => handleThemeChange(theme.class)}>{theme.name}</DropdownMenuItem>
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
            </DropdownMenuContent>
        </DropdownMenu>

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
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive" onClick={handleLogout}>
          <LogOut className="w-5 h-5" />
          <span>{t.logout}</span>
        </Button>
      </div>
    </aside>
  );
}
