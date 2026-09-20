// Compile real C to WebAssembly inside this worker. No student code is uploaded.
importScripts('vendor/wasm-clang/shared.js');
importScripts('chapter-02-harness.js?v=20260915-ch2');
const ROOT = 'vendor/wasm-clang/';
let api, log = '';
const clean = text => text.replace(/\x1b\[[0-9;]*m/g, '');
async function readBuffer(file) {
  const response = await fetch(file);
  if (!response.ok) throw new Error(`실행 환경 다운로드 실패 (${response.status})`);
  return response.arrayBuffer();
}
async function boot() {
  try {
    api = new API({
      clang: ROOT + 'clang', lld: ROOT + 'lld', memfs: ROOT + 'memfs', sysroot: ROOT + 'sysroot.tar',
      readBuffer, compileStreaming: async file => WebAssembly.compile(await readBuffer(file)),
      hostWrite: text => { if (log.length < 200000) log += text; }
    });
    await Promise.all([api.ready, api.getModule(api.clangFilename), api.getModule(api.lldFilename)]);
    self.postMessage({type: 'ready'});
  } catch (error) { self.postMessage({type: 'boot-error', message: String(error)}); }
}
function normalize(source) {
  let code = '', count = 0;
  // Preserve C strings, character literals, and both kinds of comments.
  const tokens = /("(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|[\u00a0\u2000-\u200b\u202f\u205f\u3000\ufeff]/g;
  code = source.replace(tokens, (match, protectedText) => {
    if (protectedText) return match;
    count++;
    return /[\u200b\ufeff]/.test(match) ? '' : ' ';
  });
  return {code, count};
}
function harness(problem, cases) {
  const body = cases.map((test, index) => {
    if (problem.exercise) {
      const {setup, call} = test.cHarness || chapterTwoCase({...problem,id:problem.legacyHarnessId}, test.args);
      return `{${setup}\nprintf("\\nDJU_CASE_${index}:");${call}printf("\\n");fflush(stdout);}`;
    }
    if (problem.chapter === 2) {
      const {setup, call} = chapterTwoCase(problem, test.args);
      return `{${setup}\nprintf("\\nDJU_CASE_${index}:");${call}printf("\\n");fflush(stdout);}`;
    }
    const args = test.args, array = Array.isArray(args[0]) ? args[0] : null;
    let setup = array ? `int A[${Math.max(1,array.length)}]={${array.length ? array.join(',') : '0'}}; int n=${array.length};` : '';
    let call;
    switch (problem.id) {
      case 'P01': case 'P02': case 'P04':
        call = `printf("%d", ${problem.function}(A,n,${args[1]}));`; break;
      case 'P03':
        call = `int trace[64][4]={{0}}; int count=binary_trace(A,n,${args[1]},trace);
          if(count<0 || count>64){printf("null");}else{printf("[");for(int i=0;i<count;i++){if(i)printf(",");printf("[%d,%d,%d,%d]",trace[i][0],trace[i][1],trace[i][2],trace[i][3]);}printf("]");}`; break;
      case 'P05': case 'P06': case 'P07':
        call = `long long out[2]={-999999999,-999999999}; ${problem.function}(A,n,${problem.id==='P07'?args[1]+',':''}out); printf("[%lld,%lld]",out[0],out[1]);`; break;
      case 'P08': call = `printf("%.17g",expected_checks(${args[0]},${Number(args[1]).toFixed(17)}));`; break;
      case 'P09': case 'P10': call = `printf("%d",${problem.function}(${args[0]}LL));`; break;
      case 'P11':
        setup += `int before[${Math.max(1,array.length)}];for(int i=0;i<n;i++)before[i]=A[i];`;
        call = `int sorted[100]={0};long long stats[2]={-1,-1};bubble_stats(A,n,sorted,stats);
          int changed=0;for(int i=0;i<n;i++)if(A[i]!=before[i])changed=1;
          if(changed){printf("null");}else{printf("[[");for(int i=0;i<n;i++){if(i)printf(",");printf("%d",sorted[i]);}printf("],%lld,%lld]",stats[0],stats[1]);}`; break;
      case 'P12': call = `long long out[3]={-1,-1,-1};loop_counts(${args[0]},out);printf("[%lld,%lld,%lld]",out[0],out[1],out[2]);`; break;
      default: throw new Error('지원하지 않는 문제입니다.');
    }
    return `{${setup}\nprintf("\\nDJU_CASE_${index}:");${call}printf("\\n");fflush(stdout);}`;
  }).join('\n');
  return `\n#line 1 "grader.c"\nint main(void){\n${body}\nreturn 0;}\n`;
}
function equal(actual, expected, numeric, tolerance) {
  if (Array.isArray(expected)) return Array.isArray(actual) && actual.length === expected.length && expected.every((x,i)=>equal(actual[i],x,numeric,tolerance));
  if (numeric) return typeof actual === 'number' && Number.isFinite(actual) && Math.abs(actual-expected)<=(tolerance??Math.max(1e-9,Math.abs(expected)*1e-9));
  return actual === expected;
}
self.onmessage = async ({data}) => {
  const normalized = normalize(data.code);
  const report = {normalizedCode: normalized.code, normalizedCount: normalized.count};
  try {
    log = '';
    // A fixed set of filenames keeps the in-memory filesystem bounded across runs.
    const source = '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <math.h>\n#include <limits.h>\n' + jsonStringHelper + (data.problem.cPrelude||'') + '\n#line 1 "answer.c"\n' + normalized.code + harness(data.problem,data.cases);
    api.memfs.addFile('answer.c',new TextEncoder().encode(source));
    self.postMessage({type:'phase', token:data.token, phase:'compile'});
    await api.run(await api.getModule(api.clangFilename), 'clang','-cc1','-emit-obj',
      ...api.clangCommonArgs.filter(arg=>arg!=='-fcolor-diagnostics'), '-O0','-std=c11','-Werror=implicit-function-declaration','-o','answer.o','-x','c','answer.c');
    await api.link('answer.o','answer.wasm');
    const module = await WebAssembly.compile(api.memfs.getFileContents('answer.wasm'));
    log = '';
    self.postMessage({type:'phase', token:data.token, phase:'run'});
    await api.run(module,'answer.wasm');
    const output = clean(log);
    report.rows = data.cases.map((test,index)=>{
      const line = output.split('\n').find(row=>row.startsWith(`DJU_CASE_${index}:`));
      let actual;
      try { actual=JSON.parse(line.slice(line.indexOf(':')+1)); } catch (_) {}
      const expected = data.problem.id==='P06' && test.expected[0]===null ? [0,0] : test.expected;
      const ok = equal(actual,expected,data.problem.numeric_output,data.problem.tolerance);
      return {number:index+1,public:!!test.public,ok,input:JSON.stringify(test.args).slice(0,230),
        message:ok?'':`예상 ${JSON.stringify(expected)} / 결과 ${JSON.stringify(actual) ?? '결과 없음'}${data.problem.id==='P11'&&actual===null?' (입력 배열 변경 여부를 확인하세요.)':''}`};
    });
    report.passed = report.rows.filter(row=>row.ok).length;
    report.total = report.rows.length;
  } catch (error) {
    report.error = 'C 컴파일·실행 오류\n' + (clean(log).slice(-5000) || String(error));
  }
  self.postMessage({type:'result',token:data.token,report});
};
// ASCII strings can contain quotation marks, backslashes and control characters.
const jsonStringHelper = String.raw`
static void lab_json_string(const char *s) {
  putchar('"');
  for (; *s; ++s) {
    unsigned char c=(unsigned char)*s;
    if (c=='"' || c=='\\') { putchar('\\'); putchar(c); }
    else if (c<32) printf("\\u%04x",c);
    else putchar(c);
  }
  putchar('"');
}
`;
boot();
