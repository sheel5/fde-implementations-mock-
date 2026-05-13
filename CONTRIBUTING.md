# Contributing to UiPath/fde-implementations (FDE Artifact Library)

The FDE Artifact Library holds six asset types: **Starters, Components, Knowledge Base, Engagement Archives, Reusable Tools, Showcase Projects**. Each follows the same shape — a directory plus a description file with required frontmatter and body sections. Most assets arrive via the `discover-artifacts` skill at engagement end; you can also hand-author one.

**Source of truth:** [FDE Artifact Library (Confluence)](https://uipath.atlassian.net/wiki/spaces/FDEA/pages/90682163415/FDE+Artifact+Library)

## Where assets live

- **Starters** → `starters/<name>/`
- **Components** → `components/<name>/`
- **Knowledge base** → `knowledge/<name>.md` (single-file entries OK)
- **Reusable tools** → `tools/<name>/`
- **Showcase projects** → `showcase/<name>/` (V2 surface — Q4 2026+)
- **Engagement archives** → not here. Live as folders inside [`UiPath/FDE-Customer-Engagements`](https://github.com/UiPath/FDE-Customer-Engagements) in an archived state. "Archive" is a state of the folder, not a separate repo. If extraction is blocked by customer policy, leave an `archives/<engagement>.md` stub here in this repo pointing to "reach out to {FDE name}."

> Folder layout in the mono-repo is still being finalized with Joe (open item per Confluence). The directories above are the proposed shape.

## The asset contract

Every asset is a directory: `<asset-type>/<kebab-case-name>/`. It must contain an asset description file (`component.md` for components, `starter.md` for starters, etc., or a unified `asset.md` once `discover-artifacts` lands). The frontmatter is what makes it machine-readable; the body is what makes it human-readable. Both required.

```markdown
---
name: <kebab-case-name>
type: starter | component | knowledge | tool | archive-stub | showcase
domain: hls | fins | retail | mfg | cross-vertical
maturity: alpha | beta | stable
languages: [python, typescript, ...]
uipath-products: [agent-builder, ixp, maestro, action-center, ...]
created: YYYY-MM-DD
contributors: [name1, name2]
source-engagement: <engagement-name-or-private>
---

# <Asset name>

## What it is
1–3 sentences. The agent reads this first.

## When to use it
The signals an agent or human looks for when deciding to drop this in.

## What's inside
File-by-file inventory with one-line descriptions.

## How to install
Concrete steps: copy directory, install deps, register in your engagement, etc.

## Inputs and outputs
Contracts. Schemas if structured.

## Known limitations
Caveats so the next FDE doesn't burn a day rediscovering them.
```

A blank template is at [`_template/component.md`](_template/component.md). Copy it for now; will generalize to `_template/asset.md` once the discover skill lands.

## Genericization rules (the bar for "generic enough")

An asset must not contain:
- Customer or engagement names (the customer's company, brand, product names).
- PII or customer-specific identifiers (account numbers, employee names, emails, phone numbers, addresses).
- Internal IDs that only resolve in a specific tenant (queue IDs, asset IDs, folder IDs, bucket names tied to a customer).
- Hardcoded paths, URLs, or credentials from a specific engagement.
- Domain-specific regex or validation rules tied to a single customer's data shape.

If an asset depends on configuration (e.g., target queue, schema version), expose it via:
- `config.example.json` or `.env.example` — committed, populated with placeholder values.
- A `# How to install` section that names every value the next FDE must set.

When customer policy makes scrubbing impossible, propose an `archive-stub` entry instead — a markdown file pointing back to the FDE who delivered the work.

## V0 promotion criteria (soft policy)

A PR is mergeable if all of:
1. Contract met (frontmatter + all body sections).
2. Client data scrubbed (see above).
3. Generic enough — at least one alternative engagement can plausibly use it. If you can't name a second engagement that would benefit, it's probably not ready.
4. Installable in under 10 minutes by a fresh FDE.
5. `Known limitations` is honest. Sandbagging here costs the next FDE a day.

Curation gate differs by asset type:
- **Starters:** hand-curated, owned. Higher bar.
- **Components / Reusable tools:** proven by usage. Founders' exemption applies to the V0 Voya seeds.
- **Knowledge base:** lower bar, PR review only.
- **Engagement archives / archive stubs:** scrubbing checklist is the gate.
- **Showcase projects:** curated and maintained; V2 surface.

The checklist above will formalize once we have 5–10 PRs of pattern — likely Q3 2026.

Beyond PR review, the agent runs continuous maintenance: weekly starter runs catch CLI/skill drift, periodic Claude sweeps fact-check Knowledge entries against current docs, and broken references surface as PRs. Treat agent-opened maintenance PRs the same as human-opened ones.

## PR flow

1. Branch off `main`: `feat/<asset-name>` or `update/<asset-name>`.
2. Add or modify the asset directory. Don't touch unrelated assets in the same PR.
3. Fill the PR template checklist.
4. Tag CODEOWNERS reviewers (auto-tagged by GitHub).
5. CI (or the v0 `_meta/build_index.py` helper) rebuilds the catalog on merge if wired.

## Engagement repo `.gitignore` additions

When the `discover-artifacts` skill runs inside an engagement repo, it writes to `_promotion-candidates/`. **That directory must be gitignored in the engagement repo** — its contents are pre-genericization and may still contain client identifiers. The discover skill is responsible for checking and adding the entry; verify before your first run.

## Questions

Ping #amer-fde, open a discussion on this repo, or read the [Confluence page](https://uipath.atlassian.net/wiki/spaces/FDEA/pages/90682163415/FDE+Artifact+Library).
