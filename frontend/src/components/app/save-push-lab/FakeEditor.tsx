import { ACCENT } from "./types";

const LINES: Array<
  | { kind: "blank" }
  | { kind: "comment"; text: string }
  | { kind: "kv"; key: string; value: string }
> = [
  { kind: "comment", text: "# Production secrets — synced via Cryptly" },
  { kind: "blank" },
  { kind: "kv", key: "DATABASE_URL", value: '"postgres://app:••••@db.cryptly.dev:5432/prod"' },
  { kind: "kv", key: "REDIS_URL", value: '"redis://default:••••@cache:6379"' },
  { kind: "kv", key: "STRIPE_SECRET_KEY", value: '"sk_live_••••••••••••"' },
  { kind: "kv", key: "OPENAI_API_KEY", value: '"sk-proj-•••••••••••"' },
  { kind: "blank" },
  { kind: "comment", text: "# Internal" },
  { kind: "kv", key: "SESSION_SECRET", value: '"••••••••••••••••"' },
  { kind: "kv", key: "GITHUB_APP_PRIVATE_KEY", value: '"-----BEGIN PRIVATE KEY-----\\n••••"' },
];

export function FakeEditor({ height = 260 }: { height?: number }) {
  return (
    <div
      className="relative overflow-hidden font-mono text-[12.5px] leading-7 select-none"
      style={{ height, background: "#000" }}
    >
      <div className="absolute inset-0 px-6 py-4">
        {LINES.map((line, i) => (
          <div key={i} className="flex gap-4 text-neutral-300">
            <span className="w-5 shrink-0 text-right text-neutral-600 tabular-nums">
              {i + 1}
            </span>
            <span className="min-w-0 truncate">
              {line.kind === "blank" && <>&nbsp;</>}
              {line.kind === "comment" && (
                <span className="italic text-neutral-500">{line.text}</span>
              )}
              {line.kind === "kv" && (
                <>
                  <span style={{ color: ACCENT }}>{line.key}</span>
                  <span className="text-neutral-500">=</span>
                  <span className="text-neutral-300">{line.value}</span>
                </>
              )}
            </span>
          </div>
        ))}
      </div>
      {/* Bottom fade so the pill reads cleanly */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0))",
        }}
      />
    </div>
  );
}
