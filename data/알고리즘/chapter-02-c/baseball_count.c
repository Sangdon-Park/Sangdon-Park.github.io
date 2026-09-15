/* P35: 숫자 야구 후보 세기. Original PPT slide 51.
 * Expected: 1
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

int baseball_count(const char *guesses[], const int strikes[], const int balls[], int n) {
  int count=0;
  for(int a=0;a<10;a++) for(int b=0;b<10;b++) for(int c=0;c<10;c++) {
    if(a==b || a==c || b==c) continue;
    char candidate[3]={'0'+a,'0'+b,'0'+c};
    int ok=1;
    for(int h=0;h<n && ok;h++) {
      int s=0, common=0;
      for(int i=0;i<3;i++) {
        if(candidate[i]==guesses[h][i]) s++;
        for(int j=0;j<3;j++) if(candidate[i]==guesses[h][j]) common++;
      }
      if(s!=strikes[h] || common-s!=balls[h]) ok=0;
    }
    if(ok) count++;
  }
  return count;
}

int main(void) {
  const char *guesses[1]={"012"};int strikes[1]={3};int balls[1]={0};
  printf("%lld",(long long)baseball_count(guesses,strikes,balls,1));
  putchar('\n');
  return 0;
}
