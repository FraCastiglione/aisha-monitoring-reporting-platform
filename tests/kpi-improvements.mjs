import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const catalogue=JSON.parse(fs.readFileSync(path.join(root,'assets/dashboard-catalogue.json'),'utf8'));
const context=vm.createContext({});
for(const file of ['kpi-model.js','kpi-suggestions.js'])vm.runInContext(fs.readFileSync(path.join(root,'assets',file),'utf8'),context,{filename:file});
const model=context.AISHA_KPI_MODEL,suggest=context.AISHA_KPI_SUGGESTIONS.suggest;
const visitor=catalogue.kpis.find(row=>row.id==='unique_visitors');
for(const item of catalogue.kpis){const kind=model.type(item),entry={id:item.id,name:item.name,unit:item.unit,group:item.group,scope:'AUDIT-2026-01',activity_id:'CAM-2026-01',basis:'AUDIT TEST measurement',evidence:'AUDIT TEST proof',proof_status:'will_upload',value:kind==='status'?'in_progress':kind==='percent'?50:kind==='count'?1:0.5};if(item.requires_pair){entry.numerator=item.rate_mode==='growth'?15:5;entry.denominator=10;}assert.equal(model.validate(entry,item).id,item.id);for(const bad of [{evidence:''},{proof_status:''},{activity_id:'bad code'},{value:kind==='status'?'bad':NaN},{value:kind==='status'?'bad':Infinity}])assert.throws(()=>model.validate({...entry,...bad},item));if(item.requires_scope)assert.throws(()=>model.validate({...entry,scope:''},item));if(kind==='count')assert.throws(()=>model.validate({...entry,value:1.25},item));if(item.requires_pair)assert.throws(()=>model.validate({...entry,numerator:undefined,denominator:undefined},item));}


const suggestions=suggest([{source:'T9.1',taskId:'T9.1',text:'Website analytics recorded 1,240 unique visitors. We plan 500 social followers next year.'}],catalogue.kpis,{partnerCode:'IF.E'});
assert.equal(suggestions.find(row=>row.id==='unique_visitors')?.proposedValue,1240);
assert.equal(suggestions.find(row=>row.id==='social_followers')?.proposedValue,null);
assert.equal(suggest([{source:'T1.1',text:'Governance meeting completed.'}],catalogue.kpis).length,0);

const input={id:visitor.id,name:visitor.name,group:visitor.group,unit:visitor.unit,value:1240,scope:'October website analytics',activity_id:'cam-2026-01',basis:'',evidence:'Analytics export in Nextcloud',proof_status:'uploaded'};
const validated=model.validate(input,visitor);
assert.equal(validated.activity_id,'CAM-2026-01');
assert.equal(model.key(validated),model.key({...validated,scope:'A second partner label'}));
assert.throws(()=>model.validate({...input,activity_id:'bad code'},visitor),/shared activity code/);

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'aisha-kpi-'));
try{
  const claimsPath=path.join(temp,'claims.json'),queuePath=path.join(temp,'queue.json');
  const claims=['IF.E','TRS'].map(partner=>({...validated,partner,report_key:`${partner}:TASKS:2026-05-01:2026-09-30`,revision:1,reporting_period:{start:'2026-05-01',end:'2026-09-30'},review_notes:[]}));
  fs.writeFileSync(claimsPath,JSON.stringify({project:'AISHA',prepared_on:'2026-10-02',kpi_claims:claims}));
  const node=process.execPath;
  const result=spawnSync(node,[path.resolve(root,'../coordinator/build-kpi-review-queue.mjs'),'--claims',claimsPath,'--out',queuePath],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const queue=JSON.parse(fs.readFileSync(queuePath,'utf8'));
  assert.equal(queue.claims.length,2);
  assert.equal(queue.claims[0].related_claims_with_same_activity[0].partner,'TRS');
  assert.equal(queue.claims[0].decision,'pending');
  assert.equal(queue.claims[0].activity_id,'CAM-2026-01');
  const priorPath=path.join(temp,'reviewed.json');
  queue.claims[0].decision='accepted';queue.claims[0].reviewer='Coordinator';
  fs.writeFileSync(priorPath,JSON.stringify(queue));
  const rerun=spawnSync(node,[path.resolve(root,'../coordinator/build-kpi-review-queue.mjs'),'--claims',claimsPath,'--out',queuePath,'--decisions',priorPath],{encoding:'utf8'});
  assert.equal(rerun.status,0,rerun.stderr);
  assert.equal(JSON.parse(fs.readFileSync(queuePath,'utf8')).claims[0].decision,'pending','unchecked legacy acceptance must be returned to review');
  queue.claims[0].evidence_checked=true;queue.claims[0].overlap_checked=true;
  fs.writeFileSync(priorPath,JSON.stringify(queue));
  const checked=spawnSync(node,[path.resolve(root,'../coordinator/build-kpi-review-queue.mjs'),'--claims',claimsPath,'--out',queuePath,'--decisions',priorPath],{encoding:'utf8'});
  assert.equal(checked.status,0,checked.stderr);
  assert.equal(JSON.parse(fs.readFileSync(queuePath,'utf8')).claims[0].decision,'accepted');
  claims.push({...claims[1],partner:'UNIBO',report_key:'UNIBO:TASKS:2026-05-01:2026-09-30'});
  fs.writeFileSync(claimsPath,JSON.stringify({project:'AISHA',prepared_on:'2026-10-03',kpi_claims:claims}));
  const overlapChanged=spawnSync(node,[path.resolve(root,'../coordinator/build-kpi-review-queue.mjs'),'--claims',claimsPath,'--out',queuePath,'--decisions',priorPath],{encoding:'utf8'});
  assert.equal(overlapChanged.status,0,overlapChanged.stderr);
  const renewed=JSON.parse(fs.readFileSync(queuePath,'utf8')).claims[0];
  assert.equal(renewed.decision,'pending','new related partner claim requires a fresh overlap check');
  assert.equal(renewed.evidence_checked,true);
  assert.equal(renewed.overlap_checked,false);
  claims.pop();
  claims[0].value=999;claims[0].evidence='Changed proof under the same revision';
  fs.writeFileSync(claimsPath,JSON.stringify({project:'AISHA',prepared_on:'2026-10-03',kpi_claims:claims}));
  const changed=spawnSync(node,[path.resolve(root,'../coordinator/build-kpi-review-queue.mjs'),'--claims',claimsPath,'--out',queuePath,'--decisions',priorPath],{encoding:'utf8'});
  assert.equal(changed.status,0,changed.stderr);
  const pending=JSON.parse(fs.readFileSync(queuePath,'utf8')).claims[0];
  assert.equal(pending.decision,'pending','changed claim must be reviewed again');
  assert.equal(pending.evidence_checked,false);
  assert.equal(pending.overlap_checked,false);

}finally{fs.rmSync(temp,{recursive:true,force:true});}
console.log('KPI suggestions, activity IDs, and private overlap queue: pass');
