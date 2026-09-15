/* P20: 1·2·3 비밀번호 후보. Original PPT slide 22.
 * Expected: [123,132,213,231,312,321]
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

int password_candidates(const int A[], int n, int out[]) {
  int count=0;
  for(int i=0;i<n;i++) for(int j=0;j<n;j++) for(int k=0;k<n;k++)
    if(i!=j && i!=k && j!=k) out[count++]=100*A[i]+10*A[j]+A[k];
  return count;
}

int main(void) {
  int A[3]={1,2,3};int out[6]={0};
  int count=password_candidates(A,3,out);
      if(count<0 || count>6)printf("null");else {
        printf("[");for(int i=0;i<count;i++){if(i)printf(",");printf("%d",out[i]);}printf("]");}
  putchar('\n');
  return 0;
}
