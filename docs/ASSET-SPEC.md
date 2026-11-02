# 에셋 전면 교체 지침 — 「모두의 던전」 v2 그림 기준 (2026-11-02)

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
| 용사 | **64×64** | ×1 ~ ×3 | 대기 4 · 걷기 4 · 공격 4 · 피격 1 · 승리 2 · 쓰러짐 2 · 힐 2 = **19** | 한 명 8KB |
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
| B | 보스: 2 · 3 · 4 · 5차시 다시 + 6 ~ 10차시 · 중단원 · 대단원 새로 | 11 | 차시 진도에 맞춰 먼저 필요한 것부터 |
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

### 6-1. 용사 (64×64, 19 프레임)
```
[STYLE BIBLE above]
Sprite sheet of ONE hero: "[이름 예: 성기사 / holy paladin]", chibi knight, facing RIGHT.
Native cell 64x64 px. 7 rows, left-aligned, same feet baseline in every cell:
row1 idle 4 frames (breathing), row2 walk 4 frames, row3 attack 4 frames (wind-up, swing, impact, recover),
row4 hit 1 frame, row5 victory 2 frames (jump, arm up), row6 fall 2 frames, row7 heal-cast 2 frames (arm raised, green glow).
Keep the character exactly the same size, colors and proportions in every frame.
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

## 7. 넘기는 방법

- 뽑은 그림은 드라이브 「학습지 > 공통수학2 > 07 에셋 원본」 에 올리고 Claude 에게 「에셋 도착」.
- 파일 이름: `hero-성기사.png` · `mon-서리늑대.png` · `boss-05-미노타우로스.png` · `bg-07-화산.png` · `camp-허수아비.png` · `acc-마법사모자.png`.
- 한 번에 하나씩 뽑아 마음에 드는 것만 올린다. 지금 그림은 참고용 묶음(`assets-v1-참고.zip`)을 AI 에 함께 넣으면 콘셉트가 이어진다.
