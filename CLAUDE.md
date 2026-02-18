# UWS Website - Claude Instructions

## What This Is

The official website for **United We Stand**, Britain's best-selling independent Manchester United fanzine. Founded 1989, edited by Andy Mitten. Live at **www.uwsonline.com**.

Static site. No frameworks. GitHub Pages. The goal is driving subscriptions.

---

## How We Work

This is JD's project. Same partnership model as Power:

- **State intent before acting.** Don't build, then show — explain what you're about to do and why. JD can redirect before effort is wasted.
- **Ask when unclear.** Clarify ambiguous requirements rather than guessing.
- **Be direct.** No hedging, no apologizing, no cheerleading.
- **Keep it simple.** No frameworks, no abstractions for one-time operations. Three similar lines of code is better than a premature abstraction.

---

## STOP. READ FIRST. DON'T ASSUME.

Before making ANY code changes:

1. **Read the affected files FIRST** — don't assume you know what's there
2. **Check the scope of impact** — what other files consume this code?
3. **Make one change, verify, then proceed** — don't batch multiple changes hoping they all work

---

## Fix Things Properly

The error is not the problem. The error is a symptom. Do not work around errors.

1. **Trace to source** — not where the error appears, but where the bad state originates
2. **Explain the causal chain** — what sequence of events led to this?
3. **Fix at the appropriate level** — root cause, not symptom

If the proper fix is big, surface it:
> "The proper fix requires X. A workaround would do Y but leaves Z unfixed. Which path do you want?"

Never silently choose the workaround. JD decides whether to accept technical debt.

---

## Critical Rules (Non-Negotiable)

### 1. NEVER COMMIT WITHOUT EXPLICIT PERMISSION
Always ask. Wait for explicit "yes" before committing.

### 2. NEVER EDIT README.md
README.md is public-facing and intentionally minimal. Never add technical details, setup instructions, or project info.

### 3. KEEP DOCS MINIMAL
No UPDATES_SUMMARY.md, WHATS_NEW.md, CHANGES.md, or any other summary docs. Use git commit messages for change tracking. Technical docs belong in `/_internal/` only.

### 4. PORT 5500 ONLY
Dev server: `python3 -m http.server 5500`. Do NOT use port 8000 or 3000.

### 5. FIX ALL ISSUES
When code is reviewed, fix every issue found. "We'll fix it later" means it never gets fixed.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Markup | Static HTML (6 pages) |
| Styling | Tailwind CSS v4 via CDN + `css/styles.css` (central stylesheet) |
| JavaScript | Vanilla JS, no bundler, no framework |
| Fonts | Inter (400, 600, 700, 900) via Google Fonts |
| Hosting | GitHub Pages, auto-deploy on push to `main` |
| Automation | GitHub Actions: daily cover update from Exact Editions |
| Payments | PayPal forms (print), Exact Editions redirect (digital) |

## Design System

| Token | Value | Usage |
|---|---|---|
| `--united-red` | `#CC0000` | Primary brand, buttons, headings, icons |
| `--united-gold` | `#FFD700` | Accent text, highlights, "Since 1989" |
| `--gradient-red-dark` | `#1a0000` | Dark end of button gradients |

- Dark theme: `bg-black`, `bg-gray-900` for nav, gradients between the two
- Typography: Inter, uppercase headings, `tracking-refined` (0.05em) on buttons
- Cards: `bg-white/5 border border-white/10 rounded-xl`
- Buttons: gradient black-to-dark-red, red border, gold on hover

## File Structure

```
/                       # HTML pages (index, about, subscribe, archive, podcast, thankyou)
/css/styles.css         # Central stylesheet (Tailwind config, custom properties, all page styles)
/components/            # Nav and footer (loaded via fetch() in config.js)
/js/                    # config.js, main.js, homepage-nav.js, archive.js
/data/                  # JSON: current-issue.json, external-articles.json
/images/                # Public assets only
/images/mags/           # Magazine covers (80+)
/scripts/               # Node.js automation (cover fetcher)
/_internal/             # Internal docs (DEPLOYMENT.md, QUICKSTART.md) — not deployed
/old-site/              # Legacy PHP site — reference only, NOT deployed
```

## Component System

Nav and footer are HTML fragments in `/components/`, loaded client-side via `fetch()` in `config.js`. Every page has:
```html
<div id="site-nav"></div>   <!-- nav mount point -->
<div id="site-footer"></div> <!-- footer mount point -->
```

## Automated Agent Reviews

Use compound-engineering review agents automatically at these points:

**After implementing code changes (before saying "done"):**
- `compound-engineering:review:code-simplicity-reviewer` — YAGNI, dead code, simplification

**When to skip reviews:**
- One-line fixes, typo corrections, comment updates
- Config-only changes
- Changes < 10 lines in a single file

**Rules:**
- Run review agents in parallel
- Fix every issue the agents find before presenting the result to JD
- If an agent flags something you disagree with, surface it to JD

---

## Gotchas

- **Tailwind is CDN mode (Play CDN), not a build step.** The site loads `https://cdn.tailwindcss.com` as a `<script>` tag — Tailwind v3 compiles classes in the browser at runtime. There is no `tailwindcss` in package.json, no PostCSS, no build pipeline. This means the `tailwind.config` **must** be set via an inline `<script>` block (`tailwind.config = {...}`) on every page — it cannot live in a CSS file. The custom colors (`united-red`, `united-gold`, `gradient-red-dark`) and `tracking-refined` only work because of this JS config. Don't try to move the config into CSS or create a separate tailwind-config.js file. If you want ONE place for it, you'd need to add a build step.
- **Relative paths everywhere** — GitHub Pages requires `./` prefix on all links and assets. Never use absolute paths like `/images/...`.
- **Component loading is async** — nav and footer load via `fetch()`. Any JS that touches nav elements must wait for the component to load (see `homepage-nav.js` for the pattern).
- **Cover image is auto-updated** — `scripts/fetch-latest-cover.js` runs daily via GitHub Actions. Don't manually manage `data/current-issue.json` unless necessary.

---

**Last Updated:** February 2026
