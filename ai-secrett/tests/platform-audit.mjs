import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const asset=n=>fs.readFileSync(path.join(base,'assets',n),'utf8');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
const ctx=vm.createContext({window:{},Date,Map,Set});
for(const n of ['config.js','project-model.js'])vm.runInContext(asset(n),ctx);
const config=ctx.window.SECRETT_CONFIG,model=ctx.window.SECRETT_MODEL;
assert.equal(config.project.startDate,'2025-10-01');
assert.equal(config.project.durationMonths,48);
assert.equal(config.partners.length,23);
assert.equal(config.workPackages.length,12);
assert.equal(config.tasks.length,66);
assert.equal(new Set(config.tasks.map(t=>t.id)).size,66);
assert.equal(new Set(config.partners.map(p=>p.code)).size,23);
const codes=new Set(config.partners.map(p=>p.code));
for(const wp of config.workPackages){assert(codes.has(wp.lead),`Unknown WP lead ${wp.id}`);assert(wp.startMonth>=1&&wp.endMonth<=48&&wp.startMonth<=wp.endMonth);}
const wps=new Set(config.workPackages.map(w=>w.id));
for(const task of config.tasks){
 assert(wps.has(task.wp),`Unknown WP ${task.id}`);
 assert(task.startMonth>=1&&task.endMonth<=48&&task.startMonth<=task.endMonth,`Window ${task.id}`);
 assert.equal(task.assignmentUnconfirmed,false,`Consortium participant list must be applied: ${task.id}`);
 assert.equal(task.lead,null,`Unverified Task leader: ${task.id}`);
 assert(task.partners.length,`No named participant: ${task.id}`);
 for(const code of task.partners)assert(codes.has(code)&&code!=='RCE',`${task.id} beneficiary participant`);
 for(const code of task.associatedPartners||[])assert(codes.has(code),`${task.id} associated partner`);
 const start=model.calendarMonth(config,task.startMonth),end=model.calendarMonth(config,task.endMonth);
 assert.equal(model.projectMonth(config,start),task.startMonth);
 assert.equal(model.projectMonth(config,end),task.endMonth);
 const p=model.rangePeriod(config,`${start}-01`,model.periodForMonth(config,end).end,model.monthsBetween(config,`${start}-01`,model.periodForMonth(config,end).end));
 assert(p,`Period ${task.id}`);
 assert(model.taskCoverage(config,task,p.start,p.end,p.selected_months),`Coverage ${task.id}`);
}
const ca=JSON.parse(fs.readFileSync(path.join(base,'tests/consortium-participants.json'),'utf8'));
assert.equal(Object.keys(ca.tasks).length,66);
assert.equal(config.taskAssignmentsVerified,true);
for(const task of config.tasks){const reference=ca.tasks[task.id];assert(reference,`Missing Consortium reference ${task.id}`);assert.equal(task.startMonth,reference.start);assert.equal(task.endMonth,reference.end);assert.deepEqual(JSON.parse(JSON.stringify(task.partners)),reference.partners);assert.equal(task.allBeneficiaries,reference.allBeneficiaries);}
const rceTasks=['T1.3','T2.1','T2.4','T4.3','T6.3','T7.3','T9.3','T11.3','T11.6'];
assert.deepEqual(Array.from(config.tasks.filter(t=>model.assigned(t,'RCE',config)),t=>t.id),rceTasks);
assert.deepEqual(Array.from(model.activeTasks(config,'RCE',13),t=>t.id),['T7.3']);
assert.equal(model.assigned(config.tasks.find(t=>t.id==='T3.1'),'COGN',config),false);
assert.equal(model.assigned(config.tasks.find(t=>t.id==='T3.2'),'COGN',config),true);
assert.equal(model.assigned(config.tasks.find(t=>t.id==='T5.1'),'ESAD-GV',config),true);
assert.equal(model.reportTaskCompatible(config.tasks.find(t=>t.id==='T3.1'),'COGN',config,{partner_role:'Task responsibility to confirm'}),true);
assert.equal(model.reportTaskCompatible(config.tasks.find(t=>t.id==='T3.1'),'COGN',config,{partner_role:'Task contributor',assignment_basis:'voluntary_unlisted'}),true);
assert.equal(model.reportTaskCompatible(config.tasks.find(t=>t.id==='T3.1'),'COGN',config,{partner_role:'Named participant'}),false);
let checked=0;
for(const partner of config.partners){
 for(let month=1;month<=48;month++){
  const ym=model.calendarMonth(config,month),period=model.periodForMonth(config,ym);
  const eligible=model.eligibleTasks(config,partner.code,period.start,period.end,[ym]);
  const expected=config.tasks.filter(t=>{const reference=ca.tasks[t.id];const listed=partner.kind==='associated_partner'?rceTasks.includes(t.id):reference.allBeneficiaries||reference.partners.includes(partner.code);return listed&&reference.start<=month&&month<=reference.end;});
  assert.deepEqual(eligible.map(t=>t.id),expected.map(t=>t.id),`${partner.code} M${month}`);
  checked+=eligible.length;
 }
}
const data=JSON.parse(fs.readFileSync(path.join(base,'dashboard-data.json'),'utf8'));
const cat=JSON.parse(asset('dashboard-catalogue.json'));
const details=JSON.parse(asset('dashboard-detail.json'));
assert.equal(data.snapshot_month,'2026-10');
assert.equal(data.as_of,'2026-10-06');
assert.equal(data.status_as_of,'2026-09-26');
assert.equal(model.projectMonth(config,data.snapshot_month),13);
assert.equal(cat.deliverables.length,23);
assert.equal(cat.milestones.length,17);
assert.equal(cat.risks.length,10);
assert.equal(cat.kpis.length,36);
assert.equal(Object.keys(data.deliverable_status).length,10);
assert.equal(Object.keys(data.milestone_status).length,6);
for(const item of cat.deliverables)if(data.deliverable_status[item.id])assert(item.due<=12,`${item.id} status not supported by September update`);
for(const item of cat.milestones)if(data.milestone_status[item.id])assert(item.due<=12,`${item.id} status not supported by September update`);
for(const n of ['dashboard.js','embedded-data.js']){
 const s=asset(n);assert(s.includes('2026-10')&&s.includes('2026-09-26'),`${n} stale snapshot`);
}
assert(details.deliverables&&details.milestones);
for(const match of html.matchAll(/(?:src|href)="(assets\/[^"?#]+)/g))assert(fs.existsSync(path.join(base,match[1])),`Missing ${match[1]}`);
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'Duplicate HTML ids');
for(const id of [...asset('reporting.js').matchAll(/\$\('([^']+)'\)/g)].map(m=>m[1]))assert(ids.includes(id)||id==='review-revision-display',`Missing reporting control ${id}`);
for(const id of [...asset('app.js').matchAll(/\$\('([^']+)'\)/g)].map(m=>m[1]))assert(ids.includes(id),`Missing app control ${id}`);
for(const n of ['reporting.js','pdf.js','report-files.js','index.html']){const source=fs.readFileSync(path.join(base,n==='index.html'?n:'assets/'+n),'utf8');assert(!source.includes('AISHA'),'AISHA reference in '+n);assert(!source.includes('AI-AI-SECRETT'),'Duplicated project name in '+n);}
const req=createRequire(import.meta.url);
globalThis.window={PDFLib:req(path.join(base,'assets/pdf-lib.min.js')),fontkit:req(path.join(base,'assets/fontkit.umd.min.js'))};
req(path.join(base,'assets/pdf-assets.js'));
req(path.join(base,'assets/pdf.js'));
const first=config.partners.find(p=>p.kind!=='associated_partner');
const all=model.rangePeriod(config,'2025-10-01','2029-09-30',Array.from({length:48},(_,i)=>model.calendarMonth(config,i+1)));
const report={schema_version:'2.4',project:'AI-SECRETT',document_kind:'submission',report_type:'tasks',report_key:`${first.code}:TASKS:${all.start}:${all.end}`,revision:1,partner:{...first},contributor:{name:'Audit Tester',role:'Test',email:'audit@example.invalid'},reporting_period:all,generated_at:'2026-10-06T00:00:00.000Z',tasks:config.tasks.map(t=>{const c=model.taskCoverage(config,t,all.start,all.end,all.selected_months);return{id:t.id,title:t.title,work_package:t.wp,task_lead:t.lead,partner_role:model.role(t,first.code,config),work_status:'no_work',coverage:{start:c.start,end:c.end,months:c.months},agreement_source_page:t.sourcePage,answers:{}}}),work_package_leadership:[],additional_contributions:[],kpi_contributions:[]};
const pdf=await window.SECRETT_PDF.createPdf(report);
const decoded=await window.SECRETT_PDF.readEmbeddedReport(pdf);
assert.deepEqual(decoded,JSON.parse(JSON.stringify(report)),'PDF must retain exact editable record for all 66 Tasks');
const plain=await window.PDFLib.PDFDocument.create();plain.addPage();
await assert.rejects(window.SECRETT_PDF.readEmbeddedReport(new Blob([await plain.save()])),/matching JSON file/);
console.log(`PASS: ${config.partners.length} partners × 48 months, ${checked} eligible Task-months, all 66 Tasks, 12 WPs, 23 deliverables, 17 milestones, 10 risks, 36 KPIs, all 66 Task PDF round-trip and ordinary-PDF recovery`);
