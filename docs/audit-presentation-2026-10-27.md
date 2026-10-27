# AISHA pre-presentation audit — 27 October 2026

## Assessment

**Ready within the reviewed desktop scope.** The audit repairs and release follow-up are prepared for publication under the coordinator’s explicit request of 27 October. Deployment status is confirmed separately in the release response. The audit itself originally made no publication; the follow-up includes the remaining keyboard repair and an unsaved-progress warning.

**Verification is partial across devices and browsers.** All major sections and supported import/export families were reviewed, with exhaustive automated partner/month eligibility checks and representative browser journeys. This is not a claim that every possible interaction combination, browser engine, mobile device or hostile file has been tested.

The most important presentation qualification is data freshness: the dashboard's reported project status remains the supplied **25 September 2026 snapshot**, not a new October assessment. It correctly shows 3 of 22 deliverables submitted and 5 of 23 milestones achieved. Reported partner coverage, verified Task completion, KPI actuals and messages remain empty until coordinator-reviewed records are supplied. Empty records must not be presented as partner failure or measured zero. KPI entry remains paused in both builders as requested.

## Confirmed defects repaired in preview

| Location | Defect and verified repair |
| --- | --- |
| Task timeline | Keyboard toggles replaced the focused month button. The replacement button now receives focus; Enter and Space preserve the position and disjoint selections. Verified in the browser and regression test. |
| Import and saved-file controls | Five actions used non-focusable labels attached to hidden file inputs. Native buttons now open the correct file chooser: whole report, communication report, individual Task PDF, saved-copy check and matching JSON recovery. Actual keyboard file selection was exercised. |
| Work Package leadership updates | Changing to months outside a saved WP's window hid its update while validation still demanded removal. The retained update now stays visible with its answers preserved and a removal action that asks for confirmation. Reproduced with UWK/WP5; cancellation preserves the entry. |
| Full report resumption | A complete import into an empty report with matching months could lose the incoming report code and revision. Full resumption now retains them. Partial selection and merges into an existing report retain the current identity. Three handler regressions cover these separate policies. |
| Reviewed dashboard preparation | An unassigned Task could be accepted as a formal assignment. Assignment checks now distinguish formal/listed records from legitimate associated-partner voluntary records, preserving old AP contributions. |
| Reviewed WP coverage | A WP record used the whole report's outer dates even when the WP was active only in later selected months. Public coverage now uses the WP's actual selected active months. |
| Public summary boundaries | Object-valued identifiers could carry private extension content into an otherwise narrative-free output. Identifiers are now constrained strings; reviewed KPI month lists must be nonempty, sorted, unique and inside the report period. |
| Gantt tooltip | A distant focused cell could place its tooltip below the visible screen. Positioning now clamps the complete tooltip inside the viewport. Browser evidence changed from bottom 821px in a 720px viewport to bottom 708px; the regression also checks horizontal bounds. |

Only demonstrated defects and their tests/cache versions were changed. No Agreement text, partner assignments, AP exemptions, deadlines, source KPI wording, actual project status, established colours or AI-SECRETT files were modified.

## Source and partner verification

- All **30 beneficiaries and 12 associated partners** are represented in separate selection lists.
- All **32 Task beneficiary sets and task leaders** match the signed Agreement, including the documented UVEG-to-UV identity normalization. The ten Work Package leaders and Task activity windows match the source.
- All **10 WP objectives and 32 complete Task descriptions** match after normalizing extraction whitespace and page footers.
- Associated partner sets match Attachment 6 with the coordinator's four exemptions. There are **70 listed voluntary Task commitments**. BOSCH, CEPS, EPRD and Regione Toscana have no assigned Tasks; their voluntary Task/WP reporting path was exercised. Associated-partner editor roles remain Task contributor and omit cost claims.
- All **22 deliverable and 23 milestone deadlines/leaders** match the Agreement schedules. Internal draft checkpoints remain the first of the due month and official deadlines the last day.
- All **208 nonempty verbatim KPI/objective/target/evidence fields** match their cited source pages, including the passage crossing PDF pp. 85–86. The five source categories contain 9 SMART objectives, 19 call rows, 24 communication rows, 13 framework blocks and 26 additional passages. The linked index contains 114 typed measurement definitions; these are not 114 independent additive project targets.
- The 17 baseline risks, meeting dates and Technical Progress Report windows remain consistent. Review rails are restricted to activities involved in the relevant M1–18, M19–36 and M37–48 reporting periods.
- September overview calculations independently reconcile: 3/22 submitted; 5/23 achieved; 7/10 active WPs; 2 deliverables and 5 milestones due by M5. The progress position is M5/48, not Task completion.

## Functional coverage

| Area | Evidence and result |
| --- | --- |
| Navigation and guide | Reporting Tool, dashboard, instructions and Consortium Map destination load. Map destination displays the expected 30/12 consortium; its independent hosting is unchanged. |
| Contributor and report selection | Required identity/email validation, separate partner categories, report type switching and per-type code/revision behavior checked. |
| Task reports | Eligibility across all partners and months; gaps; optional narratives; dates; significant-issue severity; coordinator support; draft/complete/no-work transitions; editor and overview return paths checked. Actual UWK contribution, no-work declaration and Work Package leadership paths were exercised. |
| WP leadership | Own-leader eligibility, active Task assessments, independent organisation contributions, no-work and retained out-of-range updates checked. |
| Additional contributions | Multiple extra Tasks/WPs can be added together as drafts. BOSCH completed a voluntary Task and WP contribution and reached full review without an assigned Task. |
| Communication | Monthly gaps, event entries, typed counts, unknown versus zero, links, support needs, review and generation checked. Actual May+July report restored its 12-participant event without adding June. |
| Review and versions | Confirmation gates final generation. Changing revision at review to 2 appeared in the final report summary and saved JSON filename. Report codes stay scoped to partner, report type and period. |
| Browser draft | Save, reload, restore and deletion of this audit's disposable draft exercised. Saved Task/WP answers and report identity returned correctly. Browser persistence is explicitly optional and clearable. |
| Downloads | An actual three-page draft PDF and final communication PDF were saved to the host Downloads folder. The saved JSON and PDF copies passed the platform's byte-for-byte receipt check. All three draft PDF pages were rendered and visually inspected; logo, timestamps, text and footers were legible. |
| Imports | Task schemas 2.0–2.4 and communication 1.1–1.4; JSON/draft/full/individual Task/communication PDFs; partial entry selection; old associated-partner preservation; matching JSON recovery; wrong partner, malformed values, duplicates and size guards checked. Actual PDF restoration put answers into T1.1 and WP5; an actual wrong-partner JSON import was rejected without changing SC's report. |
| Overview and detail lists | Deliverable/milestone totals and complete lists; upcoming window; expanded descriptions and direct Task links checked. D10.1 navigated directly to expanded T10.1. |
| Gantt and calendar | Full 50 displayed months, 48-month project duration, all Task expansion, width expansion, internal/official markers, first/last day boundaries, review rails, calendar day selection and November meeting agenda checked. Distant-cell tooltip repaired and verified. |
| Work Package directory | All ten packages and 32 Task descriptions, objectives, leadership, status distinctions and related commitments checked. |
| Partner coverage | Task/WP/partner modes, 30/12 category filters, period/work-package/search filters, empty actuals, zero-assignment exemptions and reviewed-version deduplication checked. All 42 remain discoverable in partner mode. |
| Risks | All 17 shown by default; high-impact filter paths, baseline mitigations and absence of supplied actual Task flags checked. |
| KPIs | All six categories render their expected rows. Topic/search and no-match recovery checked; exact text/page references, related links, favourites logic, reviewed result/partner cells and legacy value preservation checked. |
| Message board | Correct explicit empty state; published-message rendering path reviewed. No invented message was added. |
| Privacy and delivery | Reporting functions have no automatic upload or Nextcloud access. Download/import handling stays local; public preparation whitelists summary fields. Credentials or live user reports were not published. This is a scoped code/data review, not a penetration test. |

All nine current regression suites passed after the release follow-up. The dashboard suite includes 51,408 data/model checks, 90 render paths and exact agreement between the three embedded and source datasets. Import coverage includes all 42 partners, 503 Task entries and ten leadership updates. Browser console warning/error logs were empty on the live and preview audit tabs.

## Remaining limitations and proposals

1. **Keyboard navigation repaired in release follow-up:** section/filter controls retain their focus after redraw. Gantt expansion controls also retain focus when their text changes. Removed controls fall back to the active dashboard section.
2. **Device/browser acceptance remains partial:** the in-app browser did not apply the requested narrow viewport; it continued to report 1280×720. Responsive CSS was inspected, but this is not mobile visual acceptance. Other browser engines, screen readers and real touch devices were not certified. Present using the tested desktop setup.
3. **Ordinary/scanned PDFs:** embedded AISHA PDFs restore structured answers; arbitrary/scanned or externally resaved PDFs require matching JSON or manual transcription. No OCR-based field guessing is promised.
4. **Unsaved navigation protection added:** changed Task and Communication reports are tracked independently. The browser requests a close/reload warning until that version has a successful browser save or byte-verified full-report copy. Verifying an older file does not protect later edits; an individual Task PDF does not protect the full report. Generating a file alone does not prove it is saved. Browser/device policies can limit native warnings; portable backups remain necessary.
5. **Live release:** the coordinator explicitly authorised publication of these repairs after the audit. The release response confirms the resulting GitHub deployment.
6. **Current status:** obtain coordinator-confirmed updates if presenting October achievement/coverage. Do not silently advance the September snapshot or fill empty metrics with examples.

## Scorecards

Counts are scoped feature/claim-family inventory counts, not a universal pass percentage. A zero numerator means no remaining defect was observed in that category; some device/browser checks remain incomplete. Full UI combinations were sampled rather than exhaustively clicked.

### Dashboard and platform quality

| Category | Observed defects | Assessment |
| --- | --- | --- |
| Usefulness and completeness | 0 / 9 | Seven dashboard sections and two builders have usable paths; unavailable actuals are explicit. |
| Analytical clarity | 0 / 9 | Schedule, status, preparation, submission and completion remain distinct. |
| Visual and interaction consistency | 0 / 25 | Dashboard focus repaired and browser-verified. Narrow-device visual acceptance is incomplete. |

### Analytical correctness and robustness

| Category | Observed defects | Assessment |
| --- | --- | --- |
| Source authority and confidence | 0 / 6 | Formal Agreement, associated commitments and coordinator status traced separately. |
| Value accuracy | 0 / 6 | Totals, eligibility, dates, progress ratio and reviewed-version calculations reconcile. |
| Within-chart agreement | 0 / 2 | Overview position and Gantt/calendar agree with source scope. |
| Complete source details | 0 / 6 | Exact passages and page references checked; status freshness visible. |
| Cross-artifact consistency | 0 / 4 | Assignments, wording, KPI references and report/PDF/JSON answers reconcile. |
| Data-quality controls | 0 / 8 | Imports, roles, coverage, types, revisions, storage and public summary boundaries checked. |
| Conclusion support | 0 / 7 | Missing records are not converted into measured zero or unverified completion. |

Internal evidence and the machine-checked scoped coverage record were retained outside the public app under `/tmp/aisha-presentation-audit/`; test source extractions are also temporary. No actual partner submissions were added to the dashboard.
