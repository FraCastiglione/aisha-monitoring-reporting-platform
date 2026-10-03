import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),read=name=>fs.readFileSync(path.join(root,'assets',name),'utf8'),ctx=vm.createContext({window:{},TextEncoder,Date});
for(const file of ['config.js','project-model.js'])vm.runInContext(read(file),ctx);const config=ctx.window.AISHA_CONFIG,model=ctx.window.AISHA_MODEL;
const source=read('reporting.js');function extract(name){const start=source.indexOf(`  function ${name}(`);assert(start>=0);let brace=source.indexOf('{',start),depth=1,index=brace+1;for(;depth&&index<source.length;index++){if(source[index]==='{')depth++;if(source[index]==='}')depth--;}return source.slice(start,index);}
// Execute actual serialization/validation functions in a source-level harness, not a browser.
Object.assign(ctx,{config,model,state:{partner:config.partners.find(p=>p.code==='IF.E'),reportType:'tasks',revision:1,contributor:{name:'AUDIT',role:'TEST',email:'audit@example.invalid'},selected:new Map(),wpUpdates:new Map(),extras:[],kpis:new Map()},taskById:id=>config.tasks.find(t=>t.id===id),wpById:id=>config.workPackages.find(w=>w.id===id),period:()=>model.rangePeriod(config,'2026-05-01','2026-05-31',['2026-05']),activeWpMonths:()=>['2026-05'],sortedMonths:()=>['2026-05']});
for(const name of ['emptyTask','finalTaskAnswers','record'])vm.runInContext(extract(name),ctx);
const answer=ctx.emptyTask();answer.coverage_start='2026-05-01';answer.coverage_end='2026-05-31';answer.activities_carried_out='x'.repeat(100000);ctx.state.selected.set('T1.1',answer);assert.equal(ctx.record('draft').tasks[0].answers.activities_carried_out.length,100000);
answer.activities_carried_out+='x';assert.throws(()=>ctx.record('draft'),/100,000/);answer.activities_carried_out='x'.repeat(100000);
const eligible=model.eligibleTasks(config,'IF.E','2026-05-01','2026-05-31',['2026-05']);for(const task of eligible){const a={...answer};for(const key of ['activities_carried_out','results_achieved','difficulties_encountered','upcoming_activities','additional_comments','coordinator_support_request'])a[key]='€'.repeat(100000);ctx.state.selected.set(task.id,a);}assert.throws(()=>ctx.record('draft'),/5 MB/,'UTF-8 bytes, not only character count, must enforce backup size');
const notes=source.match(/fields\.website_article_details=(.*?);for\(const control/)[1];ctx.a={website_articles:[{details:'Common note'},{details:'Common note'}]};assert.equal(vm.runInContext(notes,ctx),'Common note');ctx.a={website_articles:[{details:'Note one'},{details:'Note two'}]};assert.equal(vm.runInContext(notes,ctx),'Note one\nNote two');
assert(source.includes('try { if (!validate()) return; state.reviewed = record'));
console.log('Report text boundary, UTF-8 aggregate backup limit, duplicate/distinct article notes and review error handling: PASS');
ctx.state.selected=new Map();ctx.state.wpUpdates=new Map();ctx.state.extras=[];ctx.state.kpis=new Map();ctx.period=()=>null;ctx.value=()=>'';ctx.sortedMonths=()=>[];
const blank=ctx.record('draft');assert.equal(blank.tasks.length,0);assert.equal(blank.reporting_period.selected_months.length,0);
const elements=new Map();function node(){return {children:[],dataset:{},append(...children){this.children.push(...children)},replaceChildren(){this.children=[]},showModal(){this.open=true}};}
ctx.$=id=>{if(!elements.has(id))elements.set(id,node());return elements.get(id)};ctx.document={createElement:node};ctx.textNode=(tag,text)=>({...node(),textContent:text});ctx.pendingWholeImport=null;
vm.runInContext(extract('prepareWholeImport'),ctx);ctx.prepareWholeImport(blank);assert(ctx.pendingWholeImport.samePeriod);assert.equal(elements.get('whole-import-entries').children[0].children[0].dataset.kind,'contributor');assert.equal(elements.get('whole-import-dialog').open,true);
console.log('Draft saved before timeline selection exposes contributor-only restoration: PASS');
// Removing the editor must not leave startup references to removed controls.
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
assert(!ids.has('kpi-reporting'));assert(!source.includes('aisha:kpi-requested'));assert(!source.includes('selectKpi('));
for(const match of source.matchAll(/\$\('([^']+)'\)/g))assert(ids.has(match[1])||match[1]==='review-revision-display',`Missing reporting control ${match[1]}`);
vm.runInContext(read('kpi-model.js'),ctx);ctx.kpiModel=ctx.window.AISHA_KPI_MODEL;ctx.kpiKey=ctx.kpiModel.key;const catalogue=JSON.parse(fs.readFileSync(path.join(root,'assets/dashboard-catalogue.json'),'utf8'));ctx.kpiDefinition=id=>catalogue.kpis.find(k=>k.id===id);ctx.communicationKpis=new Set(catalogue.kpis.filter(k=>k.report_contexts?.includes('communication')).map(k=>k.id));vm.runInContext(extract('validatedKpiEntries'),ctx);
const legacy={id:'unique_visitors',name:'Website unique visitors',group:'Reach',unit:'visitors',value:1240,scope:'September analytics',activity_id:'CAM-2026-01',basis:'',evidence:'AUDIT TEST evidence',proof_status:'uploaded'};legacy.unit=ctx.kpiDefinition(legacy.id).unit;
ctx.state.reportType='tasks';ctx.state.kpis=ctx.validatedKpiEntries([legacy]);assert.equal(ctx.state.kpis.size,1);assert.equal(ctx.record('draft').kpi_contributions[0].value,1240);
ctx.state.reportType='communication';assert.equal(ctx.validatedKpiEntries([legacy]).size,1);assert.throws(()=>ctx.validatedKpiEntries([{...legacy,value:NaN}]),/valid/);
console.log('Removed KPI UI controls and legacy KPI import/export compatibility: PASS');
