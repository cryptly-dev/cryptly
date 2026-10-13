/** Local calendar day, `YYYY-MM-DD`. */
export function dayKey(value: string | Date): string {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fromKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

/** "Oct 8", with the year when it isn't this year. */
export function shortDay(key: string): string {
  const date = fromKey(key);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

/** "Today", "Yesterday", else `shortDay`. */
export function dayLabel(key: string, now: number): string {
  if (key === dayKey(new Date(now))) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return key === dayKey(yesterday) ? "Yesterday" : shortDay(key);
}

/** "now", "12m", "2h" today; "18:42" before. */
export function shortTime(value: string, now: number): string {
  if (dayKey(value) !== dayKey(new Date(now))) return clock(value);
  const minutes = Math.floor((now - Date.parse(value)) / 60_000);
  if (minutes < 1) return "now";
  return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h`;
}

/** "Oct 12, 2026 · 11:01". */
export function fullDate(value: string): string {
  const date = new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${date} · ${clock(value)}`;
}

function clock(value: string) {
  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
