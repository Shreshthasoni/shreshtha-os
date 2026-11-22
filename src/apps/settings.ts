/** Settings: accent colour, wallpaper and effects. */
import { $$ } from "../lib/dom";
import { ACCENTS, WALLPAPERS, applySettings, settings, type Settings } from "../os/settings";
import { makeWin, openOrFocus, type Win } from "../os/wm";

export function open(): Win {
  return openOrFocus("settings", "set", () => {
    const w = makeWin({
      app: "settings", title: "Settings", w: 480, h: 440,
      body: `<div class="doc"><h2>Appearance</h2><p class="sub">Saved in this browser only.</p>
      <div id="l-acc">Accent</div><div class="opts" role="group" aria-labelledby="l-acc" data-g="acc">${Object.entries(ACCENTS).map(([k, v]) => `<button class="sw" type="button" data-k="${k}" style="background:${v}" aria-label="${k}"></button>`).join("")}</div>
      <div id="l-wall">Wallpaper</div><div class="opts seg" role="group" aria-labelledby="l-wall" data-g="wall">${WALLPAPERS.map(k => `<button type="button" data-k="${k}">${k}</button>`).join("")}</div>
      <div id="l-fx">Effects</div><div class="opts seg" role="group" aria-labelledby="l-fx" data-g="fx"><button type="button" data-k="scan">CRT scanlines</button><button type="button" data-k="boot">boot animation</button></div></div>`
    });
    const group = (g: string) => $$<HTMLButtonElement>(`[data-g="${g}"] button`, w.body);
    const sync = () => {
      group("acc").forEach(b => { const on = b.dataset.k === settings.accent; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
      group("wall").forEach(b => { const on = b.dataset.k === settings.wall; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
      group("fx").forEach(b => { const on = !!settings[b.dataset.k as "scan" | "boot"]; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
    };
    group("acc").forEach(b => b.addEventListener("click", () => { settings.accent = b.dataset.k!; applySettings(); sync(); }));
    group("wall").forEach(b => b.addEventListener("click", () => { settings.wall = b.dataset.k as Settings["wall"]; applySettings(); sync(); }));
    group("fx").forEach(b => b.addEventListener("click", () => { const k = b.dataset.k as "scan" | "boot"; settings[k] = !settings[k]; applySettings(); sync(); }));
    sync();
    return w;
  });
}
