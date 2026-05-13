# UiPath/fde-implementations — FDE Artifact Library

A single FDE-internal library of agent-callable assets: starters, components, knowledge, archives, tools. Reusable artifacts harvested from real FDE engagements, generalized, and packaged so the next engagement starts faster than the last.

This repo is the active half of the FDE Artifact Library. Its companion, [`UiPath/FDE-Customer-Engagements`](https://github.com/UiPath/FDE-Customer-Engagements), is the **engagement mono-repo**: all FDE engagements live there as `{customer}/{engagement}` subfolders, and archived deliverables are folders in an archived state — not a separate repo. Its sibling [`UiPath/fde-skills`](https://github.com/UiPath/fde-skills) (Ian Salmon) holds FDE-specific process skills (e.g., JIRA status update, incident filing, `discover-artifacts`) — **not** a competing platform-skills repo. Platform skills come from the broader UiPath skills repo via `uip` CLI.

**Source of truth:** [FDE Artifact Library (Confluence)](https://uipath.atlassian.net/wiki/spaces/FDEA/pages/90682163415/FDE+Artifact+Library) (currently v22, 2026-05-13) · See `FDE Coding Agent — Project Architecture v0.1` (April 2026) for the broader picture.

> **About this local directory.** This is a local scaffold staging the two Voya seed components Sheel is contributing into the existing `UiPath/fde-implementations` repo. The repo already exists and already hosts Joe Chiu's `coding-agent-starter`. The local directory carries the same name to make the eventual PR diff readable; the final landing structure depends on the folder-layout decision being worked through with Joe (see Confluence open items).

## Asset types (six)

| Asset type | What | Curation | How an FDE uses it |
|---|---|---|---|
| **Starters** | Hand-curated one-shot prompts (`PLAN.md` + `claude.md`) for whole-solution scenarios. Run end-to-end in 20–30 min; double as CLI + Skills regression test. | Owned, hand-curated. Joe's `coding-agent-starter` is the seed. | **Clone.** Copy the starter's `PLAN.md` into the engagement folder and kick off the agent. |
| **Components** | Reusable **code** building blocks: taxonomies, app templates, validation stations, eval harnesses, prompt templates. | Harvested from delivered engagements. Promoted after proven by usage. | **Search.** Agent uses `gh` CLI / GitHub MCP code search; pulls what fits. |
| **Knowledge base** | Architectural patterns, experience write-ups, design playbooks. Markdown. | PR review. Lower bar. | **Search.** Same as Components. Agent reads inline. |
| **Engagement archives** | Folders inside `UiPath/FDE-Customer-Engagements` in an archived state. "Archive" is a state, not a separate repo. Stub-and-pointer entries here in this repo only when extraction is blocked by customer policy. | At engagement close. Scrubbing checklist is the only gate. | **Search.** Agent walks archived folders for matching patterns / prior approaches. |
| **Reusable tools** | Standalone utilities (e.g. Keith's synthetic doc generator). | Same bar as components. | **Install.** Distributed via `uip` CLI; FDE installs once like any other agent tool. |
| **Showcase projects** | Full, runnable customer-facing demos for CSMs and AEs. V2 surface (Q4 2026+, Stefan-led). | Curated and maintained. | **Demo URL.** CSM/AE shares the live URL with a prospect; FDE not in the loop after launch. |

V0 seeds **Starters** (Joe's existing) and **Components** (Sheel's two Voya seeds). The other four are roadmap.

## What's in this scaffold (V0)

```
fde-implementations/                  (this local scaffold; rolls up into UiPath/fde-implementations)
├── _meta/index.json                  auto-generated catalog (v0 helper; defer to Joe's existing setup if any)
├── _template/component.md            copy this when authoring a new component
├── claims-intake-app/                Voya seed: app-template, accident-claims FNOL
└── doc-classification-taxonomy/      Voya seed: taxonomy, claims documents
```

The two seed components are headed under a `components/` directory in the live repo once the layout decision lands with Joe.

## How it grows (three flows)

1. **Consume: online, during an engagement.** The agent searches `UiPath/fde-implementations` for assets relevant to the active project. FDE pulls and adapts. Claude Code uses GitHub search directly — no separate indexing service in V0.
2. **Promote: at engagement close (single engagement).** The `discover-artifacts` skill in `UiPath/fde-skills` scans the local engagement folder, scrubs identifiers, drafts asset descriptions, and opens draft PRs against this repo. Late-May target.
3. **Curate: scheduled, across the mono-repo.** A scheduled job walks `UiPath/FDE-Customer-Engagements`; closed-engagement folders are identified via FDE Sentinel status; proposes patterns that repeat at scale. June target.

### Agent-assisted maintenance (continuous)

Keeping a library current is the hard part. The agent does this work too: weekly starter runs validate CLIs/skills end-to-end; periodic Claude sweeps fact-check Knowledge entries against current docs; broken references surface as PRs against this repo. The fly wheel only compounds if the maintenance is also automated.

## Consume an asset

Claude Code uses GitHub search directly against this repo. Filter by `domain`, `type`, and `uipath-products` in the frontmatter to surface candidates. Adopt = copy the asset subtree into the engagement repo's `src/<asset-name>/` and customize.

> A v0 helper `_meta/index.json` can be auto-built by GitHub Action on every push to `main`. The agent can read it as an alternative to walking the tree. A formal indexing service is deferred until GitHub search becomes the bottleneck.

## Contribute an asset

Assets are promoted from real engagements via the `discover-artifacts` skill. At engagement close:

1. Run the discover skill inside the engagement repo. It walks `src/`, `specs/`, utilities; identifies reusable candidates; scrubs client identifiers; drafts an asset description; and emits drafts to `_promotion-candidates/` (gitignored in the engagement repo).
2. The FDE reviews each candidate, edits, accepts/rejects.
3. The skill opens a draft PR against this repo for accepted candidates.
4. CODEOWNERS review: contract met, client data scrubbed, generic enough.
5. Merged assets show up in the catalog.

Full contract details in [CONTRIBUTING.md](CONTRIBUTING.md).

## Scope (v0)

- FDE-only contributions for V0. SE / Pre-Sales contribution flows open in Q4 2026 → Q1 2027.
- No formal indexing service — Claude Code reads GitHub directly, plus the v0 helper `_meta/index.json`.
- No manual gate-checking workflow beyond PR review.
- Promotion criteria are soft for v0; formalize at 5–10 PRs of pattern (~Q3).

## Status

`v0` — joint with Joe's `coding-agent-starter` (already in `UiPath/fde-implementations`) plus two Voya seed components staged here. Aligned to Confluence source of truth 2026-05-13.
