import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8'),source=read('assets/reporting.js'),plain=x=>JSON.parse(JSON.stringify(x));
const controls=new Map(),state={reportType:'tasks',reportCodes:{tasks:null},generatedSignatures:{tasks:null},kpisByType:{tasks:new Map()},selected:new Map(),wpUpdates:new Map(),extras:[],selectedMonths:new Set(),kpis:new Map(),revisionsByType:{tasks:1}};
const $=id=>{if(!controls.has(id))controls.set(id,{value:'',textContent:'',hidden:true});return controls.get(id);};
const ctx=vm.createContext({window:{crypto:{getRandomValues(bytes){bytes.fill(1);return bytes;}}},document:{getElementById:$},state,$,Intl,Date,Map,Set,Uint8Array,TextEncoder,console,message(){},scrollTo(){},renderOverview(){},validatedKpiEntries(){return new Map();}});
for(const f of ['config','project-model','report-identity','staff-effort-data','staff-effort-model','staff-effort-reporting'])vm.runInContext(read(`assets/${f}.js`),ctx);
const c=ctx.window.SECRETT_CONFIG,m=ctx.window.SECRETT_MODEL,E=ctx.window.SECRETT_EFFORT;
state.partner=plain(c.partners[0]);ctx.config=c;ctx.model=m;ctx.reportIdentity=ctx.window.SECRETT_REPORT_IDENTITY;ctx.taskById=id=>c.tasks.find(t=>t.id===id);ctx.wpById=id=>c.workPackages.find(w=>w.id===id);ctx.activeWpMonths=(w,p)=>p.selected_months.filter(month=>m.active(w,m.projectMonth(c,month)));ctx.period=()=>state.selectedMonths.size?m.rangePeriod(c,$('report-start').value,$('report-end').value,[...state.selectedMonths].sort()):null;ctx.value=id=>$(id).value.trim();ctx.sortedMonths=()=>[...state.selectedMonths].sort();ctx.reportCode=()=>state.reportCodes.tasks||'AISECRETT-UVEG-TASKS-00000000000000000000000000000001';ctx.hasWpContribution=entry=>['progress','coordination','difficulties','next','support'].some(k=>entry[k]?.trim())||Object.values(entry.task_updates).length>0;ctx.emptyWp=()=>({status:'draft',progress:'',coordination:'',difficulties:'',next:'',support:'',task_updates:{}});
function between(start,end){const i=source.indexOf(start),j=source.indexOf(end,i);assert(i>=0&&j>i);return source.slice(i,j);}
vm.runInContext(source.match(/  const taskNarrativeFields = [^\n]+/)[0],ctx);
vm.runInContext(between('  function emptyTask()','  function taskCard('),ctx);
vm.runInContext(between('  function importedTaskAnswers(','  let taskImportTarget='),ctx);
vm.runInContext(between('  function validatedExtras(','  function reviewItem('),ctx);
vm.runInContext(between('  function finalTaskAnswers(','  function communicationAnswers('),ctx);
vm.runInContext(between('  function record(kind)','  const safe ='),ctx);
ctx.effortUI=ctx.window.SECRETT_EFFORT_UI.connect({state,config:c,model:m,period:ctx.period,renderOverview(){},extraDisplayName:e=>e.title||e.id});
const report=JSON.parse(read('tests/fixtures/staff-effort-report.json'));
ctx.incoming=report;
vm.runInContext('restore(importedAsDraft(incoming));',ctx);
assert.equal(state.selected.size,1);assert.equal(state.effortRows.size,3);assert.equal(E.units([...state.effortRows.values()][0].pm),150000);
let exported=vm.runInContext("record('draft')",ctx);assert.equal(exported.schema_version,'2.5');assert.equal(E.units(exported.staff_effort.rows[0].pm),150000);
// Re-importing the same report replaces entries, never adds them again.
vm.runInContext('restore(importedAsDraft(incoming));',ctx);assert.equal(state.effortRows.size,3);
exported=vm.runInContext("record('submission')",ctx);assert.equal(ctx.effortUI.M.total(exported.staff_effort.rows),172500);
// Selective Task imports leave direct WP effort and other Task rows alone.
const selected=ctx.effortUI.select(exported,r=>r.scope==='task'&&r.id==='T1.1');assert.equal(selected.rows.length,2);
const amended=plain(exported);amended.staff_effort.rows[0].pm='2.0000';const merge=ctx.effortUI.merge(exported,amended,r=>r.scope==='task'&&r.id==='T1.1');assert.equal(merge.rows.length,3);assert.equal(merge.rows.find(r=>r.scope==='work_package').pm,'2.2500');
// Bad effort must be rejected before it mutates the current report.
const before=plain([...state.effortRows]);const broken=plain(report);broken.staff_effort.rows[0].month='2027-01';ctx.incoming=broken;assert.throws(()=>vm.runInContext('restore(importedAsDraft(incoming));',ctx),/coverage/);assert.deepEqual(plain([...state.effortRows]),before);
// Older EUR figures survive as legacy data, never as person-months.
const legacy=plain(report);legacy.schema_version='2.4';delete legacy.staff_effort;legacy.tasks[0].answers.raw_costs_incurred={amount:'88.80',currency:'EUR',note:'Legacy internal amount.'};ctx.incoming=legacy;vm.runInContext('restore(importedAsDraft(incoming));',ctx);assert.equal(state.effortRows.size,0);assert.equal(state.selected.get('T1.1').raw_costs,'88.80');exported=vm.runInContext("record('draft')",ctx);assert.equal(exported.staff_effort.rows.length,0);assert.equal(exported.tasks[0].answers.raw_costs,'88.80');
// Restore a no-work Task and ensure zero stays explicit in the new ledger.
const zero=plain(report);zero.tasks[0].work_status='no_work';zero.tasks[0].answers={activities_carried_out:'',results_achieved:'',difficulties_encountered:'',upcoming_activities:'',additional_comments:'',raw_costs_incurred:{amount:null,currency:'EUR',note:''},significant_issue:null,severity:null,coordinator_action_required:null,coordinator_support_request:null};zero.staff_effort.rows=zero.staff_effort.rows.filter(r=>r.scope==='task').map(r=>({...r,pm:'0.0000',note:''}));ctx.incoming=zero;vm.runInContext('restore(importedAsDraft(incoming));',ctx);exported=vm.runInContext("record('submission')",ctx);assert.equal(exported.staff_effort.rows.length,2);assert.equal(ctx.effortUI.M.total(exported.staff_effort.rows),0);
console.log('PASS: actual report restore/export functions, repeated import, selective effort merge, atomic rejection, legacy EUR preservation, explicit no-work zeros.');
// A partner can submit only direct WP effort without adding a Task narrative.
const direct=plain(report);direct.tasks=[];direct.staff_effort.rows=direct.staff_effort.rows.filter(row=>row.scope==='work_package');ctx.incoming=direct;vm.runInContext('restore(importedAsDraft(incoming));',ctx);assert.equal(state.selected.size,0);assert.equal(state.effortRows.size,1);assert.equal(ctx.effortUI.hasCurrentRows(),true);exported=vm.runInContext("record('submission')",ctx);assert.equal(exported.staff_effort.rows[0].pm,'2.2500');
console.log('Direct WP-only report import and export: PASS');
// An effort note written before its numeric values must survive draft saving.
const noteDraft=plain(report);noteDraft.document_kind='draft';noteDraft.tasks[0].answers={...vm.runInContext('emptyTask()',ctx),status:'draft',coverage_start:'2025-10-01',coverage_end:'2025-11-30'};noteDraft.staff_effort.rows=[];noteDraft.staff_effort.notes=[{scope:'task',id:'T1.1',wp:'WP1',text:'PM figures will be entered after checking the monthly records.'}];ctx.incoming=noteDraft;vm.runInContext('restore(incoming);',ctx);exported=vm.runInContext("record('draft')",ctx);assert.equal(exported.staff_effort.rows.length,0);assert.equal(exported.staff_effort.notes[0].text,noteDraft.staff_effort.notes[0].text);
const badNote=plain(noteDraft);badNote.staff_effort.notes[0].wp='WP2';ctx.incoming=badNote;assert.throws(()=>vm.runInContext('restore(incoming);',ctx),/note|attribution/);assert.equal(state.effortNotes.size,1);
console.log('Draft notes before PM entry, and invalid note attribution: PASS');
