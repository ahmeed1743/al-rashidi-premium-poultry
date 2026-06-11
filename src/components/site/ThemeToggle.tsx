import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

type Mode = "light" | "dark" | "system";

function applyTheme(mode: Mode) {
  const isDark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Mode | null) || "system";
    setMode(saved);
    applyTheme(saved);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if ((localStorage.getItem("theme") || "system") === "system") applyTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const cycle = () => {
    const next: Mode = mode === "system" ? "light" : mode === "light" ? "dark" : "system";
    setMode(next);
    if (next === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", next);
    applyTheme(next);
  };

  const Icon = mode === "dark" ? Moon : mode === "light" ? Sun : Monitor;
  const label = mode === "dark" ? "وضع داكن" : mode === "light" ? "وضع فاتح" : "تلقائي (النظام)";

  return (
    <button
      onClick={cycle}
      title={label}
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full glass transition-colors hover:bg-primary/10"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}