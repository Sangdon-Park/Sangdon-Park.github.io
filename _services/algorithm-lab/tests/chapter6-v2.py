"""Independent checks for the two replaced public Chapter 6 tasks."""
from pathlib import Path
import json
import random
bank=json.loads((Path(__file__).resolve().parents[3]/'algorithm-lab/final-problems.json').read_text('utf8'))
chapter=[p for p in bank if p['chapter']==6]
assert [p['function'] for p in chapter]==['climb_stairs','max_subarray','make_one','knapsack2']
assert [p['id'] for p in chapter[:2]]==['F06-01-v2','F06-02-v2']
functions={}
for p in chapter[:2]:
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
print('Chapter 6: 13 enumerated stair inputs, 300 independent interval comparisons, negative-only and overflow boundaries passed.')
