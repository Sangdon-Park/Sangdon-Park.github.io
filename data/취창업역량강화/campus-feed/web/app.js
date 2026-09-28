const q = id => document.getElementById(id);
const names = {
  test_duplicate_counted_once:"같은 이벤트 재전송", test_late_event_keeps_latest:"늦게 도착한 이벤트",
  test_conflicting_reuse_rejected:"같은 ID에 다른 내용", test_failed_transaction_rolls_back_and_retries:"중간 실패와 롤백",
  test_reopen_preserves_idempotency:"DB 재접속 후 재전송", test_users_are_isolated:"사용자별 데이터 분리",
  test_equal_times_have_deterministic_latest:"동일 시각의 처리 순서", test_concurrent_duplicate_submissions:"동시 재전송 16회",
  test_api_validation:"잘못된 입력 거부", test_api_duplicate_and_conflict:"API 상태 코드",
  test_feed_and_new_user_fallback:"관심 피드와 신규 사용자", test_index_changes_plan_not_results:"인덱스 전후 결과 일치"
};
const log = [];
async function refresh() {
  const [feed,state] = await Promise.all([
    fetch("/api/feed/u-demo").then(r=>r.json()),
    fetch("/api/state/u-demo").then(r=>r.json())
  ]);
  q("posts").replaceChildren();
  feed.items.slice(0,5).forEach(item=>{
    const article=document.createElement("article"); article.className="post";
    const left=document.createElement("div"); const title=document.createElement("h3"); title.textContent=item.title;
    const cat=document.createElement("div"); cat.className="category"; cat.textContent=item.category+" · 교내 직거래 예시";
    left.append(title,cat);
    const right=document.createElement("div"); const price=document.createElement("div"); price.className="price"; price.textContent=item.price.toLocaleString()+"원";
    const score=document.createElement("div"); score.className="score"; score.textContent="관심 "+item.interest_score+"회"; right.append(price,score);
    article.append(left,right); q("posts").append(article);
  });
  q("accepted").textContent=(state.stats?.accepted_count??0)+"건";
  q("latest").textContent=state.stats?.latest_category??"기록 없음";
}
async function send(id,category,time) {
  const response=await fetch("/api/events", {method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({event_id:id,user_id:"u-demo",category,occurred_at:"2026-09-06T"+time+"+09:00"})});
  const body=await response.json(); log.push("HTTP "+response.status+"  "+JSON.stringify(body));
  q("log").textContent=log.join("\n"); await refresh();
}
async function showEvidence() {
  q("feed-view").hidden=true; q("evidence-view").hidden=false;
  const data=await fetch("/api/evidence").then(r=>r.json());
  if(data.verification) {
    const t=data.verification;
    q("test-summary").textContent="정확성 테스트 "+t.passed+" / "+t.total+" 통과";
    t.cases.forEach(c=>{
      const tr=document.createElement("tr"); const a=document.createElement("td"); const b=document.createElement("td");
      a.textContent=names[c.name]??c.name; b.textContent=c.passed?"PASS":"FAIL"; b.className=c.passed?"pass":""; tr.append(a,b); q("test-rows").append(tr);
    });
  }
  if(data.benchmark) {
    const b=data.benchmark;
    [["인덱스 없음",b.baseline],["복합 인덱스",b.indexed]].forEach(([label,m])=>{
      const tr=document.createElement("tr");
      [label,m.p50_ms.toFixed(3)+" ms",m.p95_ms.toFixed(3)+" ms"].forEach(t=>{const td=document.createElement("td");td.textContent=t;tr.append(td);});
      q("benchmark-rows").append(tr);
    });
    q("plans").textContent="변경 전\n"+b.plans.baseline.join("\n")+"\n\n변경 후\n"+b.plans.indexed.join("\n");
    q("meta").textContent="측정 범위: SQL 실행과 결과 읽기. 회차당 30회 워밍업. 순차 단일 프로세스. 결과 일치: "+b.results_equal+". 원본은 evidence/benchmark.json과 latency.csv에 있습니다.";
  }
}
q("first").onclick=()=>send("e01","전공책","10:00:00");
q("duplicate").onclick=()=>send("e01","전공책","10:00:00");
q("late").onclick=()=>send("e02","운동용품","09:59:00");
(new URLSearchParams(location.search).get("view")==="evidence" ? showEvidence() : refresh()).catch(e=>q("log").textContent=String(e));

