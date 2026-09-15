# 2장 Python·C 실습의 C11 실행 예제

각 .c 파일은 독립 실행 프로그램입니다. 한 번에 한 파일씩 컴파일하세요.

```sh
gcc -std=c11 -Wall -Wextra find_pairs.c -o find_pairs
./find_pairs
```

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

- P13 / 원본 슬라이드 7: 네 자리 자물쇠 — lock_attempts.c
- P14 / 원본 슬라이드 10: 약수 모두 찾기 — find_divisors.c
- P15 / 원본 슬라이드 11: 합이 K인 두 수 — find_pairs.c
- P16 / 원본 슬라이드 12: 세 주사위의 합 — dice_sum.c
- P17 / 원본 슬라이드 18: 세 장 선택하기 — choose_three.c
- P18 / 원본 슬라이드 19, 21: 직접 만드는 r개 순열 — make_permutations.c
- P19 / 원본 슬라이드 20–21: 직접 만드는 r개 조합 — make_combinations.c
- P20 / 원본 슬라이드 22: 1·2·3 비밀번호 후보 — password_candidates.c
- P21 / 원본 슬라이드 23: 아이스크림 두 가지 맛 — icecream_menus.c
- P22 / 원본 슬라이드 25–26: 문자열의 모든 일치 위치 — bf_string_match.c
- P23 / 원본 슬라이드 27: 가장 가까운 두 수 — closest_pair.c
- P24 / 원본 슬라이드 28, 33: 비트마스크로 모든 부분집합 — power_set.c
- P25 / 원본 슬라이드 30–32, 54–55: 탐색 공간 계산 — search_space.c
- P26 / 원본 슬라이드 34: 외판원 순회 최소 비용 — tsp_min.c
- P27 / 원본 슬라이드 37: 합이 target인 부분집합 — subset_sum_count.c
- P28 / 원본 슬라이드 39: 기억하는 피보나치 — fib_memo.c
- P29 / 원본 슬라이드 45: 세 수의 합 개수 — three_sum_count.c
- P30 / 원본 슬라이드 46: 블랙잭 최대 합 — blackjack.c
- P31 / 원본 슬라이드 48: 모든 쌍의 차이 — pair_differences.c
- P32 / 원본 슬라이드 48: 합이 K인 세 수 나열 — three_sum_values.c
- P33 / 원본 슬라이드 49: 회문만 골라내기 — palindrome_words.c
- P34 / 원본 슬라이드 50: 0/1 배낭 완전 탐색 — knapsack.c
- P35 / 원본 슬라이드 51: 숫자 야구 후보 세기 — baseball_count.c
- P36 / 원본 슬라이드 43, 47: 2차원 배열 입력과 순회 — grid_sum.c
