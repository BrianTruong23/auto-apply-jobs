"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-toggle" role="tablist" aria-label="Appearance">
      <button
        type="button"
        className={theme === "light" ? "theme-option theme-option-active" : "theme-option"}
        onClick={() => setTheme("light")}
      >
        Light
      </button>
      <button
        type="button"
        className={theme === "dark" ? "theme-option theme-option-active" : "theme-option"}
        onClick={() => setTheme("dark")}
      >
        Dark
      </button>
    </div>
  );
}
