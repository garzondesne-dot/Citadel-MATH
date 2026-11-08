# templates/ — 배치 확인용 템플릿

> ⚠ 템플릿의 **칸 선 · 번호 · 기준선 · 점선 · 상자 · 글자는 결과물에 절대 그리지 않는다.** 위치만 맞추는 참고 그림이다.

| 파일 | 크기 | 쓰는 곳 |
|---|---|---|
| [tpl-cell-monster-768.png](tpl-cell-monster-768.png) | 768×768 | **일반 몬스터 한 프레임** (원본 96 × 8). 마젠타 · 하늘색 = 발 기준선(아래 3%) · 노랑 점선 = 가운데 · 흰 점선 = 안전 여백 3% |
| [tpl-cell-monster-96.png](tpl-cell-monster-96.png) | 96×96 | 같은 칸 원본 크기 |
| [tpl-cell-boss-768.png](tpl-cell-boss-768.png) | 768×768 | **보스 한 프레임** (원본 192 × 4) |
| [tpl-cell-boss-192.png](tpl-cell-boss-192.png) | 192×192 | 같은 칸 원본 크기 |
| [tpl-bg-1600x900-zones.png](tpl-bg-1600x900-zones.png) | 1600×900 | **배경 구도** (몬스터 · 보스 상자 · 그림자선 · 용사 두 줄 · 상단 막대(미정) · 폰 잘림) — `css/style.css` · `js/raid/hall.js` 값 |
| [tpl-sheet-mon-3x1-c96.png](tpl-sheet-mon-3x1-c96.png) · [tpl-sheet-mon-3x1-c192.png](tpl-sheet-mon-3x1-c192.png) | 288×96 · 576×192 | (#4 확인용) 한 마리 3동작 줄 · 칸 번호 |
| [tpl-sheet-mon-3x5-c192.png](tpl-sheet-mon-3x5-c192.png) | 576×960 | (#4 확인용) 차시 몬스터 시트 |
| [tpl-sheet-boss-3x1-c384.png](tpl-sheet-boss-3x1-c384.png) | 1152×384 | (#4 확인용) 보스 시트 |
| [tpl-castle3.png](tpl-castle3.png) · [tpl-castleboss2.png](tpl-castleboss2.png) | — | `assets/templates/castle/` 원본 복사 (예전 「한 장에 여러 칸」 방식 예 · 지금은 쓰지 않음) |

- GPT 에게 첨부하는 것은 **한 칸 템플릿**(`tpl-cell-*-768.png`) 또는 배경 템플릿뿐이다. `tpl-sheet-*` 는 #4 가 합친 결과를 확인하는 용도 (그림 AI 에게 여러 칸을 그리게 하지 않음).
- 상단 막대 높이 · 모루 공방 화면 안전 영역은 **미정** (코드에서 정확히 뽑지 못함).
