// Isolated browser QA: fixture account/API/worker, real site DOM and event handlers.
const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),out=process.env.HINT_QA_OUTPUT;
const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(req.url.split('?')[0]);
  const file=path.resolve(root,'.'+(name.endsWith('/')?name+'index.html':name));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.json')?'application/json':file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],requests=[];
    page.on('pageerror',error=>errors.push(String(error)));
    await page.addInitScript(()=>{
      window.__hintClockShift=0;const now=Date.now.bind(Date);Date.now=()=>now()+window.__hintClockShift;
      window.Worker=class{constructor(){setTimeout(()=>this.onmessage?.({data:{type:'ready'}}),50);}terminate(){}postMessage(){}};
    });
    let nextHint=1,fail=false,release=null;
    const account={token:'a'.repeat(64),student:{id:'hint-ui-fixture',section:'01',student_no:'99101299',name:'힌트 QA',current_problem:'P57',current_language:'python'},drafts:[],passed:[],languages:['python','c','java']};
    await page.route('https://tltrbkttwzvwghaplurl.supabase.co/functions/v1/algorithm-lab',async route=>{
      const body=route.request().postDataJSON();
      if(body.action==='ai-hint'){
        requests.push(body);
        if(fail){fail=false;await route.fulfill({status:503,json:{error:'AI 힌트를 받지 못했습니다. 잠시 후 다시 시도하세요.'}});return;}
        if(release){await new Promise(resolve=>{release=resolve;});}
        const hints=['두 배열의 첫 미처리 원소를 비교할 i와 j를 준비해 보세요.','작은 값을 결과에 넣은 뒤 그 배열의 인덱스만 증가시켜 보세요.','한쪽이 끝난 뒤 나머지를 옮길 반복문도 따로 확인해 보세요.'];
        await route.fulfill({json:{hint:hints[(nextHint++-1)%3],step:body.step,cooldown:15}});return;
      }
      await route.fulfill({json:['enter','state'].includes(body.action)?account:{ok:true}});
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/algorithm-lab/?chapter=4&problem=61&code=python`);
    await page.locator('#account-dialog').waitFor({state:'visible'});
    await page.locator('#account-number').fill('99101299');await page.locator('#account-name').fill('힌트 QA');await page.locator('#account-submit').click();
    await page.locator('#account-dialog').waitFor({state:'hidden'});
    await page.getByRole('button',{name:/정렬 배열 병합/}).click();
    await page.locator('#practice-hints > button').click();
    await page.getByRole('button',{name:'다음 단계',exact:true}).click();
    assert.match(await page.locator('#hint-steps').innerText(),/그쪽 인덱스만/);
    await page.getByRole('button',{name:'다음 단계',exact:true}).click();
    assert.ok((await page.locator('#hint-steps').innerText()).includes('___1___'));
    await page.locator('#hint-steps details details summary').first().click();
    await page.getByRole('button',{name:'다음 단계',exact:true}).click();
    assert.match(await page.locator('#hint-steps pre').first().innerText(),/def merge_arrays/);
    await page.getByRole('button',{name:'이전 단계',exact:true}).click();
    await page.locator('#ai-hint').click();await page.locator('#ai-hint-history details').waitFor();
    assert.equal(requests[0].step,1);assert.equal(requests[0].history.length,0);
    assert.ok(await page.locator('#ai-hint').isDisabled());
    await page.evaluate(()=>{window.__hintClockShift+=16000;aiHintControls();});
    await page.locator('#ai-hint').click();await page.waitForFunction(()=>document.querySelectorAll('#ai-hint-history details').length===2);
    assert.equal(requests[1].step,2);assert.equal(requests[1].history.length,1);
    assert.notEqual(await page.locator('#ai-hint-history details p').nth(0).innerText(),await page.locator('#ai-hint-history details p').nth(1).innerText());
    await page.evaluate(()=>{editor.setValue(getCode()+'\n# edit');});
    assert.equal(await page.locator('#ai-hint-history details').count(),2);
    fail=true;await page.evaluate(()=>{window.__hintClockShift+=16000;aiHintControls();});await page.locator('#ai-hint').click();
    await page.locator('#ai-hint-result').filter({hasText:'받지 못했습니다'}).waitFor();assert.equal(await page.locator('#ai-hint-history details').count(),2);
    await page.reload();await page.locator('#ai-hint-history details').first().waitFor();assert.equal(await page.locator('#ai-hint-history details').count(),2);
    const coverage=await page.evaluate(()=>{
      const all=problems.filter(p=>!LAB_DUPLICATES[p.id]),coverage={};
      for(const lang of ['python','c','java']){
        language=lang;let count=0;
        for(const p of all){
          show(problems.indexOf(p));
          const panel=document.getElementById('practice-hints');panel.querySelector(':scope > button').click();
          const next=panel.querySelector('.hint-navigation button:last-child');
          if(!panel.innerText.includes(p.function))throw Error('Missing signature '+p.id+'/'+lang);
          next.click();if(panel.querySelectorAll('#hint-steps ol li').length!==3)throw Error('Missing steps '+p.id+'/'+lang);
          next.click();if(!panel.querySelector('#hint-steps pre').textContent.includes('___1___'))throw Error('Missing scaffold '+p.id+'/'+lang);
          next.click();if(panel.querySelector('#hint-steps pre').textContent.includes('___1___'))throw Error('Unfinished reference '+p.id+'/'+lang);
          if(!next.hidden)throw Error('Final stage must stop '+p.id+'/'+lang);
          panel.querySelector('.hint-navigation button').click();if(next.hidden)throw Error('Previous stage did not restore next button '+p.id+'/'+lang);
          count++;
        }
        coverage[lang]=count;
      }
      language='python';show(problems.findIndex(p=>p.id==='P57'));return coverage;
    });
    assert.deepEqual(coverage,{python:72,c:72,java:72});
    await page.locator('#practice-hints > button').click();await page.getByRole('button',{name:'다음 단계',exact:true}).click();
    if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'hints-desktop.png'),fullPage:true});}
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),'Mobile must not overflow horizontally.');
    if(out)await page.screenshot({path:path.join(out,'hints-mobile.png'),fullPage:true});
    await page.setViewportSize({width:1440,height:1000});
    await page.locator('#language').selectOption('java');
    if(await page.locator('#judge-reminder').isVisible())await page.locator('#reminder-continue').click();
    await page.waitForFunction(()=>language==='java');
    await page.evaluate(()=>{show(problems.findIndex(p=>p.id==='P66'));window.scrollTo(0,0);});
    assert.match(await page.locator('#statement').innerText(),/역전 쌍은 원래 배열/);
    assert.match(await page.locator('#statement').innerText(),/\(4,2\), \(4,3\), \(7,2\), \(7,3\)/);
    assert.ok(!(await page.locator('#statement').innerText()).includes('Java 중 하나로'));
    await page.locator('#practice-hints > button').click();
    for(let step=0;step<3;step++)await page.getByRole('button',{name:'다음 단계',exact:true}).click();
    assert.match(await page.locator('#hint-steps pre').first().innerText(),/public static int cross_inversions/);
    if(out)await page.screenshot({path:path.join(out,'hints-inversions-java.png'),fullPage:true});
    assert.deepEqual(errors,[]);console.log(JSON.stringify({coverage,aiRequests:requests.length,consoleErrors:errors,verified:['next/previous','per-blank reveal','AI continuation','cooldown','edit/refresh persistence','provider failure','mobile width']},null,2));
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
