import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
function walk(n){return [n,...n.children.flatMap(walk)];}
function matches(n,q){const cls=q.match(/^\.([\w-]+)/)?.[1],attr=q.match(/\[data-([\w-]+)\]/)?.[1];return (!cls||n.className.split(' ').includes(cls))&&(!attr||attr.replace(/-([a-z])/g,(_,c)=>c.toUpperCase()) in n.dataset);}
class Element{
 constructor(tag){this.tagName=tag;this.children=[];this.dataset={};this.className='';this.value='';this.events={};this.attrs={};this.classList={toggle(){},add(){}};}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.children=children;}
 setAttribute(k,v){this.attrs[k]=v;}
 addEventListener(event,fn){this.events[event]=fn;}
 querySelector(q){return walk(this).slice(1).find(n=>matches(n,q))||null;}
 querySelectorAll(q){return walk(this).slice(1).filter(n=>matches(n,q));}
}
let body;
const ctx=vm.createContext({window:{},Intl,Date,Map,Set,Option:class extends Element{constructor(text,value){super('option');this.textContent=text;this.value=value;}},document:{createElement:tag=>new Element(tag),getElementById:id=>walk(body).find(n=>n.id===id),querySelectorAll:q=>walk(body).filter(n=>matches(n,q))}});
for(const file of ['config','project-model','staff-effort-data','staff-effort-model','staff-effort-reporting'])vm.runInContext(read(`assets/${file}.js`),ctx);
const c=ctx.window.AISHA_CONFIG,m=ctx.window.AISHA_MODEL,E=ctx.window.AISHA_EFFORT;
let checks=0;
for(const partner of c.partners)for(const task of c.tasks.filter(t=>m.assigned(t,partner.code,c))){
 body=new Element('body');const panel=new Element('section');panel.id='task-effort-panel';body.append(panel);
 const months=Array.from({length:Math.min(2,task.endMonth-task.startMonth+1)},(_,i)=>m.calendarMonth(c,task.startMonth+i)),p=m.rangePeriod(c,months[0]+'-01',m.periodForMonth(c,months.at(-1)).end,months);
 const state={partner,reportCodes:{tasks:null},selected:new Map([[task.id,{status:'draft',coverage_start:p.start,coverage_end:p.end}]]),extras:[],editing:task};
 const ui=ctx.window.AISHA_EFFORT_UI.connect({state,config:c,model:m,period:()=>p});ui.taskEditor();
 const total=walk(panel).find(n=>n.id===panel.id+'-total'),note=walk(panel).find(n=>n.id===panel.id+'-details'),mode=walk(panel).find(n=>n.id===panel.id+'-mode');
 assert.equal(mode.value,'total');note.value='Draft note';note.oninput();total.value='2.0001';total.events.input();
 let report={schema_version:'2.5',report_type:'tasks',partner,reporting_period:p,tasks:[{id:task.id,work_package:task.wp,work_status:'draft',coverage:{start:p.start,end:p.end,months}}],additional_contributions:[]};
 ui.attach(report);assert.equal(ui.M.total(report.staff_effort.rows),20001);assert.equal(report.staff_effort.notes[0].text,'Draft note');assert.equal(ui.taskIssue(task.id),'');
 const monthly=walk(panel).filter(n=>n.tagName==='input'&&n!==total),before=monthly.map(n=>n.value);mode.value='monthly';mode.onchange();assert.deepEqual(monthly.map(n=>n.value),before);
 monthly[0].value='0';monthly[0].events.input();if(monthly.length>1){ui.taskEditor();assert.equal(walk(panel).find(n=>n.id===panel.id+'-mode').value,'monthly');}
 const reopenedTotal=walk(panel).find(n=>n.id===panel.id+'-total');reopenedTotal.value='0';reopenedTotal.events.input();ui.attach(report);assert.equal(ui.M.total(report.staff_effort.rows),0);
 checks++;
}
console.log(`PASS: real effort editor handlers for ${checks} partner/Task assignments; one-total distribution, live refresh, notes, separate-month preservation, validation and explicit zero.`);

// Additional Task effort belongs to extras, not the formal selected-Task map.
// Changing any effort input must reopen a completed contribution as a draft.
for(const kind of ['task','work_package','general']){
 body=new Element('body');const panel=new Element('section');panel.id='extra-effort-panel';body.append(panel);
 const t=c.tasks[0],months=[m.calendarMonth(c,t.startMonth)],p=m.rangePeriod(c,months[0]+'-01',m.periodForMonth(c,months[0]).end,months);
 const entry={kind,id:kind==='task'?t.id:kind==='work_package'?t.wp:'GEN-ABCDEF12',months,status:'completed',description:'Existing contribution'};
 const state={partner:c.partners[0],reportCodes:{tasks:null},selected:new Map(),extras:[entry],extraEditing:entry};
 const ui=ctx.window.AISHA_EFFORT_UI.connect({state,config:c,model:m,period:()=>p});ui.extraEditor();
 const total=walk(panel).find(n=>n.id===panel.id+'-total'),note=walk(panel).find(n=>n.id===panel.id+'-details');
 total.value='1';total.events.input();assert.equal(entry.status,'draft',kind+' total effort edit reopens draft');
 entry.status='completed';const monthly=walk(panel).find(n=>n.tagName==='input'&&n!==total);monthly.value='2';monthly.events.input();assert.equal(entry.status,'draft',kind+' monthly effort edit reopens draft');
 entry.status='completed';note.value='Updated effort note';note.oninput();assert.equal(entry.status,'draft',kind+' effort note edit reopens draft');
 if(kind==='general'){entry.status='completed';const attribution=walk(panel).find(n=>n.tagName==='select'&&!n.id);attribution.value=t.wp;attribution.onchange();assert.equal(entry.status,'draft','WP attribution edit reopens draft');assert.equal([...state.effortRows.values()][0].wp,t.wp);}
}
console.log('Additional Task, WP and other-work effort edits, notes and WP attribution reopen completed contributions as drafts: PASS');

// An individual Task export validates only its own effort, including notes.
{
 const t=c.tasks[0],month=m.calendarMonth(c,t.startMonth),months=[month],p=m.periodForMonth(c,month);
 const state={partner:c.partners[0],reportCodes:{tasks:null},selected:new Map(),extras:[]};
 const ui=ctx.window.AISHA_EFFORT_UI.connect({state,config:c,model:m,period:()=>p});
 const selected={scope:'task',id:t.id,wp:t.wp,month,pm:'1.0000'},sibling={scope:'work_package',id:t.wp,wp:t.wp,month,pm:'invalid'};
 state.effortRows.set(E.key(selected),selected);state.effortRows.set(E.key(sibling),sibling);
 state.effortNotes.set('task',{scope:'task',id:t.id,wp:t.wp,text:'Task note'});
 state.effortNotes.set('wp',{scope:'work_package',id:t.wp,wp:t.wp,text:123});
 const report={schema_version:'2.5',report_type:'tasks',partner:state.partner,reporting_period:{...p,selected_months:months},tasks:[{id:t.id,work_package:t.wp,work_status:'draft',coverage:{start:p.start,end:p.end,months}}],additional_contributions:[]};
 assert.throws(()=>ui.attach(report),/Invalid staff effort note/);
 ui.attach(report,row=>row.scope==='task'&&row.id===t.id);
 assert.equal(report.staff_effort.rows.length,1);assert.equal(report.staff_effort.rows[0].pm,'1.0000');assert.equal(report.staff_effort.notes.length,1);assert.equal(report.staff_effort.notes[0].text,'Task note');
}
console.log('Scoped Task export excludes invalid sibling WP rows and notes before validation: PASS');
