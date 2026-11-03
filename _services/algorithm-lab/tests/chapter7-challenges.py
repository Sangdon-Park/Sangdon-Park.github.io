"""Real Python grader plus independent small-input checks, without production writes."""
import copy, importlib.util, itertools, json, pathlib, random
root=pathlib.Path(__file__).resolve().parents[3]
spec=importlib.util.spec_from_file_location('builder',root/'_services/algorithm-lab/build_chapter7_challenges.py')
builder=importlib.util.module_from_spec(spec);spec.loader.exec_module(builder)
bank=json.loads((root/'algorithm-lab/challenge-problems.json').read_text('utf8'))
grader=(root/'algorithm-lab/worker.js').read_text('utf8').split('const answer = py.runPython(`',1)[1].split('`);',1)[0]
assert [p['id'] for p in bank]==['F07-05','F07-06','F07-07']
assert all(p['practiceChallenge'] and p['challenge'] and not p['finalExam'] and p['slides'] is None for p in bank)
for p in bank:
    ns={'_payload_json':json.dumps({'problem':p,'cases':p['tests'],'code':p['solution']})}
    exec(compile(grader,'worker.py','exec'),ns)
    answer=ns['_answer']
    assert not answer.get('error') and answer['passed']==answer['total'],(p['id'],answer)
    ns={'_payload_json':json.dumps({'problem':p,'cases':p['tests'],'code':p['starter']})}
    exec(compile(grader,'worker.py','exec'),ns)
    assert ns['_answer'].get('error') or ns['_answer']['passed']<ns['_answer']['total']
    print(p['id'],answer['passed'],answer['total'])

funcs={}
for p in bank:
    ns={};exec(p['solution'],ns);funcs[p['function']]=ns[p['function']]
rng=random.Random(703)
comparisons=0
for _ in range(140):
    s=''.join(rng.choice('()?') for _ in range(2*rng.randint(1,5)))
    assert funcs['bracket_count'](s)==builder.bracket_oracle(s)
    rows,cols=rng.randint(1,4),rng.randint(1,4)
    g=[[rng.randint(0,1) for _ in range(cols)] for _ in range(rows)]
    saved=copy.deepcopy(g)
    assert funcs['maze_path_count'](g)==builder.maze_oracle(g) and g==saved
    solved=rng.choice(builder.SUDOKUS)
    b=[[solved[r][c] if rng.random()<.45 else 0 for c in range(4)] for r in range(4)]
    if rng.random()<.3:b[rng.randrange(4)][rng.randrange(4)]=rng.randint(1,4)
    saved=copy.deepcopy(b)
    assert funcs['sudoku4_count'](b)==builder.sudoku_oracle(b) and b==saved
    comparisons+=3
print(json.dumps({'graderCases':sum(len(p['tests']) for p in bank),'independentComparisons':comparisons,'inputPreserved':True}))
