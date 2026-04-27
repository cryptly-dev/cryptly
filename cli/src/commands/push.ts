import { confirm } from "@inquirer/prompts";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ProjectsApi } from "../api/projects.js";
import { createAuthedClient } from "../api/client.js";
import {
  readProjectSyncState,
  writeProjectSyncState,
} from "../config/project-link.js";
import { classifyAndRender } from "../util/diff.js";
import { sha256 } from "../util/hash.js";
import {
  decryptSecrets,
  encryptSecrets,
  loadProjectContext,
} from "../util/project-secrets.js";
import { c, dim, info, ok, warn } from "../util/style.js";

export interface PushOptions {
  yes?: boolean;
}

export async function pushCommand(options: PushOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const client = await createAuthedClient();
  const ctx = await loadProjectContext(client, cwd);

  const localPath = join(cwd, ctx.link.file);
  let localPlain: string;
  try {
    localPlain = await readFile(localPath, "utf8");
  } catch (e: any) {
    if (e?.code === "ENOENT") {
      throw new Error(`Local file ${ctx.link.file} doesn't exist. Run \`cryptly pull\` first.`);
    }
    throw e;
  }

  const remotePlain = await decryptSecrets(ctx);
  const sync = await readProjectSyncState(ctx.link.projectId);
  const remoteHash = sha256(ctx.project.encryptedSecrets);

  if (sync && sync.lastSyncedHash !== remoteHash && !options.yes) {
    process.stderr.write(
      `\n${warn("Remote has changed since your last sync.", "Someone else has pushed in the meantime.")}\n`,
    );
    process.stderr.write(`  Run ${c.bold("cryptly pull")} first to merge their changes.\n`);
    const proceed = await confirm({
      message: "Push anyway and overwrite their changes?",
      default: false,
    });
    if (!proceed) {
      process.stderr.write(`${dim("Aborted.")}\n`);
      return;
    }
  }

  const diff = classifyAndRender(remotePlain, localPlain);

  if (diff.kind === "identical") {
    process.stderr.write(`${info(`Nothing to push — ${c.bold(ctx.project.name)} is up to date.`)}\n`);
    await writeProjectSyncState(ctx.link.projectId, {
      lastSyncedHash: remoteHash,
      lastSyncedAt: new Date().toISOString(),
    });
    return;
  }

  if (diff.kind === "destructive" && !options.yes) {
    process.stderr.write(
      `\n${warn(`Push will change ${diff.removed} line${diff.removed === 1 ? "" : "s"} on ${ctx.project.name}`, `+${diff.added} −${diff.removed}`)}\n\n`,
    );
    process.stderr.write(diff.rendered + "\n\n");
    const proceed = await confirm({ message: "Push these changes?", default: false });
    if (!proceed) {
      process.stderr.write(`${dim("Aborted.")}\n`);
      return;
    }
  } else if (diff.kind === "additive") {
    process.stderr.write(
      `${info(`Pushing ${c.bold(`+${diff.added}`)} new line${diff.added === 1 ? "" : "s"}.`)}\n`,
    );
  }

  const newCiphertext = await encryptSecrets(ctx, localPlain);
  await ProjectsApi.updateContent(client, ctx.link.projectId, newCiphertext);
  await writeProjectSyncState(ctx.link.projectId, {
    lastSyncedHash: sha256(newCiphertext),
    lastSyncedAt: new Date().toISOString(),
  });
  process.stderr.write(`${ok(`Pushed to ${c.bold(ctx.project.name)}`, `+${diff.added} −${diff.removed}`)}\n`);
}
