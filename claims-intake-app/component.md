---
name: claims-intake-app
type: app-template
domain: fins
maturity: alpha
languages: [typescript]
uipath-products: [agent-builder, action-center, maestro]
created: 2026-05-06
contributors: [Sheel Patel]
source-engagement: private
---

# Claims Intake App

## What it is

An Action Center app template for first-notice-of-loss (FNOL) intake on accident claims. Captures structured claim metadata, attaches supporting documents, classifies them via the paired [`doc-classification-taxonomy`](../doc-classification-taxonomy/) component, and hands off a normalized payload to a downstream Maestro queue for triage.

## When to use it

Reach for this when the engagement involves:

- An insurance carrier or TPA accepting accident claims (auto, property, liability).
- Customer-facing FNOL where a human submits initial details and uploads documents (police reports, photos, repair estimates, medical bills).
- A downstream agent or human reviewer that needs the intake to arrive structured and pre-classified.

If the engagement is non-insurance but follows the same shape (intake form → document upload → classify → queue handoff), this is still a reasonable starting point — adjust the schema.

## What's inside

- `app.config.example.json` — Action Center app definition (sections, fields, validation rules). Copy to `app.config.json` and customize.
- `schema/fnol.schema.json` — JSON schema for the FNOL payload emitted to the downstream queue.
- `schema/document-attachment.schema.json` — schema for each uploaded document with classification metadata.
- `prompts/classify-attachment.md` — prompt template the embedded agent uses to classify uploaded documents against the taxonomy.
- `examples/sample-fnol-payload.json` — what a completed intake looks like on the wire.
- `README.md` — quickstart with screenshots placeholder.

## How to install

1. Copy `claims-intake-app/` into your engagement repo at `src/apps/claims-intake/`.
2. `cp app.config.example.json app.config.json` and set:
   - `app.title` and `app.description` for the customer.
   - `app.targetQueue` to the Orchestrator queue name where intakes should be enqueued.
   - `app.taxonomyRef` to the path of your taxonomy component (default points at `../doc-classification-taxonomy/taxonomy.json`).
3. From the engagement repo root: `uip codedapp push src/apps/claims-intake` to sync to Studio Web.
4. Smoke-test: submit a test intake via the Action Center preview, confirm the payload lands in the configured queue.

## Inputs and outputs

**Inputs**

- A user-submitted FNOL form. Required fields: claimant name, contact, incident date, incident location, narrative. Optional: policy number (carrier-side), reporting party (if not the claimant).
- Zero or more file attachments (PDF, JPG, PNG). Each attachment runs through the classifier prompt against the taxonomy.

**Outputs**

- One queue item conforming to `schema/fnol.schema.json`, posted to the configured Orchestrator queue.
- Each attachment's classification result lands in the same payload as `attachments[].classification` (with confidence score and taxonomy node).

## Known limitations

- `alpha` maturity — schema has shipped to one engagement; the field set is FNOL-shaped but every carrier wants 2–4 custom fields. Expect to extend `schema/fnol.schema.json` per engagement.
- Classification confidence threshold is hardcoded at 0.7 in `prompts/classify-attachment.md`. Tune per engagement; some carriers want a human-review fallback below 0.85.
- The app assumes the downstream queue exists and is reachable; no graceful fallback if the queue is missing — the submission errors hard. Consider wrapping with the queue auto-create pattern from a future component.
- No localization. English-only field labels and prompt copy.
- Document classifier currently runs synchronously on submit; for >5 attachments per intake, latency becomes user-visible. Async-with-callback variant is on the v2 list.
