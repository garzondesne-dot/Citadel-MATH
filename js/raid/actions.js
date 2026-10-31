// 수업 동작: 학생 동작과 교사(교사 폰·종합상황실) 동작. 판정·점수는 교사 기기가 계산해서 쓴다.
// 모든 함수는 (code, room 스냅숏, …) 를 받는다. room 은 각 화면이 watch 로 받고 있는 최신 값.
window.DS = window.DS || {};

DS.Act = (function () {
  const N = () => DS.Net, Raid = DS.Raid;
  const P = (code, sub = '') => `rooms/${code}${sub ? '/' + sub : ''}`;
  const rid = () => 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const fail = (msg) => { const e = new Error(msg); e.user = true; throw e; };

  // ── 교사 ────────────────────────────────────────────────
  async function createRoom(lessonId) {
    let code;
    for (let i = 0; i < 20; i++) { code = String(100000 + Math.floor(Math.random() * 900000)); if (!(await N().get(P(code, 'meta')))) break; }
    const room = Raid.newRoom(code, lessonId, N().uid(), N().now());
    room.meta.created = N().TS;
    const hallKey = String(1000 + Math.floor(Math.random() * 9000));
    await N().set(P(code), room);
    await N().set(`secrets/${code}`, { hallKey }); // 학생은 읽을 수 없는 곳 (Firebase 규칙)
    return { code, hallKey };
  }
  async function joinHall(code, key) {
    const meta = await N().get(P(code, 'meta'));
    if (!meta) fail('수업 코드가 없어요.');
    // Firebase 규칙이 비밀 키와 같은지 확인한다 (다르면 쓰기 거절)
    try { await N().set(P(code, `hosts/${N().uid()}`), String(key)); } catch (e) { fail('종합상황실 키가 달라요.'); }
    const ok = await N().get(P(code, `hosts/${N().uid()}`));
    if (N().mode === 'local') { const sec = await N().get(`secrets/${code}`); if (!sec || sec.hallKey !== String(key)) { await N().remove(P(code, `hosts/${N().uid()}`)); fail('종합상황실 키가 달라요.'); } }
    if (!ok) fail('종합상황실 키가 달라요.');
    return meta;
  }
  const isHost = (R) => !!R && (R.meta.teacher === N().uid() || !!(R.hosts || {})[N().uid()]);

  async function start(code, R) {
    const studs = Object.entries(R.players || {}).filter(([, p]) => !p.teacher).map(([u]) => u);
    if (!studs.length) fail('입장한 학생이 없어요.');
    await N().update(P(code), { active: Object.fromEntries(studs.map((u) => [u, true])), 'state/phase': 'forge', 'state/stage': 0 });
  }
  const setActive = (code, uid, on) => N().set(P(code, `active/${uid}`), on ? true : null);
  async function stage(code, R, i) {
    if (!['forge', 'field', 'result', 'lobby'].includes(R.state.phase)) fail('전투·보스 중에는 단계를 바꿀 수 없어요.');
    await N().update(P(code, 'state'), { phase: 'forge', stage: i, result: null });
  }
  async function field(code) { await N().update(P(code, 'state'), { phase: 'field', result: null }); }
  async function summon(code, R, L, type, retry) {
    if (!retry && !['forge', 'field', 'result'].includes(R.state.phase)) fail('지금은 몬스터를 부를 수 없어요.');
    if (retry && !(R.state.phase === 'result' && R.state.result && !R.state.result.success)) fail('실패한 전투만 재도전해요.');
    const t = retry ? R.state.round.type : type;
    const miss = Raid.missingFor(L, R, t);
    if (miss.length) fail(`필요한 카드가 없는 사람: ${miss.map((u) => (u === R.meta.teacher ? '선생님' : `${R.players[u].num}번`)).join(', ')}`);
    const round = { id: rid(), type: t, attempt: retry ? R.state.round.attempt + 1 : 1, at: N().TS };
    await N().update(P(code, 'state'), { phase: 'battle', round, result: null, monster: retry ? R.state.monster : (R.state.monster || 0) + 1 });
  }
  // 교사 마지막 제출 → 판정 → 결과 (학생 전원이 제출한 뒤에만)
  async function teacherSubmit(code, R, L, card, given) {
    if (R.state.phase !== 'battle') fail('지금은 전투가 아니에요.');
    if (!Raid.allStudentsSubmitted(R)) fail('학생 전원이 먼저 제출해야 선생님이 마지막 공격을 할 수 있어요.');
    const t = R.meta.teacher, r = R.state.round;
    const sub = { card, given: N().pack(given), at: N().now() };
    await N().set(P(code, `subs/${r.id}/${t}`), sub);
    const R2 = JSON.parse(JSON.stringify(R));
    R2.subs = R2.subs || {}; R2.subs[r.id] = { ...(R2.subs[r.id] || {}), [t]: sub };
    const res = Raid.resolve(L, unpackRoom(R2));
    const patch = { 'state/phase': 'result', 'state/result': { success: res.success, round: r.id, at: N().TS } };
    Object.entries(res.credits).forEach(([u, c]) => Object.entries(c).forEach(([k, v]) => { patch[`credits/${u}/${k}`] = v; }));
    await N().update(P(code), patch);
    return res;
  }
  async function boss(code, R) {
    if (!['forge', 'field', 'result'].includes(R.state.phase)) fail('지금은 보스전으로 갈 수 없어요.');
    await N().update(P(code, 'state'), { phase: 'boss', result: null, boss: { at: N().TS } });
  }
  async function victory(code, R, L, force) {
    if (R.state.phase !== 'boss') fail('보스전에서 마무리해요.');
    const hp = Raid.bossHp(L, unpackRoom(R));
    if (!hp.allReached && !force) fail('아직 형성평가 1~6번에 도달하지 않은 학생이 있어요.');
    await N().update(P(code, 'state'), { phase: 'victory', winner: Raid.winner(L, unpackRoom(R)) });
  }
  const clearHelp = (code, uid) => N().remove(P(code, `help/${uid}`));

  // ── 학생 ────────────────────────────────────────────────
  async function join(code, info) {
    const R = await N().get(P(code));
    if (!R || !R.meta) fail('수업 코드가 없어요. 다시 확인해 주세요.');
    if (R.state.phase === 'victory') fail('이미 끝난 수업이에요.');
    const me = N().uid();
    const dup = Object.entries(R.players || {}).find(([u, p]) => u !== me && !p.teacher && Number(p.num) === Number(info.num));
    if (dup) fail(`${info.num}번은 이미 입장했어요. 번호를 확인해 주세요.`);
    await N().set(P(code, `players/${me}`), { num: Number(info.num), nick: String(info.nick).slice(0, 8), hero: Number(info.hero) || 0, at: N().TS });
    return R.meta;
  }
  const craft = (code, uid, cardId) => N().set(P(code, `cards/${uid}/${cardId}`), true);
  const help = (code, on) => N().set(P(code, `help/${N().uid()}`), on ? true : null);
  async function seen(code, R) {
    const r = R.state.round, me = N().uid();
    if (r && !(((R.seen || {})[r.id]) || {})[me]) await N().set(P(code, `seen/${r.id}/${me}`), N().TS);
  }
  async function submit(code, R, card, given) {
    const r = R.state.round, me = N().uid();
    if (R.state.phase !== 'battle') fail('지금은 제출할 전투가 없어요.');
    if ((((R.subs || {})[r.id]) || {})[me]) return;
    await N().set(P(code, `subs/${r.id}/${me}`), { card, given: N().pack(given), at: N().TS });
  }
  const bossAnswer = (code, set, answers) => N().set(P(code, `bossAns/${N().uid()}/${set}`), N().pack(answers));

  // 저장 모양(JSON 문자열) → 규칙 함수가 쓰는 모양
  function unpackRoom(R) {
    const out = JSON.parse(JSON.stringify(R || {}));
    Object.values(out.subs || {}).forEach((byU) => Object.values(byU).forEach((s) => { if (typeof s.given === 'string') s.given = N().unpack(s.given); }));
    Object.values(out.bossAns || {}).forEach((bySet) => Object.keys(bySet).forEach((k) => { if (typeof bySet[k] === 'string') bySet[k] = N().unpack(bySet[k]); }));
    return out;
  }

  return { createRoom, joinHall, isHost, start, setActive, stage, field, summon, teacherSubmit, boss, victory, clearHelp, join, craft, help, seen, submit, bossAnswer, unpackRoom, P };
})();
