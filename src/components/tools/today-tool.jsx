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
import { formatDuration, formatTime, nowMinutes, parseTime, toFa } from "@/lib/time";
import { RULES } from "@/lib/work-rules";

const KEY = "karkard-today";
const dayKey = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const hms = (sec) => {
  const s = Math.max(0, sec);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
};
const FALLBACK = null;

export function TodayTool() {
  const now = useNow();
  const [stored, setStored] = useLocalStorage(KEY, FALLBACK);
  const [draft, setDraft] = useState("");

  if (!now) return <Card className="h-64 animate-pulse" aria-busy />;

  const today = dayKey(now);
  const entryStr = stored && stored.date === today ? stored.entry : null;
  const entry = entryStr ? parseTime(entryStr) : null;

  if (entry == null) {
    const d = parseTime(draft);
    return (
      <Card>
        <CardHeader title="امروز" description="ساعت ورود را ثبت کنید؛ شمارنده‌ی زنده تا خروج موظف کار می‌کند. فقط برای همین روز ذخیره می‌شود." />
        <TimeInput label="ساعت ورود امروز" value={draft} onChange={setDraft} />
        <Button variant="primary" className="mt-4 w-full" disabled={d == null} onClick={() => setStored({ date: today, entry: formatTime(d) })}>
          شروع شمارش
        </Button>
      </Card>
    );
  }

  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const r = calculateDay(entry, null);
  const requiredSec = r.requiredExit * 60;
  const remaining = requiredSec - nowSec;
  const elapsed = nowSec - entry * 60;
  const progress = Math.min(100, Math.max(0, (elapsed / (RULES.requiredMinutes * 60)) * 100));
  const nm = nowMinutes(now);

  let tone = "primary";
  let badge = "در حال حضور";
  if (elapsed < 0) badge = "هنوز به ساعت ورود نرسیده";
  else if (remaining <= 0 && -remaining >= 60) {
    tone = "success";
    badge = "مازاد داری";
  } else if (remaining <= 0) {
    tone = "success";
    badge = "می‌تونی بری";
  }

  const leave = nm >= RULES.officialEnd && remaining > 0 ? calculateDay(entry, nm).leaveSuggestion : null;

  return (
    <Card>
      <CardHeader
        title="امروز"
        description={`ورود: ${toFa(formatTime(entry))}`}
        action={<Badge tone={tone}>{badge}</Badge>}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat
          label={remaining > 0 ? "مانده تا خروج موظف" : "مازاد تا الان"}
          value={<span dir="ltr">{toFa(hms(Math.abs(remaining)))}</span>}
          hint={`خروج موظف: ${toFa(formatTime(r.requiredExit))}`}
          tone={remaining > 0 ? "primary" : "success"}
        />
        <Stat label="مدت حضور تا الان" value={<span dir="ltr">{toFa(hms(Math.max(0, elapsed)))}</span>} hint={formatDuration(Math.max(0, Math.floor(elapsed / 60)))} />
      </div>
      <div className="mt-5" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-label="پیشرفت حضور روزانه">
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div className={`h-full rounded-full transition-[width] duration-1000 ${remaining > 0 ? "bg-primary" : "bg-success"}`} style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{toFa(Math.round(progress))}٪ از حضور موظف</div>
      </div>
      {leave && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-warn/30 bg-warn/10 p-4 text-sm text-warn">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>ساعت ۱۶:۱۵ گذشته ولی هنوز به خروج موظف نرسیده‌اید. اگر الان بروید: {toFa(leaveText(leave))}</p>
        </div>
      )}
      <Button variant="ghost" className="mt-4" onClick={() => { setStored(null); setDraft(""); }}>
        تغییر ساعت ورود
      </Button>
    </Card>
  );
}
