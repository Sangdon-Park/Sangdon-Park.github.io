(()=>{
 const button=document.createElement('button');button.id='cloud-peer-review';button.type='button';button.textContent=UI_EN?'Anonymous pair code review':UI_ES?'Revisión anónima en pareja':'익명 짝 코드 리뷰';
 $('cloud-history').after(button);
 button.onclick=()=>{
  if(!cloud.session||cloud.expired){$('cloud-login').click();return;}
  const p=problems[index];
  sessionStorage.setItem('dju-algolab-peer-draft:'+cloud.session.student.id,JSON.stringify({problem:p.id,language,code:getCode()}));
  location.href='peer-review.html?new=1&lang='+encodeURIComponent(UI_LOCALE);
 };
})();
