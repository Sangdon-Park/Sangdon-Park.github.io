/* P24: 비트마스크로 모든 부분집합. Original PPT slide 28, 33.
 * Expected: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

int power_set(const int A[], int n, int out[][8], int sizes[]) {
  int count=1<<n;
  for(int mask=0;mask<count;mask++) {
    sizes[mask]=0;
    for(int j=0;j<n;j++) if(mask & (1u<<j))
      out[mask][sizes[mask]++]=A[j];
  }
  return count;
}

int main(void) {
  int A[3]={1,2,3};int out[256][8]={0};int sizes[256]={0};
  int count=power_set(A,3,out,sizes);
      if(count<0 || count>256)printf("null");else {
        printf("[");for(int i=0;i<count;i++){if(i)printf(",");int size=sizes[i];if(size<0 || size>8)printf("null");else {
        printf("[");for(int j=0;j<size;j++){if(j)printf(",");printf("%d",out[i][j]);}printf("]");}}printf("]");}
  putchar('\n');
  return 0;
}
