"use client";
import { useState } from "react";
import { Info } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TimeInput } from "@/components/time-input";
import { Stat } from "@/components/stat";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useNow } from "@/hooks/use-now";
import { calculateDay, leaveText } from "@/lib/calc";
import { formatDuration, formatHms, formatTime, nowMinutes, parseTime, toDayKey, toFa } from "@/lib/time";
import { RULES } from "@/lib/work-rules";

const STORAGE_KEY = "karkard-today";

export function TodayTool() {
  const now = useNow();
  const [stored, setStored] = useLocalStorage(STORAGE_KEY, null);
  const [draft, setDraft] = useState("");

  if (!now) return <Card className="h-64 animate-pulse" aria-busy />;

  const todayKey = toDayKey(now);
  const entryString = stored && stored.date === todayKey ? stored.entry : null;
  const entry = entryString ? parseTime(entryString) : null;

  if (entry == null) {
    const parsedDraft = parseTime(draft);
    return (
      <Card>
        <CardHeader
          title="امروز"
          description="ساعت ورود را ثبت کنید؛ شمارنده‌ی زنده تا خروج موظف کار می‌کند. فقط برای همین روز ذخیره می‌شود."
        />
        <TimeInput label="ساعت ورود امروز" value={draft} onChange={setDraft} />
        <Button
          variant="primary"
          className="mt-4 w-full"
          disabled={parsedDraft == null}
          onClick={() => setStored({ date: todayKey, entry: formatTime(parsedDraft) })}
        >
          شروع شمارش
        </Button>
      </Card>
    );
  }

  const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const result = calculateDay(entry, null);
  const requiredSeconds = result.requiredExit * 60;
  const remaining = requiredSeconds - nowSeconds;
  const elapsed = nowSeconds - entry * 60;
  const progress = Math.min(100, Math.max(0, (elapsed / (RULES.requiredMinutes * 60)) * 100));
  const currentMinutes = nowMinutes(now);

  let tone = "primary";
  let badgeText = "در حال حضور";
  if (elapsed < 0) badgeText = "هنوز به ساعت ورود نرسیده";
  else if (remaining <= 0 && -remaining >= 60) {
    tone = "success";
    badgeText = "مازاد داری";
  } else if (remaining <= 0) {
    tone = "success";
    badgeText = "می‌تونی بری";
  }

  const leave =
    currentMinutes >= RULES.officialEnd && remaining > 0
      ? calculateDay(entry, currentMinutes).leaveSuggestion
      : null;

  const resetEntry = () => {
    setStored(null);
    setDraft("");
  };

  return (
    <Card>
      <CardHeader
        title="امروز"
        description={`ورود: ${toFa(formatTime(entry))}`}
        action={<Badge tone={tone}>{badgeText}</Badge>}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat
          label={remaining > 0 ? "مانده تا خروج موظف" : "مازاد تا الان"}
          value={<span dir="ltr">{toFa(formatHms(Math.abs(remaining)))}</span>}
          hint={`خروج موظف: ${toFa(formatTime(result.requiredExit))}`}
          tone={remaining > 0 ? "primary" : "success"}
        />
        <Stat
          label="مدت حضور تا الان"
          value={<span dir="ltr">{toFa(formatHms(Math.max(0, elapsed)))}</span>}
          hint={formatDuration(Math.max(0, Math.floor(elapsed / 60)))}
        />
      </div>
      <div
        className="mt-5"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label="پیشرفت حضور روزانه"
      >
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-[width] duration-1000 ease-out ${remaining > 0 ? "bg-primary" : "bg-success"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1.5 text-xs text-muted-foreground">{toFa(Math.round(progress))}٪ از حضور موظف</div>
      </div>
      {leave && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-warn/30 bg-warn-soft p-4 text-sm text-warn">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>ساعت ۱۶:۱۵ گذشته ولی هنوز به خروج موظف نرسیده‌اید. اگر الان بروید: {toFa(leaveText(leave))}</p>
        </div>
      )}
      <Button variant="ghost" className="mt-4" onClick={resetEntry}>
        تغییر ساعت ورود
      </Button>
    </Card>
  );
}
