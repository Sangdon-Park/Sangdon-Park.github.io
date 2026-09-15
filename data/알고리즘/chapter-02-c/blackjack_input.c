#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

int blackjack(const int A[], int n, int target) {
  int best=0;
  for(int i=0;i<n;i++) for(int j=i+1;j<n;j++) for(int k=j+1;k<n;k++) {
    int total=A[i]+A[j]+A[k];
    if(total<=target && total>best) best=total;
  }
  return best;
}

int main(void) {
  int n, target, cards[100];
  if(scanf("%d %d", &n, &target)!=2 || n<0 || n>100) return 1;
  for(int i=0;i<n;i++) if(scanf("%d", &cards[i])!=1) return 1;
  printf("%d\n",blackjack(cards,n,target));
  return 0;
}
