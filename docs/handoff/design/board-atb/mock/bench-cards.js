/* 📋 게시판 던전(ATB) 화면 시안 — 설계 방 2026-11-20 */
const ATBUI = `UI MOCKUP for a landscape phone game screen (pixel-art RPG "Everyone's Dungeon"). ONE image, 16:9 wide (about 1560x720), shown as a single finished game screenshot.
Art style: match the attached SCREENSHOT exactly for the world — true pixel art heroes (cute chibi, 2–2.5 heads tall, facing RIGHT), a pixel-art monster facing LEFT, a dark torch-lit pixel-art dungeon background. Keep the same heroes, monster and background as in the attached screenshot.
What to redesign: ONLY the user interface layer (bars, buttons, panels, icons). Replace the plain flat placeholder UI in the screenshot with a polished pixel-RPG interface: chunky pixel frames with a 1-pixel dark navy outline (#1a1228), warm parchment and dark-bronze panels, gold highlights, readable at phone size, big thumb-friendly buttons. Same positions and sizes as in the attached screenshot unless told otherwise.
HERO LINE-UP RULE (important): the heroes stand in one diagonal line with clear PERSPECTIVE — the hero nearest the viewer is at the BOTTOM-LEFT and drawn largest (100%), each hero behind stands higher and further right and is drawn smaller (about 90%, 80%, 70% for the farthest). EVERY hero's feet must stand ON the stone floor (below the horizon line where the floor meets the wall, in the lower half of the picture) — never on the wall, railing or sky; keep the line shallow so even the farthest hero is on the floor. The player's own hero, tagged \"(나)\", is ALWAYS the nearest, bottom, largest one with the golden glow.\nKorean text must be written EXACTLY as given in quotes, in a clean bold pixel-style Korean font; do not invent other text. No watermark, no device frame.`;
const ATBC = [
 ['atb-ui-wide', '① 전투 화면 · 넓게 편 상태', '화면 시안 1장', '게시판 던전 새 판의 기본 전투 화면(문제를 안 열었을 때) — 왼쪽 용사 4명 · 오른쪽 몬스터 · 아래 단추 4개', ['atb-ref-wide.png', 'atb-ref-layout.png'],
`Screen: BATTLE (wide state).
Left 45%: four heroes standing in a diagonal line, each with a small name tag, a green HP bar and a yellow ATB (action) bar under the feet; the hero marked "(나)" has a golden glow outline and a full, flashing ATB bar.
Right: one big monster. Above it: a long red boss HP bar; under the bar a row of 4 square SHIELD tiles, each showing one of these family emblems: sword, flame, leaf-wave, set-square, star; above the bar a red warning pill "⚠ 물결 3초 뒤".
Top-right corner: "팀 부활" with three heart gems.
Bottom: four big buttons in one row — "공격" (sword icon, gold frame because ATB is full), "스킬 ⚡3" (shows 3 lit lightning pips out of 5), "역할" (flexed-arm or shield icon), "문제 풀기" (scroll icon, bright blue, the most eye-catching button).`],
 ['atb-ui-quiz', '② 문제를 연 상태', '화면 시안 1장', '「문제 풀기」를 누른 화면 — 몬스터가 앞으로 나오고 용사가 왼쪽으로 모임 · 오른쪽 55% = 문제 카드', ['atb-ref-quiz.png', 'atb-ref-layout.png'],
`Screen: QUESTION OPEN state.
Left 45%: the four heroes are bunched closer together on the far left; the monster has stepped forward to the centre-left, right in front of them (it must stay fully visible, NOT covered). Small boss HP bar, 4 shield tiles and the warning pill "⚠ 물결 3초 뒤" above the monster. Under the scene, three small buttons: "공격", "스킬 ⚡3", "역할".
Right 55%: a large parchment QUESTION CARD with a speech-bubble tail pointing at the monster (the monster is "asking" the question).
 - Card header, left: "몬스터 3 · 3의 배수 증명 · 단계 3 / 5". Header, right: a row of 5 lightning pips — the first 3 lit (the 1st one GOLD and shining, the next 2 yellow), the last 2 empty.
 - Question text (large, bold, dark ink): "n = 3k + 1 이면 n² 을 3으로 나눈 나머지는?"
 - Four answer buttons in a 2x2 grid: "① 0", "② 1", "③ 2", "④ 3".
 - Card footer: a red countdown bar labelled "보스 공격까지", then small text buttons "💡 수호자에게 묻기" and "✕ 닫기".
The card is clean, high-contrast and easy to read; the battle on the left stays lively (monster raising its arm to attack).`],
 ['atb-ui-charge', '③ 스킬 「모았다 놓기」', '화면 시안 1장', '스킬 단추를 꾹 누르는 순간 — 기운이 차오르는 고리 · 딱 맞음 칸 · ⚡ 5개 가득 = 필살기', ['atb-ref-wide.png'],
`Screen: SKILL CHARGE moment (hold-and-release). Same battle as the screenshot, but the hero marked "(나)" is charging a skill: energy swirls into the sword, small sparks, the hero leans back.
Centre-bottom, replacing the button row: a big circular CHARGE RING being filled clockwise with glowing energy; on the ring a narrow bright GOLD zone marked "딱!" and a wider pale zone marked "성공"; a moving pointer is about to enter the gold zone. Under the ring: "꾹 누르고 있다가 — 떼기!".
Above the ring: 5 lightning pips ALL lit (3 of them gold) with the label "⚡ 가득 · 필살기".
The rest of the UI (HP bars, shield tiles, hearts) is dimmed slightly so the ring pops. Dramatic light on the charging hero.`],
 ['atb-ui-pick', '④ 용사 고르는 창 (수치 보임)', '화면 시안 1장', '대기실 · 결과 화면에서 여는 창 — 역할 · 계열 · 「약점!」 배지 · 용사 수치는 여기서만', ['atb-ref-wide.png', 'ref-port-p1.png'],
`Screen: HERO SELECT panel (landscape), opened over a dimmed battle background.
Left 40%: a scrolling GRID of hero portrait tiles (3 columns x 3 rows visible, pixel-art bust portraits like the attached portrait reference). Each tile has a small ROLE icon in one corner (sword = 딜러, shield = 탱커, cross = 힐러, music note = 서포터) and a small FAMILY emblem in the other corner. Two tiles carry a bright red-gold ribbon badge "약점!". One tile is selected with a gold frame. Locked heroes are dark with a small padlock.
Right 60%: DETAIL card of the selected hero: a large full-body pixel sprite on a small stone pedestal; name "로안 · 검사"; chips "딜러" and "⚔ 무기" and the badge "약점!".
 Stat rows with pixel icons and green up-arrows where better than the current hero:
 "❤ HP 120" , "⚔ 공격력 ×1.50" , "🛡 방어 −0%" , "⏱ ATB 7.3초" , "🎯 치명 ×1.6"
 Skill rows: "✨ 쌍월 참 Ⅳ · 피해 96" , "💪 강타" , "⚡ 각성 필살기" (the last one with a golden glow).
 Bottom-right: a big gold button "이 용사로".
Top-centre title: "용사 고르기". Top-right small text: "이번 보스 약점 ⚔ 무기 · 🔥 화염".`],
 ['atb-ui-cutin', '⑤ 각성 필살기 컷인', '화면 시안 1장', '⚡ 5개를 가득 모아 쏜 순간 — 전체 화면 연출', ['atb-ref-wide.png', 'ref-port-p1.png'],
`Screen: AWAKENED ULTIMATE cut-in. Same battle as the screenshot, but time is frozen and the screen is darkened.
A wide diagonal CUT-IN band crosses the screen: inside it a dramatic close-up of the swordsman hero's eyes and face (pixel art, three-quarter view looking right, golden glowing hair, fierce determined eyes), speed lines, gold and white light.
Behind the band: the hero's sword has become a huge blade of golden light aimed at the monster; the monster recoils; the shield tiles above it are shattered into pieces.
Text, big and bold, lower left of the band: "각성 필살기" and under it, larger: "만 번째 베기". Small 5 gold lightning pips next to the text.
No buttons on this screen.`],
 ['atb-ui-result', '⑥ 결과 화면 (승리)', '화면 시안 1장', '판이 끝난 화면 — 💎 3줄 · 차시 숙련 도장 · 「용사 바꿔 다시」', ['atb-ref-wide.png'],
`Screen: VICTORY RESULT (landscape). Background: the same dungeon, the monster defeated and fading, the four heroes cheering in a row at the left-centre (victory poses, confetti of small gold sparks).
Top-centre banner: "승리!" with three stars, the first two lit.
Right half: a parchment RESULT card:
 "맞힌 소문항 7개  💎 +7"
 "클리어  💎 +4"
 "수호 보너스  💎 +2"
 a gold total line: "합계  💎 13"
 then a STAMP row titled "11차시 숙련" with three round stamp slots labelled "3판" (stamped, red-gold seal), "7판" (empty), "15판" (empty) and a thin progress bar "3 / 7".
Under the heroes, small per-hero chips: each hero's portrait with "실드 1칸" and a tiny broken-shield icon.
Bottom row, three buttons: "다시 도전" (gold), "용사 바꿔 다시", "나가기".`],
 ['atb-icons', '⑦ 아이콘 16칸 (계열 · 역할 · ⚡ · 실드)', '아이콘 4×4 한 장', '새 판에 쓰는 작은 아이콘 16개 — 5계열 · 역할 4 · ⚡ 2 · 실드 3 · 부활 · 약점', ['atb-ref-wide.png'],
`ICON SHEET: ONE square image 1024x1024, a 4x4 grid of 16 equal cells (256x256 each), no gaps, no lines, no labels, no text. Solid flat magenta #FF00FF background in every cell. Each icon centred, filling about 70% of its cell, true pixel art (native 32x32 upscaled 8x), 1-pixel dark navy outline (#1a1228), light from top-left, same style as the attached screenshot's game art.
Row 1 (element families): (1) crossed sword and hammer, steel and red — "weapon"; (2) flame with a small lightning bolt, orange and yellow — "blaze"; (3) water wave with a leaf and a snowflake, teal and green — "nature"; (4) set-square with a small gear and a sparkle, blue and brass — "wisdom".
Row 2: (5) sun and crescent moon with a star, gold and violet — "mystic"; (6) role DEALER: a single sharp sword pointing up-right, red; (7) role TANK: a sturdy kite shield, blue and silver; (8) role HEALER: a green cross inside a soft glow.
Row 3: (9) role SUPPORT: a golden music note with small sparkles; (10) ENERGY pip: a yellow lightning bolt in a round dark socket; (11) GOLD ENERGY pip: the same bolt but bright gold with a shining star glint; (12) EMPTY pip: the same round dark socket, empty.
Row 4: (13) SHIELD tile intact: a square crystal-blue shield tile; (14) SHIELD tile cracked: the same tile with glowing cracks; (15) REVIVE heart: a pink heart gem with a small sparkle; (16) WEAK badge: a red-and-gold ribbon burst shape (no letters) with a small downward arrow on a shield.`],
];
ATBC.forEach(([id, name, kind, use, ref, body]) => O.push({ id, tab: 'atb', name, kind, use, att: ref.map((f) => ({ 'atb-ref-wide.png': '참고 · 전투 화면(실제 그림)', 'atb-ref-quiz.png': '참고 · 문제 연 화면(실제 그림)', 'atb-ref-layout.png': '참고 · 자리 배치 그림', 'ref-port-p1.png': '참고 · 초상 ①' }[f])), ref, prompt: id === 'atb-icons' ? `${STYLE}\n\n${body}` : `${ATBUI}\n\n${body}`, fix: [] }));

