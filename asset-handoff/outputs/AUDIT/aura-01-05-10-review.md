# aura-01 · aura-05 · aura-10 — 원본 인계 / 검수 대기 (2026-11-09)

주문서: `asset-handoff/tasks/ORDER-2026-11-09-aura-awaken.md`.
범위: 위 3단계의 오라 시트 및 별도 도는 입자만. 나머지 단계·각성 4종 미제작.
제작: 내장 이미지 생성, 파일당 최초 1회 / 재생성 0회. 생성 원본 그대로 복사.
각 프롬프트 및 원본 참조는 아래 기록. **주문서 자기 검사 전체 통과 또는 게임 적용 완료를 뜻하지 않음.**

| ID | 오라 시트 | 별도 입자 |
|---|---|---|
| aura-01 | 은백색 얇은 바닥 고리 · 가는 상승 빛줄기 | 단일 은백색 반짝이 별 × 4프레임 |
| aura-05 | 밝은 보라 고리 · 양옆 소용돌이 기운 | 단일 보라 별의 반짝임/회전 × 4프레임 |
| aura-10 | 무지개 이중 고리 · 여러 색 빛줄기 · 끊긴 상단 후광 | 단일 무지개 반짝이 × 4프레임 |

## 자기 검사

| 항목 | 결과 |
|---|---|
| 저장 경로 | 6개 PNG 모두 `asset-handoff/outputs/{ID}/` |
| 시트 크기 | **불일치**: 요청 512×128, 반환 원본 2172×724, 4분할 시 543×724. 128×128 정사각 칸이 아님 |
| 입자 크기 | **불일치**: 요청 96×24, 반환 원본 2172×724. 24×24 정사각 칸이 아님 |
| 프레임 배치 | 눈으로 4프레임 1행 확인. 최종 정사각 격자 배치/중앙 정렬은 후처리 필요 |
| 배경 | 검정으로 보임. **정확한 #000000 단색은 미충족**: 일부 빈 공간에 RGB 1 수준 오차 있음 |
| 용사 · 알약 · 글자 · 칸 선 · 기준선 | 눈으로 없음 확인 |
| 입자 분리 | 시트에는 도는 별을 넣지 않음. 입자 시트는 매 프레임 별 1개만 있고 궤도는 그리지 않음 |
| 용사 자리 | 중앙에 몸 실루엣이나 채워진 빛 덩어리 없음. 검정 빈 공간 확보 |
| 고리 크기/자리 | 눈으로 대체로 유지. 생성 원본의 픽셀 단위 동일성/y=116 기준은 **보장 안 됨**, 최종 고리 고정 필요 |
| 색/격자 | 01<05<10 단계 차이 및 밝은 보라/무지개 확인. 원본은 32~64색/균일 격자/번짐 없음의 엄격한 기준은 **미충족**, 후처리/검토 필요 |
| 밝은 바닥 시인성 | 밝은 색으로 생성했으나 실제 게임 밝기→알파 변환 후 밝은 바닥 시인성 시험은 **미실시** |
| 수정 범위 | outputs만. ASSET_LIST에는 해당 aura 행이 없으므로 수정하지 않음 |
| 다음 단계 | 선생님 화풍 검토 및 #4 크기·배경·격자·고리 정규화. 이 커밋 이후 작업 중지 |

공통 지침의 자르기·팔레트 맞춤·게임용 시트 정규화 담당 구분에 따라 원본에 후처리하지 않았다.
주문서의 정확한 규격 검사를 통과한 완성 에셋이라고 표시하지 않는다.
추가 생성으로 해결 여부를 확인하지 않았으며 파일당 1회 생성 결과만 보관한다.

## 파일과 프롬프트

### asset-handoff/outputs/aura-01/aura-01_sheet_1.png

참조: tpl-aura-128x4.png (배치만), aura-style-12.png (분위기만).
원본: exec-34f8dfa0-5536-4025-8916-828a628a7704.png.

```text
STYLE BIBLE — "Everyone's Dungeon" v2 effects. True pixel art on a strict pixel grid: every art pixel same square block, no anti-aliasing, no blur, no gradients, no painterly brushwork. Bright readable cute RPG magic effects. Limited colors with 2-3 discrete brightness steps. No text, letters, numbers, watermark, logo, ground shadow, frame, border, cell separators, guide lines or boxes. Solid pure BLACK #000000 background, opaque. All visible magic is bright; black converts to transparency. No character, person, hero, silhouette, mannequin or gray capsule. This is a production sprite sheet, not an illustration or presentation.
Use case: stylized-concept. Asset: aura-01_sheet_1.png.
Generate EXACTLY 512x128 pixels, four equal 128x128 frames in ONE horizontal row, no gaps. Reference Image 1 is placement only; remove ALL guide lines, gray capsule and template edges. Reference Image 2 is mood/style ONLY: take the silver floor-ring effect from top left, NEVER reproduce any characters.
Each frame coordinates: thin silver-white pixel ellipse centered (64,106), same outer bounding box x20..107,y99..114 (88px wide), entirely above y116. Keep ring position and shape EXACTLY fixed in all four cells. A few very thin separated silver light rays rise gently at sides toward y24 (effect height about 92). Sparse, delicate understated tier-1 effect, bright silver edge / pearl white highlights. Central hero area x42..86,y62..115 must be black except the thin floor ring; no filled body aura. No stars, floating objects, or orbiting particles here: those are separate files. Four frames subtly animate the rays upward and ring highlight clockwise, looping coherently; keep overall ring dimensions absolutely fixed. Crisp hard pixel edges. Final image is only the four silver ring effects on pure black. Save exact 512x128 PNG if possible.
```

### asset-handoff/outputs/aura-01/aura-01_orb_1.png

참조: tpl-orb-24x4.png (배치만).
원본: exec-2b2b24a6-cc8b-4752-ac89-e56c6aebae47.png.

```text
STYLE BIBLE — "Everyone's Dungeon" v2 effects. True pixel art on a strict pixel grid: every art pixel same square block, no anti-aliasing, no blur, no gradients, no painterly brushwork. Bright readable cute RPG magic effects. Limited colors with 2-3 discrete brightness steps. No text, letters, numbers, watermark, logo, ground shadow, frame, border, cell separators, guide lines or boxes. Solid pure BLACK #000000 background, opaque. All visible magic is bright; black converts to transparency. No character, person, hero, silhouette, mannequin or gray capsule. This is a production sprite sheet, not an illustration or presentation.
Use case: stylized-concept. Asset: aura-01_orb_1.png, separate single orbiting particle sprite sheet. EXACT requested image dimensions 96x24, four 24x24 square frames arranged left-to-right in ONE row, no gaps. Four-to-one aspect ratio. Attached template is POSITION ONLY: NEVER draw its gray lines or border.
Each cell contains one tiny silver-white four-point twinkling star. Pearl-white core, bright silver midtones, no dark colors. Understated tier-1; the one star pulses from narrow small to broader bright to narrow small, four frames forming a smooth loop. No detached satellites, no extra sparkles.
Each of four cells has exactly ONE object centered on local (12,12), size about 12x14 native pixels, leave at least 4 native pixels black clear margin. Identical center in all frames. The whole sheet contains EXACTLY FOUR stars total, one in each quarter. They do NOT move along an orbit in this sheet; game code controls orbit. Only tiny twinkle or rotation in place. No floor ring, no halo, no aura, no rays extending to other cells, no motion trail, no characters. Strict crisp blocky native pixel style, 1px smallest feature, black pure #000000 negative space. Output just the four centered single-object frames.
```

### asset-handoff/outputs/aura-05/aura-05_sheet_1.png

참조: tpl-aura-128x4.png (배치만), aura-style-12.png (분위기만).
원본: exec-a9cbb2d6-39cd-48a6-8c8f-0cd873e47315.png.

```text
STYLE BIBLE — "Everyone's Dungeon" v2 effects. True pixel art on a strict pixel grid: every art pixel same square block, no anti-aliasing, no blur, no gradients, no painterly brushwork. Bright readable cute RPG magic effects. Limited colors with 2-3 discrete brightness steps. No text, letters, numbers, watermark, logo, ground shadow, frame, border, cell separators, guide lines or boxes. Solid pure BLACK #000000 background, opaque. All visible magic is bright; black converts to transparency. No character, person, hero, silhouette, mannequin or gray capsule. This is a production sprite sheet, not an illustration or presentation.
Use case: stylized-concept. Asset: aura-05_sheet_1.png. EXACT canvas 512x128, aspect ratio FOUR TO ONE (4:1), not 3:1. FOUR 128x128 frames in ONE horizontal row, zero gaps or margins between cells.
Reference 1 is exact placement guide ONLY: do not reproduce gray hero capsules, blue baseline or grid. Reference 2 is style reference only: use the purple spiral effect at second row first column, OMIT every hero and floating star.
Frame-local geometry: bright lavender-violet floor ring centered (64,106), fixed ellipse bounding box x20..107,y99..114 in ALL four frames. Ring width 88. A bright lilac swirl of TWO slender separated magical wisps loosely ascends along outer left and outer right, reaching y24. Delicate sparse contours not a solid flame column, no filled oval, no character contour. The middle hero region x42..86,y62..115 stays empty BLACK except the thin floor ring. Bright medium violet #A060FF, lavender #C59AFF, pale lilac #E9CFFF, no dark navy or dark purple dominating. Same fixed ring in every frame, highlights travel clockwise; wisps gently twist upward over a coherent four-frame loop. No orbiting particles, stars, sparkles or objects in this sheet; those are a separate asset. Crisp pixel stair-step curves; no airbrush or haze. Final only four aura effects on black.
```

### asset-handoff/outputs/aura-05/aura-05_orb_1.png

참조: tpl-orb-24x4.png (배치만).
원본: exec-e315512f-5153-4b33-9567-84fdbbd92153.png.

```text
STYLE BIBLE — "Everyone's Dungeon" v2 effects. True pixel art on a strict pixel grid: every art pixel same square block, no anti-aliasing, no blur, no gradients, no painterly brushwork. Bright readable cute RPG magic effects. Limited colors with 2-3 discrete brightness steps. No text, letters, numbers, watermark, logo, ground shadow, frame, border, cell separators, guide lines or boxes. Solid pure BLACK #000000 background, opaque. All visible magic is bright; black converts to transparency. No character, person, hero, silhouette, mannequin or gray capsule. This is a production sprite sheet, not an illustration or presentation.
Use case: stylized-concept. Asset: aura-05_orb_1.png, separate single orbiting particle sprite sheet. EXACT requested image dimensions 96x24, four 24x24 square frames arranged left-to-right in ONE row, no gaps. Four-to-one aspect ratio. Attached template is POSITION ONLY: NEVER draw its gray lines or border.
Each cell contains one bright purple four-point magical star. White-lilac core, pale lavender midtone and vivid light violet #A060FF outer points, no dark purple or navy. A single star gently rotates/twinkles over four looping frames, keeping its center and overall scale steady. No detached satellites or secondary stars.
Each of four cells has exactly ONE object centered on local (12,12), size about 12x14 native pixels, leave at least 4 native pixels black clear margin. Identical center in all frames. The whole sheet contains EXACTLY FOUR stars total, one in each quarter. They do NOT move along an orbit in this sheet; game code controls orbit. Only tiny twinkle or rotation in place. No floor ring, no halo, no aura, no rays extending to other cells, no motion trail, no characters. Strict crisp blocky native pixel style, 1px smallest feature, black pure #000000 negative space. Output just the four centered single-object frames.
```

### asset-handoff/outputs/aura-10/aura-10_sheet_1.png

참조: tpl-aura-128x4.png (배치만), aura-style-12.png (분위기만).
원본: exec-0008794c-4dd0-402a-bd85-e80d23f2bb74.png.

```text
STYLE BIBLE — "Everyone's Dungeon" v2 effects. True pixel art on a strict pixel grid: every art pixel same square block, no anti-aliasing, no blur, no gradients, no painterly brushwork. Bright readable cute RPG magic effects. Limited colors with 2-3 discrete brightness steps. No text, letters, numbers, watermark, logo, ground shadow, frame, border, cell separators, guide lines or boxes. Solid pure BLACK #000000 background, opaque. All visible magic is bright; black converts to transparency. No character, person, hero, silhouette, mannequin or gray capsule. This is a production sprite sheet, not an illustration or presentation.
Use case: stylized-concept. Asset: aura-10_sheet_1.png. EXACT canvas 512x128, aspect ratio FOUR TO ONE (4:1), not 3:1. FOUR 128x128 frames in ONE horizontal row, no gaps.
Reference 1 is exact placement ONLY: omit gray hero capsules, baseline, grid. Reference 2 mood/style ONLY: sparse elegant floor rings and magic rays; DO NOT draw any heroes.
Tier 10 legendary rainbow: most ornate of these tiers, but no solid filled body glow. Each frame has an identical rainbow thin floor-ring ellipse x20..107,y99..114 centered (64,106), 88px wide, whole ring above y116; a second thin close concentric ring is allowed, fixed geometry. Bright saturated ruby coral, amber gold, lemon, emerald, cyan, blue, lilac color segments with white highlights. Several slender rainbow light rays climb around OUTSIDE left/right shoulders toward y24; two elegant small upper broken halo arcs at y24..42, leaving large black middle. Keep center x42..86,y62..115 black except floor rings. No characters, no rainbow arch filling the center, no body silhouette, no stars or orbiting particles. Four coherent looping frames: ring glints travel clockwise, colored rays rise gently, broken upper halo glints move; all rings keep exact size and position. Every visible part bright, crisp limited-palette pixel art, black backdrop.
```

### asset-handoff/outputs/aura-10/aura-10_orb_1.png

참조: tpl-orb-24x4.png (배치만).
원본: exec-186200b9-9d3b-40e7-933a-73893d90a3f8.png.

```text
STYLE BIBLE — "Everyone's Dungeon" v2 effects. True pixel art on a strict pixel grid: every art pixel same square block, no anti-aliasing, no blur, no gradients, no painterly brushwork. Bright readable cute RPG magic effects. Limited colors with 2-3 discrete brightness steps. No text, letters, numbers, watermark, logo, ground shadow, frame, border, cell separators, guide lines or boxes. Solid pure BLACK #000000 background, opaque. All visible magic is bright; black converts to transparency. No character, person, hero, silhouette, mannequin or gray capsule. This is a production sprite sheet, not an illustration or presentation.
Use case: stylized-concept. Asset: aura-10_orb_1.png, separate single orbiting particle sprite sheet. EXACT requested image dimensions 96x24, four 24x24 square frames arranged left-to-right in ONE row, no gaps. Four-to-one aspect ratio. Attached template is POSITION ONLY: NEVER draw its gray lines or border.
Each cell contains one legendary rainbow four-point sparkle. Brilliant white core and bright saturated segments of coral red, amber gold, lemon, emerald, cyan and lavender. The color glint travels around the single star and it gently pulses in four looping frames. No detached satellites or secondary stars. Most ornate of the three tiers but still readable as ONE small sparkle.
Each of four cells has exactly ONE object centered on local (12,12), size about 12x14 native pixels, leave at least 4 native pixels black clear margin. Identical center in all frames. The whole sheet contains EXACTLY FOUR stars total, one in each quarter. They do NOT move along an orbit in this sheet; game code controls orbit. Only tiny twinkle or rotation in place. No floor ring, no halo, no aura, no rays extending to other cells, no motion trail, no characters. Strict crisp blocky native pixel style, 1px smallest feature, black pure #000000 negative space. Output just the four centered single-object frames.
```


