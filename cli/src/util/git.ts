import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

export interface GitRepo {
  owner: string;
  name: string;
}

/**
 * Returns the GitHub-style `owner/name` of the `origin` remote, or `null` if
 * we're not in a git repo or the remote isn't a GitHub URL we recognise.
 */
export async function detectGithubRepo(cwd: string): Promise<GitRepo | null> {
  let url: string;
  try {
    const { stdout } = await exec("git", ["remote", "get-url", "origin"], { cwd });
    url = stdout.trim();
  } catch {
    return null;
  }
  return parseGithubRemote(url);
}

export function parseGithubRemote(remote: string): GitRepo | null {
  // Handles:
  //   git@github.com:owner/name.git
  //   https://github.com/owner/name.git
  //   https://github.com/owner/name
  //   ssh://git@github.com/owner/name.git
  const cleaned = remote.replace(/\.git$/, "");
  const sshMatch = cleaned.match(/^(?:ssh:\/\/)?git@github\.com[:/]([^/]+)\/([^/]+)$/);
  if (sshMatch) return { owner: sshMatch[1]!, name: sshMatch[2]! };
  const httpsMatch = cleaned.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)$/);
  if (httpsMatch) return { owner: httpsMatch[1]!, name: httpsMatch[2]! };
  return null;
}
