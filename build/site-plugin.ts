/**
 * Vite plugin that turns profile.ts into the site's static parts:
 *  - SEO / Open Graph / Twitter tags and JSON-LD in index.html (replaces <!--seo-->)
 *  - the <noscript> fallback in index.html (replaces <!--noscript-->)
 *  - /resume (plain HTML, no JS), /robots.txt and /sitemap.xml, in dev, preview and build
 */
import type { Connect, Plugin } from "vite";
import { GITHUB_URL, SITE_URL, profile } from "../src/data/profile.ts";
import { renderResumePage } from "./resume-page.ts";

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

const TITLE = `${profile.name} · ${profile.title} | Shreshtha OS`;
const DESCRIPTION = `Portfolio of ${profile.name} (${profile.nick}), a ${profile.title.toLowerCase()} and B.Tech CSE student at ${profile.education.school}, ${profile.city}. Built as a tiny Linux desktop: boot it, open the terminal and type help.`;
const OG_ALT = `${profile.name}, ${profile.title}: terminal-style card`;

function seoTags(): string {
  const p = profile, c = p.contact;
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Person",
    name: p.name, alternateName: p.nick, jobTitle: p.title, url: SITE_URL, email: `mailto:${c.email}`, telephone: c.phone,
    address: { "@type": "PostalAddress", addressLocality: p.city, addressCountry: "IN" },
    alumniOf: { "@type": "CollegeOrUniversity", name: p.education.school },
    sameAs: [`https://${c.linkedin}`, GITHUB_URL]
  };
  return [
    `<title>${esc(TITLE)}</title>`,
    `<meta name="description" content="${esc(DESCRIPTION)}">`,
    `<meta name="author" content="${esc(p.name)}">`,
    `<link rel="canonical" href="${SITE_URL}/">`,
    `<meta name="theme-color" content="#07090a">`,
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`,
    `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Shreshtha OS">`,
    `<meta property="og:title" content="${esc(TITLE)}">`,
    `<meta property="og:description" content="${esc(DESCRIPTION)}">`,
    `<meta property="og:url" content="${SITE_URL}/">`,
    `<meta property="og:image" content="${SITE_URL}/og.png">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${esc(OG_ALT)}">`,
    `<meta property="og:locale" content="en_IN">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(TITLE)}">`,
    `<meta name="twitter:description" content="${esc(DESCRIPTION)}">`,
    `<meta name="twitter:image" content="${SITE_URL}/og.png">`,
    `<meta name="twitter:image:alt" content="${esc(OG_ALT)}">`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`
  ].join("\n");
}

function noscript(): string {
  const p = profile;
  return `<noscript><div class="nojs">
<h1>${esc(p.name)}</h1>
<p>${esc(p.title)} · B.Tech CSE, ${esc(p.education.school)} · ${esc(p.location)}</p>
<p>${esc(p.about[0])}</p>
<p>This interactive portfolio needs JavaScript. <a href="/resume">Read the plain resume</a> or <a href="/resume.pdf">download the PDF</a>.</p>
<p><a href="mailto:${p.contact.email}">${p.contact.email}</a> · <a href="tel:${p.contact.phone}">${p.contact.phoneDisplay}</a> · <a href="https://${p.contact.linkedin}">${p.contact.linkedin}</a> · <a href="${GITHUB_URL}">${p.contact.github}</a></p>
</div></noscript>`;
}

const robots = () => `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
const sitemap = () => {
  const day = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}/</loc><lastmod>${day}</lastmod><priority>1.0</priority></url>
  <url><loc>${SITE_URL}/resume</loc><lastmod>${day}</lastmod><priority>0.8</priority></url>
</urlset>
`;
};

/** Served in dev/preview, emitted as files in the build. */
const PAGES: Record<string, { file: string; type: string; body: () => string }> = {
  "/resume": { file: "resume.html", type: "text/html; charset=utf-8", body: renderResumePage },
  "/robots.txt": { file: "robots.txt", type: "text/plain; charset=utf-8", body: robots },
  "/sitemap.xml": { file: "sitemap.xml", type: "application/xml; charset=utf-8", body: sitemap }
};

const serve: Connect.NextHandleFunction = (req, res, next) => {
  const path = ((req as { url?: string }).url ?? "").split("?")[0].replace(/\/$/, "").replace(/\.html$/, "") || "/";
  const page = PAGES[path];
  if (!page) return next();
  res.setHeader("Content-Type", page.type);
  res.end(page.body());
};

export function sitePlugin(): Plugin {
  return {
    name: "shreshtha-os-site",
    transformIndexHtml: html => html.replace("<!--seo-->", seoTags()).replace("<!--noscript-->", noscript()),
    configureServer(server) { server.middlewares.use(serve); },
    configurePreviewServer(server) { server.middlewares.use(serve); },
    generateBundle() {
      for (const { file, body } of Object.values(PAGES)) this.emitFile({ type: "asset", fileName: file, source: body() });
    }
  };
}
