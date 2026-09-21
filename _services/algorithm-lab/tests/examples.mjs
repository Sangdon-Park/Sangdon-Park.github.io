// Execute the displayed calls, not just the grading adapters, against references.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';

const lab = path.resolve(import.meta.dirname, '../../../algorithm-lab');
const read = name => fs.readFileSync(path.join(lab, name), 'utf8');
const bank = ['problems.json', 'chapter-02.json', 'exercise-problems.json'].flatMap(name => JSON.parse(read(name)));
const display = vm.createContext({});
for (const name of ['c-problems.js', 'examples.js']) vm.runInContext(read(name), display);
const contracts = vm.runInContext('C_PROBLEMS', display);
const cModel = vm.runInContext('cExampleModel', display);
const pyModel = vm.runInContext('pythonExampleModel', display);
const format = vm.runInContext('formatProblemExample', display);
const cCases = [], pyCases = [];
let examples = 0;

function checks(name, value) {
  if (Array.isArray(value)) return value.flatMap((x, i) => checks(`${name}[${i}]`, x));
  const expression = typeof value === 'string' ? `strcmp(${name},${JSON.stringify(value)}) == 0` : `fabs((double)${name} - (${value})) < 0.000001`;
  return [`if (!(${expression})) { puts("Incorrect ${name}"); return 1; }`];
}
function afterChecks(line) {
  if (line.endsWith(': 0')) return [];
  const [name, raw] = line.split(' = ');
  assert.ok(raw, line);
  const value = raw.startsWith('{') ? JSON.parse(raw.replaceAll('{', '[').replaceAll('}', ']')) : JSON.parse(raw);
  return checks(name.replace(/\[0\.\.\d+\]/g, ''), value);
}

for (const p of bank) {
  const c = p.c || contracts[p.id];
  const blocks = [];
  for (const t of p.tests.filter(t => t.public)) {
    examples++;
    const model = cModel(p, t, c), python = pyModel(p, t);
    for (const english of [false, true]) {
      for (const language of ['c', 'python']) {
        const text = format(p, t, language, c, 1, english);
        assert.ok(!/undefined|\[0\.\.-1\]/.test(text), `${p.id}: ${text}`);
        assert.ok(text.includes(p.function + '('));
      }
    }
    const verify = p.c?.solution ? model.after.flatMap(afterChecks) : [];
    if (p.c?.solution && model.result !== null) verify.push(...checks('result', Number(model.result)));
    blocks.push(`{\n${[...model.inputs, ...model.storage, model.call, ...verify].join('\n')}\n}`);
    if (p.solution) pyCases.push({id: p.id, prelude: p.pythonPrelude || '', solution: p.solution, ...python});
  }
  cCases.push({id: p.id, source: '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <math.h>\n#include <limits.h>\n' +
    (p.cPrelude || '') + '\n' + (p.c?.solution || c.starter) + '\nint main(void) {\n' + blocks.join('\n') + '\nputs("OK"); return 0; }'});
}

// Targeted regressions for differences that shared JSON output concealed.
const byId = id => bank.find(p => p.id === id);
const sample = id => byId(id).tests.find(t => t.public);
assert.match(format(byId('P38'), sample('P38'), 'c', byId('P38').c, 1), /int n = 5;[\s\S]*out\[0\] = \{1, 9\}[\s\S]*반환값: 2/);
assert.match(format(byId('P38'), byId('P38').tests.filter(t => t.public)[1], 'c', byId('P38').c, 2), /반환값: 3/);
assert.match(format(byId('P53'), sample('P53'), 'python', byId('P53').c, 1), /호출 후[\s\S]*a = \[1, 2, 2, 5\][\s\S]*사용하지 않음/);
assert.match(format(byId('P61'), sample('P61'), 'c', byId('P61').c, 1), /x\[3\] = \{0, 3, 3\}[\s\S]*y\[3\] = \{0, 4, 0\}/);
assert.ok(pyModel(byId('P80'), sample('P80')).inputs.some(s => s.startsWith('dp = [')));
assert.ok(pyModel(byId('P84'), sample('P84')).call.endsWith(', dp)'));
const emptyMax = byId('P06').tests.find(t => !t.args[0].length);
assert.ok(cModel(byId('P06'), emptyMax, contracts.P06).after.includes('out = {0, 0}'));
assert.match(pyModel(byId('P06'), emptyMax).result, /None/);

const pythonRun = spawnSync('python', ['-c', `
import json, sys
cases = json.load(sys.stdin)
for case in cases:
    ns = {}
    exec(case['prelude'], ns)
    exec(case['solution'], ns)
    exec('\\n'.join(case['inputs']), ns)
    actual = eval(case['call'], ns)
    if case['result'] is not None:
        expected = eval(case['result'], ns)
        if isinstance(actual, tuple): actual = list(actual)
        assert actual == expected, (case['id'], actual, expected)
    for line in case['after']:
        name, value = line.split(' = ')
        assert eval(name, ns) == eval(value, ns), (case['id'], line)
print(f"{len(cases)} displayed Python calls and stored results passed.")
`], {input: JSON.stringify(pyCases), encoding: 'utf8'});
assert.equal(pythonRun.status, 0, pythonRun.stderr);
console.log(pythonRun.stdout.trim());

// Use the same bundled C11/WebAssembly compiler as the browser, offline.
let receive;
const next = () => new Promise(resolve => { receive = resolve; });
const runtime = vm.createContext({TextEncoder, TextDecoder, WebAssembly, Uint8Array, ArrayBuffer, DataView,
  console, setTimeout, clearTimeout, performance,
  fetch: async file => {
    const b = fs.readFileSync(path.join(lab, String(file).split('?')[0]));
    return {ok: true, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)};
  }, self: {postMessage: data => receive(data)}});
runtime.importScripts = (...files) => files.forEach(file => vm.runInContext(read(file.split('?')[0]), runtime));
const boot = next();
vm.runInContext(read('c-worker.js'), runtime);
assert.equal((await boot).type, 'ready');
for (const item of cCases) {
  runtime.source = item.source;
  await vm.runInContext(`(async () => {
    log = '';
    api.memfs.addFile('example.c', new TextEncoder().encode(source));
    await api.run(await api.getModule(api.clangFilename), 'clang', '-cc1', '-emit-obj',
      ...api.clangCommonArgs.filter(arg => arg !== '-fcolor-diagnostics'), '-O0', '-std=c11',
      '-Werror=implicit-function-declaration', '-o', 'example.o', '-x', 'c', 'example.c');
    await api.link('example.o', 'example.wasm');
    const module = await WebAssembly.compile(api.memfs.getFileContents('example.wasm'));
    log = '';
    await api.run(module, 'example.wasm');
  })()`, runtime).catch(error => assert.fail(`${item.id}: ${vm.runInContext('log', runtime)}\n${error}`));
  assert.match(vm.runInContext('log.trim()', runtime), /\nOK$/, item.id);
}
console.log(`${bank.length} C interfaces / ${examples} public examples compiled and ran; 74 reference solutions checked for returns and stored results.`);
