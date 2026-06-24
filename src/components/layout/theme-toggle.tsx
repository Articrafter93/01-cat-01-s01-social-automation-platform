"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);
    const saved = window.localStorage.getItem("sap-theme");
    const nextTheme = saved === "dark" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    setTheme(nextTheme);
  }, []);

  if (!mounted) {
    return <div aria-hidden="true" className="h-9 w-10 rounded-full bg-secondary" />;
  }

  return (
    <Button
      aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
      variant="secondary"
      size="sm"
      className="w-10 rounded-full px-0"
      onClick={() => {
        const nextTheme = theme === "light" ? "dark" : "light";
        document.documentElement.classList.toggle("dark", nextTheme === "dark");
        window.localStorage.setItem("sap-theme", nextTheme);
        setTheme(nextTheme);
      }}
    >
      {theme === "light" ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
    </Button>
  );
}
