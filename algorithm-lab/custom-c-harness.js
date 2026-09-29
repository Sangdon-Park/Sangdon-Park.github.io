// Every embedded value has passed validateCustomArgs. No raw input is source code.
function customCCase(p,args) {
  validateCustomArgs(p,args);
  const id=Number(p.id.slice(1));
  if(id<47)return chapterTwoCase({...p,id:p.legacyHarnessId||p.id},args);
  const f=p.function;
  const lit=v=>typeof v==='number'&&Math.abs(v)>2147483647?BigInt(v).toString()+'LL':typeof v==='boolean'?String(Number(v)):JSON.stringify(v);
  const arr=(name,v,type='int')=>`${type} ${name}[${Math.max(1,v.length)}]={${v.map(lit).join(',')||'0'}};`;
  const mat=(name,v,width)=>`int ${name}[${Math.max(1,v.length)}][${width}]={${v.map(r=>'{'+r.map(lit).join(',')+'}').join(',')||'{0}'}};`;
  const list=(name,n,type='int')=>`printf("[");for(int z=0;z<${n};z++){if(z)printf(",");printf("${type==='int'?'%d':'%lld'}",${name}[z]);}printf("]");`;
  const scalar=(call,type=p.exactInteger?'exact':p.numeric_output?'double':'int')=>type==='exact'?`printf("\\\"%lld\\\"",(long long)${call});`:type==='double'?`printf("%.17g",${call});`:`printf("%lld",(long long)${call});`;
  const direct=(input)=>scalar(`${f}(${input.join(',')})`);
  let setup='',call='';
  switch(f){
    case 'first_index':case 'binary_search':case 'quick_select':
      setup=arr('a',args[0]);call=direct(['a',args[0].length,args[1]]);break;
    case 'gcd_value':case 'fibonacci':case 'karatsuba':case 'coin_count':case 'domino':call=direct(args.map(lit));break;
    case 'insertion_sort':case 'merge_sort':
      setup=arr('a',args[0])+arr('tmp',Array(args[0].length).fill(0));call=`${f}(${f==='merge_sort'?`a,0,${args[0].length},tmp`:`a,${args[0].length}`});`+list('a',args[0].length);break;
    case 'light_coin':case 'completion_sum':case 'nonadjacent':
      setup=arr('a',args[0]);call=direct(['a',args[0].length]);break;
    case 'merge_arrays':case 'cross_inversions':
      setup=arr('a',args[0])+arr('b',args[1]);
      if(f==='merge_arrays'){setup+=arr('out',Array(args[0].length+args[1].length).fill(0));call=`merge_arrays(a,${args[0].length},b,${args[1].length},out);`+list('out',args[0].length+args[1].length);}
      else call=direct(['a',args[0].length,'b',args[1].length]);break;
    case 'cross_sum':case 'max_subarray':
      setup=arr('a',args[0]);call=direct(['a',...args.slice(1)]);break;
    case 'closest_base':case 'activity_count':case 'fractional_value':case 'knapsack1':case 'knapsack2':
      setup=arr('a',args[0].map(r=>r[0]))+arr('b',args[0].map(r=>r[1]));
      if(f==='knapsack1')setup+=`int dp[${args[1]+1}]={0};`;
      if(f==='knapsack2')setup+='static int dp[101][1001];';
      call=direct(['a','b',args[0].length,...args.slice(1),...(['knapsack1','knapsack2'].includes(f)?['dp']:[])]);break;
    case 'quad':case 'white_count':
      setup=mat('a',args[0],32);
      if(f==='quad'){setup+='char out[4097]={0};int pos=0;';call=`quad(a,${args.slice(1).join(',')},out,&pos);out[4096]=0;lab_json_string(out);`;}
      else call=direct(['a',...args.slice(1)]);break;
    case 'strassen2':
      setup=mat('a',args[0],2)+mat('b',args[1],2)+'int out[2][2]={{0}};';call='strassen2(a,b,out);printf("[[%d,%d],[%d,%d]]",out[0][0],out[0][1],out[1][0],out[1][1]);';break;
    case 'dsu_find':setup=arr('a',args[0]);call=direct(['a',args[1]]);break;
    case 'kruskal_cost':setup=mat('edges',args[1],3);call=direct([args[0],'edges',args[1].length]);break;
    case 'pick_vertex':setup=arr('d',args[0],'long long')+arr('used',args[1]);call=direct(['d','used',args[0].length]);break;
    case 'relax':setup=arr('d',args[0],'long long');call=direct(['d',...args.slice(1)]);break;
    case 'dijkstra':
      setup=mat('g',args[0],100)+arr('out',Array(args[0].length).fill(0),'long long');call=`dijkstra(g,${args[0].length},${args[1]},out);`+list('out',args[0].length,'long long');break;
    case 'nearest_tour':setup=mat('d',args[0],50);call=direct(['d',args[0].length]);break;
    case 'fib_memo':setup='long long memo[91];for(int z=0;z<91;z++)memo[z]=-1;';call=direct([args[0],'memo']);break;
    case 'make_one':setup=`int dp[${args[0]+1}]={0};`;call=direct([args[0],'dp']);break;
    case 'make_path':{
      const dp=Array(args[0]+1).fill(0);for(let i=2;i<dp.length;i++)dp[i]=1+Math.min(dp[i-1],...[2,3,5].filter(d=>i%d===0).map(d=>dp[i/d]));
      setup=arr('dp',dp)+arr('out',Array(args[0]).fill(0));call=`int count=make_path(${args[0]},dp,out);if(count<0||count>${args[0]})printf("null");else{${list('out','count')}}`;break;
    }
    case 'lcs_length':case 'lcs_restore':{
      setup='static int dp[101][101];';
      if(f==='lcs_restore'){
        const [a,b]=args,dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
        for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);if(dp[i][j])setup+=`dp[${i}][${j}]=${dp[i][j]};`;}
        setup+='char out[101]={0};';call=`lcs_restore(${args.map(lit).join(',')},${a.length},${b.length},dp,out);out[100]=0;lab_json_string(out);`;
      }else call=direct([...args.map(lit),args[0].length,args[1].length,'dp']);break;
    }
    case 'grid_cost':setup=mat('a',args[0],100)+'static long long dp[100][100];';call=direct(['a',args[0].length,args[0][0].length,'dp']);break;
    default:throw Error('직접 실행 함수 설정이 없습니다: '+f);
  }
  // Show mutated arguments separately from the returned/output value.
  const changed=f==='dsu_find'?['a',args[0].length,'int']:f==='relax'?['d',args[0].length,'long long']:null;
  return {setup,call,after:changed?list(...changed):''};
}
const customCOutputSupport=String.raw`
#include <stdarg.h>
static char lab_custom_output[10001];
static int lab_custom_length;
static int lab_custom_printf(const char *format, ...){
  int before=lab_custom_length;
  va_list ap;va_start(ap,format);int n=vsnprintf(lab_custom_output+lab_custom_length,10001-lab_custom_length,format,ap);va_end(ap);
  if(n>0)lab_custom_length+=n>10000-lab_custom_length?10000-lab_custom_length:n;
  if(lab_custom_length>before){fputs("\nDJU_CUSTOM_STREAM:",stdout);lab_json_string(lab_custom_output+before);fputc('\n',stdout);fflush(stdout);}return n;
}
static int lab_custom_puts(const char *s){return lab_custom_printf("%s\n",s);}
static int lab_custom_putchar(int c){lab_custom_printf("%c",c);return c;}
#define printf lab_custom_printf
#define puts lab_custom_puts
#define putchar lab_custom_putchar
`;
