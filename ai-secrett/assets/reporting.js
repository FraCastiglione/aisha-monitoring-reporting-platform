(function () {
  'use strict';
  const config = window.SECRETT_CONFIG;
  const agreement = window.SECRETT_AGREEMENT;
  const model = window.SECRETT_MODEL;
  const $ = id => document.getElementById(id);
  const taskForm = $('task-form');
  const commForm = $('communication-form');
  const state = { partner: null, contributor: null, reportType: null, selected: new Map(), wpUpdates: new Map(), selectedMonths: new Set(), lastPeriod: null, editing: null, wpEditing: null, editWasNew: false, revision: 1, reviewed: null, urls: [], taskPdfUrl: null };
  const value = id => $(id).value.trim();
  const radio = (form, name) => form.querySelector(`input[name="${name}"]:checked`)?.value || '';
  const asCount = id => value(id) === '' ? null : Number(value(id));
  const validCount = input => /^\d+$/.test(String(input)) && Number.isSafeInteger(Number(input));
  const urls = id => value(id).split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const isUrl = x => { try { return ['http:', 'https:'].includes(new URL(x).protocol); } catch { return false; } };
  const projectEnd = () => model.taskWindow(config, { startMonth: 1, endMonth: config.project.durationMonths }).end;
  const taskById = id => config.tasks.find(t => t.id === id);
  const wpById = id => config.workPackages.find(w => w.id === id);
  const activeForm = () => state.reportType === 'tasks' ? taskForm : commForm;
  const scrollTo = el => el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  const message = text => { $('draft-message').textContent = text; };
  function clearError() { $('report-form-error').hidden = true; $('report-form-error').textContent = ''; document.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid')); }
  function fail(text, el) { $('report-form-error').textContent = text; $('report-form-error').hidden = false; if (el) { el.setAttribute('aria-invalid', 'true'); el.focus(); scrollTo(el); } return false; }
  function setTaskEditor(visible) {
    taskForm.hidden = !visible;
    $('wp-leader-form').hidden = true;
    $('task-picker').hidden = visible;
    $('draft-actions').hidden = visible;
    $('revision-controls').hidden = visible;
    $('report-form-actions').hidden = visible;
    $('back-to-choice').hidden = visible;
    $('workspace-title').textContent = visible ? 'Your Task contribution' : 'Build your partner report';
  }
  function setWpEditor(visible) {
    $('wp-leader-form').hidden = !visible; taskForm.hidden = true;
    $('task-picker').hidden = visible; $('draft-actions').hidden = visible; $('revision-controls').hidden = visible; $('report-form-actions').hidden = visible; $('back-to-choice').hidden = visible;
    $('workspace-title').textContent = visible ? 'Work Package leadership update' : 'Build your partner report';
  }
  const sortedMonths = () => [...state.selectedMonths].sort();
  function period() { return model.rangePeriod(config, value('report-start'), value('report-end'), sortedMonths()); }
  function textNode(tag, text, className) { const el = document.createElement(tag); el.textContent = text; if (className) el.className = className; return el; }
  function joinAgreementLines(lines) {
    return lines.map(line => line.trim()).filter(Boolean).reduce((text,line) => text ? `${text}${/[\-/]$/.test(text) ? '' : ' '}${line}` : line, '');
  }
  function appendAgreementBlocks(host, lines) {
    let group=[];
    const flush=()=>{if(group.length){host.append(textNode('p',joinAgreementLines(group),'agreement-block'));group=[];}};
    for(const raw of lines){const line=raw.trim();if(!line){flush();continue;}
      if(/^(?:[▪●•]|-\s|\([ivx]+\)|(?:\d+\.)\s)/i.test(line) || /^(?:Description:|Expected outputs and outcomes include:|Feed forward loops and integration|Key activities include:)$/.test(line)){flush();group=[line];continue;}
      if(group.length && /[.!?;:]$/.test(group.at(-1)) && /^[A-Z0-9]/.test(line) && joinAgreementLines(group).length>140)flush();
      group.push(line);
    }
    flush();
  }
  function renderAgreementTask(host,id) {
    const lines=agreement.tasks[id].agreementText.split('\n');const description=lines.findIndex((line,i)=>i>0&&line.trim()==='Description:');
    const participantLines=description>=0?lines.slice(1,description):lines.slice(1,2);
    host.replaceChildren(textNode('h6','Task participants','agreement-subhead'),textNode('p',joinAgreementLines(participantLines).replace(/^Participants:\s*/,''),'agreement-participants'));
    host.append(textNode('h6','Description','agreement-subhead'));
    appendAgreementBlocks(host,description>=0?lines.slice(description+1):lines.slice(2));
  }
  function renderAgreementObjectives(host,id) {host.replaceChildren();appendAgreementBlocks(host,agreement.workPackages[id].objectives.split('\n'));}
  function dateLabel(date) { return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`)); }
  function monthCodes(months) { return months.map(m => `M${String(model.projectMonth(config,m)).padStart(2,'0')}`).join(', '); }
  function taskRole(task) { return task.assignmentUnconfirmed ? 'Responsibility to confirm' : task.lead === state.partner.code ? 'Task leader' : 'Task participant'; }
  function taskRoleClass(task) { return task.lead === state.partner.code ? 'is-leader' : 'is-participant'; }
  function selectedInRange() {
    const p = period();
    return p ? model.eligibleTasks(config, state.partner.code, p.start, p.end, p.selected_months) : [];
  }
  function reconcileSelectedCoverage(oldPeriod, newPeriod) {
    if (!oldPeriod || !newPeriod) return;
    for (const [id, answer] of state.selected) {
      const task = taskById(id);
      const before = model.taskCoverage(config,task,oldPeriod.start,oldPeriod.end,oldPeriod.selected_months);
      const after = model.taskCoverage(config,task,newPeriod.start,newPeriod.end,newPeriod.selected_months);
      if (!before || !after) continue;
      const oldStart = answer.coverage_start, oldEnd = answer.coverage_end;
      let start = oldStart === before.start ? after.start : oldStart < after.start ? after.start : oldStart;
      let end = oldEnd === before.end ? after.end : oldEnd > after.end ? after.end : oldEnd;
      if (!after.months.includes(start.slice(0,7))) start = `${after.months.find(m => m > start.slice(0,7)) || after.months[0]}-01`;
      if (!after.months.includes(end.slice(0,7))) end = model.periodForMonth(config, [...after.months].reverse().find(m => m < end.slice(0,7)) || after.months.at(-1)).end;
      if (start > end) { start = after.start; end = after.end; }
      answer.coverage_start = start; answer.coverage_end = end;
      const expanded = start < oldStart || end > oldEnd || after.months.some(m => !before.months.includes(m) && m >= start.slice(0,7) && m <= end.slice(0,7));
      if (expanded && answer.status !== 'draft') answer.status = 'draft';
    }
    for (const [id, entry] of state.wpUpdates) {
      const wp = wpById(id);
      const before = model.taskCoverage(config,wp,oldPeriod.start,oldPeriod.end,oldPeriod.selected_months);
      const after = model.taskCoverage(config,wp,newPeriod.start,newPeriod.end,newPeriod.selected_months);
      if (before && after && after.months.some(m => !before.months.includes(m)) && entry.status !== 'draft') entry.status = 'draft';
    }
  }
  function setSelectedMonths(months) {
    const oldPeriod = state.lastPeriod;
    const beforeStart = value('report-start'), beforeEnd = value('report-end');
    state.selectedMonths = new Set(months);
    const chosen = sortedMonths();
    $('report-start').value = chosen.length ? (beforeStart.slice(0, 7) === chosen[0] ? beforeStart : `${chosen[0]}-01`) : '';
    $('report-end').value = chosen.length ? (beforeEnd.slice(0, 7) === chosen.at(-1) ? beforeEnd : model.periodForMonth(config, chosen.at(-1)).end) : '';
    reconcileSelectedCoverage(oldPeriod,period());
    renderOverview();
  }
  function toggleMonth(month) {
    const chosen = new Set(state.selectedMonths);
    if (chosen.has(month)) chosen.delete(month); else chosen.add(month);
    setSelectedMonths(chosen);
  }
  let timelineDrag = null;
  window.addEventListener('pointermove', event => {
    if (!timelineDrag) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.timeline-month');
    const n = Number(target?.dataset.month);
    if (!n || n === timelineDrag.last) return;
    timelineDrag.last = n; timelineDrag.moved = true;
    const first = Math.min(timelineDrag.start, n), last = Math.max(timelineDrag.start, n);
    const added = Array.from({ length: last - first + 1 }, (_, i) => model.calendarMonth(config, first + i));
    setSelectedMonths(new Set([...timelineDrag.base, ...added]));
  });
  window.addEventListener('pointerup', () => {
    if (!timelineDrag) return;
    if (!timelineDrag.moved) toggleMonth(model.calendarMonth(config, timelineDrag.start));
    timelineDrag = null;
  });
  window.addEventListener('pointercancel', () => { timelineDrag = null; });
  window.addEventListener('blur', () => { timelineDrag = null; });
  function paintTimeline() {
    const timeline = $('project-timeline'); timeline.replaceChildren();
    for (let year = 2025; year <= 2029; year++) {
      const group = textNode('div', '', 'timeline-year');
      group.append(textNode('strong', String(year), 'timeline-year-label'));
      const months = textNode('div', '', 'timeline-months');
      for (let n = 1; n <= config.project.durationMonths; n++) {
        const ym = model.calendarMonth(config, n);
        if (Number(ym.slice(0, 4)) !== year) continue;
        const start = `${ym}-01`;
        const count = model.activeTasks(config, state.partner.code, n).length;
        const button = document.createElement('button'); button.type = 'button'; button.className = 'timeline-month';
        button.append(textNode('span', new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(new Date(`${start}T00:00:00Z`))), textNode('small', `M${String(n).padStart(2, '0')}`));
        button.dataset.month = String(n);
        button.title = `${ym} · ${count} scheduled ${count === 1 ? 'Task' : 'Tasks'} active`;
        button.setAttribute('aria-label', button.title);
        button.setAttribute('aria-pressed', state.selectedMonths.has(ym) ? 'true' : 'false');
        if (state.selectedMonths.has(ym)) button.classList.add('is-in-range');
        button.addEventListener('pointerdown', event => { if (event.button !== 0) return; event.preventDefault(); timelineDrag = { start: n, last: n, moved: false, base: new Set(state.selectedMonths) }; });
        button.addEventListener('click', event => { if (event.detail === 0) toggleMonth(ym); });
        months.append(button);
      }
      group.append(months); timeline.append(group);
    }
  }
  function renderOverview() {
    if (!state.partner || state.reportType !== 'tasks') return;
    paintTimeline();
    const list = $('task-list'); list.replaceChildren();
    const p = period(); const rangeIssue = !p ? 'Select one or more project months on the timeline.' : '';
    const eligible = rangeIssue ? [] : selectedInRange();
    if (rangeIssue) { $('task-month-summary').textContent = rangeIssue; $('selected-task-summary').textContent = ''; $('wp-leader-section').hidden = true; return; }
    state.lastPeriod = p;
    const wpCount = new Set(eligible.map(t => t.wp)).size;
    const selectedCodes = p.selected_months.map(m => `M${String(model.projectMonth(config,m)).padStart(2,'0')}`);
    const labels = p.selected_months.map(m => new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${m}-01T00:00:00Z`)));
    $('task-month-summary').textContent = `Selected months: ${labels.join(', ')} (${selectedCodes.join(', ')}). You can select from ${eligible.length} scheduled ${eligible.length === 1 ? 'Task' : 'Tasks'} across ${wpCount} Work ${wpCount === 1 ? 'Package' : 'Packages'}. Only these months are covered.`;
    const eligibleIds = new Set(eligible.map(t => t.id));
    const outside = [...state.selected.keys()].filter(id => !eligibleIds.has(id));
    const counts = { draft: 0, completed: 0, no_work: 0 }; for (const answer of state.selected.values()) counts[answer.status || 'draft']++;
    const wpCounts = {draft:0,completed:0,no_work:0}; for (const entry of state.wpUpdates.values()) wpCounts[entry.status || 'draft']++;
    const summary=$('selected-task-summary');summary.replaceChildren();
    for(const [title,items] of [['Tasks',counts],['Work Package updates',wpCounts]]){
      const row=textNode('div','','status-row');row.append(textNode('strong',title,'status-row-title'));
      for(const [key,label] of [['completed','Completed'],['no_work','No work declared'],['draft','Still to finish']]){const metric=textNode('span','','status-metric');metric.append(textNode('b',String(items[key])),textNode('span',label));row.append(metric);}summary.append(row);
    }
    if(outside.length)summary.append(textNode('p',`${outside.length} selected Task is outside these months.`,'status-warning'));
    for (const wp of config.workPackages) {
      const wpTasks = eligible.filter(t => t.wp === wp.id);
      if (!wpTasks.length) continue;
      const section = textNode('section', '', 'task-package');
      section.append(textNode('h4', `${wp.id} — ${wp.title}`));
      section.append(textNode('p', `Work Package leader: ${wp.lead} · M${wp.startMonth}–M${wp.endMonth}`, 'task-package-meta'));
      const details = document.createElement('details'); details.className = 'wp-objectives';
      const objectiveText=textNode('div','','agreement-text');renderAgreementObjectives(objectiveText,wp.id);details.append(textNode('summary', 'Read full Work Package objectives'), objectiveText);
      section.append(details);
      for (const task of wpTasks) {
        const coverage = model.taskCoverage(config, task, p.start, p.end, p.selected_months);
        const selected = state.selected.has(task.id);
        const chosenCoverage = selected ? state.selected.get(task.id) : null;
        const card = textNode('article', '', `task-card${selected ? ` is-${chosenCoverage.status || 'draft'}` : ''}`);
        const head = textNode('div','','task-card-head');const titleGroup=textNode('div','','task-card-title-group');titleGroup.append(textNode('strong', `${task.id} — ${task.title}`),textNode('span',taskRole(task),`role-badge ${taskRoleClass(task)}`));head.append(titleGroup);
        const tools=textNode('div','','task-card-tools');
        const importTask=textNode('button','Import Task PDF','button button-secondary task-import-button');importTask.type='button';importTask.addEventListener('click',()=>openTaskImport(task));tools.append(importTask);
        if (selected && chosenCoverage.status !== 'draft') { const pdf = textNode('button', 'Download Task PDF', 'task-pdf-link'); pdf.type = 'button'; pdf.addEventListener('click', () => showIndividualTaskPdf(task.id)); tools.append(pdf); }
        head.append(tools);
        card.append(head);
        if(task.lead!==state.partner.code)card.append(textNode('small',`Task leader: ${task.lead || 'not specified in the Agreement'}`,'task-card-role'));
        if (!selected) card.append(textNode('p', `Reporting available in your selected timeline: ${monthCodes(coverage.months)}.`, 'task-coverage-short'));
        if (chosenCoverage) {
          const chosenMonths = p.selected_months.filter(m => m >= chosenCoverage.coverage_start.slice(0,7) && m <= chosenCoverage.coverage_end.slice(0,7) && model.active(task,model.projectMonth(config,m)));
          card.append(textNode('p', `Your Task coverage: ${dateLabel(chosenCoverage.coverage_start)}–${dateLabel(chosenCoverage.coverage_end)} · ${monthCodes(chosenMonths)}.`, 'task-chosen-coverage'));
          if (chosenCoverage.coverage_start < coverage.start || chosenCoverage.coverage_end > coverage.end) card.append(textNode('p', 'Adjust this Task’s dates to fit the overall report.', 'task-date-warning'));
        }
        if (coverage.end < p.end) card.append(textNode('p', `This Task ended before the report’s end date. You can still include its earlier work.`, 'task-timing-note'));
        const taskDetails = document.createElement('details'); taskDetails.className = 'task-overview-description'; const taskText=textNode('div','','agreement-text');renderAgreementTask(taskText,task.id);taskDetails.append(textNode('summary','Read full Task description'),taskText); card.append(taskDetails);
        const actions = textNode('div', '', 'task-card-actions');
        const open = textNode('button', selected ? 'Edit your contribution' : 'Add Task to report', 'button button-secondary'); open.type = 'button';
        open.addEventListener('click', () => openTask(task, !selected)); actions.append(open);
        if (selected) actions.append(textNode('span', chosenCoverage.status === 'no_work' ? 'No work declared' : chosenCoverage.status === 'completed' ? 'Contribution completed' : hasContribution(chosenCoverage) ? 'Draft in progress' : 'Still to finish', `task-state is-${chosenCoverage.status || 'draft'}`));
        if (!selected) { const noWork = textNode('button', 'Declare no work carried out', 'button button-quiet'); noWork.type = 'button'; noWork.addEventListener('click', () => setNoWork(task)); actions.append(noWork); }
        if (selected) {
          if (chosenCoverage.status !== 'no_work') { const noWork = textNode('button', 'Declare no work carried out', 'button button-quiet'); noWork.type = 'button'; noWork.addEventListener('click', () => setNoWork(task)); actions.append(noWork); }
          const remove = textNode('button', 'Remove Task', 'button button-quiet'); remove.type = 'button'; remove.addEventListener('click', () => { state.selected.delete(task.id); renderOverview(); }); actions.append(remove);
        }
        card.append(actions); section.append(card);
      }
      list.append(section);
    }
    renderWpLeadership(p);
    if (outside.length) {
      const section = textNode('section', '', 'task-package out-of-range');
      section.append(textNode('h4', 'Selected Tasks outside these dates'));
      for (const id of outside) { const row = textNode('div', `${id} — ${taskById(id)?.title || ''}`, 'outside-row'); const remove = textNode('button', 'Remove', 'text-button'); remove.type = 'button'; remove.addEventListener('click', () => { state.selected.delete(id); renderOverview(); }); row.append(remove); section.append(row); }
      list.append(section);
    }
  }
  function activeWpMonths(wp, p) { return p.selected_months.filter(m => model.active(wp,model.projectMonth(config,m))); }
  function emptyWp() { return { status:'draft', progress:'', coordination:'', difficulties:'', next:'', support:'', task_updates:{} }; }
  function hasWpContribution(entry) { return ['progress','coordination','difficulties','next','support'].some(k => String(entry[k] || '').trim()) || Object.values(entry.task_updates || {}).some(row => ['status','progress','blocker','next'].some(k => String(row[k] || '').trim())); }
  function renderWpLeadership(p) {
    const eligible = config.workPackages.filter(wp => wp.lead === state.partner.code && activeWpMonths(wp,p).length);
    $('wp-leader-section').hidden = !eligible.length;
    const host = $('wp-leader-list'); host.replaceChildren();
    for (const wp of eligible) {
      const entry = state.wpUpdates.get(wp.id), card = textNode('article','','wp-leader-card');
      card.append(textNode('h4',`${wp.id} — ${wp.title}`));
      card.append(textNode('p',`You are the Work Package leader · ${activeWpMonths(wp,p).map(m => `M${String(model.projectMonth(config,m)).padStart(2,'0')}`).join(', ')}`,'wp-leader-meta'));
      const details = document.createElement('details'); details.className = 'wp-objectives';const objectiveText=textNode('div','','agreement-text');renderAgreementObjectives(objectiveText,wp.id); details.append(textNode('summary','Read full Work Package objectives'),objectiveText); card.append(details);
      if (entry) card.append(textNode('span',entry.status === 'completed' ? 'Leadership update completed' : entry.status === 'no_work' ? 'No Work Package work declared' : hasWpContribution(entry) ? 'Draft in progress' : 'Still to finish',`task-state is-${entry.status}`));
      const actions = textNode('div','','task-card-actions');
      const open = textNode('button',entry ? 'Edit leadership update' : 'Add leadership update','button button-secondary'); open.type='button'; open.addEventListener('click',()=>openWp(wp,!entry)); actions.append(open);
      if (entry?.status !== 'no_work') { const none = textNode('button','Declare no Work Package work','button button-quiet'); none.type='button'; none.addEventListener('click',()=>setWpNoWork(wp)); actions.append(none); }
      if (entry) { const remove = textNode('button','Remove update','button button-quiet'); remove.type='button'; remove.addEventListener('click',()=>{state.wpUpdates.delete(wp.id);renderOverview();}); actions.append(remove); }
      card.append(actions); host.append(card);
    }
  }
  function captureWp() {
    if (!state.wpEditing) return;
    const old = state.wpUpdates.get(state.wpEditing.id) || emptyWp();
    const next = { ...old, progress:value('wp-progress'), coordination:value('wp-coordination'), difficulties:value('wp-difficulties'), next:value('wp-next'), support:value('wp-support'), task_updates:{} };
    for (const row of $('wp-task-updates').querySelectorAll('[data-task-id]')) { const assessment={status:row.querySelector('.wp-task-status')?.value || '',progress:row.querySelector('.wp-task-progress')?.value.trim() || '',blocker:row.querySelector('.wp-task-blocker')?.value.trim() || '',next:row.querySelector('.wp-task-next')?.value.trim() || ''}; if(Object.values(assessment).some(Boolean))next.task_updates[row.dataset.taskId]=assessment; }
    if (old.status !== 'draft' && JSON.stringify(next) !== JSON.stringify(old)) next.status = 'draft';
    state.wpUpdates.set(state.wpEditing.id,next);
  }
  function openWp(wp, add) {
    const p = period(); if (!p) return;
    if (add) state.wpUpdates.set(wp.id,emptyWp());
    state.wpEditing = wp; state.editWasNew = add;
    const entry = state.wpUpdates.get(wp.id);
    $('wp-form-title').textContent = `${wp.id} — ${wp.title}`;
    $('wp-form-period').textContent = `You are the Work Package leader · Selected active months: ${activeWpMonths(wp,p).join(', ')}`;
    renderAgreementObjectives($('wp-form-objectives'),wp.id);
    for (const [id,key] of [['wp-progress','progress'],['wp-coordination','coordination'],['wp-difficulties','difficulties'],['wp-next','next'],['wp-support','support']]) $(id).value = entry[key] || '';
    const host = $('wp-task-updates'); host.replaceChildren();
    for (const task of config.tasks.filter(t => t.wp === wp.id)) {
      const active = p.selected_months.some(m => model.active(task,model.projectMonth(config,m)));
      const row = textNode('article','','wp-task-row'); row.dataset.taskId=task.id;
      row.append(textNode('h5',`${task.id} — ${task.title}`)); row.append(textNode('p',`Task leader: ${task.lead || 'not specified in the Agreement'} · ${active ? 'Active in selected months' : 'Not active in selected months'}`,'wp-task-meta'));
      const desc = document.createElement('details'); desc.className='task-overview-description';const taskText=textNode('div','','agreement-text');renderAgreementTask(taskText,task.id); desc.append(textNode('summary','Read full Task description'),taskText); row.append(desc);
      if (agreement.tasks[task.id].outcomeStatement) row.append(textNode('p',agreement.tasks[task.id].outcomeStatement,'task-outcome-short'));
      if (active) {
        const saved = entry.task_updates?.[task.id] || {};
        const field = textNode('div','','field'); const label = textNode('label',`Leader assessment for ${task.id}`); const select=document.createElement('select'); select.className='wp-task-status'; for (const [v,t] of [['','No assessment yet'],['on_track','On track'],['at_risk','At risk'],['delayed','Delayed'],['completed','Completed'],['unavailable','Update unavailable']]) {const option=document.createElement('option'); option.value=v; option.textContent=t; select.append(option);} select.value=saved.status || ''; label.append(select);field.append(label);row.append(field);
        for (const [cls,title,key] of [['wp-task-progress','Progress or evidence','progress'],['wp-task-blocker','Blocker or dependency','blocker'],['wp-task-next','Next action','next']]) {const box=textNode('div','','field');const lab=textNode('label',title);const area=document.createElement('textarea');area.className=cls;area.rows=2;area.value=saved[key] || '';lab.append(area);box.append(lab);row.append(box);}
      }
      host.append(row);
    }
    $('wp-editor-message').hidden=true; setWpEditor(true); scrollTo($('wp-leader-form'));
  }
  function setWpNoWork(wp) {
    const existing = state.wpUpdates.get(wp.id);
    if (existing && hasWpContribution(existing) && !window.confirm(`The Work Package leadership update for ${wp.id} will be declared as no work carried out. Existing entries for this Work Package will be cleared. Continue?`)) return;
    state.wpUpdates.set(wp.id,{...emptyWp(),status:'no_work'});state.wpEditing=null;setWpEditor(false);renderOverview();scrollTo($('wp-leader-section'));
  }
  function emptyTask() { return { status: 'draft', coverage_start: '', coverage_end: '', activities_carried_out: '', results_achieved: '', difficulties_encountered: '', raw_costs: '', raw_costs_note: '', upcoming_activities: '', additional_comments: '', significant_issue: '', severity: '', coordinator_action_required: '', coordinator_support_request: '' }; }
  function hasContribution(answer) { return ['activities_carried_out','results_achieved','difficulties_encountered','raw_costs','raw_costs_note','upcoming_activities','additional_comments','significant_issue','severity','coordinator_action_required','coordinator_support_request'].some(key => String(answer[key] || '').trim()); }
  function taskAnswerIssue(id, answer) {
    if (state.partner.kind === 'associated_partner' && (answer.raw_costs || answer.raw_costs_note)) return `Remove cost information from ${id}; associated partners cannot charge costs to the action.`;
    if (answer.raw_costs !== '' && (!/^\d+(\.\d{1,2})?$/.test(answer.raw_costs) || !Number.isSafeInteger(Math.round(Number(answer.raw_costs) * 100)))) return `Enter a valid non-negative EUR amount for ${id}, or leave it blank.`;
    if (!['','yes','no'].includes(answer.significant_issue)) return `Check the significant-issue answer for ${id}.`;
    if (answer.significant_issue === 'yes' && !['Low','Medium','High','Critical'].includes(answer.severity)) return `Choose severity for ${id} or change the significant-issue answer.`;
    if (answer.significant_issue === 'yes' && !['','yes','no'].includes(answer.coordinator_action_required)) return `Check the coordinator-action answer for ${id}.`;
    if (answer.significant_issue === 'yes' && answer.coordinator_action_required === 'yes' && !answer.coordinator_support_request.trim()) return `Describe the coordinator support requested for ${id}.`;
    return '';
  }
  function setNoWork(task) {
    const existing = state.selected.get(task.id);
    if (existing && hasContribution(existing) && !window.confirm(`This Task will be declared as no work carried out. The contribution already entered for ${task.id} will be cleared. Continue?`)) return;
    const p = period(), coverage = model.taskCoverage(config, task, p.start, p.end, p.selected_months);
    state.selected.set(task.id, { ...emptyTask(), status: 'no_work', coverage_start: existing?.coverage_start || coverage.start, coverage_end: existing?.coverage_end || coverage.end });
    state.editing = null; setTaskEditor(false); renderOverview(); scrollTo($('task-picker'));
  }
  function captureTask() {
    if (!state.editing) return;
    const answers = {};
    for (const control of taskForm.querySelectorAll('input[name], textarea[name], select[name]')) {
      if (control.type === 'radio') { if (control.checked) answers[control.name] = control.value; }
      else answers[control.name] = control.value;
    }
    if (state.partner.kind === 'associated_partner') { answers.raw_costs = ''; answers.raw_costs_note = ''; }
    const previous = state.selected.get(state.editing.id);
    const next = { ...emptyTask(), ...previous, ...answers };
    if (previous.status === 'no_work' && hasContribution(next)) next.status = 'draft';
    else if (previous.status === 'completed' && JSON.stringify(next) !== JSON.stringify(previous)) next.status = 'draft';
    state.selected.set(state.editing.id, next);
  }
  function showTaskAnswers(answers) {
    taskForm.reset();
    for (const control of taskForm.querySelectorAll('input[name], textarea[name], select[name]')) {
      const answer = answers[control.name];
      if (answer === undefined) continue;
      if (control.type === 'radio') control.checked = control.value === answer;
      else control.value = answer;
    }
    const associated = state.partner.kind === 'associated_partner';
    $('task-cost-field').hidden = associated; $('task-cost-note-field').hidden = associated; $('associated-cost-note').hidden = !associated;
    $('task-cost').disabled = associated; $('task-cost-note').disabled = associated;
    if (associated) { $('task-cost').value = ''; $('task-cost-note').value = ''; }
    updateConditions();
  }
  function openTask(task, add) {
    const wp = wpById(task.wp); const p = period(); const coverage = model.taskCoverage(config, task, p.start, p.end, p.selected_months);
    if (add) state.selected.set(task.id, { ...emptyTask(), coverage_start: coverage.start, coverage_end: coverage.end });
    state.editing = task; state.editWasNew = add;
    $('task-editor-message').hidden = true;
    showTaskAnswers(state.selected.get(task.id));
    $('task-form-title').textContent = `${task.id} — ${task.title}`;
    $('task-work-package').textContent = `${wp.id} — ${wp.title} · Work Package leader: ${wp.lead}${task.lead ? ` · Task leader: ${task.lead}` : ' · Task leader not identified in this Agreement'}`;
    $('task-role').textContent=taskRole(task);$('task-role').className=`role-badge ${taskRoleClass(task)}`;
    const outcome = agreement.tasks[task.id].outcomeStatement;
    $('task-outcome').hidden = !outcome; $('task-outcome').textContent = outcome || '';
    renderAgreementTask($('task-description-text'),task.id);
    $('task-source').textContent = `AI-SECRETT Grant Agreement, Annex 1; this Task starts on PDF page ${task.sourcePage}`;
    $('task-coverage').textContent = `Reporting available in your selected timeline: ${monthCodes(coverage.months)}. Only these months are included.`;
    for (const id of ['task-cover-start','task-cover-end']) { $(id).min = coverage.start; $(id).max = coverage.end; }
    setTaskEditor(true); scrollTo(taskForm);
  }
  function updateConditions() {
    const issue = radio(taskForm, 'significant_issue') === 'yes';
    $('task-issue-details').hidden = !issue;
    $('task-support-wrap').hidden = !issue || radio(taskForm, 'coordinator_action_required') !== 'yes';
    for (const [name, id] of [['events_organised','comm-events-wrap'],['media_outreach','comm-media-wrap'],['website_articles_published','comm-articles-wrap'],['email_or_newsletter_sent','comm-email-wrap'],['coordinator_support_required','comm-support-wrap']]) $(id).hidden = radio(commForm, name) !== 'yes';
    if (radio(commForm, 'events_organised') === 'yes' && !$('comm-events-list').children.length) addEvent();
    for (const [field, checkbox] of [['comm-reach','comm-reach-unknown'],['comm-enrolments','comm-enrolments-unknown']]) $(field).disabled = $(checkbox).checked;
  }
  let eventSerial = 0;
  function addEvent(description = '', participants = '') {
    eventSerial++;
    const el = $('event-template').content.firstElementChild.cloneNode(true);
    const d = el.querySelector('.event-description'), p = el.querySelector('.event-participants');
    d.id = `event-description-${eventSerial}`; p.id = `event-participants-${eventSerial}`;
    el.querySelectorAll('label')[0].htmlFor = d.id; el.querySelectorAll('label')[1].htmlFor = p.id;
    d.value = description; p.value = participants;
    el.querySelector('.remove-event').addEventListener('click', () => { el.remove(); if (radio(commForm, 'events_organised') === 'yes' && !$('comm-events-list').children.length) addEvent(); });
    $('comm-events-list').append(el);
  }
  taskForm.addEventListener('input', () => { captureTask(); clearError(); $('task-editor-message').hidden = true; });
  taskForm.addEventListener('change', () => { updateConditions(); captureTask(); clearError(); $('task-editor-message').hidden = true; });
  commForm.addEventListener('input', clearError);
  commForm.addEventListener('change', updateConditions);
  $('add-event').addEventListener('click', () => addEvent());
  $('done-task').addEventListener('click', () => {
    captureTask(); const answer = state.selected.get(state.editing.id);
    if (!hasContribution(answer) && answer.status !== 'no_work') { $('task-editor-message').textContent = 'Describe a contribution, choose “No work carried out”, or return to the overview and leave this Task unfinished.'; $('task-editor-message').hidden = false; return; }
    if (!validIndividualCoverage(state.editing.id,answer,period())) { $('task-editor-message').textContent = 'Set valid Task dates within the selected months.'; $('task-editor-message').hidden = false; return; }
    const issue = taskAnswerIssue(state.editing.id,answer); if (issue) { $('task-editor-message').textContent = issue; $('task-editor-message').hidden = false; return; }
    answer.status = answer.status === 'no_work' ? 'no_work' : 'completed'; state.editing = null; setTaskEditor(false); renderOverview(); scrollTo($('task-picker'));
  });
  $('back-from-task').addEventListener('click', () => {
    captureTask(); const answer = state.selected.get(state.editing.id);
    if (state.editWasNew && !hasContribution(answer)) state.selected.delete(state.editing.id);
    state.editing = null; setTaskEditor(false); renderOverview(); scrollTo($('task-picker'));
  });
  $('task-top-back').addEventListener('click', () => $('back-from-task').click());
  $('task-download-draft').addEventListener('click', () => { captureTask(); $('download-draft').click(); });
  $('task-import-top').addEventListener('click', () => { if(state.editing){captureTask();openTaskImport(state.editing);} });
  $('wp-leader-form').addEventListener('input', () => {captureWp();$('wp-editor-message').hidden=true;});
  $('wp-leader-form').addEventListener('change', () => {captureWp();$('wp-editor-message').hidden=true;});
  $('wp-back').addEventListener('click', () => {captureWp();const entry=state.wpUpdates.get(state.wpEditing.id);if(state.editWasNew&&!hasWpContribution(entry))state.wpUpdates.delete(state.wpEditing.id);state.wpEditing=null;setWpEditor(false);renderOverview();scrollTo($('wp-leader-section'));});
  $('wp-top-back').addEventListener('click', () => $('wp-back').click());
  $('wp-download-draft').addEventListener('click', () => { captureWp(); $('download-draft').click(); });
  $('wp-no-work').addEventListener('click', () => {if(state.wpEditing){captureWp();setWpNoWork(state.wpEditing);}});
  $('wp-done').addEventListener('click', () => {captureWp();const entry=state.wpUpdates.get(state.wpEditing.id);if(!hasWpContribution(entry)){ $('wp-editor-message').textContent='Add a leadership update or declare no Work Package work.';$('wp-editor-message').hidden=false;return;}entry.status='completed';state.wpEditing=null;setWpEditor(false);renderOverview();scrollTo($('wp-leader-section'));});
  $('no-work-task').addEventListener('click', () => { if (state.editing) { captureTask(); setNoWork(state.editing); } });
  $('individual-task-pdf').addEventListener('click', () => { if (state.editing) { captureTask(); showIndividualTaskPdf(state.editing.id); } });
  for (const id of ['report-start','report-end']) $(id).addEventListener('change', () => {
    const oldPeriod = state.lastPeriod;
    const start = value('report-start'), end = value('report-end');
    if (model.rangePeriod(config,start,end)) {
      const span = model.monthsBetween(config,start,end), old = sortedMonths();
      state.selectedMonths = new Set(old.length && old.includes(start.slice(0,7)) && old.includes(end.slice(0,7)) ? old.filter(m => span.includes(m)) : span);
    }
    reconcileSelectedCoverage(oldPeriod,period());
    renderOverview();
  });
  window.addEventListener('secrett:contributor-ready', event => { if (state.partner && state.partner.code !== event.detail.partner.code) { state.selected = new Map(); state.wpUpdates=new Map(); state.selectedMonths = new Set(); state.lastPeriod = null; state.reportType = null; state.revision = 1; state.reviewed = null; state.editing = null; state.wpEditing = null; $('report-revision').value = '1'; $('report-start').value = ''; $('report-end').value = ''; commForm.reset(); $('comm-events-list').replaceChildren(); $('comm-reach-unknown').checked = false; $('comm-enrolments-unknown').checked = false; updateConditions(); for (const url of state.urls) URL.revokeObjectURL(url); state.urls = []; if (state.taskPdfUrl) URL.revokeObjectURL(state.taskPdfUrl); state.taskPdfUrl = null; for (const dialog of document.querySelectorAll('dialog[open]')) dialog.close(); } state.partner = event.detail.partner; state.contributor = event.detail.contributor; $('report-workspace').hidden = true; $('review-section').hidden = true; $('submission-section').hidden = true; });
  window.addEventListener('secrett:edit-details', () => { $('report-workspace').hidden = true; $('review-section').hidden = true; $('submission-section').hidden = true; });
  window.addEventListener('secrett:report-selected', event => {
    const chosenType = event.detail.reportType === 'task' ? 'tasks' : 'communication';
    if (state.reportType !== chosenType) { state.revision = 1; $('report-revision').value = '1'; }
    state.reportType = chosenType; state.editing = null; state.reviewed = null;
    $('report-workspace').hidden = false; $('review-section').hidden = true; $('submission-section').hidden = true;
    clearError(); message('');
    const tasks = state.reportType === 'tasks';
    $('overview-import').hidden = !tasks;
    $('draft-pdf-choice').hidden = !tasks;
    $('selected-task-summary').hidden = !tasks;
    $('task-picker').hidden = !tasks; taskForm.hidden = true; $('wp-leader-form').hidden = true; commForm.hidden = tasks; $('back-to-choice').hidden=false;
    $('draft-actions').hidden = false; $('revision-controls').hidden = false; $('report-form-actions').hidden = false;
    $('workspace-title').textContent = tasks ? 'Build your partner report' : 'Communication & Dissemination';
    $('review-report').innerHTML = tasks ? 'Review full report before submission <span aria-hidden="true">→</span>' : 'Review communication report <span aria-hidden="true">→</span>';
    if (tasks) {
      $('report-start').min = config.project.startDate; $('report-start').max = projectEnd();
      $('report-end').min = config.project.startDate; $('report-end').max = projectEnd();
      renderOverview();
    }
    scrollTo($('report-workspace')); $('workspace-title').focus({ preventScroll: true });
  });
  $('back-to-choice').addEventListener('click', () => { $('report-workspace').hidden = true; $('review-section').hidden = true; $('submission-section').hidden = true; scrollTo($('report-choice')); });
  $('report-revision').addEventListener('change', () => { state.revision = Number(value('report-revision')); });
  function validate() {
    clearError();
    const rev = Number(value('report-revision'));
    if (!Number.isInteger(rev) || rev < 1 || rev > 99) return fail('Enter a revision from 1 to 99.', $('report-revision'));
    state.revision = rev;
    if (state.reportType === 'tasks') {
      const p = period();
      if (!p) return fail('Choose valid reporting dates and selected months within the project.', $('report-start'));
      const eligible = new Set(selectedInRange().map(t => t.id));
      if (!state.selected.size && !state.wpUpdates.size) return fail('Add a Task contribution or Work Package leadership update.');
      if ([...state.selected.keys()].some(id => !eligible.has(id))) return fail('Remove selected Tasks outside the report dates, or change the dates.');
      for (const [id, answer] of state.selected) {
        const allowed = model.taskCoverage(config, taskById(id), p.start, p.end, p.selected_months);
        const taskMonths = p.selected_months.filter(m => m >= answer.coverage_start.slice(0,7) && m <= answer.coverage_end.slice(0,7));
        if (!allowed || !model.rangePeriod(config, answer.coverage_start, answer.coverage_end) || answer.coverage_start < allowed.start || answer.coverage_end > allowed.end || !taskMonths.length || !p.selected_months.includes(answer.coverage_start.slice(0,7)) || !p.selected_months.includes(answer.coverage_end.slice(0,7))) return fail(`Set valid Task coverage dates for ${id} within the selected months.`);
        if (!['completed','no_work'].includes(answer.status)) return fail(`Finish ${id}, mark no work carried out, or remove it before generating the full report.`);
        if (answer.status === 'no_work') { if (hasContribution(answer)) return fail(`Clear the contribution for ${id} before declaring no work.`); continue; }
        const issue = taskAnswerIssue(id,answer); if (issue) return fail(issue);
      }
      for (const [id, entry] of state.wpUpdates) {
        const wp=wpById(id);
        if (!wp || wp.lead !== state.partner.code || !activeWpMonths(wp,p).length) return fail(`Remove ${id} or select months when this Work Package is active.`);
        if (!['completed','no_work'].includes(entry.status)) return fail(`Finish the leadership update for ${id}, declare no Work Package work, or remove it.`);
        if (entry.status === 'no_work' && hasWpContribution(entry)) return fail(`Clear the leadership update for ${id} before declaring no Work Package work.`);
      }
      return true;
    }
    const start = value('comm-start'), end = value('comm-end');
    if (!start || !end || end < start || start < config.project.startDate || end > projectEnd()) return fail('Enter a communication reporting period within the project dates.', $('comm-start'));
    const days = Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000) + 1;
    if (days !== 14) return fail('Communication check-ins must cover exactly 14 calendar days.', $('comm-end'));
    for (const name of ['events_organised','media_outreach','website_articles_published','email_or_newsletter_sent','coordinator_support_required']) if (!radio(commForm,name)) return fail('Answer all Yes/No communication questions.');
    if (radio(commForm,'events_organised') === 'yes') for (const el of $('comm-events-list').children) if (!el.querySelector('.event-description').value.trim() || !validCount(el.querySelector('.event-participants').value)) return fail('Describe each event and enter its participant count.');
    if (radio(commForm,'media_outreach') === 'yes' && (![value('comm-journalists'),value('comm-outlets')].every(validCount))) return fail('Enter non-negative journalist and outlet counts.');
    if (radio(commForm,'website_articles_published') === 'yes' && !urls('comm-articles').length) return fail('Enter at least one article link.');
    for (const id of ['comm-articles','comm-social-links']) for (const u of urls(id)) if (!isUrl(u)) return fail('Enter valid http:// or https:// links.');
    for (const id of ['comm-social-count', ...(radio(commForm,'email_or_newsletter_sent') === 'yes' ? ['comm-recipients'] : [])]) if (!validCount(value(id))) return fail('Enter the required non-negative activity count.');
    for (const [id,unknown] of [['comm-reach','comm-reach-unknown'],['comm-enrolments','comm-enrolments-unknown']]) if (!$(unknown).checked && !validCount(value(id))) return fail('Enter a non-negative count or select Unknown.');
    if (radio(commForm,'coordinator_support_required') === 'yes' && !value('comm-support')) return fail('Describe the support required.');
    return true;
  }
  function finalTaskAnswers(a) {
    const issue = a.significant_issue === 'yes'; const action = issue && a.coordinator_action_required === 'yes';
    const associated = state.partner.kind === 'associated_partner';
    const validCost = a.raw_costs !== '' && /^\d+(\.\d{1,2})?$/.test(a.raw_costs) && Number.isSafeInteger(Math.round(Number(a.raw_costs) * 100));
    const costNote = associated ? '' : `${!validCost && a.raw_costs ? `Draft amount needs correction: ${a.raw_costs.slice(0,80)}${a.raw_costs.length>80?'…':''}. ` : ''}${a.raw_costs_note.trim()}`;
    return { activities_carried_out: a.activities_carried_out.trim(), results_achieved: a.results_achieved.trim(), difficulties_encountered: a.difficulties_encountered.trim(), raw_costs_incurred: { amount: associated || !validCost ? null : Number(a.raw_costs).toFixed(2), currency: 'EUR', note: costNote }, upcoming_activities: a.upcoming_activities.trim(), additional_comments: a.additional_comments.trim(), significant_issue: a.significant_issue === '' ? null : issue, severity: issue ? a.severity || null : null, coordinator_action_required: issue ? (a.coordinator_action_required === '' ? null : action) : null, coordinator_support_request: action ? a.coordinator_support_request.trim() : null };
  }
  function communicationAnswers() {
    const yes = name => radio(commForm,name) === 'yes';
    return { events_organised: yes('events_organised'), events: yes('events_organised') ? [...$('comm-events-list').children].map(el => ({ description: el.querySelector('.event-description').value.trim(), participants: Number(el.querySelector('.event-participants').value) })) : [], media_outreach: yes('media_outreach'), journalists_contacted: yes('media_outreach') ? asCount('comm-journalists') : 0, media_outlets_contacted: yes('media_outreach') ? asCount('comm-outlets') : 0, media_details: yes('media_outreach') ? value('comm-media-details') : '', website_articles_published: yes('website_articles_published'), website_articles: yes('website_articles_published') ? urls('comm-articles').map(url => ({ url, details: value('comm-article-details') })) : [], social_posts_count: asCount('comm-social-count'), social_post_urls: urls('comm-social-links'), social_details: value('comm-social-details'), email_or_newsletter_sent: yes('email_or_newsletter_sent'), estimated_recipients: yes('email_or_newsletter_sent') ? asCount('comm-recipients') : 0, email_details: yes('email_or_newsletter_sent') ? value('comm-email-details') : '', other_activities_or_materials: value('comm-other'), estimated_people_reached: $('comm-reach-unknown').checked ? null : asCount('comm-reach'), preregistrations_or_enrolments: $('comm-enrolments-unknown').checked ? null : asCount('comm-enrolments'), coordinator_support_required: yes('coordinator_support_required'), coordinator_support_request: yes('coordinator_support_required') ? value('comm-support') : null };
  }
  function commSnapshot() {
    const fields = {};
    for (const control of commForm.querySelectorAll('input[name], textarea[name], select[name]')) { if (control.type === 'radio') { if (control.checked) fields[control.name] = control.value; } else fields[control.name] = control.value; }
    return { fields, reach_unknown: $('comm-reach-unknown').checked, enrolments_unknown: $('comm-enrolments-unknown').checked, events: [...$('comm-events-list').children].map(el => ({ description: el.querySelector('.event-description').value, participants: el.querySelector('.event-participants').value })) };
  }
  function record(kind) {
    const tasks = state.reportType === 'tasks';
    const p = tasks ? (period() || { start: value('report-start'), end: value('report-end'), start_project_month: null, end_project_month: null, start_code: null, end_code: null, selected_months: sortedMonths() }) : { start: value('comm-start'), end: value('comm-end') };
    const key = tasks ? `${state.partner.code}:TASKS:${p.start}:${p.end}` : `${state.partner.code}:COMM:${p.start}:${p.end}`;
    const base = { schema_version: tasks ? '2.2' : '1.1', project: 'AI-SECRETT', document_kind: kind, report_type: tasks ? 'tasks' : 'communication', report_key: key, revision: state.revision, partner: { code: state.partner.code, name: state.partner.name, kind: state.partner.kind || 'beneficiary' }, contributor: { ...state.contributor }, reporting_period: p, generated_at: kind === 'submission' ? new Date().toISOString() : null };
    if (tasks) {
      base.tasks = [...state.selected].map(([id, answers]) => { const task = taskById(id); const months = p.selected_months.filter(m => m >= answers.coverage_start.slice(0,7) && m <= answers.coverage_end.slice(0,7) && model.active(task,model.projectMonth(config,m))); return { id, title: task.title, work_package: task.wp, task_lead: task.lead, partner_role: model.role(task, state.partner.code, config), work_status: answers.status || 'draft', coverage: { start: answers.coverage_start, end: answers.coverage_end, months }, agreement_source_page: task.sourcePage, answers: kind === 'draft' ? { ...answers } : finalTaskAnswers(answers) }; });
      base.work_package_leadership=[...state.wpUpdates].map(([id,entry])=>{const wp=wpById(id);return {id,title:wp.title,leader:wp.lead,work_status:entry.status,coverage:{months:activeWpMonths(wp,p)},answers:{progress:entry.progress,coordination:entry.coordination,difficulties:entry.difficulties,next:entry.next,support:entry.support},task_updates:Object.entries(entry.task_updates).filter(([taskId])=>{const t=taskById(taskId);return t && p.selected_months.some(m=>model.active(t,model.projectMonth(config,m)));}).map(([taskId,row])=>({id:taskId,title:taskById(taskId).title,task_lead:taskById(taskId).lead,...row}))};});
    }
    else base.answers = communicationAnswers();
    if (kind === 'draft') { base.saved_at = new Date().toISOString(); if (!tasks) base.form_state = commSnapshot(); }
    return base;
  }
  const safe = x => String(x).toUpperCase().replace(/[^A-Z0-9.]+/g,'-').replace(/^-|-$/g,'');
  function filename(r, draft) { const base = r.report_type === 'tasks' ? `SECRETT_${safe(r.partner.code)}_TASKS_${r.reporting_period.start || 'START'}_${r.reporting_period.end || 'END'}` : `SECRETT_${safe(r.partner.code)}_COMM_${r.reporting_period.start || 'START'}_${r.reporting_period.end || 'END'}`; return draft ? `${base}_DRAFT` : `${base}_v${r.revision}`; }
  const draftKey = () => `secrett:draft:${state.partner.code}:${state.reportType}`;
  function download(blob, name) { const a = document.createElement('a'); const url = URL.createObjectURL(blob); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000); }
  function urlFor(blob) { const url = URL.createObjectURL(blob); state.urls.push(url); return url; }
  function taskMonthsFor(answer, p) { return p.selected_months.filter(m => m >= answer.coverage_start.slice(0,7) && m <= answer.coverage_end.slice(0,7)); }
  function validIndividualCoverage(id, answer, p) {
    if (!p) return false;
    const allowed = model.taskCoverage(config,taskById(id),p.start,p.end,p.selected_months);
    return !!allowed && !!model.rangePeriod(config,answer.coverage_start,answer.coverage_end) && answer.coverage_start >= allowed.start && answer.coverage_end <= allowed.end && taskMonthsFor(answer,p).length > 0 && p.selected_months.includes(answer.coverage_start.slice(0,7)) && p.selected_months.includes(answer.coverage_end.slice(0,7));
  }
  async function showIndividualTaskPdf(id) {
    const answer = state.selected.get(id), p = period();
    if (!answer || !validIndividualCoverage(id,answer,p)) { if (state.editing) { $('task-editor-message').textContent = 'Set valid Task dates within the selected months before downloading a PDF.'; $('task-editor-message').hidden = false; } else message('Set valid Task dates before downloading its PDF.'); return; }
    if (answer.status === 'draft' && !hasContribution(answer)) { $('task-editor-message').textContent = 'Enter a contribution or mark no work carried out before downloading this Task PDF.'; $('task-editor-message').hidden = false; return; }
    const issue = answer.status === 'no_work' ? (hasContribution(answer) ? `Clear the contribution for ${id} before declaring no work.` : '') : taskAnswerIssue(id,answer);
    if (issue) { if (state.editing) { $('task-editor-message').textContent = issue; $('task-editor-message').hidden = false; } else message(issue); return; }
    const dialog = $('individual-pdf-dialog'), link = $('download-individual-pdf');
    if (state.taskPdfUrl) { URL.revokeObjectURL(state.taskPdfUrl); state.taskPdfUrl = null; }
    link.removeAttribute('href'); link.textContent = 'Preparing PDF…'; link.setAttribute('aria-disabled','true'); $('individual-pdf-error').hidden = true;
    $('individual-pdf-description').textContent = `This PDF contains only ${id} — ${taskById(id).title}${answer.status === 'draft' ? ' as an unfinished draft of your report' : ' as an individual Task report'}. Keep this copy while you work on your full report. When you finish, return to the overview to review and generate one complete report covering all selected Tasks and Work Packages.`;
    dialog.showModal();
    try {
      const r = record('submission'); r.tasks = r.tasks.filter(item => item.id === id); r.work_package_leadership=[]; r.document_kind = 'individual_task_copy'; r.pdf_kind = 'individual_task'; r.generated_at = new Date().toISOString();
      state.taskPdfUrl = URL.createObjectURL(await window.SECRETT_PDF.createPdf(r));
      link.href = state.taskPdfUrl; link.download = `SECRETT_${safe(state.partner.code)}_${id}_${p.start}_${p.end}_INDIVIDUAL_TASK_REPORT.pdf`; link.textContent = 'Download individual Task report'; link.setAttribute('aria-disabled','false');
    } catch (error) { $('individual-pdf-error').textContent = `Could not prepare the PDF: ${error.message}`; $('individual-pdf-error').hidden = false; link.textContent = 'PDF unavailable'; }
  }
  $('close-individual-pdf').addEventListener('click', () => $('individual-pdf-dialog').close());
  $('download-individual-pdf').addEventListener('click', event => { if (event.currentTarget.getAttribute('aria-disabled') === 'true') event.preventDefault(); });
  $('save-draft').addEventListener('click', () => { try { const r = record('draft'); if (localStorage.getItem(draftKey()) && !window.confirm('Saving will replace the existing browser draft for this partner and report type. Download a draft file first if you want to keep both. Continue?')) return; localStorage.setItem(draftKey(), JSON.stringify(r)); message('Whole-report browser draft saved on this device. Download a draft file as a backup.'); } catch (error) { message(`Could not save browser draft: ${error.message}`); } });
  $('download-draft').addEventListener('click', () => { try { const r = record('draft'); download(new Blob([JSON.stringify(r,null,2)],{type:'application/json'}),`${filename(r,true)}.json`); message('Whole-report draft file downloaded.'); } catch (error) { message(`Could not download draft: ${error.message}`); } });
  $('download-draft-pdf').addEventListener('click', async () => {try {if(!period())throw new Error('Select project months first.');const editable=record('draft'),display=record('submission');display.document_kind='draft';display.pdf_kind='draft_report';display.generated_at=new Date().toISOString();download(await window.SECRETT_PDF.createPdf(display,editable),`${filename(editable,true)}.pdf`);message('Readable draft PDF downloaded. It also contains your editable AI-SECRETT draft data for reopening here.');}catch(error){message(`Could not download draft PDF: ${error.message}`);}});
  $('load-browser-draft').addEventListener('click', () => { try { const saved = localStorage.getItem(draftKey()); if (!saved) return message('No browser draft was found for this partner and report type.'); if (!window.confirm('Restoring the browser draft will replace the report currently on screen. Download the current draft first if you want to keep it. Continue?')) return; restore(JSON.parse(saved)); } catch (error) { message(`Could not load browser draft: ${error.message}`); } });
  $('delete-browser-draft').addEventListener('click', () => { try { if (!localStorage.getItem(draftKey())) return message('No browser draft was found for this partner and report type.'); if (!window.confirm('Delete the saved browser draft for this partner and report type? This cannot be undone.')) return; localStorage.removeItem(draftKey()); message('Browser draft deleted.'); } catch { message('Browser storage is unavailable.'); } });
  $('load-draft-file').addEventListener('change', async event => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; if (file.size > 5_000_000) return message('Draft file is too large (5 MB maximum).'); try { restore(JSON.parse(await file.text())); } catch (error) { message(`Could not load draft file: ${error.message}`); } });
  function importedTaskAnswers(a, status) {
    if (!a || ['activities_carried_out','results_achieved','difficulties_encountered','upcoming_activities','additional_comments'].some(k=>typeof a[k] !== 'string' || a[k].length > 100000)) throw new Error('A Task answer is invalid.');
    const cost=a.raw_costs_incurred;
    if (!cost || cost.currency !== 'EUR' || !(cost.amount === null || (/^\d+\.\d{2}$/.test(cost.amount) && Number.isSafeInteger(Math.round(Number(cost.amount) * 100)))) || typeof cost.note !== 'string' || cost.note.length > 500) throw new Error('A Task cost entry is invalid.');
    if (state.partner.kind === 'associated_partner' && (cost.amount !== null || cost.note)) throw new Error('Associated partner reports cannot contain cost entries.');
    if (![null,true,false].includes(a.significant_issue) || ![null,true,false].includes(a.coordinator_action_required) || (a.significant_issue === true && !['Low','Medium','High','Critical'].includes(a.severity))) throw new Error('A Task issue entry is invalid.');
    if (a.coordinator_action_required === true && (typeof a.coordinator_support_request !== 'string' || !a.coordinator_support_request.trim())) throw new Error('A Task support request is invalid.');
    return { status, activities_carried_out:a.activities_carried_out, results_achieved:a.results_achieved, difficulties_encountered:a.difficulties_encountered, raw_costs:cost.amount || '', raw_costs_note:cost.note, upcoming_activities:a.upcoming_activities, additional_comments:a.additional_comments, significant_issue:a.significant_issue === null ? '' : a.significant_issue ? 'yes' : 'no', severity:a.severity || '', coordinator_action_required:a.coordinator_action_required === null ? '' : a.coordinator_action_required ? 'yes' : 'no', coordinator_support_request:a.coordinator_support_request || '' };
  }
  function importedAsDraft(r) {
    if (!r || r.project !== 'AI-SECRETT' || r.report_type !== 'tasks' || !['submission','individual_task_copy'].includes(r.document_kind) || !['2.0','2.1','2.2'].includes(r.schema_version)) throw new Error('Choose an AI-SECRETT Task report generated by this tool.');
    if (r.partner?.code !== state.partner.code || r.partner?.name !== state.partner.name) throw new Error('The report belongs to another partner. Select that partner before importing.');
    if (!r.contributor || ['name','role','email'].some(k=>typeof r.contributor[k] !== 'string' || !r.contributor[k].trim() || r.contributor[k].length > 300)) throw new Error('Contributor details are invalid.');
    const months=r.reporting_period?.selected_months || model.monthsBetween(config,r.reporting_period?.start || '',r.reporting_period?.end || '');
    const p=model.rangePeriod(config,r.reporting_period?.start,r.reporting_period?.end,months);
    if (!p || !Array.isArray(r.tasks) || r.tasks.length > config.tasks.length || r.report_key !== `${state.partner.code}:TASKS:${p.start}:${p.end}`) throw new Error('Report dates, months or identity are invalid.');
    const seen=new Set(), tasks=[];
    for(const item of r.tasks){
      const task=taskById(item.id), coverage=task && model.taskCoverage(config,task,p.start,p.end,p.selected_months);
      if(!task || !model.assigned(task,state.partner.code,config) || !coverage || seen.has(task.id) || item.title !== task.title || item.work_package !== task.wp || item.task_lead !== task.lead || item.partner_role !== model.role(task,state.partner.code,config))throw new Error('A Task does not match this project catalogue.');
      const start=item.coverage?.start,end=item.coverage?.end, expected=coverage.months.filter(m=>m >= start?.slice(0,7) && m <= end?.slice(0,7));
      if(!model.rangePeriod(config,start,end) || start < coverage.start || end > coverage.end || !expected.length || expected[0] !== start.slice(0,7) || expected.at(-1) !== end.slice(0,7) || (r.schema_version !== '2.0' && JSON.stringify(item.coverage.months) !== JSON.stringify(expected)))throw new Error(`Task dates or months are invalid for ${task.id}.`);
      const status=item.work_status || (r.document_kind === 'individual_task_copy' ? 'draft' : 'completed');
      if(!['draft','completed','no_work'].includes(status) || (r.document_kind === 'submission' && status === 'draft'))throw new Error(`Task state is invalid for ${task.id}.`);
      const answers=importedTaskAnswers(item.answers,status);
      if (status === 'no_work' && hasContribution(answers)) throw new Error(`No-work Task ${task.id} contains contribution answers.`);
      tasks.push({...item,coverage:{start,end,months:expected},answers:{...emptyTask(),...answers,coverage_start:start,coverage_end:end}});seen.add(task.id);
    }
    const wpItems=[];const wpSeen=new Set();
    for(const item of (r.work_package_leadership || [])){
      const wp=wpById(item.id), active=wp && activeWpMonths(wp,p);
      if(!wp || wp.lead !== state.partner.code || !active?.length || wpSeen.has(wp.id) || item.title !== wp.title || item.leader !== wp.lead || JSON.stringify(item.coverage?.months) !== JSON.stringify(active) || !['completed','no_work'].includes(item.work_status))throw new Error('A Work Package update is invalid.');
      if(!item.answers || ['progress','coordination','difficulties','next','support'].some(k=>typeof item.answers[k] !== 'string' || item.answers[k].length > 100000) || !Array.isArray(item.task_updates))throw new Error('A Work Package answer is invalid.');
      if(item.work_status === 'no_work' && (['progress','coordination','difficulties','next','support'].some(k=>item.answers[k].trim()) || item.task_updates.length))throw new Error(`No-work Work Package ${wp.id} contains update answers.`);
      const rowSeen=new Set();for(const row of item.task_updates){const task=taskById(row.id);if(!task || task.wp !== wp.id || rowSeen.has(row.id) || row.title !== task.title || row.task_lead !== task.lead || !['','on_track','at_risk','delayed','completed','unavailable'].includes(row.status) || ['progress','blocker','next'].some(k=>typeof row[k] !== 'string' || row[k].length > 100000))throw new Error('A Work Package Task assessment is invalid.');rowSeen.add(row.id);}
      wpItems.push(item);wpSeen.add(wp.id);
    }
    if(r.document_kind === 'individual_task_copy' && (tasks.length !== 1 || wpItems.length))throw new Error('Individual Task PDF data is invalid.');
    if(!tasks.length && !wpItems.length)throw new Error('The report contains no Task or Work Package update.');
    return {...r,schema_version:'2.2',document_kind:'draft',reporting_period:p,tasks,work_package_leadership:wpItems,generated_at:null,saved_at:new Date().toISOString()};
  }
  let taskImportTarget=null, pendingWholeImport=null;
  function openTaskImport(task){
    taskImportTarget=task.id;
    $('task-import-explanation').textContent=`This imports only ${task.id} — ${task.title}. It replaces any current entry for this Task and leaves every other Task and Work Package update alone. The PDF must be an individual Task report from this preview for the same partner and selected months. To import a whole report or draft, use “Import report” just below the project timeline.`;
    $('task-import-error').hidden=true;$('task-import-dialog').showModal();
  }
  $('close-task-import').addEventListener('click',()=>{$('task-import-dialog').close();taskImportTarget=null;});
  $('task-import-file').addEventListener('change',async event=>{
    const file=event.target.files?.[0];event.target.value='';if(!file||!taskImportTarget)return;
    try{
      if(!file.name.toLowerCase().endsWith('.pdf')||file.size>10_000_000)throw new Error('Choose an individual AI-SECRETT Task PDF under 10 MB.');
      const raw=await window.SECRETT_PDF.readEmbeddedReport(file);
      if(raw.document_kind!=='individual_task_copy')throw new Error('This is a whole-report PDF. Use “Import report” below the project timeline.');
      const imported=importedAsDraft(raw),incoming=imported.reporting_period,current=period();
      if(imported.tasks[0]?.id!==taskImportTarget)throw new Error(`This PDF belongs to ${imported.tasks[0]?.id||'another Task'}, not ${taskImportTarget}.`);
      if(!current||current.start!==incoming.start||current.end!==incoming.end||JSON.stringify(current.selected_months)!==JSON.stringify(incoming.selected_months))throw new Error('The PDF covers different selected months. Use “Import report” below the project timeline to choose its reporting period.');
      const id=taskImportTarget,combined=record('draft');combined.tasks=combined.tasks.filter(item=>item.id!==id).concat(imported.tasks);
      state.editing=null;setTaskEditor(false);restore(combined);$('task-import-dialog').close();taskImportTarget=null;
      $('overview-import-message').hidden=true;message(`${id} imported. Other entries are unchanged. Review its answers before generating the report.`);
    }catch(error){$('task-import-error').textContent=`Could not import this Task: ${error.message}`;$('task-import-error').hidden=false;}
  });
  function prepareWholeImport(raw){
    const imported=raw.document_kind==='draft'?{...raw,work_package_leadership:raw.work_package_leadership||[]}:importedAsDraft(raw);
    if(imported.project!=='AI-SECRETT'||imported.report_type!=='tasks'||imported.partner?.code!==state.partner.code||imported.partner?.name!==state.partner.name||!Array.isArray(imported.tasks)||!Array.isArray(imported.work_package_leadership)||imported.tasks.length>config.tasks.length||imported.work_package_leadership.length>config.workPackages.length)throw new Error('This is not a compatible report for the selected partner.');
    const incoming=imported.reporting_period,p=model.rangePeriod(config,incoming?.start,incoming?.end,incoming?.selected_months);
    if(!p)throw new Error('The imported reporting months are invalid.');
    const current=period(),samePeriod=!!current&&current.start===p.start&&current.end===p.end&&JSON.stringify(current.selected_months)===JSON.stringify(p.selected_months);
    pendingWholeImport={imported,samePeriod};
    $('whole-import-explanation').textContent=`File period: ${p.selected_months.map(m=>`${m} (M${String(model.projectMonth(config,m)).padStart(2,'0')})`).join(', ')}. ${samePeriod?'Selected entries will replace matching entries in this report; all other entries stay.':'These months differ from the current report. Importing will use the file’s timeline and replace the current entries. Download your current draft first if you need a separate copy.'}`;
    const host=$('whole-import-entries');host.replaceChildren();
    for(const item of imported.tasks){const label=textNode('label','');const check=document.createElement('input');check.type='checkbox';check.checked=true;check.dataset.kind='task';check.value=item.id;label.append(check,textNode('span',`${item.id} — ${taskById(item.id)?.title||item.title}`));host.append(label);}
    for(const item of imported.work_package_leadership){const label=textNode('label','');const check=document.createElement('input');check.type='checkbox';check.checked=true;check.dataset.kind='wp';check.value=item.id;label.append(check,textNode('span',`${item.id} — Work Package leadership update`));host.append(label);}
    $('whole-import-error').hidden=true;$('whole-import-dialog').showModal();
  }
  $('import-report-file').addEventListener('change',async event=>{
    const file=event.target.files?.[0];event.target.value='';if(!file)return;
    try{if(file.size>(file.name.toLowerCase().endsWith('.pdf')?10_000_000:5_000_000))throw new Error('The file is too large.');const raw=file.name.toLowerCase().endsWith('.pdf')?await window.SECRETT_PDF.readEmbeddedReport(file):JSON.parse(await file.text());prepareWholeImport(raw);$('overview-import-message').hidden=true;}
    catch(error){$('overview-import-message').textContent=`Could not read report: ${error.message}`;$('overview-import-message').hidden=false;}
  });
  $('cancel-whole-import').addEventListener('click',()=>{$('whole-import-dialog').close();pendingWholeImport=null;});
  $('confirm-whole-import').addEventListener('click',()=>{
    if(!pendingWholeImport)return;
    try{
      const checks=[...$('whole-import-entries').querySelectorAll('input:checked')];if(!checks.length)throw new Error('Select at least one Task or Work Package update.');
      const taskIds=new Set(checks.filter(el=>el.dataset.kind==='task').map(el=>el.value)),wpIds=new Set(checks.filter(el=>el.dataset.kind==='wp').map(el=>el.value));
      const {imported,samePeriod}=pendingWholeImport,selectedTasks=imported.tasks.filter(item=>taskIds.has(item.id)),selectedWps=imported.work_package_leadership.filter(item=>wpIds.has(item.id));
      let toRestore;
      if(samePeriod){toRestore=record('draft');toRestore.tasks=toRestore.tasks.filter(item=>!taskIds.has(item.id)).concat(selectedTasks);toRestore.work_package_leadership=toRestore.work_package_leadership.filter(item=>!wpIds.has(item.id)).concat(selectedWps);}
      else toRestore={...imported,tasks:selectedTasks,work_package_leadership:selectedWps};
      restore(toRestore);$('whole-import-dialog').close();pendingWholeImport=null;message(`Imported ${selectedTasks.length} Task entries and ${selectedWps.length} Work Package updates. Review them before generating files.`);
    }catch(error){$('whole-import-error').textContent=`Could not import selected entries: ${error.message}`;$('whole-import-error').hidden=false;}
  });
  function restore(r) {
    if (!r || r.project !== 'AI-SECRETT' || r.document_kind !== 'draft' || r.partner?.code !== state.partner.code || r.report_type !== state.reportType) throw new Error('Choose the draft’s partner and report type before loading it.');
    if (!['2.0','2.1','2.2','1.1'].includes(r.schema_version)) throw new Error('Unsupported draft version.');
    if (!r.contributor || ['name','role','email'].some(k => typeof r.contributor[k] !== 'string' || r.contributor[k].length > 300)) throw new Error('Invalid contributor details.');
    if (state.reportType === 'tasks') {
      if (!['2.0','2.1','2.2'].includes(r.schema_version) || !Array.isArray(r.tasks)) throw new Error('This is not a whole-partner Task draft.');
      const selectedMonths = r.reporting_period?.selected_months || model.monthsBetween(config,r.reporting_period?.start || '',r.reporting_period?.end || '');
      if (!Array.isArray(selectedMonths) || selectedMonths.length > config.project.durationMonths) throw new Error('Draft month selection is invalid.');
      const p = model.rangePeriod(config, r.reporting_period?.start, r.reporting_period?.end, selectedMonths);
      if (!p && (r.tasks.length || r.work_package_leadership?.length)) throw new Error('The draft has entries but its reporting months are not valid.');
      const selected = new Map();
      for (const item of r.tasks) {
        const task = taskById(item.id);
        if (!task || !model.assigned(task,state.partner.code,config) || !model.taskCoverage(config,task,p.start,p.end,p.selected_months) || selected.has(task.id)) throw new Error('Draft contains an invalid or duplicate Task.');
        const answers = { ...emptyTask() };
        for (const key of Object.keys(answers)) { const input = item.answers?.[key]; if (input !== undefined) { if (typeof input !== 'string' || input.length > 100000) throw new Error('Draft contains an invalid answer.'); answers[key] = input; } }
        if (state.partner.kind === 'associated_partner' && (answers.raw_costs || answers.raw_costs_note)) throw new Error('Associated partner drafts cannot contain cost entries.');
        if (!['draft','completed','no_work'].includes(answers.status)) throw new Error('Draft has an invalid Task status.');
        if (answers.status === 'no_work' && hasContribution(answers)) throw new Error(`No-work Task ${task.id} contains contribution answers.`);
        const available = model.taskCoverage(config,task,p.start,p.end,p.selected_months);
        if (!answers.coverage_start) answers.coverage_start = item.coverage?.start || available.start;
        if (!answers.coverage_end) answers.coverage_end = item.coverage?.end || available.end;
        selected.set(task.id, answers);
      }
      const wpUpdates=new Map();
      for(const item of (r.work_package_leadership || [])) {
        const wp=wpById(item.id);if(!wp || wp.lead !== state.partner.code || !p || !activeWpMonths(wp,p).length || wpUpdates.has(wp.id)) throw new Error('Draft contains an invalid Work Package update.');
        const entry={...emptyWp(),status:item.work_status,progress:item.answers?.progress || '',coordination:item.answers?.coordination || '',difficulties:item.answers?.difficulties || '',next:item.answers?.next || '',support:item.answers?.support || '',task_updates:{}};
        if(!['draft','completed','no_work'].includes(entry.status) || ['progress','coordination','difficulties','next','support'].some(k=>typeof entry[k] !== 'string' || entry[k].length > 100000))throw new Error('Draft Work Package answers are invalid.');
        for(const row of (item.task_updates || [])){const task=taskById(row.id);if(!task || task.wp !== wp.id || entry.task_updates[row.id])throw new Error('Draft Task assessment is invalid.');entry.task_updates[row.id]={status:row.status || '',progress:row.progress || '',blocker:row.blocker || '',next:row.next || ''};if(!['','on_track','at_risk','delayed','completed','unavailable'].includes(entry.task_updates[row.id].status) || ['progress','blocker','next'].some(k=>typeof entry.task_updates[row.id][k] !== 'string' || entry.task_updates[row.id][k].length > 100000))throw new Error('Draft Task assessment is invalid.');}
        if (entry.status === 'no_work' && hasWpContribution(entry)) throw new Error(`No-work Work Package ${wp.id} contains update answers.`);
        wpUpdates.set(wp.id,entry);
      }
      state.selected = selected; state.wpUpdates=wpUpdates; state.selectedMonths = new Set(selectedMonths); $('report-start').value = p?.start || r.reporting_period?.start || ''; $('report-end').value = p?.end || r.reporting_period?.end || ''; renderOverview();
    } else {
      if (!r.form_state?.fields || typeof r.form_state.fields !== 'object' || !Array.isArray(r.form_state.events) || r.form_state.events.length > 100 || r.form_state.events.some(e=>!e || typeof e.description !== 'string' || typeof e.participants !== 'string' || e.description.length > 100000 || e.participants.length > 100)) throw new Error('Communication draft is incomplete.');
      const fields = r.form_state.fields;
      for (const control of commForm.querySelectorAll('input[name], textarea[name], select[name]')) { const answer = fields[control.name]; if (answer !== undefined && (typeof answer !== 'string' || answer.length > 100000 || (control.type === 'radio' && !['yes','no'].includes(answer)))) throw new Error('Invalid draft field.'); }
      commForm.reset(); $('comm-events-list').replaceChildren();
      for (const control of commForm.querySelectorAll('input[name], textarea[name], select[name]')) { const answer = fields[control.name]; if (answer === undefined) continue; if (control.type === 'radio') control.checked = control.value === answer; else control.value = answer; }
      $('comm-events-list').replaceChildren(); for (const e of (r.form_state.events || []).slice(0,100)) addEvent(String(e.description || ''),String(e.participants || ''));
      $('comm-reach-unknown').checked = !!r.form_state.reach_unknown; $('comm-enrolments-unknown').checked = !!r.form_state.enrolments_unknown; updateConditions();
    }
    state.contributor = { ...r.contributor }; $('contributor-name').value = r.contributor.name; $('contributor-role').value = r.contributor.role; $('contributor-email').value = r.contributor.email; $('contributor-summary').textContent = `${state.partner.name} · ${r.contributor.name}`;
    state.revision = Number.isInteger(r.revision) && r.revision >= 1 && r.revision <= 99 ? r.revision : 1; $('report-revision').value = String(state.revision);
    message('Whole-report draft loaded. Review the dates, selected Tasks and answers.'); scrollTo(state.reportType === 'tasks' ? $('task-picker') : commForm);
  }
  function reviewItem(label, content) { const el = textNode('div','','review-item');const dd=textNode('dd',content === null || content === undefined || content === '' ? 'Not provided' : typeof content === 'boolean' ? (content ? 'Yes' : 'No') : Array.isArray(content) ? (content.length ? content.join('\n') : 'None') : String(content));if(label==='Revision')dd.id='review-revision-display';el.append(textNode('dt',label),dd); return el; }
  function reviewGroup(parent, title, pairs) { parent.append(textNode('h3',title,'review-section-title')); const dl = textNode('dl','','review-grid'); for (const [label,content] of pairs) dl.append(reviewItem(label,content)); parent.append(dl); }
  const assessmentLabel = status => ({ on_track:'On track', at_risk:'At risk', delayed:'Delayed', completed:'Completed', unavailable:'Update unavailable' })[status] || 'No assessment';
  function showReview(r) {
    const host = $('review-content'); host.replaceChildren();
    reviewGroup(host,'Report details',[['Partner',`${r.partner.name} (${r.partner.code})`],['Contributor',`${r.contributor.name} · ${r.contributor.role} · ${r.contributor.email}`],['Period',`${r.reporting_period.start} to ${r.reporting_period.end}`],...(r.report_type === 'tasks' ? [['Selected months',r.reporting_period.selected_months.join(', ')]] : []),['Revision',`v${r.revision}`],['Report key',r.report_key]]);
    if (r.report_type === 'tasks') {
      for (const item of r.tasks) { const a = item.answers; reviewGroup(host,`${item.id} — ${item.title}`,[['Work Package',item.work_package],['Your role',item.partner_role === 'Task lead (COO)' ? 'Task leader' : item.partner_role === 'Task responsibility to confirm' ? 'Responsibility to confirm' : 'Task participant'],['Task leader',item.task_lead || 'Not specified in the Agreement'],['Work reported',item.work_status === 'no_work' ? 'No work carried out' : 'Contribution completed'],['Task coverage',`${item.coverage.start} to ${item.coverage.end}`],['Task months',item.coverage.months.join(', ')],...(item.work_status === 'no_work' ? [] : [['Activities carried out',a.activities_carried_out],['Results achieved',a.results_achieved],['Difficulties encountered',a.difficulties_encountered],...(state.partner.kind === 'associated_partner' ? [] : [['Raw costs',`${a.raw_costs_incurred.amount === null ? 'Not provided' : `${a.raw_costs_incurred.amount} EUR`}${a.raw_costs_incurred.note ? ` · ${a.raw_costs_incurred.note}` : ''}`]]),['Upcoming activities',a.upcoming_activities],['Additional comments',a.additional_comments],['Significant issue',a.significant_issue],['Severity',a.severity],['Coordinator action required',a.coordinator_action_required],['Support requested',a.coordinator_support_request]])]); }
      for(const wp of r.work_package_leadership || []) {reviewGroup(host,`${wp.id} — ${wp.title} · leadership update`,[['Leader',wp.leader],['Selected months',wp.coverage.months.join(', ')],['Work declared',wp.work_status === 'no_work' ? 'No Work Package work carried out' : 'Leadership update completed'],...(wp.work_status === 'no_work' ? [] : [['Progress and achievements',wp.answers.progress],['Coordination and integration',wp.answers.coordination],['Difficulties and dependencies',wp.answers.difficulties],['Next priorities',wp.answers.next],['Support needed',wp.answers.support]])]);if(wp.work_status !== 'no_work')for(const row of wp.task_updates)reviewGroup(host,`${row.id} — Work Package leader assessment`,[['Status',assessmentLabel(row.status)],['Progress',row.progress],['Blocker',row.blocker],['Next action',row.next]]);}
    }
    else { const a = r.answers; reviewGroup(host,'Communication activities',[['Events organised',a.events_organised],['Events',a.events.map(x => `${x.description} (${x.participants} participants)`)],['Media outreach',a.media_outreach],['Journalists contacted',a.journalists_contacted],['Media outlets contacted',a.media_outlets_contacted],['Media details',a.media_details],['Website articles published',a.website_articles_published],['Website articles',a.website_articles.map(x => `${x.url}${x.details ? ` · ${x.details}` : ''}`)],['Social posts',a.social_posts_count],['Social links',a.social_post_urls],['Social details',a.social_details],['Email/newsletter sent',a.email_or_newsletter_sent],['Estimated recipients',a.estimated_recipients],['Email details',a.email_details],['Other activities',a.other_activities_or_materials],['Estimated reach',a.estimated_people_reached],['Pre-registrations/enrolments',a.preregistrations_or_enrolments],['Coordinator support required',a.coordinator_support_required],['Support requested',a.coordinator_support_request]]); }
    $('review-revision').value=String(r.revision);$('confirm-ready').checked = false; $('generate-submission').disabled = true; $('generation-error').hidden = true;
    $('report-workspace').hidden = true; $('review-section').hidden = false; $('submission-section').hidden = true; scrollTo($('review-section')); $('review-title').focus({preventScroll:true});
  }
  $('review-report').addEventListener('click', () => { if (!validate()) return; state.reviewed = record('submission'); showReview(state.reviewed); });
  function reviewRevisionValid(){const n=Number(value('review-revision'));return Number.isInteger(n)&&n>=1&&n<=99;}
  $('review-revision').addEventListener('input',()=>{if(!reviewRevisionValid()){$('generation-error').textContent='Enter a revision number from 1 to 99.';$('generation-error').hidden=false;$('generate-submission').disabled=true;return;}const n=Number(value('review-revision'));state.revision=n;state.reviewed.revision=n;$('report-revision').value=String(n);$('review-revision-display').textContent=`v${n}`;$('generation-error').hidden=true;$('generate-submission').disabled=!$('confirm-ready').checked;});
  $('confirm-ready').addEventListener('change', () => { $('generate-submission').disabled = !$('confirm-ready').checked||!reviewRevisionValid(); });
  $('back-to-form').addEventListener('click', () => { $('review-section').hidden = true; $('report-workspace').hidden = false; scrollTo(state.reportType === 'tasks' ? $('task-picker') : commForm); });
  $('generate-submission').addEventListener('click', async () => {
    if (!$('confirm-ready').checked || !state.reviewed || !reviewRevisionValid()) return;
    const button = $('generate-submission'); button.disabled = true; button.textContent = 'Generating…'; $('generation-error').hidden = true;
    try {
      const r = { ...state.reviewed, generated_at: new Date().toISOString() };
      const [pdf,json] = await Promise.all([window.SECRETT_PDF.createPdf(r),Promise.resolve(new Blob([JSON.stringify(r,null,2)],{type:'application/json'}))]);
      for (const url of state.urls) URL.revokeObjectURL(url); state.urls = [];
      const base = filename(r,false); $('download-pdf').href = urlFor(pdf); $('download-pdf').download = `${base}.pdf`; $('download-json').href = urlFor(json); $('download-json').download = `${base}.json`;
      $('submission-summary').textContent = `${r.partner.code} · ${r.report_type === 'tasks' ? `${r.tasks.length} ${r.tasks.length === 1 ? 'Task' : 'Tasks'} · ${r.work_package_leadership.length} Work Package ${r.work_package_leadership.length === 1 ? 'update' : 'updates'}` : 'Communication & Dissemination'} · ${r.reporting_period.start} to ${r.reporting_period.end}`;
      $('review-section').hidden = true; $('submission-section').hidden = false; scrollTo($('submission-section')); $('submission-title').focus({preventScroll:true});
    } catch (error) { $('generation-error').textContent = `Could not generate files: ${error.message}`; $('generation-error').hidden = false; }
    finally { button.textContent = 'Generate report files'; button.disabled = !$('confirm-ready').checked; }
  });
  $('back-after-generation').addEventListener('click', () => { $('submission-section').hidden = true; $('report-workspace').hidden = false; scrollTo(state.reportType === 'tasks' ? $('task-picker') : commForm); });
})();
