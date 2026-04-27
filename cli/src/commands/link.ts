import { input, search } from "@inquirer/prompts";
import { createAuthedClient, type ApiClient } from "../api/client.js";
import {
  ExternalConnectionsApi,
  ProjectsApi,
  type Project,
} from "../api/projects.js";
import { readProjectLink, writeProjectLink } from "../config/project-link.js";
import { detectGithubRepo } from "../util/git.js";
import { c, info, ok } from "../util/style.js";

export interface LinkOptions {
  /** Override the local file path (defaults to `.env`). */
  file?: string;
  /** Skip the auto-suggestion and force the picker. */
  pick?: boolean;
}

export async function linkCommand(options: LinkOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const existing = await readProjectLink(cwd);
  if (existing) {
    process.stderr.write(
      `${info(`Already linked to project ${c.bold(existing.projectId)} (${c.dim(existing.file)}).`)}\n`,
    );
    process.stderr.write(`  Run with ${c.bold("--pick")} to re-link.\n`);
    if (!options.pick) return;
  }

  const client = await createAuthedClient();
  const project = await pickProject(client, cwd, options);

  const file = options.file ?? (await input({ message: "Local file:", default: ".env" }));

  await writeProjectLink(cwd, { projectId: project.id, file });
  process.stderr.write(`${ok(`Linked ${c.bold(project.name)}`, `→ ${file}`)}\n`);
}

async function pickProject(
  client: ApiClient,
  cwd: string,
  options: LinkOptions,
): Promise<Project> {
  const projects = await ProjectsApi.listMine(client);
  if (projects.length === 0) {
    throw new Error("You don't have any cryptly projects yet.");
  }

  const projectsById = new Map(projects.map((p) => [p.id, p]));

  // Auto-suggestion path: detect git remote, ask backend if any of our
  // projects link that repo, and pick automatically when there's exactly one
  // unambiguous match.
  if (!options.pick) {
    const repo = await detectGithubRepo(cwd);
    if (repo) {
      const matches = await ExternalConnectionsApi.findProjectsByRepo(
        client,
        repo.owner,
        repo.name,
      );
      const single = matches.find((m) => m.integrationCount === 1);
      if (single && projectsById.has(single.projectId)) {
        process.stderr.write(
          `${info(`Detected ${c.bold(`${repo.owner}/${repo.name}`)} → ${c.bold(single.projectName)}`)}\n`,
        );
        return projectsById.get(single.projectId)!;
      }
    }
  }

  const choices = projects.map((p) => ({
    name: `${p.name}  ${c.dim(`(${p.id})`)}`,
    value: p.id,
    description: p.id,
  }));

  const chosenId = await search<string>({
    message: "Pick a project:",
    source: async (term) => {
      if (!term) return choices;
      const t = term.toLowerCase();
      return choices.filter((c) => c.name.toLowerCase().includes(t));
    },
  });

  return projectsById.get(chosenId)!;
}
