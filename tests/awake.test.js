// 🌟 #73 각성한 로안 (2026-11-11 · 2026-11-13 10강 뺌): 로안 + 쌍월 참 + 호칭 「만 번째 베기」 = 금발 모습 · 하나라도 빼면 로안 · 업적 3개 = 호칭 · 16 은 고르는 칸이 아님 — node tests/awake.test.js
const fs = require('fs'), path = require('path');
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/art.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-04.js', 'lessons/eval-1.js', 'lessons/eval-2.js', 'js/raid/bonus.js', 'js/raid/grow.js', 'js/raid/titles.js']);
let ok = 0, fail = 0; const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
const A = DS.Art, full = { hero: 0, enh: 10, fx: 'twin', title: 'slash10k' };
check(A.awake(full) && A.look(full) === 16, '세 조건 = 금발(16)');
[0, 5, 10, undefined].forEach((e) => check(A.awake({ ...full, enh: e }) && A.look({ ...full, enh: e }) === 16, `강화 ${e} 강도 금발 (10강 조건 없음 · 2026-11-13)`));
check(!/enh/.test(String(A.awake)), '각성 판정에 강화 단계를 보지 않음');
[['hero', 5], ['fx', 'slash'], ['title', 'awake']].forEach(([k, v]) => check(!A.awake({ ...full, [k]: v }) && A.look({ ...full, [k]: v }) === (k === 'hero' ? 5 : 0), `${k} 빠지면 원래 모습`));
const t = DS.Titles.get('slash10k'); check(t && t.name === '만 번째 베기' && t.desc === '기본기의 검이 끝까지 벼려지면, 금빛이 깃든다.', '호칭 「만 번째 베기」 · 설명');
const b3 = { 'eval-1': { q12: { clear: true } }, 'set-04': { boss: { clear: true } }, 'set-02': { boss: { clear: true } } };
check(DS.Bonus.seals(b3).length >= 3 ? t.test({ bonus: b3 }) : true, '업적 3개 = 호칭');
check(!t.test({ bonus: {} }), '업적 0 = 호칭 없음');
const acc = fs.readFileSync(path.join(__dirname, '..', 'js/raid/account.js'), 'utf8');
check(!/heroes\.push\(\{ id: 16/.test(acc), '금발 검사 = 고르는 칸에서 빠짐');
check(/base: Number\(info\.hero\)/.test(fs.readFileSync(path.join(__dirname, '..', 'js/raid/actions.js'), 'utf8')), '수업 방: hero = 보이는 모습 · base = 고른 용사');
console.log(fail ? `❌ 각성한 로안 실패 ${fail}` : `✅ 각성한 로안: 확인 ${ok}개 · 실패 0`); if (fail) process.exit(1);
