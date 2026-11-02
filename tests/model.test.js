// 레이드 규칙 검증: node tests/model.test.js
// 체력 = ⌊대기실 인원 × 소문제 수 × 기준%⌋ · 데미지 = 가장 많이 맞힌 수(늘어난 만큼만) · 재도전 3번 · 체력 0 이 되면 즉시 격파 (v0.9.2)
// 미제출 제외 · 기준% 실시간 조정 · 보스 체력(1~6번) + 7번 보너스 · 체력 0 즉시 승리 · 도움 필요 목록
const load = require('./load');
const DS = load(['js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-03.js', 'js/raid/model.js']);
const L = DS.Lessons.get('set-03'), X = DS.Raid, S = DS.SetGen;
let fail = 0;
const check = (c, m) => { if (!c) { fail++; console.error('FAIL:', m); } };
const right = (p) => (p.type === 'blanks' ? p.items.map((i) => i.answer) : p.type === 'subsets' ? S.allSubsets(p.base) : p.type === 'choice' ? p.answerIndex : p.answer);
const wrong = (p) => (p.type === 'blanks' ? p.items.map((i) => p.options.find((o) => o !== i.answer)) : p.type === 'number' ? p.answer + 1 : p.type === 'choice' ? (p.answerIndex + 1) % p.choices.length : p.type === 'multi' ? [] : null);
// k개만 맞힌 답
const answer = (R, mid, u, a, k) => X.itemsFor(L, R, mid, u, a).map((q, i) => (i < k ? right(q) : wrong(q)));

const R = X.newRoom('123456', 'set-03', 'T', 1000);
const ids = Array.from({ length: 18 }, (_, i) => `s${String(i + 1).padStart(2, '0')}`);
ids.forEach((u, i) => { R.players[u] = { num: i + 1, nick: 'n' + (i + 1), hero: 0, at: 1000 }; });
check(X.isLobby(R) && !X.stepOf(L, R), '처음은 대기실');
R.active = Object.fromEntries(ids.map((u) => [u, true]));
R.state.headcount = 18; R.state.step = 2; R.state.stepAt = 0; // 문제1 (4칸)
check(X.stepOf(L, R).id === 'm1', '3번째 단계 = 문제1');

// 체력: 18 × 4 × 90% = 64.8 → 64
let hp = X.monsterHp(L, R, 'm1');
check(hp.max === 64 && hp.left === 64 && hp.pct === 90 && hp.items === 4, `문제1 체력 ${JSON.stringify(hp)}`);
check(X.monsterHp(L, R, 's1').max === 48 && X.monsterHp(L, R, 'm3').max === 97 && X.monsterHp(L, R, 's2').max === 64, '체력 예시 (보강1 48 · 문제3 97 · 보강2 64)');
R.meta.pct = 80; check(X.monsterHp(L, R, 'm1').max === 57, '수업 준비 기본값 80% → 57'); delete R.meta.pct;

// 데미지 = 맞힌 소문제 수, 재도전은 늘어난 만큼만 (= 가장 많이 맞힌 시도)
R.subs = { m1: { s01: { 0: answer(R, 'm1', 's01', 0, 3) } } };
let rec = X.record(L, R, 'm1', 's01');
check(rec.best === 3 && rec.canRetry && X.resultLabel(rec.last) === 'partial', `부분 성공 3/4 ${JSON.stringify({ best: rec.best, canRetry: rec.canRetry })}`);
R.subs.m1.s01[1] = answer(R, 'm1', 's01', 1, 2);
check(X.record(L, R, 'm1', 's01').best === 3, '재도전에서 덜 맞혀도 데미지는 줄지 않음');
R.subs.m1.s01[2] = answer(R, 'm1', 's01', 2, 4);
rec = X.record(L, R, 'm1', 's01');
check(rec.best === 4 && rec.canRetry && rec.perfectAt === 2 && !rec.practice && X.resultLabel(rec.last) === 'success', '두 번째 재도전 4/4 → 데미지 4 (늘어난 1만 더해짐), 남은 기회 1번은 연습 공격');
check(JSON.stringify(X.itemsFor(L, R, 'm1', 's01', 1)) !== JSON.stringify(X.itemsFor(L, R, 'm1', 's01', 0)), '재도전은 숫자가 바뀐 문제');
R.subs.m1.s02 = { 0: answer(R, 'm1', 's02', 0, 4) };
// v0.9.2 연습 공격: 다 맞혀도 남은 기회만큼 숫자 바뀐 문제 · 데미지는 그대로(0 추가)
check(X.record(L, R, 'm1', 's02').canRetry && X.record(L, R, 'm1', 's02').perfectAt === 0, '다 맞혀도 연습 공격 가능');
R.subs.m1.s02[1] = answer(R, 'm1', 's02', 1, 1); R.subs.m1.s02[2] = answer(R, 'm1', 's02', 2, 4); R.subs.m1.s02[3] = answer(R, 'm1', 's02', 3, 0);
rec = X.record(L, R, 'm1', 's02');
check(rec.best === 4 && rec.practice && !rec.canRetry && rec.tries.length === 4, `연습 3번(1/4 · 4/4 · 0/4) 뒤에도 데미지 4 그대로 · 기회 4번 끝 ${JSON.stringify({ best: rec.best, practice: rec.practice })}`);
R.subs.m1.s03 = { 0: answer(R, 'm1', 's03', 0, 0) };
check(X.resultLabel(X.record(L, R, 'm1', 's03').last) === 'fail', '0개 = 공격 실패');
check(X.monsterHp(L, R, 'm1').dmg === 8, '데미지 합 4 + 4 + 0');

// v0.9.2: 체력이 0 이 되면 전원 제출 전이라도 그 자리에서 격파 (안 낸 학생은 계속 풀고 공격할 수 있음)
ids.slice(3).forEach((u) => { R.subs.m1[u] = { 0: answer(R, 'm1', u, 0, 4) }; }); // 15명 × 4 = 60, 합 68
R.subs.m1.s18 = undefined; delete R.subs.m1.s18; // 1명 미제출
hp = X.monsterHp(L, R, 'm1');
check(hp.left === 0 && X.cleared(L, R, 'm1') && X.waiting(L, R, 'm1').join() === 's18', `체력 0 → s18 미제출이어도 격파 ${JSON.stringify(hp)}`);
check(X.record(L, R, 'm1', 's18').submitted === false && !X.cleared(L, X.newRoom('9', L.id, 'T', 0, 90), 'm1'), '격파 뒤에도 s18 은 아직 제출 전 · 인원 0 인 방은 격파 아님');
R.state.skip = { m1: { s18: true } };
check(X.cleared(L, R, 'm1'), '미제출 학생 제외 → 격파');
delete R.state.skip;
R.subs.m1.s18 = { 0: answer(R, 'm1', 's18', 0, 4) };
check(X.cleared(L, R, 'm1'), '전원 제출 + 체력 0 → 격파');

// 전원 제출했지만 체력이 남으면 → 교사가 기준% 를 낮춰 해결
R.state.step = 5; // 문제2 (3칸): 체력 48
R.subs.m2 = Object.fromEntries(ids.map((u, i) => [u, { 0: answer(R, 'm2', u, 0, i < 10 ? 3 : 1) }])); // 30 + 8 = 38
check(X.allSubmitted(L, R, 'm2') && !X.cleared(L, R, 'm2') && X.monsterHp(L, R, 'm2').left === 10, '전원 제출, 체력 10 남음');
R.state.pct = { m2: 70 }; // 18 × 3 × 70% = 37.8 → 37
check(X.monsterHp(L, R, 'm2').max === 37 && X.cleared(L, R, 'm2'), '기준% 70 으로 낮추면 격파 (몬스터마다 따로)');
check(X.monsterHp(L, R, 'm1').pct === 90, '다른 몬스터 기준%는 그대로');

// 보스: 체력 = 18 × 6 × 90% = 97.2 → 97, 7번은 보너스 데미지
R.state.step = 9; R.state.pct = {};
const B = L.boss.sets;
const bossAns = (k, bonus) => B[1].map((q, i) => ((i < k || (i === 6 && bonus)) ? right(q) : wrong(q)));
R.bossAns = {};
ids.forEach((u, i) => { R.bossAns[u] = { 1: bossAns(5, i < 4) }; }); // 18 × 5 = 90, 보너스 4 → 94
let bh = X.bossHp(L, R);
check(bh.max === 97 && bh.dmg === 94 && bh.left === 3 && !bh.won, `보스 ${JSON.stringify(bh)}`);
R.bossAns.s05[2] = B[2].map((q, i) => (i === 5 ? right(q) : wrong(q))); // 세트2 로 6번 도달
check(X.mastery(L, R, 's05').filter(Boolean).length === 6, '세트2 재도전으로 6번 도달');
R.bossAns.s06[2] = B[2].map((q, i) => (i >= 5 ? right(q) : wrong(q))); // 6번 + 7번(보너스)
bh = X.bossHp(L, R);
check(bh.dmg === 97 && bh.left === 0 && bh.won, `체력 0 → 즉시 승리 (미제출이 있어도) ${JSON.stringify(bh)}`);

// 도움 필요: 직접 요청 > 재도전까지 못 맞힘 > 2분째 미제출
R.state.step = 2; R.state.stepAt = 0;
R.help = { s07: true };
R.subs.m1.s09 = { 0: answer(R, 'm1', 's09', 0, 1), 1: answer(R, 'm1', 's09', 1, 2), 2: answer(R, 'm1', 's09', 2, 2), 3: answer(R, 'm1', 's09', 3, 2) }; // 기회 4번 (재도전 3번)
delete R.subs.m1.s10;
const hl = X.helpList(L, R, 200000);
check(hl[0].uid === 's07' && hl[0].why === '직접 요청', `도움 1순위 직접 요청 ${JSON.stringify(hl)}`);
check(hl.some((h) => h.uid === 's09' && /재도전까지 2\/4/.test(h.why)), '재도전까지 다 썼는데 2/4');
check(hl.some((h) => h.uid === 's10' && h.why === '2분째 미제출'), '2분째 미제출');
check(!X.helpList(L, R, 60000).some((h) => h.uid === 's10'), '1분이면 아직 아님');

// 단계 끝 → 마무리(마지막 한마디) → 수업 끝(closed)
R.state.step = L.steps.length;
check(X.isEnd(L, R) && !X.stepOf(L, R), '마무리 단계');
check(X.isFinale(L, R) && !X.isClosed(R), '마무리 = 한마디 시간 (아직 닫히지 않음)');
R.state.closed = true;
check(!X.isFinale(L, R) && X.isClosed(R), '수업 끝 (학생은 모닥불로)');

// 집중모드 자동: 도입·개념 단계만
check(L.steps.filter(X.autoFocus).every((s) => s.kind === 'intro' || s.kind === 'concept') && L.steps.some(X.autoFocus), '집중모드 자동 = 도입·개념');
check(!X.autoFocus(L.steps.find((s) => s.kind === 'monster')) && !X.autoFocus(null), '몬스터에서는 자동으로 꺼짐');

// 만점(보너스 빼고) → 대기실로 이동 · 모루
const R2 = X.newRoom('222222', 'set-03', 'T', 1000);
R2.players.a = { num: 1, nick: 'a', hero: 0 }; R2.players.b = { num: 2, nick: 'b', hero: 0 }; R2.active = { a: true, b: true }; R2.state.headcount = 2; R2.state.step = L.steps.length - 1;
R2.bossAns = { a: { 1: B[1].map((q, i) => (i < L.boss.hpItems ? right(q) : wrong(q))) }, b: { 1: B[1].map((q, i) => (i === 0 || i === 6 ? wrong(q) : right(q))) } }; R2.meta.pct = 100;
check(X.fullMarks(L, R2, 'a') && X.canLobby(L, R2, 'a'), '체력 문항 전부 도달 = 만점 (보너스는 틀려도)');
check(!X.fullMarks(L, R2, 'b') && !X.bossHp(L, R2).won && !X.canLobby(L, R2, 'b'), '1번을 틀리면 아직 대기실로 못 감');
R2.bossAns.b[2] = B[2].map((q) => right(q));
check(X.fullMarks(L, R2, 'b'), '세트2 에서 맞히면 만점');
R2.online = { a: true };
check(X.online(R2, 'a') && !X.online(R2, 'b'), '접속 표시');

if (fail) { console.error(`\n${fail}건 실패`); process.exit(1); }
console.log('OK: 레이드 — 체력·기준%·데미지(늘어난 만큼)·재도전 3번·체력 0 즉시 격파·미제출 제외·보스 즉시 승리·7번 보너스·도움 목록·마무리·집중모드·만점 통과');
