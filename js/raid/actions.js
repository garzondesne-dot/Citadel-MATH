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
  const setImage = async (lessonId, slot, dataUrl) => { await N().set(prepPath(lessonId, `img/${slot}`), dataUrl || null); await N().set(prepPath(lessonId, `has/${slot}`), dataUrl ? true : null); };
  // v0.8.8: 학생 폰은 차시 정보 전체(학습지 이미지 모두)를 받지 않는다 → 가벼운 정보(영상 링크 · 이미지 있음 표시)만 먼저, 이미지는 누를 때 한 장씩
  async function prepLite(lessonId) {
    const [video, has] = await Promise.all([N().get(prepPath(lessonId, 'video')).catch(() => null), N().get(prepPath(lessonId, 'has')).catch(() => null)]);
    return { video: video || {}, has: has || null };
  }
  const prepImg = (lessonId, slot) => N().get(prepPath(lessonId, `img/${slot}`)).catch(() => null);
  const hasImg = (p, slot) => !!((p.img || {})[slot] || (p.has ? p.has[slot] : true)); // 표시가 없던 예전 자료는 일단 버튼을 보여 주고 누를 때 확인
  const setVideo = (lessonId, slot, url) => N().set(prepPath(lessonId, `video/${slot}`), url || null); // 🎬 설명 영상 링크 (유튜브 · 드라이브) 또는 'file'
  // 🎞 영상 파일 직접 올리기 (v0.8.7): 파일은 prepVideo/{차시}/{칸} 에 따로 (학생이 차시 정보를 읽을 때 같이 받지 않게), 표시는 video/{칸} = 'file'
  async function setVideoFile(lessonId, slot, dataUrl) {
    if (dataUrl) { await N().set(`prepVideo/${lessonId}/${slot}`, dataUrl); await setVideo(lessonId, slot, 'file'); }
    else { await setVideo(lessonId, slot, null); await N().remove(`prepVideo/${lessonId}/${slot}`).catch(() => {}); }
  }
  const setDefaultPct = (lessonId, pct) => N().set(prepPath(lessonId, 'pct'), Number(pct));

  // ── 교사 ────────────────────────────────────────────────
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  // cls: 이 수업을 여는 반 → 그 반 학생들의 모닥불에 이 차시 차원문이 실시간으로 나타난다 (live/{반})
  // opt.slot (v0.9.7.0 시간표 예약 수업): { key, p, from, to } → 차원문(live) · 해금은 지금 안 함 (학생 캠프는 slots 로 시각에 맞춰 켬 · 해금은 수업 시작 때)
  // 🔄 차시 바꾸기: 대기실(수업 시작 전)에서만 · 같은 코드 그대로 학생 폰 · 종합실이 새 차시로 (교사 리모컨 · 종합실)
  async function switchLesson(code, R, lessonId) {
    const L = DS.Lessons.get(lessonId); if (!L) fail('없는 차시예요.');
    if (!Raid.isLobby(R)) fail('수업을 시작한 뒤에는 차시를 바꿀 수 없어요. 새 수업을 열어 주세요.');
    if (R.meta && R.meta.lesson === lessonId) return;
    let pct = null, think = null;
    try { pct = await N().get(prepPath(lessonId, 'pct')); } catch (e) { /* 준비 안 했으면 차시 기본값 */ }
    try { think = await N().get(prepPath(lessonId, 'think')); } catch (e) { /* 기본 */ }
    let solve = null; try { solve = await N().get(prepPath(lessonId, 'solve')); } catch (e) { /* 기본 60 */ }
    await N().update(P(code, 'state'), { lsolve: solve != null ? Number(solve) : 60, lesson: lessonId, lpct: pct != null ? Number(pct) : null, lthink: think != null ? Number(think) : L.think != null ? L.think : 5, lessonAt: N().TS });
    const cls = R.meta && R.meta.cls; // 학생 캠프 문 꼬리표 (교사만 쓸 수 있는 칸 · 종합실이면 넘어감)
    if (cls) { try { const lv = await N().get(`live/${ck(cls)}`); if (lv && lv.code === code) await N().update(`live/${ck(cls)}`, { lesson: lessonId, no: L.no || 0, theme: L.theme || '' }); } catch (e) { /* 권한 없음 */ } }
  }
  async function createRoom(lessonId, cls, opt = {}) {
    let code;
    for (let i = 0; i < 20; i++) { code = String(100000 + Math.floor(Math.random() * 900000)); if (!(await N().get(P(code, 'meta')))) break; }
    let pct = null;
    try { pct = await N().get(prepPath(lessonId, 'pct')); } catch (e) { /* 준비 안 했으면 차시 기본값 */ }
    if (DS.Art && DS.Art.loadTeacherCfg) await DS.Art.loadTeacherCfg(); // 🧙 #32 선생님 모습 · 소리 = 서버 gcfg/teacher
    const room = Raid.newRoom(code, lessonId, N().uid(), N().now(), pct, DS.Art ? DS.Art.teacherHero() : 7, DS.Art && DS.Art.teacherLook ? DS.Art.teacherLook().fx : undefined);
    if (cls) room.meta.cls = String(cls);
    { const sd = DS.Art && DS.Art.teacherCfg ? DS.Art.teacherCfg().sound : null; if (sd && typeof sd === 'object') room.state.sound = { sfx: sd.sfx !== false, bgm: sd.bgm !== false, vol: sd.vol === 'low' ? 'low' : 'mid' }; } // 🔊 #32 지난번 종합실 소리 그대로
    if (opt.slot) room.meta.slot = { key: String(opt.slot.key), p: Number(opt.slot.p), from: Number(opt.slot.from), to: Number(opt.slot.to), ...(opt.slot.extra ? { extra: true } : {}) };
    // ⏳ 보스 타임바 (2026-11-05 사용자): 교시 끝 = 문 닫힘 (opt.noLimit = 시간 제한 끄기 · 시험 · 시연)
    const dl = opt.noLimit || !DS.Sched ? null : opt.slot ? DS.Sched.periodEnd(Number(opt.slot.from), Number(opt.slot.p)) : DS.Sched.periodEnd(N().now());
    if (dl) room.meta.deadline = dl;
    if (opt.resume != null) { room.meta.resumeFrom = Number(opt.resume); if (opt.resumeOf) room.meta.resumeOf = String(opt.resumeOf); } // ▶ 지난 수업 이어서 (2026-11-06)
    if (opt.noLimit) room.meta.noLimit = true; // 2026-11-06: 시간 제한 끈 방 표시 (수업 시작 때 50분을 새로 잡지 않게)
    let think = null;
    try { think = await N().get(prepPath(lessonId, 'think')); } catch (e) { /* 기본 5초 */ }
    const Lp = DS.Lessons.get(lessonId);
    room.meta.think = think != null ? Number(think) : Lp && Lp.think != null ? Lp.think : 5;
    { let sv = null; try { sv = await N().get(prepPath(lessonId, 'solve')); } catch (e) { /* 기본 60 */ } room.meta.solve = sv != null ? Number(sv) : 60; } // 📝 풀이 시간 (중단원 평가 문항 기본 · 2026-11-06)
    // 🔥 반 최고 콤보 · 🏁 반대항 끄기 (v0.9.11)
    if (cls) { try { const cb = await N().get(`combo/${ck(cls)}`); room.meta.comboBest = Number((cb || {}).best) || 0; } catch (e) { room.meta.comboBest = 0; } }
    try { if ((await N().get(prepPath('_cfg', 'punchOff'))) === true) room.meta.punchOff = true; } catch (e) { /* 기본 켬 */ }
    if (cls) { try { const ot = await finishOvertime(cls); if (ot) room.meta.otShow = ot; } catch (e) { /* 연장전 결과는 다음에 */ } }
    room.meta.created = N().TS;
    room.state.stepAt = N().TS;
    let fixed = null; try { fixed = await N().get('tcfg/hallPw'); } catch (e) { /* 규칙 게시 전 · 권한 없음 → 무작위 */ }
    const hallKey = /^\d{4}$/.test(String(fixed || '')) ? String(fixed) : String(1000 + Math.floor(Math.random() * 9000)); // 🖥 고정 비밀번호 (2026-11-05) · 없으면 무작위
    await N().set(P(code), room);
    await N().set(`secrets/${code}`, { hallKey }); // 학생은 읽을 수 없는 곳 (Firebase 규칙)
    // 📖 수업 일지는 2026-11-05 사용자 결정으로 없앰 (출석부와 함께)
    if (cls && !opt.slot) {
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
      const s0 = Math.max(0, Math.min(L.steps.length - 1, Number(R.meta.resumeFrom) || 0)), f0 = Raid.autoFocus(L.steps[s0]), plan = DS.Combo ? DS.Combo.batPlan(L, Math.random(), Math.random()) : null;
      // ⏳ 2026-11-06 사용자 「50분 제한이 안 보임」: 방을 교시 밖에서 열어 문 닫힘 시각이 없으면 → 수업 시작 때 그 교시 끝(없으면 지금 + 50분)
      const dl0 = (!R.meta.deadline || R.meta.deadline < N().now() + 5 * 60e3) && !R.meta.noLimit ? ((DS.Sched && DS.Sched.periodEnd(N().now())) || N().now() + 50 * 60e3) : null;
      if (dl0) await N().set(P(code, 'state/deadline'), dl0).catch(() => {}); // 2026-11-06 검증: 지난 교시 끝에 방을 만들어 둔 경우(마감이 이미 지났거나 5분 안)도 수업 시작 시각 기준으로 다시 잡음 (바로 「문을 닫았다」 방지)
      await N().update(P(code), { active: Object.fromEntries(studs.map((u) => [u, true])), 'state/headcount': studs.length, 'state/step': s0, 'state/stepAt': N().TS, 'state/focus': f0, 'state/focusAt': f0 ? N().now() : null, 'state/pauseMs': null, 'state/batPlan': plan, 'state/cpAt': f0 ? N().now() : null, 'state/cpMs': 0 });
      const clss = [...new Set(studs.map((u) => (R.players[u] || {}).cls).filter(Boolean))];
      await unlockFor(L, clss);
      clss.forEach((c) => N().set(`held/${ck(c)}/${L.id}`, true).catch(() => {}));
      if (R.meta.resumeFrom != null && R.meta.cls) N().set(`${prepPath(L.id, 'resume')}/${ck(R.meta.cls)}`, null).catch(() => {}); // 이어서 시작 = 저장 지점 지움 // 📕 그 반이 게임으로 수업한 차시 (오답노트 「불참」 판단 · v0.9.7.9)
      return;
    }
    if (dir > 0 && i >= L.steps.length) { // 마무리 → 수업 끝 (학생은 내 캠프로 · 차원문은 꺼진 채 남음)
      await savePunch(code, unpackRoom(R), L, { final: true }).catch(() => {}); // 🥊 끝내기 전에 저장 → 학생이 결과를 볼 때 이미 있음
      await N().update(P(code, 'state'), { closed: true, focus: false, stepAt: N().TS });
      const cls = (R.meta || {}).cls;
      if (cls) { const lv = await N().get(`live/${ck(cls)}`).catch(() => null); if (lv && lv.code === code) await N().set(`live/${ck(cls)}/open`, false); }
      return;
    }
    const next = Math.max(-1, Math.min(L.steps.length, i + dir));
    if (next === i) return;
    const fN = Raid.autoFocus(L.steps[next]), st0 = R.state || {};
    await N().update(P(code, 'state'), { step: next, stepAt: N().TS, focus: fN, focusAt: fN ? N().now() : null, pauseMs: null, closed: null, sheet: null, video: null, ...cp(st0, { focus: fN, video: null }) }); // 단계가 바뀌면 문제 화면 · 영상은 닫힘
    if (next >= L.steps.length) savePunch(code, unpackRoom(R), L).catch(() => {}); // 🥊 마무리에 들어서면 반대항 점수 (끝낼 때 한 번 더)
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
  const setSound = async (code, v) => { const sd = { sfx: !!v.sfx, bgm: !!v.bgm, vol: v.vol === 'low' ? 'low' : 'mid' }; await N().set(P(code, 'state/sound'), sd); if (DS.Art && DS.Art.saveTeacherCfg) await DS.Art.saveTeacherCfg('sound', sd); }; // 🧙 #32 다음 수업도 이 소리 // 🔇 2026-11-06: 교사 리모컨 → 종합실 효과음 · 배경음
  async function setVideoOn(code, stepId) { // 🎬 큰 화면에 설명 영상 (null = 닫기) · 🔥 콤보 시계 멈춤 (v0.9.11)
    const st = (await N().get(P(code, 'state'))) || {};
    await N().update(P(code, 'state'), { video: stepId || null, ...cp(st, { video: stepId || null }) });
  }
  // 🔥 콤보 시계 멈춤 (쉼터 · OX 타임 · 영상 · 집중모드): 바뀐 뒤 상태를 보고 cpAt · cpMs 를 같이 적는다
  const cp = (st, next) => (DS.Combo ? DS.Combo.cpPatch(st, next, N().now()) : {});
  // 집중모드: 켜고 끈 시각을 남겨 👾 몬스터 공격 게이지가 모두 함께 멈춘다 (state.focusAt · pauseMs)
  async function setFocus(code, on) {
    const st = (await N().get(P(code, 'state'))) || {};
    if (!!on === !!st.focus) return;
    if (on) await N().update(P(code, 'state'), { focus: true, focusAt: N().now(), ...cp(st, { focus: true }) });
    else await N().update(P(code, 'state'), { focus: false, focusAt: null, pauseMs: (st.pauseMs || 0) + Math.max(0, N().now() - (st.focusAt || N().now())), ...cp(st, { focus: false }) });
  }
  // 🏕 쉼터: 켜면 { at, min(기본 5분) } · 끄면 쉰 시간을 pauseMs 에 더해 몬스터 공격 게이지가 이어짐 · 분 조절은 쉼터 중에
  async function setRest(code, on, min, opt = {}) { // opt.quiz (v0.9.8.1): ⭕ OX 타임 = 쉼터처럼 멈추되 이름만 다름
    const st = (await N().get(P(code, 'state'))) || {};
    if (on && !st.rest) await N().update(P(code, 'state'), { rest: { at: N().now(), min: Number(min) || 5, ...(opt.quiz ? { quiz: true } : {}) }, ...cp(st, { rest: true }) });
    if (!on && st.rest) await N().update(P(code, 'state'), { rest: null, pauseMs: (st.pauseMs || 0) + Math.max(0, N().now() - (st.rest.at || N().now())), ...cp(st, { rest: null }) });
    if (!on && DS.Fun) await DS.Fun.stop(code).catch(() => {}); // 쉼터가 끝나면 ⚖ 밸런스 게임도 끝
  }
  const restMinDef = () => { const m = Number(DS.Art && DS.Art.teacherCfg ? DS.Art.teacherCfg().restMin : 0); return m >= 1 && m <= 20 ? m : 5; }; // 🧙 #32 쉼터 분 = 지난번 값
  const setRestMin = async (code, min) => { const m = Math.max(1, Math.min(20, Math.round(Number(min) || 5))); await N().set(P(code, 'state/rest/min'), m); if (DS.Art && DS.Art.saveTeacherCfg) await DS.Art.saveTeacherCfg('restMin', m); };
  const setPct = (code, mid, pct) => N().set(P(code, `state/pct/${mid}`), Math.max(10, Math.min(100, Math.round(pct))));
  // 미제출 학생 빼고 판정 (결석·폰 고장)
  const skip = (code, mid, uids) => N().update(P(code, `state/skip/${mid}`), Object.fromEntries(uids.map((u) => [u, true])));
  const setActive = (code, uid, on) => N().set(P(code, `active/${uid}`), on ? true : null);
  // v0.8.1: 어느 단계에서든 수업 끝 (선생님이 나가면서 · 교사 메뉴 「⏹ 끝내기」) → 학생은 결과 → 모닥불, 차원문 꺼짐
  async function endClass(code, opt = {}) {
    const R = await N().get(P(code)); if (!R || !R.meta) return;
    { const U = unpackRoom(R), Lx = DS.Lessons.get(R.meta.lesson); if (Lx) await savePunch(code, U, Lx, { final: true, ot: !!(opt.rift && R.meta.cls) }).catch(() => {}); }
    const Ue = unpackRoom(R), Le = DS.Lessons.get(Ue.meta.lesson); // 📅 진도: 마무리까지 가서 「수업 끝」= 그 차시를 끝냄 (⏸ 저장 · 시간 초과 · 중간에 끝내기 = 그대로 · 2026-11-06 사용자)
    const done = !!(Le && !opt.saved && !Raid.isLobby(Ue) && Raid.isEnd(Le, Ue)); // 마무리(마지막 한마디)까지 갔으면 = 진도를 나감 (종이 쳐서 닫혀도) · ⏸ 저장은 그대로
    await N().update(P(code, 'state'), { closed: true, focus: false, stepAt: N().TS, ...(opt.timeUp ? { timeUp: N().TS } : {}), ...(done ? { progDone: Le.id, progDoneAt: N().TS } : {}) });
    const cls = R.meta.cls;
    if (done && cls && DS.Sched && DS.Sched.advance) await DS.Sched.advance(cls, Le.id).catch(() => {}); // 교사만 (종합실이면 교사 기기가 나중에 채움)
    if (R.meta.slot && R.meta.slot.extra && R.meta.slot.key) await N().remove(`sched/extra/${R.meta.slot.key}`).catch(() => {}); // ➕ 보충 칸 = 수업이 끝나면 사라짐
    if (cls) { const lv = await N().get(`live/${ck(cls)}`).catch(() => null); if (lv && lv.code === code) await N().set(`live/${ck(cls)}/open`, false); }
    // ⏳ 이어하기 포털(빨간 던전)은 2026-11-09 선생님 결정으로 없앰 — 수업은 선생님이 「지난 수업 이어서」로 이어감 (openRift 는 남겨 둠 · 부르지 않음)
  }
  // ⏸ 수업 끝 (저장) (2026-11-06 사용자 「세이브 기능처럼 선생님이 수업 중간에 끝내는 기능 · 수업 끝 상시 배치」): 지금 단계를 저장하고 끝냄
  //   → 다음에 같은 반 · 같은 차시를 열면 교사 메뉴에 「▶ 지난 수업 이어서」 · 저장 = 방 state.savedStop (종합실도) + prep/{차시}/resume/{반} (교사)
  // 📝 풀이 시간 조절 (교사 리모컨 · 종합실): sec = 기본 초(중단원 문항) · on = 지금 단계 켜기/끄기 · now = 지금 풀기(잠금 해제)
  async function setSolve(code, R, L, o = {}) {
    const st = Raid.stepOf(L, R), id = st ? (st.kind === 'boss' ? 'boss' : st.id) : null, patch = {};
    if (o.sec != null) patch.solve = Math.max(0, Math.min(300, Math.round(Number(o.sec))));
    if (id && o.on === true) patch[`solveOn/${id}`] = { sec: Math.max(10, Number(o.onSec) || Number(patch.solve ?? (R.state || {}).solve ?? (R.meta || {}).solve ?? 60)), at: N().TS };
    if (id && o.on === false) patch[`solveOn/${id}`] = 0;
    if (id && o.now) patch[`solveEnd/${id}`] = N().TS;
    if (id && o.add) { const lk = Raid.solveLock(L, R, N().now()); if (lk && lk.on) { if (Number(o.add) < 0 && lk.left <= -Number(o.add) * 1000) patch[`solveEnd/${id}`] = N().TS; else patch[`solveOn/${id}`] = { sec: Math.max(1, Math.round((lk.end - lk.t0) / 1000 + Number(o.add))), at: lk.t0 }; } } // 줄이기: 남은 시간보다 많이 줄이면 바로 등장
    if (Object.keys(patch).length) await N().update(P(code, 'state'), patch);
    if (patch.solve != null && L && L.id) await N().set(prepPath(L.id, 'solve'), patch.solve).catch(() => {}); // 🧙 #32 풀이 시간 = 다음 수업에도 (차시 준비 칸)
  }
  // ⚔ 소레이드 (2026-11-09 #18): 단계 답 한 개 · 선생님 「✔ 풀어주기」
  async function chainSubmit(code, packed, mid, s, p, g, w) { // w = 1 → 💡 근거 빈칸 답 (2026-11-09 #26)
    const R = unpackRoom(packed), L = DS.Lessons.get(R.meta.lesson), me = N().uid(), rec = Raid.record(L, R, mid, me);
    if (!p && (rec.locked || rec.fail || rec.done)) fail(rec.locked ? '🙋 선생님 확인을 기다려요' : '이 문제는 끝났어요');
    await N().set(P(code, `chain/${mid}/${me}/${rec.nextK}`), { s, p: p || 0, g: g == null ? '' : g, ...(w ? { w: 1 } : {}), at: N().TS });
    return Raid.record(L, { ...R, chain: { ...(R.chain || {}), [mid]: { ...((R.chain || {})[mid] || {}), [me]: { ...(((R.chain || {})[mid] || {})[me] || {}), [rec.nextK]: { s, p: p || 0, g, ...(w ? { w: 1 } : {}) } } } } }, mid, me);
  }
  // 💡 힌트 주기 (2026-11-09 #26): 근거 줄을 맞힌 학생만 · 소레이드마다 한 번 · players/{나}/hint/{mid} (규칙 바꿈 없음)
  async function giveHint(code, packed, mid) {
    const R = unpackRoom(packed), L = DS.Lessons.get(R.meta.lesson), me = N().uid(), rec = Raid.record(L, R, mid, me);
    if (!rec.whyOk) fail('💡 근거 줄을 먼저 맞혀야 힌트를 줄 수 있어요 (🔥 한 판 더)');
    if ((((R.players || {})[me] || {}).hint || {})[mid]) fail('이 소레이드에서는 이미 힌트를 줬어요');
    await N().set(P(code, `players/${me}/hint/${mid}`), N().TS);
  }
  // ✍ → 📸 진필살기 (2026-11-09 #26): 찰칵 = 예고(TV ⚡ 충전 중 게이지) · 통과 = 🌟 진필살기(스킬 상관없이 · 석화는 몬스터당 반 1번 · 다음은 금빛 컷인만 3명) · 몬스터가 이미 쓰러졌으면 ⚡ 충전 1개
  const snapStart = (code, mid) => N().set(P(code, `players/${N().uid()}/snap`), { mid, at: N().TS });
  async function snapEnd(code, packed, mid, res, peek) {
    const R = unpackRoom(packed), me = N().uid(), p = (R.players || {})[me] || {}, used = res && (res.status === 'check' || res.status === 'appeal') ? Math.max(0, ((res.scores || []).length) - 1) : Math.max(res ? 1 : 0, ((res && res.scores) || []).length), n = (Number((p.ph || {})[mid]) || 0) + used; // ⏳ 선생님 확인으로 넘어간 장 · 창만 닫은 경우는 안 셈
    await N().update(P(code, `players/${me}`), { snap: null, [`ph/${mid}`]: n, ...(res && res.status === 'pass' ? { [`wr/${mid}`]: peek ? 'peek' : 'ok' } : {}) });
    if (!res || res.status !== 'pass' || peek) return null;
    return photoTrue(code, R, mid);
  }
  async function photoTrue(code, R, mid) {
    const L = DS.Lessons.get(R.meta.lesson), me = N().uid(), step = L.steps[R.state.step], k = Raid.healsGiven(R, mid, me);
    if (!step || step.id !== mid || Raid.cleared(L, R, mid)) { const c = Number(((R.players || {})[me] || {}).charge) || 0; await N().set(P(code, `players/${me}/charge`), c + 1); return 'charge'; }
    if (!Raid.petrify(R, mid)) { await N().set(P(code, `heals/${mid}/${me}/${k}`), `!true@${N().now()}`); return 'true'; }
    if (Raid.tcutN(R, mid) < 3) { await N().set(P(code, `heals/${mid}/${me}/${k}`), `!tcut@${N().now()}`); return 'cut'; }
    return 'done';
  }
  // 🛡 홀리 방패 (2026-11-09): 켜기 / 끄기 (한 번 더 = 끔) · 막은 순간 = 내 칸에 막은 시각 + 켬 지움 (학생 자기 칸 · 규칙 안 바꿈)
  async function holyArm(code, mid, on) { const me = N().uid(); await N().set(P(code, `players/${me}/hg`), on ? { mid: String(mid), at: N().now() } : null); }
  async function holyUse(code, mid) { const me = N().uid(); await N().update(P(code, `players/${me}`), { [`holy/${mid}`]: N().now(), hg: null }); }
  async function useCharge(code, packed) { // ⚡ 저장해 둔 진필살기 → 지금 몬스터
    const R = unpackRoom(packed), L = DS.Lessons.get(R.meta.lesson), me = N().uid(), step = L.steps[R.state.step], c = Number(((R.players || {})[me] || {}).charge) || 0;
    if (!c) fail('⚡ 충전된 진필살기가 없어요'); if (!step || step.kind !== 'monster' || Raid.cleared(L, R, step.id)) fail('지금 싸우는 몬스터가 있을 때 쓸 수 있어요');
    await N().set(P(code, `players/${me}/charge`), c - 1);
    const k = Raid.healsGiven(R, step.id, me);
    await N().set(P(code, `heals/${step.id}/${me}/${k}`), Raid.petrify(R, step.id) ? `!tcut@${N().now()}` : `!true@${N().now()}`);
  }
  const chainKnock = (code, mid, k) => N().set(P(code, `state/chainDown/${mid}/${k}`), true); // 💥 리모컨 「쓰러뜨리기」 (state 아래 · 규칙 바꿈 없음)
  const chainRelease = (code, mid, uid) => N().set(P(code, `chainOk/${mid}/${uid}`), true);
  const scoutReady = (code, id) => N().set(P(code, `ready/${id}/${N().uid()}`), N().TS); // 🌫 정찰 ✋ 준비 완료 (2026-11-09 #17)
  async function saveEnd(code) {
    const raw = await N().get(P(code)); if (!raw || !raw.meta) return;
    const R = unpackRoom(raw), L = DS.Lessons.get(R.meta.lesson), i = (R.state || {}).step ?? -1;
    if (!L || i < 0 || Raid.isClosed(R)) fail('진행 중인 수업이 아니에요.');
    const stop = Math.min(i, L.steps.length - 1);
    await N().update(P(code, 'state'), { savedStop: stop });
    const cls = R.meta.cls; if (cls) await N().set(`${prepPath(L.id, 'resume')}/${ck(cls)}`, { stop, code, at: N().TS }).catch(() => {}); // 교사만 (종합실이면 방 기록만)
    return endClass(code, { saved: true });
  }
  async function resumeInfo(lessonId, cls, codes = []) { // 이어서 할 곳 { stop, code, title } | null
    const L = DS.Lessons.get(lessonId); if (!L || !cls) return null;
    let r = await N().get(`${prepPath(lessonId, 'resume')}/${ck(cls)}`).catch(() => null);
    if (!r) for (const c of codes) { const st = await N().get(P(c, 'state')).catch(() => null); if (st && st.savedStop != null) { r = { stop: st.savedStop, code: c }; break; } }
    if (!r || r.stop == null || r.stop < 1 || r.stop >= L.steps.length) return null;
    return { ...r, title: L.steps[r.stop].title || (L.monsters[L.steps[r.stop].id] || {}).title || (L.steps[r.stop].kind === 'boss' ? L.boss.title : '') };
  }
  // ⏳ 수업을 끝낼 때: 남은 단계(몬스터 · 형성평가)가 있으면 이어하기 포털을 열지 묻는다 (2026-11-05)
  const cutShort = (L, R) => !!(L && R && !Raid.isClosed(R) && !Raid.isLobby(R) && !Raid.isEnd(L, R) && !Raid.bossHp(L, R).won);
  async function endClassAsk(code) {
    const raw = await N().get(P(code)); if (!raw || !raw.meta) return;
    const R = unpackRoom(raw), L = DS.Lessons.get(R.meta.lesson);
    void L; void R; return endClass(code, {}); // ⏳ 「이어하기 던전 열까요?」 물음 없앰 (2026-11-09) — 이어서 하려면 선생님 「지난 수업 이어서」
  }
  // ⏳ 교시 끝 (보스가 문을 닫음): 남은 단계가 있으면 이어하기 7일 자동 · 이미 마무리 · 보스를 이겼으면 평소처럼 끝 (여러 기기가 불러도 한 번)
  async function timeUp(code, R, L) {
    if (!R || Raid.isClosed(R) || (R.state || {}).timeUp) return;
    if (Raid.isLobby(R)) return; // 시작도 안 한 수업은 그대로 (선생님이 정리)
    return endClass(code, { timeUp: true, rift: cutShort(L, R) });
  }
  // ⏰ +5분 (종 치기 전 한 번)
  async function extendTime(code, R) {
    if ((R.state || {}).extend) throw Object.assign(new Error('연장은 한 번만 할 수 있어요.'), { user: true });
    await N().set(P(code, 'state/extend'), 5);
  }
  // ⏳ 이어하기 포털: rift/{반}/{차시} = { code, lesson, no, at, until } — 학생 캠프 차시 문이 주황빛 포털로 (기한까지)
  async function openRift(code, R, days = 7) {
    const cls = (R.meta || {}).cls, L = DS.Lessons.get(R.meta.lesson); if (!cls || !L) return;
    await N().set(`rift/${ck(cls)}/${L.id}`, { code, lesson: L.id, no: L.no || 0, at: N().TS, until: N().now() + days * 86400e3 });
  }
  // 🏫 보스 격파 시각 (우리 반 수업 소식의 「보스까지 걸린 시간」): 보스 단계에서 격파되면 한 번만 적는다
  let bossMarked = '';
  function markBossWin(code, R, L) {
    const st = Raid.stepOf(L, R), s = R.state || {};
    if (!st || st.kind !== 'boss' || s.bossWonAt || bossMarked === code || !Raid.bossHp(L, R).won) return;
    bossMarked = code;
    N().update(P(code, 'state'), { bossWonAt: N().TS, bossFrom: s.stepAt || null }).catch(() => { bossMarked = ''; });
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
  // 🖥 지금 열린 수업 찾기 (2026-11-05 · 종합상황실 입장 · 종합상황실 캠프): 바로 연 수업 live/* + 시간표 예약 slots/*(시작 10분 전부터) · 끝난 수업 빼고 · 최근 순
  async function openRooms() {
    const now = N().now(), cands = [];
    const [live, slots] = await Promise.all([N().get('live').catch(() => null), N().get('slots').catch(() => null)]);
    Object.entries(live || {}).forEach(([c, v]) => { if (v && v.code && Raid.liveOpen(v, Date.now())) cands.push({ code: v.code, cls: c, no: v.no, lesson: v.lesson, at: v.at || 0 }); });
    Object.entries(slots || {}).forEach(([c, byCode]) => Object.entries(byCode || {}).forEach(([code, v]) => { if (v && v.from - 10 * 60e3 <= now && now < v.to) cands.push({ code, cls: c, no: v.no, lesson: v.lesson, at: v.from, sched: true }); }));
    const out = [];
    for (const x of cands.sort((a, b) => b.at - a.at)) { if (out.some((r) => r.code === x.code)) continue; const st = await N().get(P(x.code, 'state')).catch(() => null); if (st && !st.closed) out.push(x); }
    return out;
  }
  const clearHelp = (code, uid) => N().remove(P(code, `help/${uid}`));

  // ── 🏁 반대항 · 🔥 반 최고 콤보 저장 (v0.9.11 · 교사 · 종합상황실 기기) ─────────────
  //   punch/{차시}/{반} = { s(0~1000), m{참여 · 고침 · 콤보 · 첫 시도 · 돕기 0~100}, best, at, code, ot(연장전 중) } · combo/{반} = { best, at, code }
  async function savePunch(code, R, L, opt = {}) {
    const cls = (R.meta || {}).cls; if (!cls || !DS.Combo || !L || !L.no || L.eval || Raid.isLobby(R)) return null;
    const an = DS.Combo.analyze(L, R), p = DS.Combo.punch(L, R, an);
    const was = await N().get(`punch/${L.id}/${ck(cls)}`).catch(() => null);
    if (was && was.code && was.code !== code && !opt.final) return null; // 같은 반이 같은 차시를 또 열면: 마지막 수업 기준 (끝낼 때만 덮음)
    const e = { s: p.s, m: p.m, best: p.best, n: p.n, at: N().TS, code, ...(opt.ot ? { ot: true } : {}) };
    await N().set(`punch/${L.id}/${ck(cls)}`, e);
    if (opt.final && an.best > (Number((R.meta || {}).comboBest) || 0)) {
      const cb = await N().get(`combo/${ck(cls)}`).catch(() => null);
      if (!cb || an.best > (Number(cb.best) || 0)) await N().set(`combo/${ck(cls)}`, { best: an.best, at: N().TS, code }).catch(() => {});
    }
    return e;
  }
  // ⏳ 연장전: 이 반의 「연장전 중」 기록을 이어하기 완주율로 다시 재고 마무리 → 다음 수업 대기실에서 펀치 (반환 = { lesson } | null)
  async function finishOvertime(cls) {
    if (!DS.Combo) return null;
    const all = (await N().get('punch').catch(() => null)) || {}; let out = null;
    for (const [lid, byC] of Object.entries(all)) {
      const e = (byC || {})[ck(cls)]; if (!e || !e.ot) continue;
      const room = e.code ? await N().get(P(e.code)).catch(() => null) : null;
      const done = Object.keys(((await N().get(`rift/${ck(cls)}/${lid}/done`).catch(() => null)) || {})).length;
      const n = room ? Object.keys(room.active || {}).length : 0;
      await N().set(`punch/${lid}/${ck(cls)}`, { ...DS.Combo.overtime(e, n ? done / n : 0), at: N().TS });
      out = { lesson: lid };
    }
    return out;
  }
  const setPunchOff = async (code, off) => { await N().set(prepPath('_cfg', 'punchOff'), off ? true : null); if (code) await N().set(P(code, 'state/punchOff'), off ? true : false).catch(() => {}); };
  const punchOff = (R) => { const s = (R && R.state) || {}; return s.punchOff != null ? !!s.punchOff : !!((R && R.meta) || {}).punchOff; };
  // 🦇 황금 박쥐: 때가 되면 state.bat (여러 기기가 불러도 한 번)
  let batBusy = '';
  async function batTick(code, R, L) {
    if (!DS.Combo || batBusy === code || !DS.Combo.batDue(L, R, N().now())) return;
    batBusy = code;
    const q = DS.Combo.batQ(L, code); if (q < 0) return;
    const st = (await N().get(P(code, 'state')).catch(() => null)) || {}; if (st.bat) return;
    await N().set(P(code, 'state/bat'), { mid: st.batPlan.mid, at: N().now(), ac: DS.Combo.activeNow(R, N().now()), q, n: Raid.activeIds(R).length }).catch(() => { batBusy = ''; });
  }
  const batAnswer = (code, v) => N().set(P(code, `batA/${N().uid()}`), v === 'o' ? 'o' : 'x');
  // ✨ 공격 기록 (학생): hits/{나}/{키} = { at: 서버 시각, ac: 콤보 시계 } · 같은 키는 한 번만
  async function hit(code, R, key, extra = {}) {
    if (!DS.Combo) return;
    await N().set(P(code, `hits/${N().uid()}/${key}`), { at: N().TS, ac: DS.Combo.activeNow(R, N().now()), ...extra }).catch(() => {});
  }

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
    await N().set(P(code, `players/${me}`), { v: String(DS.VERSION || ''), num: Number(info.num), nick: String(info.nick).slice(0, 8), hero: Number(info.hero) || 0, /* v = 앱 판 (🔄 #24 옛 판 알아보기) */ fx: info.fx || 'flame', ...(info.cls ? { cls: String(info.cls) } : {}), ...(info.title ? { title: String(info.title).slice(0, 24) } : {}), ...(Number(info.enh) > 0 ? { enh: Math.min(10, Number(info.enh)) } : {}), ...(was.lobby ? { lobby: true } : {}), at: N().TS, first: was.first || N().TS }); // first = 처음 들어온 시각 (출석부)
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
    const me = N().uid();
    if (attempt > 0 && !Raid.record(DS.Lessons.get(R.meta.lesson), unpackRoom(R), mid, me).left) fail('재도전 기회를 모두 썼어요.'); // v0.9.6: 기본 4번 + 받은 힐
    if ((((R.subs || {})[mid] || {})[me] || {})[attempt] != null) return;
    await N().set(P(code, `subs/${mid}/${me}/${attempt}`), N().pack(given));
    await hit(code, R, `m_${mid}_${attempt}`);
  }
  // 💚 힐 (v0.9.6): 다 맞힌 학생이 남은 기회 한 칸을 친구에게. 받을 친구가 없으면 '_' (응원 — 경험치만). 반환 = 받은 uid | null
  async function heal(code, packed, mid, opt = {}) {
    const R = unpackRoom(packed), L = DS.Lessons.get(R.meta.lesson), step = L.steps[R.state.step], me = N().uid();
    if (!step || step.id !== mid) fail('지금은 이 몬스터와 싸우는 시간이 아니에요.');
    const rec = Raid.record(L, R, mid, me);
    if (!rec.canHeal) fail('힐은 몬스터를 다 맞힌 뒤 남은 기회로 할 수 있어요.');
    if (opt.true) { // 🌟 진필살기 (2026-11-06 사용자 확정): 3연속 퍼펙트 + 특화 Ⅳ · 파티 힐 + 🗿 석화 20초 · 한 몬스터에 반 전체 한 번
      if (Raid.perfStreak(rec) < 3 || Raid.ultUsed(R, mid, me)) fail('3연속 퍼펙트일 때만 쓸 수 있어요.');
      const p = (R.players || {})[me] || {}; if (DS.Attack && !DS.Attack.canTrue(p.fx, p.hero)) fail('진필살기는 특화 계열 Ⅳ 전설 스킬을 끼웠을 때만 쓸 수 있어요.');
      if (Raid.petrify(R, mid)) fail('이 몬스터는 이미 진필살기로 굳었어요 — 지금 맞히면 💎 가 나와요!');
      const v = `!true@${N().now()}`; await N().set(P(code, `heals/${mid}/${me}/${Raid.healsGiven(R, mid, me)}`), v); return v;
    }
    if (opt.party || opt.ult) { // ⚡ 3연속 퍼펙트 (2026-11-06): 필살기 또는 💚 파티 힐 — 둘 중 하나 (마지막 기회)
      if (Raid.perfStreak(rec) < 3 || Raid.ultUsed(R, mid, me)) fail('3연속 퍼펙트일 때만 쓸 수 있어요.');
      if (opt.ult && DS.Attack) { const p = (R.players || {})[me] || {}; if (!DS.Attack.canUlt(p.fx, p.hero)) fail('필살기는 특화 계열 Ⅲ 이상 스킬을 끼웠을 때만 쓸 수 있어요.'); } // 2026-11-06 검증: 화면 단추만이 아니라 여기서도 확인
      await N().set(P(code, `heals/${mid}/${me}/${Raid.healsGiven(R, mid, me)}`), opt.ult ? '!ult' : '*');
      return opt.ult ? '!ult' : '*';
    }
    if (opt.bind) { const v = `!bind@${N().now()}`; await N().set(P(code, `heals/${mid}/${me}/${Raid.healsGiven(R, mid, me)}`), v); return v; } // 🔁 v3: ⛓ 몬스터 묶기 (새 문제 해결 1번 = 3초)
    const to = Raid.healTarget(L, R, mid, me);
    await N().set(P(code, `heals/${mid}/${me}/${Raid.healsGiven(R, mid, me)}`), to || '_');
    return to;
  }
  const bossAnswer = (code, set, answers) => N().set(P(code, `bossAns/${N().uid()}/${set}`), N().pack(answers)); // (예전 방식 · 지난 수업 호환)
  // 👑 형성평가 시도 (2026-11-05): bossTry/{나}/{문항}/{시도 0~3} · 한 번 쓴 칸은 못 고침
  async function bossTry(code, i, a, given) {
    if (a < 0 || a >= Raid.BOSS_TRIES) fail('이 문항의 기회를 모두 썼어요.');
    await N().set(P(code, `bossTry/${N().uid()}/${i}/${a}`), N().pack(given));
  }

  // 저장 모양(JSON 문자열) → 규칙 함수가 쓰는 모양
  function unpackRoom(R) {
    const out = JSON.parse(JSON.stringify(R || {}));
    // 🔄 차시 바꾸기 (2026-11-06 사용자 「차시 변경을 빠르게」): 수업 시작 전에 고른 차시는 state.lesson (meta 는 처음 만들 때만 쓸 수 있는 규칙) → 모든 화면이 이 값을 차시로 씀
    if (out.state && out.state.lesson && out.meta && DS.Lessons && DS.Lessons.get(out.state.lesson)) { out.meta.lesson = out.state.lesson; if ('lpct' in out.state) { if (out.state.lpct) out.meta.pct = out.state.lpct; else delete out.meta.pct; } if (out.state.lthink != null) out.meta.think = out.state.lthink; if (out.state.lsolve != null) out.meta.solve = out.state.lsolve; }
    Object.values(out.subs || {}).forEach((byU) => Object.values(byU).forEach((byA) => Object.keys(byA).forEach((k) => { if (typeof byA[k] === 'string') byA[k] = N().unpack(byA[k]); })));
    Object.values(out.bossTry || {}).forEach((byI) => Object.values(byI || {}).forEach((byA) => Object.keys(byA || {}).forEach((k) => { if (typeof byA[k] === 'string') byA[k] = N().unpack(byA[k]); })));
    Object.values(out.bossAns || {}).forEach((bySet) => Object.keys(bySet).forEach((k) => { if (typeof bySet[k] === 'string') bySet[k] = N().unpack(bySet[k]); }));
    return out;
  }

  return { restMinDef, holyArm, holyUse, snapStart, snapEnd, useCharge, giveHint, chainSubmit, chainKnock, chainRelease, scoutReady, setSolve, saveEnd, resumeInfo, switchLesson, setSound, bossTry, openRooms, savePunch, finishOvertime, setPunchOff, punchOff, batTick, batAnswer, hit, endClassAsk, timeUp, extendTime, openRift, cutShort, setRest, setRestMin, markBossWin, prepLite, prepImg, hasImg, setVideoFile, setVideoOn, endClass, admitLate, getPrep, setImage, setVideo, setDefaultPct, setThink, createRoom, joinHall, isHost, go, setSheet, setFocus, unlockFor, presence, toLobby, say, hideWord, lockWords, setPct, skip, setActive, clearHelp, join, help, submit, heal, bossAnswer, unpackRoom, P };
})();
