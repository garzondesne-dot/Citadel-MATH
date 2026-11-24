// 💎 옷장 · 둥지 탭 — 설계 방 묶음 #12 (2026-11-25 KST) · 설계 = docs/handoff/design/gem-sinks/DESIGN-v1.md
{ const CB = [
    ['village', '마을 광장', 'a cozy fantasy village square at golden dusk: timber-framed houses with warm lit windows on the left and right edges, hanging lanterns, a small stone well far in the back, cobblestone ground; warm amber and soft teal palette'],
    ['citadel', '성채 앞', 'the front of a dark gothic citadel at night: tall towers with a few glowing windows far in the back, two torches on stone pillars at the left and right edges, banners (plain, no emblems), a wide stone stair leading down to a flat courtyard; deep navy and bronze palette with warm torch accents'],
    ['lastboss', '마지막 보스 앞', 'the great hall right after the final battle: a huge cracked double gate far in the back with golden light pouring through the gap, drifting golden sparks, broken chains on the side walls, a faint circular seal on the floor; dark charcoal palette with one strong warm golden light from behind'],
    ['nightsky', '밤하늘 언덕', 'a quiet grassy hilltop under a huge starry night sky: a big pale moon in the upper left, a soft band of stars, distant tiny citadel silhouette on the horizon, a few glowing blue mushrooms at the left and right edges; deep blue and violet palette with pale star highlights'] ];
  CB.forEach(([k, ko, sc], i) => O.push({ id: 'cos-cardbg-' + (i + 1), tab: 'gem', name: `🪪 용사 카드 배경 ${i + 1} · ${ko}`, kind: '세로 한 장 768×1024 · 캐릭터 없음', use: `🎨 옷장에서 💎 150 에 파는 용사 카드 배경(축제의 날 🪪 용사 카드 · 📸 단체 사진에도 씀) · 가운데 아래에 용사가 서므로 그 자리는 비움 · 받은 그림 → 손발 방에 「cos-cardbg-${i + 1}」`, att: [],
    prompt: `${STYLE}

Background for a collectible HERO CARD in a cute dungeon RPG. ONE image, portrait 3:4, 768 x 1024, pixel art (every art pixel is the same square block).
Scene: ${sc}.
Composition: a chibi hero sprite will be placed later in the CENTER of the lower half, so keep the center of the lower 55% an open, flat, calm, medium-dark area with NO props. Put all detail and light sources near the left and right edges and in the upper part. Keep the top 12% and the bottom 22% simple and darker (a name and record lines are printed there by the game).
No characters, no monsters, no animals, no text, no letters, no numbers, no frame, no border.`, fix: [] }));
  O.push({ id: 'cos-furn6', tab: 'gem', name: '🏕 텐트 가구 6종 (깃발 · 등불 · 책상 · 화분 · 보물 상자 · 양탄자)', kind: '2줄 × 3칸 768×512 · 분홍 배경', use: '🎨 옷장에서 파는 내 캠프 가구(💎 150 ~ 300) · 캠프 물건과 같은 화풍 · 받은 그림 → 손발 방에 「cos-furn6」', att: ['참고 · 지금 캠프 물건 그림 아무거나 1장(🏕 새 캠프 탭에서 받은 것)'],
    prompt: `${STYLE}
${CHAR}

Match the attached REFERENCE camp object in pixel size, outline thickness, lighting and level of detail.
ONE image 768 x 512: 2 rows x 3 equal cells (each 256 x 256), no gaps, no lines, no labels. Each cell = ONE small camp furniture prop for a hero's forest campsite, centered, sitting on the cell's ground line (about 20 px above the bottom), filling about 70% of the cell, seen from a slightly raised front view.
Row 1: (1) a small standing BANNER on a wooden pole: plain crimson cloth with a gold trim and a simple star shape, no letters. (2) a hanging LANTERN on a short curved iron stand, warm orange light with a small glow. (3) a little wooden STUDY DESK with an open book, a quill in an inkpot and a small candle.
Row 2: (4) a clay FLOWER POT with a leafy plant and three small glowing blue flowers. (5) a sturdy TREASURE CHEST, lid slightly open, a few gold coins and one gem peeking out. (6) a small round woven RUG seen at a low angle, deep red and navy with a simple geometric border.
Friendly, cozy, school-appropriate. No characters, no text, no letters, no numbers.`, fix: [] });
  const PET = [
    ['dragon', '아기 용', 'a tiny round baby dragon: teal scales, cream belly, two stubby horns, tiny wings, a short tail with a small flame-shaped tip, big friendly eyes', 'a teal egg with cream speckles and two tiny horn bumps on top', 'small wings and a short tail, still mostly a round head', 'slightly bigger with proper little wings spread, a small proud puff of harmless sparkles from the mouth'],
    ['owl', '숫자 부엉이', 'a small round owl: navy-blue feathers, a cream face disc, big golden eyes with round spectacle-like markings, a tiny scholar tassel on its head, small talons', 'a navy egg with a cream band and a tiny tassel sticking out of the top', 'a fluffy grey-blue owlet, huge eyes, tiny wings', 'sleek navy feathers, tassel cap on, one wing raised like a little teacher'],
    ['slimecat', '슬라임 고양이', 'a small jelly-like slime shaped like a cat: translucent mint-green body with a soft highlight, pointed cat ears, a curled jelly tail, simple happy cat face, tiny paws', 'a mint-green jelly egg, wobbly, with two tiny ear bumps', 'a small blob with cat ears and a face, no legs yet', 'a clear cat shape with four tiny paws and a curled tail, a little star-shaped bubble inside the body'] ];
  PET.forEach(([k, ko, base, egg, baby, adult], i) => O.push({ id: 'pet-' + (i + 1), tab: 'gem', name: `🐾 동행 펫 ${i + 1} · ${ko} (알 · 새끼 · 다 큼)`, kind: '3줄 × 2칸 512×768 · 분홍 배경', use: `🐾 둥지의 펫 ${i + 1} · 줄 = 크는 단계 3 · 칸 = 대기 2칸(숨쉬기) · 용사 발치에 작게 따라다님 → 용사보다 훨씬 작게 · 받은 그림 → 손발 방에 「pet-${i + 1}」`, att: ['참고 · 용사 시트 아무거나 1장(크기 · 화풍 맞추기)'],
    prompt: `${STYLE}
${CHAR}

A small COMPANION PET for a cute dungeon RPG: ${base}. Cute, friendly, school-appropriate, NOT a monster, no weapons. Original creature, not based on any existing game or cartoon character.
Match the attached REFERENCE hero sheet in pixel size, outline and lighting. The pet is much smaller than a hero: the fully grown pet is about half a hero's height.
ONE image 512 x 768: 3 rows x 2 equal cells (each 256 x 256), no gaps, no lines, no labels. Facing RIGHT in every cell. Feet (or the bottom of the egg) on the same ground line in every cell, about 40 px above the cell bottom, centered.
Row 1 EGG (smallest, about 30% of the cell height): ${egg}. Cell 1 = resting. Cell 2 = the same egg tilted a little with a tiny wobble mark.
Row 2 BABY (about 40% of the cell height): ${baby}. Cell 1 = standing, breathing in. Cell 2 = the same pose, body 2 px lower, eyes blinking.
Row 3 GROWN (about 55% of the cell height): ${adult}. Cell 1 = standing, breathing in. Cell 2 = the same pose, body 2 px lower, a small happy hop mark.
The SAME creature in all rows: same colors, same face, only the growth stage changes. The two cells of a row differ only slightly (a gentle idle loop).
No text, no letters, no numbers.`, fix: [] }));
  O.push({ id: 'pet-cos6', tab: 'gem', name: '🎀 펫 꾸미기 6종 (산타 모자 · 마법사 모자 · 왕관 · 목도리 · 리본 · 꽃 화관)', kind: '2줄 × 3칸 384×256 · 분홍 배경', use: '🐾 둥지에서 💎 80 에 파는 펫 꾸미기 · 코드가 펫 머리 · 목 위에 얹음 → 물건만 그림(펫은 그리지 않음) · 받은 그림 → 손발 방에 「pet-cos6」', att: ['참고 · pet-1 에서 받은 그림(크기 맞추기)'],
    prompt: `${STYLE}
${CHAR}

Tiny PET ACCESSORIES for a cute dungeon RPG, drawn ALONE (do NOT draw any pet, animal or character). They will be placed by the game on top of the small pet in the attached REFERENCE, so match its pixel size and outline, and size each item to fit that pet's head or neck.
ONE image 384 x 256: 2 rows x 3 equal cells (each 128 x 128), no gaps, no lines, no labels. One item per cell, centered, seen from the same three-quarter view as the pet facing RIGHT.
Row 1: (1) a red SANTA HAT with white fur trim and a white pom-pom, tip flopping back. (2) a small purple WIZARD HAT with a gold star and a bent tip. (3) a tiny gold CROWN with three points and one red gem.
Row 2: (4) a striped SCARF (red and cream) shaped as a loop around a small neck with one end hanging. (5) a big RIBBON BOW in sky blue with a gold center knot (no pink). (6) a FLOWER CROWN ring of small white and yellow flowers with green leaves.
No text, no letters, no numbers.`, fix: [] });
}
