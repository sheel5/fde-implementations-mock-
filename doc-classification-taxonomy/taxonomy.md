# Doc Classification Taxonomy (Claims)

Human-readable rendering of `taxonomy.json`. Edit `taxonomy.json` first; this file follows.

## evidence
_Materials capturing the incident itself._

- **evidence.photo** — Photographic evidence taken at or after the incident.
  - **evidence.photo.vehicle** — Photos of involved vehicles, damage, license plates.
  - **evidence.photo.scene** — Photos of the location, road conditions, signage.
  - **evidence.photo.injury** — Photos of bodily injuries. _Sensitive — flag for restricted handling._
- **evidence.video** — Video evidence — dashcam, surveillance, bystander recordings.
- **evidence.diagram** — Hand-drawn or generated incident diagrams.

## official
_Documents issued by an authority or institution._

- **official.police-report** — Police, sheriff, or highway-patrol incident report.
- **official.dmv-record** — DMV or equivalent registration / title / abstract record.
- **official.court-document** — Filings, subpoenas, judgments related to the claim.

## financial
_Documents quantifying loss or cost._

- **financial.repair-estimate** — Body shop or contractor estimate for repairs.
- **financial.invoice** — Paid or unpaid invoice for services rendered.
- **financial.receipt** — Proof of out-of-pocket expense.
- **financial.rental-agreement** — Replacement-vehicle rental contract.

## medical
_Health-related documents tied to the claim._

- **medical.bill** — Hospital, clinic, or provider bill.
- **medical.record** — Treatment notes, diagnosis records, imaging reports.
- **medical.prescription** — Pharmacy records or prescription documentation.

## correspondence
_Communications between parties tied to the claim._

- **correspondence.claimant-statement** — Written or transcribed statement from the claimant.
- **correspondence.witness-statement** — Written or transcribed statement from a witness.
- **correspondence.carrier-letter** — Letter from the insurance carrier.
- **correspondence.attorney-letter** — Correspondence from legal counsel.

## policy
_Insurance policy artifacts._

- **policy.declarations-page** — Policy declarations / coverage summary.
- **policy.endorsement** — Policy amendments and endorsements.

## unknown
_Catch-all for documents that don't fit elsewhere. Triggers human review._
