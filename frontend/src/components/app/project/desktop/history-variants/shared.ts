import type { Patch } from "@/lib/logics/projectLogic";

export interface PatchStats {
  additions: number;
  deletions: number;
}

export function getPatchStats(content: string): PatchStats {
  let additions = 0;
  let deletions = 0;
  for (const line of content.split("\n")) {
    if (line.startsWith("+")) additions++;
    else if (line.startsWith("-")) deletions++;
  }
  return { additions, deletions };
}

export interface AuthorStats {
  id: string;
  displayName: string;
  avatarUrl: string;
  count: number;
  additions: number;
  deletions: number;
  lastEditAt: string;
}

export function getAuthorStats(patches: Patch[]): AuthorStats[] {
  const map = new Map<string, AuthorStats>();
  for (const patch of patches) {
    const stats = getPatchStats(patch.content);
    const existing = map.get(patch.author.id);
    if (existing) {
      existing.count++;
      existing.additions += stats.additions;
      existing.deletions += stats.deletions;
      if (new Date(patch.createdAt) > new Date(existing.lastEditAt)) {
        existing.lastEditAt = patch.createdAt;
      }
    } else {
      map.set(patch.author.id, {
        id: patch.author.id,
        displayName: patch.author.displayName,
        avatarUrl: patch.author.avatarUrl,
        count: 1,
        additions: stats.additions,
        deletions: stats.deletions,
        lastEditAt: patch.createdAt,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTimeOnly(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDayKey(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function dateToISODayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isoDayKeyFromString(dateString: string): string {
  return dateToISODayKey(new Date(dateString));
}

export function formatIsoDayLabel(isoKey: string): string {
  const [y, m, d] = isoKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getRelativeGroup(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  const startOfMonth = new Date(startOfToday);
  startOfMonth.setDate(startOfMonth.getDate() - 30);

  if (date >= startOfToday) return "Today";
  if (date >= startOfYesterday) return "Yesterday";
  if (date >= startOfWeek) return "This week";
  if (date >= startOfMonth) return "This month";
  return "Older";
}

export const GROUP_ORDER = [
  "Today",
  "Yesterday",
  "This week",
  "This month",
  "Older",
];

export const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/a/ACg8ocLTdCSYO1ZsGrEcdHjKzsoi-ZM1fFd8TqoezaiIQXAe3AUwcQ=s96-c";

export interface TimeRangeOption {
  key: string;
  label: string;
  days: number | null;
}

export const TIME_RANGES: TimeRangeOption[] = [
  { key: "all", label: "All", days: null },
  { key: "today", label: "-24h", days: 1 },
  { key: "week", label: "-7d", days: 7 },
  { key: "month", label: "-30d", days: 30 },
];

export function filterByTimeRange(patches: Patch[], days: number | null) {
  if (days === null) return patches;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return patches.filter((p) => new Date(p.createdAt).getTime() >= cutoff);
}

export function buildDailyBuckets(patches: Patch[], days: number) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const buckets: { date: Date; label: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    buckets.push({
      date: d,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: 0,
    });
  }
  for (const patch of patches) {
    const patchDate = new Date(patch.createdAt);
    patchDate.setHours(0, 0, 0, 0);
    const bucket = buckets.find(
      (b) => b.date.getTime() === patchDate.getTime()
    );
    if (bucket) bucket.count++;
  }
  return buckets;
}

export function buildHourlyHeatmap(patches: Patch[]) {
  // 7 days x 24 hours grid
  const grid: number[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => 0)
  );
  for (const patch of patches) {
    const d = new Date(patch.createdAt);
    grid[d.getDay()][d.getHours()]++;
  }
  return grid;
}
