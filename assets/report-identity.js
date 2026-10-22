(function(root){
  'use strict';
  const valid = code => /^AISHA-[A-Z0-9.-]+-(?:TASKS|COMM)-[A-F0-9]{20,32}$/.test(String(code||''));
  const partnerToken=partner=>String(partner||'').toUpperCase().replace(/[^A-Z0-9.]+/g,'-').replace(/^-|-$/g,'');
  const make = (partner,type) => {
    const safe=partnerToken(partner);
    const kind=type==='communication'?'COMM':'TASKS';
    if(!root.crypto?.getRandomValues)throw new Error('Secure report-code generation is unavailable in this browser. Please use an up-to-date browser or a secure connection.');
    const bytes=new Uint8Array(16);root.crypto.getRandomValues(bytes);
    return `AISHA-${safe}-${kind}-${[...bytes].map(n=>n.toString(16).padStart(2,'0')).join('').toUpperCase()}`;
  };
  const activeVersions = registry => {
    const latest=new Map();
    for(const item of Array.isArray(registry)?registry:[]){
      if(!valid(item?.report_code)||!Number.isInteger(item.revision)||item.revision<1||item.status!=='verified')continue;
      const previous=latest.get(item.report_code);
      if(!previous||item.revision>previous.revision)latest.set(item.report_code,item);
    }
    return latest;
  };
  root.AISHA_REPORT_IDENTITY={valid,partnerToken,make,activeVersions};
})(typeof window==='undefined'?globalThis:window);
