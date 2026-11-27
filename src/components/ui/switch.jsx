import { cn } from "@/lib/utils";

export function Switch({ checked, onCheckedChange, label, id }) {
  return (
    <button
      id={id}
      role="switch"
      type="button"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={cn("relative h-6 w-11 shrink-0 rounded-full border border-border transition", checked ? "bg-primary" : "bg-muted")}
    >
      <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", checked ? "right-[1.35rem]" : "right-0.5")} />
    </button>
  );
}
