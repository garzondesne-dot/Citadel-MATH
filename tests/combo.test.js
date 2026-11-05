// v0.9.11 검증: node tests/combo.test.js
// 🔥 반 콤보(40초 · 멈춘 시간 뺌 · 단계 묶기 +3 · +5 · +8) · ✨ 퍼펙트(2 · 3 · 4초 · 보스 1 · 1.5 · 2초) · ⛓ 묶기 상한(30초 창마다 10초)
// 👑 보스 단계(4 · 3 · 2초) · 🦇 황금 박쥐(30~90초 · 20초 · 30%) · 🎁 보물 상자(15% · +10% · 60/30/9/1) · 🥊 반대항(25 · 25 · 20 · 20 · 10)
// 기대값은 규칙에서 손으로 따로 계산한다 (코드의 중간값을 다시 쓰지 않음)
const load = require('./load');
const DS = load(['js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-02.js', 'lessons/set-03.js', 'lessons/set-04.js', 'js/raid/model.js', 'js/raid/combo.js', 'js/raid/fun-ox.js']);
const L = DS.Lessons.get('set-03'), X = DS.Raid, C = DS.Combo, S = DS.SetGen;
let fail = 0, n = 0;
const check = (c, m) => { n++; if (!c) { fail++; console.error('FAIL:', m); } };
const near = (a, b, e = 1e-9) => Math.abs(a - b) < e;
const right = (p) => (p.type === 'blanks' ? p.items.map((i) => i.answer) : p.type === 'subsets' ? S.allSubsets(p.base) : p.type === 'choice' ? p.answerIndex : p.answer);
const wrong = (p) => (p.type === 'blanks' ? p.items.map((i) => p.options.find((o) => o !== i.answer)) : p.type === 'number' ? p.answer + 1 : p.type === 'choice' ? (p.answerIndex + 1) % p.choices.length : p.type === 'multi' ? [] : null);
const answer = (R, mid, u, a, k) => X.itemsFor(L, R, mid, u, a).map((q, i) => (i < k ? right(q) : wrong(q)));
const room = (k) => {
  const R = X.newRoom('777777', 'set-03', 'T', 0);
  const ids = Array.from({ length: k }, (_, i) => `u${String(i + 1).padStart(2, '0')}`);
  ids.forEach((u, i) => { R.players[u] = { num: i + 1, nick: u, hero: 0, at: 0 }; });
  R.active = Object.fromEntries(ids.map((u) => [u, true])); R.state.headcount = k; R.subs = {}; R.hits = {};
  return { R, ids };
};
// 학생 u 가 몬스터 mid 의 시도 a 를 k 개 맞혀 시각 at(초) 에 냄 (ac = at, 멈춤 없음)
const sub = (R, u, mid, a, k, at) => {
  ((R.subs[mid] = R.subs[mid] || {})[u] = R.subs[mid][u] || {})[a] = answer(R, mid, u, a, k);
  (R.hits[u] = R.hits[u] || {})[`m_${mid}_${a}`] = { at: at * 1000, ac: at * 1000 };
};
const total = (mid) => L.monsters[mid] ? X.itemsFor(L, { meta: { code: '777777' } }, mid, '_', 0).length : 0;

// ── 1. ✨ 퍼펙트 개인 연속 2 · 3 · 4 · 4초, 첫 시도에 하나라도 틀리면 다시 1번째 ─────────
{
  const { R } = room(3);
  sub(R, 'u01', 'm1', 0, total('m1'), 10);
  sub(R, 'u01', 'm2', 0, total('m2'), 20);
  sub(R, 'u01', 'm3', 0, total('m3'), 30);
  sub(R, 'u01', 'm4', 0, total('m4'), 40);
  let an = C.analyze(L, R), pf = an.ev.filter((e) => e.pf).map((e) => e.bind);
  check(JSON.stringify(pf) === '[2,3,4,4]', `퍼펙트 연속 묶기 2 · 3 · 4 · 4 (${pf})`);
  check(an.streak.u01 === 4, '연속 4번');
  const { R: R2 } = room(3);
  sub(R2, 'u01', 'm1', 0, total('m1'), 10);
  sub(R2, 'u01', 'm2', 0, total('m2') - 1, 20); // 첫 시도 하나 틀림 → 끊김
  sub(R2, 'u01', 'm3', 0, total('m3'), 30);
  an = C.analyze(L, R2); pf = an.ev.filter((e) => e.pf).map((e) => e.bind);
  check(JSON.stringify(pf) === '[2,2]', `틀리면 다시 1번째 2초 (${pf})`);
}

// ── 2. 🔥 콤보: 퍼펙트 +1 · 고침 +1 · 40초 넘게 없으면 끊김 · 연습 공격은 콤보 아님 ─────
{
  const { R } = room(4);
  sub(R, 'u01', 'm4', 0, 4, 10);            // 퍼펙트 → 1
  sub(R, 'u02', 'm4', 0, 2, 20);            // 부분 → 콤보 아님
  sub(R, 'u02', 'm4', 1, 4, 45);            // 고침 → 2 (25초 간격)
  sub(R, 'u01', 'm4', 1, 4, 60);            // 연습 → 콤보 아님 · 묶기 4초
  sub(R, 'u03', 'm4', 0, 4, 84);            // 퍼펙트 → 3 (39초 간격: 이어짐)
  sub(R, 'u04', 'm4', 0, 4, 125);           // 퍼펙트 → 41초 간격: 끊기고 1
  const an = C.analyze(L, R);
  check(an.best === 3 && an.cur === 1, `사슬 최고 3 · 지금 1 (best ${an.best} cur ${an.cur})`);
  check(JSON.stringify(an.bestUsers.sort()) === '["u01","u02","u03"]', `최고 사슬에 낀 학생 u01 · u02 · u03 (${an.bestUsers})`);
  const prac = an.binds.filter((b) => b.why === 'prac');
  check(prac.length === 1 && prac[0].sec === 4, '연습 공격 4/4 → 묶기 4초 (학생 한 명 몬스터당 최대 4초)');
  // 지금 콤보: 마지막 125초 · 40초 넘으면 0 · 멈춘 시간(cpMs)은 빼고 셈
  R.state.cpMs = 0; check(C.comboNow(an, R, 150e3).n === 1 && near(C.comboNow(an, R, 150e3).left, 1 - 25 / 40), '25초 지남 → 살아 있음');
  check(C.comboNow(an, R, 166e3).n === 0, '41초 지남 → 끊김');
  R.state.cpMs = 30e3; check(C.comboNow(an, R, 166e3).n === 1, '쉼터 30초는 빼고 → 11초 지남, 살아 있음');
  R.state.cpMs = 0; R.state.rest = { at: 140e3, min: 5 }; R.state.cpAt = 140e3;
  check(C.comboNow(an, R, 900e3).n === 1, '쉼터가 켜져 있는 동안은 시계 멈춤');
}

// ── 3. 단계 묶기: 10 = +3 · 20 = +5 · 30 = +8 (닿는 순간 한 번) ─────────────────
{
  const { R, ids } = room(30);
  ids.forEach((u, i) => sub(R, u, 'm4', 0, 4, 10 + i * 5)); // 30명 퍼펙트, 5초 간격
  const an = C.analyze(L, R);
  check(an.best === 30 && an.marks.map((m) => m.n).join() === '10,20,30', `콤보 30 · 단계 10 · 20 · 30 (${an.marks.map((m) => m.n)})`);
  const tier = an.binds.filter((b) => b.why.startsWith('tier')).map((b) => b.sec);
  check(JSON.stringify(tier) === '[3,5,8]', `단계 묶기 3 · 5 · 8 (${tier})`);
  check(C.tierOf(9).icon === '🔥' && C.tierOf(10).icon === '⚡' && C.tierOf(20).icon === '🌈' && C.tierOf(30).icon === '👑' && !C.tierOf(4), '단계 아이콘 5 🔥 · 10 ⚡ · 20 🌈 · 30 👑');
  // ⛓ 상한: 단계 시작 0초 · 30초 창마다 10초까지 (퍼펙트는 모두 1번째라 2초씩)
  //   창 0 (0~30초): 10·15·20·25 초 퍼펙트 4개 = 8초 → 8
  //   창 1 (30~60): 30·35·40·45·50·55 → 6개 12초 + 10번째(55초) 단계 +3 = 15 → 10
  //   창 2 (60~90): 6개 12 → 10 · 창 3 (90~120): 6개 12 + 20번째(105초) +5 = 17 → 10 · 창 4 (120~150): 6개(120~145) 12 + 30번째(155초)는 창 5
  //   창 5 (150~180): 155초 퍼펙트 2 + 단계 +8 = 10 → 10
  R.state.stepAt = 0;
  const raw = an.binds.reduce((a, b) => a + b.sec, 0);
  check(raw === 30 * 2 + 3 + 5 + 8, `상한 전 합계 76초 (${raw})`);
  check(C.bindFor(L, R, 'm4', an) === 8 + 10 + 10 + 10 + 10 + 10, `상한 뒤 58초 (${C.bindFor(L, R, 'm4', an)})`);
  check(C.bindFor(L, R, 'm4', an, 59e3) === 18, `59초까지 = 8 + 10 (${C.bindFor(L, R, 'm4', an, 59e3)})`);
  check(C.CAP / C.CAP_WIN === 1 / 3, '30초 창 10초 = 실제 시간의 1/3 → 공격 사이 묶기 ≤ 주기의 절반');
  // 공격 시계에 들어감
  R.state.step = L.steps.findIndex((s) => s.id === 'm4'); R.state.headcount = 40; // 체력 40 × 4 × 90% = 144 > 120 (아직 안 쓰러짐)
  const c = X.atkClock(L, R, 200e3);
  check(c.bind === 58 && near(c.t, 200 - 58), `atkClock 묶기 58초 (${c.bind})`);
}

// ── 4. 👑 보스 단계 멈춤 · 보스 문항 퍼펙트 1 · 1.5 · 2초 · 보스 문항 콤보 ────────────
{
  check(C.bossPhase(1).lock === 4 && C.bossPhase(0.67).lock === 4 && C.bossPhase(0.66).lock === 3 && C.bossPhase(0.34).lock === 3 && C.bossPhase(0.33).lock === 2 && C.bossPhase(0).lock === 2, '보스 100~67% 4초 · 66~34% 3초 · 33~0% 2초');
  check(C.bossPhase(0.5).phase === 2 && C.bossPhase(0.1).phase === 3, '단계 번호');
  const { R } = room(2);
  const h = (u, k, at, ok) => { (R.hits[u] = R.hits[u] || {})[k] = { at: at * 1000, ac: at * 1000, ok }; };
  h('u01', 'b1_0_0', 10, true); h('u01', 'b1_1_0', 20, true); h('u01', 'b1_2_0', 30, true); h('u01', 'b1_3_0', 40, false); h('u01', 'b2_3_0', 50, true); h('u01', 'b1_4_0', 60, true);
  const an = C.analyze(L, R), bb = an.binds.filter((b) => b.m === 'boss').map((b) => b.sec);
  check(JSON.stringify(bb) === '[1,1.5,2,1]', `보스 퍼펙트 1 · 1.5 · 2 · (틀린 뒤) 1 (${bb})`);
  check(an.best === 5, `보스 문항 맞힘(처음 도달) 5번 = 콤보 5 (${an.best})`);
  R.state.step = L.steps.findIndex((s) => s.kind === 'boss'); R.state.stepAt = 0;
  const c = X.atkClock(L, R, 100e3);
  check(c.kind === 'boss' && c.bind === 5.5 && c.lock === 4, `보스도 묶임 5.5초 · 가득 = 4초 멈춤 (${c.bind} · ${c.lock})`);
}

// ── 5. 🦇 황금 박쥐 ────────────────────────────────────
{
  const p0 = C.batPlan(L, 0, 0), p1 = C.batPlan(L, 0.999, 0.999), mons = L.steps.filter((s) => s.kind === 'monster' && L.monsters[s.id]).map((s) => s.id);
  check(p0.mid === mons[0] && p0.d === 30 && p1.mid === mons[mons.length - 1] && p1.d === 90, `몬스터 단계 하나 · 30~90초 (${JSON.stringify([p0, p1])})`);
  const q = C.batQ(L, '777777');
  check(q >= 0 && DS.FunOX.list[q].no <= L.no, '지금 차시까지의 OX 문장');
  const { R, ids } = room(10);
  R.state.step = L.steps.findIndex((s) => s.id === 'm2'); R.state.stepAt = 0; R.state.batPlan = { mid: 'm2', d: 40 };
  check(!C.batDue(L, R, 39e3) && C.batDue(L, R, 40e3), '단계 시작 40초 뒤에 나타남');
  R.state.focus = true; R.state.focusAt = 30e3; check(!C.batDue(L, R, 60e3), '집중모드 중엔 안 나옴'); delete R.state.focus; delete R.state.focusAt;
  R.meta.deadline = 40e3 + 4 * 60e3; check(!C.batDue(L, R, 40e3), '남은 5분 아래면 안 나옴'); delete R.meta.deadline;
  R.state.batPlan = { mid: 'm3', d: 40 }; check(!C.batDue(L, R, 60e3), '정해진 몬스터 단계가 아니면 안 나옴'); R.state.batPlan = { mid: 'm2', d: 40 };
  R.state.bat = { mid: 'm2', at: 50e3, ac: 50e3, q, n: 10 };
  check(!C.batDue(L, R, 90e3), '한 번 나오면 다시 안 나옴');
  const a = DS.FunOX.list[q].a ? 'o' : 'x', b = a === 'o' ? 'x' : 'o';
  R.batA = { u01: a, u02: a, u03: b, u04: b };
  let st = C.bat(L, R, 60e3);
  check(st.live && st.answered === 4 && st.right === null && st.need === 3, '20초 동안: 응답 수만 · 필요 ⌈10 × 30%⌉ = 3명');
  st = C.bat(L, R, 70e3); check(!st.live && st.rightN === 2 && !st.ok, '2명 맞힘 → 놓침');
  R.batA.u05 = a; st = C.bat(L, R, 70e3); check(st.ok && st.rightN === 3, '3명 맞힘 → 포획');
  const an = C.analyze(L, R, 70e3), bat = an.binds.find((x) => x.why === 'bat');
  check(bat && bat.sec === 5 && bat.m === 'm2' && an.best === 3, `포획 → 묶기 5초 · 콤보 +3 (${an.best})`);
  check(!C.analyze(L, R, 60e3).binds.some((x) => x.why === 'bat'), '20초가 끝나기 전엔 보상 없음');
  check(ids.length === 10, '인원');
}

// ── 6. 🎁 보물 상자 확률 (확정 수치 · 많이 굴려 확인) ───────────────────────
{
  let got = 0, got3 = 0, bad = 0; const tier = { common: 0, rare: 0, hero: 0, legend: 0 }, N0 = 40000, gems = { common: new Set(), rare: new Set() };
  for (let i = 0; i < N0; i++) { if (C.chestRoll(`s${i}`, false)) got++; if (C.chestRoll(`s${i}`, true)) got3++; const r = C.chestRoll(`t${i}`, false, true); tier[r.tier]++; if (gems[r.tier]) gems[r.tier].add(r.gem); if ((r.tier === 'hero' && r.feather !== 1) || (r.tier === 'legend' && r.feather !== 3)) bad++; }
  check([...gems.common].sort().join() === '1,2' && [...gems.rare].sort().join() === '3,4,5' && !bad, `흔함 💎 1~2 · 희귀 💎 3~5 · 영웅 🪶 1 · 전설 🪶 3 (${[...gems.common]} / ${[...gems.rare]})`);
  check(Math.abs(got / N0 - 0.15) < 0.01, `기본 15% (${(got / N0).toFixed(3)})`);
  check(Math.abs(got3 / N0 - 0.25) < 0.01, `퍼펙트 3연속 25% (${(got3 / N0).toFixed(3)})`);
  check(Math.abs(tier.common / N0 - 0.6) < 0.01 && Math.abs(tier.rare / N0 - 0.3) < 0.01 && Math.abs(tier.hero / N0 - 0.09) < 0.006 && Math.abs(tier.legend / N0 - 0.01) < 0.003, `흔함 60 · 희귀 30 · 영웅 9 · 전설 1 (${JSON.stringify(tier)})`);
  check(JSON.stringify(C.chestRoll('same', false, true)) === JSON.stringify(C.chestRoll('same', false, true)), '같은 처치는 같은 결과 (새로 고쳐도 못 바꿈)');
  check(near(C.CHEST.table.reduce((a, t) => a + t.p, 0), 1), '확률 합 100%');
}

// ── 7. 🥊 반대항 점수 (손 계산) ───────────────────────────
{
  const { R } = room(4);
  R.state.step = L.steps.length; // 마무리 (모든 몬스터 단계 지남)
  // m4 만 낸 상황을 단순하게: 다른 몬스터는 아무도 안 냄 → 참여 0
  sub(R, 'u01', 'm4', 0, 4, 10);   // 퍼펙트
  sub(R, 'u02', 'm4', 0, 2, 20); sub(R, 'u02', 'm4', 1, 4, 30); // 고침
  sub(R, 'u03', 'm4', 0, 1, 40);   // 못 고침
  R.heals = { m4: { u01: { 0: 'u03' } } }; // u03 힐 받음
  const p = C.punch(L, R);
  const mons = L.steps.filter((s) => s.kind === 'monster' && L.monsters[s.id]).length;
  // 참여: 몬스터마다 낸 비율 → m4 = 3/4, 나머지 0 · 보스 0/4 → (3/4) / (몬스터 수 + 1)
  const join = (3 / 4) / (mons + 1);
  const fix = 1 / 2;                 // 첫 시도 못 맞힌 2쌍 중 1쌍 고침
  const first = (4 + 2 + 1) / 12;    // 첫 시도 맞힌 소문제 7 / 12
  const heal = 1 / 2;                // 막힌 학생 u02 · u03 중 u03 만 힐 받음
  const combo = Math.min(1, 2 / 3);  // 퍼펙트(10초) + 고침(30초) = 콤보 2 · 낸 학생 3명
  const s = Math.round((25 * join + 25 * fix + 20 * combo + 20 * first + 10 * heal) * 10);
  check(p.s === s, `점수 ${p.s} = 손 계산 ${s}`);
  check(p.m.fix === 50 && p.m.heal === 50 && p.m.first === Math.round(first * 100) && p.m.combo === 67 && p.best === 2, `지표 ${JSON.stringify(p.m)}`);
  // 연장전: 참여를 이어하기 완주율로 (높을 때만)
  const ot = C.overtime({ s: p.s, m: p.m, ot: true }, 0.75);
  check(ot.m.join === 75 && !ot.ot && ot.s === Math.round((25 * 0.75 + 25 * 0.5 + 20 * 0.67 + 20 * (p.m.first / 100) + 10 * 0.5) * 10), `연장전 다시 잼 ${ot.s}`);
  check(C.overtime({ s: 900, m: { join: 90 } }, 0.5).m.join === 90, '완주율이 낮으면 참여 그대로');
}

// ── 8. 반대항 순위 · 지난 차시 대비 · 시즌 · 보상 ──────────────────────
{
  const all = { 'set-02': { 1: { s: 500, m: {} }, 2: { s: 600, m: {} } }, 'set-03': { 1: { s: 560, m: {} }, 2: { s: 540, m: {} }, 3: { s: 700, m: {} }, 4: { s: 0, m: {}, ot: true } } };
  const b = C.board(all, 'set-03', '1');
  check(b.rows.map((r) => r.cls).join() === '3,1,2,4' && b.me.rank === 2, `순위 3반 · 1반 · 2반 · (연장전 4반) (${b.rows.map((r) => r.cls)})`);
  check(b.me.delta === 12 && b.rows.find((r) => r.cls === '2').delta === -10, '지난 차시 대비 1반 +12% · 2반 −10%');
  check(b.rows.find((r) => r.cls === '2').last && !b.me.last, '꼴찌 대신 「도전 중」');
  check(b.season[0].cls === '2' && b.season[0].total === 1140 && b.season.find((s) => s.cls === '1').total === 1060, '시즌 누적 (연장전 중은 빼고)');
  check(JSON.stringify(C.punchGems(b.me).map((g) => [g[0], g[1]])) === '[["up",3]]', '1반: 2등이지만 +12% → 💎 +3');
  { const b3 = C.board(all, 'set-03', '3'); check(JSON.stringify(C.punchGems(b3.me, b3).map((g) => [g[0], g[1]])) === '[["first",5]]', '3반: 1등 → 💎 +5 (지난 기록 없음)'); }
  // 다른 반이 이 차시를 아직 안 했으면 가장 가까운 차시 기록으로 비교 (표시 near)
  { const all2 = { 'set-02': { 5: { s: 300, m: {} } }, 'set-04': { 5: { s: 900, m: {} }, 6: { s: 700, m: {} } }, 'set-03': { 1: { s: 600, m: {} } } };
    const b5 = C.board(all2, 'set-03', '1'), r5 = b5.rows.find((r) => r.cls === '5'), r6 = b5.rows.find((r) => r.cls === '6');
    check(r5 && r5.near === 'set-02' && r5.s === 300 && r6 && r6.near === 'set-04' && r6.s === 700, `가까운 차시: 5반 거리 같음 → 앞 차시(2차시) · 6반 4차시 (${JSON.stringify(b5.rows.map((r) => [r.cls, r.near, r.s]))})`);
    check(b5.me.cls === '1' && b5.me.rank === 2 && !b5.me.near && b5.season.find((x) => x.cls === '5').total === 1200, '순위에 함께 들어감 · 시즌은 실제 기록만'); }
  { const solo = C.board({ 'set-03': { 1: { s: 400, m: {} } } }, 'set-03', '1'); check(C.punchGems(solo.me, solo).length === 0, '그 차시를 한 반만 했으면 1등 보상 없음 (첫 반이 늘 1등이 되지 않게)'); }
  check(C.punchGems(C.board(all, 'set-03', '4').me).length === 0, '연장전 중인 반은 보상 대기');
}

// ── 9. 콤보 시계 멈춤 기록 (교사 기기) ──────────────────────────
{
  check(JSON.stringify(C.cpPatch({}, { focus: true }, 100)) === '{"cpAt":100}', '멈춤 시작');
  check(JSON.stringify(C.cpPatch({ focus: true, cpAt: 100, cpMs: 50 }, { focus: false }, 400)) === '{"cpAt":null,"cpMs":350}', '멈춤 끝 → 더함');
  check(JSON.stringify(C.cpPatch({ focus: true, cpAt: 100 }, { rest: true }, 400)) === '{}', '집중모드 중 쉼터 → 그대로 멈춤');
  check(JSON.stringify(C.cpPatch({ video: 'c1', cpAt: 100 }, { video: null }, 300)) === '{"cpAt":null,"cpMs":200}', '영상 끝');
  check(C.activeNow({ state: { cpMs: 1000 } }, 5000) === 4000 && C.activeNow({ state: { cpMs: 1000, focus: true, cpAt: 3000 } }, 5000) === 2000, '콤보 시계 = 지금 − 멈춘 시간');
}

if (fail) { console.error(`\n${fail}/${n}건 실패`); process.exit(1); }
console.log(`OK: v0.9.11 콤보 · 퍼펙트 · 묶기 상한 · 보스 단계 · 황금 박쥐 · 보물 상자 · 반대항 ${n}건 통과`);
