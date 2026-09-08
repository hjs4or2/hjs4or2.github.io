# 한재성 작업 자료

C++/Qt Application Engineer 포트폴리오와 채용 플랫폼별 이력서를 분리해 관리합니다.

## 디렉터리

- `portfolio/`: 공개용 정적 포트폴리오와 이미지 자료
- `resume/`: 플랫폼별 이력서, 지원용 문서와 생성 스크립트를 관리하는 로컬 디렉터리
- `index.html`: 기존 GitHub Pages 주소를 `portfolio/`로 연결하는 진입 페이지

## 확인 방법

루트의 `index.html` 또는 `portfolio/index.html`을 브라우저로 열면 됩니다.

페이지의 `PDF` 버튼은 선택한 언어로 제출용 8페이지를 인쇄합니다. 프로젝트 설명과 함께 구현 화면, 현장 사진, 사용량 그래프, 보고서 예시를 포함합니다. 인쇄 구성은 `portfolio/resource/print-portfolio.js`와 `print-portfolio.css`에서 관리하며, 본문과 동일한 프로젝트 데이터를 사용합니다.

현재 제출용 파일은 `output/pdf/portfolio-ko.pdf`와 `output/pdf/portfolio-en.pdf`에 있습니다. 내용을 수정한 뒤에는 `PDF` 버튼으로 새 파일을 저장하면 됩니다.

`resume/`의 실제 지원 문서, `portfolio/resource/Temp`의 원본 자료와 `portfolio/archive`의 백업 자료는 로컬에서만 관리하며 공개 커밋에서는 제외합니다.
