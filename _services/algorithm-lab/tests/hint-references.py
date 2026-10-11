"""Check every displayed Python hint reference using the real worker grader."""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
data = subprocess.check_output(['node', str(Path(__file__).with_name('hint-bank.mjs'))], cwd=ROOT)
bank = json.loads(data)
assert len(bank) == 72
worker = (ROOT / 'algorithm-lab/worker.js').read_text(encoding='utf-8')
grader = worker.split('const answer = py.runPython(`', 1)[1].split('`);', 1)[0]
total = 0
for p in bank:
    namespace = {'_payload_json': json.dumps({'problem': p, 'cases': p['tests'], 'code': p['solution']})}
    exec(compile(grader, 'worker.py', 'exec'), namespace)
    report = namespace['_answer']
    assert not report.get('error'), (p['id'], report)
    assert report['passed'] == len(p['tests']), (p['id'], report)
    total += report['passed']
print(f'All 72 displayed Python hint references passed {total} public/hidden worker cases.')
