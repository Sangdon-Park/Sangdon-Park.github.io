"""Build the PPTX exercise practice bank. No private exam selections are used.

exercise-source.json contains the 50 coding questions checked against the PPTX.
Tests combine every supplied example with boundary cases and independent oracles.
"""
from pathlib import Path
import ast
import copy
import itertools
import json
import random
import re

ROOT = Path(__file__).resolve().parents[2]
SOURCE = json.loads((Path(__file__).with_name('exercise-source.json')).read_text(encoding='utf-8'))
INF = 10**18
RNG = random.Random(20260920)

def one_table(n):
    dp = [0]*(n+1)
    for x in range(2,n+1):
        dp[x] = 1 + min([dp[x-1]]+[dp[x//d] for d in (2,3,5) if x%d==0])
    return dp

def lcs_table(a,b):
    dp = [[0]*(len(b)+1) for _ in range(len(a)+1)]
    for i,x in enumerate(a,1):
        for j,y in enumerate(b,1):
            dp[i][j] = dp[i-1][j-1]+1 if x==y else max(dp[i-1][j],dp[i][j-1])
    return dp

def fib(n):
    a,b=0,1
    for _ in range(n): a,b=b,a+b
    return a

# Small, explicit counterexamples for common wrong implementations; the random
# cases below have deterministic independent expected results.
EXTRA = {
 'first_index': [[[4,4,4],4], [[-2,0,5],5], [[-2,0,5],-2]],
 'binary_search': [[[4],4], [[4],3], [list(range(1000)),999]],
 'lower_bound': [[[2,2,2],1], [[2,2,2],2], [[2,2,2],3]],
 'count_equal': [[[2147483647]*4,2147483647], [[-2,-2,0,4],-2], [[1,2,3],0]],
 'gcd_value': [[18,0], [1000000000,999999999], [17,17]],
 'power_mod': [[1000000000,1000000000,999999937], [0,8,7], [3,9,13]],
 'insertion_sort': [[[4,3,2,1]], [[1,2,3]], [[-2,0,-2,5]]],
 'quick_select': [[[2],1], [[5,1,5,1],1], [[5,1,5,1],4]],
 'fibonacci': [[1],[2],[89]],
 'light_coin': [[[0]+[1]*1023], [[1]*1023+[0]]],
 'merge_arrays': [[[],[1,2]], [[1,2],[]], [[-1,2,2],[2,3]]],
 'merge_sort': [[[1]], [[3,2,1,0]], [[-2,3,-2,0]]],
 'cross_sum': [[[99,-4,-2,99],1,2,3], [[1,2,3,4],0,2,4]],
 'max_subarray': [[[-9],0,1], [[99,-5,2,3,-1,99],1,5], [[1,2,3],0,3]],
 'closest_base': [[[[-10000,-10000],[10000,10000]]], [[[0,0],[1,1],[8,8]]]],
 'quad': [[[[0]],0,0,1], [[[1,1],[1,1]],0,0,2], [[[0,0,1,1],[0,0,1,1],[1,0,0,1],[0,1,1,0]],0,0,4]],
 'karatsuba': [[99999999,99999999],[99999999,1],[10,10]],
 'strassen2': [[[[0,0],[0,0]],[[3,-2],[9,1]]], [[[1000,-1000],[-1000,1000]],[[1000,1000],[-1000,-1000]]]],
 'white_count': [[[[0]],0,0,1], [[[1]],0,0,1], [[[1]*4 for _ in range(4)],0,0,4]],
 'cross_inversions': [[[],[1]], [[5,6],[1,2,3]], [[1,1],[2,2]]],
 'coin_count': [[1],[500],[1000000000]],
 'activity_count': [[[[0,1],[1,2],[2,3]]], [[[0,3],[1,4],[2,5]]]],
 'fractional_value': [[[[3,5]],1], [[[3,5]],0], [[[3,5]],4]],
 'dsu_find': [[[0,0,1,2,4],3], [list(range(10)),9], [[0]+list(range(99)),99]],
 'kruskal_cost': [[4,[[0,1,-2],[1,2,-1],[0,2,0],[2,3,5]]], [3,[[0,1,1]]]],
 'pick_vertex': [[[2,2,INF],[False,False,False]], [[0,1],[True,True]], [[INF,7],[False,False]]],
 'dijkstra': [[[[0,-1,-1],[-1,0,2],[-1,-1,0]],0], [[[0,0,10],[-1,0,1],[-1,-1,0]],0], [[[0]],0]],
 'nearest_tour': [[[[0,5],[5,0]]], [[[0,1,1,9],[1,0,2,8],[1,2,0,3],[9,8,3,0]]]],
 'completion_sum': [[[1000000]*1000], [[7]]],
 'relax': [[[INF,INF],0,1,0], [[5,INF],0,1,0], [[8,2],0,1,3]],
 'fib_memo': [[1],[2],[89]],
 'domino': [[1,1],[1,7],[1000000,999999937]],
 'make_one': [[2],[5],[10000]],
 'make_path': [[6],[10],[10000]],
 'knapsack2': [[[[2,3]],4], [[[1,0],[2,8]],0], [[[3,4],[4,5],[2,3]],7]],
 'knapsack1': [[[],10], [[[1,0],[2,8]],0], [[[1000,1000000]]*100,1000]],
 'lcs_length': [['',''],['AAAA','AA'],['ABC','XYZ']],
 'lcs_restore': [['','ABC'],['AAAA','AA'],['ABC','XYZ']],
 'nonadjacent': [[[9]], [[-9]], [[1000000]*10000]],
 'grid_cost': [[[[5,3,7]]], [[[5],[3],[7]]], [[[0,0],[0,1]]]],
}

def oracle(name,a):
    """Independent expected results, not the displayed reference implementation."""
    if name=='first_index': return a[0].index(a[1]) if a[1] in a[0] else -1
    if name=='binary_search': return a[0].index(a[1]) if a[1] in a[0] else -1
    if name=='lower_bound': return sum(v<a[1] for v in a[0])
    if name=='count_equal': return a[0].count(a[1])
    if name=='gcd_value':
        import math
        return math.gcd(*a)
    if name=='power_mod': return pow(*a)
    if name in ('insertion_sort','merge_sort'): return sorted(a[0])
    if name=='quick_select': return sorted(a[0])[a[1]-1]
    if name in ('fibonacci','fib_memo'): return fib(a[0])
    if name=='light_coin': return a[0].index(0)
    if name=='merge_arrays': return sorted(a[0]+a[1])
    if name=='cross_sum':
        v,lo,mid,hi=a
        return max(sum(v[i:j]) for i in range(lo,mid) for j in range(mid+1,hi+1))
    if name=='max_subarray':
        v,lo,hi=a
        return max(sum(v[i:j]) for i in range(lo,hi) for j in range(i+1,hi+1))
    if name=='closest_base': return min(sum((x-y)**2 for x,y in zip(p,q)) for p,q in itertools.combinations(a[0],2))
    if name in ('quad','white_count'):
        m,r,c,n=a
        cells=[m[i][j] for i in range(r,r+n) for j in range(c,c+n)]
        if len(set(cells))==1: return str(cells[0]) if name=='quad' else cells[0]
        h=n//2; parts=[oracle(name,[m,r+dr,c+dc,h]) for dr,dc in [(0,0),(0,h),(h,0),(h,h)]]
        return '('+''.join(parts)+')' if name=='quad' else sum(parts)
    if name=='karatsuba': return a[0]*a[1]
    if name=='strassen2': return [[sum(a[0][i][k]*a[1][k][j] for k in range(2)) for j in range(2)] for i in range(2)]
    if name=='cross_inversions': return sum(x>y for x in a[0] for y in a[1])
    if name=='coin_count':
        v=a[0]; count=0
        for c in [500,100,50,10,1]: q,v=divmod(v,c); count+=q
        return count
    if name=='activity_count':
        return max((len(s) for r in range(len(a[0])+1) for s in itertools.combinations(a[0],r) if all(s[i][1]<=s[i+1][0] for i in range(len(s)-1))),default=0)
    if name=='fractional_value':
        left=a[1]; result=0
        for w,v in a[0]: result+=min(left,w)*v/w; left=max(0,left-w)
        return float(result)
    if name=='dsu_find':
        parent,x=a
        while parent[x]!=x: x=parent[x]
        return x
    if name=='kruskal_cost':
        n,edges=a; best=None
        for chosen in itertools.combinations(edges,n-1):
            reached={0}
            for _ in range(n):
                for u,v,_ in chosen:
                    if u in reached or v in reached: reached|={u,v}
            if len(reached)==n:
                cost=sum(e[2] for e in chosen); best=cost if best is None else min(best,cost)
        return -INF if best is None else best
    if name=='pick_vertex':
        v=[(d,i) for i,d in enumerate(a[0]) if not a[1][i] and d<INF]
        return min(v)[1] if v else -1
    if name=='dijkstra':
        g,s=a; d=[INF]*len(g); d[s]=0
        for _ in range(len(g)-1):
            old=d[:]
            for u in range(len(g)):
                for v,w in enumerate(g[u]):
                    if w>=0 and old[u]<INF: d[v]=min(d[v],old[u]+w)
        return d
    if name=='nearest_tour':
        d=a[0]; remaining=set(range(1,len(d))); path=[0]
        while remaining:
            v=sorted(remaining,key=lambda i:(d[path[-1]][i],i))[0]; path.append(v); remaining.remove(v)
        path.append(0)
        return sum(d[u][v] for u,v in zip(path,path[1:]))
    if name=='completion_sum': return sum((len(a[0])-i)*v for i,v in enumerate(a[0]))
    if name=='relax': return int(a[0][a[1]]<INF and a[0][a[1]]+a[3]<a[0][a[2]])
    if name=='domino':
        # fast doubling computes F(n+1), unlike the linear reference loop
        def pair(n):
            if not n: return 0,1%a[1]
            x,y=pair(n//2); c=x*(2*y-x)%a[1]; d=(x*x+y*y)%a[1]
            return (d,(c+d)%a[1]) if n%2 else (c,d)
        return pair(a[0]+1)[0]
    if name=='make_one': return one_table(a[0])[-1]
    if name=='make_path':
        n=a[0]; dp=one_table(n); path=[n]
        while n>1:
            candidates=[n-1]+[n//d for d in [2,3,5] if n%d==0]
            n=min(enumerate(candidates),key=lambda t:(dp[t[1]],t[0]))[1];path.append(n)
        return path
    if name in ('knapsack1','knapsack2'):
        items,W=a; states={0:0}
        for w,v in items:
            old=dict(states)
            for used,val in old.items():
                if used+w<=W: states[used+w]=max(states.get(used+w,0),val+v)
        return max(states.values())
    if name=='lcs_length': return lcs_table(*a)[-1][-1]
    if name=='lcs_restore':
        x,y=a; table=lcs_table(x,y); i,j=len(x),len(y); chars=[]
        while i and j:
            if x[i-1]==y[j-1]: chars.insert(0,x[i-1]); i-=1;j-=1
            elif table[i-1][j]>=table[i][j-1]: i-=1
            else: j-=1
        return ''.join(chars)
    if name=='nonadjacent':
        dp=[0,0]
        for v in a[0]: dp.append(max(dp[-1],dp[-2]+v))
        return dp[-1]
    if name=='grid_cost':
        m=a[0]; dist={(0,0):m[0][0]}
        for r in range(len(m)):
            for c in range(len(m[0])):
                for dr,dc in [(1,0),(0,1),(1,1)]:
                    rr,cc=r+dr,c+dc
                    if rr<len(m) and cc<len(m[0]):
                        value=dist[r,c]+(m[rr][cc]//2 if dr and dc else m[rr][cc])
                        dist[rr,cc]=min(dist.get((rr,cc),INF),value)
        return dist[len(m)-1,len(m[0])-1]
    raise ValueError(name)

def literal(v):
    if isinstance(v,str): return json.dumps(v)
    if isinstance(v,bool): return str(int(v))
    return str(v)+('LL' if abs(v)>2147483647 else '')

def arr(name,values,typ='int'):
    return f'{typ} {name}[{max(1,len(values))}]={{'+','.join(map(literal,values or [0]))+'};'

def mat(name,values,width):
    return f'int {name}[{max(1,len(values))}][{width}]={{'+','.join('{'+','.join(map(literal,row))+'}' for row in values)+'};'

def printarr(name,n,typ='int'):
    fmt='%lld' if typ=='long long' else '%d'
    return f'printf("[");for(int z=0;z<{n};z++){{if(z)printf(",");printf("{fmt}",{name}[z]);}}printf("]");'

def ccase(p,t):
    f=p['function']; a=t['args']; s=''; call=''; expr=''
    if p['chapter']==2: return None # existing tested chapterTwoCase adapter
    if f in ['first_index','binary_search','lower_bound','count_equal','quick_select']:
        s=arr('a',a[0]);expr=f'{f}(a,{len(a[0])},{a[1]})'
    elif f in ['gcd_value','power_mod','fibonacci','karatsuba','coin_count','domino']:
        expr=f'{f}('+','.join(map(literal,a))+')'
    elif f in ['insertion_sort','merge_sort']:
        n=len(a[0]);s=arr('a',a[0])+f'int tmp[{max(1,n)}]={{0}};'
        call=(f'{f}(a,{n});' if f=='insertion_sort' else f'{f}(a,0,{n},tmp);')+printarr('a',n)
    elif f in ['light_coin','completion_sum','nonadjacent']:
        s=arr('a',a[0]);expr=f'{f}(a,{len(a[0])})'
    elif f in ['merge_arrays','cross_inversions']:
        n,m=map(len,a);s=arr('a',a[0])+arr('b',a[1])
        if f=='merge_arrays':
            s+=f'int out[{max(1,n+m)}]={{0}};';call=f'{f}(a,{n},b,{m},out);'+printarr('out',n+m)
        else: expr=f'{f}(a,{n},b,{m})'
    elif f in ['cross_sum','max_subarray']:
        s=arr('a',a[0]);expr=f'{f}(a,'+','.join(map(str,a[1:]))+')'
    elif f in ['closest_base','activity_count','fractional_value','knapsack1','knapsack2']:
        n=len(a[0]);s=arr('a',[x[0] for x in a[0]])+arr('b',[x[1] for x in a[0]])
        expr=f'{f}(a,b,{n}'
        if len(a)>1: expr+=f',{a[1]}'
        if f=='knapsack1': s+=f'int dp[{a[1]+1}];';expr+=',dp'
        if f=='knapsack2': s+='static int dp[101][1001];';expr+=',dp'
        expr+=')'
    elif f in ['quad','white_count']:
        s=mat('a',a[0],32);expr=f'{f}(a,'+','.join(map(str,a[1:]))
        if f=='quad':
            s+='char out[4097]={0};int pos=0;';call=expr+',out,&pos);printf("\\\"%s\\\"",out);';expr=''
        else: expr+=')'
    elif f=='strassen2':
        s=mat('a',a[0],2)+mat('b',a[1],2)+'int out[2][2]={{0}};'
        call='strassen2(a,b,out);printf("[[%d,%d],[%d,%d]]",out[0][0],out[0][1],out[1][0],out[1][1]);'
    elif f=='dsu_find':
        s=arr('a',a[0]);call=f'int result=dsu_find(a,{a[1]});int valid=1;'
        for i,v in t['mutationChecks'].items(): call+=f'if(a[{i}]!={v})valid=0;'
        call+='if(valid)printf("%d",result);else printf("null");'
    elif f=='kruskal_cost': s=mat('e',a[1],3);expr=f'{f}({a[0]},e,{len(a[1])})'
    elif f=='pick_vertex': s=arr('d',a[0],'long long')+arr('used',a[1]);expr=f'{f}(d,used,{len(a[0])})'
    elif f=='dijkstra':
        n=len(a[0]);s=mat('g',a[0],100)+f'long long out[{n}];';call=f'{f}(g,{n},{a[1]},out);'+printarr('out',n,'long long')
    elif f=='nearest_tour': s=mat('d',a[0],50);expr=f'{f}(d,{len(a[0])})'
    elif f=='relax':
        s=arr('d',a[0],'long long');call=f'int result=relax(d,{a[1]},{a[2]},{a[3]});int valid=1;'
        for i,v in enumerate(t['after']): call+=f'if(d[{i}]!={literal(v)})valid=0;'
        call+='if(valid)printf("%d",result);else printf("null");'
    elif f=='fib_memo':
        s='long long memo[91];for(int i=0;i<91;i++)memo[i]=-1;'
        call=f'long long result=fib_memo({a[0]},memo);int valid=1;'
        for i,v in t['mutationChecks'].items(): call+=f'if(memo[{i}]!={v}LL)valid=0;'
        call+='if(valid)printf("\\\"%lld\\\"",result);else printf("null");'
    elif f=='make_one': s=f'int dp[{a[0]+1}];';expr=f'{f}({a[0]},dp)'
    elif f=='make_path':
        s=arr('dp',one_table(a[0]))+f'int out[{a[0]}]={{0}};'
        call=f'int count={f}({a[0]},dp,out);if(count<1||count>{a[0]})printf("null");else{{'+printarr('out','count')+'}'
    elif f in ['lcs_length','lcs_restore']:
        s='static int dp[101][101];'
        if f=='lcs_restore':
            for i,row in enumerate(lcs_table(*a)):
                for j,v in enumerate(row): s+=f'dp[{i}][{j}]={v};'
        expr=f'{f}({literal(a[0])},{literal(a[1])},{len(a[0])},{len(a[1])},dp'
        if f=='lcs_restore': s+='char out[101]={0};';call=expr+',out);lab_json_string(out);';expr=''
        else: expr+=')'
    elif f=='grid_cost':
        s=mat('a',a[0],100)+'static long long dp[100][100];';expr=f'{f}(a,{len(a[0])},{len(a[0][0])},dp)'
    else: raise ValueError(f)
    if expr:
        if p.get('exactInteger'): call=f'printf("\\\"%lld\\\"",(long long){expr});'
        elif f=='fractional_value': call=f'printf("%.17g",{expr});'
        else: call=f'printf("%lld",(long long){expr});'
    return {'setup':s,'call':call}

def build():
    sources={re.search(r'def (\w+)',q['python'])[1]:q for q in SOURCE}
    out=[]
    for i,q in enumerate(SOURCE,37):
        f=re.search(r'def (\w+)',q['python'])[1]
        params=[a.arg for a in ast.parse(q['python']).body[0].args.args]
        signature=re.search(r'(?:void|int|double|long long)\s+'+f+r'\s*\([^{}]+\)\s*\{',q['c'])[0][:-1].strip()
        return_type=signature.split(f)[0].strip()
        starter=signature+' {\n  // TODO: 문제의 조건에 맞게 구현하세요.\n'+('' if return_type=='void' else '  return 0;\n')+'}\n'
        p={'id':f'P{i:02}', 'chapter':q['chapter'],'exercise':q['number'], 'title':q['title'], 'section':f"연습문제 {q['number']}번", 'slides':str(q['slide']), 'level':'PPTX 작성형', 'function':f, 'params':params, 'statement':q['question']+'\n\n'+q['requirements'], 'hint':q['answer'], 'solution':q['python'], 'starter':f'def {f}('+', '.join(params)+'):\n    # 여기에 코드를 작성하세요.\n    raise NotImplementedError\n', 'complexity':q['complexity'], 'sourceFile':q['file'],'sourceHash':q['sha256'], 'tests':copy.deepcopy(q['tests']), 'c':{'starter':starter,'solution':q['c'],'statement':q['question']+'\n\n'+q['requirements'],'hint':q['answer'],'result':q.get('contract','PPTX에 제시된 함수 형식을 사용합니다. 결과 배열과 작업 배열은 채점기가 준비합니다.')}}
        if q['chapter']==2:
            p['legacyHarnessId']=q['legacyHarnessId'];p['c']['result']=q['contract']
            p['c'].update(q['cOutput'])
            # The current PPTX constraints supersede the older lecture bank.
            if f=='find_pairs': p['tests']=[t for t in p['tests'] if all(-100<=v<=100 for v in t['args'][0])]
        else:
            for a in EXTRA.get(f,[]): p['tests'].append({'args':a,'expected':oracle(f,a),'public':False})
            if f in ('first_index','binary_search','lower_bound','count_equal','insertion_sort','quick_select','merge_sort','cross_inversions'):
                for _ in range(6):
                    v=[RNG.randrange(-10,11) for _ in range(RNG.randrange(1,18))]
                    if f in ('binary_search','lower_bound','count_equal','cross_inversions'): v=sorted(set(v)) if f=='binary_search' else sorted(v)
                    a=[v,RNG.randrange(-12,13)] if f in ('first_index','binary_search','lower_bound','count_equal') else [v,RNG.randrange(1,len(v)+1)] if f=='quick_select' else [v,sorted(RNG.choices(range(-10,11),k=12))] if f=='cross_inversions' else [v]
                    p['tests'].append({'args':a,'expected':oracle(f,a),'public':False})
        helper={'count_equal':'lower_bound','merge_sort':'merge_arrays','max_subarray':'cross_sum','kruskal_cost':'dsu_find','dijkstra':'pick_vertex'}.get(f)
        p['pythonPrelude']='import sys\nsys.setrecursionlimit(10000)\n'+(sources[helper]['python'] if helper else '')
        p['cPrelude']=sources[helper]['c'] if helper and f!='merge_sort' else ''
        p['provided']=f'{helper} 함수는 실행 환경에 제공됩니다.' if helper else ''
        if f=='fib_memo': p['provided']='memo: 길이 91, 모든 값이 −1인 배열을 실행 환경이 전달합니다.'
        if f=='make_path': p['provided']='dp: 1로 만들기의 최솟값 표를 실행 환경이 계산하여 전달합니다. 입력 예시에는 n만 표시합니다.'
        if f=='lcs_restore': p['provided']='dp: 두 문자열의 접두사 LCS 길이 표를 실행 환경이 계산하여 전달합니다. 입력 예시에는 문자열만 표시합니다.'
        if f in ('fibonacci','fib_memo','karatsuba'): p['exactInteger']=True
        if f=='fractional_value': p.update(numeric_output=True,tolerance=1e-6)
        if f=='insertion_sort': p['outputArgument']=0;p['provided']='반환값 대신 입력 배열 a가 제자리 정렬되었는지 검사합니다.'
        if f=='closest_base': p['complexity']+=' 보조 공간 O(1).'
        if f=='merge_arrays': p['complexity']='시간 O(n+m), 출력 공간 O(n+m). C는 출력 외 O(1). PPTX Python 예시는 슬라이싱 임시 배열을 사용하므로 출력 외에도 최악 O(n+m) 공간이 듭니다.'
        for t in p['tests']:
            a=t['args']
            if f=='dsu_find':
                root=oracle(f,a); x=a[1]; checks={}
                while a[0][x]!=x: checks[str(x)]=root;x=a[0][x]
                t['mutationChecks']=checks;t['mutationArg']=0
            if f=='relax':
                t['after']=copy.deepcopy(a[0])
                if t['expected']: t['after'][a[2]]=a[0][a[1]]+a[3]
            if f=='fib_memo':
                t['mutationChecks']={str(x):str(fib(x)) for x in (range(a[0]+1) if a[0]>=2 else [a[0]])};t['mutationArg']=1
            if p.get('exactInteger'): t['expected']=str(t['expected'])
            if q['chapter']>=3: t['cHarness']=ccase(p,t)
        p['study']={'method':q['answer'], 'boundary':boundary(f), 'complexity':p['complexity'], 'requirements':q['requirements']}
        out.append(p)
    (ROOT/'algorithm-lab/exercise-problems.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    core=ROOT/'_services/algorithm-lab/supabase/functions/algorithm-lab/core.mjs'
    text=core.read_text(encoding='utf-8'); totals=json.loads(re.search(r'export const TOTALS=(.*?);',text)[1]);totals.update({p['id']:len(p['tests']) for p in out})
    core.write_text(re.sub(r'export const TOTALS=.*?;', 'export const TOTALS='+json.dumps(totals,separators=(',',':'))+';',text,count=1),encoding='utf-8')
    print(f'Built {len(out)} PPTX exercises, {sum(len(p["tests"]) for p in out)} cases per language.')

def boundary(f):
    return {
      'lock_attempts':'0000은 1회, 9999는 10,000회입니다. 네 중첩 반복문을 사용합니다.',
      'find_pairs':'빈 배열·원소 1개는 빈 목록입니다. i<j 순서와 같은 값의 서로 다른 인덱스를 구분합니다.',
      'blackjack':'세 장 미만이거나 가능한 합이 없으면 0입니다.',
      'make_permutations':'r=0이면 빈 순열 하나입니다. 같은 원소를 중복 사용하지 않고 입력 인덱스 순으로 탐색합니다.',
      'make_combinations':'r=0이면 빈 조합 하나입니다. 인덱스가 증가하도록 선택합니다.',
      'bf_string_match':'패턴은 비어 있지 않습니다. 텍스트가 더 짧으면 빈 목록, 겹치는 일치도 모두 포함합니다.',
      'closest_pair':'뺄셈 전에 long long으로 변환합니다. 동률에서는 먼저 발견한 인덱스 쌍을 유지합니다.',
      'power_set':'빈 입력에도 빈 부분집합 하나가 있습니다. 비트마스크 순서를 지킵니다.',
      'tsp_min':'비대칭 비용도 가능합니다. 마지막 도시에서 0으로 돌아오는 비용을 포함합니다.',
      'knapsack':'각 물건은 최대 한 번 선택합니다. 빈 입력 또는 용량 0이면 0입니다.',
      'first_index':'빈 배열과 미발견은 −1, 중복은 첫 인덱스입니다.',
      'binary_search':'빈 배열·마지막 원소·미발견을 검사하고 매번 구간을 줄입니다.',
      'lower_bound':'빈 배열은 0, 모든 값보다 큰 x는 n, 중복은 첫 위치입니다.',
      'count_equal':'미발견은 0입니다. C에서 x+1은 최댓값일 때 넘칠 수 있습니다.',
      'gcd_value':'gcd(0,0)=0이며 한 값만 0이면 다른 값을 반환합니다.',
      'power_mod':'지수 0도 1 mod m입니다. m=1이면 0, 중간 곱은 long long으로 계산합니다.',
      'insertion_sort':'빈 배열·중복·이미 정렬된 배열을 다룹니다. 같은 값은 뒤로 밀지 않습니다.',
      'quick_select':'k는 1부터 시작합니다. 중복도 각각 세며 최악 시간은 O(n²)입니다.',
      'fibonacci':'n=0,1을 처리하고 F(90)까지 long long으로 정확히 반환합니다.',
      'light_coin':'n=1과 0이 양 끝에 있는 경우를 확인합니다. 합을 구하는 비용도 시간에 포함합니다.',
      'merge_arrays':'한쪽 또는 양쪽이 빈 배열일 수 있고 같은 값이면 a를 먼저 선택합니다.',
      'merge_sort':'길이 0·1에서 종료합니다. Python은 새 배열 반환, C는 [lo,hi) 제자리 정렬입니다.',
      'cross_sum':'양쪽에서 각각 한 원소 이상 선택합니다. 모두 음수여도 0으로 초기화하지 않습니다.',
      'max_subarray':'빈 구간은 금지입니다. 원소 1개와 모두 음수인 경우를 확인합니다.',
      'closest_base':'제곱 거리를 반환합니다. 같은 점 두 개는 0입니다.',
      'quad':'균일한 칸은 0/1 한 글자, 분할 순서는 좌상·우상·좌하·우하입니다.',
      'karatsuba':'0·한 자리에서 종료합니다. 자리수와 중간 곱의 long long 범위를 확인합니다.',
      'strassen2':'스칼라 곱셈 7회인 식을 사용합니다. 0과 음수를 포함한 행렬도 처리합니다.',
      'white_count':'균일한 1 영역은 크기와 무관하게 1개, 균일한 0 영역은 0개입니다.',
      'cross_inversions':'같은 값은 역전이 아닙니다. 어느 배열이 비어 있으면 0입니다.',
      'coin_count':'금액 0은 0개입니다. 정해진 동전 500·100·50·10·1을 사용합니다.',
      'activity_count':'끝 시각과 다음 시작 시각이 같아도 선택할 수 있습니다. 입력은 끝 시각 순입니다.',
      'fractional_value':'용량 0·빈 목록을 처리합니다. 물건 일부의 가치는 실수로 계산합니다.',
      'dsu_find':'루트 반환과 방문 경로의 압축을 모두 검사합니다. 루트 자신을 찾는 경우도 처리합니다.',
      'kruskal_cost':'사이클을 건너뛰고 n−1개 간선이 안 모이면 −10¹⁸, n=1이면 0입니다.',
      'pick_vertex':'미방문·유한 거리만 후보입니다. 동률은 작은 번호, 후보 없으면 −1입니다.',
      'dijkstra':'−1은 간선 없음, 가중치 0은 유효한 간선입니다. 도달 불가는 10¹⁸입니다.',
      'nearest_tour':'거리 동률은 작은 도시 번호, 마지막 귀환도 포함합니다. 최적해 보장 알고리즘은 아닙니다.',
      'completion_sum':'빈 배열은 0, 누적합과 전체 합은 long long 범위를 사용합니다.',
      'relax':'실제 dist 변경과 반환값을 모두 검사합니다. INF에서 출발하거나 동률이면 갱신하지 않습니다.',
      'fib_memo':'n=0·1도 memo에 저장합니다. 계산한 상태를 재사용하고 F(90)을 정확히 반환합니다.',
      'domino':'빈 보드도 1가지입니다. m=1이면 n=0에서도 0입니다.',
      'make_one':'n=1은 0회, 나누어떨어지는 연산만 선택합니다.',
      'make_path':'시작 n과 끝 1을 포함합니다. 최적 후보 동률은 −1·÷2·÷3·÷5 순입니다.',
      'knapsack2':'빈 목록·용량 0은 0입니다. 선택 후보는 이전 행에서 가져옵니다.',
      'knapsack1':'용량을 내림차순으로 갱신하여 같은 물건을 여러 번 쓰지 않습니다.',
      'lcs_length':'빈 문자열 경계를 0으로 처리합니다. 부분 문자열이 아니라 부분 수열입니다.',
      'lcs_restore':'문자 불일치에서 위·왼쪽이 같으면 위로 갑니다. 빈 결과도 유효합니다.',
      'nonadjacent':'빈 선택을 허용하므로 빈 배열·모두 음수인 배열은 0입니다.',
      'grid_cost':'시작 칸은 전액입니다. 대각선 도착만 내림 절반이며 한 행·한 열도 처리합니다.',
    }[f]

if __name__=='__main__': build()
