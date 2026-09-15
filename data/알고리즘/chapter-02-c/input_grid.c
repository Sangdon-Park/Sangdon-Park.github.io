/* Read rows, cols, then rows*cols integers. Example: 2 3 / 1 2 3 / 4 5 6 => 21. */
#include <stdio.h>
int main(void) {
  int rows, cols, grid[8][8], sum=0;
  if(scanf("%d %d", &rows, &cols)!=2) return 1;
  if(rows<1 || rows>8 || cols<1 || cols>8) return 1;
  for(int i=0;i<rows;i++) for(int j=0;j<cols;j++) {
    if(scanf("%d", &grid[i][j])!=1) return 1;
    sum+=grid[i][j];
  }
  printf("%d\n",sum);
  return 0;
}
