// ⌨ #92 룬 키패드 (2026-11-11): 숫자 답 입력 = DS.UI.runeNext (순수 계산) · runeHtml (답 자리 수를 미리 보여 주지 않음 · 빈 칸 = 「숫자를 넣어 주세요」)
const assert = require('assert');
const DS = require('./load')(['js/engine/ui.js']);
const U = DS.UI, seq = (keys, v = null) => keys.reduce((c, k) => U.runeNext(c, k), v);
assert.strictEqual(seq([1, 8]), 18, '1 · 8 → 18');
assert.strictEqual(seq([7]), 7);
assert.strictEqual(seq([0]), 0, '0 하나 = 0 (답이 0 인 문제)');
assert.strictEqual(seq([0, 7]), 7, '0 다음 7 = 7 (07 ✕)');
assert.strictEqual(seq([9, 9, 5]), 99, '세 자리는 받지 않음 (0~99)');
assert.strictEqual(seq([1, 2, 'x']), 1, '⌫ = 끝 자리 지움');
assert.strictEqual(seq([5, 'x']), null, '다 지우면 빈 칸(null) → 공격 잠김');
assert.strictEqual(seq(['x']), null, '빈 칸에서 ⌫ = 그대로');
assert.strictEqual(seq([3], 12), 12, '이미 두 자리면 더 받지 않음');
const h0 = U.runeHtml(0, null), h1 = U.runeHtml(2, 18);
assert.ok(/숫자를 넣어 주세요/.test(h0) && /rune-slot empty/.test(h0), '빈 칸 안내');
assert.ok(!/_/.test(h0), '답 자리 수(_ _)를 미리 보여 주지 않음');
for (let n = 0; n <= 9; n++) assert.ok(h0.includes(`data-rune="0|${n}"`), `룬 ${n}`);
assert.ok(h0.includes('data-rune="0|x"'), '⌫');
assert.ok(/data-rv="2"[^>]*>18</.test(h1), '값이 새겨짐');
assert.ok(!U.dial, '옛 다이얼은 없앰 (모든 곳 = 룬)');
console.log('✔ rune.test (룬 키패드)');
// #97 문제 창: 4자리 · − 룬
{ const q = (keys, o) => keys.reduce((c, k) => U.runeNext(c, k, o), null), o4 = { len: 4 };
  assert.strictEqual(q([1, 2, 3, 4, 5], o4), 1234, '4자리까지');
  assert.strictEqual(q(['m', 7], o4), -7, '− 7 = −7'); assert.strictEqual(q(['m'], o4), '-', '− 만 = 아직 숫자 아님');
  assert.strictEqual(q(['m', 'x'], o4), null, '− 지우기 = 빈 칸'); assert.strictEqual(q([1, 2, 'm'], o4), -12, '숫자 뒤 − = 부호만 바뀜');
  assert.strictEqual(q(['m', 3, 'x'], o4), '-', '−3 ⌫ = −');
  assert.ok(/data-rune="0\|m"/.test(U.runeHtml(0, null, { neg: true })) && !/data-rune="0\|m"/.test(U.runeHtml(0, null)), '− 룬 = 음수 답 문제만'); }
console.log('✔ rune.test #97 (문제 창 4자리 · −)');
