const TABLE='dju_algolab_peer_reviews';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function skillBand(students,person,activeIds) {
  const count=s=>new Set((s.problems||[]).filter(p=>p.solved&&activeIds.has(p.problem)).map(p=>p.problem)).size;
  const cohort=students.filter(s=>s.section===person.section),own=cohort.find(s=>s.id===person.id);
  const solved=own?count(own):0,lower=cohort.filter(s=>count(s)<solved).length;
  return {solved,band:Math.min(3,Math.floor(4*lower/Math.max(1,cohort.length)))};
}
export async function peerReview({action,body,auth,db,limit,fail,draft,activeIds}) {
  const admin=action.startsWith('admin-');
  const text=(value,label,min=5,max=2000)=>{
    if(typeof value!=='string'||value.trim().length<min||value.length>max)fail(400,label+' 내용을 '+min+'~'+max+'자로 입력하세요.');
    return value.trim();
  };
  const id=()=>{if(!UUID.test(body.id||''))fail(400,'리뷰 식별자가 올바르지 않습니다.');return body.id;};
  const person=async studentId=>(await db('dju_algolab_students?id=eq.'+studentId+'&select=id,section,name,student_no'))[0];
  const get=async reviewId=>(await db(TABLE+'?id=eq.'+reviewId+'&select=*'))[0];
  const own=async()=>{const row=await get(id());if(!row||(!admin&&row.owner_id!==auth.student_id))fail(404,'참여 중인 코드 리뷰를 찾을 수 없습니다.');return row;};
  const partner=async row=>{
    const peer=row.partner_id?await get(row.partner_id):null;
    if(peer&&(peer.partner_id!==row.id||peer.owner_id===row.owner_id))fail(409,'매칭 정보를 다시 확인해 주세요.');
    return peer;
  };
  const view=async row=>{
    const peer=await partner(row);
    if(admin){
      const [owner,reviewer]=await Promise.all([person(row.owner_id),peer?person(peer.owner_id):null]);
      return {...row,owner,reviewer,my_feedback:peer?.feedback||null,partner:peer?{id:peer.id,original_code:peer.original_code,explanation:peer.explanation}:null};
    }
    // Strict allowlist: no names, student numbers, partner IDs or ability bands.
    return {id:row.id,section:row.section,problem:row.problem,language:row.language,
      original_code:row.original_code,explanation:row.explanation,created_at:row.created_at,matched_at:row.matched_at,
      my_feedback:peer?.feedback||null,feedback:peer?.feedback?row.feedback:null,
      feedback_waiting:!!row.feedback&&!peer?.feedback,
      reflection:row.reflection,assessment:row.assessment,reviewed_at:row.reviewed_at,reflected_at:row.reflected_at,
      partner:peer?{original_code:peer.original_code,explanation:peer.explanation}:null};
  };
  if(action==='peer-list'||action==='admin-peer-list'){
    const fields='id,section,problem,language,created_at,matched_at,reviewed_at,reflected_at,assessed_at,assessment';
    return {reviews:await db(TABLE+'?'+(admin?'':'owner_id=eq.'+auth.student_id+'&')+'order=created_at.desc&limit=100&select='+fields)};
  }
  if(action==='peer-detail'||action==='admin-peer-detail')return {review:await view(await own())};
  if(action==='peer-create'){
    id();const item=draft(body),explanation=text(body.explanation,'풀이 설명');
    if(!item.code.trim())fail(400,'공유할 코드를 먼저 작성하세요.');
    await limit('peer-create:'+auth.student_id,3600,30);
    const owner=await person(auth.student_id);if(!owner)fail(401,'실습 시작 후 다시 시도하세요.');
    if([owner.student_no,...(owner.name?.length>=2?[owner.name]:[])].some(value=>value&&(item.code.includes(value)||explanation.includes(value))))fail(400,'익명 리뷰를 위해 코드·설명에서 본인 이름과 학번을 지워 주세요.');
    const students=await db('rpc/dju_algolab_dashboard','POST',{}),skill=skillBand(students,owner,activeIds);
    const row=await db('rpc/dju_algolab_peer_enqueue','POST',{p_id:body.id,p_student:auth.student_id,p_section:owner.section,
      p_problem:item.problem,p_language:item.language,p_code:item.code,p_explanation:explanation,p_skill:skill.solved,p_band:skill.band});
    return {review:await view(row)};
  }
  if(action==='peer-feedback'){
    const row=await own(),peer=await partner(row);if(!peer)fail(409,'익명 짝 매칭을 기다려 주세요.');
    const feedback={};
    for(const [key,label] of [['strength','좋은 점'],['improvement','개선 의견과 근거'],['test','추가 테스트와 예상 결과'],['complexity','시간 복잡도']])feedback[key]=text(body[key],label,5,1500);
    if(peer.feedback){if(Object.keys(feedback).every(k=>peer.feedback[k]===feedback[k]))return {review:await view(row)};fail(409,'제출한 리뷰는 보존됩니다. 내용을 확인해 주세요.');}
    const rows=await db(TABLE+'?id=eq.'+peer.id+'&partner_id=eq.'+row.id+'&feedback=is.null','PATCH',{feedback,reviewed_at:new Date().toISOString()});
    if(!rows.length)fail(409,'리뷰가 이미 제출되었습니다. 새로고침해 주세요.');
    return {review:await view(row)};
  }
  if(action==='peer-reflect'){
    const row=await own(),peer=await partner(row);
    if(!row.feedback||!peer?.feedback)fail(409,'서로 리뷰를 제출한 뒤 수정·성찰을 작성해 주세요.');
    if(!['accepted','partial','rejected'].includes(body.decision))fail(400,'피드백 반영 여부를 선택하세요.');
    const reflection={decision:body.decision,reason:text(body.reason,'반영 판단과 근거'),
      revised_code:text(body.revised_code,'수정·최종 코드',1,20000),verification:text(body.verification,'재실행 결과와 성찰',5,2000)};
    if(row.reflection){if(Object.keys(reflection).every(k=>row.reflection[k]===reflection[k]))return {review:await view(row)};fail(409,'제출한 수정·성찰 기록은 보존됩니다.');}
    const rows=await db(TABLE+'?id=eq.'+row.id+'&owner_id=eq.'+auth.student_id+'&reflection=is.null','PATCH',{reflection,reflected_at:new Date().toISOString()});
    if(!rows.length)fail(409,'기록이 이미 제출되었습니다. 새로고침해 주세요.');
    return {review:await view(rows[0])};
  }
  if(action==='admin-peer-assess'){
    const row=await own();if(!row.reflection)fail(409,'수정·성찰 완료 후 평가하세요.');
    if(typeof body.score!=='number'||!Number.isFinite(body.score)||body.score<0||body.score>5)fail(400,'평가 점수는 0~5점으로 입력하세요.');
    const rows=await db(TABLE+'?id=eq.'+row.id,'PATCH',{assessment:{score:body.score,comment:text(body.comment,'교원 평가 근거')},assessed_at:new Date().toISOString()});
    return {review:await view(rows[0])};
  }
  fail(400,'지원하지 않는 코드 리뷰 요청입니다.');
}
