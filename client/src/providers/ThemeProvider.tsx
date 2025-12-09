import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type LightColor = "default" | "theme-ocean" | "theme-sunset" | "theme-forest";
type DarkColor = "default" | "theme-midnight" | "theme-ember" | "theme-aurora";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  resolvedTheme: "light" | "dark";
  lightColor: LightColor;
  setLightColor: (color: LightColor) => void;
  darkColor: DarkColor;
  setDarkColor: (color: DarkColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Mode state
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("vu-portal-theme") as Theme) || "system";
    }
    return "system";
  });

  // Color preferences
  const [lightColor, setLightColor] = useState<LightColor>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("vu-portal-light-color") as LightColor) || "default";
    }
    return "default";
  });

  const [darkColor, setDarkColor] = useState<DarkColor>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("vu-portal-dark-color") as DarkColor) || "theme-midnight";
    }
    return "theme-midnight";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const applyTheme = () => {
      const root = window.document.documentElement;
      let targetMode = theme;

      if (theme === "system") {
        targetMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }

      // Remove all theme classes first
      const allThemes = [
        "light", "dark",
        "theme-ocean", "theme-sunset", "theme-forest",
        "theme-midnight", "theme-ember", "theme-aurora"
      ];
      root.classList.remove(...allThemes);

      // Apply mode class
      root.classList.add(targetMode);
      setResolvedTheme(targetMode as "light" | "dark");

      // Apply color theme based on resolved mode
      if (targetMode === "light" && lightColor !== "default") {
        root.classList.add(lightColor);
      } else if (targetMode === "dark" && darkColor !== "default") {
        root.classList.add(darkColor);
      }

      // Persist settings
      localStorage.setItem("vu-portal-theme", theme);
      localStorage.setItem("vu-portal-light-color", lightColor);
      localStorage.setItem("vu-portal-dark-color", darkColor);
    };

    applyTheme();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme, lightColor, darkColor]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light";
    });
  };

  return (
    <ThemeContext.Provider value={{
      theme, setTheme, toggleTheme, resolvedTheme,
      lightColor, setLightColor,
      darkColor, setDarkColor
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}