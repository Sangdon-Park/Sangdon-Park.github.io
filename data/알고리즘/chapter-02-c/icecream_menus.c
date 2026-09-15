/* P21: 아이스크림 두 가지 맛. Original PPT slide 23.
 * Expected: [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

int icecream_menus(int n, int out[][2]) {
  int count=0;
  for(int i=0;i<n;i++) for(int j=i+1;j<n;j++) {
    out[count][0]=i; out[count++][1]=j;
  }
  return count;
}

int main(void) {
  int out[190][2]={0};
  int count=icecream_menus(4,out);
      if(count<0 || count>190)printf("null");else {
        printf("[");for(int i=0;i<count;i++){if(i)printf(",");int size=2;if(size<0 || size>2)printf("null");else {
        printf("[");for(int j=0;j<size;j++){if(j)printf(",");printf("%d",out[i][j]);}printf("]");}}printf("]");}
  putchar('\n');
  return 0;
}
