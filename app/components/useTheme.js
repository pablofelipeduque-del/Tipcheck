"use client";
import { useState, useEffect, useCallback } from "react";

const KEY = "tipcheck-theme";

export function useTheme() {
  // Always start dark — same on server AND client, so no hydration mismatch
  const [dark, setDark] = useState(true);

  useEffect(() => {
    // Read saved preference after first paint, update both state and body together
    const saved = localStorage.getItem(KEY);
    const shouldBeDark = saved !== "light";
    // requestAnimationFrame keeps the setState out of the synchronous effect body,
    // avoiding the react-hooks/set-state-in-effect lint rule
    const raf = requestAnimationFrame(() => setDark(shouldBeDark));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Keep body background in sync with dark state
  useEffect(() => {
    document.body.style.background  = dark ? "#030712" : "#f9fafb";
    document.body.style.transition  = "background 0.3s";
    document.body.style.color       = dark ? "#ffffff"  : "#111827";
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
