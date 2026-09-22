// Language-specific examples: distinguish arguments, result buffers and returns.
function exampleLiteral(value, language) {
  if (Array.isArray(value)) {
    const brackets = language === 'c' ? ['{', '}'] : ['[', ']'];
    return brackets[0] + value.map(x => exampleLiteral(x, language)).join(', ') + brackets[1];
  }
  if (value === null) return language === 'c' ? '0' : 'None';
  if (typeof value === 'boolean') return language === 'c' ? String(Number(value)) : value ? 'True' : 'False';
  return JSON.stringify(value);
}

function exampleDP(n) {
  const dp = Array(n + 1).fill(0);
  for (let i = 2; i <= n; i++) {
    dp[i] = 1 + Math.min(dp[i - 1], ...[2, 3, 5].filter(d => i % d === 0).map(d => dp[i / d]));
  }
  return dp;
}

function exampleLCS(a, b) {
  const dp = Array.from({length: a.length + 1}, () => Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp;
}

function pythonExampleModel(p, t) {
  const params = p.params || p.starter.match(/def\s+\w+\(([^)]*)\)/)[1].split(',').map(s => s.trim());
  const args = [...t.args];
  if (p.exercise && p.function === 'fib_memo') args.push(Array(91).fill(-1));
  if (p.function === 'make_path') args.push(exampleDP(args[0]));
  if (p.function === 'lcs_restore') args.push(exampleLCS(...args));
  const inputs = params.map((name, i) => `${name} = ${name === 'memo' ? '[-1] * 91' : exampleLiteral(args[i], 'python')}`);
  const after = [];
  if (p.outputArgument !== undefined) after.push(`${params[p.outputArgument]} = ${exampleLiteral(t.expected, 'python')}`);
  if (t.after) after.push(`${params[0]} = ${exampleLiteral(t.after, 'python')}`);
  if (t.mutationChecks) {
    for (const [i, value] of Object.entries(t.mutationChecks)) {
      after.push(`${params[t.mutationArg]}[${i}] = ${value}`);
    }
  }
  return {inputs, call: `${p.function}(${params.join(', ')})`, after,
    result: p.outputArgument !== undefined ? null : p.exactInteger ? t.expected : exampleLiteral(t.expected, 'python')};
}

function cExampleModel(p, t, c) {
  const signature = (c.signature || c.starter.split('{')[0]).trim().replace(/\s+/g, ' ');
  const declarations = signature.slice(signature.indexOf('(') + 1, signature.lastIndexOf(')')).split(',').map(s => s.trim());
  const names = declarations.map(s => s.replace(/\[[^\]]*\]/g, '').match(/\w+$/)[0]);
  const returnType = signature.slice(0, signature.indexOf(p.function)).trim();
  const a = t.args, f = p.function;
  const params = p.params || p.starter.match(/def\s+\w+\(([^)]*)\)/)[1].split(',').map(s => s.trim());
  const values = Object.fromEntries(params.slice(0, a.length).map((name, i) => [name, a[i]]));
  const buffers = {}, after = [];
  let result = p.exactInteger ? t.expected : exampleLiteral(t.expected, 'c');
  // The C contracts add lengths, split record arrays, and provide workspace.
  if (Array.isArray(a[0])) values.n = a[0].length;
  if (f === 'grid_sum' || f === 'grid_cost') {
    values.rows = a[0].length; values.cols = a[0][0].length;
  }
  if (f === 'merge_arrays' || f === 'cross_inversions') values.m = a[1].length;
  if (f === 'merge_sort') { values.lo = 0; values.hi = a[0].length; buffers.tmp = [Math.max(1, a[0].length)]; }
  if (['closest_base', 'activity_count', 'fractional_value', 'knapsack1', 'knapsack2'].includes(f)) {
    values[names[0]] = a[0].map(row => row[0]); values[names[1]] = a[0].map(row => row[1]);
  }
  if (f === 'kruskal_cost') values.m = a[1].length;
  if (f === 'lcs_length' || f === 'lcs_restore') { values.m = a[0].length; values.n = a[1].length; }
  if (f === 'make_path') values.dp = exampleDP(a[0]);
  if (f === 'lcs_restore') values.dp = exampleLCS(...a);
  if (f === 'fib_memo' && names.includes('memo')) values.memo = Array(91).fill(-1);
  if (f === 'make_one') buffers.dp = [a[0] + 1];
  if (f === 'knapsack1') buffers.dp = [a[1] + 1];
  if (f === 'knapsack2') buffers.dp = [101, 1001];
  if (f === 'lcs_length') buffers.dp = [101, 101];
  if (f === 'grid_cost') buffers.dp = [100, 100];
  if (f === 'quad' || f === 'white_count') values.n = a[3];
  if (c.output && c.output !== 'scalar') {
    buffers.out = c.output === 'fixed' ? [c.width] : [c.capacity, ...(c.width ? [c.width] : [])];
    let output = t.expected;
    if (c.output === 'words') {
      output = a[0].flatMap((word, i) => word === [...word].reverse().join('') ? [i] : []);
    }
    if (c.output === 'subsets') {
      buffers.sizes = [c.capacity];
      after.push(`sizes[0..${output.length - 1}] = ${exampleLiteral(output.map(row => row.length), 'c')}`);
    }
    if (c.output === 'fixed') after.push(`out = ${exampleLiteral(output, 'c')}`);
    else if (!output.length) after.push('out: 0');
    else if (c.width) output.forEach((row, i) => after.push(`out[${i}]${row.length ? row.length === c.width ? '' : `[0..${row.length - 1}]` : ': 0'}${row.length ? ' = ' + exampleLiteral(row, 'c') : ''}`));
    else after.push(`out[0..${output.length - 1}] = ${exampleLiteral(output, 'c')}`);
    if (c.output !== 'fixed') result = String(output.length);
  } else if (p.id === 'P03') {
    buffers.trace = [64, 4]; result = String(t.expected.length);
    t.expected.forEach((row, i) => after.push(`trace[${i}] = ${exampleLiteral(row, 'c')}`));
    if (!t.expected.length) after.push('trace: 0');
  } else if (['P05', 'P06', 'P07', 'P12'].includes(p.id)) {
    buffers.out = [p.id === 'P12' ? 3 : 2];
    after.push(`out = ${exampleLiteral(p.id === 'P06' && t.expected[0] === null ? [0, 0] : t.expected, 'c')}`);
  } else if (p.id === 'P11') {
    buffers.sorted = [100]; buffers.stats = [2];
    after.push(`sorted${a[0].length ? `[0..${a[0].length - 1}] = ${exampleLiteral(t.expected[0], 'c')}` : ': 0'}`);
    after.push(`stats = ${exampleLiteral(t.expected.slice(1), 'c')}`);
  } else if (['insertion_sort', 'merge_sort'].includes(f)) {
    after.push(`a = ${exampleLiteral(t.expected, 'c')}`);
  } else if (['merge_arrays', 'dijkstra', 'strassen2', 'quad', 'lcs_restore', 'make_path'].includes(f)) {
    const name = f === 'dijkstra' ? 'dist' : f === 'strassen2' ? 'C' : 'out';
    buffers[name] = f === 'strassen2' ? [2, 2] : [f === 'quad' ? 4097 : f === 'lcs_restore' ? 101 : f === 'make_path' ? a[0] : Math.max(1, t.expected.length)];
    after.push(`${name}${Array.isArray(t.expected) && f !== 'strassen2' ? t.expected.length ? `[0..${t.expected.length - 1}]` : ': 0' : ''}${Array.isArray(t.expected) && !t.expected.length ? '' : ' = ' + exampleLiteral(t.expected, 'c')}`);
    if (f === 'quad') { values.p = 0; after.push(`pos = ${t.expected.length}`); }
    if (f === 'make_path') result = String(t.expected.length);
  }
  if (t.after) after.push(`${names[0]} = ${exampleLiteral(t.after, 'c')}`);
  if (t.mutationChecks) {
    const name = f === 'fib_memo' ? 'memo' : names[0];
    for (const [i, value] of Object.entries(t.mutationChecks)) after.push(`${name}[${i}] = ${value}`);
  }
  const inputs = [], storage = [], callArgs = [];
  declarations.forEach((declaration, i) => {
    const name = names[i];
    callArgs.push(name === 'p' && f === 'quad' ? '&pos' : name);
    if (buffers[name]) {
      const type = declaration.slice(0, declaration.indexOf(name)).trim();
      storage.push(`${type} ${name}${buffers[name].map(n => `[${n}]`).join('')};`);
      return;
    }
    if (!(name in values)) throw new Error(`${p.id}: missing C example argument ${name}`);
    const value = values[name];
    if (name === 'p' && f === 'quad') { inputs.push('int pos = 0;'); return; }
    if (name === 'memo') { inputs.push('long long memo[91];', 'for (int i = 0; i < 91; i++) memo[i] = -1;'); return; }
    let decl = declaration;
    if (decl.includes('[]') && Array.isArray(value)) decl = decl.replace('[]', `[${Math.max(1, value.length)}]`);
    // C has no zero-length arrays; the dummy cell is outside the logical length.
    const literal = Array.isArray(value) && !value.length ? '{0}' : exampleLiteral(value, 'c');
    inputs.push(`${decl} = ${literal};`);
  });
  return {signature, inputs, storage, after, call: `${returnType === 'void' ? '' : returnType + ' result = '}${f}(${callArgs.join(', ')});`,
    result: returnType === 'void' ? null : result, returnType};
}

function formatProblemExample(p, t, language, c, number, english = false) {
  const label = (ko, en) => english ? en : (typeof T==='function'?T(ko):ko);
  const model = language === 'java' ? javaExampleModel(p,t) : language === 'c' ? cExampleModel(p, t, c) : pythonExampleModel(p, t);
  const lines = [`${label('예시', 'Example')} ${number} · ${language === 'java' ? 'Java' : language === 'c' ? 'C' : 'Python'}`,
    label('호출 전 입력:', 'Inputs before the call:'), ...model.inputs];
  if (model.storage?.length) lines.push('', label('실행 환경이 준비하는 결과·작업 공간:', 'Output / workspace allocated by the runtime:'), ...model.storage);
  lines.push('', label('함수 호출:', 'Function call:'), model.call);
  if (model.after.length) {
    lines.push('', label('호출 후 저장 내용 (유효한 원소만 표시):', 'Stored values after the call (valid elements only):'),
      ...model.after.map(line => line.endsWith(': 0') ? line + label('개 원소 (읽지 않음)', ' elements (not read)') : line));
  }
  lines.push('', label('반환값: ', 'Return value: ') + (model.result ?? (language === 'c' ? label('없음 (void)', 'none (void)') : label('사용하지 않음 — 수정된 입력 배열을 검사합니다.', 'unused; the modified input array is checked.'))));
  return lines.join('\n');
}

function problemFunctionInstructions(p, language, c, english = false) {
  const label = (ko, en) => english ? en : (typeof T==='function'?T(ko):ko);
  if (language === 'java') return javaContract(p).signature + '\n' + (p.provided || '');
  if (language === 'python') {
    const result = p.outputArgument !== undefined
      ? label('결과: 입력 배열을 제자리에서 수정합니다.', 'Result: modify the input array in place.')
      : label('반환값: 예시에 표시된 결과', 'Return value: the result shown in the examples');
    return result + (p.provided ? '\n' + p.provided : '');
  }
  if (p.function === 'binary_trace') return label(
    'A: 정렬된 배열, n: 원소 수, target: 찾을 값\ntrace: 각 단계의 [low, high, mid, A[mid]]를 저장할 배열 (채점기 제공)\n반환값: 저장한 기록 수',
    'A: sorted array; n: element count; target: value to find\ntrace: stores [low, high, mid, A[mid]] for each step (provided by the grader)\nReturn value: number of recorded steps');
  const model = cExampleModel(p, p.tests.find(t => t.public), c);
  const declarations = model.signature.slice(model.signature.indexOf('(') + 1, -1).split(',');
  const names = declarations.map(s => s.replace(/\[[^\]]*\]/g, '').trim().match(/\w+$/)[0]);
  const buffers = model.storage.map(s => s.match(/(\w+)\[/)[1]);
  const descriptions = {target: label('목표값', 'target value'), rows: label('행 수', 'rows'), cols: label('열 수', 'columns')};
  const first = p.tests.find(t => t.public).args[0];
  if (Array.isArray(first) && names.includes('n')) descriptions.n = label('원소 수', 'element count');
  if (['quad', 'white_count'].includes(p.function)) descriptions.n = label('정사각형의 한 변 길이', 'square side length');
  if (['lcs_length', 'lcs_restore'].includes(p.function)) {
    descriptions.m = label('a의 길이', 'length of a'); descriptions.n = label('b의 길이', 'length of b');
  }
  if (['merge_arrays', 'cross_inversions'].includes(p.function)) {
    descriptions.n = label('a의 원소 수', 'elements in a'); descriptions.m = label('b의 원소 수', 'elements in b');
  }
  if (p.function === 'kruskal_cost') { descriptions.n = label('정점 수', 'vertices'); descriptions.m = label('간선 수', 'edges'); }
  if (['tsp_min', 'nearest_tour'].includes(p.function)) descriptions.n = label('도시 수', 'cities');
  if (p.function === 'dijkstra') descriptions.n = label('정점 수', 'vertices');
  const inputs = names.filter(name => !buffers.includes(name)).map(name => descriptions[name] ? `${name} (${descriptions[name]})` : name);
  const lines = [label('입력: ', 'Inputs: ') + inputs.join(', ')];
  if (c.result && !c.result.startsWith('PPTX')) lines.push(c.result);
  else {
    if (buffers.length) lines.push(buffers.join(', ') + label(': 결과·작업 배열 (채점기 제공)', ': output/workspace arrays (provided by the grader)'));
    lines.push(model.returnType === 'void' ? label('반환값: 없음 (void)', 'Return value: none (void)') :
      p.function === 'make_path' ? label('반환값: 경로에 저장한 원소 수', 'Return value: number of path elements') :
      label('반환값: 예시에 표시된 결과', 'Return value: the result shown in the examples'));
  }
  if (buffers.length && c.result && !c.result.startsWith('PPTX')) lines.push(buffers.join(', ') + label(': 채점기가 제공하는 저장 공간', ': storage provided by the grader'));
  return lines.join('\n');
}

function commonFunctionHelp(language, english = false) {
  if(language === 'java') return english ? 'Keep class Solution and the supplied static method. The grader supplies inputs; main() and Scanner are unnecessary. Return the specified value or modify the specified array. Use array.length; long uses an L suffix. Helper methods are inherited from LabSupport.' : 'Solution 클래스와 제공된 static 메서드를 유지하세요. main()과 Scanner 없이 전달된 입력으로 결과를 반환하거나 지정된 배열을 수정합니다. 배열 길이는 배열.length, long 상수는 L 접미사를 사용합니다. 제공되는 보조 메서드는 LabSupport에서 상속됩니다.';
  if (language === 'python') return english
    ? 'Keep the supplied function name and parameters. The grader passes the inputs; do not use input() or print(). Return the result unless the problem asks you to modify an array.'
    : '제공된 함수의 이름과 매개변수를 유지하세요. 입력은 채점기가 전달하므로 input()·print()는 필요 없습니다. 배열을 수정하는 문제를 제외하면 결과를 return으로 반환합니다.';
  return english
    ? 'Keep the supplied function name and parameters. The grader supplies main(), inputs, and output/workspace arrays; do not redeclare them. Use the given length parameters: sizeof on an array parameter measures a pointer, not the array. Follow each problem’s return-value contract.'
    : '제공된 함수의 이름과 매개변수를 유지하세요. main()과 입출력, 결과·작업 배열은 채점기가 준비하므로 따로 작성하거나 다시 선언할 필요가 없습니다. 배열 길이는 전달받은 매개변수를 사용합니다. 함수 매개변수에 sizeof를 적용하면 배열이 아닌 포인터의 크기가 나옵니다. 반환값은 각 문제의 설명을 따르세요.';
}
