"""Shared, executable content for the chapter-two written exercises and slides."""
from pathlib import Path
import itertools as it
import json

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / '.codex-pptx-work/chapter2-exercises'
OUT.mkdir(parents=True, exist_ok=True)
lab = {p['id']: p for p in json.loads((ROOT/'algorithm-lab/chapter-02.json').read_text(encoding='utf-8'))}
questions = []
sections = [(64,'2.1 완전 탐색'),(68,'2.2 다중 반복문'),(70,'2.3 기본 구조'),(77,'2.4 순열과 조합'),(83,'2.5 완전 탐색 예제'),(92,'2.6 탐색 공간과 실행량'),(96,'2.7 재귀와 탐색 개선'),(100,'2.8 종합 구현')]

def add(q, title, task, steps, complexity, pid=None, function=None, py=None, c=None, tests=None):
    p = json.loads(json.dumps(lab[pid])) if pid else {'custom':True, 'function':function, 'solution':py.strip()+'\n', 'c':{'solution':c.strip()+'\n','result':'return으로 정수 결과를 반환합니다.'}, 'tests':[{'args':a,'expected':e,'public':True} for a,e in tests]}
    p.update(q=q, title=title, task=task, steps=steps, complexity=complexity, section=next(s for end,s in sections if q<=end), lab=pid)
    p['example']=p['tests'][0]
    questions.append(p)

add(61,'네 자리 자물쇠 탐색','네 자리 숫자 문자열 secret을 0000부터 순서대로 찾는 함수를 작성하시오. 네 중첩 반복문을 사용하고, 찾을 때까지 시도한 횟수를 반환하시오. 0000도 첫 시도이며 앞자리 0을 보존한다.', 'a,b,c,d를 각각 0~9로 순회한다.\n후보마다 횟수를 1 증가시키고 네 자리 모두를 비교한다.\n일치하면 즉시 횟수를 반환한다.', '고정 네 자리: 최악 10,000개 후보, 추가 공간 O(1).', pid='P13')
add(62,'약수 목록 생성','1≤n≤10,000인 정수 n의 모든 양의 약수를 오름차순으로 구하는 함수를 작성하시오. 1부터 n까지 직접 검사한다.', 'd를 1부터 n까지 검사한다.\nn을 d로 나눈 나머지가 0이면 결과에 저장한다.\nPython은 목록, C는 out에 저장하고 개수를 반환한다.', '시간 O(n), 결과 공간 O(n) 이하.', pid='P14')
add(63,'구간 안의 배수','정수 L,R,d가 주어진다. L부터 R까지 직접 순회하여 d의 배수 개수를 반환하는 함수를 작성하시오. 0≤L≤R≤10,000, 1≤d≤100이며 0도 배수에 포함한다.', 'count를 0으로 둔다.\nL부터 R까지 양 끝을 포함해 검사한다.\nx % d가 0일 때만 count를 증가시킨다.', '시간 O(R−L+1), 추가 공간 O(1).', function='count_multiples', py='''
def count_multiples(L, R, d):
    count = 0
    for x in range(L, R + 1):
        if x % d == 0:
            count += 1
    return count
''', c='''
int count_multiples(int L, int R, int d) {
    int count = 0;
    for (int x = L; x <= R; x++) {
        if (x % d == 0) count++;
    }
    return count;
}
''',tests=[([0,10,3],4),([5,5,2],0),([6,6,3],1)])
add(64,'목표 값의 모든 출현 횟수','정수 배열 A와 target이 주어진다. A 전체를 검사하여 target과 같은 원소의 개수를 반환하는 함수를 작성하시오. 0≤n≤100, 원소와 target은 −100~100이다. 입력 배열을 바꾸지 않는다.', '모든 인덱스를 차례대로 방문한다.\nA[i]가 target과 같으면 개수를 증가시킨다.\n빈 배열이나 목표 값이 없으면 0을 반환한다.', '시간 O(n), 추가 공간 O(1).',function='count_target',py='''
def count_target(A, target):
    count = 0
    for value in A:
        if value == target:
            count += 1
    return count
''',c='''
int count_target(const int A[], int n, int target) {
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (A[i] == target) count++;
    }
    return count;
}
''',tests=[([[2,1,2,2],2],3),([[],1],0),([[1,2],3],0)])
add(65,'합이 K인 두 수의 목록','배열 A에서 i<j이며 A[i]+A[j]=target인 모든 값의 쌍을 구하는 함수를 작성하시오. i, j가 증가하는 순서로 저장한다. 값이 같아도 인덱스가 다른 쌍은 별개다. 0≤n≤30, 값과 target은 −100~100이다.', 'i를 고르고 j를 i+1부터 순회한다.\n합을 검사한 후에만 쌍을 저장한다.\n같은 원소를 두 번 고르거나 순서를 뒤집어 중복 저장하지 않는다.', '시간 O(n²), 결과 공간 O(n²).',pid='P15')
add(66,'세 주사위의 합','서로 구별되는 세 주사위의 눈이 합계 target이 되는 모든 순서쌍 (a,b,c)를 구하는 함수를 작성하시오. 눈은 1~6이며 a,b,c 순으로 오름차순 탐색한다. 0≤target≤20이다.', '각 주사위를 1~6으로 순회한다.\na+b+c가 target인 경우만 저장한다.\n(1,1,2)와 (1,2,1)은 서로 다른 경우다.', '6³개 후보, 일반화한 면 수 m에 대해 시간 O(m³).',pid='P16')
add(67,'차이가 K인 인덱스 쌍','배열 A에서 i<j이고 |A[i]−A[j]|=K인 쌍의 개수를 반환하는 함수를 작성하시오. 0≤n≤100, 원소는 −100~100, 0≤K≤200이다. 같은 값을 가진 서로 다른 인덱스도 센다.', 'i<j인 쌍을 한 번씩 만든다.\n두 값의 차이의 절댓값을 K와 비교한다.\n조건이 맞으면 count를 증가시킨다.', '시간 O(n²), 추가 공간 O(1).',function='count_difference',py='''
def count_difference(A, K):
    count = 0
    for i in range(len(A)):
        for j in range(i + 1, len(A)):
            if abs(A[i] - A[j]) == K:
                count += 1
    return count
''',c='''
int count_difference(const int A[], int n, int K) {
    int count = 0;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (abs(A[i] - A[j]) == K) count++;
    return count;
}
''',tests=[([[1,3,1,5],2],3),([[2,2,2],0],3),([[],0],0)])
add(68,'모든 쌍의 차이 기록','정수 배열 A의 모든 i<j에 대해 A[j]−A[i]를 계산하여 목록으로 만드는 함수를 작성하시오. 절댓값을 취하지 않는다. i와 j가 증가하는 순서로 기록한다. 0≤n≤30, 각 값은 −100~100이다.', '이중 반복문으로 i<j를 보장한다.\nA[j]−A[i]를 계산해 순서대로 저장한다.\n결과는 최대 n(n−1)/2개다.', '시간과 결과 공간 O(n²).',pid='P31')
add(69,'블랙잭 최적 조합','양의 카드 값 A에서 서로 다른 세 장을 골라 합이 target 이하인 최대 합을 반환하는 함수를 작성하시오. 가능한 조합이 없으면 0이다. 0≤n≤100, 카드 값은 1~1,000, 0≤target≤3,000이다.', 'i<j<k인 후보를 만든다.\n합이 target 이하인지 먼저 검사한다.\n조건을 통과한 후보로만 best를 갱신한다.', '시간 O(n³), 추가 공간 O(1).',pid='P30')
add(70,'조건을 만족하는 세 수 세기','배열 A에서 서로 다른 인덱스 i<j<k를 골라 합이 target인 조합의 개수를 반환하시오. 0≤n≤100, 값은 −100~100, target은 −300~300이다. 중복 값은 인덱스 기준으로 센다.', 'i<j<k인 조합을 빠짐없이 생성한다.\n세 값의 합이 target인지 검사한다.\n처음 찾은 뒤에도 끝까지 탐색해 전체 개수를 센다.', '시간 O(n³), 추가 공간 O(1).',pid='P29')
add(71,'r개 순열 직접 생성','서로 다른 정수 n개가 담긴 A에서 r개를 고르는 모든 순열을 직접 생성하시오. 0≤r≤n≤6이다. 입력 인덱스 순으로 탐색하며 r=0이면 빈 순열 하나를 반환한다. 순열 생성 라이브러리는 사용하지 않는다.', '현재 경로와 사용 여부 배열을 유지한다.\n사용하지 않은 원소를 선택해 재귀 호출한다.\n길이가 r이면 기록하고, 돌아오면 선택을 취소한다.', '결과 수 nPr, 기록 시간 O(r·nPr), 재귀·사용 배열 O(n).',pid='P18')
add(72,'조건이 있는 메달 배정','점수 배열 A의 서로 다른 세 사람에게 금·은·동메달을 배정한다. 세 점수의 합이 K 이상인 배정의 개수를 반환하시오. 역할이 다르면 다른 배정이다. 0≤n≤20, 0≤점수≤100, 0≤K≤300이다.', '금 i, 은 j, 동 k를 각각 고른다.\n같은 사람이 둘 이상의 역할을 맡으면 제외한다.\n세 점수의 합이 K 이상인 배정을 센다.', '시간 O(n³), 추가 공간 O(1).',function='medal_assignments',py='''
def medal_assignments(A, K):
    count = 0
    for i in range(len(A)):
        for j in range(len(A)):
            for k in range(len(A)):
                if i != j and i != k and j != k:
                    if A[i] + A[j] + A[k] >= K:
                        count += 1
    return count
''',c='''
int medal_assignments(const int A[], int n, int K) {
    int count = 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            for (int k = 0; k < n; k++)
                if (i != j && i != k && j != k)
                    if (A[i] + A[j] + A[k] >= K) count++;
    return count;
}
''',tests=[([[10,20,30,40],80],12),([[1,2],0],0),([[1,1,1],3],6)])
add(73,'두 가지 맛 메뉴','맛 번호 0~n−1 중 서로 다른 두 가지를 고르는 모든 메뉴를 생성하시오. 순서는 구별하지 않으며 작은 번호가 앞선다. i, j 순으로 증가하게 반환한다. 0≤n≤20이다.', '첫 맛 i를 고른다.\n두 번째 맛은 j=i+1부터 고른다.\n(i,j)를 저장하여 순서만 다른 중복을 막는다.', '시간과 결과 공간 O(n²).',pid='P21')
add(74,'r개 조합 직접 생성','서로 다른 정수 배열 A에서 r개를 고르는 모든 조합을 직접 생성하시오. 0≤r≤n≤8이다. 각 조합은 입력 인덱스 증가 순이며 r=0이면 빈 조합 하나다. 조합 생성 라이브러리를 쓰지 않는다.', '현재 경로와 다음 선택의 시작 인덱스를 유지한다.\ni를 선택한 뒤에는 i+1부터 고르게 재귀 호출한다.\n경로 길이가 r이면 결과를 기록한다.', '결과 수 nCr, 결과 기록 O(r·nCr), 탐색 노드 수를 함께 고려한다.',pid='P19')
add(75,'홀짝이 번갈아 나오는 순열','배열 A의 모든 원소를 한 번씩 배치하여 인접한 두 값의 홀짝이 항상 다른 순열의 개수를 구하시오. 1≤n≤8, 값은 서로 다른 1~20의 정수다. 직접 재귀 탐색하시오.', '사용하지 않은 원소를 다음 자리에 놓는다.\n직전 원소와 홀짝이 같으면 해당 가지를 제외한다.\nn개를 모두 놓은 경우에만 1을 센다.', '최악 시간 O(n·n!), 재귀와 used 공간 O(n).',function='alternating_orders',py='''
def alternating_orders(A):
    def dfs(used, last, depth):
        if depth == len(A):
            return 1
        count = 0
        for i, value in enumerate(A):
            if not (used >> i & 1):
                if depth == 0 or value % 2 != last % 2:
                    count += dfs(used | (1 << i), value, depth + 1)
        return count
    return dfs(0, 0, 0)
''',c='''
int alt_dfs(const int A[], int n, int used, int last, int depth) {
    if (depth == n) return 1;
    int count = 0;
    for (int i = 0; i < n; i++)
        if (!(used & (1 << i)))
            if (depth == 0 || A[i] % 2 != last % 2)
                count += alt_dfs(A, n, used | (1 << i), A[i], depth + 1);
    return count;
}
int alternating_orders(const int A[], int n) {
    return alt_dfs(A, n, 0, 0, 0);
}
''',tests=[([[1,2,3]],2),([[1,3]],0),([[2]],1),([[1,2,3,4]],8)])
add(76,'세 장 조합 생성','배열 A에서 서로 다른 인덱스의 세 장을 선택하는 모든 조합을 반환하시오. i<j<k 순으로 탐색한다. 0≤n≤10, 각 값은 −20~20이다. 값이 같은 카드도 인덱스가 다르면 별개다.', 'i를 고른 뒤 j는 i+1부터 고른다.\nk는 j+1부터 고른다.\n세 값을 순서대로 결과 행에 저장한다.', '시간과 결과 공간 O(n³).',pid='P17')
add(77,'세 숫자로 비밀번호 생성','서로 다른 1~9의 숫자 세 개가 배열 A에 주어진다. 각 숫자를 정확히 한 번 쓰는 세 자리 비밀번호 여섯 개를 생성하시오. 입력 인덱스 순으로 탐색한다.', 'i,j,k를 고르되 모두 다른지 검사한다.\n100·A[i]+10·A[j]+A[k]로 숫자를 만든다.\n생성 순서대로 여섯 개를 저장한다.', '입력 크기 3 고정: 후보 27개, 유효 결과 6개.',pid='P20')
add(78,'문자열의 모든 일치 위치','텍스트 text에서 패턴 pattern의 모든 시작 인덱스를 무차별 매칭으로 구하시오. 겹치는 일치도 포함한다. 길이는 각각 0~50, 1~10이며 영문자로 구성된다. 일치가 없으면 빈 목록이다.', '시작 위치 i를 0부터 n−m까지 검사한다.\n각 위치에서 패턴 문자를 하나씩 비교한다.\nm개가 모두 맞으면 i를 저장한다.', '시간 O((n−m+1)·m), n<m이면 즉시 빈 결과.',pid='P22')
add(79,'가장 가까운 두 수','2≤n≤30인 정수 배열 A의 모든 i<j를 검사하여 차이의 절댓값이 최소인 값의 쌍과 차이를 구하시오. 동률이면 탐색 중 처음 찾은 쌍을 유지한다. 반환 형식은 [A[i],A[j],차이]다.', 'best를 아직 선택되지 않은 상태로 시작한다.\n각 쌍의 차이를 비교해 더 작을 때만 갱신한다.\nC는 뺄셈 전에 long long으로 변환한다.', '시간 O(n²), 결과를 제외한 추가 공간 O(1).',pid='P23')
add(80,'비트마스크 부분집합 목록','서로 다른 정수 배열 A의 모든 부분집합을 비트마스크 증가 순서로 생성하시오. 0≤n≤8이다. 각 부분집합 내부는 입력 인덱스 순이며 빈 부분집합도 포함한다.', 'mask를 0부터 2ⁿ−1까지 순회한다.\nj번째 비트가 1이면 A[j]를 현재 부분집합에 넣는다.\nC는 out과 각 행 길이 sizes를 함께 기록한다.', '시간·전체 결과 공간 O(n·2ⁿ).',pid='P24')
add(81,'첫 번째 문자열 일치','text에서 pattern이 처음 등장하는 시작 인덱스를 반환하는 함수를 작성하시오. 직접 문자 비교를 사용하며 없으면 −1이다. 영문자 문자열이며 text 길이 0~50, pattern 길이 1~10이다.', '시작 위치를 왼쪽부터 검사한다.\n각 시작점에서 패턴의 문자를 모두 비교한다.\n처음 완전히 일치한 위치를 즉시 반환한다.', '최악 시간 O(nm), 추가 공간 O(1).',function='first_match',py='''
def first_match(text, pattern):
    for i in range(len(text) - len(pattern) + 1):
        j = 0
        while j < len(pattern) and text[i+j] == pattern[j]:
            j += 1
        if j == len(pattern):
            return i
    return -1
''',c='''
int first_match(const char text[], const char pattern[]) {
    int n = (int)strlen(text), m = (int)strlen(pattern);
    for (int i = 0; i <= n - m; i++) {
        int j = 0;
        while (j < m && text[i+j] == pattern[j]) j++;
        if (j == m) return i;
    }
    return -1;
}
''',tests=[(['ababa','aba'],0),(['hello','ll'],2),(['a','abc'],-1)])
add(82,'가장 멀리 떨어진 두 수','배열 A의 모든 서로 다른 인덱스 쌍을 검사하여 두 값의 차이의 절댓값 중 최댓값을 반환하시오. 2≤n≤100, 각 값은 −1,000~1,000이다. 정렬 없이 이중 반복문으로 작성한다.', 'best를 0으로 시작한다.\ni<j인 모든 쌍의 절댓값 차이를 계산한다.\n더 큰 값이면 best를 갱신한다.', '시간 O(n²), 추가 공간 O(1).',function='largest_gap',py='''
def largest_gap(A):
    best = 0
    for i in range(len(A)):
        for j in range(i + 1, len(A)):
            best = max(best, abs(A[i] - A[j]))
    return best
''',c='''
int largest_gap(const int A[], int n) {
    int best = 0;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++) {
            int gap = abs(A[i] - A[j]);
            if (gap > best) best = gap;
        }
    return best;
}
''',tests=[([[3,1,9]],8),([[5,5]],0),([[-10,10,0]],20)])
add(83,'목표 합 부분집합 개수','배열 A의 부분집합 중 합이 target인 것의 개수를 반환하시오. 0≤n≤16, 값은 −20~20, target은 −100~100이다. 빈 부분집합도 포함하며 같은 값도 인덱스 기준으로 선택한다.', '모든 mask를 순회한다.\n선택한 인덱스의 값을 더한다.\n합이 target이면 세며 음수가 있으므로 합 초과만으로 중단하지 않는다.', '시간 O(n·2ⁿ), 추가 공간 O(1).',pid='P27')
add(84,'연속된 1이 없는 이진 문자열','길이 n의 0과 1로 이루어진 문자열 중 1이 연속하지 않는 경우의 수를 반환하시오. 0≤n≤16이며 길이 0에는 빈 문자열 하나가 있다. 모든 비트마스크를 검사한다.', '0부터 2ⁿ−1까지 모든 mask를 만든다.\nmask와 mask를 한 비트 옮긴 값의 공통 비트를 검사한다.\n공통 비트가 없으면 연속된 1이 없으므로 센다.', '시간 O(2ⁿ), 추가 공간 O(1).',function='nonadjacent_binary',py='''
def nonadjacent_binary(n):
    count = 0
    for mask in range(1 << n):
        if (mask & (mask >> 1)) == 0:
            count += 1
    return count
''',c='''
int nonadjacent_binary(int n) {
    int count = 0;
    for (unsigned mask = 0; mask < (1u << n); mask++)
        if ((mask & (mask >> 1)) == 0) count++;
    return count;
}
''',tests=[([3],5),([0],1),([1],2),([5],13)])
add(85,'탐색 공간 계산 함수','0≤n≤12에 대해 [n!, 2ⁿ, nⁿ]을 반환하는 함수를 반복문으로 작성하시오. 이 문제에서는 0!=1, 2⁰=1, 0⁰=1로 정의한다. C에서는 long long 결과 배열을 사용한다.', '세 누적값을 1로 초기화한다.\n팩토리얼에는 1~n, 거듭제곱에는 밑을 n번 곱한다.\n후보를 실제로 생성하지 않고 후보 수를 계산한다.', '곱셈 횟수 O(n), 추가 공간 O(1).',pid='P25')
add(86,'중복을 허용하는 비밀번호','각 자리에 0~m−1을 쓸 수 있는 길이 L 비밀번호 중 숫자 합이 K인 개수를 구하시오. 2≤m≤5, 1≤L≤6, 0≤K≤24이다. 앞자리 0과 같은 숫자의 반복을 허용한다. 모든 mᴸ개 후보를 검사한다.', '0부터 mᴸ−1까지 번호를 순회한다.\n나머지와 정수 나눗셈으로 L자리의 m진수 숫자를 얻는다.\n숫자의 합이 K인지 검사한다.', '시간 O(L·mᴸ), 추가 공간 O(1).',function='password_sum_count',py='''
def password_sum_count(m, L, K):
    count = 0
    for code in range(m ** L):
        total, x = 0, code
        for _ in range(L):
            total += x % m
            x //= m
        if total == K:
            count += 1
    return count
''',c='''
int password_sum_count(int m, int L, int K) {
    int limit = 1, count = 0;
    for (int i = 0; i < L; i++) limit *= m;
    for (int code = 0; code < limit; code++) {
        int x = code, total = 0;
        for (int i = 0; i < L; i++) {
            total += x % m;
            x /= m;
        }
        if (total == K) count++;
    }
    return count;
}
''',tests=[([3,2,2],3),([2,3,0],1),([2,3,4],0)])
add(87,'한도 이하 최대 부분집합 합','배열 A에서 원소를 선택해 합이 K 이하인 최대 합을 반환하시오. 0≤n≤16, 값은 −20~20, 0≤K≤100이다. 빈 부분집합을 허용한다. 음수가 있어도 정확하게 처리해야 한다.', 'best를 빈 부분집합의 합 0으로 둔다.\n각 mask의 모든 선택 원소를 더한다.\n합이 K 이하이고 best보다 클 때만 갱신한다.', '시간 O(n·2ⁿ), 추가 공간 O(1).',function='best_subset_sum',py='''
def best_subset_sum(A, K):
    best = 0
    for mask in range(1 << len(A)):
        total = 0
        for j in range(len(A)):
            if mask >> j & 1:
                total += A[j]
        if total <= K:
            best = max(best, total)
    return best
''',c='''
int best_subset_sum(const int A[], int n, int K) {
    int best = 0;
    for (unsigned mask = 0; mask < (1u << n); mask++) {
        int total = 0;
        for (int j = 0; j < n; j++)
            if (mask & (1u << j)) total += A[j];
        if (total <= K && total > best) best = total;
    }
    return best;
}
''',tests=[([[8,-3,4],6],5),([[],0],0),([[3,4],7],7)])
add(88,'출발점을 고정한 외판원 순회','n×n 비용 행렬 dist가 주어진다. 0번 도시에서 출발해 모든 도시를 한 번씩 방문하고 0으로 돌아오는 최소 비용을 구하시오. 1≤n≤8, 비용은 0~100이다. 모든 도시간 이동이 가능하며 비용은 비대칭일 수 있다.', '0번 도시를 미리 방문 처리한다.\n나머지 도시를 놓는 모든 순서를 탐색하며 비용을 누적한다.\n모두 방문하면 마지막 도시에서 0으로 돌아오는 비용을 더한다.', '후보 순서 (n−1)!개, 이 구현의 상한 O(n·(n−1)!), 재귀 공간 O(n).',pid='P26')
add(89,'정확히 r개인 부분집합','배열 A에서 정확히 r개 인덱스를 선택하고 합이 K인 부분집합의 개수를 반환하시오. 0≤r≤n≤16, 값은 −20~20, K는 −100~100이다. 비트마스크로 선택 개수와 합을 함께 검사한다.', 'mask마다 선택 개수와 합을 0으로 시작한다.\n선택 비트를 발견할 때 두 값을 함께 갱신한다.\n개수=r, 합=K를 모두 만족할 때만 센다.', '시간 O(n·2ⁿ), 추가 공간 O(1).',function='fixed_size_subsets',py='''
def fixed_size_subsets(A, r, K):
    answer = 0
    for mask in range(1 << len(A)):
        size, total = 0, 0
        for j in range(len(A)):
            if mask >> j & 1:
                size += 1
                total += A[j]
        if size == r and total == K:
            answer += 1
    return answer
''',c='''
int fixed_size_subsets(const int A[], int n, int r, int K) {
    int answer = 0;
    for (unsigned mask = 0; mask < (1u << n); mask++) {
        int size = 0, total = 0;
        for (int j = 0; j < n; j++)
            if (mask & (1u << j)) { size++; total += A[j]; }
        if (size == r && total == K) answer++;
    }
    return answer;
}
''',tests=[([[1,2,3,4],2,5],2),([[],0,0],1),([[1,1],1,1],2)])
add(90,'후보 수 예산에 맞는 최대 크기','후보를 B개까지 검사할 수 있다. 2ⁿ≤B를 만족하는 가장 큰 정수 n≥0을 반환하는 함수를 반복문으로 작성하시오. 1≤B≤10⁹이다. 로그 함수와 부동소수점을 쓰지 말고 다음 두 배가 예산을 넘는지 검사한다.', 'n=0, 후보 수=1에서 시작한다.\n현재 후보 수가 B//2 이하일 때만 두 배로 늘린다.\n매번 n을 증가시키고 반복이 끝난 n을 반환한다.', '시간 O(log B), 추가 공간 O(1).',function='max_binary_size',py='''
def max_binary_size(B):
    n, count = 0, 1
    while count <= B // 2:
        count *= 2
        n += 1
    return n
''',c='''
int max_binary_size(int B) {
    int n = 0, count = 1;
    while (count <= B / 2) {
        count *= 2;
        n++;
    }
    return n;
}
''',tests=[([1000],9),([1],0),([1024],10),([1000000000],29)])
add(91,'인접 차이 합을 최대화하는 배치','배열 A의 모든 원소를 한 번씩 배치하여 인접한 값들의 차이의 절댓값 합을 최대화하시오. 최댓값을 반환한다. 1≤n≤8, 각 값은 −20~20이며 중복 값은 인덱스로 구별한다. 직접 순열 탐색을 작성한다.', '사용하지 않은 인덱스를 다음 자리에 선택한다.\n첫 원소 이후에는 직전 값과의 절댓값 차이를 더한다.\n각 선택에서 얻은 결과 중 최대를 반환한다.', '최악 시간 O(n·n!), 재귀 공간 O(n).',function='max_adjacent_score',py='''
def max_adjacent_score(A):
    def dfs(used, last, depth):
        if depth == len(A):
            return 0
        best = 0
        for i, value in enumerate(A):
            if not (used >> i & 1):
                gain = 0 if depth == 0 else abs(value - last)
                rest = dfs(used | (1 << i), value, depth + 1)
                best = max(best, gain + rest)
        return best
    return dfs(0, 0, 0)
''',c='''
int score_dfs(const int A[], int n, int used, int last, int depth) {
    if (depth == n) return 0;
    int best = 0;
    for (int i = 0; i < n; i++) if (!(used & (1 << i))) {
        int gain = depth == 0 ? 0 : abs(A[i] - last);
        int rest = score_dfs(A, n, used | (1 << i), A[i], depth + 1);
        if (gain + rest > best) best = gain + rest;
    }
    return best;
}
int max_adjacent_score(const int A[], int n) {
    return score_dfs(A, n, 0, 0, 0);
}
''',tests=[([[1,2,4]],5),([[7]],0),([[-2,0,3]],8)])
add(92,'원형 자리의 색 배정','원형으로 놓인 n개 자리를 m가지 색으로 칠한다. 이웃한 자리의 색이 모두 다른 배정의 수를 구하시오. 마지막과 첫 자리도 이웃이다. 3≤n≤8, 2≤m≤4이며 자리 번호를 구별한다. 회전한 배정을 합치지 않는다.', '0부터 mⁿ−1까지 모든 배정을 생성한다.\nm진수 각 자리를 색 번호로 바꾼다.\n모든 i에 대해 color[i]와 color[(i+1)%n]이 다른지 검사한다.', '시간 O(n·mⁿ), 추가 공간 O(n).',function='cycle_colorings',py='''
def cycle_colorings(n, m):
    answer = 0
    for code in range(m ** n):
        colors, x = [], code
        for _ in range(n):
            colors.append(x % m)
            x //= m
        if all(colors[i] != colors[(i+1) % n] for i in range(n)):
            answer += 1
    return answer
''',c='''
int cycle_colorings(int n, int m) {
    int limit = 1, answer = 0;
    for (int i = 0; i < n; i++) limit *= m;
    for (int code = 0; code < limit; code++) {
        int colors[8], x = code, ok = 1;
        for (int i = 0; i < n; i++) { colors[i] = x % m; x /= m; }
        for (int i = 0; i < n; i++)
            if (colors[i] == colors[(i+1) % n]) ok = 0;
        answer += ok;
    }
    return answer;
}
''',tests=[([3,3],6),([3,2],0),([4,2],2),([4,3],18)])
add(93,'N Queens의 가지치기','n×n 체스판에 퀸 n개를 서로 공격하지 않도록 놓는 경우의 수를 구하시오. 1≤n≤8이다. 한 행에 하나씩 놓고 같은 열 또는 대각선 충돌을 검사하는 백트래킹을 작성한다. 회전·대칭 배치를 별개로 센다.', 'row행에 놓을 열 col을 고른다.\n앞선 행 r과 같은 열이거나 열 차이=row−r이면 제외한다.\n안전한 후보만 재귀 탐색하고 row=n이면 1을 센다.', '열 중복을 제외하는 이 구현의 보수적 상한 O(n²·n!), 공간 O(n).',function='nqueens',py='''
def nqueens(n):
    cols = []
    def dfs():
        row = len(cols)
        if row == n:
            return 1
        count = 0
        for col in range(n):
            if all(col != c and abs(col-c) != row-r
                   for r, c in enumerate(cols)):
                cols.append(col)
                count += dfs()
                cols.pop()
        return count
    return dfs()
''',c='''
int queen_dfs(int n, int row, int cols[]) {
    if (row == n) return 1;
    int count = 0;
    for (int col = 0; col < n; col++) {
        int ok = 1;
        for (int r = 0; r < row; r++)
            if (cols[r] == col || abs(cols[r]-col) == row-r) ok = 0;
        if (ok) { cols[row] = col; count += queen_dfs(n, row+1, cols); }
    }
    return count;
}
int nqueens(int n) {
    int cols[8];
    return queen_dfs(n, 0, cols);
}
''',tests=[([4],2),([1],1),([2],0),([8],92)])
add(94,'구간을 나누는 최댓값 탐색','배열 A의 최댓값을 구하되 [left,right) 구간을 절반으로 나누는 재귀 함수를 작성하시오. 원소 하나인 구간을 종료 조건으로 사용한다. 1≤n≤100, 각 값은 −1,000~1,000이다.', '구간 길이가 1이면 해당 원소를 반환한다.\nmid=(left+right)//2로 왼쪽과 오른쪽을 나눈다.\n두 재귀 결과 중 큰 값을 반환한다.', '시간 O(n), 재귀 깊이와 추가 공간 O(log n).',function='recursive_max',py='''
def recursive_max(A):
    def solve(left, right):
        if right - left == 1:
            return A[left]
        mid = (left + right) // 2
        return max(solve(left, mid), solve(mid, right))
    return solve(0, len(A))
''',c='''
int range_max(const int A[], int left, int right) {
    if (right - left == 1) return A[left];
    int mid = (left + right) / 2;
    int a = range_max(A, left, mid), b = range_max(A, mid, right);
    return a > b ? a : b;
}
int recursive_max(const int A[], int n) {
    return range_max(A, 0, n);
}
''',tests=[([[3,-1,9,4]],9),([[-5]],-5),([[-8,-2,-10]],-2)])
add(95,'메모이제이션 피보나치','F(0)=0, F(1)=1, F(n)=F(n−1)+F(n−2)를 계산하는 함수를 작성하시오. 재귀에서 이미 계산한 값을 저장하고 재사용한다. 0≤n≤70이며 C는 long long을 반환한다.', '메모 배열의 미계산 상태를 정한다.\n0과 1의 값을 먼저 처리한다.\n나머지는 두 재귀 결과를 합해 저장한 뒤 반환한다.', '시간 O(n), 메모와 재귀 공간 O(n).',pid='P28')
add(96,'계단 오르기와 기억','한 번에 1, 2, 3칸 오를 수 있다. 정확히 n칸에 도달하는 이동 순서의 수를 메모이제이션 재귀로 구하시오. 0≤n≤20이다. n=0에는 아무것도 하지 않는 순서 하나가 있다.', '남은 칸이 음수이면 0, 0이면 1을 반환한다.\nsolve(n−1)+solve(n−2)+solve(n−3)을 계산한다.\n계산한 양수 n의 결과는 메모해 재사용한다.', '시간 O(n), 메모와 재귀 공간 O(n).',function='stair_ways',py='''
def stair_ways(n):
    memo = {}
    def solve(k):
        if k < 0:
            return 0
        if k == 0:
            return 1
        if k not in memo:
            memo[k] = solve(k-1) + solve(k-2) + solve(k-3)
        return memo[k]
    return solve(n)
''',c='''
int stair_solve(int k, int memo[]) {
    if (k < 0) return 0;
    if (k == 0) return 1;
    if (memo[k] == -1)
        memo[k] = stair_solve(k-1, memo) + stair_solve(k-2, memo)
                  + stair_solve(k-3, memo);
    return memo[k];
}
int stair_ways(int n) {
    int memo[21];
    for (int i = 0; i <= n; i++) memo[i] = -1;
    return stair_solve(n, memo);
}
''',tests=[([4],7),([0],1),([1],1),([5],13)])
add(97,'직사각형 배열 순회','rows×cols 정수 배열 grid의 모든 원소 합을 구하는 함수를 작성하시오. 1≤rows,cols≤8, 원소는 −100~100이다. 정사각형이라고 가정하지 말고 행과 열의 범위를 따로 사용한다.', 'sum을 0으로 시작한다.\n행 i는 rows, 열 j는 cols 범위로 순회한다.\ngrid[i][j]를 모두 더해 반환한다.', '시간 O(rows·cols), 추가 공간 O(1).',pid='P36')
add(98,'숫자 야구 후보 검증','서로 다른 숫자 세 개의 문자열 후보 000~999를 검사한다. 앞자리 0을 허용한다. guesses, strikes, balls의 모든 힌트를 만족하는 후보 개수를 반환하시오. 힌트 수는 0~10, 각 guess도 서로 다른 숫자 세 개다.', '세 숫자가 서로 다른 후보만 만든다.\n각 힌트에서 같은 자리 숫자 수를 strike로 센다.\n공통 숫자 수−strike가 ball이며 모든 힌트를 통과한 후보만 센다.', '힌트 수 h에 대해 시간 O(10³·h), 추가 공간 O(1).',pid='P35')
add(99,'0 1 배낭 구현','물건별 weights, values와 용량 capacity가 주어진다. 각 물건을 최대 한 번 골라 총 무게가 용량 이하인 최대 가치를 구하시오. 0≤n≤16, 무게·가치는 1~100, 0≤capacity≤300이다. 비트마스크로 모든 선택을 검사한다.', '각 mask마다 무게와 가치를 따로 합산한다.\n총 무게가 capacity 이하일 때만 best를 갱신한다.\n빈 선택도 포함해 아무것도 담을 수 없을 때 0을 반환한다.', '시간 O(n·2ⁿ), 추가 공간 O(1).',pid='P34')
add(100,'회문만 골라내는 함수','문자열 목록 words에서 회문만 입력 순서대로 고르시오. 양 끝의 문자를 안쪽으로 이동하며 비교하는 함수를 작성한다. 영문 대소문자를 구별하며 빈 문자열도 회문이다. 0≤문자열 수≤30, 길이 0~50이다.', '각 문자열의 left=0, right=길이−1로 시작한다.\n문자가 다르면 제외하고, 같으면 양끝을 안쪽으로 옮긴다.\n끝까지 통과한 문자열을 선택한다.', '전체 문자열 길이 합에 비례한 시간, 결과를 제외한 공간 O(1).',pid='P33')
# Use explicit algorithms for the three questions that prohibit generator libraries.
next(p for p in questions if p['q']==74)['task']=next(p for p in questions if p['q']==74)['task'].replace('n≤8','n≤6')
next(p for p in questions if p['q']==88)['task']=next(p for p in questions if p['q']==88)['task'].replace('1≤n≤8, 비용은 0~100이다.','2≤n≤8, 대각선 비용은 0이고 나머지는 1~1,000이다.')
next(p for p in questions if p['q']==79)['task']+=' 원소는 −2,000,000,000~2,000,000,000이다.'
next(p for p in questions if p['q']==71)['solution']='''def make_permutations(A, r):
    result, path = [], []
    used = [False] * len(A)
    def dfs():
        if len(path) == r:
            result.append(path.copy())
            return
        for i in range(len(A)):
            if not used[i]:
                used[i] = True
                path.append(A[i])
                dfs()
                path.pop()
                used[i] = False
    dfs()
    return result
'''
next(p for p in questions if p['q']==74)['solution']='''def make_combinations(A, r):
    result, path = [], []
    def dfs(start):
        if len(path) == r:
            result.append(path.copy())
            return
        for i in range(start, len(A)):
            path.append(A[i])
            dfs(i + 1)
            path.pop()
    dfs(0)
    return result
'''
next(p for p in questions if p['q']==79)['solution']='''def closest_pair(A):
    best = None
    for i in range(len(A)):
        for j in range(i + 1, len(A)):
            gap = abs(A[i] - A[j])
            if best is None or gap < best[2]:
                best = [A[i], A[j], gap]
    return best
'''
# Require a direct two-pointer implementation in both reference languages.
questions[-1]['solution']='''def palindrome_words(words):
    result = []
    for word in words:
        left, right = 0, len(word) - 1
        while left < right and word[left] == word[right]:
            left += 1
            right -= 1
        if left >= right:
            result.append(word)
    return result
'''
# Keep candidate generation and condition checks visible in teaching solutions.
explicit_python = {
65: '''def find_pairs(A, target):
    result = []
    for i in range(len(A)):
        for j in range(i + 1, len(A)):
            if A[i] + A[j] == target:
                result.append([A[i], A[j]])
    return result
''',
66: '''def dice_sum(target):
    result = []
    for a in range(1, 7):
        for b in range(1, 7):
            for c in range(1, 7):
                if a + b + c == target:
                    result.append([a, b, c])
    return result
''',
69: '''def blackjack(A, target):
    best = 0
    for i in range(len(A)):
        for j in range(i + 1, len(A)):
            for k in range(j + 1, len(A)):
                total = A[i] + A[j] + A[k]
                if total <= target and total > best:
                    best = total
    return best
''',
70: '''def three_sum_count(A, target):
    count = 0
    for i in range(len(A)):
        for j in range(i + 1, len(A)):
            for k in range(j + 1, len(A)):
                if A[i] + A[j] + A[k] == target:
                    count += 1
    return count
''',
76: '''def choose_three(A):
    result = []
    for i in range(len(A)):
        for j in range(i + 1, len(A)):
            for k in range(j + 1, len(A)):
                result.append([A[i], A[j], A[k]])
    return result
''',
77: '''def password_candidates(A):
    result = []
    for i in range(3):
        for j in range(3):
            for k in range(3):
                if i != j and i != k and j != k:
                    result.append(100*A[i] + 10*A[j] + A[k])
    return result
''',
78: '''def bf_string_match(text, pattern):
    result = []
    for i in range(len(text) - len(pattern) + 1):
        j = 0
        while j < len(pattern) and text[i+j] == pattern[j]:
            j += 1
        if j == len(pattern):
            result.append(i)
    return result
''',
80: '''def power_set(A):
    result = []
    for mask in range(1 << len(A)):
        subset = []
        for j in range(len(A)):
            if mask & (1 << j):
                subset.append(A[j])
        result.append(subset)
    return result
''',
83: '''def subset_sum_count(A, target):
    count = 0
    for mask in range(1 << len(A)):
        total = 0
        for j in range(len(A)):
            if mask & (1 << j):
                total += A[j]
        if total == target:
            count += 1
    return count
''',
85: '''def search_space(n):
    fact, power_two, power_n = 1, 1, 1
    for i in range(1, n + 1):
        fact *= i
        power_two *= 2
        power_n *= n
    return [fact, power_two, power_n]
''',
88: '''def tsp_min(dist):
    n = len(dist)
    used = [False] * n
    used[0] = True
    def dfs(last, depth, cost):
        if depth == n:
            return cost + dist[last][0]
        best = float('inf')
        for city in range(1, n):
            if not used[city]:
                used[city] = True
                value = dfs(city, depth + 1, cost + dist[last][city])
                best = min(best, value)
                used[city] = False
        return best
    return dfs(0, 1, 0)
''',
95: '''def fib_memo(n):
    memo = [-1] * (n + 1)
    def solve(k):
        if k <= 1:
            return k
        if memo[k] == -1:
            memo[k] = solve(k - 1) + solve(k - 2)
        return memo[k]
    return solve(n)
''',
98: '''def baseball_count(guesses, strikes, balls):
    count = 0
    for code in range(1000):
        p = f'{code:03d}'
        if p[0] == p[1] or p[0] == p[2] or p[1] == p[2]:
            continue
        ok = True
        for h in range(len(guesses)):
            s, common = 0, 0
            for i in range(3):
                s += p[i] == guesses[h][i]
                for j in range(3):
                    common += p[i] == guesses[h][j]
            if s != strikes[h] or common - s != balls[h]:
                ok = False
                break
        count += ok
    return count
''',
99: '''def knapsack(weights, values, capacity):
    best = 0
    for mask in range(1 << len(weights)):
        weight, value = 0, 0
        for j in range(len(weights)):
            if mask & (1 << j):
                weight += weights[j]
                value += values[j]
        if weight <= capacity and value > best:
            best = value
    return best
''',
97: '''def grid_sum(grid):
    total = 0
    for i in range(len(grid)):
        for j in range(len(grid[i])):
            total += grid[i][j]
    return total
''',
}
for p in questions:
    if p['q'] in explicit_python:
        p['solution'] = explicit_python[p['q']]
    if p['q'] == 65:
        p['task'] = p['task'].replace('모든 값의 쌍을 구하는 함수를', '모든 값 쌍을 구하는 함수를')
    if p['q'] == 74:
        p['c']['result'] = p['c']['result'].replace('최대 720', '최대 20')
    if p['q'] == 85:
        p['tests'].append({'args': [0], 'expected': [1, 1, 1]})
assert [p['q'] for p in questions] == list(range(61,101))
for p in questions:
    scope={}
    exec(p['solution'],scope)
    for t in p['tests']:
        assert scope[p['function']](*t['args']) == t['expected'], (p['q'],t)
(OUT/'questions.json').write_text(json.dumps(questions,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'Built 40 algorithm-writing questions with {sum(len(p["tests"]) for p in questions)} reference tests.')
