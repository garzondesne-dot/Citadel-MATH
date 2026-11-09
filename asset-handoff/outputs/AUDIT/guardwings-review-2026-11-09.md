# guardwings 원본 시안 검토 · 2026-11-09

- 생성: 내장 이미지 생성, 3회 시도 후 중단.
- 선택: 첫 후보. 다른 후보는 최종 산출물로 채택하지 않음.
- 파일: `../guardwings/guardwings_sheet_1.png`
- 규격 미통과: 실제1881×836, 요청2304×160. 정확 초록/격자/고정 피벗 미통과.
- 상세: [questions.md](questions.md)의 guardwings 항목.

## 선택 원본의 생성 프롬프트

```text
STYLE BIBLE — "Everyone's Dungeon" v2
True pixel art on a strict square pixel grid: same-size square art pixels, no anti-aliasing, no blur, no gradients, no painterly brushwork. Limited palette, top-left light, two shadow steps maximum. Thin 1-pixel dark navy-purple outline #1a1228. Cute readable chibi RPG effects, majestic guardian archangel.

Use case: stylized-concept.
Asset: guardwings defensive feathered-wing animation spritesheet.
The supplied image is ONLY a placement template, NOT artwork to reproduce. Generate a complete PNG of EXACTLY 2304 by 160 pixels, SIX equal 384 by 160 cells in ONE horizontal row, no gaps or margins, no cell lines. Maintain these exact elongated proportions (14.4:1). Background uniformly exact solid chroma green #00FF00, completely opaque. No fluorescent green within wings.
Each cell has an identical wing-root attachment pivot at LOCAL x192,y112. Keep both wing roots aligned there in every frame. Leave the small hero placeholder region around local x170..214,y94..149 green and empty as shown by the gray capsule in the template; do not literally draw its outline, do not draw a hero. Feather forms connect visually behind this empty foreground character zone. No blue pivot dots, gray capsules, border lines or labels.
Subject: ONE PAIR of huge holy guardian wings per frame, white feathers, warm gold feather shafts and restrained VERY PALE sky-blue internal highlights. ONLY white/gold/pale sky-blue plus thin dark outline. NO saturated cyan/teal, rainbow, pink, purple, runes, hexagons, stone or metallic plate texture. Feathers are soft in subject but HARD square pixel edges in rendering. Three to four overlapping large feather layers, long sword-shaped flight feathers stretched almost horizontally sideways, majestic yet cute. Not tall upright wings. Stay within local y10..150.
SIX consecutive poses from left to right:
1 Small folded wings emerging upward behind back, gathering near the fixed pivot, width approx 120.
2 Half spread, wingtip tiny hard-edged white/gold spark glints, width approx 260.
3 FULL MOST MAJESTIC EXPANSION, BY FAR WIDEST FRAME, feather tips reaching local x6 and x378 (about 370 pixels total), outer long feathers nearly horizontal. This is the key pose.
4 Sweep downward and curve forward protectively around hero, width approx 290, tips down-forward, hero zone empty green.
5 Reopen wide, but slightly narrower than frame3 (width approx 338), with 3–5 tiny detached drifting white/gold feathers.
6 Folding inward and dissolving into a few hard-edged light fragments, fewer feathers to imply fading (no alpha, blur or glow gradients), width approx 150.
Same feather design and palette across all six, same pivot. Distinct readable poses, frame3 widest. No text, letters, numbers, watermarks, logos, people, ground, ground shadow, guides, blue dots, capsule or drawn cell dividers. Output only this single-row six-frame wing sprite sheet.
```
