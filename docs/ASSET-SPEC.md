# 에셋 전면 교체 지침 — 「모두의 던전」 v2 그림 기준 (2026-11-02 · 마지막 갱신 2026-11-05: 6-7 v0.9.11 묶음 · 용사 12줄 · 보스 목록 재배열)

> 이 문서는 **그림 AI 에게 그대로 넘기는 지침**이다. 1~5장은 사람이 읽고, 6장 「프롬프트」를 그림 AI 에 붙여 넣는다.
> 받은 그림은 Claude 가 격자 맞춤 · 팔레트 맞춤 · 배경 제거 · 프레임 정렬 · 압축 · 등록을 한다 (사용자는 뽑기만 한다).

## 1. 왜 바꾸나 · 목표

| 지금 (v1) | 바꾼 뒤 (v2) |
|---|---|
| 여러 AI · 여러 때 그린 「HD 도트 느낌」 그림이 섞임 — 크기 · 밀도 · 색감이 제각각 | **진짜 도트(픽셀 아트) 하나의 기준**: 정해진 격자 · 하나의 팔레트 · 같은 외곽선 · 같은 빛 방향 |
| 용사가 칸 안에서 작고 흐림 · 몬스터 시트마다 크기가 다름 · 보스 품질 편차 큼 | 용사 · 몬스터 · 보스 크기 등급이 고정 |
| 전체 17MB (배경 한 장 500KB) | **목표 전체 2MB 안팎** — 도트는 색이 적고 원본이 작아서 수십 배 가벼워진다 (화면에서는 정수배로 키워 선명하게) |
| 움직임 = 자세 4칸 | 도트라 프레임이 싸다 → 대기 · 걷기 · 공격 · 피격 · 승리 · 쓰러짐 · 힐 프레임 + 코드 연출(이동 · 흔들림 · 번쩍임) |

## 2. 화풍 기준 (사용자 취향 반영)

- **분위기**: 디아블로 1 의 어둡고 고딕한 던전 · 횃불 빛 (배경) + 메이플스토리처럼 **한눈에 읽히는 귀여운 2~2.5 등신** (캐릭터) + 무명기사단처럼 **모으고 싶은 기사단 도트**.
- **대비 규칙**: 배경은 어둡고 채도 낮게, 캐릭터 · 몬스터 · 보스는 밝고 채도 높게 → 작은 폰 화면에서도 캐릭터가 바로 보인다.
- **외곽선**: 캐릭터 · 몬스터 · 소품은 1px 어두운 외곽선(검정이 아니라 팔레트의 가장 어두운 남색/갈색). 배경은 외곽선 없음.
- **빛**: 왼쪽 위에서. 그림자 면은 2단계까지. 안티에일리어싱(번짐) 없음, 디더링은 배경에만 조금.
- **팔레트**: 모든 그림이 **같은 64색 팔레트**(Lospec 「Resurrect 64」)를 쓴다. AI 가 못 지켜도 Claude 가 이 팔레트로 맞춘다.
- **방향**: 용사 = 오른쪽을 봄 · 몬스터/보스 = 왼쪽(용사 쪽)을 봄.
- **금지**: 글자 · 워터마크 · 바닥 그림자(코드로 넣음) · 테두리 · 배경 소품(캐릭터 그림에).

## 3. 크기 · 프레임 기준표 (원본 픽셀 크기 = 도트 한 칸이 1px)

| 종류 | 원본 칸 | 화면 배율 | 프레임 (가로 한 줄씩) | 예상 용량 |
|---|---|---|---|---|
| 용사 | **64×64** (게임 칸 80×64) | ×1 ~ ×3 | **12줄 31프레임** (2026-11-02 확정 · 11-03 헉헉 추가 · 금발 검사 기준): 대기 4(숨쉬기 = `breathe.py` 가 구움) · 걷기 4 · 공격 4 · 피격 1 · 승리 2 · 쓰러짐 2 · 힐 쓰기 2 · 차원문 4(뒷모습으로 화면 안쪽) · 앉기 2 · 힐 받음 2 · 생각 중 2 · 헉헉 2(몬스터에게 맞은 뒤). 시트 2장(기본 7줄 + 추가 5줄)으로 뽑아 합친다. 추가 5줄이 없으면 게임이 대신 쓰기로 보여 줌 | 한 명 약 20KB |
| 장신구 (모자 · 망토 · 무기) | 32×32 | 용사와 같이 | 1장 (프레임마다 위치는 Claude 가 기준점으로 붙임) | 1KB |
| 일반 몬스터 | **96×96** | ×1 ~ ×3 | 대기 2 · 공격 3 · 피격 1 · 쓰러짐 2 = **8** | 한 마리 5KB |
| 보스 | **192×192** | ×2 ~ ×3 | 대기 4 · 공격 4 · 피격 1 · 쓰러짐 3 = **12** (등장 · 분노는 코드) | 한 마리 30KB |
| 캠프 소품 (허수아비 · 책장 · 우편함 · 망원경 · 진열대 · 모루 · 모닥불) | 64×64 또는 96×96 | ×2 ~ ×3 | 1~4 (모닥불 6 · 허수아비 맞음 2 · 우편함 새 편지 2) | 하나 2KB |
| 배경 (던전 · 캠프 · 교사 캠프 · 공방) | **480×270** (16:9) | ×4 = 1920×1080 | 1 | 한 장 40KB |
| 차원문 · 포털 | 96×128 | ×2 ~ ×3 | 켜짐 4 프레임(소용돌이) · 꺼짐 1 | 6KB |
| UI 틀 (패널 · 카드 틀 · 버튼) | 9칸 자르기용 48×48 | ×2 ~ ×3 | 1 | 1KB |
| 아이콘 · 메달 · 카드 그림 | 32×32 | ×2 ~ ×3 | 1 | 0.5KB |
| 제목 로고 · 배너 | 예외 — 지금 것 유지 (글자 그림) | — | — | — |

## 4. 교체 목록 (우선순위 순)

| 순위 | 묶음 | 개수 | 비고 |
|---|---|---|---|
| **A (시험판)** | 용사 1 · 일반 몬스터 1 · 보스 1 · 던전 배경 1 · 허수아비 1 | 5 | **먼저 이것만 뽑아서 기준을 확정**한다 (Claude 가 게임에 넣어 보여 줌) |
| B | 캠프 기본 소품: 훈련 허수아비 · 책장 · 우편함 · 모루 · 모닥불 · 캠프 배경 | 6 | 12월 기말 대비 기능에 바로 쓰임 |
| B | 보스: 2 · 3 · 4 · 5차시 다시 + 6차시(지금 = 그림자 드래곤 · 성채 드래곤 색 변형) + 명제 7 ~ 10차시 · 성채 1층(중단원) · 2층(대단원) 새로 | 11 | 2026-11-05 재배열: 6 = 드모르간 · 집합 중단원 마무리 · 명제 = 7 ~ 10 (11차시 없음) · 8차시 거울 광산(배경 · 몬스터 5 · 보스 대우의 거울 마왕)은 도착함 · 진도에 맞춰 7 → 9 → 10 순으로 |
| C | 용사: 기본 7 · 선생님 1 · 추가 8 | 16 | 이름은 지금과 같게 (성기사 · 격투가 · 무희 · 음유시인 · 연금술사 · 해적 · 빙결 마법사 · 조련사 …) |
| C | 일반 몬스터: 지금 쓰는 28 마리 + 6차시 이후 | 30 ~ 40 | 이름 · 콘셉트는 지금 것 유지 (수정 슬라임 · 바위 골렘 · 서리 늑대 …) |
| D | 던전 배경 10 · 포털 10 · 특수 차원문 3 · 교사 캠프 · 공방 배경 | 25 | |
| D | UI 패널 4 · 카드 틀 · 버튼 · 메달 20 · 메뉴 아이콘 5 · 카드 그림 8 · 트로피 | 40 | |
| 폐기 | brand-m2-*-v2 (3) · campfire-v1 · 모루 3종 중복 → 1종 · field-* 3 · dungeon.webp (던전 배경으로 통합) | 9 | 새로 안 그림 |

## 5. 받은 뒤 Claude 가 하는 일 (사용자는 신경 안 써도 됨)

1. 「가짜 도트」(격자 안 맞음 · 번짐)를 원본 칸 크기로 줄여 격자에 맞추고, Resurrect 64 팔레트로 색을 맞춘다.
2. 마젠타 배경 제거 → 프레임 자르기 → 발 기준선 정렬 → 시트로 묶기 → PNG8/WebP 무손실 압축.
3. `assets/manifest.js` 에 새 이름(-v2)으로 등록, 화면은 `image-rendering: pixelated` + 정수배.
4. 움직이는 미리보기(GIF)와 실제 게임 캡처를 보여 드리고 컨펌 → 배포.

## 6. 프롬프트 (그림 AI 에 그대로 붙여 넣기)

### 6-0. 공통 머리말 (모든 요청 맨 앞에)
```
STYLE BIBLE — "Everyone's Dungeon" v2
True pixel art on a strict 1:1 pixel grid. No anti-aliasing, no blur, no gradients, no painterly brushwork.
Mood: Diablo 1 gothic torch-lit dungeon backgrounds (dark, low saturation) + MapleStory-like readable cute
characters (2–2.5 heads tall, big clear silhouettes, bright saturated colors) + collectible knight-order RPG feel.
Limited palette in the spirit of Lospec "Resurrect 64". 1px dark outline (dark navy/brown, not pure black) on
characters, monsters and props; no outline on backgrounds. Light from top-left, max 2 shadow steps.
No text, no watermark, no ground shadow, no frame/border.
Deliver on a solid magenta #FF00FF background (except backgrounds), upscaled 8x with nearest-neighbor
so every pixel is a crisp 8x8 block.
```

### 6-1. 용사 (64×64, 12줄 31 프레임 — 2장으로 뽑음: 기본 7줄 + 추가 5줄)
처리: 2장을 같은 키로 맞춰 합침 → `tools/sprite/sheet.py <합본> <폴더> <이름> 50 80 64` → `tools/sprite/breathe.py <시트.png> <폴더> <이름>` (대기 숨쉬기) → `assets/art/hero-*-v2.webp` · 배치표 `heroesV2.list`.
① 기본 7줄 (대기 줄은 1프레임만 써도 됨 — 숨쉬기는 도구가 만듦):
```
[STYLE BIBLE above]
Sprite sheet of ONE hero: "[이름 예: 성기사 / holy paladin]", chibi knight, facing RIGHT.
Native cell 64x64 px. 7 rows, left-aligned, same feet baseline in every cell:
row1 idle 4 frames (breathing), row2 walk 4 frames, row3 attack 4 frames (wind-up, swing, impact, recover),
row4 hit 1 frame, row5 victory 2 frames (jump, arm up), row6 fall 2 frames, row7 heal-cast 2 frames (arm raised, green glow).
Keep the character exactly the same size, colors and proportions in every frame.
```
② 추가 5줄 (①을 참고 그림으로 첨부):
```
[STYLE BIBLE above]
Use the attached sprite sheet as the exact reference: SAME hero, same size, colors, outline and proportions.
Magenta (#FF00FF) background. Native cell 64x64 px. 5 rows, left-aligned, same feet baseline in every cell:
row1 portal-enter 4 frames, walking AWAY from the viewer into the screen: (1) turning from facing right to a 3/4 back view, (2) back view walking, left foot forward, (3) back view walking, right foot forward, (4) back view, one arm reaching forward to touch a door.
row2 sit-rest 2 frames, facing RIGHT (sitting on the ground, weapon laid beside, gentle breathing),
row3 receive-heal 2 frames, facing RIGHT (surrounded by small green sparkles: surprised, then happy),
row4 thinking 2 frames, facing RIGHT (hand on chin, then eyes looking up).
row5 panting 2 frames, facing RIGHT (just got hit by a monster: bent forward, hands on knees, out of breath, small sweat drops, then shoulders rising). No speech bubbles, no text, no portal or door drawn.
```

### 6-2. 일반 몬스터 (96×96, 8 프레임)
```
[STYLE BIBLE above]
Sprite sheet of ONE monster: "[이름 예: 서리 늑대 / frost wolf]", cute-but-dangerous, facing LEFT.
Native cell 96x96 px, feet on the same baseline. Rows: idle 2 frames, attack 3 frames, hit 1 frame, defeated 2 frames.
Same size and colors in every frame.
```

### 6-3. 보스 (192×192, 12 프레임)
```
[STYLE BIBLE above]
Sprite sheet of ONE BOSS: "[이름 · 콘셉트 예: 흑요석 미노타우로스 — obsidian minotaur king with a glowing rune axe]",
imposing, 3/4 view, facing LEFT, clearly bigger and more detailed than normal monsters, with one glowing accent color.
Native cell 192x192 px, same ground baseline. Rows: idle 4 frames (breathing, glow pulse), attack 4 frames
(wind-up, slam, impact, recover), hit 1 frame, defeated 3 frames (stagger, kneel, collapse).
```

### 6-4. 캠프 소품
```
[STYLE BIBLE above]
Single camp prop for a night forest campsite, slight top-down 3/4 view, warm firelight from the right:
"[예: straw training dummy with a red target on its chest]". Native canvas 64x64 px (96x96 for big props).
States side by side: [예: normal | tilted after being hit].
```

### 6-5. 배경
```
[STYLE BIBLE above — backgrounds: no outline, dithering allowed]
Side-view battle background, native 480x270 px, upscaled 4x (1920x1080) with nearest-neighbor.
Theme: "[예: 화산 심연 / volcanic abyss — obsidian floor, lava cracks, torch light]".
Dark and desaturated so bright characters pop. Empty flat floor area across the lower 40% (characters stand there),
no characters, no text.
```

### 6-6. 장신구 (모자 · 망토 · 무기, 32×32)
```
[STYLE BIBLE above]
One equipment item for the 64x64 chibi hero (attach the hero sheet as reference): "[예: wizard hat]".
Native canvas 32x32 px, drawn at the correct scale for that hero, facing RIGHT. Single image.
```

### 6-7. v0.9.11 그림 묶음 (2026-11-05 갱신 · 템플릿 `assets/templates/v0911/tpl-*.png` · 다시 만들기 `node tools/sprite/templates_v0911.js`)
템플릿 PNG 를 그림 AI 에 **참고 그림으로 함께 첨부**하고 아래 프롬프트를 붙인다 (6-0 머리말 먼저). 칸 · 기준선 · 빨간 자리 표시는 그리지 말라고 적혀 있다.
교실 TV 에 이모지 글꼴이 없어 이모지가 빈칸으로 나온다 → 이 묶음이 오면 게임 안 이모지를 그림으로 바꾼다. 박쥐 · 상자 · 깃털은 그동안 Claude 가 코드로 그린 임시 도트(`thrill-*-v0`)를 쓴다.
(펀치 기계 · 경기장은 반대항이 「달리기 경주」로 바뀌어 없앰)

**✅ 2026-11-05 도착 · 넣음 (v0.9.11.5)**: 아이콘 18 · 콤보 창 · 카드 틀 + 그림 16 · 경주 트랙 · 밸런스 발판 → `tools/sprite/thrill_cut.py` 로 자름 (아이콘은 `ui-icons-v3` 에 붙여 이모지 자동 바꾸기 · 카드 그림은 `cardKit.arts.map` 으로 카드마다 · 트랙은 종합상황실 큰 화면만). **아직 기다림: 🦇 박쥐 · 🎁 상자 · 🪶 깃털** (지금은 Claude 임시 도트 v0).

| 그림 | 템플릿 | 원본 칸 | 칸 | 보낼 파일 |
|---|---|---|---|---|
| 🦇 황금 박쥐 | `tpl-bat.png` | 64×64 | 날갯짓 3 + 잡힘 1 | `thrill-bat-v1.png` (256×64) |
| 🎁 보물 상자 | `tpl-chest.png` | 64×64 | 닫힘 · 흔들림 · 열림 | `thrill-chest-v1.png` (192×64) |
| 🪶 황금 깃털 | `tpl-feather.png` | 32×32 | 1 | `thrill-feather-v1.png` |
| ✨ 아이콘 18개 | `tpl-icons.png` | 32×32 | 6 × 3 | `thrill-icons-v1.png` (192×96) |
| 🔥 콤보 창 | `tpl-combo.png` | 96×48 | 단계 4 | `thrill-combo-v1.png` (384×48) |
| 🏁 경주 트랙 | `tpl-track.png` | 480×270 | 1 | `thrill-track-v1.png` |
| 🃏 카드 틀 | `tpl-card.png` | 64×88 | 1 | `card-frame-v2.png` |
| 🃏 카드 그림 16개 | `tpl-cardart.png` | 32×32 | 8 × 2 | `card-arts-v2.png` (256×64) |
| ⚖ 밸런스 발판 | `tpl-plat.png` | 160×120 | 멀쩡 · 금 감 | `fun-plat-v2.png` (320×120) |

① 황금 박쥐
```
[STYLE BIBLE above]
Use the attached template only for layout; do NOT draw guide lines or labels.
Sprite sheet of ONE cute golden bat (shiny gold fur, big sparkling eyes, tiny fangs), facing LEFT, flying.
Native cell 64x64 px, 4 cells in one row, body centered in the same spot:
(1) wings up, (2) wings level, (3) wings down, (4) caught in a small golden net, dizzy swirl eyes.
```
② 보물 상자
```
[STYLE BIBLE above]
Use the attached template only for layout; do NOT draw guide lines or labels.
Sprite sheet of ONE treasure chest: dark wood with gold trim and a round gold lock, front view from slightly above.
Native cell 64x64 px, 3 cells in one row, bottom on the cyan ground line:
(1) closed, (2) rattling — tilted 10 degrees, light leaking from the lid seam, (3) open — lid up, warm golden light beams and sparkles rising (nothing drawn inside).
```
③ 황금 깃털
```
[STYLE BIBLE above]
One icon: a single golden feather, diagonal from bottom-left to top-right, soft shine. Native 32x32 px.
```
④ 아이콘 18개
```
[STYLE BIBLE above]
Use the attached template only for layout; do NOT draw guide lines or labels. Icon sheet, native 32x32 px cells,
6 columns x 3 rows, no gaps, each icon centered, readable at small size, bright colors, 1px dark outline, no text:
row1: (1) orange flame, (2) yellow lightning bolt, (3) small rainbow arc, (4) golden crown, (5) four-point sparkle star, (6) short iron chain link
row2: (7) treasure chest, (8) golden feather, (9) golden bat face, (10) blue magic gem shard, (11) gold trophy cup, (12) checkered finish flag
row3: (13) raised hand, (14) circular arrow, (15) flame with a small number plate, (16) archery target with arrow, (17) green heart, (18) hourglass
```
⑤ 콤보 창
```
[STYLE BIBLE above]
Use the attached template only for layout; do NOT draw guide lines or labels. Native cell 96x48 px, 4 cells in one row:
a small rounded badge frame for a COMBO counter, dark navy center left EMPTY (the game writes numbers there).
(1) orange ember frame, (2) yellow lightning frame, (3) rainbow crystal frame, (4) golden crown frame with gems — each richer than the last, same size.
```
⑥ 경주 트랙
```
[STYLE BIBLE above — backgrounds: no outline, dithering allowed]
Use the attached template only for composition; do NOT draw the red boxes or labels.
Background, native 480x270 px: a training race track inside a torch-lit gothic dungeon hall, slight top-down view,
4–6 straight dirt lanes running left to right separated by low stone curbs, a start line near the left and a checkered
finish line at the right edge, a dark area at the far left for class names. Dark and desaturated, no characters, no text.
```
⑦ 카드 틀 + ⑧ 카드 그림
```
[STYLE BIBLE above]
Use the attached template only for layout; do NOT draw the red boxes or labels.
(7) ONE collectible math card frame, native 64x88 px: dark navy inner panel, simple metal-and-gold pixel border with a small gem at the bottom,
an empty square window at the top (32x32), an empty band in the middle, an empty name plate at the bottom. Same pixel style as the heroes.
(8) Icon sheet, native 32x32 px cells, 8 columns x 2 rows, magical objects with a glowing math rune, no text:
row1: (1) crystal orb with ∈ rune, (2) abacus, (3) empty glass jar, (4) nested rings, (5) two identical crystals, (6) branching tree of gems, (7) two overlapping shields (∩), (8) joined twin crystals (∪)
row2: (9) cracked shield missing a piece, (10) mirror-flipping hourglass, (11) scroll with a question mark seal, (12) crowd banner with ∀ rune, (13) magic mirror, (14) key and padlock, (15) quill and sealed proof scroll, (16) golden balance scale
```
⑨ 밸런스 발판
```
[STYLE BIBLE above]
Use the attached template only for layout; do NOT draw guide lines or labels.
Native cell 160x120 px, 2 cells in one row: a floating stone-and-wood platform hanging over a void, flat top on the cyan line
where 6–8 tiny heroes will stand. (1) intact, (2) the same platform with glowing cracks across it. No characters, no text.
```

## 7. 넘기는 방법

- 뽑은 그림은 드라이브 「학습지 > 공통수학2 > 07 에셋 원본」 에 올리고 Claude 에게 「에셋 도착」.
- 파일 이름: `hero-성기사.png` · `mon-서리늑대.png` · `boss-05-미노타우로스.png` · `bg-07-화산.png` · `camp-허수아비.png` · `acc-마법사모자.png`.
- 한 번에 하나씩 뽑아 마음에 드는 것만 올린다. 지금 그림은 참고용 묶음(`assets-v1-참고.zip`)을 AI 에 함께 넣으면 콘셉트가 이어진다.
