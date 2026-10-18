// Public sample runner, unrelated to the examination execution infrastructure.
let pythonRuntime, cRuntime, transcript = '';
const specimen = [ [[8, 3, 8], 8, 0], [[8, 3, 8], 7, -1], [[], 8, -1] ];
self.onmessage = async ({ data }) => {
  try {
    if (data.launch === 'py') {
      const base = 'https://cdn.jsdelivr.net/pyodide/v0.29.2/full/';
      importScripts(base + 'pyodide.js');
      pythonRuntime = await loadPyodide({ indexURL: base });
      self.postMessage({ kind: 'ready' }); return;
    }
    if (data.launch === 'c99') {
      importScripts('../algorithm-lab/vendor/wasm-clang/shared.js');
      const root = '../algorithm-lab/vendor/wasm-clang/';
      const readBuffer = async path => { const response = await fetch(path); if (!response.ok) throw Error('컴파일러 다운로드 실패'); return response.arrayBuffer(); };
      cRuntime = new API({ clang: root + 'clang', lld: root + 'lld', memfs: root + 'memfs', sysroot: root + 'sysroot.tar', readBuffer,
        compileStreaming: async path => WebAssembly.compile(await readBuffer(path)), hostWrite: text => { transcript += text.slice(0, Math.max(0, 12000 - transcript.length)); } });
      await Promise.all([cRuntime.ready, cRuntime.getModule(cRuntime.clangFilename), cRuntime.getModule(cRuntime.lldFilename)]);
      self.postMessage({ kind: 'ready' }); return;
    }
    if (typeof data.ink !== 'string' || data.ink.length > 6000) throw Error('코드 길이를 확인하세요.');
    if (data.dialect === 'py') {
      pythonRuntime.globals.set('practice_source', data.ink);
      pythonRuntime.globals.set('practice_specimen', JSON.stringify(specimen));
      const result = pythonRuntime.runPython(`
import json, io, contextlib
ns = {}
class Quiet(io.StringIO):
    def write(self, value): return len(value)
outcomes = []
with contextlib.redirect_stdout(Quiet()), contextlib.redirect_stderr(Quiet()):
    exec(compile(practice_source, 'practice.py', 'exec'), ns)
    routine = ns.get('first_index')
    if not callable(routine): raise ValueError('first_index 함수를 작성하세요.')
    for values, target, expected in json.loads(practice_specimen):
        before = values[:]
        actual = routine(values, target)
        ok = type(actual) is int and actual == expected and values == before
        outcomes.append(('통과' if ok else '확인 필요') + ' · 예상 ' + str(expected) + ' / 반환 ' + str(actual)[:100] + ('' if values == before else ' · 입력 목록 변경'))
'\\n'.join(str(i + 1) + '번: ' + text for i, text in enumerate(outcomes))
`);
      self.postMessage({ kind: 'results', text: result }); return;
    }
    if (data.dialect !== 'c99') throw Error('작성 언어를 확인하세요.');
    transcript = '';
    const cases = specimen.map(([values, target, expected], index) => `{int values[${Math.max(1, values.length)}]={${values.length ? values.join(',') : '0'}};int result=first_index(values,${values.length},${target});int untouched=1;${values.map((value, i) => `if(values[${i}]!=${value})untouched=0;`).join('')}printf("\\nREHEARSAL_${index}:%d:%d\\n",result,untouched);}`).join('\n');
    const c = '#include <stdio.h>\n' + data.ink + '\nint main(void){\n' + cases + '\nreturn 0;}\n';
    cRuntime.memfs.addFile('sample.c', new TextEncoder().encode(c));
    await cRuntime.run(await cRuntime.getModule(cRuntime.clangFilename), 'clang', '-cc1', '-emit-obj', ...cRuntime.clangCommonArgs.filter(arg => arg !== '-fcolor-diagnostics'), '-O0', '-std=c11', '-Werror=implicit-function-declaration', '-o', 'sample.o', '-x', 'c', 'sample.c');
    await cRuntime.link('sample.o', 'sample.wasm');
    const binary = await WebAssembly.compile(cRuntime.memfs.getFileContents('sample.wasm'));
    transcript = ''; await cRuntime.run(binary, 'sample.wasm');
    const result = specimen.map((row, index) => { const found = transcript.match(new RegExp(`REHEARSAL_${index}:(-?\\d+):([01])`)); return `${index + 1}번: ${found && Number(found[1]) === row[2] && found[2] === '1' ? '통과' : '확인 필요'} · 예상 ${row[2]} / 반환 ${found?.[1] ?? '없음'}${found?.[2] === '0' ? ' · 입력 배열 변경' : ''}`; }).join('\n');
    self.postMessage({ kind: 'results', text: result });
  } catch (error) { self.postMessage({ kind: 'failure', text: (transcript + '\n' + String(error)).replace(/\x1b\[[0-9;]*m/g, '').slice(-7000) }); }
};
