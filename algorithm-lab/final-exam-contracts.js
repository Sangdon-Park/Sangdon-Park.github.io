// Shared data validation and C calling conventions for the 24 public final tasks.
// Legacy task IDs and their saved work remain in the original catalog.
function validateFinalArgs(p,args) {
  const need=(ok,text)=>{if(!ok)throw Error(text);};
  const integer=(v,lo,hi)=>Number.isInteger(v)&&v>=lo&&v<=hi;
  const scalar=(i,lo,hi)=>need(integer(args[i],lo,hi),`${p.params[i]}: ${lo}~${hi}의 정수를 입력하세요.`);
  const vector=(i,lo,hi,min,max)=>{need(Array.isArray(args[i])&&integer(args[i].length,min,max),`${p.params[i]}: 길이는 ${min}~${max}입니다.`);need(args[i].every(x=>integer(x,lo,hi)),`${p.params[i]}: 각 값은 ${lo}~${hi}의 정수입니다.`);};
  const square=(i,min,max,graph=false)=>{const a=args[i];need(Array.isArray(a)&&integer(a.length,min,max),`행렬의 크기는 ${min}~${max}입니다.`);need(a.every(r=>Array.isArray(r)&&r.length===a.length&&r.every(x=>integer(x,0,graph?1:100))),'정사각 행렬과 원소 범위를 확인하세요.');need(a.every((r,j)=>r[j]===0),'대각선 값은 0입니다.');if(graph)need(a.every((r,j)=>r.every((v,k)=>v===a[k][j])),'무방향 그래프의 행렬은 대칭이어야 합니다.');return a.length;};
  const costMatrix=(i)=>{const a=args[i];need(Array.isArray(a)&&integer(a.length,1,8)&&a.every(r=>Array.isArray(r)&&r.length===a.length&&r.every(x=>integer(x,0,100))),'비용은 0~100인 1~8 크기의 정사각 행렬입니다.');return a.length;};
  const tour=(i,n)=>{vector(i,0,n-1,n,n);need(args[i][0]===0&&new Set(args[i]).size===n,'route는 0으로 시작하며 모든 도시를 한 번씩 포함해야 합니다.');};
  need(Array.isArray(args)&&args.length===p.params.length,'함수 인자 개수를 확인하세요.');
  switch(p.function) {
    case 'fib_bottomup': scalar(0,0,90); break;
    case 'nonadjacent': vector(0,-1000000,1000000,0,10000); break;
    case 'make_one': scalar(0,1,10000); break;
    case 'knapsack2':
      need(Array.isArray(args[0])&&args[0].length<=100&&args[0].every(r=>Array.isArray(r)&&r.length===2&&integer(r[0],1,1000)&&integer(r[1],0,1000000)),'items는 최대 100개의 [무게 1~1000, 가치 0~1000000]입니다.');scalar(1,0,1000);break;
    case 'permutation_count': scalar(0,0,8); scalar(1,0,args[0]); break;
    case 'subset_sum_count': vector(0,1,50,0,20); scalar(1,0,1000); break;
    case 'can_color': square(0,1,8,true); scalar(1,1,3); break;
    case 'nqueen_count': scalar(0,1,8); break;
    case 'route_cost': case 'best_swap_cost': tour(1,square(0,1,9)); break;
    case 'assignment_bound': {const n=costMatrix(0);vector(1,0,1,n,n);scalar(2,0,n);need(args[1].reduce((a,b)=>a+b,0)===args[2],'used의 1 개수는 next_row와 같아야 합니다.');break;}
    case 'assignment_min': costMatrix(0); break;
    case 'tsp_min': case 'nearest_neighbor': square(0,1,9); break;
    case 'verify_subset_sum': vector(0,0,100,0,20);vector(1,0,1,args[0].length,args[0].length);scalar(2,0,2000);break;
    case 'verify_vertex_cover': {const n=square(0,1,8,true);vector(1,0,1,n,n);break;}
    case 'verify_hamiltonian': {const n=square(0,3,8,true);vector(1,-2147483648,2147483647,n,n);break;}
    case 'satisfiable_3cnf': scalar(0,1,12);need(Array.isArray(args[1])&&args[1].length<=30&&args[1].every(r=>Array.isArray(r)&&r.length===3&&r.every(v=>integer(v,-args[0],args[0])&&v!==0)),'각 절은 0이 아닌 −n~n 리터럴 세 개이며 절은 최대 30개입니다.');break;
    case 'within_factor': scalar(0,1,1000000);scalar(1,1,args[0]);scalar(2,1,100);break;
    case 'list_scheduling': vector(0,0,1000000,0,1000);scalar(1,1,10);break;
    case 'cover_size': scalar(0,1,100);need(Array.isArray(args[1])&&args[1].length<=1000&&args[1].every(e=>Array.isArray(e)&&e.length===2&&e.every(v=>integer(v,0,args[0]-1))&&e[0]!==e[1]),'edges는 최대 1000개의 서로 다른 두 끝점 0~n-1입니다.');break;
    case 'greedy_set_cover': scalar(0,1,20);vector(1,0,2**args[0]-1,0,30);break;
    case 'manhattan': for(let i=0;i<4;i++)scalar(i,-10000,10000);break;
    case 'accept_move': scalar(0,0,10000);scalar(1,0,10000);need(Number.isFinite(args[2])&&args[2]>=0&&args[2]<=1000,'temp는 0~1000입니다.');need(Number.isFinite(args[3])&&args[3]>=0&&args[3]<1,'u는 0 이상 1 미만입니다.');break;
    default: throw Error('공개 기말 문제의 함수 규격을 확인하세요.');
  }
  return args;
}
function finalCCase(p,args) {
  validateFinalArgs(p,args);
  const arr=(name,a)=>`int ${name}[${Math.max(1,a.length)}]={${a.join(',')||'0'}};`;
  const mat=(name,a,width)=>`int ${name}[${Math.max(1,a.length)}][${width}]={${a.map(r=>'{'+r.join(',')+'}').join(',')||'{0}'}};`;
  let setup='',inputs=[];
  switch(p.function) {
    case 'fib_bottomup': case 'permutation_count': case 'nqueen_count': case 'within_factor': case 'manhattan': case 'accept_move': inputs=args;break;
    case 'nonadjacent': setup=arr('a',args[0]);inputs=['a',args[0].length];break;
    case 'make_one': setup=`int dp[${args[0]+1}]={0};`;inputs=[args[0],'dp'];break;
    case 'knapsack2': setup=arr('w',args[0].map(r=>r[0]))+arr('v',args[0].map(r=>r[1]))+'static int dp[101][1001];';inputs=['w','v',args[0].length,args[1],'dp'];break;
    case 'subset_sum_count': setup=arr('a',args[0]);inputs=['a',args[0].length,args[1]];break;
    case 'can_color': setup=mat('g',args[0],8);inputs=['g',args[0].length,args[1]];break;
    case 'route_cost': case 'best_swap_cost': setup=mat('d',args[0],9)+arr('r',args[1]);inputs=['d',args[0].length,'r'];break;
    case 'assignment_bound': setup=mat('c',args[0],8)+arr('used',args[1]);inputs=['c',args[0].length,'used',args[2]];break;
    case 'assignment_min': setup=mat('c',args[0],8);inputs=['c',args[0].length];break;
    case 'tsp_min': case 'nearest_neighbor': setup=mat('d',args[0],9);inputs=['d',args[0].length];break;
    case 'verify_subset_sum': setup=arr('a',args[0])+arr('s',args[1]);inputs=['a','s',args[0].length,args[2]];break;
    case 'verify_vertex_cover': case 'verify_hamiltonian': setup=mat('g',args[0],8)+arr('s',args[1]);inputs=['g',args[0].length,'s'];break;
    case 'satisfiable_3cnf': setup=mat('clauses',args[1],3);inputs=[args[0],'clauses',args[1].length];break;
    case 'list_scheduling': setup=arr('a',args[0]);inputs=['a',args[0].length,args[1]];break;
    case 'cover_size': setup=mat('edges',args[1],2);inputs=[args[0],'edges',args[1].length];break;
    case 'greedy_set_cover': setup=arr('sets',args[1]);inputs=[args[0],'sets',args[1].length];break;
    default: throw Error('C 함수 호출 규격을 확인하세요.');
  }
  // Only validated finite numeric data and fixed local identifiers reach C source.
  const expression=`${p.function}(${inputs.join(',')})`;
  return {setup,call:p.exactInteger?`printf("\\\"%lld\\\"",(long long)${expression});`:`printf("%lld",(long long)${expression});`};
}
