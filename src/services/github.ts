/**
 * Public GitHub data for GITHUB_USERNAME, without authentication.
 * - Responses are cached in localStorage for 1 hour (the unauthenticated limit is 60 requests/hour per IP).
 * - On error or rate limit: use an expired cache if there is one, otherwise the static FALLBACK_PINS.
 */
import { FALLBACK_PINS, GITHUB_PINNED, GITHUB_URL, GITHUB_USERNAME } from "../data/profile";
import { store } from "../lib/dom";

export interface Repo {
  name: string;
  description: string;
  language: string;
  color: string;
  url: string;
  homepage: string;
  topics: string[];
  updated: string;
  fork: boolean;
  archived: boolean;
}

export type RepoSource = "live" | "cache" | "stale-cache" | "fallback";
export interface RepoResult { repos: Repo[]; source: RepoSource; fetchedAt?: number; error?: string }

const TTL = 60 * 60 * 1000;
const API = "https://api.github.com";
const KEY = `gh-repos-${GITHUB_USERNAME}`;

/** Common GitHub language colours (the rest get a neutral grey). */
const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", Java: "#b07219", "C++": "#f34b7d", C: "#555555",
  Kotlin: "#A97BFF", Dart: "#00B4AB", HTML: "#e34c26", CSS: "#563d7c", SCSS: "#c6538c", Go: "#00ADD8", Rust: "#dea584",
  Shell: "#89e051", "Jupyter Notebook": "#DA5B0B", PHP: "#4F5D95", Swift: "#F05138", Vue: "#41b883", Svelte: "#ff3e00", Dockerfile: "#384d54"
};
export const langColor = (l: string) => LANG_COLORS[l] ?? "#8b949e";

interface ApiRepo {
  name: string; description: string | null; language: string | null; html_url: string; homepage: string | null;
  topics?: string[]; pushed_at: string; updated_at: string; fork: boolean; archived: boolean;
}

const toRepo = (r: ApiRepo): Repo => ({
  name: r.name, description: r.description ?? "", language: r.language ?? "", color: langColor(r.language ?? ""),
  url: r.html_url, homepage: r.homepage ?? "", topics: r.topics ?? [], updated: r.pushed_at || r.updated_at,
  fork: r.fork, archived: r.archived
});

/** The static project list from profile.ts, shaped like repos (links go to the profile). */
export const fallbackRepos = (): Repo[] =>
  FALLBACK_PINS.map(p => ({ name: p.name, description: p.description, language: p.language, color: p.color, url: GITHUB_URL, homepage: "", topics: [], updated: "", fork: false, archived: false }));

const fallback = (error: string): RepoResult => ({ source: "fallback", error, repos: fallbackRepos() });

function describeError(res: Response): string {
  if (res.status === 404) return `GitHub user "${GITHUB_USERNAME}" not found`;
  if (res.status === 403 || res.status === 429) {
    const reset = Number(res.headers.get("x-ratelimit-reset")) * 1000;
    return "GitHub API rate limit reached" + (reset ? `, resets at ${new Date(reset).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "");
  }
  return `GitHub API error ${res.status}`;
}

let inflight: Promise<RepoResult> | null = null;
/** After a failure, don't retry for a while (retrying a rate limit only burns more of it). */
let lastFailure: { t: number; result: RepoResult } | null = null;
const RETRY_AFTER = 5 * 60 * 1000;

/** Public repos, most recently pushed first. */
export function getRepos(force = false): Promise<RepoResult> {
  const cached = store.get<{ t: number; repos: Repo[] } | null>(KEY, null);
  if (!force && cached && Date.now() - cached.t < TTL) return Promise.resolve({ repos: cached.repos, source: "cache", fetchedAt: cached.t });
  if (inflight) return inflight;
  if (!force && lastFailure && Date.now() - lastFailure.t < RETRY_AFTER) return Promise.resolve(lastFailure.result);
  inflight = (async (): Promise<RepoResult> => {
    try {
      const res = await fetch(`${API}/users/${encodeURIComponent(GITHUB_USERNAME)}/repos?sort=updated&per_page=100`, { headers: { Accept: "application/vnd.github+json" } });
      if (!res.ok) throw new Error(describeError(res));
      const repos = ((await res.json()) as ApiRepo[]).map(toRepo).sort((a, b) => b.updated.localeCompare(a.updated));
      const t = Date.now();
      store.set(KEY, { t, repos });
      return { repos, source: "live", fetchedAt: t };
    } catch (e) {
      const error = e instanceof Error && e.message !== "Failed to fetch" ? e.message : "couldn't reach GitHub";
      const result: RepoResult = cached ? { repos: cached.repos, source: "stale-cache", fetchedAt: cached.t, error } : fallback(error);
      lastFailure = { t: Date.now(), result };
      return result;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/**
 * Repos to feature: the ones named in GITHUB_PINNED (in that order) if any match; otherwise the most
 * recently updated own repos (not forked, not archived, not the profile-README repo). Up to 6.
 */
export function pinnable(repos: Repo[]): Repo[] {
  const chosen = GITHUB_PINNED.map(n => repos.find(r => r.name.toLowerCase() === n.toLowerCase())).filter((r): r is Repo => !!r);
  if (chosen.length) return chosen.slice(0, 6);
  return repos.filter(r => !r.fork && !r.archived && r.name.toLowerCase() !== GITHUB_USERNAME.toLowerCase()).slice(0, 6);
}

/** First part of a repo's README as plain text (cached for 1 hour), or null if there is none. */
export async function getReadme(name: string): Promise<string | null> {
  const key = `gh-readme-${GITHUB_USERNAME}-${name}`;
  const cached = store.get<{ t: number; text: string | null } | null>(key, null);
  if (cached && Date.now() - cached.t < TTL) return cached.text;
  try {
    const res = await fetch(`${API}/repos/${encodeURIComponent(GITHUB_USERNAME)}/${encodeURIComponent(name)}/readme`, { headers: { Accept: "application/vnd.github.raw+json" } });
    if (res.status === 404) { store.set(key, { t: Date.now(), text: null }); return null; }
    if (!res.ok) return cached?.text ?? null;
    const text = (await res.text()).slice(0, 4000);
    store.set(key, { t: Date.now(), text });
    return text;
  } catch {
    return cached?.text ?? null;
  }
}

/** "3 days ago" style relative time. */
export function ago(iso: string | number): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  const units: [number, string][] = [[31536000, "year"], [2592000, "month"], [86400, "day"], [3600, "hour"], [60, "minute"]];
  for (const [n, u] of units) if (s >= n) { const v = Math.floor(s / n); return `${v} ${u}${v === 1 ? "" : "s"} ago`; }
  return "just now";
}

export const sourceNote = (r: RepoResult): string =>
  r.source === "live" ? "Live from the GitHub API."
  : r.source === "cache" ? `From the GitHub API, cached ${ago(r.fetchedAt!)}.`
  : r.source === "stale-cache" ? `Showing a saved copy from ${ago(r.fetchedAt!)} (${r.error}).`
  : `Showing a saved list (${r.error}). The links open the GitHub profile.`;
