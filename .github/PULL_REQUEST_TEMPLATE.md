# Component PR

## Summary

<!-- 1–2 sentences. What does this component do, and where did it come from? -->

## Component

- Name: `<kebab-case-name>`
- Type: `taxonomy | app-template | validation-station | eval-harness | synthetic-data | other`
- Domain: `hls | fins | retail | mfg | cross-vertical`
- Maturity: `alpha | beta | stable`

## Contract checklist

- [ ] `component.md` present at `<name>/component.md`
- [ ] Frontmatter complete (name, type, domain, maturity, languages, uipath-products, created, contributors, source-engagement)
- [ ] All body sections present (What it is / When to use / What's inside / How to install / Inputs and outputs / Known limitations)
- [ ] Index entry will regenerate cleanly (CI will verify)

## Genericization checklist

- [ ] No customer or engagement names anywhere in the component
- [ ] No PII or customer identifiers (names, account numbers, emails, phones, addresses)
- [ ] No internal IDs (queue IDs, asset IDs, folder IDs, bucket names) tied to a tenant
- [ ] No hardcoded paths, URLs, or credentials from the source engagement
- [ ] Configurable values exposed via `config.example.json` / `.env.example` with placeholders
- [ ] `Known limitations` honestly captures rough edges

## Reuse case

<!-- Name at least one other engagement type that could plausibly drop this in. If you can't, the component probably isn't generic enough yet. -->

## Source engagement

<!-- Name the engagement, or write `private` if the customer should not be attributed. -->
