"use client";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export function Tabs({ tabs, value, onValueChange, label }) {
  const refs = useRef({});

  const onKeyDown = (e) => {
    const index = tabs.findIndex((t) => t.id === value);
    let next = index;
    if (e.key === "ArrowLeft") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowRight") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault();
    onValueChange(tabs[next].id);
    refs.current[tabs[next].id]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="scrollbar-none -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[tab.id] = el;
            }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onValueChange(tab.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition cursor-pointer",
              active ? "border-primary/40 bg-primary/15 text-primary" : "border-transparent text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
