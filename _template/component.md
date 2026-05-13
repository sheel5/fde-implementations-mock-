---
name: <kebab-case-name>
type: taxonomy | app-template | validation-station | eval-harness | synthetic-data | other
domain: hls | fins | retail | mfg | cross-vertical
maturity: alpha | beta | stable
languages: [python, typescript]
uipath-products: [agent-builder, ixp, maestro, action-center]
created: YYYY-MM-DD
contributors: [name1, name2]
source-engagement: <engagement-name-or-private>
---

# <Component name>

## What it is

1–3 sentences. The agent reads this first when deciding whether the component is relevant.

## When to use it

The signals an agent or human looks for. Be specific — "use this when the engagement involves X, the customer has Y, and the deliverable needs Z."

## What's inside

File-by-file inventory with one-line descriptions.

- `file-or-dir-1` — what it is
- `file-or-dir-2` — what it is

## How to install

Concrete steps. The next FDE should be running this in under 10 minutes.

1. Copy `<component-name>/` into your engagement repo's `src/`.
2. Install dependencies: `<command>`.
3. Configure: copy `config.example.json` → `config.json` and set `<values>`.
4. Register: `<how the engagement wires it in>`.

## Inputs and outputs

What this component consumes and produces. Include schemas if structured.

**Inputs**:
- `<input-1>` — type, source, example.

**Outputs**:
- `<output-1>` — type, destination, example.

## Known limitations

Be honest. Sandbagging here costs the next FDE a day.

- Limitation 1.
- Limitation 2.
