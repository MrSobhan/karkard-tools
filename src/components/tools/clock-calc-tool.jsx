"use client";
import { useRef, useState } from "react";
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
        className="h-11 rounded-xl border border-border bg-background px-3 text-center font-mono text-lg tracking-widest transition-colors hover:border-border-strong focus:border-primary"
        {...rest}
      />
    </label>
  );
}

function SumSection() {
  const idRef = useRef(3);
  const [rows, setRows] = useState([
    { id: 1, sign: 1, value: "" },
    { id: 2, sign: 1, value: "" },
  ]);

  const patchRow = (id, patch) =>
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const addRow = () =>
    setRows((current) => [...current, { id: idRef.current++, sign: 1, value: "" }]);

  const removeRow = (id) =>
    setRows((current) => (current.length > 2 ? current.filter((row) => row.id !== id) : current));

  const validRows = rows
    .map((row) => ({ sign: row.sign, minutes: parseDuration(row.value) }))
    .filter((row) => row.minutes != null);
  const total = sumItems(validRows);

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, index) => (
        <div key={row.id} className="flex items-end gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 text-lg"
            aria-label={row.sign === 1 ? "جمع (برای تفریق بزنید)" : "تفریق (برای جمع بزنید)"}
            onClick={() => patchRow(row.id, { sign: -row.sign })}
          >
            {row.sign === 1 ? "+" : "−"}
          </Button>
          <div className="flex-1">
            <Field
              label={`مقدار ${toFa(index + 1)}`}
              value={row.value}
              onChange={(v) => patchRow(row.id, { value: v })}
              placeholder="00:00"
            />
          </div>
          {rows.length > 2 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11"
              aria-label="حذف ردیف"
              onClick={() => removeRow(row.id)}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      ))}
      <div>
        <Button variant="ghost" size="sm" onClick={addRow}>
          <Plus className="size-4" aria-hidden />
          افزودن مقدار
        </Button>
      </div>
      <div aria-live="polite" className="flex flex-wrap items-end gap-3">
        <Stat
          className="min-w-44 flex-1"
          label="نتیجه"
          value={<span dir="ltr">{toFa(formatSigned(total))}</span>}
          hint={formatDuration(total)}
          tone={total < 0 ? "danger" : "primary"}
        />
        <CopyButton text={formatSigned(total)} label="کپی" />
      </div>
    </div>
  );
}

function MinSection() {
  const [minutes, setMinutes] = useState("");
  const [hhmm, setHhmm] = useState("");
  const parsedMinutes = minutes !== "" ? Number(minutes.replace(/\D/g, "")) : null;
  const parsedDuration = parseDuration(hhmm);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="flex flex-col gap-3">
        <Field
          label="دقیقه"
          time={false}
          value={minutes}
          onChange={(v) => setMinutes(v.replace(/\D/g, ""))}
          placeholder="525"
        />
        <Stat
          label="ساعت"
          value={parsedMinutes != null ? <span dir="ltr">{toFa(formatTime(parsedMinutes))}</span> : "—"}
          hint={parsedMinutes != null ? formatDuration(parsedMinutes) : undefined}
          tone="primary"
        />
      </div>
      <div className="flex flex-col gap-3">
        <Field label="ساعت (HH:mm)" value={hhmm} onChange={setHhmm} placeholder="08:45" />
        <Stat
          label="دقیقه"
          value={parsedDuration != null ? toFa(parsedDuration) : "—"}
          tone="success"
        />
      </div>
    </div>
  );
}

function DecSection() {
  const [decimal, setDecimal] = useState("");
  const [hhmm, setHhmm] = useState("");
  const parsedMinutes = decimal !== "" ? decimalToMinutes(decimal) : null;
  const parsedDuration = parseDuration(hhmm);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="flex flex-col gap-3">
        <Field
          label="عدد اعشاری"
          time={false}
          value={decimal}
          onChange={(v) => setDecimal(v.replace(/[^\d.,٫]/g, ""))}
          placeholder="8.75"
        />
        <Stat
          label="ساعت"
          value={parsedMinutes != null ? <span dir="ltr">{toFa(formatTime(parsedMinutes))}</span> : "—"}
          hint={parsedMinutes != null ? formatDuration(parsedMinutes) : undefined}
          tone="primary"
        />
      </div>
      <div className="flex flex-col gap-3">
        <Field label="ساعت (HH:mm)" value={hhmm} onChange={setHhmm} placeholder="08:45" />
        <Stat
          label="اعشاری"
          value={parsedDuration != null ? toFa(minutesToDecimal(parsedDuration)) : "—"}
          tone="success"
        />
      </div>
    </div>
  );
}

export function ClockCalcTool() {
  const [section, setSection] = useState("sum");

  return (
    <Card>
      <CardHeader title="ماشین‌حساب ساعت" description="نتیجه‌ها زنده است؛ دکمه‌ی محاسبه ندارد." />
      <div
        role="tablist"
        aria-label="بخش‌های ماشین‌حساب"
        className="mb-5 inline-flex rounded-xl border border-border bg-muted p-1"
      >
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={section === s.id}
            onClick={() => setSection(s.id)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-sm transition-all duration-150 cursor-pointer",
              section === s.id
                ? "bg-background font-medium shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      {section === "sum" && <SumSection />}
      {section === "min" && <MinSection />}
      {section === "dec" && <DecSection />}
    </Card>
  );
}
