/** Mail: composes a message and hands it to the visitor's own mail app (mailto:). Nothing is sent from the page. */
import { $, esc } from "../lib/dom";
import { profile } from "../data/profile";
import { wireCopy } from "../lib/render";
import { makeWin, openOrFocus, type Win } from "../os/wm";
import { toast } from "../os/toast";

export function open(): Win {
  return openOrFocus("mail", "mail", () => {
    const c = profile.contact;
    const w = makeWin({
      app: "mail", title: "Mail — new message", w: 540, h: 470,
      body: `<div class="doc"><h2>Write to Shreshtha</h2><p class="sub">Your message opens in your own mail app. Nothing is sent from this page.</p>
      <form class="form"><label>To<input value="${esc(c.email)}" readonly name="to"></label><label>Subject<input name="subject" value="Internship opportunity"></label><label>Message<textarea name="msg">Hi Shreshtha,\n\n</textarea></label>
      <div><button class="btn solid" type="submit">Open in mail app</button><button class="btn copy" type="button">Copy email</button></div></form>
      <p class="sub" style="margin-top:12px">Or: <a href="https://${c.linkedin}" target="_blank" rel="noopener">${c.linkedin}</a> · <a href="https://${c.github}" target="_blank" rel="noopener">${c.github}</a></p></div>`
    });
    wireCopy(w.body);
    const form = $<HTMLFormElement>("form", w.body);
    form.addEventListener("submit", e => {
      e.preventDefault();
      const s = encodeURIComponent(form.subject.value), b = encodeURIComponent(form.msg.value);
      location.href = `mailto:${c.email}?subject=${s}&body=${b}`;
      toast("Mail", "Opening your mail app. If nothing happens, use Copy email.");
    });
    return w;
  });
}
