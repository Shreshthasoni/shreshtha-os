/**
 * Shreshtha OS entry point. Boots, then opens the startup windows.
 * Content lives in src/data/profile.ts.
 */
import "./styles/tokens.css";
import "./styles/boot.css";
import "./styles/desktop.css";
import "./styles/panel.css";
import "./styles/windows.css";
import "./styles/terminal.css";
import "./styles/apps.css";
import "./styles/overlays.css";
import "./styles/responsive.css";

import { isNarrow } from "./lib/dom";
import { applySettings } from "./os/settings";
import "./os/matrix";
import { initPanel } from "./os/panel";
import { initDock } from "./os/dock";
import { initDesktop } from "./os/desktop";
import "./os/contextMenu";
import { initShortcuts } from "./os/shortcuts";
import { toast } from "./os/toast";
import { boot } from "./os/boot";
import { desk } from "./os/wm";
import { openApp, preload, registerApp } from "./apps/registry";
import { open as openTerminal } from "./apps/terminal";

registerApp("terminal", openTerminal);
applySettings();
initPanel();
initDock();
initDesktop();
initShortcuts();

// The desktop opens the editor and GitHub at startup on wide screens: fetch their code during the boot animation.
if (!isNarrow()) preload("editor", ...(desk.clientWidth > 1100 ? ["github" as const] : []));

async function startDesktop(): Promise<void> {
  const W = desk.clientWidth;
  if (isNarrow()) await openApp("terminal", { intro: true });
  else {
    const ed = await openApp("editor", ["about.txt"]);
    if (ed) { ed.el.style.left = Math.min(W - 640, W * .5) + "px"; ed.el.style.top = "40px"; }
    if (W > 1100) {
      const gh = await openApp("github");
      if (gh) { gh.el.style.left = Math.max(10, W - 860) + "px"; gh.el.style.top = "250px"; }
    }
    await openApp("terminal", { intro: true, x: 130, y: 90, w: Math.min(760, W - 160), h: 470 });
  }
  setTimeout(() => toast("Welcome to Shreshtha OS", "Right-click the desktop, open the launcher (top-left) or type help in the terminal."), 400);
  setTimeout(() => toast("1 new notification", "Shreshtha is open to SDE internships. Try: sudo hire-me"), 2600);
}

boot(startDesktop);
