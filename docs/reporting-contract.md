# AISHA reporting contract — Task report version 2.5

The signed Grant Agreement supplies formal Work Packages, Task wording, assignments and activity windows. Attachment 6 supplies additional voluntary associated-partner Task commitments, with reporting routes corrected by the coordinator on 4 October 2026. Partners choose the selected months, included Tasks and their own answers. Selected months may contain gaps. Future project months remain available.

## Complete partner report

A complete Task report has `schema_version: "2.5"`, `project: "AISHA"`, `document_kind: "submission"`, `report_type: "tasks"`, `report_key`, `revision`, `partner`, `contributor`, `reporting_period`, `tasks`, `work_package_leadership`, `additional_contributions`, `kpi_contributions`, `staff_effort`, and `generated_at`. It needs at least one completed Task, explicit no-work Task declaration, Work Package leader update, additional contribution, a preserved legacy KPI contribution, or direct Work Package staff effort. The review screen precedes generation; the site does not transmit the report.

`reporting_period` records inclusive ISO start/end dates, project month codes and an ordered `selected_months` list, such as `["2026-05", "2026-06", "2026-09"]`. Interior months omitted from that list are not covered. The report key is `{partner}:TASKS:{start}:{end}`. New PDF and JSON filenames add the last eight characters of the random report code before `_v{REVISION}`. The legacy report key remains for compatibility. Corrections to the same selected period keep the report code and increment revision; changing selected months after export or restoration starts a new code and revision 1.

Each Task entry identifies its Agreement metadata, partner role, `work_status` (`completed` or `no_work`), Task dates, exact covered months, and answers. The Task must be assigned to that partner and active in at least one selected month. Task dates may be narrowed within the selected months. The site does not know what has been reported previously. A Task with no work clears its contribution answers; an unfinished Task must be completed, declared no work, or removed before generation.

Each `work_package_leadership` entry identifies a Work Package that the partner leads in the Agreement, its selected active months, `work_status`, optional overall narrative, and optional `task_updates`. The Task assessments may cover all Tasks in that Work Package, including Tasks assigned to other partners. They describe the leader's assessment and do not certify another partner's submission. A Work Package may be explicitly declared to have no work; that declaration clears its narrative and Task assessments. A partner can report solely on Work Package leadership in a period.

`additional_contributions` records voluntary work outside the partner's listed Task or Work Package leadership assignments, with a Task or Work Package ID, selected active months, a draft/completed state, activities, results, difficulties, upcoming work, optional evidence reference, and `assignment_basis: "voluntary_unlisted"`. A partner completes each entry through its own report editor. These entries do not revise the Grant Agreement assignment matrix. Versions 2.0–2.4 remain importable; older short entries are treated as completed, with their single narrative in activities.

`kpi_contributions` retains legacy indicator values by catalogue ID. New direct KPI reporting is paused in both builders; existing values can still be imported and preserved in review/export. Counts use non-negative whole numbers; ordinary percentages use 0–100, while configured growth measures permit negative values and growth above 100%. Rates and scores include their calculation basis or measurement scale. Decimal indicators allow up to two decimal places; status indicators use an explicit status. An activity reference distinguishes claims for different programmes, cohorts, campaigns and outputs. Imports identify entries by indicator ID plus activity reference. Numerator and denominator values must agree with the reported rate or growth when supplied; the website-to-application conversion and webinar-retention indicators require both values. Each entry requires an evidence reference and the partner's confirmation that the proof is already in Nextcloud or will be added after download. These are claims for coordinator review, not published dashboard actuals. The communication report retains the same legacy KPI contribution array in schema version 1.4.

| Task answer | Rule | JSON value |
| --- | --- | --- |
| Activities, results, difficulties, upcoming activities, additional comments | Optional text | Empty string when blank |
| Staff effort | Each covered Task month needs a non-negative person-month amount; up to four decimals; explicit zero when none | `staff_effort.rows`, with scope, ID, WP, month and decimal-string PM |
| Legacy raw costs | Preserved in editable imports/exports; hidden in the current effort form; never converted to PM | Decimal string or `null` |
| Significant issue | Optional Yes/No | `true`, `false`, or `null` |
| Severity | Required only when significant issue is Yes | Low, Medium, High, Critical, or `null` |
| Coordinator action required | Optional when significant issue is Yes | `true`, `false`, or `null` |
| Support request | Required only when coordinator action is Yes | Text or `null` |

## Drafts and import

A whole-report draft uses `document_kind: "draft"` and includes unfinished answers and `saved_at`. It may be saved in this browser or downloaded as editable JSON at any time, including inside a Task or Work Package editor. A readable draft PDF can also be downloaded from the overview; it embeds the editable draft record. Browser storage is convenient but can be cleared or exceed its quota; a downloaded file is the portable backup.

The import control accepts AISHA draft JSON, complete partner JSON, and new AISHA-generated Task, complete partner and Communication & Dissemination PDFs. These PDFs contain an embedded structured report record so the site can restore answers to the correct fields. An individual Task PDF imports only its Task when its selected months match the current report. Whole-report import lets the partner choose which Task, Work Package leadership, additional and KPI entries to bring in. When periods match, selected entries replace their counterparts and all other current entries stay. When periods differ, importing adopts the file’s selected months and replaces current entries. Imports are checked against the selected partner, listed assignments, Task and Work Package metadata, dates, KPI units and field structure; partners must review the result. Older PDFs without embedded data need their matching JSON file. PDF text extraction or reconstruction from arbitrary PDFs is not supported, because it cannot reliably map every field.

Communication imports restore the partner, exact date range, communication answers and any legacy KPI contributions; they do not populate Task reporting fields. Legacy KPI-only drafts without a chosen period can be restored without replacing an existing Task timeline.

Individual Task PDF/JSON copies are clearly labelled as one-Task reports and may include an unfinished draft. They are not complete partner reports. The private coordinator review accepts the complete partner JSON, including earlier 2.0–2.4 versions, but never an individual Task PDF.

The contributor name, role and email are self-declared; the static site does not authenticate them. `generated_at` is the browser's clock time and is shown in UTC on the PDF. It is not evidence that the coordination team received a file. There is no `submitted_at` or `accepted_at` in partner-generated files.

An unsaved-progress guard tracks Task and Communication reports independently. Browser saves and byte-verified full-report copies protect their exact versions. An individual Task PDF does not protect the rest of the partner report, and verifying an older copy does not clear newer edits. The native close/reload prompt is requested only for changed, unprotected progress; it is subject to browser policy and is not automatic storage.

## Communication and coordinator use

The separate monthly Communication & Dissemination form uses schema version 1.4. Its report key is `{partner}:COMM:{start}:{end}:{selected_months joined by commas}`. Whole selected months may contain gaps; only the explicit list is covered. Earlier schema 1.1/1.2 14-day files remain readable and require the partner to review/select the monthly coverage. Transitional 1.3 single-month files also remain readable. Conditional fields are validated before review. Unknown reach and enrolments are `null`, distinct from measured zero. Legacy KPI values may be retained with their evidence; the coordinator checks for overlap before using the communication fields and KPI claims in project totals.

The private coordinator workflow validates complete Task report JSON, filenames and revisions against the Grant Agreement catalogue and a manually maintained status register. Only a coordinator-confirmed receipt changes status; accepted data alone may feed a private dashboard candidate. Narrative or private issue detail requires human review before publication.

### Saved-copy checks and PDF recovery

Generated files remain available through a direct download link after preparation. The optional saved-copy check compares the selected local file's complete bytes with that exact generated artifact; it does not import the selected file. This distinguishes a requested download from a verified saved copy.

If a valid PDF has no embedded AISHA data, the report builder offers its matching JSON backup or manual reporting with the PDF as a reference. Whole-report recovery retains entry selection; single-Task recovery uses only the selected Task and the same selected months; communication recovery still asks before replacement. No scan text is guessed or automatically assigned to report fields.

## Associated-partner routing (4 October 2026)

For associated partners, only Attachment 6 commitments are listed in the builder. BOSCH, CEPS, EPRD and Regione Toscana (RT) have zero assigned Tasks. All associated partners can select voluntary additional Task/Work Package contributions. Assigned associated Task records export `partner_role: "Task contributor"`; beneficiary roles are unchanged. Earlier associated role strings remain importable in supported schemas. Imported associated Tasks outside the current commitment list keep their full Task answers and no-work/draft/completed status in the voluntary section, and re-export with `assignment_basis: "voluntary_unlisted"`. Individual Task PDF imports remain scoped to the selected Task. Duplicate Task entries across the main and additional arrays are rejected atomically. Formal Agreement participant text is preserved verbatim.

## Other project work (28 October 2026 preview)

All beneficiaries and associated partners may add a voluntary contribution outside a formal Task or Work Package. These entries use `kind: "general"`, a stable `GEN-` identifier and a partner-written title (up to 200 characters). Months are an explicit subset of the full report timeline, including gaps. Activities or results and at least one month are required for completion; unfinished entries remain portable drafts. Multiple separate entries are supported alongside additional Tasks and Work Packages.

Browser drafts, JSON, structured draft PDFs and complete reports preserve these entries. Whole-report import allows selecting them individually; individual Task import remains limited to its Task. Removing a contribution with answers asks for confirmation. Changing the main timeline preserves answers and flags months that need attention. Coordinator review accepts completed general contributions; narrative-free public summaries retain their scope and coverage, without assigning them to formal Tasks or counting them as formal Task completion.

## Staff effort (31 October 2026)

See [staff-effort.md](staff-effort.md) for the exact Agreement allocation baseline, internal equal-split Task/month estimates, two undistributed WP pools, optional general-work effort, revision and overlap checks. New Task reports use schema 2.5. Effort is a separate ledger from leadership narratives. No-work Task declarations create explicit zero monthly entries and clear existing Task effort. Individual Task exports filter answers, rows and notes before validation, so another unfinished Task cannot block a scoped backup. Inconsistent duplicate Task coverage/status in a schema 2.5 draft rejects atomically.
