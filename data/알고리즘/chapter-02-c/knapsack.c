/* P34: 0/1 배낭 완전 탐색. Original PPT slide 50.
 * Expected: 13
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

int knapsack(const int weights[], const int values[], int n, int capacity) {
  int best=0;
  for(unsigned mask=0;mask<(1u<<n);mask++) {
    int weight=0, value=0;
    for(int j=0;j<n;j++) if(mask & (1u<<j)) {weight+=weights[j]; value+=values[j];}
    if(weight<=capacity && value>best) best=value;
  }
  return best;
}

int main(void) {
  int weights[4]={4,6,3,5};int values[4]={5,8,3,6};
  printf("%lld",(long long)knapsack(weights,values,4,10));
  putchar('\n');
  return 0;
}
