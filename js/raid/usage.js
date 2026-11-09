// 📈 활용 추이 기록 (2026-11-06 사용자 「학생들 웹앱 접근량이 얼마나 늘고 있는지 · 복습 · 문제 풀이에 얼마나 접근하는지 추적」)
//   act/{반}/{날짜 YYYYMMDD}/{번호} = { v: 접속(하루 1) · r: 🎯 복습 풀이 · c: 🏰 성채 풀이 · f: 📕 오답 고침 · j: ⚔ 수업 참여 · at }
//   학생 기기가 자기 칸만 숫자를 더함 (가벼움 · 교사 대시보드만 읽음 · 학생 화면에는 안 나옴 · 성적 아님)
window.DS = window.DS || {};

DS.Usage = (function () {
  const N = () => DS.Net;
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const day = (t = Date.now()) => { const d = new Date(Number(t) + 9 * 3600e3); return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`; };
  const ok = (m) => !!(m && m.c != null && m.n && !m.test && !m.teacher);
  const once = (k) => { try { if (localStorage.getItem(k)) return false; localStorage.setItem(k, '1'); return true; } catch (e) { return true; } };
  async function bump(m, field, n = 1) {
    if (!ok(m) || !N()) return;
    const p = `act/${ck(m.c)}/${day()}/${m.n}`;
    try { const cur = (await N().get(p)) || {}; await N().update(p, { [field]: (Number(cur[field]) || 0) + n, at: N().TS }); } catch (e) { /* 기록은 덤 — 실패해도 게임은 그대로 */ }
  }
  const visit = (m) => { if (ok(m) && once(`citadel-act-v-${m.c}-${m.n}-${day()}`)) bump(m, 'v'); };
  const join = (m, code) => { if (ok(m) && code && once(`citadel-act-j-${m.c}-${m.n}-${code}`)) bump(m, 'j'); };

  // ── 대시보드용 ───────────────────────────────────────────
  const monday = (ymd) => { const d = new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8))); const w = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - w); return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`; };
  const addDays = (ymd, k) => { const d = new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8) + k)); return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`; };
  // 기록을 시작하기 전 (≈ 추정): 💎 조각 기록(복습 해결 · 성채 · 이어하기)과 허수아비 · 성채 방 마지막 시각
  function backfill(gem, bonus) {
    const est = {}; // { 날짜: { 번호: { r, c, f } } }
    const add = (t, n, f) => { if (!t) return; const d = day(t); ((est[d] = est[d] || {})[n] = est[d][n] || { r: 0, c: 0, f: 0, est: 1 })[f]++; };
    Object.entries(gem || {}).forEach(([n, g]) => Object.entries((g || {}).log || {}).forEach(([k, x]) => { if (!x || !x.at) return; if (/^review/.test(k)) add(x.at, n, 'f'); else if (/castle|eval/.test(k) || /성채/.test(x.why || '')) add(x.at, n, 'c'); else if (/rift/.test(k)) add(x.at, n, 'r'); }));
    Object.entries(bonus || {}).forEach(([n, byL]) => Object.entries(byL || {}).forEach(([lid, byM]) => Object.values(byM || {}).forEach((x) => { if (x && x.at) add(x.at, n, /^eval/.test(lid) ? 'c' : 'r'); })));
    return est;
  }
  // 반 하나: { days: { 날짜: { 번호: {v,r,c,f,j} } }, since(기록 시작일) }
  async function load(c, opt = {}) {
    const k = ck(c), [act, gem, bonus] = await Promise.all([N().get(`act/${k}`).catch(() => null), opt.estimate ? N().get(`gem/${k}`).catch(() => null) : null, opt.estimate ? N().get(`bonus/${k}`).catch(() => null) : null]);
    const days = JSON.parse(JSON.stringify(act || {})), since = Object.keys(days).sort()[0] || null;
    if (opt.estimate) Object.entries(backfill(gem, bonus)).forEach(([d, byN]) => { if (since && d >= since) return; days[d] = days[d] || {}; Object.entries(byN).forEach(([n, x]) => { days[d][n] = Object.assign({}, x, days[d][n] || {}); }); });
    return { days, since };
  }
  // 주별 합계 (월요일 시작) · weeks = 최근 몇 주 · roster = { 번호: … } 인원 수용
  function weekly(days, weeks = 8, today = day()) {
    const mon0 = monday(today), list = Array.from({ length: weeks }, (_, i) => addDays(mon0, -7 * (weeks - 1 - i)));
    return list.map((w) => {
      const s = { week: w, active: 0, solves: 0, visits: 0, fixes: 0, joins: 0, est: false }, who = new Set(), vis = new Set();
      for (let i = 0; i < 7; i++) { const d = addDays(w, i), byN = days[d] || {}; Object.entries(byN).forEach(([n, x]) => { const sv = (Number(x.r) || 0) + (Number(x.c) || 0) + (Number(x.f) || 0); s.solves += sv; s.fixes += Number(x.f) || 0; s.joins += Number(x.j) || 0; if (sv) who.add(n); if (x.v || sv || x.j) vis.add(n); if (x.est) s.est = true; }); }
      s.active = who.size; s.visits = vis.size; return s;
    });
  }
  // 학생별: 최근 7일 · 그 전 7일 수업 밖 풀이 · 마지막 활동일
  function perStudent(days, today = day()) {
    const out = {}, d7 = addDays(today, -6), d14 = addDays(today, -13);
    Object.entries(days).forEach(([d, byN]) => Object.entries(byN || {}).forEach(([n, x]) => {
      const o = (out[n] = out[n] || { now: 0, prev: 0, last: '', pf: 0 }), sv = (Number(x.r) || 0) + (Number(x.c) || 0) + (Number(x.f) || 0);
      if (d >= d7 && d <= today) { o.now += sv; o.pf += Number(x.pf) || 0; } else // pf = 🧹 폰에서 걸러진 사진 (2026-11-09) if (d >= d14 && d < d7) o.prev += sv;
      if ((x.v || sv || x.j) && d > o.last) o.last = d;
    }));
    return out;
  }
  return { bump, visit, join, day, monday, addDays, load, weekly, perStudent, backfill };
})();
