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
  const setVideo = (lessonId, slot, url) => N().set(prepPath(lessonId, `video/${slot}`), url || null); // 🎬 설명 영상 링크 (유튜브 · 드라이브)
  const setDefaultPct = (lessonId, pct) => N().set(prepPath(lessonId, 'pct'), Number(pct));

  // ── 교사 ────────────────────────────────────────────────
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  // cls: 이 수업을 여는 반 → 그 반 학생들의 모닥불에 이 차시 차원문이 실시간으로 나타난다 (live/{반})
  async function createRoom(lessonId, cls) {
    let code;
    for (let i = 0; i < 20; i++) { code = String(100000 + Math.floor(Math.random() * 900000)); if (!(await N().get(P(code, 'meta')))) break; }
    let pct = null;
    try { pct = await N().get(prepPath(lessonId, 'pct')); } catch (e) { /* 준비 안 했으면 차시 기본값 */ }
    const room = Raid.newRoom(code, lessonId, N().uid(), N().now(), pct);
    if (cls) room.meta.cls = String(cls);
    let think = null;
    try { think = await N().get(prepPath(lessonId, 'think')); } catch (e) { /* 기본 5초 */ }
    const Lp = DS.Lessons.get(lessonId);
    room.meta.think = think != null ? Number(think) : Lp && Lp.think != null ? Lp.think : 5;
    room.meta.created = N().TS;
    room.state.stepAt = N().TS;
    const hallKey = String(1000 + Math.floor(Math.random() * 9000));
    await N().set(P(code), room);
    await N().set(`secrets/${code}`, { hallKey }); // 학생은 읽을 수 없는 곳 (Firebase 규칙)
    if (cls) {
      const L = DS.Lessons.get(lessonId);
      await N().set(`live/${ck(cls)}`, { code, lesson: lessonId, no: (L && L.no) || 0, theme: (L && L.theme) || '', open: true, at: N().TS });
      await unlockFor(L, [cls]);
    }
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
      await N().update(P(code), { active: Object.fromEntries(studs.map((u) => [u, true])), 'state/headcount': studs.length, 'state/step': 0, 'state/stepAt': N().TS, 'state/focus': Raid.autoFocus(L.steps[0]) });
      await unlockFor(L, studs.map((u) => (R.players[u] || {}).cls).filter(Boolean));
      return;
    }
    if (dir > 0 && i >= L.steps.length) { // 마무리 → 수업 끝 (학생은 모닥불로 · 차원문은 꺼진 채 남음)
      await N().update(P(code, 'state'), { closed: true, focus: false, stepAt: N().TS });
      const cls = (R.meta || {}).cls;
      if (cls) { const lv = await N().get(`live/${ck(cls)}`).catch(() => null); if (lv && lv.code === code) await N().set(`live/${ck(cls)}/open`, false); }
      return;
    }
    const next = Math.max(-1, Math.min(L.steps.length, i + dir));
    if (next === i) return;
    await N().update(P(code, 'state'), { step: next, stepAt: N().TS, focus: Raid.autoFocus(L.steps[next]), closed: null, sheet: null }); // 단계가 바뀌면 문제 화면은 닫힘
  }
  // 모루 레시피는 반마다 "배포한 차시까지" 열린다: unlock/{반} = 가장 큰 차시 번호
  async function unlockFor(L, classes) {
    if (!L.no) return;
    for (const c of [...new Set(classes)]) {
      const k = String(c).replace(/[.#$/[\]]/g, '_');
      try { const was = Number(await N().get(`unlock/${k}`)) || 0; if (L.no > was) await N().set(`unlock/${k}`, L.no); } catch (e) { /* 규칙상 교사만 — 실패해도 수업은 계속 */ }
    }
  }
  const setThink = (lessonId, sec) => N().set(prepPath(lessonId, 'think'), Number(sec));
  // 📄 문제 화면: 종합상황실에 지금 문제의 학습지 이미지를 크게 (교사 해설용, 레이드는 뒤에서 계속)
  const setSheet = (code, on) => N().set(P(code, 'state/sheet'), on ? true : null);
  const setFocus = (code, on) => N().set(P(code, 'state/focus'), !!on);
  const setPct = (code, mid, pct) => N().set(P(code, `state/pct/${mid}`), Math.max(10, Math.min(100, Math.round(pct))));
  // 미제출 학생 빼고 판정 (결석·폰 고장)
  const skip = (code, mid, uids) => N().update(P(code, `state/skip/${mid}`), Object.fromEntries(uids.map((u) => [u, true])));
  const setActive = (code, uid, on) => N().set(P(code, `active/${uid}`), on ? true : null);
  // v0.8.1: 어느 단계에서든 수업 끝 (선생님이 나가면서 · 교사 메뉴 「⏹ 끝내기」) → 학생은 결과 → 모닥불, 차원문 꺼짐
  async function endClass(code) {
    const R = await N().get(P(code)); if (!R || !R.meta) return;
    await N().update(P(code, 'state'), { closed: true, focus: false, stepAt: N().TS });
    const cls = R.meta.cls;
    if (cls) { const lv = await N().get(`live/${ck(cls)}`).catch(() => null); if (lv && lv.code === code) await N().set(`live/${ck(cls)}/open`, false); }
  }
  // 늦게 온 학생: 참여 명단에 넣고, 지금 몬스터는 기다리지 않게 건너뜀 (교사 · 종합상황실 기기에서)
  const admitting = {};
  async function admitLate(code, R, L) {
    const late = Raid.lateIds(R).filter((u) => !admitting[u]); if (!late.length) return;
    const step = Raid.stepOf(L, R);
    late.forEach((u) => { admitting[u] = true; });
    const patch = {};
    late.forEach((u) => { patch[`active/${u}`] = true; if (step && step.kind === 'monster') patch[`state/skip/${step.id}/${u}`] = true; });
    await N().update(P(code), patch).catch(() => {});
    late.forEach((u) => { delete admitting[u]; });
  }
  const clearHelp = (code, uid) => N().remove(P(code, `help/${uid}`));

  // ── 학생 ────────────────────────────────────────────────
  async function join(code, info) {
    const R = await N().get(P(code));
    if (!R || !R.meta) fail('수업 코드가 없어요. 다시 확인해 주세요.');
    const L = DS.Lessons.get(R.meta.lesson);
    if (L && Raid.isClosed(R)) fail('이미 끝난 수업이에요.');
    const me = N().uid();
    const dup = Object.entries(R.players || {}).find(([u, p]) => u !== me && !p.teacher && Number(p.num) === Number(info.num));
    if (dup) fail(`${info.num}번은 이미 입장했어요. 번호를 확인해 주세요.`);
    const was = (R.players || {})[me] || {};
    await N().set(P(code, `players/${me}`), { num: Number(info.num), nick: String(info.nick).slice(0, 8), hero: Number(info.hero) || 0, fx: info.fx || 'flame', ...(info.cls ? { cls: String(info.cls) } : {}), ...(was.lobby ? { lobby: true } : {}), at: N().TS });
    return R.meta;
  }
  // 접속 표시: 연결이 끊기면 서버가 지운다 (Firebase onDisconnect)
  const presence = (code) => N().presence(P(code, `online/${N().uid()}`));
  const toLobby = (code) => N().set(P(code, `players/${N().uid()}/lobby`), true);
  // 마지막 한마디: 20자 · 처음 1번 + 고치기 1번 · 욕설은 ＊ 로 가리고 bad 표시 (교사 목록 맨 위)
  async function say(code, R, text) {
    const me = N().uid(), was = (R.words || {})[me];
    if (was && (was.n || 0) >= 2) fail('한마디는 한 번 고칠 수 있어요. 이미 고쳤어요.');
    const c = DS.Words.clean(text);
    if (!c.text) fail('한마디를 써 주세요.');
    await N().set(P(code, `words/${me}`), { t: c.text, bad: c.bad || null, n: (was ? was.n || 1 : 0) + 1 });
  }
  const hideWord = (code, uid, on) => N().set(P(code, `hide/${uid}`), on ? true : null);
  const lockWords = (cls, num, on) => N().set(`wordLock/${String(cls).replace(/[.#$/[\]]/g, '_')}/${num}`, on ? true : null);
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

  return { endClass, admitLate, getPrep, setImage, setVideo, setDefaultPct, setThink, createRoom, joinHall, isHost, go, setSheet, setFocus, unlockFor, presence, toLobby, say, hideWord, lockWords, setPct, skip, setActive, clearHelp, join, help, submit, bossAnswer, unpackRoom, P };
})();
