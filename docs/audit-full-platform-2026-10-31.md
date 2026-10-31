# AISHA platform audit — 31 October 2026

**Ready within reviewed scope.** Repairs verified locally before publication. Functional scope: all eight dashboard sections (Overview, Gantt/calendar, Work Packages, Partner reporting, Staff effort, Message board, Risks, KPIs), the Task builder, Communication builder and How to Report. Repeated partner routes and import cases use automated checks; browser interaction samples shared paths rather than clicking every possible combination. Cross-browser, screen-reader and physical touch-device certification is outside this audit. No synthetic reports enter the public snapshot.

## Verified repairs

1. **Dashboard opens below the header.** The dashboard section no longer doubles as the browser's `#dashboard` fragment target. Native late fragment scrolling therefore cannot override page navigation. Fresh opens/reloads start at the header; cached dashboard returns also reset to the top. Cached in-progress reports retain their own position. Direct local opening, route switching and reload were browser-checked; cache event behavior is covered by the navigation regression.
2. **Individual Task export could reject useful drafts or validate unrelated work.** Effort-only drafts now qualify for an individual copy. Scope filtering occurs before answer/effort validation, so invalid answers, PM or notes belonging to another Task or direct WP entry do not block a valid Task backup. Individual JSON contains no sibling, leadership or extra-contribution data. Both actual handler tests and a browser PM-only PDF preparation/JSON saved-file check pass.
3. **Completed additional contributions could stay complete after effort edits.** Task, WP and other-work PM/note edits return the entry to draft; changing optional WP attribution does likewise. The final review blocks unfinished entries. Actual entry handlers and the browser general-contribution path verify this.
4. **Malformed drafts could silently lose monthly effort.** Schema 2.5 drafts with conflicting duplicated Task dates, months or statuses are rejected before changing current state. The regression preserves the original answers and ledger after rejection.
5. **Private coordinator output could retain unknown row properties.** The private compiler now emits canonical validated effort fields, excluding notes, contributor details and arbitrary nested metadata. A regression exercises the real private CLI against temporary synthetic input. This private tool stays outside the public site repository; the public preparation script independently strips narrative data.
6. **Staff effort expansion lost keyboard focus and horizontal position.** Partner-scoped stable keys now retain both across redraws, including identical WP labels under different partners. Automated focus/scroll tests pass; browser keyboard expansion retained focus on the expanded WP control.
7. **Missing allocations appeared as zero planned PM in monthly detail.** Associated partners now see “No GA allocation”; funded extra Tasks without an assigned estimate see “No Task estimate”, consistently in monthly rows and cell tooltips. No assignment was invented.
8. **Mobile other-work WP selector overflowed.** Effort selects are constrained to their card. The 390px browser check measured the selector entirely within the panel after restoring a full draft; Task/leader/general editor content remains legible.

## Source and route evidence

- Independently compared all 32 formal Task participant lists/leaders and all 29 explicit Task timing ranges to the raw signed Grant Agreement PDF. WP1 Task windows inherit the WP window where no narrower date is specified.
- Independently compared all ten WP leaders/activity windows and all twelve associated-partner commitment lists, including the coordinator's exceptions for BOSCH, CEPS, EPRD and RT. Associated partners remain Task contributors. No source/assignment changes were needed.
- All 300 PM cells, 30 partner totals, ten WP totals and the 1,197.50 PM grand total reconcile to PDF pp. 89–90, Part A pp. 28–29. UPM/WP6 (7 PM) and Poli.D/WP5 (3 PM) remain undistributed WP pools. Task/month equal splits are labelled internal planning estimates.
- Automated routes cover all 42 partners, 503 partner/Task combinations, associated commitments across months, gapped timelines, future periods and leadership eligibility. Source catalogue/status files remain unchanged.
- Dashboard regressions cover deliverables/milestones and related Task navigation, all 91 exact KPI source rows and 114 index rows, source pages, reporting filters, risk views, Gantt deadlines/reviews/tooltips and empty/verified-data states. Actual reporting/status metrics are not filled with test values.

## Browser and file verification

- Direct dashboard opens/reloads show the logo, top navigation and page title. Deliverable D10.1 opens its linked T10.1; expanded Gantt selects the 18–19 November Brussels meeting in the calendar. KPI table, search and reversible favourite toggle work; risk filtering and partner reporting modes render.
- Imported a full IF.E schema 2.5 fixture through the entry-selection dialog into an empty report, preserving report identity, two selected months, Task rows and direct WP effort. An individual Task JSON saved-file check matched the exact generated bytes. No-work declaration cleared Task effort while retaining separate WP effort.
- WP leader download opens the PDF/JSON chooser. A full draft backup was byte-verified, the page reloaded safely, and the backup restored with Task, direct WP and other-work data. Changing the restored other-work WP attribution marked it draft; review blocked it until explicitly completed.
- Existing PDF round trips cover all 32 Tasks and full/draft/individual formats. The prior preview's eight rendered output pages remain applicable to unchanged PDF layout. A fresh three-page browser-generated full PDF was also byte-verified, extracted and rendered for visual inspection, with revision 2, correct UTC timestamp, zero Task effort and separate WP/other effort intact. Saved-file receipt, wrong/unreadable/stale copy, PDF matching-JSON recovery, selective/whole imports, revisions, overlaps and legacy schemas are covered by the retained regression suites. Browser draft-storage behavior is regression-tested without overwriting an existing user draft.
- Fifteen suites pass. Browser rendering was inspected at desktop and 390px; viewport overrides were reset. The final preview's browser warning/error log was checked. No live user submission was imported, changed or removed.

## Coverage scorecards

Totals are scoped inventory counts, not a claim that every browser/device combination was exercised. `0 / N` means no remaining demonstrated defect, not N exhaustive manual passes. Eleven functional areas are defined above. Eight source families are formal Tasks, WPs, AP commitments, deliverables, milestones, risks, KPI passages and effort allocations. Six calculation/display families are schedule position, deliverable/milestone status, reporting coverage, planned effort, reported effort and reviewed KPI values.

| Category | Observed defects | Assessment |
| --- | --- | --- |
| Dashboard usefulness and completeness | 0 / 11 | All major areas have usable paths; absent reports/status remain explicit. |
| Analytical clarity | 0 / 11 | Official assignments, internal planning, actuals and leader assessments remain distinct. |
| Visual and interaction consistency | 0 / 11 | Main paths checked; targeted desktop/narrow layouts inspected. Other browser engines/devices are not certified. |

| Category | Observed defects | Assessment |
| --- | --- | --- |
| Source authority and confidence | 0 / 8 | Raw Task/WP/AP/PM source recheck; unchanged other catalogue families retain source regressions. |
| SQL/value accuracy | 0 / 6 | Static calculations, not SQL; baseline independently reconciled and missing differs from zero. |
| Within-chart agreement | 0 / 6 | Counters, monthly rows and tooltips agree within tested states. |
| Complete source details | 0 / 8 | Page references and formal wording retained; no new inferred assignments. |
| Cross-artifact consistency | 0 / 6 | Form, review, JSON/PDF and private/public preparation tested. |
| Data-quality controls | 0 / 6 | Identity, revisions, overlap, atomic rejection, coverage and privacy checks pass. |
| Conclusion support | 0 / 6 | No synthetic completion, risk flag, accepted report or KPI actual invented. |

## Limits that remain explicit

Arbitrary/scanned or externally rewritten PDFs without embedded AISHA data need matching JSON or manual transcription; field guessing/OCR is not promised. Browser storage can be cleared; download portable copies. A download request alone is not proof of durable storage; the saved-copy check verifies the selected file. Public reporting coverage reflects only coordinator-incorporated records, not files held on other devices. The two WP allocation/assignment gaps require coordinator interpretation before any future Task assignment change. These are declared workflow/source limits, not silently repaired with guessed data.
