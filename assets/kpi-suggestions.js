(function(root){
  'use strict';
  // Curated links to Agreement-backed indicators. Suggestions never become report entries automatically.
  const rules=[
    {id:'unique_visitors',terms:/\b(?:unique\s+(?:website\s+)?visitors?|website\s+unique\s+visitors?)\b/i,value:/\b([\d][\d,.]*)\s+(?:unique\s+(?:website\s+)?visitors?|website\s+unique\s+visitors?)\b/i},
    {id:'social_followers',terms:/\b(?:social(?:\s+media)?\s+followers?|combined\s+followers?)\b/i,value:/\b([\d][\d,.]*)\s+(?:social(?:\s+media)?\s+followers?|combined\s+followers?)\b/i},
    {id:'media_mentions',terms:/\b(?:media|press)\s+mentions?\b/i,value:/\b([\d][\d,.]*)\s+(?:media|press)\s+mentions?\b/i},
    {id:'policy_briefs',terms:/\bpolicy\s+briefs?\b/i,value:/\b([\d][\d,.]*)\s+policy\s+briefs?\b/i},
    {id:'communication_activities',terms:/\b(?:communication|outreach)\s+activities\b|\b(?:held|organised|organized|delivered)\s+(?:\w+\s+){0,3}(?:webinars?|workshops?|roadshows?)\b/i,value:/\b([\d][\d,.]*)\s+(?:communication|outreach)\s+activities\b/i},
    {id:'webinar_attendance',terms:/\bwebinars?\b.{0,70}\b(?:attendees?|attendance|participants?)\b|\b(?:attendees?|attendance|participants?)\b.{0,70}\bwebinars?\b/i,value:/\b([\d][\d,.]*)\s+(?:webinar\s+)?(?:attendees?|participants?)\b/i},
    {id:'campaign_conversion',terms:/\b(?:application|registration|campaign)\s+conversion\s+rate\b|\bconverted\s+to\s+(?:applications?|registrations?)\b/i},
    {id:'social_engagement_rate',terms:/\bsocial(?:\s+media)?\s+engagement\s+rate\b/i},
    {id:'course_participants',terms:/\bcourse\s+participants?\b/i,value:/\b([\d][\d,.]*)\s+course\s+participants?\b/i},
    {id:'he_enrolments_per_cycle',terms:/\b(?:higher\s+education|HE)\s+enrolments?\b/i,value:/\b([\d][\d,.]*)\s+(?:higher\s+education|HE)\s+enrolments?\b/i},
    {id:'practitioner_publications',terms:/\b(?:practitioner|technical)\s+publications?\b/i,value:/\b([\d][\d,.]*)\s+(?:practitioner|technical)\s+publications?\b/i},
    {id:'webinar_retention',terms:/\bwebinar\s+(?:attendance\s+)?retention\b/i},
  ];
  const planned=/\b(?:will|plan(?:ned|ning)?|aim(?:ing)?|target|expected|intend|hope)\b/i;
  function number(text){const clean=text.replace(/,/g,'');const n=Number(clean);return Number.isSafeInteger(n)&&n>=0&&n<1e9?n:null;}
  function segments(text){return String(text||'').split(/(?<=[.!?])\s+|\n+/).map(s=>s.trim()).filter(s=>s.length>=8).slice(0,200);}
  function suggest(passages,catalogue,{partnerCode='',limit=8}={}){
    const byId=new Map((catalogue||[]).map(item=>[item.id,item])),found=new Map();
    for(const passage of passages||[]){
      for(const sentence of segments(passage.text))for(const rule of rules){
        const item=byId.get(rule.id);if(!item||!rule.terms.test(sentence))continue;
        const taskMatch=Boolean(passage.taskId&&item.related_tasks?.includes(passage.taskId));
        const score=2+(taskMatch?3:0)+(item.suggested_partners?.includes(partnerCode)?1:0);
        const match=rule.value?.exec(sentence),proposedValue=match&&!planned.test(sentence)&&item.input_type==='count'?number(match[1]):null;
        const prior=found.get(rule.id);
        if(!prior||score>prior.score)found.set(rule.id,{id:rule.id,score,quote:sentence.slice(0,240),source:passage.source||'Report text',taskId:passage.taskId||'',proposedValue});
        else if(prior&&proposedValue!==null&&prior.proposedValue!==null&&proposedValue!==prior.proposedValue)prior.proposedValue=null;
      }
    }
    return [...found.values()].sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,limit);
  }
  root.AISHA_KPI_SUGGESTIONS={suggest};
})(typeof window==='undefined'?globalThis:window);
