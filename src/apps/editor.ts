/** Editor: a read-only vim-style viewer for files in the virtual home folder. */
import { escText } from "../lib/dom";
import { hl } from "../fs/highlight";
import { pathStr, resolve } from "../fs/vfs";
import { makeWin, openOrFocus, type Win } from "../os/wm";
import { openApp } from "./registry";

export function open(parts: string[] = ["about.txt"]): Win | undefined | Promise<Win | undefined> {
  const { node } = resolve([], parts.join("/"));
  if (!node) return;
  if (node.type === "pdf") return openApp("resume");
  if (node.type === "dir") return openApp("files", parts);
  const name = parts[parts.length - 1], text = node.text(), n = text.split("\n").length;
  return openOrFocus("editor", parts.join("/"), () => makeWin({
    app: "editor", title: `vim ${pathStr(parts)}`, w: 620, h: 440,
    body: `<div class="ed"><div class="code"><div class="ln" aria-hidden="true">${Array.from({ length: n }, (_, i) => i + 1).join("\n")}</div><pre class="tx" tabindex="0" aria-label="${escText(name)} contents">${hl(text, name)}</pre></div><div class="status"><span>NORMAL · ${escText(name)} [readonly]</span><span>utf-8 · ${n}L · ${text.length}B</span></div></div>`
  }));
}
