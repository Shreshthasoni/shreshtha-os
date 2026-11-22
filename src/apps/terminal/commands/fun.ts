/** Easter eggs: sudo, rm, ping, hack. */
import { escText, reduceMotion } from "../../../lib/dom";
import { profile } from "../../../data/profile";
import { openApp } from "../../registry";
import { register } from "../registry";

register(
  {
    name: "sudo", usage: "sudo <command>", summary: "run as root",
    description: "You are not root. There is one password that works.",
    run: a => {
      const s = a.join(" ");
      if (/hire/.test(s)) {
        setTimeout(() => openApp("mail"), 600);
        return `[sudo] password for recruiter: ********\n<span class="c-acc">✔ access granted.</span>\nExcellent decision. Reach me at <span class="c-w">${profile.contact.email}</span>\nOpening mail…`;
      }
      if (/rm/.test(s)) return `<span class="c-r">nice try.</span>`;
      return `<span class="c-r">shreshtha is not in the sudoers file. This incident will be reported.</span>\n<span class="c-d">(hint: sudo hire-me)</span>`;
    }
  },
  {
    name: "rm", usage: "rm <file>", summary: "remove a file",
    description: "This portfolio is read-only, so this never works.",
    run: () => `<span class="c-r">rm: permission denied. This portfolio is read-only.</span>`
  },
  {
    name: "ping", usage: "ping [host]", summary: "check a connection",
    description: "Sends four pretend pings. The default host is you.",
    examples: ["ping", "ping recruiter"],
    run: a => {
      const h = escText(a[0] || "recruiter");
      return Array.from({ length: 4 }, (_, i) => `64 bytes from ${h}: icmp_seq=${i + 1} ttl=64 time=${(Math.random() * 3 + .4).toFixed(2)} ms`).join("\n") + `\n<span class="c-acc">--- ${h}: 0% packet loss. Shreshtha replies fast. ---</span>`;
    }
  },
  {
    name: "hack", usage: "hack", summary: "hollywood hacking",
    description: "Runs a very serious, very fake intrusion.",
    run: (_a, ctx) => {
      const steps = ["[*] scanning ports on opportunity.local…", "[*] 443/tcp open  internship", "[*] bypassing HR firewall with a strong portfolio…", "[*] injecting: Galla, School ERP, Tagshop.ai", "[+] payload delivered", `<span class="c-acc">[✔] ACCESS GRANTED: interview scheduled (pending your email to ${profile.contact.email})</span>`];
      let i = 0;
      const iv = setInterval(() => { ctx.print(steps[i++]); if (i >= steps.length) clearInterval(iv); }, reduceMotion ? 0 : 380);
      return null;
    }
  }
);
