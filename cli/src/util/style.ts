import pc from "picocolors";

export const c = pc;

export function dim(s: string): string {
  return pc.gray(s);
}

export function ok(label: string, msg: string = ""): string {
  return `${pc.green("✔")} ${pc.bold(label)}${msg ? "  " + dim(msg) : ""}`;
}

export function warn(label: string, msg: string = ""): string {
  return `${pc.yellow("!")} ${pc.bold(label)}${msg ? "  " + dim(msg) : ""}`;
}

export function err(label: string, msg: string = ""): string {
  return `${pc.red("✖")} ${pc.bold(label)}${msg ? "  " + dim(msg) : ""}`;
}

export function info(msg: string): string {
  return `${pc.cyan("›")} ${msg}`;
}

/** Print a tiny rule line under a header. */
export function rule(width = 40): string {
  return dim("─".repeat(width));
}

/** Renders a vertical key/value table. */
export function kv(rows: Array<[string, string]>): string {
  const labelWidth = Math.max(...rows.map(([k]) => k.length));
  return rows
    .map(([k, v]) => `  ${dim(k.padEnd(labelWidth))}  ${v}`)
    .join("\n");
}
