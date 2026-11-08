"""Check that every active PPTX coding exercise has its numbered lab entry."""
from pathlib import Path
import json,re,zipfile,xml.etree.ElementTree as E

ROOT=Path(__file__).resolve().parents[3]
NS={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
bank=json.loads((ROOT/'algorithm-lab/exercise-problems.json').read_text(encoding='utf-8'))
files={2:'2장_연습문제_100문항_알고리즘작성형_수업용.pptx',**{c:f'{c}장_연습문제_100문항_수업용.pptx' for c in range(3,6)}}
for chapter,name in files.items():
    expected={}
    with zipfile.ZipFile(ROOT/'data/알고리즘'/name) as z:
        rels={e.get('Id'):e.get('Target') for e in E.fromstring(z.read('ppt/_rels/presentation.xml.rels'))}
        slides=E.fromstring(z.read('ppt/presentation.xml')).find('p:sldIdLst',NS)
        for page,slide in enumerate(slides,1):
            target=rels[slide.get('{'+NS['r']+'}id')]
            part=target.lstrip('/') if target.startswith('/') else 'ppt/'+target
            texts=[''.join(x.text or '' for x in p.findall('.//a:t',NS)) for p in E.fromstring(z.read(part)).findall('.//a:p',NS)]
            titles=[re.fullmatch(r'(\d+)\s+알고리즘 작성',t.strip()) for t in texts] if chapter==2 else [re.fullmatch(r'문제\s+(\d+)',t.strip()) for t in texts] if any('Python/C 구현' in t for t in texts) else []
            for match in filter(None,titles):
                number=int(match.group(1));assert number not in expected,(chapter,number,'duplicate PPTX question');expected[number]=page
    actual={p['exercise']:p for p in bank if p['chapter']==chapter}
    assert set(expected)==set(actual),(chapter,'missing',set(expected)-set(actual),'extra',set(actual)-set(expected))
    for number,page in expected.items():
        p=actual[number]
        assert p['sourceFile']==name and int(p['slides'])==page,(chapter,number,'wrong source')
        assert p['starter'] and p['c']['starter'] and p['tests'],(chapter,number,'incomplete coding entry')
    print(f'Chapter {chapter}: {len(expected)} / {len(expected)} PPTX coding exercises registered: '+', '.join(map(str,sorted(expected))))

# Chapters 6 and 7 teach two core tasks; their third task is a site-only challenge.
finals=json.loads((ROOT/'algorithm-lab/final-problems.json').read_text(encoding='utf-8'))
compact=lambda s:re.sub(r'\s+','',s)
for chapter in range(6,12):
    tasks=[p for p in finals if p['chapter']==chapter and p.get('slides') and p['id']!='F06-01-v3' and (not p.get('challenge') or p.get('practiceChallenge'))]
    assert len(tasks)==(2 if chapter in [6,7] else 4)
    with zipfile.ZipFile(ROOT/'data/알고리즘'/tasks[0]['sourceFile']) as z:
        rels={e.get('Id'):e.get('Target') for e in E.fromstring(z.read('ppt/_rels/presentation.xml.rels'))}
        ids=E.fromstring(z.read('ppt/presentation.xml')).find('p:sldIdLst',NS)
        pages=[];code_pages=[]
        for sid in ids:
            target=rels[sid.get('{'+NS['r']+'}id')]
            part=target.lstrip('/') if target.startswith('/') else 'ppt/'+target
            xml=E.fromstring(z.read(part))
            pages.append(''.join(t.text or '' for t in xml.findall('.//a:t',NS)))
            shapes=xml.findall('.//p:sp',NS)
            # The new Chapter 6 layout keeps each code line editable separately.
            code_shapes=[shape for shape in shapes
                if shape.find('p:nvSpPr/p:cNvPr',NS).get('name')=='code']
            if not code_shapes:
                code_shapes=sorted((shape for shape in shapes
                    if re.fullmatch(r'code-line-\d+',shape.find('p:nvSpPr/p:cNvPr',NS).get('name',''))),
                    key=lambda shape:int(shape.find('p:nvSpPr/p:cNvPr',NS).get('name').rsplit('-',1)[1]))
            code_pages.append('\n'.join(''.join(t.text or '' for t in shape.findall('.//a:t',NS))
                for shape in code_shapes))
        all_code=compact(''.join(code_pages))
        for p in tasks:
            first=int(p['slides'])-1
            expected=compact(p['solution']);collected=''
            assert code_pages[first],(p['id'],'source link does not point to code')
            for code in code_pages[first:]:
                collected+=compact(code)
                if len(collected)>=len(expected):break
            assert collected==expected,(p['id'],'Python slide parts mismatch')
            assert compact(p['c']['solution']) in all_code,(p['id'],'C code parts missing')
            assert p['displayId'] in ''.join(pages),(p['id'],'question number missing')
    if chapter==7:
        assert {p['id'] for p in tasks}=={'F07-02','F07-03'}
        assert not any(t in ''.join(pages) for t in ['7-1','7-4','permutation_count','nqueen_count'])
    print(f'Chapter {chapter}: {len(tasks)} lecture tasks, Python/C implementations and slide links match.')
