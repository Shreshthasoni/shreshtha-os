/** Resume: experience summary with a link to the PDF. */
import { profile } from "../data/profile";
import { workHtml, wireCopy } from "../lib/render";
import { makeWin, openOrFocus, type Win } from "../os/wm";

export function open(): Win {
  return openOrFocus("resume", "cv", () => {
    const w = makeWin({
      app: "resume", title: "resume.pdf", w: 560, h: 460,
      body: `<div class="doc"><h2>${profile.name}</h2><p class="sub">${profile.title} · B.Tech CSE, ${profile.education.school} (2024 to 2028) · ${profile.city}</p><div>${workHtml()}</div><p><a class="btn solid" href="/resume.pdf" target="_blank" rel="noopener">Open resume.pdf</a><button class="btn copy" type="button">Copy email</button></p></div>`
    });
    wireCopy(w.body);
    return w;
  });
}
