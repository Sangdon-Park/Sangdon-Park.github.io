// Move existing controls rather than replacing them: IDs and saved state stay intact.
(()=>{
  document.body.classList.add('compact-lab');
  const header=document.querySelector('header');
  const codeLanguage=document.getElementById('language').closest('label');
  codeLanguage.classList.add('compact-code-language');
  for(const node of [...codeLanguage.childNodes])if(node.nodeType===3)node.remove();
  document.getElementById('language').setAttribute('aria-label',UI_EN?'Code language':T('작성 언어'));
  const account=document.getElementById('cloud-login');
  const menu=document.createElement('button');menu.id='workspace-menu';menu.textContent=UI_EN?'☰ Settings':T('☰ 설정');
  const status=document.createElement('span');status.id='compact-save-status';status.textContent='●';status.setAttribute('aria-label',UI_EN?'Save status':T('저장 상태'));
  const controls=document.createElement('div');controls.className='compact-controls';
  const languagePicker=document.getElementById('ui-language');document.querySelector('label[for="ui-language"]').hidden=true;languagePicker.setAttribute('aria-label','Language / 언어 / Idioma');controls.append(languagePicker,codeLanguage,status,account,menu);header.append(controls);
  const dialog=document.createElement('dialog');dialog.id='workspace-settings';
  const heading=document.createElement('div');heading.className='dialog-heading';
  const title=document.createElement('h2');title.textContent=UI_EN?'Practice settings':T('실습 설정');
  const close=document.createElement('button');close.textContent=UI_EN?'Close':T('닫기');close.onclick=()=>dialog.close();
  heading.append(title,close);dialog.append(heading);
  for(const selector of ['.lab-utilities','.identity','.cloud-strip'])dialog.append(document.querySelector(selector));
  document.body.append(dialog);menu.onclick=()=>dialog.showModal();
  const source=document.getElementById('cloud-status');
  const update=()=>{status.title=source.textContent;status.classList.toggle('cloud-error',source.classList.contains('cloud-error'));};
  new MutationObserver(update).observe(source,{childList:true,characterData:true,subtree:true,attributes:true});update();
})();
