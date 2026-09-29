// Same chapter, algorithm and callable contract: use the PPTX exercise version.
// Keep legacy IDs in storage so existing answers and submission history survive.
const LAB_DUPLICATES=Object.freeze({
  P13:'P37', P15:'P38', P18:'P40', P19:'P41', P22:'P42',
  P23:'P43', P24:'P44', P26:'P45', P30:'P39', P34:'P46'
});
const canonicalProblemId=id=>LAB_DUPLICATES[id]||id;
const displayedProblemId=p=>p.exercise?String(p.exercise):p.id;
function findLinkedProblem(list,value,chapter){
  const scoped=list.filter(p=>![1,2,3,4,5,6].includes(chapter)||(p.chapter||1)===chapter);
  const match=/^\d+$/.test(value||'')
    ?scoped.find(p=>p.exercise===Number(value))
    :scoped.find(p=>p.id===canonicalProblemId(value));
  return match?list.indexOf(match):-1;
}
// Not covered by the lecture body. Preserve saved work under its original ID.
const LAB_RETIRED=Object.freeze({P04:1,P49:3,P50:3,P52:3});
