(function () {
  'use strict';
  function create() {
    const reports = new Map(), copies = new Map();
    return {
      register(key, read) { if (!reports.has(key)) reports.set(key, { read, saved: read() }); },
      protect(key, snapshot) { const report = reports.get(key); if (report) report.saved = snapshot === undefined ? report.read() : snapshot; },
      invalidate(key) { const report = reports.get(key); if (report) report.saved = null; },
      rememberCopy(blob, key, snapshot) { copies.set(blob, { key, snapshot }); while (copies.size > 12) copies.delete(copies.keys().next().value); },
      verifyCopy(blob) { const copy = copies.get(blob); if (copy) this.protect(copy.key, copy.snapshot); },
      hasUnsaved() { return [...reports.values()].some(report => { const current = report.read(); return current !== null && current !== report.saved; }); }
    };
  }
  window.AISHA_PROGRESS = { create };
})();
