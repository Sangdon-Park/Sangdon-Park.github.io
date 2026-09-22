// Java contracts share the Python argument order and result shape.
function javaType(values) {
  const present = values.filter(x => x !== null && x !== undefined);
  if (!present.length) return 'Object';
  if (present.every(Array.isArray)) return javaType(present.flat()) + '[]';
  if (present.every(x => typeof x === 'number')) {
    const type = present.some(x => !Number.isInteger(x)) ? 'double' : present.some(x => Math.abs(x) > 2147483647) ? 'long' : 'int';
    return present.length !== values.length ? ({int:'Integer',long:'Long',double:'Double'})[type] : type;
  }
  if (present.every(x => typeof x === 'boolean')) return 'boolean';
  if (present.every(x => typeof x === 'string')) return 'String';
  return 'Object';
}
function javaArgs(p, test) {
  const args = JSON.parse(JSON.stringify(test.args));
  if (p.exercise && p.function === 'fib_memo') args.push(Array(91).fill(-1));
  if (p.function === 'make_path') {
    const dp = Array(args[0]+1).fill(0);
    for (let i=2;i<dp.length;i++) dp[i]=1+Math.min(dp[i-1],...[2,3,5].filter(d=>i%d===0).map(d=>dp[i/d]));
    args.push(dp);
  }
  if (p.function === 'lcs_restore') {
    const [a,b]=args, dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
    for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);
    args.push(dp);
  }
  return args;
}
function javaContract(p) {
  const names=p.params||p.starter.match(/def\s+\w+\(([^)]*)\)/)[1].split(',').map(s=>s.trim());
  const inputs=p.tests.map(t=>javaArgs(p,t));
  const types=names.map((name,i)=>name==='memo'?'long[]':javaType(inputs.map(a=>a[i])));
  // Distances use the same 10^18 infinity sentinel as the original exercises.
  if (['pick_vertex','relax'].includes(p.function)) types[0]='long[]';
  let result=p.outputArgument!==undefined?'void':p.exactInteger?'long':p.numeric_output?'double':javaType(p.tests.map(t=>t.expected));
  if(p.function==='dijkstra')result='long[]';
  return {names,types,result,signature:`public static ${result} ${p.function}(${names.map((n,i)=>types[i]+' '+n).join(', ')})`};
}
function javaLiteral(value,type) {
  if(value===null)return 'null';
  if(Array.isArray(value)) {
    const arrayType=type?.endsWith('[]')?type:javaType([value]);
    const elementType=arrayType.slice(0,-2);
    if(value.length>100 && ['int','long','double','boolean'].includes(elementType)) {
      const text=value.map(x=>elementType==='long'?BigInt(x).toString():String(x)).join(',');
      const chunks=text.match(/[\s\S]{1,8000}/g)||[''];
      return `LabSupport.${elementType}s(new String[]{${chunks.map(s=>JSON.stringify(s)).join(',')}})`;
    }
    return `new ${arrayType}{${value.map(x=>javaLiteral(x,elementType)).join(', ')}}`;
  }
  if(typeof value==='string')return JSON.stringify(value);
  if(type==='long'||type==='Long')return BigInt(value).toString()+'L';
  if(type==='double'||type==='Double')return String(value)+'d';
  return String(value);
}
function javaView(p) {
  const contract=javaContract(p);
  const comment=typeof UI_EN!=='undefined'&&UI_EN?'Write your code here.':typeof UI_ES!=='undefined'&&UI_ES?'Escribe tu código aquí.':'여기에 코드를 작성하세요.';
  let statement=p.statement;
  if(p.indexed_only){
    const lines=statement.split('\n');
    const note=typeof UI_EN!=='undefined'&&UI_EN?'Use A[i] and A.length to halve the search interval. The grader checks results; explain why your algorithm uses binary search.':typeof UI_ES!=='undefined'&&UI_ES?'Usa A[i] y A.length para reducir el intervalo a la mitad. El evaluador comprueba los resultados; explica por qué tu algoritmo usa búsqueda binaria.':'A[i]와 A.length로 탐색 구간을 절반씩 줄이세요. 채점기는 결과를 검사하며, 이진 탐색 사용 여부는 풀이 설명과 함께 점검합니다.';
    statement=lines[0]+'\n'+lines[1].split('. ')[0]+'.\n'+note;
  }
  statement=statement.replace(/\bNone\b/g,'null').replace(/\bTrue\b/g,'true').replace(/\bFalse\b/g,'false')
    .replace(/len\((\w+)\)/g,'$1.length').replaceAll('input()을 쓰지 않고','별도 입력 없이').replaceAll('print가 아니라','화면 출력 대신')
    .replaceAll('input()','Scanner').replaceAll('Python:', 'Java:').replaceAll('Python은','Java는');
  return {...p,...contract,statement,starter:`import java.util.*;\n\npublic class Solution extends LabSupport {\n  ${contract.signature} {\n    // ${comment}\n    throw new UnsupportedOperationException("TODO");\n  }\n}\n`};
}
function javaExampleModel(p,t) {
  const c=javaContract(p), args=javaArgs(p,t);
  const after=[];
  if(p.outputArgument!==undefined)after.push(`${c.names[p.outputArgument]} = ${javaLiteral(t.expected,c.types[p.outputArgument])}`);
  if(t.after)after.push(`${c.names[0]} = ${javaLiteral(t.after,c.types[0])}`);
  for(const [i,value] of Object.entries(t.mutationChecks||{}))after.push(`${c.names[t.mutationArg]}[${i}] = ${value}`);
  return {inputs:c.names.map((name,i)=>`${c.types[i]} ${name} = ${javaLiteral(args[i],c.types[i])};`),after,
    call:`Solution.${p.function}(${c.names.join(', ')});`,result:c.result==='void'?null:p.exactInteger?t.expected+'L':javaLiteral(t.expected,c.result)};
}
