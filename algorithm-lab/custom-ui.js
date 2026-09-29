// Custom execution is transient: no submission, score, solved flag, or cloud record.
const customDrafts=new Map();
let customCompleted=false;
function customLabel(ko,en,es){return UI_EN?en:UI_ES?es:ko;}
function customTypeLabel(type){return type.kind==='array'?customLabel(type.item.kind==='array'?'행렬 · 예: [[1, 2], [3, 4]]':type.item.kind==='string'?'문자열 배열 · 예: ["ab", "cd"]':type.item.kind==='boolean'?'참/거짓 배열 · 예: [true, false]':'숫자 배열 · 쉼표 또는 공백으로 구분, 빈 배열은 []','Array (JSON; numbers may be separated by commas/spaces; [] is empty)','Lista (JSON; números separados por comas/espacios; [] vacía)'):type.kind==='string'?customLabel('문자열 · 따옴표 없이 입력','Text, without surrounding quotes','Texto, sin comillas'):type.kind==='boolean'?'true / false':customLabel(type.kind==='integer'?'정수':'숫자','Number','Número');}
function renderCustomInputs(p){
  customCompleted=false;
  const values=customDrafts.get(p.id),fields=document.getElementById('custom-fields');fields.replaceChildren();
  for(const [i,field]of customFields(p).entries()){
    const label=document.createElement('label');label.className='custom-field';
    const name=document.createElement('span');name.textContent=field.name;label.append(name);
    const input=document.createElement(field.type.kind==='array'?'textarea':'input');input.id='custom-arg-'+i;input.autocomplete='off';input.spellcheck=false;input.maxLength=80000;if(input.tagName==='TEXTAREA')input.rows=2;else input.type='text';
    input.value=values?.[i]??(field.type.kind==='string'?field.value:JSON.stringify(field.value));
    input.setAttribute('aria-describedby','custom-help-'+i);input.oninput=()=>{customDrafts.set(p.id,[...fields.querySelectorAll('input,textarea')].map(el=>el.value));invalidateCustomResult();};
    const help=document.createElement('small');help.id='custom-help-'+i;help.textContent=customTypeLabel(field.type);label.append(input,help);fields.append(label);
  }
  document.getElementById('custom-summary').textContent=customLabel('직접 입력으로 실행','Run with your own input','Ejecutar con tu entrada');
  document.getElementById('custom-note').textContent=customLabel('문제의 입력 조건에 맞춰 값을 바꿔보세요. 배열 길이와 작업 공간은 자동으로 준비합니다. 채점·해결 기록에는 반영되지 않습니다.','Try values within the problem’s input conditions. Array lengths and workspace are prepared automatically. This does not grade or record a solution.','Prueba valores dentro de las condiciones del problema. Las longitudes y memoria auxiliar se preparan automáticamente. No califica ni registra una solución.');
  document.getElementById('custom-run').textContent=customLabel('▷ 내 입력 실행','▷ Run my input','▷ Ejecutar mi entrada');
  const reset=document.getElementById('custom-example');reset.textContent=customLabel('예시 입력 불러오기','Load example input','Cargar ejemplo');reset.onclick=()=>{if(busy)return;customDrafts.delete(p.id);renderCustomInputs(p);invalidateCustomResult(true);controls();};
  document.getElementById('custom-input-error').textContent='';
}
function customArgsFromUI(p){return readCustomArgs(p,[...document.querySelectorAll('#custom-fields input,#custom-fields textarea')].map(el=>el.value));}
function customControls(){
  const blocked=busy||!cloud.session||cloud.expired;
  document.getElementById('custom-run').disabled=!ready||blocked;
  document.getElementById('custom-example').disabled=blocked;
  document.querySelectorAll('#custom-fields input,#custom-fields textarea').forEach(el=>el.disabled=blocked);
}
function invalidateCustomResult(force=false){
  if(!customCompleted&&!force)return;
  if(job?.mode==='custom')setResult(customLabel('입력이나 코드가 변경되었습니다. 아래는 이전 실행 결과입니다. 다시 실행하세요.','Input or code changed. The results below are from the previous run. Run again.','La entrada o el código cambió. El resultado es de la ejecución anterior. Vuelve a ejecutar.'));
}
function finishCustom(report){
  customCompleted=true;
  const result=document.getElementById('case-results');
  const add=(label,value)=>{if(value===undefined||value===null||value==='')return;const title=document.createElement('strong'),pre=document.createElement('pre');title.textContent=label;pre.textContent=String(value).slice(0,12000);result.append(title,pre);};
  add(customLabel('실행한 입력','Executed input','Entrada ejecutada'),JSON.stringify(job.args));
  if(report.error){setResult(report.errorSummary||report.error,'error');for(const [i,detail]of(report.diagnostics||[]).entries())showDiagnostic(detail,job.code,i===0?report.rawError||'':'');}
  else {setResult(customLabel('직접 실행 완료 · 채점·해결 기록에는 반영되지 않습니다.','Custom run finished. No grade or solution was recorded.','Ejecución terminada. No se registró nota ni solución.'));add(customLabel('반환값 / 결과 배열','Return value / output array','Valor devuelto / matriz de salida'),report.custom?.value);}
  add(customLabel('화면 출력','Standard output','Salida'),report.custom?.stdout);
  add(customLabel('오류 출력','Standard error','Salida de error'),report.custom?.stderr||report.custom?.raw);
  add(customLabel('호출 후 변경된 인자','Changed arguments after the call','Argumentos modificados'),report.custom?.after);
  if(!report.error)for(const detail of report.diagnostics||[])showDiagnostic(detail,job.code);
}
