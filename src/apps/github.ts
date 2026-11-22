/** GitHub: profile page for GITHUB_USERNAME with live repositories from the GitHub API. */
import { $, esc, escText } from "../lib/dom";
import { GITHUB_URL, GITHUB_USERNAME, profile } from "../data/profile";
import { ago, fallbackRepos, getRepos, pinnable, sourceNote, type Repo } from "../services/github";
import { makeWin, openOrFocus, type Win } from "../os/wm";

const bold = (s: string) => escText(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");

const pinCard = (r: Repo) =>
  `<a class="pin" href="${esc(r.url)}" target="_blank" rel="noopener"><b>${escText(r.name)}</b><span class="d">${escText(r.description || "No description yet.")}</span><span class="lang">${r.language ? `<i style="background:${esc(r.color)}"></i>${escText(r.language)}` : ""}${r.updated ? `<span class="upd">updated ${ago(r.updated)}</span>` : ""}</span></a>`;

export function open(): Win {
  return openOrFocus("github", "gh", () => {
    const c = profile.contact, r = profile.githubReadme;
    const w = makeWin({
      app: "github", title: "GitHub — " + GITHUB_USERNAME, w: 820, h: 560, body: `<div class="gh">
      <div class="gh-side"><div class="av" aria-hidden="true">${profile.initials}</div><h2>${profile.name}</h2><div class="handle">${escText(GITHUB_USERNAME)}</div>
        <p>${profile.title}. I build products and ship them to real users.</p>
        <a class="btn solid" href="${GITHUB_URL}" target="_blank" rel="noopener">Open GitHub profile</a><button class="btn ghcopy" type="button">Copy link</button>
        <div class="meta"><span>loc  <b>${profile.location}</b></span><span>edu  <b>B.Tech CSE, JECRC '${profile.education.gradYear.slice(2)}</b></span><span>mail <b>${c.email}</b></span><span>in   <a href="https://${c.linkedin}" target="_blank" rel="noopener">${c.linkedin}</a></span></div>
      </div>
      <div>
        <div class="gh-readme"><div class="fn">${escText(GITHUB_USERNAME)} / README.md</div><h3>${escText(r.heading)}</h3>
          <p>${bold(r.body)}</p>
          <p class="c-d">${escText(r.currently)}</p>
          <div class="chips">${r.chips.map(x => `<span>${escText(x)}</span>`).join("")}</div></div>
        <p class="gh-h">Repositories</p>
        <div class="pins" aria-live="polite" aria-busy="true"><p class="c-d">Loading repositories from GitHub…</p></div>
        <p class="c-d gh-note"></p>
      </div></div>`
    });
    $(".ghcopy", w.body).addEventListener("click", async e => {
      const b = e.currentTarget as HTMLButtonElement;
      try { await navigator.clipboard.writeText(GITHUB_URL); b.textContent = "Copied"; } catch { b.textContent = GITHUB_URL; }
      setTimeout(() => { b.textContent = "Copy link"; }, 1800);
    });

    const pins = $(".pins", w.body), note = $(".gh-note", w.body);
    getRepos().then(res => {
      if (!w.el.isConnected) return;
      let list = res.source === "fallback" ? res.repos : pinnable(res.repos), text = sourceNote(res);
      if (!list.length) {
        list = fallbackRepos();
        text = `No public repositories on GitHub yet, so these are the projects from this portfolio. The links open the GitHub profile.`;
      }
      pins.innerHTML = list.map(pinCard).join("");
      pins.setAttribute("aria-busy", "false");
      const more = res.source !== "fallback" && res.repos.length > list.length ? ` <a href="${GITHUB_URL}?tab=repositories" target="_blank" rel="noopener">All ${res.repos.length} repositories</a>` : "";
      note.innerHTML = escText(text) + more;
    });
    return w;
  });
}
