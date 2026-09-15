/* P32: 합이 K인 세 수 나열. Original PPT slide 48.
 * Expected: [[2,5,8],[3,5,7]]
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

int three_sum_values(const int A[], int n, int target, int out[][3]) {
  int count=0;
  for(int i=0;i<n;i++) for(int j=i+1;j<n;j++) for(int k=j+1;k<n;k++)
    if(A[i]+A[j]+A[k]==target) {
      out[count][0]=A[i]; out[count][1]=A[j]; out[count++][2]=A[k];
    }
  return count;
}

int main(void) {
  int A[5]={2,3,5,7,8};int out[1140][3]={0};
  int count=three_sum_values(A,5,15,out);
      if(count<0 || count>1140)printf("null");else {
        printf("[");for(int i=0;i<count;i++){if(i)printf(",");int size=3;if(size<0 || size>3)printf("null");else {
        printf("[");for(int j=0;j<size;j++){if(j)printf(",");printf("%d",out[i][j]);}printf("]");}}printf("]");}
  putchar('\n');
  return 0;
}
