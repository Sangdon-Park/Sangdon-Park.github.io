// NODE_PATH may point to the installed Playwright package directory.
const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..');
const server=http.createServer((req,res)=>{
  if(req.url==='/test'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Java tests</title>');return;}
  const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':'application/octet-stream');const bytes=fs.readFileSync(file);res.setHeader('Accept-Ranges','bytes');if(req.headers.range){const m=req.headers.range.match(/bytes=(\d+)-(\d*)/);const start=Number(m[1]),end=m[2]?Number(m[2]):bytes.length-1;res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${bytes.length}`,'Content-Length':end-start+1});res.end(bytes.subarray(start,end+1));}else res.end(bytes);}catch{res.writeHead(404).end();}
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try{
    const page=await browser.newPage();
    const errors=[];
    page.on('console',m=>console.log('browser:',m.text()));page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(`http://127.0.0.1:${server.address().port}/test`);
    if(!process.argv.includes('--ui-only')) {
    await page.addScriptTag({url:'/algorithm-lab/java-problems.js'});
    const result=await page.evaluate(async(all)=>{
      const worker=new Worker('/algorithm-lab/java-worker.js');
      const wait=()=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Java worker timed out')),240000);worker.onerror=e=>{clearTimeout(timer);reject(Error(e.message));};worker.onmessage=({data})=>{if(data.type==='phase')return;clearTimeout(timer);resolve(data);};});
      let next=wait();const boot=await next;if(boot.type!=='ready')throw Error(JSON.stringify(boot));
      const banks=await Promise.all(['problems','chapter-02','exercise-problems'].map(f=>fetch('/algorithm-lab/'+f+'.json').then(r=>r.json())));
      const problems=banks.flat(),reports=[];
      const run=async(id,code)=>{const problem=problems.find(p=>p.id===id);const pending=wait();worker.postMessage({token:reports.length,problem,cases:problem.tests,code});const result=await pending;reports.push({id,report:result.report});};
      await run('P01','public class Solution { public static int linear_search(int[] A,int target){for(int i=0;i<A.length;i++)if(A[i]==target)return i;return -1;} }');
      await run('P01','public class Solution { public static int linear_search(int[] A,int target){return -99;} }');
      await run('P01','public class Solution { public static int linear_search(int[] A,int target){return missing;} }');
      await run('P55','public class Solution { public static long fibonacci(int n){long a=0,b=1;for(int i=0;i<n;i++){long c=a+b;a=b;b=c;}return a;} }');
      await run('P53','import java.util.*; public class Solution {public static void insertion_sort(int[] a){Arrays.sort(a);}}');
      await run('P70','public class Solution {public static int dsu_find(int[] parent,int x){if(parent[x]!=x)parent[x]=dsu_find(parent,parent[x]);return parent[x];}}');
      await run('P55','public class Solution {public static long fibonacci(int n){long a=0,b=1;for(int i=0;i<n;i++){long c=a+b;a=b;b=c;}return n==90?a-1:a;} }');
      await run('P70','public class Solution {public static int dsu_find(int[] parent,int x){while(parent[x]!=x)x=parent[x];return x;}}');
      await run('P01','public class Solution {public static int linear_search(int[] A,int target){throw new IllegalArgumentException("test error");}}');
      for(const p of all?problems:[]){await run(p.id,javaView(p).starter);const r=reports[reports.length-1].report;if(r.error)throw Error(p.id+' '+JSON.stringify(r));console.log(p.id+' Java starter and '+r.total+' cases compiled');}
      worker.terminate();return reports;
    },!process.argv.includes('--smoke'));
    console.log(result.slice(0,6).map(r=>({id:r.id,passed:r.report.passed,total:r.report.total,error:r.report.error})));
    for(const i of [0,3,4,5]){assert.ok(result[i].report.total>0);assert.equal(result[i].report.passed,result[i].report.total,result[i].id);}
    assert.equal(result[1].report.passed,0);
    assert.ok(result[2].report.error);assert.equal(result[2].report.diagnostics[0].file,'Solution.java');
    assert.ok(result[6].report.passed<result[6].report.total,'long off-by-one must fail');
    assert.ok(result[7].report.passed<result[7].report.total,'missing mutation must fail');
    assert.match(result[8].report.rows[0].diagnostic.raw,/Solution.linear_search/);
    // CheerpJ may omit source locations from runtime stack traces; do not invent a line.
    assert.ok(result[8].report.rows[0].diagnostic.line===null||result[8].report.rows[0].diagnostic.line===1);
    }
    // Real page integration with an isolated mock account; never touch student data.
    const student={id:'java-test',section:'01',student_no:'20260000',name:'Java Test',current_problem:'P01',current_language:'java'};
    const source='public class Solution { public static int linear_search(int[] A,int target){for(int i=0;i<A.length;i++)if(A[i]==target)return i;return -1;} }';
    const drafts=[{problem:'P01',language:'python',code:'def linear_search(A, target):\n    return -1'},{problem:'P01',language:'c',code:'int linear_search(int A[], int n, int target){return -1;}'},{problem:'P01',language:'java',code:source}];
    const sent=[];
    await page.route('https://tltrbkttwzvwghaplurl.supabase.co/**',async route=>{
      const body=route.request().postDataJSON();sent.push(body);
      await route.fulfill({json:body.action==='state'?{student,drafts,passed:[],problemTotals:{P01:10},languages:['python','c','java']}:{ok:true}});
    });
    await page.evaluate(student=>localStorage.setItem('dju-algolab-session',JSON.stringify({token:'fixture',student})),student);
    await page.goto(`http://127.0.0.1:${server.address().port}/algorithm-lab/index.html?code=java&problem=P01`);
    await page.waitForFunction(()=>document.getElementById('editor-label').textContent==='Solution.java');
    await page.waitForFunction(()=>!document.getElementById('judge').disabled,{},{timeout:240000});
    assert.equal(await page.evaluate(()=>getCode()),source);
    await page.click('#judge');
    await page.waitForFunction(()=>document.getElementById('result').className==='success',{},{timeout:240000});
    assert.ok(sent.some(x=>x.action==='submit'&&x.language==='java'&&x.report.passed===10));
    for(const lang of ['python','c','java']){
      await page.selectOption('#language',lang);
      if(await page.locator('#judge-reminder').isVisible())await page.click('#reminder-continue');
      assert.equal(await page.evaluate(()=>getCode()),drafts.find(x=>x.language===lang).code);
    }
    await page.waitForFunction(()=>!document.getElementById('judge').disabled,{},{timeout:240000});
    await page.evaluate(()=>editor.setValue('public class Solution { public static int linear_search(int[] A,int target){while(true){}} }'));
    await page.click('#sample');await page.click('#stop');
    assert.equal(await page.locator('#retry').isVisible(),true);
    assert.ok(await page.evaluate(()=>getCode().includes('while(true)')));
    await page.screenshot({path:path.join(require('node:os').tmpdir(),'algorithm-lab-java.png'),fullPage:true});
    assert.deepEqual(errors,[]);
    console.log('Real browser Java: success, changed resubmission, compile error, exact long, sorting and path compression passed.');
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
