import { formatTime } from "./time";

export function decimalToMinutes(str) {
  const s = String(str).replace("٫", ".").replace(",", ".").trim();
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  return Math.round(parseFloat(s) * 60);
}

export function minutesToDecimal(minutes) {
  return Math.round((minutes / 60) * 100) / 100;
}

export function sumItems(items) {
  return items.reduce((acc, it) => acc + it.sign * it.minutes, 0);
}

export { formatTime };
