export function exampleSheet(c = false) {
  return {
    copper: 'b', jade: 'c', pebble: '4회. 처음 원소는 초기 최댓값으로 이미 쓰므로 나머지 네 원소만 각각 한 번 비교한다.',
    cedar: '21은 첫 원소에서 일치하여 바로 끝나므로 1회 비교한다. 99는 배열에 없어 네 원소를 끝까지 확인해야 하므로 4회 비교한다.',
    ink: c ? 'int count_above(const int items[], int length, int pivot) { int count = 0; for (int i=0;i<length;i++) if (items[i]>pivot) count++; return count; }' : 'def count_above(items, pivot):\n    count = 0\n    for item in items:\n        if item > pivot:\n            count += 1\n    return count',
    cost: 'O(n). n은 원소 수이며 각 원소를 한 번씩 비교한다.'
  };
}
