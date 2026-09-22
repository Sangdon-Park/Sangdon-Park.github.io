// Actual Java 8 compiler/JVM in a terminable worker; no execution API or API key.
importScripts('java-problems.js?v=20260922-java','java-harness.js?v=20260922-java');
let lib, compiler, support, sequence=0;
async function errorText(error){try{return await error.toString();}catch{return 'Java runtime error';}}
async function boot(){
  try{
    importScripts('https://cjrtnc.leaningtech.com/4.3/loader.js');
    await cheerpjInit({version:8,status:'none'});
    // Load the pinned compiler into /str so local servers need not support Range.
    const jar=await fetch('vendor/java/ecj-4.6.1.jar');
    if(!jar.ok)throw new Error('Java compiler download failed');
    cheerpOSAddStringFile('/str/ecj.jar',new Uint8Array(await jar.arrayBuffer()));
    lib=await cheerpjRunLibrary('/str/ecj.jar');
    compiler=await lib.org.eclipse.jdt.core.compiler.batch.BatchCompiler;
    const response=await fetch('vendor/java/LabSupport.java');
    if(!response.ok)throw new Error('Java helper download failed');
    support=await response.text();
    self.postMessage({type:'ready'});
  }catch(error){self.postMessage({type:'boot-error',message:await errorText(error)});}
}
function diagnostics(log){
  const rows=[];
  const re=/(ERROR|WARNING) in [^\n]*Solution\.java \(at line (\d+)\)\s*\n([\s\S]*?)(?=\n----------|$)/g;
  for(const m of log.matchAll(re))rows.push({severity:m[1]==='ERROR'?'error':'warning',file:'Solution.java',line:Number(m[2]),message:m[3].trim()});
  return rows;
}
self.onmessage=async({data})=>{
  // Separate directories and class loaders prevent stale classes on resubmission.
  const dir='/files/algolab-'+crypto.randomUUID()+'-'+(++sequence);
  let folder, loader, report;
  try{
    const File=await lib.java.io.File;
    folder=await new File(dir);await folder.mkdirs();
    for(const [name,source]of Object.entries({'Solution.java':data.code,'LabSupport.java':support,'LabJudge.java':javaHarness(data.problem,data.cases)}))cheerpOSAddStringFile('/str/'+name,source);
    const StringWriter=await lib.java.io.StringWriter, PrintWriter=await lib.java.io.PrintWriter;
    const output=await new StringWriter(), writer=await new PrintWriter(output);
    self.postMessage({type:'phase',token:data.token,phase:'compile'});
    const ok=await compiler.compile(`-1.8 -g -encoding UTF-8 -proc:none -d ${dir} /str/Solution.java /str/LabSupport.java /str/LabJudge.java`,writer,writer,null);
    await writer.flush();const log=await output.toString();
    if(!ok){
      const details=diagnostics(log);
      if(!details.some(d=>d.severity==='error'))details.push({severity:'error',line:null,message:log.slice(0,4000)});
      report={error:'Java compile error',errorSummary:'Java 컴파일 오류',rawError:log.slice(0,20000),diagnostics:details};
    }else{
      self.postMessage({type:'phase',token:data.token,phase:'run'});
      const URLClassLoader=await lib.java.net.URLClassLoader;
      const uri=await folder.toURI(), url=await uri.toURL();
      loader=await URLClassLoader.newInstance([url],null);
      const Judge=await loader.loadClass('LabJudge');
      const method=await Judge.getMethod('run',[]);
      const rows=JSON.parse(await method.invoke(null,[]));
      report={rows,passed:rows.filter(r=>r.ok).length,total:rows.length,diagnostics:diagnostics(log),compilerLog:log.slice(0,20000)};
    }
  }catch(error){const message=await errorText(error);report={error:message,errorSummary:'Java 실행 오류',diagnostics:[{severity:'error',message,line:null}]};}
  finally{
    try{
      if(loader)await loader.close();
      if(folder){const files=await folder.listFiles();if(files)for(let i=0;i<files.length;i++)await files[i].delete();await folder.delete();}
    }catch{ /* A terminated or failed VM is discarded by reconnecting. */ }
  }
  self.postMessage({type:'result',token:data.token,report});
};
boot();
