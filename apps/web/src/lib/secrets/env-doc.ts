/**
 * The secrets document is plain `.env` text: the single source of truth that gets encrypted
 * and saved. The table view reads groups and secrets from it and edits it with line surgery:
 * each operation replaces exactly the lines it touches, so everything else round-trips byte
 * for byte (line endings included).
 *
 * Groups: blank lines split them; a `#` comment as a group's first line names it.
 */

const SECRET_LINE = /^\s*(export\s+)?([A-Za-z_][A-Za-z0-9_.-]*)\s*=(.*)$/;
export const KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_.-]*$/;

export type Quote = '"' | "'" | "";

export interface EnvSecret {
  /** Key plus occurrence ("API_KEY", then "API_KEY#2"), stable while other lines change. */
  id: string;
  key: string;
  /** Decoded value: quotes stripped, escapes in double quotes resolved. */
  value: string;
  quote: Quote;
  exported: boolean;
  /** First and last line index (inclusive); multiline quoted values span several lines. */
  start: number;
  end: number;
  /** Where the value starts in the first line (right after `=`). */
  valueCol: number;
  /** The value exactly as written (quotes and escapes included), lines joined with `\n`. */
  raw: string;
  /** What follows the value on its last line, e.g. ` # default`. */
  tail: string;
}

export interface EnvGroup {
  index: number;
  /** From the group's leading `#` comment; null when it has none ("Untitled"). */
  name: string | null;
  /** Line index of that comment. */
  header: number | null;
  start: number;
  end: number;
  secrets: EnvSecret[];
}

export interface EnvDoc {
  lines: string[];
  eol: string;
  groups: EnvGroup[];
  secrets: EnvSecret[];
}

export function parseEnv(text: string): EnvDoc {
  const lines = text.split(/\r?\n/);
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const groups: EnvGroup[] = [];
  const secrets: EnvSecret[] = [];
  const seen = new Map<string, number>();
  let group: EnvGroup | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") {
      group = null;
      continue;
    }
    if (!group) {
      group = {
        index: groups.length,
        name: null,
        header: null,
        start: i,
        end: i,
        secrets: [],
      };
      groups.push(group);
    }
    group.end = i;

    if (line.trimStart().startsWith("#")) {
      // A commented-out secret (`# OLD_KEY=...`) is a note, never a group name: its value
      // would show in plain text as the title.
      const body = line.replace(/^\s*#\s*/, "");
      if (group.start === i && !SECRET_LINE.test(body)) {
        group.header = i;
        group.name = groupName(line);
      }
      continue;
    }

    const match = SECRET_LINE.exec(line);
    if (!match) continue;
    const [, exported, key, rest] = match;
    const read = readValue(lines, i, rest);
    const n = (seen.get(key) ?? 0) + 1;
    seen.set(key, n);
    const secret: EnvSecret = {
      id: n === 1 ? key : `${key}#${n}`,
      key,
      exported: Boolean(exported),
      start: i,
      valueCol: line.length - rest.length,
      ...read,
    };
    const end = read.end;
    group.secrets.push(secret);
    secrets.push(secret);
    group.end = end;
    i = end;
  }

  return { lines, eol, groups, secrets };
}

/** `# --- Payments ---` → "Payments"; null when nothing is left. */
function groupName(line: string): string | null {
  const name = line.replace(/^\s*#[\s#=-]*/, "").replace(/[\s#=-]*$/, "");
  return name || null;
}

/**
 * Same rules as dotenv. The GitHub push (`monaco/parser.ts`) and the .env view masking use it too:
 * a quoted value runs to its first closing quote, across lines if needed, and that quote must
 * end its line (a `# comment` may follow). Otherwise the quote is just a character of a
 * one-line unquoted value, so an unclosed quote never swallows the lines below it.
 */
function readValue(
  lines: string[],
  start: number,
  rest: string,
): Pick<EnvSecret, "value" | "quote" | "end" | "raw" | "tail"> {
  const q = rest[0];
  if (q === '"' || q === "'") {
    let text = rest;
    let end = start;
    let pos = 1;
    for (;;) {
      for (; pos < text.length; pos++) {
        if (q === '"' && text[pos] === "\\") {
          pos++;
          continue;
        }
        if (text[pos] === q) {
          if (!/^\s*(#.*)?$/.test(text.slice(pos + 1))) break;
          const body = text.slice(1, pos);
          return {
            value: q === '"' ? unescape(body) : body,
            quote: q,
            end,
            raw: text.slice(0, pos + 1),
            tail: text.slice(pos + 1),
          };
        }
      }
      if (pos < text.length || end + 1 >= lines.length) break;
      end++;
      text += "\n" + lines[end];
    }
  }
  const tail = /\s+#.*$/.exec(rest)?.[0] ?? "";
  const raw = rest.slice(0, rest.length - tail.length);
  return { value: raw.trim(), quote: "", end: start, raw, tail };
}

function unescape(body: string): string {
  return body.replace(/\\([\\"nr])/g, (_, c: string) =>
    c === "n" ? "\n" : c === "r" ? "\r" : c,
  );
}

/**
 * Writes a value the way dotenv reads it back, never adding backslash escapes (other tools
 * would keep them): unquoted when nothing needs quoting, else `prefer` when it can hold the
 * value, else single quotes, else double quotes.
 */
export function formatValue(value: string, prefer: Quote = ""): string {
  const single = !value.includes("'");
  // Inside double quotes \n \r \" \\ are escapes for us and the GitHub push.
  const double = !value.includes('"') && !/\\[nr"\\]/.test(value);
  if (prefer === "" && !/[\s#"'`]/.test(value)) return value;
  if (prefer === '"' && double) return `"${value}"`;
  if (single) return `'${value}'`;
  if (double) return `"${value}"`;
  // Both quote characters inside: the one case that needs escaping.
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function secretLine(key: string, value: string) {
  return `${key}=${formatValue(value)}`;
}

function splice(
  doc: EnvDoc,
  start: number,
  remove: number,
  insert: string[] = [],
): string {
  const lines = doc.lines.slice();
  lines.splice(start, remove, ...insert.flatMap((l) => l.split("\n")));
  return lines.join(doc.eol);
}

/** Adds a blank line and `block` after the last non-blank line: a new group at the end. */
function appendBlock(doc: EnvDoc, block: string[]): string {
  let last = doc.lines.length - 1;
  while (last >= 0 && doc.lines[last].trim() === "") last--;
  if (last < 0) return block.join(doc.eol);
  return splice(doc, last + 1, 0, ["", ...block]);
}

/**
 * Changes one secret in place: a rename replaces only the key, a new value keeps the quote
 * style when it can, and `export`, spacing and a trailing `# comment` always stay.
 */
export function setSecret(
  text: string,
  id: string,
  key: string,
  value: string,
): string {
  const doc = parseEnv(text);
  const s = doc.secrets.find((x) => x.id === id);
  if (!s || (s.key === key && s.value === value)) return text;
  const prefix = doc.lines[s.start]
    .slice(0, s.valueCol)
    .replace(
      /^(\s*(?:export\s+)?)[A-Za-z_][A-Za-z0-9_.-]*/,
      (_, lead) => lead + key,
    );
  const lead = s.quote ? "" : (/^\s*/.exec(s.raw)?.[0] ?? "");
  const raw = value === s.value ? s.raw : lead + formatValue(value, s.quote);
  return splice(doc, s.start, s.end - s.start + 1, [prefix + raw + s.tail]);
}

/** Appends a secret to group `index`, or starts a new group at the end if there is none. */
export function addSecret(
  text: string,
  index: number,
  key: string,
  value: string,
): string {
  const doc = parseEnv(text);
  const g = doc.groups[index];
  const line = secretLine(key, value);
  return g ? splice(doc, g.end + 1, 0, [line]) : appendBlock(doc, [line]);
}

export function removeSecrets(text: string, ids: Iterable<string>): string {
  const doc = parseEnv(text);
  const remove = new Set(ids);
  const lines = doc.lines.slice();
  for (const s of doc.secrets.filter((x) => remove.has(x.id)).reverse())
    lines.splice(s.start, s.end - s.start + 1);
  return lines.join(doc.eol);
}

export function addGroup(text: string, name: string): string {
  return appendBlock(parseEnv(text), [`# ${name}`]);
}

/** Rewrites the group's naming comment (keeping its dashes), or adds one. */
export function renameGroup(text: string, index: number, name: string): string {
  const doc = parseEnv(text);
  const g = doc.groups[index];
  if (!g || g.name === name) return text;
  if (g.header === null) return splice(doc, g.start, 0, [`# ${name}`]);
  const m = /^(\s*#[\s#=-]*)(.*?)([\s#=-]*)$/.exec(doc.lines[g.header]);
  const line = m?.[2] ? m[1] + name + m[3] : `# ${name}`;
  return splice(doc, g.header, 1, [line]);
}

/** Removes a whole group block plus one neighbouring blank line. */
export function removeGroup(text: string, index: number): string {
  const doc = parseEnv(text);
  const g = doc.groups[index];
  if (!g) return text;
  let { start, end } = g;
  if (start > 0 && doc.lines[start - 1].trim() === "") start--;
  else if (end + 1 < doc.lines.length && doc.lines[end + 1].trim() === "")
    end++;
  return splice(doc, start, end - start + 1);
}

export type Anchor =
  | { kind: "after" | "before"; id: string }
  | { kind: "top"; group: number };

/**
 * Where a secret from `base` (the saved version) belongs in `doc`: after its nearest earlier
 * neighbour that still exists, before its nearest later one, or at the top of its group
 * (matched by name). Places crossed-out deleted rows and restores them.
 */
export function anchorOf(
  doc: EnvDoc,
  base: EnvDoc,
  secret: EnvSecret,
): Anchor | null {
  const group = base.groups.find((g) => g.secrets.includes(secret));
  if (!group) return null;
  // Stay in the group of the same name when there is one.
  const named = group.name
    ? doc.groups.find((g) => g.name === group.name)
    : undefined;
  const ids = new Set((named ?? doc).secrets.map((s) => s.id));
  const at = group.secrets.indexOf(secret);
  for (let i = at - 1; i >= 0; i--)
    if (ids.has(group.secrets[i].id))
      return { kind: "after", id: group.secrets[i].id };
  for (let i = at + 1; i < group.secrets.length; i++)
    if (ids.has(group.secrets[i].id))
      return { kind: "before", id: group.secrets[i].id };
  return named ? { kind: "top", group: named.index } : null;
}

/** Puts a secret deleted since `baseline` back where it was, with its original lines. */
export function restoreSecret(
  text: string,
  baseline: string,
  id: string,
): string {
  const doc = parseEnv(text);
  const base = parseEnv(baseline);
  const s = base.secrets.find((x) => x.id === id);
  if (!s || doc.secrets.some((x) => x.id === id)) return text;
  const lines = base.lines.slice(s.start, s.end + 1);
  const anchor = anchorOf(doc, base, s);
  if (!anchor) return appendBlock(doc, lines);
  if (anchor.kind === "top") {
    const g = doc.groups[anchor.group];
    return splice(doc, g.header === null ? g.start : g.header + 1, 0, lines);
  }
  const ref = doc.secrets.find((x) => x.id === anchor.id)!;
  return splice(
    doc,
    anchor.kind === "after" ? ref.end + 1 : ref.start,
    0,
    lines,
  );
}

/**
 * Merges pasted `.env` text: existing keys are updated in place, new ones are appended to
 * `target`. When the paste has named groups, new keys go to the group with the same name
 * (created at the end if missing), so pasting a whole file keeps its structure.
 */
export function pasteEnv(
  text: string,
  pasted: string,
  target: number,
): { text: string; updated: number; added: number } {
  const src = parseEnv(pasted);
  let out = text;
  let updated = 0;
  let added = 0;
  for (const pg of src.groups) {
    let dest: number | null = pg.name ? null : target;
    for (const s of pg.secrets) {
      // The last copy of a duplicated key is the one dotenv uses: update that one.
      const existing = parseEnv(out).secrets.findLast((x) => x.key === s.key);
      if (existing) {
        if (existing.value === s.value) continue;
        out = setSecret(out, existing.id, existing.key, s.value);
        updated++;
        continue;
      }
      if (dest === null) {
        const doc = parseEnv(out);
        const named = doc.groups.find((g) => g.name === pg.name);
        if (!named) out = appendBlock(doc, [src.lines[pg.header!]]);
        dest = named ? named.index : parseEnv(out).groups.length - 1;
      }
      // New secrets keep the pasted lines exactly as typed.
      const lines = src.lines.slice(s.start, s.end + 1);
      const doc = parseEnv(out);
      const g = doc.groups[dest];
      out = g ? splice(doc, g.end + 1, 0, lines) : appendBlock(doc, lines);
      if (!g) dest = parseEnv(out).groups.length - 1;
      added++;
    }
  }
  return { text: out, updated, added };
}

/** The exact lines of the given secrets, as `.env` text for the clipboard. */
export function secretsText(doc: EnvDoc, ids: Iterable<string>): string {
  const want = new Set(ids);
  return doc.secrets
    .filter((s) => want.has(s.id))
    .map((s) => doc.lines.slice(s.start, s.end + 1).join("\n"))
    .join("\n");
}

export function groupText(doc: EnvDoc, index: number): string {
  const g = doc.groups[index];
  return g ? doc.lines.slice(g.start, g.end + 1).join("\n") : "";
}

/**
 * Up to 4 characters at each end, so `sk_live…` and `sk_test…` tell apart, and a fixed-width
 * mask that never reveals the length. Values under 8 characters stay fully masked.
 */
export function peek(value: string): { head: string; tail: string } | null {
  const n = Math.min(4, Math.floor(value.length / 8));
  if (!n) return null;
  return {
    head: oneLine(value.slice(0, n)),
    tail: oneLine(value.slice(-n)),
  };
}

export function oneLine(value: string): string {
  return value.replace(/\r?\n/g, "↵");
}
