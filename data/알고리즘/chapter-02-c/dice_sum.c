/* P16: 세 주사위의 합. Original PPT slide 12.
 * Expected: [[1,1,2],[1,2,1],[2,1,1]]
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

int dice_sum(int target, int out[][3]) {
  int count = 0;
  for (int a = 1; a <= 6; a++)
    for (int b = 1; b <= 6; b++)
      for (int c = 1; c <= 6; c++)
        if (a+b+c == target) {
          out[count][0]=a; out[count][1]=b; out[count++][2]=c;
        }
  return count;
}

int main(void) {
  int out[216][3]={0};
  int count=dice_sum(4,out);
      if(count<0 || count>216)printf("null");else {
        printf("[");for(int i=0;i<count;i++){if(i)printf(",");int size=3;if(size<0 || size>3)printf("null");else {
        printf("[");for(int j=0;j<size;j++){if(j)printf(",");printf("%d",out[i][j]);}printf("]");}}printf("]");}
  putchar('\n');
  return 0;
}
