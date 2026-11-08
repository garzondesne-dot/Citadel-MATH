# b09-01 · 역과 대우의 문지기 (Gatekeeper of Converse and Contrapositive)

> ⛔ 결과물은 `asset-handoff/outputs/b09-01/` 에만. 게임 폴더 · main 은 건드리지 않는다. 템플릿 선 · 번호는 그리지 않는다.

| 항목 | 값 |
|---|---|
| 고유 ID | `b09-01` |
| 이름 | 역과 대우의 문지기 (Gatekeeper of Converse and Contrapositive) (**확정** · 2026-11-08 선생님 「추천대로」) |
| 게임 내 용도 | 9차시 👑 형성평가 보스 |
| 우선순위 | P2 |
| 구분 | 신규 |
| 출력 파일 (GPT) | `outputs/b09-01/b09-01_idle_1.png` (마스터) · `b09-01_attack_1.png` · `b09-01_down_1.png` |
| 게임 경로 (#4 가 적용) | `assets/art/monsters-keyvaultboss-v1.webp` (이름 예정 · 3열 × 1줄 · 칸 384 · `'keyvaultboss:0'`) |

| 항목 | 값 |
|---|---|
| 단일 / 시트 | **한 장 = 한 프레임 (단일 이미지)**. 여러 칸 시트를 그리지 않는다 — 시트는 #4 가 도구로 합침 |
| 파일 형식 | PNG (RGB · 마젠타 배경) |
| 원본 크기 | 정사각 · **768×768 권장** (원본 192×192 도트를 4배로 키운 것처럼 블록 4px). 도구가 정사각 1024 만 내면 1024×1024 도 됨 |
| 최종 출력 크기 (#4) | 시트 칸 **384×384** → 시트 1152×384 (3열 × 1줄) |
| 배경 처리 | 단색 마젠타 `#FF00FF` 꽉 채움 → #4 가 `demagenta.py` 로 투명 |
| 투명 여백 · 안전 영역 | 템플릿 흰 점선 = 가장자리 3% 안쪽. 몸 · 무기 · 이펙트 모두 그 안. 발은 하늘색 기준선(아래 3%) 위 |
| 화면 크기 · 위치 · 방향 | 교실 TV 가운데 위 `min(54vh, 520px)` 정사각 · 학생 폰 168px · **왼쪽을 봄** |

## 외형 · 색 · 장비 · 표정

- 거대한 묘실 문 몸 · 양쪽 문짝이 팔 · 가운데 열쇠 구멍이 입
- 머리에 녹슨 청동 열쇠 왕관 · 몸을 감은 금빛 사슬
- 문 가운데 크게 빛나는 룬 `⇄` 하나 · 강조색 = 보랏빛 봉인

## 동작 (프레임 순서 = 시트 열 번호)

| 열 | 동작 | 포즈 |
|---|---|---|
| 0 | 대기 (`idle`) | standing tall, door-arms closed, keyhole mouth glowing |
| 1 | 공격 (`attack`) | swings both door-arms open forward to the left releasing a violet seal shockwave |
| 2 | 쓰러짐 (`down`) | collapsed and broken apart, door panels fallen, chains loose, glow out |

## 참고 이미지

| 파일 | 역할 |
|---|---|
| [monsters-mirrorboss-v3.webp](../references/monsters-mirrorboss-v3.webp) | 보스 화풍 기준 (자세함 · 장신구 · 강조색 · 3자세) |
| [monsters-mirrorboss-v3-grid-preview.png](../references/monsters-mirrorboss-v3-grid-preview.png) | 보스 칸 · 기준선 미리보기 |
| [m09-01_master.png](../references/masters/m09-01_master.png) | (승인 뒤 생김) 9차시 화풍 기준 — 같은 테마 · 같은 크기 등급 |
| [dg-08-crypt-v1-now-preview.webp](../references/now/dg-08-crypt-v1-now-preview.webp) | 테마 분위기 참고 (어두운 지하 묘실 · 돌 · 횃불) — 9차시는 여기에 열쇠 · 자물쇠 · 사슬을 더함 · 화풍은 따르지 않음 |

## 유지할 요소 / 바꿀 요소

- 유지: 8차시 몬스터와 같은 크기 등급 · 픽셀 굵기 · 외곽선 · 왼쪽 방향 · 빛나는 강조색 하나 · 몸의 수학 룬 하나
- 바꿀 것: 테마를 열쇠 · 자물쇠의 묘실로 (녹슨 청동 · 금빛 열쇠 · 보라빛 봉인) · 모양은 9차시 개념(p → q · 역 · 대우)

## 생성 단계 · 프롬프트 (동작마다 한 장)

### 1단계 · 마스터 = 대기 1프레임 (**여기서 멈추고 선생님 승인을 기다림**)
- 첨부: 템플릿 [tpl-cell-boss-768.png](../templates/tpl-cell-boss-768.png) + 위 「참고 이미지」 표의 화풍 기준 그림
- 저장: `outputs/b09-01/b09-01_idle_1.png`
- 승인되면 #4 가 `references/masters/b09-01_master.png` 로 고정

```
[STYLE BIBLE — STYLE_GUIDE.md 7절 머리말을 그대로 맨 앞에]
Use the attached template only for placement; do NOT draw its lines, boxes or labels.
ONE single frame (not a sprite sheet) of ONE BOSS: "Gatekeeper of Converse and Contrapositive" — a giant living vault door: the two door panels are its arms, the keyhole in the center is its mouth, a rusty bronze key-crown on top, wrapped in golden chains; a large glowing rune ⇄ at the center; accent color violet seal light.
Pose: IDLE — standing tall, door-arms closed, keyhole mouth glowing
Facing LEFT. Feet on the cyan line, body centered on the yellow dashed line, everything inside the white dashed box.
Solid flat magenta #FF00FF background. Clearly bigger, more detailed and more imposing than a normal monster, one glowing accent color.
```
### 2단계 · 공격 1프레임 (마스터 승인 뒤)
- 첨부: **`references/masters/b09-01_master.png` + 템플릿 [tpl-cell-boss-768.png](../templates/tpl-cell-boss-768.png) 만** (앞 결과물 첨부 금지 · 사슬 금지)
- 저장: `outputs/b09-01/b09-01_attack_1.png` (다시 만들면 `_r2` · `_r3`)

```
[STYLE BIBLE — STYLE_GUIDE.md 7절 머리말을 그대로 맨 앞에]
Match the attached MASTER exactly: same face, colors, proportions, outline, size; only the pose changes.
Use the attached template only for placement; do NOT draw its lines, boxes or labels.
ONE single frame (not a sprite sheet) of the same boss as the MASTER.
Pose: ATTACK — swings both door-arms open forward to the left releasing a violet seal shockwave
Facing LEFT. Feet on the cyan line, centered, everything (incl. effects) inside the white dashed box.
Solid flat magenta #FF00FF background.
```
### 3단계 · 쓰러짐 1프레임 (마스터 승인 뒤)
- 첨부: **`references/masters/b09-01_master.png` + 템플릿 [tpl-cell-boss-768.png](../templates/tpl-cell-boss-768.png) 만** (앞 결과물 첨부 금지 · 사슬 금지)
- 저장: `outputs/b09-01/b09-01_down_1.png` (다시 만들면 `_r2` · `_r3`)

```
[STYLE BIBLE — STYLE_GUIDE.md 7절 머리말을 그대로 맨 앞에]
Match the attached MASTER exactly: same face, colors, proportions, outline, size; only the pose changes.
Use the attached template only for placement; do NOT draw its lines, boxes or labels.
ONE single frame (not a sprite sheet) of the same boss as the MASTER.
Pose: DOWN — collapsed and broken apart, door panels fallen, chains loose, glow out
Facing LEFT. Feet on the cyan line, centered, everything (incl. effects) inside the white dashed box.
Solid flat magenta #FF00FF background.
```

한국어 요약: 거대한 묘실 문 보스 · ⇄ 룬. 문 닫고 서 있음 → 양문 열며 봉인 충격파 → 부서져 무너짐.

## 완료 확인

- [ ] 마젠타 `#FF00FF` 단색 배경 · 그림 전체 테두리 없음 · 글자 · 숫자 · 가이드선 없음
- [ ] 왼쪽(용사 쪽)을 봄
- [ ] 몸 전체가 템플릿 흰 점선(안전 여백 3%) 안 · 발(바닥 닿는 곳)이 하늘색 기준선 위 · 몸 가운데가 노랑 점선
- [ ] 픽셀 블록 크기가 그림 전체에서 같음 · 번짐 · 흐림 없음 · 외곽선 진한 남보라
- [ ] (마스터가 아닌 프레임) 마스터 대비 ① 실루엣 높이 · 폭 ±5% ② 주요 색 같은 팔레트 칸 ③ 장비 · 표식 · 룬 유지 ④ 방향 같음
- [ ] 금지: 글자 · 숫자 · 수식 · 워터마크 · 테두리 · 바닥 그림자 · 배경 소품 · 템플릿 선/번호 없음 · 마젠타(#FF00FF)와 진한 분홍은 몬스터 안에 쓰지 않음
