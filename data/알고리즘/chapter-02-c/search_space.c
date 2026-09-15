/* P25: 탐색 공간 계산. Original PPT slide 30–32, 54–55.
 * Expected: [120,32,3125]
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

void search_space(int n, long long out[3]) {
  out[0]=out[1]=out[2]=1;
  for(int i=1;i<=n;i++) {
    out[0]*=i; out[1]*=2; out[2]*=n;
  }
}

int main(void) {
  long long out[3];for(int i=0;i<3;i++)out[i]=LLONG_MIN;
  search_space(5,out);printf("[");
      for(int i=0;i<3;i++){if(i)printf(",");printf("%lld",out[i]);}printf("]");
  putchar('\n');
  return 0;
}
