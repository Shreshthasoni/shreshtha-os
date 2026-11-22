/**
 * Opens apps by id. Every app except the terminal is code-split and only downloaded the first
 * time it is opened (or when preloaded during the boot animation).
 */
import type { AppId } from "./meta";
import type { Win } from "../os/wm";
import { toast } from "../os/toast";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Opener = (arg?: any) => Win | undefined | void | Promise<Win | undefined | void>;

const loaders: Partial<Record<AppId, () => Promise<{ open: Opener }>>> = {
  files: () => import("./files"),
  editor: () => import("./editor"),
  monitor: () => import("./monitor"),
  github: () => import("./github"),
  git: () => import("./git"),
  resume: () => import("./resume"),
  mail: () => import("./mail"),
  settings: () => import("./settings")
};
const eager: Partial<Record<AppId, Opener>> = {};

/** Register an app that is bundled with the main script (the terminal). */
export function registerApp(id: AppId, open: Opener): void { eager[id] = open; }

export async function openApp(id: AppId, arg?: unknown): Promise<Win | undefined> {
  try {
    const open = eager[id] ?? (await loaders[id]!()).open;
    return (await open(arg)) ?? undefined;
  } catch (err) {
    console.error(err);
    toast("Couldn't open app", "Check your connection and try again.");
    return undefined;
  }
}

/** Start downloading app code in the background. */
export function preload(...ids: AppId[]): void { ids.forEach(id => loaders[id]?.().catch(() => {})); }
