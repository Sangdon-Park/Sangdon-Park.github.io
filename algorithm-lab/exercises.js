const names={2:'완전 탐색',3:'축소 정복',4:'분할 정복',5:'그리디 알고리즘',6:'동적 계획법'};
fetch('exercise-problems.json?v=20260920-exercises').then(r=>{if(!r.ok)throw Error();return r.json();}).then(problems=>{
  const root=document.getElementById('chapters');root.replaceChildren();
  for(let chapter=2;chapter<=6;chapter++){
    const items=problems.filter(p=>p.chapter===chapter),section=document.createElement('section'),head=document.createElement('header'),title=document.createElement('h2'),source=document.createElement('a'),list=document.createElement('ol');
    title.textContent=`${chapter}장 · ${names[chapter]} / ${items.length}문항`;source.textContent='연습문제 PPTX';source.href='/data/알고리즘/'+items[0].sourceFile;head.append(title,source);section.append(head,list);
    for(const p of items){
      const row=document.createElement('li'),number=document.createElement('span'),name=document.createElement('span'),actions=document.createElement('div');number.className='number';number.textContent=p.exercise;name.className='problem-title';name.textContent=p.title;actions.className='actions';
      for(const language of ['python','c']){const link=document.createElement('a');link.href=`./?chapter=${chapter}&problem=${p.id}&code=${language}`;link.textContent=language==='c'?'C':'Python';link.setAttribute('aria-label',`${chapter}장 ${p.exercise}번 ${link.textContent} 연습`);actions.append(link);}
      row.append(number,name,actions);list.append(row);
    }
    root.append(section);
  }
}).catch(()=>{document.getElementById('chapters').textContent='문제를 불러오지 못했습니다. 새로고침해 주세요.';});
