// Build the public, narrative-free dashboard contribution data from files the coordinator has verified.
// Usage: node prepare-reviewed-reports.mjs manifest.json output.json
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=new URL('../',import.meta.url),context={window:{}};
for(const file of ['config.js','project-model.js'])vm.runInNewContext(fs.readFileSync(new URL('assets/'+file,root),'utf8'),context);
const config=context.window.AISHA_CONFIG,model=context.window.AISHA_MODEL,catalogue=JSON.parse(fs.readFileSync(new URL('assets/dashboard-catalogue.json',root),'utf8'));
const indicator=id=>catalogue.kpis.find(item=>item.id===id);
const unitFor=id=>indicator(id)?.unit||'';
function validValue(id,value){const k=indicator(id);if(!k)return false;if(k.unit==='status')return ['in_progress','achieved'].includes(value);if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>1e12||(!k.allow_negative&&value<0))return false;const type=k.input_type||'count';return !(type==='count'?!Number.isSafeInteger(value):Math.round(value*100)/100!==value)&&!(typeof k.max_value==='number'&&value>k.max_value)&&!(type==='percent'&&k.max_value!==null&&value>(k.max_value??100));}
const validCoverage=(id,months,period,wp=false)=>{const item=(wp?config.workPackages:config.tasks).find(item=>item.id===id);return item&&Array.isArray(months)&&months.length&&months.every((month,index)=>period.selected_months.includes(month)&&model.active(item,model.projectMonth(config,month))&&(!index||month>months[index-1]));};

export function prepare(manifest,readReport){
  if(!Array.isArray(manifest?.verified_reports))throw new Error('Add a verified_reports array to the manifest.');
  const codePattern=/^AISHA-[A-Z0-9.-]+-(?:TASKS|COMM)-[A-F0-9]{20,32}$/;
  const partnerToken=partner=>String(partner||'').toUpperCase().replace(/[^A-Z0-9.]+/g,'-').replace(/^-|-$/g,'');
  const seenVersions=new Map(),families=new Map();
  for(const item of manifest.verified_reports){
    const report=readReport(item.file),code=report?.report_code,rev=report?.revision,partner=report?.partner?.code,type=report?.report_type;
    if(report?.project!=='AISHA'||report.document_kind!=='submission'||!codePattern.test(code)||!Number.isInteger(rev)||rev<1||rev>99||!partner||!['tasks','communication'].includes(type)||!code.startsWith(`AISHA-${partnerToken(partner)}-${type==='tasks'?'TASKS':'COMM'}-`)||!Array.isArray(report.reporting_period?.selected_months)||!report.reporting_period.selected_months.length)throw new Error(`Invalid report identity or period: ${item.file}`);
    const projectPeriod=model.rangePeriod(config,report.reporting_period.start,report.reporting_period.end,report.reporting_period.selected_months),partnerRecord=config.partners.find(p=>p.code===partner);
    if(!projectPeriod||!partnerRecord||report.reporting_period.start!==model.periodForMonth(config,projectPeriod.selected_months[0]).start||report.reporting_period.end!==model.periodForMonth(config,projectPeriod.selected_months.at(-1)).end)throw new Error(`Invalid project scope or months: ${item.file}`);
    if(type==='tasks'&&(!Array.isArray(report.tasks)||!Array.isArray(report.work_package_leadership||[])||!Array.isArray(report.additional_contributions||[])))throw new Error(`Invalid Task report sections: ${item.file}`);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(item.reviewed_at||''))throw new Error(`Add a review date for ${item.file}.`);
    const family=families.get(code),period=JSON.stringify([report.reporting_period.start,report.reporting_period.end,report.reporting_period.selected_months]);
    if(family&&(family.partner!==partner||family.type!==type||family.period!==period))throw new Error(`Report code is reused for a different partner, type, or reporting period: ${code}`);
    families.set(code,{partner,type,period});
    const key=`${code}:v${rev}`,raw=JSON.stringify(report),previous=seenVersions.get(key);
    if(previous&&previous.raw!==raw)throw new Error(`Conflicting copies of ${key}.`);
    if(!previous)seenVersions.set(key,{report,reviewed_at:item.reviewed_at,raw});
  }
  const latest=new Map();
  for(const entry of seenVersions.values()){const code=entry.report.report_code,previous=latest.get(code);if(!previous||entry.report.revision>previous.report.revision)latest.set(code,entry);}
  const reports=[...latest.values()].sort((a,b)=>a.report.report_code.localeCompare(b.report.report_code));
  const report_registry=[],reporting_records=[],partner_kpi_contributions=[],coverageSeen=new Map();
  for(const {report,reviewed_at} of reports){
    const {report_code,revision,report_type,partner,reporting_period}=report;
    const base={report_code,revision,partner:partner.code,report_type,status:'verified'};
    report_registry.push({...base,reviewed_at,selected_months:reporting_period.selected_months});
    if(report_type==='tasks'){
      for(const task of report.tasks||[]){
        if(!validCoverage(task.id,task.coverage?.months,reporting_period)||!['completed','no_work'].includes(task.work_status)||!model.rangePeriod(config,task.coverage.start,task.coverage.end,task.coverage.months)||task.coverage.start<model.taskWindow(config,config.tasks.find(item=>item.id===task.id)).start||task.coverage.end>model.taskWindow(config,config.tasks.find(item=>item.id===task.id)).end||task.coverage.start<reporting_period.start||task.coverage.end>reporting_period.end)throw new Error(`Invalid Task coverage in ${report_code}.`);
        for(const month of task.coverage.months){const key=`${partner.code}:${task.id}:${month}`,previous=coverageSeen.get(key);if(previous)throw new Error(`Overlapping Task coverage ${key} in ${previous} and ${report_code}. Review before counting.`);coverageSeen.set(key,report_code);}
        reporting_records.push({...base,kind:'task',id:task.id,...(task.assignment_basis==='voluntary_unlisted'?{assignment_basis:'voluntary_unlisted'}:{}),coverage:{start:task.coverage.start,end:task.coverage.end,months:[...task.coverage.months]},work_status:task.work_status,report_status:'confirmed'});
      }
      for(const wp of report.work_package_leadership||[]){
        if(!validCoverage(wp.id,wp.coverage?.months,reporting_period,true)||config.workPackages.find(item=>item.id===wp.id).lead!==partner.code||!['completed','no_work'].includes(wp.work_status))throw new Error(`Invalid Work Package update in ${report_code}.`);
        for(const month of wp.coverage.months){const key=`${partner.code}:${wp.id}:${month}`,previous=coverageSeen.get(key);if(previous)throw new Error(`Overlapping Work Package coverage ${key}. Review before counting.`);coverageSeen.set(key,report_code);}
        reporting_records.push({...base,kind:'work_package',id:wp.id,coverage:{start:reporting_period.start,end:reporting_period.end,months:[...wp.coverage.months]},work_status:wp.work_status,report_status:'confirmed'});
      }
      for(const extra of report.additional_contributions||[]){const wp=extra.kind==='work_package';if(!['task','work_package'].includes(extra.kind)||!validCoverage(extra.id,extra.months,reporting_period,wp)||extra.status!=='completed')throw new Error(`Invalid voluntary contribution in ${report_code}.`);for(const month of extra.months){const key=`${partner.code}:${extra.id}:${month}`,previous=coverageSeen.get(key);if(previous)throw new Error(`Overlapping voluntary coverage ${key}. Review before counting.`);coverageSeen.set(key,report_code);}reporting_records.push({...base,kind:extra.kind,id:extra.id,assignment_basis:'voluntary_unlisted',coverage:{start:model.periodForMonth(config,extra.months[0]).start,end:model.periodForMonth(config,extra.months.at(-1)).end,months:[...extra.months]},work_status:'completed',report_status:'confirmed'});}

    }else{
      for(const month of reporting_period.selected_months){const key=`${partner.code}:COMM:${month}`,previous=coverageSeen.get(key);if(previous&&previous!==report_code)throw new Error(`Overlapping communication month ${key} in ${previous} and ${report_code}. Review before counting.`);coverageSeen.set(key,report_code);}
    }
    for(const [index,entry] of (report.kpi_contributions||[]).entries()){
      if(!indicator(entry.id))throw new Error(`Unknown AISHA indicator in ${report_code}.`);
      if(!validValue(entry.id,entry.value)||entry.unit!==unitFor(entry.id))throw new Error(`Invalid KPI value in ${report_code}.`);
      partner_kpi_contributions.push({...base,indicator_id:entry.id,contribution_id:`${report_code}:KPI:${index+1}`,value:entry.value,unit:entry.unit||'',activity_id:entry.activity_id||'',reporting_months:reporting_period.selected_months});
    }
  }
  for(const item of manifest.reviewed_kpi_contributions||[]){
    const active=latest.get(item.report_code)?.report;
    if(!active||active.revision!==item.revision||active.partner.code!==item.partner||!indicator(item.indicator_id)||!item.contribution_id||!validValue(item.indicator_id,item.value)||item.unit!==unitFor(item.indicator_id)||!Array.isArray(item.reporting_months)||item.reporting_months.some(month=>!active.reporting_period.selected_months.includes(month)))throw new Error(`Invalid reviewed KPI assignment for ${item.report_code||'unknown report'}.`);
    partner_kpi_contributions.push({report_code:item.report_code,revision:item.revision,partner:item.partner,indicator_id:item.indicator_id,contribution_id:item.contribution_id,value:item.value,unit:item.unit,reporting_months:[...item.reporting_months],activity_id:item.activity_id||'',report_type:active.report_type,status:'verified'});
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
  return {report_registry,reporting_records,partner_kpi_contributions,shared_activity_review};
}

if(process.argv[1]&&path.resolve(process.argv[1])===decodeURI(new URL(import.meta.url).pathname)){
  const [manifestFile,outputFile]=process.argv.slice(2);
  if(!manifestFile||!outputFile)throw new Error('Usage: node prepare-reviewed-reports.mjs manifest.json output.json');
  const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8')),base=path.dirname(path.resolve(manifestFile));
  const result=prepare(manifest,file=>JSON.parse(fs.readFileSync(path.resolve(base,file),'utf8')));
  fs.writeFileSync(outputFile,JSON.stringify(result,null,2)+'\n');
  process.stdout.write(`Prepared ${result.report_registry.length} verified report versions and ${result.partner_kpi_contributions.length} KPI contributions. Merge the reviewed output into dashboard-data.json, then regenerate embedded data.\n`);
}
