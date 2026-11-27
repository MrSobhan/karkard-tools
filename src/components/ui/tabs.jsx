"use client";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/** تب‌های دسترس‌پذیر با پیمایش کیبورد (در RTL جهت‌ها برعکس است) */
export function Tabs({ tabs, value, onValueChange, label }) {
  const refs = useRef({});
  const onKeyDown = (e) => {
    const i = tabs.findIndex((t) => t.id === value);
    let n = i;
    if (e.key === "ArrowLeft") n = (i + 1) % tabs.length;
    else if (e.key === "ArrowRight") n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = tabs.length - 1;
    else return;
    e.preventDefault();
    onValueChange(tabs[n].id);
    refs.current[tabs[n].id]?.focus();
  };
  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {tabs.map((t) => {
        const active = t.id === value;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            ref={(el) => (refs.current[t.id] = el)}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={active}
            aria-controls={`panel-${t.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onValueChange(t.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition",
              active ? "border-primary/40 bg-primary/15 text-primary" : "border-transparent text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
