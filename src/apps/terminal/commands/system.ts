/** Shell and system commands: help, man, history, clear, exit, echo, date, uname, htop, theme, matrix and app launchers. */
import { escText } from "../../../lib/dom";
import { openApp } from "../../registry";
import { ACCENTS, applySettings, settings } from "../../../os/settings";
import { runMatrix } from "../../../os/matrix";
import { closeWin } from "../../../os/wm";
import { register } from "../registry";

/** What `help` lists, in order: [usage, summary]. */
export const HELP: [string, string][] = [
  ["help", "this list"], ["ls [-la] [dir]", "list files"], ["cd <dir>", "change directory"], ["pwd", "where am I"], ["cat <file>", "print a file"], ["tree", "the whole home folder"],
  ["open <path>", "open a file or folder in an app"], ["neofetch", "system info (it's me)"], ["whoami", "short intro"], ["projects", "what I've shipped"], ["experience", "where I've worked"],
  ["skills", "skill meters"], ["git log", "career as commits"], ["gh", "my GitHub profile"], ["gh repo list", "public repos (live)"], ["gh repo view <n>", "one repo + README"], ["htop", "process monitor"], ["contact", "how to reach me"], ["resume", "open resume.pdf"],
  ["theme <name>", "green | amber | cyan | pink | white"], ["matrix", "follow the white rabbit"], ["history", "past commands"], ["clear", "clear screen"], ["exit", "close this terminal"]];

register(
  {
    name: "help", usage: "help", summary: "this list",
    description: "Lists the main commands. Some commands are hidden: explore.",
    run: () => '<span class="c-w">Shreshtha OS shell</span>, the commands that matter:\n' + HELP.map(([c, d]) => `  <span class="c-acc">${escText(c).padEnd(16)}</span> ${d}`).join("\n") + '\n<span class="c-d">Tab completes, ↑↓ walks history. Some commands are hidden.</span>'
  },
  {
    name: "man", usage: "man <command>", summary: "manual for a command",
    run: a => {
      if (!a[0]) return "What manual page do you want?";
      const h = HELP.find(x => x[0].split(" ")[0] === a[0]);
      return h ? `${a[0]}: ${h[1]}` : `No manual entry for ${escText(a[0])}`;
    }
  },
  {
    name: "history", usage: "history", summary: "past commands",
    description: "Lists commands you've run (kept in this browser). ↑ and ↓ in the prompt walk through them.",
    run: (_a, ctx) => ctx.hist.map((h, i) => `${String(i + 1).padStart(4)}  ${escText(h)}`).join("\n") || "(empty)"
  },
  {
    name: "clear", usage: "clear", summary: "clear screen",
    description: "Clears the terminal. Ctrl+L does the same.",
    run: (_a, ctx) => { ctx.clear(); return null; }
  },
  {
    name: "exit", usage: "exit", summary: "close this terminal",
    description: "Logs out and closes this terminal window.",
    run: (_a, ctx) => { setTimeout(() => closeWin(ctx.win), 50); return "logout"; }
  },
  {
    name: "echo", usage: "echo <text>", summary: "print text",
    description: "Prints its arguments.",
    examples: ["echo hello", "echo hire me | cowsay"],
    run: a => escText(a.join(" "))
  },
  {
    name: "date", usage: "date", summary: "current date and time",
    description: "Prints the current date and time from your device.",
    run: () => new Date().toString()
  },
  {
    name: "uname", usage: "uname [-a]", summary: "system name",
    description: "Prints the system name. -a prints everything.",
    run: a => a[0] === "-a" ? "ShreshthaOS 26.11.0-jaipur #1 SMP PREEMPT x86_64 full-stack/linux" : "ShreshthaOS"
  },
  {
    name: "htop", usage: "htop", summary: "process monitor", aliases: ["top"],
    description: "Opens the System Monitor: what's running in Shreshtha's head right now.",
    run: () => { openApp("monitor"); return `<span class="c-d">launching htop…</span>`; }
  },
  {
    name: "theme", usage: "theme <name>", summary: "green | amber | cyan | pink | white",
    description: "Changes the accent colour everywhere. Saved in this browser. Settings has the same options.",
    examples: ["theme amber", "theme green"],
    run: a => {
      if (!ACCENTS[a[0]]) return "usage: theme green|amber|cyan|pink|white";
      settings.accent = a[0]; applySettings();
      return `accent set to <span class="c-acc">${a[0]}</span>`;
    }
  },
  {
    name: "matrix", usage: "matrix", summary: "follow the white rabbit",
    description: "Full-screen digital rain for a few seconds. Any key or click stops it. Off when your system prefers reduced motion.",
    run: () => { runMatrix(); return null; }
  },
  { name: "files", usage: "files", summary: "open the file manager", description: "Opens Files at the current folder.", run: (_a, ctx) => { openApp("files", ctx.cwd); return null; } },
  { name: "settings", usage: "settings", summary: "open Settings", description: "Opens Settings: accent colour, wallpaper, scanlines and the boot animation.", run: () => { openApp("settings"); return null; } },
  { name: "mail", usage: "mail", summary: "write to Shreshtha", description: "Opens a new message. It is handed to your own mail app; nothing is sent from this page.", run: () => { openApp("mail"); return null; } }
);
