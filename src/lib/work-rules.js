// تمام قوانین کاری اینجا به‌صورت config است (دقیقه از نیمه‌شب)
export const RULES = {
  requiredMinutes: 8 * 60 + 45, // 08:45 حضور موظف
  officialStart: 7 * 60 + 30, // 07:30
  officialEnd: 16 * 60 + 15, // 16:15
  flexMinutes: 1 * 60 + 15, // 01:15 شناوری واحد نرم‌افزار
  latestEntry: 8 * 60 + 45, // 08:45 (بعد از آن تأخیر)
  clampEarlyEntry: true, // ورود زودتر از officialStart برای خروج موظف = officialStart
};
