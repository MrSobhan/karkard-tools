"use client";
import { useState } from "react";
import { Calculator, CalendarDays, DoorOpen, Hourglass, Timer } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { DailyTool } from "@/components/tools/daily-tool";
import { WhenTool } from "@/components/tools/when-tool";
import { TodayTool } from "@/components/tools/today-tool";
import { MonthlyTool } from "@/components/tools/monthly-tool";
import { ClockCalcTool } from "@/components/tools/clock-calc-tool";

const TABS = [
  { id: "today", label: "امروز", icon: Timer, Comp: TodayTool },
  { id: "daily", label: "محاسبه‌ی روزانه", icon: Calculator, Comp: DailyTool },
  { id: "when", label: "کی برم؟", icon: DoorOpen, Comp: WhenTool },
  { id: "monthly", label: "جدول ماهانه", icon: CalendarDays, Comp: MonthlyTool },
  { id: "clock", label: "ماشین‌حساب ساعت", icon: Hourglass, Comp: ClockCalcTool },
];

export function ToolTabs() {
  const [active, setActive] = useState("daily");
  return (
    <div className="flex flex-col gap-4">
      <Tabs tabs={TABS} value={active} onValueChange={setActive} label="ابزارهای کارکرد" />
      {/* همه‌ی ابزارها mount می‌مانند تا ورودی‌ها هنگام تعویض تب پاک نشوند */}
      {TABS.map(({ id, Comp }) => (
        <div key={id} id={`panel-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`} hidden={active !== id} className={active === id ? "tab-in" : undefined}>
          <Comp />
        </div>
      ))}
    </div>
  );
}
