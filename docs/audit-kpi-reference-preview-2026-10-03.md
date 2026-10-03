# KPI reference preview — 3 October 2026

**Ready within reviewed scope. Overall verification: Partial.** The requested update is local preview only; nothing was committed, pushed or published in this update. All demonstrated issues within the requested change have been repaired and verified. Coverage below combines fresh checks of affected paths with applicable regression checks from the earlier audit; it is not certification of every browser, device or possible input.

## Changes

- Removed the direct KPI editor, catalogue, suggestions and entry controls from both partner Task reports and Communication & Dissemination reports. The same builder applies to all 30 beneficiaries and 12 associated partners.
- Removed dashboard actions that opened the KPI reporting editor. The normal communication questions (events, social posts, reach, enrolments and supporting details) remain unchanged.
- Retained validation, import, review and export of KPI values contained in older drafts/reports. They are preserved as previously recorded values; there is no new KPI entry form. Fresh report counters and file summaries no longer advertise zero KPI contributions.
- Removed the seven interpretation notices from the dashboard interface. Original passages, source rows, values and historical audit records remain unchanged; this does not resolve differences between passages.
- Replaced KPI accordions with six tables: 9 SMART objectives, 19 Call KPIs, 24 communication KPIs, 13 framework indicators, 26 additional passages, and the 114-entry indicator collection. Agreement wording is visible without opening each record.
- Table text uses the available cell width, reflows extraction line breaks and is justified. Bullet passages retain separate visual paragraphs without changing the stored text. Related Tasks remain direct links; proposals remain labelled as proposed contributors. Search, topic filters and favourites remain available in the indicator collection.
- Added PDF and printed Part A/B page references to every source row and category. TARGET-85-2 now correctly cites PDF85–86 / Part A24–25. Part B printed numbering is PDF−106; Part A is PDF−61.

## Evidence

Independent read-only source review compared all91 original source rows with a fresh extraction of the signed185-page Agreement. All passages/cells are word-faithful after whitespace normalization. The 114 collection labels/groups are navigation metadata; exact Agreement content comes from the original source rows. No source/catalogue/snapshot files were edited.

Fresh browser checks:

- All7 dashboard sections load with the correct selected tab/heading and no displayed errors.
- All6 KPI categories render their complete9/19/24/13/26/114 rows. Exact wording is outside disclosure widgets. Search and favourites filter correctly; a related T9.1 link opens that exact Task.
- Desktop Call/Additional tables inspected visually; justified content has no fixed paragraph maximum width. Narrow layout has no document-wide overflow; the table is a focusable scroll region and ArrowRight changes its horizontal position.
- IF.E contributor setup, selected M1/M2, Task editing/completion, readiness counters, browser save/restore, full review and successful PDF/JSON preparation.
- A14-day communication record with no activities, zero social posts and unknown reach/enrolments reaches review. Its standard questions remain intact and no KPI editor exists.
- Associated-partner list shows12 organisations; BOSCH enters the Task builder and has its assigned-month eligibility with no KPI editor.
- Imported a synthetic legacy whole-report JSON containing Task, WP leadership, additional contribution and KPI. Entries allocated to the correct sections; the1240 legacy KPI value survives into combined review without exposing new KPI input controls.
- WP leadership and additional-contribution editing/completion work after removal. Draft PDF preparation succeeds.

Automated checks:

- `tests/dashboard-functional-audit.cjs`: all42partner/month/gap eligibility checks,90 simulated dashboard/calendar/mode renders, exact equality of3 embedded sources, previous interaction regressions, all91 visible source-row fields and Part A/B references, all114 indicator rows without pagination, no reporting/interpretation actions.
- `tests/reporting-contracts.mjs`: text100k/UTF85MB guards, article note deduplication, review error handling, untimed contributor draft import, no missing reporting controls after removal, legacy KPI validation/serialization.
- `tests/kpi-improvements.mjs`:114 input-definition guards and private overlap-review regressions.
- Private synthetic intake pilot and structured PDF roundtrip passed; no project actuals were overwritten.
- Final syntax and whitespace checks pass.

## Review scorecards

Counts are scoped component inventories, not a percentage of complete verification. Zero observed defects means none remain demonstrated within those inventories. Repeated rows sharing a rendering path are checked through the source/render harness; human visual checks are samples.

### Dashboard best practices and quality

| Category | Observed defects | Assessment |
| --- | --- | --- |
| Usefulness and completeness | 0 / 6 | All six requested KPI categories retain all entries and source content. |
| Analytical clarity | 0 / 6 | Exact wording, codes, source pages and Task links remain visible; proposals are labelled. |
| Visual and interaction consistency | 0 / 6 | Tables render, desktop samples inspected, narrow scrolling verified. Every row was not separately inspected by eye. |

### Analytical correctness and robustness

| Category | Observed defects | Assessment |
| --- | --- | --- |
| Source authority and confidence | 0 / 6 | Five original source families compared with the Agreement; collection displays original source content and metadata labels. |
| SQL/value accuracy | N/A | No SQL, target calculation or project actuals were changed. |
| Within-table agreement | 0 / 6 | Category counts and source rows match; reviewed actuals remain pending where unavailable. |
| Complete source details | 0 / 6 | All source fields and page references are present; cross-page reference repaired. |
| Cross-artifact consistency | 0 / 5 | Task, WP, extra, communication and legacy-value records retain review/export compatibility. |
| Data-quality controls | 0 / 3 | Assignment/month eligibility, import validation and backup/export guards pass. |
| Conclusion support | N/A | No new project-performance conclusions or interpretations were introduced. |

## Limits and remaining priorities

No demonstrated defect remains in the exercised paths. Complete OS download receipt remains unverified because the embedded browser does not return its destination path; preparation, browser links and independent structured PDF roundtrip are verified. Other browsers, physical assistive technologies and every control permutation were not tested. Arbitrary/scanned third-party PDFs cannot be restored automatically; structured platform PDFs can.

Real partner submissions/evidence were not supplied. Original Agreement differences remain unreconciled; their notices were removed only as requested. No new KPI reporting scheme or source interpretation was invented. The private native reviewer page remains outside interactive-browser coverage from the earlier audit, while its validation and queue logic retain automated coverage.

There are no further interface changes proposed in this update. The next KPI reporting design can be developed separately when requested.
