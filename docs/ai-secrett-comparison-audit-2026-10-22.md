# AI-SECRETT → AISHA comparison and preview audit

**Date:** 22 October 2026. **Delivery:** local AISHA preview only; nothing committed, pushed or published.

## Evidence and method

Compared the current AISHA root application with the AI-SECRETT application under `ai-secrett/` in the same repository. GitHub's current `main` matched the local source at `330e9c0f0d98ceb862fe139f1eaec51257cce1ed`. Also opened the published AI-SECRETT site and confirmed its current reporting, identity and dashboard asset versions and its 36-row project KPI view.

Inspected the source, markup, styles, PDF module, calendar/model code, import/export contracts, review preparation tool and tests. Reviewed the October commit history, especially `39daf11`, `4780a37`, `224ec5d`, `23d0b6f`, `e60d0a6`, `370ed8f`, `d9158eb`, `652bca0`, `747ac97`, `2a5bf4a` and `330e9c0`. Pure asset-version refreshes are deployment changes, not separate user features.

This comparison transfers application behaviour. The AISHA Grant Agreement, consortium commitments and explicit coordinator corrections continue to govern AISHA content.

## Detailed change inventory and disposition

| # | Change found in AI-SECRETT | AISHA preview treatment |
| --- | --- | --- |
| 1 | Navigation renamed to **Reporting Tool** | Applied. |
| 2 | Consortium map entry | Already present; retained the original AISHA map URL and separate-tab behaviour. |
| 3 | Developer copyright credit | Already present; retained the approved AISHA footer verbatim. |
| 4 | Shorter workspace introduction | Applied to Task and Communication reporting. |
| 5 | More accurate report-choice descriptions | Applied: listed Tasks plus voluntary contributions; selected months for outreach. |
| 6 | Communication changes from a 14-day check-in to monthly reporting | Applied. One or several explicitly selected project months may be covered. This is a reporting-tool workflow, not a newly asserted Agreement deadline. |
| 7 | Communication timeline supports gaps | Applied, using AISHA's May 2026–April 2030 calendar. |
| 8 | Dragging can add **or remove** a range | Applied to both timelines. Dragging from a selected month removes that range; from an unselected month adds it. Other selected ranges remain. |
| 9 | Clear selected months controls | Applied to both timelines, disabled when empty. |
| 10 | Shorter month-summary message | Applied; scheduled Task availability and exact activity-window rule replace repeated long date lists. Selected buttons remain authoritative. |
| 11 | Compact Task coverage summary | Applied: included-month count and compact month codes, preserving gaps. |
| 12 | Task coverage recalculates while dates are edited | Applied; invalid date bounds show a check-dates message. |
| 13 | Task role badge moves into the Work Package context line | Applied, above the Task title. |
| 14 | Task PDF import and dates share a compact setup area | Applied; two columns on desktop, stacked at the small-screen breakpoint. |
| 15 | Duplicate organisation-contribution reminder removed from Task editor | Applied; the main organisation reporting guidance remains. |
| 16 | Narrative placeholders explain what to report | Applied to activities, results, difficulties, raw-cost details, upcoming activities and comments. |
| 17 | Question-mark writing guidance stays available after typing | Applied using focus/hover tooltips. |
| 18 | Visible textarea expansion hints | Applied. |
| 19 | Raw-cost note becomes a full details textarea | Applied; optional EUR amount remains separate. Associated partners still have no cost fields. |
| 20 | Task completion returns to the relevant card | Applied; avoids jumping to the beginning of a long overview. |
| 21 | Declaring no work preserves the relevant card's position | Applied. Existing confirmation and answer-clearing rules remain. |
| 22 | Work Package update cards gain state styling | Applied to draft, complete and no-work updates. |
| 23 | Distinct completed/draft/no-work colours | Applied with AISHA blue/teal branding; green completion, amber draft and mauve no-work states. |
| 24 | Coordination **or communication** team support wording | Applied to Communication form, review and PDF. |
| 25 | Older Communication report migration | Applied: schemas 1.1/1.2 remain readable; answers survive and partners must review the selected months. Cross-month old periods require a new month selection. |
| 26 | Communication schema 1.4 records exact selected months | Applied. Existing Task schemas 2.0–2.4 stay supported. |
| 27 | Communication filenames distinguish month selections, including gaps | Applied, with a compact suffix for longer selections. |
| 28 | Random report codes | Applied as `AISHA-<PARTNER>-TASKS/COMM-<128-bit random value>`. Separate codes for each partner and report type. |
| 29 | Report code shown throughout the reporting journey | Applied to overview, review, PDF, JSON, filenames and generation confirmation. |
| 30 | Revisions retain report identity | Applied; revisions and codes are retained when switching between report types. A different period after generation or restoration creates a new code and resets revision. |
| 31 | Coded draft/report restoration | Applied. Older uncoded files receive an AISHA code on restoration. A supplied code for another partner/type is rejected before replacing the current report. |
| 32 | Reviewed report registry | Added empty foundations only. No report is presumed received just because a partner generates files. |
| 33 | Latest verified revision selection | Applied to dashboard rows and the review preparation tool. Superseded copies do not inflate results. |
| 34 | Duplicate, conflicting-copy and overlap handling | Applied to reviewed-data preparation; overlaps stop preparation for coordinator resolution. Shared activity references create a reconciliation list. |
| 35 | Traceable partner reporting references | Added report code and revision to confirmed reporting records when available; uncoded legacy records remain readable. Voluntary contributions stay separate from assignment denominators and can be shown in the partner panel. |
| 36 | KPI project results alongside targets | Applied across AISHA's own source tables and indicator collection, with pending states until a reviewed result exists. |
| 37 | Expandable partner KPI contributions | Applied with partner, value, exact months, report code, revision and shared activity reference. Values are not automatically added to a project total. |
| 38 | Partner reporting includes a reviewed KPI panel | Applied; empty when no reviewed data exists. |
| 39 | Grouped KPI navigation and mobile labelled cards | Adapted to AISHA's existing six source categories, with labelled mobile cards and corrected desktop column widths. Preserved search, favourites and exact source wording. |
| 40 | Internal/official dates in commitment details | Applied using AISHA's first-of-due-month internal checkpoint and official month-end deadline. |
| 41 | Gantt month headers show year, internal-draft counts and improved singular labels | Applied. Retained all 50 months, RP review bands, month selection, keyboard tooltips and Task drill-down. |
| 42 | Gantt opens at the current project month | Adapted to AISHA's current calendar month; the reviewed status snapshot remains unchanged and labelled September 2026. |
| 43 | Dynamic risk-count label and focus when opening a Task | Applied. AISHA's 17 source risks remain intact. |
| 44 | PDF/file recovery and saved-copy verification | Already available in AISHA; retained, with the new report identity metadata. |
| 45 | AI-SECRETT violet brand, logo and footer | Not copied as project content. Layout and state-colour improvements use AISHA's identity. |
| 46 | AI-SECRETT participant order, first-participant leader rule and RCE commitments | Not copied. AISHA's Agreement leaders and corrected Attachment 6 assignments remain unchanged. |
| 47 | AI-SECRETT 30-day internal-review rule and automatic Task-end reports | Not copied. These conflict with AISHA's established first-of-month rule and coordinator-scheduled Task reports. No extra obligations or dates were invented. |
| 48 | AI-SECRETT results, meetings, KPI codes and source page offsets | Not copied. AISHA's own status evidence, Rome/Brussels events, indicator IDs and page references remain. |
| 49 | Removal of some source/context notes and search/favourites in the newer counterpart | Retained AISHA's useful context, six categories, search and favourites. |
| 50 | Task narrative/file size limits relaxed in the counterpart | Kept AISHA's consistent 100,000-character answer, 5 MB JSON/embedded-data and 10 MB PDF safeguards. Expanded cost details use the normal 100,000-character answer limit. |

## AISHA-specific protections

- Configuration, full Agreement text, dashboard catalogue/detail, project model, existing KPI definitions and report-file recovery module remain unchanged.
- All 30 full partners and 12 associated partners remain; all 32 Tasks and 10 Work Packages retain their original timing and leadership.
- Associated commitments total 70 Task contributions. BOSCH, CEPS, EPRD and Regione Toscana have no listed Tasks; they use voluntary contributions. Associated Task roles remain **Task contributor**.
- All 91 source rows remain: 9 SMART objectives, 19 Call rows, 24 Communication rows, 13 measurement-framework rows and 26 additional passages. All 114 indicator definitions remain.
- Partner KPI entry remains paused in Task and Communication reporting. Legacy KPI data can still be restored without loss; new dashboard contributions require coordinator-reviewed mapping to AISHA indicator IDs.
- Added only empty `report_registry` and `partner_kpi_contributions` arrays to the public snapshot. Existing statuses, project meetings, dates, risks and values did not change. Regenerated the embedded asset from these AISHA files.
- The public reviewed-data preparation tool whitelists summary fields. Contributor contacts and report narratives are excluded. Updated private coordinator intake to accept the new monthly schema and filenames; the private tool remains outside the public site.

## Verification performed

### Automated

All seven relevant suites passed:

1. `associated-contributors.mjs`: exact Attachment 6 commitments and exceptions for all 12 associated partners, 576 single-month selections plus disjoint periods.
2. `import-regressions.mjs`: all 42 partners, 503 assigned Task entries, 10 leadership updates, supported Task schemas 2.0–2.4, Communication 1.1/1.2 compatibility, individual/full/draft PDF restoration, malformed/duplicate rejection and AP answer preservation. New checks cover schema 1.4 with disjoint months for all 42 partners, stable code restoration, wrong-code rejection and a monthly draft PDF round trip. The private coordinator validator accepts the generated monthly record and filename.
3. `reporting-contracts.mjs`: answer/file size boundaries, save-before-timeline drafts, paused KPI controls and legacy values.
4. `dashboard-functional-audit.cjs`: 51,408 data/model checks, 90 section renders, exact embedded sources, all 91 source rows and 114 index rows, category filters, source/Task links and Gantt keyboard tooltip behaviour. Added reviewed report-code and partner-KPI display checks.
5. `report-identity-and-kpis.mjs`: secure code generation, code change for a new reporting period, latest revisions, identical duplicates, conflicting copies, reused identity, overlapping Task coverage and shared activity reconciliation. Also checks AISHA numeric/status types and narrative-free public summaries.
6. `export-recovery.mjs`: exact/mismatched saved-file checks, PDF/JSON export preparation, matching-JSON recovery, cancellation and manual reference paths.
7. `kpi-improvements.mjs`: retained shared-activity and private review compatibility.

### Browser

- Inspected the current published AI-SECRETT navigation, asset versions and grouped KPI table.
- Opened all seven AISHA preview dashboard sections; none showed a load error. The Gantt contains 50 months.
- Generated a Task PDF/JSON pair for disjoint months, with the new report code visible in the final confirmation.
- Generated a Communication PDF/JSON pair for May and July 2026 with revision 2; June remained excluded and its code stayed stable through review/generation.
- Dragged to add two separate ranges, then removed one highlighted range without clearing the other.
- Inspected the compact Task setup, live included-month count, writing guidance and desktop KPI column widths. Repaired the initial setup-grid selector and oversized code column found during this inspection. Rechecked BOSCH with zero assigned cards and SC as a Task contributor without cost fields. Writing-guidance focus displayed the tooltip; no browser warnings/errors were recorded.

### Limits

No genuine new partner reports, KPI values or status updates were supplied; synthetic records were used. File generation and structured restoration do not establish delivery to the coordinator. The browser viewport override did not actually change its 1280-pixel viewport, so this run does **not** claim a completed device-size browser check; responsive card rules were implemented and their labelled cells checked, but mobile visual verification remains open. This is not a complete accessibility certification.
