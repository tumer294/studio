
"use client";

import Link from "next/link";
import { UmmahConnectLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Settings, Moon, Sun, Palette, Languages } from "lucide-react";
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
import { useTranslation } from "@/hooks/use-translation";
import { languages as appLanguages } from "@/app-strings";

const themes = [
    { name: "Islamic Green", class: "theme-default" },
    { name: "Islamic Yellow", class: "theme-islamic-yellow" },
    { name: "Light", class: "light" },
    { name: "Dark", class: "dark" },
];


export default function MobileHeader() {
  const { setLanguage, t } = useTranslation();

  const handleThemeChange = (themeClass: string) => {
    document.documentElement.classList.remove(...themes.map(t => t.class));
    document.documentElement.classList.remove('light', 'dark');

    if (themeClass === 'light' || themeClass === 'dark') {
      document.documentElement.classList.add(themeClass);
    } else {
      document.documentElement.classList.add(themeClass);
    }
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-background/80 backdrop-blur-sm border-b">
      <div className="w-10"></div>
      <Link href="/" className="flex items-center gap-2">
        <UmmahConnectLogo className="w-7 h-7 text-primary" />
        <h1 className="text-xl font-headline font-bold text-primary">UmmahConnect</h1>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
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
                {appLanguages.map((lang) => (
                  <DropdownMenuItem key={lang.code} onClick={() => setLanguage(lang.code)}>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
