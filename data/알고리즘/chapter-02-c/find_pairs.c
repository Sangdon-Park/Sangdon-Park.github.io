/* P15: 합이 K인 두 수. Original PPT slide 11.
 * Expected: [[1,9],[3,7]]
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

int find_pairs(const int A[], int n, int target, int out[][2]) {
  int count = 0;
  for (int i = 0; i < n; i++)
    for (int j = i + 1; j < n; j++)
      if (A[i] + A[j] == target) {
        out[count][0] = A[i]; out[count++][1] = A[j];
      }
  return count;
}

int main(void) {
  int A[5]={1,3,5,7,9};int out[435][2]={0};
  int count=find_pairs(A,5,10,out);
      if(count<0 || count>435)printf("null");else {
        printf("[");for(int i=0;i<count;i++){if(i)printf(",");int size=2;if(size<0 || size>2)printf("null");else {
        printf("[");for(int j=0;j<size;j++){if(j)printf(",");printf("%d",out[i][j]);}printf("]");}}printf("]");}
  putchar('\n');
  return 0;
}
