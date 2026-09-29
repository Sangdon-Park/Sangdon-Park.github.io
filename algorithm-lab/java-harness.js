function javaHarness(p,cases,mode) {
  if(mode==='custom')return javaCustomHarness(p,cases);
  const c=javaContract(p);
  const methods=cases.map((t,i)=>{
    const args=javaArgs(p,t);
    const setup=c.names.map((name,j)=>`${c.types[j]} ${name}=${javaLiteral(args[j],c.types[j])};`).join('\n');
    const call=`Solution.${p.function}(${c.names.join(', ')})`;
    const result=c.result==='void'?`${call}; Object actual=${c.names[p.outputArgument]};`:`Object actual=${call};`;
    const expected=p.exactInteger?`${t.expected}L`:javaLiteral(t.expected,c.result==='void'?c.types[p.outputArgument]:c.result);
    const checks=[];
    if(p.preserve_input)c.names.forEach((name,j)=>checks.push(`same(${name},${javaLiteral(args[j],c.types[j])},0)`));
    if(t.after)checks.push(`same(${c.names[0]},${javaLiteral(t.after,c.types[0])},0)`);
    for(const [key,value]of Object.entries(t.mutationChecks||{}))checks.push(`String.valueOf(${c.names[t.mutationArg]}[${key}]).equals(${JSON.stringify(String(value))})`);
    const tolerance=p.numeric_output?(p.tolerance??'Math.max(1e-9,Math.abs(((Number)expected).doubleValue())*1e-9)'):0;
    return `static String test${i}(){try{${setup}\n${result}\nObject expected=${expected}; boolean ok=same(actual,expected,${tolerance})${checks.map(x=>' && '+x).join('')};return row(${i+1},${!!t.public},ok,${JSON.stringify(JSON.stringify(t.args).slice(0,230))},ok?"":"Expected "+json(expected)+" / Result "+json(actual)+${JSON.stringify(checks.length?' (check input mutations)':'')},null);}catch(Throwable e){return row(${i+1},${!!t.public},false,${JSON.stringify(JSON.stringify(t.args).slice(0,230))},e.toString(),e);}}`;
  });
  return `public class LabJudge extends LabSupport {\n${methods.join('\n')}\npublic static String run(){java.io.PrintStream[] streams=quiet();try{return "["+${cases.map((_,i)=>`test${i}()`).join('+","+')}+"]";}finally{System.setOut(streams[0]);System.setErr(streams[1]);}}\n}`;
}
function javaCustomHarness(p,cases){
  if(cases.length!==1)throw Error('직접 실행은 입력 하나씩 실행합니다.');
  validateCustomArgs(p,cases[0].args);
  const c=javaContract(p),args=javaArgs(p,cases[0]);
  const setup=c.names.map((name,i)=>`${c.types[i]} ${name}=${javaLiteral(args[i],c.types[i])};`).join('\n');
  const call=`Solution.${p.function}(${c.names.join(', ')})`;
  const result=c.result==='void'?`${call};Object actual=${c.names[p.outputArgument]};`:`Object actual=${call};`;
  const changed=c.names.flatMap((name,i)=>c.types[i].endsWith('[]')?[`if(!same(${name},${javaLiteral(args[i],c.types[i])},0))after+=${JSON.stringify(name+' = ')}+json(${name})+"\\n";`]:[]).join('\n');
  return `public class LabJudge extends LabSupport {
    static class Capture extends java.io.OutputStream {java.io.ByteArrayOutputStream data=new java.io.ByteArrayOutputStream();public void write(int b){if(data.size()<10000)data.write(b);}String text()throws Exception{return data.toString("UTF-8");}}
    public static String run() throws Exception {
      java.io.PrintStream oldOut=System.out,oldErr=System.err;Capture out=new Capture(),err=new Capture();
      java.io.PrintStream captureOut=new java.io.PrintStream(out,true,"UTF-8"),captureErr=new java.io.PrintStream(err,true,"UTF-8");
      System.setOut(captureOut);System.setErr(captureErr);
      try{${setup}\n${result}\nString after="";${changed}
        return "{\\"custom\\":{\\"value\\":"+quote(json(actual))+",\\"stdout\\":"+quote(out.text())+",\\"stderr\\":"+quote(err.text())+",\\"after\\":"+quote(after)+"}}";
      }catch(Throwable e){return "{\\"error\\":"+quote(e.toString())+",\\"rows\\":["+row(1,false,false,"",e.toString(),e)+"],\\"custom\\":{\\"stdout\\":"+quote(out.text())+",\\"stderr\\":"+quote(err.text())+"}}";}
      finally{System.setOut(oldOut);System.setErr(oldErr);captureOut.close();captureErr.close();}
    }
  }`;
}
