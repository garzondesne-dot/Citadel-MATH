# b11-01 · 모순의 리바이어던 (Leviathan of Contradiction)

> ⛔ 결과물은 `asset-handoff/outputs/b11-01/` 에만. 게임 폴더 · main 은 건드리지 않는다. 템플릿 선 · 번호는 그리지 않는다.

| 항목 | 값 |
|---|---|
| 고유 ID | `b11-01` |
| 이름 | 모순의 리바이어던 (Leviathan of Contradiction) (**이름 · 콘셉트 = 후보** · `docs/DECISIONS.md` 2026-11-04 「명제 단원 던전 · 몬스터 컨셉」의 수중 신전 목록 — 당시 10차시 · 지금 11차시. 선생님 확인 필요) |
| 게임 내 용도 | 11차시 👑 형성평가 보스 |
| 우선순위 | P2 |
| 구분 | 신규 |
| 출력 파일 (GPT) | `outputs/b11-01/b11-01_idle_1.png` (마스터) · `b11-01_attack_1.png` · `b11-01_down_1.png` |
| 게임 경로 (#4 가 적용) | `assets/art/monsters-underseaboss-v1.webp` (이름 예정 · 3열 × 1줄 · 칸 384 · `'underseaboss:0'`) |

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

- 몸을 감아 올린 거대한 바다뱀 · 용 · 머리에 산호 왕관 · 지느러미는 찢어진 신전 깃발
- 몸 색이 반반: 왼쪽 차분한 청록 / 오른쪽 성난 진홍 (모순)
- 가슴에 크게 빛나는 룬 `⊥` · 강조색 = 청록 빛

## 동작 (프레임 순서 = 시트 열 번호)

| 열 | 동작 | 포즈 |
|---|---|---|
| 0 | 대기 (`idle`) | coiled upright, crown glowing, breathing slowly |
| 1 | 공격 (`attack`) | strikes to the left with jaws open, a spiralling water-and-light blast from the mouth (inside the box) |
| 2 | 쓰러짐 (`down`) | coils collapsed on the floor, crown cracked and fallen, rune dark, eyes closed |

## 참고 이미지

| 파일 | 역할 |
|---|---|
| [monsters-mirrorboss-v3.webp](../references/monsters-mirrorboss-v3.webp) | 보스 화풍 기준 (자세함 · 장신구 · 강조색 · 3자세) |
| [monsters-mirrorboss-v3-grid-preview.png](../references/monsters-mirrorboss-v3-grid-preview.png) | 보스 칸 · 기준선 미리보기 |
| [m11-01_master.png](../references/masters/m11-01_master.png) | (승인 뒤 생김) 11차시 화풍 |
| [dg-09-underwater-v1-now-preview.webp](../references/now/dg-09-underwater-v1-now-preview.webp) | 테마 분위기 |

## 유지할 요소 / 바꿀 요소

- 유지: 8차시 보스와 같은 크기 등급 · 자세함 · 3자세 구성 · 왼쪽 방향
- 바꿀 것: 수중 신전 테마 · 모순(반반 색) 콘셉트

## 생성 단계 · 프롬프트 (동작마다 한 장)

### 1단계 · 마스터 = 대기 1프레임 (**여기서 멈추고 선생님 승인을 기다림**)
- 첨부: 템플릿 [tpl-cell-boss-768.png](../templates/tpl-cell-boss-768.png) + 위 「참고 이미지」 표의 화풍 기준 그림
- 저장: `outputs/b11-01/b11-01_idle_1.png`
- 승인되면 #4 가 `references/masters/b11-01_master.png` 로 고정

```
[STYLE BIBLE — STYLE_GUIDE.md 7절 머리말을 그대로 맨 앞에]
Use the attached template only for placement; do NOT draw its lines, boxes or labels.
ONE single frame (not a sprite sheet) of ONE BOSS: "Leviathan of Contradiction" — a huge sea serpent-dragon rising in a coil, coral crown on its head, fins like torn temple banners; its body is split in color: the left half calm teal, the right half angry crimson (two contradicting sides); a large glowing rune ⊥ on its chest; one glowing accent color (teal).
Pose: IDLE — coiled upright, crown glowing, breathing slowly
Facing LEFT. Feet on the cyan line, body centered on the yellow dashed line, everything inside the white dashed box.
Solid flat magenta #FF00FF background. Clearly bigger, more detailed and more imposing than a normal monster, one glowing accent color.
```
### 2단계 · 공격 1프레임 (마스터 승인 뒤)
- 첨부: **`references/masters/b11-01_master.png` + 템플릿 [tpl-cell-boss-768.png](../templates/tpl-cell-boss-768.png) 만** (앞 결과물 첨부 금지 · 사슬 금지)
- 저장: `outputs/b11-01/b11-01_attack_1.png` (다시 만들면 `_r2` · `_r3`)

```
[STYLE BIBLE — STYLE_GUIDE.md 7절 머리말을 그대로 맨 앞에]
Match the attached MASTER exactly: same face, colors, proportions, outline, size; only the pose changes.
Use the attached template only for placement; do NOT draw its lines, boxes or labels.
ONE single frame (not a sprite sheet) of the same boss as the MASTER.
Pose: ATTACK — strikes to the left with jaws open, a spiralling water-and-light blast from the mouth (inside the box)
Facing LEFT. Feet on the cyan line, centered, everything (incl. effects) inside the white dashed box.
Solid flat magenta #FF00FF background.
```
### 3단계 · 쓰러짐 1프레임 (마스터 승인 뒤)
- 첨부: **`references/masters/b11-01_master.png` + 템플릿 [tpl-cell-boss-768.png](../templates/tpl-cell-boss-768.png) 만** (앞 결과물 첨부 금지 · 사슬 금지)
- 저장: `outputs/b11-01/b11-01_down_1.png` (다시 만들면 `_r2` · `_r3`)

```
[STYLE BIBLE — STYLE_GUIDE.md 7절 머리말을 그대로 맨 앞에]
Match the attached MASTER exactly: same face, colors, proportions, outline, size; only the pose changes.
Use the attached template only for placement; do NOT draw its lines, boxes or labels.
ONE single frame (not a sprite sheet) of the same boss as the MASTER.
Pose: DOWN — coils collapsed on the floor, crown cracked and fallen, rune dark, eyes closed
Facing LEFT. Feet on the cyan line, centered, everything (incl. effects) inside the white dashed box.
Solid flat magenta #FF00FF background.
```

한국어 요약: 반은 청록 · 반은 진홍인 거대 바다뱀 용 · 산호 왕관 · 가슴 ⊥ 룬. 대기 → 물 · 빛 소용돌이 공격 → 왕관 깨지고 쓰러짐.

## 완료 확인

- [ ] 마젠타 `#FF00FF` 단색 배경 · 그림 전체 테두리 없음 · 글자 · 숫자 · 가이드선 없음
- [ ] 왼쪽(용사 쪽)을 봄
- [ ] 몸 전체가 템플릿 흰 점선(안전 여백 3%) 안 · 발(바닥 닿는 곳)이 하늘색 기준선 위 · 몸 가운데가 노랑 점선
- [ ] 픽셀 블록 크기가 그림 전체에서 같음 · 번짐 · 흐림 없음 · 외곽선 진한 남보라
- [ ] (마스터가 아닌 프레임) 마스터 대비 ① 실루엣 높이 · 폭 ±5% ② 주요 색 같은 팔레트 칸 ③ 장비 · 표식 · 룬 유지 ④ 방향 같음
- [ ] 금지: 글자 · 숫자 · 수식 · 워터마크 · 테두리 · 바닥 그림자 · 배경 소품 · 템플릿 선/번호 없음 · 마젠타(#FF00FF)와 진한 분홍은 몬스터 안에 쓰지 않음
