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
R.state.headcount = 18; R.state.step = 8; R.state.stepAt = 0; // 문제4 (4칸 · v5 에서 문제1 이 5칸이 되어 기준 몬스터를 문제4 로)
check(X.stepOf(L, R).id === 'm4', '9번째 단계 = 문제4');

// 체력: 18 × 4 × 90% = 64.8 → 64
let hp = X.monsterHp(L, R, 'm4');
check(hp.max === 64 && hp.left === 64 && hp.pct === 90 && hp.items === 4, `문제4 체력 ${JSON.stringify(hp)}`);
check(X.monsterHp(L, R, 'm3').max === 97 && X.monsterHp(L, R, 'm4').max === 64, '체력 예시 (문제3 97 · 문제4 64)');
R.meta.pct = 80; check(X.monsterHp(L, R, 'm4').max === 57, '수업 준비 기본값 80% → 57'); delete R.meta.pct;

// 데미지 = 맞힌 소문제 수, 재도전은 늘어난 만큼만 (= 가장 많이 맞힌 시도)
R.subs = { m4: { s01: { 0: answer(R, 'm4', 's01', 0, 3) } } };
let rec = X.record(L, R, 'm4', 's01');
check(rec.best === 3 && rec.canRetry && X.resultLabel(rec.last) === 'partial', `부분 성공 3/4 ${JSON.stringify({ best: rec.best, canRetry: rec.canRetry })}`);
R.subs.m4.s01[1] = answer(R, 'm4', 's01', 1, 2);
check(X.record(L, R, 'm4', 's01').best === 3, '재도전에서 덜 맞혀도 데미지는 줄지 않음');
R.subs.m4.s01[2] = answer(R, 'm4', 's01', 2, 4);
rec = X.record(L, R, 'm4', 's01');
check(rec.best === 4 && rec.canRetry && rec.perfectAt === 2 && !rec.practice && X.resultLabel(rec.last) === 'success', '두 번째 재도전 4/4 → 데미지 4 (늘어난 1만 더해짐), 남은 기회 1번은 연습 공격');
check(JSON.stringify(X.itemsFor(L, R, 'm4', 's01', 1)) !== JSON.stringify(X.itemsFor(L, R, 'm4', 's01', 0)), '재도전은 숫자가 바뀐 문제');
R.subs.m4.s02 = { 0: answer(R, 'm4', 's02', 0, 4) };
// v0.9.2 연습 공격: 다 맞혀도 남은 기회만큼 숫자 바뀐 문제 · 데미지는 그대로(0 추가)
check(X.record(L, R, 'm4', 's02').canRetry && X.record(L, R, 'm4', 's02').perfectAt === 0, '다 맞혀도 연습 공격 가능');
R.subs.m4.s02[1] = answer(R, 'm4', 's02', 1, 1); R.subs.m4.s02[2] = answer(R, 'm4', 's02', 2, 4); R.subs.m4.s02[3] = answer(R, 'm4', 's02', 3, 0);
rec = X.record(L, R, 'm4', 's02');
check(rec.best === 4 && rec.practice && !rec.canRetry && rec.tries.length === 4, `연습 3번(1/4 · 4/4 · 0/4) 뒤에도 데미지 4 그대로 · 기회 4번 끝 ${JSON.stringify({ best: rec.best, practice: rec.practice })}`);
R.subs.m4.s03 = { 0: answer(R, 'm4', 's03', 0, 0) };
check(X.resultLabel(X.record(L, R, 'm4', 's03').last) === 'fail', '0개 = 공격 실패');
check(X.monsterHp(L, R, 'm4').dmg === 8, '데미지 합 4 + 4 + 0');

// v0.9.2: 체력이 0 이 되면 전원 제출 전이라도 그 자리에서 격파 (안 낸 학생은 계속 풀고 공격할 수 있음)
ids.slice(3).forEach((u) => { R.subs.m4[u] = { 0: answer(R, 'm4', u, 0, 4) }; }); // 15명 × 4 = 60, 합 68
R.subs.m4.s18 = undefined; delete R.subs.m4.s18; // 1명 미제출
hp = X.monsterHp(L, R, 'm4');
check(hp.left === 0 && X.cleared(L, R, 'm4') && X.waiting(L, R, 'm4').join() === 's18', `체력 0 → s18 미제출이어도 격파 ${JSON.stringify(hp)}`);
check(X.record(L, R, 'm4', 's18').submitted === false && !X.cleared(L, X.newRoom('9', L.id, 'T', 0, 90), 'm4'), '격파 뒤에도 s18 은 아직 제출 전 · 인원 0 인 방은 격파 아님');
R.state.skip = { m4: { s18: true } };
check(X.cleared(L, R, 'm4'), '미제출 학생 제외 → 격파');
delete R.state.skip;
R.subs.m4.s18 = { 0: answer(R, 'm4', 's18', 0, 4) };
check(X.cleared(L, R, 'm4'), '전원 제출 + 체력 0 → 격파');

// 전원 제출했지만 체력이 남으면 → 교사가 기준% 를 낮춰 해결
R.state.step = 5; // 문제2 (3칸): 체력 48
R.subs.m2 = Object.fromEntries(ids.map((u, i) => [u, { 0: answer(R, 'm2', u, 0, i < 10 ? 3 : 1) }])); // 30 + 8 = 38
check(X.allSubmitted(L, R, 'm2') && !X.cleared(L, R, 'm2') && X.monsterHp(L, R, 'm2').left === 10, '전원 제출, 체력 10 남음');
R.state.pct = { m2: 70 }; // 18 × 3 × 70% = 37.8 → 37
check(X.monsterHp(L, R, 'm2').max === 37 && X.cleared(L, R, 'm2'), '기준% 70 으로 낮추면 격파 (몬스터마다 따로)');
check(X.monsterHp(L, R, 'm4').pct === 90, '다른 몬스터 기준%는 그대로');

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
R.state.step = 8; R.state.stepAt = 0;
R.help = { s07: true };
R.subs.m4.s09 = { 0: answer(R, 'm4', 's09', 0, 1), 1: answer(R, 'm4', 's09', 1, 2), 2: answer(R, 'm4', 's09', 2, 2), 3: answer(R, 'm4', 's09', 3, 2) }; // 기회 4번 (재도전 3번)
delete R.subs.m4.s10;
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

// ── 💚 힐 (v0.9.6) ── 다 맞힌 학생이 남은 기회 한 칸을 친구에게 · 받는 쪽 최대 +2 · 막힌 친구일수록 높은 확률
{
  const H = X.newRoom('777777', 'set-03', 'T', 1000);
  ['h', 'x', 'y', 'z'].forEach((u, i) => { H.players[u] = { num: i + 1, nick: u, hero: 0 }; });
  H.active = { h: true, x: true, y: true, z: true }; H.state.headcount = 4; H.state.step = 8;
  const ans = (u, a, k) => X.itemsFor(L, H, 'm4', u, a).map((q, i) => (i < k ? right(q) : wrong(q)));
  H.subs = { m4: { h: { 0: ans('h', 0, 4) }, x: { 0: ans('x', 0, 0), 1: ans('x', 1, 1), 2: ans('x', 2, 1), 3: ans('x', 3, 2) }, y: { 0: ans('y', 0, 1) } } };
  let rh = X.record(L, H, 'm4', 'h'), rx = X.record(L, H, 'm4', 'x'), ry = X.record(L, H, 'm4', 'y');
  check(rh.canHeal && rh.left === 3 && rh.slots === 4, `힐러: 다 맞힘 · 남은 기회 3 ${rh.left}`);
  check(!rx.canRetry && rx.left === 0 && !rx.canHeal, '기회를 다 쓴 x 는 재도전 불가');
  check(!X.record(L, H, 'm4', 'z').submitted, 'z 는 아직 안 냄 → 힐 후보 아님');
  // 무게: x(남은 0) = 8, y(남은 3) = 1 → 난수 0~8/9 는 x, 그 뒤는 y
  check(X.healTarget(L, H, 'm4', 'h', 0) === 'x' && X.healTarget(L, H, 'm4', 'h', 0.85) === 'x' && X.healTarget(L, H, 'm4', 'h', 0.95) === 'y', '막힌 친구일수록 높은 확률');
  let cnt = 0; for (let i = 0; i < 900; i++) if (X.healTarget(L, H, 'm4', 'h', (i + 0.5) / 900) === 'x') cnt++;
  check(cnt === 800, `x 확률 8/9 (${cnt}/900)`);
  check(X.healTarget(L, H, 'm4', 'h', 0.5) !== 'h' && X.healTarget(L, H, 'm4', 'x', 0) === 'y', '자기 자신 · 다 맞힌 친구는 후보 아님');
  H.heals = { m4: { h: { 0: 'x' } } };
  rh = X.record(L, H, 'm4', 'h'); rx = X.record(L, H, 'm4', 'x');
  check(rh.left === 2 && X.healsGiven(H, 'm4', 'h') === 1, '힐러는 기회 한 칸을 씀');
  check(rx.canRetry && rx.left === 1 && rx.slots === 5 && rx.healed === 1, `x 가 기회 한 칸을 받음 ${JSON.stringify({ l: rx.left, s: rx.slots })}`);
  check(X.healsTo(H, 'm4', 'x')[0].from === 'h', '받은 학생은 누가 줬는지 안다');
  H.heals.m4.h[1] = 'x'; H.heals.m4.y = { 0: 'x' };
  rx = X.record(L, H, 'm4', 'x');
  check(rx.healed === 2 && rx.slots === 6 && rx.left === 2, '받는 쪽은 최대 +2 (세 번째 힐은 기회가 안 늘어남)');
  check(X.healTarget(L, H, 'm4', 'h', 0) !== 'x', '+2 를 받은 친구는 더 이상 후보 아님');
  H.subs.m4.y = { 0: ans('y', 0, 4) }; H.subs.m4.z = { 0: ans('z', 0, 4) };
  check(X.healTarget(L, H, 'm4', 'h', 0) === null, '받을 친구가 없으면 null (응원)');
  H.subs.m4.x[4] = ans('x', 4, 3); H.subs.m4.x[5] = ans('x', 5, 4);
  rx = X.record(L, H, 'm4', 'x');
  check(rx.perfect && rx.left === 0 && rx.best === 4 && rx.tries.length === 6, '힐로 받은 기회로 성공 (시도 6번)');
  check(X.monsterHp(L, H, 'm4').dmg === 16, '힐로 고친 만큼 데미지에 들어감');
}

// 👾 몬스터 공격 시계 (2026-11-03): 반 전체 공통 · 체력이 많을수록 빠름(일반 20초 → 45초 · 보스 30초 → 60초) · 집중모드 멈춤 · ⛓ 묶기 최대 4초
{
  const Q = X.newRoom('654321', 'set-03', 'T', 0);
  ['a', 'b'].forEach((u, i) => { Q.players[u] = { num: i + 1, nick: u, hero: 0, at: 0 }; });
  Q.active = { a: true, b: true }; Q.state.headcount = 10; Q.state.step = 8; Q.state.stepAt = 0; // 문제4 (4칸 · v5 에서 문제1 이 5칸이 되어 기준 몬스터를 문제4 로) · 인원 10
  let c = X.atkClock(L, Q, 50000);
  check(c && c.kind === 'monster' && c.per === 20 && c.lock === 1 && c.t === 50 && c.ratio === 1, `체력 가득 = 20초 주기 ${JSON.stringify(c)}`);
  Q.state.pauseMs = 10000; c = X.atkClock(L, Q, 50000); check(c.t === 40, '집중모드로 멈춘 10초는 빼고 센다');
  Q.state.focus = true; Q.state.focusAt = 45000; c = X.atkClock(L, Q, 50000); check(c.paused && c.t === 35, '집중모드가 켜져 있으면 그 시각에서 멈춤');
  delete Q.state.focus; delete Q.state.focusAt; delete Q.state.pauseMs;
  Q.subs = { m4: { a: { 0: answer(Q, 'm4', 'a', 0, 4), 1: answer(Q, 'm4', 'a', 1, 3), 2: answer(Q, 'm4', 'a', 2, 4) }, b: { 0: answer(Q, 'm4', 'b', 0, 2), 1: answer(Q, 'm4', 'b', 1, 4) } } };
  check(X.bindOf(L, Q, 'm4', 'a') === 4, `a: 다 맞힌 뒤 3 + 4 = 7 → 최대 4초 (${X.bindOf(L, Q, 'm4', 'a')})`);
  check(X.bindOf(L, Q, 'm4', 'b') === 0, 'b: 처음 다 맞힌 시도는 묶기가 아님');
  c = X.atkClock(L, Q, 50000); const hp = X.monsterHp(L, Q, 'm4');
  check(c.bind === 4 && c.t === 46 && Math.abs(c.per - (20 + 25 * (1 - hp.left / hp.max))) < 1e-9 && c.per > 20, `묶기 4초 · 체력이 닳아 주기가 길어짐 ${JSON.stringify(c)}`);
  // atkTrack: 바퀴가 차면 공격 · 주기가 바뀌어도 거꾸로 튀지 않음
  const memo = {}; let tr = X.atkTrack(memo, { t: 5, per: 20 }, 'k'); check(Math.abs(tr.p - 0.25) < 1e-9 && !tr.strike, 'atkTrack 시작');
  tr = X.atkTrack(memo, { t: 20, per: 20 }, 'k'); check(tr.strike && memo.start === 20, '20초에 공격');
  tr = X.atkTrack(memo, { t: 30, per: 40 }, 'k'); check(!tr.strike && Math.abs(tr.p - 0.25) < 1e-9, '느려진 주기는 이번 바퀴부터 (게이지 그대로 이어짐)');
  tr = X.atkTrack(memo, { t: 18, per: 40 }, 'k'); check(!tr.strike && tr.p >= 0, '묶기로 시계가 뒤로 가도 게이지가 음수가 되지 않음');
  Q.state.step = L.steps.findIndex((st) => st.kind === 'boss'); c = X.atkClock(L, Q, 70000);
  check(c && c.kind === 'boss' && c.per === 30 && c.lock === 2 && c.bind === 0, `보스 가득 = 30초 주기 · 2초 잠금 ${JSON.stringify(c)}`);
  check(X.atkClock(L, Q, 70000, { monster: [4, 1], boss: [5, 2] }).per === 5, '시험용 [주기, 잠금] 두 칸도 그대로');
  Q.state.step = -1; check(X.atkClock(L, Q, 70000) === null, '대기실에서는 공격 없음');
}
if (fail) { console.error(`\n${fail}건 실패`); process.exit(1); }
console.log('OK: 레이드 — 체력·기준%·데미지(늘어난 만큼)·재도전 3번·체력 0 즉시 격파·미제출 제외·보스 즉시 승리·7번 보너스·도움 목록·마무리·집중모드·만점 · 💚 힐 통과');
