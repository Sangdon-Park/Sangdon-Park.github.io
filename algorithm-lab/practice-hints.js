// Practice assistance only: uses the same reviewed examples as the problem bank.
const HINT_TOOLS = {
  range:T('range(start, stop): start부터 stop 직전까지 반복합니다. range(3)은 0, 1, 2입니다.'),
  len:T('len(A): 배열·문자열의 길이입니다. 마지막 인덱스는 len(A)-1입니다.'),
  append:T('out.append(x): 결과 목록 out의 끝에 x 하나를 넣습니다.'),
  extend:T('out.extend(xs): xs의 원소들을 결과 목록에 이어 붙입니다.'),
  pop:T('A.pop(): 마지막 원소를 꺼내면서 지웁니다. 탐색한 선택을 되돌릴 때도 씁니다.'),
  copy:T('A.copy(): 목록을 복사합니다. 이후 A를 바꿔도 저장한 목록은 그대로입니다.'),
  min:T('min(a, b): 더 작은 값입니다. 최솟값을 갱신할 때 씁니다.'),
  max:T('max(a, b): 더 큰 값입니다. 최댓값을 갱신할 때 씁니다.'),
  abs:T('abs(x): 절댓값입니다. abs(3-8)은 5입니다.'),
  llabs:T('llabs(x): long long 정수의 절댓값입니다. stdlib.h의 함수입니다.'),
  sum:T('sum(A): 원소를 모두 더합니다.'),
  sorted:T('sorted(A): 정렬한 새 목록을 만듭니다. 원본 A는 그대로입니다. 정렬을 직접 구현하라는 문제에서는 대신 직접 작성하세요.'),
  sort:T('A.sort(): A 자체를 정렬합니다. 반환값을 다른 변수에 넣지 마세요.'),
  zip:T('zip(A, B): 두 목록에서 같은 위치의 원소를 묶어 읽습니다.'),
  enumerate:T('enumerate(A): (인덱스, 값)을 함께 꺼냅니다. for i, x in enumerate(A)처럼 씁니다.'),
  divmod:T('divmod(a, b): 몫과 나머지를 함께 반환합니다. q, r = divmod(7, 3)은 2, 1입니다.'),
  list:T('list(xs): 반복 가능한 값을 목록으로 바꿉니다.'),
  str:T('str(x): 값을 문자열로 바꿉니다.'),
  float:T('float("inf"): 무한대입니다. 최솟값을 찾기 전 초기값으로 쓸 수 있습니다.'),
  join:T('"".join(xs): 문자열 원소들을 이어 붙입니다.'),
  reversed:T('reversed(A): 원소를 뒤에서부터 읽습니다.'),
  all:T('all(조건들): 모든 조건이 참일 때만 True입니다.'),
  next:T('next(반복자): 다음 원소 하나를 꺼냅니다. 기본값을 주면 원소가 없을 때 그 값을 씁니다.'),
  combinations:T('combinations(A, r): 순서 없이 r개를 고릅니다. itertools에서 가져옵니다. 직접 생성하라는 문제에서는 대신 직접 반복·재귀를 작성하세요.'),
  permutations:T('permutations(A, r): 순서를 구별해 r개를 고릅니다. 직접 생성하라는 문제에서는 직접 작성하세요.'),
  strcmp:T('strcmp(a, b) == 0: 두 C 문자열의 내용이 같습니다. 문자열은 ==로 비교하지 않습니다.'),
  strlen:T('strlen(s): 끝의 \\0을 제외한 문자열 길이입니다.')
};

function hintText(ko, en, es){
  const locale=typeof UI_LOCALE==='string'?UI_LOCALE:'ko';
  return locale==='en'?en:locale.startsWith('es')?es:ko;
}
function hintSkeleton(solution){
  const lines=solution.split('\n'), choices=[];
  // Teach loop bounds, conditions, and state updates rather than only final returns.
  for(const [i,line] of lines.entries()){
    if(/^\s*(?:for|while|if)\b/.test(line))choices.push(i);
  }
  const update=lines.findIndex(line=>!/^\s*(?:def|int|void|long long|double)\b/.test(line)&&/\+=|\*=|\/=|\+\+|append\(|out\[|dp\[.*=/.test(line));
  if(update>=0&&!choices.includes(update))choices.splice(Math.min(2,choices.length),0,update);
  if(!choices.length){const i=lines.findIndex(line=>/\breturn\s+[^;\s}]/.test(line));if(i>=0)choices.push(i);}
  const blanks=choices.slice(0,3).map((i,n)=>{
    const answer=lines[i].trim(), label='___'+(n+1)+'___';
    lines[i]=lines[i].replace(answer,label);
    return {label,answer};
  });
  return {skeleton:lines.join('\n'),blanks};
}
function practiceHintData(p, lang){
  const guide=problemHintGuide(p);
  const steps=[...(guide?.steps||[T(p.hint)])];
  if(lang==='c'&&p.id==='P33')steps[2]=hintText('회문인 단어의 인덱스를 out에 저장하고 개수를 반환합니다. 실행 환경이 그 인덱스를 문자열로 보여 줍니다.','Write accepted word INDICES to out and return their count; the environment displays their strings.','Escribe los ÍNDICES de las palabras aceptadas en out y devuelve su cantidad; el entorno muestra sus cadenas.');
  if(p.id==='P66'&&lang!=='python'){
    const remaining=lang==='java'?'a.length - i':'n - i';
    steps[2]=hintText(`a[i]>b[j]이면 남은 왼쪽 값이 모두 b[j]보다 큽니다. ${remaining}개를 count에 더하고 j만 늘립니다. 남은 a가 [4,7], b[j]=2이면 2쌍입니다.`,`If a[i]>b[j], every remaining left value exceeds b[j]. Add ${remaining} to count and advance only j. [4,7] against 2 makes two pairs.`,`Si a[i]>b[j], todos los valores restantes de la izquierda superan a b[j]. Suma ${remaining} a count y avanza solo j. [4,7] frente a 2 forma dos pares.`);
  }
  const check=guide?.check||T(p.study?.boundary||'');
  const view=lang==='java'?javaView(p):lang==='c'?C_PROBLEMS[p.id]:p;
  if(lang==='java'){
    const contract=javaContract(p),tools=[],solution=javaHintReference(p);
    if(contract.types.some(type=>type.endsWith('[]')))tools.push(hintText('A.length는 배열 길이, A[i]는 i번째 원소입니다. 배열의 마지막 인덱스는 A.length-1입니다.','A.length is the array size; A[i] is element i. The last index is A.length-1.','A.length es el tamaño; A[i] es el elemento i. El último índice es A.length-1.'));
    if(contract.types.includes('String'))tools.push(hintText('s.length()는 문자열 길이, s.charAt(i)는 한 문자입니다. 문자열의 내용은 s.equals(t)로 비교합니다.','s.length() gives string length; s.charAt(i) reads a character; s.equals(t) compares contents.','s.length() da la longitud; s.charAt(i) lee un carácter; s.equals(t) compara el contenido.'));
    tools.push(hintText('for·while로 반복하고 if로 조건을 검사합니다. 배열 비교 전에 인덱스가 범위 안인지 확인하세요.','Use for/while loops and if conditions; check index bounds before reading an array.','Usa for/while para repetir e if para condiciones; verifica los índices antes de leer.'));
    tools.push(hintText('Math.min(a,b)·Math.max(a,b)는 작은·큰 값입니다. 두 변수 교환은 임시 변수에 기존 값을 보관한 뒤 합니다.','Math.min(a,b)/Math.max(a,b) select the smaller/larger value. Swapping requires saving an old value first.','Math.min(a,b)/Math.max(a,b) eligen el menor/mayor. Para intercambiar, guarda primero un valor anterior.'));
    tools.push(hintText('아래 함수의 반환형과 매개변수 형식을 유지하세요. main·Scanner는 작성하지 않습니다. long 결과는 중간 계산도 long으로 해야 합니다.','Keep the exact signature below; no main or Scanner is needed. For long results use long intermediates too.','Conserva la firma exacta; no escribas main ni Scanner. Los resultados long requieren cálculos intermedios long.'));
    if(contract.result.endsWith('[]'))tools.push(hintText('결과는 함수 반환형에 맞는 배열입니다. 개수를 세며 채운 작업 배열은 Arrays.copyOf(buffer,count)로 사용한 부분만 복사할 수 있습니다. ArrayList를 그대로 반환하면 배열 형식과 다릅니다.','Return an array of the declared type. Arrays.copyOf(buffer,count) trims a filled buffer to its used length; returning ArrayList directly is a type mismatch.','Devuelve un arreglo del tipo declarado. Arrays.copyOf(buffer,count) copia la parte usada; devolver ArrayList directamente no coincide con el tipo.'));
    if(solution.includes('ArrayList'))tools.push(hintText('ArrayList<int[]>는 길이가 다른 결과 행을 차례로 모으는 목록입니다. out.add(new int[]{x,y})로 한 행을 넣고, out.toArray(new int[out.size()][])로 int[][] 배열을 만들어 반환합니다.','ArrayList<int[]> collects result rows. out.add(new int[]{x,y}) adds a row; out.toArray(new int[out.size()][]) returns an int[][] array.','ArrayList<int[]> reúne filas. out.add(new int[]{x,y}) agrega una fila; out.toArray(new int[out.size()][]) devuelve un arreglo int[][].'));
    if(solution.includes('Arrays.copyOfRange'))tools.push(hintText('Arrays.copyOfRange(a,from,to)는 from부터 to 직전까지 복사합니다. a의 원본을 바꾸지 않고 왼쪽·오른쪽 절반을 나눌 때 씁니다.','Arrays.copyOfRange(a,from,to) copies from through to-1 without changing a; use it for left/right halves.','Arrays.copyOfRange(a,from,to) copia desde from hasta to-1 sin modificar a; sirve para separar las mitades.'));
    if(solution.includes('Arrays.fill'))tools.push(hintText('Arrays.fill(a,value)는 배열의 모든 칸을 value로 채웁니다. 아직 계산하지 않은 -1이나 도달하지 않은 무한대 값을 초기화할 때 씁니다.','Arrays.fill(a,value) fills every element; initialize unknown entries to -1 or unreachable distances to infinity.','Arrays.fill(a,value) llena todas las posiciones; inicia lo desconocido con -1 o las distancias inalcanzables con infinito.'));
    if(solution.includes('StringBuilder'))tools.push(hintText('StringBuilder는 문자를 쌓는 도구입니다. append로 뒤에 붙이고, reverse로 순서를 뒤집은 뒤 toString으로 문자열을 반환합니다.','StringBuilder collects characters: append adds, reverse reverses the order, and toString returns a String.','StringBuilder reúne caracteres: append agrega, reverse invierte y toString devuelve un String.'));
    if(/<<|>>/.test(solution))tools.push(hintText('1 << j는 j번째 비트만 켠 정수입니다. (mask & (1 << j)) != 0이면 그 원소를 선택한 것입니다.','1 << j selects bit j; (mask & (1 << j)) != 0 means that element is selected.','1 << j enciende el bit j; (mask & (1 << j)) != 0 indica que el elemento está seleccionado.'));
    if(solution.includes('%'))tools.push(hintText('%는 나머지입니다. x % d == 0이면 x는 d로 나누어떨어집니다. Java에서 /는 정수끼리 계산하면 소수 부분을 버립니다.','% is remainder; x % d == 0 means divisibility. Java integer division discards the fractional part.','% es el resto; x % d == 0 indica divisibilidad. La división entera de Java descarta la parte decimal.'));
    if(solution.includes('"" +'))tools.push(hintText('"" + a + b는 빈 문자열 뒤에 값을 차례로 이어 붙입니다. 숫자 덧셈으로 계산하지 않으므로 0으로 시작하는 후보도 유지됩니다.','"" + a + b concatenates values as text rather than adding them, preserving leading zeroes.','"" + a + b concatena valores como texto en vez de sumarlos y conserva ceros iniciales.'));
    if(JAVA_HINT_HELPERS[p.id])tools.push(hintText('완성 예시의 private static 보조 함수도 직접 작성합니다. Java 내장 함수가 아니며 예시 아래에 정의가 함께 있습니다.','Also write the private static helper in the reference; it is defined below and is not a Java built-in.','Escribe también la función auxiliar private static de la referencia; está definida abajo y no es una función integrada.'));
    if(p.provided)tools.push(hintText('Solution extends LabSupport를 유지하면 아래 제공 함수가 연결됩니다. 해당 함수는 답안에 다시 작성하지 않아도 됩니다.','Keep Solution extends LabSupport to access the supplied helpers below; do not redefine them in your answer.','Conserva Solution extends LabSupport para usar las funciones suministradas; no hace falta redefinirlas.'));
    if(p.provided)tools.push(T(p.provided));
    if(solution)return {solution,tools,steps,method:steps.join('\n'),check,signature:view.signature,...hintSkeleton(solution)};
    const comments=steps.map((step,i)=>'    // TODO '+(i+1)+': '+step).join('\n');
    return {solution:'',tools,steps,method:steps.join('\n'),check,signature:view.signature,skeleton:view.starter.replace(/    \/\/[^\n]*\n/,comments+'\n'),blanks:[]};
  }
  const solution=HINT_REFERENCES[p.id]?.[lang]||(lang==='c'?p.c?.solution:p.solution)||'';
  const tools=[];
  for(const [name,description] of Object.entries(HINT_TOOLS)){
    if(new RegExp('\\b'+name+'\\s*\\(').test(solution||view.hint||''))tools.push(description);
  }
  if(/\bfor\b/.test(solution))tools.unshift(lang==='c'?T('for (int i=0; i<n; i++): i를 0부터 n-1까지 하나씩 바꾸며 반복합니다.'):T('for i in range(n): i를 0부터 n-1까지 하나씩 바꾸며 반복합니다. 들여쓴 줄들이 반복됩니다.'));
  if(/\bwhile\b/.test(solution))tools.push(T('while: 조건이 참인 동안 반복합니다. 반복 안에서 조건에 쓰는 값을 갱신해야 끝납니다.'));
  if(/\bif\b/.test(solution))tools.push(T('if: 조건이 참일 때만 실행합니다. =는 대입, ==는 같은지 비교입니다.'));
  if(solution.includes('%'))tools.push(T('%: 나머지 연산입니다. n % d == 0이면 n은 d로 나누어떨어집니다.'));
  if(lang==='python'&&/f["']/.test(solution))tools.push(T('f"{a}{b}": 중괄호 안의 값을 문자열에 넣습니다. a=0, b=3이면 "03"입니다. 숫자로 바꾸지 않으므로 앞자리 0이 남습니다.'));
  if(lang==='python'&&solution.includes('//'))tools.push(T('//: 정수 몫입니다. 7 // 2는 3입니다. /와 달리 정수끼리 계산하면 정수 결과를 줍니다.'));
  if(lang==='python'&&/\[[^\n]*:[^\n]*\]/.test(solution))tools.push(T('A[start:stop]: start부터 stop 직전까지 잘라 새 목록을 만듭니다. A[:mid]는 앞쪽, A[mid:]는 뒤쪽입니다.'));
  if(lang==='python'&&/\[[^\n]*\bfor\b/.test(solution))tools.push(T('[식 for x in A if 조건]: A에서 x를 하나씩 꺼내 조건에 맞는 값만 식으로 계산하여 목록에 넣습니다. 보통의 for·if·append로 풀어 써도 됩니다.'));
  if(solution.includes('<<')||solution.includes('>>'))tools.push(T('<<, >>: 비트를 왼쪽·오른쪽으로 옮깁니다. 1 << i는 i번째 비트만 켠 값입니다.'));
  if(/\b(?:break|continue)\b/.test(solution))tools.push(hintText('break는 현재 반복문을 끝내고, continue는 이번 반복의 나머지만 건너뜁니다. 여러 반복문 전체를 끝내는 return과 구별하세요.','break ends the current loop; continue skips the rest of this iteration. Neither is return from the function.','break termina el bucle actual; continue omite el resto de esta iteración. No son return de la función.'));
  if(/\b(?:long long|long)\b/.test(solution)&&lang==='c')tools.push(hintText('long long은 큰 정수용입니다. (long long)a처럼 곱셈·뺄셈 전에 변환해야 중간 계산의 int 넘침을 막습니다.','long long holds large integers. Cast before multiplication/subtraction to prevent int overflow in intermediate calculations.','long long almacena enteros grandes. Convierte antes de multiplicar/restar para evitar desbordamientos intermedios de int.'));
  if(lang==='c')tools.push(T('배열 길이는 n 같은 매개변수로 받습니다. out 배열이 있다면 그 배열에 결과를 쓰고, 문제에서 지정한 반환값도 return으로 돌려주세요. main()과 입력 코드는 실행 환경이 제공합니다.'));
  else tools.push(T('매개변수에 입력이 이미 들어옵니다. input()을 쓰지 마세요. print()는 화면 출력이고, return은 채점기에 결과를 돌려줍니다. 배열 수정형은 지정된 배열을 직접 바꿉니다.'));
  const definitions=solution.split('\n').filter(line=>lang==='c'?/^\s*(?:int|void|long long|double)\s+\w+\s*\(/.test(line):/^\s*def \w+\(/.test(line));
  const helpers=definitions.filter(line=>!new RegExp('\\b'+p.function+'\\s*\\(').test(line));
  if(helpers.length)tools.push(T('아래 보조 함수는 내장 함수가 아닙니다. 완성 예시에 정의가 함께 있으므로 직접 작성합니다.\n')+helpers.join('\n'));
  if(p.provided)tools.push(T('이 문제에서 제공하는 도구\n')+p.provided);
  const skeleton=solution?hintSkeleton(solution):{skeleton:view.starter,blanks:[]};
  const signature=lang==='c'?(view.signature||view.starter.split('{')[0].trim()):p.starter.split('\n')[0];
  return {solution,tools,steps,method:steps.join('\n'),check,signature,...skeleton};
}

function renderPracticeHints(p){
  let panel=$('practice-hints');
  if(!panel){panel=document.createElement('section');panel.id='practice-hints';$('hint').parentElement.hidden=true;$('hint').parentElement.after(panel);}
  panel.replaceChildren();
  const el=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n;};
  const data=practiceHintData(p,language);
  const toggle=el('button',T('도움이 필요해요'));toggle.type='button';toggle.setAttribute('aria-expanded','false');
  const body=el('div','');body.hidden=true;toggle.onclick=()=>{body.hidden=!body.hidden;toggle.setAttribute('aria-expanded',String(!body.hidden));};panel.append(toggle,body);
  const content=el('div','');content.id='hint-steps';
  const button=el('button',T('힌트 받기 · 1단계'));button.type='button';button.setAttribute('aria-controls','hint-steps');
  const status=el('p','');status.setAttribute('role','status');status.className='hint-status';
  let step=0;
  const titles=[T('필요한 문법·함수'),T('어떤 순서로 풀까요?'),T('빈칸을 채우며 따라 쓰기'),T('완성 풀이와 비교하기')];
  const previous=el('button',T('이전 단계'));previous.type='button';
  const paint=()=>{
    content.replaceChildren();
    const card=el('details','');card.open=true;card.append(el('summary',(UI_ES?`Paso ${step+1} · ${titles[step]}`:UI_EN?`Step ${step+1} · ${titles[step]}`:`${step+1}단계 · ${titles[step]}`)));
    if(step===0){card.append(el('pre',data.signature));const list=el('ul','');for(const text of data.tools)list.append(el('li',text));card.append(list);}
    if(step===1){const list=el('ol','');for(const text of data.steps)list.append(el('li',text));card.append(list);const check=el('p',data.check);check.className='hint-checkpoint';card.append(el('h4',T('경계 조건도 확인하기')),check);}
    if(step===2){card.append(el('p',data.blanks.length?hintText('표시한 빈칸에 핵심 코드 한 줄씩을 채워 보세요. 빈칸이 남아 있으면 실행할 수 없습니다. 각 답은 따로 펼쳐 볼 수 있습니다.','Fill each marked blank with a key code line. This is not runnable until all blanks are filled; reveal each answer separately.','Completa cada hueco con una línea clave. No se puede ejecutar con huecos; puedes revelar las respuestas por separado.'):hintText('TODO 설명을 한 단계씩 코드로 옮기세요. throw 문은 미완성 표시이므로 완성한 뒤 제거합니다. 함수 형식은 유지하세요.','Implement the TODO steps one at a time. Remove the throw placeholder after completing the function; keep its signature.','Implementa los pasos TODO uno por uno. Elimina el throw al completar la función y conserva la firma.')),el('pre',data.skeleton));for(const blank of data.blanks){const answer=el('details','');answer.append(el('summary',blank.label+T(' 답 확인')),el('pre',blank.answer));card.append(answer);}if(!data.solution)card.append(el('p',hintText('Python·C 완성 풀이에서 같은 알고리즘의 흐름을 비교할 수 있습니다. Java 문법과 반환형은 위 함수 형식을 따르세요.','Compare the algorithm flow with the Python/C references. Keep the Java syntax and return type shown above.','Compara el algoritmo con las soluciones Python/C y conserva la sintaxis y el tipo Java indicados.')));}
    if(step===3){card.append(el('p',T('한 줄씩 내 코드와 비교해 보세요. 예시 실행으로 확인한 뒤, 풀이를 닫고 다시 작성해 보세요.')),el('pre',data.solution),el('h4',T('경계 조건도 확인하기')),el('p',data.check));if(p.study?.complexity)card.append(el('h4',T('복잡도 설명')),el('p',p.study.complexity));if(p.pythonPrelude?.includes('def ')||p.cPrelude){const prelude=language==='c'?p.cPrelude:p.pythonPrelude;if(prelude)card.append(el('h4',T('실행 환경에서 제공하는 코드 · 답안에 다시 넣지 않아도 됩니다')),el('pre',prelude));}}
    content.append(card);status.textContent=((step+1)+T(" / ")+(data.solution?4:3)+T(" 단계"));previous.disabled=step===0;
    const total=data.solution?4:3;button.hidden=step===total-1;button.textContent=T('다음 단계');
  };
  button.onclick=()=>{if(step<(data.solution?4:3)-1){step++;paint();}};previous.onclick=()=>{if(step>0){step--;paint();}};
  const nav=el('div','');nav.className='hint-navigation';nav.append(previous,status,button);body.append(content,nav);paint();
}
