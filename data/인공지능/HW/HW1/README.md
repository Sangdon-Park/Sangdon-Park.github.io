# 1주차 과제: K-최근접 이웃으로 과일 분류하기

## 📋 과제 개요

| 항목 | 내용 |
|------|------|
| **과목** | 머신러닝 |
| **참고** | 혼자 공부하는 머신러닝+딥러닝 1-3장 |
| **총점** | 100점 |
| **채점** | GitHub Actions 자동 채점 |

## 📝 문제 구성

| 문제 | 내용 | 배점 |
|------|------|------|
| 문제 0 | 데이터 준비 (weight, sugar, fruit_data, fruit_target) | 10점 |
| 문제 1 | KNN 모델 훈련 및 정확도 확인 | 20점 |
| 문제 2 | 새로운 데이터 예측 (사과/귤) | 20점 |
| 문제 3 | n_neighbors=50 실험 | 25점 |
| 문제 4 | 최적의 n_neighbors 찾기 | 25점 |

## 🚀 제출 방법

1. `assignment.ipynb`에서 `# YOUR CODE HERE` 부분에 코드를 작성합니다.
2. `raise NotImplementedError()`를 반드시 삭제합니다.
3. 완성된 파일을 commit & push합니다.

```bash
git add assignment.ipynb
git commit -m "1주차 과제 제출"
git push
```

4. GitHub **Actions** 탭에서 자동 채점 결과를 확인합니다.

## ⚠️ 주의사항

- **변수명**을 반드시 지켜주세요 (자동 채점에 사용됩니다).
- `raise NotImplementedError()`가 남아있으면 **0점** 처리됩니다.
- `tests/` 폴더와 `.github/` 폴더의 파일을 **수정하지 마세요**.

### 로컬 테스트

```bash
pip install scikit-learn matplotlib pytest nbformat nbconvert ipykernel jupyter_client
pytest tests/test_assignment.py -v
```
