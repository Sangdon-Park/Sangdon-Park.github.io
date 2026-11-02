// Small, local demonstrations of the four published Chapter 7 contracts.
// No student code, account state or submissions are read or written here.
function ch7Text(ko, en, es) {
  const locale = typeof UI_LOCALE === 'string' ? UI_LOCALE : 'ko';
  return locale === 'en' ? en : locale.startsWith('es') ? es : ko;
}
const CH7_STEPS = {
  'F07-01': [
    ['첫 자리에는 n장 중 한 장, 둘째 자리에는 남은 n−1장 중 한 장을 놓습니다.','The first slot has n choices; the second has n−1 unused cards.','La primera posición tiene n opciones; la segunda, n−1 cartas sin usar.'],
    ['answer=1에서 시작해 자리를 하나 채울 때마다 남은 카드 수를 곱합니다. 경우의 수만 필요하므로 반복문으로 계산해도 됩니다.','Start answer at 1 and multiply by the available card count for each slot. A loop is sufficient because only the count is required.','Inicia answer en 1 y multiplica por las cartas disponibles en cada posición. Basta un bucle porque solo se pide la cantidad.'],
    ['r개 자리를 모두 처리한 뒤 answer를 반환합니다. 카드 목록이나 마지막 카드 번호를 반환하지 않습니다.','After processing r slots, return answer, not a list or the last card number.','Tras procesar r posiciones, devuelve answer, no una lista ni el número de la última carta.'],
    ['r=0이면 곱셈을 한 번도 하지 않아 1입니다. n=0,r=0도 1이고, n=8,r=8은 40320입니다.','With r=0 there are no multiplications, so the answer is 1. This includes n=0,r=0. For n=8,r=8 it is 40320.','Con r=0 no se multiplica y la respuesta es 1, incluso para n=0,r=0. Para n=8,r=8 es 40320.']
  ],
  'F07-02': [
    ['search(i,total)은 i번 원소부터 선택을 정할 때, 현재 합이 total인 상태입니다. 처음에는 search(0,0)입니다.','search(i,total) processes elements from index i with current sum total. Start with search(0,0).','search(i,total) procesa desde el índice i con suma actual total. Empieza con search(0,0).'],
    ['a[i]를 건너뛰면 search(i+1,total), 고르면 search(i+1,total+a[i])입니다. 두 갈래에서 찾은 개수를 더합니다.','Skip with search(i+1,total), or take with search(i+1,total+a[i]). Add the counts returned by both branches.','Omite con search(i+1,total) o elige con search(i+1,total+a[i]). Suma las cantidades de ambas ramas.'],
    ['원소를 모두 확인했을 때 합이 target이면 1, 아니면 0을 반환합니다. 모든 값이 양수이므로 합이 target을 넘으면 그 갈래는 0으로 끝냅니다.','After all elements, return 1 if the sum equals target, otherwise 0. All values are positive, so prune a branch whose sum exceeds target.','Al terminar, devuelve 1 si la suma es target y 0 si no. Todos los valores son positivos: corta una rama si la suma supera target.'],
    ['[1,1]에서 첫 번째 1과 두 번째 1은 따로 셉니다. 빈 배열에서 target=0이면 1입니다. i와 total은 각 호출의 값이므로 pop이나 뺄셈으로 되돌릴 필요가 없습니다.','In [1,1], the two positions count separately. An empty array with target=0 returns 1. Each call has its own i and total; no pop or subtraction is needed to undo them.','En [1,1], las dos posiciones cuentan por separado. Un arreglo vacío con target=0 devuelve 1. Cada llamada tiene sus propios i y total: no hace falta pop ni restar para deshacerlos.']
  ],
  'F07-03': [
    ['paint(v)는 v번 점에 색을 정하는 단계입니다. color에는 이미 정한 색을 저장하고, 0은 아직 칠하지 않았다는 뜻으로 씁니다.','paint(v) assigns a color to vertex v. Store assigned colors in color; 0 means uncolored.','paint(v) asigna un color al vértice v. Guarda los colores en color; 0 significa sin colorear.'],
    ['색 1~k를 하나씩 시도합니다. 이미 칠한 이웃 중 같은 색이 있으면 그 색은 건너뜁니다. 가능하면 색을 저장하고 다음 점으로 갑니다.','Try colors 1 through k. Skip a color used by an already colored neighbor; otherwise store it and move to the next vertex.','Prueba los colores de 1 a k. Omite un color usado por un vecino ya coloreado; si se puede, guárdalo y pasa al siguiente vértice.'],
    ['다음 점부터 색칠에 성공하면 1을 바로 반환합니다. 실패하면 color[v]=0으로 되돌리고 다른 색을 시도합니다. 모든 색이 실패하면 0입니다.','Return 1 immediately if the remaining vertices can be colored. On failure, reset color[v]=0 and try another color. Return 0 if all colors fail.','Devuelve 1 en cuanto se puedan colorear los vértices restantes. Si falla, restaura color[v]=0 y prueba otro color. Si todos fallan, devuelve 0.'],
    ['삼각형은 두 색이면 0, 세 색이면 1입니다. 떨어진 점도 빠짐없이 칠합니다. 가능한 배치 수를 더하는 문제가 아니라, 한 가지라도 가능한지 찾는 문제입니다.','A triangle returns 0 for two colors and 1 for three. Include isolated vertices. Find whether any coloring exists; do not add up all colorings.','Un triángulo devuelve 0 con dos colores y 1 con tres. Incluye los vértices aislados. Busca si existe alguna coloración, no cuántas hay.']
  ],
  'F07-04': [
    ['한 행에 퀸 하나씩 놓습니다. columns[row]에는 row행에 놓은 퀸의 열 번호를 저장합니다. 행과 열 번호는 코드에서 0부터 셉니다.','Place one queen per row. columns[row] stores the chosen column. Code uses row and column indices starting at 0.','Coloca una reina por fila. columns[row] guarda su columna. Los índices del código empiezan en 0.'],
    ['이전 퀸과 열이 같거나, 열 차이의 절댓값이 행 차이와 같으면 공격받는 칸입니다. 그런 칸은 건너뛰고 가능한 칸에 놓은 뒤 다음 행으로 갑니다.','Reject a column shared with an earlier queen, or a square where absolute column difference equals row difference. Otherwise place the queen and visit the next row.','Descarta una columna ocupada o una casilla donde la diferencia absoluta de columnas iguale la de filas. Si es válida, coloca la reina y pasa a la siguiente fila.'],
    ['n개 행을 다 채웠으면 배치 하나를 찾았으므로 1을 반환합니다. 돌아오면 방금 놓은 퀸을 빼고 다음 열을 시도하며, 찾은 개수를 모두 더합니다.','After filling n rows, return 1 for one complete placement. Undo the last queen, try the next column, and add all counts.','Al llenar n filas, devuelve 1 por una colocación completa. Retira la última reina, prueba otra columna y suma todas las cantidades.'],
    ['n=1은 1, n=2와 n=3은 0, n=4는 2입니다. C 예제는 앞선 행만 읽고 현재 행을 덮어쓰므로, 돌아올 때 pos[row]를 지우지 않아도 됩니다.','n=1 gives 1; n=2 and n=3 give 0; n=4 gives 2. The C reference reads only previous rows and overwrites the current row, so it need not clear pos[row] on return.','n=1 da 1; n=2 y n=3 dan 0; n=4 da 2. La solución C solo lee filas anteriores y sobrescribe la actual, por lo que no necesita borrar pos[row] al volver.']
  ]
};
function chapterSevenHint(p) {
  const entry = CH7_STEPS[p.id];
  return entry ? {steps:entry.slice(0,3).map(row=>ch7Text(...row)),check:ch7Text(...entry[3])} : null;
}
function chapterSevenTools(p, lang) {
  if (!CH7_STEPS[p.id]) return [];
  const notes=[];
  if(lang==='c') {
    notes.push(ch7Text('이 네 문제의 반환형은 int입니다. 카드 배치는 최대 40,320가지이고, 원소 20개의 전체 선택은 2^20=1,048,576가지입니다. 색칠 여부는 0 또는 1, 8-퀸 배치는 92가지이므로 결과가 모두 32비트 int 범위에 들어갑니다.','All four return int. Card placements reach 40,320, and 20 elements have 2^20=1,048,576 subsets in total. Colorability is 0 or 1, and eight queens have 92 placements. All result counts fit in a 32-bit int.','Las cuatro devuelven int. Hay hasta 40.320 colocaciones de cartas y 2^20=1.048.576 subconjuntos en total para 20 elementos. La coloración devuelve 0 o 1 y ocho reinas tienen 92 soluciones. Los resultados caben en int de 32 bits.'));
    if(p.id==='F07-02'||p.id==='F07-03'||p.id==='F07-04')notes.push(ch7Text('C의 보조 함수는 정답 함수 위에 따로 작성합니다. 정답 함수 안에 함수 정의를 넣지 않습니다. 예제의 static은 같은 파일 안에서 사용하는 함수라는 표시입니다.','In C, define the helper separately above the required function, not inside it. static marks a helper used within this file.','En C, define la función auxiliar por separado encima de la función pedida, no dentro. static limita su uso a este archivo.'));
    if(p.id==='F07-02')notes.push(ch7Text('const int a[]는 읽기만 하는 정수 배열입니다. n은 원소 수입니다. 예를 들어 a=[1,2,3]이면 n=3이며, 마지막 원소는 a[2]입니다.','const int a[] is a read-only integer array. n is its length: [1,2,3] has n=3 and last element a[2].','const int a[] es un arreglo de enteros de solo lectura. n es su longitud: [1,2,3] tiene n=3 y termina en a[2].'));
    if(p.id==='F07-03')notes.push(ch7Text('graph[][8]은 한 행에 8칸인 C 배열입니다. 사이트가 나머지를 채워 전달하며, 앞의 n행·n열만 읽습니다. color[8]={0}은 작업 배열을 모두 0으로 초기화합니다.','graph[][8] is a C array with 8 cells per row. The runtime pads it; read only its first n rows and n columns. color[8]={0} initializes the workspace to zero.','graph[][8] tiene 8 celdas por fila. El entorno lo rellena; lee solo las primeras n filas y n columnas. color[8]={0} inicializa el espacio de trabajo a cero.'));
  }
  if(lang==='python'&&(p.id==='F07-02'||p.id==='F07-03'||p.id==='F07-04'))notes.push(ch7Text('들여쓴 def는 바깥 함수 안에서 사용하는 보조 함수입니다. 바깥 함수의 배열을 읽을 수 있습니다. 보조 함수만 정의하고 끝내지 말고 마지막 줄에서 첫 호출의 결과를 return합니다.','An indented def defines a helper inside the outer function and can read its arrays. Defining it is not enough: return the first call at the end of the outer function.','Un def con sangría define una función auxiliar dentro de la principal y puede leer sus arreglos. No basta con definirla: devuelve la primera llamada al final.'));
  return notes;
}
function chapterSevenDescription(p, view) {
  if (!CH7_STEPS[p.id]) return view.statement;
  // Examples are rendered below with diagrams and language-specific calls.
  const marker = '\n\n예제\n', at = view.statement.indexOf(marker);
  if (at < 0) return view.statement;
  const c = view.statement.indexOf('\n\nC 함수\n',at);
  return view.statement.slice(0,at) + (c < 0 ? '' : view.statement.slice(c));
}
function ch7Element(tag, text, className) {
  const node=document.createElement(tag);
  if(text!==undefined)node.textContent=text;
  if(className)node.className=className;
  return node;
}
function ch7Button(text, onClick) {
  const b=ch7Element('button',text);b.type='button';b.onclick=onClick;return b;
}
function ch7Graph(colors) {
  const ns='http://www.w3.org/2000/svg', svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 300 180');svg.setAttribute('role','img');
  svg.setAttribute('aria-label',ch7Text('세 점이 서로 연결된 삼각형. 점 0은 색 1, 점 1은 색 2.','Triangle: vertex 0 uses color 1 and vertex 1 uses color 2.','Triángulo: el vértice 0 usa el color 1 y el 1, el color 2.'));
  const points=[[55,135],[245,135],[150,35]];
  for(const [a,b] of [[0,1],[0,2],[1,2]]){
    const line=document.createElementNS(ns,'line');
    for(const [attr,value] of Object.entries({x1:points[a][0],y1:points[a][1],x2:points[b][0],y2:points[b][1],stroke:'#758c9d','stroke-width':3}))line.setAttribute(attr,value);
    svg.append(line);
  }
  points.forEach(([cx,cy],i)=>{
    const circle=document.createElementNS(ns,'circle');
    for(const [attr,value] of Object.entries({cx,cy,r:24,fill:['#ffcc93','#afd9ff',colors===3?'#a4dfc4':'#f7e7e6'][i],stroke:'#26384b','stroke-width':2}))circle.setAttribute(attr,value);
    const t=document.createElementNS(ns,'text');t.setAttribute('x',cx);t.setAttribute('y',cy+6);t.setAttribute('text-anchor','middle');t.setAttribute('fill','#172b3a');t.textContent=String(i);
    svg.append(circle,t);
  });
  return svg;
}
function mountChapterSevenDemo(host, id) {
  host.replaceChildren();host.className='ch7-demo';host.dataset.problem=id;
  const add=(tag,text,cls)=>{const el=ch7Element(tag,text,cls);host.append(el);return el;};
  add('p',ch7Text('그림으로 먼저 확인하기','Explore the example','Explora el ejemplo'),'ch7-eyebrow');
  const result=()=>{const el=ch7Element('p','', 'ch7-result');el.setAttribute('aria-live','polite');return el;};
  if(id==='F07-01'){
    add('h4',ch7Text('카드 3장으로 두 자리를 채우면?','Fill two slots with three cards','Llena dos posiciones con tres cartas'));
    add('p',ch7Text('첫 카드 번호를 눌러 보세요. 같은 카드는 다시 놓을 수 없습니다.','Choose the first card. It cannot be reused in the second slot.','Elige la primera carta. No puede repetirse en la segunda posición.'));
    const buttons=add('div',undefined,'ch7-controls'),rows=add('div',undefined,'ch7-card-rows');
    const rowNodes=[1,2,3].map(first=>{
      const row=ch7Element('div',undefined,'ch7-card-row');
      row.append(ch7Element('strong',`${first} →`));
      [1,2,3].filter(n=>n!==first).forEach(second=>row.append(ch7Element('span',`[${first}, ${second}]`,'ch7-card')));
      rows.append(row);return row;
    });
    const select=first=>{rowNodes.forEach((row,i)=>row.classList.toggle('is-selected',i===first-1));[...buttons.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===first-1)));};
    [1,2,3].forEach(first=>buttons.append(ch7Button(String(first),()=>select(first))));select(1);
    const out=result();out.textContent=ch7Text('전체 3 × 2 = 6가지 → 반환값 6','3 × 2 = 6 placements → return 6','3 × 2 = 6 colocaciones → devuelve 6');host.append(out);
    add('p',ch7Text('카드 순서를 바꾸면 다른 배치입니다. r=0일 때는 빈 배치 한 가지이므로 1입니다.','Reversing the order creates a different placement. For r=0, the single empty placement gives 1.','Cambiar el orden crea otra colocación. Para r=0, la única colocación vacía da 1.'));
  } else if(id==='F07-02'){
    add('h4',ch7Text('목표 합을 만드는 선택 세기','Count selections that reach the target','Cuenta las selecciones que alcanzan el objetivo'));
    const tabs=add('div',undefined,'ch7-controls'),input=add('p'),cards=add('div',undefined,'ch7-controls'),sum=result(),all=add('div',undefined,'ch7-subsets'),out=result();host.insertBefore(sum,all);host.append(out);
    let values=[1,2,3],target=3,mask=3;
    const draw=()=>{
      input.textContent=`a=[${values.join(',')}], target=${target}`;cards.replaceChildren();all.replaceChildren();
      values.forEach((v,i)=>{const b=ch7Button(`${ch7Text('위치','index','índice')} ${i}: ${v}`,()=>{mask^=1<<i;draw();});b.setAttribute('aria-pressed',String(Boolean(mask&(1<<i))));cards.append(b);});
      const selected=values.filter((v,i)=>mask&(1<<i)),total=selected.reduce((a,b)=>a+b,0);
      sum.textContent=ch7Text(`지금 고른 값: [${selected}] → 합 ${total}`,`Selected: [${selected}] → sum ${total}`,`Elegidos: [${selected}] → suma ${total}`);
      let count=0;
      for(let m=0;m<(1<<values.length);m++){
        const indices=values.map((v,i)=>i).filter(i=>m&(1<<i)),s=indices.reduce((a,i)=>a+values[i],0),ok=s===target;
        if(ok)count++;
        const item=ch7Element('span',`${ok?'✓ ':''}{${indices.join(',')}} → ${s}`,ok?'ch7-match':'');all.append(item);
      }
      out.textContent=ch7Text(`목표 합인 선택 ${count}개 → 반환값 ${count}`,`${count} selections reach the target → return ${count}`,`${count} selecciones alcanzan el objetivo → devuelve ${count}`);
    };
    [[1,2,3],[1,1]].forEach((a,i)=>tabs.append(ch7Button(`[${a.join(',')}]`,()=>{values=a;target=i?1:3;mask=i?1:3;[...tabs.children].forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));draw();})));
    tabs.firstChild.setAttribute('aria-pressed','true');tabs.lastChild.setAttribute('aria-pressed','false');draw();
    add('p',ch7Text('중괄호 안 숫자는 고른 위치 번호입니다. 같은 값이라도 위치가 다르면 따로 셉니다. 각 위치에서 고르기·건너뛰기를 한 번씩 정하므로 순서를 바꿔 중복 계산하지 않습니다.','Numbers in braces are selected indices. Equal values at different indices count separately. Take or skip each index once to avoid counting reordered selections again.','Los números entre llaves son índices elegidos. Valores iguales en índices distintos cuentan por separado. Elige u omite cada índice una vez para no contar otra vez un cambio de orden.'));
  } else if(id==='F07-03'){
    add('h4',ch7Text('삼각형의 마지막 점은 무슨 색으로 칠할까요?','Which color can the last vertex use?','¿Qué color puede usar el último vértice?'));
    const controls=add('div',undefined,'ch7-controls'),drawing=add('div'),out=result();host.append(out);
    add('pre','graph = [[0,1,1],\n         [1,0,1],\n         [1,1,0]]');
    add('p',ch7Text('점 번호는 0, 1, 2입니다. 표의 i행 j열이 1이면 점 i와 j 사이에 선이 있습니다. 예를 들어 graph[0][2]=1이므로 0번과 2번은 이웃입니다.','Vertices are numbered 0, 1, 2. A 1 at row i, column j means an edge connects i and j. For example, graph[0][2]=1 connects vertices 0 and 2.','Los vértices son 0, 1, 2. Un 1 en la fila i y columna j indica una arista entre i y j. Por ejemplo, graph[0][2]=1 conecta 0 y 2.'));
    const draw=k=>{
      drawing.replaceChildren(ch7Graph(k));
      [...controls.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(k===i+2)));
      out.textContent=k===2?ch7Text('색 1·2는 이웃이 이미 사용 → 마지막 점을 칠할 수 없음 → 반환값 0','Colors 1 and 2 are used by neighbors → no color for the last vertex → return 0','Los vecinos usan los colores 1 y 2 → no queda color → devuelve 0'):ch7Text('마지막 점에 색 3을 사용 → 세 점 모두 색칠 가능 → 반환값 1','Use color 3 for the last vertex → all vertices colored → return 1','Usa el color 3 en el último vértice → todos coloreados → devuelve 1');
    };
    [2,3].forEach(k=>controls.append(ch7Button(`k=${k}`,()=>draw(k))));draw(2);
    add('p',ch7Text('배치 한 가지를 찾으면 성공입니다. 색칠 방법이 여러 개여도 반환값은 1입니다.','One valid coloring is enough. Even if several colorings exist, return 1.','Basta una coloración válida. Aunque existan varias, devuelve 1.'));
  } else if(id==='F07-04'){
    add('h4',ch7Text('4×4에서 가능한 배치는 두 가지','Two valid placements on a 4×4 board','Dos colocaciones válidas en un tablero de 4×4'));
    const controls=add('div',undefined,'ch7-controls'),board=add('div',undefined,'ch7-board'),explain=add('p'),out=result();host.append(out);
    const solutions=[[1,3,0,2],[2,0,3,1]],draw=which=>{
      board.replaceChildren();const cols=solutions[which];
      board.setAttribute('role','img');board.setAttribute('aria-label',ch7Text(`위에서부터 열 번호 ${cols.join(', ')}에 퀸 배치 (0부터 셈)`,`Queen columns from top row: ${cols.join(', ')} (zero-based)`,`Columnas desde la fila superior: ${cols.join(', ')} (desde cero)`));
      for(let r=0;r<4;r++)for(let c=0;c<4;c++)board.append(ch7Element('span',cols[r]===c?'♛':'',`ch7-square ${(r+c)%2?'dark':'light'}`));
      [...controls.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===which)));
      explain.textContent=ch7Text(`코드에서 쓰는 열 번호: [${cols}] (0부터 셈). 맨 위 행부터 퀸을 하나씩 놓은 결과입니다.`,`Columns in code: [${cols}] (zero-based), one queen per row from top to bottom.`,`Columnas en el código: [${cols}] (desde cero), una reina por fila de arriba abajo.`);
    };
    [0,1].forEach(i=>controls.append(ch7Button(ch7Text(`배치 ${i+1}`,`Placement ${i+1}`,`Colocación ${i+1}`),()=>draw(i))));draw(0);
    out.textContent=ch7Text('서로 다른 배치 2개 → 반환값 2','2 different placements → return 2','2 colocaciones distintas → devuelve 2');
    add('p',ch7Text('같은 열은 금지입니다. 대각선은 “행 차이 = 열 차이의 절댓값”으로 확인합니다. 예: (0행,1열)과 (1행,2열)은 두 차이가 모두 1이라 서로 공격합니다.','Same columns are forbidden. A diagonal has row difference equal to absolute column difference. For example, (row 0,col 1) and (row 1,col 2) attack each other: both differences are 1.','Una columna compartida está prohibida. En una diagonal, la diferencia de filas iguala la diferencia absoluta de columnas. (fila 0,col 1) y (fila 1,col 2) se atacan: ambas diferencias son 1.'));
  }
}
function renderChapterSeven(p) {
  let panel=document.getElementById('chapter-seven-demo');
  if(!panel){panel=document.createElement('section');panel.id='chapter-seven-demo';document.getElementById('statement').after(panel);}
  panel.hidden=!CH7_STEPS[p.id];
  panel.closest('article').classList.toggle('ch7-article',!panel.hidden);
  if(!panel.hidden)mountChapterSevenDemo(panel,p.id);
}
// The public problem overview shares the same diagrams and contracts.
document.querySelectorAll('[data-ch7-demo]').forEach(host=>mountChapterSevenDemo(host,host.dataset.ch7Demo));
