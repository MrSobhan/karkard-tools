import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return <section className={cn("rounded-2xl border border-border bg-card p-4 shadow-sm backdrop-blur-md sm:p-6", className)} {...props} />;
}
export function CardHeader({ title, description, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
