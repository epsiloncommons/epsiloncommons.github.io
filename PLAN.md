# Community Math Collaboration Site: Master Plan

> Audience: the founder, student collaborators, and any AI assistant joining the build.
> Read this file first. Treat it as the source of truth; propose changes via pull request.

## 1. Vision

A Polymath-style open collaboration hub for students and researchers across institutes:

- A **blog** for announcements, problem threads and expository posts.
- A **wiki/library** of notes, definitions, results and reading lists.
- A **papers area** where LaTeX sources live in Git, and PDFs are built automatically and published.
- **Structured discussion** (threaded, searchable, math-enabled) that overflows from WhatsApp.
- **Strong version control**: every change is a reviewed pull request; history is permanent.

WhatsApp stays as the fast chat layer. The site is the durable, searchable, citable layer.

## 2. Guiding principles

1. **Git is the source of truth.** No content lives only in a database or a chat.
2. **Static first.** A static site is fast, free to host, secure, and scales to very large traffic.
3. **Everything reproducible.** PDFs and pages are built by CI from source, never uploaded by hand.
4. **Low barrier to contribute.** A student must be able to fix a typo from the browser, with no installs.
5. **Review before publish.** `main` is protected; changes merge only through pull requests.
6. **Boring technology.** Prefer tools with large communities; avoid bespoke code.

## 3. Hosting decision

GitHub allows **one user site** per account (`username.github.io`), already used by the existing blog.
Everything else is done in one of two ways:

| Option | URL | Verdict |
|---|---|---|
| Project site in a new repo of the personal account | `username.github.io/repo-name` | Works, but ties the community to one person's account |
| **GitHub Organization** with an org site | `orgname.github.io` | **Recommended**: shared ownership, roles, teams, succession |
| Custom domain on top of either | `yourcommunity.org` | **Recommended** once the name is settled (~USD 10-15/year) |

Plan: create an organization, put the main site in `orgname/orgname.github.io`, add a custom domain later.
Make at least two people org **Owners** so the project never depends on one account.

Known GitHub Pages limits (verify at docs.github.com before relying on them): published site up to about 1 GB,
soft bandwidth about 100 GB/month, about 10 builds/hour. If traffic or size outgrows this, the same static output
deploys unchanged to Cloudflare Pages or Netlify.

## 4. Architecture

```
 Contributor (browser or local)
        |  pull request
        v
 GitHub repo (main, protected) ---- GitHub Actions CI ----+
        |                                                 |
        |  1. lint / spell-check / link-check             |
        |  2. latexmk builds every paper to PDF           |
        |  3. Quarto (or chosen SSG) builds the site      |
        v                                                 v
 GitHub Discussions  <--- giscus comments --->     GitHub Pages (static site + PDFs)
```

### Recommended stack

- **Site generator: Quarto.** Native LaTeX math, can render to HTML and PDF, has blog listings, citations,
  cross-references and theorem environments. Alternatives if the team prefers: Hugo (fastest at huge scale),
  Jekyll (zero-config on GitHub Pages, but limited plugins), Docusaurus (good docs/blog, React-based).
- **Math rendering:** KaTeX or MathJax in the browser (Quarto supports both).
- **PDF builds:** `latexmk` inside GitHub Actions (for example the `xu-cheng/latex-action`), one job per paper.
- **Comments and discussion:** GitHub Discussions, embedded on pages with **giscus**. Needs a GitHub account, which is fine for this audience.
- **Search:** the generator's built-in search at first; Algolia DocSearch or Pagefind later.
- **Large files:** do not commit built PDFs or big binaries to `main`. CI publishes PDFs to the site output and attaches them to GitHub Releases.

## 5. Repository layout

```
orgname.github.io/
├─ README.md                # what this is, how to contribute (short)
├─ PLAN.md                  # this file
├─ CONTRIBUTING.md          # step-by-step contribution guide for students
├─ CODE_OF_CONDUCT.md
├─ LICENSE                  # CC BY 4.0 for content, MIT for code (confirm with team)
├─ _quarto.yml              # site config
├─ index.qmd                # home page
├─ blog/                    # one folder per post: blog/2026-10-21-title/index.qmd
├─ wiki/                    # topic pages (algebra/, analysis/, graph-theory/, ...)
├─ projects/                # Polymath-style collaborative problems
│  └─ project-name/
│     ├─ index.qmd          # statement, status, how to join
│     ├─ threads/           # numbered research threads
│     └─ paper/             # LaTeX source of the project's paper
├─ papers/                  # standalone LaTeX papers
│  └─ paper-slug/
│     ├─ main.tex
│     ├─ refs.bib
│     └─ figures/
├─ templates/               # LaTeX preamble, paper template, post template
├─ assets/                  # css, small images, logos
└─ .github/
   ├─ workflows/            # build.yml, pdf.yml, links.yml
   ├─ ISSUE_TEMPLATE/
   ├─ PULL_REQUEST_TEMPLATE.md
   └─ CODEOWNERS
```

Naming rules: lowercase, hyphens, no spaces; blog folders start with an ISO date.

## 6. Collaboration and version control workflow

1. Contributor forks (or, for team members, branches) and edits files. GitHub's web editor works for small fixes.
2. Opens a pull request using the template (what changed, why, preview link).
3. CI runs: spell-check, link-check, LaTeX build, site build. A **preview** of the site is attached to the PR.
4. At least one reviewer from `CODEOWNERS` for that folder approves.
5. Squash-merge into `main`; CI deploys automatically.

Branch protection on `main`: require PR, require passing CI, require 1 approval, block force-push.

### Roles (GitHub Teams)

| Role | Can do |
|---|---|
| Owners (2 or more) | Settings, domain, permissions |
| Maintainers | Review and merge; manage CI |
| Editors | Review content in their area (by CODEOWNERS) |
| Contributors | Fork and open pull requests |
| Readers | Everyone, no account needed |

## 7. Discussion model (Polymath-style)

- Each research problem gets a folder under `projects/` and a pinned **Discussion** category.
- Numbered threads ("Thread 1, Thread 2, ...") as in Polymath: when a thread reaches about 100 comments, a maintainer
  summarises it in a new post and opens the next thread. The summary is committed to Git, so progress is never lost in chat.
- A project page always shows: problem statement, current status, open questions, who is working on what, and links to threads and the draft paper.
- Idea flow: WhatsApp (informal) -> GitHub Discussion (structured) -> wiki or paper (permanent, citable).

## 8. LaTeX pipeline details

- One shared `templates/preamble.tex` (theorem environments, macros, bibliography setup) so every paper looks consistent.
- Each paper builds independently; a failing paper must not block unrelated ones.
- CI uploads PDFs as workflow artifacts on pull requests and publishes them to `/pdf/<slug>.pdf` on merge.
- Authorship and attribution: every paper has an `AUTHORS` or `CONTRIBUTORS` note; Git history provides the audit trail.
- Keep a `docs/latex-style-guide.md` covering macros, naming of labels, and figure conventions.

## 9. Phased roadmap

**Phase 0: foundations (week 1)**
- Create the GitHub organization; add 2 or more owners.
- Create the site repo, add this plan, README, CONTRIBUTING, license, code of conduct.
- Decide the community name and (optionally) buy the domain.

**Phase 1: minimum viable site (weeks 2-3)**
- Quarto site skeleton with home, about, blog index, wiki index.
- CI: site build and deploy to GitHub Pages.
- One sample blog post and one sample LaTeX paper building to PDF.

**Phase 2: collaboration features (weeks 4-6)**
- Enable GitHub Discussions and giscus; set up categories.
- Branch protection, CODEOWNERS, PR template, preview deploys.
- Link-check and spell-check workflows.

**Phase 3: community onboarding (weeks 6-8)**
- Write a 1-page "How to contribute" with screenshots.
- Run one live walkthrough for the WhatsApp group; give 3 to 5 starter issues labelled `good-first-issue`.
- Launch the first Polymath-style project.

**Phase 4: scale (ongoing)**
- Search upgrade, tagging and categories, RSS feed, newsletter.
- Migrate hosting to Cloudflare Pages or Netlify if limits are reached.
- Add moderation guidelines and a rotating editor-of-the-month.

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Single point of failure (one account) | Organization with 2 or more owners; mirror the repo |
| Contributors afraid of Git | Browser-editing guide, templates, live walkthrough |
| Low-quality or spam contributions | Branch protection, mandatory review, code of conduct |
| Site or PDFs become too large | PDFs via Releases/CI output, compress images, keep binaries out of Git history |
| Plagiarism or licence confusion | Clear licence, attribution policy, citation rules |
| Burnout of the founder | Roles, rotating maintainers, documented processes |

## 11. Instructions for AI assistants joining the build

- Read this file and `CONTRIBUTING.md` before changing anything.
- Make changes through branches and pull requests; never push to `main`.
- Do not invent URLs, versions or limits; verify against official docs and state the source in the PR.
- Keep each PR small and single-purpose; describe how you tested it (CI link, local build output).
- For LaTeX: reuse `templates/preamble.tex`; do not add packages without justification; ensure the paper compiles cleanly with `latexmk`.
- For diagrams (graphs, TikZ): check correctness of vertices, edges and labels before submitting; render and look at the output.
- Do not store secrets, tokens or personal data in the repository.
- If a decision is not covered here, open an issue labelled `decision` rather than guessing.

## 12. Open decisions (to be settled by the founders)

1. Community name and domain.
2. Final generator choice (default: Quarto).
3. Licence for content and code.
4. Whether discussions are public to everyone or visible only to members at first.
5. Initial list of maintainers and their areas.
