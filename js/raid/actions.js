// 수업 동작: 학생 동작과 교사(교사 폰·종합상황실) 동작.
// 모든 함수는 (code, room 스냅숏, …) 를 받는다. room 은 각 화면이 watch 로 받고 있는 최신 값.
// 채점은 학생 기기가 바로 하고(즉시 결과), 데미지·격파는 모든 기기가 같은 규칙(DS.Raid)으로 다시 계산한다.
window.DS = window.DS || {};

DS.Act = (function () {
  const N = () => DS.Net, Raid = DS.Raid;
  const P = (code, sub = '') => `rooms/${code}${sub ? '/' + sub : ''}`;
  const fail = (msg) => { const e = new Error(msg); e.user = true; throw e; };

  // ── 수업 준비 (PC): 차시별 개념 설명 이미지 · 기준% 기본값 ──────────
  const prepPath = (lessonId, sub = '') => `prep/${lessonId}${sub ? '/' + sub : ''}`;
  const getPrep = (lessonId) => N().get(prepPath(lessonId));
  const setImage = (lessonId, slot, dataUrl) => N().set(prepPath(lessonId, `img/${slot}`), dataUrl || null);
  const setDefaultPct = (lessonId, pct) => N().set(prepPath(lessonId, 'pct'), Number(pct));

  // ── 교사 ────────────────────────────────────────────────
  async function createRoom(lessonId) {
    let code;
    for (let i = 0; i < 20; i++) { code = String(100000 + Math.floor(Math.random() * 900000)); if (!(await N().get(P(code, 'meta')))) break; }
    let pct = null;
    try { pct = await N().get(prepPath(lessonId, 'pct')); } catch (e) { /* 준비 안 했으면 차시 기본값 */ }
    const room = Raid.newRoom(code, lessonId, N().uid(), N().now(), pct);
    room.meta.created = N().TS;
    room.state.stepAt = N().TS;
    const hallKey = String(1000 + Math.floor(Math.random() * 9000));
    await N().set(P(code), room);
    await N().set(`secrets/${code}`, { hallKey }); // 학생은 읽을 수 없는 곳 (Firebase 규칙)
    return { code, hallKey };
  }
  async function joinHall(code, key) {
    const meta = await N().get(P(code, 'meta'));
    if (!meta) fail('수업 코드가 없어요.');
    try { await N().set(P(code, `hosts/${N().uid()}`), String(key)); } catch (e) { fail('종합상황실 키가 달라요.'); }
    const ok = await N().get(P(code, `hosts/${N().uid()}`));
    if (N().mode === 'local') { const sec = await N().get(`secrets/${code}`); if (!sec || sec.hallKey !== String(key)) { await N().remove(P(code, `hosts/${N().uid()}`)); fail('종합상황실 키가 달라요.'); } }
    if (!ok) fail('종합상황실 키가 달라요.');
    return meta;
  }
  const isHost = (R) => !!R && (R.meta.teacher === N().uid() || !!(R.hosts || {})[N().uid()]);

  // ◀ / ▶ : 대기실 → 단계들 → 수업 끝. 대기실에서 ▶ = 수업 시작(대기실 인원 확정)
  async function go(code, R, L, dir) {
    const i = R.state.step ?? -1;
    if (dir > 0 && i < 0) {
      const studs = Object.entries(R.players || {}).filter(([, p]) => !p.teacher).map(([u]) => u);
      if (!studs.length) fail('입장한 학생이 없어요.');
      await N().update(P(code), { active: Object.fromEntries(studs.map((u) => [u, true])), 'state/headcount': studs.length, 'state/step': 0, 'state/stepAt': N().TS });
      return;
    }
    const next = Math.max(-1, Math.min(L.steps.length, i + dir));
    if (next === i) return;
    await N().update(P(code, 'state'), { step: next, stepAt: N().TS });
  }
  const setPct = (code, mid, pct) => N().set(P(code, `state/pct/${mid}`), Math.max(10, Math.min(100, Math.round(pct))));
  // 미제출 학생 빼고 판정 (결석·폰 고장)
  const skip = (code, mid, uids) => N().update(P(code, `state/skip/${mid}`), Object.fromEntries(uids.map((u) => [u, true])));
  const setActive = (code, uid, on) => N().set(P(code, `active/${uid}`), on ? true : null);
  const clearHelp = (code, uid) => N().remove(P(code, `help/${uid}`));

  // ── 학생 ────────────────────────────────────────────────
  async function join(code, info) {
    const R = await N().get(P(code));
    if (!R || !R.meta) fail('수업 코드가 없어요. 다시 확인해 주세요.');
    const L = DS.Lessons.get(R.meta.lesson);
    if (L && Raid.isEnd(L, R)) fail('이미 끝난 수업이에요.');
    const me = N().uid();
    const dup = Object.entries(R.players || {}).find(([u, p]) => u !== me && !p.teacher && Number(p.num) === Number(info.num));
    if (dup) fail(`${info.num}번은 이미 입장했어요. 번호를 확인해 주세요.`);
    await N().set(P(code, `players/${me}`), { num: Number(info.num), nick: String(info.nick).slice(0, 8), hero: Number(info.hero) || 0, ...(info.cls ? { cls: String(info.cls) } : {}), at: N().TS });
    return R.meta;
  }
  const help = (code, on) => N().set(P(code, `help/${N().uid()}`), on ? true : null);
  async function submit(code, R, mid, attempt, given) {
    const step = DS.Lessons.get(R.meta.lesson).steps[R.state.step];
    if (!step || step.id !== mid) fail('지금은 이 몬스터와 싸우는 시간이 아니에요.');
    if (attempt > Raid.RETRIES) fail('재도전 기회를 모두 썼어요.');
    const me = N().uid();
    if ((((R.subs || {})[mid] || {})[me] || {})[attempt] != null) return;
    await N().set(P(code, `subs/${mid}/${me}/${attempt}`), N().pack(given));
  }
  const bossAnswer = (code, set, answers) => N().set(P(code, `bossAns/${N().uid()}/${set}`), N().pack(answers));

  // 저장 모양(JSON 문자열) → 규칙 함수가 쓰는 모양
  function unpackRoom(R) {
    const out = JSON.parse(JSON.stringify(R || {}));
    Object.values(out.subs || {}).forEach((byU) => Object.values(byU).forEach((byA) => Object.keys(byA).forEach((k) => { if (typeof byA[k] === 'string') byA[k] = N().unpack(byA[k]); })));
    Object.values(out.bossAns || {}).forEach((bySet) => Object.keys(bySet).forEach((k) => { if (typeof bySet[k] === 'string') bySet[k] = N().unpack(bySet[k]); }));
    return out;
  }

  return { getPrep, setImage, setDefaultPct, createRoom, joinHall, isHost, go, setPct, skip, setActive, clearHelp, join, help, submit, bossAnswer, unpackRoom, P };
})();
