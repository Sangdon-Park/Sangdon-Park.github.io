"""Exercise references, actual Python worker, and wrong-answer regressions."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
problems=json.loads((ROOT/'algorithm-lab/exercise-problems.json').read_text(encoding='utf-8'))
grader=(ROOT/'algorithm-lab/worker.js').read_text(encoding='utf-8').split('const answer = py.runPython(`',1)[1].split('`);',1)[0]
def run(p,code):
    ns={'_payload_json':json.dumps({'problem':p,'cases':p['tests'],'code':code})}
    exec(compile(grader,'worker.py','exec'),ns)
    return ns['_answer']
total=0
for p in problems:
    r=run(p,p['solution'])
    assert not r.get('error'),(p['id'],r)
    assert r['passed']==r['total'],(p['id'],[x for x in r['rows'] if not x['ok']])
    total+=r['passed']
bad={
 'fibonacci':'def fibonacci(n):\n    a,b=0,1\n    for _ in range(n): a,b=b,a+b\n    return a+1 if n==90 else a',
 'insertion_sort':'def insertion_sort(a):\n    return sorted(a)',
 'dsu_find':'def dsu_find(parent,x):\n    while parent[x]!=x: x=parent[x]\n    return x',
 'relax':'def relax(dist,u,v,w):\n    return int(dist[u]<10**18 and dist[u]+w<dist[v])',
 'fib_memo':'def fib_memo(n,memo):\n    a,b=0,1\n    for _ in range(n): a,b=b,a+b\n    return a',
}
for name,code in bad.items():
    r=run(next(p for p in problems if p['function']==name),code)
    assert r['passed']<r['total'],(name,'wrong answer accepted')
print(f'{len(problems)} Python references / {total} cases passed; {len(bad)} incorrect answers rejected.')
