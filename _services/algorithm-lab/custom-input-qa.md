# 직접 입력 실행 검증 — 2026-09-29

코딩 실습의 Python·C·Java에 함수 인자별 입력란을 추가했다. 숫자 배열은
`1, 2, 3`, 공백·줄바꿈 구분 또는 `[1, 2, 3]`을 받고, 빈 배열은 `[]`로
입력한다. 문자열은 따옴표 없이 입력하며 중첩 배열·문자열 배열은 JSON을
사용한다. 인자 이름·형식·초기 예시는 각 문제의 기존 함수 계약에서 가져온다.
배열 길이와 제공되는 memo/dp/결과 공간은 실행기가 준비한다.

## 동작과 기록 분리

- 직접 실행은 현재 코드로 입력 한 건을 실행하고 반환값/결과 배열, 출력,
  오류와 지원되는 인자 변경 내용을 보여준다. 예상 답안을 요구하거나 정답/
  오답 판정을 하지 않는다.
- Python/C/Java worker의 `custom` 분기는 기존 `expected`·mutation 채점
  비교를 실행하지 않는다. C는 82개 등록 항목에 대해 가변 인자로 별도
  하네스를 생성한다. 이전 예시의 하드코딩된 호출을 사용하지 않는다.
- 성공·컴파일 오류·런타임 오류·시간 초과·중지 모두 제출, 해결 상태,
  `saved.judged`, AI 힌트용 최근 채점 결과를 갱신하지 않는다. 기존 코드
  편집에 따른 답안 자동 저장은 유지한다.
- 입력이나 코드를 바꾸면 이전 실행 결과임을 표시한다. 문제 전환 시
  다른 문제의 결과는 지우고, 직접 입력은 현재 탭 메모리에만 보관한다.
- 실행 중 입력/언어/문제 변경을 막는다. 기존 Worker 시간 제한과 중지/
  다시 연결 흐름을 사용한다. 채점하기·예시 실행의 기존 동작은 유지한다.

## 입력·출력 처리

입력은 JSON과 제한된 숫자 구분 문법만 사용하며 `eval`하지 않는다. 타입,
숫자 정확도, 인자 수, 배열/행렬 크기, 결과 공간 크기, 필수 인덱스 관계를
검사한 값만 C/Java 리터럴로 직렬화한다. `1,,2` 같은 누락된 원소와 정확히
표현할 수 없는 정수는 거절한다. `10^18` 거리 무한대는 해당 함수에서만
허용하며, `1000000000000000001`이 같은 값으로 반올림되어 통과하지 않는다.
전체 입력은 80,000자, 배열은 최대 10,000개이며 문제별 한도가 추가된다.

학생 출력은 문자로 표시하고 HTML로 해석하지 않는다. Python과 Java의
stdout/stderr, C의 printf/puts/putchar 출력은 최대 10,000자까지 수집한다.
C는 함수가 중단되기 전에 출력한 디버그 문자열도 보존하며 런너의 실행
배너를 오류 출력으로 표시하지 않는다. 무한 루프를 강제 중지할 경우에는
완성된 반환 결과가 없으므로 시간 초과/중지 안내와 재연결 경로를 제공한다.

## 실행한 검증

- `node _services/algorithm-lab/tests/custom-inputs.mjs`
  - 등록 82개 입력 계약과 실제 Clang/WASM 하네스 컴파일·실행.
  - 기준답안이 있는 71개는 반환 결과도 공개 예시 정답과 비교.
  - 새 입력, 빈 배열, 숫자·문자열·행렬 오류, 소스 삽입 문자열,
    숫자 반올림, 디버그 출력, 런타임 중단 전 출력, 인자 변경,
    기존 전체 채점 동작 통과.
- `python _services/algorithm-lab/tests/custom-inputs.py`
  - 실제 Python worker 본문으로 71개 기준답안, 새/빈 입력,
    출력 길이 제한, 오류 직전 출력, 제자리 정렬, 기존 채점 검증 통과.
- `node _services/algorithm-lab/tests/custom-input-state.mjs`
  - 성공·컴파일/런타임 오류·유효하지 않은 입력·시간 초과·중지·로그인
    필요 상태에서 기록/점수/진도에 영향이 없는지 검증 통과.
- 기존 `examples.mjs`, `exercise-lab.py`, `exercise-lab.mjs`,
  `diagnostics.mjs`, `diagnostics.py`, `judge-reminder.mjs`,
  `java-state.mjs`, `exercise-numbers.mjs`, `locales.mjs` 통과.
  - 기존 Python/C 예시와 47개 연습문제의 언어별 288개 채점 사례 포함.
- 별도 localhost 계정/API로 실제 브라우저에서 Python과 Java의
  `first_index([8,3,3,9],3) → 1` 실행 확인. Java `System.out.println`
  디버그 출력, 목표값 9로 변경 후 반환값 3, 예외 발생 전 출력과
  `IllegalArgumentException` 표시, 해결 수 미변경 확인. 요청 로그에도
  `submit`이 없음을 확인했다. Java 전체 82개 런타임 실행을
  검증했다는 의미는 아니다.
- C 브라우저에서도 `first_index([8,3,3,9],9) → 3`, 잘못된 배열
  `1,,2`의 입력 안내, 어두운 화면의 인자 이름·입력값 가독성을 확인했다.

Windows에서 `python`이 Microsoft Store 별칭이면 설치된 Python 경로를
직접 사용하거나 해당 디렉터리를 현재 셸의 PATH 앞에 둔다.

## 수동 브라우저 재현

`node _services/algorithm-lab/tests/custom-input-fixture.mjs`를 실행한 뒤
`http://127.0.0.1:4192/algorithm-lab/index.html?chapter=3&problem=91&code=python`
을 연다. `code=c` 또는 `code=java`로 바꾸어 같은 문제를 확인할 수 있다.
이 fixture는 API를 localhost로 교체하고 생산 Supabase에 기록하지 않는다.
`http://127.0.0.1:4192/fixture-state`에서 요청 종류를 확인할 수 있다.
실제 배포 파일에는 fixture 주입이 포함되지 않는다.
