---
name: doc-classification-taxonomy
type: taxonomy
domain: fins
maturity: alpha
languages: [json]
uipath-products: [ixp, agent-builder]
created: 2026-05-06
contributors: [Sheel Patel]
source-engagement: private
---

# Doc Classification Taxonomy (Claims)

## What it is

A hierarchical taxonomy for classifying documents that appear in accident-claims intake and downstream review — police reports, photos, medical bills, repair estimates, witness statements, and the rest of the FNOL document set. Designed to be consumed by a classifier prompt or IXP extraction pipeline so downstream agents see structured `taxonomyNode` strings instead of raw filenames.

## When to use it

Reach for this when the engagement involves:

- Accident-claims document intake (auto, property, liability) where uploads land alongside a structured form.
- Any insurance pipeline that needs to route documents based on type — e.g., medical bills go to one queue, repair estimates to another.
- A starting point for a non-claims taxonomy: the top-level shape (`evidence`, `official`, `financial`, `medical`, `correspondence`, `unknown`) generalizes; the leaves are claims-specific.

If you only need a flat label list (no hierarchy), this is over-engineered — strip the tree and keep `leaves[]`.

## What's inside

- `taxonomy.json` — the full tree with descriptions for each node. The classifier consumes this directly.
- `taxonomy.md` — human-readable rendering for FDE / customer review.
- `examples/labelled-set.jsonl` — 12 example documents with their expected classification, suitable for spot-checks or as eval seed data.

## How to install

1. Copy `doc-classification-taxonomy/` into your engagement repo at `src/taxonomies/claims-docs/`.
2. Reference it from your classifier or IXP pipeline by path. The `claims-intake-app` component points at it via `app.config.json#app.taxonomyRef` by default.
3. Customize:
   - Add carrier-specific document types as new leaves under the closest existing parent (`official.*`, `evidence.*`, etc.).
   - Remove leaves that don't apply to your engagement to keep the classifier focused.
   - If you change a node path, search downstream consumers for the old path before merging.
4. Validate: `python validate.py taxonomy.json` (a tiny validator is included; checks tree shape and uniqueness).

## Inputs and outputs

**Inputs**

- The taxonomy itself is consumed by classifier components. No runtime input.

**Outputs**

- A `taxonomyNode` string (dotted path) for each classified document. Example: `"evidence.photo.vehicle"`, `"official.police-report"`, `"medical.bill"`.

## Known limitations

- `alpha` maturity — derived from one carrier's document mix. The leaves under `official.*` are US-centric (police reports, DMV records); international engagements need additions.
- No multi-label support. A document gets exactly one node. If a page is both a medical bill *and* contains photo evidence, current classifiers will pick one — usually whichever signal is dominant. Multi-label variant is on the v2 list.
- No language tag on nodes. English-only descriptions; if your classifier prompt needs translated descriptions, add a `descriptions` map per node.
- The hierarchy is shallow on purpose (≤3 levels). Going deeper helped on one engagement and hurt on another — keep it shallow until you have evidence otherwise.
