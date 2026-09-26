# AISHA reporting design direction

Status: local preview, 24 September 2026. This document records the design direction and decisions needed before production publication.

## Source and visual identity

The official supplied PNG, `assets/aisha-logo.png`, is transparent and measures 677 × 191 pixels. A vector version is available in the local AISHA materials; use it later if a print-quality PDF needs it. The website was visually inspected as a reference. The source artwork uses `#2b3990` (blue) and `#00a79d` (teal).

| Token | Value | Use |
| --- | --- | --- |
| Brand blue | `#2b3990` | Main buttons, logo alignment, navigation |
| Deep blue | `#202c70` | Primary headings, footer |
| Brand teal | `#00a79d` | Accents and progress cues |
| Deep teal | `#087f79` | Teal text on pale surfaces |
| Body text | `#4b556b` | Paragraphs and labels |
| Border | `#e1e5f0` | Cards and input outlines |
| Pale background | `#f5f7ff` | Quiet page sections |

Use the supplied colour logo on light surfaces with whitespace around it. Do not recolour, stretch, or place it over a busy image. Use the white logo variant only after its placement has been reviewed. Noto Sans is bundled locally for the PDF to support accented text, with local system sans-serif fallbacks in the website. Cards have restrained rounding, light borders, and modest shadows. Teal is an accent; long text remains dark blue or grey for readability.

## Information architecture

1. **Reporting Generator:** contributor identification, reporting choice, relevant form, review, and file generation.
2. **Project Dashboard:** approved coordinator data only. Until publication, show an honest empty state.
3. **How to Report:** local preparation, file review and download, then manual handoff through the channel designated by the coordination team.

The reporting journey should display a short step indicator and one clear primary action per screen. The contributor form precedes report choice. Navigation must work by keyboard and screen reader, and mobile layouts must retain readable labels and full-width controls. Avoid icons as the sole carrier of meaning.

## Content and privacy rules

- Address the partner as an organisation. The Task reminder explains that answers concern that organisation's contribution.
- Never present a generated file as evidence that a submission was received. Coordinator-confirmed receipt through the agreed project channel and review establish later statuses.
- Do not display invented project metrics, partner names, Task assignments, or Nextcloud links. Grant Agreement Task facts govern the catalogue; the earlier T2.1 example is not authoritative.
- Bundle executable code and brand assets with the site; do not send entered answers to analytics or remote APIs.
- The preview keeps contributor information in page memory until the user explicitly saves a browser draft. Browser drafts are user initiated and deletable.
- Public dashboard content requires coordinator approval. It must exclude contributor contact details and raw private issue narratives by default.

## Screen acceptance criteria

- Header: logo, three navigational links, visible current section.
- Generator: purpose statement, local-processing message, contributor form, and organisation-level instruction.
- Contributor form: organisation, name, role, email; clear validation and keyboard focus on the first error.
- Reporting choice: Tasks and Communication & Dissemination; shown only after valid contributor details and an approved partner choice.
- Dashboard: truthful state when no approved data exists.
- Instructions: clear distinction between generating files and sending them through an agreed channel.
- Responsive: no horizontal overflow at common phone widths; two-column layouts collapse to one.

## Open design decisions

- Review the transcribed partner names and Task assignments against the signed Grant Agreement when the source is amended.
- Confirm the GitHub repository and whether the final site will use a dedicated domain.
- Confirm the required placement of the EU funding emblem in the application and PDFs.
- Review the colour logo's size and spacing in the live browser preview.
