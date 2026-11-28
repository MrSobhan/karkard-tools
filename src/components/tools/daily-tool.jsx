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

  const parsedEntry = parseTime(entry);
  const parsedExit = parseTime(exit);
  const entryError = entry.length === 5 && parsedEntry === null ? "ساعت ورود معتبر نیست." : null;
  const exitError = exit.length === 5 && parsedExit === null ? "ساعت خروج معتبر نیست." : null;
  const result = calculateDay(parsedEntry, parsedExit);
  const copyText = dayResultText(result);

  const clearInputs = () => {
    setEntry("");
    setExit("");
  };

  return (
    <Card>
      <CardHeader
        title="محاسبه‌ی روزانه"
        description="ورود و خروج را بزنید؛ مازاد، تعجیل، تأخیر و پیشنهاد مرخصی را ببینید."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TimeInput label="ساعت ورود" value={entry} onChange={setEntry} error={entryError} placeholder="08:00" />
        <TimeInput label="ساعت خروج" value={exit} onChange={setExit} error={exitError} placeholder="16:45" />
      </div>
      <div className="mt-5">
        <DayResult r={result} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <CopyButton text={copyText} disabled={!copyText} />
        <Button variant="ghost" onClick={clearInputs}>
          پاک کردن
        </Button>
      </div>
    </Card>
  );
}
