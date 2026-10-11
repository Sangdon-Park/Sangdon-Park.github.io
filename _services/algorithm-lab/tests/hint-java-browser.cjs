// Actual Java 8 compiler/JVM: every visible reference, original tests and mutation checks.
const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..');
const server=http.createServer((req,res)=>{
  if(req.url==='/test'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Java hint validation</title>');return;}
  const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{
    res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':'application/octet-stream');
    const bytes=fs.readFileSync(file);res.setHeader('Accept-Ranges','bytes');
    if(req.headers.range){const m=req.headers.range.match(/bytes=(\d+)-(\d*)/),start=Number(m[1]),end=m[2]?Number(m[2]):bytes.length-1;res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${bytes.length}`,'Content-Length':end-start+1});res.end(bytes.subarray(start,end+1));}
    else res.end(bytes);
  }catch{res.writeHead(404).end();}
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  console.log('Java hint: launch');
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try{
    const page=await browser.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(String(error)));
    page.on('console',message=>{if(message.text().startsWith('Java hint:'))console.log(message.text());});
    if(process.argv.includes('--debug')){
      page.on('requestfailed',request=>console.log('Java hint: failed '+request.url()+' '+request.failure()?.errorText));
      await page.route('**/java-worker.js',async route=>{
      let source=fs.readFileSync(path.join(root,'algorithm-lab/java-worker.js'),'utf8');
      for(const name of ['await cheerpjInit','const jar=await fetch','lib=await cheerpjRunLibrary','compiler=await lib.org','const response=await fetch'])source=source.replace(name,'self.postMessage({type:"phase",phase:'+JSON.stringify(name)+'});'+name);
      await route.fulfill({contentType:'application/javascript',body:source});
      });
    }
    await page.goto(`http://127.0.0.1:${server.address().port}/test`);
    for(const name of ['java-problems.js','java-hint-references.js','problem-catalog.js']){await page.addScriptTag({url:'/algorithm-lab/'+name});console.log('Java hint: loaded '+name);}
    console.log('Java hint: boot runtime');
    const reports=await page.evaluate(async()=>{
      const worker=new Worker('/algorithm-lab/java-worker.js');
      const wait=()=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Java worker timeout')),240000);worker.onerror=error=>{clearTimeout(timer);reject(Error(error.message));};worker.onmessage=({data})=>{if(data.type==='phase'){console.log('Java hint: phase '+data.phase);return;}clearTimeout(timer);resolve(data);};});
      const boot=await wait();if(boot.type!=='ready')throw Error(JSON.stringify(boot));
      const bank=(await Promise.all(['problems','chapter-02','exercise-problems'].map(f=>fetch('/algorithm-lab/'+f+'.json').then(r=>r.json())))).flat().filter(p=>!LAB_DUPLICATES[p.id]);
      const reports=[];
      for(const p of bank){
        const pending=wait();worker.postMessage({token:reports.length,problem:p,cases:p.tests,code:javaHintReference(p)});
        const result=await pending,report=result.report;
        if(report.error||report.passed!==report.total)throw Error(p.id+' '+JSON.stringify(report));
        reports.push({problem:p.id,passed:report.passed,total:report.total});console.log('Java hint: '+p.id+' '+report.passed+'/'+report.total);
      }
      worker.terminate();return reports;
    });
    assert.equal(reports.length,72);assert.deepEqual(errors,[]);
    const summary={problems:reports.length,cases:reports.reduce((sum,r)=>sum+r.total,0),errors};
    if(process.env.HINT_QA_OUTPUT)fs.writeFileSync(path.join(process.env.HINT_QA_OUTPUT,'java-reference-report.json'),JSON.stringify({summary,reports},null,2));
    console.log('Java reference coverage: '+JSON.stringify(summary));
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
