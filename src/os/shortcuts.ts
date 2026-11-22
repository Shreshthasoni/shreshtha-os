/**
 * Global keyboard shortcuts. Uses e.code so they work on macOS, where Option+letter types a symbol.
 *   Ctrl+Alt+T  new terminal          Alt+L  app launcher
 *   Alt+`       next window           Alt+W  close window
 *   Alt+M       minimise window       Alt+X  maximise window
 *   Alt+1..4    switch workspace      Shift+F10 / Menu key  desktop menu
 *   Esc         close launcher / menu / app switcher
 */
import { openApp } from "../apps/registry";
import { closeWin, cycleWindows, focused, minimise, switchWS, toggleMax } from "./wm";
import { hideLauncher, toggleLauncher } from "./launcher";
import { closeMenu, openMenu } from "./contextMenu";
import { closeSwitcher } from "./switcher";

export const SHORTCUTS: [string, string][] = [
  ["Ctrl+Alt+T", "open a new terminal"], ["Alt+L", "app launcher"], ["Alt+`", "next window"],
  ["Alt+W", "close window"], ["Alt+M", "minimise window"], ["Alt+X", "maximise / restore window"],
  ["Alt+1 … Alt+4", "switch workspace"], ["Shift+F10", "desktop menu"], ["title bar + arrows", "move a window (Shift: resize)"],
  ["Tab / Shift+Tab", "move between controls"], ["Esc", "close launcher, menu or app switcher"]
];

export function initShortcuts(): void {
  addEventListener("keydown", e => {
    if (document.getElementById("boot")) return;
    const code = e.code;
    if (e.ctrlKey && e.altKey && code === "KeyT") { e.preventDefault(); openApp("terminal"); return; }
    if (e.key === "Escape") { hideLauncher(); closeMenu(); closeSwitcher(); return; }
    if ((e.shiftKey && e.key === "F10") || e.key === "ContextMenu") {
      const t = e.target as Element;
      if (t.closest(".win input, .win textarea")) return;
      e.preventDefault();
      openMenu(innerWidth / 2 - 100, innerHeight / 3);
      return;
    }
    if (!e.altKey || e.ctrlKey || e.metaKey) return;
    if (/^Digit[1-4]$/.test(code)) { e.preventDefault(); switchWS(+code.slice(5)); return; }
    if (code === "KeyL") { e.preventDefault(); toggleLauncher(); return; }
    if (code === "Backquote") { e.preventDefault(); cycleWindows(); return; }
    const w = focused();
    if (!w) return;
    if (code === "KeyW") { e.preventDefault(); closeWin(w); }
    else if (code === "KeyM") { e.preventDefault(); minimise(w); }
    else if (code === "KeyX") { e.preventDefault(); toggleMax(w); }
  });
}
