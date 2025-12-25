import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg p-2 hover:bg-surface transition-colors"
      aria-label="Toggle theme">
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-text-secondary" />
      ) : (
        <Moon className="h-5 w-5 text-text-secondary" />
      )}
    </button>
  );
}
