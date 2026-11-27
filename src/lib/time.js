const FA = "۰۱۲۳۴۵۶۷۸۹";
const AR = "٠١٢٣٤٥٦٧٨٩";

/** هر نوع رقم (فارسی/عربی) را به لاتین تبدیل می‌کند */
export function toEnDigits(str) {
  return String(str)
    .replace(/[۰-۹]/g, (d) => String(FA.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR.indexOf(d)));
}

/** رقم‌های لاتین را به فارسی تبدیل می‌کند (فقط برای نمایش) */
export function toFa(value) {
  return String(value).replace(/\d/g, (d) => FA[Number(d)]);
}

const pad = (n) => String(n).padStart(2, "0");

/** "HH:mm" → دقیقه یا null (هر تعداد ساعت، برای مدت‌زمان) */
export function parseDuration(str) {
  const m = /^(\d{1,3}):([0-5]\d)$/.exec(toEnDigits(str ?? "").trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/** "HH:mm" → دقیقه یا null (ساعت ۰۰ تا ۲۳) */
export function parseTime(str) {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(toEnDigits(str ?? "").trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/** دقیقه → "HH:mm" */
export function formatTime(minutes) {
  const abs = Math.abs(Math.round(minutes));
  return `${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/** دقیقه → "HH:mm" با علامت منفی در صورت لزوم */
export function formatSigned(minutes) {
  return `${minutes < 0 ? "-" : ""}${formatTime(minutes)}`;
}

/** دقیقه → «۸ ساعت و ۴۵ دقیقه» */
export function formatDuration(minutes) {
  const abs = Math.abs(Math.round(minutes));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0 && m === 0) return "۰ دقیقه";
  const parts = [];
  if (h) parts.push(`${toFa(h)} ساعت`);
  if (m) parts.push(`${toFa(m)} دقیقه`);
  return parts.join(" و ");
}

/** ماسک ورودی: هر چیزی که کاربر تایپ کند را به الگوی HH:mm نزدیک می‌کند */
export function maskTime(raw) {
  const s = toEnDigits(raw ?? "").replace(/[^\d:]/g, "");
  if (s.includes(":")) {
    const [left, ...rest] = s.split(":");
    let h = left.replace(/\D/g, "").slice(0, 3);
    if (h.length === 1) h = "0" + h;
    const m = rest.join("").replace(/\D/g, "").slice(0, 2);
    return `${h}:${m}`;
  }
  const d = s.slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d;
}

/** ساعت فعلی سیستم به دقیقه */
export function nowMinutes(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}
