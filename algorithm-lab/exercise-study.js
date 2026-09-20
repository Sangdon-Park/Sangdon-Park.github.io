// Written preparation is stored separately from cloud execution scores.
// A self-check is never presented as an AI grade or a guaranteed exam score.
function studyKey(){return KEY+':study';}
function readStudy(){try{return JSON.parse(localStorage.getItem(studyKey())||'{}');}catch{return {};}}
function studyEntry(p){return readStudy()[answerKey(p.id)]||{};}
function saveStudy(p,entry){const all=readStudy();all[answerKey(p.id)]=entry;try{localStorage.setItem(studyKey(),JSON.stringify(all));}catch{$('study-status').textContent='저장 공간이 부족합니다. 답안을 내려받아 보관하세요.';}}
function renderStudy(p){
  let panel=$('exercise-study');
  if(!panel){panel=document.createElement('section');panel.id='exercise-study';document.getElementById('writing-panel').append(panel);}
  panel.replaceChildren();panel.hidden=!p.exercise;if(!p.exercise)return;
  const el=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n;};
  const heading=el('h3',UI_EN?'Prepare the full answer':'코드와 풀이 설명까지 연습하기');
  panel.append(heading,el('p',UI_EN?'Execution checks verify outputs. Also explain the required algorithm, example trace, boundaries, and complexity. Written notes below are saved in this browser.':'실행 검사는 결과를 확인합니다. 시험 답안에는 요구한 알고리즘·예시 처리 과정·경계 조건·복잡도 설명도 필요합니다. 아래 메모는 이 브라우저에 저장됩니다.'));
  if(p.provided)panel.append(el('p',p.provided));
  const entry=studyEntry(p),fields={};
  const labels=[['method','풀이 방법과 예시 처리 과정','어떤 순서로 처리하나요? 공개 예시 하나를 골라 변수 변화와 결과를 설명하세요.'],['boundary','경계 조건','입력 조건 안에서 빈 배열, 동률, 최솟값·최댓값 등을 어떻게 처리하나요?'],['complexity','시간·공간 복잡도','n이 무엇인지 정의하고 반복 횟수, 재귀 깊이, 작업·결과 배열의 공간을 설명하세요.']];
  const status=el('p','');status.id='study-status';status.setAttribute('role','status');
  const check=document.createElement('input');check.type='checkbox';check.checked=!!entry.checked;
  const update=()=>{
    const item=Object.fromEntries(Object.entries(fields).map(([key,node])=>[key,node.value]));
    item.checked=check.checked;saveStudy(p,item);
    status.textContent=Object.values(fields).every(n=>n.value.trim())&&check.checked?'설명 작성·자가 점검 완료 · 실행 통과 기록과 별도로 저장됩니다.':'설명 3항목을 작성하고 아래 점검을 마쳐 주세요.';
  };
  for(const [key,label,placeholder] of labels){
    const row=el('label',label),input=document.createElement('textarea');input.rows=3;input.id='study-'+key;input.value=entry[key]||'';input.placeholder=placeholder;input.maxLength=5000;row.append(input);fields[key]=input;panel.append(row);input.oninput=()=>{check.checked=false;update();};
  }
  const label=el('label','');label.className='study-check';label.append(check,document.createTextNode('풀이 예시와 비교해 동작·경계 처리·시간·공간 설명을 점검했습니다.'));panel.append(label);check.onchange=update;
  const button=el('button','설명을 코드 주석에 반영');button.type='button';button.onclick=()=>{
    if(busy)return;
    if(!Object.values(fields).every(n=>n.value.trim())){status.textContent='설명 3항목을 먼저 작성해 주세요.';return;}
    const marker=language==='c'?'//':'#';
    let code=getCode().replace(/\n?(?:#|\/\/) STUDY-NOTES-BEGIN[\s\S]*?(?:#|\/\/) STUDY-NOTES-END\n?/g,'');
    const lines=labels.flatMap(([key,title])=>[title,...fields[key].value.split('\n'),'']);
    code+='\n'+marker+' STUDY-NOTES-BEGIN\n'+lines.map(line=>marker+' '+line).join('\n')+'\n'+marker+' STUDY-NOTES-END\n';
    setCode(code);saved.answers[answerKey(p.id)]=code;persist();cloudDraft(p.id,language,code);renderNav();setResult('설명 주석을 반영했습니다. 채점하기로 최종 코드를 확인하세요.');$('case-results').replaceChildren();$('next').hidden=true;status.textContent='코드 끝에 설명 주석을 반영했습니다. 채점하기로 코드를 다시 확인하세요.';
  };panel.append(button,status);
  status.textContent=entry.checked?'설명 자가 점검 기록이 있습니다. 수정하면 다시 점검하세요.':'작성한 설명은 언어별로 자동 저장됩니다.';
}
