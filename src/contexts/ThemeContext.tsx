import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">("light");

  // Load theme preference from database
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    applyTheme();
  }, [theme]);

  const loadThemePreference = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("theme_preference")
      .eq("id", user.id)
      .single();

    if (data?.theme_preference) {
      setThemeState(data.theme_preference as Theme);
    }
  };

  const applyTheme = () => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let applied: "light" | "dark";

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      applied = systemTheme;
    } else {
      applied = theme;
    }

    root.classList.add(applied);
    setEffectiveTheme(applied);
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);

    // Save to database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ theme_preference: newTheme })
        .eq("id", user.id);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
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
