import { Command } from "commander";
import { linkCommand } from "./commands/link.js";
import { loginCommand } from "./commands/login.js";
import { logoutCommand } from "./commands/logout.js";
import { pullCommand } from "./commands/pull.js";
import { pushCommand } from "./commands/push.js";
import { whoamiCommand } from "./commands/whoami.js";
import { c, err } from "./util/style.js";

const program = new Command();

program
  .name("cryptly")
  .description("End-to-end encrypted secrets, from your terminal.")
  .version("0.0.0");

program
  .command("login")
  .description("Authorize this device against your cryptly account.")
  .action(wrap(loginCommand));

program
  .command("logout")
  .description("Forget the local session.")
  .action(wrap(logoutCommand));

program
  .command("whoami")
  .description("Show the account this CLI is signed in as.")
  .action(wrap(whoamiCommand));

program
  .command("link")
  .description("Link the current directory to a cryptly project.")
  .option("--file <path>", "Local file to mirror secrets to (default: .env)")
  .option("--pick", "Force the project picker (skip auto-detection)")
  .action(wrap((opts) => linkCommand(opts)));

program
  .command("pull")
  .description("Pull remote secrets into the local file.")
  .option("-y, --yes", "Don't prompt on destructive changes")
  .action(wrap((opts) => pullCommand(opts)));

program
  .command("push")
  .description("Push the local file to the remote project.")
  .option("-y, --yes", "Don't prompt on destructive changes")
  .action(wrap((opts) => pushCommand(opts)));

program.parseAsync(process.argv);

function wrap<TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<void>,
): (...args: TArgs) => Promise<void> {
  return async (...args) => {
    try {
      await fn(...args);
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      process.stderr.write(`\n${err("Failed", c.red(msg))}\n`);
      process.exit(1);
    }
  };
}
