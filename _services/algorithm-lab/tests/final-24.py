import json,pathlib,itertools,random
root=pathlib.Path(__file__).resolve().parent
bank=json.loads((root.parent.parent.parent/'algorithm-lab/final-problems.json').read_text('utf8'))
grader=(root.parent.parent.parent/'algorithm-lab/worker.js').read_text('utf8').split('const answer = py.runPython(`',1)[1].split('`);',1)[0]
report=[]
for p in bank:
 ns={'_payload_json':json.dumps({'problem':p,'cases':p['tests'],'code':p['solution']})}
 exec(compile(grader,'worker.py','exec'),ns)
 r=ns['_answer'];assert not r.get('error'),(p['id'],r)
 assert r['passed']==r['total'],(p['id'],r)
 report.append({'id':p['id'],'passed':r['passed'],'total':r['total']})
 bad={'_payload_json':json.dumps({'problem':p,'cases':p['tests'],'code':p['starter']})}
 exec(compile(grader,'worker.py','exec'),bad)
 assert bad['_answer'].get('error') or bad['_answer']['passed']<bad['_answer']['total'],(p['id'],'unfinished answer accepted')
 print(p['id'],r['passed'],r['total'])
# Compare optimized implementations with independent enumeration on small inputs.
solutions={}
for p in bank:
 ns={};exec(p['solution'],ns);solutions[p['function']]=ns[p['function']]
rng=random.Random(61111);random_count=0
for _ in range(40):
 n=rng.randrange(1,7)
 a=[rng.randrange(1,8) for _ in range(n)];target=rng.randrange(0,20)
 expected=sum(sum(a[i] for i in range(n) if mask>>i&1)==target for mask in range(1<<n))
 assert solutions['subset_sum_count'](a,target)==expected;random_count+=1
 cost=[[rng.randrange(0,10) for _ in range(n)] for _ in range(n)]
 expected=min(sum(cost[r][order[r]] for r in range(n)) for order in itertools.permutations(range(n)))
 assert solutions['assignment_min'](cost)==expected;random_count+=1
 dist=[[0 if i==j else rng.randrange(0,10) for j in range(n)] for i in range(n)]
 tours=[(0,)+p for p in itertools.permutations(range(1,n))]
 def route_cost(route):return sum(dist[route[i]][route[(i+1)%n]] for i in range(n))
 expected=min(map(route_cost,tours));assert solutions['tsp_min'](dist)==expected;random_count+=1
 route=list(rng.choice(tours));near=[route[:]]
 for i in range(1,n):
  for j in range(i+1,n):
   candidate=route[:];candidate[i],candidate[j]=candidate[j],candidate[i];near.append(candidate)
 assert solutions['best_swap_cost'](dist,route)==min(map(route_cost,near));random_count+=1
result={'cases':sum(r['total'] for r in report),'randomComparisons':random_count,'problems':report}
print(json.dumps({'cases':result['cases'],'random':random_count}))
