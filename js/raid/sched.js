// 📅 교사 시간표 · 예약 수업 · 🗓 출석부 · 📖 수업 일지 (2026-11-04 · v0.9.7.0 · 사용자 확정)
//   시간표(요일 × 교시 → 반)를 저장하면 앞으로 7일 치 수업 방을 미리 만들어 둔다 → 시각이 되면 학생 캠프의 차시 문이 저절로 켜진다
//   (정해진 시각에 수업을 열어 줄 서버가 없으므로 「미리 만들기」. 교사가 앱을 열 때마다 7일 치를 다시 채운다)
//   차시 = 그 반의 다음 차시(자동) · 문 열림 = 교시 시작 ~ 끝 + 10분 · 월 5교시 · 목 7교시(자율 · 동아리) 는 늘 뺀다
//   서버 자리 (모두 교사만 쓰기 · 학생은 slots 만 읽기 — firebase/database.rules.json):
//     sched/week/{요일-교시} = 반        sched/off/{날짜_교시} = true (이번엔 쉼)      sched/made/{날짜_교시} = 수업 코드
//     slots/{반}/{코드} = { from, to, lesson, no, theme, key, p }  ← 학생 캠프가 읽음
//     classlog/{반}/{코드} = 수업 일지 한 줄 { date, p, from, to, lesson, no, sched, memo, hide, sum }
//     att/{반}/{코드}/{번호} = { s: 출석 o · 지각 l · 미입장 x · 결석 a · 공결 e, m: 메모 }  ← 선생님이 고친 것만 (자동 판정은 입장 시각으로)
window.DS = window.DS || {};

DS.Sched = (function () {
  const N = () => DS.Net;
  const KST = 9 * 3600e3, DAY = 86400e3, AFTER = 10 * 60e3, AHEAD = 7, LATE = 5 * 60e3;
  // 일과운영표 (사용자 학교 · 2026-11-04 사진): 교시 → [시작, 끝]. 8~10교시는 방과후라 넣지 않음
  const BELLS = { 1: ['09:00', '09:50'], 2: ['10:00', '10:50'], 3: ['11:00', '11:50'], 4: ['12:00', '12:50'], 5: ['14:00', '14:50'], 6: ['15:00', '15:50'], 7: ['16:10', '17:00'] };
  // 요일(1 월 ~ 5 금)마다 정규 수업 교시 — 수 7 = 특기적성 · 금 6 · 7 = 없음(학급청소 · 종례)
  const PERIODS = { 1: [1, 2, 3, 4, 5, 6, 7], 2: [1, 2, 3, 4, 5, 6, 7], 3: [1, 2, 3, 4, 5, 6], 4: [1, 2, 3, 4, 5, 6, 7], 5: [1, 2, 3, 4, 5] };
  const SKIP = ['1-5', '4-7']; // 월 5교시 · 목 7교시 = 자율 · 동아리 (담임) → 수업으로 치지 않음
  const DOW = ['일', '월', '화', '수', '목', '금', '토'];
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const kst = (ms) => { const d = new Date(ms + KST); return { date: d.toISOString().slice(0, 10), dow: d.getUTCDay(), hm: d.toISOString().slice(11, 16) }; };
  const at = (date, hm) => Date.parse(`${date}T${hm}:00+09:00`);
  // 🕘 교시 시각 입력 (2026-11-13 밤 선생님 「시간표 기능을 시간도 입력 가능하게」): sched/bells = { 요일 1~5: { 교시: [시작, 끝] } } · 없으면 위 우리 학교 일과표(처음 값)
  //   선생님이 넣은 시각이 있으면 자율 · 동아리 칸(SKIP)도 선생님 시간표대로 (빈칸으로 두면 수업 없음)
  let bellsCfg = null;
  const dowOf = (date) => new Date(`${date}T12:00:00+09:00`).getUTCDay();
  const defBells = (d) => Object.fromEntries((PERIODS[d] || []).map((p) => [p, BELLS[p]]));
  const bellsOf = (d) => { const c = bellsCfg && bellsCfg[d]; if (!c) return defBells(d); const o = {}; Object.entries(c).forEach(([p, v]) => { if (Array.isArray(v) && v.length === 2 && /^\d\d:\d\d$/.test(v[0]) && /^\d\d:\d\d$/.test(v[1])) o[Number(p)] = v; }); return o; };
  const periodsOf = (d) => Object.keys(bellsOf(d)).map(Number).sort((a, b) => a - b);
  const bell = (d, p) => bellsOf(d)[p] || null;
  const times = (date, p) => { const b = bell(dowOf(date), Number(p)); return b ? [at(date, b[0]), at(date, b[1]) + AFTER] : null; };
  const skipped = (d, p) => !bellsCfg && SKIP.includes(`${d}-${p}`);
  const usable = (d, p) => periodsOf(d).includes(p) && !skipped(d, p);
  const keyOf = (date, p) => `${date}_${p}`;
  // ⏳ 보스 타임바 (2026-11-05): 그 교시가 끝나는 시각 = 던전 문이 닫히는 시각. 시간표 수업은 그 교시 · 바로 연 수업은 지금 교시(시작 10분 전부터 그 교시로) · 교시 밖이면 null (제한 없음)
  function periodEnd(now, p) {
    const k = kst(now), B = bellsOf(k.dow);
    if (p && (B[p] || BELLS[p])) return at(k.date, (B[p] || BELLS[p])[1]);
    for (const q of Object.keys(B).map(Number)) { const [s, e] = B[q]; if (now >= at(k.date, s) - 10 * 60e3 && now < at(k.date, e)) return at(k.date, e); }
    return null;
  }
  const label = (s) => { const k = kst(s.from); return `${k.date.slice(5).replace('-', '/')}(${DOW[k.dow]}) ${s.p}교시`; };

  // ── 시간표 (수동) ──────────────────────────────────────────
  const getWeek = async () => (await N().get('sched/week').catch(() => null)) || {};
  // 🔄 컴시간 자동 (v0.9.7.1 · GitHub 가 매일 새벽 sched/comci 에 수학 칸만) — sched/comciOn 이 켜져 있을 때만 합침 · 수동 칸이 우선 ('-' = 수동으로 비움)
  const getComci = async () => (await N().get('sched/comci').catch(() => null)) || null;
  // 🔄 컴시간 = 끔 (2026-11-13 밤 선생님 「시간표 컴시간 연동 구현하지말아줘. 잘 안쓰게됨」) · 저장된 sched/comci 는 두되 합치지 않음 · 화면 · 스위치 숨김 · 새벽 GitHub 작업도 꺼 둠(.github/workflows/comci.yml)
  async function comci() { return { on: false, c: null }; }
  async function effective(manual) {
    const [m, { on, c }] = await Promise.all([manual ? Promise.resolve(manual) : getWeek(), comci()]);
    const out = {}, auto = {};
    if (on && c && c.week) Object.entries(c.week).forEach(([k, v]) => { const [d, p] = k.split('-').map(Number); if (usable(d, p)) { out[k] = String(v); auto[k] = String(v); } });
    Object.entries(m).forEach(([k, v]) => { if (v === '-') delete out[k]; else out[k] = v; });
    return { week: out, auto, manual: m, on, comci: c };
  }
  const getOff = async () => (await N().get('sched/off').catch(() => null)) || {};
  // 앞으로 7일 동안 시간표에 있는 수업 칸 = [{ key, date, dow, p, cls, from, to }]
  function upcoming(week, off, now) {
    const out = [];
    for (let i = 0; i < AHEAD; i++) {
      const { date, dow } = kst(now + i * DAY);
      periodsOf(dow).forEach((p) => {
        const cls = week[`${dow}-${p}`]; if (!cls || !usable(dow, p)) return;
        const key = keyOf(date, p); if (off[key]) return;
        const [from, to] = times(date, p); if (to <= now) return;
        out.push({ key, date, dow, p, cls: String(cls), from, to });
      });
    }
    return out;
  }

  // ── 그 반의 다음 차시 (자동) ──────────────────────────────
  //   수업 일지에서 마지막으로 실제로 한 수업(학생이 들어옴) → 끝까지 했으면 다음 차시, 중간에 끝났으면 같은 차시
  //   일지가 없으면 그 반 unlock(교사가 연 차시 번호) 다음 · 그것도 없으면 첫 차시
  const ordered = () => DS.Lessons.list.filter((l) => !l.eval && !l.sheetLesson && l.no).sort((a, b) => a.no - b.no);
  async function nextLesson(cls, logs) {
    const L = ordered(); if (!L.length) return null;
    logs = logs || (await N().get(`classlog/${ck(cls)}`).catch(() => null)) || {};
    const done = Object.values(logs).filter((g) => g && !g.hide && g.sum && g.sum.n > 0).sort((a, b) => (b.from || b.at || 0) - (a.from || a.at || 0))[0];
    if (done) {
      const cur = L.find((l) => l.id === done.lesson);
      if (cur && !done.sum.end) return cur;
      const nx = L.find((l) => cur && l.no > cur.no); return nx || cur || L[0];
    }
    const u = await N().get(`unlock/${ck(cls)}`).catch(() => null);
    return (u && L.find((l) => l.no > Number(u))) || (u && L[L.length - 1]) || L[0];
  }

  // ── 수업 방 미리 만들기 (교사 기기) ────────────────────────
  //   빠진 칸 → 방 만들기 · 시간표에서 지운 칸(아직 시작 안 함) → 방 지우기 · 차시가 바뀌었으면 다시 만들기(코드도 새로)
  let busy = null;
  function ensure() { if (!busy) busy = run().finally(() => { busy = null; }); return busy; }
  async function run() {
    // 📅 2026-11-06 사용자 확정 「진도 예정표 · 방을 미리 만들지 않음」: 예전처럼 7일 치 방을 만들지 않고, 남아 있는 앞날 예약 방(아직 시작 안 함)은 정리
    if (!(await DS.Account.isAdmin())) return { made: 0 };
    const now = N().now(), made = (await N().get('sched/made').catch(() => null)) || {};
    for (const [key, code] of Object.entries(made)) {
      const meta = await N().get(`rooms/${code}/meta`).catch(() => null), st = await N().get(`rooms/${code}/state`).catch(() => null);
      const started = st && (st.step ?? -1) >= 0;
      if (meta && !started && !(st && st.closed)) await drop(code, meta.cls); else if (meta && meta.cls) await N().remove(`slots/${ck(meta.cls)}/${code}`).catch(() => {});
      await N().remove(`sched/made/${key}`).catch(() => {});
    }
    const ex = await getExtra(); // 지난 보충 칸 (끝난 지 6시간 넘음) 정리
    for (const [key, v] of Object.entries(ex)) { const t = slotTimes(key); if (!v || !t || t[1] < now - 6 * 3600e3) await N().remove(`sched/extra/${key}`).catch(() => {}); }
    await syncKeys().catch(() => {});
    return { made: 0 };
  }
  // 🖥 예약 방 비밀번호 맞추기 (2026-11-06 사용자 「자동으로 만들어진 차시 던전은 비밀번호가 무작위」): 예약 방은 며칠 전에 만들어져 그때 비밀번호를 받음
  //   → 고정 비밀번호(tcfg/hallPw)를 저장하거나 시간표를 다시 채울 때, 아직 시작 안 한 예약 방도 고정 비밀번호로 바꿈 · 돌려주는 값 = 바꾼 방 수
  async function syncKeys() {
    if (!(await DS.Account.isAdmin())) return 0;
    const fixed = await N().get('tcfg/hallPw').catch(() => null); if (!/^\d{4}$/.test(String(fixed || ''))) return 0;
    const made = (await N().get('sched/made').catch(() => null)) || {}; let n = 0;
    for (const code of Object.values(made)) {
      const st = await N().get(`rooms/${code}/state`).catch(() => null); if (!st || st.closed || (st.step ?? -1) >= 0) continue;
      const sec = await N().get(`secrets/${code}`).catch(() => null);
      if (!sec || sec.hallKey !== String(fixed)) { await N().update(`secrets/${code}`, { hallKey: String(fixed) }).catch(() => {}); n++; }
    }
    return n;
  }
  async function make(s, L) {
    const r = await DS.Act.createRoom(L.id, s.cls, { slot: { key: s.key, p: s.p, from: s.from, to: s.to } });
    await N().set(`slots/${ck(s.cls)}/${r.code}`, { from: s.from, to: s.to, lesson: L.id, no: L.no || 0, theme: L.theme || '', key: s.key, p: s.p });
    await N().set(`sched/made/${s.key}`, r.code);
    return r;
  }
  async function drop(code, cls) {
    await N().remove(`rooms/${code}`).catch(() => {}); await N().remove(`secrets/${code}`).catch(() => {});
    if (cls) { await N().remove(`slots/${ck(cls)}/${code}`).catch(() => {}); await N().remove(`classlog/${ck(cls)}/${code}`).catch(() => {}); }
  }

  // ── 📅 진도 예정표 (2026-11-06 사용자 확정) ───────────────────────────
  //   정규 시간표(매주) + ➕ 보충(sched/extra/{날짜_교시} = { cls } · 한 번 · 그 수업이 끝나면 사라짐) − 🚫 이번만 쉼(sched/off)
  //   진도 = sched/prog/{반} = { next: 다음에 할 차시, at } — 마무리까지 가서 「수업 끝」을 눌렀을 때만 다음 차시로 (⏸ 저장 · 시간 초과 · 안 함 = 그대로)
  //   예정표 = 그 반의 앞으로의 칸을 시간순으로 → 첫 칸 = next, 그다음 = +1 … (번호를 저장하지 않고 매번 계산 → 추가 · 삭제 · 정체가 바로 반영)
  const getExtra = async () => (await N().get('sched/extra').catch(() => null)) || {};
  const getProg = async () => (await N().get('sched/prog').catch(() => null)) || {};
  const slotTimes = (key) => { const [date, p] = String(key).split('_'); return times(date, Number(p)); };
  function slotsAhead(week, off, extra, now, days = 14) {
    const out = [], seen = new Set();
    for (let i = 0; i < days; i++) {
      const { date, dow } = kst(now + i * DAY);
      periodsOf(dow).forEach((p) => {
        const key = keyOf(date, p), ex = extra[key], cls = ex ? ex.cls : week[`${dow}-${p}`];
        if (!cls || (!ex && (!usable(dow, p) || off[key]))) return;
        const [from, to] = times(date, p); if (to <= now) return;
        seen.add(key); out.push({ key, date, dow, p, cls: String(cls), from, to, extra: !!ex });
      });
    }
    Object.entries(extra).forEach(([key, v]) => { if (seen.has(key) || !v) return; const t = slotTimes(key); if (!t || t[1] <= now || t[0] > now + days * DAY) return; const [date, p] = key.split('_'); out.push({ key, date, dow: kst(t[0]).dow, p: Number(p), cls: String(v.cls), from: t[0], to: t[1], extra: true }); });
    return out.sort((a, b) => a.from - b.from);
  }
  // 그 반의 「다음 차시」: sched/prog → 없으면 게임으로 한 차시(held) 중 마지막 · 그 차시 보스를 이긴 기록이 있으면 그다음
  async function pointer(cls, prog) {
    const L = ordered(); if (!L.length) return null;
    const pv = (prog || (await getProg()))[ck(cls)]; if (pv && DS.Lessons.get(pv.next)) return DS.Lessons.get(pv.next);
    const held = (await N().get(`held/${ck(cls)}`).catch(() => null)) || {}, done = L.filter((l) => held[l.id]);
    if (!done.length) return L[0];
    const last = done[done.length - 1], recs = (await N().get(`records/${ck(cls)}`).catch(() => null)) || {};
    const won = Object.values(recs).some((r) => r && r[last.id] && r[last.id].won);
    return won ? L.find((l) => l.no > last.no) || last : last;
  }
  async function advance(cls, lessonId) { // 「수업 끝」 = 그 차시를 끝냄 → 다음 차시 (이미 더 앞이면 그대로)
    if (!cls) return; const L = ordered(), i = L.findIndex((l) => l.id === lessonId); if (i < 0) return;
    const nx = L[i + 1] || L[i], cur = await pointer(cls).catch(() => null);
    if (!cur || nx.no > cur.no || cur.id === lessonId) await N().set(`sched/prog/${ck(cls)}`, { next: nx.id, at: N().TS });
  }
  const setNext = (cls, lessonId) => N().set(`sched/prog/${ck(cls)}`, { next: lessonId, at: N().TS });
  const addExtra = (date, p, cls) => N().set(`sched/extra/${keyOf(date, Number(p))}`, { cls: String(cls), at: N().TS });
  const removeExtra = (key) => N().remove(`sched/extra/${key}`);
  // 종합실에서 끝낸 수업 (교사만 쓸 수 있는 진도에 못 씀) → 교사 기기가 열 때 방 기록(state.progDone)으로 채움
  async function reconcile(prog) {
    let codes = []; try { codes = (JSON.parse(localStorage.getItem('citadel-rooms')) || []).map((r) => r.code).slice(0, 12); } catch (e) { /* 없음 */ }
    const opened = (await N().get('sched/open').catch(() => null)) || {}; codes = [...new Set([...codes, ...Object.values(opened)])];
    let changed = false;
    for (const code of codes) {
      const st = await N().get(`rooms/${code}/state`).catch(() => null), meta = st && st.progDone ? await N().get(`rooms/${code}/meta`).catch(() => null) : null;
      if (!st || !st.progDone || !meta || !meta.cls) continue;
      const pv = prog[ck(meta.cls)]; if (pv && Number(pv.at) >= Number(st.progDoneAt || 0)) continue;
      await advance(meta.cls, st.progDone).catch(() => {}); changed = true;
    }
    return changed;
  }
  // 예정표: [{ key, date, p, cls, from, to, extra, lesson, no, title, resume, code(열었으면), state }]
  async function plan(opt = {}) {
    const now = N().now();
    let prog = await getProg(); if (opt.reconcile !== false && (await reconcile(prog).catch(() => false))) prog = await getProg();
    const [{ week }, off, extra, opened] = await Promise.all([opt.week ? effective(opt.week) : effective(), getOff(), getExtra(), N().get('sched/open').catch(() => null)]);
    const slots = slotsAhead(week, off, extra, now - (opt.past ? 12 * 3600e3 : 0), opt.days || 14), L = ordered(), base = {};
    for (const c of [...new Set(slots.map((x) => x.cls))]) base[c] = await pointer(c, prog);
    const k = {};
    for (const x of slots) {
      const code0 = (opened || {})[x.key];
      if (code0 || x.to <= now) { // 이미 연 칸(진행 중 · 끝) · 오늘 지난 칸 = 번호를 새로 쓰지 않음 (연 방의 차시를 그대로)
        x.past = x.to <= now; x.title = x.past ? '시간표 수업 (열지 않음)' : '';
        if (code0) { const [mt, st] = await Promise.all([N().get(`rooms/${code0}/meta`).catch(() => null), N().get(`rooms/${code0}/state`).catch(() => null)]); const L0 = mt && DS.Lessons.get(mt.lesson); if (L0) { x.lesson = L0.id; x.no = L0.no; x.title = L0.title; } x.code = code0; x.closed = !st || !!st.closed; x.started = !!(st && (st.step ?? -1) >= 0); x.saved = !!(st && st.savedStop != null); x.doneL = !!(st && st.progDone); }
        if (x.code || x.past) continue;
      }
      const b = base[x.cls], i = b ? L.findIndex((l) => l.id === b.id) + (k[x.cls] || 0) : -1, Ls = L[i] || null;
      k[x.cls] = (k[x.cls] || 0) + 1;
      x.lesson = Ls ? Ls.id : null; x.no = Ls ? Ls.no : null; x.title = Ls ? Ls.title : '단원 끝 (다음 차시 없음)';
      if (Ls && k[x.cls] === 1) { const rz = await N().get(`prep/${Ls.id}/resume/${ck(x.cls)}`).catch(() => null); if (rz) x.resume = rz; }
    }
    return slots;
  }
  // 칸에서 수업 열기 → 그 반 · 그 차시(저장 지점이 있으면 이어서) · 보충 칸은 끝나면 사라짐
  async function openSlot(x) {
    if (!x.lesson) throw Object.assign(new Error('이 반은 다음 차시가 없어요 (진도 맞추기에서 골라 주세요).'), { user: true });
    const slot = { key: x.key, p: x.p, from: x.from, to: x.to, ...(x.extra ? { extra: true } : {}) };
    await DS.Teacher.create(x.lesson, x.cls, { slot, ...(x.resume ? { resume: x.resume.stop, resumeOf: x.resume.code } : {}) });
    await N().set(`sched/open/${x.key}`, DS.Teacher.code()).catch(() => {});
  }
  // ── 학생 캠프: 지금 열린 예약 수업 (slots/{반} → 시각 안이면 live 와 같은 모양) ──
  const active = (slots, now) => {
    const s = Object.entries(slots || {}).map(([code, v]) => ({ code, ...v })).filter((v) => v.from <= now && now < v.to).sort((a, b) => a.from - b.from)[0];
    return s ? { code: s.code, lesson: s.lesson, no: s.no, theme: s.theme, open: true, at: s.from, sched: true, to: s.to } : null;
  };

  // ── 오늘 수업 (교사 메뉴) ──────────────────────────────────
  async function today() {
    const now = N().now(), d = kst(now).date, made = (await N().get('sched/made').catch(() => null)) || {}, out = [];
    for (const [key, code] of Object.entries(made)) {
      if (!key.startsWith(d)) continue;
      const meta = await N().get(`rooms/${code}/meta`).catch(() => null); if (!meta || !meta.slot) continue;
      const sec = await N().get(`secrets/${code}`).catch(() => null), st = await N().get(`rooms/${code}/state`).catch(() => null);
      const L = DS.Lessons.get(meta.lesson);
      out.push({ key, code, hallKey: (sec || {}).hallKey || '', cls: meta.cls, p: meta.slot.p, from: meta.slot.from, to: meta.slot.to, lesson: meta.lesson, title: L ? `${DS.Lessons.noText(L.no)}차시 · ${L.title}` : meta.lesson, now: now >= meta.slot.from && now < meta.slot.to, done: now >= meta.slot.to || !!(st && st.closed), started: !!(st && (st.step ?? -1) >= 0) });
    }
    return out.sort((a, b) => a.from - b.from);
  }
  // 이번엔 쉼 (그날 그 교시만) · 차시 바꾸기(시작 전)
  async function skipSlot(key, on) { if (on) await N().set(`sched/off/${key}`, true); else await N().remove(`sched/off/${key}`); return ensure(); }
  async function relesson(key, lessonId) {
    const code = ((await N().get('sched/made').catch(() => null)) || {})[key]; if (!code) return;
    const meta = await N().get(`rooms/${code}/meta`), st = await N().get(`rooms/${code}/state`).catch(() => null);
    if (!meta || !meta.slot || (st && (st.step ?? -1) >= 0)) throw Object.assign(new Error('이미 시작한 수업은 차시를 바꿀 수 없어요.'), { user: true });
    const L = DS.Lessons.get(lessonId); await drop(code, meta.cls);
    await make({ key, cls: meta.cls, p: meta.slot.p, from: meta.slot.from, to: meta.slot.to }, L);
  }

  // ── 수업 일지 · 출석 (교사만) ──────────────────────────────
  //   방이 남아 있으면 그 방에서 요약(sum)을 다시 만들어 일지에 적어 둔다 → 「지난 차시 정리」로 방을 지워도 일지 · 출석은 남음
  async function summarize(code, g) {
    const R = await N().get(`rooms/${code}`).catch(() => null); if (!R || !R.meta) return g.sum || null;
    const L = DS.Lessons.get(R.meta.lesson), st = R.state || {};
    const studs = Object.values(R.players || {}).filter((p) => !p.teacher && (!g.cls || !p.cls || p.cls === g.cls));
    const sum = { n: studs.length, step: st.step ?? -1, steps: L ? L.steps.length : 0, end: !!(L && ((st.step ?? -1) >= L.steps.length - 1 || st.bossWonAt)), boss: !!st.bossWonAt, closed: !!st.closed, players: Object.fromEntries(studs.map((p) => [p.num, p.first || p.at || 0])) };
    if (g.cls) await N().set(`classlog/${ck(g.cls)}/${code}/sum`, sum).catch(() => {});
    return sum;
  }
  async function logs(cls) {
    const raw = (await N().get(`classlog/${ck(cls)}`).catch(() => null)) || {}, now = N().now();
    const rows = [];
    for (const [code, g] of Object.entries(raw)) {
      if (!g) continue; g.cls = cls;
      if (g.sched && g.from > now) continue; // 아직 안 온 예약 수업
      const sum = await summarize(code, g);
      if (!sum || !sum.n) continue; // 아무도 안 들어온 수업(예약했지만 안 함 · 잘못 연 방)은 일지에 안 씀
      rows.push({ code, ...g, sum });
    }
    return rows.sort((a, b) => (a.from || a.at || 0) - (b.from || b.at || 0));
  }
  // 자동 판정: 입장 시각 ≤ 시작 + 5분 = 출석 · 그 뒤 = 지각 · 안 들어옴 = 미입장 (선생님이 고친 것이 우선)
  const ST = { o: ['⭕', '출석'], l: ['△', '지각'], x: ['✕', '미입장'], a: ['결석', '결석'], e: ['공결', '공결'] };
  const CYCLE = ['o', 'l', 'a', 'e', 'x'];
  function judge(g, num, fix) {
    if (fix && fix.s) return fix.s;
    const t = g.sum && g.sum.players && g.sum.players[num];
    if (!t) return 'x';
    const start = g.from || g.at || 0;
    return t <= start + LATE ? 'o' : 'l';
  }
  async function sheet(cls) {
    const [rows, roster, fixes] = await Promise.all([logs(cls), N().get(`roster/${ck(cls)}`).catch(() => null), N().get(`att/${ck(cls)}`).catch(() => null)]);
    const studs = Object.entries(roster || {}).map(([n, name]) => ({ n: Number(n), name })).sort((a, b) => a.n - b.n);
    const vis = rows.filter((g) => !g.hide);
    const grid = studs.map((s) => ({ ...s, cells: vis.map((g) => { const fix = ((fixes || {})[g.code] || {})[s.n]; return { code: g.code, s: judge(g, s.n, fix), m: (fix && fix.m) || '' }; }) }));
    return { rows, vis, grid };
  }
  const setAtt = (cls, code, num, s, m) => N().set(`att/${ck(cls)}/${code}/${num}`, { s, ...(m ? { m: String(m).slice(0, 60) } : {}) });
  const setMemo = (cls, code, memo) => N().set(`classlog/${ck(cls)}/${code}/memo`, String(memo || '').slice(0, 80));
  const setHide = (cls, code, on) => N().set(`classlog/${ck(cls)}/${code}/hide`, on ? true : null);
  const when = (g) => { const k = kst(g.from || g.at || 0); return { date: k.date, dow: DOW[k.dow], hm: k.hm }; };

  // 📅 ⚙ 「시간표 쓰기」 (2026-11-13 밤 선생님 「당분간 시간표기능은 끄고 … 수동 기능을 기본으로」): sched/use = true 일 때만 시간표 · 오늘 수업 · 「다음 차시」 추천 · 교시 끝 타임바
  //   끔(기본) = 반 → 차시 → 「▶ 수업 열기」 수동 · 타임바 = 수업 시작부터 50분(학교판은 제한 없음 그대로) · 켜도 수업 방은 저절로 열리지 않음(추천만)
  let useOn = false;
  async function load() { if (!(DS.Account && (await DS.Account.isAdmin().catch(() => false)))) { useOn = false; return false; } const [u, b] = await Promise.all([N().get('sched/use').catch(() => null), N().get('sched/bells').catch(() => null)]); useOn = u === true; bellsCfg = b && typeof b === 'object' ? b : null; return useOn; }
  async function setBells(cfg) { await N().set('sched/bells', cfg || null); bellsCfg = cfg || null; }
  const custom = () => !!bellsCfg;
  const isOn = () => useOn === true;
  async function setUse(on) { await N().set('sched/use', on ? true : null); useOn = !!on; return useOn; }
  const api = { _on: (v) => { useOn = !!v; }, _bells: (v) => { bellsCfg = v || null; }, bellsOf, periodsOf, bell, defBells, setBells, custom, dowOf, load, isOn, setUse, plan, openSlot, pointer, advance, setNext, addExtra, removeExtra, slotsAhead, getProg, syncKeys, periodEnd, BELLS, PERIODS, SKIP, DOW, AFTER, LATE, ST, CYCLE, kst, times, usable, skipped, upcoming, nextLesson, ensure, active, today, skipSlot, relesson, logs, sheet, judge, setAtt, setMemo, setHide, when, label, getWeek, effective, comci, ck };
  // 📅 끔 = 일과표에 묶인 길을 막음 (예전 학교판 「시간표 숨김」과 같은 길 · 이제 우리 · 학교판 모두 ⚙ 스위치) — 보스 타임바(교시 끝) 없음 · 예약 없음 · 진도 포인터 없음
  const OFFV = { periodEnd: () => null, active: () => null, pointer: async () => null, syncKeys: async () => 0, advance: async () => null, ensure: async () => null, plan: async () => [], openSlot: async () => null };
  Object.keys(OFFV).forEach((k) => { const on = api[k], off = OFFV[k]; api[k] = (...a) => (isOn() ? on(...a) : off(...a)); });
  return api;
})();
