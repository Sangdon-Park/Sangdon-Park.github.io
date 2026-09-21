// UI language is independent of the Python/C answer language.
const UI_LOCALE=(()=>{
  const requested=new URLSearchParams(location.search).get('lang');
  if(['ko','en','es'].includes(requested)){try{localStorage.setItem('dju-algolab-locale',requested);}catch{}return requested;}
  try{const saved=localStorage.getItem('dju-algolab-locale');return ['ko','en','es'].includes(saved)?saved:'ko';}catch{return 'ko';}
})();
const UI_EN=UI_LOCALE==='en';
const UI_DATE_LOCALE={ko:'ko-KR',en:'en-US',es:'es-ES'}[UI_LOCALE];
const UI_DICTIONARY=UI_LOCALE==='es'?LOCALE_ES:{...LOCALE_EN,...EN_UI};
function T(text){
  if(typeof text!=='string'||UI_LOCALE==='ko')return text;
  const dictionary=UI_DICTIONARY;
  if(Object.hasOwn(dictionary,text))return dictionary[text];
  // Joined explanations use individually translated lines; source code is never passed here.
  return text.split('\n').map(line=>{
    if(Object.hasOwn(dictionary,line))return dictionary[line];
    const trimmed=line.trim();
    return Object.hasOwn(dictionary,trimmed)?line.replace(trimmed,dictionary[trimmed]):line;
  }).join('\n');
}
function localizeProblem(p){
  if(UI_LOCALE==='ko')return p;
  for(const field of ['title','section','slides','level','statement','hint','provided','complexity'])if(p[field])p[field]=T(p[field]);
  if(p.study)for(const field of ['method','boundary','complexity'])if(p.study[field])p.study[field]=T(p.study[field]);
  if(p.c)for(const field of ['statement','hint','result'])if(p.c[field])p.c[field]=T(p.c[field]);
  return p;
}
// Translate only known judge diagnostics, not editor or submitted source code.
function messageText(text){
  if(UI_LOCALE==='ko'||typeof text!=='string')return text;
  const parts={
    '슬라이싱 대신 정수 인덱스를 사용하세요.':'Use integer indices instead of slicing.',
    '배열의 인덱스 범위를 벗어났습니다.':'Array index out of range.',
    '원소 접근이 너무 많습니다. 탐색 구간을 절반씩 줄이세요.':'Too many element accesses. Halve the search interval.',
    '전체 순회·복사 대신 A[i]와 len(A)를 사용하세요.':'Use A[i] and len(A) instead of iteration or copying.',
    '함수 이름을 확인하세요: ':'Check the function name: ',
    '입력 배열이 바뀌었습니다. 복사본을 사용하세요.':'The input array was modified. Use a copy.',
    '미작성: NotImplementedError를 지우고 함수의 내용을 작성하세요.':'Not implemented: replace NotImplementedError with your function body.',
    ' (입력 배열 변경 여부를 확인하세요.)':' (Check whether the input array was modified.)',
    'C 컴파일·실행 오류':'C compilation/runtime error',
    '실행 환경 다운로드 실패':'Runtime download failed',
    '지원하지 않는 문제입니다.':'Unsupported problem.',
    '결과 없음':'No result', '학생 답안':'Student answer',
    '예상 ':'Expected ', ' / 반환 ':' / Returned ', ' / 결과 ':' / Output '
  };
  for(const [ko,en] of Object.entries(parts))text=text.replaceAll(ko,UI_EN?en:T(ko));
  return T(text);
}
document.documentElement.lang=UI_LOCALE;
if(UI_LOCALE!=='ko'){
  const walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
    if(node.parentElement?.closest('script,style,textarea,pre,code'))continue;
    const text=node.nodeValue.trim();
    node.nodeValue=node.nodeValue.replace(text,T(text));
  }
  for(const el of document.querySelectorAll('[title],[placeholder],[aria-label]')){
    for(const attr of ['title','placeholder','aria-label'])if(el.hasAttribute(attr))el.setAttribute(attr,T(el.getAttribute(attr)));
  }
  // Standalone label; dynamic suffixes use the same Korean source word.
  for(const label of document.querySelectorAll('label,th'))for(const child of label.childNodes)if(child.nodeType===3&&child.textContent.trim()===' (section)'.trim())child.textContent='Section';
}
const utility=document.createElement('div');
utility.className='lab-utilities';
utility.innerHTML='<label for="ui-language">Language / 언어</label><select id="ui-language" aria-label="Interface language"><option value="ko">한국어</option><option value="en">English</option><option value="es">Español</option></select><button id="clear-browser" type="button"></button>';
const utilityAnchor=document.querySelector('header')||document.querySelector('main');utilityAnchor.before(utility);
document.getElementById('ui-language').value=UI_LOCALE;
document.getElementById('ui-language').onchange=event=>{
  const locale=event.target.value;
  try{localStorage.setItem('dju-algolab-locale',locale);}catch{}
  const url=new URL(location.href);url.searchParams.set('lang',locale);location.assign(url.href);
};
document.getElementById('clear-browser').textContent=T('이 브라우저 초기화');

// First-time visitors must be able to choose a language inside the sign-in dialog.
const accountDialog=document.getElementById('account-dialog');
if(accountDialog){
  const picker=document.getElementById('ui-language').cloneNode(true);
  picker.id='login-ui-language';picker.setAttribute('aria-label','Idioma / 언어 / Language');
  picker.value=UI_LOCALE;picker.onchange=document.getElementById('ui-language').onchange;
  accountDialog.querySelector('.dialog-heading').after(picker);
}

if(!accountDialog&&!document.getElementById('admin-workspace'))document.getElementById('clear-browser').hidden=true;
