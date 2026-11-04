// 📝 수업 설문 검증 (v0.9.8.2): node tests/survey.test.js
// (1) 응답 확인(7 문장 × 전 · 지금 1~5, 도움 1~2개, 비교 1개) (2) 저장 = 이름 · 번호 · 시각 없음 · 무작위 키 · 한 번만 · +5 EXP
// (3) 집계(평균 · 변화 · 오름/같음/내림 · 도움 · 비교 · 서술) · CSV (4) 규칙: 교사만 열기 · 열렸을 때만 새 응답 · 응답은 교사만 읽기
const load = require('./load');
const DS = load(['js/raid/words.js', 'js/raid/grow.js', 'js/raid/survey.js']);
let fail = 0;
const check = (c, m) => { if (!c) { fail++; console.error('FAIL:', m); } };
const S = DS.Survey;
const full = (pre, now) => ({ r: S.PAIR.map(() => [pre, now]), pick: [0, 4], cmp: 0, say: '틀린 걸 다시 풀게 됐다', want: '' });

// ── 1. 확인 ──
check(S.PAIR.length === 7 && S.PICKS.length === 6 && S.CMP.length === 3, '문항 수 7 · 6 · 3');
check(S.check(full(2, 4)) === '', '모두 답하면 통과');
const a1 = full(2, 4); a1.r[3] = [2, 0]; check(/4번/.test(S.check(a1)), `빠진 문장 번호 (${S.check(a1)})`);
const a2 = full(2, 4); a2.pick = []; check(/8번/.test(S.check(a2)), '도움 0개 = 막힘');
const a3 = full(2, 4); a3.pick = [1, 2, 3]; check(S.check(a3) !== '', '도움 3개 = 막힘');
const a4 = full(2, 4); a4.pick = [1, 1]; check(S.check(a4) !== '', '같은 것 두 번 = 막힘');
const a5 = full(2, 4); a5.cmp = -1; check(/9번/.test(S.check(a5)), '비교 안 고름 = 막힘');
const a6 = full(2, 6); check(S.check(a6) !== '', '6점 = 막힘');
// 서술: 100자 · 욕설 가림
const c1 = S.clean(Object.assign(full(1, 5), { say: '가'.repeat(150), want: '이거 존나 어려움' }), 7);
check(c1.say.length === 100 && !/존나/.test(c1.want) && c1.no === 7, `서술 100자 · 가림 (${c1.say.length} · ${c1.want})`);
check(Object.keys(c1).sort().join() === 'cmp,no,pick,r,say,want', `저장 칸에 이름 · 번호 · 시각 없음 (${Object.keys(c1)})`);
check(DS.Words.clean('가'.repeat(30)).text.length === 20, '마지막 한마디는 그대로 20자');

// ── 2. 저장 (가짜 서버) ──
const db = {};
DS.Net = { set: async (p, v) => { db[p] = v; }, get: async (p) => (p in db ? db[p] : Object.keys(db).some((k) => k.startsWith(p + '/')) ? Object.fromEntries(Object.keys(db).filter((k) => k.startsWith(p + '/') && !k.slice(p.length + 1).includes('/')).map((k) => [k.slice(p.length + 1), db[k]])) : null), TS: 1, watch: () => () => {} };
(async () => {
  const m = { c: '1-3', n: 5, name: '홍길동' };
  await S.submit(m, full(2, 4), 7);
  const keys = Object.keys(db);
  const ak = keys.filter((k) => k.startsWith('surveyA/1-3/'));
  check(ak.length === 1 && /^surveyA\/1-3\/[a-z2-9]{16}$/.test(ak[0]), `무작위 키 (${ak})`);
  check(!JSON.stringify(db[ak[0]]).includes('홍길동') && !('n' in db[ak[0]]) && !('at' in db[ak[0]]), '응답에 이름 · 번호 · 시각 없음');
  check(db['surveyDone/1-3/5'] === true, '응답 표시 = true 만');
  await new Promise((r) => setTimeout(r, 10));
  check(db['xp/1-3/5/log/survey'] && db['xp/1-3/5/log/survey'].xp === 5 && db['xp/1-3/5/total'] === 5, '+5 EXP (한 번)');
  let again = ''; try { await S.submit(m, full(3, 3), 7); } catch (e) { again = e.message; }
  check(/이미/.test(again) && Object.keys(db).filter((k) => k.startsWith('surveyA/')).length === 1, '두 번째 응답 막힘');

  // ── 3. 집계 · CSV ──
  const list = [full(2, 4), full(3, 3), Object.assign(full(4, 2), { pick: [0], cmp: 2, say: '' })];
  const sm = S.summary(list);
  check(sm.n === 3 && sm.pairs[0].pre === 3 && sm.pairs[0].now === 3 && sm.pairs[0].diff === 0, `평균 (${JSON.stringify(sm.pairs[0])})`);
  check(sm.pairs[0].up === 1 && sm.pairs[0].same === 1 && sm.pairs[0].down === 1, '오름 / 같음 / 내림');
  check(sm.picks[0].n === 3 && sm.picks[4].n === 2 && sm.cmp[0].n === 2 && sm.cmp[2].n === 1, '도움 · 비교 개수');
  check(sm.say.length === 2 && sm.want.length === 0, '빈 서술은 빼고');
  const rows = S.csvRows({ '1-3': list.map((a) => S.clean(a, 7)) });
  check(rows.length === 4 && rows[0].length === 2 + 14 + 5 && rows[1][0] === '1-3' && rows[1][2] === 2 && rows[1][3] === 4 && rows[1][16] === '재도전', `CSV (${rows[1].slice(0, 4)} · ${rows[1][16]})`);
  check(!rows[0].some((h) => /이름|번호/.test(h)), 'CSV 에 이름 · 번호 칸 없음');

  // ── 4. 규칙 ──
  const rules = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'firebase/database.rules.json'), 'utf8')).rules;
  check(/admins/.test(rules.survey.$c['.write']), '설문 열기 · 닫기 = 교사만');
  check(/admins/.test(rules.surveyA.$c['.read']) && !rules.surveyA['.read'], '응답 읽기 = 교사만');
  check(/survey\/'\+\$c\+'\/open/.test(rules.surveyA.$c.$k['.write']) && /!data\.exists\(\)/.test(rules.surveyA.$c.$k['.write']), '열려 있을 때만 · 새로 쓰기만');
  check(/accounts/.test(rules.surveyDone.$c.$n['.write']) && /newData\.val\(\) === true/.test(rules.surveyDone.$c.$n['.write']), '응답 표시 = 본인 계정 · true');
  console.log(fail ? `❌ ${fail}개 실패` : '✅ 설문 시험 모두 통과');
  process.exit(fail ? 1 : 0);
})();
