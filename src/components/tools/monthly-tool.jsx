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

const KEY = "karkard-monthly";
const FALLBACK = { settings: { off: [5, 6] }, months: {} };
const STATUS = [
  { value: "work", label: "کاری" },
  { value: "holiday", label: "تعطیل" },
  { value: "leave", label: "مرخصی" },
  { value: "mission", label: "ماموریت" },
];

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
        className="h-10 w-full rounded-xl border border-border bg-background px-2 text-center font-mono tracking-wider"
      />
      <span aria-hidden className="mt-0.5 block text-center text-[10px] text-muted-foreground md:hidden">
        {label}
      </span>
    </div>
  );
}

function DayRow({ jy, jm, jd, off, rec, onChange }) {
  const wd = jalaliWeekday(jy, jm, jd);
  const status = rec?.s ?? (off.includes(wd) ? "holiday" : "work");
  const r = status === "work" ? calculateDay(parseTime(rec?.i ?? ""), parseTime(rec?.o ?? "")) : null;
  const set = (patch) => onChange(jd, { ...rec, ...patch });

  return (
    <div
      className={cn(
        "grid grid-cols-2 items-start gap-2 rounded-xl border border-border bg-background/50 p-3 md:grid-cols-[8rem_8rem_6.5rem_6.5rem_1fr] md:items-center",
        status === "holiday" && "opacity-70",
      )}
    >
      <div className="text-sm font-medium">
        {toFa(jd)} {MONTH_NAMES[jm - 1]}
        <span className="block text-xs text-muted-foreground">{WEEKDAY_NAMES[wd]}</span>
      </div>
      <Select aria-label={`وضعیت روز ${toFa(jd)}`} value={status} options={STATUS} onChange={(e) => set({ s: e.target.value })} className="w-full" />
      {status === "work" ? (
        <>
          <MiniTime label="ورود" value={rec?.i} onChange={(v) => set({ i: v })} />
          <MiniTime label="خروج" value={rec?.o} onChange={(v) => set({ o: v })} />
          <div className="col-span-2 flex flex-wrap gap-1 md:col-span-1">
            {r.status === "invalid" && <Badge tone="danger">خروج قبل از ورود</Badge>}
            {r.status === "complete" && <Badge tone="success">کامل</Badge>}
            {r.overtime > 0 && <Badge tone="success">مازاد {toFa(formatTime(r.overtime))}</Badge>}
            {r.earlyLeave > 0 && <Badge tone="danger">تعجیل {toFa(formatTime(r.earlyLeave))}</Badge>}
            {r.late > 0 && <Badge tone="danger">تأخیر {toFa(formatTime(r.late))}</Badge>}
            {r.leaveSuggestion && <Badge tone="warn">مرخصی ساعتی {toFa(formatTime(r.leaveSuggestion.minutes))}</Badge>}
            {r.status === "incomplete" && <Badge>خروج موظف {toFa(formatTime(r.requiredExit))}</Badge>}
          </div>
        </>
      ) : (
        <div className="col-span-2 text-xs text-muted-foreground md:col-span-3">{STATUS.find((s) => s.value === status).label}</div>
      )}
    </div>
  );
}

function MonthlyInner() {
  const [data, setData] = useLocalStorage(KEY, FALLBACK);
  const [ym, setYm] = useState(() => {
    const t = todayJalali();
    return { jy: t.jy, jm: t.jm };
  });
  const { jy, jm } = ym;
  const off = data.settings?.off ?? [5, 6];
  const mkey = `${jy}-${jm}`;
  const days = data.months?.[mkey] ?? {};
  const length = jalaliMonthLength(jy, jm);

  const updateDay = useCallback(
    (jd, rec) => setData({ ...data, months: { ...data.months, [mkey]: { ...days, [jd]: rec } } }),
    [data, days, mkey, setData],
  );
  const toggleOff = (wd, on) => {
    const next = on ? [...new Set([...off, wd])] : off.filter((x) => x !== wd);
    setData({ ...data, settings: { ...data.settings, off: next } });
  };
  const clearMonth = () => {
    const rest = { ...data.months };
    delete rest[mkey];
    setData({ ...data, months: rest });
  };
  const shift = (d) => {
    let m = jm + d;
    let y = jy;
    if (m > 12) { m = 1; y += 1; }
    if (m < 1) { m = 12; y -= 1; }
    setYm({ jy: y, jm: m });
  };

  const totals = useMemo(() => {
    const t = { presence: 0, overtime: 0, earlyLeave: 0, late: 0, leave: 0, workDays: 0, leaveDays: 0, missionDays: 0, holidays: 0 };
    for (let d = 1; d <= length; d += 1) {
      const rec = days[d];
      const status = rec?.s ?? (off.includes(jalaliWeekday(jy, jm, d)) ? "holiday" : "work");
      if (status === "holiday") t.holidays += 1;
      else if (status === "leave") t.leaveDays += 1;
      else if (status === "mission") t.missionDays += 1;
      else {
        const r = calculateDay(parseTime(rec?.i ?? ""), parseTime(rec?.o ?? ""));
        if (r.status === "empty" || r.status === "invalid" || r.status === "incomplete") {
          if (r.late) t.late += r.late;
          continue;
        }
        t.workDays += 1;
        t.presence += r.presence;
        t.overtime += r.overtime;
        t.earlyLeave += r.earlyLeave;
        t.late += r.late;
        t.leave += r.leaveSuggestion?.minutes ?? 0;
      }
    }
    return t;
  }, [days, off, jy, jm, length]);

  const title = `${MONTH_NAMES[jm - 1]} ${jy}`;
  const years = Array.from({ length: 7 }, (_, i) => jy - 3 + i);

  return (
    <Card>
      <CardHeader title="جدول ماهانه" description="ورود و خروج هر روز را بزنید؛ جمع ماه برای ثبت در چارگون آماده می‌شود. داده فقط روی همین دستگاه می‌ماند." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => shift(-1)} aria-label="ماه قبل">
          <ChevronRight className="size-4" />
        </Button>
        <Select aria-label="ماه" value={jm} options={MONTH_NAMES.map((n, i) => ({ value: i + 1, label: n }))} onChange={(e) => setYm({ jy, jm: Number(e.target.value) })} />
        <Select aria-label="سال" value={jy} options={years.map((y) => ({ value: y, label: toFa(y) }))} onChange={(e) => setYm({ jm, jy: Number(e.target.value) })} />
        <Button variant="outline" size="icon" onClick={() => shift(1)} aria-label="ماه بعد">
          <ChevronLeft className="size-4" />
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        {[5, 6].map((wd) => (
          <label key={wd} className="flex items-center gap-2">
            <Switch checked={off.includes(wd)} onCheckedChange={(on) => toggleOff(wd, on)} label={`${WEEKDAY_NAMES[wd]} تعطیل`} />
            {WEEKDAY_NAMES[wd]} تعطیل
          </label>
        ))}
      </div>

      <div className="hidden grid-cols-[8rem_8rem_6.5rem_6.5rem_1fr] gap-2 px-3 pb-2 text-xs text-muted-foreground md:grid">
        <span>تاریخ</span><span>وضعیت</span><span className="text-center">ورود</span><span className="text-center">خروج</span><span>نتیجه</span>
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length }, (_, i) => (
          <DayRow key={`${mkey}-${i + 1}`} jy={jy} jm={jm} jd={i + 1} off={off} rec={days[i + 1]} onChange={updateDay} />
        ))}
      </div>

      <h3 className="mt-6 mb-3 font-bold">جمع {title}</h3>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="مجموع حضور" value={toFa(formatTime(totals.presence))} tone="primary" hint={`${toFa(totals.workDays)} روز کاری`} />
        <Stat label="مجموع مازاد" value={toFa(formatTime(totals.overtime))} tone="success" />
        <Stat label="مجموع تعجیل" value={toFa(formatTime(totals.earlyLeave))} tone="danger" />
        <Stat label="مجموع تأخیر" value={toFa(formatTime(totals.late))} tone="danger" />
        <Stat label="مرخصی ساعتی پیشنهادی" value={toFa(formatTime(totals.leave))} tone="warn" />
        <Stat label="مرخصی / ماموریت / تعطیل" value={`${toFa(totals.leaveDays)} / ${toFa(totals.missionDays)} / ${toFa(totals.holidays)}`} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <CopyButton text={buildMonthSummary({ title, totals })} label="کپی خلاصه برای چارگون" />
        <Button variant="danger" onClick={() => { if (window.confirm(`اطلاعات ${title} پاک شود؟`)) clearMonth(); }}>
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
