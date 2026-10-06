# AI-SECRETT reporting preview

This is the AI-SECRETT counterpart to the AISHA monitoring and reporting platform. It uses the same browser-only reporting workflow: contributor identification, Tasks or Communication reporting, Work Package leadership updates, voluntary Task and Work Package contributions, draft saving and import, validation, PDF and JSON export, and a read-only project dashboard. The two sites have separate code, browser storage keys, report identifiers, files and URLs.

## Project sources and limits

The signed AI-SECRETT Grant Agreement 101226207 provides the project dates (1 October 2025 to 30 September 2029), 22 beneficiaries and one associated partner, 12 Work Packages, 66 Tasks and their windows, 23 deliverables, 17 milestones, 10 critical planning risks, 36 KPI entries, and three official reporting periods (M1–M18, M19–M36, M37–M48). The catalogue records PDF page references. Work Package leads are in the Agreement.

The Consortium Agreement version 1.0, 21 October 2025, §4.5.5 (PDF pp. 15–18) supplies the participant list for all 66 Tasks. Every Task window matches the existing Grant Agreement catalogue. “ALL partners” is applied to the 22 beneficiaries; RCE follows its specific nine commitments in Attachment 5 (PDF p. 61): T1.3, T2.1, T2.4, T4.3, T6.3, T7.3, T9.3, T11.3 and T11.6. Task leaders are the first participant listed in each Task, as explicitly confirmed by the coordinator on 6 October 2026. Earlier reports retain their answers when imported, and work outside the current list is labelled voluntary. The two-week Communication check-in is a preview workflow choice based on the AISHA form, not an AI-SECRETT Grant Agreement deadline. On 6 October 2026 the user confirmed that all deliverables and milestones due through the current month had been delivered and achieved. The dashboard records 10 submitted deliverables and 6 achieved milestones from that update. No partner submissions or Task progress records were provided, so those results remain unassessed.

The site does not upload reports. Partners must download and submit the PDF and JSON through a channel designated by the coordination team. The browser draft is local to that browser and can be lost if storage is cleared; the editable files support transfer to another device.

## Hosting

This folder is a dedicated path in the existing GitHub Pages repository. The AISHA homepage remains at `/`, while this preview is served at `/ai-secrett/`. No build step is required.

The October 2026 dashboard shows M13. Its status evidence is the user update of 6 October 2026. The full Gantt covers 50 months, including RP1 preparation at M19–20, RP2 at M37–38 and RP3 at M49–50. It shows the Valencia October 2025 kick-off, JOIST Larissa April 2026 meeting, and LPGA Las Palmas October 2026 meeting at month precision. Internal drafts are exactly 30 calendar days before the due date, using month-end for Agreement due months. Task report deadlines follow the coordinator Task-end planning convention. The current audit is in `AUDIT-2026-10-06.md`.

The dashboard embeds its three JSON data files in `assets/dashboard.js` and `assets/embedded-data.js` so it can display without additional browser requests. After editing any dashboard JSON file, run `python3 scripts/embed-dashboard-data.py` from this folder and update the script version queries in `index.html`. PDF font and logo bytes are bundled in `assets/pdf-assets.js`; regenerate them with `python3 scripts/embed-pdf-assets.py` after changing either asset. Run `node tests/platform-audit.mjs` and `node tests/dashboard-functional-audit.cjs` with Node.js 24 or later before publishing.
