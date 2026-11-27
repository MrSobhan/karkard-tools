"use client";
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimeInput } from "@/components/time-input";
import { DayResult, dayResultText } from "@/components/day-result";
import { CopyButton } from "@/components/copy-button";
import { calculateDay } from "@/lib/calc";
import { parseTime } from "@/lib/time";

export function DailyTool() {
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");

  const e = parseTime(entry);
  const x = parseTime(exit);
  const entryErr = entry.length === 5 && e === null ? "ساعت ورود معتبر نیست." : null;
  const exitErr = exit.length === 5 && x === null ? "ساعت خروج معتبر نیست." : null;
  const r = calculateDay(e, x);

  return (
    <Card>
      <CardHeader title="محاسبه‌ی روزانه" description="ورود و خروج را بزنید؛ مازاد، تعجیل، تأخیر و پیشنهاد مرخصی را ببینید." />
      <div className="grid gap-4 sm:grid-cols-2">
        <TimeInput label="ساعت ورود" value={entry} onChange={setEntry} error={entryErr} placeholder="08:00" />
        <TimeInput label="ساعت خروج" value={exit} onChange={setExit} error={exitErr} placeholder="16:45" />
      </div>
      <div className="mt-5">
        <DayResult r={r} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <CopyButton text={dayResultText(r)} disabled={!dayResultText(r)} />
        <Button variant="ghost" onClick={() => { setEntry(""); setExit(""); }}>
          پاک کردن
        </Button>
      </div>
    </Card>
  );
}
