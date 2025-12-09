import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      data-testid="button-theme-toggle"
      className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg bg-background border-2 border-primary/20 hover:border-primary hover:shadow-xl hover:scale-105 transition-all z-50 text-foreground"
      title={`Current mode: ${theme.charAt(0).toUpperCase() + theme.slice(1)} (Click to switch)`}
    >
      {theme === 'light' && <Sun size={20} className="text-orange-500" />}
      {theme === 'dark' && <Moon size={20} className="text-blue-500" />}
      {theme === 'system' && <Monitor size={20} className="text-purple-500" />}
    </Button>
  );
}
