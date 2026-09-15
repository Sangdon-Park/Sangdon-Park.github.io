/* P36: 2차원 배열 입력과 순회. Original PPT slide 43, 47.
 * Expected: 21
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

int grid_sum(const int grid[][8], int rows, int cols) {
  int sum=0;
  for(int i=0;i<rows;i++) for(int j=0;j<cols;j++) sum+=grid[i][j];
  return sum;
}

int main(void) {
  int grid[2][8]={{1,2,3},{4,5,6}};
  printf("%lld",(long long)grid_sum(grid,2,3));
  putchar('\n');
  return 0;
}
