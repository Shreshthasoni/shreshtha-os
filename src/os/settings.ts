/** Appearance settings (accent, wallpaper, effects), saved in localStorage. */
import { store } from "../lib/dom";

export const ACCENTS: Record<string, string> = { green: "#3dff8f", amber: "#ffb43d", cyan: "#3de3ff", pink: "#ff5fa8", white: "#e8eee9" };
export const WALLPAPERS = ["grid", "matrix", "plain"] as const;

export interface Settings { accent: string; wall: (typeof WALLPAPERS)[number]; scan: boolean; boot: boolean }
export const settings: Settings = Object.assign({ accent: "green", wall: "grid", scan: false, boot: true }, store.get<Partial<Settings>>("settings", {}));

const listeners = new Set<(s: Settings) => void>();
export const onSettings = (fn: (s: Settings) => void) => { listeners.add(fn); };

export function applySettings(): void {
  const s = settings;
  document.documentElement.style.setProperty("--acc", ACCENTS[s.accent] || ACCENTS.green);
  document.body.classList.toggle("scan", s.scan);
  document.body.classList.remove("w-matrix", "w-plain");
  if (s.wall !== "grid") document.body.classList.add("w-" + s.wall);
  store.set("settings", s);
  listeners.forEach(f => f(s));
}

export const accentColor = () => getComputedStyle(document.documentElement).getPropertyValue("--acc");
