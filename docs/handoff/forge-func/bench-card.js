// ⚒ 모루 함수 탭 — 카드 그림 10칸 (설계 방 · 묶음 #7)
O.push({ id: 'forge-fn-arts', tab: 'forgefn', name: '⚒ 모루 함수 카드 그림 10칸 (14~17차시)', kind: '아이콘 5×2 한 장',
  use: '⚒ 기호 모루 함수 단원 카드 22장의 그림(art 16~25) · 지금 집합·명제 카드 그림(8×2)과 같은 크기 · 같은 화풍 · 설계 = docs/handoff/forge-func/FORGE-FUNC-v1.md',
  att: ['화풍 · 지금 모루 카드 그림 16칸'],
  prompt: `${STYLE}

Icon sheet for collectible "formula cards" in a math RPG forge. Match the attached REFERENCE sheet exactly in pixel size, outline, palette, glow and how big each icon is inside its cell (the reference is the existing set of 16 icons; these 10 continue the same set).
ONE image: a grid of 5 columns x 2 rows = 10 equal square cells, no gaps, no cell lines, no labels. Native 64x64 px per cell (320x128 total), upscaled 8x with nearest-neighbor (2560x1024). Solid flat magenta #FF00FF background, no magenta or pink inside the icons. Each icon centered, filling about 80% of its cell, nothing crossing into the next cell.
Each icon is a small glowing magical object made of bronze, stone and teal/gold light — pictures only, no letters or numbers.
Row 1, left to right:
(1) MAPPING: two upright oval stone rings side by side, three glowing dots in each, three golden arrows going from the left dots to the right dots (one arrow per left dot).
(2) FUNCTION MACHINE: a small bronze machine with a funnel on top and a spout at the bottom; one glowing teal orb dropping into the funnel, one glowing gold orb coming out of the spout.
(3) DOMAIN AND RANGE: the same two oval rings; the left ring glows teal all over, in the right ring only a smaller inner oval glows gold (part of it stays dark).
(4) EQUAL FUNCTIONS: two identical small bronze machines side by side joined by a glowing gold link bar between them (two parallel bars).
(5) GRAPH: a stone tablet with two thin crossing axis lines and one glowing teal curve rising through three bright dots.
Row 2, left to right:
(6) ONE-TO-ONE: two columns of three gems each, joined by three straight parallel golden threads, each gem paired with exactly one gem.
(7) IDENTITY AND CONSTANT: a round hand mirror showing the same teal gem in front and in the reflection, with one small gold star fixed above it.
(8) COMPOSITION: two small bronze machines connected by a pipe in a chain; a teal orb enters the first, a violet orb travels in the pipe, a gold orb leaves the second.
(9) INVERSE: one bronze machine with a golden arrow going out to the right and a second teal arrow curving back around to the start, forming a loop.
(10) MIRROR LINE: a stone tablet with crossing axes, a glowing white diagonal line from bottom-left to top-right, and two curves (one teal, one gold) that are mirror images of each other across that diagonal.`,
  fix: [] });
