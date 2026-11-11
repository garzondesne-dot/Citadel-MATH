// 🪜 #96 개편 환불 계획 (tools/auto/refund96.js planOf · 운영 DB 안 닿음) — node tests/refund96.test.js
const assert = require('assert');
const { planOf } = require('../tools/auto/refund96.js');
// 옛 구매: 용사 18(💎 60) · 스킬 twin(💎 80 · 📜 3) · 개편 뒤 구매 gale(v 96) · 도감으로 이미 돌려받은 용사 8
const d = { total: 5, scroll: 1, buy: { hero_18: 1, fx_twin: 1, fx_gale: 1, hero_8: 1 }, log: { buy_hero_18: { g: -60 }, buy_fx_twin: { g: -80, s: -3 }, buy_fx_gale: { g: -20, v: 96 }, buy_hero_8: { g: -60 }, refund_hero_8: { g: 60 } } };
const p = planOf(d, { hero: 18, fx: 'twin', socket: { 18: 'claw', 0: 'twin', 2: 'gale' } });
assert.deepStrictEqual(p.items.map((x) => x.k).sort(), ['fx_twin', 'hero_18'], '돌려줄 것 = 옛 용사 · 옛 스킬만 (개편 뒤 구매 · 도감 환불 용사 빼고)');
assert.strictEqual(p.g, 140); assert.strictEqual(p.s, 3, '낸 💎 · 📜 100%');
assert.strictEqual(p.acc.hero, 0, '끼운 용사가 잠기면 0번'); assert.strictEqual(p.acc.fx, 'cut', '스킬 = 0번 사다리 Ⅰ');
assert.ok(p.acc['socket/18'] === null && p.acc['socket/0'] === null && !('socket/2' in p.acc), '잠긴 용사 칸 · 돌려준 스킬 칸만 비움');
assert.strictEqual(planOf({ buy: { fx_gale: 1 }, log: { buy_fx_gale: { g: -20, v: 96 } } }, { hero: 2 }), null, '개편 뒤 구매만 = 할 일 없음 (두 번 돌려도 안전)');
const q = planOf({ buy: { fx_moon: 1 }, log: { buy_fx_moon: { g: -20 } } }, { hero: 0, fx: 'cut' });
assert.ok(q.g === 20 && q.acc.hero == null && q.acc.fx == null, '용사 그대로 · 끼운 스킬이 돌려준 것이 아니면 그대로');
console.log('✔ refund96.test (개편 환불 계획)');
