/** Recent apps (phones): a full-screen list of open windows. Tap to switch, × to close. */
import { $, escText, trapTab } from "../lib/dom";
import { IC } from "../lib/icons";
import { APP_META } from "../apps/meta";
import { WINS, closeWin, showWin, isHidden } from "./wm";

const sw = $("#switcher");
let back: HTMLElement | null = null;

/** A short text preview of a window's contents (spaces between elements, so words don't run together). */
function peek(body: HTMLElement): string {
  const c = body.cloneNode(true) as HTMLElement;
  c.querySelectorAll("svg, input, textarea, .ln, .meters").forEach(e => e.remove());
  c.querySelectorAll("*").forEach(e => e.append(" "));
  return (c.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 160);
}

function render(): void {
  const wins = [...WINS].sort((a, b) => +b.el.style.zIndex - +a.el.style.zIndex);
  const list = $(".sw-list", sw);
  list.innerHTML = wins.length ? "" : '<p class="sw-empty">No apps open. Pick one from the dock.</p>';
  wins.forEach(w => {
    const card = document.createElement("div");
    card.className = "sw-card" + (isHidden(w) ? "" : " cur");
        card.innerHTML = `<button type="button" class="sw-open">${IC[APP_META[w.app].icon]}<span><b>${escText(w.title)}</b><small>${escText(peek(w.body))}</small></span></button><button type="button" class="sw-x" aria-label="Close ${escText(w.title)}">×</button>`;
    $(".sw-open", card).addEventListener("click", () => { closeSwitcher(false); showWin(w); });
    $(".sw-x", card).addEventListener("click", () => { closeWin(w); render(); ($(".sw-open", sw) ?? $(".sw-done", sw)).focus(); });
    list.appendChild(card);
  });
  $(".sw-all", sw).hidden = !wins.length;
}

export function openSwitcher(): void {
  back = document.activeElement as HTMLElement | null;
  render(); sw.hidden = false;
  ($(".sw-open", sw) ?? $(".sw-done", sw)).focus();
}
export function closeSwitcher(restoreFocus = true): void {
  if (sw.hidden) return;
  sw.hidden = true;
  if (restoreFocus) back?.focus({ preventScroll: true });
}

$(".sw-done", sw).addEventListener("click", () => closeSwitcher());
$(".sw-all", sw).addEventListener("click", () => { [...WINS].forEach(closeWin); render(); $(".sw-done", sw).focus(); });
sw.addEventListener("click", e => { if (e.target === sw) closeSwitcher(); });
sw.addEventListener("keydown", e => { trapTab(e, sw); if (e.key === "Escape") { e.stopPropagation(); closeSwitcher(); } });
