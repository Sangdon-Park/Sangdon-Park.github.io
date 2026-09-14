/* A separate worker keeps an accidental infinite loop out of the page UI. */
const BASE = 'https://cdn.jsdelivr.net/pyodide/v0.29.2/full/';
let py;
async function boot() {
  try {
    importScripts(BASE + 'pyodide.js');
    py = await loadPyodide({ indexURL: BASE });
    self.postMessage({type:'ready'});
  } catch (error) { self.postMessage({type:'boot-error', message:String(error)}); }
}
self.onmessage = async ({data}) => {
  if (!py) return;
  try {
    py.globals.set('_payload_json', JSON.stringify(data));
    const answer = py.runPython(`
import json, copy, math, contextlib, io, traceback
_payload = json.loads(_payload_json)
class _Quiet(io.StringIO):
    def write(self, text): return len(text)
class _Array:
    def __init__(self, values):
        self.values=values; self.reads=0; self.limit=2*len(values).bit_length()+2
    def __len__(self): return len(self.values)
    def __getitem__(self, i):
        if type(i) is not int: raise ValueError('슬라이싱 대신 정수 인덱스를 사용하세요.')
        if not 0<=i<len(self.values): raise IndexError('배열의 인덱스 범위를 벗어났습니다.')
        self.reads+=1
        if self.reads>self.limit: raise ValueError('원소 접근이 너무 많습니다. 탐색 구간을 절반씩 줄이세요.')
        return self.values[i]
    def __iter__(self): raise ValueError('전체 순회·복사 대신 A[i]와 len(A)를 사용하세요.')
def _equal(a,b):
    if isinstance(b,(list,tuple)):
        return isinstance(a,(list,tuple)) and len(a)==len(b) and all(_equal(x,y) for x,y in zip(a,b))
    if b is None: return a is None
    if _payload['problem'].get('numeric_output') and type(b) in (int,float):
        return type(a) in (int,float) and math.isfinite(a) and math.isclose(a,b,rel_tol=1e-9,abs_tol=1e-9)
    if type(b) is float: return type(a) in (int,float) and math.isfinite(a) and math.isclose(a,b,rel_tol=1e-9,abs_tol=1e-9)
    return type(a) is type(b) and a==b
def _brief(x):
    s=repr(x)
    return s if len(s)<230 else s[:227]+'...'
_report=[]
_namespace={'__builtins__':__builtins__}
try:
    with contextlib.redirect_stdout(_Quiet()), contextlib.redirect_stderr(_Quiet()):
        exec(compile(_payload['code'],'학생 답안','exec'),_namespace)
    _fn=_namespace.get(_payload['problem']['function'])
    if not callable(_fn): raise ValueError('함수 이름을 확인하세요: '+_payload['problem']['function'])
    for _i,_case in enumerate(_payload['cases']):
        _args=copy.deepcopy(_case['args']); _before=copy.deepcopy(_args)
        if _payload['problem'].get('indexed_only'): _args[0]=_Array(_args[0])
        try:
            with contextlib.redirect_stdout(_Quiet()), contextlib.redirect_stderr(_Quiet()):
                _actual=_fn(*_args)
            _ok=_equal(_actual,_case['expected']); _message=''
            if _payload['problem'].get('preserve_input') and _args!=_before:
                _ok=False; _message='입력 배열이 바뀌었습니다. 복사본을 사용하세요.'
            if not _ok and not _message: _message='예상 '+_brief(_case['expected'])+' / 반환 '+_brief(_actual)
        except NotImplementedError:
            _ok=False; _message='미작성: NotImplementedError를 지우고 함수의 내용을 작성하세요.'
        except Exception as _e:
            _ok=False; _message=type(_e).__name__+': '+str(_e)[:250]
        _report.append({'number':_i+1,'public':_case.get('public',False),'ok':_ok,'message':_message,'input':_brief(_case['args'])})
    _answer={'rows':_report,'passed':sum(r['ok'] for r in _report),'total':len(_report)}
except BaseException as _e:
    _answer={'error':type(_e).__name__+': '+str(_e)[:600]}
json.dumps(_answer,ensure_ascii=False)
`);
    self.postMessage({type:'result',token:data.token,report:JSON.parse(answer)});
  } catch(error) { self.postMessage({type:'result',token:data.token,report:{error:String(error)}}); }
};
boot();
