import { createAuthedClient } from "../api/client.js";
import { UsersApi } from "../api/projects.js";
import { kv, ok } from "../util/style.js";

export async function whoamiCommand(): Promise<void> {
  const client = await createAuthedClient();
  const me = await UsersApi.me(client);
  process.stderr.write(`${ok("Logged in")}\n`);
  process.stderr.write(
    kv([
      ["Email", me.email ?? "—"],
      ["Display name", me.displayName],
      ["User id", me.id],
    ]) + "\n",
  );
}
