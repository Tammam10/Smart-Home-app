import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export const LIGHT = {
  dark:        false,
  bg:          "#f0f4ff",
  card:        "#ffffff",
  header:      "#1e3a8a",
  headerText:  "#ffffff",
  headerSub:   "rgba(255,255,255,0.12)",
  text:        "#1e293b",
  subtext:     "#64748b",
  border:      "#e2e8f0",
  primary:     "#2563eb",
  primarySoft: "#dbeafe",
  sensorBg:    "#f8fafc",
  inputBg:     "#f1f5f9",
  logBorder:   "#f1f5f9",
  statOnline:  { bg: "#dcfce7", text: "#16a34a" },
  statAlert:   { bg: "#fee2e2", text: "#dc2626" },
  statTemp:    { bg: "#fff7ed", text: "#ea580c" },
  statDevice:  { bg: "#eff6ff", text: "#2563eb" },
};

export const DARK = {
  dark:        true,
  bg:          "#0f172a",
  card:        "#1e293b",
  header:      "#070d1a",
  headerText:  "#f1f5f9",
  headerSub:   "rgba(255,255,255,0.07)",
  text:        "#f1f5f9",
  subtext:     "#94a3b8",
  border:      "#334155",
  primary:     "#3b82f6",
  primarySoft: "#1e3a8a",
  sensorBg:    "#0f172a",
  inputBg:     "#0f172a",
  logBorder:   "#1e293b",
  statOnline:  { bg: "#14532d", text: "#4ade80" },
  statAlert:   { bg: "#450a0a", text: "#f87171" },
  statTemp:    { bg: "#431407", text: "#fb923c" },
  statDevice:  { bg: "#1e3a8a", text: "#93c5fd" },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("@theme").then((val) => {
      if (val) setIsDark(val === "dark");
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem("@theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: isDark ? DARK : LIGHT, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
