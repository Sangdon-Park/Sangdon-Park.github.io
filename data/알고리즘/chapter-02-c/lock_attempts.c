/* P13: 네 자리 자물쇠. Original PPT slide 7.
 * Expected: 8235
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

int lock_attempts(const char secret[]) {
  int count = 0;
  for (int a = 0; a < 10; a++)
    for (int b = 0; b < 10; b++)
      for (int c = 0; c < 10; c++)
        for (int d = 0; d < 10; d++) {
          char attempt[5] = {'0'+a, '0'+b, '0'+c, '0'+d, '\0'};
          count++;
          if (strcmp(attempt, secret) == 0) return count;
        }
  return 0;
}

int main(void) {
  printf("%lld",(long long)lock_attempts("8234"));
  putchar('\n');
  return 0;
}
