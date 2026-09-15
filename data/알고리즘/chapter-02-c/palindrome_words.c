/* P33: 회문만 골라내기. Original PPT slide 49.
 * Expected: ["level","noon"]
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

int palindrome_words(const char *words[], int n, int out[]) {
  int count=0;
  for(int i=0;i<n;i++) {
    int left=0, right=(int)strlen(words[i])-1, ok=1;
    while(left<right) if(words[i][left++]!=words[i][right--]) {ok=0; break;}
    if(ok) out[count++]=i;
  }
  return count;
}

int main(void) {
  const char *words[5]={"level","hello","Racecar","noon","world"};int out[30]={0};
  int count=palindrome_words(words,5,out);
      if(count<0 || count>30)printf("null");else {
        printf("[");for(int i=0;i<count;i++){if(i)printf(",");if(out[i]<0 || out[i]>=5)printf("null");else printf("\"%s\"",words[out[i]]);}printf("]");}
  putchar('\n');
  return 0;
}
