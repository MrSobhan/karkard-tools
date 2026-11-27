"use client";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";

const ORDER = ["dark", "light", "system"];
const META = {
  dark: { icon: Moon, label: "تم تیره" },
  light: { icon: Sun, label: "تم روشن" },
  system: { icon: Monitor, label: "تم سیستم" },
};

export function ThemeToggle() {
  const { theme = "dark", setTheme } = useTheme();
  const mounted = useMounted();
  const cur = mounted ? theme : "dark";
  const { icon: Icon, label } = META[cur] ?? META.dark;
  const next = ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length];
  return (
    <Button variant="outline" size="icon" onClick={() => setTheme(next)} aria-label={`${label} — برای تغییر بزنید`} title={label}>
      <Icon className="size-4" aria-hidden />
    </Button>
  );
}
