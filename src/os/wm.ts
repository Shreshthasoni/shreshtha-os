/**
 * Window manager: creating, focusing, dragging, resizing, minimising, maximising and closing
 * windows, plus the four workspaces. On phones (narrow screens) only one app is visible at a time.
 */
import { APP_META, type AppId } from "../apps/meta";
import { IC } from "../lib/icons";
import { $, isNarrow } from "../lib/dom";

export interface Win {
  el: HTMLElement;
  app: AppId;
  title: string;
  ws: number;
  body: HTMLElement;
  key?: string;
  prev?: [string, string, string, string];
  onFocus?: () => void;
  onClose?: () => void;
  setTitle(t: string): void;
  /** Files app: navigate to a folder. */
  go?: (parts: string[]) => void;
}

export interface WinOpts {
  app: AppId;
  title: string;
  w?: number;
  h?: number;
  x?: number;
  y?: number;
  body?: string | HTMLElement;
}

export const desk = $("#desk");
export const WINS = new Set<Win>();
export const wm = { ws: 1 };
let Z = 20;

const listeners = new Set<() => void>();
/** Subscribe to any change in windows (open, close, focus, minimise, workspace). */
export const onWmChange = (fn: () => void) => { listeners.add(fn); };
const changed = () => listeners.forEach(f => f());

export const isHidden = (w: Win) => w.el.classList.contains("hide");
export const focused = (): Win | undefined => [...WINS].find(w => w.el.classList.contains("focus") && !isHidden(w));
/** Visible windows on the current workspace, topmost first. */
export const stack = (): Win[] => [...WINS].filter(w => w.ws === wm.ws && !isHidden(w)).sort((a, b) => +b.el.style.zIndex - +a.el.style.zIndex);

/** Bring a window to the front. `moveFocus` also moves keyboard focus into it. */
export function focusWin(w: Win, moveFocus = false): void {
  WINS.forEach(x => x.el.classList.remove("focus"));
  w.el.classList.add("focus");
  w.el.style.zIndex = String(++Z);
  if (w.onFocus) w.onFocus();
  else if (moveFocus && !w.el.contains(document.activeElement)) w.el.focus({ preventScroll: true });
  changed();
}

/** Un-minimise, switch to its workspace if needed, and focus. */
export function showWin(w: Win): void {
  if (w.ws !== wm.ws) switchWS(w.ws);
  w.el.classList.remove("hide");
  focusWin(w, true);
}

export function makeWin({ app, title, w = 640, h = 420, x, y, body }: WinOpts): Win {
  const el = document.createElement("section");
  el.className = "win";
  el.tabIndex = -1;
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", title);
  const DW = desk.clientWidth, DH = desk.clientHeight - 70;
  w = Math.min(w, DW - 20); h = Math.min(h, DH - 10);
  const n = WINS.size;
  el.style.width = w + "px"; el.style.height = h + "px";
  el.style.left = (x ?? Math.max(10, Math.min(DW - w - 10, 130 + (n % 6) * 36))) + "px";
  el.style.top = (y ?? Math.max(10, Math.min(DH - h, 20 + (n % 6) * 30))) + "px";
  el.innerHTML = `<div class="tbar" tabindex="0">${IC[APP_META[app].icon]}<b></b><div class="wb"><button type="button" aria-label="Minimise">–</button><button type="button" aria-label="Maximise">□</button><button type="button" class="x" aria-label="Close">×</button></div></div><div class="wbody"></div><div class="grip" aria-hidden="true"></div>`;
  const tbar = $(".tbar", el);
  const win: Win = {
    el, app, title, ws: wm.ws, body: $(".wbody", el),
    setTitle(t) {
      win.title = t;
      $(".tbar b", el).textContent = t;
      el.setAttribute("aria-label", t);
      tbar.setAttribute("aria-label", `${t}. Arrow keys move the window, Shift+arrow keys resize it, Enter maximises.`);
      changed();
    }
  };
  win.setTitle(title);
  if (typeof body === "string") win.body.innerHTML = body; else if (body) win.body.appendChild(body);
  const [bMin, bMax, bX] = el.querySelectorAll<HTMLButtonElement>(".wb button");
  bX.addEventListener("click", () => closeWin(win));
  bMin.addEventListener("click", () => minimise(win));
  bMax.addEventListener("click", () => toggleMax(win));
  tbar.addEventListener("dblclick", e => { if (!(e.target as Element).closest("button")) toggleMax(win); });
  tbar.addEventListener("keydown", e => keyMove(e, win));
  el.addEventListener("pointerdown", () => focusWin(win));
  el.addEventListener("focusin", () => { if (!el.classList.contains("focus")) focusWin(win); });
  dragify(win); resizable(win);
  desk.appendChild(el); WINS.add(win); focusWin(win, true);
  return win;
}

/** After a window goes away, give keyboard focus to the next one (or the dock). */
function refocus(hadFocus: boolean): void {
  const next = stack()[0];
  if (next) { if (hadFocus) focusWin(next, true); }
  else if (hadFocus) ($("#dock button") as HTMLElement | null)?.focus();
}

export function closeWin(win: Win): void {
  const had = win.el.contains(document.activeElement);
  win.onClose?.();
  win.el.remove(); WINS.delete(win);
  refocus(had); changed();
}

export function minimise(win: Win): void {
  const had = win.el.contains(document.activeElement);
  win.el.classList.add("hide"); win.el.classList.remove("focus");
  refocus(had); changed();
}

export function toggleMax(win: Win): void {
  const el = win.el;
  if (el.classList.toggle("max")) {
    win.prev = [el.style.left, el.style.top, el.style.width, el.style.height];
    Object.assign(el.style, { left: "0px", top: "0px", width: desk.clientWidth + "px", height: (desk.clientHeight - 64) + "px" });
  } else if (win.prev) [el.style.left, el.style.top, el.style.width, el.style.height] = win.prev;
}

function clampPos(win: Win, l: number, t: number): void {
  win.el.style.left = Math.max(-win.el.offsetWidth + 100, Math.min(desk.clientWidth - 100, l)) + "px";
  win.el.style.top = Math.max(0, Math.min(desk.clientHeight - 40, t)) + "px";
}

/** Keyboard move/resize from the focused title bar. */
function keyMove(e: KeyboardEvent, win: Win): void {
  if (e.target !== e.currentTarget) return;
  if (e.key === "Enter") { e.preventDefault(); toggleMax(win); return; }
  const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
  if (!d || isNarrow() || win.el.classList.contains("max")) return;
  e.preventDefault();
  const step = 20, el = win.el;
  if (e.shiftKey) {
    el.style.width = Math.max(280, el.offsetWidth + d[0] * step) + "px";
    el.style.height = Math.max(160, el.offsetHeight + d[1] * step) + "px";
  } else clampPos(win, el.offsetLeft + d[0] * step, el.offsetTop + d[1] * step);
}

function dragify(win: Win): void {
  const tb = $(".tbar", win.el);
  let s: { x: number; y: number; l: number; t: number } | null = null;
  tb.addEventListener("pointerdown", e => {
    if ((e.target as Element).closest("button") || isNarrow() || win.el.classList.contains("max")) return;
    s = { x: e.clientX, y: e.clientY, l: win.el.offsetLeft, t: win.el.offsetTop };
    tb.setPointerCapture(e.pointerId);
  });
  tb.addEventListener("pointermove", e => { if (s) clampPos(win, s.l + e.clientX - s.x, s.t + e.clientY - s.y); });
  tb.addEventListener("pointerup", () => { s = null; });
}

function resizable(win: Win): void {
  const g = $(".grip", win.el);
  let s: { x: number; y: number; w: number; h: number } | null = null;
  g.addEventListener("pointerdown", e => {
    e.stopPropagation();
    s = { x: e.clientX, y: e.clientY, w: win.el.offsetWidth, h: win.el.offsetHeight };
    g.setPointerCapture(e.pointerId); focusWin(win);
  });
  g.addEventListener("pointermove", e => {
    if (!s) return;
    win.el.style.width = Math.max(280, s.w + e.clientX - s.x) + "px";
    win.el.style.height = Math.max(160, s.h + e.clientY - s.y) + "px";
  });
  g.addEventListener("pointerup", () => { s = null; });
}

/** Focus the existing window for (app, key), or create one with `make`. */
export function openOrFocus(app: AppId, key: string, make: () => Win): Win {
  const ex = [...WINS].find(w => w.app === app && w.key === key);
  if (ex) { showWin(ex); return ex; }
  const w = make(); w.key = key;
  return w;
}

export function switchWS(n: number): void {
  wm.ws = n;
  WINS.forEach(w => { w.el.style.display = w.ws === n ? "" : "none"; });
  changed();
}

/** Alt+`: bring the bottom-most window of this workspace to the front. */
export function cycleWindows(): void {
  const all = [...WINS].filter(w => w.ws === wm.ws);
  if (!all.length) return;
  const visible = stack();
  const target = visible.length > 1 ? visible[visible.length - 1] : all.find(w => isHidden(w)) ?? visible[0];
  showWin(target);
}
