/* P17: 세 장 선택하기. Original PPT slide 18.
 * Expected: [[1,2,3],[1,2,4],[1,3,4],[2,3,4]]
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

int choose_three(const int A[], int n, int out[][3]) {
  int count=0;
  for(int i=0;i<n;i++) for(int j=i+1;j<n;j++) for(int k=j+1;k<n;k++) {
    out[count][0]=A[i]; out[count][1]=A[j]; out[count++][2]=A[k];
  }
  return count;
}

int main(void) {
  int A[4]={1,2,3,4};int out[120][3]={0};
  int count=choose_three(A,4,out);
      if(count<0 || count>120)printf("null");else {
        printf("[");for(int i=0;i<count;i++){if(i)printf(",");int size=3;if(size<0 || size>3)printf("null");else {
        printf("[");for(int j=0;j<size;j++){if(j)printf(",");printf("%d",out[i][j]);}printf("]");}}printf("]");}
  putchar('\n');
  return 0;
}
