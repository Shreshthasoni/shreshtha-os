/**
 * Text filters for pipes: grep, head, tail, wc, sort, uniq.
 * Each reads piped input (ctx.stdin) or, if nothing is piped, a file argument.
 */
import { escText } from "../../../lib/dom";
import { resolve } from "../../../fs/vfs";
import { register, type Ctx } from "../registry";

const err = (s: string) => `<span class="c-r">${escText(s)}</span>`;

/** Piped text, else the contents of `file`. Returns [text] or [null, error]. */
function input(cmd: string, file: string | undefined, ctx: Ctx): [string] | [null, string] {
  if (file) {
    const { node } = resolve(ctx.cwd, file);
    if (!node) return [null, err(`${cmd}: ${file}: No such file or directory`)];
    if (node.type === "dir") return [null, err(`${cmd}: ${file}: Is a directory`)];
    if (node.type === "pdf") return [null, err(`${cmd}: ${file}: binary file`)];
    return [node.text()];
  }
  if (ctx.stdin !== null) return [ctx.stdin];
  return [null, err(`${cmd}: no input. Pipe something in, e.g. cat skills.json | ${cmd}`)];
}

const lines = (t: string) => { const l = t.split("\n"); if (l[l.length - 1] === "") l.pop(); return l; };

/** Parse flags like -i -v -n -c or combined -in, plus "-n 5" / "-5" counts. */
function parse(args: string[], withCount = false): { flags: Set<string>; n?: number; rest: string[] } {
  const flags = new Set<string>(), rest: string[] = [];
  let n: number | undefined;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (withCount && a === "-n" && /^\d+$/.test(args[i + 1] ?? "")) { n = +args[++i]; continue; }
    if (withCount && /^-\d+$/.test(a)) { n = +a.slice(1); continue; }
    if (/^-[a-z]+$/i.test(a) && rest.length === 0) { [...a.slice(1)].forEach(f => flags.add(f)); continue; }
    rest.push(a);
  }
  return { flags, n, rest };
}

register(
  {
    name: "grep", usage: "grep [-ivnco] <pattern> [file]", summary: "find matching lines",
    description: "Prints the lines that match a pattern (a regular expression; plain words work too). Reads piped input or a file. -i ignores case, -v prints lines that don't match, -n numbers them, -c only counts them, -o prints only the matching part.",
    examples: ["cat skills.json | grep Python", "grep -i aws projects/galla/README.md", "projects | grep -i live", "git log | grep -c feat"],
    run(args, ctx) {
      const { flags, rest } = parse(args);
      const [pattern, file] = rest;
      if (pattern === undefined) return "usage: grep [-ivnco] &lt;pattern&gt; [file]";
      const [text, e] = input("grep", file, ctx);
      if (text === null) return e;
      let re: RegExp;
      try { re = new RegExp(pattern, flags.has("i") ? "gi" : "g"); }
      catch { re = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags.has("i") ? "gi" : "g"); }
      const hits = lines(text).map((l, i) => ({ l, i })).filter(({ l }) => { re.lastIndex = 0; return re.test(l) !== flags.has("v"); });
      if (flags.has("c")) return String(hits.length);
      if (flags.has("o") && !flags.has("v")) return hits.flatMap(({ l }) => [...l.matchAll(re)].map(m => m[0]).filter(Boolean)).map(escText).join("\n") || null;
      const mark = (l: string) => {
        if (flags.has("v")) return escText(l);
        let out = "", last = 0;
        for (const m of l.matchAll(re)) {
          if (!m[0]) break;
          out += escText(l.slice(last, m.index)) + `<span class="hit">${escText(m[0])}</span>`;
          last = m.index! + m[0].length;
        }
        return out + escText(l.slice(last));
      };
      return hits.map(({ l, i }) => (flags.has("n") ? `<span class="c-acc">${i + 1}:</span>` : "") + mark(l)).join("\n") || null;
    }
  },
  {
    name: "head", usage: "head [-n N] [file]", summary: "first lines",
    description: "Prints the first 10 lines (or N with -n N, or -N) of piped input or a file.",
    examples: ["cat about.txt | head -n 3", "help | head -5"],
    run(args, ctx) {
      const { n = 10, rest } = parse(args, true);
      const [text, e] = input("head", rest[0], ctx);
      return text === null ? e : escText(lines(text).slice(0, n).join("\n"));
    }
  },
  {
    name: "tail", usage: "tail [-n N] [file]", summary: "last lines",
    description: "Prints the last 10 lines (or N with -n N, or -N) of piped input or a file.",
    examples: ["git log | tail -n 3", "tail -2 contact.vcf"],
    run(args, ctx) {
      const { n = 10, rest } = parse(args, true);
      const [text, e] = input("tail", rest[0], ctx);
      return text === null ? e : escText(lines(text).slice(-n).join("\n"));
    }
  },
  {
    name: "wc", usage: "wc [-lwc] [file]", summary: "count lines, words, characters",
    description: "Counts lines, words and characters in piped input or a file. -l, -w or -c prints just that count.",
    examples: ["cat about.txt | wc -w", "projects | wc -l", "wc skills.json"],
    run(args, ctx) {
      const { flags, rest } = parse(args);
      const [text, e] = input("wc", rest[0], ctx);
      if (text === null) return e;
      const counts: Record<string, number> = { l: lines(text).length, w: text.split(/\s+/).filter(Boolean).length, c: text.length };
      const pick = ["l", "w", "c"].filter(f => flags.has(f));
      return (pick.length ? pick : ["l", "w", "c"]).map(f => String(counts[f]).padStart(pick.length === 1 ? 0 : 7)).join(" ") + (rest[0] ? " " + escText(rest[0]) : "");
    }
  },
  {
    name: "sort", usage: "sort [-rn] [file]", summary: "sort lines",
    description: "Sorts lines alphabetically. -r reverses, -n sorts by the first number on each line.",
    examples: ["skills | sort -rn", "cat skills.json | grep '\"' | sort"],
    run(args, ctx) {
      const { flags, rest } = parse(args);
      const [text, e] = input("sort", rest[0], ctx);
      if (text === null) return e;
      const num = (s: string) => parseFloat(s.match(/-?\d+(\.\d+)?/)?.[0] ?? "NaN");
      const out = lines(text).sort(flags.has("n") ? (a, b) => (num(a) || 0) - (num(b) || 0) : (a, b) => a.localeCompare(b));
      if (flags.has("r")) out.reverse();
      return escText(out.join("\n"));
    }
  },
  {
    name: "uniq", usage: "uniq [-c] [file]", summary: "drop repeated lines",
    description: "Collapses repeated adjacent lines into one. -c prefixes each line with how many times it appeared. Usually used after sort.",
    examples: ["projects | sort | uniq", "git log | grep -o feat | uniq -c"],
    run(args, ctx) {
      const { flags, rest } = parse(args);
      const [text, e] = input("uniq", rest[0], ctx);
      if (text === null) return e;
      const out: [string, number][] = [];
      for (const l of lines(text)) { const last = out[out.length - 1]; if (last && last[0] === l) last[1]++; else out.push([l, 1]); }
      return escText(out.map(([l, n]) => flags.has("c") ? `${String(n).padStart(7)} ${l}` : l).join("\n"));
    }
  }
);
