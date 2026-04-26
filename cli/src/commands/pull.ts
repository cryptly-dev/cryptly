import { confirm } from "@inquirer/prompts";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createAuthedClient } from "../api/client.js";
import { writeProjectLock } from "../config/project-link.js";
import { classifyAndRender } from "../util/diff.js";
import { sha256 } from "../util/hash.js";
import {
  decryptSecrets,
  loadProjectContext,
} from "../util/project-secrets.js";
import { c, dim, info, ok, warn } from "../util/style.js";

export interface PullOptions {
  yes?: boolean;
}

export async function pullCommand(options: PullOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const client = await createAuthedClient();
  const ctx = await loadProjectContext(client, cwd);

  const remotePlain = await decryptSecrets(ctx);
  const localPath = join(cwd, ctx.link.file);

  let localPlain: string | null = null;
  try {
    localPlain = await readFile(localPath, "utf8");
  } catch (e: any) {
    if (e?.code !== "ENOENT") throw e;
  }

  if (localPlain === null) {
    await writeFile(localPath, remotePlain);
    await writeProjectLock(cwd, {
      lastSyncedHash: sha256(ctx.project.encryptedSecrets),
      lastSyncedAt: new Date().toISOString(),
    });
    process.stderr.write(
      `${ok(`Pulled ${c.bold(ctx.project.name)}`, `→ ${ctx.link.file} (created)`)}\n`,
    );
    return;
  }

  const diff = classifyAndRender(localPlain, remotePlain);

  if (diff.kind === "identical") {
    process.stderr.write(`${info(`Up to date with ${c.bold(ctx.project.name)}.`)}\n`);
    await writeProjectLock(cwd, {
      lastSyncedHash: sha256(ctx.project.encryptedSecrets),
      lastSyncedAt: new Date().toISOString(),
    });
    return;
  }

  if (diff.kind === "destructive" && !options.yes) {
    process.stderr.write(
      `\n${warn(`Pull would change ${diff.removed} line${diff.removed === 1 ? "" : "s"} in ${ctx.link.file}`, `+${diff.added} −${diff.removed}`)}\n\n`,
    );
    process.stderr.write(diff.rendered + "\n\n");
    const proceed = await confirm({ message: "Apply these changes?", default: false });
    if (!proceed) {
      process.stderr.write(`${dim("Aborted.")}\n`);
      return;
    }
  } else if (diff.kind === "additive") {
    process.stderr.write(
      `${info(`Pulling ${c.bold(`+${diff.added}`)} new line${diff.added === 1 ? "" : "s"}.`)}\n`,
    );
  }

  await writeFile(localPath, remotePlain);
  await writeProjectLock(cwd, {
    lastSyncedHash: sha256(ctx.project.encryptedSecrets),
    lastSyncedAt: new Date().toISOString(),
  });
  process.stderr.write(`${ok(`Pulled ${c.bold(ctx.project.name)}`, `→ ${ctx.link.file}`)}\n`);
}
