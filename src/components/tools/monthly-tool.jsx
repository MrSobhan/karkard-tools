"use client";
import { useCallback, useId, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Stat } from "@/components/stat";
import { CopyButton } from "@/components/copy-button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useMounted } from "@/hooks/use-mounted";
import { calculateDay } from "@/lib/calc";
import { MONTH_NAMES, WEEKDAY_NAMES, jalaliMonthLength, jalaliWeekday, todayJalali } from "@/lib/jalali";
import { formatTime, maskTime, parseTime, toFa } from "@/lib/time";
import { buildMonthSummary } from "@/lib/summary";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "karkard-monthly";
const FALLBACK_DATA = { settings: { off: [5, 6] }, months: {} };
const DAY_STATUS_OPTIONS = [
  { value: "work", label: "کاری" },
  { value: "holiday", label: "تعطیل" },
  { value: "leave", label: "مرخصی" },
  { value: "mission", label: "ماموریت" },
];
const WEEKEND_DAYS = [5, 6];
const YEAR_RANGE_SIZE = 7;
const YEAR_OFFSET_BACK = 3;

function MiniTime({ label, value, onChange }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        dir="ltr"
        inputMode="numeric"
        autoComplete="off"
        maxLength={6}
        placeholder={label === "ورود" ? "08:00" : "16:45"}
        aria-label={label}
        value={value ?? ""}
        onChange={(e) => onChange(maskTime(e.target.value))}
        className="h-10 w-full rounded-xl border border-border bg-background px-2 text-center font-mono tracking-wider transition-colors hover:border-border-strong focus:border-primary"
      />
      <span aria-hidden className="mt-0.5 block text-center text-[10px] text-muted-foreground md:hidden">
        {label}
      </span>
    </div>
  );
}

function DayRow({ jy, jm, jd, weekendDays, record, onChange }) {
  const weekday = jalaliWeekday(jy, jm, jd);
  const status = record?.s ?? (weekendDays.includes(weekday) ? "holiday" : "work");
  const result =
    status === "work" ? calculateDay(parseTime(record?.i ?? ""), parseTime(record?.o ?? "")) : null;

  const updateRecord = (patch) => onChange(jd, { ...record, ...patch });

  return (
    <div
      className={cn(
        "grid grid-cols-2 items-start gap-2 rounded-xl border border-border bg-background/50 p-3 transition-colors hover:border-border-strong md:grid-cols-[8rem_8rem_6.5rem_6.5rem_1fr] md:items-center",
        status === "holiday" && "opacity-70",
      )}
    >
      <div className="text-sm font-medium">
        {toFa(jd)} {MONTH_NAMES[jm - 1]}
        <span className="block text-xs text-muted-foreground">{WEEKDAY_NAMES[weekday]}</span>
      </div>
      <Select
        aria-label={`وضعیت روز ${toFa(jd)}`}
        value={status}
        options={DAY_STATUS_OPTIONS}
        onChange={(e) => updateRecord({ s: e.target.value })}
        className="w-full"
      />
      {status === "work" ? (
        <>
          <MiniTime label="ورود" value={record?.i} onChange={(v) => updateRecord({ i: v })} />
          <MiniTime label="خروج" value={record?.o} onChange={(v) => updateRecord({ o: v })} />
          <div className="col-span-2 flex flex-wrap gap-1 md:col-span-1">
            {result.status === "invalid" && <Badge tone="danger">خروج قبل از ورود</Badge>}
            {result.status === "complete" && <Badge tone="success">کامل</Badge>}
            {result.overtime > 0 && <Badge tone="success">مازاد {toFa(formatTime(result.overtime))}</Badge>}
            {result.earlyLeave > 0 && <Badge tone="danger">تعجیل {toFa(formatTime(result.earlyLeave))}</Badge>}
            {result.late > 0 && <Badge tone="danger">تأخیر {toFa(formatTime(result.late))}</Badge>}
            {result.leaveSuggestion && (
              <Badge tone="warn">مرخصی ساعتی {toFa(formatTime(result.leaveSuggestion.minutes))}</Badge>
            )}
            {result.status === "incomplete" && (
              <Badge>خروج موظف {toFa(formatTime(result.requiredExit))}</Badge>
            )}
          </div>
        </>
      ) : (
        <div className="col-span-2 text-xs text-muted-foreground md:col-span-3">
          {DAY_STATUS_OPTIONS.find((s) => s.value === status).label}
        </div>
      )}
    </div>
  );
}

function computeTotals(days, weekendDays, jy, jm, length) {
  const totals = {
    presence: 0,
    overtime: 0,
    earlyLeave: 0,
    late: 0,
    leave: 0,
    workDays: 0,
    leaveDays: 0,
    missionDays: 0,
    holidays: 0,
  };

  for (let day = 1; day <= length; day += 1) {
    const record = days[day];
    const status = record?.s ?? (weekendDays.includes(jalaliWeekday(jy, jm, day)) ? "holiday" : "work");

    if (status === "holiday") totals.holidays += 1;
    else if (status === "leave") totals.leaveDays += 1;
    else if (status === "mission") totals.missionDays += 1;
    else {
      const result = calculateDay(parseTime(record?.i ?? ""), parseTime(record?.o ?? ""));
      if (result.status === "empty" || result.status === "invalid" || result.status === "incomplete") {
        if (result.late) totals.late += result.late;
        continue;
      }
      totals.workDays += 1;
      totals.presence += result.presence;
      totals.overtime += result.overtime;
      totals.earlyLeave += result.earlyLeave;
      totals.late += result.late;
      totals.leave += result.leaveSuggestion?.minutes ?? 0;
    }
  }

  return totals;
}

function MonthlyInner() {
  const [data, setData] = useLocalStorage(STORAGE_KEY, FALLBACK_DATA);
  const [yearMonth, setYearMonth] = useState(() => {
    const today = todayJalali();
    return { jy: today.jy, jm: today.jm };
  });

  const { jy, jm } = yearMonth;
  const weekendDays = data.settings?.off ?? WEEKEND_DAYS;
  const monthKey = `${jy}-${jm}`;
  const days = useMemo(() => data.months?.[monthKey] ?? {}, [data.months, monthKey]);
  const length = jalaliMonthLength(jy, jm);

  const updateDay = useCallback(
    (jd, record) =>
      setData({ ...data, months: { ...data.months, [monthKey]: { ...days, [jd]: record } } }),
    [data, days, monthKey, setData],
  );

  const toggleWeekend = (weekday, isOn) => {
    const next = isOn
      ? [...new Set([...weekendDays, weekday])]
      : weekendDays.filter((w) => w !== weekday);
    setData({ ...data, settings: { ...data.settings, off: next } });
  };

  const clearMonth = () => {
    const rest = { ...data.months };
    delete rest[monthKey];
    setData({ ...data, months: rest });
  };

  const shiftMonth = (delta) => {
    let month = jm + delta;
    let year = jy;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    setYearMonth({ jy: year, jm: month });
  };

  const totals = useMemo(
    () => computeTotals(days, weekendDays, jy, jm, length),
    [days, weekendDays, jy, jm, length],
  );

  const title = `${MONTH_NAMES[jm - 1]} ${toFa(jy)}`;
  const years = Array.from({ length: YEAR_RANGE_SIZE }, (_, i) => jy - YEAR_OFFSET_BACK + i);

  return (
    <Card>
      <CardHeader
        title="جدول ماهانه"
        description="ورود و خروج هر روز را بزنید؛ جمع ماه برای ثبت در چارگون آماده می‌شود. داده فقط روی همین دستگاه می‌ماند."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => shiftMonth(-1)} aria-label="ماه قبل">
          <ChevronRight className="size-4" />
        </Button>
        <Select
          aria-label="ماه"
          value={jm}
          options={MONTH_NAMES.map((name, index) => ({ value: index + 1, label: name }))}
          onChange={(e) => setYearMonth({ jy, jm: Number(e.target.value) })}
        />
        <Select
          aria-label="سال"
          value={jy}
          options={years.map((year) => ({ value: year, label: toFa(year) }))}
          onChange={(e) => setYearMonth({ jm, jy: Number(e.target.value) })}
        />
        <Button variant="outline" size="icon" onClick={() => shiftMonth(1)} aria-label="ماه بعد">
          <ChevronLeft className="size-4" />
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        {WEEKEND_DAYS.map((weekday) => (
          <label key={weekday} className="flex items-center gap-2">
            <Switch
              checked={weekendDays.includes(weekday)}
              onCheckedChange={(on) => toggleWeekend(weekday, on)}
              label={`${WEEKDAY_NAMES[weekday]} تعطیل`}
            />
            {WEEKDAY_NAMES[weekday]} تعطیل
          </label>
        ))}
      </div>

      <div className="hidden grid-cols-[8rem_8rem_6.5rem_6.5rem_1fr] gap-2 px-3 pb-2 text-xs text-muted-foreground md:grid">
        <span>تاریخ</span>
        <span>وضعیت</span>
        <span className="text-center">ورود</span>
        <span className="text-center">خروج</span>
        <span>نتیجه</span>
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length }, (_, i) => (
          <DayRow
            key={`${monthKey}-${i + 1}`}
            jy={jy}
            jm={jm}
            jd={i + 1}
            weekendDays={weekendDays}
            record={days[i + 1]}
            onChange={updateDay}
          />
        ))}
      </div>

      <h3 className="mt-6 mb-3 font-bold">جمع {title}</h3>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat
          label="مجموع حضور"
          value={toFa(formatTime(totals.presence))}
          tone="primary"
          hint={`${toFa(totals.workDays)} روز کاری`}
        />
        <Stat label="مجموع مازاد" value={toFa(formatTime(totals.overtime))} tone="success" />
        <Stat label="مجموع تعجیل" value={toFa(formatTime(totals.earlyLeave))} tone="danger" />
        <Stat label="مجموع تأخیر" value={toFa(formatTime(totals.late))} tone="danger" />
        <Stat label="مرخصی ساعتی پیشنهادی" value={toFa(formatTime(totals.leave))} tone="warn" />
        <Stat
          label="مرخصی / ماموریت / تعطیل"
          value={`${toFa(totals.leaveDays)} / ${toFa(totals.missionDays)} / ${toFa(totals.holidays)}`}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <CopyButton text={buildMonthSummary({ title, totals })} label="کپی خلاصه برای چارگون" />
        <Button
          variant="danger"
          onClick={() => {
            if (window.confirm(`اطلاعات ${title} پاک شود؟`)) clearMonth();
          }}
        >
          <Trash2 className="size-4" aria-hidden />
          پاک کردن ماه
        </Button>
      </div>
    </Card>
  );
}

export function MonthlyTool() {
  const mounted = useMounted();
  return mounted ? <MonthlyInner /> : <Card className="h-64 animate-pulse" aria-busy />;
}
