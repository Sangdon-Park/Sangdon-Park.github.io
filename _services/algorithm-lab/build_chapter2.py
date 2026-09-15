"""Rebuild chapter 2 content and runnable C examples from the lecture mapping.

Run from the repository root. Reference implementations are also used by the
cross-language regression runner; tests include independent golden examples.
"""
import itertools as it
import json
import math
from pathlib import Path
from textwrap import dedent

ROOT = Path(__file__).resolve().parents[2]
problems = []


def add(number, title, en_title, slides, section, params, statement, en_statement,
        hint, en_hint, signature, result, en_result, ccode, python, cases,
        output="scalar", width=0, capacity=0, level="기본"):
    pid = f"P{number:02}"
    name = signature.split("(")[0].split()[-1]
    pycode = dedent(python).strip() + "\n"
    namespace = {}
    exec(pycode, namespace)
    tests = []
    for i, case in enumerate(cases):
        args, *gold = case
        actual = namespace[name](*args)
        if gold:
            assert actual == gold[0], (pid, args, actual, gold)
        tests.append({"args": args, "expected": actual, "public": i < 2})
    ccode = dedent(ccode).strip() + "\n"
    tail = "" if signature.startswith("void ") else "  return 0;\n"
    starter = signature + " {\n  // TODO: 문제 설명에 따라 구현하세요.\n" + tail + "}\n"
    c = {"signature": signature, "starter": starter,
         "statement": statement, "hint": hint, "result": result,
         "solution": ccode, "output": output, "width": width, "capacity": capacity}
    problems.append({"id": pid, "chapter": 2, "title": title, "section": section,
      "slides": slides, "level": level, "function": name, "params": params,
      "statement": statement, "hint": hint,
      "starter": f"def {name}({', '.join(params)}):\n    # 여기에 코드를 작성하세요.\n    raise NotImplementedError\n",
      "solution": pycode, "tests": tests, "c": c,
      "en": {"title": en_title, "section": "Brute force", "level": "Practice",
        "statement": en_statement, "hint": en_hint,
        "c": {"statement": en_statement, "hint": en_hint, "result": en_result}}})


add(13, "네 자리 자물쇠", "Four-digit lock", "7", "2.1 완전 탐색", ["secret"],
    "0000부터 9999까지 순서대로 시도합니다. secret을 찾을 때까지의 시도 횟수를 반환하세요. 0000도 첫 번째 시도로 셉니다.\nsecret은 정확히 네 자리 숫자 문자열이며 앞자리 0을 유지합니다. 네 개의 반복문으로 각 자리를 생성해 보세요.",
    "Try codes from 0000 through 9999 in order. Return the number of attempts including the successful attempt. secret is a four-digit string; preserve leading zeros. Generate each digit with four nested loops.",
    "C에서는 char attempt[5]에 네 자리와 끝의 '\\0'을 저장하고 strcmp로 비교합니다. break는 가장 안쪽 반복문만 끝냅니다.",
    "In C use char attempt[5], a terminating '\\0', and strcmp. A break exits only the innermost loop.",
    "int lock_attempts(const char secret[])", "return = 시도 횟수", "return = attempt count",
    '''int lock_attempts(const char secret[]) {
  int count = 0;
  for (int a = 0; a < 10; a++)
    for (int b = 0; b < 10; b++)
      for (int c = 0; c < 10; c++)
        for (int d = 0; d < 10; d++) {
          char attempt[5] = {'0'+a, '0'+b, '0'+c, '0'+d, '\\0'};
          count++;
          if (strcmp(attempt, secret) == 0) return count;
        }
  return 0;
}''', '''
def lock_attempts(secret):
    count = 0
    for a in range(10):
        for b in range(10):
            for c in range(10):
                for d in range(10):
                    count += 1
                    if f"{a}{b}{c}{d}" == secret:
                        return count
''', [(["8234"], 8235), (["0000"], 1), (["9999"], 10000), (["0007"], 8), (["0100"], 101), (["1000"], 1001)])

add(14, "약수 모두 찾기", "List all divisors", "10", "2.2 단일 반복문", ["n"],
    "정수 n의 양의 약수를 오름차순으로 구하세요. 1 ≤ n ≤ 10,000. 1부터 n까지 직접 나누어 확인합니다.\nPython: 약수 리스트 반환. C: out에 약수를 저장하고 개수를 반환합니다.",
    "Find every positive divisor of n in ascending order by checking 1 through n. 1 <= n <= 10,000. Python returns a list. C writes divisors to out and returns their count.",
    "n % i == 0일 때 결과에 추가합니다. n 자체도 포함해야 합니다.", "Append i when n % i == 0. Include n itself.",
    "int find_divisors(int n, int out[])", "out[0..개수-1] = 약수, return = 개수 (용량 10,000)", "out = divisors, return = count (capacity 10,000)",
    '''int find_divisors(int n, int out[]) {
  int count = 0;
  for (int i = 1; i <= n; i++)
    if (n % i == 0) out[count++] = i;
  return count;
}''', '''
def find_divisors(n):
    return [i for i in range(1, n + 1) if n % i == 0]
''', [([10], [1, 2, 5, 10]), ([1], [1]), ([13],), ([36],), ([10000],), ([97],)], "list", capacity=10000)

add(15, "합이 K인 두 수", "Pairs with a target sum", "11", "2.2 이중 반복문", ["A", "target"],
    "i < j인 모든 인덱스 쌍을 순회하여 A[i]+A[j]가 target인 [A[i], A[j]]를 구하세요. i, j 오름차순의 탐색 순서를 유지합니다. 값이 같아도 인덱스가 다르면 별개의 쌍입니다.\n0 ≤ n ≤ 30, 원소와 target은 -1000~1000. Python: 쌍 리스트. C: out 각 행에 쌍 저장 후 행 수 반환.",
    "Enumerate i < j in index order. Return [A[i], A[j]] when their sum equals target. Equal values at different indices are separate pairs. 0 <= n <= 30; values and target are within -1000..1000. Python returns rows; C writes rows to out and returns their count.",
    "j를 i+1부터 시작하면 자기 자신과의 쌍, 역순 중복을 제외할 수 있습니다.", "Start j at i + 1 to exclude self-pairs and reversed duplicates.",
    "int find_pairs(const int A[], int n, int target, int out[][2])", "out[][2] = 값의 쌍, return = 행 수 (최대 435)", "out[][2] = value pairs, return = rows (max 435)",
    '''int find_pairs(const int A[], int n, int target, int out[][2]) {
  int count = 0;
  for (int i = 0; i < n; i++)
    for (int j = i + 1; j < n; j++)
      if (A[i] + A[j] == target) {
        out[count][0] = A[i]; out[count++][1] = A[j];
      }
  return count;
}''', '''
def find_pairs(A, target):
    return [[A[i], A[j]] for i in range(len(A)) for j in range(i+1, len(A)) if A[i]+A[j] == target]
''', [([[1,3,5,7,9],10], [[1,9],[3,7]]), ([[5,5,5],10], [[5,5]]*3), ([[],0], []), ([[1],2], []), ([[-3,0,3,3],0],), ([[2,4],1],), ([[0]*30,0],)], "rows", 2, 435)

add(16, "세 주사위의 합", "Three dice", "12", "2.2 삼중 반복문", ["target"],
    "서로 구별하는 세 주사위(각 1~6)의 합이 target인 [d1,d2,d3]를 사전순으로 모두 구하세요. 순서가 다르면 다른 결과입니다. 0 ≤ target ≤ 20.\nPython은 리스트를 반환하고 C는 out에 저장 후 행 수를 반환합니다.",
    "List ordered triples of three distinguishable six-sided dice whose sum is target, in lexicographic order. 0 <= target <= 20. Python returns a list; C writes out and returns the number of rows.",
    "각 반복문을 1부터 6까지 독립적으로 순회합니다. 합 10의 결과는 27개입니다.", "Each loop independently runs from 1 to 6. Target 10 has 27 results.",
    "int dice_sum(int target, int out[][3])", "out[][3] = 주사위 눈, return = 행 수 (용량 216)", "out[][3] = dice faces, return = rows (capacity 216)",
    '''int dice_sum(int target, int out[][3]) {
  int count = 0;
  for (int a = 1; a <= 6; a++)
    for (int b = 1; b <= 6; b++)
      for (int c = 1; c <= 6; c++)
        if (a+b+c == target) {
          out[count][0]=a; out[count][1]=b; out[count++][2]=c;
        }
  return count;
}''', '''
def dice_sum(target):
    return [[a,b,c] for a in range(1,7) for b in range(1,7) for c in range(1,7) if a+b+c==target]
''', [([4], [[1,1,2],[1,2,1],[2,1,1]]), ([18], [[6,6,6]]), ([10],), ([0], []), ([20], []), ([3], [[1,1,1]])], "rows", 3, 216)

add(17, "세 장 선택하기", "Choose three cards", "18", "2.4 조합의 반복문", ["A"],
    "배열에서 서로 다른 세 인덱스 i<j<k를 골라 [A[i],A[j],A[k]]를 모두 구하세요. i,j,k의 탐색 순서대로 저장합니다. 0 ≤ n ≤ 10, 원소 -1000~1000. 같은 값도 인덱스가 다르면 다른 카드입니다.",
    "List all [A[i],A[j],A[k]] with i < j < k in index traversal order. 0 <= n <= 10; values -1000..1000. Equal values at different indices represent different cards.",
    "j=i+1, k=j+1로 시작합니다. 원소가 세 개보다 적으면 결과는 빈 목록입니다.", "Start j at i+1 and k at j+1. Fewer than three cards produce an empty list.",
    "int choose_three(const int A[], int n, int out[][3])", "out[][3] = 세 장, return = 행 수 (최대 120)", "out[][3] = triples, return = rows (max 120)",
    '''int choose_three(const int A[], int n, int out[][3]) {
  int count=0;
  for(int i=0;i<n;i++) for(int j=i+1;j<n;j++) for(int k=j+1;k<n;k++) {
    out[count][0]=A[i]; out[count][1]=A[j]; out[count++][2]=A[k];
  }
  return count;
}''', '''
def choose_three(A):
    from itertools import combinations
    return [list(c) for c in combinations(A,3)]
''', [([[1,2,3,4]], [[1,2,3],[1,2,4],[1,3,4],[2,3,4]]), ([[7,7,7]], [[7,7,7]]), ([[]], []), ([[1,2]], []), ([list(range(10))],), ([[-3,4,0,2]],)], "rows", 3, 120)

for number, perm in [(18, True), (19, False)]:
    fname = "make_permutations" if perm else "make_combinations"
    label = "순열" if perm else "조합"
    selection = "순서가 다르면 다른 경우입니다. 같은 인덱스는 한 번만 사용합니다." if perm else "선택한 인덱스가 증가하도록 하여 순서만 다른 중복을 제외합니다."
    recur = '''for (int i=0; i<n; i++) {
    if (used[i]) continue;
    used[i]=1; path[depth]=A[i];
    perm_visit(A,n,r,depth+1,used,path,out,count);
    used[i]=0;
  }''' if perm else '''for (int i=start; i<n; i++) {
    path[depth]=A[i];
    comb_visit(A,n,r,depth+1,i+1,path,out,count);
  }'''
    helper = "perm_visit(const int A[], int n, int r, int depth, int used[], int path[], int out[][6], int *count)" if perm else "comb_visit(const int A[], int n, int r, int depth, int start, int path[], int out[][6], int *count)"
    call = "int used[6]={0}; perm_visit(A,n,r,0,used,path,out,&count);" if perm else "comb_visit(A,n,r,0,0,path,out,&count);"
    add(number, f"직접 만드는 r개 {label}", "Generate r-permutations" if perm else "Generate r-combinations", "19, 21" if perm else "20–21", "2.4 순열과 조합", ["A", "r"],
      f"배열 A에서 r개를 고른 {label}을 모두 만드세요. {selection} 입력 인덱스 순서로 탐색합니다.\n0 ≤ r ≤ n ≤ 6. 원소는 서로 다른 -1000~1000 정수입니다. r=0이면 빈 선택 하나([[]])입니다. C의 out 행 너비는 6이며 앞의 r칸만 사용합니다.",
      f"Generate all {'permutations' if perm else 'combinations'} of r elements, following input index order. {'Order matters; never reuse an index.' if perm else 'Indices must increase to avoid order duplicates.'} 0 <= r <= n <= 6, distinct integer values within -1000..1000. r=0 produces one empty choice ([[]]). C out has row width 6; use the first r entries.",
      "재귀 깊이가 r이면 선택을 저장합니다. " + ("used 배열로 사용 여부를 표시하고 재귀가 끝나면 해제합니다." if perm else "다음 탐색의 시작 인덱스를 i+1로 전달합니다."),
      "Save a row at depth r. " + ("Mark indices in used, then unmark them after recursion." if perm else "Pass i+1 as the next starting index."),
      f"int {fname}(const int A[], int n, int r, int out[][6])", "out[][6] = 선택 결과, return = 행 수 (최대 720)", "out[][6] = choices, return = rows (max 720)",
      f'''static void {helper} {{
  if (depth==r) {{
    for(int j=0;j<r;j++) out[*count][j]=path[j];
    (*count)++; return;
  }}
  {recur}
}}
int {fname}(const int A[], int n, int r, int out[][6]) {{
  int path[6]={{0}}, count=0;
  {call}
  return count;
}}''', f'''
def {fname}(A, r):
    from itertools import {'permutations' if perm else 'combinations'}
    return [list(c) for c in {'permutations' if perm else 'combinations'}(A,r)]
''', [([[1,2,3],2],), ([[1,2],0], [[]]), ([[],0], [[]]), ([[9],1], [[9]]), ([[3,1,2],3],), ([list(range(6)),6],), ([[5,4,3,2],1],)], "rows", 6, 720)

add(20, "1·2·3 비밀번호 후보", "Password permutations", "22", "예제 2.1", ["A"],
    "서로 다른 세 숫자 A를 한 번씩 사용한 세 자리 비밀번호 후보를 정수 목록으로 반환하세요. A의 인덱스 순서로 탐색합니다. 각 숫자는 1~9입니다.\n예: [1,2,3] → [123,132,213,231,312,321]. C는 out에 저장 후 개수를 반환합니다.",
    "Use three distinct digits from 1..9 exactly once to form all three-digit passwords, in input-index traversal order. Example: [1,2,3] -> [123,132,213,231,312,321]. C writes out and returns the count.",
    "서로 다른 i,j,k만 사용하고 100*A[i]+10*A[j]+A[k]로 조립합니다.", "Use distinct i,j,k and build 100*A[i]+10*A[j]+A[k].",
    "int password_candidates(const int A[], int n, int out[])", "out = 비밀번호 6개, return = 6", "out = six passwords, return = 6",
    '''int password_candidates(const int A[], int n, int out[]) {
  int count=0;
  for(int i=0;i<n;i++) for(int j=0;j<n;j++) for(int k=0;k<n;k++)
    if(i!=j && i!=k && j!=k) out[count++]=100*A[i]+10*A[j]+A[k];
  return count;
}''', '''
def password_candidates(A):
    from itertools import permutations
    return [100*a+10*b+c for a,b,c in permutations(A)]
''', [([[1,2,3]], [123,132,213,231,312,321]), ([[3,2,1]], [321,312,231,213,132,123]), ([[7,8,9]],), ([[2,4,6]],)], "list", capacity=6)

add(21, "아이스크림 두 가지 맛", "Two-flavor menus", "23", "예제 2.2", ["n"],
    "맛 번호 0부터 n-1까지 중 서로 다른 두 맛을 고릅니다. 순서가 달라도 같은 메뉴이므로 [i,j], i<j를 오름차순으로 반환하세요.\n0 ≤ n ≤ 20. 강의 예의 0=초코, 1=바닐라, 2=딸기, 3=멜론입니다. C는 out 각 행에 번호를 저장하고 행 수를 반환합니다.",
    "Choose two distinct flavor IDs from 0 through n-1. Return pairs [i,j] with i<j in index order; reversed pairs are the same menu. 0<=n<=20. For the lecture, 0=chocolate, 1=vanilla, 2=strawberry, 3=melon. C writes rows and returns their count.",
    "n개 중 2개를 고르면 n*(n-1)/2개의 메뉴가 만들어집니다.", "There are n*(n-1)/2 distinct menus.",
    "int icecream_menus(int n, int out[][2])", "out[][2] = 맛 번호, return = 메뉴 수 (최대 190)", "out[][2] = flavor IDs, return = count (max 190)",
    '''int icecream_menus(int n, int out[][2]) {
  int count=0;
  for(int i=0;i<n;i++) for(int j=i+1;j<n;j++) {
    out[count][0]=i; out[count++][1]=j;
  }
  return count;
}''', '''
def icecream_menus(n):
    return [[i,j] for i in range(n) for j in range(i+1,n)]
''', [([4], [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]), ([1], []), ([0], []), ([2], [[0,1]]), ([20],)], "rows", 2, 190)

add(22, "문자열의 모든 일치 위치", "All string matches", "25–26", "2.5 문자열 매칭", ["text", "pattern"],
    "text에서 pattern이 나타나는 시작 인덱스를 모두 반환하세요. 인덱스는 0부터이며 겹치는 일치도 포함합니다. 문자열은 ASCII 영문자와 공백으로 구성됩니다. 0 ≤ text 길이 ≤ 200, 1 ≤ pattern 길이 ≤ 50. 대소문자를 구분합니다. C는 out에 인덱스 저장 후 개수 반환.",
    "Return all zero-based start indices where pattern occurs in text, including overlaps. Inputs contain ASCII letters and spaces, case-sensitive. Text length 0..200, pattern length 1..50. C writes indices to out and returns the count.",
    "시작 위치 i는 n-m까지입니다. C의 strlen 결과는 int에 담아 m>n일 때 음수 범위를 안전하게 처리하세요.", "Try starting positions through n-m inclusive. In C convert strlen results to int so m>n is handled safely.",
    "int bf_string_match(const char text[], const char pattern[], int out[])", "out = 시작 인덱스, return = 개수 (용량 201)", "out = start indices, return = count (capacity 201)",
    '''int bf_string_match(const char text[], const char pattern[], int out[]) {
  int n=(int)strlen(text), m=(int)strlen(pattern), count=0;
  for(int i=0;i<=n-m;i++) {
    int j=0;
    while(j<m && text[i+j]==pattern[j]) j++;
    if(j==m) out[count++]=i;
  }
  return count;
}''', '''
def bf_string_match(text, pattern):
    return [i for i in range(len(text)-len(pattern)+1) if text[i:i+len(pattern)]==pattern]
''', [(["ababcabcababd","abc"], [2,5]), (["aaaa","aa"], [0,1,2]), (["","A"], []), (["ab","abc"], []), (["HELLO WORLD","LLO"], [2]), (["AbA","a"], []), (["abcabc","abc"], [0,3]), (["a b a"," "], [1,3])], "list", capacity=201)

add(23, "가장 가까운 두 수", "Closest pair of numbers", "27", "2.5 최솟값 갱신", ["A"],
    "모든 i<j를 조사하여 절댓값 차이가 최소인 두 수와 차이를 [A[i],A[j],차이]로 구하세요. 동점이면 인덱스 순회에서 처음 발견한 쌍을 유지합니다.\n2 ≤ n ≤ 100, 원소는 -2,000,000,000~2,000,000,000. C는 long long으로 변환한 뒤 뺄셈하고 out[3]에 저장합니다.",
    "Find the pair with the smallest absolute difference among i<j. Return [A[i],A[j],difference], keeping the first encountered pair on ties. 2<=n<=100; values -2,000,000,000..2,000,000,000. C casts before subtracting and writes long long out[3].",
    "C: llabs((long long)A[i]-A[j]). 갱신 조건은 <=가 아닌 <입니다.", "C: llabs((long long)A[i]-A[j]). Update with <, not <=.",
    "void closest_pair(const int A[], int n, long long out[3])", "out[0]=첫 값, out[1]=둘째 값, out[2]=최소 차이", "out = [first value, second value, minimum difference]",
    '''void closest_pair(const int A[], int n, long long out[3]) {
  out[2]=LLONG_MAX;
  for(int i=0;i<n;i++) for(int j=i+1;j<n;j++) {
    long long diff=llabs((long long)A[i]-A[j]);
    if(diff<out[2]) { out[0]=A[i]; out[1]=A[j]; out[2]=diff; }
  }
}''', '''
def closest_pair(A):
    i,j=min(((i,j) for i in range(len(A)) for j in range(i+1,len(A))), key=lambda ij: abs(A[ij[0]]-A[ij[1]]))
    return [A[i], A[j], abs(A[i]-A[j])]
''', [([[10,3,22,15,17,9]], [10,9,1]), ([[3,1,5]], [3,1,2]), ([[7,7]], [7,7,0]), ([[-2000000000,2000000000]], [-2000000000,2000000000,4000000000]), ([[-4,-9,-5]],), ([[0,5,0]],)], "fixed", 3)

add(24, "비트마스크로 모든 부분집합", "Power set with bitmasks", "28, 33", "2.5 부분집합", ["A"],
    "마스크 0부터 2^n-1까지 순회하여 부분집합을 만드세요. 각 부분집합 안에서는 원래 인덱스 순서를 유지합니다. 공집합도 포함합니다.\n0 ≤ n ≤ 8, 서로 다른 -1000~1000 정수. Python: 중첩 리스트. C: out[mask]에 원소를, sizes[mask]에 개수를 저장하고 전체 부분집합 수를 반환합니다.",
    "Generate subsets for masks 0 through 2^n-1, preserving input order within each subset. Include the empty set. 0<=n<=8, distinct integers -1000..1000. Python returns nested lists. C fills out[mask], stores lengths in sizes[mask], and returns the total count.",
    "mask & (1u << j)가 참이면 A[j]를 선택합니다. 부분집합 수는 2^n, 모든 원소 검사까지 포함하면 O(n*2^n)입니다.", "Select A[j] when mask & (1u << j) is nonzero. There are 2^n subsets; scanning all bits costs O(n*2^n).",
    "int power_set(const int A[], int n, int out[][8], int sizes[])", "out[][8], sizes[] = 부분집합과 길이, return = 개수 (최대 256)", "out[][8], sizes[] = subsets and lengths; return = count (max 256)",
    '''int power_set(const int A[], int n, int out[][8], int sizes[]) {
  int count=1<<n;
  for(int mask=0;mask<count;mask++) {
    sizes[mask]=0;
    for(int j=0;j<n;j++) if(mask & (1u<<j))
      out[mask][sizes[mask]++]=A[j];
  }
  return count;
}''', '''
def power_set(A):
    return [[x for j,x in enumerate(A) if mask & (1<<j)] for mask in range(1<<len(A))]
''', [([[1,2,3]], [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]), ([[]], [[]]), ([[9]], [[],[9]]), ([[-1,0]],), ([list(range(8))],)], "subsets", 8, 256)

add(25, "탐색 공간 계산", "Count the search space", "30–32, 54–55", "2.6 조합적 폭발", ["n"],
    "[n!, 2^n, n^n]을 계산하세요. 1 ≤ n ≤ 12. 실제 순열을 생성하지 말고 정수 곱셈으로 계산합니다.\nC에서는 long long out[3]에 저장합니다. C의 ^는 거듭제곱이 아니라 XOR입니다.",
    "Calculate [n!, 2^n, n^n] using integer multiplication without generating permutations. 1<=n<=12. C writes long long out[3]. In C, ^ means XOR, not exponentiation.",
    "곱셈 누적값은 1부터 시작합니다. C의 int 범위를 넘는 결과가 있으므로 long long을 사용합니다.", "Start each product at 1. Use long long in C because results can exceed int range.",
    "void search_space(int n, long long out[3])", "out = [n!, 2^n, n^n]", "out = [n!, 2^n, n^n]",
    '''void search_space(int n, long long out[3]) {
  out[0]=out[1]=out[2]=1;
  for(int i=1;i<=n;i++) {
    out[0]*=i; out[1]*=2; out[2]*=n;
  }
}''', '''
def search_space(n):
    from math import factorial
    return [factorial(n), 2**n, n**n]
''', [([5], [120,32,3125]), ([1], [1,2,1]), ([10], [3628800,1024,10000000000]), ([12],), ([2],)], "fixed", 3)

add(26, "외판원 순회 최소 비용", "Traveling salesperson", "34", "예제 2.4", ["dist"],
    "도시 0에서 출발해 나머지 도시를 정확히 한 번씩 방문한 뒤 0으로 돌아오는 최소 비용을 구하세요. dist[i][j]는 이동 비용입니다.\n2 ≤ n ≤ 8, 대각선 0, 나머지 비용 1~1000. 비대칭 비용도 가능합니다. C의 dist 행 너비는 8입니다.\n출발점을 고정하면 방문 순서는 (n-1)!개입니다. 강의의 4도시 행렬에서 최솟값은 18이며 확인할 순서는 6개입니다.",
    "Start at city 0, visit every other city once, and return to 0 with minimum cost. 2<=n<=8; diagonal costs 0, other costs 1..1000, possibly asymmetric. C matrix row width is 8. Fixing the starting city leaves (n-1)! orders; the lecture's four-city example has 6 orders and minimum cost 18.",
    "used[0]=1로 시작합니다. 모든 도시를 방문한 순간 마지막 도시에서 0으로 돌아오는 비용을 더하세요.", "Start with used[0]=1. At the final city, add the cost of returning to city 0.",
    "int tsp_min(const int dist[][8], int n)", "return = 최소 왕복 비용", "return = minimum round-trip cost",
    '''static void tsp_visit(const int d[][8], int n, int depth, int last,
                      int used[], int cost, int *best) {
  if(depth==n) {
    int total=cost+d[last][0];
    if(total<*best) *best=total;
    return;
  }
  for(int next=1;next<n;next++) if(!used[next]) {
    used[next]=1;
    tsp_visit(d,n,depth+1,next,used,cost+d[last][next],best);
    used[next]=0;
  }
}
int tsp_min(const int dist[][8], int n) {
  int used[8]={1}, best=INT_MAX;
  tsp_visit(dist,n,1,0,used,0,&best);
  return best;
}''', '''
def tsp_min(dist):
    from itertools import permutations
    n=len(dist)
    return min(sum(dist[a][b] for a,b in zip((0,)+p,p+(0,))) for p in permutations(range(1,n)))
''', [([[[0,4,7,3],[4,0,6,2],[7,6,0,5],[3,2,5,0]]],18), ([[[0,7],[2,0]]],9), ([[[0,1,8],[9,0,2],[3,7,0]]],6), ([[[0 if i==j else 1 for j in range(8)] for i in range(8)]],8), ([[[0,10,2],[3,0,8],[4,1,0]]],6)], level="도전")

add(27, "합이 target인 부분집합", "Subset sums", "37", "2.7 가지치기 전의 기준", ["A", "target"],
    "합이 target인 부분집합의 개수를 구하세요. 빈 부분집합도 포함하며 같은 값이라도 인덱스가 다르면 별개의 선택입니다. 0 ≤ n ≤ 16, 원소 -100~100, target -1600~1600.\n음수가 있을 수 있으므로 현재 합이 target보다 크다는 이유만으로 탐색을 중단하면 안 됩니다.",
    "Count subsets whose sum is target, including the empty subset. Equal values at different indices are distinct choices. 0<=n<=16, values -100..100, target -1600..1600. Negative values mean exceeding target is not a valid pruning rule.",
    "모든 비트마스크에 대해 합을 0부터 계산합니다. target=0일 때 공집합을 빠뜨리지 마세요.", "Compute each mask sum from zero. Do not forget the empty subset when target is zero.",
    "int subset_sum_count(const int A[], int n, int target)", "return = 조건을 만족하는 부분집합 수", "return = number of matching subsets",
    '''int subset_sum_count(const int A[], int n, int target) {
  int count=0;
  for(unsigned mask=0;mask<(1u<<n);mask++) {
    int sum=0;
    for(int j=0;j<n;j++) if(mask & (1u<<j)) sum+=A[j];
    if(sum==target) count++;
  }
  return count;
}''', '''
def subset_sum_count(A, target):
    from itertools import combinations
    return sum(sum(c)==target for r in range(len(A)+1) for c in combinations(A,r))
''', [([[2,3,5],5],2), ([[0,0],0],4), ([[],0],1), ([[],1],0), ([[12,-2],10],1), ([[-3,1,2,0],0],4), ([[0]*16,0],65536)])

add(28, "기억하는 피보나치", "Memoized Fibonacci", "39", "2.7 메모이제이션", ["n"],
    "F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)인 F(n)을 반환하세요. 0 ≤ n ≤ 70. 이미 계산한 값을 배열 또는 사전에 저장해 중복 재귀를 줄이세요.\nC는 long long을 사용합니다. 여러 입력이 이어져도 정확해야 합니다.",
    "Return Fibonacci F(n), with F(0)=0 and F(1)=1. 0<=n<=70. Store computed values in an array or dictionary to avoid repeated recursion. Use long long in C. Consecutive calls must remain correct.",
    "C에서는 memo[71]과 ready[71]을 따로 두면 결과 0과 미계산 상태를 구분할 수 있습니다.", "Separate memo[71] and ready[71] in C to distinguish a computed zero from an uncomputed entry.",
    "long long fib_memo(int n)", "return = F(n), long long", "return = F(n), long long",
    '''static long long fib_visit(int n, long long memo[], int ready[]) {
  if(n<=1) return n;
  if(ready[n]) return memo[n];
  memo[n]=fib_visit(n-1,memo,ready)+fib_visit(n-2,memo,ready);
  ready[n]=1;
  return memo[n];
}
long long fib_memo(int n) {
  long long memo[71]={0}; int ready[71]={0};
  return fib_visit(n,memo,ready);
}''', '''
def fib_memo(n):
    from functools import lru_cache
    @lru_cache(None)
    def fib(k):
        return k if k<=1 else fib(k-1)+fib(k-2)
    return fib(n)
''', [([5],5), ([0],0), ([1],1), ([70],190392490709135), ([2],1), ([50],12586269025), ([10],55)])

add(29, "세 수의 합 개수", "Count three-sum choices", "45", "Coding Test 2.1", ["A", "target"],
    "서로 다른 세 인덱스 i<j<k를 골라 합이 target인 경우의 수를 반환하세요. 서로 다른 숫자 값이 아니라 서로 다른 위치의 원소를 고릅니다. 같은 값이 여러 번 등장할 수 있습니다.\n0 ≤ n ≤ 100, 원소와 target -1000~1000.",
    "Count index triples i<j<k whose values sum to target. Distinct indices, not necessarily distinct values, are required. 0<=n<=100; values and target -1000..1000.",
    "n=100이면 100C3=161,700개입니다. i<j<k의 범위를 지켜 중복을 제외합니다.", "For n=100 there are 161,700 triples. Use i<j<k to avoid duplicates.",
    "int three_sum_count(const int A[], int n, int target)", "return = 경우의 수", "return = number of triples",
    '''int three_sum_count(const int A[], int n, int target) {
  int count=0;
  for(int i=0;i<n;i++) for(int j=i+1;j<n;j++) for(int k=j+1;k<n;k++)
    if(A[i]+A[j]+A[k]==target) count++;
  return count;
}''', '''
def three_sum_count(A, target):
    from itertools import combinations
    return sum(sum(c)==target for c in combinations(A,3))
''', [([[1,2,3,4,5],9],2), ([[1,1,1,1],3],4), ([[],0],0), ([[0,0],0],0), ([[-2,0,2,1,-1],0],2), ([[0]*100,0],161700)])

add(30, "블랙잭 최대 합", "Blackjack", "46", "Coding Test 2.2", ["A", "target"],
    "서로 다른 세 장을 골라 합이 target을 넘지 않는 경우 중 최대 합을 반환하세요. 가능한 선택이 없으면 0입니다.\n0 ≤ n ≤ 100, 카드 값 1~1000, 0 ≤ target ≤ 3000. 정확히 세 장을 골라야 합니다.",
    "Choose exactly three cards at different indices and return the largest sum <= target, or 0 if none exists. 0<=n<=100, card values 1..1000, target 0..3000.",
    "조건 검증 total<=target 후 best와 비교합니다. 최적값을 찾아야 하므로 첫 번째 유효 조합에서 종료하면 안 됩니다.", "Check total<=target, then compare with best. The first valid triple need not be optimal.",
    "int blackjack(const int A[], int n, int target)", "return = 최대 합 또는 0", "return = maximum sum, or 0",
    '''int blackjack(const int A[], int n, int target) {
  int best=0;
  for(int i=0;i<n;i++) for(int j=i+1;j<n;j++) for(int k=j+1;k<n;k++) {
    int total=A[i]+A[j]+A[k];
    if(total<=target && total>best) best=total;
  }
  return best;
}''', '''
def blackjack(A, target):
    from itertools import combinations
    return max((sum(c) for c in combinations(A,3) if sum(c)<=target),default=0)
''', [([[5,6,7,8,9],21],21), ([[10,20,30],5],0), ([[],0],0), ([[1,2],3],0), ([[3,3,3,3],9],9), ([[1,2,4,8],10],7), ([[1000]*100,3000],3000)])

add(31, "모든 쌍의 차이", "Differences of all pairs", "48", "반복문 연습 1", ["A"],
    "i<j인 모든 쌍에 대해 A[j]-A[i]를 i,j의 탐색 순서대로 구하세요. 절댓값이 아닙니다. 0 ≤ n ≤ 30, 원소 -1000~1000. Python은 목록 반환, C는 out에 저장 후 개수 반환.",
    "For every i<j, list A[j]-A[i] in index traversal order. Do not take absolute values. 0<=n<=30, values -1000..1000. Python returns a list; C fills out and returns its length.",
    "[3,1,4,2]의 첫 차이는 1-3=-2입니다.", "The first difference for [3,1,4,2] is 1-3=-2.",
    "int pair_differences(const int A[], int n, int out[])", "out = 차이 목록, return = 개수 (최대 435)", "out = differences, return = count (max 435)",
    '''int pair_differences(const int A[], int n, int out[]) {
  int count=0;
  for(int i=0;i<n;i++) for(int j=i+1;j<n;j++) out[count++]=A[j]-A[i];
  return count;
}''', '''
def pair_differences(A):
    return [A[j]-A[i] for i in range(len(A)) for j in range(i+1,len(A))]
''', [([[3,1,4,2]],[-2,1,-1,3,1,-2]), ([[]],[]), ([[7]],[]), ([[2,2,2]],[0,0,0]), ([list(range(30))],), ([[-3,8,-9]],)], "list", capacity=435)

add(32, "합이 K인 세 수 나열", "List three-sum choices", "48", "반복문 연습 2", ["A", "target"],
    "i<j<k이며 합이 target인 [A[i],A[j],A[k]]를 모두 구하세요. 개수만 세는 P29와 달리 실제 세 수를 저장합니다. 탐색 순서를 유지하며 인덱스가 다르면 별개의 선택입니다.\n0 ≤ n ≤ 20, 원소와 target -1000~1000.",
    "List [A[i],A[j],A[k]] for i<j<k with sum equal to target, in index traversal order. Unlike P29, return the triples themselves. Distinct indices are distinct choices. 0<=n<=20; values and target -1000..1000.",
    "조건을 통과했을 때만 out[count]에 저장한 뒤 count를 증가시킵니다.", "Fill out[count] and increase count only when the sum matches.",
    "int three_sum_values(const int A[], int n, int target, int out[][3])", "out[][3] = 세 수, return = 행 수 (최대 1140)", "out[][3] = triples, return = rows (max 1140)",
    '''int three_sum_values(const int A[], int n, int target, int out[][3]) {
  int count=0;
  for(int i=0;i<n;i++) for(int j=i+1;j<n;j++) for(int k=j+1;k<n;k++)
    if(A[i]+A[j]+A[k]==target) {
      out[count][0]=A[i]; out[count][1]=A[j]; out[count++][2]=A[k];
    }
  return count;
}''', '''
def three_sum_values(A, target):
    from itertools import combinations
    return [list(c) for c in combinations(A,3) if sum(c)==target]
''', [([[2,3,5,7,8],15],[[2,5,8],[3,5,7]]), ([[1,1,1,1],3],[[1,1,1]]*4), ([[],0],[]), ([[-1,0,1],0],[[-1,0,1]]), ([[0]*20,0],)], "rows", 3, 1140)

add(33, "회문만 골라내기", "Filter palindromes", "49", "문자열 연습", ["words"],
    "앞뒤로 읽어도 같은 문자열만 원래 순서로 반환하세요. 대소문자를 구분합니다. 문자열은 ASCII 영문자이며 빈 문자열도 회문입니다. 0 ≤ n ≤ 30, 각 길이 0~50.\nPython: 문자열 목록 반환. C: 회문인 문자열의 인덱스를 out에 저장하고 개수를 반환합니다. 채점기가 해당 문자열로 결과를 표시합니다.",
    "Keep palindromes in original order, case-sensitive. Words contain ASCII letters; an empty string is a palindrome. 0<=n<=30, word lengths 0..50. Python returns words. C writes their indices to out and returns the count; the grader displays the corresponding words.",
    "C에서는 양 끝의 인덱스를 안쪽으로 옮기며 비교합니다. Racecar와 racecar를 구분하세요.", "In C compare from both ends toward the middle. Racecar and racecar differ.",
    "int palindrome_words(const char *words[], int n, int out[])", "out = 회문인 문자열의 인덱스, return = 개수 (최대 30)", "out = indices of palindromes, return = count (max 30)",
    '''int palindrome_words(const char *words[], int n, int out[]) {
  int count=0;
  for(int i=0;i<n;i++) {
    int left=0, right=(int)strlen(words[i])-1, ok=1;
    while(left<right) if(words[i][left++]!=words[i][right--]) {ok=0; break;}
    if(ok) out[count++]=i;
  }
  return count;
}''', '''
def palindrome_words(words):
    return [s for s in words if s==s[::-1]]
''', [([["level","hello","Racecar","noon","world"]],["level","noon"]), ([["","a","Aa","aba"]],["","a","aba"]), ([[]],[]), ([["racecar","aa","ab"]],["racecar","aa"]), ([["x"*50]*30],)], "words", capacity=30)

add(34, "0/1 배낭 완전 탐색", "0/1 knapsack", "50", "부분집합 연습", ["weights", "values", "capacity"],
    "무게 합이 capacity 이하인 물건 부분집합 중 가치 합의 최댓값을 반환하세요. 각 물건은 한 번만 선택합니다. 아무것도 고르지 않아도 됩니다.\n0 ≤ n ≤ 16, 무게 1~100, 가치 0~1000, 용량 0~1600. weights와 values의 길이는 같습니다.\n강의 예시 weights=[4,6,3,5], values=[5,8,3,6], capacity=10의 정답은 13입니다(무게 4+6, 가치 5+8). 슬라이드의 14는 계산 오류입니다.",
    "Return the maximum value of a subset with total weight <= capacity. Use each item at most once; the empty choice is allowed. 0<=n<=16, weights 1..100, values 0..1000, capacity 0..1600. Arrays have equal length. Correction: weights=[4,6,3,5], values=[5,8,3,6], capacity=10 has answer 13, not the lecture's 14.",
    "마스크마다 무게와 가치를 따로 합산합니다. 모든 원소를 검사하는 구현의 시간은 O(n*2^n)입니다.", "Sum weights and values separately for each mask. Scanning every item costs O(n*2^n).",
    "int knapsack(const int weights[], const int values[], int n, int capacity)", "return = 최대 가치", "return = maximum value",
    '''int knapsack(const int weights[], const int values[], int n, int capacity) {
  int best=0;
  for(unsigned mask=0;mask<(1u<<n);mask++) {
    int weight=0, value=0;
    for(int j=0;j<n;j++) if(mask & (1u<<j)) {weight+=weights[j]; value+=values[j];}
    if(weight<=capacity && value>best) best=value;
  }
  return best;
}''', '''
def knapsack(weights, values, capacity):
    from itertools import combinations
    best=0
    for r in range(len(weights)+1):
        for c in combinations(range(len(weights)),r):
            if sum(weights[i] for i in c)<=capacity:
                best=max(best,sum(values[i] for i in c))
    return best
''', [([[4,6,3,5],[5,8,3,6],10],13), ([[2,3],[9,10],1],0), ([[],[],10],0), ([[1],[7],0],0), ([[2,2],[3,5],4],8), ([[1]*16,list(range(16)),16],120), ([[10,1],[100,3],1],3)], level="도전")

add(35, "숫자 야구 후보 세기", "Number baseball", "51", "순열 연습", ["guesses", "strikes", "balls"],
    "0~9 중 서로 다른 숫자 세 개로 된 비밀번호 후보에서 모든 힌트를 만족하는 개수를 구하세요. 앞자리 0을 허용합니다. 위치와 숫자가 모두 같으면 스트라이크, 숫자만 같고 위치가 다르면 볼입니다.\nguesses는 세 자리 숫자 문자열 목록, strikes와 balls는 대응하는 개수 목록입니다. 길이는 같고 0 ≤ n ≤ 20입니다. 각 추측도 숫자가 중복되지 않습니다. 힌트가 없으면 720개입니다. 모순된 힌트라면 0개입니다.",
    "Count three-digit passwords using distinct digits 0..9 that satisfy every hint. Leading zeros are allowed. A strike matches digit and position; a ball matches only the digit. guesses contains three-digit strings with distinct digits; strikes and balls contain their counts. Arrays have equal length, 0<=n<=20. No hints means 720 candidates; contradictions mean 0.",
    "숫자를 문자열로 비교해야 012를 보존합니다. 공통 숫자 수에서 스트라이크를 빼면 볼입니다.", "Keep guesses as strings to preserve 012. Balls equal common digits minus strikes.",
    "int baseball_count(const char *guesses[], const int strikes[], const int balls[], int n)", "return = 모든 힌트를 만족하는 후보 수", "return = candidates satisfying all hints",
    '''int baseball_count(const char *guesses[], const int strikes[], const int balls[], int n) {
  int count=0;
  for(int a=0;a<10;a++) for(int b=0;b<10;b++) for(int c=0;c<10;c++) {
    if(a==b || a==c || b==c) continue;
    char candidate[3]={'0'+a,'0'+b,'0'+c};
    int ok=1;
    for(int h=0;h<n && ok;h++) {
      int s=0, common=0;
      for(int i=0;i<3;i++) {
        if(candidate[i]==guesses[h][i]) s++;
        for(int j=0;j<3;j++) if(candidate[i]==guesses[h][j]) common++;
      }
      if(s!=strikes[h] || common-s!=balls[h]) ok=0;
    }
    if(ok) count++;
  }
  return count;
}''', '''
def baseball_count(guesses, strikes, balls):
    from itertools import permutations
    count=0
    for p in permutations('0123456789',3):
        ok=True
        for guess,s,b in zip(guesses,strikes,balls):
            actual_s=sum(x==y for x,y in zip(p,guess))
            actual_b=len(set(p)&set(guess))-actual_s
            if (actual_s,actual_b)!=(s,b): ok=False; break
        count+=ok
    return count
''', [([["012"],[3],[0]],1), ([[],[],[]],720), ([["123"],[0],[0]],210), ([["123","123"],[3,0],[0,0]],0), ([["123"],[0],[3]],2), ([["123"],[2],[0]],21), ([["012","012"],[3,3],[0,0]],1)], level="도전")

add(36, "2차원 배열 입력과 순회", "Read and traverse a grid", "43, 47", "입력·2차원 배열", ["grid"],
    "행렬의 모든 원소를 행 순서대로 방문하여 합계를 반환하세요. 1 ≤ 행 수, 열 수 ≤ 8, 원소 -1000~1000입니다.\n브라우저 채점에서는 입력된 배열을 함수 인자로 받습니다. C의 grid[][8]은 고정 행 너비이며 rows, cols가 실제 크기입니다. 강의 C 예제의 input_grid.c에서는 main과 scanf로 같은 입력을 읽는 방법도 연습할 수 있습니다.",
    "Visit every cell row by row and return the sum. Rows and columns are 1..8, values -1000..1000. The browser passes an array to your function. C grid[][8] has fixed row width; rows and cols give its actual size. Download input_grid.c to practice reading the same input using main and scanf.",
    "행 i는 rows 미만, 열 j는 cols 미만입니다. 정사각형이라고 가정하면 직사각형 입력에서 틀립니다.", "Loop i<rows and j<cols. Do not assume the matrix is square.",
    "int grid_sum(const int grid[][8], int rows, int cols)", "return = 모든 원소의 합", "return = sum of all cells",
    '''int grid_sum(const int grid[][8], int rows, int cols) {
  int sum=0;
  for(int i=0;i<rows;i++) for(int j=0;j<cols;j++) sum+=grid[i][j];
  return sum;
}''', '''
def grid_sum(grid):
    return sum(sum(row) for row in grid)
''', [([[[1,2,3],[4,5,6]]],21), ([[[-7]]],-7), ([[[0,0],[0,0],[0,0]]],0), ([[[1],[2],[3]]],6), ([[[1000]*8 for _ in range(8)]],64000), ([[[-1,2,-3,4]]],2)])

assert len(problems) == 24
(ROOT / "algorithm-lab/chapter-02.json").write_text(json.dumps(problems, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
print(f"Generated {len(problems)} problems / {sum(len(p['tests']) for p in problems)} cases")
