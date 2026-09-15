import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const problems=JSON.parse(fs.readFileSync(path.join(root,'algorithm-lab/chapter-02.json'),'utf8'));
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,'algorithm-lab/chapter-02-harness.js'),'utf8'),context);
const directory=path.join(root,'data/알고리즘/chapter-02-c');
fs.mkdirSync(directory,{recursive:true});
const headers='#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <limits.h>\n\n';
for(const p of problems){
  const {setup,call}=context.chapterTwoCase(p,p.tests[0].args);
  fs.writeFileSync(path.join(directory,p.function+'.c'),
    `/* ${p.id}: ${p.title}. Original PPT slide ${p.slides}.\n * Expected: ${JSON.stringify(p.tests[0].expected)}\n * Function matches the browser exercise; main runs the first example.\n */\n${headers}${p.c.solution}\nint main(void) {\n${setup ? '  '+setup+'\n' : ''}  ${call}\n  putchar('\\n');\n  return 0;\n}\n`);
}
fs.writeFileSync(path.join(directory,'input_grid.c'),`/* Read rows, cols, then rows*cols integers. Example: 2 3 / 1 2 3 / 4 5 6 => 21. */
#include <stdio.h>
int main(void) {
  int rows, cols, grid[8][8], sum=0;
  if(scanf("%d %d", &rows, &cols)!=2) return 1;
  if(rows<1 || rows>8 || cols<1 || cols>8) return 1;
  for(int i=0;i<rows;i++) for(int j=0;j<cols;j++) {
    if(scanf("%d", &grid[i][j])!=1) return 1;
    sum+=grid[i][j];
  }
  printf("%d\\n",sum);
  return 0;
}
`);
fs.writeFileSync(path.join(directory,'blackjack_input.c'),headers+problems.find(p=>p.id==='P30').c.solution+`
int main(void) {
  int n, target, cards[100];
  if(scanf("%d %d", &n, &target)!=2 || n<0 || n>100) return 1;
  for(int i=0;i<n;i++) if(scanf("%d", &cards[i])!=1) return 1;
  printf("%d\\n",blackjack(cards,n,target));
  return 0;
}
`);
fs.writeFileSync(path.join(directory,'README.md'),`# 2장 Python·C 실습의 C11 실행 예제

각 .c 파일은 독립 실행 프로그램입니다. 한 번에 한 파일씩 컴파일하세요.

\`\`\`sh
gcc -std=c11 -Wall -Wextra find_pairs.c -o find_pairs
./find_pairs
\`\`\`

Windows에서는 생성된 find_pairs.exe를 실행합니다. 각 파일의 main은 첫 공개 예시를 실행합니다.
브라우저 채점에는 해당 함수와 필요한 보조 함수만 붙여넣습니다(main 제외).
문자열에는 <string.h>, LLONG_MAX에는 <limits.h>가 필요합니다.

- input_grid.c: scanf로 행·열·행렬 읽기. 입력: 2 3, 다음 두 줄 1 2 3 / 4 5 6. 출력: 21.
- blackjack_input.c: 입력 5 21, 다음 줄 5 6 7 8 9. 출력: 21.
- 배열 반환 대신 out에 저장하고 개수를 반환합니다. 가변 길이 부분집합은 sizes도 저장합니다.
- 모든 배열의 최대 크기는 각 실습 문제의 조건에 맞춰 정해져 있습니다.
- 배낭 예시 정답: 13. 출발점을 고정한 4도시 TSP 방문 순서: 6개, 최소 비용: 18.
- Python과 C 모두 완전 탐색의 경우의 수는 같습니다. 생성할 결과의 수와 각 결과 처리 비용을 함께 셉니다.

## 슬라이드와 실습 대응

${problems.map(p=>`- ${p.id} / 원본 슬라이드 ${p.slides}: ${p.title} — ${p.function}.c`).join('\n')}
`);
console.log('Wrote 26 runnable C files and README.');
