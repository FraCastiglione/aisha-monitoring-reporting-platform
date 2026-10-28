import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {prepare} from '../scripts/prepare-reviewed-reports.mjs';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8'),ctx=vm.createContext({window:{},Intl,Date,Map,Set});
for(const f of ['config','project-model','staff-effort-data','staff-effort-model'])vm.runInContext(read(`assets/${f}.js`),ctx);
const c=ctx.window.SECRETT_CONFIG,calendar=ctx.window.SECRETT_MODEL,E=ctx.window.SECRETT_EFFORT,M=E.create(c,calendar,ctx.window.SECRETT_EFFORT_DATA),plain=x=>JSON.parse(JSON.stringify(x));
assert.deepEqual(plain(M.source),JSON.parse(read('assets/staff-effort-data.json')));
// User-entered totals split exactly, including non-contiguous months and rounding remainders.
for(let count=1;count<=48;count++)for(const amount of ['0','0.0001','1','3.0001','999999999.9999']){
 const months=M.allMonths.slice(0,count),shares=E.splitTotal(amount,months),numbers=[...shares.values()].map(E.units);
 assert.equal(numbers.reduce((sum,n)=>sum+n,0),E.units(amount));assert(Math.max(...numbers)-Math.min(...numbers)<=1);assert.equal(E.entryMode([...shares.values()]),'total');
}
assert.equal(E.entryMode(['0.25','1.5']),'monthly');assert.equal(E.entryMode(['','1']),'monthly');assert.equal(E.entryMode(['','']),'total');
assert.throws(()=>E.splitTotal('-1',['2025-10']));assert.throws(()=>E.splitTotal('1',[]));assert.throws(()=>E.splitTotal('1',['2025-10','2025-10']));
assert.deepEqual([...E.splitTotal('1',['2025-10','2025-12']).values()],['0.5000','0.5000']);
let taskAssignments=0,monthlyChecks=0;
for(const p of M.source.partners){let partner=0;for(const w of c.workPackages){const tasks=c.tasks.filter(t=>t.wp===w.id&&calendar.assigned(t,p.code,c)),total=tasks.reduce((s,t)=>s+M.taskTotal(p.code,t.id),0);assert.equal(total,E.units(p.wps[w.id]));assert.equal(M.plannedWp(p.code,w.id,M.allMonths),total);partner+=total;for(const t of tasks){taskAssignments++;const monthly=M.allMonths.map(m=>M.plannedTask(p.code,t.id,[m]));assert.equal(monthly.reduce((s,u)=>s+u,0),M.taskTotal(p.code,t.id));for(let i=0;i<48;i++){assert(monthly[i]>=0);if(i+1<t.startMonth||i+1>t.endMonth)assert.equal(monthly[i],0);else monthlyChecks++;}assert(Math.max(...monthly.filter((_,i)=>i+1>=t.startMonth&&i+1<=t.endMonth))-Math.min(...monthly.filter((_,i)=>i+1>=t.startMonth&&i+1<=t.endMonth))<=1);}}assert.equal(partner,E.units(p.total));}
assert.equal(M.source.partners.reduce((s,p)=>s+E.units(p.total),0),21306300);
assert.equal(M.plannedTask('UVEG','T1.1',['2025-10','2025-11']),10000);
assert.equal(M.plannedTask('UVEG','T1.1',['2025-10'],'2025-10-16','2025-10-31'),Math.round(5000*16/31));
assert.equal(M.plannedTask('RCE','T1.3',M.allMonths),0);
for(const s of ['-1','1.00001','NaN','Infinity','1e4','','0,1','1.2.3'])assert.throws(()=>E.units(s));
for(const s of ['0','0.0001','2.25','10000.1234'])assert.equal(E.units(E.decimal(E.units(s))),E.units(s));
const report={schema_version:'2.5',project:'AI-SECRETT',document_kind:'submission',report_type:'tasks',report_code:'AISECRETT-UVEG-TASKS-0123456789ABCDEF0123456789ABCDEF',revision:1,partner:plain(c.partners[0]),contributor:{name:'Synthetic audit',role:'Tester',email:'audit@example.invalid'},reporting_period:{start:'2025-10-01',end:'2025-11-30',selected_months:['2025-10','2025-11']},report_key:'UVEG:TASKS:2025-10-01:2025-11-30',tasks:[{id:'T1.1',title:c.tasks[0].title,work_package:'WP1',task_lead:'INESC',partner_role:'Named participant',work_status:'completed',coverage:{start:'2025-10-01',end:'2025-11-30',months:['2025-10','2025-11']},answers:{activities_carried_out:'Research',results_achieved:'Outputs',difficulties_encountered:'',upcoming_activities:'',additional_comments:'',raw_costs_incurred:{amount:null,currency:'EUR',note:''},significant_issue:null,coordinator_action_required:null,severity:null}}],work_package_leadership:[],additional_contributions:[],kpi_contributions:[],generated_at:'2026-10-28T12:00:00.000Z',staff_effort:{unit:'PM',allocation_version:E.VERSION,rows:[{scope:'task',id:'T1.1',wp:'WP1',month:'2025-10',pm:'15.0000',note:'Above plan is allowed.'},{scope:'task',id:'T1.1',wp:'WP1',month:'2025-11',pm:'0.0000'},{scope:'work_package',id:'WP1',wp:'WP1',month:'2025-10',pm:'2.2500'}]}};
assert.equal(M.total(M.validateReport(report,{complete:true})),172500);
const mutate=f=>{const r=plain(report);f(r);return r;};
assert.throws(()=>M.validateReport(mutate(r=>r.staff_effort.rows.push(r.staff_effort.rows[0]))),/Duplicate/);
assert.throws(()=>M.validateReport(mutate(r=>r.staff_effort.rows[0].month='2025-12')),/coverage/);
assert.throws(()=>M.validateReport(mutate(r=>r.staff_effort.rows[0].wp='WP2')),/attribution|Work Package/);
assert.throws(()=>M.validateReport(mutate(r=>r.staff_effort.allocation_version='unknown')),/version/);
assert.throws(()=>M.validateReport(mutate(r=>r.staff_effort.rows.splice(1,1)),{complete:true}),/Enter staff effort/);
assert.throws(()=>M.validateReport(mutate(r=>r.tasks[0].work_status='no_work')),/zero/);
const zero=mutate(r=>{r.tasks[0].work_status='no_work';r.staff_effort.rows=r.staff_effort.rows.filter(x=>x.scope==='task').map(x=>({...x,pm:'0.0000'}));});assert.equal(M.total(M.validateReport(zero,{complete:true})),0);
assert.throws(()=>M.validateReport(mutate(r=>r.tasks[0].id='T99.1')),/context/);
const associated=mutate(r=>{r.partner={code:'RCE',kind:'associated_partner'};r.tasks[0].id='T1.3';r.tasks[0].title=c.tasks.find(t=>t.id==='T1.3').title;r.staff_effort.rows=r.staff_effort.rows.filter(x=>x.scope==='task').map(x=>({...x,id:'T1.3'}));});assert.equal(M.validateReport(associated,{complete:true}).length,2);assert.equal(M.plannedWp('RCE','WP1',M.allMonths),0);
const legacy=mutate(r=>{r.schema_version='2.4';delete r.staff_effort;});assert.equal(M.validateReport(legacy).length,0);
assert.throws(()=>M.validateReport(mutate(r=>delete r.staff_effort)),/missing/);
const narrowedWp=mutate(r=>{r.additional_contributions=[{kind:'work_package',id:'WP1',months:['2025-11']}];});assert.equal(M.validateReport(narrowedWp).length,3,'WP narrative coverage must not discard independently recorded WP effort');
const revised=mutate(r=>{r.revision=2;r.staff_effort.rows[0].pm='3.0000';});
const files={a:report,b:revised},item=file=>({file,reviewed_at:'2026-10-28'}),manifest={verified_reports:[item('a'),item('b'),item('b')]};
const data=prepare(manifest,f=>files[f]);assert.equal(data.report_registry.length,1);assert.equal(data.staff_effort_records.length,3);assert.equal(M.total(M.confirmed(data)),52500);assert.equal(data.staff_effort_records[0].revision,2);assert(!data.staff_effort_records.some(r=>'note' in r));
const omitted=mutate(r=>{r.revision=3;r.staff_effort.rows=r.staff_effort.rows.filter(row=>row.scope==='task');});files.omitted=omitted;assert.throws(()=>prepare({verified_reports:[item('a'),item('omitted')]},f=>files[f]),/removes previous staff effort/);assert.equal(prepare({verified_reports:[item('a'),{...item('omitted'),allow_effort_removals:true}]},f=>files[f]).staff_effort_records.length,2);
assert.equal(data.effort_as_of,'2026-10-28');
const conflict=mutate(r=>{r.report_code='AISECRETT-UVEG-TASKS-11111111111111111111111111111111';r.tasks=[];r.staff_effort.rows=r.staff_effort.rows.filter(row=>row.scope==='work_package');});files.c=conflict;
assert.throws(()=>prepare({verified_reports:[item('a'),item('c')]},f=>files[f]),/Overlapping staff effort/);
assert.equal(M.confirmed({...data,staff_effort_records:[...data.staff_effort_records,...data.staff_effort_records]}).length,3);
assert.throws(()=>M.confirmed({...data,staff_effort_records:[...data.staff_effort_records,{...data.staff_effort_records[0],pm:'4.0000'}]}),/conflicting/);
const require=createRequire(import.meta.url);globalThis.window={PDFLib:require(new URL('assets/pdf-lib.min.js',root).pathname),fontkit:require(new URL('assets/fontkit.umd.min.js',root).pathname),SECRETT_CONFIG:c,SECRETT_MODEL:calendar,SECRETT_EFFORT:E,SECRETT_EFFORT_DATA:ctx.window.SECRETT_EFFORT_DATA};require(new URL('assets/pdf-assets.js',root).pathname);require(new URL('assets/pdf.js',root).pathname);
const blob=await window.SECRETT_PDF.createPdf(report);assert.deepEqual(await window.SECRETT_PDF.readEmbeddedReport(blob),report);
fs.writeFileSync('/private/tmp/ai-secrett-staff-effort-audit.pdf',new Uint8Array(await blob.arrayBuffer()));fs.writeFileSync('/private/tmp/ai-secrett-staff-effort-audit.json',JSON.stringify(report,null,2));
for(const t of c.tasks){const months=M.allMonths.filter(m=>calendar.active(t,calendar.projectMonth(c,m))),r=plain(zero);r.partner=plain(c.partners.find(p=>p.code===t.lead));r.tasks=[{id:t.id,title:t.title,work_package:t.wp,task_lead:t.lead,partner_role:'Task lead (COO)',work_status:'no_work',coverage:{start:`${months[0]}-01`,end:calendar.periodForMonth(c,months.at(-1)).end,months},answers:{}}];r.reporting_period={start:r.tasks[0].coverage.start,end:r.tasks[0].coverage.end,selected_months:months};r.staff_effort.rows=months.map(month=>({scope:'task',id:t.id,wp:t.wp,month,pm:'0.0000'}));M.validateReport(r,{complete:true});const b=await window.SECRETT_PDF.createPdf(r);assert.deepEqual(plain(await window.SECRETT_PDF.readEmbeddedReport(b)),plain(r));}
console.log(`PASS: 264 partner/WP totals; ${taskAssignments} Task allocations; ${monthlyChecks} assigned months; rounding, partial dates, overruns, zero/missing, legacy files, report revisions, duplicate and overlap protection; new staff effort PDF/JSON round trips for all 66 Tasks.`);
