/** About-me commands: neofetch, whoami, projects, experience, skills, contact, resume. */
import { isNarrow } from "../../../lib/dom";
import { GITHUB_URL, profile, uptime } from "../../../data/profile";
import { openApp } from "../../registry";
import { register } from "../registry";

const LOGO_SMALL = [
  "   ███████╗",
  "   ██╔════╝",
  "   ███████╗",
  "   ╚════██║",
  "   ███████║",
  "   ╚══════╝"];

export function neofetch(): string {
  const info = [
    `<span class="c-acc">shreshtha</span>@<span class="c-acc">os</span>`, `<span class="c-d">--------------</span>`,
    `<span class="c-y">OS</span>      Shreshtha OS 26.11 x86_64`,
    `<span class="c-y">Host</span>    ${profile.name.split(" ")[0]} (${profile.nick}) ${profile.name.split(" ").slice(1).join(" ")}`,
    `<span class="c-y">Kernel</span>  B.Tech CSE · ${profile.education.school} '${profile.education.gradYear.slice(2)}`,
    `<span class="c-y">Uptime</span>  ${uptime().long} (shipping)`,
    `<span class="c-y">Shell</span>   C++ · Java · Python · JavaScript`,
    `<span class="c-y">WM</span>      React · Next.js · Node · FastAPI`,
    `<span class="c-y">Infra</span>   AWS · Docker · SQL · Git`,
    `<span class="c-y">GitHub</span>  <span class="c-b">${GITHUB_URL.replace("https://", "")}</span>`,
    `<span class="c-y">Shipped</span> ${profile.projects.map(p => p.name.replace("School Management ERP", "School ERP")).join(" · ")}`,
    `<span class="c-y">Last job</span> Full-Stack Intern @ Tagshop.ai (Jun–Oct 2026)`,
    `<span class="c-y">Status</span>  <span class="c-acc">open to SDE internships</span>`, "",
    ["c-r", "c-y", "c-acc", "c-b", "c-m", "c-o"].map(c => `<span class="${c}">███</span>`).join("")];
  if (isNarrow()) return info.join("\n");
  return info.map((l, i) => `<span class="c-acc">${(LOGO_SMALL[i] || "").padEnd(13)}</span>${l}`).join("\n");
}

register(
  {
    name: "neofetch", usage: "neofetch", summary: "system info (it's me)",
    description: "Prints a system-info card, except the system is Shreshtha: education, languages, stack, what's shipped and current status.",
    run: () => neofetch()
  },
  {
    name: "whoami", usage: "whoami", summary: "short intro",
    description: "A one-paragraph introduction.",
    run: () => `<span class="c-acc">shreshtha</span> (${profile.nick}). ${profile.about[0]}`
  },
  {
    name: "projects", usage: "projects", summary: "what I've shipped",
    description: "Lists shipped projects with their status and stack. Each one also has a README under ~/projects.",
    examples: ["projects", "projects | grep AWS"],
    run: () => profile.projects.map(p => `<span class="c-acc">●</span> <span class="c-w">${p.name}</span> <span class="c-y">[${p.status}]</span>\n  ${p.tagline}\n  <span class="c-d">${p.stack.join(" · ")}</span>`).join("\n\n") + `\n\n<span class="c-d">details: cd projects &amp;&amp; ls, or: open projects</span>`
  },
  {
    name: "experience", usage: "experience", summary: "where I've worked",
    description: "Work history, newest first. Full details are in ~/experience.",
    run: () => profile.work.map(x => `<span class="c-y">${x.when.padEnd(20)}</span> <span class="c-w">${x.role}</span>\n${"".padEnd(21)}<span class="c-d">${x.org}</span>`).join("\n")
  },
  {
    name: "skills", usage: "skills", summary: "skill meters",
    description: "Self-assessed skill meters. For the full list of tools, run `cat skills.json`.",
    examples: ["skills", "skills | sort"],
    run: () => Object.entries(profile.skillMeters).map(([k, v]) => `${k.padEnd(18)} <span class="c-acc">${"█".repeat(Math.round(v / 5))}</span><span class="c-d">${"░".repeat(20 - Math.round(v / 5))}</span> ${v}%`).join("\n") + '\n<span class="c-d">self-assessed. machine learning is the one growing fastest.</span>'
  },
  {
    name: "contact", usage: "contact", summary: "how to reach me",
    description: "Email, phone, LinkedIn, GitHub and location. `mail` opens a message window.",
    run: () => {
      const c = profile.contact;
      return `<span class="c-y">email</span>    ${c.email}\n<span class="c-y">phone</span>    ${c.phoneDisplay}\n<span class="c-y">linkedin</span> https://${c.linkedin}\n<span class="c-y">github</span>   https://${c.github}\n<span class="c-y">where</span>    ${c.place}\n<span class="c-d">try: mail · gh</span>`;
    }
  },
  {
    name: "resume", usage: "resume", summary: "open resume.pdf",
    description: "Opens the Resume window, with a link to the PDF. A plain, printable version lives at /resume.",
    run: () => { openApp("resume"); return `<span class="c-d">opening resume.pdf…</span>`; }
  }
);
