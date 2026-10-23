# DECISIONS: Epsilon Commons

A running log of what we decided and why. Add new entries at the bottom; never delete old ones, mark them "Superseded by" instead.

Status key: **Decided** = agreed and in effect; **Proposed** = recommended, not yet confirmed or applied; **Applied** = decided and carried out.

---

## D1. Home for the project: a GitHub Organization
- **Status:** Decided (organization created 2026-10-22).
- **Why:** Only one `username.github.io` site is allowed per personal account, and the founder's is already used. An organization gives its own site address, roles and teams, and ownership that survives any one person leaving.
- **Consequence:** Keep at least two Owners.

## D2. Name: Epsilon Commons (`epsiloncommons`)
- **Status:** Decided. Confirmed by both founders (2026-10-23).
- **Why:** Builds on "The Epsilon Room" and signals open, shared work. Avoids the "Bourbaki" trademark question.
- **Checks done (2026-10-22):** Indian trademark registry (wordmark and phonetic, Class 41) and WIPO Global Brand Database. Nothing serious found. Results for "epsilon" and "commons" were unrelated single-word marks.
- **Account name** is lowercase with no hyphen (`epsiloncommons`); display name is "Epsilon Commons". Renaming later breaks old links, so this is now fixed.

## D3. Use of the "Bourbaki" name
- **Status:** Decided: not used in the organization name.
- **Why:** Copyright does not protect names, but trademark could apply to a close association with the existing Bourbaki group. If "Modern Bourbaki" is kept as a section name, add: "This community is independent and not affiliated with Nicolas Bourbaki."
- **Note:** The README already carries the independence line; keep it on the About page too.

## D4. Hosting: free GitHub Pages at epsiloncommons.github.io
- **Status:** Decided. No custom domain for now.
- **Why:** Free, reliable, static hosting from the same repo as the content.
- **Limits to respect (verify in GitHub docs):** about 1 GB published site, about 100 GB/month soft bandwidth, 10-minute deploy timeout. The 10 builds/hour limit does not apply when using a custom Actions workflow.
- **If we outgrow it:** put Cloudflare (free) in front for caching, or deploy the same static output to Cloudflare Pages or Netlify. A custom domain (about USD 8-12/year for .org or .com) would also hide any later org rename.

## D5. Cost rule: nothing paid
- **Status:** Decided. Billing page checked 2026-10-23: Free plan, paid-usage budget $0.
- **Why:** Free plan covers everything in the plan. Billing email defaults to the founder's email; that is only a notice address.
- **Rules:** no payment method on the org; any paid-usage budget stays at $0; no Copilot seats, Git LFS, Codespaces or other metered products without both Owners agreeing.

## D6. Security baseline
- **Status:** Partly applied. 2FA is on for the founder and the organization-wide 2FA requirement is on (2026-10-23). Co-owner to turn on 2FA before joining. `main` is protected (see D12).
- **Rules:** 2FA for both Owners first, then require 2FA for all members. Authenticator app or passkey preferred over SMS. Recovery codes saved somewhere other than the phone. Few Owners, everyone else a Member. No secrets or private data in the repo. `main` protected, with pull requests and review required.

## D7. Repository settings (recommended from the settings screenshots)
- **Status:** Applied (2026-10-23), as reported by the founder.
- Wikis: off (the site has its own `wiki/` folder reviewed through pull requests).
- Issues, Discussions, Projects, Pull requests: on.
- Merge methods: squash only (merge commits off, rebase off).
- "Always suggest updating pull request branches": on.
- Auto-merge: off for now.
- Automatically delete head branches: on.
- Comments on individual commits: off.
- Require sign-off on web commits: off. Git LFS in archives: off. Sponsorships: off.
- Auto-close linked issues on merge: on.
- Visibility stays public (required for free Pages). Do not touch the Danger Zone buttons.

## D8. Site generator: Quarto (default)
- **Status:** Proposed; confirm after the skeleton works.
- **Why:** Native LaTeX math, theorem environments, citations, cross-references, blog listings, and it can render to HTML and PDF. Alternatives: Hugo (speed at huge scale), Jekyll (zero-config, fewer plugins), Docusaurus.

## D9. Discussion layer: GitHub Discussions with giscus
- **Status:** Proposed. The Discussions feature is switched on (D7); categories and giscus are not set up yet.
- **Why:** Free, threaded, searchable, tied to GitHub accounts, and keeps discussion inside the same permission and moderation system. WhatsApp stays for fast chat; the site is the durable record.

## D10. Workflow
- **Status:** Decided.
- **Rule:** every change goes through a pull request with at least one approval and passing checks (LaTeX build, site build, link and spell checks). PDFs are built by CI and not committed to `main`.
- **Note:** until the co-owner joins and the build checks exist, D12 describes what is actually enforced.

## D11. Source of truth
- **Status:** Decided.
- **Rule:** the repository is the permanent record. The Claude Project holds a working copy of PLAN.md, STATUS.md and DECISIONS.md, refreshed at the end of each work session.

## D12. Ruleset `protect-main` (temporary approval count)
- **Status:** Applied (2026-10-23), tested working.
- **What it enforces:** pull request required before merging, no force-push, no branch deletion, no bypass actors, applied to the default branch (`main`).
- **Temporary setting:** required approvals = 0, because the founder is the only member and cannot approve their own pull request. Raise to 1 as soon as the co-owner has joined, which brings this in line with D10.
- **Later:** add the build checks as required status checks once they exist.

## D13. One-time bootstrap commit to `main`
- **Status:** Decided (2026-10-23), exception used once.
- **What happened:** a branch cannot be protected before it exists, so the very first file (`README.md`) was committed directly to `main` while the repo was empty and the founder was the only member. The ruleset (D12) was created straight afterwards.
- **Rule going forward:** no direct commits to `main`.

## D14. Planning documents live in the repo and change by pull request
- **Status:** Decided (2026-10-23).
- **Rule:** `PLAN.md`, `STATUS.md` and `DECISIONS.md` are uploaded to the repo root in the first pull request. Later updates (including the end-of-session STATUS.md refresh) also go through pull requests. The Claude Project copy is refreshed afterwards (D11).
- **Pending clean-up:** the inconsistencies in PLAN.md listed in STATUS.md ("Documentation to fix in PLAN.md") are fixed in a later small pull request.
