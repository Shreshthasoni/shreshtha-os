/**
 * Global keyboard shortcuts. Uses e.code so they also work on macOS, where Option+key types a symbol.
 *   Ctrl+Alt+T  new terminal     Alt+1..4  switch workspace     Esc  close launcher / menu
 */
import { openApp } from "../apps/registry";
import { switchWS } from "./wm";
import { hideLauncher } from "./launcher";
import { closeMenu } from "./contextMenu";

export function initShortcuts(): void {
  addEventListener("keydown", e => {
    if (document.getElementById("boot")) return;
    const code = e.code;
    if (e.ctrlKey && e.altKey && code === "KeyT") { e.preventDefault(); openApp("terminal"); return; }
    if (e.key === "Escape") { hideLauncher(); closeMenu(); return; }
    if (e.altKey && !e.ctrlKey && !e.metaKey && /^Digit[1-4]$/.test(code)) { e.preventDefault(); switchWS(+code.slice(5)); }
  });
}
