# AISHA website audit — 26 September 2026

## Scope and evidence

I reviewed the partner entry flow, Task and Work Package reporting, Communication & Dissemination, draft and PDF handling, report review, dashboard overview, Gantt/calendar, Work Packages, partner coverage, risks, KPIs, and the guidance page. I checked the assignment model for all 42 partners with `coordinator/audit-partners.mjs` and compared the relevant dashboard catalogue against the signed Grant Agreement. I tested the site in the local browser at desktop and 390-pixel widths. No partner submissions or KPI actuals were available; those displays were checked as empty states. This is a preview audit, not a security penetration test or a full WCAG conformance audit.

## Corrected in this audit

1. Changing partners now clears the previous partner's unfinished Communication form, events, revision, review and download state. A browser check confirmed that a new partner starts with blank communication dates and answers.
2. Marking a Task complete or creating its individual PDF now checks Task dates, costs, issue severity and coordinator-support answers before the output can appear complete. A browser check blocked an invalid EUR amount and then accepted a corrected amount.
3. Imported or restored entries marked **no work** now reject hidden Task contribution text, costs, issue answers, Work Package narrative answers or Task assessments. The overview and export use the same rule.
4. Communication dates are now confined to the 48-month project window. Counts must be safe whole numbers; extremely large values can no longer silently become `null` in JSON.
5. Communication draft restore validates the payload before changing the form and clears old values before applying the new ones. The review screen now includes article details, social and email details, and the yes/no support and publication answers.
6. Browser draft overwrite, restore and delete actions now ask before replacing or removing work. The site still stores only one browser draft per partner and report type, so portable draft files remain important.
7. The generated-files summary uses the correct singular Task/Work Package wording. A cost note without an amount now appears in the PDF and review, and invalid draft cost text is identified as needing correction rather than silently rounded.
8. The Gantt no longer schedules a future internal draft checkpoint for a deliverable or milestone already reported submitted or achieved. Risk cards now label their abbreviated mitigation wording as a **summary**.
9. The KPI catalogue now covers 49 tracked measures from the Agreement's objectives and dissemination tables, including curricula, women by HE route, VET schemes, on-the-job packages, inclusion scheme funding, host organisations, EU initiative links, publications and employment outcomes. The dashboard exposes the different source definitions for dissemination reach, women's scheme support and the DSJP launch date instead of silently choosing one.
10. The private dashboard compiler now counts and explains valid files without a confirmed receipt, blocks overlapping **accepted** coverage for the same partner, Task and month, advances the project snapshot month with the preparation date, and preserves the last date on which coordinator status facts were supplied. The dashboard warns if rejected or unconfirmed files exist in a candidate.
11. The communication check-in is labelled as a coordinator workflow choice. The signed Agreement remains the source for project commitments and assignments; the original project brief requested the fortnightly form.

## Verification

- Assignment audit: 42 partners, 32 Tasks, 10 Work Packages and 10,224 eligible partner-month Task routes passed.
- Browser checks: partner switching, invalid and valid Task completion, review and report-file generation, dashboard and guidance navigation, mobile Gantt, and basic image, button, label and duplicate-ID checks. No browser errors were logged during these checks.
- Syntax and catalogue checks passed for the changed JavaScript and JSON.
- A private intake fixture with two accepted overlapping Task reports stopped compilation with a specific overlap message. Two valid files without registered receipts were counted and explained, and their filenames did not appear in the candidate JSON.

## Open source and workflow decisions

- **ADRA and T9.1:** The T9.1 narrative assigns ADRA in-kind outreach, while the formal Participants line names only beneficiaries. The current Task assignment follows the formal line, so ADRA does not see T9.1. The coordinator should explicitly decide whether to add a labelled in-kind T9.1 reporting route or record that work elsewhere. See the signed Agreement, Annex 1, PDF p. 83.
- **Different KPI bases:** PDF p. 114 specifies at least 20,000 activity attendances; p. 137 gives at least 60,000 participants across events and online activity. PDF pp. 113, 114 and 137 state women's scheme targets with different annual/aggregate bases. MS18 is formally due M06, while the dissemination KPI table says the DSJP landing page is live by M12. These need a measurement decision before a single red/green KPI assessment is published.
- **Report identity:** The current report key and filename use partner plus outer start/end dates. Two reports with different selected-month gaps but identical outer dates collide. The coordinator tools reject duplicate confirmed keys, but the partner workflow needs a revised identity contract before several such reports can coexist.
- **Submission trust:** The local preview creates files but does not submit or authenticate them. A PDF can carry editable report data; structural import validation cannot establish who authored it or whether visible PDF text was altered independently of embedded JSON. Human receipt and review remain necessary.

## Proposed next improvements

### Before live intake

1. Introduce a monitoring-round record with requested partners, Tasks, Work Packages, months, due dates, internal draft dates and exemptions. This lets the dashboard distinguish **not yet requested**, **requested but pending**, **received**, **changes requested** and **accepted** rather than treating every missing report alike.
2. Give each report a stable ID that includes its exact selected-month set, and define how later revisions and partly overlapping rounds relate. Migrate the coordinator status register without invalidating files already generated by this preview.
3. Replace the single browser draft with a list of named drafts by partner, report type and period. Add autosave, last-saved time, an undo window, and an explicit overwrite preview. Retain downloadable portable backups.
4. Build a private intake screen or controlled upload channel with a receipt number, immutable file hash, authenticated submitter, file version history and coordinator acceptance. Keep contributor contacts and raw narratives out of the public dashboard.
5. Create a source-resolution log for Agreement ambiguities, beginning with ADRA/T9.1 and the KPI definitions above. Every operational interpretation should show the Agreement passage and the coordinator's decision.
6. Add automated round-trip checks for browser draft, individual Task PDF, whole-report PDF, JSON import, no-work declarations, revisions, partner switching and coordinator compilation. Include fixtures with discontinuous months, overlapping periods and associated partners.

### Dashboard and monitoring

7. Add a partner × Task × selected-month coverage matrix with receipt status, declared no work, exact covered dates and outstanding requested periods. Roll these up to Work Package level without treating a leader's assessment as another partner's submission.
8. Give the coordinator a compact triage view: due soon, overdue after a confirmed request, changes requested, overlapping coverage, missing evidence, and data-quality warnings. Allow drilldown to the private evidence record.
9. Expand each of the 17 risks to the full Agreement description and proposed mitigation text, then add an operational owner, review date, current likelihood/impact, action, evidence and history. Keep potential Agreement risks distinct from actual Task flags.
10. Define every KPI's numerator, denominator, time window, deduplication rule, evidence source, owner, update frequency, partner breakdown and verification state. Do not sum partner rates or unique people automatically. Add a decision before selecting one of the Agreement's conflicting target bases.
11. Add KPI search, target-date filtering and a project/partner switch. With 49 tracked measures, the current category filter alone will become cumbersome as actuals arrive.
12. Give the Gantt and calendar a clear distinction between Agreement month, coordinator-set exact deadline, suggested internal draft checkpoint, actual submission date and accepted date. Add Task dependency links only when the coordinator validates them.
13. Surface data freshness by section: last coordinator status update, last report intake, last KPI measurement and last risk review. A newly prepared dashboard must not imply that old delivery statuses were reconfirmed.

### Partner experience and accessibility

14. Let partners reopen and compare an imported PDF or JSON with the current draft before replacing entries; show the exact Tasks, months and fields that differ.
15. Shorten the 48-month timeline on phones with collapsible years and a persistent selected-month summary. Keep keyboard month toggling and non-contiguous selections.
16. Replace technical references to JSON in partner-facing instructions with **editable data file** where possible, while preserving the actual file extension and a short explanation for people handling the submission.
17. Run a dedicated WCAG 2.2 AA review with keyboard-only navigation, screen readers, focus order, contrast and zoom checks. The basic structural checks in this audit are not a substitute.
18. Provide a printable partner guide, examples for **no work** and a clear explanation of what **complete** means. Translate partner-facing text where the consortium needs it, keeping Agreement quotations intact.
19. Define retention, deletion and recovery rules for local drafts and any future server storage before collecting real personal and financial details. Clarify whether the coordinator needs both PDF and editable data files for each monitoring round.
