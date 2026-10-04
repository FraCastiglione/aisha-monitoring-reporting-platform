# Associated-partner update audit — 4 October 2026

## Source and scope

Reporting commitments follow the coordinator-supplied Consortium Agreement Attachment 6. The coordinator's current instruction overrides that attachment for BOSCH, CEPS, EPRD and Regione Toscana (RT): these four have no assigned Tasks and may add voluntary Task or Work Package contributions. Formal Grant Agreement wording remains unchanged. Associated partners are labelled **Task contributor** in assigned Task cards, editors, review and generated PDFs.

## Assignment checks

| Associated partner | Listed Tasks across the full project |
| --- | ---: |
| AD | 32 |
| ADRA | 3 |
| ART-ER | 5 |
| BOSCH | 0 |
| CEPS | 0 |
| DE | 11 |
| EPRD | 0 |
| JOIST | 5 |
| JSI | 7 |
| RAM | 4 |
| RT | 0 |
| SC | 3 |

The independent assignment test checks exact Task IDs, all 48 months for each associated partner (576 selections), and selections with gaps. The source audit also checks all 42 partners, 32 Tasks, 10 Work Packages and 11,112 eligible partner/month reporting routes. No mismatches were found.

## Automated verification

- Import regression suite: all 42 partners, 503 assigned Task entries, 10 leadership updates, supported Task schemas 2.0–2.4 and communication schemas 1.1/1.2.
- Older associated-partner reports retain answers, dates and draft/completed/no-work states. Entries outside the revised list appear as voluntary contributions and restore from both JSON and generated PDFs.
- Whole-report, draft and individual Task PDF round trips, matching-JSON recovery, invalid-file rejection, scoped Task imports and duplicate-entry rejection pass.
- Reporting contract, PDF recovery, retained legacy KPI compatibility and dashboard functional suites pass. Dashboard suite covers 51,408 checks and 90 renders, including Gantt keyboard/scroll behaviour.

## Browser verification in local preview

- Selected every associated organisation and checked its visible M01 Task list against Attachment 6; all badges read Task contributor. The four exempt partners have no assigned cards.
- Completed an SC assigned Task, reviewed it and generated the PDF/JSON pair. Associated Task forms have no cost fields.
- Imported a legacy BOSCH report containing a completed T1.1 and a no-work T1.3. Both appeared in the voluntary section; answers and no-work status survived review and generation.
- For CEPS, added two voluntary Tasks and one Work Package together, completed all three, reviewed their separate entries and generated the PDF/JSON pair.
- Dashboard partner view includes all 42 organisations; category filters show 12 associated partners and 30 full partners, including organisations with no assignments. No browser warnings or errors were recorded during these checks.

Generation and structured restoration were verified. These checks do not assert delivery to the coordinator or infer answers from arbitrary/scanned PDFs; those files still require matching structured data or manual entry.
