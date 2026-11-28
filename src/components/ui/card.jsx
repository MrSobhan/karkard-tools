import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-sm backdrop-blur-md sm:p-6",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-lg font-bold leading-tight">{title}</h2>
        {description && <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
