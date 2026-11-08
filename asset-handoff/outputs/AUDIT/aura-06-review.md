# aura-06 생성 원본 인계 (2026-11-09)

내장 이미지 생성으로 파일당 최초 1회 제작. 재생성 0회. 생성 원본 크기/픽셀 그대로 저장. 크기 조정은 선생님 지시에 따라 #4 담당.

분홍 고리와 양옆 가는 기운 + 한 칸에 벚꽃잎 하나. 각각 4프레임, 가운데 빈 공간 확인. 고리 위치/여백은 #4 정렬 필요.

자기 검사: 눈으로 프레임 수/주제/배경/용사·알약·가이드·글자 없음 확인. 원본의 정확한 배경 RGB, 균일 격자, 고리 픽셀 단위 고정은 보장하지 않음. 밝은 바닥의 실제 게임 시인성 검사는 #4 적용 후 필요. 생성 완료/검토 대기이며 게임 적용을 뜻하지 않음.

## aura-06_sheet_1.png

원본: /workspace/scratch/c3b6030f4126/generated_images/exec-a1147c55-65d9-47df-a8d4-15aa18fd3f40.png

```text
STYLE BIBLE — "Everyone's Dungeon" v2 effects. True pixel art on a strict uniform square pixel grid; no anti-aliasing, blur, gradients, painterly brushwork. Bright readable cute RPG magic, limited palette, 2–3 discrete brightness levels, hard stepped pixel edges. No text, letters, numbers, watermark, logo, frame, border, cell separators, guide lines, boxes. Opaque solid pure BLACK #000000 backdrop. No character, person, hero, silhouette, mannequin, gray capsule. Never trace a body shape. Use case: stylized-concept. Production game sprite sheet.
Asset aura-06_sheet_1.png. FOUR frames in ONE horizontal row, equal cells, no gaps. Requested native geometry 512x128 (128x128 per cell); generated source resolution will be retained unchanged. Each frame: floor ring fixed ellipse centered at native (64,106), bbox x20..107,y99..114, above baseline y116. Ring stays EXACTLY the same size and position across frames. Keep center x42..86,y45..100 EMPTY BLACK for hero. No orbiting objects or detached particles in the aura sheet; orbit particle is generated separately. Subtle looping animation of ring highlight clockwise and outer wisps only. Avoid filled glow masses. Clean black negative space.
Tier 6 cherry blossom PINK: luminous saturated rose-pink floor ring with pale blush-white highlights and coral-pink midtone. Slightly layered ring with one delicate short secondary arc outside each flank. Two very slender pink wisps rise at left/right outside the central hero zone to y32, keeping center entirely black. Elegant sparse petal-like curves, but NO actual floating petals or objects (separate file). Four-frame glint loop, constant ring geometry.
```

## aura-06_orb_1.png

원본: /workspace/scratch/c3b6030f4126/generated_images/exec-a1853611-cb27-414e-b611-21cc285406cc.png

```text
STYLE BIBLE — "Everyone's Dungeon" v2 effects. True pixel art on a strict uniform square pixel grid; no anti-aliasing, blur, gradients, painterly brushwork. Bright readable cute RPG magic, limited palette, 2–3 discrete brightness levels, hard stepped pixel edges. No text, letters, numbers, watermark, logo, frame, border, cell separators, guide lines, boxes. Opaque solid pure BLACK #000000 backdrop. No character, person, hero, silhouette, mannequin, gray capsule. Never trace a body shape. Use case: stylized-concept. Production game sprite sheet.
Asset aura-06_orb_1.png. FOUR frames in ONE horizontal row of four equal cells, no gaps. Requested native geometry 96x24 (24x24 cells); keep generated original size unchanged. Exactly ONE single object centered at local (12,12) in EACH frame, exactly FOUR objects total. Object about 12x14 native pixels; at least 4px clear black margin, keep same center and scale. Four-frame looping twinkle or rotation IN PLACE; no orbital path or trail, no floor ring, no aura, no extra particles. Game code moves the single particle around the hero.
One single CHERRY BLOSSOM PETAL, not a whole flower: small oval heart-notched petal with tapered base, luminous pink edge and blush-white inner plane. Four views of the SAME single petal turning gently in place, broad face / oblique / narrow edge / returning. Saturated rose-pink so visible after brightness-to-alpha conversion. No stem, no flower center, no satellites.
```
