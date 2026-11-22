// 🏰 성채 레이드 탭 — 설계 방 묶음 #8 (2026-11-22) · 설계 = docs/handoff/castle-raid/DESIGN-v1.md
{ const P5 = (a, b, c, d, e) => [['idle', a], ['idleB', b], ['attack', c], ['hit', d], ['down', e]];
  const RB = [
    { n: 1, ko: '겹침의 성문지기', unit: '집합',
      f1: '"Gatekeeper of the Overlap" — a huge castle-gate golem of dark stone and bronze; its body is a fortress gate with a portcullis mouth; two big glowing rings (one teal, one gold) orbit its chest and OVERLAP like a Venn diagram, the overlapping lens glows white; small battlement crown on its head; one glowing rune ∩ in the overlap. Accent color teal-gold.',
      p1: P5('standing wide, the two rings slowly orbiting and overlapping', 'same pose, chest rising, rings a little brighter', 'slams both stone fists forward to the left, the two rings fly out as a crossed ring shockwave', 'recoils, one ring knocked out of line, stone chips flying', 'collapsed into a heap of gate stones, both rings fallen flat and dark'),
      f2: 'the SAME golem in its SECOND PHASE: stone armor cracked with glowing RED fissures, the portcullis mouth open and burning red inside, the two rings fused into ONE spiked red-gold ring spinning fast around its body, crown broken; rune ∪ burning red on the chest. Angrier but still cute-menacing.',
      p2: P5('hunched forward, fused ring spinning, red fissures pulsing', 'same pose, fissures glowing brighter', 'hurls the spiked ring forward to the left with a burst of red sparks', 'staggered, a large armor plate breaking off', 'fallen forward on the floor, fissures gone dark, ring shattered into pieces') },
    { n: 2, ko: '참과 거짓의 쌍두 기사', unit: '명제',
      f1: '"Twin-Headed Knight of True and False" — a tall armored knight with TWO helmeted heads side by side: the left head white-gold with a calm blue visor light, the right head black-iron with a red visor light; one white shield in the left hand and one black sword in the right; a long checkered white-and-black cape; one glowing rune → on the breastplate. Accent color blue vs red.',
      p1: P5('standing guard, white shield forward, black sword lowered', 'same pose, both visor lights pulsing in turn', 'lunges forward to the left with the black sword, a red slash arc', 'knocked back, the white head turning away, shield dented', 'kneeling collapsed, both heads bowed, sword and shield dropped, visor lights out'),
      f2: 'the SAME knight in its SECOND PHASE, colors NEGATED: the white head is now black with a red visor and the black head is white with a blue visor (swapped), the cape is torn, the shield is cracked with red fissures, the sword burns with a violet flame; rune ~ burning on the breastplate; a faint red aura.',
      p2: P5('leaning forward aggressively, flaming sword raised, cracked shield at the side', 'same pose, violet flame flaring', 'spins and sweeps the flaming sword forward to the left in a wide violet arc', 'staggered, one helmet cracked, sparks', 'fallen on its back, both helmets cracked open and empty, flame out') },
    { n: 3, ko: '증명의 용왕 ∎', unit: '집합과 명제 대단원',
      f1: '"Dragon King of Proof" — a grand, regal dragon of deep navy scales and gold trim seated like a king; wings made of long unrolled parchment scrolls covered with glowing chalk-white wavy lines (not readable letters); a golden crown with a small solid square gem; a scepter-like tail tip shaped like a quill; one glowing rune ∴ on its chest. Accent color gold.',
      p1: P5('seated upright on its haunches, scroll wings half open, calm proud eyes', 'same pose, chest rising, wing lines shimmering', 'breathes a beam of golden light forward to the left, scroll wings spread wide', 'head knocked aside, a scroll wing torn, loose parchment flying', 'collapsed with its head on the floor, crown rolled off, wing scrolls limp and dark'),
      f2: 'the SAME dragon in its SECOND PHASE: risen to full height, navy scales cracked with glowing RED fissures, the scroll wings burning at the edges with red-gold fire, crown now a ring of floating red-gold shards, eyes blazing; a large solid glowing square ∎ floating above its chest. The grand final boss, awe-inspiring but school-appropriate.',
      p2: P5('rearing tall, burning scroll wings spread, floating square glowing', 'same pose, fissures and wing fire pulsing', 'slams a clawed forefoot down toward the left while breathing a spiralling red-gold blast', 'reeling back, the floating square cracked, embers flying', 'fallen on its side, fire out, the square broken into small cubes on the floor, eyes closed') },
  ];
  const row = (d, ps) => `${d}\nCells: ${ps.map((p, k) => `(${k + 1}) ${PN[p[0]] || p[0]} = ${p[1]}`).join(' · ')}`;
  RB.forEach((b) => {
    O.push({ id: `raid-boss-${b.n}`, tab: 'raid', name: `👑 성채 레이드 ${b.n}층 보스 · ${b.ko} (1막 · 2막)`, kind: '2줄 × 5칸 1920×768 · 큰 칸 384 · 분홍 배경',
      use: `🏰 성채 레이드 ${b.n}층(${b.unit}) 보스 · 1줄 = 1막 모습 · 2줄 = 2막 모습(체력 50% 에서 바뀜 · 붉은 금) · 5칸 = 대기 A · 대기 B(숨쉬기) · 공격 · 맞음 · 쓰러짐 · 틀 그림의 위 2줄만 씀 · 구현 = v1.2 이후(미리 뽑아 둠) · 받은 그림 → 머리 방에 「raid-boss-${b.n}」`,
      att: [REF.boss45[1], REF.bossR[1]],
      prompt: `${STYLE}
${CHAR}

Attached: (1) TEMPLATE = a grid of big 384 x 384 cells, 5 columns (magenta = background, cyan line = where the feet stand, yellow dashed = center, white dashed = safe margin). Use it ONLY for the layout and use ONLY ITS TOP 2 ROWS; do NOT draw its lines, labels or numbers. (2) REFERENCE = an approved BOSS sheet from the same game. Match it in pixel size, outline, palette style, lighting and level of detail (do NOT copy its creature).
ONE image 1920 x 768: 2 rows x 5 equal square cells (each 384 x 384), no gaps, no lines, no labels. It is ONE raid boss shown in TWO PHASES: row 1 = first phase, row 2 = the same boss in its enraged second phase (same body size and silhouette family, clearly the same creature). The boss is big and grand: it fills about 90% of its cell (inside the white safe margin).
Row 1: ${row(b.f1, b.p1)}
Row 2: ${row(b.f2, b.p2)}
The boss faces LEFT in every cell; in each row the feet are on the cyan ground line and the boss has the same size and horizontal position in all 5 cells, so cells 1 and 2 loop as a gentle breathing animation. Attack effects stay inside their cell.
Solid flat magenta #FF00FF background everywhere, no magenta or hot pink inside the boss (use red, crimson, gold, violet instead). Hard pixel edges, no pink fringe. School-appropriate (cute-menacing, never gory). No text, no letters, no numbers (runes are simple glowing symbols only).`,
      fix: [{ label: '1막 줄만 다시 (낱장 5칸)', prompt: sheet5({ kind: 'boss', desc: b.f1, poses: b.p1 }) }, { label: '2막 줄만 다시 (낱장 5칸 · 1막 그림을 같이 첨부)', prompt: sheet5({ kind: 'boss', desc: b.f2 + ' Attached MASTER = my approved first-phase sheet of this boss: keep the same creature, body size and proportions.', poses: b.p2 }) }] });
  });
  O.push({ id: 'raid-bg', tab: 'raid', name: '🖼 성채 레이드 배경 · 성채 가장 깊은 홀', kind: '배경 1600×900', use: '🏰 성채 레이드 전투 배경(세 층이 함께 씀 · 층마다 빛깔만 코드로 바꿈) · 받은 그림 → 머리 방에 「raid-bg」', att: [REF.bg[1], REF.bgR[1]],
    prompt: `${STYLE}

Use the attached template only for composition; do NOT draw its boxes, lines or labels. Match the attached REFERENCE background in pixel size and level of detail.
Side-view battle background for a dungeon RPG, 16:9, 1600x900, pixel art (every art pixel is the same square block).
Theme: "The Deepest Hall of the Citadel" — a vast gothic throne hall inside a dark fortress: two rows of tall stone pillars receding to the center, torn royal banners (deep red and navy, plain, no emblems), iron braziers with warm fire on the left and right, cracked stone floor with a faded circular seal pattern, a huge closed double gate with a round stained-glass window above it at the far center letting in cold moonlight, a few broken chains hanging from the ceiling; dark charcoal, deep navy and bronze palette with warm torch accents and one cold moonlight beam.
One-point perspective with the vanishing point at the center. Lower ~45% of the image = a FLAT, open, medium-dark floor where four heroes and one very large boss stand (no props on the floor center). Keep the area behind the center-top boss box simple and darker so a big boss pops. Decorations and light sources on the left and right sides. Dark and desaturated overall with a few glowing accents. No characters, no monsters, no text, no frame.`, fix: [] });
  O.push({ id: 'raid-shield2', tab: 'raid', name: '🟥 2막 실드 칸 · 금 간 붉은 판 5계열 (멀쩡 · 금 감 · 깨짐)', kind: '3줄 × 5칸 1280×768 · 분홍 배경', use: '🏰 성채 레이드 2막 실드 칸(1막 = 지금 속성 방패 atb-shield-slots · 2막 = 더 단단한 붉은 판) · 계열 문양 · 칸 순서는 지금 실드 칸과 같게(무기 · 화염 · 자연 · 지혜 · 신비) · 받은 그림 → 머리 방에 「raid-shield2」', att: [],
    prompt: `STYLE: true pixel art on a strict pixel grid (every art pixel is the same square block), no anti-aliasing, no blur. Chunky, bold, high-contrast GAME UI ICONS for a cute dungeon RPG, readable at small size on a phone.
No text, no letters, no numbers, no watermark, no frame around the whole image.
BACKGROUND: solid flat magenta #FF00FF, no magenta or hot pink inside the icons. Each icon has a thick 2-pixel dark outline (#1a1228).

ONE image 1280 x 768: 3 rows x 5 equal cells (each 256 x 256), no gaps, no lines, no labels. Each cell = one HEAVY SHIELD PLATE icon, centered, filling about 80% of the cell.
These are "second phase" boss shield plates: thicker and more menacing than a normal shield — a dark crimson-and-black iron kite shield with a heavy riveted rim, glowing RED fissure lines running across it from the start (already cracked-looking but still solid), and a big simple emblem in the center showing its element family.
Columns (left to right), emblem and emblem color:
(1) ARMS: two crossed blades, steel white.
(2) FLAME: a flame, orange-yellow.
(3) NATURE: a leaf with a water drop, green-teal.
(4) WISDOM: an open book with a small gear, sky blue.
(5) MYSTIC: a crescent moon with a star, violet-white.
Rows (top to bottom) = damage state of the SAME five plates:
Row 1 INTACT: solid plate, red fissures glowing softly, emblem bright.
Row 2 BREAKING: one big bright crack splitting the plate through the emblem, two chips missing from the rim, sparks.
Row 3 SHATTERED: the plate broken into 4-5 pieces flying apart with a red-white burst, emblem split.
The same plate keeps the same size and position down its column.`, fix: [] });
  O.push({ id: 'raid-gate', tab: 'raid', name: '🔒 게시판 지도 성문 칸 3상태 (잠김 · 열림 · 처치)', kind: '3칸 1536×512 · 분홍 배경', use: '🗺 게시판 지도(board-map-v2) 오른쪽 위에 올리는 성채 성문 = 성채 레이드 입구 · ① 잠김(자물쇠 · 별이 모자람) ② 열림(문이 열리고 횃불) ③ 처치(문 위에 깃발 자리 · 깃발 그림은 코드가 기사단 깃발을 얹음) · 받은 그림 → 머리 방에 「raid-gate」', att: ['참고 · 게시판 지도 v2 (받은 그림이 있으면)'],
    prompt: `${STYLE}
${CHAR}

A map landmark sprite for a pixel-art quest map: a small dark CITADEL GATEHOUSE seen from a slightly raised front view (the same view as buildings on a fantasy board-game map): two round stone towers with pointed slate roofs, a big arched double gate between them, battlements, dark stone with bronze trim, sitting on a small rocky base.
ONE image 1536 x 512: 3 equal cells (512 x 512) in ONE row, no gaps, no lines. The SAME gatehouse, same size and position in all 3 cells:
(1) LOCKED: gate shut, a big bronze padlock and crossed chains over the door, windows dark, cold blue mood, a little mist at the base.
(2) OPEN: chains gone, both doors swung open showing a warm orange glow inside, torches lit on both towers, windows glowing.
(3) CONQUERED: doors open, torches lit, golden sparkles, and an EMPTY flagpole on top of each tower plus one empty wide banner pole above the gate (no flags drawn — the game adds them), a small gold laurel over the arch.
No characters, no text, no letters, no numbers.`, fix: [] });
}
