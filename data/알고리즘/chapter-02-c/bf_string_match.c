/* P22: 문자열의 모든 일치 위치. Original PPT slide 25–26.
 * Expected: [2,5]
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

int bf_string_match(const char text[], const char pattern[], int out[]) {
  int n=(int)strlen(text), m=(int)strlen(pattern), count=0;
  for(int i=0;i<=n-m;i++) {
    int j=0;
    while(j<m && text[i+j]==pattern[j]) j++;
    if(j==m) out[count++]=i;
  }
  return count;
}

int main(void) {
  int out[201]={0};
  int count=bf_string_match("ababcabcababd","abc",out);
      if(count<0 || count>201)printf("null");else {
        printf("[");for(int i=0;i<count;i++){if(i)printf(",");printf("%d",out[i]);}printf("]");}
  putchar('\n');
  return 0;
}
