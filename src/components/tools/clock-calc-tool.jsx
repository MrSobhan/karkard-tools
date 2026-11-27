"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stat } from "@/components/stat";
import { CopyButton } from "@/components/copy-button";
import { decimalToMinutes, minutesToDecimal, sumItems } from "@/lib/clock-math";
import { formatDuration, formatSigned, formatTime, maskTime, parseDuration, toEnDigits, toFa } from "@/lib/time";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "sum", label: "جمع و تفریق" },
  { id: "min", label: "دقیقه ↔ ساعت" },
  { id: "dec", label: "اعشاری ↔ ساعت" },
];

function Field({ label, value, onChange, placeholder, time = true, ...rest }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      <input
        dir="ltr"
        inputMode={time ? "numeric" : "decimal"}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(time ? maskTime(e.target.value) : toEnDigits(e.target.value))}
        className="h-11 rounded-xl border border-border bg-background px-3 text-center font-mono text-lg tracking-widest"
        {...rest}
      />
    </label>
  );
}

let nextId = 3;

function SumSection() {
  const [rows, setRows] = useState([
    { id: 1, sign: 1, value: "" },
    { id: 2, sign: 1, value: "" },
  ]);
  const patch = (id, p) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const valid = rows.map((r) => ({ sign: r.sign, minutes: parseDuration(r.value) })).filter((r) => r.minutes != null);
  const total = sumItems(valid);

  return (
    <div className="flex flex-col gap-3">
      {rows.map((r, i) => (
        <div key={r.id} className="flex items-end gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 text-lg"
            aria-label={r.sign === 1 ? "جمع (برای تفریق بزنید)" : "تفریق (برای جمع بزنید)"}
            onClick={() => patch(r.id, { sign: -r.sign })}
          >
            {r.sign === 1 ? "+" : "−"}
          </Button>
          <div className="flex-1">
            <Field label={`مقدار ${toFa(i + 1)}`} value={r.value} onChange={(v) => patch(r.id, { value: v })} placeholder="00:00" />
          </div>
          {rows.length > 2 && (
            <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="حذف ردیف" onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}>
              <X className="size-4" />
            </Button>
          )}
        </div>
      ))}
      <div>
        <Button variant="ghost" size="sm" onClick={() => setRows((rs) => [...rs, { id: nextId++, sign: 1, value: "" }])}>
          <Plus className="size-4" aria-hidden />
          افزودن مقدار
        </Button>
      </div>
      <div aria-live="polite" className="flex flex-wrap items-end gap-3">
        <Stat className="min-w-44 flex-1" label="نتیجه" value={<span dir="ltr">{toFa(formatSigned(total))}</span>} hint={formatDuration(total)} tone={total < 0 ? "danger" : "primary"} />
        <CopyButton text={formatSigned(total)} label="کپی" />
      </div>
    </div>
  );
}

function MinSection() {
  const [mins, setMins] = useState("");
  const [hhmm, setHhmm] = useState("");
  const m = mins !== "" ? Number(mins.replace(/\D/g, "")) : null;
  const h = parseDuration(hhmm);
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="flex flex-col gap-3">
        <Field label="دقیقه" time={false} value={mins} onChange={(v) => setMins(v.replace(/\D/g, ""))} placeholder="525" />
        <Stat label="ساعت" value={m != null ? <span dir="ltr">{toFa(formatTime(m))}</span> : "—"} hint={m != null ? formatDuration(m) : undefined} tone="primary" />
      </div>
      <div className="flex flex-col gap-3">
        <Field label="ساعت (HH:mm)" value={hhmm} onChange={setHhmm} placeholder="08:45" />
        <Stat label="دقیقه" value={h != null ? toFa(h) : "—"} tone="success" />
      </div>
    </div>
  );
}

function DecSection() {
  const [dec, setDec] = useState("");
  const [hhmm, setHhmm] = useState("");
  const m = dec !== "" ? decimalToMinutes(dec) : null;
  const h = parseDuration(hhmm);
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="flex flex-col gap-3">
        <Field label="عدد اعشاری" time={false} value={dec} onChange={(v) => setDec(v.replace(/[^\d.,٫]/g, ""))} placeholder="8.75" />
        <Stat label="ساعت" value={m != null ? <span dir="ltr">{toFa(formatTime(m))}</span> : "—"} hint={m != null ? formatDuration(m) : undefined} tone="primary" />
      </div>
      <div className="flex flex-col gap-3">
        <Field label="ساعت (HH:mm)" value={hhmm} onChange={setHhmm} placeholder="08:45" />
        <Stat label="اعشاری" value={h != null ? toFa(minutesToDecimal(h)) : "—"} tone="success" />
      </div>
    </div>
  );
}

export function ClockCalcTool() {
  const [sec, setSec] = useState("sum");
  return (
    <Card>
      <CardHeader title="ماشین‌حساب ساعت" description="نتیجه‌ها زنده است؛ دکمه‌ی محاسبه ندارد." />
      <div role="tablist" aria-label="بخش‌های ماشین‌حساب" className="mb-5 inline-flex rounded-xl border border-border bg-muted p-1">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={sec === s.id}
            onClick={() => setSec(s.id)}
            className={cn("rounded-lg px-3 py-1.5 text-sm transition", sec === s.id ? "bg-background font-medium shadow-sm" : "text-muted-foreground")}
          >
            {s.label}
          </button>
        ))}
      </div>
      {sec === "sum" && <SumSection />}
      {sec === "min" && <MinSection />}
      {sec === "dec" && <DecSection />}
    </Card>
  );
}
