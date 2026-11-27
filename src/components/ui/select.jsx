import { cn } from "@/lib/utils";

export function Select({ className, options, ...props }) {
  return (
    <select className={cn("h-10 rounded-xl border border-border bg-background px-3 text-sm", className)} {...props}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
