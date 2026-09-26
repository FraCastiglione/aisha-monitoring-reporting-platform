(function () {
  "use strict";

  const config = window.AISHA_CONFIG || { partners: [] };
  const views = new Set(["reporting", "dashboard", "instructions"]);
  const form = document.getElementById("contributor-form");
  const partnerSelect = document.getElementById("partner");
  const associatedSelect = document.getElementById("associated-partner");
  const configNotice = document.getElementById("config-notice");
  const message = document.getElementById("form-message");
  const reportChoice = document.getElementById("report-choice");
  const summary = document.getElementById("contributor-summary");

  function showView() {
    const requested = window.location.hash.slice(1);
    const active = views.has(requested) ? requested : "reporting";
    for (const view of views) {
      document.getElementById(view).hidden = view !== active;
      const link = document.querySelector(`[data-view-link="${view}"]`);
      if (view === active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
    document.title = `${active === "reporting" ? "Monitoring and Reporting Platform" : active === "dashboard" ? "Project Dashboard" : "How to Report"} · AISHA`;
  }

  const partners = Array.isArray(config.partners)
    ? config.partners.filter((partner) => partner && typeof partner.code === "string" && typeof partner.name === "string")
    : [];
  for (const partner of partners) {
    const option = document.createElement("option");
    option.value = partner.code;
    option.textContent = `${partner.code} — ${partner.name}`;
    (partner.kind === "associated_partner" ? associatedSelect : partnerSelect).append(option);
  }
  const partnerKind = () => form.querySelector('input[name="partner-kind"]:checked')?.value || "beneficiary";
  const activePartnerSelect = () => partnerKind() === "associated_partner" ? associatedSelect : partnerSelect;
  function showPartnerKind() {
    const associated = partnerKind() === "associated_partner";
    document.getElementById("beneficiary-select-wrap").hidden = associated;
    document.getElementById("associated-select-wrap").hidden = !associated;
    partnerSelect.required = !associated;
    associatedSelect.required = associated;
    partnerSelect.disabled = associated;
    associatedSelect.disabled = !associated;
    message.hidden = true;
  }
  for (const radio of form.querySelectorAll('input[name="partner-kind"]')) radio.addEventListener("change", showPartnerKind);
  showPartnerKind();
  if (partners.length === 0) {
    configNotice.textContent = "The consortium partner list is awaiting confirmation. You can review this screen, but cannot continue to a report type yet.";
    partnerSelect.disabled = true;
    associatedSelect.disabled = true;
    form.querySelector('button[type="submit"]').disabled = true;
  } else if (!config.partnersVerified) {
    configNotice.textContent = "Preview partner list from the AISHA Grant Agreement. Please confirm current membership and display names before this site is published.";
  }

  function invalidate(field) {
    field.setAttribute("aria-invalid", "true");
  }
  function clearInvalid() {
    for (const field of form.querySelectorAll("[aria-invalid]")) field.removeAttribute("aria-invalid");
    message.hidden = true;
    message.textContent = "";
  }

  form.addEventListener("input", clearInvalid);
  form.addEventListener("change", clearInvalid);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearInvalid();
    const selectedControl = activePartnerSelect();
    const fields = [selectedControl, document.getElementById("contributor-name"), document.getElementById("contributor-role"), document.getElementById("contributor-email")];
    const invalid = fields.filter((field) => !field.value.trim() || !field.checkValidity());
    if (invalid.length > 0) {
      invalid.forEach(invalidate);
      message.textContent = "Please complete all required fields and enter a valid email address.";
      message.hidden = false;
      invalid[0].focus();
      return;
    }
    const selectedPartner = partners.find((partner) => partner.code === selectedControl.value && (partner.kind === "associated_partner") === (partnerKind() === "associated_partner"));
    if (!selectedPartner) {
      invalidate(selectedControl);
      message.textContent = "Please select a listed consortium partner.";
      message.hidden = false;
      selectedControl.focus();
      return;
    }
    const contributorName = document.getElementById("contributor-name").value.trim();
    summary.textContent = `${selectedPartner.name} · ${contributorName}`;
    const reportStatus = document.getElementById("report-status");
    reportStatus.hidden = true;
    reportStatus.textContent = "";
    for (const choice of document.querySelectorAll("[data-report-type]")) choice.setAttribute("aria-pressed", "false");
    reportChoice.hidden = false;
    window.dispatchEvent(new CustomEvent("aisha:contributor-ready", { detail: {
      partner: selectedPartner,
      contributor: {
        name: contributorName,
        role: document.getElementById("contributor-role").value.trim(),
        email: document.getElementById("contributor-email").value.trim()
      }
    } }));
    reportChoice.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    document.getElementById("choice-title").focus({ preventScroll: true });
  });

  document.getElementById("edit-details").addEventListener("click", () => {
    reportChoice.hidden = true;
    window.dispatchEvent(new Event("aisha:edit-details"));
    document.getElementById("contributor-title").scrollIntoView({ behavior: "smooth", block: "start" });
    activePartnerSelect().focus({ preventScroll: true });
  });

  const reportStatus = document.getElementById("report-status");
  for (const button of document.querySelectorAll("[data-report-type]")) {
    button.addEventListener("click", () => {
      for (const choice of document.querySelectorAll("[data-report-type]")) {
        choice.setAttribute("aria-pressed", choice === button ? "true" : "false");
      }
      reportStatus.hidden = true;
      window.dispatchEvent(new CustomEvent("aisha:report-selected", { detail: { reportType: button.dataset.reportType } }));
    });
  }

  window.addEventListener("hashchange", showView);
  showView();
})();
