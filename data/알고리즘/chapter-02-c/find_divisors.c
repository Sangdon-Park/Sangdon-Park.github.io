/* P14: 약수 모두 찾기. Original PPT slide 10.
 * Expected: [1,2,5,10]
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

int find_divisors(int n, int out[]) {
  int count = 0;
  for (int i = 1; i <= n; i++)
    if (n % i == 0) out[count++] = i;
  return count;
}

int main(void) {
  int out[10000]={0};
  int count=find_divisors(10,out);
      if(count<0 || count>10000)printf("null");else {
        printf("[");for(int i=0;i<count;i++){if(i)printf(",");printf("%d",out[i]);}printf("]");}
  putchar('\n');
  return 0;
}
