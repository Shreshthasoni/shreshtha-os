/** Developer commands: git, gh (github). */
import { escText } from "../../../lib/dom";
import { gitLog } from "../../../lib/render";
import { FALLBACK_PINS, GITHUB_URL, GITHUB_USERNAME, profile } from "../../../data/profile";
import { openApp } from "../../registry";
import { register } from "../registry";

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
    name: "gh", usage: "gh", summary: "my GitHub profile", aliases: ["github"],
    description: "Opens the GitHub app. `gh repo list` lists repositories.",
    examples: ["gh", "gh repo list"],
    run(a) {
      if (a[0] === "repo" && a[1] === "list") return FALLBACK_PINS.map(p => `<span class="c-b">${GITHUB_USERNAME}/${p.name}</span>`.padEnd(40) + ` <span class="c-d">${escText(p.description)}</span>`).join("\n");
      openApp("github");
      return `<span class="c-w">${profile.name}</span> <span class="c-d">(${escText(GITHUB_USERNAME)})</span>\n<span class="c-acc">${GITHUB_URL}</span>\n<span class="c-d">opening GitHub… try: gh repo list</span>`;
    }
  }
);
