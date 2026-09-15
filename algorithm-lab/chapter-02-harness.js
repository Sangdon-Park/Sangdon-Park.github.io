// Shared by the browser C worker and the offline C example generator.
function chapterTwoCase(problem, args) {
  const c = problem.c;
  const array = (name, values) => `int ${name}[${Math.max(1, values.length)}]={${values.join(',') || '0'}};`;
  const strings = (name, values) => `const char *${name}[${Math.max(1, values.length)}]={${values.map(JSON.stringify).join(',') || '""'}};`;
  const matrix = (name, rows) => `int ${name}[${rows.length}][8]={${rows.map(row => '{' + row.join(',') + '}').join(',')}};`;
  let setup = '', inputs = [];
  switch (problem.id) {
    case 'P13': inputs = [JSON.stringify(args[0])]; break;
    case 'P14': case 'P16': case 'P21': case 'P25': case 'P28': inputs = [args[0]]; break;
    case 'P22': inputs = args.map(JSON.stringify); break;
    case 'P26':
      setup = matrix('dist', args[0]); inputs = ['dist', args[0].length]; break;
    case 'P33':
      setup = strings('words', args[0]); inputs = ['words', args[0].length]; break;
    case 'P34':
      setup = array('weights', args[0]) + array('values', args[1]);
      inputs = ['weights', 'values', args[0].length, args[2]]; break;
    case 'P35':
      setup = strings('guesses', args[0]) + array('strikes', args[1]) + array('balls', args[2]);
      inputs = ['guesses', 'strikes', 'balls', args[0].length]; break;
    case 'P36':
      setup = matrix('grid', args[0]); inputs = ['grid', args[0].length, args[0][0].length]; break;
    default:
      setup = array('A', args[0]); inputs = ['A', args[0].length, ...args.slice(1)];
  }
  let call;
  if (c.output === 'scalar') {
    call = `printf("%lld",(long long)${problem.function}(${inputs.join(',')}));`;
  } else if (c.output === 'fixed') {
    setup += `long long out[${c.width}];for(int i=0;i<${c.width};i++)out[i]=LLONG_MIN;`;
    call = `${problem.function}(${[...inputs, 'out'].join(',')});printf("[");
      for(int i=0;i<${c.width};i++){if(i)printf(",");printf("%lld",out[i]);}printf("]");`;
  } else {
    const cap = c.capacity, width = c.width;
    setup += `int out[${cap}]${width ? '[' + width + ']' : ''}={0};`;
    if (c.output === 'subsets') setup += `int sizes[${cap}]={0};`;
    const outArgs = c.output === 'subsets' ? ['out', 'sizes'] : ['out'];
    let item = 'printf("%d",out[i]);';
    if (c.output === 'words') {
      // Words are restricted to ASCII letters by the problem contract.
      item = `if(out[i]<0 || out[i]>=${args[0].length})printf("null");else printf("\\\"%s\\\"",words[out[i]]);`;
    } else if (width) {
      const length = c.output === 'subsets' ? 'sizes[i]' : ['P18', 'P19'].includes(problem.id) ? args[1] : width;
      item = `int size=${length};if(size<0 || size>${width})printf("null");else {
        printf("[");for(int j=0;j<size;j++){if(j)printf(",");printf("%d",out[i][j]);}printf("]");}`;
    }
    call = `int count=${problem.function}(${[...inputs, ...outArgs].join(',')});
      if(count<0 || count>${cap})printf("null");else {
        printf("[");for(int i=0;i<count;i++){if(i)printf(",");${item}}printf("]");}`;
  }
  return {setup, call};
}
