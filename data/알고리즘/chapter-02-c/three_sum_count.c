/* P29: 세 수의 합 개수. Original PPT slide 45.
 * Expected: 2
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

int three_sum_count(const int A[], int n, int target) {
  int count=0;
  for(int i=0;i<n;i++) for(int j=i+1;j<n;j++) for(int k=j+1;k<n;k++)
    if(A[i]+A[j]+A[k]==target) count++;
  return count;
}

int main(void) {
  int A[5]={1,2,3,4,5};
  printf("%lld",(long long)three_sum_count(A,5,9));
  putchar('\n');
  return 0;
}
