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
  const times = (date, p) => (BELLS[p] ? [at(date, BELLS[p][0]), at(date, BELLS[p][1]) + AFTER] : null);
  const skipped = (d, p) => SKIP.includes(`${d}-${p}`);
  const usable = (d, p) => (PERIODS[d] || []).includes(p) && !skipped(d, p);
  const keyOf = (date, p) => `${date}_${p}`;
  // ⏳ 보스 타임바 (2026-11-05): 그 교시가 끝나는 시각 = 던전 문이 닫히는 시각. 시간표 수업은 그 교시 · 바로 연 수업은 지금 교시(시작 10분 전부터 그 교시로) · 교시 밖이면 null (제한 없음)
  function periodEnd(now, p) {
    const k = kst(now);
    if (p && BELLS[p]) return at(k.date, BELLS[p][1]);
    for (const q of Object.keys(BELLS).map(Number)) { const [s, e] = BELLS[q]; if (now >= at(k.date, s) - 10 * 60e3 && now < at(k.date, e)) return at(k.date, e); }
    return null;
  }
  const label = (s) => { const k = kst(s.from); return `${k.date.slice(5).replace('-', '/')}(${DOW[k.dow]}) ${s.p}교시`; };

  // ── 시간표 (수동) ──────────────────────────────────────────
  const getWeek = async () => (await N().get('sched/week').catch(() => null)) || {};
  // 🔄 컴시간 자동 (v0.9.7.1 · GitHub 가 매일 새벽 sched/comci 에 수학 칸만) — sched/comciOn 이 켜져 있을 때만 합침 · 수동 칸이 우선 ('-' = 수동으로 비움)
  const getComci = async () => (await N().get('sched/comci').catch(() => null)) || null;
  async function comci() { const [c, on] = await Promise.all([getComci(), N().get('sched/comciOn').catch(() => null)]); return { on: on === true, c }; }
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
      (PERIODS[dow] || []).forEach((p) => {
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
    if (!(await DS.Account.isAdmin())) return { made: 0 };
    const now = N().now(), [{ week }, off] = await Promise.all([effective(), getOff()]);
    const want = upcoming(week, off, now), made = (await N().get('sched/made').catch(() => null)) || {};
    let n = 0;
    const plan = {};
    for (const s of want) { if (!plan[s.cls]) plan[s.cls] = await nextLesson(s.cls); }
    for (const s of want) {
      const L = plan[s.cls]; if (!L) continue;
      const code = made[s.key];
      if (code) {
        const meta = await N().get(`rooms/${code}/meta`).catch(() => null), st = await N().get(`rooms/${code}/state`).catch(() => null);
        const started = st && (st.step ?? -1) >= 0;
        if (meta && (meta.cls === s.cls && (meta.lesson === L.id || started))) continue; // 그대로 · 시작한 수업은 건드리지 않음
        if (meta && !started) await drop(code, meta.cls);
      }
      await make(s, L); n++;
    }
    // 시간표에서 빠진 미래 칸 · 지난 칸 정리
    const keep = new Set(want.map((s) => s.key));
    for (const [key, code] of Object.entries(made)) {
      if (keep.has(key)) continue;
      const meta = await N().get(`rooms/${code}/meta`).catch(() => null), st = await N().get(`rooms/${code}/state`).catch(() => null);
      const past = meta && meta.slot && meta.slot.to <= now;
      if (meta && !past && !(st && (st.step ?? -1) >= 0)) await drop(code, meta.cls); // 아직 안 한 미래 수업 → 지움
      else if (meta && meta.cls) await N().remove(`slots/${ck(meta.cls)}/${code}`).catch(() => {});
      await N().remove(`sched/made/${key}`).catch(() => {});
    }
    return { made: n };
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
      out.push({ key, code, hallKey: (sec || {}).hallKey || '', cls: meta.cls, p: meta.slot.p, from: meta.slot.from, to: meta.slot.to, lesson: meta.lesson, title: L ? `${L.no}차시 · ${L.title}` : meta.lesson, now: now >= meta.slot.from && now < meta.slot.to, done: now >= meta.slot.to || !!(st && st.closed), started: !!(st && (st.step ?? -1) >= 0) });
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

  return { periodEnd, BELLS, PERIODS, SKIP, DOW, AFTER, LATE, ST, CYCLE, kst, times, usable, skipped, upcoming, nextLesson, ensure, active, today, skipSlot, relesson, logs, sheet, judge, setAtt, setMemo, setHide, when, label, getWeek, effective, comci, ck };
})();
