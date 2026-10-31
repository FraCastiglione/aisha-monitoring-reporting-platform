import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// Execute the complete app entry point with native-fragment/restoration events.
function boot(hash) {
  const nodes=new Map(),events=new Map(),scrolls=[];
  const node=()=>({hidden:false,disabled:false,required:false,value:'',attributes:{},listeners:{},append(){},setAttribute(k,v){this.attributes[k]=v;},getAttribute(k){return this.attributes[k]??null;},removeAttribute(k){delete this.attributes[k];},addEventListener(k,fn){this.listeners[k]=fn;},querySelector(){return node();},querySelectorAll(){return [];}});
  const get=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);};
  const links=['reporting','dashboard','instructions'].map(view=>Object.assign(node(),{attributes:{href:'#'+view}}));
  const brand=Object.assign(node(),{attributes:{href:'#reporting'}});
  const document={getElementById:get,createElement:node,querySelector:s=>links[['reporting','dashboard','instructions'].findIndex(view=>s.includes(`"${view}"`))],querySelectorAll:s=>s.startsWith('.site-header')?[brand,...links]:[]};
  const window={AISHA_CONFIG:{partners:[]},history:{scrollRestoration:'auto'},location:{hash},scrollTo:options=>scrolls.push(options),addEventListener:(event,fn)=>events.set(event,fn)};
  vm.runInNewContext(fs.readFileSync(new URL('../assets/app.js',import.meta.url),'utf8'),{window,document,Set,Array,Event,CustomEvent:class{}});
  return {window,document,nodes,events,scrolls,links,brand};
}
for(const hash of ['', '#reporting','#dashboard','#instructions']){
  const app=boot(hash);assert.equal(app.scrolls.at(-1).top,0);assert.equal(app.scrolls.at(-1).behavior,'instant');
  assert.equal(app.window.history.scrollRestoration,'manual','Page routes must suppress late browser scroll restoration');
  app.events.get('pageshow')({persisted:false});assert.equal(app.scrolls.length,2,'Fresh opens and reloads reset after browser restoration');
  const count=app.scrolls.length;app.events.get('pageshow')({persisted:true});assert.equal(app.scrolls.length,count,'Returning to a cached in-progress document preserves position');
}
for(const hash of ['#contributor-title','#main','#reporting-title']){
  const app=boot(hash);app.events.get('pageshow')({persisted:false});assert.equal(app.scrolls.length,0,'Intentional in-page anchors must retain their own position');
  assert.equal(app.window.history.scrollRestoration,'auto');
}
const app=boot('#reporting');let prevented=0;const click={button:0,preventDefault(){prevented++;}};
app.brand.listeners.click(click);app.links[0].listeners.click(click);assert.equal(prevented,2,'Already-active home links must still return to the header');
for(const modifier of ['metaKey','ctrlKey','shiftKey','altKey'])app.brand.listeners.click({...click,[modifier]:true});assert.equal(prevented,2,'Modified clicks retain normal new-tab behavior');
app.window.location.hash='#dashboard';app.events.get('hashchange')();assert.equal(app.nodes.get('dashboard').hidden,false);assert.equal(app.nodes.get('reporting').hidden,true);assert.equal(app.scrolls.at(-1).top,0);
const count=app.scrolls.length;app.window.location.hash='#contributor-title';app.events.get('hashchange')();assert.equal(app.nodes.get('reporting').hidden,false);assert.equal(app.scrolls.length,count,'Start a report still jumps to contributor details');
console.log('Page navigation: initial root/routes, reload restoration, cached returns, same-route home links, modified clicks and in-page anchors PASS');
