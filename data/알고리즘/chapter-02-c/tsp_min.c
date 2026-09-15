/* P26: 외판원 순회 최소 비용. Original PPT slide 34.
 * Expected: 18
 * Function matches the browser exercise; main runs the first example.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

static void tsp_visit(const int d[][8], int n, int depth, int last,
                      int used[], int cost, int *best) {
  if(depth==n) {
    int total=cost+d[last][0];
    if(total<*best) *best=total;
    return;
  }
  for(int next=1;next<n;next++) if(!used[next]) {
    used[next]=1;
    tsp_visit(d,n,depth+1,next,used,cost+d[last][next],best);
    used[next]=0;
  }
}
int tsp_min(const int dist[][8], int n) {
  int used[8]={1}, best=INT_MAX;
  tsp_visit(dist,n,1,0,used,0,&best);
  return best;
}

int main(void) {
  int dist[4][8]={{0,4,7,3},{4,0,6,2},{7,6,0,5},{3,2,5,0}};
  printf("%lld",(long long)tsp_min(dist,4));
  putchar('\n');
  return 0;
}
