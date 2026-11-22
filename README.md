# Shreshtha OS

My portfolio as a tiny Linux desktop in the browser: boot screen, window manager, terminal, files, editor, htop, GitHub, resume and mail. There's also a plain, printable version at `/resume` for recruiters and ATS tools.

Built with [Vite](https://vite.dev) and vanilla TypeScript. No framework.

## Run it

You need Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev        # http://localhost:5173, reloads as you edit
npm run build      # type-checks, then builds to dist/
npm run preview    # serves dist/ at http://localhost:4173, like production
```

## Edit content

Almost everything lives in **`src/data/profile.ts`**:

| What | Where in `profile.ts` |
| --- | --- |
| GitHub username (used everywhere) | `GITHUB_USERNAME` |
| Site URL for canonical, Open Graph tags and the sitemap | `SITE_URL` |
| About, education, experience, projects, skills, contact | `profile` |
| Profile README shown in the GitHub app | `profile.githubReadme` |
| Career history in `git log` / Career.git | `COMMITS` |
| Offline fallback for the GitHub app | `FALLBACK_PINS` |
| Fun process list in htop | `PROCESSES` |

The desktop apps, terminal commands, `/resume` page, SEO tags, `robots.txt` and `sitemap.xml` are all generated from it.

Other files:

- **Resume PDF:** replace `public/resume.pdf`.
- **Share image (`public/og.png`) and icon (`public/apple-touch-icon.png`):** edit `scripts/og-image.html` or `public/favicon.svg`, then regenerate (macOS, with Chrome installed):

  ```sh
  CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  "$CHROME" --headless --hide-scrollbars --virtual-time-budget=4000 --window-size=1200,630 --screenshot="$PWD/public/og.png" "file://$PWD/scripts/og-image.html"
  "$CHROME" --headless --hide-scrollbars --window-size=180,180 --screenshot="$PWD/public/apple-touch-icon.png" "file://$PWD/scripts/icon.html"
  ```

## How it's organised

```
index.html                 desktop page shell (SEO tags are injected at build time)
src/main.ts                entry point: boot, then open the startup windows
src/data/profile.ts        all content (edit this)
src/os/                    boot, window manager, panel, dock, launcher, menu, switcher, shortcuts, settings
src/fs/                    virtual home folder + syntax highlighter
src/apps/                  one file per app; each is loaded only when first opened
src/apps/terminal/         the shell; commands/ holds the commands, grouped by topic
src/services/github.ts     live GitHub repos (cached 1 hour, falls back to FALLBACK_PINS)
src/styles/                CSS by area; colours are variables in tokens.css
build/                     Vite plugin: /resume, robots.txt, sitemap.xml, SEO tags, <noscript>
public/                    files served as-is (resume.pdf, icons, og.png)
```

### Add a terminal command

Add an entry to one of the files in `src/apps/terminal/commands/` (or a new file imported from `src/apps/terminal/index.ts`). `man` pages are generated from these fields, so `description` is required:

```ts
register({
  name: "hello",
  usage: "hello [name]",
  summary: "say hello",
  description: "Prints a greeting. Reads piped input if no name is given.",
  examples: ["hello", "whoami | hello"],
  run: (args, ctx) => `hello, ${escText(args[0] ?? ctx.stdin ?? "world")}`
});
```

Return HTML (escape user input with `escText`), `null` for no output, or a Promise. To list it in `help`, add it to `HELP` in `commands/system.ts`.

## Deploy to Vercel

`vercel.json` is already set up (Vite build, clean URLs so `/resume` works, long caching for hashed assets).

**1. Put the code on GitHub**

1. Create an empty repository on GitHub (no README or .gitignore), for example `shreshtha-os`.
2. In this folder:
   ```sh
   git remote add origin https://github.com/<your-username>/shreshtha-os.git
   git push -u origin main
   ```

**2. Connect it to Vercel**

1. Sign in at [vercel.com](https://vercel.com) with your GitHub account.
2. Click **Add New… → Project**, find the repository and click **Import**. If it isn't listed, click **Adjust GitHub App Permissions** and give Vercel access to it.
3. Vercel detects **Vite**. Leave the build settings as they are and click **Deploy**.
4. You get a URL like `https://shreshtha-os.vercel.app`. From now on, every push to `main` redeploys, and pull requests get preview URLs.

**3. Add a custom domain**

1. In the project, open **Settings → Domains**, type your domain (for example `shreshtha.dev`) and click **Add**. Choose to redirect `www` to the root domain when asked.
2. Vercel shows the DNS records to create. At your domain registrar, add exactly what it shows. It is usually:
   - root domain: an **A** record, name `@`, value `76.76.21.21`
   - `www`: a **CNAME** record, name `www`, value `cname.vercel-dns.com`
3. Wait until Vercel shows **Valid Configuration** (minutes, sometimes a few hours). HTTPS is set up automatically.

**4. Point the site at its real URL**

Set `SITE_URL` in `src/data/profile.ts` to the final URL (no trailing slash), then commit and push. Canonical links, share previews and the sitemap all use it.

Optional: submit `https://<your-domain>/sitemap.xml` in Google Search Console, and paste the URL into [opengraph.xyz](https://www.opengraph.xyz) to check the share preview.

## Dependencies

Only two, both development-only (nothing ships to visitors):

- **vite**: dev server and production bundler. It splits each app into its own small file so it only loads when opened.
- **typescript**: type checking (`npm run build` fails on type errors).

The font (JetBrains Mono) loads from Google Fonts at runtime.
