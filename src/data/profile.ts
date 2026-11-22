/**
 * Everything about Shreshtha lives here. Edit this file to change the portfolio:
 * the desktop apps, the terminal, the /resume page, SEO tags and the sitemap all read from it.
 *
 * Keep it plain data (no DOM code): the build also imports it to generate static pages.
 */

/** Your GitHub username. Change it here only. TODO: confirm this is your real username. */
export const GITHUB_USERNAME = "shreshtha-soni";

/**
 * The public URL the site will live at (no trailing slash). Used for the canonical URL,
 * Open Graph tags, robots.txt and sitemap.xml.
 * TODO: replace with your custom domain (or your real *.vercel.app URL) once deployed.
 */
export const SITE_URL = "https://shreshtha-os.vercel.app";

export const GITHUB_URL = `https://github.com/${GITHUB_USERNAME}`;

export interface Job {
  role: string;
  org: string;
  when: string;
  /** short name, used for file names like experience/tagshop-ai.md */
  short: string;
  bullets: string[];
}

export interface Project {
  name: string;
  status: string;
  tagline: string;
  bullets: string[];
  stack: string[];
  /** Public links (download, live site). Entries with an empty url are hidden. */
  links?: { label: string; url: string }[];
}

export const profile = {
  name: "Shreshtha Soni",
  nick: "Keshav",
  initials: "SS",
  /** Profile photo in public/ (square; shown cropped to a circle). Set to "" to show the initials instead. */
  photo: "/avatar.jpg",
  title: "Full-stack developer",
  city: "Jaipur",
  location: "Jaipur, India",
  line: "B.Tech CSE student at JECRC University, Jaipur. I build products and ship them to real users.",
  status: "Open to software engineering internships",
  about: [
    "I'm Shreshtha Soni, Keshav to most people. I'm a B.Tech Computer Science student at JECRC University, Jaipur (2024 to 2028), and I like taking products all the way from idea to real users.",
    "I've shipped an Android app to the Google Play Store, a school management ERP that schools use every day, and live websites for paying clients. I also did a paid, on-site full-stack internship at Tagshop.ai, an AI video startup.",
    "I started in graphic design and video editing, so I care how a product looks as much as how it runs. Right now I'm sharpening my DSA and going deeper into machine learning. Away from the keyboard, I play classical flute."
  ],
  education: {
    degree: "B.Tech, Computer Science & Engineering",
    school: "JECRC University",
    city: "Jaipur",
    when: "Jul 2024 – Jul 2028",
    /** YYYY-MM, used to compute "uptime" in neofetch and htop */
    started: "2024-07",
    gradYear: "2028"
  },
  work: [
    {
      role: "Full-Stack Developer Intern", org: "Tagshop.ai · AI UGC video platform · Paid, on-site", when: "Jun 2026 – Oct 2026", short: "Tagshop.ai",
      bullets: [
        "Worked across the frontend and backend of a production AI video platform, shipping features and fixes used by live customers.",
        "Mapped the platform's system architecture from its routing layer and wrote the engineering onboarding document with diagrams.",
        "Debugged and fixed image-quality (blur) issues in the media rendering pipeline.",
        "Analysed 411 subscription cancellations in Node.js and presented churn drivers to leadership."
      ]
    },
    {
      role: "Freelance Software Developer", org: "Self-employed · Jaipur", when: "2026 – now", short: "Freelance",
      bullets: ["Built and launched the live test-booking website for Micro Path Labs: patient registration, test catalogue, slot scheduling and report tracking."]
    },
    {
      role: "Business & Creative Manager", org: "Triambika Infotech Pvt. Ltd. · Jaipur", when: "Dec 2025 – May 2026", short: "Triambika",
      bullets: [
        "Ran creative and client work for brands in India and Dubai: pitch decks, brand proposals, product videos and social content.",
        "Built Python and prompt-based automation for content generation."
      ]
    }
  ] as Job[],
  projects: [
    {
      name: "Galla", status: "Live on Google Play", tagline: "Business management app for small shop owners",
      bullets: ["Designed, built and published the Android app, from closed testing to public release.", "Backend APIs and relational database, deployed on AWS."],
      stack: ["Android", "REST APIs", "SQL", "AWS"],
      links: [{ label: "Get it on Google Play", url: "" }] // TODO: Play Store URL
    },
    {
      name: "School Management ERP", status: "In production", tagline: "A lean alternative to bloated school ERPs",
      bullets: ["Admin uploads student data once; it stays in sync in real time for teachers and parents.", "Role-based access and fast lookup by student name or roll number."],
      stack: ["Python", "Next.js", "SQL", "Docker", "AWS"],
      links: [{ label: "Open the live site", url: "" }] // TODO: live URL
    },
    {
      name: "Micro Path Labs", status: "Live", tagline: "Test-booking website for a pathology lab (client)",
      bullets: ["Online test booking with slot scheduling and report tracking for a working lab."],
      stack: ["React", "REST APIs", "SQL"]
    }
  ] as Project[],
  skills: {
    "Languages": ["C++", "Java", "Python", "JavaScript", "SQL"],
    "CS fundamentals": ["DSA", "OOP", "DBMS", "Operating Systems", "Computer Networks"],
    "Web": ["React", "Next.js", "Node.js", "Express", "FastAPI", "REST APIs", "Tailwind"],
    "Data & cloud": ["MySQL", "PostgreSQL", "Supabase", "AWS", "Docker", "Git"],
    "Learning now": ["Machine Learning", "scikit-learn", "pandas", "NumPy"],
    "Design & AI media": ["Photoshop", "Illustrator", "Premiere Pro", "Kling AI", "ElevenLabs"]
  } as Record<string, string[]>,
  /** Self-assessed levels shown by the terminal `skills` command. */
  skillMeters: {
    "C++ / DSA": 70, "Java": 55, "Python": 82, "JavaScript": 85, "React / Next.js": 85,
    "Node / FastAPI": 75, "SQL / DBs": 75, "AWS / Docker": 68, "Machine learning": 35, "Design / video": 90
  } as Record<string, number>,
  contact: {
    email: "shreshtha.soni1111@gmail.com",
    /** E.164 format, used for tel: links */
    phone: "+919587136919",
    /** how the number is shown */
    phoneDisplay: "+91 95871 36919",
    linkedin: "linkedin.com/in/shreshtha-soni",
    github: GITHUB_URL.replace("https://", ""),
    place: "Jaipur, India · open to relocate"
  },
  /** Profile README shown in the GitHub app. **bold** is supported. */
  githubReadme: {
    heading: "Hi, I'm Shreshtha (Keshav)",
    body: "B.Tech CSE student at JECRC University and full-stack developer. I shipped **Galla** to the Play Store, a **school ERP** that runs in production, and client sites like Micro Path Labs. Ex full-stack intern at **Tagshop.ai**.",
    currently: "Currently: DSA in C++ every day, and going deeper into machine learning.",
    chips: ["C++", "Java", "Python", "JavaScript", "React", "Next.js", "Node.js", "FastAPI", "SQL", "AWS", "Docker", "Git"]
  }
};

/** Career as commits, newest first: [hash, date, message, refs]. Shown by Career.git and `git log`. */
export const COMMITS: [string, string, string, string][] = [
  ["a91f2c0", "Nov 2026", "feat(galla): public release on Google Play", "HEAD -> main"],
  ["7c3d9e1", "Oct 2026", "chore(tagshop): wrap up 4-month full-stack internship", ""],
  ["5be04a7", "2026", "feat(school-erp): ship to production (Python + Next.js on AWS)", ""],
  ["e2a7731", "2026", "feat(freelance): launch Micro Path Labs booking site", ""],
  ["c0ffee1", "Jun 2026", "feat(tagshop): join as paid on-site full-stack intern", "tag: v2.0"],
  ["3f8d210", "Dec 2025", "feat(triambika): business & creative manager, client work + AI automation", ""],
  ["1d4e5a9", "2025", "refactor: move from design into engineering", ""],
  ["0000001", "Jul 2024", "init: start B.Tech CSE at JECRC University", "tag: v1.0"]
];

/**
 * Fallback for the GitHub app and `gh repo list` when the GitHub API can't be reached
 * (offline, rate-limited, or the username is wrong). These link to your profile, not to repos,
 * because the real repo URLs aren't known offline.
 */
export const FALLBACK_PINS = [
  { name: "galla", description: "Business management Android app for small shop owners. Live on Google Play.", language: "Android", color: "#3ddc84" },
  { name: "school-erp", description: "Lean school ERP: upload once, real-time for admins, teachers and parents.", language: "Python · Next.js", color: "#3572A5" },
  { name: "micro-path-labs", description: "Test-booking website for a pathology lab (client project).", language: "React", color: "#61dafb" },
  { name: "shreshtha-os", description: "This portfolio: a tiny Linux desktop in the browser.", language: "TypeScript", color: "#3178c6" }
];

/** The playful process list in htop: [command, user, base cpu]. */
export const PROCESSES: [string, string, number][] = [
  ["react.js", "frontend", 18], ["next.js", "frontend", 14], ["node", "backend", 16], ["python3", "backend", 22], ["fastapi", "backend", 9],
  ["g++ dsa.cpp", "dsa", 25], ["java", "dsa", 8], ["postgres", "data", 7], ["mysqld", "data", 6], ["dockerd", "infra", 11],
  ["aws-cli", "infra", 8], ["git", "tooling", 5], ["sklearn --learn", "ml", 19], ["photoshop", "design", 4], ["premiere", "design", 3], ["chai", "fuel", 31]
];

/** A project's links that have a URL. */
export const projectLinks = (p: Project) => (p.links ?? []).filter(l => l.url);

/** Years and months since `profile.education.started`, e.g. "2 years, 4 months". */
export function uptime(now = new Date()): { years: number; months: number; long: string; short: string } {
  const [y, m] = profile.education.started.split("-").map(Number);
  const total = Math.max(0, (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m));
  const years = Math.floor(total / 12), months = total % 12;
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
  return { years, months, long: `${plural(years, "year")}, ${plural(months, "month")}`, short: `${years}y ${months}m` };
}
