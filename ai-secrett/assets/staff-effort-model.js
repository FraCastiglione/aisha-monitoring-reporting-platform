(function(root){
  'use strict';
  const SCALE=10000,VERSION='equal-task-month-v1';
  function units(value){
    if(typeof value!=='string'||!/^\d{1,9}(?:\.\d{1,4})?$/.test(value))throw new Error('Enter a non-negative PM value with up to four decimal places.');
    const [whole,fraction='']=value.split('.'),n=Number(whole)*SCALE+Number(fraction.padEnd(4,'0'));
    if(!Number.isSafeInteger(n))throw new Error('Staff effort is too large.');return n;
  }
  const decimal=n=>{if(!Number.isSafeInteger(n))throw new Error('Invalid staff effort total.');return (n/SCALE).toFixed(4);};
  const format=n=>n===null||n===undefined?'Not reported':new Intl.NumberFormat('en',{minimumFractionDigits:2,maximumFractionDigits:4}).format(n/SCALE);
  const key=r=>JSON.stringify([r.scope,r.id,r.month]);
  function divide(total,keys){const q=Math.floor(total/keys.length),r=total%keys.length;return new Map(keys.map((k,i)=>[k,q+(i<r?1:0)]));}
  function splitTotal(value,months){
    const total=units(value);
    if(!months.length||new Set(months).size!==months.length)throw new Error('Choose distinct reporting months before entering effort.');
    return new Map([...divide(total,months)].map(([month,n])=>[month,decimal(n)]));
  }
  function entryMode(values){
    if(values.every(v=>v===undefined||v===''))return 'total';
    try{const numbers=values.map(v=>units(v));return Math.max(...numbers)-Math.min(...numbers)<=1?'total':'monthly';}catch{return 'monthly';}
  }
  const cache=new WeakMap();
  function create(config,calendar,data){
    const cached=cache.get(config);if(cached&&cached.calendar===calendar&&cached.data===data)return cached.value;
    const task=id=>config.tasks.find(t=>t.id===id),wp=id=>config.workPackages.find(w=>w.id===id),baseline=new Map(),taskTotals=new Map();
    const sourceTotal=data.partners.reduce((sum,p)=>sum+units(p.total),0);if(sourceTotal!==units(data.total))throw new Error('Staff effort source total does not reconcile.');
    for(const p of data.partners){let sum=0;for(const w of config.workPackages){const amount=units(p.wps[w.id]);sum+=amount;const tasks=config.tasks.filter(t=>t.wp===w.id&&calendar.assigned(t,p.code,config));if(!tasks.length&&amount)throw new Error(`No assigned Tasks for ${p.code}/${w.id}.`);const shares=divide(amount,tasks.map(t=>t.id));for(const t of tasks){const total=shares.get(t.id);taskTotals.set(`${p.code}:${t.id}`,total);for(const [n,u] of divide(total,Array.from({length:t.endMonth-t.startMonth+1},(_,i)=>i+t.startMonth)))baseline.set(`${p.code}:${t.id}:${calendar.calendarMonth(config,n)}`,u);}}if(sum!==units(p.total))throw new Error(`Staff effort source total for ${p.code} does not reconcile.`);}
    for(const w of config.workPackages)if(data.partners.reduce((s,p)=>s+units(p.wps[w.id]),0)!==units(data.wp_totals[w.id]))throw new Error(`Staff effort source ${w.id} does not reconcile.`);
    const allMonths=Array.from({length:config.project.durationMonths},(_,i)=>calendar.calendarMonth(config,i+1));
    function plannedTask(partner,id,months,start,end){return months.reduce((sum,m)=>{let u=baseline.get(`${partner}:${id}:${m}`)||0;if(start||end){const period=calendar.periodForMonth(config,m),from=start&&start>period.start?start:period.start,through=end&&end<period.end?end:period.end;if(from>through)return sum;const days=(Date.parse(through)-Date.parse(from))/86400000+1,full=Number(period.end.slice(-2));u=Math.round(u*days/full);}return sum+u;},0);}
    const plannedWp=(partner,id,months)=>config.tasks.filter(t=>t.wp===id).reduce((s,t)=>s+plannedTask(partner,t.id,months),0);
    function contexts(report){
      const result=new Map(),months=report.reporting_period?.selected_months||[];
      for(const t of report.tasks||[]){const known=task(t.id),coverage=t.coverage,allowed=known&&calendar.taskCoverage(config,known,report.reporting_period.start,report.reporting_period.end,months);if(!known||t.work_package!==known.wp||!allowed||!coverage||!calendar.rangePeriod(config,coverage.start,coverage.end,coverage.months)||coverage.start<allowed.start||coverage.end>allowed.end||coverage.months.some(m=>!months.includes(m)||!calendar.active(known,calendar.projectMonth(config,m)))||result.has(`task:${t.id}`))throw new Error('Invalid staff effort Task context.');result.set(`task:${t.id}`,{scope:'task',id:t.id,wp:known.wp,months:coverage.months,noWork:t.work_status==='no_work'});}
      for(const e of report.additional_contributions||[]){const scope=e.kind==='task'?'task':e.kind==='work_package'?'work_package':'other';if(!['task','work_package','general'].includes(e.kind)||scope==='task'&&!task(e.id)||scope==='work_package'&&!wp(e.id)||scope==='other'&&!/^GEN-(?:[A-F0-9]{8}|[A-F0-9]{16})$/.test(e.id))throw new Error('Invalid staff effort contribution context.');if(result.has(`${scope}:${e.id}`))throw new Error('Staff effort context is duplicated.');result.set(`${scope}:${e.id}`,{scope,id:e.id,wp:scope==='task'?task(e.id)?.wp:scope==='work_package'?e.id:null,months:e.months||[],noWork:false});}
      // Direct WP effort is separate from Task roll-ups and leadership narratives.
      for(const w of config.workPackages)result.set(`work_package:${w.id}`,{scope:'work_package',id:w.id,wp:w.id,months:months.filter(m=>calendar.active(w,calendar.projectMonth(config,m))),noWork:false});
      return result;
    }
    function validateNotes(report){
      const notes=report.staff_effort?.notes||[];if(!Array.isArray(notes)||notes.length>200)throw new Error('Invalid staff effort notes.');const context=contexts(report),seen=new Set();return notes.map(n=>{const c=context.get(`${n.scope}:${n.id}`),k=JSON.stringify([n.scope,n.id]);if(!c||seen.has(k)||typeof n.text!=='string'||n.text.length>10000||n.wp!==(c.scope==='other'?(n.wp||null):c.wp)||n.wp&&(!wp(n.wp)||c.months.some(m=>!calendar.active(wp(n.wp),calendar.projectMonth(config,m)))))throw new Error('Invalid staff effort note or Work Package attribution.');seen.add(k);return {scope:n.scope,id:n.id,wp:n.wp,text:n.text};});
    }
    function validateReport(report,{complete=false}={}){
      const env=report.staff_effort;if(!env){if(report.schema_version==='2.5')throw new Error('Staff effort data is missing.');return [];}
      if(report.report_type!=='tasks'||env.unit!=='PM'||env.allocation_version!==VERSION||!Array.isArray(env.rows)||env.rows.length>15000)throw new Error('Invalid staff effort data or allocation version.');
      const period=report.reporting_period;if(!config.partners.some(p=>p.code===report.partner?.code)||!Array.isArray(period?.selected_months)||period.selected_months.length>48||period.selected_months.some((m,i)=>!calendar.projectMonth(config,m)||(i&&m<=period.selected_months[i-1]))||period.selected_months.length&&!calendar.rangePeriod(config,period.start,period.end,period.selected_months))throw new Error('Invalid staff effort partner or reporting period.');validateNotes(report);const ctx=contexts(report),seen=new Set();
      const rows=env.rows.map(r=>{const c=ctx.get(`${r.scope}:${r.id}`),n=calendar.projectMonth(config,r.month);if(!c||!n||!c.months.includes(r.month)||!report.reporting_period.selected_months.includes(r.month))throw new Error('Staff effort is outside the report coverage.');const assignedWp=c.scope==='other'?(r.wp||null):c.wp;if(assignedWp&&(!wp(assignedWp)||!calendar.active(wp(assignedWp),n)))throw new Error('Staff effort Work Package is invalid for this month.');if(r.wp!==assignedWp||r.note!==undefined&&(typeof r.note!=='string'||r.note.length>10000))throw new Error('Invalid staff effort attribution or note.');const u=units(r.pm);if(c.noWork&&u!==0)throw new Error('A no-work Task must have zero staff effort.');const k=key(r);if(seen.has(k))throw new Error('Duplicate staff effort month.');seen.add(k);return {scope:r.scope,id:r.id,wp:assignedWp,month:r.month,pm:decimal(u),...(r.note?{note:r.note}:{})};});
      if(complete){for(const t of report.tasks||[])for(const month of t.coverage.months)if(!seen.has(key({scope:'task',id:t.id,month})))throw new Error(`Enter staff effort for ${t.id} in ${month}, including 0 when none was used.`);for(const e of report.additional_contributions||[]){if(e.kind==='general')continue;const scope=e.kind==='task'?'task':'work_package';for(const month of e.months)if(!seen.has(key({scope,id:e.id,month})))throw new Error(`Enter staff effort for ${e.id} in ${month}, including 0 when none was used.`);}}
      return rows;
    }
    function confirmed(snapshot){
      const versions=new Map();for(const r of snapshot.report_registry||[]){if(r.status!=='verified')continue;const prior=versions.get(r.report_code);if(!prior||prior.revision<r.revision)versions.set(r.report_code,r);}
      const seen=new Map(),result=[];
      for(const r of snapshot.staff_effort_records||[]){const active=versions.get(r.report_code);if(!active||active.revision!==r.revision||active.partner!==r.partner||active.report_type!=='tasks')continue;if(!config.partners.some(p=>p.code===r.partner)||!active.selected_months.includes(r.month)||!calendar.projectMonth(config,r.month))throw new Error('Published staff effort has invalid coverage.');if(!['task','work_package','other'].includes(r.scope)||r.scope==='task'&&(!task(r.id)||task(r.id).wp!==r.wp||!calendar.active(task(r.id),calendar.projectMonth(config,r.month)))||r.scope==='work_package'&&(r.id!==r.wp||!wp(r.wp)))throw new Error('Published staff effort has invalid attribution.');if(r.wp&&(!wp(r.wp)||!calendar.active(wp(r.wp),calendar.projectMonth(config,r.month))))throw new Error('Published WP effort is outside its active months.');units(r.pm);const k=`${r.partner}:${key(r)}`,old=seen.get(k);if(old){if(old.report_code!==r.report_code||old.pm!==r.pm||old.note!==r.note)throw new Error('Published staff effort contains conflicting overlapping reports.');continue;}seen.set(k,r);result.push(r);}
      return result;
    }
    const total=rows=>rows.reduce((s,r)=>{const value=s+units(r.pm);if(!Number.isSafeInteger(value))throw new Error('Staff effort total exceeds supported precision.');return value;},0);
    const value={plannedTask,plannedWp,taskTotal:(p,id)=>taskTotals.get(`${p}:${id}`)||0,allMonths,contexts,validateNotes,validateReport,confirmed,total,source:data};cache.set(config,{calendar,data,value});return value;
  }
  const api={SCALE,VERSION,units,decimal,format,key,splitTotal,entryMode,create};root.SECRETT_EFFORT=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
