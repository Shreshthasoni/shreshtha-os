/** Top panel: launcher button, workspaces, focused window title, tray (GitHub, plain view, cpu, clock). */
import { $, escText, reduceMotion } from "../lib/dom";
import { GITHUB_URL, GITHUB_USERNAME } from "../data/profile";
import { WINS, focused, onWmChange, switchWS, wm } from "./wm";
import { accentColor } from "./settings";
import { toggleLauncher } from "./launcher";

export function initPanel(): void {
  $("#brand").addEventListener("click", toggleLauncher);

  const wsEl = $("#ws");
  [1, 2, 3, 4].forEach(n => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = String(n);
    b.setAttribute("aria-label", `Workspace ${n}`);
    b.addEventListener("click", () => switchWS(n));
    wsEl.appendChild(b);
  });
  const sync = () => {
    [...wsEl.children].forEach((b, i) => {
      b.classList.toggle("on", i + 1 === wm.ws);
      b.setAttribute("aria-pressed", String(i + 1 === wm.ws));
      b.classList.toggle("has", [...WINS].some(w => w.ws === i + 1));
    });
    const f = focused();
    $("#ptitle").innerHTML = f ? `<b>${escText(f.title)}</b> — workspace ${wm.ws}` : `workspace ${wm.ws}`;
  };
  onWmChange(sync); sync();

  const gh = $<HTMLAnchorElement>("#ghlink");
  gh.href = GITHUB_URL; gh.textContent = "github/" + GITHUB_USERNAME;

  const clockEl = $("#clock");
  const tickClock = () => { clockEl.textContent = new Date().toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" }); };
  tickClock(); setInterval(tickClock, 10000);

  const cpu = $<HTMLCanvasElement>("#cpu").getContext("2d")!, cpuV: number[] = Array(30).fill(30);
  const draw = () => {
    if (document.hidden) return;
    cpuV.shift(); cpuV.push(20 + Math.random() * 70);
    cpu.clearRect(0, 0, 60, 16); cpu.strokeStyle = accentColor(); cpu.beginPath();
    cpuV.forEach((v, i) => cpu[i ? "lineTo" : "moveTo"](i * 2, 16 - v / 100 * 15));
    cpu.stroke();
  };
  if (reduceMotion) { for (let i = 0; i < 30; i++) draw(); } // a still graph, no animation
  else setInterval(draw, 500);
}
