(function () {
  'use strict';
  // Compare the actual saved file, not its name or an assumed browser receipt.
  async function sameBytes(expected, actual) {
    if (expected.size !== actual.size) return false;
    const [a,b]=await Promise.all([expected.arrayBuffer(),actual.arrayBuffer()]);
    const left=new Uint8Array(a),right=new Uint8Array(b);
    return left.every((byte,index)=>byte===right[index]);
  }
  const makeDialog=(id,html)=>{const dialog=document.createElement('dialog');dialog.id=id;dialog.innerHTML=html;document.body.append(dialog);return dialog;};
  const receipt=makeDialog('saved-copy-dialog',`<div class="individual-pdf-content"><p class="overline">KEEP YOUR REPORT</p><h2 id="saved-copy-title">Save and check your copy</h2><p id="saved-copy-name"></p><p>The file is ready. If the download did not start, use the button below. After saving, you can check that your copy matches this file exactly. This check stays on your device and does not import or change your report.</p><div class="review-actions"><a id="saved-copy-download" class="button button-primary" download>Download file</a><a id="saved-copy-open" class="button button-secondary" target="_blank" rel="noopener">Open PDF</a><label for="saved-copy-file" class="button button-secondary file-label">Check saved file</label><input id="saved-copy-file" type="file" hidden></div><p id="saved-copy-result" class="form-message" role="status">Download requested. Your browser controls where the file is saved.</p><button id="saved-copy-close" class="text-button" type="button">Close</button></div>`);
  receipt.setAttribute('aria-labelledby','saved-copy-title');
  const find=id=>document.getElementById(id);
  let current=null,ownedUrl=null;
  function offer(blob,name,url){
    if(ownedUrl){URL.revokeObjectURL(ownedUrl);ownedUrl=null;}
    if(!url){ownedUrl=URL.createObjectURL(blob);url=ownedUrl;}
    current={blob,name,url};
    find('saved-copy-name').textContent=name;
    const link=find('saved-copy-download');link.href=url;link.download=name;
    const open=find('saved-copy-open');open.hidden=!name.toLowerCase().endsWith('.pdf');open.href=url;
    find('saved-copy-file').value='';
    find('saved-copy-result').textContent='Download requested. Your browser controls where the file is saved.';
    if(!receipt.open)receipt.showModal();
  }
  function attach(link,blob){
    link.onclick=()=>{if(link.getAttribute('aria-disabled')!=='true')offer(blob,link.download,link.href);};
  }
  function download(blob,name){offer(blob,name);find('saved-copy-download').click();}
  find('saved-copy-close').addEventListener('click',()=>receipt.close());
  find('saved-copy-download').addEventListener('click',()=>{find('saved-copy-result').textContent='Download requested. Choose “Check saved file” after it finishes to verify your copy.';});
  find('saved-copy-file').addEventListener('change',async event=>{
    const file=event.target.files?.[0],expected=current;event.target.value='';if(!file||!expected)return;
    find('saved-copy-result').textContent='Checking your saved copy…';
    try{const matches=await sameBytes(expected.blob,file);if(current!==expected)return;find('saved-copy-result').textContent=matches?'Saved copy verified. Its complete contents match the generated file.':'This copy does not match the generated file. Download it again, then select the newly saved copy.';}
    catch{if(current===expected)find('saved-copy-result').textContent='Could not read this copy. Try selecting the saved file again.';}
  });
  const recovery=makeDialog('pdf-recovery-dialog',`<div class="individual-pdf-content"><p class="overline">CONTINUE YOUR REPORT</p><h2 id="pdf-recovery-title">This PDF needs its editable backup</h2><p>This PDF has no embedded AI-AI-SECRETT report data. A scanned PDF, an ordinary PDF, or a PDF resaved by another application cannot reliably restore the answers automatically. Your current report is unchanged.</p><p id="pdf-recovery-scope"></p><p>Choose its matching AI-AI-SECRETT JSON backup. If you do not have one, open the PDF as a reference and copy your answers into the reporting form.</p><div class="review-actions"><label for="pdf-recovery-file" class="button button-primary file-label">Choose matching JSON</label><input id="pdf-recovery-file" type="file" accept=".json,application/json" hidden><a id="pdf-recovery-open" class="button button-secondary" target="_blank" rel="noopener">Open PDF for reference</a><button id="pdf-recovery-manual" class="button button-secondary" type="button">Continue reporting manually</button></div><button id="pdf-recovery-close" class="text-button" type="button">Cancel</button></div>`);
  recovery.setAttribute('aria-labelledby','pdf-recovery-title');
  let recoveryUrl=null,recoverJson=null,recoverManual=null;
  function recover(file,onJson,onManual,scope){
    if(recoveryUrl)URL.revokeObjectURL(recoveryUrl);
    recoveryUrl=URL.createObjectURL(file);find('pdf-recovery-open').href=recoveryUrl;
    find('pdf-recovery-scope').textContent=scope;recoverJson=onJson;recoverManual=onManual;find('pdf-recovery-file').value='';
    if(!recovery.open)recovery.showModal();
  }
  find('pdf-recovery-close').addEventListener('click',()=>recovery.close());
  find('pdf-recovery-manual').addEventListener('click',()=>{recovery.close();recoverManual?.();});
  find('pdf-recovery-file').addEventListener('change',event=>{const file=event.target.files?.[0];event.target.value='';if(!file)return;recovery.close();recoverJson?.(file);});
  window.SECRETT_FILES=Object.freeze({download,attach,recover,sameBytes});
})();
