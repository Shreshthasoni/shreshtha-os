# Prompt for the Antigravity agent

Copy everything below the line into the Antigravity agent chat, with this folder open as the workspace.

---

You are working on **Shreshtha OS**, my developer portfolio. It's a Linux-style desktop that runs in the browser. Right now the whole thing is one file, `index.html`, plus `resume.pdf`. Open `index.html` in a browser first and click through everything so you understand what already works before changing anything.

## Who I am (the only facts you may use)
- Name: Shreshtha Soni (goes by Keshav). B.Tech CSE, JECRC University, Jaipur, 2024–2028.
- Experience: Full-Stack Developer Intern (paid, on-site) at Tagshop.ai, an AI UGC video platform, Jun–Oct 2026. Freelance software developer, 2026–now (built the live Micro Path Labs test-booking site). Business & Creative Manager at Triambika Infotech, Dec 2025–May 2026.
- Projects: Galla (Android business app for shop owners, live on Google Play), School Management ERP (Python + Next.js, Docker, AWS, in production), Micro Path Labs booking site (React).
- Skills: C++, Java, Python, JavaScript, SQL, React, Next.js, Node.js, Express, FastAPI, MySQL, PostgreSQL, Supabase, AWS, Docker, Git. Learning machine learning.
- Contact: shreshtha.soni1111@gmail.com · linkedin.com/in/shreshtha-soni · GitHub username is set in one config value (see below).
- Do not invent anything else: no fake metrics, ratings, testimonials, contribution counts or repo stars. If something needs data you don't have, leave a clearly marked TODO.

## Goal
Turn the single file into a clean, maintainable project I can keep building and deploy, without losing any current feature or the look.

## Step 1: restructure (keep behaviour identical)
- Use **Vite + vanilla TypeScript** (no React; the app is DOM-heavy and fast as it is).
- Suggested structure:
  - `src/data/profile.ts`: one source of truth for all my content, and `GITHUB_USERNAME`
  - `src/os/boot.ts` (GRUB, kernel log, login), `src/os/wm.ts` (windows, focus, drag, resize, min/max, workspaces), `src/os/panel.ts`, `src/os/dock.ts`, `src/os/launcher.ts`, `src/os/contextMenu.ts`, `src/os/toast.ts`, `src/os/settings.ts`
  - `src/fs/vfs.ts`: the virtual file system
  - `src/apps/terminal/` (commands in separate files, one registry), `src/apps/files.ts`, `editor.ts`, `monitor.ts`, `git.ts`, `github.ts`, `resume.ts`, `mail.ts`, `settings.ts`
  - `src/styles/` split by area, keeping the CSS variables
  - `public/resume.pdf`
- After restructuring, run it and compare against the original `index.html` side by side. Every command, app, shortcut and animation must still work.

## Step 2: improvements
1. **Live GitHub data.** In the GitHub app and `gh repo list`, fetch public repos from `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated` (unauthenticated, cache the response in localStorage for 1 hour, and fall back to the current static pinned list on error or rate limit). Show real names, descriptions, languages and links. Pinned cards should open each repo's own URL. Add `gh repo view <name>` to the terminal.
2. **Recruiter mode.** Add a "Plain view" button in the top panel and a `/resume` route (a plain HTML page made from `profile.ts`). It must be readable without JavaScript, so ATS tools and search engines can parse it. Add a `<noscript>` fallback that links to it.
3. **SEO and sharing.** Title, meta description, canonical URL, Open Graph and Twitter tags, an OG image (1200×630, terminal-style, my name and "Full-stack developer"), favicon, `robots.txt` and `sitemap.xml`.
4. **Terminal upgrades.** Pipes for a few commands (`cat skills.json | grep Python`), `man` pages for every command, and `cowsay`. Keep everything that's already there.
5. **Mobile.** Make the phone layout feel like a mobile OS: one full-screen app at a time, with an app switcher.
6. **Accessibility.** Keyboard access to every window and control, focus trapping in dialogs, `prefers-reduced-motion` respected, and screen-reader labels.
7. **Performance.** Lighthouse 90+ on mobile, lazy-load apps that aren't open at startup, and a font `display=swap` preload.

## Step 3: deploy
- Set up Vercel (`vercel.json` if needed) and give me exact steps to connect my GitHub repo and a custom domain.
- Add a short `README.md` covering how to run it, where to edit content (`profile.ts`), and how to deploy.

## Working rules
- Commit after each step with a clear message.
- Don't add dependencies unless they clearly earn their place, and explain each one.
- Before you finish, give me a checklist of anything you couldn't verify (for example whether my GitHub username is correct).
