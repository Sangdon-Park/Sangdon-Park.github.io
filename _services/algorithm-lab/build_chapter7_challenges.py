"""Build three extra Chapter 7 practice tasks; keep final-exam contracts intact."""
from pathlib import Path
from itertools import product, permutations
import json

ROOT = Path(__file__).resolve().parents[2]


def bracket_oracle(pattern):
    total = 0
    for replacement in product('()', repeat=pattern.count('?')):
        choices = iter(replacement)
        text = ''.join(next(choices) if c == '?' else c for c in pattern)
        balance = 0
        for c in text:
            balance += 1 if c == '(' else -1
            if balance < 0:
                break
        else:
            total += balance == 0
    return total


def maze_oracle(grid):
    rows, cols = len(grid), len(grid[0])
    if not grid[0][0] or not grid[-1][-1]:
        return 0
    # Enumerate simple paths as explicit (last cell, set of visited cells) states.
    stack, answer = [(0, frozenset([0]))], 0
    while stack:
        cell, seen = stack.pop()
        if cell == rows * cols - 1:
            answer += 1
            continue
        r, c = divmod(cell, cols)
        for nr, nc in [(r-1,c), (r+1,c), (r,c-1), (r,c+1)]:
            nxt = nr * cols + nc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] and nxt not in seen:
                stack.append((nxt, seen | {nxt}))
    return answer


def completed_sudoku_boards():
    rows = list(permutations(range(1, 5)))
    boards = []
    for board in product(rows, repeat=4):
        if any(len({board[r][c] for r in range(4)}) != 4 for c in range(4)):
            continue
        if any(len({board[r][c] for r in range(br,br+2) for c in range(bc,bc+2)}) != 4
               for br in (0,2) for bc in (0,2)):
            continue
        boards.append(board)
    assert len(boards) == 288
    return boards


SUDOKUS = completed_sudoku_boards()


def sudoku_oracle(board):
    return sum(all(not board[r][c] or board[r][c] == solved[r][c]
                   for r in range(4) for c in range(4)) for solved in SUDOKUS)


def task(order, title, function, params, intro, inputs, rules, result, examples,
         tests, solution, c_signature, c_solution, c_guide, java_solution,
         steps, boundary, complexity):
    number = f'7-{order}'
    statement = intro + '\n\n입력\n' + inputs + '\n\n반환값\n' + result
    statement += '\n\n규칙\n' + '\n'.join(f'{i}. {s}' for i,s in enumerate(rules,1))
    statement += '\n\n예제\n' + '\n\n'.join(
        x['label'] + '\n' + x['description'] + '\n반환값: ' + str(x['expected']) + '\n' + x['reason']
        for x in examples)
    statement += '\n\n연습할 내용\n재귀 호출로 선택을 이어 가고, 조건을 어긴 선택은 그 자리에서 멈추는 백트래킹을 연습한다.'
    c_hint = '\n'.join(steps) + '\n\n' + c_guide
    return dict(id=f'F07-0{order}', chapter=7, displayId=number, title=title,
                level='도전문제', function=function, params=params, statement=statement,
                solution=solution.strip()+'\n',
                c=dict(solution=c_solution.strip()+'\n', signature=c_signature,
                       starter=c_signature+' {\n    // 여기에 코드를 작성하세요.\n    return 0;\n}\n',
                       statement=statement+'\n\nC 함수\n'+c_signature+'\n'+c_guide,
                       hint=c_hint, result=result, argumentGuide=c_guide),
                java=dict(solution=java_solution.strip()+'\n'),
                complexity=complexity, finalExam=False, practiceChallenge=True,
                challenge=True, examOrder=order, section='추가 도전문제 '+number,
                hint='\n'.join(steps), practiceGuide=dict(steps=steps,check=boundary),
                sourceFile=None, slides=None, starter=f'def {function}({", ".join(params)}):\n    # 여기에 코드를 작성하세요.\n    return 0\n',
                tests=tests, teachingCases=examples, returnDescription=result, preserve_input=True)


def case(args, expected, public=False):
    return dict(args=args, expected=expected, public=public)


def example(label, args, expected, description, reason):
    return dict(label=label, args=args, expected=expected, description=description, reason=reason)


def build():
    patterns = ['??', '????', '(??)', ')?', '()()', '((??))', '??????', '????????????????',
                '((((((((', '))))))))', '?)(?', '??)???', '((()))', '(?)?', '????????', ')?(?']
    bracket_examples = [
        example('물음표 두 개', ['??'], 1, 'pattern="??"', '두 칸을 "()"로 채우는 한 가지가 가능하다. ")("는 닫는 괄호가 먼저 나와 실패한다.'),
        example('물음표 네 개', ['????'], 2, 'pattern="????"', '가능한 완성 문자열은 "(())"와 "()()"이다. 같은 완성 문자열은 한 번만 센다.'),
        example('고정된 양 끝', ['(??)'], 2, 'pattern="(??)"', '첫 괄호와 마지막 괄호는 그대로 둔다. 가운데를 "()"로 채우면 "(())", ")("로 채우면 "()()"이다.'),
        example('처음부터 닫힌 괄호', [')?'], 0, 'pattern=")?"', '첫 칸의 ")"는 바꿀 수 없다. 앞에서 열지 않은 괄호를 닫으므로 어떤 문자로 채워도 실패한다.')]
    bracket = task(5, '물음표를 채워 올바른 괄호 만들기', 'bracket_count', ['pattern'],
        '문자열 pattern에는 "(", ")", "?"만 들어 있다. 모든 "?"를 "(" 또는 ")" 한 글자로 바꾸어 올바른 괄호 문자열을 만들려고 한다. 서로 다른 완성 문자열이 몇 개인지 구하시오.',
        'pattern: 길이가 2~16인 짝수 길이 문자열. 문자는 "(", ")", "?" 중 하나이다.',
        ['처음부터 적힌 "("와 ")"는 바꾸거나 옮길 수 없다. 모든 "?"는 반드시 바꾼다.',
         '왼쪽부터 읽는 동안 닫는 괄호의 수가 여는 괄호의 수보다 많아지면 실패이다.',
         '끝까지 읽었을 때 여는 괄호와 닫는 괄호의 총수가 같아야 한다.',
         '완성 문자열의 어느 한 칸이라도 다르면 다른 결과로 센다.'],
        '올바른 완성 문자열의 개수를 정수로 반환한다. 만들 수 없으면 0이다.', bracket_examples,
        [case([p],bracket_oracle(p),i<4) for i,p in enumerate(patterns)],
        '''def bracket_count(pattern):
    n = len(pattern)
    def fill(i, opened):
        # opened: 지금까지 열었지만 아직 닫지 않은 괄호 수
        if opened < 0 or opened > n - i:
            return 0
        if i == n:
            return 1 if opened == 0 else 0
        answer = 0
        if pattern[i] in "(?":
            answer += fill(i + 1, opened + 1)
        if pattern[i] in ")?":
            answer += fill(i + 1, opened - 1)
        return answer
    return fill(0, 0)''',
        'int bracket_count(const char pattern[])',
        '''#include <string.h>
static int fill_brackets(const char s[], int n, int i, int opened) {
    if (opened < 0 || opened > n - i) return 0;
    if (i == n) return opened == 0;
    int answer = 0;
    if (s[i] == '(' || s[i] == '?') answer += fill_brackets(s,n,i+1,opened+1);
    if (s[i] == ')' || s[i] == '?') answer += fill_brackets(s,n,i+1,opened-1);
    return answer;
}
int bracket_count(const char pattern[]) {
    return fill_brackets(pattern,(int)strlen(pattern),0,0);
}''',
        'pattern은 끝에 널 문자(\\0)가 붙은 C 문자열이다. strlen(pattern)으로 길이를 구한다. main과 출력 코드는 작성하지 않는다.',
        '''public class Solution extends LabSupport {
  private static int fill(String s, int i, int opened) {
    if (opened < 0 || opened > s.length()-i) return 0;
    if (i == s.length()) return opened == 0 ? 1 : 0;
    int answer = 0;
    if (s.charAt(i)=='(' || s.charAt(i)=='?') answer += fill(s,i+1,opened+1);
    if (s.charAt(i)==')' || s.charAt(i)=='?') answer += fill(s,i+1,opened-1);
    return answer;
  }
  public static int bracket_count(String pattern) { return fill(pattern,0,0); }
}''',
        ['왼쪽 칸부터 결정한다. 아직 닫지 않은 괄호 수 opened를 0에서 시작한다. "("를 고르면 1 늘리고 ")"를 고르면 1 줄인다.',
         'opened가 음수이면 바로 실패이다. 남은 칸을 모두 ")"로 바꿔도 닫을 수 없을 만큼 opened가 크면 그 선택도 멈춘다.',
         '물음표에서 두 문자를 각각 시도한 결과를 더한다. 끝까지 왔고 opened가 0이면 완성 문자열 한 개를 찾았으므로 1을 반환한다.'],
        '"()()"처럼 물음표가 없어도 올바르면 1이다. 첫 문자가 ")"로 고정되어 있으면 0이다. 전체 개수뿐 아니라 중간에 먼저 닫힌 괄호가 없는지도 검사한다.',
        '물음표가 q개일 때 시간 O(2^q), 재귀 깊이와 추가 공간 O(n). 길이 16의 모든 물음표도 정답은 1,430으로 int 범위 안이다.')

    grids = [ [[1]], [[0]], [[1,1],[1,1]], [[1,0,1],[1,1,1],[0,1,1]],
             [[1,0],[0,1]], [[1,1,1,1]], [[1],[1],[1],[1]], [[1,1],[1,0]],
             [[0,1],[1,1]], [[1]*3 for _ in range(3)], [[1]*4 for _ in range(4)],
             [[1,1,0,0],[0,1,1,0],[0,0,1,1],[0,0,0,1]],
             [[1,1,1,0],[1,0,1,1],[1,1,1,1]] ]
    maze_examples = [
        example('2×2의 열린 길', [grids[2]], 2, 'grid=[[1,1],[1,1]]', '오른쪽·아래 순서와 아래·오른쪽 순서가 있다. 도착한 뒤 다시 움직이지 않는다.'),
        example('벽이 있는 길', [grids[3]], maze_oracle(grids[3]), 'grid=[[1,0,1],[1,1,1],[0,1,1]]', '시작점에서 아래, 오른쪽으로 간 뒤 두 가지로 나뉜다. 오른쪽·아래 또는 아래·오른쪽으로 도착하므로 2가지이다.'),
        example('대각선으로는 이동 불가', [grids[4]], 0, 'grid=[[1,0],[0,1]]', '출발점과 도착점은 열려 있지만 상하좌우로 이어진 길이 없다.'),
        example('출발점이 곧 도착점', [[[1]]], 1, 'grid=[[1]]', '열린 한 칸에서 출발과 도착이 같다. 한 번도 움직이지 않는 경로 1개로 센다.')]
    maze = task(6, '같은 칸을 다시 밟지 않는 미로 경로', 'maze_path_count', ['grid'],
        '직사각형 미로 grid에서 맨 왼쪽 위 칸을 출발점, 맨 오른쪽 아래 칸을 도착점으로 정한다. 1은 지나갈 수 있는 길이고 0은 벽이다. 출발점에서 도착점까지 가는 서로 다른 경로의 수를 구하시오.',
        'grid: 행 수와 열 수가 각각 1~4인 2차원 배열. 모든 원소는 0 또는 1이다. 모든 행의 길이는 같다.',
        ['상하좌우로 이웃한 칸에 한 번에 한 칸씩 이동한다. 대각선 이동과 미로 밖 이동은 금지한다.',
         '한 경로 안에서는 같은 칸을 두 번 밟을 수 없다. 출발점도 다시 밟을 수 없다.',
         '서로 다른 경로를 시도할 때는 앞 경로에서 밟았던 칸을 다시 사용할 수 있다.',
         '도착점에 도달하면 그 경로를 즉시 끝낸다. 밟은 칸의 순서가 다르면 다른 경로이다.',
         '출발점 또는 도착점이 벽이면 0이다. 열린 한 칸짜리 미로는 1이다. 입력 배열은 바꾸지 않는다.'],
        '조건을 만족하는 경로 수를 정수로 반환한다. 도착할 수 없으면 0이다.', maze_examples,
        [case([g],maze_oracle(g),i in (0,2,3,4)) for i,g in enumerate(grids)],
        '''def maze_path_count(grid):
    rows, cols = len(grid), len(grid[0])
    if grid[0][0] == 0 or grid[-1][-1] == 0:
        return 0
    visited = [[False] * cols for _ in range(rows)]
    def walk(r, c):
        if r == rows - 1 and c == cols - 1:
            return 1
        visited[r][c] = True
        answer = 0
        for dr, dc in ((-1,0),(1,0),(0,-1),(0,1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                if grid[nr][nc] == 1 and not visited[nr][nc]:
                    answer += walk(nr, nc)
        visited[r][c] = False
        return answer
    return walk(0, 0)''',
        'int maze_path_count(const int grid[][4], int rows, int cols)',
        '''static int walk_maze(const int grid[][4], int rows, int cols, int r, int c, int visited[][4]) {
    if (r == rows-1 && c == cols-1) return 1;
    visited[r][c] = 1;
    int answer=0;
    const int dr[4]={-1,1,0,0}, dc[4]={0,0,-1,1};
    for (int d=0; d<4; ++d) {
        int nr=r+dr[d], nc=c+dc[d];
        if (nr>=0 && nr<rows && nc>=0 && nc<cols && grid[nr][nc] && !visited[nr][nc])
            answer += walk_maze(grid,rows,cols,nr,nc,visited);
    }
    visited[r][c] = 0;
    return answer;
}
int maze_path_count(const int grid[][4], int rows, int cols) {
    if (!grid[0][0] || !grid[rows-1][cols-1]) return 0;
    int visited[4][4]={0};
    return walk_maze(grid,rows,cols,0,0,visited);
}''',
        'rows와 cols는 실제 미로의 행 수와 열 수이다. C 배열은 한 행의 저장 공간을 4칸으로 맞춰 전달한다. 앞의 rows행·cols열만 읽는다. 방문 표시용 배열은 함수 안에서 따로 만든다.',
        '''public class Solution extends LabSupport {
  private static int walk(int[][] grid, boolean[][] visited, int r, int c) {
    int rows=grid.length, cols=grid[0].length;
    if (r==rows-1 && c==cols-1) return 1;
    visited[r][c]=true;
    int answer=0;
    int[] dr={-1,1,0,0}, dc={0,0,-1,1};
    for (int d=0;d<4;d++) {
      int nr=r+dr[d], nc=c+dc[d];
      if (nr>=0 && nr<rows && nc>=0 && nc<cols && grid[nr][nc]==1 && !visited[nr][nc])
        answer += walk(grid,visited,nr,nc);
    }
    visited[r][c]=false;
    return answer;
  }
  public static int maze_path_count(int[][] grid) {
    int rows=grid.length, cols=grid[0].length;
    if (grid[0][0]==0 || grid[rows-1][cols-1]==0) return 0;
    return walk(grid,new boolean[rows][cols],0,0);
  }
}''',
        ['현재 위치 (r,c)와 이번 경로에서 이미 밟은 칸을 기록한다. 시작은 (0,0)이다. 도착점이면 경로 하나를 찾았으므로 1을 반환한다.',
         '현재 칸을 방문 표시한 뒤 상하좌우를 시도한다. 범위 안의 열린 칸이면서 이번 경로에서 밟지 않은 칸으로만 이동한다.',
         '각 방향에서 찾은 경로 수를 더한다. 현재 호출을 끝내기 전에 방문 표시를 지워 다른 경로가 이 칸을 사용할 수 있게 한다.'],
        '방문 표시는 한 경로에만 적용한다. 한 번 방문한 칸을 영원히 막으면 다른 경로를 놓친다. 오른쪽·아래만 검사하지 말고 네 방향을 모두 확인한다.',
        'V=행×열일 때 보수적 시간 O(4^V), 방문 배열과 재귀 공간 O(V). 최대 4×4이며 경로 수는 int로 저장할 수 있다.')

    solved = [[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]]
    puzzle = [[1,0,0,4],[0,4,1,0],[2,0,0,3],[0,3,2,0]]
    invalid_row = [[1,1,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]
    invalid_box = [[1,0,0,0],[0,1,0,0],[0,0,0,0],[0,0,0,0]]
    boards = [solved, puzzle, [[0]*4 for _ in range(4)], invalid_row, invalid_box,
              [[1,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
              [[1,2,3,0],[0,0,0,4],[0,0,0,0],[0,0,0,0]],
              [[1,0,0,0],[1,0,0,0],[0,0,0,0],[0,0,0,0]],
              [[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,2]]]
    for mask in [0xAAAA,0x5555,0x8421,0x1248,0xF00F]:
        boards.append([[solved[r][c] if mask>>(r*4+c)&1 else 0 for c in range(4)] for r in range(4)])
    sudoku_examples = [
        example('이미 완성된 판', [solved], 1, 'board=[[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]]', '모든 행·열·2×2 구역이 규칙을 만족한다. 빈칸이 없어도 현재 완성판 한 개로 센다.'),
        example('빈칸 채우기', [puzzle], sudoku_oracle(puzzle), 'board=[[1,0,0,4],[0,4,1,0],[2,0,0,3],[0,3,2,0]]', '0인 칸만 채운다. 이 입력은 첫 번째 예제의 완성판으로만 채울 수 있으므로 1이다.'),
        example('한 행에 같은 숫자', [invalid_row], 0, 'board=[[1,1,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]', '첫 행의 두 1은 고정된 숫자이다. 이미 중복되므로 빈칸을 채워도 해결할 수 없다.'),
        example('처음부터 전부 빈칸', [[[0]*4 for _ in range(4)]], 288, 'board=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]', '규칙을 만족하는 서로 다른 완성판 288개를 센다. 회전·대칭이어도 한 칸의 값이 다르면 별개이다.')]
    sudoku = task(7, '4×4 스도쿠의 완성 방법 세기', 'sudoku4_count', ['board'],
        '4×4 스도쿠 판 board가 주어진다. 0은 빈칸이고 1~4는 바꿀 수 없는 숫자이다. 모든 빈칸을 1~4 중 하나로 채워 규칙을 만족하는 완성판의 수를 구하시오.\n\n2×2 구역은 네 개이다. 왼쪽 위·오른쪽 위·왼쪽 아래·오른쪽 아래의 네 칸씩 묶는다.\n[ 위 왼쪽 2×2 | 위 오른쪽 2×2 ]\n[ 아래 왼쪽 2×2 | 아래 오른쪽 2×2 ]',
        'board: 정확히 4행 4열인 2차원 배열. 모든 값은 0~4의 정수이다. 처음부터 규칙에 어긋나는 숫자가 들어올 수도 있다.',
        ['각 행에는 숫자 1,2,3,4가 각각 한 번씩 들어가야 한다.',
         '각 열에도 숫자 1,2,3,4가 각각 한 번씩 들어가야 한다.',
         '각 2×2 구역에도 숫자 1,2,3,4가 각각 한 번씩 들어가야 한다.',
         '처음 주어진 1~4는 지우거나 바꾸지 않는다. 같은 행·열·구역에 중복되어 있으면 0을 반환한다.',
         '완성판의 어느 한 칸이라도 다르면 다른 방법이다. 이미 완성된 올바른 판은 1이다. 입력 배열은 바꾸지 않는다.'],
        '서로 다른 완성판의 수를 정수로 반환한다. 완성할 수 없으면 0이다. 완성판 자체를 반환하지 않는다.', sudoku_examples,
        [case([b],sudoku_oracle(b),i<4) for i,b in enumerate(boards)],
        '''def sudoku4_count(board):
    work = [row[:] for row in board]
    def allowed(r, c, value):
        for i in range(4):
            if work[r][i] == value or work[i][c] == value:
                return False
        br, bc = (r // 2) * 2, (c // 2) * 2
        for nr in range(br, br + 2):
            for nc in range(bc, bc + 2):
                if work[nr][nc] == value:
                    return False
        return True
    # 먼저 고정된 숫자끼리 충돌하는지 검사한다.
    for r in range(4):
        for c in range(4):
            value = work[r][c]
            if value:
                work[r][c] = 0
                ok = allowed(r, c, value)
                work[r][c] = value
                if not ok:
                    return 0
    def fill(pos):
        if pos == 16:
            return 1
        r, c = divmod(pos, 4)
        if work[r][c] != 0:
            return fill(pos + 1)
        answer = 0
        for value in range(1, 5):
            if allowed(r, c, value):
                work[r][c] = value
                answer += fill(pos + 1)
                work[r][c] = 0
        return answer
    return fill(0)''',
        'int sudoku4_count(const int board[][4])',
        '''static int sudoku_allowed(int a[][4], int r, int c, int value) {
    for (int i=0; i<4; ++i) if (a[r][i]==value || a[i][c]==value) return 0;
    int br=(r/2)*2, bc=(c/2)*2;
    for (int nr=br; nr<br+2; ++nr)
        for (int nc=bc; nc<bc+2; ++nc) if (a[nr][nc]==value) return 0;
    return 1;
}
static int fill_sudoku(int a[][4], int pos) {
    if (pos==16) return 1;
    int r=pos/4, c=pos%4;
    if (a[r][c]) return fill_sudoku(a,pos+1);
    int answer=0;
    for (int value=1; value<=4; ++value) if (sudoku_allowed(a,r,c,value)) {
        a[r][c]=value;
        answer += fill_sudoku(a,pos+1);
        a[r][c]=0;
    }
    return answer;
}
int sudoku4_count(const int board[][4]) {
    int a[4][4];
    for (int r=0; r<4; ++r) for (int c=0; c<4; ++c) a[r][c]=board[r][c];
    for (int r=0; r<4; ++r) for (int c=0; c<4; ++c) if (a[r][c]) {
        int value=a[r][c]; a[r][c]=0;
        int ok=sudoku_allowed(a,r,c,value); a[r][c]=value;
        if (!ok) return 0;
    }
    return fill_sudoku(a,0);
}''',
        'board는 정확히 4×4 배열이다. 수정할 작업용 복사본을 함수 안에서 만든다. 행·열 번호는 0~3이며, (r/2)*2와 (c/2)*2로 그 칸이 속한 2×2 구역의 시작 위치를 구할 수 있다.',
        '''public class Solution extends LabSupport {
  private static boolean allowed(int[][] a, int r, int c, int value) {
    for (int i=0;i<4;i++) if (a[r][i]==value || a[i][c]==value) return false;
    int br=r/2*2, bc=c/2*2;
    for (int nr=br;nr<br+2;nr++) for (int nc=bc;nc<bc+2;nc++)
      if (a[nr][nc]==value) return false;
    return true;
  }
  private static int fill(int[][] a, int pos) {
    if (pos==16) return 1;
    int r=pos/4, c=pos%4;
    if (a[r][c]!=0) return fill(a,pos+1);
    int answer=0;
    for (int value=1;value<=4;value++) if (allowed(a,r,c,value)) {
      a[r][c]=value;
      answer += fill(a,pos+1);
      a[r][c]=0;
    }
    return answer;
  }
  public static int sudoku4_count(int[][] board) {
    int[][] a=new int[4][4];
    for (int r=0;r<4;r++) a[r]=board[r].clone();
    for (int r=0;r<4;r++) for (int c=0;c<4;c++) if (a[r][c]!=0) {
      int value=a[r][c]; a[r][c]=0;
      boolean ok=allowed(a,r,c,value); a[r][c]=value;
      if (!ok) return 0;
    }
    return fill(a,0);
  }
}''',
        ['입력을 복사하고, 먼저 고정된 숫자끼리 행·열·2×2 구역에서 충돌하는지 검사한다. 한 칸을 검사할 때는 그 칸 자체를 중복으로 세지 않는다.',
         '빈칸 하나에서 1~4를 차례로 시도한다. 같은 행·열·2×2 구역에 없는 숫자만 적고 다음 칸으로 간다.',
         '16칸을 모두 채웠으면 1을 반환한다. 재귀 호출에서 돌아오면 방금 채운 칸을 0으로 돌려놓고 다음 숫자를 시도한다. 결과를 모두 더한다.'],
        '빈칸이 없는 판도 고정 숫자 충돌을 검사한다. 행과 열만 맞고 2×2 구역이 틀린 경우를 놓치지 않는다. 해 하나에서 멈추지 않고 모든 완성판을 센다.',
        '빈칸이 k개일 때 보수적 시간 O(4^k). 판 크기는 4×4로 고정이며, 추가 공간은 복사본과 최대 16단계 재귀이다. 가능한 완성판은 최대 288개이다.')
    output = [bracket, maze, sudoku]
    # Every explanation must agree with the independently calculated test answer.
    for p in output:
        oracle = {'bracket_count':lambda a:bracket_oracle(*a),
                  'maze_path_count':lambda a:maze_oracle(*a),
                  'sudoku4_count':lambda a:sudoku_oracle(*a)}[p['function']]
        for t in p['teachingCases']:
            assert t['expected'] == oracle(t['args']), (p['id'],t['label'])
    target = ROOT/'algorithm-lab/challenge-problems.json'
    target.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(json.dumps({'problems':len(output),'tests':sum(len(p['tests']) for p in output)}))
    return output


if __name__ == '__main__':
    build()
