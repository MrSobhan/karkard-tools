"use client";
import { useState } from "react";
import { Info } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { TimeInput } from "@/components/time-input";
import { Stat } from "@/components/stat";
import { CopyButton } from "@/components/copy-button";
import { latestEntryFor, requiredExitFor } from "@/lib/calc";
import { formatTime, parseTime, toFa } from "@/lib/time";
import { RULES } from "@/lib/work-rules";

export function WhenTool() {
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");

  const parsedEntry = parseTime(entry);
  const parsedExit = parseTime(exit);
  const requiredExit = parsedEntry != null ? requiredExitFor(parsedEntry) : null;
  const latestEntry = parsedExit != null ? latestEntryFor(parsedExit) : null;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader
          title="کی برم؟"
          description="ساعت ورودتان را بدهید تا زودترین خروج بدون کسری را ببینید."
        />
        <TimeInput label="ساعت ورود" value={entry} onChange={setEntry} />
        <div className="mt-4">
          {requiredExit != null ? (
            <div className="flex flex-wrap items-end gap-3">
              <Stat
                className="min-w-40 flex-1"
                label="خروج موظف"
                value={toFa(formatTime(requiredExit))}
                hint={`ورود + ${toFa("08:45")}`}
                tone="primary"
              />
              {parsedEntry > RULES.latestEntry && (
                <Stat
                  className="min-w-40 flex-1"
                  label="تأخیر"
                  value={toFa(formatTime(parsedEntry - RULES.latestEntry))}
                  tone="danger"
                />
              )}
              <CopyButton text={`ورود ${formatTime(parsedEntry)} ← خروج موظف ${formatTime(requiredExit)}`} label="کپی" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">منتظر ساعت ورود…</p>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="کی باید می‌اومدم؟"
          description="ساعت خروج را بدهید تا آخرین ورود بدون کسری مشخص شود."
        />
        <TimeInput label="ساعت خروج" value={exit} onChange={setExit} />
        <div className="mt-4">
          {latestEntry == null ? (
            <p className="text-sm text-muted-foreground">منتظر ساعت خروج…</p>
          ) : latestEntry.latestEntry == null ? (
            <div
              role="alert"
              className="rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger"
            >
              با این ساعت خروج، حضور {toFa("08:45")} ممکن نیست.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Stat
                label="آخرین ورود بدون کسری"
                value={toFa(formatTime(latestEntry.latestEntry))}
                tone="success"
              />
              {latestEntry.unavoidableEarlyLeave && (
                <div className="flex items-start gap-2 rounded-xl border border-warn/30 bg-warn-soft p-3 text-sm text-warn">
                  <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                  خروج قبل از {toFa("16:15")} است و تعجیل حساب می‌شود.
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
