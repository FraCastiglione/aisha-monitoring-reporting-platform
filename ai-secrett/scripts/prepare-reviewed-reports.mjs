// Build the public, narrative-free dashboard contribution data from files the coordinator has verified.
// Usage: node prepare-reviewed-reports.mjs manifest.json output.json
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const effortContext=vm.createContext({window:{},Intl});
const assetRoot=new URL('../assets/',import.meta.url);
for(const file of ['config.js','project-model.js','staff-effort-model.js'])vm.runInContext(fs.readFileSync(new URL(file,assetRoot),'utf8'),effortContext);
const effortApi=effortContext.window.SECRETT_EFFORT;
const effortModel=effortApi.create(effortContext.window.SECRETT_CONFIG,effortContext.window.SECRETT_MODEL,JSON.parse(fs.readFileSync(new URL('staff-effort-data.json',assetRoot),'utf8')));

export function prepare(manifest,readReport){
  if(!Array.isArray(manifest?.verified_reports))throw new Error('Add a verified_reports array to the manifest.');
  const codePattern=/^AISECRETT-[A-Z0-9.-]+-(?:TASKS|COMM)-[A-F0-9]{20,32}$/;
  const partnerToken=partner=>String(partner||'').toUpperCase().replace(/[^A-Z0-9.]+/g,'-').replace(/^-|-$/g,'');
  const seenVersions=new Map(),families=new Map();
  for(const item of manifest.verified_reports){
    const report=readReport(item.file),code=report?.report_code,rev=report?.revision,partner=report?.partner?.code,type=report?.report_type;
    if(report?.project!=='AI-SECRETT'||report.document_kind!=='submission'||!codePattern.test(code)||!Number.isInteger(rev)||rev<1||!partner||!['tasks','communication'].includes(type)||!code.startsWith(`AISECRETT-${partnerToken(partner)}-${type==='tasks'?'TASKS':'COMM'}-`)||!Array.isArray(report.reporting_period?.selected_months)||!report.reporting_period.selected_months.length)throw new Error(`Invalid report identity or period: ${item.file}`);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(item.reviewed_at||''))throw new Error(`Add a review date for ${item.file}.`);
    const family=families.get(code),period=JSON.stringify([report.reporting_period.start,report.reporting_period.end,report.reporting_period.selected_months]);
    if(family&&(family.partner!==partner||family.type!==type||family.period!==period))throw new Error(`Report code is reused for a different partner, type, or reporting period: ${code}`);
    families.set(code,{partner,type,period});
    const key=`${code}:v${rev}`,raw=JSON.stringify(report),previous=seenVersions.get(key);
    if(previous&&previous.raw!==raw)throw new Error(`Conflicting copies of ${key}.`);
    if(!previous)seenVersions.set(key,{report,reviewed_at:item.reviewed_at,raw,allow_effort_removals:item.allow_effort_removals===true});else if(item.allow_effort_removals===true)previous.allow_effort_removals=true;
  }
  const latest=new Map();
  for(const entry of seenVersions.values()){const code=entry.report.report_code,previous=latest.get(code);if(!previous||entry.report.revision>previous.report.revision)latest.set(code,entry);}
  for(const [code,current] of latest){const currentKeys=new Set((current.report.staff_effort?.rows||[]).map(effortApi.key));const omitted=[...seenVersions.values()].filter(entry=>entry.report.report_code===code&&entry.report.revision<current.report.revision).flatMap(entry=>entry.report.staff_effort?.rows||[]).filter(row=>!currentKeys.has(effortApi.key(row)));if(omitted.length&&!current.allow_effort_removals)throw new Error(`Revision ${current.report.revision} of ${code} removes previous staff effort entries. Review the omissions and explicitly set allow_effort_removals for that verified file if intended.`);}
  const reports=[...latest.values()].sort((a,b)=>a.report.report_code.localeCompare(b.report.report_code));
  const report_registry=[],reporting_records=[],partner_kpi_contributions=[],staff_effort_records=[],coverageSeen=new Map(),effortCoverage=new Map();
  for(const {report,reviewed_at} of reports){
    const {report_code,revision,report_type,partner,reporting_period}=report;
    const base={report_code,revision,partner:partner.code,report_type,status:'verified'};
    report_registry.push({...base,reviewed_at,selected_months:reporting_period.selected_months});
    if(report_type==='tasks'){
      for(const row of effortModel.validateReport(report,{complete:report.schema_version==='2.5'})){const key=`${partner.code}:${effortApi.key(row)}`,previous=effortCoverage.get(key);if(previous&&previous!==report_code)throw new Error(`Overlapping staff effort ${key} in ${previous} and ${report_code}.`);effortCoverage.set(key,report_code);const {note,...publicEffort}=row;staff_effort_records.push({...publicEffort,...base});}
      for(const task of report.tasks||[]){
        if(!task.id||!Array.isArray(task.coverage?.months)||!task.coverage.months.length)throw new Error(`Invalid Task coverage in ${report_code}.`);
        for(const month of task.coverage.months){const key=`${partner.code}:${task.id}:${month}`,previous=coverageSeen.get(key);if(previous&&previous!==report_code)throw new Error(`Overlapping Task coverage ${key} in ${previous} and ${report_code}. Review before counting.`);coverageSeen.set(key,report_code);}
        reporting_records.push({...base,kind:'task',id:task.id,coverage:task.coverage,work_status:task.work_status,report_status:'confirmed'});
      }
      for(const wp of report.work_package_leadership||[])reporting_records.push({...base,kind:'work_package',id:wp.id,coverage:{start:reporting_period.start,end:reporting_period.end,months:wp.coverage?.months||[]},work_status:wp.work_status,report_status:'confirmed'});
    }else{
      for(const month of reporting_period.selected_months){const key=`${partner.code}:COMM:${month}`,previous=coverageSeen.get(key);if(previous&&previous!==report_code)throw new Error(`Overlapping communication month ${key} in ${previous} and ${report_code}. Review before counting.`);coverageSeen.set(key,report_code);}
    }
    for(const [index,entry] of (report.kpi_contributions||[]).entries()){
      if(!/^(?:K(?:[0-9]|[12][0-9]|3[0-5])|C(?:[1-9]|10|11))$/.test(entry.id||''))continue;
      if(typeof entry.value!=='number'||!Number.isFinite(entry.value)||entry.value<0)throw new Error(`Invalid KPI value in ${report_code}.`);
      partner_kpi_contributions.push({...base,indicator_id:entry.id,contribution_id:`${report_code}:KPI:${index+1}`,value:entry.value,unit:entry.unit||'',activity_id:entry.activity_id||'',reporting_months:reporting_period.selected_months});
    }
  }
  for(const item of manifest.reviewed_kpi_contributions||[]){
    const active=latest.get(item.report_code)?.report;
    if(!active||active.revision!==item.revision||active.partner.code!==item.partner||!/^(?:K(?:[0-9]|[12][0-9]|3[0-5])|C(?:[1-9]|10|11))$/.test(item.indicator_id||'')||!item.contribution_id||typeof item.value!=='number'||!Number.isFinite(item.value)||!Array.isArray(item.reporting_months)||item.reporting_months.some(month=>!active.reporting_period.selected_months.includes(month)))throw new Error(`Invalid reviewed KPI assignment for ${item.report_code||'unknown report'}.`);
    partner_kpi_contributions.push({...item,report_type:active.report_type,status:'verified'});
  }
  const contributionKeys=new Set(),withinReportActivity=new Set(),sharedActivities=new Map();
  for(const item of partner_kpi_contributions){
    const key=`${item.report_code}:${item.contribution_id}`;if(contributionKeys.has(key))throw new Error(`Duplicate contribution ID ${key}.`);contributionKeys.add(key);
    if(!item.activity_id)continue;
    const activity=`${item.indicator_id}:${item.activity_id}`,own=`${item.report_code}:${activity}`;
    if(withinReportActivity.has(own))throw new Error(`Duplicate indicator and activity in ${item.report_code}: ${activity}.`);
    withinReportActivity.add(own);
    const group=sharedActivities.get(activity)||[];group.push({report_code:item.report_code,partner:item.partner});sharedActivities.set(activity,group);
  }
  const shared_activity_review=[...sharedActivities].filter(([,entries])=>entries.length>1).map(([key,entries])=>({indicator_id:key.slice(0,key.indexOf(':')),activity_id:key.slice(key.indexOf(':')+1),reported_by:entries}));
  const effortCodes=new Set(staff_effort_records.map(row=>row.report_code)),effort_as_of=report_registry.filter(row=>effortCodes.has(row.report_code)).map(row=>row.reviewed_at).sort().at(-1)||null;
  return {report_registry,reporting_records,partner_kpi_contributions,staff_effort_records,effort_as_of,shared_activity_review};
}

if(process.argv[1]&&path.resolve(process.argv[1])===decodeURI(new URL(import.meta.url).pathname)){
  const [manifestFile,outputFile]=process.argv.slice(2);
  if(!manifestFile||!outputFile)throw new Error('Usage: node prepare-reviewed-reports.mjs manifest.json output.json');
  const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8')),base=path.dirname(path.resolve(manifestFile));
  const result=prepare(manifest,file=>JSON.parse(fs.readFileSync(path.resolve(base,file),'utf8')));
  fs.writeFileSync(outputFile,JSON.stringify(result,null,2)+'\n');
  process.stdout.write(`Prepared ${result.report_registry.length} verified report versions and ${result.partner_kpi_contributions.length} KPI contributions. Merge the reviewed output into dashboard-data.json, then regenerate embedded data.\n`);
}
