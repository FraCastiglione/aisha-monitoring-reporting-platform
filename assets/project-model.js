(function (root) {
  "use strict";

  function projectMonth(config, calendarMonth) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(calendarMonth || "")) return null;
    const [year, month] = calendarMonth.split("-").map(Number);
    const [startYear, startMonth] = config.project.startDate.slice(0, 7).split("-").map(Number);
    const value = (year - startYear) * 12 + month - startMonth + 1;
    return value >= 1 && value <= config.project.durationMonths ? value : null;
  }

  function calendarMonth(config, projectMonthNumber) {
    if (!Number.isInteger(projectMonthNumber) || projectMonthNumber < 1 || projectMonthNumber > config.project.durationMonths) return null;
    const start = new Date(`${config.project.startDate.slice(0, 7)}-01T00:00:00Z`);
    start.setUTCMonth(start.getUTCMonth() + projectMonthNumber - 1);
    return `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}`;
  }

  function periodForMonth(config, value) {
    const number = projectMonth(config, value);
    if (number === null) return null;
    const [year, month] = value.split("-").map(Number);
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return {
      code: `M${String(number).padStart(2, "0")}`,
      project_month: number,
      calendar_month: value,
      start: `${value}-01`,
      end: `${value}-${String(lastDay).padStart(2, "0")}`
    };
  }

  function assigned(task, partnerCode, config) {
    if (task.partners.includes(partnerCode) || task.associatedPartners?.includes(partnerCode)) return true;
    const partner = config?.partners.find(item => item.code === partnerCode);
    if (!partner) return false;
    return partner.kind === "associated_partner" ? task.allAssociatedPartners === true : task.allBeneficiaries === true;
  }

  function active(task, monthNumber) {
    return Number.isInteger(monthNumber) && task.startMonth <= monthNumber && monthNumber <= task.endMonth;
  }

  function role(task, partnerCode, config) {
    if (!assigned(task, partnerCode, config)) return null;
    if (task.lead === partnerCode) return "Task lead (COO)";
    if (task.partners.includes(partnerCode) || task.associatedPartners?.includes(partnerCode)) return "Named participant";
    const partner = config?.partners.find(item => item.code === partnerCode);
    return partner?.kind === "associated_partner" ? "All associated partners participant" : "All beneficiaries participant";
  }

  function activeTasks(config, partnerCode, monthNumber) {
    return config.tasks.filter((task) => assigned(task, partnerCode, config) && active(task, monthNumber));
  }

  function monthEnd(value) {
    const [year, month] = value.split('-').map(Number);
    return `${value}-${String(new Date(Date.UTC(year, month, 0)).getUTCDate()).padStart(2, '0')}`;
  }

  function taskWindow(config, task) {
    const startMonth = calendarMonth(config, task.startMonth);
    const endMonth = calendarMonth(config, task.endMonth);
    return { start: `${startMonth}-01`, end: monthEnd(endMonth) };
  }

  function monthsBetween(config, start, end) {
    const first = projectMonth(config, start.slice(0, 7));
    const last = projectMonth(config, end.slice(0, 7));
    if (!first || !last || first > last) return [];
    return Array.from({ length: last - first + 1 }, (_, i) => calendarMonth(config, first + i));
  }

  function rangePeriod(config, start, end, selectedMonths) {
    const first = config.project.startDate;
    const last = monthEnd(calendarMonth(config, config.project.durationMonths));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start || '') || !/^\d{4}-\d{2}-\d{2}$/.test(end || '') || start < first || end > last || start > end) return null;
    const validDay = date => { const parsed = new Date(`${date}T00:00:00Z`); return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === date; };
    if (!validDay(start) || !validDay(end)) return null;
    const startProjectMonth = projectMonth(config, start.slice(0, 7));
    const endProjectMonth = projectMonth(config, end.slice(0, 7));
    if (!startProjectMonth || !endProjectMonth) return null;
    const months = selectedMonths === undefined ? monthsBetween(config, start, end) : selectedMonths;
    if (!Array.isArray(months) || !months.length || months.some((month, i) => !projectMonth(config, month) || (i && month <= months[i - 1]) || month < start.slice(0, 7) || month > end.slice(0, 7)) || months[0] !== start.slice(0, 7) || months.at(-1) !== end.slice(0, 7)) return null;
    return { start, end, start_project_month: startProjectMonth, end_project_month: endProjectMonth, start_code: `M${String(startProjectMonth).padStart(2, '0')}`, end_code: `M${String(endProjectMonth).padStart(2, '0')}`, selected_months: months };
  }

  function taskCoverage(config, task, start, end, selectedMonths) {
    const period = rangePeriod(config, start, end, selectedMonths);
    if (!period) return null;
    const window = taskWindow(config, task);
    const months = period.selected_months.filter(month => monthEnd(month) >= window.start && `${month}-01` <= window.end);
    if (!months.length) return null;
    const firstDay = `${months[0]}-01`, lastDay = monthEnd(months.at(-1));
    const clippedStart = [start, window.start, firstDay].sort().at(-1);
    const clippedEnd = [end, window.end, lastDay].sort()[0];
    return clippedStart <= clippedEnd ? { start: clippedStart, end: clippedEnd, months } : null;
  }

  function eligibleTasks(config, partnerCode, start, end, selectedMonths) {
    if (!rangePeriod(config, start, end, selectedMonths)) return [];
    return config.tasks.filter((task) => assigned(task, partnerCode, config) && taskCoverage(config, task, start, end, selectedMonths));
  }

  function defaultMonth(config, today = new Date()) {
    const todayMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const first = calendarMonth(config, 1);
    const last = calendarMonth(config, config.project.durationMonths);
    return todayMonth < first ? first : todayMonth > last ? last : todayMonth;
  }

  const model = Object.freeze({ projectMonth, calendarMonth, periodForMonth, monthsBetween, assigned, active, role, activeTasks, defaultMonth, taskWindow, rangePeriod, taskCoverage, eligibleTasks });
  root.AISHA_MODEL = model;
  if (typeof module !== "undefined" && module.exports) module.exports = model;
})(typeof window !== "undefined" ? window : globalThis);
