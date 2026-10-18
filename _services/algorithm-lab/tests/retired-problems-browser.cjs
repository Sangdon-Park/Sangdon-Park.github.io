const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..');
const bank=['problems','chapter-02','exercise-problems'].flatMap(name=>JSON.parse(fs.readFileSync(path.join(root,'algorithm-lab',name+'.json'))));
const retiredIndex=bank.findIndex(p=>p.id==='P75');
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.json')?'application/json':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=process.env.PRACTICE_QA_BASE||`http://127.0.0.1:${server.address().port}/`;
 const origin=new URL(base).origin;
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of [1440,390])for(const language of ['python','c','java']){
   const context=await browser.newContext({viewport:{width,height:960}});
   await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(/\/(?:c-|java-)?worker\.js$/.test(url.pathname))return route.fulfill({contentType:'application/javascript',body:'postMessage({type:"ready"});'});
    if(url.pathname==='/js/site-analytics.js')return route.fulfill({contentType:'application/javascript',body:''});
    // No production API calls, logins or student mutations during QA.
    if(url.origin!==origin)return route.abort();
    return route.continue();
   });
   await context.addInitScript(({retiredIndex,language})=>{
    const key=language==='python'?'P75':language+':P75';
    localStorage.setItem('dju-algorithm-lab-v1',JSON.stringify({index:retiredIndex,language,answers:{[key]:'saved ATM answer'},passed:{[key]:{code:'saved ATM answer',passed:4,total:4}}}));
   },{retiredIndex,language});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto(base+`algorithm-lab/index.html?chapter=5&problem=99&code=${language}&verify=retire-atm`);
   await page.waitForFunction(()=>document.getElementById('chapter-count').textContent==='9');
   assert.deepEqual(await page.locator('#problems .problem-id').allTextContents(),['91','92','93','94','95','96','97','98','100']);
   assert.equal(new URL(page.url()).searchParams.get('problem'),'91');
   assert.equal(await page.locator('#progress').innerText(),'0 / 9 해결');
   assert.equal(await page.evaluate(()=>{show(problems.findIndex(p=>p.id==='P75'));return problems[index].id;}),'P67');
   const downloadPromise=page.waitForEvent('download');
   await page.evaluate(()=>document.getElementById('download').click());
   const download=await downloadPromise,output=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
   assert.equal(output.total,9);assert.equal(output.answers.some(p=>p.id==='P75'),false);
   assert.equal(output.archivedAnswers.find(p=>p.id==='P75').code,'saved ATM answer');
   assert.equal(output.archivedAnswers.find(p=>p.id==='P75').retired,true);
   assert.deepEqual(errors,[]);
   console.log(`Student ATM retirement ${language}/${width}: 9 exercises, direct link/restore guarded, archived download preserved.`);
   await context.close();
  }
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
