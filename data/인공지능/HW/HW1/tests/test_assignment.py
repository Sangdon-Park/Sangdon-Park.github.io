"""
1주차 과제 자동 채점 테스트
- GitHub Classroom Autograding용
- 과일 분류 (사과 vs 귤) - KNN
"""

import pytest
import os


@pytest.fixture(scope="session")
def notebook_vars():
    """과제 노트북의 코드를 실행하고 변수들을 추출"""
    nb_path = os.path.join(os.path.dirname(__file__), "..", "assignment.ipynb")

    if not os.path.exists(nb_path):
        pytest.fail("assignment.ipynb 파일을 찾을 수 없습니다.")

    import json
    with open(nb_path, "r", encoding="utf-8") as f:
        nb = json.load(f)

    all_code = []
    for cell in nb["cells"]:
        if cell["cell_type"] == "code":
            src = "".join(cell["source"])
            if "raise NotImplementedError()" in src:
                pytest.fail(
                    "아직 구현하지 않은 코드(raise NotImplementedError)가 남아있습니다."
                )
            # matplotlib 시각화 코드는 건너뛰기
            if "plt.show()" in src:
                continue
            all_code.append(src)

    namespace = {}
    combined = "\n".join(all_code)
    try:
        exec(combined, namespace)
    except Exception as e:
        pytest.fail(f"코드 실행 중 오류 발생: {e}")

    return namespace


# ============================================================
# 문제 0: 데이터 준비 (10점)
# ============================================================

class TestQ0DataPrep:

    def test_weight_list(self, notebook_vars):
        """weight 리스트가 올바르게 생성되었는지 확인"""
        w = notebook_vars.get("weight")
        assert w is not None, "변수 'weight'가 정의되지 않았습니다."
        assert isinstance(w, list), "weight는 리스트여야 합니다."
        assert len(w) == 50, f"weight의 길이는 50이어야 합니다. (현재: {len(w)})"
        assert w[0] == 151.0, "weight의 첫 번째 값이 올바르지 않습니다 (사과 데이터 시작)."
        assert w[-1] == 119.3, "weight의 마지막 값이 올바르지 않습니다 (귤 데이터 끝)."

    def test_sugar_list(self, notebook_vars):
        """sugar 리스트가 올바르게 생성되었는지 확인"""
        s = notebook_vars.get("sugar")
        assert s is not None, "변수 'sugar'가 정의되지 않았습니다."
        assert isinstance(s, list), "sugar는 리스트여야 합니다."
        assert len(s) == 50, f"sugar의 길이는 50이어야 합니다. (현재: {len(s)})"
        assert s[0] == 14.2, "sugar의 첫 번째 값이 올바르지 않습니다."
        assert s[-1] == 13.2, "sugar의 마지막 값이 올바르지 않습니다."

    def test_fruit_data(self, notebook_vars):
        """fruit_data가 올바른 2차원 리스트인지 확인"""
        fd = notebook_vars.get("fruit_data")
        assert fd is not None, "변수 'fruit_data'가 정의되지 않았습니다."
        assert isinstance(fd, list), "fruit_data는 리스트여야 합니다."
        assert len(fd) == 50, f"fruit_data의 길이는 50이어야 합니다. (현재: {len(fd)})"
        assert len(fd[0]) == 2, "fruit_data의 각 원소는 [무게, 당도] 형태여야 합니다."
        assert fd[0] == [151.0, 14.2], "fruit_data의 첫 번째 원소가 올바르지 않습니다."

    def test_fruit_target(self, notebook_vars):
        """fruit_target이 올바르게 라벨링되었는지 확인"""
        ft = notebook_vars.get("fruit_target")
        assert ft is not None, "변수 'fruit_target'이 정의되지 않았습니다."
        assert isinstance(ft, list), "fruit_target은 리스트여야 합니다."
        assert len(ft) == 50, f"fruit_target의 길이는 50이어야 합니다. (현재: {len(ft)})"
        assert sum(ft) == 30, "사과(1)의 개수는 30개여야 합니다."
        assert ft[:30] == [1] * 30, "처음 30개는 사과(1)여야 합니다."
        assert ft[30:] == [0] * 20, "나머지 20개는 귤(0)이어야 합니다."


# ============================================================
# 문제 1: KNN 모델 훈련 (20점)
# ============================================================

class TestQ1KNNTrain:

    def test_kn_exists(self, notebook_vars):
        """KNeighborsClassifier 객체가 생성되었는지 확인"""
        from sklearn.neighbors import KNeighborsClassifier
        kn = notebook_vars.get("kn")
        assert kn is not None, "변수 'kn'이 정의되지 않았습니다."
        assert isinstance(kn, KNeighborsClassifier), \
            "kn은 KNeighborsClassifier 객체여야 합니다."

    def test_train_score(self, notebook_vars):
        """훈련 정확도가 올바른지 확인"""
        ts = notebook_vars.get("train_score")
        assert ts is not None, "변수 'train_score'가 정의되지 않았습니다."
        assert isinstance(ts, float), "train_score는 실수(float)여야 합니다."
        assert ts == 1.0, \
            f"기본 KNN(n_neighbors=5)의 훈련 정확도는 1.0이어야 합니다. (현재: {ts})"


# ============================================================
# 문제 2: 새로운 데이터 예측 (20점)
# ============================================================

class TestQ2Predict:

    def test_pred_apple(self, notebook_vars):
        """[200, 13] 과일 예측이 사과(1)인지 확인"""
        pa = notebook_vars.get("pred_apple")
        assert pa is not None, "변수 'pred_apple'이 정의되지 않았습니다."
        result = pa[0] if hasattr(pa, "__getitem__") else pa
        assert result == 1, \
            f"무게 200, 당도 13인 과일은 사과(1)로 예측되어야 합니다. (현재: {result})"

    def test_pred_mandarin(self, notebook_vars):
        """[80, 10] 과일 예측이 귤(0)인지 확인"""
        pm = notebook_vars.get("pred_mandarin")
        assert pm is not None, "변수 'pred_mandarin'이 정의되지 않았습니다."
        result = pm[0] if hasattr(pm, "__getitem__") else pm
        assert result == 0, \
            f"무게 80, 당도 10인 과일은 귤(0)로 예측되어야 합니다. (현재: {result})"


# ============================================================
# 문제 3: n_neighbors=50 실험 (25점)
# ============================================================

class TestQ3N50:

    def test_kn50_exists(self, notebook_vars):
        """n_neighbors=50 모델이 올바르게 생성되었는지 확인"""
        from sklearn.neighbors import KNeighborsClassifier
        kn50 = notebook_vars.get("kn50")
        assert kn50 is not None, "변수 'kn50'이 정의되지 않았습니다."
        assert isinstance(kn50, KNeighborsClassifier), \
            "kn50은 KNeighborsClassifier 객체여야 합니다."
        assert kn50.n_neighbors == 50, \
            f"kn50의 n_neighbors는 50이어야 합니다. (현재: {kn50.n_neighbors})"

    def test_score_50(self, notebook_vars):
        """n_neighbors=50 정확도가 올바른지 확인"""
        s50 = notebook_vars.get("score_50")
        assert s50 is not None, "변수 'score_50'이 정의되지 않았습니다."
        assert abs(s50 - 30 / 50) < 1e-6, \
            f"n_neighbors=50의 정확도는 {30/50}이어야 합니다. (현재: {s50})"

    def test_expected_score(self, notebook_vars):
        """예상 정확도(30/50)가 올바르게 계산되었는지 확인"""
        es = notebook_vars.get("expected_score")
        assert es is not None, "변수 'expected_score'가 정의되지 않았습니다."
        assert abs(es - 30 / 50) < 1e-6, \
            f"expected_score는 30/50 = {30/50}이어야 합니다. (현재: {es})"


# ============================================================
# 문제 4: 최적의 n_neighbors 찾기 (25점)
# ============================================================

class TestQ4OptimalK:

    def test_first_drop_n(self, notebook_vars):
        """처음 정확도가 떨어지는 n_neighbors 값 확인"""
        fdn = notebook_vars.get("first_drop_n")
        assert fdn is not None, "변수 'first_drop_n'이 정의되지 않았습니다."
        assert fdn == 36, \
            f"처음 정확도가 1.0 미만이 되는 n_neighbors는 36이어야 합니다. (현재: {fdn})"

    def test_first_drop_score(self, notebook_vars):
        """처음 떨어진 정확도 값 확인"""
        fds = notebook_vars.get("first_drop_score")
        assert fds is not None, "변수 'first_drop_score'가 정의되지 않았습니다."
        assert fds < 1.0, "first_drop_score는 1.0 미만이어야 합니다."
        assert abs(fds - 0.98) < 1e-6, \
            f"first_drop_score는 0.98이어야 합니다. (현재: {fds})"
