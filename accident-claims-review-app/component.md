---
name: accident-claims-review-app
type: app-template
domain: fins
maturity: alpha
languages: [html, css, javascript]
uipath-products: [apps, action-center]
created: 2026-05-13
contributors: [Sheel Patel]
source-engagement: private
---

# Accident Claims Review App

## What it is

A UiPath Apps custom HTML component pair for the human-in-the-loop review step of an accident-claims workflow. Reviewers see services an upstream agent extracted from a claim, confirm or correct service dates, add missed services, and read a cross-validation report from a second agent. State syncs to UiPath Apps variables so a Maestro process can resume on the reviewed payload.

## When to use it

Reach for this when the engagement has:

- An accident-claims workflow (auto, workers' comp, accident-and-health) where an agent extracts services from claim documents and a human approves the result before downstream payment/eligibility processing.
- A two-agent pattern where one agent extracts and a second cross-validates against a benefits policy — the validation report needs a human-readable display.
- A UiPath Apps surface (Action Center task, embedded App) as the review UI — not Studio Web forms or a custom react app.

If the engagement is non-claims but follows the same shape (agent produces structured list → reviewer edits cards → second agent emits a markdown audit), this is still a reasonable starting point.

## What's inside

- `accident-claims-review.html` / `.css` / `.js` — the reviewer surface. Cards for each matched service with editable date, confidence badge, justification + collapsible sources, plus an "Add Service" draft card flow.
- `validation-report-display/` — sibling component that renders a markdown validation report (cross-agent audit) as styled HTML. Drop-in markdown renderer, no external deps.
- `examples/sample-matched-services.json` — synthetic `MatchedServices` payload showing the expected variable shape.

Theme tokens (`--brand-primary`, `--brand-secondary`, etc.) in both CSS files default to UiPath orange + navy. Override in `:root` for an engagement.

## How to install

1. Copy `accident-claims-review-app/` into your engagement repo at `src/apps/accident-claims-review/`.
2. In UiPath Apps, create two **Custom HTML** controls — one pointing at `accident-claims-review.html`, the other at `validation-report-display/validation-report-display.html`.
3. Define two App variables:
   - `MatchedServices` — List(Of Object), shape per `examples/sample-matched-services.json`.
   - `validationReport` — String (Markdown).
4. Wire your upstream agent to set both variables; wire the "Confirm" action of the App to push `MatchedServices` to the downstream Maestro process.
5. Smoke-test: load `accident-claims-review.html` in a browser (`App.getVariable` will fail and the surface renders empty) — confirm the empty/loading states render. Mock data is in `examples/sample-matched-services.json`.

## Inputs and outputs

**Inputs**

- `MatchedServices` (App variable, List(Of Object)) — see [`examples/sample-matched-services.json`](examples/sample-matched-services.json) for the expected shape. Each item has `benefitName`, `serviceDate`, `category`, `confidence`, `justification`, `justificationSource[]`.
- `validationReport` (App variable, String) — markdown produced by a cross-validation agent.

**Outputs**

- `MatchedServices` written back to the same App variable on every reviewer edit (date change, delete, add) — no explicit Save button on the main surface. Validation report is read-only.

## Known limitations

- `alpha` maturity — one engagement so far. Field set is FNOL-adjacent (service date, justification, sources) but every carrier wants 2–4 custom fields. Expect to extend the card schema per engagement.
- No service-date validation. Reviewer can set any date including future dates; downstream process must validate.
- Confidence badge thresholds are hardcoded (`>=80` high, `<50` low). Tune per engagement in [`accident-claims-review.js`](accident-claims-review.js).
- Markdown renderer in `validation-report-display/` is intentionally minimal (headings, lists, tables, blockquotes, code, links). It does not support nested lists, footnotes, or HTML passthrough.
- No localization. English-only labels.
- Read/write uses `App.getVariable` / `App.setVariable` directly — there is no abstraction layer for testing outside UiPath Apps. Open the HTML files directly in a browser and you'll see the empty state.
