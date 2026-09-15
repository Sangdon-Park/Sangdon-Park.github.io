/* P28: 기억하는 피보나치. Original PPT slide 39.
 * Expected: 5
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

static long long fib_visit(int n, long long memo[], int ready[]) {
  if(n<=1) return n;
  if(ready[n]) return memo[n];
  memo[n]=fib_visit(n-1,memo,ready)+fib_visit(n-2,memo,ready);
  ready[n]=1;
  return memo[n];
}
long long fib_memo(int n) {
  long long memo[71]={0}; int ready[71]={0};
  return fib_visit(n,memo,ready);
}

int main(void) {
  printf("%lld",(long long)fib_memo(5));
  putchar('\n');
  return 0;
}
