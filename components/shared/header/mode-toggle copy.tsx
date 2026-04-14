"use client";
import { useEffect, useState } from "react";
import { MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";
import { useTheme } from "next-themes";
// import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

// const ButtonToggle = dynamic(
//   () => import("@/components/ui/button").then((mod) => mod.Button),
//   { ssr: false },
// );

export default function ModeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const timeout = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!mounted) {
    // 🟢 在掛載前，渲染一個空按鈕或佔位符，避免 Server/Client 不一致
    return <Button variant="ghost" size="icon" disabled />;
  }
  function toggleTheme() {
    setTheme((theme) => (theme === "dark" ? "light" : "dark"));
  }

  return (
    <Button variant="ghost" onClick={toggleTheme} suppressHydrationWarning>
      {theme === "system" ? (
        <SunMoonIcon />
      ) : theme === "dark" ? (
        <MoonIcon />
      ) : (
        <SunIcon />
      )}
    </Button>
  );
}
