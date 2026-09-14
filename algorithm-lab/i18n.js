// UI language is independent of the Python/C answer language.
const UI_EN=(()=>{
  const requested=new URLSearchParams(location.search).get('lang');
  if(['ko','en'].includes(requested)){try{localStorage.setItem('dju-algolab-locale',requested);}catch{}return requested==='en';}
  try{return localStorage.getItem('dju-algolab-locale')==='en';}catch{return false;}
})();
function T(text){return UI_EN?(EN_UI[text]??text):text;}
// Translate only known judge diagnostics, not editor or submitted source code.
function messageText(text){
  if(!UI_EN||typeof text!=='string')return text;
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
  for(const [ko,en] of Object.entries(parts))text=text.replaceAll(ko,en);
  return T(text);
}
document.documentElement.lang=UI_EN?'en':'ko';
if(UI_EN){
  const walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
    if(node.parentElement?.closest('script,style,textarea,pre,code'))continue;
    const text=node.nodeValue.trim();
    if(EN_UI[text])node.nodeValue=node.nodeValue.replace(text,EN_UI[text]);
  }
  for(const el of document.querySelectorAll('[title],[placeholder],[aria-label]')){
    for(const attr of ['title','placeholder','aria-label'])if(el.hasAttribute(attr))el.setAttribute(attr,T(el.getAttribute(attr)));
  }
  // Standalone label; dynamic suffixes use the same Korean source word.
  for(const label of document.querySelectorAll('label,th'))for(const child of label.childNodes)if(child.nodeType===3&&child.textContent.trim()===' (section)'.trim())child.textContent='Section';
}
const utility=document.createElement('div');
utility.className='lab-utilities';
utility.innerHTML='<label for="ui-language">Language / 언어</label><select id="ui-language" aria-label="Interface language"><option value="ko">한국어</option><option value="en">English</option></select><button id="clear-browser" type="button"></button>';
document.querySelector('header').after(utility);
document.getElementById('ui-language').value=UI_EN?'en':'ko';
document.getElementById('ui-language').onchange=event=>{
  const locale=event.target.value;
  try{localStorage.setItem('dju-algolab-locale',locale);}catch{}
  const url=new URL(location.href);url.searchParams.set('lang',locale);location.assign(url.href);
};
document.getElementById('clear-browser').textContent=UI_EN?'Reset this browser':'이 브라우저 초기화';
