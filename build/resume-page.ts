/**
 * The plain /resume page, rendered at build time from src/data/profile.ts.
 * No JavaScript: ATS tools, search engines and screen readers get the whole CV as semantic HTML.
 */
import { GITHUB_URL, SITE_URL, profile } from "../src/data/profile.ts";

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const list = (items: string[]) => `<ul>${items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`;

export function renderResumePage(): string {
  const p = profile, c = p.contact;
  const description = `${p.name} (${p.nick}): ${p.title.toLowerCase()} and B.Tech CSE student at ${p.education.school}, ${p.city}. Experience, projects, skills and contact details.`;
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Person",
    name: p.name, alternateName: p.nick, jobTitle: p.title, email: `mailto:${c.email}`, telephone: c.phone, url: SITE_URL,
    address: { "@type": "PostalAddress", addressLocality: p.city, addressCountry: "IN" },
    alumniOf: { "@type": "CollegeOrUniversity", name: p.education.school },
    sameAs: [`https://${c.linkedin}`, GITHUB_URL],
    knowsAbout: Object.values(p.skills).flat()
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.name)} · Resume</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE_URL}/resume">
<meta property="og:type" content="profile">
<meta property="og:title" content="${esc(p.name)} · Resume">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE_URL}/resume">
<meta property="og:image" content="${SITE_URL}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE_URL}/og.png">
<meta name="theme-color" content="#07090a">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>
<style>
:root{--bg:#fff;--fg:#16191a;--muted:#5b6461;--line:#dde2e0;--acc:#0b7a3e;color-scheme:light dark}
@media (prefers-color-scheme:dark){:root{--bg:#0b0f10;--fg:#e3e9e5;--muted:#9aa6a1;--line:#24302d;--acc:#3dff8f}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
main{max-width:780px;margin:0 auto;padding:40px 20px 64px}
a{color:var(--acc)}
.bar{display:flex;flex-wrap:wrap;gap:8px 16px;justify-content:space-between;align-items:center;font-size:14px;margin-bottom:28px;padding-bottom:14px;border-bottom:1px solid var(--line)}
.bar a{text-decoration:none;font-weight:600}
h1{margin:0;font-size:34px;line-height:1.15;letter-spacing:-.01em}
.lead{margin:6px 0 4px;font-size:18px;color:var(--muted)}
.contact{display:flex;flex-wrap:wrap;gap:4px 18px;padding:0;margin:12px 0 0;list-style:none;font-size:15px}
h2{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--acc);margin:36px 0 12px;padding-bottom:6px;border-bottom:1px solid var(--line)}
section>p{margin:0 0 10px}
article{margin:0 0 20px}
.head{display:flex;flex-wrap:wrap;justify-content:space-between;gap:2px 12px;align-items:baseline}
h3{margin:0;font-size:17px}
.when,.org{color:var(--muted);font-size:14px}
.org{margin:2px 0 6px}
ul{margin:6px 0 0;padding-left:20px}
li{margin-bottom:4px}
.stack{font-size:14px;color:var(--muted);margin-top:6px}
dl{display:grid;grid-template-columns:170px 1fr;gap:6px 16px;margin:0}
dt{font-weight:600}
dd{margin:0}
footer{margin-top:40px;font-size:14px;color:var(--muted)}
@media (max-width:560px){dl{grid-template-columns:1fr;gap:0}dd{margin-bottom:10px}h1{font-size:28px}}
@media print{
  :root{--bg:#fff;--fg:#000;--muted:#444;--line:#bbb;--acc:#000}
  .bar,footer{display:none}main{padding:0;max-width:none}h2{margin-top:20px}article{break-inside:avoid}
  a{text-decoration:none}
}
</style>
</head>
<body>
<main>
<nav class="bar" aria-label="Page"><a href="/">← Interactive version (Shreshtha OS)</a><a href="/resume.pdf">Download PDF</a></nav>
<header>
<h1>${esc(p.name)}</h1>
<p class="lead">${esc(p.title)} · B.Tech CSE, ${esc(p.education.school)} · ${esc(p.location)}</p>
<ul class="contact">
<li><a href="mailto:${c.email}">${c.email}</a></li>
<li><a href="tel:${c.phone}">${c.phoneDisplay}</a></li>
<li><a href="https://${c.linkedin}">${c.linkedin}</a></li>
<li><a href="${GITHUB_URL}">${c.github}</a></li>
<li>${esc(c.place)}</li>
</ul>
</header>

<section aria-labelledby="h-about">
<h2 id="h-about">About</h2>
${p.about.map(t => `<p>${esc(t)}</p>`).join("\n")}
<p><strong>${esc(p.status)}.</strong></p>
</section>

<section aria-labelledby="h-exp">
<h2 id="h-exp">Experience</h2>
${p.work.map(w => `<article>
<div class="head"><h3>${esc(w.role)}</h3><span class="when">${esc(w.when)}</span></div>
<p class="org">${esc(w.org)}</p>
${list(w.bullets)}
</article>`).join("\n")}
</section>

<section aria-labelledby="h-proj">
<h2 id="h-proj">Projects</h2>
${p.projects.map(pr => `<article>
<div class="head"><h3>${esc(pr.name)}</h3><span class="when">${esc(pr.status)}</span></div>
<p class="org">${esc(pr.tagline)}</p>
${list(pr.bullets)}
<p class="stack">Stack: ${esc(pr.stack.join(", "))}</p>
</article>`).join("\n")}
</section>

<section aria-labelledby="h-edu">
<h2 id="h-edu">Education</h2>
<article>
<div class="head"><h3>${esc(p.education.degree)}</h3><span class="when">${esc(p.education.when)}</span></div>
<p class="org">${esc(p.education.school)}, ${esc(p.education.city)}</p>
</article>
</section>

<section aria-labelledby="h-skills">
<h2 id="h-skills">Skills</h2>
<dl>
${Object.entries(p.skills).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v.join(", "))}</dd>`).join("\n")}
</dl>
</section>

<footer><p>This page is the plain version of <a href="/">Shreshtha OS</a>, a portfolio built as a tiny Linux desktop.</p></footer>
</main>
</body>
</html>
`;
}
