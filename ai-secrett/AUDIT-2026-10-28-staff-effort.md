# Staff effort preview audit — 28 October 2026

Prepublication result: the implemented preview passes the automated gates and the browser scenarios below. No publication or Git push was performed during the preview audit. All implementation changes in this task are confined to `ai-secrett/`. Existing AISHA work was not edited.

## Source and calculation checks

- All 22 beneficiary rows, 12 WP column totals and the 2,130.63 PM grand total agree with the Grant Agreement staff effort table (Part A pp. 20–22; PDF pp. 80–82).
- The coordinator-approved equal Task share / equal active-month share method reconciles all 264 partner/WP pools, 1,114 beneficiary/Task allocations and 12,452 active beneficiary/Task/month allocations. Internal integer precision is 0.0001 PM.
- All 66 Task windows and their Consortium Agreement assignments remain unchanged. The existing 23-partner × 48-month audit checks 12,530 eligible Task-months, including RCE commitments.
- Narrowed dates prorate only the planning reference. Actual values above Task or WP planning are accepted; balances can be negative. No automatic PM values are inferred from narrative, costs, milestone status or planned effort.
- Missing, zero, negative, excessive decimal precision, invalid units, unknown contexts, duplicate months, invalid attribution and out-of-period values were checked.

## Reporting and file checks

| Area | Evidence |
|---|---|
| Task PM inputs | UVEG T1.1, two months: 0.75 + 1.50 = 2.25 PM against 1.00 PM planning; accepted and reflected in Task/WP counters. |
| Direct WP effort | WP1 entries 1.00 + 2.00 PM increased the same report to 5.25 PM; Task effort remained 2.25 PM. |
| Overruns | 20.00 PM on the Task plus 3.00 direct WP PM showed a -11.00 PM full-WP balance, with no budget cap. |
| No work | Confirmation cleared Task effort and emitted explicit zero monthly rows while preserving direct WP effort. Reopening showed editable zeros. |
| WP leadership | Builder references the shared ledger; leadership assessment does not add effort again. |
| Other contributions | 0.25 + 0.50 PM attributed to WP1 raised the report from 5.25 to 6.00 PM; removing that contribution restored 5.25 PM. |
| Extra Tasks | Missing PM kept the editor open and marked both missing inputs. Entering 0.30 + 0.40 PM produced 5.95 PM. |
| Extra WPs | Existing direct WP entries appeared in the same monthly fields and were not duplicated. Narrowing the narrative to November, then removing the narrative, preserved the independent 5.25 PM report total. |
| RCE | 0.25 + 0 PM on T1.3 reached review. Counters identify the absence of a GA allocation rather than treating it as a funded overrun. |
| Browser draft | Save, reload, re-identify and restore retained 5.25 PM and the exact monthly values. The synthetic browser draft was deleted afterwards. |
| JSON and PDF imports | The browser generated both files and re-imported each. Neither repeated import doubled the 5.25 PM total. |
| Individual Task files | Generated JSON contained only T1.1, its two monthly rows and note, totalling 2.25 PM. Re-import preserved the separate 3.00 direct WP PM. |
| PDF output | The generated whole report showed 5.25 total PM, 2.25 Task PM, monthly planning/reported figures, notes and direct WP rows; no current raw-cost monitoring label. Appearance was rendered and inspected. |
| Editable PDF fidelity | New staff effort data round trips through embedded PDF JSON for every one of the 66 Tasks. Existing PDF recovery tests also pass. |
| Legacy data | Actual import/export functions preserve old EUR values as legacy data and do not convert them into PM. |
| Notes | Notes entered before numeric values survive draft export/restore. Invalid note attribution is rejected before report state changes. |
| Revisions and duplicates | Only active report revisions count. Identical duplicate copies count once; conflicting copies and overlapping report families are rejected. Omitted prior effort rows require explicit coordinator review in the preparation manifest. |
| Communication | RCE monthly Communication report with five No answers, zero social posts and Unknown reach/enrolments reached review without acquiring staff effort fields. |

## Dashboard checks

- Full source table has 23 partner rows (22 beneficiaries plus the separately identified associated partner), all WP totals and the official beneficiary grand total.
- Partner → WP → Task → month expansion checked. UVEG WP1 expands to four assigned Tasks and six monthly rows per Task.
- Synthetic published-record tests exclude obsolete revisions and correctly display the current PM values. Published source remains empty of synthetic data.
- Latest UI revision removes the month/WP/partner/value filter block, Balance card and color legend as requested. The full-project table retains expansion, totals and scrolling.
- Horizontal scroll buttons and End keyboard navigation checked against actual scroll positions. Partner/total columns stay pinned.
- 390 × 844 responsive inspection: page width stayed at 390 px; the table scrolls within its 354 px container, with 145 px partner and 90 px total columns. The viewport override was reset afterwards.
- The new source and published-record preparation retain existing reporting coverage, Gantt, deliverable, milestone, risk, KPI and report-identity behavior. Existing dashboard checks cover 96 section/calendar renders.
- Palette contrast check darkened small planned figures on the tinted footer (5.11:1), partner record counts/source text on white (5.75:1), and search placeholder text (5.27:1).
- Browser error logs were empty in the exercised flows. A fresh final preview loads 2,130.63 PM planned and correctly displays reported effort as not reported.

## Automated gates

All passed:

1. `tests/staff-effort-audit.mjs`
2. `tests/staff-effort-import-audit.mjs`
3. `tests/platform-audit.mjs`
4. `tests/dashboard-functional-audit.cjs`
5. `tests/report-identity-and-kpis.mjs`
6. JavaScript syntax checks and `git diff --check`

## Current data boundary

No partner effort submissions have been supplied for the project snapshot. Published actuals remain unknown, not zero. Live builder balances combine the current draft with reports incorporated into the snapshot; drafts or submissions on other devices are unavailable until supplied to the coordination workflow. The coordinator procedure is documented in `docs/staff-effort.md`.

## Simplified effort-entry revision

- One numeric total per Task is now the default. It splits exactly across the covered months; 3.0001 PM over two months produces 1.5001 + 1.5000 PM. Separate-month entry remains available.
- Automated split checks cover 1–48 months, zero, the smallest supported amount, uneven rounding and large supported values; all preserve their total. Duplicate/empty month lists and negative values are rejected.
- Existing unequal monthly rows (0.25 and 1.50 PM) survive draft export/reimport and reopen in separate-month mode. Changing the selector alone preserves them; editing the total explicitly redistributes them.
- Browser checks confirm live Task/WP totals, an additional Task updating the same WP total, above-plan entry, zero and negative-value feedback. A refresh-selector error found during testing was repaired and retested.
- Staff effort details use an explicit label and a full-width, resizable text area. Notes persist through draft reimport and total edits.
- Task and WP cards distinguish Reported and Planned. Display is rounded to two decimal places; exact figures remain available in the tooltip and exported data. Missing effort is labelled “No report yet”.
- The overview’s additional-WP effort button and its standalone editor have been removed. Existing direct WP data remain compatible with imports/exports.
- Dashboard now shows only Planned and Reported summary cards. The requested filters, balance and color legend are absent; 23 partners, 12 WPs, nested Task/month detail and the 2,130.63 PM source total are retained.
- Mobile testing identified an invisible effort-tooltip overflow; its positioning was corrected. Desktop and mobile visual inspection covers the details field and compact counters.
- All six automated suites and syntax/whitespace checks pass after the revision. The new editor test exercises the actual handlers for all 1,123 partner/Task assignments, including associated-partner commitments. Mobile overflow is verified corrected: page and viewport both 390 px, with the guidance popup entirely within the screen. This remains local preview work; no GitHub publication was performed.

## Publication preparation: logo icon and writing guidance

- The tab icon uses the original AI-SECRETT logo symbol, supplied as PNG and multi-size ICO within `ai-secrett/assets/`.
- All five additional-contribution text areas have matching placeholders and question-mark guidance. Their shared editor covers extra Tasks, extra Work Packages and other project contributions.
- Every additional-contribution text area and the dynamic staff effort details field show the resize-corner hint. Staff effort details has its own anchored guidance button in ordinary and additional Task editors.
- Browser checks confirm guidance remains visible after typing, every tooltip matches its placeholder, text areas remain resizable, and narrow-screen tooltip bounds stay on screen. The additional-contribution month fieldset minimum width was corrected after mobile inspection found overflow.
- All six existing automated suites pass, including actual effort editor handlers across 1,123 partner/Task assignments, import/export fidelity, source totals, dashboard expansion and report/KPI identity checks. The changes are ready for the user's explicitly requested GitHub publication.
