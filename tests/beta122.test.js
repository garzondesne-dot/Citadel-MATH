// 🧪 #122 검증: node tests/beta122.test.js  (2026-11-12 선생님 「1-6반은 베타 테스트로 · 진짜 학생 입장으로 · 한 명」)
// tester/{반}/_all = true → 그 반 = 시험 계정처럼 통계 · 반 비교 · 설문 집계 · 다른 반 대항전 · 체력 머릿수에서 빠짐 · 게임 규칙 · 보상은 그대로
const load = require('./load');
const DS = load(['js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-03.js', 'js/raid/model.js', 'js/raid/combo.js', 'js/raid/account.js']);
const A = DS.Account, C = DS.Combo, X = DS.Raid;
let fail = 0, n = 0;
const check = (c, m) => { n++; if (!c) { fail++; console.error('FAIL:', m); } };
(async () => {
  const T = { '1-6': { _all: true }, '1-3': { 7: true } };
  check(A.BETA === '_all' && A.isBetaOf(T, '1-6') && !A.isBetaOf(T, '1-3') && !A.isBetaOf(T, '1-1'), '베타 반 = 1-6 만');
  check(A.betaKeys(T).join() === '1-6', 'betaKeys');
  // 학생 한 명 판정 (설문 집계): 베타 반 전원 · 개인 시험 계정
  DS.Net = { get: async (p) => { const [, c] = p.split('/'); return T[c] || null; } };
  check(await A.testerOf('1-6', 12) === true && await A.testerOf('1-3', 7) === true && await A.testerOf('1-3', 8) === false && await A.testerOf('1-1', 1) === false, 'testerOf = 개인 시험 계정 또는 베타 반');
  // 대항전: 다른 반 화면에서 1-6 빠짐 · 1-6 자기 화면에서는 보임
  const all = { 'set-03': { '1-1': { s: 500 }, '1-6': { s: 900 }, '1-3': { s: 700 } } };
  const for11 = C.noBeta(all, ['1-6'], '1-1'), for16 = C.noBeta(all, ['1-6'], '1-6');
  check(!for11['set-03']['1-6'] && for11['set-03']['1-3'] && for11['set-03']['1-1'], '1-1 화면 = 1-6 빠짐');
  check(!!for16['set-03']['1-6'] && Object.keys(for16['set-03']).length === 3, '1-6 자기 화면 = 그대로');
  check(C.noBeta(all, [], '1-1') === all, '베타 반 없음 = 그대로');
  const b11 = C.board(for11, 'set-03', '1-1'); check(b11.rows ? !b11.rows.some((r) => r.cls === '1-6') : true, '순위표에 1-6 없음');
  // 게임 안: 베타 반 학생 = 입장 때 tester 표시 → 체력 머릿수에서 빠짐 (최소 1명분 · 선생님 혼자 돌 때 1명분)
  const R = { players: { a: { tester: true } }, active: { a: true }, state: {} };
  check(X.headcount(R) === 1, '베타 반 혼자 = 머릿수 1명분');
  console.log(`${fail ? '❌' : '✅'} 🧪 #122 베타 반 ${n}개 · 실패 ${fail}`);
  if (fail) process.exit(1);
})();
