// Real browser runtimes; every classroom API request is intercepted locally.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..');
const out=process.env.CH7_QA_OUTPUT||path.join(root,'../DJU-Algo/outputs/ch7-challenges-20261103');
fs.mkdirSync(out,{recursive:true});
const bank=JSON.parse(fs.readFileSync(path.join(root,'algorithm-lab/challenge-problems.json'),'utf8'));
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(req.url.split('?')[0]);
  const file=path.resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{
    const b=fs.readFileSync(file),ext=path.extname(file);
    res.setHeader('Content-Type',({'.js':'application/javascript','.json':'application/json','.css':'text/css','.html':'text/html','.wasm':'application/wasm'})[ext]||'application/octet-stream');
    if(req.headers.range){const m=req.headers.range.match(/bytes=(\d+)-(\d*)/),start=+m[1],end=m[2]?+m[2]:b.length-1;res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${b.length}`,'Content-Length':end-start+1});res.end(b.subarray(start,end+1));}
    else res.end(b);
  }catch{res.writeHead(404).end();}
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base=process.env.CH7_QA_BASE||`http://127.0.0.1:${server.address().port}/`;
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const reports=[];
  try{
    for(const language of ['python','c','java']){
      const context=await browser.newContext({viewport:{width:1440,height:1050}}),api=[];
      await context.route('**/functions/v1/algorithm-lab',async route=>{
        const payload=route.request().postDataJSON();api.push(payload);
        assert.ok(['touch','draft','submit'].includes(payload.action),'Unexpected classroom API action '+payload.action);
        if(payload.problem)assert.ok(bank.some(p=>p.id===payload.problem));
        return route.fulfill({json:{ok:true}});
      });
      await context.route('**/js/site-analytics.js*',route=>route.fulfill({contentType:'application/javascript',body:''}));
      const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(base+`algorithm-lab/?chapter=7&problem=7-5&code=${language}`);
      await page.waitForFunction(()=>document.querySelector('#chapter-count')?.textContent==='6');
      await page.evaluate(()=>{
        document.querySelectorAll('dialog[open]').forEach(d=>d.close());
        document.querySelectorAll('[inert]').forEach(n=>n.inert=false);
        document.body.classList.remove('account-required');
        cloud.session={token:'local-intercepted-qa',student:{id:'qa-local',section:'01',student_no:'00000000',name:'Local QA'}};
        cloud.supported=new Set(['F07-05','F07-06','F07-07']);cloud.languages=new Set(['python','c','java']);
        controls();
      });
      await page.waitForFunction(()=>ready,{},{timeout:240000});
      for(const p of bank){
        await page.evaluate(id=>show(problems.findIndex(p=>p.id===id)),p.id);
        assert.equal(await page.locator('#title').innerText(),p.title);
        assert.equal(await page.locator('#level').innerText(),'도전문제');
        assert.doesNotMatch(await page.locator('#meta').innerText(),/null|PPTX/);
        assert.equal(await page.locator('#examples pre').count(),4);
        const hint=await page.evaluate(()=>practiceHintData(problems[index],language));
        assert.equal(hint.steps.length,3);assert.ok(hint.solution.includes(p.function));
        // Submit an incorrect implementation as well as the full reference.
        if(p.id==='F07-05'){
          await page.evaluate(()=>setCode(starter(problems[index]),true));
          await page.locator('#judge').click();await page.waitForFunction(()=>!busy);
          assert.equal(await page.locator('#result').getAttribute('class'),'error');
        }
        const code=language==='python'?p.solution:language==='c'?p.c.solution:p.java.solution;
        await page.evaluate(code=>setCode(code,true),code);
        await page.locator('#judge').click();
        await page.waitForFunction(()=>!busy,{},{timeout:90000});
        const result=await page.locator('#result').innerText();
        assert.equal(await page.locator('#result').getAttribute('class'),'success',language+' '+p.id+': '+result);
        assert.equal(await page.locator('#case-results p').count(),p.tests.length);
        await page.evaluate(()=>document.querySelector('.custom-input-panel').open=true);
        await page.locator('#custom-run').click();await page.waitForFunction(()=>!busy,{},{timeout:90000});
        assert.match(await page.locator('#result').innerText(),/직접 실행 완료/,language+' custom '+p.id);
        assert.equal(await page.locator('#case-results pre').nth(1).innerText(),String(p.tests.find(t=>t.public).expected));
        reports.push({language,id:p.id,cases:p.tests.length,custom:true});
        console.log(language+' '+p.id+' '+p.tests.length+'/'+p.tests.length+' + direct input');
        if(language==='python'){
          await page.locator('#title').scrollIntoViewIfNeeded();
          await page.screenshot({path:path.join(out,p.id+'-desktop.png')});
        }
      }
      await page.waitForFunction(()=>!cloud.flushing&&!cloud.queue.length);
      assert.equal(api.filter(x=>x.action==='submit').length,4);
      assert.deepEqual(errors,[]);
      await context.close();
    }
    const mobile=await browser.newContext({viewport:{width:390,height:844}});
    await mobile.route('**/worker.js*',r=>r.fulfill({contentType:'application/javascript',body:'postMessage({type:"ready"})'}));
    await mobile.route('**/functions/v1/algorithm-lab',r=>r.abort());
    await mobile.route('**/js/site-analytics.js*',r=>r.fulfill({contentType:'application/javascript',body:''}));
    const page=await mobile.newPage();await page.goto(base+'algorithm-lab/?chapter=7&problem=7-7');
    await page.waitForFunction(()=>document.querySelector('#chapter-count')?.textContent==='6');
    await page.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());document.querySelectorAll('[inert]').forEach(n=>n.inert=false);document.body.classList.remove('account-required');});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Mobile horizontal overflow');
    await page.screenshot({path:path.join(out,'F07-07-mobile.png'),fullPage:true});await mobile.close();
    fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({reports,productionWrites:0,mobileWidth:390},null,2));
    console.log('All three languages, incorrect answers, direct inputs, local save queue and mobile layout passed.');
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
