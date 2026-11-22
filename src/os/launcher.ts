/** App launcher (the ● shreshtha-os button, or Alt+L): search apps and files. */
import { $, escText, trapTab } from "../lib/dom";
import { IC, type IconName } from "../lib/icons";
import { APP_IDS, APP_META, type AppId } from "../apps/meta";
import { openApp } from "../apps/registry";
import { profile } from "../data/profile";
import { slug } from "../fs/vfs";

const launch = $("#launch"), lq = $<HTMLInputElement>("#lq"), appsEl = $("#apps");
let back: HTMLElement | null = null;

const ENTRIES: { n: string; ic: IconName; app: AppId; arg?: unknown }[] = [
  ...APP_IDS.map(k => ({ n: APP_META[k].name, ic: APP_META[k].icon as IconName, app: k })),
  { n: "about.txt", ic: "file", app: "editor", arg: ["about.txt"] },
  { n: "skills.json", ic: "file", app: "editor", arg: ["skills.json"] },
  { n: "contact.vcf", ic: "file", app: "editor", arg: ["contact.vcf"] },
  ...profile.projects.map(p => ({ n: p.name, ic: "dir" as IconName, app: "editor" as AppId, arg: ["projects", slug(p.name), "README.md"] })),
  ...profile.work.map(x => ({ n: x.short, ic: "file" as IconName, app: "editor" as AppId, arg: ["experience", slug(x.short) + ".md"] }))
];

function render(): void {
  const q = lq.value.toLowerCase();
  appsEl.innerHTML = "";
  ENTRIES.filter(e => e.n.toLowerCase().includes(q)).forEach(e => {
    const b = document.createElement("button");
    b.type = "button";
    b.innerHTML = IC[e.ic] + `<span>${escText(e.n)}</span>`;
    b.addEventListener("click", () => { hideLauncher(false); openApp(e.app, e.arg); });
    appsEl.appendChild(b);
  });
}

export function showLauncher(): void {
  back = document.activeElement as HTMLElement | null;
  launch.hidden = false; lq.value = ""; render(); lq.focus();
  $("#brand").setAttribute("aria-expanded", "true");
}
export function hideLauncher(restoreFocus = true): void {
  if (launch.hidden) return;
  launch.hidden = true;
  $("#brand").setAttribute("aria-expanded", "false");
  if (restoreFocus) back?.focus({ preventScroll: true });
}
export const toggleLauncher = () => (launch.hidden ? showLauncher() : hideLauncher());
export const launcherOpen = () => !launch.hidden;

lq.addEventListener("input", render);
lq.addEventListener("keydown", e => { if (e.key === "Enter") appsEl.querySelector("button")?.click(); });
launch.addEventListener("click", e => { if (e.target === launch || (e.target as Element).classList.contains("lwrap")) hideLauncher(); });
launch.addEventListener("keydown", e => {
  trapTab(e, launch);
  if (e.key === "Escape") { e.stopPropagation(); hideLauncher(); }
});
