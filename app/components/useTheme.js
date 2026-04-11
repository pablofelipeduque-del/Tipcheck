"use client";
import { useState, useEffect, useCallback } from "react";

const KEY = "tipcheck-theme";

function getInitialDark() {
  if (typeof window === "undefined") return true;
  const saved = localStorage.getItem(KEY);
  return saved !== null ? saved === "dark" : true;
}

export function useTheme() {
  const [dark, setDark] = useState(getInitialDark);

  // Keep body background in sync
  useEffect(() => {
    document.body.style.background = dark ? "#030712" : "#f9fafb";
    document.body.style.transition = "background 0.3s";
  }, [dark]);

  const toggle = useCallback(() => {
    setDark(prev => {
      const next = !prev;
      localStorage.setItem(KEY, next ? "dark" : "light");
      return next;
    });
  }, []);

  return { dark, toggle };
}
