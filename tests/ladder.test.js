// 🪜 #96 스킬 = 내 용사 사다리 4칸 (2026-11-11 선생님 · DECISIONS 「🪜 스킬 = 내 용사 특화 사다리만」 · 「🪜 공통 특화 없앰 · 단일 특화」)
//   공통 특화 없앰 · 용사 4명 속성 옮김 · 쓸 수 있는 스킬 = 사다리 안 + 🪶 특별 · ⚡ = 내 속성 Ⅲ · Ⅳ · 🌟 = 내 속성 Ⅳ — node tests/ladder.test.js
//   (옛 tests/common.test.js(#74-1) · attrmove.test.js(#84) 를 대신함)
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/fx.js', 'js/engine/attack.js']);
let ok = 0, fail = 0; const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
const F = DS.FX, A = DS.Attack;
// ① 옮긴 4명: 올드윈 7 🔥 → 🔮 · 아바쿠 27 📐 → ⚙ · 콤파 28 📐 → 🔮 · 칸델 32 🔥 → 🌊
[[7, 'magic'], [27, 'gear'], [28, 'magic'], [32, 'water']].forEach(([h, f]) => check(F.affOf(h).id === f && F.crystalOf(h, {}) === F.ladder(h)[0], `${h} → ${f} · 기본 = 그 사다리 Ⅰ`));
// ② 갈래마다 용사 수 (34명 · 16 각성한 로안 포함 = 머리 방 셈과 같음): 3명 = 바람 · 빛 · 번개 · 마법 · 기계 · 수식 / 2명 = 나머지 8갈래
const heroes = Array.from({ length: 34 }, (_, i) => i), cnt = {};
heroes.forEach((h) => { const a = F.affOf(h).id; cnt[a] = (cnt[a] || 0) + 1; });
const three = ['wind', 'sun', 'spark', 'magic', 'gear', 'math'];
F.FAMS.forEach((f) => check(cnt[f.id] === (three.includes(f.id) ? 3 : 2), `${f.name} ${cnt[f.id]}명 (기대 ${three.includes(f.id) ? 3 : 2})`));
// ③ 사다리 = 내 속성 4칸 · 밖은 Ⅰ 로 · 🪶 특별은 그대로
check(F.ladder(5).join() === 'thrust,sweep,spin,reap', '하스타(5) 사다리 = 연격 Ⅰ~Ⅳ');
check(F.fit(5, 'twin') === 'thrust' && F.fit(5, 'spin') === 'spin' && F.fit(5, 'wings') === 'wings' && F.fit(5, 'flamecut') === 'thrust', '사다리 밖(베기 · 합체) = Ⅰ · 🪶 특별 = 그대로');
check(F.crystalOf(2, { 2: 'void' }) === 'wblade', '끼워 둔 것이 사다리 밖 = 그 용사 Ⅰ');
// ④ 공통 특화 없앰 · ⚡ · 🌟 = 내 속성만
check(!F.commonReso(5, 'slash') && !F.resonates(5, 'slash') && !A.canUlt('twin', 5) && !A.canUlt('void', 2), '공통 특화 공명 · 필살기 없음');
check(A.canUlt('spin', 5) && A.canUlt('reap', 5) && !A.canUlt('sweep', 5), '⚡ = 내 속성 Ⅲ · Ⅳ (Ⅱ ✕)');
check(A.canTrue('reap', 5) && !A.canTrue('spin', 5), '🌟 = 내 속성 Ⅳ 만');
check(A.canUlt('slash', 0) && A.canTrue('twin', 0), '로안(0) = 베기가 내 속성');
console.log(fail ? `❌ 사다리 실패 ${fail}` : `✅ 사다리(#96): 확인 ${ok}개 · 실패 0`); if (fail) process.exit(1);
// ⑤ 👩‍🏫 체험판 💎 620 · 📜 8 = 🔨 10강(홀리 방패) + 내 속성 Ⅱ~Ⅳ 를 모든 용사가 살 수 있음 (CLAUDE.md 체험판 규칙)
{ global.window = global; global.DS = { Net: {} }; require('../js/raid/gem.js'); const Gm = global.DS.Gem;
  const enh = Gm.ENH.slice(1).reduce((a, c) => ({ g: a.g + c.g, s: a.s + (c.s || 0) }), { g: 0, s: 0 });
  let worst = { g: 0, s: 0 };
  for (let h = 0; h < 34; h++) { const ids = F.ladder(h).slice(1), g = ids.reduce((a, k) => a + (Gm.SHOP.fx[k] || 0), 0), s = ids.reduce((a, k) => a + ((Gm.SCROLL_NEED.fx || {})[k] || 0), 0); if (g > worst.g) worst = { g, s }; }
  const ok2 = enh.g + worst.g <= 620 && enh.s + worst.s <= 8;
  console.log(`${ok2 ? '✔' : '✘'} 체험판: 10강 💎 ${enh.g} · 📜 ${enh.s} + 가장 비싼 사다리 💎 ${worst.g} · 📜 ${worst.s} ≤ 💎 620 · 📜 8`); if (!ok2) process.exit(1); }
