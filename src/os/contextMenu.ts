/** Desktop right-click menu. Also opens with Shift+F10 or the Menu key; arrow keys move between items. */
import { $, $$ } from "../lib/dom";
import { openApp } from "../apps/registry";
import { applySettings, settings, WALLPAPERS } from "./settings";
import { toast } from "./toast";
import { desk } from "./wm";

const ctx = $("#ctx");
let back: HTMLElement | null = null;

const ITEMS: ([string, string, () => void] | null)[] = [
  ["Open Terminal", "Ctrl+Alt+T", () => openApp("terminal")],
  ["Open Files", "", () => openApp("files", [])],
  ["System Monitor", "", () => openApp("monitor")],
  null,
  ["Change wallpaper", "", () => {
    settings.wall = WALLPAPERS[(WALLPAPERS.indexOf(settings.wall) + 1) % WALLPAPERS.length];
    applySettings(); toast("Wallpaper", settings.wall);
  }],
  ["Settings", "", () => openApp("settings")],
  null,
  ["About Shreshtha OS", "", () => toast("Shreshtha OS 26.11", "A portfolio by Shreshtha Soni, built as a tiny Linux desktop. No real kernel was harmed.")]
];

ctx.innerHTML = ITEMS.map((c, i) => c ? `<button type="button" role="menuitem" tabindex="-1" data-i="${i}">${c[0]}<span>${c[1]}</span></button>` : '<hr role="separator">').join("");
ctx.setAttribute("aria-label", "Desktop menu");
$$<HTMLButtonElement>("button", ctx).forEach(b => b.addEventListener("click", () => { closeMenu(false); ITEMS[+b.dataset.i!]![2](); }));

export function openMenu(x: number, y: number): void {
  back = document.activeElement as HTMLElement | null;
  ctx.hidden = false;
  ctx.style.left = Math.min(x, innerWidth - 220) + "px";
  ctx.style.top = Math.min(y, innerHeight - ctx.offsetHeight - 8) + "px";
  ($("button", ctx) as HTMLElement).focus();
}
export function closeMenu(restoreFocus = true): void {
  if (ctx.hidden) return;
  ctx.hidden = true;
  if (restoreFocus) back?.focus({ preventScroll: true });
}

ctx.addEventListener("keydown", e => {
  const items = $$<HTMLButtonElement>("button", ctx), i = items.indexOf(document.activeElement as HTMLButtonElement);
  const go = (n: number) => { e.preventDefault(); items[(n + items.length) % items.length].focus(); };
  if (e.key === "ArrowDown") go(i + 1);
  else if (e.key === "ArrowUp") go(i - 1);
  else if (e.key === "Home") go(0);
  else if (e.key === "End") go(items.length - 1);
  else if (e.key === "Escape" || e.key === "Tab") { e.preventDefault(); e.stopPropagation(); closeMenu(); }
});

desk.addEventListener("contextmenu", e => {
  if ((e.target as Element).closest(".win")) return;
  e.preventDefault();
  openMenu(e.clientX, e.clientY);
});
addEventListener("pointerdown", e => { if (!ctx.hidden && !(e.target as Element).closest("#ctx")) closeMenu(false); });
