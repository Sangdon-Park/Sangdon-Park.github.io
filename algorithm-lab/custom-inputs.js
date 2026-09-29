// Data-only inputs shared by the page and all three workers. Never evaluate text.
function customInputType(values) {
  const items=values.filter(v=>v!==null&&v!==undefined);
  if(!items.length)return {kind:'integer'};
  if(items.every(Array.isArray)) return {kind:'array',item:customInputType(items.flat())};
  if(items.every(v=>typeof v==='boolean'))return {kind:'boolean'};
  if(items.every(v=>typeof v==='string'))return {kind:'string'};
  return {kind:items.some(v=>!Number.isInteger(v))?'number':'integer'};
}
function customFields(p) {
  const names=p.params||p.starter.match(/def\s+\w+\(([^)]*)\)/)[1].split(',').map(v=>v.trim());
  const example=p.tests.find(t=>t.public)||p.tests[0];
  return example.args.map((value,i)=>({name:names[i],type:customInputType(p.tests.map(t=>t.args[i])),value}));
}
function parseCustomValue(text,type,name) {
  if(type.kind==='string')return text;
  if(!text.trim())throw Error(name+': 값을 입력하세요. 빈 배열은 []로 씁니다.');
  let value;
  try {
    const trimmed=text.trim();
    // Check decimal tokens before JSON.parse/Number rounds an unsafe integer into
    // the permitted 10^18 infinity sentinel (or rounds a fraction into an integer).
    for(const match of trimmed.matchAll(/"(?:\\.|[^"\\])*"|([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)/g)){
      if(!match[1])continue;
      const literal=match[1],number=Number(literal);
      if(!Number.isFinite(number))throw Error();
      if(Number.isInteger(number)){
        const [coefficient,exponent='0']=literal.toLowerCase().split('e'),fraction=coefficient.split('.')[1]?.length||0;
        const shift=Number(exponent)-fraction;
        if(Math.abs(shift)>400)throw Error();
        const digits=BigInt(coefficient.replace('.',''));
        if(shift>=0?digits*10n**BigInt(shift)!==BigInt(number):digits!==BigInt(number)*10n**BigInt(-shift))throw Error();
      }
    }
    if(type.kind==='array'&&!trimmed.startsWith('[')&&['integer','number'].includes(type.item.kind)) {
      if(/^,|,$|,\s*,/.test(trimmed))throw Error();
      value=trimmed.split(/[\s,]+/).map(token=>{if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(token))throw Error();return Number(token);});
    }else value=JSON.parse(trimmed);
  }catch{throw Error(name+': 입력 형식과 숫자의 정확도를 확인하세요. 숫자 배열은 1, 2, 3 또는 [1, 2, 3]처럼 씁니다.');}
  validateCustomType(value,type,name);
  return value;
}
function validateCustomType(value,type,name) {
  const fail=()=>{throw Error(name+': '+({array:'배열',integer:'정수',number:'숫자',string:'문자열',boolean:'true 또는 false'}[type.kind])+' 형식이 필요합니다.');};
  if(type.kind==='array') {if(!Array.isArray(value))fail();if(value.length>10000)throw Error(name+': 한 배열은 10,000개 이하로 입력하세요.');value.forEach(v=>validateCustomType(v,type.item,name));}
  else if(type.kind==='integer'){if(typeof value!=='number'||(!Number.isSafeInteger(value)&&value!==1e18))fail();}
  else if(type.kind==='number'){if(typeof value!=='number'||!Number.isFinite(value))fail();}
  else if(typeof value!==type.kind)fail();
}
function validateCustomArgs(p,args) {
  const fields=customFields(p),f=p.function;
  if(!Array.isArray(args)||args.length!==fields.length)throw Error('함수 인자 개수를 확인하세요.');
  if(JSON.stringify(args).length>80000)throw Error('직접 입력은 전체 80,000자 이하로 입력하세요.');
  fields.forEach((field,i)=>validateCustomType(args[i],field.type,field.name));
  const need=(ok,message)=>{if(!ok)throw Error(message);};
  const range=(i,min,max)=>need(args[i]>=min&&args[i]<=max,fields[i].name+': '+min+' 이상 '+max+' 이하로 입력하세요.');
  const length=(i,min,max)=>need(args[i].length>=min&&args[i].length<=max,fields[i].name+': 길이는 '+min+'~'+max+'입니다.');
  const matrix=(i,min,max,width=null)=>{length(i,min,max);const cols=width??args[i][0]?.length;need(cols>=1&&cols<=max&&args[i].every(r=>r.length===cols),fields[i].name+': 모든 행의 길이가 같은 행렬을 입력하세요.');};
  const square=(i,min,max)=>{matrix(i,min,max);need(args[i].every(r=>r.length===args[i].length),fields[i].name+': 정사각형 행렬을 입력하세요.');};
  const index=(i,n)=>range(i,0,n-1);
  const scalarLimits={expected_checks:[[1,1000000],[0,1]],doubling_steps:[[1,2**51]],binary_worst:[[0,2**51]],loop_counts:[[1,10000]],find_divisors:[[1,10000]],dice_sum:[[0,20]],icecream_menus:[[0,20]],search_space:[[1,12]],gcd_value:[[0,1e9],[0,1e9]],fibonacci:[[0,90]],karatsuba:[[0,99999999],[0,99999999]],coin_count:[[0,1e9]],domino:[[0,1e6],[1,1e9]],make_one:[[1,10000]],make_path:[[1,10000]],fib_memo:[[0,p.exercise?90:70]]};
  if(scalarLimits[f])scalarLimits[f].forEach(([min,max],i)=>range(i,min,max));
  const vectorCaps={linear_search:10000,binary_search:p.exercise?1000:10000,binary_trace:10000,first_index:1000,sum_count:10000,max_count:10000,search_count:10000,bubble_stats:100,find_pairs:30,choose_three:10,make_permutations:6,make_combinations:6,power_set:8,subset_sum_count:16,three_sum_count:100,blackjack:100,pair_differences:30,three_sum_values:20,palindrome_words:30,knapsack:16,baseball_count:20,insertion_sort:1000,quick_select:1000,merge_sort:1000,cross_sum:1000,max_subarray:1000,dsu_find:1000,pick_vertex:100,relax:1000,completion_sum:1000,nonadjacent:10000};
  if(vectorCaps[f])length(0,['quick_select','cross_sum','max_subarray','dsu_find'].includes(f)?1:0,vectorCaps[f]);
  if(f==='lock_attempts')need(/^\d{4}$/.test(args[0]),'secret: 앞자리 0을 포함한 네 자리 숫자를 입력하세요.');
  if(['make_permutations','make_combinations'].includes(f))range(1,0,args[0].length);
  if(f==='password_candidates'){length(0,3,3);need(new Set(args[0]).size===3&&args[0].every(v=>v>=1&&v<=9),'A: 서로 다른 1~9 숫자 세 개를 입력하세요.');}
  if(f==='bf_string_match'){length(0,0,200);length(1,1,50);}
  if(f==='closest_pair')length(0,2,p.exercise?30:100);
  if(f==='palindrome_words')need(args[0].every(v=>v.length<=50),'각 단어는 50자 이하로 입력하세요.');
  if(f==='knapsack'){length(1,args[0].length,args[0].length);range(2,0,1600);need(args[0].every(v=>v>0),'무게는 양수여야 합니다.');}
  if(f==='baseball_count'){length(1,args[0].length,args[0].length);length(2,args[0].length,args[0].length);need(args[0].every(v=>/^\d{3}$/.test(v)&&new Set(v).size===3),'guesses: 서로 다른 숫자로 된 세 자리 문자열을 입력하세요.');need([...args[1],...args[2]].every(v=>v>=0&&v<=3),'strikes와 balls는 0~3입니다.');}
  if(f==='tsp_min')square(0,2,8);
  if(f==='grid_sum')matrix(0,1,8);
  if(f==='quick_select')range(1,1,args[0].length);
  if(f==='light_coin'){length(0,1,1024);need((args[0].length&(args[0].length-1))===0&&args[0].filter(v=>v===0).length===1&&args[0].every(v=>v===0||v===1),'weights: 길이가 2의 거듭제곱이고 0 하나와 나머지 1로 구성되어야 합니다.');}
  if(['merge_arrays','cross_inversions'].includes(f)){length(0,0,f==='merge_arrays'?500:1000);length(1,0,f==='merge_arrays'?500:1000);}
  if(f==='cross_sum')need(0<=args[1]&&args[1]<args[2]&&args[2]<args[3]&&args[3]<=args[0].length,'0 ≤ lo < mid < hi ≤ 배열 길이를 지켜주세요.');
  if(f==='max_subarray')need(0<=args[1]&&args[1]<args[2]&&args[2]<=args[0].length,'0 ≤ lo < hi ≤ 배열 길이를 지켜주세요.');
  if(f==='closest_base')matrix(0,2,3,2);
  if(['quad','white_count'].includes(f)){square(0,1,32);range(3,1,32);need((args[3]&(args[3]-1))===0&&args[1]>=0&&args[2]>=0&&args[1]+args[3]<=args[0].length&&args[2]+args[3]<=args[0].length,'n은 2의 거듭제곱이며 (r,c)에서 시작하는 영역이 배열 안에 있어야 합니다.');}
  if(f==='strassen2'){matrix(0,2,2,2);matrix(1,2,2,2);}
  if(['activity_count','fractional_value','knapsack1','knapsack2'].includes(f)){length(0,0,['knapsack1','knapsack2'].includes(f)?100:1000);need(args[0].every(r=>r.length===2),'각 항목은 숫자 두 개를 가진 배열이어야 합니다.');if(f!=='activity_count'){need(args[0].every(r=>r[0]>0),'물건 무게는 양수여야 합니다.');range(1,0,f==='fractional_value'?1e6:1000);}}
  if(f==='dsu_find'){index(1,args[0].length);need(args[0].every(v=>v>=0&&v<args[0].length),'parent 값은 배열 안의 인덱스여야 합니다.');for(let x=0;x<args[0].length;x++){const seen=new Set();let v=x;while(args[0][v]!==v){need(!seen.has(v),'parent는 루트를 가진 숲이어야 합니다. 순환이 있습니다.');seen.add(v);v=args[0][v];}}}
  if(f==='kruskal_cost'){range(0,1,1000);length(1,0,10000);need(args[1].every(r=>r.length===3&&r[0]>=0&&r[0]<args[0]&&r[1]>=0&&r[1]<args[0]),'edges: 각 행은 [시작 정점, 끝 정점, 가중치]이며 정점은 0~n-1입니다.');}
  if(f==='pick_vertex')length(1,args[0].length,args[0].length);
  if(f==='relax'){index(1,args[0].length);index(2,args[0].length);range(3,0,1e6);}
  if(f==='dijkstra'){square(0,1,100);index(1,args[0].length);}
  if(f==='nearest_tour')square(0,2,50);
  if(['lcs_length','lcs_restore'].includes(f)){length(0,0,100);length(1,0,100);}
  if(f==='grid_cost')matrix(0,1,100);
  // C int arguments share the same safe range across languages. Long distances
  // and the infinity sentinel are explicitly supported where the contract uses them.
  const numeric=(value,i)=>{if(Array.isArray(value))return value.forEach(v=>numeric(v,i));if(typeof value==='number'&&Number.isInteger(value)&&!['expected_checks','doubling_steps','binary_worst','karatsuba'].includes(f)){const isDistance=['pick_vertex','relax'].includes(f)&&i===0;need(isDistance?(value===1e18||Number.isSafeInteger(value)&&Math.abs(value)<=1e12):value>=-2147483648&&value<=2147483647,fields[i].name+': 정수 범위를 확인하세요.');}if(typeof value==='string')need(value.length<=200&&!/[^\x20-\x7e]/.test(value),fields[i].name+': 실행 입력은 200자 이하의 ASCII 문자로 입력하세요.');};
  args.forEach(numeric);
  return args;
}
function readCustomArgs(p,values){return validateCustomArgs(p,customFields(p).map((field,i)=>parseCustomValue(values[i],field.type,field.name)));}
