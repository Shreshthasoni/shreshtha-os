/** Desktop shortcuts, the big ASCII logo and its caption. */
import { $ } from "../lib/dom";
import { IC, type IconName } from "../lib/icons";
import { GITHUB_URL, profile } from "../data/profile";
import { openApp } from "../apps/registry";
import type { AppId } from "../apps/meta";

const ICONS: [string, IconName, AppId, unknown?][] = [
  ["Terminal", "term", "terminal"], ["Home", "dir", "files", []], ["projects", "dir", "files", ["projects"]],
  ["about.txt", "file", "editor", ["about.txt"]], ["resume.pdf", "pdf", "resume"], ["GitHub", "gh", "github"],
  ["Career.git", "git", "git"], ["Mail", "mail", "mail"]
];

const LOGO = [
  "███████╗██╗  ██╗██████╗ ███████╗███████╗██╗  ██╗████████╗██╗  ██╗ █████╗ ",
  "██╔════╝██║  ██║██╔══██╗██╔════╝██╔════╝██║  ██║╚══██╔══╝██║  ██║██╔══██╗",
  "███████╗███████║██████╔╝█████╗  ███████╗███████║   ██║   ███████║███████║",
  "╚════██║██╔══██║██╔══██╗██╔══╝  ╚════██║██╔══██║   ██║   ██╔══██║██╔══██║",
  "███████║██║  ██║██║  ██║███████╗███████║██║  ██║   ██║   ██║  ██║██║  ██║",
  "╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝",
  "                                                          ██████╗ ███████╗",
  "                                                         ██╔═══██╗██╔════╝",
  "                                                         ██║   ██║███████╗",
  "                                                         ██║   ██║╚════██║",
  "                                                         ╚██████╔╝███████║",
  "                                                          ╚═════╝ ╚══════╝"];

export function initDesktop(): void {
  const icons = $("#icons");
  ICONS.forEach(([n, ic, app, arg]) => {
    const b = document.createElement("button");
    b.className = "dicon"; b.type = "button";
    b.innerHTML = IC[ic] + `<span>${n}</span>`;
    b.addEventListener("click", () => openApp(app, arg));
    icons.appendChild(b);
  });
  $("#logo").textContent = LOGO.join("\n");
  $("#capgh").textContent = GITHUB_URL.replace("https://", "");
  $("#capline").textContent = `${profile.name} · ${profile.title.toLowerCase()} · ${profile.city}`;
}
