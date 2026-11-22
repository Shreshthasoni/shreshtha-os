/** Developer commands: git, gh (github). `gh repo list` and `gh repo view` use live GitHub data. */
import { esc, escText } from "../../../lib/dom";
import { gitLog } from "../../../lib/render";
import { GITHUB_URL, GITHUB_USERNAME, profile, projectLinks } from "../../../data/profile";
import { ago, getReadme, getRepos, sourceNote } from "../../../services/github";
import { openApp } from "../../registry";
import { register } from "../registry";

const note = (s: string) => `<span class="c-d">${escText(s)}</span>`;

const privates = () => profile.projects.filter(p => p.privateCode);
const privateNote = () => privates().length
  ? "\n\n" + privates().map(p => `<span class="c-y">🔒 ${escText(p.name)}</span>  <span class="c-d">${escText(p.privateCode!)}. ${escText(p.tagline)}.</span>`).join("\n")
  : "";

async function repoList(): Promise<string> {
  const res = await getRepos();
  if (!res.repos.length) return note(`No public repositories on ${GITHUB_URL.replace("https://", "")} yet. Try: projects`);
  const width = Math.min(40, Math.max(...res.repos.map(r => GITHUB_USERNAME.length + 1 + r.name.length)) + 2);
  return res.repos.map(r => {
    const full = `${GITHUB_USERNAME}/${r.name}`;
    const tags = [r.fork && "fork", r.archived && "archived"].filter(Boolean).join(", ");
    return `<span class="c-b">${escText(full)}</span>${" ".repeat(Math.max(1, width - full.length))}<span class="c-d">${escText(r.description || "—")}</span>${tags ? ` <span class="c-y">(${tags})</span>` : ""}`;
  }).join("\n") + privateNote() + "\n\n" + note(sourceNote(res) + " Try: gh repo view <name>");
}

async function repoView(name: string | undefined, web: boolean): Promise<string> {
  if (!name) return "usage: gh repo view &lt;name&gt; [--web]";
  const res = await getRepos();
  const repo = res.repos.find(r => r.name.toLowerCase() === name.toLowerCase());
  const words = (t: string) => t.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const priv = privates().find(p => { const q = words(name), n = words(p.name); return q.length > 0 && q.every(w => n.includes(w)); });
  if (!repo && priv) {
    const links = projectLinks(priv);
    return [`<span class="c-y">${"name".padEnd(12)}</span>${escText(priv.name)}`, `<span class="c-y">${"visibility".padEnd(12)}</span>🔒 ${escText(priv.privateCode!)}`,
      `<span class="c-y">${"about".padEnd(12)}</span>${escText(priv.tagline)}`, `<span class="c-y">${"stack".padEnd(12)}</span>${escText(priv.stack.join(", "))}`,
      ...links.map(l => `<span class="c-y">${"live".padEnd(12)}</span><a href="${esc(l.url)}" target="_blank" rel="noopener">${escText(l.label)}</a>`)].join("\n") +
      "\n\n" + note("The code is private, so there's no repo page to open. More: cat projects/" + priv.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "/README.md");
  }
  if (!repo) {
    const names = res.repos.map(r => r.name).join(", ");
    return `<span class="c-r">GraphQL: Could not resolve to a Repository with the name '${escText(GITHUB_USERNAME)}/${escText(name)}'.</span>\n` + note(names ? `repos: ${names}` : sourceNote(res));
  }
  if (web) { window.open(repo.url, "_blank", "noopener"); return note(`Opening ${repo.url} in your browser.`); }
  const rows: [string, string][] = [
    ["name", `${GITHUB_USERNAME}/${repo.name}`],
    ["description", repo.description || "—"],
    ...(repo.language ? [["language", repo.language] as [string, string]] : []),
    ...(repo.topics.length ? [["topics", repo.topics.join(", ")] as [string, string]] : []),
    ...(repo.updated ? [["updated", ago(repo.updated)] as [string, string]] : []),
    ...(repo.homepage ? [["homepage", repo.homepage] as [string, string]] : [])
  ];
  let outp = rows.map(([k, v]) => `<span class="c-y">${k.padEnd(12)}</span>${escText(v)}`).join("\n") +
    `\n<span class="c-y">${"url".padEnd(12)}</span><a href="${esc(repo.url)}" target="_blank" rel="noopener">${escText(repo.url)}</a>`;
  if (res.source !== "fallback") {
    const readme = await getReadme(repo.name);
    if (readme) {
      const lines = readme.replace(/\r/g, "").split("\n");
      outp += "\n\n" + note("--- README.md ---") + "\n" + escText(lines.slice(0, 25).join("\n")) + (lines.length > 25 ? "\n" + note(`… ${lines.length - 25} more lines. gh repo view ${repo.name} --web`) : "");
    } else outp += "\n\n" + note("This repository has no README.");
  } else outp += "\n\n" + note(sourceNote(res));
  return outp;
}

register(
  {
    name: "git", usage: "git log | status | remote", summary: "career as commits",
    description: "`git log` shows the career history as a commit graph, `git status` the working tree, `git remote` the GitHub origin.",
    examples: ["git log", "git status", "git log | grep feat"],
    run: a => a[0] === "remote" ? `origin  ${GITHUB_URL}.git (fetch)\norigin  ${GITHUB_URL}.git (push)`
      : a[0] === "log" ? gitLog()
      : a[0] === "status" ? "On branch main\nYour career is ahead of 'origin/college' by 3 shipped products.\n\nnothing to commit, working tree clean"
      : "git: try 'git log' or 'git status'"
  },
  {
    name: "gh", usage: "gh [repo list | repo view <name>]", summary: "my GitHub profile", aliases: ["github"],
    description: "With no arguments, opens the GitHub app. `gh repo list` lists public repositories and `gh repo view <name>` shows one (with the start of its README); add --web to open it on github.com. Data comes live from the GitHub API and is cached for an hour.",
    examples: ["gh", "gh repo list", "gh repo view shreshtha-os", "gh repo view shreshtha-os --web", "gh repo list | grep -i erp"],
    run(a) {
      if (a[0] === "repo" && a[1] === "list") return repoList();
      if (a[0] === "repo" && a[1] === "view") return repoView(a.slice(2).find(x => !x.startsWith("-")), a.includes("--web") || a.includes("-w"));
      openApp("github");
      return `<span class="c-w">${profile.name}</span> <span class="c-d">(${escText(GITHUB_USERNAME)})</span>\n<span class="c-acc">${GITHUB_URL}</span>\n<span class="c-d">opening GitHub… try: gh repo list</span>`;
    }
  }
);
