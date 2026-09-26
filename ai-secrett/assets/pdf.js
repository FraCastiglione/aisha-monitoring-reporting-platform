(function () {
  "use strict";

  const A4 = [595.28, 841.89];
  const MARGIN = 43;
  const BLUE = [79 / 255, 43 / 255, 216 / 255];
  const TEAL = [108 / 255, 85 / 255, 223 / 255];
  const TEXT = [35 / 255, 48 / 255, 90 / 255];

  function asText(value) {
    if (value === null || value === undefined || value === "") return "Not provided";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.length ? value.join("\n") : "None";
    return String(value);
  }
  function generatedLabel(value) {
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return "Time unavailable";
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC", timeZoneName: "short" }).format(date);
  }

  async function createPdf(report, embeddedRecord = report) {
    if (!window.PDFLib || !window.fontkit) throw new Error("The local PDF components did not load.");
    const { PDFDocument, rgb } = window.PDFLib;
    const pdf = await PDFDocument.create();
    pdf.registerFontkit(window.fontkit);
    const [fontResponse, logoResponse] = await Promise.all([fetch("assets/NotoSans-Regular.ttf"), fetch("assets/ai-secrett-logo.png")]);
    if (!fontResponse.ok || !logoResponse.ok) throw new Error("The local font or logo could not be loaded.");
    const font = await pdf.embedFont(await fontResponse.arrayBuffer(), { subset: true });
    const logo = await pdf.embedPng(await logoResponse.arrayBuffer());
    const color = (parts) => rgb(...parts);
    let page;
    let y;

    function newPage() {
      page = pdf.addPage(A4);
      y = A4[1] - MARGIN;
      const logoWidth = 150;
      const logoHeight = logoWidth * logo.height / logo.width;
      page.drawImage(logo, { x: MARGIN, y: y - logoHeight, width: logoWidth, height: logoHeight });
      page.drawText("PARTNER REPORTING", { x: A4[0] - MARGIN - 142, y: y - 21, size: 9, font, color: color(BLUE) });
      y -= logoHeight + 19;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: A4[0] - MARGIN, y }, color: color(TEAL), thickness: 1.5 });
      y -= 25;
    }

    function ensureSpace(height) {
      if (y - height < 64) newPage();
    }

    function wrapLine(line, size, maxWidth) {
      const words = String(line).split(/\s+/).filter(Boolean);
      if (words.length === 0) return [""];
      const lines = [];
      let current = "";
      for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
          current = candidate;
          continue;
        }
        if (current) lines.push(current);
        current = "";
        let segment = "";
        for (const character of word) {
          if (font.widthOfTextAtSize(segment + character, size) > maxWidth && segment) {
            lines.push(segment);
            segment = "";
          }
          segment += character;
        }
        current = segment;
      }
      if (current) lines.push(current);
      return lines;
    }

    function writeText(value, size, textColor, lineHeight = size * 1.42) {
      const maxWidth = A4[0] - MARGIN * 2;
      for (const paragraph of asText(value).split("\n")) {
        for (const line of wrapLine(paragraph, size, maxWidth)) {
          ensureSpace(lineHeight);
          page.drawText(line || " ", { x: MARGIN, y, size, font, color: color(textColor) });
          y -= lineHeight;
        }
      }
    }

    function pair(label, value) {
      ensureSpace(36);
      writeText(label.toUpperCase(), 8.5, BLUE, 12);
      y -= 3;
      writeText(value, 10.2, TEXT, 14.7);
      y -= 13;
    }

    function section(title) {
      ensureSpace(90);
      y -= 5;
      writeText(title, 13, BLUE, 19);
      y -= 7;
    }

    newPage();
    writeText(report.pdf_kind === "individual_task" ? "Individual Task Report" : report.pdf_kind === "draft_report" ? "Partner Report Draft" : report.report_type === "tasks" ? "Partner Tasks Report" : "Communication & Dissemination Reporting", 20, BLUE, 28);
    y -= 5;
    if (report.pdf_kind === "individual_task") pair("Scope", "One Task only. This is not the complete partner report.");
    if (report.pdf_kind === "draft_report") pair("Scope", "Unfinished draft of the full partner report. Review before generating final files.");
    pair("Partner organisation", `${report.partner.name} (${report.partner.code})`);
    pair("Contributor", `${report.contributor.name} · ${report.contributor.role} · ${report.contributor.email}`);
    pair("Reporting period", `${report.reporting_period.code ? `${report.reporting_period.code} · ` : ""}${report.reporting_period.start} to ${report.reporting_period.end}`);
    if (report.report_type === "tasks") pair("Selected months", report.reporting_period.selected_months.join(", "));
    pair("Report key and revision", `${report.report_key} · v${report.revision}`);
    pair("Generated", generatedLabel(report.generated_at));

    const a = report.answers;
    if (report.report_type === "tasks") {
      pair("Tasks included", report.tasks.length);
      for (const item of report.tasks) {
        section(`${item.id} — ${item.title}`);
        pair("Work Package and partner role", `${item.work_package} · ${item.partner_role === "Task lead (COO)" ? "Task leader" : item.partner_role === "Task responsibility to confirm" ? "Responsibility to confirm" : "Task participant"}`);
        pair("Task leader", item.task_lead || "Not specified in the Agreement");
        pair("Task coverage in this report", `${item.coverage.start} to ${item.coverage.end}`);
        pair("Task months covered", item.coverage.months.join(", "));
        pair("Work reported", item.work_status === "no_work" ? "No work carried out" : item.work_status === "draft" ? "Draft contribution" : "Contribution completed");
        if (item.work_status === "no_work") continue;
        const t = item.answers;
        pair("Activities carried out", t.activities_carried_out);
        pair("Results achieved", t.results_achieved);
        pair("Difficulties encountered", t.difficulties_encountered);
        if (report.partner.kind !== "associated_partner") pair("Raw costs incurred", `${t.raw_costs_incurred.amount === null ? "Not provided" : `${t.raw_costs_incurred.amount} EUR`}${t.raw_costs_incurred.note ? ` · ${t.raw_costs_incurred.note}` : ""}`);
        pair("Upcoming activities", t.upcoming_activities);
        pair("Additional comments", t.additional_comments);
        pair("Significant issue", t.significant_issue);
        pair("Severity", t.severity);
        pair("Coordinator action required", t.coordinator_action_required);
        pair("Support requested", t.coordinator_support_request);
      }
      if (report.work_package_leadership?.length) {
        section("Work Package leadership updates");
        for (const wp of report.work_package_leadership) {
          section(`${wp.id} — ${wp.title}`);
          pair("Work Package leader", wp.leader);
          pair("Selected months", wp.coverage.months.join(", "));
          pair("Work declared", wp.work_status === "no_work" ? "No Work Package work carried out" : "Leadership update completed");
          if (wp.work_status === "no_work") continue;
          pair("Progress and achievements", wp.answers.progress);
          pair("Coordination and integration", wp.answers.coordination);
          pair("Difficulties and dependencies", wp.answers.difficulties);
          pair("Next priorities", wp.answers.next);
          pair("Coordinator support needed", wp.answers.support);
          for (const task of wp.task_updates) {
            section(`${task.id} — Leader assessment`);
            pair("Task leader", task.task_lead || "Not specified in the Agreement");
            pair("Status", ({on_track:"On track",at_risk:"At risk",delayed:"Delayed",completed:"Completed",unavailable:"Update unavailable"})[task.status] || "No assessment");
            pair("Progress or evidence", task.progress);
            pair("Blocker or dependency", task.blocker);
            pair("Next action", task.next);
          }
        }
      }
    } else {
      section("Events");
      pair("Events organised", a.events_organised);
      a.events.forEach((event, index) => pair(`Event ${index + 1}`, `${event.description}\nParticipants: ${event.participants}`));
      section("Media and publications");
      pair("Media outreach", a.media_outreach);
      pair("Journalists contacted", a.journalists_contacted);
      pair("Media outlets contacted", a.media_outlets_contacted);
      pair("Media details", a.media_details || "None");
      pair("Website articles published", a.website_articles_published);
      pair("Website articles", a.website_articles.map((item) => `${item.url}${item.details ? ` · ${item.details}` : ""}`));
      pair("Social media posts", a.social_posts_count);
      pair("Social media links", a.social_post_urls);
      pair("Social media details", a.social_details || "None");
      section("Email and reach");
      pair("Email or newsletter sent", a.email_or_newsletter_sent);
      pair("Estimated recipients", a.estimated_recipients);
      pair("Email details", a.email_details || "None");
      pair("Other activities or materials", a.other_activities_or_materials || "None");
      pair("Estimated people reached", a.estimated_people_reached === null ? "Unknown" : a.estimated_people_reached);
      pair("Pre-registrations or enrolments", a.preregistrations_or_enrolments === null ? "Unknown" : a.preregistrations_or_enrolments);
      section("Coordinator support");
      pair("Support required", a.coordinator_support_required);
      pair("Support requested", a.coordinator_support_request || "None");
    }

    pdf.getPages().forEach((sheet, index, pages) => {
      sheet.drawLine({ start: { x: MARGIN, y: 48 }, end: { x: A4[0] - MARGIN, y: 48 }, color: color([.86, .89, .94]), thickness: .7 });
      sheet.drawText("AI-SECRETT · Creativity and AI for the triple transition", { x: MARGIN, y: 32, size: 8, font, color: color(BLUE) });
      sheet.drawText(`${index + 1} / ${pages.length}`, { x: A4[0] - MARGIN - 28, y: 32, size: 8, font, color: color(BLUE) });
    });
    if (report.report_type === "tasks") await pdf.attach(new TextEncoder().encode(JSON.stringify(embeddedRecord)), "AI-SECRETT-report-data.json", { mimeType: "application/json", description: "AI-SECRETT structured report data for reliable import" });
    return new Blob([await pdf.save()], { type: "application/pdf" });
  }

  async function readEmbeddedReport(file) {
    if (!window.PDFLib || file.size > 10_000_000) throw new Error("Choose an AI-SECRETT PDF under 10 MB.");
    const P = window.PDFLib, pdf = await P.PDFDocument.load(await file.arrayBuffer());
    const names = pdf.context.lookup(pdf.catalog.get(P.PDFName.of("Names")), P.PDFDict);
    const embedded = names && pdf.context.lookup(names.get(P.PDFName.of("EmbeddedFiles")), P.PDFDict);
    const entries = embedded && pdf.context.lookup(embedded.get(P.PDFName.of("Names")), P.PDFArray);
    if (!entries) throw new Error("This PDF has no AI-SECRETT report data. Import its matching JSON file instead.");
    for (let i = 0; i < entries.size(); i += 2) {
      if (entries.lookup(i)?.decodeText() !== "AI-SECRETT-report-data.json") continue;
      const spec = entries.lookup(i + 1, P.PDFDict), ef = pdf.context.lookup(spec.get(P.PDFName.of("EF")), P.PDFDict), stream = pdf.context.lookup(ef.get(P.PDFName.of("F")), P.PDFRawStream);
      const bytes = P.decodePDFRawStream(stream).decode();
      if (bytes.length > 5_000_000) throw new Error("Embedded report data exceeds 5 MB.");
      return JSON.parse(new TextDecoder().decode(bytes));
    }
    throw new Error("This PDF has no AI-SECRETT report data. Import its matching JSON file instead.");
  }

  window.SECRETT_PDF = Object.freeze({ createPdf, readEmbeddedReport });
})();
