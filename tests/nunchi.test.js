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
f = NU.step(base(['a', 'b', 'c']), {}, 1000 + 20001); check(f.out.a === 'zz' && f.out.c === 'zz' && f.zz.a && f.phase === 'show', '20초 무반응 = 💤 관전 (#57 ⑫ · 탈락 아님)');
{ let h = base(['a', 'b', 'c', 'd', 'e', 'f']); h = NU.step(h, { b: 1100 }, 1700); h = NU.step(h, { b: 1100, c: 2100 }, 2700); h = NU.step(h, { b: 1100, c: 2100, d: 3100 }, 3700); h = NU.step(h, { b: 1100, c: 2100, d: 3100, f: 4100 }, 4700);
  h = NU.step(h, { b: 1100, c: 2100, d: 3100, f: 4100 }, 4100 + 20001); check(h.out.a === 'zz' && h.out.e === 'zz' && h.phase === 'show', '4명 외치고 2명 20초 무반응 → 2명 💤');
  const g = NU.step(h, {}, h.to + 1, { a: { e: '🙋', at: h.to } }); check(g.round === 2 && g.alive.a && g.alive.b && !g.alive.e && !g.zz.a && g.zz.e, '💤 → 🙋 다음 판 참여 누르면 다음 판부터 · 안 누르면 그대로 관전'); }
// ⑥ 생존전: 판 끝 → 생존 4명이면 다음 판 · 3명 이하면 우승
let s = { ...base(['a', 'b', 'c', 'd', 'e', 'f']), phase: 'show', to: 100, said: { a: 1, b: 2, c: 3, d: 4 }, out: { e: 'clash', f: 'clash' } };
let nx = NU.step(s, {}, 200); check(nx.phase === 'ready' && nx.round === 2 && Object.keys(nx.alive).join() === 'a,b,c,d', '생존 4명 → 2판');
s = { ...s, said: { a: 1, b: 2 }, out: { c: 'x', d: 'x', e: 'x', f: 'x' } }; nx = NU.step(s, {}, 200); check(nx.phase === 'end' && nx.win.join() === 'a,b', '3명 이하 → 우승');
s = { ...s, round: 3, said: { a: 1, b: 2, c: 3, d: 4, e: 5 }, out: { f: 'x' } }; nx = NU.step(s, {}, 200); check(nx.phase === 'end' && nx.win.length === 5, '3판 끝 → 남은 사람 모두 우승');
// ⑦ 🐞 11/13 「자고 있으면 빠르게 제외」: 연결이 끊긴(폰이 잠든) 학생 = 20초 기다리지 않고 바로 💤
{ let h = base(['a', 'b', 'c', 'd', 'e']); const on = { a: true, b: true, c: true }; // d · e = 끊김
  h = NU.step(h, { a: 1100 }, 1700, null, on); check(h.out.d === 'zz' && h.out.e === 'zz' && h.zz.d && !h.out.b, '끊긴 학생 = 그 자리에서 💤 (깨어 있는 b · c 는 그대로)');
  h = NU.step(h, { a: 1100, b: 2100 }, 2700, null, on); check(h.out.c === 'last' && h.phase === 'show' && h.said.b === 2, '남은 깨어 있는 1명 = ⌛ 마지막 · 20초 안 기다리고 판 끝');
  const g = NU.step(base(['a', 'b', 'c']), { a: 1100 }, 1700, null, { a: true, b: true, c: true }); check(!g.out.b && !g.out.c, '모두 연결 = 예전과 같음');
  check(NU.step(base(['a', 'b', 'c']), {}, 1700, null, null) === null, 'online 정보가 없으면 예전과 같음'); }
console.log(fail ? `❌ 눈치 게임 실패 ${fail}` : `✅ 눈치 게임: 확인 ${ok}개 · 실패 0`); if (fail) process.exit(1);
