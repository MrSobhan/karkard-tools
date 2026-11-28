"use client";
import { useId } from "react";
import { cn } from "@/lib/utils";

export function Switch({ checked, onCheckedChange, label }) {
  const id = useId();
  return (
    <button
      id={id}
      role="switch"
      type="button"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 cursor-pointer",
        checked ? "border-primary bg-primary" : "border-border bg-muted",
      )}
    >
      <span className={cn("absolute top-px size-5 rounded-full bg-white shadow transition-all", checked ? "right-[1.27rem]" : "right-0.5")} />
    </button>
  );
}
