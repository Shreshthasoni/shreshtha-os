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

import { isNarrow, reduceMotion } from "./lib/dom";
import { applySettings } from "./os/settings";
import "./os/matrix";
import { initPanel } from "./os/panel";
import { initDock } from "./os/dock";
import { initDesktop } from "./os/desktop";
import "./os/contextMenu";
import { initShortcuts } from "./os/shortcuts";
import { toast } from "./os/toast";
import { boot } from "./os/boot";
import { desk, type Win } from "./os/wm";
import { openApp, preload, registerApp } from "./apps/registry";
import { open as openTerminal } from "./apps/terminal";

registerApp("terminal", openTerminal);
applySettings();
initPanel();
initDock();
initDesktop();
initShortcuts();

// Startup opens the GitHub profile (and the editor on wide screens): fetch their code during the boot animation.
preload("github", ...(isNarrow() ? [] : ["editor" as const]));

/** Startup windows float in one after another, after the panel and dock. */
let winDelay = 0.55;
const floatIn = (w?: Win) => {
  if (!w || reduceMotion) return;
  w.el.style.animation = `rv-win .65s cubic-bezier(.2,.8,.2,1) ${winDelay}s both`;
  winDelay += 0.15;
};

async function startDesktop(): Promise<void> {
  document.body.classList.add("reveal");
  setTimeout(() => document.body.classList.remove("reveal"), 2600);
  const W = desk.clientWidth;
  // The GitHub window (with the profile photo) opens last, so it lands on top of the others.
  if (isNarrow()) {
    await openApp("terminal", { intro: true }); // stays one tap away in Recent apps
    floatIn(await openApp("github"));
  } else {
    const ed = await openApp("editor", ["about.txt"]);
    floatIn(ed);
    if (ed) { ed.el.style.left = Math.min(W - 640, W * .5) + "px"; ed.el.style.top = "40px"; }
    floatIn(await openApp("terminal", { intro: true, x: 130, y: 90, w: Math.min(760, W - 160), h: 470 }));
    const gh = await openApp("github");
    floatIn(gh);
    if (gh) { gh.el.style.left = Math.max(10, W - 860) + "px"; gh.el.style.top = Math.min(250, Math.max(10, desk.clientHeight - 640)) + "px"; }
  }
  setTimeout(() => toast("Welcome to Shreshtha OS", "Right-click the desktop, open the launcher (top-left) or type help in the terminal."), 1400);
  setTimeout(() => toast("1 new notification", "Shreshtha is open to SDE internships. Try: sudo hire-me"), 3600);
}

boot(startDesktop);
