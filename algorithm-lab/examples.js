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
  const label = (ko, en) => english ? en : ko;
  const model = language === 'c' ? cExampleModel(p, t, c) : pythonExampleModel(p, t);
  const lines = [`${label('예시', 'Example')} ${number} · ${language === 'c' ? 'C' : 'Python'}`,
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
  const label = (ko, en) => english ? en : ko;
  if (language === 'python') {
    return label('함수의 이름과 매개변수를 유지하세요. input()·print() 없이 예시의 입력을 매개변수로 받습니다.',
      'Keep the function name and parameters. The runtime passes the example inputs; do not use input() or print().') + '\n' +
      (p.outputArgument !== undefined ? label('반환값 대신 수정된 입력 배열을 검사합니다.', 'The modified input array is checked instead of the return value.') :
        label('예시의 반환값을 return으로 반환하세요.', 'Return the value shown in the example.')) + (p.provided ? '\n' + p.provided : '');
  }
  const model = cExampleModel(p, p.tests.find(t => t.public), c);
  const lines = [model.signature + ';', label('함수의 이름과 매개변수를 유지하세요. main()·scanf()·printf()는 작성하지 않습니다.',
    'Keep the function name and parameters. Do not write main(), scanf(), or printf().')];
  if (model.inputs.some(s => s.includes('['))) lines.push(label(
    '배열과 필요한 길이·범위는 실행 환경이 전달합니다. 함수 매개변수 배열의 길이를 sizeof로 계산하지 마세요. 예시의 길이·범위 매개변수를 사용하세요.',
    'The runtime supplies arrays and their required lengths/ranges. Do not use sizeof to find the length of an array parameter; use the length/range parameters shown in the example.'));
  if (model.storage.length) lines.push(label('결과·작업 배열은 실행 환경이 준비합니다. 함수 안에서 같은 이름으로 다시 선언하지 마세요.',
    'The runtime allocates output and workspace arrays. Do not redeclare them inside the function.'));
  const count = ['list', 'rows', 'words', 'subsets'].includes(c.output) || ['binary_trace', 'make_path'].includes(p.function);
  lines.push(model.returnType === 'void' ? label('반환값은 없습니다(void). 결과는 예시에 표시된 배열·변수에 저장하세요.',
    'There is no return value (void). Store results in the arrays/variables shown in the example.') : count ?
    label('결과 배열에 저장한 원소 수(2차원 배열은 행 수)를 return으로 반환하세요. 배열 자체를 반환하지 않습니다.',
      'Return the number of stored elements (rows for a 2D array), not the array itself.') :
    label('예시에 표시된 값을 return으로 반환하세요.', 'Return the value shown in the example.'));
  lines.push(c.result);
  return lines.join('\n');
}
