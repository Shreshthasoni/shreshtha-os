/** System Monitor: an htop look-alike with a playful process list. */
import { $, $$ } from "../lib/dom";
import { PROCESSES, uptime } from "../data/profile";
import { makeWin, openOrFocus, type Win } from "../os/wm";

export function open(): Win {
  return openOrFocus("monitor", "mon", () => {
    const w = makeWin({
      app: "monitor", title: "htop — System Monitor", w: 620, h: 470,
      body: `<div class="mon"><div class="meters"></div><table><thead><tr><th scope="col">PID</th><th scope="col">USER</th><th scope="col">CPU%</th><th scope="col">MEM%</th><th scope="col">TIME+</th><th scope="col">COMMAND</th></tr></thead><tbody></tbody></table><div class="foot"><b>F1</b>help <b>F9</b>kill (disabled: all processes are essential) · uptime ${uptime().short} · tasks ${PROCESSES.length}</div></div>`
    });
    const tb = $("tbody", w.body), mtr = $(".meters", w.body);
    const meters = ["CPU0", "CPU1", "Mem", "Swp"];
    mtr.innerHTML = meters.map(k => `<div class="meter"><span>${k}</span><div class="track" aria-hidden="true"><div class="fill"></div></div><span class="v"></span></div>`).join("");
    const tick = () => {
      if (document.hidden) return;
      const rows = PROCESSES.map(([c, u, b], i) => ({ pid: 1024 + i * 37, u, cpu: Math.max(.1, b + (Math.random() - .5) * b * .6), mem: (b / 3 + Math.random()).toFixed(1), c })).sort((a, b) => b.cpu - a.cpu);
      tb.innerHTML = rows.map(r => `<tr><td>${r.pid}</td><td class="c-b">${r.u}</td><td class="c-acc">${r.cpu.toFixed(1)}</td><td>${r.mem}</td><td class="c-d">${Math.floor(r.cpu * 3)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}.${Math.floor(Math.random() * 99)}</td><td class="c-w">${r.c}</td></tr>`).join("");
      const vals = [72 + Math.random() * 20, 60 + Math.random() * 30, 85 + Math.random() * 10, 8 + Math.random() * 10];
      $$(".meter", mtr).forEach((m, i) => {
        $(".fill", m).style.width = vals[i] + "%";
        $(".v", m).textContent = i === 3 ? "low" : vals[i].toFixed(0) + "%";
      });
    };
    tick();
    const iv = setInterval(tick, 1200);
    w.onClose = () => clearInterval(iv);
    return w;
  });
}
