"use client";
import { useId } from "react";
import { Clock } from "lucide-react";
import { maskTime, formatTime, nowMinutes } from "@/lib/time";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** ورودی زمان با ماسک HH:mm و دکمه‌ی «اکنون» */
export function TimeInput({ label, value, onChange, error, showNow = true, placeholder = "08:00" }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          dir="ltr"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          placeholder={placeholder}
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-err` : undefined}
          onChange={(e) => onChange(maskTime(e.target.value))}
          className={cn(
            "h-11 min-w-0 flex-1 rounded-xl border bg-background px-3 text-center font-mono text-lg tracking-widest",
            error ? "border-danger" : "border-border",
          )}
        />
        {showNow && (
          <Button variant="outline" onClick={() => onChange(formatTime(nowMinutes()))} className="h-11" aria-label={`${label}: ثبت ساعت اکنون`}>
            <Clock className="size-4" aria-hidden />
            اکنون
          </Button>
        )}
      </div>
      {error && (
        <p id={`${id}-err`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
