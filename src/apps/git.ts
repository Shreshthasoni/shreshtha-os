/** Career.git: career history as a git log. */
import { gitLog } from "../lib/render";
import { makeWin, openOrFocus, type Win } from "../os/wm";

export function open(): Win {
  return openOrFocus("git", "git", () => makeWin({
    app: "git", title: "Career.git — git log --graph", w: 640, h: 380,
    body: `<div class="term"><pre tabindex="0"><span class="c-acc">shreshtha@os</span>:<span class="c-b">~/career</span>$ git log --graph --oneline\n${gitLog()}</pre></div>`
  }));
}
