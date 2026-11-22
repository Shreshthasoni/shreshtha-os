/** HTML snippets built from profile.ts that more than one app (or the terminal) uses. */
import { esc, escText } from "./dom";
import { COMMITS, profile } from "../data/profile";

/** `git log --graph --oneline` of the career commits. */
export const gitLog = () => COMMITS.map(([h, d, m, r], i) =>
  `<span class="c-y">* ${h}</span>${r ? ` <span class="c-acc">(${r})</span>` : ""} ${escText(m)} <span class="c-d">— ${d}</span>${i < COMMITS.length - 1 ? '\n<span class="c-m">|</span>' : ""}`).join("\n");

/** Profile photo for a round avatar; the initials stay underneath in case the image fails to load. */
export const avatarImg = () => profile.photo
  ? `${profile.initials}<img src="${profile.photo}" alt="" width="400" height="400" decoding="async" onerror="this.remove()">`
  : profile.initials;

/** Experience entries for the Resume window. */
export const workHtml = () => profile.work.map(w =>
  `<div class="it"><div class="ih"><h3>${esc(w.role)}</h3><span class="when">${esc(w.when)}</span></div><p class="org">${esc(w.org)}</p><ul>${w.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul></div>`).join("");

/** Wire up every not-yet-wired "Copy email" button inside `root`. */
export function wireCopy(root: ParentNode): void {
  root.querySelectorAll<HTMLButtonElement>(".copy").forEach(b => {
    if (b.dataset.w) return;
    b.dataset.w = "1";
    b.addEventListener("click", async () => {
      const t = b.textContent;
      try { await navigator.clipboard.writeText(profile.contact.email); b.textContent = "Copied"; }
      catch { b.textContent = "Copy failed, select it above"; }
      setTimeout(() => { b.textContent = t; }, 1600);
    });
  });
}
