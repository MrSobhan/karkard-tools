import { cn } from "@/lib/utils";

export function Select({ className, options, ...props }) {
  return (
    <select
      className={cn(
        "h-10 rounded-xl border border-border bg-background px-3 text-sm transition-colors hover:border-border-strong focus:border-primary",
        className,
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
