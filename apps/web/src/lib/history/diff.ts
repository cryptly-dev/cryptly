import { diffArrays } from "diff";
import type { ProjectRevealOn } from "$lib/auth/domain/project-settings";
import { oneLine, parseEnv as parseEnvDoc, peek } from "$lib/secrets/env-doc";

/** One secret of a decrypted .env document, with the group it sits in on the Secrets page. */
export interface EnvSecret {
  key: string;
  value: string;
  group: string;
  /** Index of the group block, so two "Untitled" groups stay apart. */
  block: number;
}

export interface SecretChange {
  kind: "added" | "changed" | "removed";
  key: string;
  before?: string;
  after?: string;
}

export interface SecretDiff {
  /** Changed secrets grouped like the Secrets page, in the newer document's group order. */
  groups: { name: string; changes: SecretChange[] }[];
  added: number;
  changed: number;
  removed: number;
  unchanged: number;
  unchangedGroups: number;
}

/** Secrets with their groups, parsed exactly like the Secrets page (`env-doc.ts`). */
export function parseEnv(text: string): EnvSecret[] {
  return parseEnvDoc(text).groups.flatMap((g) =>
    g.secrets.map((s) => ({
      key: s.key,
      value: s.value,
      group: g.name ?? "Untitled",
      block: g.index,
    })),
  );
}

/**
 * Per-secret diff by key. Moving a secret to another group or reordering it is not a change;
 * a key defined twice counts with its last value, like dotenv.
 */
export function diffSecrets(
  before: EnvSecret[],
  after: EnvSecret[],
): SecretDiff {
  const old = new Map(before.map((s) => [s.key, s]));
  const now = new Map(after.map((s) => [s.key, s]));
  const order = new Map<string, number>();
  for (const s of [...now.values(), ...old.values()])
    if (!order.has(s.group)) order.set(s.group, order.size);

  const byGroup = new Map<string, SecretChange[]>();
  const push = (group: string, change: SecretChange) =>
    byGroup.set(group, [...(byGroup.get(group) ?? []), change]);
  let added = 0;
  let changed = 0;
  let removed = 0;
  let unchanged = 0;
  const unchangedBlocks = new Set<number>();

  for (const s of now.values()) {
    const prev = old.get(s.key);
    if (!prev) {
      added++;
      push(s.group, { kind: "added", key: s.key, after: s.value });
    } else if (prev.value !== s.value) {
      changed++;
      push(s.group, {
        kind: "changed",
        key: s.key,
        before: prev.value,
        after: s.value,
      });
    } else {
      unchanged++;
      unchangedBlocks.add(s.block);
    }
  }
  for (const s of old.values()) {
    if (now.has(s.key)) continue;
    removed++;
    push(s.group, { kind: "removed", key: s.key, before: s.value });
  }

  const groups = [...byGroup]
    .map(([name, changes]) => ({ name, changes }))
    .sort((a, b) => order.get(a.name)! - order.get(b.name)!);
  return {
    groups,
    added,
    changed,
    removed,
    unchanged,
    unchangedGroups: unchangedBlocks.size,
  };
}

/**
 * A value as the project's Values setting shows it, as [head, mask, tail]: Peek keeps up to 4
 * characters at each end around a fixed mask, Hidden is a fixed mask, Visible is the value.
 * Never reveals the length unless the value is Visible.
 */
export function shownValue(
  value: string,
  revealOn: ProjectRevealOn,
): [string, string, string] {
  if (revealOn === "always") return [oneLine(value), "", ""];
  const p = revealOn === "hover" ? peek(value) : null;
  return p ? [p.head, "••••••", p.tail] : ["", "••••••••", ""];
}

/** One line of the document; a secret, multiline or not, is one line showing its value as set. */
interface DiffLine {
  /** Exact source text, what the diff compares. */
  real: string;
  shown: string;
}

function diffLines(text: string, revealOn: ProjectRevealOn): DiffLine[] {
  const doc = parseEnvDoc(text);
  const secretAt = new Map(doc.secrets.map((s) => [s.start, s]));
  const out: DiffLine[] = [];
  for (let i = 0; i < doc.lines.length; i++) {
    const line = doc.lines[i]!;
    const s = secretAt.get(i);
    if (!s) {
      out.push({ real: line, shown: line });
      continue;
    }
    const real = doc.lines.slice(s.start, s.end + 1).join("\n");
    out.push({
      real,
      shown:
        revealOn === "always"
          ? real
          : line.slice(0, line.indexOf("=") + 1) +
            shownValue(s.value, revealOn).join(""),
    });
    i = s.end;
  }
  return out;
}

/**
 * Line diff for the ".env diff" view, `+`/`-`/` ` prefixed with 4 lines of context and "⋯" for
 * the gaps. Lines are compared by their real text but show values per the Values setting, so a
 * masked line never depends on the value's length and a change hidden by the mask still shows.
 */
export function envDiff(
  before: string | null,
  after: string,
  revealOn: ProjectRevealOn,
): string {
  const next = diffLines(after, revealOn);
  const rows =
    before === null
      ? next.map((l) => ({ mark: "+", text: l.shown }))
      : diffArrays(diffLines(before, revealOn), next, {
          comparator: (a, b) => a.real === b.real,
        }).flatMap((c) =>
          c.value.map((l) => ({
            mark: c.added ? "+" : c.removed ? "-" : " ",
            text: l.shown,
          })),
        );
  const changed = rows.map((r) => r.mark !== " ");
  const out: string[] = [];
  let gap = false;
  rows.forEach((row, i) => {
    if (!changed.slice(Math.max(0, i - 4), i + 5).some(Boolean)) {
      gap = out.length > 0;
      return;
    }
    if (gap) out.push(" ⋯");
    gap = false;
    for (const line of row.text.split("\n")) out.push(row.mark + line);
  });
  return out.join("\n");
}
