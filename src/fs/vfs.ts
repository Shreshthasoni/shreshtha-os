/** The virtual home folder, built from profile.ts. Used by the terminal, Files and Editor. */
import { profile, projectLinks, type Job, type Project } from "../data/profile";

export type FileNode = { type: "file"; text: () => string; hidden?: boolean };
export type PdfNode = { type: "pdf"; hidden?: boolean };
export type DirNode = { type: "dir"; c: Record<string, VNode>; hidden?: boolean };
export type VNode = FileNode | PdfNode | DirNode;

const md = {
  about: () => `# about.txt\n\n${profile.about.join("\n\n")}\n`,
  work: (w: Job) => `# ${w.role}\n## ${w.org}\n## ${w.when}\n\n${w.bullets.map(b => "- " + b).join("\n")}\n`,
  proj: (p: Project) => `# ${p.name}\n## ${p.tagline}\nstatus: ${p.status}\n\n${p.bullets.map(b => "- " + b).join("\n")}\n\nstack: ${p.stack.join(", ")}\n${projectLinks(p).map(l => `link: ${l.url}\n`).join("")}`,
  skills: () => "{\n" + Object.entries(profile.skills).map(([k, v]) => `  "${k}": [${v.map(s => `"${s}"`).join(", ")}]`).join(",\n") + "\n}\n",
  vcf: () => `BEGIN:VCARD\nVERSION:4.0\nFN:${profile.name}\nNICKNAME:${profile.nick}\nTITLE:${profile.title}\nEMAIL:${profile.contact.email}\nTEL;VALUE=uri:tel:${profile.contact.phone}\nURL:https://${profile.contact.linkedin}\nURL:https://${profile.contact.github}\nADR:${profile.contact.place}\nEND:VCARD\n`
};

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const file = (text: () => string, hidden = false): FileNode => ({ type: "file", text, hidden });

export const FS: DirNode = {
  type: "dir", c: {
    "about.txt": file(md.about),
    "experience": { type: "dir", c: Object.fromEntries(profile.work.map(w => [slug(w.short) + ".md", file(() => md.work(w))])) },
    "projects": { type: "dir", c: Object.fromEntries(profile.projects.map(p => [slug(p.name), { type: "dir", c: { "README.md": file(() => md.proj(p)) } } as DirNode])) },
    "skills.json": file(md.skills),
    "contact.vcf": file(md.vcf),
    "resume.pdf": { type: "pdf" },
    ".secret": file(() => "You found it.\nThe password is: sudo hire-me\n", true)
  }
};

/** Resolve a path (relative to `cwd`, or absolute with ~ or /) to a node. */
export function resolve(cwd: string[], p = ""): { node: VNode | null; parts: string[] } {
  const parts = p.startsWith("~") || p.startsWith("/") ? [] : [...cwd];
  p.replace(/^~\/?|^\/+/, "").split("/").filter(Boolean).forEach(seg => { if (seg === "..") parts.pop(); else if (seg !== ".") parts.push(seg); });
  let node: VNode = FS;
  for (const s of parts) {
    if (node.type !== "dir" || !node.c[s]) return { node: null, parts };
    node = node.c[s];
  }
  return { node, parts };
}

export const pathStr = (parts: string[]) => "~" + (parts.length ? "/" + parts.join("/") : "");
export const sizeOf = (n: VNode) => n.type === "dir" ? 4096 : n.type === "pdf" ? 48213 : n.text().length;
