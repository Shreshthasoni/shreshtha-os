/**
 * Terminal command registry. Each command group lives in ./commands/*.ts and calls `register`.
 * A command returns HTML to print (or null for no output), optionally as a Promise.
 */
import type { Win } from "../../os/wm";

export type Output = string | null | void;

export interface Ctx {
  /** current directory as path segments ([] is ~) */
  readonly cwd: string[];
  cd(parts: string[]): void;
  /** print a line of HTML */
  print(html: string): void;
  /** the coloured prompt, as HTML */
  prompt(): string;
  clear(): void;
  win: Win;
  hist: string[];
  /** plain text piped in from the previous command (`a | b`), or null */
  stdin: string | null;
}

export interface Command {
  name: string;
  /** usage line shown in `help` and `man`, e.g. "ls [-la] [dir]" */
  usage: string;
  /** one-line summary shown in `help` */
  summary: string;
  /** longer text for `man` */
  description?: string;
  examples?: string[];
  /** other names that run this command */
  aliases?: string[];
  run(args: string[], ctx: Ctx): Output | Promise<Output>;
}

const COMMANDS = new Map<string, Command>();
const ALIASES = new Map<string, string>();

export function register(...cmds: Command[]): void {
  for (const c of cmds) {
    COMMANDS.set(c.name, c);
    c.aliases?.forEach(a => ALIASES.set(a, c.name));
  }
}

export const getCommand = (name: string): Command | undefined => COMMANDS.get(ALIASES.get(name) ?? name);
export const isAlias = (name: string) => ALIASES.has(name);
/** Every runnable name, including aliases (for Tab completion and "did you mean"). */
export const commandNames = (): string[] => [...COMMANDS.keys(), ...ALIASES.keys()];
export const allCommands = (): Command[] => [...COMMANDS.values()];
