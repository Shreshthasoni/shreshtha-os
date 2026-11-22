/** GitHub: a profile page for GITHUB_USERNAME. */
import { $, escText } from "../lib/dom";
import { FALLBACK_PINS, GITHUB_URL, GITHUB_USERNAME, profile } from "../data/profile";
import { makeWin, openOrFocus, type Win } from "../os/wm";

const bold = (s: string) => escText(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");

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
        <p class="gh-h">Pinned projects</p>
        <div class="pins">${FALLBACK_PINS.map(p => `<a class="pin" href="${GITHUB_URL}" target="_blank" rel="noopener"><b>${p.name}</b><span class="d">${escText(p.description)}</span><span class="lang"><i style="background:${p.color}"></i>${p.language}</span></a>`).join("")}</div>
        <p class="c-d gh-note">Live GitHub data can't load inside this page. The buttons open the real profile.</p>
      </div></div>`
    });
    $(".ghcopy", w.body).addEventListener("click", async e => {
      const b = e.currentTarget as HTMLButtonElement;
      try { await navigator.clipboard.writeText(GITHUB_URL); b.textContent = "Copied"; } catch { b.textContent = GITHUB_URL; }
      setTimeout(() => { b.textContent = "Copy link"; }, 1800);
    });
    return w;
  });
}
