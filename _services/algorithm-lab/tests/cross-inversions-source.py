"""Keep the clarified inversion question, native slides and public lab consistent."""
import hashlib
import json
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sources = json.loads((ROOT / '_services/algorithm-lab/exercise-source.json').read_text(encoding='utf-8'))
bank = json.loads((ROOT / 'algorithm-lab/exercise-problems.json').read_text(encoding='utf-8'))
source = next(p for p in sources if p['id'] == 'P66')
problem = next(p for p in bank if p['id'] == 'P66')
deck = ROOT / 'data/알고리즘' / source['file']
ns = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
      'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}

def shape_text(archive, slide, shape_name):
    tree = ET.fromstring(archive.read(f'ppt/slides/slide{slide}.xml'))
    shape = next(s for s in tree.findall('.//p:sp', ns)
                 if s.find('.//p:cNvPr', ns).get('name') == shape_name)
    return '\n'.join(''.join(t.text or '' for t in p.findall('.//a:t', ns))
                     for p in shape.findall('p:txBody/a:p', ns))

with zipfile.ZipFile(deck) as archive:
    assert source['question'] == shape_text(archive, 217, 'text-178-64')
    assert source['answer'] == shape_text(archive, 218, 'text-372.4-64')
    for slide in (217, 218):
        notes = ET.fromstring(archive.read(f'ppt/notesSlides/notesSlide{slide}.xml'))
        spoken = ''.join(t.text or '' for t in notes.findall('.//a:t', ns))
        assert len(spoken) > 450, f'Slide {slide} needs a full spoken explanation'
        assert '역전 쌍' in spoken

assert problem['statement'] == source['question'] + '\n\n' + source['requirements']
assert problem['c']['statement'] == problem['statement']
assert problem['hint'] == problem['study']['method'] == source['answer']
for wording in ('원래 배열', '앞의 수', '뒤의 수', '각각 오름차순', '같은 값은 세지',
                '(4,2), (4,3), (7,2), (7,3)', '한쪽이 비면 0'):
    assert wording in source['question'], wording
digest = hashlib.sha256(deck.read_bytes()).hexdigest()
assert all(p['sha256'] == digest for p in sources if p['file'] == source['file'])
assert all(p['sourceHash'] == digest for p in bank if p['sourceFile'] == source['file'])
assert problem['tests'][0]['args'] == [[1, 4, 7], [2, 3, 8]]
assert problem['tests'][0]['expected'] == 4
assert any(t['args'] == [[2, 2], [2]] and t['expected'] == 0 for t in problem['tests'])
assert any(not t['args'][0] and t['expected'] == 0 for t in problem['tests'])
print('P66: native question/explanation/notes, example pairs, equality, empty input and source hashes passed.')
