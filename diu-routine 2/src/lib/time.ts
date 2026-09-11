const TIME_RE =
  /(\d{1,2})\s*[:.]?\s*(\d{2})?\s*(a\.?m\.?|p\.?m\.?)?/i;

/** "8:30 AM" -> 510. Returns null when the text holds no clock time. */
export function parseClock(raw: string, assumeAfternoon = false): number | null {
  const m = TIME_RE.exec(raw.trim());
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = Number(m[2] ?? 0);
  if (hour > 23 || minute > 59) return null;
  const meridiem = m[3]?.toLowerCase().replace(/\./g, "");
  if (meridiem === "pm" && hour < 12) hour += 12;
  else if (meridiem === "am" && hour === 12) hour = 0;
  else if (!meridiem) {
    // University routines run 08:00-18:00, so a bare 1-6 means afternoon.
    if (hour >= 1 && hour <= 6) hour += 12;
    else if (assumeAfternoon && hour < 8) hour += 12;
  }
  return hour * 60 + minute;
}

/**
 * Splits a slot label into start/end minutes. Handles "8:30-10:00",
 * "08:30 AM - 10:00 AM", "1.00 PM to 2.30 PM" and Excel time serials.
 */
export function parseSlot(raw: string): { startMin: number; endMin: number } | null {
  const text = String(raw)
    .replace(/\u2013|\u2014|\u2212/g, "-")
    .replace(/\bto\b/gi, "-")
    .trim();
  const parts = text.split("-").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  const endMin = parseClock(parts[1]);
  if (endMin === null) return null;
  // "8:30 - 10:00 AM" leaves the start meridiem implicit; infer it from the end.
  const startMin = parseClock(parts[0], endMin >= 12 * 60);
  if (startMin === null) return null;

  return { startMin, endMin: endMin <= startMin ? endMin + 12 * 60 : endMin };
}

export function formatMin(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
}

export function formatSlot(startMin: number, endMin: number): string {
  return `${formatMin(startMin)} - ${formatMin(endMin)}`;
}

export function durationLabel(startMin: number, endMin: number): string {
  const mins = endMin - startMin;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return [h ? `${h}h` : "", m ? `${m}m` : ""].filter(Boolean).join(" ") || "0m";
}
