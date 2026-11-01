"""Independent checks for the four public Chapter 6 practice levels."""
from pathlib import Path
import json
import random
bank=json.loads((Path(__file__).resolve().parents[3]/'algorithm-lab/final-problems.json').read_text('utf8'))
chapter=[p for p in bank if p['chapter']==6]
assert [p['function'] for p in chapter]==['sum_to_n','climb_stairs','max_subarray','make_one']
assert [p['displayId'] for p in chapter]==['6-1','6-2','6-3','6-4']
assert [p['id'] for p in chapter]==['F06-01-v3','F06-01-v2','F06-02-v2','F06-03']
functions={}
for p in chapter:
    ns={};exec(p['solution'],ns);functions[p['function']]=ns[p['function']]
def enumerate_steps(left):
    if left==0:return [()]
    return [(step,)+path for step in (1,2) if step<=left for path in enumerate_steps(left-step)]
for n in range(13):assert functions['climb_stairs'](n)==len(enumerate_steps(n))
assert functions['climb_stairs'](46)==2971215073
assert functions['climb_stairs'](90)==4660046610375530309
rng=random.Random(6102)
for _ in range(300):
    a=[rng.randrange(-12,13) for _ in range(rng.randrange(1,13))]
    expected=max(sum(a[i:j]) for i in range(len(a)) for j in range(i+1,len(a)+1))
    assert functions['max_subarray'](a)==expected,a
assert functions['max_subarray']([-8,-3,-5])==-3
assert functions['max_subarray']([1000000]*3000)==3000000000
for n in [*range(257),9999,10000]:
    assert functions['sum_to_n'](n)==n*(n+1)//2
from collections import deque
for n in range(1,201):
    queue=deque([(n,0)]);seen={n}
    while queue:
        x,steps=queue.popleft()
        if x==1:break
        for nxt in [x-1]+[x//d for d in (2,3,5) if x%d==0]:
            if nxt not in seen:seen.add(nxt);queue.append((nxt,steps+1))
    assert functions['make_one'](n)==steps
print('Chapter 6: 259 sum checks, 13 stair enumerations, 300 interval comparisons and 200 independent shortest-path checks passed.')
