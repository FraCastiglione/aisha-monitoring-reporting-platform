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
const c=ctx.window.SECRETT_CONFIG,m=ctx.window.SECRETT_MODEL,E=ctx.window.SECRETT_EFFORT;
let checks=0;
for(const partner of c.partners)for(const task of c.tasks.filter(t=>m.assigned(t,partner.code,c))){
 body=new Element('body');const panel=new Element('section');panel.id='task-effort-panel';body.append(panel);
 const months=Array.from({length:Math.min(2,task.endMonth-task.startMonth+1)},(_,i)=>m.calendarMonth(c,task.startMonth+i)),p=m.rangePeriod(c,months[0]+'-01',m.periodForMonth(c,months.at(-1)).end,months);
 const state={partner,reportCodes:{tasks:null},selected:new Map([[task.id,{status:'draft',coverage_start:p.start,coverage_end:p.end}]]),extras:[],editing:task};
 const ui=ctx.window.SECRETT_EFFORT_UI.connect({state,config:c,model:m,period:()=>p});ui.taskEditor();
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
