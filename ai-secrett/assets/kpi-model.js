(function(root){
  'use strict';
  const activityId=entry=>String(entry.activity_id||'').trim().toUpperCase();
  const validActivityId=id=>!id||/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+){2,8}$/.test(id)&&id.length<=80;
  const key=entry=>JSON.stringify([entry.id,activityId(entry)||(entry.scope||'').trim()]);
  const type=item=>item.input_type||(item.unit==='status'?'status':item.unit==='%'?'percent':['EUR','minutes'].includes(item.unit)?'decimal':'count');
  function validate(entry,item){
    if(!item||entry.name!==item.name||entry.unit!==item.unit||entry.group!==item.group)throw new Error('The contribution does not match the indicator catalogue.');
    if(typeof entry.scope!=='undefined'&&typeof entry.scope!=='string')throw new Error('Invalid programme, cohort or campaign reference.');
    if(typeof entry.activity_id!=='undefined'&&typeof entry.activity_id!=='string')throw new Error('Invalid shared activity code.');
    const scope=(entry.scope||'').trim(),kind=type(item),max=Object.hasOwn(item,'max_value')?item.max_value:kind==='percent'?100:1e12;
    if(scope.length>500)throw new Error('Invalid programme, cohort or campaign reference.');
    if(item.requires_scope&&!scope)throw new Error('Name the programme, cohort, campaign or output measured.');
    const shared=activityId(entry);if(!validActivityId(shared))throw new Error('Use a coordinator-issued shared activity code, such as CAM-2026-01, or leave it blank.');
    if(kind==='status'?!['in_progress','achieved'].includes(entry.value):typeof entry.value!=='number'||!Number.isFinite(entry.value)||entry.value<(item.allow_negative?-1e12:0)||(max!==null&&entry.value>max)||Math.abs(entry.value)>1e12||(kind==='count'&&!Number.isSafeInteger(entry.value))||(kind!=='count'&&Math.abs(entry.value*100-Math.round(entry.value*100))>1e-7))throw new Error(`Enter a valid ${item.unit} value for ${item.name}.`);
    if(typeof entry.basis!=='string'||entry.basis.length>500||(kind==='percent'||item.requires_basis)&&!entry.basis.trim())throw new Error('Add the calculation method, measurement scale and source.');
    if(typeof entry.evidence!=='string'||!entry.evidence.trim()||entry.evidence.length>10000||!['uploaded','will_upload'].includes(entry.proof_status))throw new Error('Add an evidence reference and confirm when the proof is or will be on Nextcloud.');
    const n=entry.numerator,d=entry.denominator,hasN=n!==undefined&&n!==null,hasD=d!==undefined&&d!==null;
    if(item.requires_pair&&(!hasN||!hasD))throw new Error('Add both values used to calculate this percentage.');
    if(hasN!==hasD||hasN&&(kind!=='percent'||!Number.isFinite(n)||!Number.isFinite(d)||n<0||d<=0||n>1e12||d>1e12))throw new Error('Enter both calculation counts, with a positive denominator.');
    if(hasN){const calculated=Math.round((item.rate_mode==='growth'?(n-d)/d:n/d)*10000)/100;if(Math.abs(calculated-entry.value)>0.001)throw new Error(`The calculation gives ${calculated}%. Check the entered percentage.`);}
    return {id:item.id,name:item.name,unit:item.unit,group:item.group,value:entry.value,scope,...(shared?{activity_id:shared}:{}),basis:entry.basis.trim(),evidence:entry.evidence,proof_status:entry.proof_status,...(hasN?{numerator:n,denominator:d}:{})};
  }
  root.SECRETT_KPI_MODEL={key,type,validate,validActivityId};
})(typeof window==='undefined'?globalThis:window);
