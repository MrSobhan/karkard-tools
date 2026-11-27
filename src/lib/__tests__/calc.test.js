import { describe, it, expect } from "vitest";
import { calculateDay, requiredExitFor, latestEntryFor, leaveText } from "../calc";
import { parseTime, formatTime, maskTime, formatDuration, parseDuration } from "../time";
import { todayJalali, jalaliMonthLength, jalaliWeekday, toJalali } from "../jalali";
import { decimalToMinutes, minutesToDecimal } from "../clock-math";

const t = (s) => parseTime(s);

describe("calculateDay", () => {
  it("ورود 08:00 → خروج موظف 16:45", () => {
    expect(formatTime(calculateDay(t("08:00"), null).requiredExit)).toBe("16:45");
  });
  it("ورود 08:00 / خروج 16:45: بدون مازاد و کسری", () => {
    const r = calculateDay(t("08:00"), t("16:45"));
    expect(r.status).toBe("complete");
    expect(r.overtime + r.earlyLeave + r.late).toBe(0);
    expect(r.leaveSuggestion).toBeNull();
    expect(r.presence).toBe(525);
  });
  it("ورود 08:00 / خروج 16:30: تعجیل صفر و پیشنهاد ۱۵ دقیقه مرخصی", () => {
    const r = calculateDay(t("08:00"), t("16:30"));
    expect(r.earlyLeave).toBe(0);
    expect(r.leaveSuggestion).toEqual({ from: t("16:30"), to: t("16:45"), minutes: 15 });
    expect(r.status).toBe("leave");
    expect(leaveText(r.leaveSuggestion)).toBe("بهتر است 15 دقیقه مرخصی ساعتی از 16:30 تا 16:45 ثبت کنید.");
  });
  it("خروج دقیقاً 16:15 تعجیل ندارد", () => {
    const r = calculateDay(t("08:00"), t("16:15"));
    expect(r.earlyLeave).toBe(0);
    expect(r.leaveSuggestion.minutes).toBe(30);
  });
  it("خروج 16:00 → تعجیل ۱۵ دقیقه و پیشنهاد از 16:15 تا خروج موظف", () => {
    const r = calculateDay(t("08:00"), t("16:00"));
    expect(r.earlyLeave).toBe(15);
    expect(r.leaveSuggestion).toEqual({ from: t("16:15"), to: t("16:45"), minutes: 30 });
    expect(r.status).toBe("early");
  });
  it("ورود 07:30 / خروج 16:15 کامل است", () => {
    const r = calculateDay(t("07:30"), t("16:15"));
    expect(r.status).toBe("complete");
    expect(r.leaveSuggestion).toBeNull();
    expect(formatTime(r.requiredExit)).toBe("16:15");
  });
  it("ورود زودتر از 07:30 برای خروج موظف برابر 07:30 است", () => {
    expect(formatTime(requiredExitFor(t("07:00")))).toBe("16:15");
  });
  it("ورود 08:45 تأخیر ندارد", () => {
    const r = calculateDay(t("08:45"), null);
    expect(r.late).toBe(0);
    expect(formatTime(r.requiredExit)).toBe("17:30");
  });
  it("ورود 08:46 یک دقیقه تأخیر", () => {
    expect(calculateDay(t("08:46"), null).late).toBe(1);
  });
  it("ورود 08:50 → تأخیر ۵ دقیقه و خروج موظف 17:35", () => {
    const r = calculateDay(t("08:50"), null);
    expect(r.late).toBe(5);
    expect(formatTime(r.requiredExit)).toBe("17:35");
  });
  it("مازاد: ورود 08:00 / خروج 17:00 → ۱۵ دقیقه", () => {
    const r = calculateDay(t("08:00"), t("17:00"));
    expect(r.overtime).toBe(15);
    expect(r.status).toBe("overtime");
  });
  it("خروج 16:45 با ورود 07:30 → مازاد ۳۰ دقیقه", () => {
    expect(calculateDay(t("07:30"), t("16:45")).overtime).toBe(30);
  });
  it("خروج قبل از ورود خطا می‌دهد", () => {
    const r = calculateDay(t("09:00"), t("08:00"));
    expect(r.status).toBe("invalid");
    expect(r.error).toBeTruthy();
  });
  it("خروج مساوی ورود هم خطا است", () => {
    expect(calculateDay(t("09:00"), t("09:00")).status).toBe("invalid");
  });
  it("بدون ورود: خالی", () => {
    expect(calculateDay(null, null).status).toBe("empty");
  });
  it("بدون خروج: ناقص", () => {
    expect(calculateDay(t("08:00"), null).status).toBe("incomplete");
  });
});

describe("latestEntryFor", () => {
  it("خروج 17:30 → آخرین ورود 08:45", () => {
    expect(formatTime(latestEntryFor(t("17:30")).latestEntry)).toBe("08:45");
  });
  it("خروج 16:45 → آخرین ورود 08:00", () => {
    expect(formatTime(latestEntryFor(t("16:45")).latestEntry)).toBe("08:00");
  });
  it("خروج 18:00 → سقف 08:45", () => {
    expect(formatTime(latestEntryFor(t("18:00")).latestEntry)).toBe("08:45");
  });
  it("خروج خیلی زود → ناممکن", () => {
    expect(latestEntryFor(t("08:00")).latestEntry).toBeNull();
  });
});

describe("time utils", () => {
  it("parse/format", () => {
    expect(parseTime("8:5")).toBeNull();
    expect(parseTime("24:00")).toBeNull();
    expect(parseTime("۰۸:۴۵")).toBe(525);
    expect(formatTime(525)).toBe("08:45");
    expect(parseDuration("40:30")).toBe(2430);
  });
  it("ماسک", () => {
    expect(maskTime("0845")).toBe("08:45");
    expect(maskTime("8:45")).toBe("08:45");
    expect(maskTime("08")).toBe("08");
    expect(maskTime("083")).toBe("08:3");
  });
  it("مدت فارسی", () => {
    expect(formatDuration(525)).toBe("۸ ساعت و ۴۵ دقیقه");
    expect(formatDuration(0)).toBe("۰ دقیقه");
  });
});

describe("jalali", () => {
  it("2026-11-27 = 6 آذر 1405", () => {
    expect(toJalali(2026, 11, 27)).toEqual({ jy: 1405, jm: 9, jd: 6 });
  });
  it("طول ماه‌ها و کبیسه", () => {
    expect(jalaliMonthLength(1405, 1)).toBe(31);
    expect(jalaliMonthLength(1405, 7)).toBe(30);
    expect(jalaliMonthLength(1403, 12)).toBe(30); // کبیسه
    expect(jalaliMonthLength(1404, 12)).toBe(29);
  });
  it("روز هفته: 6 آذر 1405 جمعه است", () => {
    expect(jalaliWeekday(1405, 9, 6)).toBe(6);
  });
  it("todayJalali", () => {
    expect(todayJalali(new Date(2026, 10, 27))).toEqual({ jy: 1405, jm: 9, jd: 6 });
  });
});

describe("clock math", () => {
  it("اعشاری ↔ ساعت", () => {
    expect(decimalToMinutes("8.75")).toBe(525);
    expect(minutesToDecimal(525)).toBe(8.75);
  });
});
