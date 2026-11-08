# m10-05 · 거울 웅덩이 두꺼비 (Mirror-Pool Toad)

> ⛔ 결과물은 `asset-handoff/outputs/m10-05/` 에만. 게임 폴더 · main 은 건드리지 않는다. 템플릿 선 · 번호는 그리지 않는다.

| 항목 | 값 |
|---|---|
| 고유 ID | `m10-05` |
| 이름 | 거울 웅덩이 두꺼비 (Mirror-Pool Toad) (**확정** · 2026-11-08 선생님 「추천대로」) |
| 게임 내 용도 | 10차시 ⚖ 일반 몬스터 |
| 우선순위 | P2 |
| 구분 | 신규 |
| 출력 파일 (GPT) | `outputs/m10-05/m10-05_idle_1.png` (마스터) · `m10-05_attack_1.png` · `m10-05_down_1.png` |
| 게임 경로 (#4 가 적용) | `assets/art/monsters-skygarden-v1.webp` (이름 예정 · #4 결정 · 3열 × 5줄 · 칸 192 · 줄 4 · `'skygarden:4'`) |

| 항목 | 값 |
|---|---|
| 단일 / 시트 | **한 장 = 한 프레임 (단일 이미지)**. 여러 칸 시트를 그리지 않는다 — 시트는 #4 가 도구로 합침 |
| 파일 형식 | PNG (RGB · 마젠타 배경) |
| 원본 크기 | 정사각 · **768×768 권장** (원본 96×96 도트를 8배로 키운 것처럼 블록 8px). 도구가 정사각 1024 만 내면 1024×1024 도 됨 |
| 최종 출력 크기 (#4) | 시트 칸 **192×192** → 시트 576×960 (3열 × 5줄, 한 줄 = 이 몬스터) |
| 배경 처리 | 단색 마젠타 `#FF00FF` 꽉 채움 → #4 가 `demagenta.py` 로 투명 |
| 투명 여백 · 안전 영역 | 템플릿 흰 점선 = 가장자리 3% 안쪽. 몸 · 무기 · 이펙트 모두 그 안. 발은 하늘색 기준선(아래 3%) 위 |
| 화면 크기 · 위치 · 방향 | 교실 TV 가운데 위 `min(46vh, 440px)` 정사각 · 학생 폰 150~160px · **왼쪽을 봄** |

## 외형 · 색 · 장비 · 표정

- 정원 연못 돌 위의 통통한 청록 두꺼비 · 등에 물웅덩이 거울
- 거울에 거꾸로 비친 두꺼비 모습(대우 = 거꾸로 비춤)
- 등 거울에 빛나는 룬 `~` 하나

## 동작 (프레임 순서 = 시트 열 번호)

| 열 | 동작 | 포즈 |
|---|---|---|
| 0 | 대기 (`idle`) | sitting on a lily stone, mirror-pool on its back reflecting |
| 1 | 공격 (`attack`) | leaps forward to the left with its long tongue lashing |
| 2 | 쓰러짐 (`down`) | flipped belly-up, mirror-pool spilled, eyes dazed |

## 참고 이미지

| 파일 | 역할 |
|---|---|
| [monsters-mirror-v2.webp](../references/monsters-mirror-v2.webp) | 화풍 기준 (픽셀 굵기 · 외곽선 · 빛 · 칸 안 크기) — 8차시 일반 몬스터 |
| [monsters-mirror-v2-grid-preview.png](../references/monsters-mirror-v2-grid-preview.png) | 칸 · 발 기준선(하늘색) · 가운데(노랑) 확인용 미리보기 |
| [dg-10-sky-v1-now-preview.webp](../references/now/dg-10-sky-v1-now-preview.webp) | 테마 분위기 참고 (구름 위 · 밝은 하늘 · 떠 있는 돌) — 10차시는 여기에 정원 · 저울을 더함 · 화풍은 따르지 않음 |
| [m10-01_master.png](../references/masters/m10-01_master.png) | (승인 뒤 생김) 10차시 화풍 기준 — 같은 테마 · 같은 크기 등급 |

## 유지할 요소 / 바꿀 요소

- 유지: 8차시 몬스터와 같은 크기 등급 · 픽셀 굵기 · 외곽선 · 왼쪽 방향 · 빛나는 강조색 하나 · 몸의 수학 룬 하나
- 바꿀 것: 테마를 저울의 공중 정원으로 (흰 대리석 · 연두 덩굴 · 하늘빛 · 금빛 저울) · 모양은 10차시 개념(충분조건 · 필요조건 · 대우 증명)

## 생성 단계 · 프롬프트 (동작마다 한 장)

### 1단계 · 마스터 = 대기 1프레임 (**여기서 멈추고 선생님 승인을 기다림**)
- 첨부: 템플릿 [tpl-cell-monster-768.png](../templates/tpl-cell-monster-768.png) + 위 「참고 이미지」 표의 화풍 기준 그림
- 저장: `outputs/m10-05/m10-05_idle_1.png`
- 승인되면 #4 가 `references/masters/m10-05_master.png` 로 고정

```
[STYLE BIBLE — STYLE_GUIDE.md 7절 머리말을 그대로 맨 앞에]
Use the attached template only for placement; do NOT draw its lines, boxes or labels.
ONE single frame (not a sprite sheet) of ONE monster: "Mirror-Pool Toad" — a chubby teal toad sitting on a lily stone with a small mirror-like water pool on its back that shows an upside-down reflection; a small glowing rune ~ on the pool.
Pose: IDLE — sitting on a lily stone, mirror-pool on its back reflecting
Facing LEFT. Feet on the cyan line, body centered on the yellow dashed line, everything inside the white dashed box.
Solid flat magenta #FF00FF background. Cute but dangerous.
```
### 2단계 · 공격 1프레임 (마스터 승인 뒤)
- 첨부: **`references/masters/m10-05_master.png` + 템플릿 [tpl-cell-monster-768.png](../templates/tpl-cell-monster-768.png) 만** (앞 결과물 첨부 금지 · 사슬 금지)
- 저장: `outputs/m10-05/m10-05_attack_1.png` (다시 만들면 `_r2` · `_r3`)

```
[STYLE BIBLE — STYLE_GUIDE.md 7절 머리말을 그대로 맨 앞에]
Match the attached MASTER exactly: same face, colors, proportions, outline, size; only the pose changes.
Use the attached template only for placement; do NOT draw its lines, boxes or labels.
ONE single frame (not a sprite sheet) of the same monster as the MASTER.
Pose: ATTACK — leaps forward to the left with its long tongue lashing
Facing LEFT. Feet on the cyan line, centered, everything (incl. effects) inside the white dashed box.
Solid flat magenta #FF00FF background.
```
### 3단계 · 쓰러짐 1프레임 (마스터 승인 뒤)
- 첨부: **`references/masters/m10-05_master.png` + 템플릿 [tpl-cell-monster-768.png](../templates/tpl-cell-monster-768.png) 만** (앞 결과물 첨부 금지 · 사슬 금지)
- 저장: `outputs/m10-05/m10-05_down_1.png` (다시 만들면 `_r2` · `_r3`)

```
[STYLE BIBLE — STYLE_GUIDE.md 7절 머리말을 그대로 맨 앞에]
Match the attached MASTER exactly: same face, colors, proportions, outline, size; only the pose changes.
Use the attached template only for placement; do NOT draw its lines, boxes or labels.
ONE single frame (not a sprite sheet) of the same monster as the MASTER.
Pose: DOWN — flipped belly-up, mirror-pool spilled, eyes dazed
Facing LEFT. Feet on the cyan line, centered, everything (incl. effects) inside the white dashed box.
Solid flat magenta #FF00FF background.
```

한국어 요약: 등에 거울 웅덩이 두꺼비 · ~ 룬. 앉음 → 혀 뻗으며 뛰기 → 배 뒤집고 쓰러짐.

## 완료 확인

- [ ] 마젠타 `#FF00FF` 단색 배경 · 그림 전체 테두리 없음 · 글자 · 숫자 · 가이드선 없음
- [ ] 왼쪽(용사 쪽)을 봄
- [ ] 몸 전체가 템플릿 흰 점선(안전 여백 3%) 안 · 발(바닥 닿는 곳)이 하늘색 기준선 위 · 몸 가운데가 노랑 점선
- [ ] 픽셀 블록 크기가 그림 전체에서 같음 · 번짐 · 흐림 없음 · 외곽선 진한 남보라
- [ ] (마스터가 아닌 프레임) 마스터 대비 ① 실루엣 높이 · 폭 ±5% ② 주요 색 같은 팔레트 칸 ③ 장비 · 표식 · 룬 유지 ④ 방향 같음
- [ ] 금지: 글자 · 숫자 · 수식 · 워터마크 · 테두리 · 바닥 그림자 · 배경 소품 · 템플릿 선/번호 없음 · 마젠타(#FF00FF)와 진한 분홍은 몬스터 안에 쓰지 않음
