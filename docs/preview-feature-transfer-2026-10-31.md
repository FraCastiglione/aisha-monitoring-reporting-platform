# AI-SECRETT feature transfer to AISHA — preview audit

Scope: the ten differences listed in the 31 October comparison, implemented locally. Initially preview-only; publication was subsequently explicitly authorized by the coordinator after the full audit. No status/achievement update is part of this release.

- Staff effort entry in PM replaces visible monetary monitoring; exact monthly rows and notes, total/monthly modes, over-plan amounts, explicit zero/no-work, scoped roll-ups, full report summaries and legacy EUR fidelity.
- Exact AISHA effort baseline: 300 partner/WP source cells, all row/column totals, 1,197.50 PM. Independently inspected the two source pages. The UPM/WP6 and Poli.D/WP5 assignment gaps remain at WP level and are disclosed.
- Staff effort dashboard and partner-reporting summaries, with expansion to monthly report references and no fabricated actuals.
- PM-aware PDF/JSON export, whole/individual imports, selection, revisions, overlap prevention and private coordinator intake/preparation.
- Individual Task JSON download and direct JSON import, alongside the existing PDF workflow.
- Draggable additional-contribution month timeline and selected/available-month counter, using AISHA's 2026–2030 project calendar.
- Matching placeholders, persistent question-mark guidance and resize hints for all five additional-contribution narrative fields.
- Inline Communication Yes/No/count feedback, including zero versus Unknown.
- Work Package leadership download opens the PDF/JSON format chooser.

AISHA's existing page-opening fix, 42-partner routing, formal/source descriptions, shared report identities, keyboard file buttons, saved-copy checks, unsaved-progress protection, paused KPI reporting and dashboard search/favourites remain in place. Core catalogue/configuration/model/status files are unchanged. AI-SECRETT's separate repository is read-only reference material for this task.

## Verification completed

- The initial 13 regression suites pass, including existing assignment/routing, accessibility, navigation, progress protection, saved-file recovery, legacy imports and paused KPI entry checks.
- Source baseline reconciles all 300 allocation cells and 14,400 partner/WP/month comparisons. The two unassigned WP pools are not redistributed into invented Task assignments.
- Actual effort-entry handlers pass for all 503 partner/Task assignments. Import/restore tests cover selective and repeated merges, direct WP effort, explicit no-work zeros, incomplete notes, atomic rejection, revisions, overlap prevention and legacy EUR preservation.
- All 32 Tasks pass PDF restoration checks. Full, draft and individual Task PDFs were generated, rendered and visually inspected (eight pages total).
- Browser checks: IF.E gapped-month effort entry, above-plan entry, reopening without loss, saved PDF receipt and restoration, individual Task JSON download/import without duplication, other-work effort and month toggles, full report revision, and corrected Communication inline errors. BOSCH voluntary Task reporting reaches review without a funded-allocation assumption.
- A browser-generated synthetic report passed private coordinator validation, sanitized public preparation and compilation in a temporary intake directory. No real submission register or dashboard snapshot was changed.
- Staff dashboard partner/WP/Task expansion and monthly detail work in-browser. Desktop and 390px dashboard layouts were inspected; horizontal scrolling stays within the table. The additional-contribution editor was inspected at desktop width. The temporary viewport override was reset.
- No browser errors or warnings were captured in the final dashboard check. `git diff --check` passes. Core source/status files and AI-SECRETT remain unchanged.

Test fixtures are synthetic and are never added to the dashboard snapshot. Task/month planning values are explicitly internal equal-split estimates, rather than Agreement Task allocations. Actual effort remains “Not reported” until accepted reports are incorporated. A browser test verifies the downloaded file's bytes when supplied for confirmation; the platform does not assume a click alone proves a durable saved copy. Arbitrary/scanned third-party PDFs still require matching editable JSON; no OCR interpretation has been introduced. Pointer dragging is supported by the contribution timeline implementation; the browser check exercised individual month toggles rather than a physical drag gesture.

Preview: `http://127.0.0.1:8765/?preview=staff-effort#dashboard`. Publication was later authorized; see [the full audit](audit-full-platform-2026-10-31.md) for the final fifteen-suite verification and release repairs.
