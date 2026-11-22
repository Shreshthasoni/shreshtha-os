/** Dock: one button per app. On phones it also has Home and Recent apps (the app switcher). */
import { $ } from "../lib/dom";
import { IC } from "../lib/icons";
import { APP_IDS, APP_META } from "../apps/meta";
import { openApp } from "../apps/registry";
import { WINS, minimise, onWmChange, showWin, wm } from "./wm";
import { openSwitcher } from "./switcher";

export function initDock(): void {
  const dock = $("#dock");
  const nav = document.createElement("span");
  nav.className = "dnav";
  const navBtn = (label: string, html: string, fn: () => void) => {
    const b = document.createElement("button");
    b.className = "dk"; b.type = "button";
    b.setAttribute("aria-label", label);
    b.innerHTML = html + `<span class="tip">${label}</span>`;
    b.addEventListener("click", fn);
    nav.appendChild(b);
    return b;
  };
  navBtn("Home", IC.home, () => [...WINS].filter(w => w.ws === wm.ws).forEach(minimise));
  const rec = navBtn("Recent apps", IC.recents + '<span class="count" aria-hidden="true"></span>', openSwitcher);
  dock.appendChild(nav);

  APP_IDS.forEach(k => {
    const a = APP_META[k];
    const b = document.createElement("button");
    b.className = "dk"; b.type = "button"; b.dataset.app = k;
    b.setAttribute("aria-label", a.name);
    b.innerHTML = IC[a.icon] + `<span class="tip">${a.name}</span>`;
    b.addEventListener("click", () => {
      const mine = [...WINS].filter(w => w.app === k);
      if (k !== "terminal" && mine.length) showWin(mine[0]); else openApp(k);
    });
    dock.appendChild(b);
  });
  onWmChange(() => {
    dock.querySelectorAll<HTMLElement>(".dk[data-app]").forEach(b => {
      const run = [...WINS].some(w => w.app === b.dataset.app);
      b.classList.toggle("run", run);
      b.setAttribute("aria-label", APP_META[b.dataset.app as keyof typeof APP_META].name + (run ? " (running)" : ""));
    });
    $(".count", rec).textContent = WINS.size ? String(WINS.size) : "";
    rec.setAttribute("aria-label", `Recent apps, ${WINS.size} open`);
  });
}
