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
def _normalize_pasted_code(source):
    # Scan even syntactically invalid pasted code; preserve quoted text and comments.
    output = []
    total = 0
    i = 0
    while i < len(source):
        char = source[i]
        if char == '#':
            end = source.find(chr(10), i)
            if end < 0: end = len(source)
            output.append(source[i:end])
            i = end
            continue
        if char in (chr(34), chr(39)):
            delimiter = char * 3 if source.startswith(char * 3, i) else char
            end = i + len(delimiter)
            while end < len(source):
                if source[end] == chr(92):
                    end += 2
                elif source.startswith(delimiter, end):
                    end += len(delimiter)
                    break
                else:
                    end += 1
            output.append(source[i:end])
            i = end
            continue
        point = ord(char)
        if point in (160, 8199, 8239, 8287, 12288) or 8192 <= point <= 8202:
            output.append(' ')
            total += 1
        elif point in (8203, 65279):
            total += 1
        else:
            output.append(char)
        i += 1
    return ''.join(output), total
_payload['code'], _normalized_count = _normalize_pasted_code(_payload['code'])
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
        return type(a) in (int,float) and math.isfinite(a) and math.isclose(a,b,rel_tol=0 if 'tolerance' in _payload['problem'] else 1e-9,abs_tol=_payload['problem'].get('tolerance',1e-9))
    if type(b) is float: return type(a) in (int,float) and math.isfinite(a) and math.isclose(a,b,rel_tol=0,abs_tol=_payload['problem'].get('tolerance',1e-9))
    return type(a) is type(b) and a==b
def _brief(x):
    s=repr(x)
    return s if len(s)<230 else s[:227]+'...'
def _diagnostic(error):
    frames=[f for f in traceback.extract_tb(error.__traceback__) if f.filename=='학생 답안']
    syntax=isinstance(error,SyntaxError) and error.filename=='학생 답안'
    line=error.lineno if syntax else (frames[-1].lineno if frames else None)
    column=error.offset if syntax else None
    return {'line':line,'column':column,'file':'answer.py' if line else None,
            'severity':'error','message':type(error).__name__+': '+str(error)[:1000],
            'frames':[{'line':f.lineno,'name':f.name} for f in frames],
            'raw':''.join(traceback.format_exception(type(error),error,error.__traceback__))[:12000]}
_report=[]
_namespace={'__builtins__':__builtins__}
try:
    with contextlib.redirect_stdout(_Quiet()), contextlib.redirect_stderr(_Quiet()):
        exec(_payload['problem'].get('pythonPrelude',''),_namespace)
        exec(compile(_payload['code'],'학생 답안','exec'),_namespace)
    _fn=_namespace.get(_payload['problem']['function'])
    if not callable(_fn): raise ValueError('함수 이름을 확인하세요: '+_payload['problem']['function'])
    for _i,_case in enumerate(_payload['cases']):
        _args=copy.deepcopy(_case['args']); _before=copy.deepcopy(_args)
        _name=_payload['problem']['function']
        if _payload['problem'].get('exercise'):
            if _name=='fib_memo': _args.append([-1]*91)
            if _name=='make_path':
                _dp=[0]*(_args[0]+1)
                for _x in range(2,len(_dp)):
                    _dp[_x]=1+min([_dp[_x-1]]+[_dp[_x//_d] for _d in (2,3,5) if _x%_d==0])
                _args.append(_dp)
            if _name=='lcs_restore':
                _a,_b=_args; _dp=[[0]*(len(_b)+1) for _ in range(len(_a)+1)]
                for _x in range(1,len(_a)+1):
                    for _y in range(1,len(_b)+1):
                        _dp[_x][_y]=_dp[_x-1][_y-1]+1 if _a[_x-1]==_b[_y-1] else max(_dp[_x-1][_y],_dp[_x][_y-1])
                _args.append(_dp)
        if _payload['problem'].get('indexed_only'): _args[0]=_Array(_args[0])
        _detail=None
        try:
            with contextlib.redirect_stdout(_Quiet()), contextlib.redirect_stderr(_Quiet()):
                _actual=_fn(*_args)
            if 'outputArgument' in _payload['problem']: _actual=_args[_payload['problem']['outputArgument']]
            if _payload['problem'].get('exactInteger'):
                _actual=str(_actual) if type(_actual) is int else None
            _ok=_equal(_actual,_case['expected']); _message=''
            if 'after' in _case and _args[0]!=_case['after']:
                _ok=False; _message='반환값뿐 아니라 dist 배열의 갱신 결과도 확인하세요.'
            if any(str(_args[_case['mutationArg']][int(_k)])!=str(_v) for _k,_v in _case.get('mutationChecks',{}).items()):
                _ok=False; _message='반환값뿐 아니라 경로 압축 또는 memo 저장도 필요합니다.'
            if _payload['problem'].get('preserve_input') and _args!=_before:
                _ok=False; _message='입력 배열이 바뀌었습니다. 복사본을 사용하세요.'
            if not _ok and not _message: _message='예상 '+_brief(_case['expected'])+' / 반환 '+_brief(_actual)
        except NotImplementedError as _e:
            _detail=_diagnostic(_e)
            _ok=False; _message='미작성: NotImplementedError를 지우고 함수의 내용을 작성하세요.'
        except Exception as _e:
            _detail=_diagnostic(_e)
            _ok=False; _message=type(_e).__name__+': '+str(_e)[:250]
        _report.append({'number':_i+1,'public':_case.get('public',False),'ok':_ok,'message':_message,'input':_brief(_case['args']),'diagnostic':_detail})
    _answer={'rows':_report,'passed':sum(r['ok'] for r in _report),'total':len(_report)}
except BaseException as _e:
    _answer={'error':type(_e).__name__+': '+str(_e)[:600],'diagnostics':[_diagnostic(_e)]}
_answer['normalizedCode'] = _payload['code']
_answer['normalizedCount'] = _normalized_count
json.dumps(_answer,ensure_ascii=False)
`);
    self.postMessage({type:'result',token:data.token,report:JSON.parse(answer)});
  } catch(error) { self.postMessage({type:'result',token:data.token,report:{error:String(error)}}); }
};
boot();
