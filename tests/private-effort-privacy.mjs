import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { expectedFilename, validate } from '../../coordinator/review.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const report=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/staff-effort-report.json'),'utf8'));
report.staff_effort.rows[0].private_staff_detail='SYNTHETIC PRIVATE STAFF DETAIL';
report.staff_effort.rows[0].note='SYNTHETIC PRIVATE EFFORT NOTE';
report.staff_effort.rows[0].private_metadata={email:'private@example.invalid'};
report.staff_effort.notes=[{scope:'task',id:'T1.1',wp:'WP1',text:'SYNTHETIC PRIVATE SCOPE NOTE'}];
const partner=global.window.AISHA_CONFIG.partners.find(item=>item.code===report.partner.code);
const filename=expectedFilename(report);
assert.equal(validate(report,filename,partner,report.reporting_period),null,'Fixture must pass coordinator intake before testing the public boundary');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'aisha-effort-privacy-'));
try {
  const submissions=path.join(dir,'submissions'),status=path.join(dir,'status.json'),output=path.join(dir,'candidate.json');
  fs.mkdirSync(submissions);
  fs.writeFileSync(path.join(submissions,filename),JSON.stringify(report));
  fs.writeFileSync(status,JSON.stringify({schema_version:'1.0',project:'AISHA',reports:{[report.report_key]:{status:'accepted',revision:report.revision}}}));
  const result=spawnSync(process.execPath,[path.join(root,'../coordinator/compile-dashboard.mjs'),'--submissions',submissions,'--status',status,'--out',output],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||result.stdout);
  const text=fs.readFileSync(output,'utf8'),candidate=JSON.parse(text);
  assert.equal(candidate.staff_effort_records.length,report.staff_effort.rows.length);
  const allowed=['scope','id','wp','month','pm','report_code','revision','partner','report_type','status'].sort();
  for(const row of candidate.staff_effort_records)assert.deepEqual(Object.keys(row).sort(),allowed);
  for(const privateText of ['SYNTHETIC PRIVATE','private@example.invalid','private_staff_detail','private_metadata','audit@example.invalid'])assert(!text.includes(privateText),`Public candidate leaked ${privateText}`);
  assert.equal(candidate.staff_effort_records[0].pm,'15.0000');
  assert.equal(candidate.report_registry.find(item=>item.report_code===report.report_code).revision,report.revision);
  console.log('Private compiler publishes only canonical PM fields; notes, unknown properties and contributor details remain private: PASS');
} finally {
  fs.rmSync(dir,{recursive:true,force:true});
}
