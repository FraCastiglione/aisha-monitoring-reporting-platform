import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = name => fs.readFileSync(new URL(name, root), 'utf8');
const reporting = read('assets/reporting.js');
const html = read('index.html');
const files = read('assets/report-files.js');
const ctx = vm.createContext({ window: {}, Date, Intl, console });
for (const file of ['config.js','project-model.js']) vm.runInContext(read(`assets/${file}`), ctx);
const config = ctx.window.AISHA_CONFIG, model = ctx.window.AISHA_MODEL;
const nodes = new Map();
class Node {
  constructor(tag = 'div') { this.tagName=tag;this.children=[];this.dataset={};this.listeners={};this.classList={add(){}};this.clicks=0; }
  append(...items) { this.children.push(...items); }
  replaceChildren() { this.children=[]; }
  setAttribute(key,value) { this[key]=value; }
  addEventListener(key,fn) { this.listeners[key]=fn; }
  querySelectorAll(tag) { return this.children.flatMap(node => [node,...node.querySelectorAll(tag)]).filter(node=>node.tagName===tag); }
  focus() { ctx.document.activeElement=this; }
  click() { this.clicks++;this.listeners.click?.({detail:0}); }
}
const $ = id => { if(!nodes.has(id)) nodes.set(id,new Node());return nodes.get(id); };
Object.assign(ctx, {config,model,$,document:{activeElement:null,createElement:tag=>new Node(tag)},state:{partner:config.partners[0],selectedMonths:new Set()},textNode:(tag,text)=>Object.assign(new Node(tag),{textContent:text}),projectEnd:()=> '2030-04-30'});
function extract(name) {
  const start=reporting.indexOf(`  function ${name}(`);assert(start>=0);
  let i=reporting.indexOf('{',start)+1,depth=1;
  for(;depth;i++){if(reporting[i]==='{')depth++;if(reporting[i]==='}')depth--;}
  return reporting.slice(start,i);
}
vm.runInContext(extract('paintTimeline'),ctx);
ctx.toggleMonth=month=>{if(ctx.state.selectedMonths.has(month))ctx.state.selectedMonths.delete(month);else ctx.state.selectedMonths.add(month);ctx.paintTimeline();};
ctx.paintTimeline();
for(const month of [1,2,2,48]) {
  const old=$('project-timeline').querySelectorAll('button').find(node=>node.dataset.month===String(month));
  old.focus();old.listeners.click({detail:0});
  const replacement=$('project-timeline').querySelectorAll('button').find(node=>node.dataset.month===String(month));
  assert.notEqual(old,replacement);
  assert.equal(ctx.document.activeElement,replacement,'Keyboard activation must focus the replacement month button');
}
assert.deepEqual([...ctx.state.selectedMonths],['2026-05','2030-04']);
const before=[...ctx.state.selectedMonths];
$('project-timeline').querySelectorAll('button')[0].listeners.click({detail:1});
assert.deepEqual([...ctx.state.selectedMonths],before,'Pointer-generated clicks must not also toggle after pointerup');
console.log('Task timeline keyboard activation preserves focus and disjoint selection: PASS');

for(const [button,input] of [['choose-report-import','import-report-file'],['choose-comm-import','comm-import-file'],['choose-task-import','task-import-file']]) {
  assert.match(html,new RegExp(`<button\\b[^>]*id="${button}"[^>]*type="button"`));
  assert(!new RegExp(`<label[^>]*for="${input}"`).test(html),'Hidden file chooser must use a native keyboard button');
}
const binding=reporting.split('\n').find(line=>line.includes("['choose-report-import','import-report-file']"));
vm.runInContext(binding,ctx);
for(const [button,input] of [['choose-report-import','import-report-file'],['choose-comm-import','comm-import-file'],['choose-task-import','task-import-file']]) {$(button).click();assert.equal($(input).clicks,1);}
const dialogs=[];
ctx.document.body={append:node=>dialogs.push(node)};
ctx.document.getElementById=$;
vm.runInContext(files,ctx);
for(const [button,input] of [['choose-saved-copy-file','saved-copy-file'],['choose-pdf-recovery-file','pdf-recovery-file']]) {assert.match(files,new RegExp(`<button\\b[^>]*id="${button}"[^>]*type="button"`));$(button).click();assert.equal($(input).clicks,1);}
console.log('All five file chooser actions use native buttons and open the matching input: PASS');

// A changed timeline must not hide the only control that can remove an ineligible saved update.
ctx.state.partner=config.partners.find(partner=>partner.code==='UWK');
ctx.state.wpUpdates=new Map([['WP5',{status:'completed',progress:'Retain this leadership answer'}]]);
ctx.activeWpMonths=(wp,p)=>p.selected_months.filter(month=>model.active(wp,model.projectMonth(config,month)));
ctx.renderAgreementObjectives=()=>{};
ctx.hasWpContribution=()=>true;
const selectedPeriod={selected_months:['2026-05']};
ctx.renderOverview=()=>ctx.renderWpLeadership(selectedPeriod);
vm.runInContext(extract('renderWpLeadership'),ctx);
ctx.renderOverview();
assert.equal($('wp-leader-section').hidden,false);
let outside=$('wp-leader-list').children[0];
assert(outside.children.some(node=>node.textContent?.includes('outside the selected months')));
ctx.confirmAction=async()=>false;
await outside.querySelectorAll('button')[0].listeners.click();
assert.equal(ctx.state.wpUpdates.get('WP5').progress,'Retain this leadership answer','Cancelling must preserve the update');
ctx.confirmAction=async()=>true;
await outside.querySelectorAll('button')[0].listeners.click();
assert.equal(ctx.state.wpUpdates.size,0);
assert.equal($('wp-leader-section').hidden,true);
console.log('Out-of-range Work Package update remains visible and removable only after confirmation: PASS');
