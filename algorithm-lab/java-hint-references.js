// Java 8 references use the exact public contract, including mutations and supplied helpers.
const JAVA_HINT_BODIES = {
  P01:`for (int i = 0; i < A.length; i++) {
  if (A[i] == target) return i;
}
return -1;`,
  P02:`int low = 0, high = A.length - 1;
while (low <= high) {
  int mid = low + (high - low) / 2;
  if (A[mid] == target) return mid;
  if (A[mid] < target) low = mid + 1;
  else high = mid - 1;
}
return -1;`,
  P03:`ArrayList<int[]> trace = new ArrayList<int[]>();
int low = 0, high = A.length - 1;
while (low <= high) {
  int mid = low + (high - low) / 2;
  trace.add(new int[]{low, high, mid, A[mid]});
  if (A[mid] == target) break;
  if (A[mid] < target) low = mid + 1;
  else high = mid - 1;
}
return trace.toArray(new int[trace.size()][]);`,
  P05:`int total = 0, count = 0;
for (int value : A) {
  total += value;
  count++;
}
return new int[]{total, count};`,
  P06:`if (A.length == 0) return new Integer[]{null, 0};
int largest = A[0], count = 0;
for (int i = 1; i < A.length; i++) {
  count++;
  if (A[i] > largest) largest = A[i];
}
return new Integer[]{largest, count};`,
  P07:`int count = 0;
for (int i = 0; i < A.length; i++) {
  count++;
  if (A[i] == target) return new int[]{i, count};
}
return new int[]{-1, count};`,
  P08:`double successMean = (n + 1) / 2.0;
return p * successMean + (1 - p) * n;`,
  P09:`long i = 1;
int count = 0;
while (i < n) {
  i *= 2;
  count++;
}
return count;`,
  P10:`int count = 0;
while (n > 0) {
  count++;
  n /= 2;
}
return count;`,
  P11:`int[] out = Arrays.copyOf(A, A.length);
int comparisons = 0, swaps = 0;
for (int i = 0; i < out.length - 1; i++) {
  for (int j = 0; j < out.length - i - 1; j++) {
    comparisons++;
    if (out[j] > out[j + 1]) {
      int temp = out[j];
      out[j] = out[j + 1];
      out[j + 1] = temp;
      swaps++;
    }
  }
}
return new Object[]{out, comparisons, swaps};`,
  P12:`int inner = 0;
for (int j = 1; j < n; j *= 2) inner++;
return new int[]{n, n * n, n * inner};`,
  P14:`int[] out = new int[n];
int count = 0;
for (int i = 1; i <= n; i++) {
  if (n % i == 0) out[count++] = i;
}
return Arrays.copyOf(out, count);`,
  P16:`ArrayList<int[]> out = new ArrayList<int[]>();
for (int a = 1; a <= 6; a++) {
  for (int b = 1; b <= 6; b++) {
    for (int c = 1; c <= 6; c++) {
      if (a + b + c == target) out.add(new int[]{a, b, c});
    }
  }
}
return out.toArray(new int[out.size()][]);`,
  P17:`ArrayList<int[]> out = new ArrayList<int[]>();
for (int i = 0; i < A.length; i++) {
  for (int j = i + 1; j < A.length; j++) {
    for (int k = j + 1; k < A.length; k++) {
      out.add(new int[]{A[i], A[j], A[k]});
    }
  }
}
return out.toArray(new int[out.size()][]);`,
  P20:`int[] out = new int[A.length * A.length * A.length];
int count = 0;
for (int i = 0; i < A.length; i++) {
  for (int j = 0; j < A.length; j++) {
    for (int k = 0; k < A.length; k++) {
      if (i != j && i != k && j != k) {
        out[count++] = 100 * A[i] + 10 * A[j] + A[k];
      }
    }
  }
}
return Arrays.copyOf(out, count);`,
  P21:`ArrayList<int[]> out = new ArrayList<int[]>();
for (int i = 0; i < n; i++) {
  for (int j = i + 1; j < n; j++) out.add(new int[]{i, j});
}
return out.toArray(new int[out.size()][]);`,
  P25:`long factorial = 1, powerTwo = 1, powerN = 1;
for (int i = 1; i <= n; i++) {
  factorial *= i;
  powerTwo *= 2;
  powerN *= n;
}
return new long[]{factorial, powerTwo, powerN};`,
  P27:`int count = 0;
for (int mask = 0; mask < (1 << A.length); mask++) {
  int total = 0;
  for (int j = 0; j < A.length; j++) {
    if ((mask & (1 << j)) != 0) total += A[j];
  }
  if (total == target) count++;
}
return count;`,
  P28:`long[] memo = new long[n + 1];
Arrays.fill(memo, -1);
return memoFib(n, memo);`,
  P29:`int count = 0;
for (int i = 0; i < A.length; i++) {
  for (int j = i + 1; j < A.length; j++) {
    for (int k = j + 1; k < A.length; k++) {
      if (A[i] + A[j] + A[k] == target) count++;
    }
  }
}
return count;`,
  P31:`int[] out = new int[A.length * (A.length - 1) / 2];
int count = 0;
for (int i = 0; i < A.length; i++) {
  for (int j = i + 1; j < A.length; j++) out[count++] = A[j] - A[i];
}
return out;`,
  P32:`ArrayList<int[]> out = new ArrayList<int[]>();
for (int i = 0; i < A.length; i++) {
  for (int j = i + 1; j < A.length; j++) {
    for (int k = j + 1; k < A.length; k++) {
      if (A[i] + A[j] + A[k] == target) out.add(new int[]{A[i], A[j], A[k]});
    }
  }
}
return out.toArray(new int[out.size()][]);`,
  P33:`String[] out = new String[words.length];
int count = 0;
for (String word : words) {
  int left = 0, right = word.length() - 1;
  while (left < right && word.charAt(left) == word.charAt(right)) {
    left++;
    right--;
  }
  if (left >= right) out[count++] = word;
}
return Arrays.copyOf(out, count);`,
  P35:`int count = 0;
for (int a = 0; a <= 9; a++) {
  for (int b = 0; b <= 9; b++) {
    for (int c = 0; c <= 9; c++) {
      if (a == b || a == c || b == c) continue;
      String candidate = "" + a + b + c;
      boolean ok = true;
      for (int q = 0; q < guesses.length; q++) {
        int actualStrikes = 0, common = 0;
        for (int i = 0; i < 3; i++) {
          if (candidate.charAt(i) == guesses[q].charAt(i)) actualStrikes++;
          for (int j = 0; j < 3; j++) {
            if (candidate.charAt(i) == guesses[q].charAt(j)) common++;
          }
        }
        if (actualStrikes != strikes[q] || common - actualStrikes != balls[q]) {
          ok = false;
          break;
        }
      }
      if (ok) count++;
    }
  }
}
return count;`,
  P36:`int total = 0;
for (int i = 0; i < grid.length; i++) {
  for (int j = 0; j < grid[i].length; j++) total += grid[i][j];
}
return total;`,
  P37:`int count = 0;
for (int a = 0; a <= 9; a++) {
  for (int b = 0; b <= 9; b++) {
    for (int c = 0; c <= 9; c++) {
      for (int d = 0; d <= 9; d++) {
        count++;
        String candidate = "" + a + b + c + d;
        if (candidate.equals(secret)) return count;
      }
    }
  }
}
return -1;`,
  P38:`ArrayList<int[]> out = new ArrayList<int[]>();
for (int i = 0; i < A.length; i++) {
  for (int j = i + 1; j < A.length; j++) {
    if (A[i] + A[j] == target) out.add(new int[]{A[i], A[j]});
  }
}
return out.toArray(new int[out.size()][]);`,
  P39:`int best = 0;
for (int i = 0; i < A.length; i++) {
  for (int j = i + 1; j < A.length; j++) {
    for (int k = j + 1; k < A.length; k++) {
      int total = A[i] + A[j] + A[k];
      if (total <= target && total > best) best = total;
    }
  }
}
return best;`,
  P40:`ArrayList<int[]> out = new ArrayList<int[]>();
permutationDfs(A, r, 0, new int[r], new boolean[A.length], out);
return out.toArray(new int[out.size()][]);`,
  P41:`ArrayList<int[]> out = new ArrayList<int[]>();
combinationDfs(A, r, 0, 0, new int[r], out);
return out.toArray(new int[out.size()][]);`,
  P42:`int[] out = new int[text.length() + 1];
int count = 0;
for (int i = 0; i <= text.length() - pattern.length(); i++) {
  int j = 0;
  while (j < pattern.length() && text.charAt(i + j) == pattern.charAt(j)) j++;
  if (j == pattern.length()) out[count++] = i;
}
return Arrays.copyOf(out, count);`,
  P43:`long[] best = null;
for (int i = 0; i < A.length; i++) {
  for (int j = i + 1; j < A.length; j++) {
    long gap = Math.abs((long) A[i] - A[j]);
    if (best == null || gap < best[2]) best = new long[]{A[i], A[j], gap};
  }
}
return best;`,
  P44:`int[][] out = new int[1 << A.length][];
for (int mask = 0; mask < out.length; mask++) {
  int[] subset = new int[A.length];
  int count = 0;
  for (int j = 0; j < A.length; j++) {
    if ((mask & (1 << j)) != 0) subset[count++] = A[j];
  }
  out[mask] = Arrays.copyOf(subset, count);
}
return out;`,
  P45:`boolean[] used = new boolean[dist.length];
used[0] = true;
return tourDfs(dist, used, 0, 1, 0);`,
  P46:`int best = 0;
for (int mask = 0; mask < (1 << weights.length); mask++) {
  int weight = 0, value = 0;
  for (int j = 0; j < weights.length; j++) {
    if ((mask & (1 << j)) != 0) {
      weight += weights[j];
      value += values[j];
    }
  }
  if (weight <= capacity && value > best) best = value;
}
return best;`,
  P47:`for (int i = 0; i < a.length; i++) {
  if (a[i] == x) return i;
}
return -1;`,
  P48:`int lo = 0, hi = a.length - 1;
while (lo <= hi) {
  int mid = lo + (hi - lo) / 2;
  if (a[mid] == x) return mid;
  if (a[mid] < x) lo = mid + 1;
  else hi = mid - 1;
}
return -1;`,
  P51:`while (b != 0) {
  int remainder = a % b;
  a = b;
  b = remainder;
}
return a;`,
  P53:`for (int i = 1; i < a.length; i++) {
  int key = a[i];
  int j = i - 1;
  while (j >= 0 && a[j] > key) {
    a[j + 1] = a[j];
    j--;
  }
  a[j + 1] = key;
}`,
  P54:`int lo = 0, hi = a.length - 1, target = k - 1;
while (lo <= hi) {
  int pivot = a[hi], p = lo;
  for (int j = lo; j < hi; j++) {
    if (a[j] <= pivot) {
      int temp = a[p];
      a[p] = a[j];
      a[j] = temp;
      p++;
    }
  }
  int temp = a[p];
  a[p] = a[hi];
  a[hi] = temp;
  if (p == target) return a[p];
  if (p < target) lo = p + 1;
  else hi = p - 1;
}
throw new IllegalArgumentException("k");`,
  P55:`if (n < 2) return n;
long a = 0, b = 1;
for (int i = 2; i <= n; i++) {
  long next = a + b;
  a = b;
  b = next;
}
return b;`,
  P56:`int lo = 0, hi = weights.length;
while (hi - lo > 1) {
  int mid = (lo + hi) / 2;
  int total = 0;
  for (int i = lo; i < mid; i++) total += weights[i];
  if (total < mid - lo) hi = mid;
  else lo = mid;
}
return lo;`,
  P57:`int[] out = new int[a.length + b.length];
int i = 0, j = 0, k = 0;
while (i < a.length && j < b.length) {
  if (a[i] <= b[j]) out[k++] = a[i++];
  else out[k++] = b[j++];
}
while (i < a.length) out[k++] = a[i++];
while (j < b.length) out[k++] = b[j++];
return out;`,
  P58:`if (a.length <= 1) return Arrays.copyOf(a, a.length);
int mid = a.length / 2;
int[] left = merge_sort(Arrays.copyOfRange(a, 0, mid));
int[] right = merge_sort(Arrays.copyOfRange(a, mid, a.length));
return merge_arrays(left, right);`,
  P59:`int total = 0, left = a[mid - 1];
for (int i = mid - 1; i >= lo; i--) {
  total += a[i];
  left = Math.max(left, total);
}
total = 0;
int right = a[mid];
for (int i = mid; i < hi; i++) {
  total += a[i];
  right = Math.max(right, total);
}
return left + right;`,
  P60:`if (hi - lo == 1) return a[lo];
int mid = (lo + hi) / 2;
int left = max_subarray(a, lo, mid);
int right = max_subarray(a, mid, hi);
int cross = cross_sum(a, lo, mid, hi);
return Math.max(Math.max(left, right), cross);`,
  P89:`if (b == 0) return 1 % m;
long half = mod_power(a, b / 2, m);
long result = half * half % m;
if (b % 2 == 1) result = result * a % m;
return (int) result;`,
  P62:`int value = a[r][c];
boolean same = true;
for (int i = r; i < r + n; i++) {
  for (int j = c; j < c + n; j++) {
    if (a[i][j] != value) same = false;
  }
}
if (same) return "" + value;
int h = n / 2;
return "(" + quad(a, r, c, h) + quad(a, r, c + h, h)
    + quad(a, r + h, c, h) + quad(a, r + h, c + h, h) + ")";`,
  P87:`int m = (lo + hi) / 2;
int temp = a[m];
a[m] = a[hi];
a[hi] = temp;
int pivot = a[hi], L = lo, R = hi - 1;
while (true) {
  while (L <= R && a[L] <= pivot) L++;
  while (L <= R && a[R] > pivot) R--;
  if (L > R) break;
  temp = a[L];
  a[L] = a[R];
  a[R] = temp;
}
temp = a[L];
a[L] = a[hi];
a[hi] = temp;
return L;`,
  P88:`if (lo >= hi) return;
int p = partition(a, lo, hi);
quick_sort(a, lo, p - 1);
quick_sort(a, p + 1, hi);`,
  P65:`int value = a[r][c];
boolean same = true;
for (int i = r; i < r + n; i++) {
  for (int j = c; j < c + n; j++) {
    if (a[i][j] != value) same = false;
  }
}
if (same) return value;
int h = n / 2;
return white_count(a, r, c, h) + white_count(a, r, c + h, h)
    + white_count(a, r + h, c, h) + white_count(a, r + h, c + h, h);`,
  P66:`int i = 0, j = 0, count = 0;
while (i < a.length && j < b.length) {
  if (a[i] <= b[j]) i++;
  else {
    count += a.length - i;
    j++;
  }
}
return count;`,
  P67:`int count = 0;
int[] coins = {500, 100, 50, 10, 1};
for (int coin : coins) {
  count += amount / coin;
  amount %= coin;
}
return count;`,
  P68:`int last = 0, count = 0;
for (int[] activity : activities) {
  int start = activity[0], end = activity[1];
  if (start >= last) {
    count++;
    last = end;
  }
}
return count;`,
  P69:`double value = 0;
for (int[] item : items) {
  int weight = item[0], price = item[1];
  int take = Math.min(capacity, weight);
  value += price * ((double) take / weight);
  capacity -= take;
  if (capacity == 0) break;
}
return value;`,
  P70:`if (parent[x] != x) parent[x] = dsu_find(parent, parent[x]);
return parent[x];`,
  P71:`int[] parent = new int[n];
for (int i = 0; i < n; i++) parent[i] = i;
long cost = 0;
int used = 0;
for (int[] edge : edges) {
  int ru = dsu_find(parent, edge[0]);
  int rv = dsu_find(parent, edge[1]);
  if (ru != rv) {
    parent[ru] = rv;
    cost += edge[2];
    used++;
  }
}
if (used == n - 1) return cost;
return -1000000000000000000L;`,
  P72:`int best = -1;
for (int i = 0; i < dist.length; i++) {
  if (!used[i] && dist[i] < 1000000000000000000L) {
    if (best == -1 || dist[i] < dist[best]) best = i;
  }
}
return best;`,
  P73:`int n = g.length;
long[] dist = new long[n];
Arrays.fill(dist, 1000000000000000000L);
boolean[] used = new boolean[n];
dist[s] = 0;
for (int step = 0; step < n; step++) {
  int u = pick_vertex(dist, used);
  if (u == -1) break;
  used[u] = true;
  for (int v = 0; v < n; v++) {
    if (g[u][v] >= 0) dist[v] = Math.min(dist[v], dist[u] + g[u][v]);
  }
}
return dist;`,
  P74:`int n = d.length, u = 0, cost = 0;
boolean[] used = new boolean[n];
used[0] = true;
for (int step = 0; step < n - 1; step++) {
  int v = -1;
  for (int i = 0; i < n; i++) {
    if (!used[i] && (v == -1 || d[u][i] < d[u][v])) v = i;
  }
  cost += d[u][v];
  used[v] = true;
  u = v;
}
return cost + d[u][0];`,
  P75:`long elapsed = 0, total = 0;
for (int duration : a) {
  elapsed += duration;
  total += elapsed;
}
return total;`,
  P76:`if (dist[u] == 1000000000000000000L) return 0;
long candidate = dist[u] + w;
if (candidate < dist[v]) {
  dist[v] = candidate;
  return 1;
}
return 0;`,
  P77:`if (memo[n] != -1) return memo[n];
if (n < 2) memo[n] = n;
else memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo);
return memo[n];`,
  P78:`int a = 1 % m, b = 1 % m;
for (int i = 2; i <= n; i++) {
  int next = (int) (((long) a + b) % m);
  a = b;
  b = next;
}
return b;`,
  P79:`int[] dp = new int[n + 1];
int[] divisors = {2, 3, 5};
for (int x = 2; x <= n; x++) {
  dp[x] = dp[x - 1] + 1;
  for (int d : divisors) {
    if (x % d == 0) dp[x] = Math.min(dp[x], dp[x / d] + 1);
  }
}
return dp[n];`,
  P80:`int[] path = new int[n];
int count = 0;
path[count++] = n;
while (n > 1) {
  int next = n - 1;
  if (dp[next] + 1 != dp[n]) {
    int[] divisors = {2, 3, 5};
    for (int d : divisors) {
      if (n % d == 0 && dp[n / d] + 1 == dp[n]) {
        next = n / d;
        break;
      }
    }
  }
  n = next;
  path[count++] = n;
}
return Arrays.copyOf(path, count);`,
  P81:`int[][] dp = new int[items.length + 1][W + 1];
for (int i = 1; i <= items.length; i++) {
  int w = items[i - 1][0], v = items[i - 1][1];
  for (int c = 0; c <= W; c++) {
    dp[i][c] = dp[i - 1][c];
    if (w <= c) dp[i][c] = Math.max(dp[i][c], dp[i - 1][c - w] + v);
  }
}
return dp[items.length][W];`,
  P82:`int[] dp = new int[W + 1];
for (int[] item : items) {
  int w = item[0], v = item[1];
  for (int c = W; c >= w; c--) dp[c] = Math.max(dp[c], dp[c - w] + v);
}
return dp[W];`,
  P83:`int[][] dp = new int[a.length() + 1][b.length() + 1];
for (int i = 1; i <= a.length(); i++) {
  for (int j = 1; j <= b.length(); j++) {
    if (a.charAt(i - 1) == b.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1] + 1;
    else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
  }
}
return dp[a.length()][b.length()];`,
  P84:`int i = a.length(), j = b.length();
StringBuilder out = new StringBuilder();
while (i > 0 && j > 0) {
  if (a.charAt(i - 1) == b.charAt(j - 1)) {
    out.append(a.charAt(i - 1));
    i--;
    j--;
  } else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
  else j--;
}
return out.reverse().toString();`,
  P85:`long prev2 = 0, prev1 = 0;
for (int value : a) {
  long current = Math.max(prev1, prev2 + value);
  prev2 = prev1;
  prev1 = current;
}
return prev1;`,
  P86:`int rows = a.length, cols = a[0].length;
int[][] dp = new int[rows][cols];
for (int i = 0; i < rows; i++) Arrays.fill(dp[i], Integer.MAX_VALUE);
dp[0][0] = a[0][0];
for (int i = 0; i < rows; i++) {
  for (int j = 0; j < cols; j++) {
    if (i > 0) dp[i][j] = Math.min(dp[i][j], dp[i - 1][j] + a[i][j]);
    if (j > 0) dp[i][j] = Math.min(dp[i][j], dp[i][j - 1] + a[i][j]);
    if (i > 0 && j > 0) dp[i][j] = Math.min(dp[i][j], dp[i - 1][j - 1] + a[i][j] / 2);
  }
}
return dp[rows - 1][cols - 1];`
};
const JAVA_HINT_HELPERS = {
  P28:`private static long memoFib(int n, long[] memo) {
  if (memo[n] != -1) return memo[n];
  if (n < 2) memo[n] = n;
  else memo[n] = memoFib(n - 1, memo) + memoFib(n - 2, memo);
  return memo[n];
}`,
  P40:`private static void permutationDfs(int[] A, int r, int depth, int[] path,
    boolean[] used, ArrayList<int[]> out) {
  if (depth == r) {
    out.add(Arrays.copyOf(path, r));
    return;
  }
  for (int i = 0; i < A.length; i++) {
    if (!used[i]) {
      used[i] = true;
      path[depth] = A[i];
      permutationDfs(A, r, depth + 1, path, used, out);
      used[i] = false;
    }
  }
}`,
  P41:`private static void combinationDfs(int[] A, int r, int start, int depth,
    int[] path, ArrayList<int[]> out) {
  if (depth == r) {
    out.add(Arrays.copyOf(path, r));
    return;
  }
  for (int i = start; i < A.length; i++) {
    path[depth] = A[i];
    combinationDfs(A, r, i + 1, depth + 1, path, out);
  }
}`,
  P45:`private static int tourDfs(int[][] dist, boolean[] used, int last, int depth, int cost) {
  if (depth == dist.length) return cost + dist[last][0];
  int best = Integer.MAX_VALUE;
  for (int city = 1; city < dist.length; city++) {
    if (!used[city]) {
      used[city] = true;
      int value = tourDfs(dist, used, city, depth + 1, cost + dist[last][city]);
      best = Math.min(best, value);
      used[city] = false;
    }
  }
  return best;
}`
};
function javaHintReference(p) {
  const body = JAVA_HINT_BODIES[p.id];
  if (!body) return '';
  const indent = (text, spaces) => text.split('\n').map(line => ' '.repeat(spaces) + line).join('\n');
  const helper = JAVA_HINT_HELPERS[p.id];
  return 'import java.util.*;\n\npublic class Solution extends LabSupport {\n  '
    + javaContract(p).signature + ' {\n' + indent(body, 4) + '\n  }'
    + (helper ? '\n\n' + indent(helper, 2) : '') + '\n}\n';
}
