"use client";
import { MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";

const ButtonToggle = dynamic(
  () => import("@/components/ui/button").then((mod) => mod.Button),
  { ssr: false },
);

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();

  function toggleTheme() {
    setTheme((theme) => (theme === "dark" ? "light" : "dark"));
  }

  return (
    <ButtonToggle
      variant="ghost"
      onClick={toggleTheme}
      suppressHydrationWarning
    >
      {theme === "system" ? (
        <SunMoonIcon />
      ) : theme === "dark" ? (
        <MoonIcon />
      ) : (
        <SunIcon />
      )}
    </ButtonToggle>
  );
}
