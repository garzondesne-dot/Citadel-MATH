// 🧙 #84 속성 이동 (2026-11-11 DECISIONS 「속성 이동 = 옛 속성도 공명」): 17 · 27 · 28 → 📐 수식 · 옮긴 용사 11명 = 옛 + 새 속성 + 공통 특화 모두 공명
//   새 속성(☀ · 🌑 · ⚙ · 🌊) 그림이 없는 동안 = 꼬리표 · 기본 스킬은 옛 속성 — node tests/attrmove.test.js
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/fx.js', 'js/engine/attack.js']);
let ok = 0, fail = 0; const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
const F = DS.FX, A = DS.Attack;
const OLD = { 4: 'star', 8: 'star', 13: 'sweep', 18: 'cut', 21: 'smash', 17: 'magic', 25: 'magic', 27: 'magic', 28: 'frost', 30: 'spark', 31: 'sweep' };
const NEXT = { 4: 'sun', 8: 'sun', 31: 'sun', 13: 'water', 18: 'dark', 25: 'dark', 21: 'gear', 30: 'gear', 17: 'math', 27: 'math', 28: 'math' };
const fam = (id) => F.FAMS.find((f) => f.id === id);
// ① 17 · 27 · 28 = 📐 수식 (자기 속성 · 기본 스킬 · 꼬리표)
[17, 27, 28].forEach((h) => { check(F.affOf(h).id === 'math' && F.crystalOf(h, {}) === 'ruler', `${h} = 📐 수식 · 기본 눈금 베기`); });
// ② 11명 모두: 옛 속성 Ⅰ~Ⅳ 공명 · Ⅲ 이상 필살기 · Ⅳ 진필살기
Object.keys(OLD).forEach((h) => {
  const o = fam(OLD[h]).ids;
  check(o.every((k) => F.ownReso(h, k)), `${h} 옛 속성(${OLD[h]}) 공명`);
  check(A.canUlt(o[2], h) && A.canTrue(o[3], h) && !A.canUlt(o[1], h), `${h} 옛 속성 Ⅲ 필살기 · Ⅳ 진필살기 · Ⅱ 없음`);
  const n = fam(NEXT[h]);
  if (n) check(n.ids.every((k) => F.ownReso(h, k)) && A.canTrue(n.ids[3], h), `${h} 새 속성(${NEXT[h]}) 공명 · 진필살기`);
  else check(F.affOf(h).id === OLD[h] && F.crystalOf(h, {}) === o[0], `${h} 새 속성 그림 없음 → 꼬리표 · 기본 = 옛 속성`);
  const c = fam(F.commonOf(h)).ids; check(F.resonates(h, c[0]) && A.canUlt(c[3], h), `${h} 공통 특화 공명 · Ⅳ 필살기`);
});
// ③ 안 옮긴 용사는 그대로 (하스타 5 연격 · 리아넬 2 바람 · 한수 19 수식) · 남의 속성은 공명 없음
check(F.affOf(5).id === 'sweep' && F.affOf(2).id === 'wind' && F.affOf(19).id === 'math', '안 옮긴 용사 그대로');
check(!F.resonates(28, 'flame') && !F.resonates(13, 'spark') && !A.canUlt('pillar', 18), '다른 속성 = 공명 · 필살기 없음');
check(!F.ownReso(5, 'twinkle') && !F.ownReso(19, 'frost'), '옛 속성 공명은 옮긴 용사만');
console.log(fail ? `❌ 속성 이동 실패 ${fail}` : `✅ 속성 이동(#84): 확인 ${ok}개 · 실패 0`); if (fail) process.exit(1);
