// ⏸ #117 검증: node tests/focus117.test.js  (2026-11-12 선생님 「집중 모드 = 모든 시간이 멈췄으면」)
// 몬스터 단계에서 집중을 켠 동안 = 공격 시계 · 정찰 · 수업 남은 시간 · 🦇 박쥐 20초가 그대로 · 끄면 멈춘 자리에서 이어감 (잃는 시간 없음)
const load = require('./load');
const DS = load(['js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-03.js', 'js/raid/model.js', 'js/raid/combo.js', 'js/raid/fun-ox.js']);
const L = DS.Lessons.get('set-03'), X = DS.Raid, C = DS.Combo;
let fail = 0, n = 0;
const check = (c, m) => { n++; if (!c) { fail++; console.error('FAIL:', m); } };
const S = 1000, T0 = 1_000_000;
const mi = L.steps.findIndex((s) => s.kind === 'monster'), mid = L.steps[mi].id;
const room = () => { const R = X.newRoom('777777', 'set-03', 'T', 0); R.players.u1 = { num: 1, nick: 'u1', hero: 0, at: 0 }; R.active = { u1: true }; R.state.headcount = 1;
  Object.assign(R.state, { step: mi, stepAt: T0, deadline: T0 + 50 * 60 * S, solveOn: { [mid]: { sec: 60, at: T0 } } }); return R; };
// setFocus(on/off) 와 같은 일을 state 로 (actions.setFocus 와 같은 식)
const on = (R, t) => Object.assign(R.state, { focus: true, focusAt: t, fzAt: t, cpAt: t });
const off = (R, t) => { const st = R.state, lk = X.solveLock(L, R, t), span = t - st.fzAt;
  if (lk && lk.cur > 0) st.solveOn[lk.id] = { sec: lk.sec, at: lk.t0, fx: lk.fx + lk.cur };
  Object.assign(st, { focus: false, focusAt: null, fzAt: null, pauseMs: (st.pauseMs || 0) + span, fzMs: (st.fzMs || 0) + span, cpAt: null, cpMs: (st.cpMs || 0) + (t - st.cpAt) }); };

// 1. 정찰 중 집중 30초 → 남은 정찰 그대로 · 끄면 이어서 · 끝은 30초 뒤로
{ const R = room(); const a = X.solveLock(L, R, T0 + 20 * S); check(a.on && Math.round(a.left / S) === 40, `정찰 40초 남음 ${a.left}`);
  on(R, T0 + 20 * S); const b = X.solveLock(L, R, T0 + 50 * S); check(b.on && Math.round(b.left / S) === 40 && b.frz, `집중 30초 동안 정찰 멈춤 ${b.left}`);
  const tl0 = X.timeLeft(R, T0 + 20 * S), tl1 = X.timeLeft(R, T0 + 50 * S); check(tl0 === tl1, `수업 남은 시간 멈춤 ${tl0} ${tl1}`);
  off(R, T0 + 50 * S); const c = X.solveLock(L, R, T0 + 50 * S); check(c.on && Math.round(c.left / S) === 40 && !c.frz, `끄면 이어감 ${c.left}`);
  check(X.timeLeft(R, T0 + 50 * S) === tl0, '끈 뒤 수업 남은 시간 = 켜기 전 그대로');
  check(!X.solveLock(L, R, T0 + 91 * S).on && X.solveLock(L, R, T0 + 89 * S).on, '정찰 끝 = 60 + 30초 뒤');
  // 정찰 뒤 공격 시계: 정찰(60초) + 집중(30초) 을 한 번씩만 뺌 → 정찰이 끝난 순간 t = 0
  const k = X.atkClock(L, R, T0 + 90 * S); check(k && Math.abs(k.t) < 0.01, `정찰 끝 순간 공격 시계 0 (두 번 빼지 않음) ${k && k.t}`);
  const k2 = X.atkClock(L, R, T0 + 100 * S); check(k2 && Math.abs(k2.t - 10) < 0.01, `10초 뒤 공격 시계 10 ${k2 && k2.t}`);
}
// 2. 몬스터가 나온 뒤 집중 → 공격 시계 · 남은 시간 멈춤 · 박쥐 20초 멈춤
{ const R = room(); R.state.solveOn = { [mid]: 0 };
  R.state.bat = { mid, at: T0 + 30 * S, ac: T0 + 30 * S, q: 0, n: 1 };
  const b0 = C.bat(L, R, T0 + 35 * S); check(b0.live && Math.round(b0.left / S) === 15, `박쥐 15초 남음 ${b0.left}`);
  const k0 = X.atkClock(L, R, T0 + 35 * S);
  on(R, T0 + 35 * S);
  const k1 = X.atkClock(L, R, T0 + 65 * S), b1 = C.bat(L, R, T0 + 65 * S);
  check(k1.paused && Math.abs(k1.t - k0.t) < 0.01, `집중 30초 동안 공격 시계 그대로 ${k0.t} → ${k1.t}`);
  check(b1.live && Math.round(b1.left / S) === 15, `집중 동안 박쥐 15초 그대로 ${b1.left}`);
  check(X.timeLeft(R, T0 + 65 * S) === X.timeLeft(R, T0 + 35 * S), '집중 동안 수업 남은 시간 그대로');
  off(R, T0 + 65 * S);
  const k2 = X.atkClock(L, R, T0 + 70 * S), b2 = C.bat(L, R, T0 + 70 * S);
  check(!k2.paused && Math.abs(k2.t - (k0.t + 5)) < 0.01, `끄면 이어감 (+5초) ${k2.t}`);
  check(b2.live && Math.round(b2.left / S) === 10, `박쥐 이어감 10초 ${b2.left}`);
  check(!C.bat(L, R, T0 + 81 * S).live, '박쥐 = 30초 멈춘 만큼 늦게 끝');
  check(X.deadline(R, T0 + 70 * S) === T0 + 50 * 60 * S + 30 * S && X.deadline0(R) === X.deadline(R, T0 + 70 * S), '보스 문 닫는 시각 = 30초 뒤로');
}
// 3. 개념 단계 자동 집중(fzAt 없음) = 수업 시계 그대로 (개념 설명 내내 멈추지 않게)
{ const R = room(); const ci = L.steps.findIndex((s) => s.kind === 'concept'); Object.assign(R.state, { step: ci, focus: true, focusAt: T0 });
  check(X.timeLeft(R, T0 + 60 * S) === 50 * 60 * S - 60 * S, '개념 자동 집중 = 수업 시간은 흐름');
  check(X.frozeAt(R) == null, 'fzAt 없음');
}
console.log(`${fail ? '❌' : '✅'} ⏸ #117 집중 모드 시계 ${n}개 · 실패 ${fail}`);
if (fail) process.exit(1);
