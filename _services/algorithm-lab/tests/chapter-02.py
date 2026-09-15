"""Run all reference answers through the actual Python worker's grading code."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
problems = json.loads((ROOT / 'algorithm-lab/chapter-02.json').read_text(encoding='utf-8'))
worker = (ROOT / 'algorithm-lab/worker.js').read_text(encoding='utf-8')
grader = worker.split('const answer = py.runPython(`', 1)[1].split('`);', 1)[0]
total = 0
for problem in problems:
    namespace = {'_payload_json': json.dumps({'problem': problem, 'cases': problem['tests'], 'code': problem['solution']})}
    exec(compile(grader, 'worker.py', 'exec'), namespace)
    report = namespace['_answer']
    assert not report.get('error'), (problem['id'], report)
    assert report['passed'] == len(problem['tests']), (problem['id'], report)
    total += report['passed']
print(f'Passed {total} Python cases across {len(problems)} chapter-two exercises.')
