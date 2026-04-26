import pc from "picocolors";

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export interface Spinner {
  succeed(text?: string): void;
  fail(text?: string): void;
  stop(): void;
  update(text: string): void;
}

export function startSpinner(initial: string): Spinner {
  let i = 0;
  let text = initial;
  let stopped = false;

  const interval = setInterval(() => {
    if (stopped) return;
    process.stderr.write(`\r${pc.cyan(FRAMES[i % FRAMES.length])} ${text}    `);
    i++;
  }, 80);

  const clear = () => {
    process.stderr.write("\r\x1b[2K");
  };

  return {
    update(next) {
      text = next;
    },
    succeed(t) {
      stopped = true;
      clearInterval(interval);
      clear();
      process.stderr.write(`${pc.green("✔")} ${t ?? text}\n`);
    },
    fail(t) {
      stopped = true;
      clearInterval(interval);
      clear();
      process.stderr.write(`${pc.red("✖")} ${t ?? text}\n`);
    },
    stop() {
      stopped = true;
      clearInterval(interval);
      clear();
    },
  };
}
