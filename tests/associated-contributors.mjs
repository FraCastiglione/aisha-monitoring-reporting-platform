// Attachment 6 task IDs transcribed independently, with the coordinator's 4 October exceptions.
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const ctx={window:{}};for(const name of ['config.js','project-model.js'])vm.runInNewContext(fs.readFileSync(new URL('../assets/'+name,import.meta.url),'utf8'),ctx);
const c=ctx.window.AISHA_CONFIG,m=ctx.window.AISHA_MODEL;
const all=['T1.1','T1.2','T1.3','T2.1','T2.2','T2.3','T2.4','T3.1','T3.2','T3.3','T4.1','T4.2','T4.3','T5.1','T5.2','T5.3','T6.1','T6.2','T6.3','T7.1','T7.2','T7.3','T8.1','T8.2','T8.3','T9.1','T9.2','T9.3','T9.4','T10.1','T10.2','T10.3'];
const expected={AD:all,ADRA:['T9.1','T9.2','T9.3'],'ART-ER':['T3.2','T3.3','T9.1','T9.2','T9.3'],BOSCH:[],CEPS:[],DE:['T1.1','T2.1','T3.1','T3.2','T3.3','T7.1','T7.2','T7.3','T9.1','T9.2','T9.3'],EPRD:[],JOIST:['T3.1','T7.1','T9.1','T9.2','T9.3'],JSI:['T3.1','T3.2','T3.3','T9.1','T9.2','T9.3','T9.4'],RAM:['T1.3','T9.1','T9.2','T9.3'],RT:[],SC:['T9.1','T9.2','T9.3']};
const ids=tasks=>Array.from(tasks,t=>t.id);
let checks=0;
for(const [code,taskIds] of Object.entries(expected)){
 assert.deepEqual(ids(c.tasks.filter(t=>m.assigned(t,code,c))),taskIds,code+' Attachment 6 assignments');
 for(const t of c.tasks)assert.equal(m.role(t,code,c),taskIds.includes(t.id)?'Task contributor':null);
 for(let month=1;month<=48;month++){const date=m.calendarMonth(c,month),p=m.periodForMonth(c,date),wanted=c.tasks.filter(t=>taskIds.includes(t.id)&&t.startMonth<=month&&t.endMonth>=month);assert.deepEqual(ids(m.eligibleTasks(c,code,p.start,p.end,[date])),ids(wanted));checks++;}
 const gap=['2026-05','2027-11','2029-05'],wanted=c.tasks.filter(t=>taskIds.includes(t.id)&&gap.some(date=>m.active(t,m.projectMonth(c,date))));assert.deepEqual(ids(m.eligibleTasks(c,code,'2026-05-01','2029-05-31',gap)),ids(wanted));
}
assert(c.tasks.find(t=>t.id==='T1.3').allAssociatedPartners,'Preserve formal Agreement ALL(AP) wording flag');
assert(!m.assigned(c.tasks.find(t=>t.id==='T1.3'),'BOSCH',c),'Formal ALL(AP) must not re-add exempt reporting assignments');
const t=c.tasks[0];assert(!m.associatedReportTask(t,'IF.E',c,{partner_role:'Named participant'}));assert(!m.associatedReportTask(t,'BOSCH',c,{partner_role:'Task lead (COO)'}));assert(!m.associatedReportTask(t,'BOSCH',c,{partner_role:'Task contributor'}));assert(m.associatedReportTask(t,'BOSCH',c,{partner_role:'Task contributor',assignment_basis:'voluntary_unlisted'}));
console.log(`Attachment 6: 12 partners, 70 listed Task contributions, ${checks} monthly selections plus disjoint periods PASS`);
