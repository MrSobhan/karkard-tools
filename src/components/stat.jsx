import { cn } from "@/lib/utils";
import { toneClasses } from "@/components/ui/badge";

export function Stat({ label, value, hint, tone = "muted", className }) {
  return (
    <div className={cn("rounded-2xl border p-4", toneClasses[tone], className)}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums sm:text-3xl">{value}</div>
      {hint && <div className="mt-1 text-xs opacity-80">{hint}</div>}
    </div>
  );
}
