// Practice assistance only: uses the same reviewed examples as the problem bank.
const HINT_TOOLS = {
  range:'range(start, stop): start부터 stop 직전까지 반복합니다. range(3)은 0, 1, 2입니다.',
  len:'len(A): 배열·문자열의 길이입니다. 마지막 인덱스는 len(A)-1입니다.',
  append:'out.append(x): 결과 목록 out의 끝에 x 하나를 넣습니다.',
  extend:'out.extend(xs): xs의 원소들을 결과 목록에 이어 붙입니다.',
  pop:'A.pop(): 마지막 원소를 꺼내면서 지웁니다. 탐색한 선택을 되돌릴 때도 씁니다.',
  copy:'A.copy(): 목록을 복사합니다. 이후 A를 바꿔도 저장한 목록은 그대로입니다.',
  min:'min(a, b): 더 작은 값입니다. 최솟값을 갱신할 때 씁니다.',
  max:'max(a, b): 더 큰 값입니다. 최댓값을 갱신할 때 씁니다.',
  abs:'abs(x): 절댓값입니다. abs(3-8)은 5입니다.',
  llabs:'llabs(x): long long 정수의 절댓값입니다. stdlib.h의 함수입니다.',
  sum:'sum(A): 원소를 모두 더합니다.',
  sorted:'sorted(A): 정렬한 새 목록을 만듭니다. 원본 A는 그대로입니다. 정렬을 직접 구현하라는 문제에서는 대신 직접 작성하세요.',
  sort:'A.sort(): A 자체를 정렬합니다. 반환값을 다른 변수에 넣지 마세요.',
  zip:'zip(A, B): 두 목록에서 같은 위치의 원소를 묶어 읽습니다.',
  enumerate:'enumerate(A): (인덱스, 값)을 함께 꺼냅니다. for i, x in enumerate(A)처럼 씁니다.',
  divmod:'divmod(a, b): 몫과 나머지를 함께 반환합니다. q, r = divmod(7, 3)은 2, 1입니다.',
  list:'list(xs): 반복 가능한 값을 목록으로 바꿉니다.',
  str:'str(x): 값을 문자열로 바꿉니다.',
  float:'float("inf"): 무한대입니다. 최솟값을 찾기 전 초기값으로 쓸 수 있습니다.',
  join:'"".join(xs): 문자열 원소들을 이어 붙입니다.',
  reversed:'reversed(A): 원소를 뒤에서부터 읽습니다.',
  all:'all(조건들): 모든 조건이 참일 때만 True입니다.',
  next:'next(반복자): 다음 원소 하나를 꺼냅니다. 기본값을 주면 원소가 없을 때 그 값을 씁니다.',
  combinations:'combinations(A, r): 순서 없이 r개를 고릅니다. itertools에서 가져옵니다. 직접 생성하라는 문제에서는 대신 직접 반복·재귀를 작성하세요.',
  permutations:'permutations(A, r): 순서를 구별해 r개를 고릅니다. 직접 생성하라는 문제에서는 직접 작성하세요.',
  strcmp:'strcmp(a, b) == 0: 두 C 문자열의 내용이 같습니다. 문자열은 ==로 비교하지 않습니다.',
  strlen:'strlen(s): 끝의 \\0을 제외한 문자열 길이입니다.'
};

function practiceHintData(p, lang){
  const view=lang==='c'?C_PROBLEMS[p.id]:p;
  const solution=(lang==='c'?p.c?.solution:p.solution)||'';
  const tools=[];
  for(const [name,description] of Object.entries(HINT_TOOLS)){
    if(new RegExp('\\b'+name+'\\s*\\(').test(solution||view.hint||''))tools.push(description);
  }
  if(/\bfor\b/.test(solution))tools.unshift(lang==='c'?'for (int i=0; i<n; i++): i를 0부터 n-1까지 하나씩 바꾸며 반복합니다.':'for i in range(n): i를 0부터 n-1까지 하나씩 바꾸며 반복합니다. 들여쓴 줄들이 반복됩니다.');
  if(/\bwhile\b/.test(solution))tools.push('while: 조건이 참인 동안 반복합니다. 반복 안에서 조건에 쓰는 값을 갱신해야 끝납니다.');
  if(/\bif\b/.test(solution))tools.push('if: 조건이 참일 때만 실행합니다. =는 대입, ==는 같은지 비교입니다.');
  if(solution.includes('%'))tools.push('%: 나머지 연산입니다. n % d == 0이면 n은 d로 나누어떨어집니다.');
  if(lang==='python'&&/f["']/.test(solution))tools.push('f"{a}{b}": 중괄호 안의 값을 문자열에 넣습니다. a=0, b=3이면 "03"입니다. 숫자로 바꾸지 않으므로 앞자리 0이 남습니다.');
  if(lang==='python'&&solution.includes('//'))tools.push('//: 정수 몫입니다. 7 // 2는 3입니다. /와 달리 정수끼리 계산하면 정수 결과를 줍니다.');
  if(lang==='python'&&/\[[^\n]*:[^\n]*\]/.test(solution))tools.push('A[start:stop]: start부터 stop 직전까지 잘라 새 목록을 만듭니다. A[:mid]는 앞쪽, A[mid:]는 뒤쪽입니다.');
  if(lang==='python'&&/\[[^\n]*\bfor\b/.test(solution))tools.push('[식 for x in A if 조건]: A에서 x를 하나씩 꺼내 조건에 맞는 값만 식으로 계산하여 목록에 넣습니다. 보통의 for·if·append로 풀어 써도 됩니다.');
  if(solution.includes('<<')||solution.includes('>>'))tools.push('<<, >>: 비트를 왼쪽·오른쪽으로 옮깁니다. 1 << i는 i번째 비트만 켠 값입니다.');
  if(lang==='c')tools.push('배열 길이는 n 같은 매개변수로 받습니다. out 배열이 있다면 그 배열에 결과를 쓰고, 문제에서 지정한 반환값도 return으로 돌려주세요. main()과 입력 코드는 실행 환경이 제공합니다.');
  else tools.push('매개변수에 입력이 이미 들어옵니다. input()을 쓰지 마세요. print()는 화면 출력이고, return은 채점기에 결과를 돌려줍니다. 배열 수정형은 지정된 배열을 직접 바꿉니다.');
  const definitions=solution.split('\n').filter(line=>lang==='c'?/^\s*(?:int|void|long long|double)\s+\w+\s*\(/.test(line):/^\s*def \w+\(/.test(line));
  const helpers=definitions.filter(line=>!new RegExp('\\b'+p.function+'\\s*\\(').test(line));
  if(helpers.length)tools.push('아래 보조 함수는 내장 함수가 아닙니다. 완성 예시에 정의가 함께 있으므로 직접 작성합니다.\n'+helpers.join('\n'));
  if(p.provided)tools.push('이 문제에서 제공하는 도구\n'+p.provided);
  const lines=solution.split('\n');
  const candidates=lines.map((line,i)=>({line,i})).filter(({line})=>/\breturn\s+[^;\s}]/.test(line));
  const chosen=candidates.slice(-2);
  const blanks=chosen.map(({line,i},n)=>{const match=line.match(/\breturn\s+(.+?)(;|\s*\})?$/);if(!match)return null;const expression=match[1];lines[i]=line.replace(expression,'___'+(n+1)+'___');return {label:'___'+(n+1)+'___',answer:expression};}).filter(Boolean);
  return {solution,tools,method:[...new Set([view.hint,p.study?.method].filter(Boolean))].join('\n\n'),skeleton:lines.join('\n'),blanks};
}

function renderPracticeHints(p){
  let panel=$('practice-hints');
  if(!panel){panel=document.createElement('section');panel.id='practice-hints';$('hint').parentElement.hidden=true;$('hint').parentElement.after(panel);}
  panel.replaceChildren();
  const el=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n;};
  const data=practiceHintData(p,language);
  panel.append(el('h3','막혔나요? 한 단계씩 따라 해 보세요'),el('p','문법 → 풀이 순서 → 빈칸 연습 → 완성 풀이 순서로 도움을 받습니다. 힌트를 열어도 작성 중인 코드는 바뀌지 않습니다.'));
  const content=el('div','');content.id='hint-steps';
  const button=el('button','힌트 받기 · 1단계');button.type='button';button.setAttribute('aria-controls','hint-steps');
  const status=el('p','');status.setAttribute('role','status');status.className='hint-status';
  let step=0;
  const titles=['필요한 문법·함수','어떤 순서로 풀까요?','빈칸을 채우며 따라 쓰기','완성 풀이와 비교하기'];
  button.onclick=()=>{
    const card=el('details','');card.open=true;card.append(el('summary',`${step+1}단계 · ${titles[step]}`));
    if(step===0){const list=el('ul','');for(const text of data.tools)list.append(el('li',text));card.append(list);}
    if(step===1){card.append(el('p',data.method||'입력에서 무엇을 받아 어떤 값을 반환하는지 확인하고, 공개 예시를 손으로 먼저 계산해 보세요.'));card.append(el('p','입출력 예시의 첫 번째 입력으로 변수 값을 종이에 따라 적어 보세요. 반복 한 번마다 무엇이 달라지는지 확인한 뒤 코드로 옮기세요.'));}
    if(step===2){card.append(el('p',data.blanks.length?'___1___ 같은 빈칸에 반환할 값·식을 넣어 보세요. 이 상태 그대로는 실행할 수 없습니다.':'아래 시작 코드에서 TODO를 채워 보세요. 문제에 지정된 함수 이름과 매개변수는 유지하세요.'),el('pre',data.blanks.length?data.skeleton:starter(p)));for(const blank of data.blanks){const answer=el('details','');answer.append(el('summary',blank.label+' 답 확인'),el('code',blank.answer));card.append(answer);}}
    if(step===3){card.append(el('p','한 줄씩 내 코드와 비교해 보세요. 예시 실행으로 확인한 뒤, 풀이를 닫고 다시 작성해 보세요.'),el('pre',data.solution));if(p.study?.boundary)card.append(el('h4','경계 조건도 확인하기'),el('p',p.study.boundary));if(p.study?.complexity)card.append(el('h4','복잡도 설명'),el('p',p.study.complexity));if(p.pythonPrelude?.includes('def ')||p.cPrelude){const prelude=language==='c'?p.cPrelude:p.pythonPrelude;if(prelude)card.append(el('h4','실행 환경에서 제공하는 코드 · 답안에 다시 넣지 않아도 됩니다'),el('pre',prelude));}}
    content.append(card);step++;status.textContent=`${step}단계 힌트를 열었습니다. 각 단계 제목을 누르면 접거나 펼칠 수 있습니다.`;
    const total=data.solution?4:3;button.hidden=step===total;button.textContent=`다음 힌트 · ${step+1}단계`;
  };
  panel.append(content,button,status);
}
