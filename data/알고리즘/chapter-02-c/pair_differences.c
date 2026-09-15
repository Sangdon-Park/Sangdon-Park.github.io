/* P31: 모든 쌍의 차이. Original PPT slide 48.
 * Expected: [-2,1,-1,3,1,-2]
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

int pair_differences(const int A[], int n, int out[]) {
  int count=0;
  for(int i=0;i<n;i++) for(int j=i+1;j<n;j++) out[count++]=A[j]-A[i];
  return count;
}

int main(void) {
  int A[4]={3,1,4,2};int out[435]={0};
  int count=pair_differences(A,4,out);
      if(count<0 || count>435)printf("null");else {
        printf("[");for(int i=0;i<count;i++){if(i)printf(",");printf("%d",out[i]);}printf("]");}
  putchar('\n');
  return 0;
}
