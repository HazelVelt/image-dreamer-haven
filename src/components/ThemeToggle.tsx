
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Palette } from "lucide-react";

const THEMES = [
  { name: 'Light', value: 'light', icon: Sun },
  { name: 'Dark', value: 'dark', icon: Moon },
  { name: 'Purple', value: 'theme-purple', icon: Palette },
  { name: 'Green', value: 'theme-green', icon: Palette },
  { name: 'Amber', value: 'theme-amber', icon: Palette },
  { name: 'Red', value: 'theme-red', icon: Palette },
  { name: 'Pink', value: 'theme-pink', icon: Palette },
  { name: 'Ocean', value: 'theme-ocean', icon: Palette },
  { name: 'Lavender', value: 'theme-lavender', icon: Palette },
  { name: 'Teal', value: 'theme-teal', icon: Palette },
  { name: 'Dark Purple', value: 'theme-dark-purple', icon: Palette },
  { name: 'Dark Green', value: 'theme-dark-green', icon: Palette },
];

export function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<string>('light');

  useEffect(() => {
    // Get saved theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark' || 
        (savedTheme === 'system' && 
         window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setCurrentTheme('dark');
    } else if (savedTheme.startsWith('theme-')) {
      document.documentElement.classList.add(savedTheme);
      setCurrentTheme(savedTheme);
    } else {
      setCurrentTheme('light');
    }
  }, []);

  const setTheme = (theme: string) => {
    // Remove all theme classes
    document.documentElement.classList.remove('dark', ...THEMES.map(t => t.value).filter(t => t !== 'light'));
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme.startsWith('theme-')) {
      document.documentElement.classList.add(theme);
    }
    
    localStorage.setItem('theme', theme);
    setCurrentTheme(theme);
  };

  // Find current theme object
  const theme = THEMES.find(t => t.value === currentTheme) || THEMES[0];
  const Icon = theme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Icon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {THEMES.map((theme) => {
          const ThemeIcon = theme.icon;
          return (
            <DropdownMenuItem
              key={theme.value}
              onClick={() => setTheme(theme.value)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <ThemeIcon className="h-4 w-4" />
              <span>{theme.name}</span>
              {currentTheme === theme.value && (
                <span className="ml-auto">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
