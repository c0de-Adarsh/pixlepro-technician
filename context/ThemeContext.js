import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("pixl_theme");
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      applyTheme("dark");
    } else {
      applyTheme("light");
    }
  }, []);

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    const body = document.body;
    if (newTheme === "dark") {
      root.classList.add("dark");
      if (body) body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      if (body) body.classList.remove("dark");
    }
  };

  useEffect(() => {
    if (!mounted) return;
    applyTheme(theme);
    localStorage.setItem("pixl_theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === "light" ? "dark" : "light";
      applyTheme(nextTheme);
      return nextTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
