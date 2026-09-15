/* P19: 직접 만드는 r개 조합. Original PPT slide 20–21.
 * Expected: [[1,2],[1,3],[2,3]]
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

static void comb_visit(const int A[], int n, int r, int depth, int start, int path[], int out[][6], int *count) {
  if (depth==r) {
    for(int j=0;j<r;j++) out[*count][j]=path[j];
    (*count)++; return;
  }
  for (int i=start; i<n; i++) {
    path[depth]=A[i];
    comb_visit(A,n,r,depth+1,i+1,path,out,count);
  }
}
int make_combinations(const int A[], int n, int r, int out[][6]) {
  int path[6]={0}, count=0;
  comb_visit(A,n,r,0,0,path,out,&count);
  return count;
}

int main(void) {
  int A[3]={1,2,3};int out[720][6]={0};
  int count=make_combinations(A,3,2,out);
      if(count<0 || count>720)printf("null");else {
        printf("[");for(int i=0;i<count;i++){if(i)printf(",");int size=2;if(size<0 || size>6)printf("null");else {
        printf("[");for(int j=0;j<size;j++){if(j)printf(",");printf("%d",out[i][j]);}printf("]");}}printf("]");}
  putchar('\n');
  return 0;
}
