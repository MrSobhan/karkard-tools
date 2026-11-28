const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toEnDigits(str) {
  return String(str)
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
}

export function toFa(value) {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

const pad = (n) => String(n).padStart(2, "0");

export function parseDuration(str) {
  const m = /^(\d{1,3}):([0-5]\d)$/.exec(toEnDigits(str ?? "").trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

export function parseTime(str) {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(toEnDigits(str ?? "").trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

export function formatTime(minutes) {
  const abs = Math.abs(Math.round(minutes));
  return `${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

export function formatSigned(minutes) {
  return `${minutes < 0 ? "-" : ""}${formatTime(minutes)}`;
}

export function formatDuration(minutes) {
  const abs = Math.abs(Math.round(minutes));
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  if (hours === 0 && mins === 0) return "۰ دقیقه";
  const parts = [];
  if (hours) parts.push(`${toFa(hours)} ساعت`);
  if (mins) parts.push(`${toFa(mins)} دقیقه`);
  return parts.join(" و ");
}

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

export function nowMinutes(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

export function formatHms(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const p = (n) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

export function toDayKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
