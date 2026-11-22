/** Dock: one button per app. */
import { $ } from "../lib/dom";
import { IC } from "../lib/icons";
import { APP_IDS, APP_META } from "../apps/meta";
import { openApp } from "../apps/registry";
import { WINS, onWmChange, showWin } from "./wm";

export function initDock(): void {
  const dock = $("#dock");
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
    dock.querySelectorAll<HTMLElement>(".dk[data-app]").forEach(b => b.classList.toggle("run", [...WINS].some(w => w.app === b.dataset.app)));
  });
}
