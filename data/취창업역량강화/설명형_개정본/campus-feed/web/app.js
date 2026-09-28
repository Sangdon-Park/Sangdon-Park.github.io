const q=id=>document.getElementById(id);
const user="student-demo";
let lastPayload=null;
async function json(url,options){const r=await fetch(url,options);const b=await r.json();if(!r.ok)throw new Error(b.detail??"요청 실패");return b;}
async function refresh(){
 const [feed,state]=await Promise.all([json("/api/feed/"+user),json("/api/state/"+user)]);
 q("posts").replaceChildren();
 feed.items.forEach(item=>{
  const b=document.createElement("button");b.className="post";b.setAttribute("aria-label",item.title+" 선택하기");
  const left=document.createElement("div"),title=document.createElement("div"),cat=document.createElement("div");
  title.className="title";title.textContent=item.title;cat.className="cat";cat.textContent=item.category+" · 교내 거래 예시";left.append(title,cat);
  const right=document.createElement("div"),price=document.createElement("div"),read=document.createElement("div");
  price.className="price";price.textContent=item.price.toLocaleString()+"원";read.className="read";read.textContent="선택하기";right.append(price,read);b.append(left,right);
  b.onclick=()=>openPost(item).catch(showError);q("posts").append(b);
 });
 const count=state.stats?.accepted_count??0;
 q("saved").textContent="이 학생의 클릭 기록 "+count+"건"+(state.features.length?"\n"+state.features.map(f=>f.category+" "+f.hits+"회").join(", "):"");
 q("order").textContent=count?"관심 있는 종류부터":"처음에는 최신순";
 q("returned").textContent=count?"현재 목록의 앞 두 개\n"+feed.items.slice(0,2).map(p=>p.title).join(" → "):"클릭 기록이 없어서 최신 게시글부터 보냅니다.";
}
async function send(payload){return json("/api/events",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});}
async function openPost(item){
 const payload={event_id:crypto.randomUUID(),user_id:user,category:item.category,occurred_at:new Date().toISOString()};
 await send(payload);lastPayload=payload;q("replay").disabled=false;
 q("action").textContent="'"+item.title+"' 게시글을 선택했습니다.\n화면이 서버에 '"+item.category+"을 봤다'고 보냈습니다.";
 q("replay-result").textContent="";await refresh();
}
function showError(e){q("action").textContent="처리하지 못했습니다: "+e.message;}
q("replay").onclick=async()=>{try{const r=await send(lastPayload);q("replay-result").textContent=r.status==="duplicate"?"서버가 같은 클릭임을 확인했습니다. 저장 건수는 늘지 않습니다.":"새 요청을 저장했습니다.";await refresh();}catch(e){showError(e);}};
async function evidence(){
 q("feed-view").hidden=true;q("evidence-view").hidden=false;const d=await json("/api/evidence");
 q("test-summary").textContent="정확성 테스트 "+d.verification.passed+" / "+d.verification.total+" 통과";
 d.verification.cases.forEach(c=>{const tr=document.createElement("tr");[c.name.replace("test_",""),c.passed?"PASS":"FAIL"].forEach(v=>{const td=document.createElement("td");td.textContent=v;tr.append(td);});q("test-rows").append(tr);});
 [["인덱스 없음",d.benchmark.baseline],["복합 인덱스",d.benchmark.indexed]].forEach(([a,b])=>{const tr=document.createElement("tr");[a,b.p50_ms.toFixed(3)+"ms",b.p95_ms.toFixed(3)+"ms"].forEach(v=>{const td=document.createElement("td");td.textContent=v;tr.append(td);});q("benchmark-rows").append(tr);});
 q("plans").textContent="변경 전\n"+d.benchmark.plans.baseline.join("\n")+"\n\n변경 후\n"+d.benchmark.plans.indexed.join("\n");
 q("meta").textContent="10만 건의 합성 이벤트 · 조건당 300회 × 3회 · 단일 프로세스 SQL 실행과 결과 읽기";
}
(new URLSearchParams(location.search).get("view")==="evidence"?evidence():refresh()).catch(showError);
