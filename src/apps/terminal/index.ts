/** Terminal: the shell window. Commands live in ./commands and register themselves. */
import { $, escText, htmlToText, store } from "../../lib/dom";
import { pathStr, resolve } from "../../fs/vfs";
import { makeWin, type Win } from "../../os/wm";
import { commandNames, getCommand, type Ctx, type Output } from "./registry";
import { neofetch } from "./commands/info";
import "./commands/fs";
import "./commands/dev";
import "./commands/system";
import "./commands/text";
import "./commands/fun";

export interface TermOpts { intro?: boolean; w?: number; h?: number; x?: number; y?: number }

/**
 * Split a command line into pipeline stages of words. Handles "double" and 'single' quotes,
 * so `grep "full stack"` is one argument and a | inside quotes is not a pipe.
 */
export function parseLine(line: string): string[][] {
  const stages: string[][] = [[]];
  let word: string | null = null, quote: string | null = null;
  const end = () => { if (word !== null) { stages[stages.length - 1].push(word); word = null; } };
  for (const ch of line) {
    if (quote) { if (ch === quote) quote = null; else word += ch; }
    else if (ch === '"' || ch === "'") { quote = ch; word ??= ""; }
    else if (ch === "|") { end(); stages.push([]); }
    else if (/\s/.test(ch)) end();
    else word = (word ?? "") + ch;
  }
  end();
  return stages;
}

function lev(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

const isPromise = (x: unknown): x is Promise<Output> => !!x && typeof (x as Promise<Output>).then === "function";

export function open(opts: TermOpts = {}): Win {
  const box = document.createElement("div");
  box.className = "term";
  box.innerHTML = `<pre class="out" role="log" aria-live="polite"></pre><div class="tline"><span class="ps" aria-hidden="true"></span><input aria-label="Terminal input. Type help for commands." autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="send"></div>`;
  const w = makeWin({ app: "terminal", title: "shreshtha@os: ~", w: opts.w || 700, h: opts.h || 440, x: opts.x, y: opts.y, body: box });
  const out = $("pre.out", box), inp = $<HTMLInputElement>("input", box), ps = $(".ps", box);
  let cwd: string[] = [], hist = store.get<string[]>("hist", []), hi = hist.length;

  const prompt = () => `<span class="c-acc">shreshtha@os</span>:<span class="c-b">${escText(pathStr(cwd))}</span>$`;
  const setPS = () => { ps.innerHTML = prompt(); w.setTitle("shreshtha@os: " + pathStr(cwd)); };
  const print = (h: string) => { out.insertAdjacentHTML("beforeend", h + "\n"); w.body.scrollTop = w.body.scrollHeight; };

  const ctx: Ctx = {
    get cwd() { return cwd; },
    cd(parts) { cwd = parts; setPS(); },
    print, prompt, win: w, stdin: null,
    clear() { out.innerHTML = ""; },
    get hist() { return hist; }
  };

  const show = (r: Output) => { if (r !== null && r !== undefined && r !== "") print(r); };

  /** Run a line: one command, or a pipeline (`a | b | c`) where each stage gets the previous stage's text. */
  async function run(line: string): Promise<void> {
    print(`${prompt()} ${escText(line)}`);
    if (!line.trim()) return;
    hist.push(line); hist = hist.slice(-60); store.set("hist", hist); hi = hist.length;
    const stages = parseLine(line);
    if (stages.some(s => !s.length)) { print(`<span class="c-r">syntax error near unexpected token \`|'</span>`); return; }
    let stdin: string | null = null;
    for (let i = 0; i < stages.length; i++) {
      const cmd = stages[i][0].toLowerCase(), args = stages[i].slice(1);
      const c = getCommand(cmd);
      if (!c) {
        const best = commandNames().map(n => [n, lev(cmd, n)] as const).sort((a, b) => a[1] - b[1])[0];
        print(`<span class="c-r">${escText(cmd)}: command not found</span>${best[1] <= 2 ? `. Did you mean <span class="c-acc">${best[0]}</span>?` : '. Type <span class="c-acc">help</span>.'}`);
        return;
      }
      ctx.stdin = stdin;
      let r: Output;
      try {
        const res = c.run(args, ctx);
        r = isPromise(res) ? await res : res; // only await real promises, so plain commands print synchronously
      } catch (e) {
        print(`<span class="c-r">${escText(cmd)}: ${escText(e instanceof Error ? e.message : e)}</span>`);
        return;
      } finally { ctx.stdin = null; }
      if (i === stages.length - 1) show(r);
      else stdin = htmlToText(r ?? "");
    }
  }

  function complete(): void {
    const v = inp.value, parts = v.split(/\s+/);
    const afterPipe = parts.length >= 2 && parts[parts.length - 2].endsWith("|");
    if (afterPipe) { // complete a command name after a pipe
      const last = parts[parts.length - 1], m = commandNames().filter(c => c.startsWith(last)).sort();
      if (m.length === 1) { parts[parts.length - 1] = m[0] + " "; inp.value = parts.join(" "); }
      else if (m.length) print(`${prompt()} ${escText(v)}\n${m.join("  ")}`);
      return;
    }
    if (parts.length <= 1) {
      const m = commandNames().filter(c => c.startsWith(parts[0])).sort();
      if (m.length === 1) inp.value = m[0] + " ";
      else if (m.length) print(`${prompt()} ${escText(v)}\n${m.join("  ")}`);
      return;
    }
    const last = parts[parts.length - 1], slash = last.lastIndexOf("/");
    const dirPart = slash >= 0 ? last.slice(0, slash + 1) : "", base = slash >= 0 ? last.slice(slash + 1) : last;
    const { node } = resolve(cwd, dirPart || ".");
    if (!node || node.type !== "dir") return;
    const m = Object.keys(node.c).filter(k => k.startsWith(base) && (!node.c[k].hidden || base.startsWith(".")));
    if (m.length === 1) { parts[parts.length - 1] = dirPart + m[0] + (node.c[m[0]].type === "dir" ? "/" : ""); inp.value = parts.join(" "); }
    else if (m.length) print(`${prompt()} ${escText(v)}\n${m.join("  ")}`);
  }

  inp.addEventListener("keydown", e => {
    if (e.key === "Enter") { const v = inp.value; inp.value = ""; run(v); }
    else if (e.key === "ArrowUp") { if (hi > 0) inp.value = hist[--hi]; e.preventDefault(); }
    else if (e.key === "ArrowDown") { hi = Math.min(hist.length, hi + 1); inp.value = hist[hi] || ""; e.preventDefault(); }
    else if (e.key === "Tab" && !e.shiftKey && inp.value.trim()) { e.preventDefault(); complete(); }
    else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); out.innerHTML = ""; }
    else if (e.key === "c" && e.ctrlKey) { print(`${prompt()} ${escText(inp.value)}^C`); inp.value = ""; }
  });
  box.addEventListener("click", () => { if (!getSelection()?.toString()) inp.focus(); });
  w.onFocus = () => setTimeout(() => inp.focus({ preventScroll: true }), 0);
  setPS();
  if (opts.intro) print(`${prompt()} neofetch\n${neofetch()}\n\n<span class="c-d">Type</span> <span class="c-acc">help</span> <span class="c-d">to get started. Try</span> <span class="c-acc">projects</span><span class="c-d">,</span> <span class="c-acc">git log</span> <span class="c-d">or</span> <span class="c-acc">sudo hire-me</span><span class="c-d">.</span>`);
  inp.focus({ preventScroll: true });
  return w;
}
