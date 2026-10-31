# Citadel-MATH 인계 문서

## 현재 상태
- 2026-10-31: 저장소 시작. DIMENSION SLASHER 번외편 「포함의 결계」 엔진을 그대로 복사 (내용은 아직 집합 수업용 그대로).
- 컨셉(무엇을 어떻게 비틀지)은 사용자와 논의 중 → `docs/DECISIONS.md` 의 "미결 질문".

## 파일 구조 (복사해 온 엔진)
| 파일 | 역할 |
|---|---|
| `index.html`, `css/style.css` | 학생 화면 |
| `js/data.js` | 부품·연산·카드·진행(노드)·버전 |
| `js/craft.js` | 연성 규칙(엄격)·도감 |
| `js/setgen.js` | 문제 형식(기호 넣기·O/X·숫자·여러 개·부분집합 만들기)·연성 예제 |
| `js/monsters.js` | 몬스터 = 문제 |
| `js/battle.js`, `js/scene.js` | 전투·그림 |
| `js/forge.js` | 캠프(연성대)·튜토리얼 |
| `js/codes.js`, `teacher.html` | 날짜별 해금 코드 |
| `js/track.js`, `js/dash.js`, `dashboard.html`, `deploy/apps-script/Code.gs` | 실시간 진행 전송·교사 현황 |
| `tests/` | 검산 테스트 |
| `docs/engine-from-sets.md` | 원본(포함의 결계) 설명 |

## 배포
- 아직 안 함. GitHub Pages 를 켜면 학생 주소가 생긴다 (저장소 공개 필요).
- 실시간 현황은 DIMENSION SLASHER 와 같은 Apps Script 웹 앱 주소를 쓰고 있다(`js/data.js` 의 `REPORT_URL`). 따로 쓸지 정해야 한다.
