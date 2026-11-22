/** File commands: ls, cd, pwd, cat, tree, open (vim, nano). */
import { escText } from "../../../lib/dom";
import { hl } from "../../../fs/highlight";
import { FS, pathStr, resolve, sizeOf, type DirNode } from "../../../fs/vfs";
import { openApp } from "../../registry";
import { register } from "../registry";

const err = (s: string) => `<span class="c-r">${s}</span>`;

function listing(node: DirNode, long: boolean, all: boolean): string {
  const ents = Object.entries(node.c).filter(([, v]) => all || !v.hidden);
  if (!long) return ents.map(([k, v]) => v.type === "dir" ? `<span class="c-b">${k}/</span>` : v.type === "pdf" ? `<span class="c-r">${k}</span>` : k).join("   ");
  return `total ${ents.length}\n` + ents.map(([k, v]) =>
    `${v.type === "dir" ? "drwxr-xr-x" : "-rw-r--r--"} 1 shreshtha dev ${String(sizeOf(v)).padStart(6)} Nov 22 ${v.type === "dir" ? `<span class="c-b">${k}/</span>` : k}`).join("\n");
}

function treeOf(node: DirNode, pre = ""): string {
  const ents = Object.entries(node.c).filter(([, v]) => !v.hidden);
  return ents.map(([k, v], i) => {
    const last = i === ents.length - 1;
    return pre + (last ? "└── " : "├── ") + (v.type === "dir" ? `<span class="c-b">${k}</span>` : k) + (v.type === "dir" ? "\n" + treeOf(v, pre + (last ? "    " : "│   ")) : "");
  }).join("\n").replace(/\n\n/g, "\n");
}

register(
  {
    name: "ls", usage: "ls [-la] [dir]", summary: "list files",
    description: "Lists the files in a folder (the current one by default). -l shows a long listing with sizes, -a includes hidden files.",
    examples: ["ls", "ls -la", "ls projects"],
    run(a, ctx) {
      const long = a.some(x => /^-.*l/.test(x)), all = a.some(x => /^-.*a/.test(x));
      const p = a.find(x => !x.startsWith("-"));
      const { node } = resolve(ctx.cwd, p || "");
      if (!node) return err(`ls: cannot access '${escText(p)}': No such file or directory`);
      if (node.type !== "dir") return escText(p);
      return listing(node, long, all);
    }
  },
  {
    name: "cd", usage: "cd <dir>", summary: "change directory",
    description: "Moves into a folder. `cd ..` goes up one level, `cd` or `cd ~` goes home.",
    examples: ["cd projects", "cd ..", "cd ~"],
    run(a, ctx) {
      const { node, parts } = resolve(ctx.cwd, a[0] || "~");
      if (!node) return err(`cd: ${escText(a[0])}: No such file or directory`);
      if (node.type !== "dir") return err(`cd: ${escText(a[0])}: Not a directory`);
      ctx.cd(parts);
      return null;
    }
  },
  {
    name: "pwd", usage: "pwd", summary: "where am I",
    description: "Prints the full path of the current folder.",
    run: (_a, ctx) => "/home/shreshtha" + pathStr(ctx.cwd).slice(1)
  },
  {
    name: "cat", usage: "cat <file>", summary: "print a file",
    description: "Prints a file with syntax highlighting. With no file, passes piped input straight through.",
    examples: ["cat about.txt", "cat skills.json | grep Python", "cat .secret"],
    run(a, ctx) {
      if (!a[0]) return ctx.stdin !== null ? escText(ctx.stdin) : "cat: missing file operand";
      const { node } = resolve(ctx.cwd, a[0]);
      if (!node) return err(`cat: ${escText(a[0])}: No such file or directory`);
      if (node.type === "dir") return err(`cat: ${escText(a[0])}: Is a directory`);
      if (node.type === "pdf") return `<span class="c-y">binary file. Try: open resume.pdf</span>`;
      return hl(node.text(), a[0]);
    }
  },
  {
    name: "tree", usage: "tree", summary: "the whole home folder",
    description: "Draws every file and folder in the home folder as a tree.",
    run: () => `<span class="c-b">~</span>\n` + treeOf(FS)
  },
  {
    name: "open", usage: "open <path>", summary: "open a file or folder in an app", aliases: ["vim", "nano"],
    description: "Opens a file in the Editor, a folder in Files, or resume.pdf in the Resume app. `vim` and `nano` do the same.",
    examples: ["open about.txt", "open projects", "open resume.pdf"],
    run(a, ctx) {
      const { node, parts } = resolve(ctx.cwd, a[0] || ".");
      if (!node) return err(`open: ${escText(a[0])}: not found`);
      openApp(node.type === "dir" ? "files" : "editor", parts);
      return `<span class="c-d">opening ${escText(pathStr(parts))}…</span>`;
    }
  }
);
