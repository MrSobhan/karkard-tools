import { formatTime } from "./time";

/** اعشاری → دقیقه (8.75 → 525) */
export function decimalToMinutes(str) {
  const s = String(str).replace("٫", ".").replace(",", ".").trim();
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  return Math.round(parseFloat(s) * 60);
}

/** دقیقه → اعشاری */
export function minutesToDecimal(minutes) {
  return Math.round((minutes / 60) * 100) / 100;
}

/** جمع/تفریق چند مقدار: items = [{sign: 1|-1, minutes}] */
export function sumItems(items) {
  return items.reduce((acc, it) => acc + it.sign * it.minutes, 0);
}

export { formatTime };
