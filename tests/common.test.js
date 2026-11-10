// 🤝 #74-1 공통 특화 (2026-11-11 HERO-ATTR 4절): 근접 = ⚔ 베기 · 원거리 = 🔮 마법 · 자기 속성 + 공통 특화와 공명 · ⚡ 필살기 = 자기 속성 Ⅲ 이상 / 공통 Ⅳ · 🌟 진필살기 = 자기 속성 Ⅳ 그대로 — node tests/common.test.js
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/fx.js', 'js/engine/attack.js']);
let ok = 0, fail = 0; const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
const F = DS.FX, A = DS.Attack;
// 로안(0 · 근접 · 베기) · 하스타(5 · 근접 · 연격) · 누아(1 · 원거리 · 마법) · 리아넬(2 · 원거리 · 바람)
check(F.commonOf(5) === 'cut' && F.commonOf(2) === 'magic', '근접 = 베기 · 원거리 = 마법');
check(F.resonates(5, 'sweep') && F.resonates(5, 'slash') && !F.resonates(5, 'orb'), '하스타: 연격 · 베기 공명 · 마법 ✕');
check(F.resonates(2, 'gale') && F.resonates(2, 'vortex') && !F.resonates(2, 'moon'), '리아넬: 바람 · 마법 공명 · 베기 ✕');
check(F.ownReso(5, 'spin') && !F.ownReso(5, 'slash') && F.commonReso(5, 'slash') && !F.commonReso(0, 'slash'), '자기 속성 / 공통 구분 (로안은 베기 = 자기 속성)');
check(A.canUlt('spin', 5) && A.canUlt('reap', 5), '자기 속성 Ⅲ · Ⅳ = 필살기');
check(!A.canUlt('slash', 5) && A.canUlt('twin', 5), '공통 특화 = Ⅳ 만 (Ⅲ 삼연 참격 ✕ · Ⅳ 쌍월 참 ○)');
check(!A.canUlt('vortex', 2) && A.canUlt('void', 2), '원거리 공통 = 마법 Ⅳ 블랙홀만');
check(A.canUlt('slash', 0) && A.canUlt('twin', 0), '로안 = 베기가 자기 속성 → Ⅲ 부터');
check(A.canTrue('reap', 5) && !A.canTrue('twin', 5) && A.canTrue('twin', 0), '진필살기 = 자기 속성 Ⅳ 만 (공통으로는 안 남)');
check(!A.canUlt('fire', 5) && !A.canUlt('pillar', 5), '다른 속성 = 공명 없음 · 필살기 없음');
console.log(fail ? `❌ 공통 특화 실패 ${fail}` : `✅ 공통 특화: 확인 ${ok}개 · 실패 0`); if (fail) process.exit(1);
