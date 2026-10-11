// Readable practice references; checked against the same public and hidden contracts.
const HINT_REFERENCES = {
  P01:{python:`def linear_search(A, target):
    for i in range(len(A)):
        if A[i] == target:
            return i
    return -1`,c:`int linear_search(const int A[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (A[i] == target) return i;
    }
    return -1;
}`},
  P02:{python:`def binary_search(A, target):
    low, high = 0, len(A) - 1
    while low <= high:
        mid = (low + high) // 2
        value = A[mid]
        if value == target:
            return mid
        if value < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,c:`int binary_search(const int A[], int n, int target) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (A[mid] == target) return mid;
        if (A[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`},
  P03:{python:`def binary_trace(A, target):
    low, high = 0, len(A) - 1
    trace = []
    while low <= high:
        mid = (low + high) // 2
        trace.append([low, high, mid, A[mid]])
        if A[mid] == target:
            break
        if A[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return trace`,c:`int binary_trace(const int A[], int n, int target, int trace[][4]) {
    int low = 0, high = n - 1, count = 0;
    while (low <= high) {
        int mid = (low + high) / 2;
        trace[count][0] = low;
        trace[count][1] = high;
        trace[count][2] = mid;
        trace[count][3] = A[mid];
        count++;
        if (A[mid] == target) break;
        if (A[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return count;
}`},
  P05:{python:`def sum_count(A):
    total = 0
    count = 0
    for x in A:
        total += x
        count += 1
    return [total, count]`,c:`void sum_count(const int A[], int n, long long out[2]) {
    long long total = 0, count = 0;
    for (int i = 0; i < n; i++) {
        total += A[i];
        count++;
    }
    out[0] = total;
    out[1] = count;
}`},
  P06:{python:`def max_count(A):
    if len(A) == 0:
        return [None, 0]
    largest = A[0]
    count = 0
    for i in range(1, len(A)):
        count += 1
        if A[i] > largest:
            largest = A[i]
    return [largest, count]`,c:`void max_count(const int A[], int n, long long out[2]) {
    out[0] = out[1] = 0;
    if (n == 0) return;
    int largest = A[0];
    long long count = 0;
    for (int i = 1; i < n; i++) {
        count++;
        if (A[i] > largest) largest = A[i];
    }
    out[0] = largest;
    out[1] = count;
}`},
  P07:{python:`def search_count(A, target):
    count = 0
    for i in range(len(A)):
        count += 1
        if A[i] == target:
            return [i, count]
    return [-1, count]`,c:`void search_count(const int A[], int n, int target, long long out[2]) {
    int count = 0;
    for (int i = 0; i < n; i++) {
        count++;
        if (A[i] == target) {
            out[0] = i;
            out[1] = count;
            return;
        }
    }
    out[0] = -1;
    out[1] = count;
}`},
  P08:{python:`def expected_checks(n, p):
    success_mean = (n + 1) / 2
    failure_checks = n
    return p * success_mean + (1 - p) * failure_checks`,c:`double expected_checks(int n, double p) {
    double success_mean = (n + 1) / 2.0;
    return p * success_mean + (1.0 - p) * n;
}`},
  P09:{python:`def doubling_steps(n):
    i = 1
    count = 0
    while i < n:
        i *= 2
        count += 1
    return count`,c:`int doubling_steps(long long n) {
    long long i = 1;
    int count = 0;
    while (i < n) {
        i *= 2;
        count++;
    }
    return count;
}`},
  P10:{python:`def binary_worst(n):
    count = 0
    while n > 0:
        count += 1
        n //= 2
    return count`,c:`int binary_worst(long long n) {
    int count = 0;
    while (n > 0) {
        count++;
        n /= 2;
    }
    return count;
}`},
  P11:{python:`def bubble_stats(A):
    out = A.copy()
    n = len(out)
    comparisons = swaps = 0
    for i in range(n - 1):
        for j in range(n - i - 1):
            comparisons += 1
            if out[j] > out[j + 1]:
                out[j], out[j + 1] = out[j + 1], out[j]
                swaps += 1
    return [out, comparisons, swaps]`,c:`void bubble_stats(const int A[], int n, int sorted[], long long stats[2]) {
    for (int i = 0; i < n; i++) sorted[i] = A[i];
    stats[0] = stats[1] = 0;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            stats[0]++;
            if (sorted[j] > sorted[j + 1]) {
                int temp = sorted[j];
                sorted[j] = sorted[j + 1];
                sorted[j + 1] = temp;
                stats[1]++;
            }
        }
    }
}`},
  P12:{python:`def loop_counts(n):
    inner = 0
    j = 1
    while j < n:
        inner += 1
        j *= 2
    return [n, n * n, n * inner]`,c:`void loop_counts(int n, long long out[3]) {
    int inner = 0;
    for (int j = 1; j < n; j *= 2) inner++;
    out[0] = n;
    out[1] = (long long)n * n;
    out[2] = (long long)n * inner;
}`},
  P16:{python:`def dice_sum(target):
    out = []
    for a in range(1, 7):
        for b in range(1, 7):
            for c in range(1, 7):
                if a + b + c == target:
                    out.append([a, b, c])
    return out`},
  P17:{python:`def choose_three(A):
    out = []
    for i in range(len(A)):
        for j in range(i + 1, len(A)):
            for k in range(j + 1, len(A)):
                out.append([A[i], A[j], A[k]])
    return out`},
  P20:{python:`def password_candidates(A):
    out = []
    for i in range(len(A)):
        for j in range(len(A)):
            for k in range(len(A)):
                if i != j and j != k and i != k:
                    out.append(100 * A[i] + 10 * A[j] + A[k])
    return out`},
  P21:{python:`def icecream_menus(n):
    out = []
    for i in range(n):
        for j in range(i + 1, n):
            out.append([i, j])
    return out`},
  P25:{python:`def search_space(n):
    factorial = power_two = power_n = 1
    for i in range(1, n + 1):
        factorial *= i
        power_two *= 2
        power_n *= n
    return [factorial, power_two, power_n]`},
  P27:{python:`def subset_sum_count(A, target):
    count = 0
    n = len(A)
    for mask in range(1 << n):
        total = 0
        for j in range(n):
            if mask & (1 << j):
                total += A[j]
        if total == target:
            count += 1
    return count`},
  P28:{python:`def fib_memo(n):
    memo = [-1] * (n + 1)
    def fib(k):
        if memo[k] != -1:
            return memo[k]
        if k <= 1:
            memo[k] = k
        else:
            memo[k] = fib(k - 1) + fib(k - 2)
        return memo[k]
    return fib(n)`},
  P31:{python:`def pair_differences(A):
    out = []
    for i in range(len(A)):
        for j in range(i + 1, len(A)):
            out.append(A[j] - A[i])
    return out`},
  P32:{python:`def three_sum_values(A, target):
    out = []
    for i in range(len(A)):
        for j in range(i + 1, len(A)):
            for k in range(j + 1, len(A)):
                if A[i] + A[j] + A[k] == target:
                    out.append([A[i], A[j], A[k]])
    return out`},
  P33:{python:`def palindrome_words(words):
    out = []
    for word in words:
        left, right = 0, len(word) - 1
        same = True
        while left < right:
            if word[left] != word[right]:
                same = False
                break
            left += 1
            right -= 1
        if same:
            out.append(word)
    return out`},
  P35:{python:`def baseball_count(guesses, strikes, balls):
    count = 0
    for a in range(10):
        for b in range(10):
            for c in range(10):
                if a == b or b == c or a == c:
                    continue
                candidate = str(a) + str(b) + str(c)
                valid = True
                for q in range(len(guesses)):
                    actual_s = actual_b = 0
                    for i in range(3):
                        for j in range(3):
                            if candidate[i] == guesses[q][j]:
                                if i == j:
                                    actual_s += 1
                                else:
                                    actual_b += 1
                    if actual_s != strikes[q] or actual_b != balls[q]:
                        valid = False
                        break
                if valid:
                    count += 1
    return count`},
  P36:{python:`def grid_sum(grid):
    total = 0
    for i in range(len(grid)):
        for j in range(len(grid[i])):
            total += grid[i][j]
    return total`},
  P56:{python:`def light_coin(weights):
    lo, hi = 0, len(weights)
    while hi - lo > 1:
        mid = (lo + hi) // 2
        total = 0
        for i in range(lo, mid):
            total += weights[i]
        if total < mid - lo:
            hi = mid
        else:
            lo = mid
    return lo`},
  P62:{python:`def quad(a, r, c, n):
    value = a[r][c]
    same = True
    for i in range(r, r + n):
        for j in range(c, c + n):
            if a[i][j] != value:
                same = False
    if same:
        return str(value)
    h = n // 2
    top_left = quad(a, r, c, h)
    top_right = quad(a, r, c + h, h)
    bottom_left = quad(a, r + h, c, h)
    bottom_right = quad(a, r + h, c + h, h)
    return '(' + top_left + top_right + bottom_left + bottom_right + ')'`},
  P65:{python:`def white_count(a, r, c, n):
    value = a[r][c]
    same = True
    for i in range(r, r + n):
        for j in range(c, c + n):
            if a[i][j] != value:
                same = False
    if same:
        return value
    h = n // 2
    top_left = white_count(a, r, c, h)
    top_right = white_count(a, r, c + h, h)
    bottom_left = white_count(a, r + h, c, h)
    bottom_right = white_count(a, r + h, c + h, h)
    return top_left + top_right + bottom_left + bottom_right`},
  P74:{python:`def nearest_tour(d):
    n = len(d)
    used = [False] * n
    used[0] = True
    current = cost = 0
    for step in range(n - 1):
        best = -1
        for city in range(n):
            if not used[city]:
                if best == -1 or d[current][city] < d[current][best]:
                    best = city
        cost += d[current][best]
        used[best] = True
        current = best
    return cost + d[current][0]`},
  P80:{python:`def make_path(n, dp):
    path = [n]
    while n > 1:
        candidates = [n - 1]
        for d in (2, 3, 5):
            if n % d == 0:
                candidates.append(n // d)
        for candidate in candidates:
            if dp[candidate] + 1 == dp[n]:
                n = candidate
                break
        path.append(n)
    return path`}
};
