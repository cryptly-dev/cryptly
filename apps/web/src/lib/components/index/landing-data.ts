import type { Stats } from "$lib/api/stats.api";

export const ACCENT = "#DDA15E";
export const HERO_EASE = [0, 0.55, 0.45, 1] as const;
export const HERO_DURATION = 0.6;

export const HERO_ROWS = [
  { k: "DATABASE_URL", v: "postgres://app@db/main", dots: 22 },
  { k: "STRIPE_SECRET_KEY", v: "sk_live_aB7Kx9ZqL", dots: 16 },
  { k: "OPENAI_API_KEY", v: "sk-proj-9Tv3XmNp2R", dots: 18 },
  { k: "GITHUB_TOKEN", v: "ghp_8Kx7pLmZqJyQwRtU", dots: 20 },
  { k: "RESEND_API_KEY", v: "re_4nH2vKsp_PQrTaBc", dots: 19 },
];

export const VAULT_ROWS = [
  {
    id: "68d1...",
    project: "68cf...",
    blob: "u2l9aFZbk3Pj+Q7WkS9QfwDfMnLvSsC6XgY1xZ8pQrT+88k/4Lr2Nh==",
  },
  {
    id: "68d2...",
    project: "68cf...",
    blob: "fWn4pQ0R8sUvZ2Ah6YgKm9XcTdL4PrBv0WsEq1iNy+Oa7uKp3JxCh2==",
  },
  {
    id: "68d3...",
    project: "6a14...",
    blob: "cXpLm7nBd+TrKq9aEf1RtYz5OvHgWuJi2SkNc8MxPqDbZ0Af6ExBn4==",
  },
  {
    id: "68d4...",
    project: "6a14...",
    blob: "vQr3aZmHy8KfNb1XwLp5SgEdT7CuMi2OkRj0YxBh4VnPq+9SeAcJt6==",
  },
  {
    id: "68d5...",
    project: "68cf...",
    blob: "hKt2bNmXc4QrLp8YdWf3OvAi7ZsEu1RkPj9sVy0SgBnTq+5MxCoHa6==",
  },
  {
    id: "68d6...",
    project: "6a14...",
    blob: "t2bNmXc4QrLp8YdWf3OvwAi7ZsEu1RkPjqj9Vy0SgBnTq+5MxCoHa6==",
  },
];

export const GH_LIST = [
  "DATABASE_URL",
  "REDIS_URL",
  "JWT_SIGNING_KEY",
  "STRIPE_SECRET_KEY",
  "OPENAI_API_KEY",
  "SENTRY_DSN",
];

export const WIRE_PANEL_HEIGHT = 280;

export type Patch = {
  id: string;
  who: string;
  avatar: string;
  when: string;
  ageMin: number;
  add: number;
  del: number;
  msg: string;
};

export const PATCHES: Patch[] = [
  {
    id: "p1",
    who: "Alex Chen",
    avatar: "/avatars/alex-chen.svg",
    when: "2m",
    ageMin: 2,
    add: 1,
    del: 1,
    msg: "rotate STRIPE_SECRET_KEY",
  },
  {
    id: "p2",
    who: "Marcus Rodriguez",
    avatar: "/avatars/marcus-rodriguez.svg",
    when: "14m",
    ageMin: 14,
    add: 2,
    del: 0,
    msg: "add observability keys",
  },
  {
    id: "p3",
    who: "Priya Patel",
    avatar: "/avatars/priya-patel.svg",
    when: "1h",
    ageMin: 60,
    add: 1,
    del: 1,
    msg: "migrate DATABASE_URL",
  },
  {
    id: "p4",
    who: "Nina Gupta",
    avatar: "/avatars/nina-gupta.svg",
    when: "2d",
    ageMin: 60 * 24 * 2,
    add: 3,
    del: 0,
    msg: "Q2 feature flags",
  },
  {
    id: "p5",
    who: "Alex Chen",
    avatar: "/avatars/alex-chen.svg",
    when: "4d",
    ageMin: 60 * 24 * 4,
    add: 1,
    del: 0,
    msg: "cloudflare api token",
  },
  {
    id: "p6",
    who: "Marcus Rodriguez",
    avatar: "/avatars/marcus-rodriguez.svg",
    when: "12d",
    ageMin: 60 * 24 * 12,
    add: 0,
    del: 2,
    msg: "drop deprecated keys",
  },
];

export const TIME_CHIPS: {
  key: string;
  label: string;
  maxAge: number | null;
}[] = [
  { key: "all", label: "All time", maxAge: null },
  { key: "30", label: "30d", maxAge: 60 * 24 * 30 },
  { key: "7", label: "7d", maxAge: 60 * 24 * 7 },
  { key: "24", label: "24h", maxAge: 60 * 24 },
];

export const COMPANIES = ["BlueMenu", "SignOSH", "JobRef", "logdash"];

export const TESTIMONIALS = [
  {
    quote:
      "Signosh ships on a tight calendar. Cryptly quietly removed one of our least-favorite weekly rituals — the Slack-DM secret handoff.",
    name: "Jerzy Wiśniewski",
    role: "Co-founder, SignOSH",
    initials: "JW",
  },
  {
    quote:
      "We wanted end-to-end encryption without reading a whitepaper first. This was it. Onboarding a new engineer is a single link now.",
    name: "Dominik Mackiewicz",
    role: "Co-founder, BlueMenu",
    initials: "DM",
  },
];

export type StatsState =
  | { status: "loading" }
  | { status: "ready"; data: Stats }
  | { status: "error" };

export const STATS_REFRESH_INTERVAL_MS = 5_000;

export const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

export const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

export function formatStat(value: number): string {
  return value.toLocaleString("en-US");
}

export function formatOrdinal(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const mod100 = n % 100;
  const mod10 = n % 10;
  const suffix =
    mod100 >= 11 && mod100 <= 13 ? "th" : (suffixes[mod10] ?? "th");
  return `${n.toLocaleString("en-US")}${suffix}`;
}

export function numberToWords(n: number): string {
  if (n < 0 || n > 99 || !Number.isInteger(n)) {
    return n.toLocaleString("en-US");
  }
  if (n < 20) return ONES[n]!;
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0 ? TENS[tens]! : `${TENS[tens]}-${ONES[ones]}`;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function trustHeadline(users: number): string {
  if (users === 1) return "One person trusts us with their keys.";
  return `${capitalize(numberToWords(users))} people trust us with their keys.`;
}
