# AISHA reporting contract — Task report version 2.2

The signed Grant Agreement supplies Work Packages, Task wording, assignments and activity windows. Partners choose the selected months, included Tasks and their own answers. Selected months may contain gaps. Future project months remain available.

## Complete partner report

A complete Task report has `schema_version: "2.2"`, `project: "AISHA"`, `document_kind: "submission"`, `report_type: "tasks"`, `report_key`, `revision`, `partner`, `contributor`, `reporting_period`, `tasks`, `work_package_leadership`, and `generated_at`. It needs at least one completed Task, explicit no-work Task declaration, or Work Package leader update. The review screen precedes generation; the site does not transmit the report.

`reporting_period` records inclusive ISO start/end dates, project month codes and an ordered `selected_months` list, such as `["2026-05", "2026-06", "2026-09"]`. Interior months omitted from that list are not covered. The report key is `{partner}:TASKS:{start}:{end}`. PDF and JSON filenames are `AISHA_{PARTNER}_TASKS_{START}_{END}_v{REVISION}` with the relevant extension. If selected months change but the outer dates stay the same, a corrected report keeps the key and increments its revision.

Each Task entry identifies its Agreement metadata, partner role, `work_status` (`completed` or `no_work`), Task dates, exact covered months, and answers. The Task must be assigned to that partner and active in at least one selected month. Task dates may be narrowed within the selected months. The site does not know what has been reported previously. A Task with no work clears its contribution answers; an unfinished Task must be completed, declared no work, or removed before generation.

Each `work_package_leadership` entry identifies a Work Package that the partner leads in the Agreement, its selected active months, `work_status`, optional overall narrative, and optional `task_updates`. The Task assessments may cover all Tasks in that Work Package, including Tasks assigned to other partners. They describe the leader's assessment and do not certify another partner's submission. A Work Package may be explicitly declared to have no work; that declaration clears its narrative and Task assessments. A partner can report solely on Work Package leadership in a period.

| Task answer | Rule | JSON value |
| --- | --- | --- |
| Activities, results, difficulties, upcoming activities, additional comments | Optional text | Empty string when blank |
| Raw costs | Optional non-negative EUR amount with up to two decimals; not a grant payment claim | Decimal string or `null` |
| Significant issue | Optional Yes/No | `true`, `false`, or `null` |
| Severity | Required only when significant issue is Yes | Low, Medium, High, Critical, or `null` |
| Coordinator action required | Optional when significant issue is Yes | `true`, `false`, or `null` |
| Support request | Required only when coordinator action is Yes | Text or `null` |

## Drafts and import

A whole-report draft uses `document_kind: "draft"` and includes unfinished answers and `saved_at`. It may be saved in this browser or downloaded as editable JSON at any time, including inside a Task or Work Package editor. A readable draft PDF can also be downloaded from the overview; it embeds the editable draft record. Browser storage is convenient but can be cleared or exceed its quota; a downloaded file is the portable backup.

The import control accepts AISHA draft JSON, complete partner JSON, and new AISHA-generated Task or complete partner PDFs. These PDFs contain an embedded structured report record so the site can restore answers to the correct fields. An individual Task PDF imports only its Task when its selected months match the current report. Whole-report import lets the partner choose which Task and Work Package entries to bring in. When periods match, selected entries replace their counterparts and all other current entries stay. When periods differ, importing adopts the file’s selected months and replaces current entries. Imports are checked against the selected partner, Agreement assignment, Task and Work Package metadata, dates, and field structure; partners must review the result. Older PDFs without embedded data need their matching JSON file. PDF text extraction or reconstruction from arbitrary PDFs is not supported, because it cannot reliably map every field.

Individual Task PDFs are clearly labelled as one-Task reports and may include an unfinished draft. They are not complete partner reports. The private coordinator review accepts the complete partner JSON, including older 2.0 and 2.1 versions, but never an individual Task PDF.

The contributor name, role and email are self-declared; the static site does not authenticate them. `generated_at` is the browser's clock time and is shown in UTC on the PDF. It is not evidence that the coordination team received a file. There is no `submitted_at` or `accepted_at` in partner-generated files.

## Communication and coordinator use

The separate two-week Communication & Dissemination form remains in preview schema version 1.1. Its report key is `{partner}:COMM:{start}:{end}`. Conditional fields are validated before review. Unknown reach and enrolments are `null`, distinct from measured zero.

The private coordinator workflow validates complete Task report JSON, filenames and revisions against the Grant Agreement catalogue and a manually maintained status register. Only a coordinator-confirmed receipt changes status; accepted data alone may feed a private dashboard candidate. Narrative or private issue detail requires human review before publication.
