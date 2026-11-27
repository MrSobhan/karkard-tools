import { formatDuration, formatTime } from "./time";

/** متن خلاصه‌ی ماه برای کپی (چارگون) */
export function buildMonthSummary({ title, totals }) {
  const lines = [
    `کارکرد ${title}`,
    `روزهای کاری ثبت‌شده: ${totals.workDays}`,
    `مجموع حضور: ${formatTime(totals.presence)} (${formatDuration(totals.presence)})`,
    `مجموع مازاد: ${formatTime(totals.overtime)}`,
    `مجموع تعجیل: ${formatTime(totals.earlyLeave)}`,
    `مجموع تأخیر: ${formatTime(totals.late)}`,
    `مرخصی ساعتی پیشنهادی: ${formatTime(totals.leave)}`,
    `روز مرخصی: ${totals.leaveDays} | ماموریت: ${totals.missionDays} | تعطیل: ${totals.holidays}`,
  ];
  return lines.join("\n");
}
