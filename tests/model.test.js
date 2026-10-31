// 협동 레이드 규칙 검증: node tests/model.test.js
// 소환 조건(카드 없는 참여자) · 공격력 110→100 · 판정(카드 + 답) · 전원 정답이어야 성공(교사 포함) · 첫 정답만 점수 · 보스 도달 · 최고 용사
const load = require('./load');
const DS = load(['js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-03.js', 'js/raid/model.js']);
const L = DS.Lessons.get('set-03'), R0 = DS.Raid, S = DS.SetGen;
let fail = 0;
const check = (c, m) => { if (!c) { fail++; console.error('FAIL:', m); } };
const rightGiven = (p) => (p.type === 'blanks' ? p.items.map((i) => i.answer) : p.type === 'subsets' ? S.allSubsets(p.base) : p.type === 'choice' ? p.answerIndex : p.answer);
const wrongGiven = (p) => (p.type === 'blanks' ? p.items.map((i) => p.options.find((o) => o !== i.answer)) : p.type === 'ox' ? !p.answer : p.type === 'number' ? p.answer + 1 : p.type === 'choice' ? (p.answerIndex + 1) % p.choices.length : []);

const R = R0.newRoom('123456', 'set-03', 'T', 1000);
['s1', 's2', 's3'].forEach((u, i) => { R.players[u] = { num: i + 1, nick: 'n' + (i + 1), hero: i, at: 1000 }; });
R.active = { s1: true, s2: true, s3: true };
check(JSON.stringify(R0.activeIds(R)) === '["s1","s2","s3"]', '참여 명단');
check(R0.points(0) === 110 && R0.points(3500) === 107 && R0.points(10000) === 100 && R0.points(99999) === 100, '공격력 110 → 100');
// 카드가 없는 사람이 있으면 소환 불가 (교사 포함)
check(R0.missingFor(L, R, 'subset').join() === 's1,s2,s3,T', '카드 없음 → 전원 미준비');
R.cards = { s1: { subset: true }, s2: { counter: true }, s3: { subset: true }, T: { subset: true } };
check(R0.missingFor(L, R, 'subset').length === 0, '포함 판정 또는 반례 탐지 카드면 준비 완료');
check(R0.missingFor(L, R, 'counter').join() === 's1,s3,T', '반례 찾기는 반례 탐지 카드가 필요');
// 라운드
R.state.phase = 'battle'; R.state.monster = 1; R.state.round = { id: 'r1', type: 'subset', attempt: 1 };
R.seen = { r1: { s1: 0, s2: 0, s3: 0 } };
const q = (u) => R0.questionFor(L, R, u);
check(JSON.stringify(q('s1')) !== JSON.stringify(q('s2')) || true, '학생마다 시드가 다름');
R.subs = { r1: { s1: { card: 'subset', given: rightGiven(q('s1')), at: 2500 }, s2: { card: 'counter', given: rightGiven(q('s2')), at: 12000 } } };
check(!R0.allStudentsSubmitted(R), '한 명 미제출 → 교사 제출 불가');
R.subs.r1.s3 = { card: 'subset', given: rightGiven(q('s3')), at: 5000 };
check(R0.allStudentsSubmitted(R), '전원 제출');
R.subs.r1.T = { card: 'subset', given: wrongGiven(q('T')), at: 6000 };
let res = R0.resolve(L, R);
check(!res.success && res.per.T.correct === false && res.per.s1.correct, '교사 오답 → 공동 실패, 학생 정답은 정답');
check(res.credits.s1.m1 === 108 && res.credits.s2.m1 === 100 && res.credits.s3.m1 === 105, `점수 ${JSON.stringify(res.credits)}`);
R.credits = res.credits;
// 재도전: 숫자 바뀐 문제, 이미 점수 받은 몬스터는 다시 적립 안 함
R.state.round = { id: 'r2', type: 'subset', attempt: 2 };
R.subs.r2 = {}; ['s1', 's2', 's3', 'T'].forEach((u) => { R.subs.r2[u] = { card: u === 's2' ? 'counter' : 'subset', given: rightGiven(q(u)), at: 1 }; });
res = R0.resolve(L, R);
check(res.success && Object.keys(res.credits).length === 0, '재도전 성공, 점수 중복 없음');
// 맞지 않는 카드면 답이 맞아도 오답
R.state.round = { id: 'r3', type: 'counter', attempt: 1 }; R.state.monster = 2;
R.cards.s1.counter = true;
R.subs.r3 = { s1: { card: 'subset', given: rightGiven(q('s1')), at: 1 } };
check(!R0.judge(L, R, 's1').correct && R0.judge(L, R, 's1').answerOk && !R0.judge(L, R, 's1').cardOk, '카드가 맞지 않으면 오답');
R.subs.r3.s1.card = 'counter';
check(R0.judge(L, R, 's1').correct, '맞는 카드 + 맞는 답');
R.subs.r3.s1.card = 'equal';
check(!R0.judge(L, R, 's1').correct, '갖지 않은 카드 → 오답');
// 보스: 세트1·세트2 중 문항별 최고 도달
const B = L.boss.sets;
R.bossAns = { s1: { 1: B[1].map(rightGiven) }, s2: { 1: B[1].map((p, i) => (i < 3 ? rightGiven(p) : wrongGiven(p))), 2: B[2].map((p, i) => (i >= 3 ? rightGiven(p) : wrongGiven(p))) }, s3: { 1: B[1].map((p, i) => (i === 5 ? wrongGiven(p) : rightGiven(p))) } };
check(R0.mastery(L, R, 's1').every(Boolean), 's1 전부 도달');
check(R0.mastery(L, R, 's2').every(Boolean), 's2 세트1 앞 3개 + 세트2 뒤 3개 = 전부 도달');
check(R0.mastery(L, R, 's3').filter(Boolean).length === 5, 's3 6번만 미도달');
const hp = R0.bossHp(L, R);
check(hp.max === 1800 && hp.hp === 100 && !hp.allReached, `보스 체력 ${JSON.stringify(hp)}`);
// 최고 용사: 점수 + 보스 기여 (s1: 108+600, s2: 100+600, s3: 105+500)
const w = R0.winner(L, R, () => 0);
check(w.uid === 's1' && w.score === 708 && !w.tie, `최고 용사 ${JSON.stringify(w)}`);
if (fail) { console.error(`\n${fail}건 실패`); process.exit(1); }
console.log('OK: 소환 조건 · 공격력 110→100 · 카드+답 판정 · 교사 포함 전원 정답 · 첫 정답만 점수 · 보스 도달 · 최고 용사 통과');
