// Same chapter, algorithm and callable contract: use the PPTX exercise version.
// Keep legacy IDs in storage so existing answers and submission history survive.
const LAB_DUPLICATES=Object.freeze({
  P13:'P37', P15:'P38', P18:'P40', P19:'P41', P22:'P42',
  P23:'P43', P24:'P44', P26:'P45', P30:'P39', P34:'P46'
});
const canonicalProblemId=id=>LAB_DUPLICATES[id]||id;
const displayedProblemId=p=>p.displayId||(p.exercise?String(p.exercise):p.id);
function findLinkedProblem(list,value,chapter){
  const scoped=list.filter(p=>!LAB_RETIRED[p.id]&&(![1,2,3,4,5,6,7,8,9,10,11].includes(chapter)||(p.chapter||1)===chapter));
  const match=/^\d+$/.test(value||'')
    ?scoped.find(p=>p.exercise===Number(value))
    :scoped.find(p=>p.id===canonicalProblemId(value)||p.displayId===value);
  return match?list.indexOf(match):-1;
}
// Not covered by the lecture body. Preserve saved work under its original ID.
const LAB_RETIRED=Object.freeze({P04:1,P49:3,P50:3,P52:3,P70:5,P72:5,P73:5,P74:5,P75:5,P77:6,P78:6,P79:6,P80:6,P81:6,P82:6,P83:6,P84:6,P85:6,P86:6,'F06-01':6,'F06-02':6,'F06-04':6,'F06-01-v3':6,'F07-01':7});
