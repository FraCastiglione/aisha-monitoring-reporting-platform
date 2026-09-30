(function () {
  'use strict';
  const host = document.getElementById('dashboard-content');
  const config = window.AISHA_CONFIG;
  const agreement = window.AISHA_AGREEMENT;
  const model = window.AISHA_MODEL;
  const view = { tab: 'overview', overviewDetail: null, selectedWp: 'WP1', ganttMonth: 6, ganttExpanded: new Set(), ganttLarge: false, calendarDay: null, draftDay: 1, reportingMode: 'tasks', partnerKind: 'all', from: 1, through: 5, wp: 'all', search: '', kpiLens:'objectives', kpiGroup: 'all', risk: 'all', dueThrough: 6 };
  let catalogue, snapshot, agreementDetail;
  const el = (tag, className = '', value) => { const item = document.createElement(tag); if (className) item.className = className; if (value !== undefined) item.textContent = value; return item; };
  const month = number => { const start=new Date(`${config.project.startDate.slice(0,7)}-01T00:00:00Z`);start.setUTCMonth(start.getUTCMonth()+number-1);return `${start.getUTCFullYear()}-${String(start.getUTCMonth()+1).padStart(2,'0')}`; };
  const monthEnd = number => { const value=month(number),[year,part]=value.split('-').map(Number);return `${value}-${String(new Date(Date.UTC(year,part,0)).getUTCDate()).padStart(2,'0')}`; };
  const reviewWindows=[{id:'RP1',covered:'M01–M18',end:18,months:[19,20]},{id:'RP2',covered:'M19–M36',end:36,months:[37,38]},{id:'RP3',covered:'M37–M48',end:48,months:[49,50]}];
  const monthCode = number => `M${String(number).padStart(2, '0')}`;
  const monthName = number => new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month(number)}-01T00:00:00Z`));
  const monthList = months => months.length ? months.map(value => monthCode(model.projectMonth(config, value))).join(', ') : '—';
  const partnerName = code => config.partners.find(item => item.code === code)?.name || code;
  const activeMonths = item => Array.from({length: view.through - view.from + 1}, (_, i) => view.from + i).filter(number => model.active(item, number)).map(month);
  const reportRows = () => Array.isArray(snapshot.reporting_records) ? snapshot.reporting_records : [];
  const taskRows = (task, partner) => reportRows().filter(row => row.kind === 'task' && row.id === task.id && row.partner === partner && row.coverage?.months?.some(value => activeMonths(task).includes(value)));
  const wpRows = (wp, partner) => reportRows().filter(row => row.kind === 'work_package' && row.id === wp.id && row.partner === partner && row.coverage?.months?.some(value => activeMonths(wp).includes(value)));
  const selectedCoverage = rows => [...new Set(rows.flatMap(row => row.coverage.months).filter(value => model.projectMonth(config, value) >= view.from && model.projectMonth(config, value) <= view.through))].sort();
  const knownState = record => record?.state || null;
  const sourceNote = () => `Agreement schedule and formal assignments · Attachment 6 voluntary associated-partner commitments · Status update: ${snapshot.status_source || 'not supplied'} · Status last supplied ${snapshot.status_as_of || snapshot.as_of || 'date not supplied'}${snapshot.status_as_of && snapshot.status_as_of !== snapshot.as_of ? ` · Snapshot prepared ${snapshot.as_of}` : ''}`;
  function pill(text, tone = 'neutral') { return el('span', `dash-pill ${tone}`, text); }
  function header(title, description) { const wrap = el('div', 'dash-section-head'); wrap.append(el('h2', '', title)); if (description) wrap.append(el('p', '', description)); return wrap; }
  function card(label, value, note, tone, action) { const item = el('button', `dash-stat ${tone}`); item.type='button'; item.setAttribute('aria-label', `${label}: ${value}. ${note}. Open full details`); item.append(el('span', '', label), el('strong', '', value), el('small', '', note), el('em', '', 'View details →')); item.addEventListener('click', action); return item; }
  const confirmedDeliverable = item => ['submitted','accepted'].includes(knownState(snapshot.deliverable_status?.[item.id]));
  const confirmedMilestone = item => knownState(snapshot.milestone_status?.[item.id]) === 'achieved';
  const upcomingMonth = (due, current) => due > current && due <= Math.min(48,current + 6);
  function openOverviewDetail(kind) { view.overviewDetail=kind; render(); document.getElementById('dash-overview-detail')?.scrollIntoView({block:'start',behavior:'smooth'}); }
  function switchTab(key) { view.tab=key; render(); host.scrollIntoView({block:'start',behavior:'smooth'}); }
  function select(label, options, selected, change) {
    const wrap = el('label', 'dash-control'); wrap.append(el('span', '', label)); const input = el('select');
    for (const [value, text] of options) { const option = el('option', '', text); option.value = value; option.selected = String(value) === String(selected); input.append(option); }
    input.addEventListener('change', () => change(input.value)); wrap.append(input); return wrap;
  }
  function detail(label, content, className = '') { const block = el('details', `dash-detail ${className}`); block.append(el('summary', '', label), content); return block; }
  function empty(message) { return el('p', 'dash-empty', message); }
  function recordDetail(row) { return `${row.work_status === 'no_work' ? 'No work declared' : 'Contribution reported'} · ${row.coverage.start}–${row.coverage.end} · ${monthList(row.coverage.months)} · ${row.report_status.replaceAll('_', ' ')}`; }
  function overview() {
    const current = model.projectMonth(config, snapshot.snapshot_month);
    const submitted = catalogue.deliverables.filter(confirmedDeliverable);
    const due = catalogue.deliverables.filter(item => item.due <= current);
    const achieved = catalogue.milestones.filter(confirmedMilestone);
    const milestoneDue = catalogue.milestones.filter(item => item.due <= current);
    const activeWp = config.workPackages.filter(item => model.active(item, current));
    const section = el('section', 'dash-overview');
    if ((snapshot.intake?.rejected_files || 0) + (snapshot.intake?.unconfirmed_files || 0) > 0) {
      const note=el('div','dash-state-note');note.append(el('strong','','Coordinator intake needs reconciliation'),el('p','',`${snapshot.intake.rejected_files || 0} rejected and ${snapshot.intake.unconfirmed_files || 0} unconfirmed files were excluded from this snapshot. Check the private intake log before treating partner coverage as complete.`));section.append(note);
    }
    const hero = el('div', 'dash-hero'), heroCopy = el('div', 'dash-hero-copy'), heroPosition = el('div', 'dash-hero-position');
    heroCopy.append(el('p', 'dash-hero-kicker', `PROJECT SNAPSHOT · ${monthName(current).toUpperCase()} · REPORTING PERIOD ${current <= 18 ? '1' : current <= 36 ? '2' : '3'}`), el('h2', '', 'AISHA at a glance'), el('p', '', 'See the commitments already reported, what is coming in the next six months, and each Work Package’s place in the timeline.'));
    const positionLabel = el('div', 'dash-position-label'); positionLabel.append(el('strong', '', monthCode(current)), el('span', '', 'of M48'));
    const progress = el('div', 'dash-progress-track'); const progressFill = el('span', 'dash-progress-fill'); progressFill.style.width = `${Math.min(100, current / 48 * 100)}%`; progress.append(progressFill);
    heroPosition.append(positionLabel, progress, el('small', '', 'Project calendar position · May 2026 to April 2030'));
    hero.append(heroCopy, heroPosition); section.append(hero);
    const stats = el('div', 'dash-stats');
    stats.append(
      card('Deliverables submitted', `${submitted.length} / ${catalogue.deliverables.length}`, `${due.filter(item => submitted.includes(item)).length} of ${due.length} due by ${monthCode(current)} submitted`, 'teal', () => openOverviewDetail('deliverables')),
      card('Milestones achieved', `${achieved.length} / ${catalogue.milestones.length}`, `${milestoneDue.filter(item => achieved.includes(item)).length} of ${milestoneDue.length} due by ${monthCode(current)} reported achieved`, 'blue', () => openOverviewDetail('milestones')),
      card('Work Packages active', `${activeWp.length} / ${config.workPackages.length}`, 'View all Work Packages, objectives, Tasks and reporting evidence', 'violet', () => switchTab('workpackages'))
    );
    section.append(stats);
    const boardPreview=el('section','dash-board-preview'),boardTop=el('div','dash-board-preview-top'),openBoard=el('button','dash-wp-open','Open message board →');openBoard.type='button';openBoard.addEventListener('click',()=>switchTab('messages'));boardTop.append(el('h3','','Message board'),openBoard);boardPreview.append(boardTop);
    const latest=[...(snapshot.messages||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,2);
    if(latest.length)for(const item of latest)boardPreview.append(el('p','',`${item.priority==='urgent'?'Urgent · ':''}${item.title} · ${item.date}`));else boardPreview.append(el('p','','No project messages have been published yet.'));
    section.append(boardPreview);
    if(view.overviewDetail) section.append(overviewDetailPanel(view.overviewDetail,current));
    const next = el('div', 'dash-next'),futureLabel=current>=48?'The 48-month Agreement schedule has ended.':`${monthName(current+1)}–${monthName(Math.min(48,current+6))} · ${monthCode(current+1)}–${monthCode(Math.min(48,current+6))}`;next.append(header('Upcoming in the next six months', futureLabel));
    const upcoming = [
      ...catalogue.deliverables.filter(item => upcomingMonth(item.due,current)).map(item => ({...item, type: 'Deliverable', state: knownState(snapshot.deliverable_status?.[item.id])})),
      ...catalogue.milestones.filter(item => upcomingMonth(item.due,current)).map(item => ({...item, type: 'Milestone', state: knownState(snapshot.milestone_status?.[item.id])})),
      ...config.workPackages.filter(item => upcomingMonth(item.startMonth,current)).map(item => ({...item, due:item.startMonth, wp:item.id, type:'Work Package begins', state:null})),
      ...config.tasks.filter(item => upcomingMonth(item.startMonth,current)).map(item => ({...item, due:item.startMonth, type:'Task begins', state:null}))
    ].sort((a,b)=>a.due-b.due||a.id.localeCompare(b.id,undefined,{numeric:true}));
    const nextGrid = el('div', 'dash-next-grid');
    for (const item of upcoming) { const row = el('div', 'dash-next-row'); const copy = el('div'); copy.append(el('small', '', `${monthCode(item.due)} · ${monthName(item.due)} · ${item.type} · ${item.wp}`), el('strong', '', `${item.id} · ${item.title}`)); row.append(copy, pill(item.state === 'submitted' ? 'Submitted early' : item.state === 'achieved' ? 'Achieved early' : item.type.endsWith('begins') ? 'Scheduled start' : 'Status not recorded', item.state ? 'positive' : item.type.endsWith('begins') ? 'neutral' : 'watch')); nextGrid.append(row); }
    if(!upcoming.length) nextGrid.append(empty('No deliverables or milestones are due in this six-month window.'));
    next.append(nextGrid); section.append(next);
    section.append(workPackageMap(current), el('p', 'dash-context-note', 'Submitted means sent, not accepted. Milestone achievements are coordinator-reported. Partner reporting remains unconfirmed until report records are added.'));
    section.append(el('p', 'dashboard-meta', sourceNote())); return section;
  }
  function overviewDetailPanel(kind,current) {
    const isDeliverable=kind==='deliverables', collection=isDeliverable?catalogue.deliverables:catalogue.milestones;
    const section=el('section','dash-overview-detail');section.id='dash-overview-detail';
    const head=el('div','dash-overview-detail-head'),copy=el('div'),close=el('button','dash-detail-close','Close ×');close.type='button';close.addEventListener('click',()=>{view.overviewDetail=null;render();});
    copy.append(el('span','dash-kpi-group','FULL AGREEMENT LIST'),el('h2','',isDeliverable?'All deliverables':'All milestones'),el('p','',isDeliverable?'Descriptions, leads, due months and submission status.':'Means of verification, leads, due months and achievement status.'));
    head.append(copy,close);section.append(head);
    const list=el('div','dash-commitment-list');
    for(const item of [...collection].sort((a,b)=>a.due-b.due||a.id.localeCompare(b.id,undefined,{numeric:true}))){
      const state=knownState((isDeliverable?snapshot.deliverable_status:snapshot.milestone_status)?.[item.id]);
      const block=el('details','dash-commitment-detail'),summary=el('summary',''),identity=el('div','dash-commitment-identity'),body=el('div','dash-commitment-body');
      identity.append(el('strong','',`${item.id} · ${item.title}`),el('small','',`${item.wp} · Lead ${item.lead} · Due ${monthCode(item.due)} (${monthName(item.due)})${item.visibility?` · ${item.visibility}`:''}`));
      summary.append(identity,pill(state==='submitted'?'Submitted':state==='accepted'?'Accepted':state==='achieved'?'Achieved':state?state.replaceAll('_',' '):upcomingMonth(item.due,current)?'Upcoming · next 6 months':'Status not recorded',state?'positive':upcomingMonth(item.due,current)?'watch':'neutral'));
      body.append(el('strong','',isDeliverable?'Agreement description':'Agreement means of verification'),el('p','',(isDeliverable?agreementDetail.deliverables:agreementDetail.milestones)[item.id]));
      const links=catalogue.commitment_links?.[item.id]||[];
      const related=el('div','dash-related-tasks');related.append(el('strong','',`Related Tasks · ${links.length}`));
      if(links.length) for(const link of links){const task=config.tasks.find(row=>row.id===link.task);if(!task)continue;const button=el('button','dash-related-task',`${task.id} · ${task.title} →`);button.type='button';button.addEventListener('click',()=>{view.selectedWp=task.wp;view.tab='workpackages';render();const target=document.getElementById(`dash-task-${task.id}`);if(target){target.open=true;target.scrollIntoView({block:'start',behavior:'smooth'});target.focus({preventScroll:true});}});related.append(button);if(link.basis?.startsWith('contextual'))related.append(el('small','','Contextual link: the Agreement does not explicitly name this Task as the milestone outcome.'));}
      else related.append(el('p','', 'No Task outcome link is stated in the Agreement text.'));
      body.append(related,el('small','',`Source: Grant Agreement, Annex 1 · ${isDeliverable?'Deliverables, PDF pp. 93–98':'Milestones, PDF pp. 99–101'}. Due dates are specified by project month.`));block.append(summary,body);list.append(block);
    }
    section.append(list);return section;
  }
  function workPackageMap(current) {
    const section = el('section', 'dash-wp-map'); section.append(header('Work Package map', 'What is active now, and what begins later in the 48-month project.'));
    const grid = el('div', 'dash-wp-grid');
    for (const wp of config.workPackages) {
      const item = el('div', `dash-wp-map-item ${model.active(wp, current) ? 'is-active' : 'is-future'}`), top = el('div', 'dash-wp-map-top'), text = el('div');
      text.append(el('strong', '', wp.id), el('span', '', wp.title)); top.append(text, pill(model.active(wp, current) ? 'Active' : 'Later', model.active(wp, current) ? 'positive' : 'neutral'));
      const track = el('div', 'dash-wp-track'), segment = el('span', 'dash-wp-segment'); segment.style.left = `${(wp.startMonth - 1) / 48 * 100}%`; segment.style.width = `${(wp.endMonth - wp.startMonth + 1) / 48 * 100}%`; track.append(segment);
      const open=el('button','dash-wp-open','View Work Package →');open.type='button';open.addEventListener('click',()=>{view.selectedWp=wp.id;switchTab('workpackages');});
      item.append(top, track, el('small', '', `${monthCode(wp.startMonth)}–${monthCode(wp.endMonth)} · Leader ${wp.lead}`),open); grid.append(item);
    }
    section.append(grid); return section;
  }
  function joinAgreementLines(lines) { return lines.map(line=>line.trim()).filter(Boolean).reduce((text,line)=>text?`${text}${/[\-/]$/.test(text)?'':' '}${line}`:line,''); }
  function agreementBlocks(raw) {
    const wrap=el('div','dash-agreement-copy');let lines=[],bulleted=false,list=null;
    const flush=()=>{if(!lines.length)return;const content=joinAgreementLines(lines);if(bulleted){if(!list){list=el('ul','');wrap.append(list);}list.append(el('li','',content.replace(/^(?:[▪●•]|-\s|\([ivx]+\)|(?:\d+\.)\s)\s*/i,'')));}else{list=null;wrap.append(el('p','',content));}lines=[];bulleted=false;};
    const heading=/^(?:Description:|Methods and Quality Assurance|Risks & mitigations|Intersections with other Work Packages|Specifically, WP5 aims to:|Expected outputs and outcomes include:|Feed forward loops and integration|Key activities include:)$/;
    for(const rawLine of raw.split('\n')){
      const line=rawLine.trim();if(!line){flush();continue;}
      if(heading.test(line)){flush();list=null;wrap.append(el('h4','',line));continue;}
      if(/^(?:[▪●•]|-\s|\([ivx]+\)|(?:\d+\.)\s)/i.test(line)){flush();lines=[line];bulleted=true;continue;}
      if(lines.length&&/[.!?;:]$/.test(lines.at(-1))&&/^[A-Z0-9]/.test(line)&&joinAgreementLines(lines).length>140)flush();
      lines.push(line);
    }
    flush();return wrap;
  }
  function completion(task) { return snapshot.task_progress?.[task.id]?.state==='completed'; }
  function workPackagesSection() {
    const current=model.projectMonth(config,snapshot.snapshot_month),section=el('section','dash-section dash-wp-directory');
    section.append(header('Work Packages','Explore all ten Work Packages, their Agreement objectives and Task descriptions. Reporting evidence and verified Task completion are shown separately.'));
    const grid=el('div','dash-wp-directory-grid');
    for(const wp of config.workPackages){
      const tasks=config.tasks.filter(task=>task.wp===wp.id),assessed=tasks.filter(task=>snapshot.task_progress?.[task.id]),completed=tasks.filter(completion),reported=tasks.filter(task=>reportRows().some(row=>row.kind==='task'&&row.id===task.id));
      const item=el('button',`dash-wp-directory-card ${view.selectedWp===wp.id?'is-selected':''}`);item.type='button';item.setAttribute('aria-pressed',String(view.selectedWp===wp.id));
      item.append(el('span','dash-wp-directory-id',wp.id),el('strong','',wp.title),el('small','',`${monthCode(wp.startMonth)}–${monthCode(wp.endMonth)} · ${model.active(wp,current)?'Active now':'Begins later'}`));
      const metrics=el('div','dash-wp-directory-metrics');metrics.append(el('span','',assessed.length?`${Math.round(completed.length/tasks.length*100)}% verified complete`:'Completion not assessed'),el('span','',wp.startMonth>current&&!reported.length?`Reporting begins ${monthCode(wp.startMonth)}`:`${reported.length}/${tasks.length} Tasks with report entries`));item.append(metrics);
      item.addEventListener('click',()=>{view.selectedWp=wp.id;render();document.getElementById('dash-wp-detail')?.scrollIntoView({block:'start',behavior:'smooth'});});grid.append(item);
    }
    section.append(grid,workPackageDetail(config.workPackages.find(wp=>wp.id===view.selectedWp)||config.workPackages[0]));return section;
  }
  function workPackageDetail(wp) {
    const tasks=config.tasks.filter(task=>task.wp===wp.id),assessed=tasks.filter(task=>snapshot.task_progress?.[task.id]),completed=tasks.filter(completion),reported=tasks.filter(task=>reportRows().some(row=>row.kind==='task'&&row.id===task.id));
    const section=el('section','dash-wp-detail-panel');section.id='dash-wp-detail';
    const top=el('div','dash-wp-detail-top');top.append(el('span','dash-kpi-group',`${wp.id} · GRANT AGREEMENT, ANNEX 1, PDF P. ${wp.sourcePage}`),el('h2','',wp.title),el('p','',`Work Package leader: ${partnerName(wp.lead)} (${wp.lead}) · Active ${monthCode(wp.startMonth)}–${monthCode(wp.endMonth)} (${monthName(wp.startMonth)}–${monthName(wp.endMonth)})`));section.append(top);
    const score=el('div','dash-wp-score');score.append(el('div','','Verified Task completion'),el('strong','',assessed.length?`${Math.round(completed.length/tasks.length*100)}%`:'Not assessed'),el('small','',assessed.length?`${completed.length} of ${tasks.length} Tasks marked complete; ${tasks.length-assessed.length} without a status.`:`No Task completion assessments recorded for these ${tasks.length} Tasks.`));
    const reportScore=el('div','dash-wp-score');reportScore.append(el('div','','Task reporting evidence'),el('strong','',`${reported.length} / ${tasks.length}`),el('small','','Tasks with at least one coordinator-confirmed partner entry; this is not a completion rate.'));
    const scores=el('div','dash-wp-scores');scores.append(score,reportScore);section.append(scores);
    section.append(el('h3','','Work Package objectives'),agreementBlocks(agreement.workPackages[wp.id].objectives));
    const work=el('div','dash-wp-detail-columns'),taskColumn=el('div'),outputColumn=el('div');taskColumn.append(el('h3','',`Tasks · ${tasks.length}`));
    for(const task of tasks){
      const rows=reportRows().filter(row=>row.kind==='task'&&row.id===task.id),assigned=config.partners.filter(partner=>model.assigned(task,partner.code,config)),details=el('details','dash-wp-task'),summary=el('summary',''),body=el('div','dash-wp-task-body');details.id=`dash-task-${task.id}`;details.tabIndex=-1;
      const implementation=snapshot.task_progress?.[task.id]?.state;
      summary.append(el('strong','',`${task.id} · ${task.title}`),el('small','',`${monthCode(task.startMonth)}–${monthCode(task.endMonth)} · Lead ${task.lead} · ${new Set(rows.map(row=>row.partner)).size}/${assigned.length} partners with entries · Completion ${implementation?implementation.replaceAll('_',' '):'not assessed'}`));
      body.append(el('p','dash-record-note',`Task leader: ${partnerName(task.lead)} (${task.lead}) · Source: PDF p. ${task.sourcePage}. ${task.timingBasis==='work_package'?'Task timing inherits the Work Package window.':''}`));
      const raw=agreement.tasks[task.id]?.agreementText||'',parts=raw.split('\n'),descriptionIndex=parts.findIndex((line,i)=>i>0&&line.trim()==='Description:'),participants=descriptionIndex>=0?parts.slice(1,descriptionIndex):parts.slice(1,2);
      body.append(el('h4','','Task participants'),el('p','dash-task-participants',joinAgreementLines(participants).replace(/^Participants:\s*/,'')),el('h4','','Agreement Task description'),agreementBlocks((descriptionIndex>=0?parts.slice(descriptionIndex+1):parts.slice(2)).join('\n')));
      if(rows.length)body.append(el('p','dash-record-note',`Confirmed partner entries: ${rows.map(row=>`${row.partner} (${monthList(row.coverage.months)})`).join('; ')}.`));
      details.append(summary,body);taskColumn.append(details);
    }
    for(const [name,collection,status] of [['Deliverables',catalogue.deliverables,snapshot.deliverable_status],['Milestones',catalogue.milestones,snapshot.milestone_status]]){
      const group=el('div','dash-wp-outputs');group.append(el('h3','',`${name} · ${collection.filter(item=>item.wp===wp.id).length}`));
      for(const item of collection.filter(item=>item.wp===wp.id).sort((a,b)=>a.due-b.due)){
        const row=el('details','dash-wp-output-row'),summary=el('summary','');summary.append(el('strong','',`${item.id} · ${item.title}`),el('small','',`Due ${monthCode(item.due)} (${monthName(item.due)}) · Lead ${item.lead}`),pill(knownState(status?.[item.id])?.replaceAll('_',' ')||'Status not recorded',knownState(status?.[item.id])?'positive':'neutral'));row.append(summary,el('p','',name==='Deliverables'?agreementDetail.deliverables[item.id]:agreementDetail.milestones[item.id]));const links=catalogue.commitment_links?.[item.id]||[];if(links.length)row.append(el('p','dash-record-note',`Related Tasks: ${links.map(link=>link.task).join(', ')}${links.some(link=>link.basis?.startsWith('contextual'))?' (MS21 link is contextual)':''}.`));group.append(row);
      }
      outputColumn.append(group);
    }
    work.append(taskColumn,outputColumn);section.append(work);return section;
  }
  function ganttSection() {
    const section=el('section',`dash-section dash-gantt ${view.ganttLarge?'is-large':''}`);
    section.append(header('Project Gantt','The 48-month project schedule, followed by two closeout months for the final Technical Progress Report. Choose a month for its calendar, or expand a Work Package to see its Tasks.'));
    const tools=el('div','dash-gantt-tools');
    const enlarge=el('button','dash-gantt-expand',view.ganttLarge?'Use normal width':'Expand Gantt');enlarge.type='button';enlarge.addEventListener('click',()=>{view.ganttLarge=!view.ganttLarge;render();});tools.append(enlarge);
    const expand=el('button','dash-gantt-expand',view.ganttExpanded.size===config.workPackages.length?'Hide all Task rows':'Show all Task rows');expand.type='button';expand.addEventListener('click',()=>{view.ganttExpanded=view.ganttExpanded.size===config.workPackages.length?new Set():new Set(config.workPackages.map(wp=>wp.id));render();});tools.append(expand);section.append(tools);
    const legend=el('div','dash-gantt-legend');for(const [tone,label] of [['wp','Work Package active'],['task','Task active'],['review','Technical Progress Report preparation'],['selected','Selected month'],['draft','Internal review draft'],['due','Official deadline'],['event','Project event']]){const item=el('span','');item.append(el('i',tone),label);legend.append(item);}section.append(legend);
    const scroller=el('div','dash-gantt-scroll'),matrix=el('div','dash-gantt-matrix'),head=el('div','dash-gantt-row dash-gantt-header');head.append(el('div','dash-gantt-label','WORK PACKAGE / TASK'));
    const months=Array.from({length:50},(_,i)=>month(i+1));
    matrix.style.setProperty('--gantt-months',String(months.length));
    for(const [index,calendar] of months.entries()){
      const number=index+1,cell=el('button',`dash-gantt-month ${number===view.ganttMonth?'is-selected':''} ${number>48?'is-closeout':''}`);cell.type='button';
      cell.append(el('strong','',new Intl.DateTimeFormat('en',{month:'short',timeZone:'UTC'}).format(new Date(`${calendar}-01T00:00:00Z`))),el('small','',number?monthCode(number):'—'));
      {const count=catalogue.deliverables.filter(item=>item.due===number).length+catalogue.milestones.filter(item=>item.due===number).length,reportDue=(snapshot.task_report_deadlines||[]).filter(item=>item.due_date?.startsWith(calendar)).length,reported=reportRows().filter(row=>row.kind==='task'&&row.coverage?.months?.includes(calendar)).length,events=(snapshot.project_events||[]).filter(item=>item.start_date?.slice(0,7)===calendar),review=reviewWindows.find(item=>item.months.includes(number));if(count)cell.append(el('span','dash-gantt-due-count',`${count} due`));if(reportDue)cell.append(el('span','dash-gantt-report-count',`${reportDue} Task due`));if(reported)cell.append(el('span','dash-gantt-report-count',`${reported} report${reported===1?'':'s'}`));if(review)cell.append(el('span','dash-gantt-review-count',`${review.id} review`));if(events.length){cell.append(el('span','dash-gantt-event-count',`${events.length} event`));for(const event of events){const marker=el('span','dash-project-event-marker');marker.style.left=`${(Number(event.start_date.slice(-2))-.5)/Number(monthEnd(number).slice(-2))*100}%`;marker.setAttribute('aria-label',`${event.title} · ${event.start_date}–${event.end_date}`);cell.append(marker);}}cell.addEventListener('click',()=>{view.ganttMonth=number;view.calendarDay=null;render();document.getElementById('dash-calendar')?.scrollIntoView({block:'start',behavior:'smooth'});});}
      head.append(cell);
    }
    matrix.append(head);
    for(const window of reviewWindows){const row=el('div','dash-gantt-row dash-review-row'),label=el('div','dash-gantt-label');label.append(el('strong','',window.id),el('span','','Technical Progress Report'));row.append(label);for(let number=1;number<=50;number++){const active=window.months.includes(number),end=window.end===number,cell=el('div',`dash-gantt-cell ${active?'is-review':''} ${end?'is-period-end':''} ${number===view.ganttMonth?'is-selected':''}`);cell.dataset.tooltip=`${window.id} · ${monthCode(number)} · ${monthName(number)}\n${end?`Reporting period closes: ${window.covered} · ${monthEnd(number)}`:active?`Technical Progress Report preparation for ${window.covered}. Consolidate partner monitoring, results and outputs.${number===window.months[1]?' Planned completion by month end.':''}`:'Outside this reporting period review window.'}`;if(active||end)cell.tabIndex=0;row.append(cell);}matrix.append(row);}
    for(const wp of config.workPackages){
      matrix.append(ganttRow(wp,false,months));
      if(view.ganttExpanded.has(wp.id))for(const task of config.tasks.filter(task=>task.wp===wp.id))matrix.append(ganttRow(task,true,months));
    }
    scroller.append(matrix);installGanttTooltip(scroller,section);requestAnimationFrame(()=>{if(scroller.isConnected&&scroller.scrollWidth>scroller.clientWidth){scroller.scrollLeft=Math.max(0,(view.ganttMonth-1)*(matchMedia('(max-width:700px)').matches?64:71)-20);}});section.append(scroller,el('p','dash-gantt-hint','Choose a month above for its calendar. Select a Work Package row to expand its Tasks. Scroll horizontally through the reporting and closeout months.'));
    section.append(calendarSection(view.ganttMonth));return section;
  }
  function ganttRow(item,isTask,months){
    const row=el('div',`dash-gantt-row ${isTask?'is-task':'is-wp'}`),label=el('button','dash-gantt-label','');label.type='button';label.append(el('strong','',item.id),el('span','',item.title));
    if(isTask){label.addEventListener('click',()=>{view.selectedWp=item.wp;view.tab='workpackages';render();const target=document.getElementById(`dash-task-${item.id}`);if(target){target.open=true;target.scrollIntoView({block:'start',behavior:'smooth'});}});label.title=`Open ${item.wp} Task details`;}else{label.setAttribute('aria-expanded',String(view.ganttExpanded.has(item.id)));label.addEventListener('click',()=>{view.ganttExpanded.has(item.id)?view.ganttExpanded.delete(item.id):view.ganttExpanded.add(item.id);render();});label.title=`${view.ganttExpanded.has(item.id)?'Hide':'Show'} Tasks in ${item.id}`;}
    row.append(label);
    for(const [index,calendar] of months.entries()){const number=index+1,active=number<=48&&model.active(item,number),cell=el('div',`dash-gantt-cell ${active?'is-active':''} ${number===view.ganttMonth?'is-selected':''} ${number>48?'is-closeout':''}`);const deadlines=number<=48?rowDeadlines(item,isTask,number):[],events=(snapshot.project_events||[]).filter(event=>event.start_date?.slice(0,7)===calendar);cell.dataset.tooltip=`${item.id} · ${monthCode(number)} · ${monthName(number)}\n${active?'Active in this month':number>48?'After the 48-month project schedule':'Outside this activity window'}${deadlines.length?'\n'+deadlines.map(entry=>entry.label).join('\n'):''}${events.length?'\nProject event: '+events.map(event=>event.title).join(', '):''}`;cell.setAttribute('aria-label',cell.dataset.tooltip.replaceAll('\n','. '));if(active||deadlines.length||events.length)cell.tabIndex=0;for(const entry of deadlines){const marker=el('span',`dash-deadline-marker ${entry.type}`);marker.setAttribute('aria-label',entry.label);cell.append(marker);}for(const event of events){const marker=el('span','dash-project-event-marker');marker.style.left=`${(Number(event.start_date.slice(-2))-.5)/Number(monthEnd(number).slice(-2))*100}%`;marker.setAttribute('aria-label',`${event.title} · ${event.start_date}–${event.end_date}`);cell.append(marker);}row.append(cell);}
    return row;
  }
  function installGanttTooltip(scroller,section){
    const popup=el('div','dash-gantt-tooltip');popup.id='dash-gantt-tooltip';popup.setAttribute('role','tooltip');popup.hidden=true;section.append(popup);
    let target=null;
    const place=(x,y)=>{const width=300,height=popup.getBoundingClientRect().height||105;popup.style.left=`${Math.min(innerWidth-width-12,Math.max(12,x+16))}px`;popup.style.top=`${y+height+18<innerHeight?y+16:Math.max(12,y-height-12)}px`;};
    const show=(cell,x,y)=>{if(!cell?.dataset.tooltip)return;target=cell;popup.replaceChildren();const lines=cell.dataset.tooltip.split('\n');popup.append(el('strong','',lines.shift()));for(const line of lines)popup.append(el('span','',line));popup.hidden=false;place(x,y);};
    const hide=()=>{popup.hidden=true;target=null;};
    scroller.addEventListener('pointerover',event=>{const cell=event.target.closest('.dash-gantt-cell[data-tooltip]');if(cell&&cell!==target)show(cell,event.clientX,event.clientY);});
    scroller.addEventListener('pointermove',event=>{if(target)place(event.clientX,event.clientY);});
    scroller.addEventListener('pointerout',event=>{if(target&&!target.contains(event.relatedTarget))hide();});
    scroller.addEventListener('focusin',event=>{const cell=event.target.closest('.dash-gantt-cell[data-tooltip]');if(cell){const rect=cell.getBoundingClientRect();show(cell,rect.left+rect.width/2,rect.top+rect.height/2);}});
    scroller.addEventListener('focusout',hide);scroller.addEventListener('scroll',hide);
  }
  function rowDeadlines(item,isTask,number){
    const relevant=entry=>isTask?(catalogue.commitment_links?.[entry.id]||[]).some(link=>link.task===item.id):entry.wp===item.id;
    const commitments=[...catalogue.deliverables.map(entry=>({...entry,kind:'Deliverable'})),...catalogue.milestones.map(entry=>({...entry,kind:'Milestone'}))].filter(relevant);
    const reports=(snapshot.task_report_deadlines||[]).filter(entry=>isTask?entry.id===item.id:config.tasks.some(task=>task.id===entry.id&&task.wp===item.id));
    const markers=[];
    for(const entry of commitments.filter(entry=>entry.due===number)){markers.push({type:'draft',label:`Internal draft: ${entry.id} (${entry.kind}) · 1 ${monthName(number)}`},{type:'due',label:`Official deadline: ${entry.id} (${entry.kind}) · ${model.periodForMonth(config,month(number)).end}`});}
    for(const entry of reports){const dueNumber=model.projectMonth(config,entry.due_date?.slice(0,7)),day=Number(entry.due_date?.slice(-2));if(dueNumber===number)markers.push({type:'due',label:`Task report deadline: ${entry.id} · ${entry.due_date}`});if((day>1?dueNumber:dueNumber-1)===number)markers.push({type:'draft',label:`Internal Task report draft: ${entry.id} · 1 ${monthName(number)}`});}
    return ['draft','due'].map(type=>{const matching=markers.filter(entry=>entry.type===type);return matching.length?{type,label:matching.map(entry=>entry.label).join('; ')}:null;}).filter(Boolean);
  }
  function calendarEvents(number){
    const calendar=month(number),last=Number(monthEnd(number).slice(-2)),events=[];
    for(const [kind,collection,status] of [['Deliverable',catalogue.deliverables,snapshot.deliverable_status],['Milestone',catalogue.milestones,snapshot.milestone_status]]){
      for(const item of collection.filter(item=>item.due===number)){
        const state=knownState(status?.[item.id]);events.push({day:view.draftDay,type:'draft',label:`Internal review draft · ${item.id}`,detail:`${kind}: ${item.title}`,state});
        events.push({day:last,type:'agreement',label:`Official deadline · ${item.id}`,detail:`${kind}: ${item.title}`,state});
      }
    }
    for(const item of snapshot.task_report_deadlines||[]){
      if(!/^\d{4}-\d{2}-\d{2}$/.test(item.due_date||''))continue;
      const dueMonth=item.due_date.slice(0,7),dueNumber=model.projectMonth(config,dueMonth),day=Number(item.due_date.slice(-2));
      const prior=dueNumber>1?month(dueNumber-1):null;
      const plannedDraft=day>1?`${dueMonth}-01`:prior?`${prior}-01`:null;
      if(plannedDraft?.slice(0,7)===calendar)events.push({day:Number(plannedDraft.slice(-2)),type:'draft',label:`Internal review draft · ${item.id}`,detail:`Task report${item.partner?` · ${item.partner}`:''}`});
      if(dueMonth===calendar)events.push({day,type:'report',label:`Task report due · ${item.id}`,detail:item.partner?`Partner ${item.partner}`:'Coordinator scheduled'});
    }
    for(const item of snapshot.project_events||[]){
      if(item.start_date?.slice(0,7)!==calendar)continue;
      const start=Number(item.start_date.slice(-2)),end=item.end_date?.slice(0,7)===calendar?Number(item.end_date.slice(-2)):start;
      for(let day=start;day<=end;day++)events.push({day,type:'event',label:item.title,detail:`${item.location||'Project event'} · ${item.start_date}–${item.end_date}`});
    }
    const closing=reviewWindows.find(item=>item.end===number);
    if(closing)events.push({day:last,type:'period',label:`${closing.id} reporting period closes`,detail:`Activities through ${closing.covered} form the basis of the next Technical Progress Report.`});
    const review=reviewWindows.find(item=>item.months.includes(number));
    if(review){events.push({day:1,type:'review',label:`${review.id} Technical Progress Report preparation`,detail:`Consolidate partner monitoring, results and outputs for ${review.covered}. Coordination planning window.`});if(number===review.months[1])events.push({day:last,type:'review',label:`${review.id} planned report completion`,detail:'Coordination planning target at the end of this month; not an Agreement deliverable due date.'});}
    return events.sort((a,b)=>a.day-b.day||a.label.localeCompare(b.label));
  }
  function calendarSection(number){
    const calendar=month(number),last=Number(monthEnd(number).slice(-2)),firstWeekday=(new Date(`${calendar}-01T00:00:00Z`).getUTCDay()+6)%7,events=calendarEvents(number),section=el('section','dash-calendar');section.id='dash-calendar';
    const top=el('div','dash-calendar-top'),copy=el('div'),navigation=el('div','dash-calendar-nav');copy.append(el('span','dash-kpi-group',`${monthCode(number)} · ${number>48?'POST-PROJECT CLOSEOUT':'PROJECT CALENDAR'}`),el('h2','',monthName(number)));
    for(const [sign,target,label] of [['−1',number-1,'Previous month'],['+1',number+1,'Next month']]){const button=el('button','',sign==='−1'?'←':'→');button.type='button';button.disabled=target<1||target>50;button.setAttribute('aria-label',label);button.addEventListener('click',()=>{view.ganttMonth=target;view.calendarDay=null;render();document.getElementById('dash-calendar')?.scrollIntoView({block:'start',behavior:'smooth'});});navigation.append(button);}
    top.append(copy,navigation);section.append(top);
    const body=el('div','dash-calendar-layout'),grid=el('div','dash-calendar-grid');
    for(const day of ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])grid.append(el('span','dash-calendar-weekday',day));
    for(let i=0;i<firstWeekday;i++)grid.append(el('span','dash-calendar-blank',''));
    for(let day=1;day<=last;day++){
      const dayEvents=events.filter(event=>event.day===day),button=el('button',`dash-calendar-day ${dayEvents.length?'has-events':''} ${view.calendarDay===day?'is-selected':''}`);button.type='button';button.setAttribute('aria-label',`${day} ${monthName(number)}${dayEvents.length?`, ${dayEvents.length} planned item${dayEvents.length===1?'':'s'}`:''}`);
      button.append(el('strong','',String(day)));if(dayEvents.length){const marks=el('span','dash-calendar-marks');for(const type of [...new Set(dayEvents.map(event=>event.type))])marks.append(el('i',type));button.append(marks);}
      button.addEventListener('click',()=>{view.calendarDay=view.calendarDay===day?null:day;render();document.getElementById('dash-calendar')?.scrollIntoView({block:'start',behavior:'smooth'});});grid.append(button);
    }
    const agenda=el('div','dash-calendar-agenda'),agendaHead=el('div','dash-calendar-agenda-head'),clear=el('button','','Show whole month');clear.type='button';clear.hidden=view.calendarDay===null;clear.addEventListener('click',()=>{view.calendarDay=null;render();});agendaHead.append(el('h3','',view.calendarDay?`${view.calendarDay} ${monthName(number)}`:'Month agenda'),clear);agenda.append(agendaHead);
    const shown=events.filter(event=>view.calendarDay===null||event.day===view.calendarDay);
    if(shown.length)for(const event of shown){const row=el('div',`dash-agenda-item ${event.type}`);row.append(el('span','dash-agenda-date',`${event.day} ${monthName(number).split(' ')[0]}`));const text=el('div');text.append(el('strong','',event.label),el('small','',event.detail));if(event.state)text.append(pill(event.state.replaceAll('_',' '),'positive'));row.append(text);agenda.append(row);}else agenda.append(empty('No scheduled items for this day or month.'));
    const recorded=reportRows().filter(row=>row.kind==='task'&&row.coverage?.months?.includes(calendar));if(recorded.length){const reports=el('div','dash-calendar-reports');reports.append(el('h4','',`Task reporting covering this month · ${recorded.length}`));for(const row of recorded)reports.append(el('p','',`${row.id} · ${row.partner} · ${row.coverage.start}–${row.coverage.end} · ${row.report_status.replaceAll('_',' ')}`));agenda.append(reports);}else agenda.append(el('p','dash-calendar-report-note','No coordinator-confirmed Task report entries cover this month.'));
    body.append(grid,agenda);section.append(body);return section;
  }
  function commitments() {
    const section = el('section', 'dash-section'); section.append(header('Agreement commitments', 'Due months come from the signed Grant Agreement. Items without a status update remain “Not recorded”; they are not treated as overdue automatically.'));
    const controls = el('div', 'dash-controls'); controls.append(select('Show due through', [[6,'M06 · Oct 2026'],[12,'M12 · Apr 2027'],[18,'M18 · Oct 2027'],[36,'M36 · Apr 2029'],[48,'M48 · Apr 2030']], view.dueThrough, value => { view.dueThrough = Number(value); render(); })); section.append(controls);
    const columns = el('div', 'dash-two-columns');
    for (const [type, collection, status] of [['Deliverables',catalogue.deliverables,snapshot.deliverable_status],['Milestones',catalogue.milestones,snapshot.milestone_status]]) {
      const panel = el('div', 'dash-panel'); panel.append(el('h3', '', type));
      for (const item of collection.filter(row => row.due <= view.dueThrough).sort((a,b) => a.due - b.due || a.id.localeCompare(b.id,undefined,{numeric:true}))) {
        const row = el('div','dash-commitment'), copy = el('div');
        copy.append(el('strong','',`${item.id} · ${item.title}`),el('small','',`${item.wp} · Lead ${item.lead} · Due ${monthCode(item.due)} (${monthName(item.due)})${item.visibility ? ` · ${item.visibility}` : ''}`));
        const state = knownState(status?.[item.id]); row.append(copy,pill(state === 'submitted' ? 'Submitted' : state === 'achieved' ? 'Achieved' : state ? state.replaceAll('_',' ') : 'Not recorded',state === 'submitted' || state === 'achieved' ? 'positive' : 'neutral')); panel.append(row);
      }
      columns.append(panel);
    }
    section.append(columns); return section;
  }
  function reportingControls() {
    const wrap = el('div', 'dash-controls'), months = Array.from({length:48}, (_,i) => [i+1, `${monthCode(i+1)} · ${monthName(i+1)}`]);
    wrap.append(select('From',months,view.from,value => { view.from = Number(value); if (view.from > view.through) view.through = view.from; render(); }));
    wrap.append(select('Through',months,view.through,value => { view.through = Number(value); if (view.through < view.from) view.from = view.through; render(); }));
    wrap.append(select('Work Package',[['all','All Work Packages'],...config.workPackages.map(wp => [wp.id,`${wp.id} · ${wp.title}`])],view.wp,value => {view.wp=value;render();}));
    if(view.reportingMode==='partners')wrap.append(select('Partner category',[['all','All partners'],['beneficiary','Full partners'],['associated_partner','Associated partners']],view.partnerKind,value=>{view.partnerKind=value;render();}));
    if(view.reportingMode==='tasks') { const search = el('label','dash-control dash-search'); search.append(el('span','','Find Task')); const input=el('input'); input.type='search';input.placeholder='Task number or title';input.value=view.search;
    input.addEventListener('input',()=>{view.search=input.value.toLowerCase().trim();renderReportingOnly();});search.append(input);wrap.append(search); } return wrap;
  }
  function reportingDetail(kind,id,title,reported,total,content){
    const tone=total&&reported===total?'complete':reported?'partial':'unrecorded',block=el('details',`dash-report-item ${tone}`),summary=el('summary',''),identity=el('div','dash-report-identity'),score=el('div','dash-report-score');
    identity.append(el('span','dash-report-id',id),el('strong','',title),el('small','',kind));
    score.append(el('strong','',`${reported}/${total}`),el('small','',kind.toLowerCase().includes('partner')?'Tasks with entries':'Partners with entries'));
    const track=el('span','dash-report-progress'),fill=el('i','');fill.style.width=`${total?reported/total*100:0}%`;track.append(fill);score.append(track);
    summary.append(identity,score,el('span','dash-report-chevron','⌄'));block.append(summary,content);return block;
  }
  function taskBlock(task) {
    const assigned = config.partners.filter(partner => model.assigned(task, partner.code, config));
    const withReports = assigned.filter(partner => taskRows(task,partner.code).length);
    const box=el('div','dash-record-box'); box.append(el('p','dash-record-note',`${withReports.length} of ${assigned.length} assigned partners have a confirmed report entry overlapping the selected months. “No report recorded” does not mean a report was due or missed.`));
    const table=el('div','dash-record-table');
    for(const partner of assigned){
      const rows=taskRows(task,partner.code), line=el('div','dash-record-line'), who=el('div');who.append(el('strong','',partner.code),el('small','',partnerName(partner.code)));
      const what=el('div'); if(rows.length){for(const row of rows)what.append(el('p','',recordDetail(row)));}else what.append(el('span','dash-muted','No report recorded for this Task in the selected months'));
      line.append(who,what);table.append(line);
    }
    box.append(table);
    const wpRisks=catalogue.risks.filter(risk=>risk.wps.includes(task.wp));
    if(wpRisks.length)box.append(el('p','dash-record-note',`Agreement potential risks linked to ${task.wp}: ${wpRisks.map(risk=>`Risk ${risk.id}`).join(', ')}. These are Work Package-level risks, not Task flags.`));
    const block=reportingDetail('Task',task.id,task.title,withReports.length,assigned.length,box);
    const flags=(snapshot.task_flags||[]).filter(flag=>flag.id===task.id&&['at_risk','delayed'].includes(flag.status));
    if(flags.length)block.querySelector('.dash-report-identity').append(pill(flags.some(flag=>flag.status==='delayed')?'Delayed':'At risk','watch'));
    return block;
  }
  function wpBlock(wp) {
    const tasks=config.tasks.filter(task=>task.wp===wp.id && activeMonths(task).length);
    const assigned=config.partners.filter(partner=>tasks.some(task=>model.assigned(task,partner.code,config)));
    const box=el('div','dash-record-box'), wpLeader=wpRows(wp,wp.lead);
    box.append(el('p','dash-record-note',`Work Package leader: ${wp.lead}. Leadership update: ${wpLeader.length ? wpLeader.map(recordDetail).join('; ') : 'No update recorded for these months'}. Task coverage below counts each partner’s listed active Tasks, including Attachment 6 voluntary associated-partner commitments; a leader’s assessment of another Task is not that partner’s own report.`));
    const table=el('div','dash-record-table');
    for(const partner of assigned){
      const eligible=tasks.filter(task=>model.assigned(task,partner.code,config)), rows=eligible.flatMap(task=>taskRows(task,partner.code)), reported=new Set(rows.map(row=>row.id));
      const line=el('div','dash-record-line'), who=el('div');who.append(el('strong','',partner.code),el('small','',partnerName(partner.code)));
      const what=el('div');what.append(el('strong','',`${reported.size}/${eligible.length} assigned Tasks with report entries`));
      what.append(el('small','',rows.length ? `Recorded months: ${monthList(selectedCoverage(rows))}` : 'No partner Task report recorded in selected months'));
      if(rows.length) for(const row of rows)what.append(el('small','',`${row.id}: ${row.coverage.start}–${row.coverage.end} (${monthList(row.coverage.months)}) · ${row.work_status==='no_work'?'no work declared':'contribution reported'}`));
      line.append(who,what);table.append(line);
    }
    box.append(table);
    const wpRisks=catalogue.risks.filter(risk=>risk.wps.includes(wp.id));
    if(wpRisks.length)box.append(el('p','dash-record-note',`Agreement potential risks: ${wpRisks.map(risk=>`Risk ${risk.id}`).join(', ')}. See the risk register below for definitions and mitigations.`));
    const partnersWithEntries=assigned.filter(partner=>tasks.some(task=>model.assigned(task,partner.code,config)&&taskRows(task,partner.code).length));
    return reportingDetail('Work Package',wp.id,wp.title,partnersWithEntries.length,assigned.length,box);
  }
  function partnerBlock(partner,tasks) {
    const assigned=tasks.filter(task=>model.assigned(task,partner.code,config));
    const rows=assigned.flatMap(task=>taskRows(task,partner.code));
    const reported=new Set(rows.map(row=>row.id));
    const box=el('div','dash-record-box');
    box.append(el('p','dash-record-note',`${reported.size} of ${assigned.length} assigned active Tasks have a confirmed entry in the selected months. An unrecorded Task is not automatically overdue.`));
    if(!assigned.length)box.append(empty('No assigned Tasks match this Work Package and period.'));
    else {const table=el('div','dash-record-table');for(const task of assigned){const taskEntries=taskRows(task,partner.code),line=el('div','dash-record-line'),who=el('div'),what=el('div');who.append(el('strong','',task.id),el('small','',task.title));if(taskEntries.length)for(const row of taskEntries)what.append(el('p','',recordDetail(row)));else what.append(el('span','dash-muted','No report recorded in selected months'));line.append(who,what);table.append(line);}box.append(table);}
    return reportingDetail(partner.kind==='associated_partner'?'Associated partner':'Full partner',partner.code,partner.name,reported.size,assigned.length,box);
  }
  function reportingSection() {
    const section=el('section','dash-section');section.id='dashboard-reporting';
    section.append(header('Partner reporting coverage','See listed partners, their confirmed report entries, and the exact periods they covered. Associated-partner assignments include the coordinator-confirmed voluntary Task list from Attachment 6.'));
    if (!reportRows().length) { const note=el('div','dash-state-note');note.append(el('strong','','No partner files added yet'),el('p','','Each Task and Work Package already shows its listed partner assignments. Confirmed partner coverage will appear after submitted files are reviewed and imported.'));section.append(note); }
    section.append(reportingControls()); const eligibleWps=config.workPackages.filter(wp=>view.wp==='all'||view.wp===wp.id), active=eligibleWps.filter(wp=>activeMonths(wp).length), future=eligibleWps.filter(wp=>!activeMonths(wp).length);
    const tasks=config.tasks.filter(task=>activeMonths(task).length && (view.wp==='all'||task.wp===view.wp) && (!view.search||`${task.id} ${task.title}`.toLowerCase().includes(view.search)));
    const mode=el('div','dash-mode-switch');
    const allReportingPartners=config.partners.filter(partner=>tasks.some(task=>model.assigned(task,partner.code,config)));
    const reportingPartners=allReportingPartners.filter(partner=>view.partnerKind==='all'||partner.kind===view.partnerKind);
    const summary=el('div','dash-report-summary');for(const [value,label] of [[`${monthCode(view.from)}–${monthCode(view.through)}`,'Selected period'],[String(tasks.length),'Active Tasks'],[String(active.length),'Active Work Packages'],[String(allReportingPartners.length),'Partners assigned']]){const item=el('div','');item.append(el('strong','',value),el('span','',label));summary.append(item);}section.append(summary);
    for(const [key,label,count] of [['tasks','Tasks',tasks.length],['work_packages','Work Packages',active.length],['partners','Partners',view.reportingMode==='partners'?reportingPartners.length:allReportingPartners.length]]){const button=el('button',view.reportingMode===key?'is-selected':'',`${label}  ${count}`);button.type='button';button.setAttribute('aria-pressed',String(view.reportingMode===key));button.addEventListener('click',()=>{view.reportingMode=key;render();});mode.append(button);}section.append(mode);
    const taskPanel=el('div','dash-report-panel'),taskHead=el('h3','','Tasks');taskHead.append(el('span','',`${tasks.length} in this view`));taskPanel.append(taskHead);
    if(tasks.length) tasks.forEach(task=>taskPanel.append(taskBlock(task))); else taskPanel.append(empty('No Tasks match the selected months and filter.'));
    const wpPanel=el('div','dash-report-panel'),wpHead=el('h3','','Work Packages');wpHead.append(el('span','',`${active.length} active`));wpPanel.append(wpHead);
    if(active.length) active.forEach(wp=>wpPanel.append(wpBlock(wp)));else wpPanel.append(empty('No Work Package is active in the selected months.'));
    if(future.length) wpPanel.append(el('p','dash-record-note',`Outside this selection: ${future.map(wp=>`${wp.id} (${monthCode(wp.startMonth)}–${monthCode(wp.endMonth)})`).join(', ')}.`));
    const partnerPanel=el('div','dash-report-panel'),partnerHead=el('h3','','Partners');partnerHead.append(el('span','',`${reportingPartners.length} with assigned active Tasks`));partnerPanel.append(partnerHead);
    reportingPartners.forEach(partner=>partnerPanel.append(partnerBlock(partner,tasks)));
    if(!reportingPartners.length)partnerPanel.append(empty('No partner assignments match the selected months and Work Package.'));
    section.append(view.reportingMode==='tasks'?taskPanel:view.reportingMode==='work_packages'?wpPanel:partnerPanel);return section;
  }
  function renderReportingOnly() { const current=document.getElementById('dashboard-reporting');if(!current)return; const replacement=reportingSection();current.replaceWith(replacement); const field=replacement.querySelector('input[type="search"]');field.focus();field.setSelectionRange(field.value.length,field.value.length); }
  function risksSection() {
    const section=el('section','dash-section'); section.append(header('Risks to watch','Explore the potential risks identified in the Grant Agreement. These are planning scenarios; a Task is flagged only when a specific concern is recorded.'));
    const flags=Array.isArray(snapshot.task_flags)?snapshot.task_flags:[],activeFlags=flags.filter(item=>['at_risk','delayed'].includes(item.status));
    const callout=el('div','dash-risk-callout');callout.append(el('strong','',activeFlags.length ? `${new Set(activeFlags.map(item=>item.id)).size} Tasks flagged` : 'No Task risk flags recorded'));
    if(activeFlags.length) for(const item of activeFlags)callout.append(el('p','',`${item.id} · ${item.status.replaceAll('_',' ')}${item.severity ? ` · ${item.severity} issue` : ''} · ${item.source || 'Coordinator update'}${item.note ? ` · ${item.note}` : ''}`));
    else callout.append(el('p','','No Task-specific risk flags have been supplied yet.'));section.append(callout);
    const controls=el('div','dash-controls');controls.append(select('Explore Agreement risks',[['all','All 17 potential risks'],['high','All high-impact risks'],['high-medium','High impact · medium likelihood']],view.risk,value=>{view.risk=value;render();}));section.append(controls);
    const grid=el('div','dash-risk-grid');
    for(const risk of catalogue.risks.filter(risk=>view.risk==='all'||(risk.impact==='High'&&(view.risk==='high'||risk.likelihood==='Medium')))){
      const item=el('div','dash-risk-card'),top=el('div','dash-risk-top');top.append(el('strong','',`Risk ${risk.id} · ${risk.title}`),pill(`${risk.impact} impact · ${risk.likelihood} likelihood`,risk.impact==='High'&&risk.likelihood==='Medium'?'watch':'neutral'));
      item.append(top,el('small','',risk.wps.join(' · ')),el('p','',`Mitigation summary from the Agreement: ${risk.mitigation}`));grid.append(item);
    }
    section.append(grid);return section;
  }
  function kpisSection() {
    const section=el('section','dash-section');section.append(header('Project indicators','Agreement targets are shown now. Reviewed actuals and partner contributions will appear here when supplied; narrative Task answers are not converted into numeric achievements automatically.'));
    if(!(snapshot.kpi_values||[]).length){const note=el('div','dash-state-note');note.append(el('strong','','Targets are ready; results are pending'),el('p','','The Agreement defines the targets below. Actual values and partner breakdowns will appear once reviewed measurement data is added.'));section.append(note);}
    const lenses=el('div','dash-kpi-lenses');for(const [key,label,count] of [['objectives','SMART objectives',catalogue.smart_objectives?.length||0],['call','Call KPI table',catalogue.call_kpis?.length||0],['indicators','Reportable indicators',catalogue.kpis.length]]){const button=el('button',view.kpiLens===key?'is-selected':'',`${label} · ${count}`);button.type='button';button.setAttribute('aria-pressed',String(view.kpiLens===key));button.addEventListener('click',()=>{view.kpiLens=key;render();});lenses.append(button);}section.append(lenses);
    if(view.kpiLens==='objectives'){
      section.append(el('p','dash-kpi-lens-intro','Nine time-bound outcomes guide the project. Open an objective to see its commitment, measures and related reportable indicators.'));
      const grid=el('div','dash-objective-grid');for(const objective of catalogue.smart_objectives||[]){const card=el('details','dash-objective-card'),summary=el('summary','');summary.append(el('span','dash-objective-number',String(objective.number).padStart(2,'0')),el('div','',undefined));const identity=summary.lastChild;identity.append(el('strong','',objective.title),el('small','',`Target timing · ${objective.due}`));card.append(summary);const body=el('div','dash-objective-body');body.append(el('h4','','What AISHA aims to deliver'),el('p','',objective.commitment),el('h4','','How the Agreement measures it'),el('p','',objective.measures));const related=(objective.indicator_ids||[]).map(id=>catalogue.kpis.find(item=>item.id===id)).filter(Boolean);body.append(el('h4','',`Related reportable indicators · ${related.length}`));const tags=el('div','dash-objective-indicators');for(const indicator of related)tags.append(el('span','',indicator.name));body.append(tags,el('small','',`Source: Grant Agreement, PDF p. ${objective.source_page}.`));card.append(body);grid.append(card);}section.append(grid);return section;
    }
    if(view.kpiLens==='call'){
      section.append(el('p','dash-kpi-lens-intro','The Agreement’s call KPI table pairs each expected result with its measurement method and 48-month target. Open a row for related reportable indicators.'));
      const table=el('div','dash-call-kpi-list');for(const entry of catalogue.call_kpis||[]){const row=el('details','dash-call-kpi'),summary=el('summary','');summary.append(el('span','dash-call-id',entry.id),el('strong','',entry.kpi),el('span','dash-call-target',entry.target));row.append(summary);const body=el('div','dash-call-body');body.append(el('strong','','Proposed metric · how we measure it'),el('p','',entry.metric));const related=(entry.indicator_ids||[]).map(id=>catalogue.kpis.find(item=>item.id===id)).filter(Boolean);body.append(el('strong','',`Related reportable indicators · ${related.length}`));const tags=el('div','dash-objective-indicators');for(const indicator of related)tags.append(el('span','',indicator.name));body.append(tags,el('small','',`Source: Grant Agreement, PDF p. ${entry.source_page}.`));row.append(body);table.append(row);}section.append(table);return section;
    }
    section.append(el('p','dash-kpi-lens-intro','These measured fields collect partner evidence. Coordinator-reviewed values appear alongside Agreement targets.'));
    const groups=[...new Set(catalogue.kpis.map(kpi=>kpi.group))],controls=el('div','dash-controls');controls.append(select('Indicator group',[['all','All indicators'],...groups.map(group=>[group,group])],view.kpiGroup,value=>{view.kpiGroup=value;render();}));section.append(controls);
    const grid=el('div','dash-kpi-list');
    for(const kpi of catalogue.kpis.filter(item=>view.kpiGroup==='all'||item.group===view.kpiGroup)){
      const value=(snapshot.kpi_values||[]).find(item=>item.id===kpi.id),panel=el('details','dash-kpi-row'),summary=el('summary',''),identity=el('div','dash-kpi-identity'),figures=el('div','dash-kpi-figures');
      identity.append(el('span','dash-kpi-group',kpi.group),el('strong','',kpi.name));
      figures.append(el('small','','Agreement target'),el('span','',kpi.target),el('small','','Reviewed actual'),el('strong','',value?.actual===null||value?.actual===undefined?'Pending':`${value.actual}${kpi.unit==='%'?'%':` ${kpi.unit}`}`));summary.append(identity,figures);panel.append(summary);
      const breakdown=el('div','dash-kpi-breakdown');
      if(value?.partners?.length){for(const partner of value.partners)breakdown.append(el('p','',`${partner.code} · ${partnerName(partner.code)}: ${partner.value}${kpi.unit==='%'?'%':` ${kpi.unit}`}`));}else breakdown.append(empty('No reviewed partner breakdown yet.'));
      breakdown.append(el('p','dash-kpi-method',`Breakdown: ${kpi.breakdown}.`));
      if(kpi.source_note)breakdown.append(el('p','dash-kpi-method',kpi.source_note));
      if(kpi.source_page)breakdown.append(el('small','',`Source: signed Grant Agreement, PDF p. ${kpi.source_page}.`));
      panel.append(breakdown);grid.append(panel);
    }
    section.append(grid);return section;
  }
  function messageBoard() {
    const section=el('section','dash-section dash-message-board');section.append(header('Message board','Project updates shared by the coordination team and partners. Messages appear after the coordination team publishes them.'));
    const messages=Array.isArray(snapshot.messages)?snapshot.messages:[];
    if(!messages.length)section.append(empty('No project messages have been published yet.'));
    for(const item of [...messages].sort((a,b)=>String(b.date).localeCompare(String(a.date)))){
      const card=el('article','dash-message'),top=el('div','dash-message-top');top.append(el('strong','',item.title||'Project update'),pill(item.priority==='urgent'?'Urgent':item.priority==='important'?'Important':'Update',item.priority==='urgent'?'watch':'neutral'));card.append(top,el('small','',`${item.date||'Date not supplied'} · ${item.author||'Coordination team'}`),el('p','',item.body||''));if(item.url&&/^https:\/\//.test(item.url)){const link=el('a','','Read more →');link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';card.append(link);}section.append(card);
    }
    return section;
  }
  function render() {
    if(!catalogue||!snapshot||!agreementDetail)return;
    const tabs=el('nav','dash-tabs');tabs.setAttribute('aria-label','Dashboard sections');
    for(const [key,label] of [['overview','Overview'],['gantt','Gantt'],['workpackages','Work Packages'],['reporting','Partner reporting'],['messages','Message board'],['risks','Risks'],['kpis','KPIs']]){
      const button=el('button',view.tab===key?'is-active':'',label);button.type='button';button.setAttribute('aria-current',view.tab===key?'page':'false');button.addEventListener('click',()=>switchTab(key));tabs.append(button);
    }
    const panel=view.tab==='gantt'?ganttSection():view.tab==='workpackages'?workPackagesSection():view.tab==='reporting'?reportingSection():view.tab==='messages'?messageBoard():view.tab==='risks'?risksSection():view.tab==='kpis'?kpisSection():overview();
    host.replaceChildren(tabs,panel);
  }
  try {
    const source=window.AISHA_EMBEDDED_DATA?.catalogue,data=window.AISHA_EMBEDDED_DATA?.snapshot,detailData=window.AISHA_EMBEDDED_DATA?.detail;
    if(data?.schema_version!=='2.0'||data.project!=='AISHA'||!Array.isArray(source?.deliverables)||!Array.isArray(source?.milestones)||!Array.isArray(source?.risks)||!Array.isArray(source?.kpis)||!detailData?.deliverables||!detailData?.milestones||!agreement?.workPackages)throw new Error('Dashboard data is incomplete');
    catalogue=source;snapshot=data;agreementDetail=detailData;const current=model.projectMonth(config,data.snapshot_month);if(current){view.through=current;view.dueThrough=current<=6?6:current<=12?12:current<=18?18:current<=36?36:48;view.ganttMonth=Math.min(48,current+1);}view.draftDay=1;render();
  } catch(error){host.replaceChildren(el('p','dash-error',`Dashboard could not load: ${error.message}.`));}
})();
