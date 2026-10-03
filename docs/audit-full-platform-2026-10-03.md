# Full platform and import audit — 3 October 2026

**Ready within reviewed scope. Completeness: Partial.** Confirmed defects were repaired in local preview. No commit, push or publication was performed in this audit. This is a broad source, browser and structured-record audit, not a certification of every device, input permutation or external workflow.

## Verified fixes

1. **Task draft import could overwrite progress and then crash.** A draft with impossible coverage dates replaced state before the overview threw an invalid-date error. Coverage now validates before replacement. The browser rejects the same fixture and leaves the existing task, leadership and extra entries unchanged.
2. **Repeated or unordered months in additional contributions survived import.** These could misstate coverage duration. Such sequences now reject before replacement. All valid selected-month/gap records continue to restore.
3. **Communication submissions replaced answers before meaningful validation.** Negative counts, malformed shared activity codes, wrong dates, identities and field types now reject before replacement. Unknown-count flags must be booleans. JSON imports have the same 5 MB editable-file limit as exports; PDF imports retain the 10 MB file limit. Intentionally unfinished draft counts/costs remain editable.
4. **Imported article notes lost their link association.** Separate notes—including repeated identical URLs with different notes—now survive import, browser/file drafts, PDF transport and re-export. Editing the shared notes field still deliberately applies the new note to all current article URLs. Partner changes clear the old mapping.
5. **Ordinary PDFs produced a cryptic library error.** PDFs without embedded platform data now explain that their matching JSON is required.

Updated current documentation that still advertised the removed KPI editor/suggestions, visible interpretation notices, or incorrectly excluded ADRA from its confirmed voluntary T9.1 route. Historical dated audits and all Agreement/catalogue/snapshot files remain unchanged. No design changes were made.

## Browser coverage

- Contributor validation; separate lists of 30 full and 12 associated partners; all 42 organisations entered the actual builder for M1 and all 48 project months. Displayed Task and leadership counts match independent source expectations.
- All 32 Task editors opened with their full descriptions, correct roles and active-month limits. Associated cost inputs were hidden. Leaving untouched editors left no selected draft.
- Real pointer drags M1–M2 then M5–M6 retained both ranges; toggling M2 removed only M2. Non-contiguous coverage remained exact.
- Task issue/severity/support and cost validation; completed-to-draft editing; no-work cancellation/confirmation; unfinished-report blocking; leadership assessment and extra Task/WP multi-selection, completion and removal.
- Revision rejection for 0, revision 2 filename generation, combined Task/WP/extra PDF/JSON preparation and review confirmation.
- A new SC test draft was saved, changed, restored and deleted. The empty restore state and both draft download actions worked. Existing user drafts were not deleted.
- Actual browser uploads of Task draft JSON, complete Task JSON, draft PDF, complete PDF, rich Task/WP/extra/legacy-KPI PDF and individual Task PDF restored correctly. Individual import preserved other entries; whole-report PDF into the Task-only control rejected with instructions. Invalid-date Task import and malformed submitted communication JSON preserved current progress. Communication PDF restored distinct article notes in review.
- Communication 14-day rule, zero/unknown handling, events, add/remove event, journalist/outlet counts, website articles, social links, newsletter recipients, support condition and full review.
- All seven dashboard sections; all 22 deliverables, 23 milestones, 10 Work Packages and 32 Task descriptions opened. Partner coverage views showed all 42 / full 30 / associated 12, all partner drill-downs opened, Task and Work Package modes and empty filters worked.
- All 50 Gantt/calendar months selected and verified through keyboard navigation; expand/hide all 32 Task rows, width toggle, desktop tooltip, first-day internal and month-end official deadlines, May Rome kickoff and November Brussels meeting details. Some offscreen locator mouse clicks did not hit the intended header under sticky labels; keyboard selection established exact results. This was not treated as proof that an offscreen click succeeded.
- All risk filters returned 17 / 9 / 3 cards. Message-board empty state displayed correctly.
- All six KPI tables displayed 9 / 19 / 24 / 13 / 26 / 114 rows; all eight topic groups, ID search and no-results state worked. Applicable previous favourite and related-Task link checks remain valid because those implementations/data were unchanged.
- How to Report and main navigation worked. Desktop reporting/draft/Gantt views and narrow reporting/KPI/calendar views were inspected. At 390 px, both builder and KPI page had 390 px document width; KPI tables scroll inside their region. Temporary viewport overrides were reset. Final browser error log was empty.

## Independent partner and import checks

Signed Agreement participant lines and Work Package leaders plus coordinator-confirmed Attachment 6 were independently extracted, rather than using the app's eligibility helper as the expected source. All 42 partner assignments/roles match: 1,344 combinations, 14,226 eligible partner-month Task routes, and 485,967 selected-month coverage checks. T1.1–T1.3 inherit WP1 timing; UV/UVEG normalization follows beneficiary number; voluntary associated assignments stay distinct from formal participants.

All 42 partners roundtrip 638 assigned Task entries and all 10 Work Package leadership entries. Supported Task schemas 2.0–2.4, genuine older omitted fields and associated legacy role migration pass. Communication schemas 1.1–1.2 pass for every partner, including incomplete drafts. Associated costs reject on import and are omitted from generated data.

The durable `tests/import-regressions.mjs` generates its own synthetic fixtures and checks actual conversion, validation, serialization and PDF functions. It covers five PDF payload types and their restoration, lossless notes, same/different-period behavior, wrong partner/role/Task/WP, duplicates, no-work inconsistency, invalid dates, unsupported versions, ordinary/foreign/corrupt PDFs, malformed embedded JSON, oversized PDFs and embedded payloads. Earlier file-handler boundary checks confirm rejection before reading. All four persistent test suites, syntax checks and final whitespace checks pass.

## Import support

| File / situation | Expected result |
| --- | --- |
| Platform Task draft / complete JSON, schemas 2.0–2.4 | Restore assigned Task entries, leadership, additional contributions and any retained legacy KPI values. |
| Platform complete or draft PDF with embedded data | Same structured restoration as JSON. |
| Individual Task PDF | Task-only control imports just that Task for the same partner and selected months; overview import can adopt its period. |
| Communication JSON/PDF, schemas 1.1–1.2 | Restore communication fields and article/event evidence; does not populate Task reporting. |
| Same-period selective import | Replace selected entries; retain unselected entries. |
| Different-period import | Adopt the file timeline and selected entries, after the displayed replacement explanation. |
| Untimed draft | Restore contributor or legacy KPI entries while retaining the current timeline. |
| Wrong identity/assignment, malformed record, duplicate entries, invalid coverage or oversized data | Reject; existing progress remains available. |
| Arbitrary, scanned or older PDF without embedded platform data | Cannot reconstruct fields reliably; use its matching JSON. |

## Partner-by-partner result

| Partner | Category | Assigned Tasks over project | Work Package leadership | Result |
| --- | --- | ---: | --- | --- |
| IF.E | Full | 10 | WP1, WP9, WP10 | Pass |
| UNIBO | Full | 14 | WP2 | Pass |
| FARI | Full | 14 | — | Pass |
| UWK | Full | 21 | WP5 | Pass |
| UiB | Full | 17 | — | Pass |
| INESC.ID | Full | 13 | WP7 | Pass |
| POLIMI | Full | 18 | — | Pass |
| UPM | Full | 14 | WP4 | Pass |
| LSA | Full | 13 | — | Pass |
| UBW | Full | 17 | — | Pass |
| UV | Full | 11 | — | Pass |
| EFRI | Full | 13 | WP8 | Pass |
| CBS | Full | 13 | — | Pass |
| UKON | Full | 18 | — | Pass |
| Poli.D | Full | 10 | — | Pass |
| ASC27 | Full | 11 | — | Pass |
| TILDE | Full | 9 | — | Pass |
| LIG | Full | 15 | — | Pass |
| EDSA | Full | 13 | — | Pass |
| ALLAI | Full | 24 | WP3 | Pass |
| COG | Full | 13 | — | Pass |
| TDT | Full | 26 | — | Pass |
| IAL.T | Full | 16 | — | Pass |
| TRS | Full | 8 | — | Pass |
| PF | Full | 21 | — | Pass |
| VARM | Full | 10 | — | Pass |
| TUD | Full | 12 | WP6 | Pass |
| SCAI | Full | 11 | — | Pass |
| VALGRAI | Full | 17 | — | Pass |
| XR8 | Full | 11 | — | Pass |
| AD | Associated | 32 | — | Pass |
| ADRA | Associated | 5 | — | Pass |
| ART-ER | Associated | 6 | — | Pass |
| BOSCH | Associated | 32 | — | Pass |
| CEPS | Associated | 32 | — | Pass |
| DE | Associated | 12 | — | Pass |
| EPRD | Associated | 32 | — | Pass |
| JOIST | Associated | 6 | — | Pass |
| JSI | Associated | 8 | — | Pass |
| RAM | Associated | 4 | — | Pass |
| RT | Associated | 32 | — | Pass |
| SC | Associated | 4 | — | Pass |

## Review scorecards

Totals are scoped component inventories, not a percentage of complete verification. Zero observed defects means no demonstrated remaining defect in that inventory; assessments state sampling and gaps.

### Dashboard best practices and quality

| Category | Observed defects | Assessment |
| --- | --- | --- |
| Usefulness and completeness | 0 / 7 | All dashboard purposes exercised; real submissions and populated messages are unavailable. |
| Analytical clarity | 0 / 7 | Missing records remain unconfirmed, not overdue or zero actuals. Source wording and reference categories unchanged. |
| Visual and interaction consistency | 1 / 10 | Desktop/narrow inspection sampled repeated rows. A distant Gantt cell loses its keyboard tooltip during automatic scrolling; accessible text remains. Physical assistive technology not tested. |

### Analytical correctness and robustness

| Category | Observed defects | Assessment |
| --- | --- | --- |
| Source authority and confidence | 0 / 3 | Partner assignments, schedule and KPI source groups checked independently or reused unchanged exact-source evidence. |
| SQL/value accuracy | 0 / 7 | Overview totals, calendar events, risk/filter and reference-table counts agree; no SQL or real KPI actuals. |
| Within-chart agreement | 0 / 4 | Overview, Gantt/calendar, reporting coverage and KPI counts agree with scoped inputs. |
| Complete source details | 0 / 5 | Deliverables, milestones, WP objectives, Task descriptions and KPI page references available; risk mitigation summaries remain labelled. |
| Cross-artifact consistency | 0 / 5 | Task, leadership, additional, communication and legacy-KPI records retain correct review/export/import placement. |
| Data-quality controls | 0 / 5 | Assignment, period, import, conditional-answer and storage/export checks pass. |
| Conclusion support | 0 / 1 | Dashboard status remains a supplied snapshot, with missing partner actuals explicit. |

## Limits and remaining priorities

- OS-level download receipts are still unavailable: both final blob links are valid and file generation/independent PDF restoration pass, but the in-app browser times out instead of returning a saved path. No claim is made that the OS destination was inspected.
- Actual partner files, coordinator receipts/acceptance, populated message-board announcements and active monitoring rounds were not supplied. Their real-world content cannot be verified with synthetic fixtures.
- No test can establish every possible browser/device/input combination. Browser paths used one in-app browser and selected desktop/narrow widths; repeated record paths were tested systematically through actual platform functions.
- The static site does not authenticate partners, upload to Nextcloud, register receipt or publish submitted reports automatically. These are existing workflow boundaries, not new failures.
- One minor keyboard-tooltip limitation was observed when focus automatically scrolls a distant Gantt cell: scrolling hides the tooltip. Accessible cell text remains available, and a visible cell tooltip works. Proposed later improvement: re-anchor the popup after keyboard-driven scrolling; no Gantt change was made in this repair batch.

No unresolved demonstrated material defect remains in the exercised paths. The five verified repair families are preview-only; the published GitHub version is unchanged.

## Follow-up repairs — 3 October 2026

These results supersede the download-receipt and Gantt-tooltip caveats above. All changes remain local preview changes.

- **Gantt keyboard tooltip:** automatic horizontal scrolling now repositions the tooltip for the focused cell. Verified on the distant WP1 M50 cell; Escape dismisses it. Pointer scrolling still dismisses a pointer tooltip. Added a regression test for all three behaviours.
- **Saved copies:** every draft, individual Task PDF and final PDF/JSON export now retains a direct retry link and an optional local saved-file check. The check compares every byte with the generated artifact; file names alone do not count as verification. Different-size/content, read failure and a stale asynchronous check are covered by tests. A PDF viewer link is available as an additional recovery option.
- **Actual file receipt:** Safari saved `AISHA_IF.E_TASKS_START_END_DRAFT.pdf` (28,157 bytes) and its editable JSON in the device's Downloads folder during this follow-up. The PDF's embedded draft was read independently and contained the correct project, partner and report type. The actual saved JSON passed the production byte-comparison control in a temporary component audit page. The temporary page and fixture were removed afterward. The in-app automation still does not expose its download receipt; success is no longer inferred from its timed-out event.
- **PDF recovery:** ordinary/scanned/resaved PDFs without embedded AISHA data offer the matching JSON or manual transcription using the PDF as a reference. Nothing is extracted or guessed from a scan. Whole-report recovery retains entry selection and confirmation. Task recovery imports only that Task from the matching JSON, retaining other Task, Work Package, voluntary and legacy KPI entries. Communication recovery retains replacement confirmation. Verified all three paths through the actual preview controls.
- **Import integrity:** malformed dates, wrong partner and a missing target Task are rejected before changing the current report. Invalid recovery leaves the Task import dialog available. Regression coverage includes atomic failure and preservation of Work Package/extra/KPI data.

Re-run suites: dashboard functional audit (51,408 model checks, 90 render checks, all 91 exact source rows and 114 index entries), all-partner import regressions (42 partners, 638 Task entries, 10 leadership updates; schemas 2.0–2.4 and communication 1.1/1.2), reporting contracts, KPI compatibility and export/recovery tests. Browser checks also covered final PDF/JSON controls, individual Task PDF controls, wrong-file rejection and communication restoration. No console warnings/errors observed.

Remaining boundary: reliable automatic restoration requires structured AISHA PDF data or the matching JSON. A scan without either needs manual transcription. The website cannot silently inspect a user's Downloads folder; the partner can explicitly choose a saved file for the local content check. Cross-device and physical assistive-technology behaviour remain outside the tested environment.
