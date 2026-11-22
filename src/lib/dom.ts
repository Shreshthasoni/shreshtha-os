/** Small DOM and storage helpers shared by the whole app. */

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T => root.querySelector(sel) as T;
export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] => [...root.querySelectorAll<T>(sel)];

const ENT: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
/** Escape for HTML text and attribute values. */
export const esc = (s: unknown): string => String(s).replace(/[&<>"]/g, c => ENT[c]);
/** Escape for HTML text only (keeps quotes, which the syntax highlighter relies on). */
export const escText = (s: unknown): string => String(s).replace(/[&<>]/g, c => ENT[c]);

/** Plain text of an HTML string (used to pipe terminal output between commands). */
export function htmlToText(html: string): string {
  const d = document.createElement("div");
  d.innerHTML = html;
  return d.textContent ?? "";
}

export const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const isNarrow = (): boolean => innerWidth < 760;

/** localStorage wrapper: every key is prefixed with "sos-" and failures are swallowed. */
export const store = {
  get<T>(k: string, d: T): T {
    try { const v = localStorage.getItem("sos-" + k); return v === null ? d : JSON.parse(v) as T; } catch { return d; }
  },
  set(k: string, v: unknown): void {
    try { localStorage.setItem("sos-" + k, JSON.stringify(v)); } catch { /* private mode or quota */ }
  }
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
export const focusables = (root: ParentNode): HTMLElement[] =>
  $$<HTMLElement>(FOCUSABLE, root).filter(el => el.offsetParent !== null || el === document.activeElement);

/** Keep Tab / Shift+Tab inside `root` (for modal overlays). Call from a keydown handler. */
export function trapTab(e: KeyboardEvent, root: HTMLElement): void {
  if (e.key !== "Tab") return;
  const f = focusables(root);
  if (!f.length) { e.preventDefault(); return; }
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
}

export const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
