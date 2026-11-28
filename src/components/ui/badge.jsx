import { cn } from "@/lib/utils";

export const toneClasses = {
  success: "border-success/30 bg-success-soft text-success",
  danger: "border-danger/30 bg-danger-soft text-danger",
  warn: "border-warn/30 bg-warn-soft text-warn",
  primary: "border-primary/30 bg-primary-soft text-primary",
  muted: "border-border bg-muted text-muted-foreground",
};

export function Badge({ tone = "muted", className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
