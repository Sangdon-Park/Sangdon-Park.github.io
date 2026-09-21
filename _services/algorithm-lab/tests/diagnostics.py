"""Check actual worker diagnostics against known student source coordinates."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[3]
worker=(root/'algorithm-lab/worker.js').read_text(encoding='utf-8')
grader=worker.split('const answer = py.runPython(`',1)[1].split('`);',1)[0]
def run(code):
 scope={'_payload_json':json.dumps({'code':code,'problem':{'function':'solve'},'cases':[{'args':[1],'expected':1,'public':True}]})}
 exec(compile(grader,'worker.py','exec'),scope)
 return scope['_answer']
r=run('def solve(x):\n    return x +\n')
assert r['diagnostics'][0]['line']==2 and r['diagnostics'][0]['column']
r=run('def helper(x):\n    return 1 / 0\n\ndef solve(x):\n    return helper(x)\n')
d=r['rows'][0]['diagnostic']
assert d['line']==2 and [f['line'] for f in d['frames']]==[5,2]
assert 'ZeroDivisionError' in d['raw'] and d['file']=='answer.py'
r=run('def solve(x):\n    raise NotImplementedError\n')
assert r['rows'][0]['diagnostic']['line']==2
r=run('def other(x):\n    return x\n')
assert r['diagnostics'][0]['line'] is None
r=run('def solve(x):\n    return x\n')
assert r['passed']==1 and r['rows'][0]['diagnostic'] is None
print('Python syntax, runtime, nested calls, unfinished answer, missing function, and success diagnostics passed.')
