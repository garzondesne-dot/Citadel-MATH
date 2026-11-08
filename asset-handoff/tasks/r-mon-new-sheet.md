# r-mon-new · 새 몬스터 시트 10마리 (v1 → v2 교체)

> ⛔ 결과물은 `asset-handoff/outputs/r-mon-new-NN/` 에만. 시트를 한 장으로 그리지 않는다 — **한 마리씩 · 한 동작씩**.

| 항목 | 값 |
|---|---|
| 고유 ID | `r-mon-new` (한 마리 = `r-mon-new-00` ~ `r-mon-new-09`) |
| 게임 내 용도 | 2 · 5차시 문제 · 2차시 보스 |
| 우선순위 | P5 |
| 구분 | 수정 (v1 「HD 도트 느낌」 → v2 도트 · `docs/ASSET-SPEC.md` 4장 C 「일반 몬스터」) |
| 지금 파일 | `assets/art/monsters-new-v1.webp` (3열 × 10줄) |
| 게임 경로 (#4) | `assets/art/monsters-new-v2.webp` (이름 예정 · **줄 순서 그대로** — 차시 파일이 줄 번호로 부름) · 칸 192 |
| 단일 / 시트 | 마리마다 **대기 마스터 1장 → 공격 1장 → 쓰러짐 1장** (모두 단일 이미지) · 시트는 #4 도구 |
| 규격 · 프롬프트 형식 | [m11-01](m11-01-mon-undersea-octopus.md) 과 똑같음 (원본 768 · 마젠타 · 템플릿 [tpl-cell-monster-768.png](../templates/tpl-cell-monster-768.png) · 왼쪽 · 기준선) |
| 출력 파일 | `outputs/r-mon-new-NN/r-mon-new-NN_idle_1.png` · `_attack_1.png` · `_down_1.png` |

## 몬스터 (줄 = 시트 줄 번호)

| 줄 | ID | 이름 | 영어 이름 (프롬프트용) | 지금 그림 | 마스터 |
|---|---|---|---|---|---|
| 0 | `r-mon-new-00` | 수정 아홀로틀 | crystal axolotl | [대기 칸](../references/now/r-mon-new-00-now-idle.webp) | 제작 대기 |
| 1 | `r-mon-new-01` | 선인장 수호수 | cactus guardian beast | [대기 칸](../references/now/r-mon-new-01-now-idle.webp) | 제작 대기 |
| 2 | `r-mon-new-02` | 등불 유령 | lantern ghost | [대기 칸](../references/now/r-mon-new-02-now-idle.webp) | 제작 대기 |
| 3 | `r-mon-new-03` | 번개 독수리 | thunder eagle | [대기 칸](../references/now/r-mon-new-03-now-idle.webp) | 제작 대기 |
| 4 | `r-mon-new-04` | 자수정 슬라임 | amethyst slime | [대기 칸](../references/now/r-mon-new-04-now-idle.webp) | 제작 대기 |
| 5 | `r-mon-new-05` | 해바라기 정령 | sunflower spirit | [대기 칸](../references/now/r-mon-new-05-now-idle.webp) | 제작 대기 |
| 6 | `r-mon-new-06` | 흑요석 표범 | obsidian panther | [대기 칸](../references/now/r-mon-new-06-now-idle.webp) | 제작 대기 |
| 7 | `r-mon-new-07` | 용암 게 | lava crab | [대기 칸](../references/now/r-mon-new-07-now-idle.webp) | 제작 대기 |
| 8 | `r-mon-new-08` | 황금 스카라베 | golden scarab | [대기 칸](../references/now/r-mon-new-08-now-idle.webp) | 제작 대기 |
| 9 | `r-mon-new-09` | 별빛 해파리 | starlight jellyfish | [대기 칸](../references/now/r-mon-new-09-now-idle.webp) | 제작 대기 |

## 유지할 요소 / 바꿀 요소

- 유지: 이름 · 콘셉트 · 대표 색 · 줄 순서 (지금 그림의 대기 칸이 콘셉트 참고)
- 바꿀 것: 「HD 도트 느낌」(색 수십만 · 번짐) → v2 도트 · 8차시 거울 몬스터와 같은 크기 등급 · **왼쪽 방향** · 3자세 (대기 · 공격 · 쓰러짐)

## 프롬프트 (마리마다 · 동작마다 한 장)

① 마스터 (대기) — 첨부: 템플릿 한 칸 + [monsters-mirror-v2.webp](../references/monsters-mirror-v2.webp)(화풍) + 그 몬스터의 「지금 그림」 대기 칸(콘셉트)
```
[STYLE BIBLE — STYLE_GUIDE.md 7절 머리말을 그대로 맨 앞에]
Use the attached template only for placement; do NOT draw its lines, boxes or labels.
Redraw the monster in the attached "current" picture in the attached STYLE reference's pixel style (concept and main colors kept).
ONE single frame (not a sprite sheet) of ONE monster: "[영어 이름]". Pose: IDLE. Facing LEFT.
Feet on the cyan line, centered on the yellow dashed line, inside the white dashed box. Solid flat magenta #FF00FF background. Cute but dangerous.
```
② 공격 · ③ 쓰러짐 — 첨부: **`references/masters/r-mon-new-NN_master.png` + 템플릿 한 칸만**
```
[STYLE BIBLE — STYLE_GUIDE.md 7절 머리말을 그대로 맨 앞에]
Match the attached MASTER exactly: same face, colors, proportions, outline, size; only the pose changes.
Use the attached template only for placement; do NOT draw its lines, boxes or labels.
ONE single frame of the same monster as the MASTER. Pose: [ATTACK — lunges/strikes to the left, small effect inside the box | DOWN — defeated, collapsed on the floor, eyes closed or dizzy].
Facing LEFT. Feet on the cyan line, centered. Solid flat magenta #FF00FF background.
```

## 완료 확인 (마리마다)

- [ ] 마젠타 `#FF00FF` 단색 배경 · 그림 전체 테두리 없음 · 글자 · 숫자 · 가이드선 없음
- [ ] 왼쪽(용사 쪽)을 봄
- [ ] 몸 전체가 템플릿 흰 점선(안전 여백 3%) 안 · 발(바닥 닿는 곳)이 하늘색 기준선 위 · 몸 가운데가 노랑 점선
- [ ] 픽셀 블록 크기가 그림 전체에서 같음 · 번짐 · 흐림 없음 · 외곽선 진한 남보라
- [ ] (마스터가 아닌 프레임) 마스터 대비 ① 실루엣 높이 · 폭 ±5% ② 주요 색 같은 팔레트 칸 ③ 장비 · 표식 · 룬 유지 ④ 방향 같음
- [ ] 금지: 글자 · 숫자 · 수식 · 워터마크 · 테두리 · 바닥 그림자 · 배경 소품 · 템플릿 선/번호 없음 · 마젠타(#FF00FF)와 진한 분홍은 몬스터 안에 쓰지 않음
