import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  outline: "border border-border bg-card hover:bg-muted",
  ghost: "hover:bg-muted",
  danger: "border border-danger/40 text-danger hover:bg-danger/10",
};
const sizes = { md: "h-10 px-4 text-sm", sm: "h-8 px-3 text-xs", icon: "h-10 w-10" };

export function Button({ variant = "outline", size = "md", className, type = "button", ...props }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
