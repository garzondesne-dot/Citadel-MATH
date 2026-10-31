# Citadel-MATH 인계 문서

## 한눈에
| 항목 | 내용 |
|---|---|
| 출발점 | DIMENSION SLASHER **본편 v0.3.2** 그대로 복사 (2026-10-31). 게임 내용·코드는 아직 원본과 같다 |
| 바꾼 것 | 저장 키 `citadel-math-save`·`citadel-math-student` (원본과 저장 분리), 버전 `citadel-0.1`, 캐시 `ds-citadel-0.1`, 앱 이름 Citadel MATH, **결과 전송 끔**(`REPORT_URL = ''`, 결과 코드만) |
| 할 일 | 게임 방식 비틀기 — 컨셉 논의 중 (`docs/DECISIONS.md` 미결 질문) |
| 마감 | 사용자 언급: 11월 3일 |
| 기기 | 스마트폰 |

## v0.3.2 게임 요약 (원본 상세: `docs/origin/DS-HANDOVER.md`)
- **구조**: 캠프(대장간에서 카드 연성·덱 구성) → 전투(몬스터 = 문제) 반복. 1~4층 + 최종보스 체험판.
  - 1층 수직선의 회랑(선분의 내분) · 2층 직선의 성벽(평행·수직) · 3층 원환의 신전(점과 직선 거리·원의 방정식) · 4층 유성의 관측소(원과 직선)
- **전투**: 문제 조각을 🔍 스캔으로 공개 → 카드로 공격·방어 → 체력 문턱(결계 보호막)에서는 맞는 풀이 카드로 문제를 맞혀야 깨짐. 쓰러지면 되감기.
- **연성**: 모루 [재료][연산][재료]. 등급 기본·일반·매직·레어. 숙련(3번) → 즉시 연성·긴급 연성. 실수하면 개념 메시지.
- **v0.3.2 연성 개편**:
  - 원의 방정식 길 2개: ✂ 식 분해 → [x 조각]·[y 조각] + 영(零)의 결정 → 합치기 / [거리] = [r] → ²
  - 점과 직선 거리: 직선의 방정식 ⇄ 일반형 ↦ 한 점 → |·| → ÷ √[a² + b²]
  - ²·√ 발견형 연산: 같은 것끼리 × → ² 발견, ² 를 올렸다 꺼내면 √ 발견. 1층 부담 분산 + 자동 해금
- **기타**: 진동, 자동 저장, 첫 연성 튜토리얼, PWA(앱 설치), 결과 보내기(Apps Script).

## 파일 구조
| 파일 | 역할 |
|---|---|
| `index.html`, `css/style.css` | 화면 |
| `js/data.js` | 부품·연산·카드·옵션·진행(노드)·버전·결과 주소 |
| `js/craft.js` | 연성 규칙·실수 피드백·레시피 도감 |
| `js/mathgen.js` | 문제 생성기 |
| `js/monsters.js` | 몬스터 = 문제 |
| `js/battle.js`, `js/scene.js`, `js/cinematic.js`, `js/quiz.js` | 전투·그림·연출·문제 창 |
| `js/forge.js`, `js/cards.js`, `js/cardview.js` | 캠프(대장간·덱)·카드 |
| `js/main.js`, `js/save.js`, `js/report.js` | 흐름·저장·결과 보내기 |
| `sw.js`, `manifest.webmanifest`, `js/pwa.js` | 앱 설치·오프라인 |
| `tests/` | `node tests/mathgen.test.js`, `node tests/game.test.js` |
| `deploy/apps-script/Code.gs` | 결과·실시간 기록 수집 (DIMENSION SLASHER 와 같은 코드. Citadel 용으로 쓸지 미정) |
| `docs/origin/` | 원본 인계 문서·결정 목록 (참고용) |

## 배포
- 아직 안 함. GitHub Pages(저장소 Settings → Pages → main / root)를 켜면 `https://garzondesne-dot.github.io/Citadel-MATH/` 가 된다 (`docs/deploy-github-pages.md`).
