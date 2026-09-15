/* P23: 가장 가까운 두 수. Original PPT slide 27.
 * Expected: [10,9,1]
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

void closest_pair(const int A[], int n, long long out[3]) {
  out[2]=LLONG_MAX;
  for(int i=0;i<n;i++) for(int j=i+1;j<n;j++) {
    long long diff=llabs((long long)A[i]-A[j]);
    if(diff<out[2]) { out[0]=A[i]; out[1]=A[j]; out[2]=diff; }
  }
}

int main(void) {
  int A[6]={10,3,22,15,17,9};long long out[3];for(int i=0;i<3;i++)out[i]=LLONG_MIN;
  closest_pair(A,6,out);printf("[");
      for(int i=0;i<3;i++){if(i)printf(",");printf("%lld",out[i]);}printf("]");
  putchar('\n');
  return 0;
}
