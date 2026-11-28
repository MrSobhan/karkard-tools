import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { formatDuration, formatTime, toFa } from "@/lib/time";
import { leaveText } from "@/lib/calc";
import { Stat } from "@/components/stat";

const formatMinutes = (minutes) => toFa(formatTime(minutes));

export function dayResultText(result) {
  if (result.status === "empty" || result.status === "invalid") return "";
  const lines = [`خروج موظف: ${formatTime(result.requiredExit)}`];
  if (result.status !== "incomplete") {
    lines.unshift(`مدت حضور: ${formatTime(result.presence)}`);
    if (result.overtime) lines.push(`مازاد: ${formatTime(result.overtime)}`);
    if (result.earlyLeave) lines.push(`تعجیل: ${formatTime(result.earlyLeave)}`);
  }
  if (result.late) lines.push(`تأخیر: ${formatTime(result.late)}`);
  if (result.leaveSuggestion) lines.push(leaveText(result.leaveSuggestion));
  return lines.join("\n");
}

export function DayResult({ r }) {
  if (r.status === "empty") {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        ساعت ورود را وارد کنید تا نتیجه این‌جا نمایش داده شود.
      </p>
    );
  }

  if (r.status === "invalid") {
    return (
      <div
        role="alert"
        className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger"
      >
        <AlertTriangle className="size-4 shrink-0" aria-hidden />
        {r.error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3" aria-live="polite">
      <div className="grid grid-cols-2 gap-3">
        {r.status !== "incomplete" && (
          <Stat label="مدت حضور" value={formatMinutes(r.presence)} hint={formatDuration(r.presence)} tone="primary" />
        )}
        <Stat label="خروج موظف" value={formatMinutes(r.requiredExit)} hint="ورود + ۰۸:۴۵" tone="muted" />
        {r.overtime > 0 && (
          <Stat label="مازاد" value={formatMinutes(r.overtime)} hint={formatDuration(r.overtime)} tone="success" />
        )}
        {r.earlyLeave > 0 && (
          <Stat label="تعجیل" value={formatMinutes(r.earlyLeave)} hint="خروج قبل از ۱۶:۱۵" tone="danger" />
        )}
        {r.late > 0 && (
          <Stat label="تأخیر" value={formatMinutes(r.late)} hint="ورود بعد از ۰۸:۴۵" tone="danger" />
        )}
      </div>
      {r.leaveSuggestion && (
        <div className="flex items-start gap-2 rounded-2xl border border-warn/30 bg-warn-soft p-4 text-sm text-warn">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>{toFa(leaveText(r.leaveSuggestion))}</p>
        </div>
      )}
      {r.status === "complete" && (
        <div className="flex items-center gap-2 rounded-2xl border border-success/30 bg-success-soft p-4 text-sm text-success">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          کارکرد کامل است؛ مازاد و کسری ندارید.
        </div>
      )}
    </div>
  );
}
