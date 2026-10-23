# STATUS: Epsilon Commons build

Last updated: 2026-10-23
Update this file at the end of every work session (through a pull request) and replace the copy in the Claude Project.

## Current phase
Phase 0: foundations (see PLAN.md, section 9).

## Done
- Master plan written (`PLAN.md`).
- Name chosen: "Epsilon Commons". Agreed by both founders (2026-10-23). Trademark checks done: Indian trademark registry and WIPO Global Brand Database searched; nothing serious found (searched 2026-10-22).
- GitHub organization `epsiloncommons` created (Free plan).
- Two-factor authentication (2FA) is on for the founder, and the organization-wide 2FA requirement is on.
- Billing checked: Free plan, paid-usage budget is $0.
- Repository `epsiloncommons.github.io` created (public).
- `README.md` committed to the root of the repo (one-time direct commit to `main`; see D13).
- Ruleset `protect-main` is active and tested: pull request required, no force-push, no deletion, no bypass actors. Required approvals are 0 for now (see D12).
- Repo settings from D7 applied (wikis off, squash-only merges, auto-delete head branches, Discussions on, and the rest as listed in D7).

## In progress
- Co-owner is turning on 2FA and will then join; the founder will say when they have joined.
- Organization display name, description and profile picture (not yet confirmed as finished).
- First pull request: upload `PLAN.md`, `STATUS.md` and `DECISIONS.md` to the repo.

## Next (in order)
1. Co-owner joins; confirm they are an Owner. Then raise required approvals on `protect-main` from 0 to 1 (D12).
2. Merge the first pull request (planning documents).
3. Confirm GitHub Pages is set up: Settings > Pages > Source = GitHub Actions.
4. Settle the licence (see open questions), then add `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and expand the README, each through a pull request.
5. Build the Quarto skeleton (home, about, blog index, wiki index) and a deploy workflow. Include the independence line on the About page.
6. Add the build checks (site build, LaTeX build, link and spell checks), then add them as required status checks in `protect-main`.
7. Add one sample LaTeX paper that builds to PDF in CI.
8. Create Discussions categories and set up giscus (the Discussions feature itself is already on).
9. Onboard the first members with a short walkthrough.

## Open questions
- Final site generator (default: Quarto; confirm after the skeleton works).
- Licence for content and code (suggested: CC BY 4.0 for content, MIT for code). Decide with the co-owner before adding `LICENSE` and before any outside contribution.
- Will "Modern Bourbaki" be used as a section name? If so, add the independence disclaimer (already in the README).
- Are discussions public from day one?
- Who are the first maintainers?

## Known issues
None yet. Log post-launch issues here with date, symptom, cause and fix.

## Documentation to fix in PLAN.md (found 2026-10-23)
- Section 3 recommends buying a custom domain; D4 decided on no custom domain for now. D4 wins.
- Section 3 and section 4 mention about 10 builds/hour; D4 says that limit does not apply to a custom Actions workflow. Verify in GitHub's official docs when setting up Pages, then make both files agree.
- Section 9 (Phase 0) and section 12 still list the community name as undecided; it is now decided.

## Verify (not yet confirmed)
- No Copilot seats assigned; Copilot not enabled for members.
- Public email on the org profile is blank or intentionally set.
- GitHub Pages source is set to GitHub Actions.
