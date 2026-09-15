"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export default function ThemeController() {
  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? window.localStorage.getItem("oceaniq-theme") : null;
    useAppStore.getState().setTheme(stored === "light" ? "light" : "dark");
  }, []);

  return null;
}
