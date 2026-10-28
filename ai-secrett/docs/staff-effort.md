# AI-SECRETT staff effort reporting

This implementation is local preview work. Do not publish without a new, explicit user request.

## Authoritative planning source

`assets/staff-effort-data.json` transcribes the staff effort table in Grant Agreement 101226207, Part A printed pp. 20–22, PDF pp. 80–82. It includes 22 beneficiaries × 12 WPs and the original row, column and grand totals: 2,130.63 person-months. `scripts/embed-dashboard-data.py` also regenerates the browser copy `staff-effort-data.js`.

The coordinator confirmed the internal split on 28 October 2026: divide each partner's WP effort equally among that partner's officially assigned Tasks, then evenly among each Task's active months. Consortium Agreement assignments and windows in `config.js` and `project-model.js` govern membership. The first Task in a list has no extra weighting. RCE's nine commitments have no official allocation; its reported PM remain separate from beneficiary totals.

Planning uses integer units of 0.0001 PM. Any remainder is assigned deterministically in catalogue Task order, then calendar-month order. Each Task and WP reconciles exactly to its parent total. A narrowed Task date range prorates the monthly planning reference by calendar days. Actual PM are entered by the reporter and never generated from the plan. By default one total per Task is split equally across covered months, conserving the exact total to four decimals. Reporters can choose separate monthly entry; existing unequal or incomplete monthly records open in that mode and are never redistributed merely by opening the editor or changing modes. Editing the total explicitly replaces the covered monthly values with an equal split. A month cannot be entered twice under one partner/Task. Reports for separate parts of the same Task/month must be consolidated into a revision, preventing ambiguous overlapping coverage.

## Reporting contract (Task report schema 2.5)

The canonical `staff_effort` envelope has `unit: "PM"`, `allocation_version: "equal-task-month-v1"`, `rows` and optional `notes`.

A monthly row contains `scope` (`task`, `work_package`, `other`), `id`, `wp` (or null for unattributed other project work), `month` (`YYYY-MM`), and `pm` (a non-negative decimal string with at most four decimal places, exported with four). Rows may retain a note from older preview files. Context notes are stored separately as `{scope, id, wp, text}` so a draft does not lose a note entered before the PM value. Monetary figures are never converted to PM.

Task rows refer to Tasks included in the report or its additional contributions. The overview has no additional-WP effort button: ordinary reporting uses Task effort. Existing direct WP rows remain importable and exportable for compatibility. Their PM are additional to Task entries, never copies of Task sums. An extra WP uses the same direct-WP entry as the WP editor, preventing duplicate storage. Removing or narrowing its narrative does not erase the independent direct-WP ledger. Direct WP effort is a separate checkbox during selective imports. Other contributions use their stable GEN identifier and may optionally be attributed to one WP active for every covered month; otherwise they remain separate. Work Package leadership assessments are narrative only and do not create effort rows.

Every included Task and extra Task/WP needs a numeric value for each included month before final review, including explicit zero. Blank is unknown, not zero. No-work Tasks create explicit zero rows, and declaring no work asks before clearing existing content. Planning is a reference, never an input cap; reported effort can exceed Task/WP planning and balances can become negative. Notes and invalid/incomplete fields remain draft work until corrected. Valid drafts can be saved to this browser or exported as PDF/JSON.

The live builder merges this draft with published effort records, excluding the report code being revised and preventing duplicate-key sums. Full WP balances cover the whole project; Task and WP card counters use the selected period. Unsaved reports on other devices are not accessible. Overlapping entries from a different published report code block final review and instruct the reporter to revise the original report.

Old schema 2.0–2.4 Task reports/drafts remain importable. Legacy EUR fields remain in the editable record for fidelity, hidden from current monitoring and never counted as effort. Missing effort in an older file remains unreported. Communication reports retain their existing contract. Individual Task PDF and JSON copies include only that Task's effort and notes, not direct WP or other Task entries. Whole-report selective imports replace only chosen effort contexts. Bad incoming data is rejected before mutating report state.

## Dashboard and publication of received reports

The Staff effort table covers the whole project, with planned and reported summary cards, and supports partner → WP → Task → month expansion, pinned partner and total columns, sticky headers/totals, buttons, a horizontal-position slider, pointer drag and keyboard scrolling. A dash means no record. Beneficiary totals exclude RCE; unattributed project work is identified separately. Partner reporting also displays partner-specific effort and report references.

No partner reports have yet been supplied. The checked-in dashboard therefore has no actual PM records or staff-effort update date. Do not infer effort from deliverable or milestone status, and do not include synthetic audit records in the public snapshot.

When the coordinator supplies reports:

1. Keep original reports privately. Use complete submission JSON or extract the exact JSON embedded in its PDF. Individual Task copies and drafts are not complete submissions.
2. Add verified report files to the existing manifest consumed by `scripts/prepare-reviewed-reports.mjs`. Give each a `reviewed_at` date. Preserve report codes and revisions.
3. The preparation script selects the latest revision of each report code, rejects conflicting same-version files and overlapping Task/month or effort/month coverage, and exports `staff_effort_records`, `report_registry`, and `effort_as_of` alongside existing reporting and KPI results. It excludes narrative notes, contributor details and legacy costs from published effort data.
4. If a revision omits effort rows included in an earlier version, review the omissions. Explicitly set `allow_effort_removals: true` on that verified manifest entry only when those removals are intended. Do not silently drop previously recorded effort.
5. Merge the prepared records and update date into `dashboard-data.json`, regenerate embedded data, audit, and publish only with authorization for that update. Retain earlier report versions in the private manifest for reconciliation.

## Verification

Run with the bundled Node runtime:

- `node tests/staff-effort-audit.mjs`: source totals, all Task/month shares, exact rounding, boundary dates, flexible overruns, RCE, malformed/duplicate/missing entries, revisions/removals, dashboard preparation, all 66 Task PDF/JSON data round trips.
- `node tests/staff-effort-entry-audit.mjs`: actual editor handlers for all 1,123 partner/Task assignments, total distribution, refresh, notes, separate months, validation and zero.
- `node tests/staff-effort-import-audit.mjs`: actual report restore and export functions, replacement/selection, atomic rejection, legacy EUR preservation, direct-WP-only reports, explicit zero and draft notes.
- `node tests/platform-audit.mjs`: existing partner/month assignments, all 66 Tasks, deadlines and PDF recovery.
- `node tests/dashboard-functional-audit.cjs`: existing dashboard sections, Gantt controls and new effort table detail/totals.
- `node tests/report-identity-and-kpis.mjs`: existing codes, revisions and KPI deduplication.

Also check the local browser reporting journey, generated PDF appearance, PDF and JSON imports, negative balances, no-work confirmation, missing/negative PM feedback, extra contributions, associated partners, horizontal scrolling and mobile layout. Source changes are confined to `ai-secrett/`.
