export function exampleSheet(c = false) {
  return {
    copper: 'd', jade: 'c', pebble: '10,000회',
    cedar: '(18,12) → (12,6) → (6,0), 최대공약수는 6이다. 18%12=6, 12%6=0이므로 두 번째 값이 0일 때 첫 값 6을 반환한다.',
    ink: c ? 'int first_index(const int a[], int n, int x) { for (int i=0;i<n;i++) if(a[i]==x) return i; return -1; }' : 'def first_index(a, x):\n    for i, value in enumerate(a):\n        if value == x:\n            return i\n    return -1',
    cost: '최악 O(n). n은 원소 수이며 x가 없으면 n개를 한 번씩 비교한다.'
  };
}
