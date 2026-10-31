# AISHA staff effort — local preview, 31 October 2026

The Grant Agreement staff effort table is transcribed from Part A printed pp. 28–29, PDF pp. 89–90. Its 30 beneficiaries × 10 Work Packages reconcile to **1,197.50 PM**. Blank source cells mean no allocated effort in that WP. The 12 associated partners have no Grant Agreement PM allocation; their reported effort stays separate from beneficiary totals.

The preview implements the equal Task/month planning method requested with the AI-SECRETT feature transfer: split each partner/WP allocation equally among its officially assigned Tasks, then over each Task's active months. These are internal planning estimates, not additional Agreement commitments. Four-decimal integer arithmetic and deterministic remainder allocation preserve the official totals. Narrowing Task coverage prorates only the planning reference by calendar days; it does not alter reported effort.

Two positive WP allocations have no named Task in AISHA's existing formal assignment catalogue: **UPM / WP6: 7 PM**, and **Poli.D / WP5: 3 PM**. They remain entirely at WP level, spread across that WP's active months for comparison. No Task or participant assignment has been added. The dashboard flags both exceptions. Task estimates sum to 1,187.50 PM; adding those 10 WP-level PM reconciles the full 1,197.50 PM. An unlisted Task has no assigned Task estimate; associated partners have no GA allocation.

## Entry and interpretation

One Task total is the default; it is divided exactly across the explicitly covered months, including gaps. Partners can instead enter separate monthly amounts. Opening an existing entry or changing entry mode never redistributes unequal existing values. Editing the total explicitly redistributes the total. Reported values can exceed planning; planning is not a cap. Missing is unknown, distinct from explicit zero. Included Tasks and additional formal Task/WP contributions require a number for every covered month before final review. Other project work may optionally record effort and attribute it to an active WP.

Task and WP comparison cards combine incorporated reports with the current draft, excluding the report code being revised. The report-total summary covers only the current report. Reports on other devices are unavailable until supplied to coordination. WP leadership assessments are narrative only and do not duplicate Task effort. Existing direct WP records remain importable, separately selectable and exportable; removing their additional WP narrative does not delete that independent ledger.

## Files and compatibility

Task schema 2.5 adds `staff_effort` with unit `PM`, allocation version `equal-task-month-v1`, monthly `rows` and optional context `notes`. Rows have `scope` (`task`, `work_package`, `other`), stable `id`, `wp` or null, calendar `month`, and non-negative decimal-string `pm` up to four decimals. Notes can be saved before PM values are entered. Current reporting hides monetary inputs; earlier EUR data remain in editable records for fidelity and are never converted into PM. Task schemas 2.0–2.4 and Communication schemas 1.1–1.4 remain supported. Old files without effort retain missing effort until the partner enters it.

Full, draft and individual Task PDFs carry structured editable data. Individual Task JSON and PDFs include only that Task's effort and notes. A direct Task import cannot replace other Task or WP records. Whole-report selection can independently import direct WP effort. Imports validate before mutating state. Repeated imports replace selected contexts instead of adding values again. Stable report codes and revisions, the saved-copy verifier and AISHA's unsaved-progress guard remain in place; PM-only edits are included in the guard.

## Dashboard and coordinator workflow

The Staff effort table covers the full 48-month project, with Planned and Reported cards, partner → WP → Task → month expansion, sticky partner/total columns, keyboard and horizontal scroll controls, and associated partners shown separately. No partner PM records have been supplied, so actuals are **Not reported**, not zero.

`prepare-reviewed-reports.mjs` accepts only coordinator-verified files, selects the latest revision, rejects conflicting copies and overlapping effort contexts, and strips private notes and narratives from public effort summaries. Removing rows present in an earlier revision requires an explicit `allow_effort_removals: true` in the verification manifest. The private intake validates schema 2.5 and the private compiler carries accepted effort into a sanitized candidate. Neither workflow publishes automatically.

Regenerate the public effort bundle with `scripts/embed-data.py`. Re-extract the exact source table with `scripts/extract-staff-effort.py /path/to/agreement.pdf`; this does not copy the PDF into the site. Grant sources, assignments, milestones, deliverables, KPI definitions and established deadline rules are unchanged. KPI reporting remains paused in both builders.
