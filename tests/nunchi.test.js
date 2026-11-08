// 🙊 눈치 게임 판정 (js/raid/nunchi.js step): 동시 0.4초 · 마지막 1명 · 20초 무반응 · 생존전 3판 / 3명 이하 우승
const vm = require('vm'), fs = require('fs'), path = require('path');
const ctx = { window: {}, setInterval: () => 0, clearInterval: () => {}, console }; ctx.window.DS = {}; ctx.DS = ctx.window.DS; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/raid/nunchi.js'), 'utf8'), ctx);
const NU = ctx.DS.Nunchi; let fail = 0, ok = 0;
const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
const base = (ids, t0 = 1000) => ({ kind: 'nun', g: 1, round: 1, phase: 'play', alive: Object.fromEntries(ids.map((u) => [u, 1])), n: 1, said: {}, out: {}, done: {}, ev: [], lastAt: t0 });
// ① 혼자 누름 → n 차례로
let f = base(['a', 'b', 'c', 'd']);
f = NU.step(f, { a: 1100 }, 1700); check(f.said.a === 1 && f.n === 2, '혼자 누르면 1!');
f = NU.step(f, { a: 1100, b: 2000, c: 2300 }, 2900); check(f.out.b === 'clash' && f.out.c === 'clash' && f.n === 2, '0.3초 차이 = 동시 · 숫자 그대로');
check(f.out.d === 'last' && f.phase === 'show', '혼자 남으면 마지막 탈락 · 판 끝');
// ② 0.4초 넘게 떨어지면 따로
f = NU.step(base(['a', 'b', 'c', 'd', 'e']), { a: 1100, b: 1600 }, 2300); check(f.said.a === 1 && f.said.b === 2, '0.5초 차이 = 각각 성공');
// ③ 창이 안 닫혔으면 기다림
check(NU.step(base(['a', 'b', 'c']), { a: 1100 }, 1300) === null, '0.4초 창 안에서는 판정 안 함');
// ④ 시작 전에 누른 것 무시 · 판에 없는 사람 무시
f = NU.step(base(['a', 'b', 'c']), { a: 500, z: 1200 }, 2000); check(f === null, '시작 전 입력 · 판 밖 사람 무시');
// ⑤ 20초 무반응 → 남은 사람 모두 탈락
f = NU.step(base(['a', 'b', 'c']), {}, 1000 + 20001); check(f.out.a === 'time' && f.out.c === 'time' && f.phase === 'show', '20초 무반응');
// ⑥ 생존전: 판 끝 → 생존 4명이면 다음 판 · 3명 이하면 우승
let s = { ...base(['a', 'b', 'c', 'd', 'e', 'f']), phase: 'show', to: 100, said: { a: 1, b: 2, c: 3, d: 4 }, out: { e: 'clash', f: 'clash' } };
let nx = NU.step(s, {}, 200); check(nx.phase === 'ready' && nx.round === 2 && Object.keys(nx.alive).join() === 'a,b,c,d', '생존 4명 → 2판');
s = { ...s, said: { a: 1, b: 2 }, out: { c: 'x', d: 'x', e: 'x', f: 'x' } }; nx = NU.step(s, {}, 200); check(nx.phase === 'end' && nx.win.join() === 'a,b', '3명 이하 → 우승');
s = { ...s, round: 3, said: { a: 1, b: 2, c: 3, d: 4, e: 5 }, out: { f: 'x' } }; nx = NU.step(s, {}, 200); check(nx.phase === 'end' && nx.win.length === 5, '3판 끝 → 남은 사람 모두 우승');
console.log(fail ? `❌ 눈치 게임 실패 ${fail}` : `✅ 눈치 게임: 확인 ${ok}개 · 실패 0`); if (fail) process.exit(1);
