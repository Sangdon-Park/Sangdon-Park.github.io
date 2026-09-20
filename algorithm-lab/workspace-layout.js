// Reuse existing controls and panels so drafts, editor history and handlers survive.
(()=>{
  const el=(tag,text,id)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(id)n.id=id;return n;};
  const coding=document.querySelector('.coding');
  const tabs=el('div',null,'answer-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','답안 작성');
  const code=el('div',null,'coding-panel'),writing=el('div',null,'writing-panel');
  for(const panel of [code,writing])panel.setAttribute('role','tabpanel');
  const actions=coding.querySelector('.actions'),results=coding.querySelector('.results-panel');
  for(const child of [...coding.children])if(child!==actions&&child!==results)code.append(child);
  const buttons=[];
  const select=(isWriting)=>{
    code.hidden=isWriting;writing.hidden=!isWriting;
    buttons.forEach((b,i)=>{b.setAttribute('aria-selected',String(Boolean(i)===isWriting));b.tabIndex=Boolean(i)===isWriting?0:-1;});
    if(!isWriting&&typeof editor!=='undefined'&&editor)editor.refresh();
  };
  for(const [i,label] of ['코드 작성','풀이 설명'].entries()){
    const button=el('button',label,i?'writing-tab':'coding-tab');button.type='button';button.setAttribute('role','tab');button.setAttribute('aria-controls',i?'writing-panel':'coding-panel');
    (i?writing:code).setAttribute('aria-labelledby',button.id);
    button.onclick=()=>select(Boolean(i));button.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?1:1-i;if(!buttons[next].hidden){select(Boolean(next));buttons[next].focus();}}};buttons.push(button);tabs.append(button);
  }
  coding.prepend(tabs,code,writing);select(false);
  const settings=el('details',null,'editor-settings');settings.append(el('summary','편집기 설정'));
  settings.append(code.querySelector('.indent-toolbar'),code.querySelector('.view-toolbar'));code.querySelector('.editor-toolbar').after(settings);
  const lang=document.querySelector('.compact-code-language');tabs.append(lang);
  const execution=el('details',null,'execution-results');execution.append(el('summary','실행 결과'));results.before(execution);execution.append(results);results.querySelector('.panel-title').hidden=true;
  const contract=el('details',null,'function-guide');contract.append(el('summary','함수 작성 안내'));const instructions=document.getElementById('instructions');instructions.before(contract);contract.append(instructions);
  const resources=document.getElementById('chapter-resources'),resourceMenu=el('details',null,'resource-menu');resourceMenu.append(el('summary','강의 자료'));resources.before(resourceMenu);resourceMenu.append(resources);
  document.querySelector('.aside-note').hidden=true;
  window.syncPracticeLayout=p=>{buttons[1].hidden=!p.exercise;select(false);execution.open=false;resourceMenu.hidden=(p.chapter||1)!==2;};
})();
