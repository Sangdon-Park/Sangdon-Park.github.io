/* P30: 블랙잭 최대 합. Original PPT slide 46.
 * Expected: 21
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

int blackjack(const int A[], int n, int target) {
  int best=0;
  for(int i=0;i<n;i++) for(int j=i+1;j<n;j++) for(int k=j+1;k<n;k++) {
    int total=A[i]+A[j]+A[k];
    if(total<=target && total>best) best=total;
  }
  return best;
}

int main(void) {
  int A[5]={5,6,7,8,9};
  printf("%lld",(long long)blackjack(A,5,21));
  putchar('\n');
  return 0;
}
