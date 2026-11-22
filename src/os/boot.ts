/**
 * Boot sequence: GRUB menu → kernel log → login screen → desktop.
 * Clicking during GRUB or the kernel log jumps ahead to the login screen; the login screen types the
 * password, then waits for the "Log in" button (or Enter). Esc at any point goes straight to the desktop.
 */
import { $, reduceMotion } from "../lib/dom";
import { GITHUB_URL, profile } from "../data/profile";
import { settings } from "./settings";
import { avatarImg } from "../lib/render";

/** How long the boot screen takes to fade out once you log in (ms). Keep in sync with #boot.out in boot.css. */
const FADE_MS = 500;

export function boot(done: () => void): void {
  const el = $("#boot");
  let booted = false, phase: "grub" | "kernel" | "login" = "grub";
  let gi = 0, ki = 0;

  const finish = () => {
    if (booted) return;
    booted = true;
    clearInterval(gi); clearInterval(ki);
    removeEventListener("keydown", onKey);
    el.classList.add("out");
    setTimeout(() => el.remove(), FADE_MS);
    done();
  };
  if (!settings.boot || reduceMotion) { el.remove(); booted = true; done(); return; }

  if (profile.photo) new Image().src = profile.photo; // ready by the time the login screen shows it

  /** Click during GRUB / kernel log: skip ahead to the login screen. */
  el.addEventListener("click", () => { if (phase !== "login") login(); });

  // GRUB: ↑/↓ choose an entry, Enter boots it.
  const entries: [string, (() => void) | null][] = [
    ["*Shreshtha OS 26.11 (portfolio)", null],
    ["Shreshtha OS 26.11 (recovery: plain resume)", () => { location.href = "/resume"; }],
    ["Memory test (memtest86+)", null],
    ["UEFI Firmware Settings", null]
  ];
  let sel = 0;
  const g = document.createElement("div");
  g.className = "grub";
  g.innerHTML = `<h1>GNU GRUB  version 2.12</h1><ul>${entries.map(([t], i) => `<li data-i="${i}">${t}</li>`).join("")}</ul><p>Use ↑ and ↓ to select, Enter to boot. The highlighted entry will be executed automatically in <span id="gs">2</span>s.</p>`;
  el.prepend(g);
  const lis = [...g.querySelectorAll("li")];
  const paint = () => lis.forEach((li, i) => li.classList.toggle("sel", i === sel));
  paint();
  const choose = (i: number) => { const run = entries[i][1]; if (run) run(); else kernel(); };
  lis.forEach((li, i) => li.addEventListener("click", e => { if (entries[i][1]) { e.stopPropagation(); choose(i); } }));

  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") { finish(); return; }
    if (phase !== "grub") return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); clearInterval(gi); $("#gs").parentElement!.textContent = "Use ↑ and ↓ to select, Enter to boot.";
      sel = (sel + (e.key === "ArrowDown" ? 1 : entries.length - 1)) % entries.length; paint();
    } else if (e.key === "Enter") { e.preventDefault(); clearInterval(gi); choose(sel); }
  }
  addEventListener("keydown", onKey);

  let s = 2;
  gi = window.setInterval(() => {
    s--;
    const c = document.getElementById("gs");
    if (c) c.textContent = String(s);
    if (s <= 0) { clearInterval(gi); kernel(); }
  }, 600);

  function kernel() {
    if (booted || phase !== "grub") return;
    phase = "kernel"; clearInterval(gi); g.remove();
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
    ki = window.setInterval(() => {
      if (booted || phase !== "kernel") return clearInterval(ki);
      const [t, m] = L[i++];
      k.insertAdjacentHTML("beforeend", (t ? `[  <span class="ok">OK</span>  ] ` : `<span class="dim">`) + m + (t ? "" : "</span>") + "\n");
      if (i >= L.length) { clearInterval(ki); setTimeout(login, 350); }
    }, 110);
  }

  function login() {
    if (booted || phase === "login") return;
    phase = "login";
    clearInterval(gi); clearInterval(ki);
    g.remove(); el.querySelector(".klog")?.remove();
    $(".skip", el).textContent = "press Esc to skip";
    // The login screen is interactive, so expose it to assistive tech as a dialog.
    el.removeAttribute("aria-hidden");
    el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Shreshtha OS login");

    const now = new Date();
    const l = document.createElement("div");
    l.className = "login";
    l.innerHTML = `<div class="clock" aria-hidden="true">${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
      <div class="date" aria-hidden="true">${now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })}</div>
      <div class="avatar" aria-hidden="true">${avatarImg()}</div>
      <div class="user">shreshtha</div>
      <div class="pw" aria-hidden="true"><span class="dots"></span><span class="cur"></span></div>
      <div class="dim lmsg" aria-live="polite">typing password…</div>
      <button class="login-btn" type="button" disabled>Log in <span aria-hidden="true">→</span></button>
      <a class="plain-link" href="/resume">or read the plain resume</a>`;
    el.prepend(l);
    const dots = $(".dots", l), msg = $(".lmsg", l), btn = $<HTMLButtonElement>(".login-btn", l);

    btn.addEventListener("click", e => {
      e.stopPropagation();
      btn.disabled = true;
      msg.innerHTML = '<span class="ok">authenticating…</span>';
      setTimeout(finish, 450);
    });

    // Type the password slowly once the screen has faded in, then enable the button.
    let n = 0;
    setTimeout(() => {
      const pi = setInterval(() => {
        if (booted) return clearInterval(pi);
        dots.textContent += "•";
        if (++n >= 8) {
          clearInterval(pi);
          msg.innerHTML = '<span class="ok">✔ password accepted</span>';
          btn.disabled = false;
          btn.focus({ preventScroll: true });
        }
      }, 170);
    }, 1100);
  }
}
