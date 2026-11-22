/** Files: a file manager for the virtual home folder. */
import { $, $$, esc, escText } from "../lib/dom";
import { IC } from "../lib/icons";
import { pathStr, resolve } from "../fs/vfs";
import { WINS, makeWin, showWin, type Win } from "../os/wm";
import { openApp } from "./registry";

export function open(start: string[] = []): Win {
  const existing = [...WINS].find(w => w.app === "files" && w.key === "files");
  if (existing) { showWin(existing); existing.go!(start); return existing; }

  const box = document.createElement("div");
  box.className = "fm";
  box.innerHTML = `<nav aria-label="Places"><button type="button" data-p="">~ home</button><button type="button" data-p="projects">projects</button><button type="button" data-p="experience">experience</button><button type="button" data-p="resume.pdf">resume.pdf</button></nav><div class="main"><div class="crumb" aria-live="polite"></div><div class="grid"></div></div>`;
  const w = makeWin({ app: "files", title: "Files", w: 660, h: 420, body: box });
  w.key = "files";
  const crumb = $(".crumb", box), grid = $(".grid", box);
  w.go = parts => {
    const { node } = resolve([], parts.join("/"));
    if (!node) return;
    if (node.type !== "dir") { openApp("editor", parts); return; }
    w.setTitle("Files — " + pathStr(parts));
    crumb.innerHTML = `<b>${pathStr(parts)}</b> · ${Object.keys(node.c).filter(k => !node.c[k].hidden).length} items`;
    $$("nav button", box).forEach(b => {
      const on = b.dataset.p === parts.join("/");
      b.classList.toggle("on", on);
      b.toggleAttribute("aria-current", on);
    });
    grid.innerHTML = (parts.length ? `<button class="fi" type="button" data-n=".." aria-label="Up one folder">${IC.dir}<span>..</span></button>` : "") +
      Object.entries(node.c).filter(([, v]) => !v.hidden).map(([k, v]) =>
        `<button class="fi" type="button" data-n="${esc(k)}" aria-label="${esc(k)}${v.type === "dir" ? " (folder)" : ""}">${v.type === "dir" ? IC.dir : v.type === "pdf" ? IC.pdf : IC.file}<span>${escText(k)}</span></button>`).join("");
    $$(".fi", grid).forEach(b => b.addEventListener("click", () => {
      const n = b.dataset.n!;
      w.go!(n === ".." ? parts.slice(0, -1) : [...parts, n]);
    }));
  };
  $$("nav button", box).forEach(b => b.addEventListener("click", () => w.go!(b.dataset.p ? b.dataset.p.split("/") : [])));
  w.go(start);
  return w;
}
