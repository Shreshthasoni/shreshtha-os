/** Tiny syntax highlighter for the editor and `cat`: markdown-ish, JSON and vCard. Returns HTML. */
import { escText } from "../lib/dom";

export function hl(text: string, name: string): string {
  const lines = escText(text).split("\n");
  if (name.endsWith(".json")) {
    return lines.map(l => l
      .replace(/(&quot;|")([^"]*)("(?=\s*:))/g, '<span class="kw">"$2"</span>')
      .replace(/:\s(\[.*)/, (_m, a: string) => ": " + a.replace(/"([^"]*)"/g, '<span class="str">"$1"</span>'))).join("\n");
  }
  if (name.endsWith(".vcf")) return lines.map(l => l.replace(/^([A-Z:0-9.]+?):/, '<span class="kw">$1</span>:')).join("\n");
  return lines.map(l =>
    l.startsWith("## ") ? `<span class="h2">${l}</span>`
    : l.startsWith("# ") ? `<span class="h1">${l}</span>`
    : l.startsWith("- ") ? `<span class="li">-</span>${l.slice(1)}`
    : /^link: https?:\/\//.test(l) ? l.replace(/^link: (\S+)/, '<span class="kw">link:</span> <a href="$1" target="_blank" rel="noopener">$1</a>')
    : /^(status|stack):/.test(l) ? l.replace(/^(\w+):/, '<span class="kw">$1:</span>')
    : l).join("\n");
}
