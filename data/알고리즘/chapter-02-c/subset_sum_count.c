/* P27: 합이 target인 부분집합. Original PPT slide 37.
 * Expected: 2
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

int subset_sum_count(const int A[], int n, int target) {
  int count=0;
  for(unsigned mask=0;mask<(1u<<n);mask++) {
    int sum=0;
    for(int j=0;j<n;j++) if(mask & (1u<<j)) sum+=A[j];
    if(sum==target) count++;
  }
  return count;
}

int main(void) {
  int A[3]={2,3,5};
  printf("%lld",(long long)subset_sum_count(A,3,5));
  putchar('\n');
  return 0;
}
