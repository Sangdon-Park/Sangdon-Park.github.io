# 박상돈 개인 학술 프로필 웹사이트

이 저장소는 박상돈님의 개인 학술 프로필 웹사이트의 소스 코드입니다. GitHub Pages를 통해 호스팅됩니다.

[웹사이트 바로가기](https://sangdon-sayberry.github.io/) <!-- 실제 배포 주소 확인 필요 -->

## 웹사이트 소개

이 웹사이트는 박상돈님의 연구 활동과 학술적 성과를 소개합니다. 포함된 주요 내용은 다음과 같습니다:

*   **소개:** 연구 관심사 및 경력 요약
*   **AI 연구:** 주요 AI 연구 분야 소개 (대규모 언어 모델, 대화형 AI 등)
*   **연구 분야:** 세부 연구 주제 (에너지 거래 시스템, 모바일 엣지 컴퓨팅 등)
*   **논문:** 최신 논문 목록 및 Google Scholar 링크 (인용 수 포함)
*   **연구 경력:** 주요 연구 프로젝트 및 경력
*   **학력:** 학사, 석사, 박사 학위 정보
*   **연락처:** 이메일, 주소, 전화번호

웹사이트는 한국어와 영어 버전을 제공합니다.

## 기술 스택

*   HTML
*   CSS
*   JavaScript

## 웹사이트 업데이트 방법

### 개인 정보 및 내용 수정

*   **기본 정보 (소개, 경력, 학력, 연락처 등):** `ko.html` (한국어) 및 `en.html` (영어) 파일 내의 해당 섹션을 직접 수정합니다.
*   **프로필 사진:** `images/Sangdon.jpg` 파일을 원하는 이미지로 교체합니다.
*   **디자인:** `css/style.css` 파일에서 색상, 폰트, 레이아웃 등을 수정할 수 있습니다.

### 논문 목록 업데이트

논문 목록은 `js/script.js` 파일 내의 `publicationsData` 배열에 JavaScript 객체 형태로 저장되어 있습니다.

1.  `js/script.js` 파일을 엽니다.
2.  `loadPublications` 함수 내의 `publicationsData` 배열을 찾습니다.
3.  새 논문 정보를 다음 형식에 맞춰 추가하거나 기존 정보를 수정합니다:
    ```javascript
    {
        title: "논문 제목",
        authors: "저자 목록 (<em>본인 이름 강조</em>)",
        journal: "저널 또는 학회 정보 (년도 포함)",
        link: "논문 링크 (Google Scholar 또는 DOI)",
        type: "논문 타입 ('journal', 'conference', 'preprint', 'patent', 'standard' 등)",
        citations: 인용 수 (숫자, 없으면 null)
    },
    ```
4.  파일을 저장하고 변경사항을 GitHub에 푸시합니다.

## GitHub Pages 배포

이 웹사이트는 GitHub Pages를 통해 자동으로 배포됩니다. `main` 브랜치에 변경사항을 푸시하면 잠시 후 웹사이트에 반영됩니다.

웹사이트 주소: [https://sangdon-sayberry.github.io/](https://sangdon-sayberry.github.io/) <!-- 저장소 이름 기반 추정, 실제 주소 확인 -->

## 라이센스

이 웹사이트의 코드는 자유롭게 참고할 수 있습니다.