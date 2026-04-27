import { diffLines } from "diff";
import pc from "picocolors";

export type DiffKind = "identical" | "additive" | "destructive";

export interface DiffOutcome {
  kind: DiffKind;
  rendered: string;
  added: number;
  removed: number;
}

/**
 * Compares `from` → `to` line-by-line. The classification is intentionally
 * conservative: any removed line (or any line in the from that no longer
 * appears in the to) flips us to "destructive". A change to a line counts as
 * one removal + one addition, so it's destructive too — which is what we want
 * for secrets.
 */
export function classifyAndRender(from: string, to: string): DiffOutcome {
  const fromN = normalize(from);
  const toN = normalize(to);
  if (fromN === toN) {
    return { kind: "identical", rendered: "", added: 0, removed: 0 };
  }

  const parts = diffLines(fromN, toN);
  let added = 0;
  let removed = 0;
  const lines: string[] = [];

  for (const part of parts) {
    const partLines = part.value.replace(/\n$/, "").split("\n");
    if (part.added) {
      added += partLines.length;
      for (const line of partLines) lines.push(pc.green(`+ ${line}`));
    } else if (part.removed) {
      removed += partLines.length;
      for (const line of partLines) lines.push(pc.red(`- ${line}`));
    } else {
      // Context — show first/last to anchor, fold the rest.
      if (partLines.length <= 3) {
        for (const line of partLines) lines.push(pc.gray(`  ${line}`));
      } else {
        lines.push(pc.gray(`  ${partLines[0]}`));
        lines.push(pc.gray(`  ${pc.dim(`… ${partLines.length - 2} unchanged lines`)}`));
        lines.push(pc.gray(`  ${partLines[partLines.length - 1]}`));
      }
    }
  }

  return {
    kind: removed > 0 ? "destructive" : "additive",
    rendered: lines.join("\n"),
    added,
    removed,
  };
}

function normalize(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}
