"""Run the exact Python worker body with custom inputs and ordinary judging."""
import json, ast
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
lab=ROOT/'algorithm-lab'
problems=sum((json.loads((lab/(f+'.json')).read_text(encoding='utf-8')) for f in ['problems','chapter-02','exercise-problems']),[])
worker=(lab/'worker.js').read_text(encoding='utf-8').split('const answer = py.runPython(`',1)[1].split('`);',1)[0]
def run(p,code,args=None,mode='custom'):
    ns={'_payload_json':json.dumps({'mode':mode,'problem':p,'cases':[{'args':args if args is not None else next(t['args'] for t in p['tests'] if t['public'])}] if mode=='custom' else p['tests'],'code':code})}
    exec(compile(worker,'worker.py','exec'),ns)
    return ns['_answer']
count=0
for p in problems:
    if 'solution' not in p:continue
    r=run(p,p['solution'])
    assert not r.get('error'),(p['id'],r)
    assert 'custom' in r and 'passed' not in r and 'total' not in r,(p['id'],r)
    expected=next(t['expected'] for t in p['tests'] if t['public'])
    if p.get('exactInteger'):expected=int(expected)
    assert ast.literal_eval(r['custom']['value'])==expected,(p['id'],r,expected)
    count+=1
p=next(p for p in problems if p['id']=='P47')
r=run(p,'def first_index(a,x):\n    print("<debug>",a)\n    return a.index(x) if x in a else -1',[[7,2,2],2])
assert r['custom']['value']=='1' and r['custom']['stdout']=='<debug> [7, 2, 2]\n',r
r=run(p,'def first_index(a,x):\n    return -1',[[],3]);assert r['custom']['value']=='-1'
r=run(p,'def first_index(a,x):\n    print("before error")\n    return 1/0')
assert 'ZeroDivisionError' in r['error'] and r['custom']['stdout']=='before error\n' and r['diagnostics'],r
r=run(p,'def first_index(a,x):\n    print("x"*100000)\n    return 3');assert len(r['custom']['stdout'])==10000
r=run(p,'def first_index(a,x):\n    return',mode='judge');assert r['passed']==0 and 'custom' not in r
p=next(p for p in problems if p['function']=='insertion_sort')
r=run(p,p['solution'],[[9,1,3]]);assert r['custom']['value']=='[1, 3, 9]' and r['custom']['after'],r
print(f'Python: {count} reference functions, fresh and empty inputs, bounded stdout, runtime errors, mutated output and official judging passed.')
