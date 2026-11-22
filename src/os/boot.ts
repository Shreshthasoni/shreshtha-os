/** Boot sequence: GRUB menu → kernel log → login screen → desktop. Click or Esc skips it. */
import { $, reduceMotion } from "../lib/dom";
import { GITHUB_URL, profile } from "../data/profile";
import { settings } from "./settings";

export function boot(done: () => void): void {
  const el = $("#boot");
  let booted = false;
  const finish = () => {
    if (booted) return;
    booted = true;
    removeEventListener("keydown", onKey);
    el.remove();
    done();
  };
  if (!settings.boot || reduceMotion) { finish(); return; }

  el.addEventListener("click", finish);

  // GRUB: ↑/↓ choose an entry, Enter boots it, Esc skips straight to the desktop.
  const entries: [string, (() => void) | null][] = [
    ["*Shreshtha OS 26.11 (portfolio)", null],
    ["Shreshtha OS 26.11 (recovery: plain resume)", () => { location.href = "/resume"; }],
    ["Memory test (memtest86+)", null],
    ["UEFI Firmware Settings", null]
  ];
  let sel = 0, inGrub = true;
  const g = document.createElement("div");
  g.className = "grub";
  g.innerHTML = `<h1>GNU GRUB  version 2.12</h1><ul>${entries.map(([t], i) => `<li data-i="${i}">${t}</li>`).join("")}</ul><p>Use ↑ and ↓ to select, Enter to boot. The highlighted entry will be executed automatically in <span id="gs">2</span>s.</p>`;
  el.prepend(g);
  const lis = [...g.querySelectorAll("li")];
  const paint = () => lis.forEach((li, i) => li.classList.toggle("sel", i === sel));
  paint();
  const choose = (i: number) => {
    const run = entries[i][1];
    if (run) run(); else kernel();
  };
  lis.forEach((li, i) => li.addEventListener("click", e => { if (entries[i][1]) { e.stopPropagation(); choose(i); } }));

  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") { finish(); return; }
    if (!inGrub) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); clearInterval(gi); $("#gs").parentElement!.textContent = "Use ↑ and ↓ to select, Enter to boot.";
      sel = (sel + (e.key === "ArrowDown" ? 1 : entries.length - 1)) % entries.length; paint();
    } else if (e.key === "Enter") { e.preventDefault(); clearInterval(gi); choose(sel); }
  }
  addEventListener("keydown", onKey);

  let s = 2;
  const gi = setInterval(() => {
    s--;
    const c = document.getElementById("gs");
    if (c) c.textContent = String(s);
    if (s <= 0) { clearInterval(gi); kernel(); }
  }, 600);

  function kernel() {
    if (booted || !inGrub) return;
    inGrub = false; g.remove();
    const k = document.createElement("div");
    k.className = "klog";
    el.prepend(k);
    const L: [string, string][] = [
      ["", "[    0.000000] Linux version 26.11.0-jaipur (shreshtha@jecrc) (gcc 14.2) #1 SMP PREEMPT"],
      ["", "[    0.004211] Command line: BOOT_IMAGE=/vmlinuz root=/dev/portfolio ro quiet splash"],
      ["OK", "Mounted /home/shreshtha"],
      ["OK", "Connected remote origin: " + GITHUB_URL.replace("https://", "")],
      ["OK", `Started B.Tech CSE (${profile.education.school}, ${profile.education.started.slice(0, 4)}–${profile.education.gradYear})`],
      ["OK", "Loaded languages: " + profile.skills["Languages"].filter(l => l !== "SQL").join(", ")],
      ["OK", "Started react.service, next.service, node.service, fastapi.service"],
      ["OK", "Started docker.service and aws-cli"],
      ["OK", "Reached target Experience: Tagshop.ai (Jun–Oct 2026)"],
      ["OK", "Deployed galla.apk to Google Play"],
      ["OK", "Deployed school-erp to production"],
      ["OK", "Started dsa-practice.timer (daily)"],
      ["OK", "Reached target Graphical Interface"]
    ];
    let i = 0;
    const ki = setInterval(() => {
      if (booted) return clearInterval(ki);
      const [t, m] = L[i++];
      k.insertAdjacentHTML("beforeend", (t ? `[  <span class="ok">OK</span>  ] ` : `<span class="dim">`) + m + (t ? "" : "</span>") + "\n");
      if (i >= L.length) { clearInterval(ki); setTimeout(login, 350); }
    }, 110);
  }

  function login() {
    if (booted) return;
    el.querySelector(".klog")?.remove();
    const l = document.createElement("div");
    l.className = "login";
    const now = new Date();
    l.innerHTML = `<div class="clock">${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div><div class="date">${now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })}</div><div class="avatar">${profile.initials}</div><div>shreshtha</div><div class="pw"><span id="dots"></span><span class="cur"></span></div><div class="dim" id="lmsg">password: ••••••••</div>`;
    el.prepend(l);
    let n = 0;
    const pi = setInterval(() => {
      if (booted) return clearInterval(pi);
      $("#dots").textContent += "•";
      if (++n >= 8) { clearInterval(pi); $("#lmsg").innerHTML = '<span class="ok">authenticating…</span>'; setTimeout(finish, 500); }
    }, 80);
  }
}
