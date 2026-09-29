// Manual browser QA only. All account/draft/submission requests stay on localhost.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
const root=path.resolve(import.meta.dirname,'../../..'),lab=path.join(root,'algorithm-lab');
const problems=['problems','chapter-02','exercise-problems'].flatMap(f=>JSON.parse(fs.readFileSync(path.join(lab,f+'.json'))));
const student={id:'custom-input-fixture',section:'01',student_no:'20260000',name:'직접 입력 QA',current_problem:'P47',current_language:'python'};
const drafts=problems.flatMap(p=>[
  {problem:p.id,language:'python',code:p.solution||(p.id==='P01'?'def linear_search(A,target):\n    return A.index(target) if target in A else -1':p.starter)},
  ...(p.c?[{problem:p.id,language:'c',code:p.c.solution||p.c.starter}]:[]),
]);
drafts.push({problem:'P47',language:'java',code:'public class Solution { public static int first_index(int[] a,int x){System.out.println("debug <"+a.length+">");for(int i=0;i<a.length;i++)if(a[i]==x)return i;return -1;} }'});
const requests=[];
const server=http.createServer(async(req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/fixture-state'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({requests}));return;}
  if(pathname==='/fixture-api'){
    let text='';for await(const chunk of req)text+=chunk;
    let body={};try{body=JSON.parse(text);}catch{}
    requests.push({action:body.action,problem:body.problem,language:body.language});
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify(body.action==='state'?{student,drafts,passed:[],problemTotals:Object.fromEntries(problems.map(p=>[p.id,p.tests.length])),languages:['python','c','java']}:{ok:true}));return;
  }
  const file=path.resolve(root,'.'+decodeURIComponent(pathname==='/'?'/algorithm-lab/index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{
    let body=fs.readFileSync(file);
    if(file===path.join(lab,'cloud.js'))body=Buffer.from(body.toString().replace('https://tltrbkttwzvwghaplurl.supabase.co/functions/v1/algorithm-lab','/fixture-api'));
    if(file===path.join(lab,'index.html'))body=Buffer.from(body.toString().replace('<head>','<head><script>localStorage.setItem("dju-algolab-session",'+JSON.stringify(JSON.stringify({token:'fixture',student}))+');</script>').replace(/<script defer src="\/js\/site-analytics[^<]+<\/script>/,''));
    const ext=path.extname(file);res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html; charset=utf-8','.css':'text/css','.json':'application/json','.wasm':'application/wasm'})[ext]||'application/octet-stream');
    res.setHeader('Cache-Control','no-store');res.setHeader('Accept-Ranges','bytes');
    if(req.headers.range){const m=req.headers.range.match(/bytes=(\d+)-(\d*)/),start=Number(m[1]),end=m[2]?Number(m[2]):body.length-1;res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${body.length}`,'Content-Length':end-start+1});res.end(body.subarray(start,end+1));}else res.end(body);
  }catch{res.writeHead(404).end();}
});
server.listen(Number(process.env.PORT)||4192,'127.0.0.1',()=>console.log(`Local isolated QA: http://127.0.0.1:${server.address().port}/algorithm-lab/index.html?chapter=3&problem=91&code=python`));
