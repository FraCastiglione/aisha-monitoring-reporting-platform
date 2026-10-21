# Reviewed report data for the dashboard

The public dashboard contains only coordinator-reviewed, summarised report data. Generating a PDF or JSON file in the reporting tool does not upload it or change dashboard totals.

Each new report has a `report_code` with 128 cryptographically random bits. Corrections retain that code and increment `revision`. The existing `report_key` remains for compatibility with older drafts. The code appears in the report review, PDF, JSON, downloaded filename, and final confirmation. The browser cannot reserve a code globally while offline; the review step rejects a code reused for a different partner, report type, or period, and flags conflicting copies. Keep the report code stable when resubmitting a correction.

To prepare a dashboard update, keep received JSON reports outside the public repository. Create a private manifest such as:

```json
{
  "verified_reports": [
    {"file": "reports/partner-report.json", "reviewed_at": "2026-10-21"}
  ],
  "reviewed_kpi_contributions": []
}
```

Run `node scripts/prepare-reviewed-reports.mjs manifest.json reviewed-output.json` from this directory. Paths in the manifest are relative to its location. The output has `report_registry`, `reporting_records`, and `partner_kpi_contributions` for `dashboard-data.json`; regenerate the embedded assets with `python3 scripts/embed-dashboard-data.py` after merging it. Do not publish the source reports or the manifest.

The preparation step keeps only the latest verified revision of each report code, ignores identical duplicate copies, rejects conflicting copies, and stops when separate report codes overlap for the same partner, Task, and month (or for the same monthly Communication report). Resolve overlaps before updating the dashboard. `shared_activity_review` lists activities reported by multiple partners so they can be reconciled. It does not sum partner values into a project total: shared activities, percentages, reach, and other potentially overlapping measures require coordinator review. The dashboard shows individual contributions only after they are verified and added to the public snapshot. `kpi_values` remains the separately reviewed project total.

Use `reviewed_kpi_contributions` in the private manifest to add a coordinator-reviewed mapping from a report to an Agreement indicator when the report answer does not already carry a `K` or `C` code. Each entry needs `report_code`, `revision`, `partner`, `indicator_id`, `contribution_id`, numeric `value`, `unit`, and `reporting_months`; an `activity_id` helps identify shared activities. Keep personal contact details and raw narratives out of this public summary.
