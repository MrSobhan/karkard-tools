import { RULES } from "./work-rules";
import { formatTime } from "./time";

/**
 * محاسبه‌ی یک روز کاری. همه‌چیز pure است و ورودی/خروجی بر حسب دقیقه از نیمه‌شب.
 * @param {number|null} entry
 * @param {number|null} exit
 * @param {typeof RULES} rules
 */
export function calculateDay(entry, exit, rules = RULES) {
  const empty = {
    presence: 0,
    requiredExit: null,
    overtime: 0,
    earlyLeave: 0,
    late: 0,
    leaveSuggestion: null,
    status: "empty",
    error: null,
  };
  if (entry == null) return empty;

  const effectiveStart = rules.clampEarlyEntry ? Math.max(entry, rules.officialStart) : entry;
  const requiredExit = effectiveStart + rules.requiredMinutes;
  const late = entry > rules.latestEntry ? entry - rules.latestEntry : 0;
  const base = { ...empty, requiredExit, late, status: "incomplete" };

  if (exit == null) return base;
  if (exit <= entry) {
    return { ...base, status: "invalid", error: "ساعت خروج باید بعد از ساعت ورود باشد." };
  }

  const presence = exit - entry;
  const overtime = exit > requiredExit ? exit - requiredExit : 0;
  const earlyLeave = exit < rules.officialEnd ? rules.officialEnd - exit : 0;

  let leaveSuggestion = null;
  if (exit < requiredExit) {
    const from = Math.max(exit, rules.officialEnd);
    const minutes = requiredExit - from;
    if (minutes > 0) leaveSuggestion = { from, to: requiredExit, minutes };
  }

  let status = "complete";
  if (overtime > 0) status = "overtime";
  else if (earlyLeave > 0) status = "early";
  else if (leaveSuggestion) status = "leave";

  return { ...base, presence, overtime, earlyLeave, leaveSuggestion, status };
}

/** «کی برم؟» ورود → خروج موظف */
export function requiredExitFor(entry, rules = RULES) {
  return calculateDay(entry, null, rules).requiredExit;
}

/**
 * «کی باید می‌اومدم؟» خروج → آخرین ورود بدون کسری
 * @returns {{latestEntry:number|null, unavoidableEarlyLeave:boolean}}
 */
export function latestEntryFor(exit, rules = RULES) {
  const needed = exit - rules.requiredMinutes;
  if (needed < 0) return { latestEntry: null, unavoidableEarlyLeave: true };
  return {
    latestEntry: Math.min(rules.latestEntry, needed),
    unavoidableEarlyLeave: exit < rules.officialEnd,
  };
}

/** متن فارسی پیشنهاد مرخصی */
export function leaveText(s) {
  return `بهتر است ${s.minutes} دقیقه مرخصی ساعتی از ${formatTime(s.from)} تا ${formatTime(s.to)} ثبت کنید.`;
}
