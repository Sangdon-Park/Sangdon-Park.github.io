// C-specific interfaces and teaching notes; shared test inputs stay in problems.json.
const C_PROBLEMS = {
  P01: {
    signature: 'int linear_search(const int A[], int n, int target)', result: 'return으로 인덱스 반환',
    statement: '정수 배열 A에서 target이 처음 나타나는 인덱스를 반환하세요. 없으면 -1입니다. 인덱스는 0부터 시작합니다.\n조건: 0 ≤ n ≤ 10,000. 중복 값이 있을 수 있습니다. n은 배열 길이입니다. 앞에서부터 직접 비교하는 반복문을 작성하세요.',
    hint: 'for (int i=0; i<n; i++)로 확인합니다. 끝까지 못 찾았을 때의 return -1은 반복문 밖에 둡니다.', tail: 'return -1;'
  },
  P02: {
    signature: 'int binary_search(const int A[], int n, int target)', result: 'return으로 인덱스 반환',
    statement: '오름차순으로 정렬된 서로 다른 정수 배열 A에서 target의 인덱스를 반환하세요. 없으면 -1입니다.\n조건: 0 ≤ n ≤ 10,000. low, high, mid로 탐색 구간을 절반씩 줄이세요. 배열 길이는 n입니다.\nC 채점은 반환값을 검사합니다. 원소 접근 횟수는 자동 측정하지 않으므로, 이진 탐색을 사용했는지는 코드로 확인합니다.',
    hint: 'low=0, high=n-1에서 시작합니다. C에서는 정수끼리 나누는 (low+high)/2가 중앙 인덱스입니다.', tail: 'return -1;'
  },
  P03: {
    signature: 'int binary_trace(const int A[], int n, int target, int trace[][4])', result: 'trace에 기록 저장 + return으로 기록 개수 반환',
    statement: '이진 탐색에서 매번 비교 직전의 low, high, mid, A[mid]를 trace의 한 행에 저장하세요. mid=(low+high)/2입니다. 찾은 순간의 기록도 포함합니다.\ntrace[k][0..3]에 k번째 기록을 저장하고, 마지막에 기록 개수를 return합니다. trace는 채점기가 64행을 준비합니다.\n조건: 오름차순의 서로 다른 정수 배열, 0 ≤ n ≤ 1,000. 빈 배열이면 0을 반환합니다.',
    hint: 'trace[count][0]=low; 처럼 네 값을 저장한 뒤 count를 늘립니다. 값을 찾으면 기록 개수를 반환하세요.', tail: 'return 0;'
  },
  P04: {
    signature: 'int first_position(const int A[], int n, int target)', result: 'return으로 첫 인덱스 반환',
    statement: '중복 값이 있는 오름차순 배열에서 target이 처음 나타나는 인덱스를 이진 탐색으로 찾으세요. 없으면 -1입니다.\n조건: 0 ≤ n ≤ 10,000. 전체 순회 대신 탐색 구간을 절반씩 줄이세요.\nC 채점은 반환값을 검사합니다. 원소 접근 횟수는 자동 측정하지 않으므로, 이진 탐색을 사용했는지는 코드로 확인합니다.',
    hint: '같은 값을 찾아도 답을 저장하고 high=mid-1로 왼쪽 구간을 더 확인합니다.', tail: 'return -1;'
  },
  P05: {
    signature: 'void sum_count(const int A[], int n, long long out[2])', result: 'out[0]=합계, out[1]=덧셈 횟수',
    statement: 'total=0에서 시작해 원소를 하나씩 더하세요. out[0]에 합계, out[1]에 덧셈 횟수를 저장합니다. total=total+A[i] 한 번을 덧셈 1회로 셉니다.\n조건: 0 ≤ n ≤ 10,000. 빈 배열은 out에 [0,0]을 저장합니다. 합계 변수에는 long long을 사용하세요.',
    hint: '원소가 음수이거나 0이어도 한 번 더할 때마다 횟수는 1 증가합니다.', tail: 'out[0] = 0;\n    out[1] = 0;'
  },
  P06: {
    signature: 'void max_count(const int A[], int n, long long out[2])', result: 'out[0]=최댓값, out[1]=비교 횟수',
    statement: '첫 원소를 최댓값 후보로 두고 두 번째 원소부터 비교하세요. out[0]에 최댓값, out[1]에 A[i]>largest 비교 횟수를 저장합니다.\n조건: 0 ≤ n ≤ 10,000. C에서는 빈 배열의 결과를 [0,0]으로 약속합니다. n=0이면 A[0]에 접근하지 마세요. 원소 하나는 [그 원소,0]입니다.',
    hint: '빈 배열을 먼저 처리하세요. 최댓값을 0으로 초기화하면 모두 음수인 배열에서 틀립니다.', tail: 'out[0] = 0;\n    out[1] = 0;'
  },
  P07: {
    signature: 'void search_count(const int A[], int n, int target, long long out[2])', result: 'out[0]=인덱스, out[1]=검사 횟수',
    statement: '순차 탐색으로 target을 처음 찾은 인덱스와 원소 검사 횟수를 out에 저장하세요. 없으면 [-1,n], 빈 배열이면 [-1,0]입니다.\n조건: 0 ≤ n ≤ 10,000. 중복 가능. 값을 확인한 횟수만 세고 반복 조건 검사나 인덱스 계산은 세지 않습니다.',
    hint: '인덱스 0에서 찾으면 검사 횟수는 1입니다. 같은지 비교하기 직전에 카운터를 늘려보세요.', tail: 'out[0] = -1;\n    out[1] = 0;'
  },
  P08: {
    signature: 'double expected_checks(int n, double p)', result: 'return으로 평균 검사 횟수 반환',
    statement: '서로 다른 원소 n개에서 순차 탐색합니다. 성공 확률은 p이고, 성공한 경우 각 위치의 확률은 같습니다. 실패하면 n개를 모두 검사합니다. 전체 평균 검사 횟수를 반환하세요.\n조건: 1 ≤ n ≤ 1,000,000, 0 ≤ p ≤ 1. double로 계산하세요. 소수 오차는 1e-9 수준까지 허용합니다.',
    hint: '성공 시 평균과 실패 시 횟수의 가중합입니다. 소수 계산에서는 2 대신 2.0으로 나누세요.', tail: 'return 0.0;'
  },
  P09: {
    signature: 'int doubling_steps(long long n)', result: 'return으로 반복 횟수 반환',
    statement: 'i=1에서 시작합니다. i<n인 동안 i를 두 배로 바꿉니다. 반복문 본체 실행 횟수를 반환하세요.\n조건: 1 ≤ n ≤ 2의 51제곱. n=1이면 0회입니다. n과 i는 int 범위를 넘을 수 있으므로 long long을 사용하세요.',
    hint: 'long long i=1;에서 시작해 정수로 두 배씩 증가시키세요. n=8과 n=9의 횟수를 비교해 보세요.', tail: 'return 0;'
  },
  P10: {
    signature: 'int binary_worst(long long n)', result: 'return으로 최대 검사 횟수 반환',
    statement: 'low<=high, mid=(low+high)/2 이진 탐색에서 원소가 n개일 때 중앙 원소 검사 횟수의 최댓값을 반환하세요. 성공과 실패를 모두 고려합니다.\n조건: 0 ≤ n ≤ 2의 51제곱. 빈 배열은 0회이고, 마지막 원소 하나도 검사해야 합니다. n은 long long입니다.',
    hint: '가장 많이 남는 쪽의 원소 수는 n/2입니다. 정수 나눗셈으로 0개가 될 때까지 세어보세요.', tail: 'return 0;'
  },
  P11: {
    signature: 'void bubble_stats(const int A[], int n, int sorted[], long long stats[2])', result: 'sorted=정렬 결과, stats[0]=비교 횟수, stats[1]=교환 횟수',
    statement: 'A를 sorted에 복사하고 버블 정렬하세요. stats[0]에 비교 횟수, stats[1]에 교환 횟수를 저장합니다. 원본 A는 바꾸지 않습니다.\n반복 범위: i=0부터 n-2까지, j=0부터 n-i-2까지. 조기 종료는 하지 않습니다. sorted[j]>sorted[j+1] 한 번을 비교 1회로 셉니다.\n조건: 0 ≤ n ≤ 100. sorted와 stats는 채점기가 준비합니다. qsort() 대신 직접 반복문을 작성하세요.',
    hint: '먼저 for문으로 A를 sorted에 복사합니다. 비교는 조건이 거짓이어도 세고, 교환은 실제 맞바꿀 때만 셉니다.', tail: 'stats[0] = 0;\n    stats[1] = 0;'
  },
  P12: {
    signature: 'void loop_counts(int n, long long out[3])', result: 'out[0]=A 횟수, out[1]=B 횟수, out[2]=C 횟수',
    statement: '아래 세 코드에서 work() 실행 횟수를 out[0], out[1], out[2]에 각각 저장하세요.\nA: for(int i=0;i<n;i++) work();\nB: for(int i=0;i<n;i++)\n       for(int j=0;j<n;j++) work();\nC: for(int i=0;i<n;i++)\n       for(int j=1;j<n;j*=2) work();\n조건: 1 ≤ n ≤ 10,000. 직접 세거나 정확한 식을 사용해도 됩니다. work() 함수 자체를 구현할 필요는 없습니다.',
    hint: 'C의 안쪽 반복 횟수는 P09와 같습니다. 큰 곱셈에는 (long long)n처럼 형 변환할 수 있습니다.', tail: 'out[0] = 0;\n    out[1] = 0;\n    out[2] = 0;'
  }
};
for (const item of Object.values(C_PROBLEMS)) item.starter = `${item.signature}\n{\n    // 여기에 코드를 작성하세요. 아래 임시 결과를 수정하세요.\n    ${item.tail}\n}\n`;
