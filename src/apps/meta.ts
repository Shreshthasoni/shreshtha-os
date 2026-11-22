/** App names and icons. Kept separate from the loaders so the window manager can import it cheaply. */
import type { IconName } from "../lib/icons";

export const APP_META = {
  terminal: { name: "Terminal", icon: "term" },
  files: { name: "Files", icon: "files" },
  editor: { name: "Editor", icon: "edit" },
  monitor: { name: "System Monitor", icon: "mon" },
  github: { name: "GitHub", icon: "gh" },
  git: { name: "Career.git", icon: "git" },
  resume: { name: "Resume", icon: "cv" },
  mail: { name: "Mail", icon: "mail" },
  settings: { name: "Settings", icon: "set" }
} satisfies Record<string, { name: string; icon: IconName }>;

export type AppId = keyof typeof APP_META;
export const APP_IDS = Object.keys(APP_META) as AppId[];
