import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),walk=n=>[n,...n.children.flatMap(walk)];
let document;
class N{
 constructor(tag){this.tagName=tag;this.children=[];this.dataset={};this.attrs={};this.listeners={};this.className='';this.scrollLeft=0;this.classList={add(){}};}
 append(...nodes){for(const node of nodes){node.parent=this;this.children.push(node);}}
 replaceWith(node){const p=this.parent;assert(p);node.parent=p;p.children[p.children.indexOf(this)]=node;}
 setAttribute(k,v){this.attrs[k]=v;}
 addEventListener(k,fn){this.listeners[k]=fn;}
 querySelectorAll(q){return walk(this).slice(1).filter(n=>q==='[data-effort-key]'?'effortKey' in n.dataset:q.startsWith('.')?n.className.split(' ').includes(q.slice(1)):false);}
 querySelector(q){return this.querySelectorAll(q)[0]||null;}
 contains(n){return walk(this).includes(n);}
 focus(options){document.activeElement=this;this.focusOptions=options;}
}
document={createElement:tag=>new N(tag),activeElement:null};const ctx={window:{},document,Intl,Map,Set,Date};
for(const file of ['config','project-model','staff-effort-data','staff-effort-model','staff-effort-dashboard'])vm.runInNewContext(fs.readFileSync(new URL('assets/'+file+'.js',root),'utf8'),ctx);
const c=ctx.window.AISHA_CONFIG,m=ctx.window.AISHA_MODEL,render=ctx.window.AISHA_EFFORT_DASH.render;
const snapshot={report_registry:[],staff_effort_records:[]};
for(const [partner,id,wp] of [['BOSCH','T1.1','WP1'],['IF.E','T2.1','WP2']]){const code='TEST-'+partner;snapshot.report_registry.push({report_code:code,revision:1,partner,report_type:'tasks',status:'verified',selected_months:['2026-05']});snapshot.staff_effort_records.push({report_code:code,revision:1,partner,scope:'task',id,wp,month:'2026-05',pm:'1.0000'});}
const host=new N('main');host.append(render(c,m,snapshot));
const current=()=>host.children[0],button=key=>walk(current()).find(n=>n.tagName==='button'&&(n.dataset.effortKey===key||n.title===key));
function activate(key){const before=button(key);assert(before,key);const stableKey=before.dataset.effortKey;before.focus();current().querySelector('.effort-table-wrap').scrollLeft=430;before.onclick();assert.equal(document.activeElement,button(stableKey),key+' focus survives replacement');assert.equal(document.activeElement.focusOptions.preventScroll,true);assert.equal(current().querySelector('.effort-table-wrap').scrollLeft,430,'horizontal position preserved');}
activate('BOSCH · ROBERT BOSCH GMBH');activate('WP1 — Governance & Engagement');activate('T1.1 — Governance & Sustainability Board');
let detail=current().querySelector('.effort-month-detail');assert(detail);const apCells=walk(detail).filter(n=>n.tagName==='td');assert(apCells.some(n=>n.textContent==='No GA allocation'));
activate('BOSCH · ROBERT BOSCH GMBH');activate('IF.E · Inspiring Futures Europe');activate('WP2 — State of the Art & Common Competence and Qualification Framework');activate('T2.1 — SOTA Analysis and CCQF Design');
detail=current().querySelector('.effort-month-detail');assert(walk(detail).some(n=>n.textContent==='No Task estimate'));
const noEstimateCell=walk(current()).find(n=>n.tagName==='td'&&n.title?.includes('no assigned Task estimate'));assert(noEstimateCell);assert(!noEstimateCell.title.includes('0.00 PM planned'));
activate('all-partners');activate('all-partners');
activate('BOSCH:WP1');activate('IF.E:WP1');activate('BOSCH:WP1');
console.log('Effort dashboard: expansion/collapse retains keyboard focus and table position; AP/unassigned Task monthly plans and cell titles remain explicit: PASS');
