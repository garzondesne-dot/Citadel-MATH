// 📊 학급 대시보드 (2026-11-03 · 교사 계정만 · 교사 메뉴): 서버에 쌓인 기록을 반 단위로 한눈에 — 학생 화면 · 종합상황실에는 나오지 않는다
//   읽는 곳 (교사만 읽을 수 있는 경로 · 규칙 변경 없음): roster/{반} · records/{반}/{번호}/{차시} · xp/{반} · cards/{반} · bonus/{반}
//   반 탭 맨 앞 「🏫 전체」 = 전 학년 모든 반을 한 표 · 한 랭킹으로 (2026-11-03 · 교사만. 학생 공개는 캐릭터 꾸미기가 생긴 뒤 이름을 가리고 — DECISIONS)
//   탭: ① 한눈에 표(칸 누르면 정렬 · CSV) ② 랭킹(형성평가 · 첫 시도 정답률 · 참여 각각 + 끈기 · 자기주도 · 성장) ③ 주의 학생 ④ 개념별 약점 ⑤ 성취기준(초안 코드) ⑥ 오개념 ⑦ 세특 메모 초안
//   records 는 학생이 수업 끝 결과를 본 뒤 저장되는 요약: { no, conc: { 개념: [맞힘, 문항] }, names, boss, bossN, won, fixed, perfects, miss, weak }
window.DS = window.DS || {};

DS.Dash = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  const A = () => DS.Account;
  let testers = {}; // 🧪 #122 tester 전체 (베타 반 = tester/{반}/_all)
  const isBeta = (c) => !!(DS.Account && DS.Account.isBetaOf && DS.Account.isBetaOf(testers, c));
  const liveCls = () => Object.keys(roster).sort().filter((c) => !isBeta(c)); // 「전체」 · 반 비교 · 설문 집계에 들어가는 반
  let roster = {}, cls = '', tab = 'table', sortKey = 'n', sortDir = 1, data = null;

  async function enter() {
    if (!(await A().isAdmin())) throw Object.assign(new Error('교사 계정으로 로그인해야 해요.'), { user: true });
    DS.UI.show('screen-dash');
    DS.Scene.save({ role: 'dash' });
    roster = (await DS.Net.get('roster').catch(() => null)) || {};
    testers = (await DS.Net.get('tester').catch(() => null)) || {};
    if (!cls || (cls !== ALL && !roster[cls])) cls = Object.keys(roster).sort()[0] || '';
    await load();
  }
  const ALL = '*';
  const isAll = () => cls === ALL;
  async function one(c) {
    const k = A().classKey(c);
    const [records, xp, cards, bonus, tst, photo, sdone] = await Promise.all(['records', 'xp', 'cards', 'bonus', 'tester', 'photo', 'surveyDone'].map((p) => DS.Net.get(`${p}/${k}`).catch(() => null)));
    const T = tst || {}, byN = Object.fromEntries(Object.entries(roster[c] || {}).filter(([n]) => !T[n])); // 🧪 #67 시험 계정 = 랭킹 · 반 통계 · 대항전 · 기호 톡 순위에서 빠짐 (지난 기록 포함 · 기록은 그대로)
    const d = build(byN, records || {}, xp || {}, cards || {}, bonus || {}); d.testers = Object.keys(T).filter((n) => T[n] && (roster[c] || {})[n]).length;
    d.studs.forEach((st) => { st.cls = c; st.key = `${c}|${st.n}`; st.held = d.held; st.symt = (((xp || {})[st.n]) || {}).st || {}; // 📖 #54 기호 톡 횟수
      const rooms = Object.values(((photo || {})[st.n]) || {}).map((byId) => Object.values(byId || {}).filter((x) => x && x.status).length).filter(Boolean); // 📝 #126 📷 서술형: 방마다 낸 장 수 → 고쳐 쓴 횟수 = 같은 문항에 다시 낸 장
      st.photoN = rooms.reduce((a, x) => a + x, 0); st.photoRev = rooms.reduce((a, x) => a + Math.max(0, x - 1), 0); st.surveyed = ((sdone || {})[st.n]) === true; });
    if (d.held.length) DS.Net.update(`held/${k}`, Object.fromEntries(d.held.map((l) => [l.id, true]))).catch(() => {}); // 📕 옛 수업도 「한 차시」로 (학생 오답노트 불참 판단 · v0.9.7.9)
    return d;
  }
  async function load() {
    data = null; render();
    if (!cls) return;
    if (!isAll()) { data = await one(cls); render(); return; }
    // 🏫 전체: 반마다 따로 계산(참여율은 그 반이 수업한 차시 기준) → 합침
    const cs0 = liveCls(), parts = await Promise.all(cs0.map(one)); // 🧪 #122 베타 반은 「전체」에서 빠짐 (그 반 칩을 누르면 따로 보임)
    const held = [...new Map(parts.flatMap((d) => d.held).map((l) => [l.id, l])).values()].sort((a, b) => a.no - b.no);
    data = { held, studs: parts.flatMap((d) => d.studs), classes: parts.map((d, i) => ({ cls: cs0[i], d })) };
    render();
  }

  // ── 계산 ─────────────────────────────────────────────
  const pct = (a, b) => (b ? Math.round((100 * a) / b) : null);
  function build(byN, records, xp, cards, bonus) {
    const ns = Object.keys(byN).map(Number).filter(Boolean).sort((a, b) => a - b);
    // 이 반에서 기록이 하나라도 있는 차시 = 수업한 차시 (차시 번호 순)
    const held = [...new Set(ns.flatMap((n) => Object.keys(records[n] || {})))]
      .map((id) => ({ id, no: (DS.Lessons.get(id) || {}).no || Number(((Object.values(records).find((r) => r && r[id]) || {})[id] || {}).no) || 0, title: (DS.Lessons.get(id) || {}).title || id }))
      .sort((a, b) => a.no - b.no);
    const studs = ns.map((n) => {
      const rec = records[n] || {}, went = held.filter((l) => rec[l.id]);
      let ok = 0, tot = 0, bo = 0, bt = 0, fixed = 0, perf = 0, hints = 0, hg = 0, lad = {}, ladW = {}, oxo = 0, oxt = 0;
      const conc = {}, std = {}, mis = {}; // 📚 성취기준별 첫 시도 · 🔎 오개념 (2026-11-03)
      went.forEach((l) => {
        const r = rec[l.id];
        Object.entries(r.conc || {}).forEach(([c, v]) => { ok += v[0]; tot += v[1]; const key = `${l.id}|${c}`; conc[key] = { name: (r.names || {})[c] || c, lesson: l, ok: v[0], total: v[1] };
          const sd = DS.Standards ? DS.Standards.of(l.id, c, l.no) : null; if (sd) { std[sd] = std[sd] || [0, 0]; std[sd][0] += v[0]; std[sd][1] += v[1]; } });
        if (DS.Mis && r.mis) DS.Mis.merge(mis, r.mis);
        hg += Number(r.hg) || 0; Object.entries(r.lad || {}).forEach(([m, v]) => { lad[m] = Math.max(lad[m] || 0, Number(v) || 0); }); Object.entries(r.ladW || {}).forEach(([m, v]) => { ladW[m] = v; }); /* 🧩 #52 */ bo += Math.min(Number(r.boss) || 0, Number(r.bossN) || 0); bt += Number(r.bossN) || 0; if (r.ox) { oxo += Number(r.ox[0]) || 0; oxt += Number(r.ox[1]) || 0; } /* ⭐ 도전 문항은 따로 (옛 기록은 boss 에 섞여 있어 bossN 까지만 · v0.9.7.9) */ fixed += Number(r.fixed) || 0; perf += Number(r.perfects) || 0; hints += Number(r.hints) || 0; // 💡 그림 힌트 (v0.9.7.4 · 성적 아님)
      });
      const total = Number((xp[n] || {}).total || 0), lv = DS.Grow ? DS.Grow.level(total) : { lv: 1, title: '' };
      const seals = DS.Bonus ? DS.Bonus.seals(bonus[n]).length : 0;
      if (DS.Mis) Object.values(bonus[n] || {}).forEach((l) => Object.values(l || {}).forEach((m) => { if (m && m.mis) DS.Mis.merge(mis, m.mis); }));
      const left = DS.Note ? held.reduce((a, l) => { const L = DS.Lessons.get(l.id); return L && L.boss && !L.eval ? a + DS.Note.lesson(L, rec[l.id], (bonus[n] || {})[l.id]).left : a; }, 0) : 0; // 📕 남은 문제
      const tries = Object.values(bonus[n] || {}).reduce((a, l) => a + Object.values(l || {}).reduce((b, m) => b + (Number((m || {}).tries) || 0), 0), 0);
      const triesOf = (pre) => Object.entries(bonus[n] || {}).filter(([lid]) => pre.test(lid)).reduce((a, [, l]) => a + Object.values(l || {}).reduce((b, m) => b + (Number((m || {}).tries) || 0), 0), 0); // 📝 #126 단원 평가(eval-) · 복습(set-) 따로
      const noteDone = DS.Note ? held.reduce((a, l) => { const L = DS.Lessons.get(l.id); if (!L || !L.boss || L.eval) return a; const x = DS.Note.lesson(L, rec[l.id], (bonus[n] || {})[l.id]); return a + x.mons.filter((st) => st === 'p').length + x.boss.slice(0, x.hp).filter((st) => st === 'p').length; }, 0) : 0; // 📕 오답을 다시 풀어 보완한 문항
      return { n, name: byN[n], rec, went: went.length, heldN: held.length, part: pct(went.length, held.length), boss: pct(bo, bt), bossRaw: [bo, bt], first: pct(ok, tot), firstRaw: [ok, tot],
        fixed, perf, hints, hg, lad, ladW, ladN: Object.values(lad).reduce((a, v) => a + v, 0), seals, tries, tryEval: triesOf(/^eval-/), trySet: triesOf(/^set-/), noteDone, left, ox: pct(oxo, oxt), bon: bonus[n] || {}, cards: Object.keys(cards[n] || {}).length, xp: total, lv: lv.lv, lvTitle: lv.title, conc, std, mis };
    });
    return { held, studs };
  }

  // ── 그리기 ───────────────────────────────────────────
  const heat = (v) => (v == null ? '' : v >= 90 ? 'h5' : v >= 75 ? 'h4' : v >= 60 ? 'h3' : v >= 40 ? 'h2' : 'h1');
  const show = (v, unit = '%') => (v == null ? '<span class="muted">-</span>' : `${v}${unit}`);
  function render() {
    const el = $('#dash-body'); if (!el) return;
    const classes = Object.keys(roster).sort();
    const TABS = [['table', '① 한눈에 표'], ['rank', '② 랭킹'], ['watch', '③ 주의 학생'], ['weak', '④ 개념별 약점'], ['std', '⑤ 성취기준'], ['mis', '⑥ 오개념'], ['memo', '⑦ 세특 메모'], ['sv', '📝 설문'], ['use', '📈 활용 추이'], ['photo', '📷 서술형'], ['sym', '📖 기호 톡']];
    el.innerHTML = `<div class="panel framed"><h2>📊 학급 대시보드 <span class="muted small">교사만 · 학생 화면과 종합상황실에는 나오지 않아요</span></h2>
        <div class="tabs st-cls">${classes.length > 1 ? `<button class="tab${isAll() ? ' on' : ''}" data-cls="${ALL}">🏫 전체</button>` : ''}${classes.map((c) => `<button class="tab${c === cls ? ' on' : ''}" data-cls="${esc(c)}">${isBeta(c) ? '🧪 ' : ''}${esc(c)}</button>`).join('') || '<span class="muted">명단이 없어요 — 학생 관리에서 먼저 올려 주세요</span>'}</div>
        <div class="tabs dash-tabs">${TABS.map(([k, t]) => `<button class="tab${k === tab ? ' on' : ''}" data-tab="${k}">${t}</button>`).join('')}</div></div>
      <div class="panel framed dash-main">${(() => { const tn = data ? (data.testers || 0) + (data.classes || []).reduce((x, c) => x + (c.d.testers || 0), 0) : 0; const bc = Object.keys(roster).sort().filter(isBeta), bt = bc.length && (isAll() || !isBeta(cls)) ? ` · 베타 반 ${bc.join(' · ')} 은 빠졌어요` : isBeta(cls) ? ' · 🧪 이 반은 베타 반 — 「전체」 · 반 비교 · 설문 집계 · 다른 반 대항전에서 빠져요 (여기서는 그 반 기록을 그대로 보여요)' : ''; return tn || bt ? `<p class="muted small tst-note">🧪 시험 계정 ${tn}명은 랭킹 · 반 통계에서 빠졌어요${bt} (학생 관리에서 켜고 끔)</p>` : ''; })()}${!cls ? '' : !data ? '<p class="muted">불러오는 중…</p>' : !data.held.length && tab !== 'sv' && tab !== 'use' && tab !== 'photo' && tab !== 'sym' ? '<p class="muted">아직 저장된 수업 기록이 없어요. (학생이 수업 끝 결과를 보면 저장돼요)</p>' : VIEW[tab]()}</div>`;
    el.querySelectorAll('[data-cls]').forEach((b) => (b.onclick = () => { cls = b.dataset.cls; words = null; useData = null; useFor = ''; load(); }));
    el.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { tab = b.dataset.tab; render(); }));
    el.querySelectorAll('[data-sort]').forEach((b) => (b.onclick = () => { const k = b.dataset.sort; sortDir = sortKey === k ? -sortDir : (k === 'n' || k === 'name' ? 1 : -1); sortKey = k; render(); }));
    el.querySelectorAll('[data-who]').forEach((b) => (b.onclick = () => detail(b.dataset.who)));
    const csv = el.querySelector('#dash-csv'); if (csv) csv.onclick = downloadCsv;
    if (tab === 'sv') svBind(el);
    if (tab === 'sym') { const sl = el.querySelector('#sym-l'); if (sl) sl.onchange = () => { symL = sl.value; render(); }; }
    if (tab === 'use') useBind(el);
    if (tab === 'photo') { const h = el.querySelector('#ph-board'); if (h && DS.Photo) DS.Photo.board(h, { cls: isAll() ? '' : cls, roster }).catch((e) => { h.textContent = e.message || '불러오지 못했어요'; }); }
    el.querySelectorAll('[data-copy]').forEach((b) => (b.onclick = () => copy(b.dataset.copy === 'all' ? data.studs.map((s) => `${who(s)}: ${memo(s)}`).join('\n\n') : memo(data.studs.find((s) => s.key === b.dataset.copy)))));
  }
  const who = (s) => `${isAll() ? `${s.cls}반 ` : ''}${s.n}번 ${s.name}`;
  const COLS = [['n', '번호'], ['name', '이름'], ['left', '❗ 남은 문제'], ['part', '참여'], ['boss', '형성평가'], ['first', '첫 시도'], ['ox', '⭕ OX'], ['fixed', '고친 수'], ['hints', '💡 힌트'], ['hg', '💡 힌트 준'], ['ladN', '🪜 사다리'], ['seals', '업적'], ['tries', '던전 도전'], ['cards', '카드'], ['xp', 'Lv']];
  function sorted() {
    const v = (s) => (s[sortKey] == null ? -1 : s[sortKey]);
    const base = (a, b) => String(a.cls).localeCompare(String(b.cls)) || a.n - b.n;
    if (sortKey === 'n') return data.studs.slice().sort((a, b) => base(a, b) * sortDir);
    return data.studs.slice().sort((a, b) => (typeof v(a) === 'string' ? String(v(a)).localeCompare(String(v(b))) : v(a) - v(b)) * sortDir || base(a, b));
  }
  // 📈 활용 추이 (2026-11-06 사용자 「웹앱 접근량이 얼마나 늘고 있는지 · 복습 · 문제 풀이 접근 추적」): act/{반}/{날짜}/{번호} (DS.Usage) · 기록 전은 ≈ 추정
  let useData = null, useFor = '';
  async function loadUse() {
    const cs = isAll() ? liveCls() : [cls], key = cs.join(',');
    if (useFor === key && useData) return; useFor = key; useData = null;
    const parts = await Promise.all(cs.map((c) => DS.Usage.load(c, { estimate: true }).then((u) => ({ c, u }))));
    const days = {}; let since = null;
    parts.forEach(({ c, u }) => { if (u.since && (!since || u.since < since)) since = u.since; Object.entries(u.days).forEach(([d, byN]) => { days[d] = days[d] || {}; Object.entries(byN || {}).forEach(([n, x]) => { days[d][cs.length > 1 ? `${c}|${n}` : n] = x; }); }); });
    const names = {}; cs.forEach((c) => Object.entries(roster[c] || {}).forEach(([n, nm]) => { names[cs.length > 1 ? `${c}|${n}` : n] = { c, n: Number(n), name: typeof nm === 'string' ? nm : (nm && nm.name) || '' }; }));
    useData = { days, since, names, total: Object.keys(names).length };
    if (tab === 'use') render();
  }
  const ymd = (d) => `${+d.slice(4, 6)}/${+d.slice(6, 8)}`;
  function useBars(weeks, k, title, unit) {
    const max = Math.max(1, ...weeks.map((w) => w[k])), last = weeks[weeks.length - 1];
    return `<div class="use-chart"><p class="use-h">${title}</p><div class="use-bars">${weeks.map((w, i) => `<div class="use-col${w.est ? ' est' : ''}" title="${ymd(w.week)} 주 · ${w[k]}${unit}${w.est ? ' (≈ 기록 전 추정)' : ''}" data-tip="${ymd(w.week)} 주 · ${w[k]}${unit}${w.est ? ' ≈추정' : ''}"><i style="height:${((w[k] / max) * 100).toFixed(1)}%"></i>${i === weeks.length - 1 ? `<b>${w[k]}</b>` : ''}<span>${ymd(w.week)}</span></div>`).join('')}</div>
      <p class="muted small">이번 주 ${last[k]}${unit}</p></div>`;
  }
  function useBind(el) {
    if (!useData) loadUse().catch((e) => DS.UI.toast(e.message || '불러오지 못했어요'));
    const b = el.querySelector('#use-csv'); if (b) b.onclick = () => {
      const ps = DS.Usage.perStudent(useData.days), rows = [['반', '번호', '이름', '최근7일 수업밖 풀이', '그전7일', '증감', '마지막 활동']];
      Object.entries(useData.names).sort((a, b) => String(a[1].c).localeCompare(String(b[1].c)) || a[1].n - b[1].n).forEach(([k, s]) => { const p = ps[k] || { now: 0, prev: 0, last: '' }; rows.push([s.c, s.n, s.name, p.now, p.prev, p.now - p.prev, p.last ? ymd(p.last) : '']); });
      const blob = new Blob(['\ufeff' + rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `활용추이_${isAll() ? '전체' : cls}_${DS.Usage.day()}.csv`; a.click();
    };
  }
  const VIEW = {
    photo() { return '<div id="ph-board"><p class="muted">📷 서술형 결과를 불러오는 중…</p></div>'; }, // 2026-11-06 사진 채점 (DS.Photo.board)
    use() {
      if (!useData) return '<p class="muted">활동 기록을 모으는 중…</p>';
      const W = DS.Usage.weekly(useData.days, 8), now = W[W.length - 1], prev = W[W.length - 2] || { solves: 0, active: 0 }, T = useData.total || 1;
      const ps = DS.Usage.perStudent(useData.days), vals = Object.values(ps), r7 = vals.reduce((a, x) => a + x.now, 0), p7 = vals.reduce((a, x) => a + x.prev, 0), act7 = vals.filter((x) => x.now > 0).length, actP = vals.filter((x) => x.prev > 0).length; // 숫자 칸 = 최근 7일 vs 그 전 7일 (주 중간에도 공정하게)
      const dPct = p7 ? Math.round(((r7 - p7) / p7) * 100) : r7 ? 100 : 0, seen7 = Object.values(ps).filter((x) => x.last && x.last >= DS.Usage.addDays(DS.Usage.day(), -6)).length;
      const rows = Object.entries(useData.names).map(([k, s]) => ({ ...s, ...(ps[k] || { now: 0, prev: 0, last: '' }) })).sort((a, b) => b.now - a.now || (b.last > a.last ? 1 : -1) || a.n - b.n);
      const today = DS.Usage.day(), idle = (l) => !l || l < DS.Usage.addDays(today, -13);
      return `<p class="muted small">수업 밖에서 스스로 한 활동 (🎯 허수아비 복습 · 🏰 성채 · 📕 오답 고침) 과 접속을 주마다 셉니다 · 성적이 아니라 활용도 참고 자료 · ${useData.since ? `기록 시작 ${ymd(useData.since)} — 그 전 주는 ≈ 추정(줄무늬)` : '아직 새 기록이 없어 ≈ 추정만 보여요 (학생이 새 판으로 들어오면 쌓여요)'}</p>
        <div class="use-tiles">
          <div class="use-tile"><span>최근 7일 수업 밖 활동 학생</span><b>${act7}<small> / ${T}명</small></b><em class="${act7 >= actP ? 'up' : 'dn'}">${Math.round((act7 / T) * 100)}% · 그 전 7일 ${actP}명</em></div>
          <div class="use-tile"><span>최근 7일 수업 밖 풀이</span><b>${r7}<small>회</small></b><em class="${dPct >= 0 ? 'up' : 'dn'}">${dPct >= 0 ? '▲' : '▼'} ${Math.abs(dPct)}% <small>그 전 7일 ${p7}</small></em></div>
          <div class="use-tile"><span>1인당 풀이 (최근 7일)</span><b>${(r7 / T).toFixed(1)}<small>회</small></b><em>이번 주 오답 고침 ${now.fixes}회</em></div>
          <div class="use-tile"><span>최근 7일 접속 학생</span><b>${seen7}<small> / ${T}명</small></b><em>이번 주 수업 참여 ${now.joins}회</em></div>
        </div>
        <div class="use-grid">${useBars(W, 'active', '🧑‍🎓 수업 밖 활동 학생 수', '명')}${useBars(W, 'solves', '🎯 수업 밖 문제 풀이 수', '회')}${useBars(W, 'visits', '🚪 접속 학생 수', '명')}</div>
        <div class="row"><h3 class="use-h">학생별 (최근 7일 수업 밖 풀이 순)</h3><button class="btn small" id="use-csv">📥 CSV</button></div>
        <div class="tbl-wrap"><table class="dash-table use-table"><thead><tr><th>번호</th><th>이름</th><th>최근 7일</th><th>그 전 7일</th><th>증감</th><th>마지막 활동</th><th title="빈 종이 · 어두움 · 학습지가 아닌 사진 · 같은 사진 — AI 로 안 보내고 폰에서 걸러짐 (최근 7일)">🧹 걸러진 사진</th></tr></thead><tbody>
        ${rows.map((r) => `<tr class="${idle(r.last) ? 'use-idle' : ''}"><td>${isAll() ? `${esc(r.c)}-` : ''}${r.n}</td><td>${esc(r.name)}</td><td><b>${r.now}</b></td><td>${r.prev}</td><td class="${r.now - r.prev > 0 ? 'up' : r.now - r.prev < 0 ? 'dn' : ''}">${r.now - r.prev > 0 ? '▲' : r.now - r.prev < 0 ? '▼' : '·'} ${Math.abs(r.now - r.prev)}</td><td>${r.last ? ymd(r.last) : '<span class="muted">-</span>'}${idle(r.last) ? ' <span class="use-tag">2주 넘게 없음</span>' : ''}</td><td>${r.pf ? `<b class="ngc">${r.pf}</b>` : ''}</td></tr>`).join('')}</tbody></table></div>`;
    },
    table() {
      const arrow = (k) => (sortKey === k ? (sortDir > 0 ? ' ▲' : ' ▼') : '');
      // 차시 칸: 형성평가 기본 문항 맞힌 수 / 문항 (+ ⭐ 도전 문항) · 🟪 = 중단원던전 👑 재대결로 보충 (v0.9.7.9)
      const lessonCell = (s, l) => {
        const r = s.rec[l.id], fill = !!(((s.bon || {})[l.id] || {}).boss || {}).clear;
        const ic = (k) => (DS.Note ? DS.Note.icon(k, 'chip') : '');
        if (!r) return fill ? `<td class="dash-c fill" title="불참 → 중단원던전에서 보충">${ic('p')} 보충</td>` : `<td class="dash-c off">${(s.held || []).some((h) => h.id === l.id) || !isAll() ? '불참' : '-'}</td>`;
        const N = Number(r.bossN) || 0, b = Math.min(Number(r.boss) || 0, N), star = r.bossX != null ? Number(r.bossX) : Math.max(0, (Number(r.boss) || 0) - N), p = pct(b, N);
        return `<td class="dash-c ${heat(p)}" title="${esc(l.title)}">${b}/${N}${star ? ic('star') : ''}${fill && b < N ? ` <b class="fillc">→ ${ic('p')}</b>` : ''}</td>`;
      };
      return `<p class="muted small">칸 제목을 누르면 정렬 · 차시 칸 = 형성평가(맞힌 문항 / 문항) · 색이 진할수록 높음 · 이름을 누르면 개인 기록</p>
        <div class="st-scroll"><table class="r-table dash-t"><tr>${isAll() ? '<th>반</th>' : ''}${COLS.slice(0, 2).map(([k, t]) => `<th data-sort="${k}">${t}${arrow(k)}</th>`).join('')}${data.held.map((l) => `<th>${DS.Lessons.noText(l.no)}차시</th>`).join('')}${COLS.slice(2).map(([k, t]) => `<th data-sort="${k}">${t}${arrow(k)}</th>`).join('')}</tr>
        ${sorted().map((s) => `<tr>${isAll() ? `<td>${esc(s.cls)}</td>` : ''}<td>${s.n}</td><td><button class="linkish" data-who="${s.key}">${esc(s.name)}</button></td>${data.held.map((l) => lessonCell(s, l)).join('')}
          <td class="dash-c ${s.left ? 'nt-left' : 'ok'}">${s.left ? `❗ ${s.left}` : '✔'}</td>
          <td class="dash-c ${heat(s.part)}">${s.went}/${s.heldN}</td><td class="dash-c ${heat(s.boss)}">${show(s.boss)}</td><td class="dash-c ${heat(s.first)}">${show(s.first)}</td><td class="dash-c ${heat(s.ox)}">${show(s.ox)}</td>
          <td>${s.fixed}</td><td>${s.hints || ''}</td><td>${s.hg || ''}</td><td title="👣 1 대장 처치 · 🧩 2 근거 줄 · ✍ 4 서술형 통과">${Object.entries(s.lad || {}).map(([m, v]) => `<span class="lad">${m.replace(/^u/, '')}${v >= 4 ? '✍' : v >= 2 ? '🧩' : '👣'}${v < 2 && (s.ladW || {})[m] ? `<small>🧩${(s.ladW || {})[m]}</small>` : ''}</span>`).join(' ')}</td><td>${s.seals}</td><td>${s.tries}</td><td>${s.cards}</td><td>Lv.${s.lv}</td></tr>`).join('')}</table></div>
        <button class="btn" id="dash-csv">📥 표 내려받기 (엑셀에서 열리는 CSV)</button>`;
    },
    rank() {
      const board = (title, note, key, fmt, n = 99) => {
        const list = data.studs.filter((s) => s[key] != null).slice().sort((a, b) => b[key] - a[key] || a.n - b.n).slice(0, n);
        let rank = 0, prev = null;
        return `<div class="dash-board"><h3>${title} <span class="muted small">${note}</span></h3><ol class="dash-rank">${list.map((s, i) => { if (s[key] !== prev) { rank = i + 1; prev = s[key]; } return `<li class="${rank <= 3 ? `top${rank}` : ''}"><b>${rank}</b><span>${esc(who(s))}</span><em>${fmt(s)}</em></li>`; }).join('')}</ol></div>`;
      };
      const avg = (xs) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);
      const vs = isAll() ? data.classes.map(({ cls: c, d }) => ({ c, n: d.studs.length, boss: avg(d.studs.filter((x) => x.boss != null).map((x) => x.boss)), first: avg(d.studs.filter((x) => x.first != null).map((x) => x.first)), part: avg(d.studs.map((x) => x.part || 0)), xp: avg(d.studs.map((x) => x.xp)) })) : [];
      const vsBoard = !isAll() ? '' : `<div class="dash-board dash-vs"><h3>🏫 반 대항전 <span class="muted small">반 평균</span></h3><table class="r-table"><tr><th>반</th><th>인원</th><th>형성평가</th><th>첫 시도</th><th>참여</th><th>평균 EXP</th></tr>
        ${vs.sort((a, b) => (b.boss ?? -1) - (a.boss ?? -1)).map((v, i) => `<tr${i === 0 ? ' class="top1"' : ''}><td><b>${i === 0 ? '👑 ' : ''}${esc(v.c)}</b></td><td>${v.n}</td><td class="dash-c ${heat(v.boss)}">${show(v.boss)}</td><td class="dash-c ${heat(v.first)}">${show(v.first)}</td><td class="dash-c ${heat(v.part)}">${show(v.part)}</td><td>${v.xp ?? '-'}</td></tr>`).join('')}</table></div>`;
      return `${vsBoard}<p class="muted small">${isAll() ? `🏫 전학생 ${data.studs.length}명 · ` : ''}교사만 보는 순위예요. 학생에게는 보이지 않아요 (게임 안에서는 「기록은 성적이 아니다」 그대로).</p>
        <div class="dash-boards">
          ${board('🎯 형성평가', '참여한 차시 평균', 'boss', (s) => `${s.boss}% <small>(${s.bossRaw[0]}/${s.bossRaw[1]})</small>`)}
          ${board('✅ 첫 시도 정답률', '재도전 전 첫 답', 'first', (s) => `${s.first}% <small>(${s.firstRaw[0]}/${s.firstRaw[1]})</small>`)}
          ${board('🙋 참여', isAll() ? '반마다 수업한 차시 중 참여율' : `수업한 ${data.held.length}차시 중`, 'part', (s) => `${s.part}% <small>(${s.went}/${s.heldN})</small>`)}
        </div>
        <div class="dash-boards small3">
          ${board('🔁 끈기 TOP 5', '재도전으로 고친 문제', 'fixed', (s) => `${s.fixed}개`, 5)}
          ${board('🏆 자기주도 TOP 5', '중단원던전 도전 횟수', 'tries', (s) => `${s.tries}회 · 업적 ${s.seals}`, 5)}
          ${board('⭐ 성장 TOP 5', 'EXP', 'xp', (s) => `Lv.${s.lv} · ${s.xp}`, 5)}
        </div>`;
    },
    watch() {
      const last2 = data.held.slice(-2);
      const rows = data.studs.map((s) => {
        const why = [];
        const miss = (s.held || data.held).slice(-2).filter((l) => !s.rec[l.id]);
        if (miss.length) why.push(`최근 불참: ${miss.map((l) => `${DS.Lessons.noText(l.no)}차시`).join(', ')}`);
        if (s.boss != null && s.boss < 50) why.push(`형성평가 평균 ${s.boss}%`);
        if (s.first != null && s.first < 50) why.push(`첫 시도 정답률 ${s.first}%`);
        if (s.went && !s.tries) why.push('허수아비 · 성채 0회');
        // 🔍 고침 패턴 (2026-11-05 · 벌 아님 · 선생님 확인용): 형성평가는 잘하는데 레이드 첫 시도만 낮고 「틀림 → 고침」이 많음 = 일부러 틀렸을 수도
        if (s.boss != null && s.first != null && s.boss >= 85 && s.first < 60 && s.fixed >= 6) why.push(`🔍 고침 패턴 확인 (형성평가 ${s.boss}% · 레이드 첫 시도 ${s.first}% · 고친 ${s.fixed}개)`);
        return { s, why };
      }).filter((r) => r.why.length);
      return `<p class="muted small">최근 2차시(${isAll() ? '반마다' : last2.map((l) => `${DS.Lessons.noText(l.no)}차시`).join(' · ')}) 불참 · 형성평가 50% 미만 · 첫 시도 50% 미만 · 허수아비 · 성채 0회 · 🔍 고침 패턴(형성평가 85% 이상인데 레이드 첫 시도 60% 미만 · 고친 6개 이상 — 벌이 아니라 확인용)</p>
        ${rows.length ? `<table class="r-table">${rows.map(({ s, why }) => `<tr><td>${isAll() ? `${esc(s.cls)} ` : ''}${s.n}번</td><td><button class="linkish" data-who="${s.key}">${esc(s.name)}</button></td><td>${why.map((w) => `<span class="dash-tag">${esc(w)}</span>`).join(' ')}</td></tr>`).join('')}</table>` : '<p class="okc">👍 지금 눈에 띄는 학생이 없어요.</p>'}`;
    },
    weak() {
      const agg = {};
      data.studs.forEach((s) => Object.entries(s.conc).forEach(([k, v]) => { const a = (agg[k] = agg[k] || { name: v.name, lesson: v.lesson, ok: 0, total: 0, who: 0 }); a.ok += v.ok; a.total += v.total; a.who += 1; }));
      const list = Object.values(agg).map((a) => ({ ...a, p: pct(a.ok, a.total) })).sort((a, b) => a.p - b.p);
      return `<p class="muted small">반 전체 첫 시도 정답률이 낮은 개념부터 — 다음 수업 복습 1순위</p>
        <table class="r-table">${list.map((a, i) => `<tr><td>${i + 1}</td><td>${DS.Lessons.noText(a.lesson.no)}차시</td><td>${esc(a.name)}</td><td class="dash-c ${heat(a.p)}">${a.p}%</td><td class="muted small">${a.ok}/${a.total} · ${a.who}명</td></tr>`).join('')}</table>`;
    },
    std() {
      const S = DS.Standards; if (!S) return '';
      const used = S.LIST.filter((sd) => data.studs.some((st) => st.std[sd.id]));
      if (!used.length) return '<p class="muted">아직 성취기준에 묶을 기록이 없어요.</p>';
      const cell = (v) => { if (!v || !v[1]) return '<td class="dash-c off">-</td>'; const p = pct(v[0], v[1]); return `<td class="dash-c ${heat(p)}" title="${v[0]}/${v[1]}">${S.level(p)} <small>${p}%</small></td>`; };
      const reach = (sd) => { const xs = data.studs.filter((st) => st.std[sd.id] && st.std[sd.id][1]); return xs.length ? Math.round((100 * xs.filter((st) => pct(st.std[sd.id][0], st.std[sd.id][1]) >= 80).length) / xs.length) : null; };
      return `<p class="muted small">개념별 첫 시도(몬스터 · 형성평가)를 성취기준으로 묶은 참고 지표 · 도달 80% 이상 · 근접 50~79% · 미도달 50% 미만 · 칸에 손을 대면 맞힘/문항 <b class="gold">⚠ 성취기준 코드 · 문구는 초안 (확인 뒤 lessons/curriculum.js 에서 고침)</b></p>
        <div class="st-scroll"><table class="r-table dash-t"><tr>${isAll() ? '<th>반</th>' : ''}<th>번호</th><th>이름</th>${used.map((sd) => `<th title="${esc(sd.name)}">${esc(sd.code)}<br><small>${esc(sd.name)}</small></th>`).join('')}</tr>
        <tr class="dash-sum"><td colspan="${isAll() ? 3 : 2}">도달한 학생 비율</td>${used.map((sd) => { const r = reach(sd); return `<td class="dash-c ${heat(r)}">${show(r)}</td>`; }).join('')}</tr>
        ${sorted().map((st) => `<tr>${isAll() ? `<td>${esc(st.cls)}</td>` : ''}<td>${st.n}</td><td><button class="linkish" data-who="${st.key}">${esc(st.name)}</button></td>${used.map((sd) => cell(st.std[sd.id])).join('')}</tr>`).join('')}</table></div>`;
    },
    mis() {
      const M = DS.Mis; if (!M) return '';
      const agg = {};
      data.studs.forEach((st) => Object.entries(st.mis).forEach(([c, v]) => { const a = (agg[c] = agg[c] || { w: 0, f: 0, who: 0 }); a.w += v[0]; a.f += v[1]; a.who++; }));
      const list = Object.entries(agg).filter(([c]) => M.CODES[c]).sort((x, y) => y[1].w - x[1].w);
      if (!list.length) return '<p class="muted">아직 쌓인 오개념 기록이 없어요. (2026-11-03 이후 수업 · 중단원던전부터 기록돼요)</p>';
      return `<p class="muted small">틀린 답의 종류를 모은 것 · 「바로잡음」 = 그 뒤 재도전 · 형성평가 세트 2 · 보강에서 맞힘 · 점수가 아니라 다음 수업에서 짚을 것</p>
        <table class="r-table"><tr><th>코드</th><th>오개념</th><th>틀린 횟수</th><th>학생</th><th>바로잡음</th></tr>
        ${list.map(([c, a]) => `<tr><td>${c}</td><td>${esc(M.CODES[c].name)}</td><td>${a.w}</td><td>${a.who}명</td><td class="dash-c ${heat(pct(a.f, a.w))}">${pct(a.f, a.w)}%</td></tr>`).join('')}</table>
        <h3>학생별</h3><table class="r-table">${data.studs.filter((st) => Object.keys(st.mis).length).map((st) => `<tr><td>${esc(who(st))}</td><td>${M.top(st.mis, 4).map((t) => `<span class="dash-tag mis${t.fixed >= t.wrong ? ' ok' : ''}" title="${esc(t.name)}">${t.code} ${t.wrong}${t.fixed ? ` · ✔${t.fixed}` : ''}</span>`).join(' ')}</td></tr>`).join('')}</table>`;
    },
    memo() {
      return `<p class="muted small">기록에 있는 사실만으로 만든 초안이에요. 그대로 쓰지 말고 관찰 내용을 더해 다듬어 주세요.</p>
        <button class="btn" data-copy="all">📋 전체 복사</button>
        ${data.studs.map((s) => { const mo = memoMore(s); return `<div class="dash-memo"><b>${esc(who(s))}</b><p>${esc(memo(s))}</p>${mo.length ? `<p class="muted small dash-more">더 보기 · ${esc(mo.join(' '))}</p>` : ''}<button class="btn small" data-copy="${s.key}">복사</button></div>`; }).join('')}`;
    },
  };

  // ── 세특 메모 초안: 기록에 있는 사실만 · 생기부 낱말 (📝 #126 · 2026-11-12 선생님 · DECISIONS 「📝 세특 초안 = 생기부 낱말」) ───────
  //   순서 고정 = ① 참여 ② 이해 ③ 협력 · 지원 ④ 오류 수정 · 피드백 ⑤ 자기주도 ⑥ 성찰 · 문장 끝 「-함 · -임 · -보임」 · 본문 4~6문장 · 500자 안 · 남는 문장 = 「더 보기」
  //   게임 낱말(레이드 · 몬스터 · 보스 · 던전 · 성채 · 허수아비 · 모루 · 용사 · 레벨 · EXP · 콤보 · 랭킹 · 처치 · 💎 📜 · 등수)은 쓰지 않음 · 기록이 없으면 그 문장 없음
  const MEMO_MAX = 6, MEMO_LEN = 500;
  const symN = (s) => Object.values(s.symt || {}).reduce((a, by) => a + Object.values(by || {}).reduce((b, v) => b + (Number(v) || 0), 0), 0);
  function memoParts(s) {
    if (!s || !s.went) return { main: '저장된 수업 기록이 없음.', more: [] };
    const S = []; // [단계, 문장]
    // ① 참여
    S.push([1, `모둠 협동학습 형태의 수학 수업(${DS.SCHOOL ? DS.SUBJECT : '집합과 명제 단원'}) ${s.heldN}차시 중 ${s.went}차시에 참여함${s.went === s.heldN ? '(전 차시 참여)' : ''}`]);
    // ② 이해
    const cs = Object.values(s.conc || {}).filter((c) => c.total >= 2).map((c) => ({ ...c, p: pct(c.ok, c.total) }));
    const best = cs.filter((c) => c.p >= 80).sort((a, b) => b.p - a.p || b.total - a.total)[0];
    if (best) S.push([2, `'${best.name}' 개념에서 첫 시도 정답률 ${best.p}%로 정확한 이해를 보임`]);
    if (DS.Standards) { const good = Object.entries(s.std || {}).filter(([, v]) => v[1] >= 4 && pct(v[0], v[1]) >= 80).map(([id, v]) => ({ sd: DS.Standards.get(id), p: pct(v[0], v[1]) })).filter((x) => x.sd).sort((a, b) => b.p - a.p);
      if (good.length) S.push([2, `${good.slice(0, 2).map((g) => `'${g.sd.name}'`).join('과 ')} 성취기준에 안정적으로 도달함(첫 시도 정답률 ${good[0].p}%)`]); }
    if (s.boss != null) S.push([2, `형성평가에서 평균 ${s.boss}%의 정답률을 보임`]);
    // ③ 협력 · 지원
    if (s.hg) S.push([3, '어려워하는 친구를 돕고 격려하는 모습을 보임']);
    S.push([3, '학급 공동의 목표를 위해 친구들과 협력하며 문제를 해결함']);
    // ④ 오류 수정 · 피드백
    if (s.fixed) S.push([4, `틀린 문제를 유사 문항으로 다시 풀며 오류를 스스로 바로잡음(${s.fixed}개)`]);
    if (DS.Mis) { const t = DS.Mis.top(s.mis, 3).find((x) => x.fixed > 0); if (t) S.push([4, `초기에 ${t.seteuk}을(를) 혼동하였으나 재도전과 보충 학습을 통해 바로잡음`]); }
    if (s.photoRev) S.push([4, `풀이 과정을 근거와 함께 서술하고 교사의 피드백을 반영하여 고쳐 씀(${s.photoRev}회)`]);
    else if (s.photoN) S.push([4, `풀이 과정을 근거와 함께 서술함(${s.photoN}회)`]);
    if (s.hints) S.push([4, '교사가 제시한 단서를 활용해 풀이를 보완함']);
    // ⑤ 자기주도
    if (s.tryEval) S.push([5, `수업 외 시간에 단원 평가 문항에 ${s.tryEval}회 도전하며 스스로 단원을 정리함`]);
    if (s.trySet) S.push([5, `배운 내용을 유사 문항으로 반복 연습함(${s.trySet}회)`]);
    if (s.noteDone) S.push([5, `오답을 다시 풀어 보완을 완료함(${s.noteDone}문항)`]);
    if (s.cards) S.push([5, `기호와 개념의 뜻을 연결하여 정리하는 활동을 ${s.cards}회 완료함`]);
    if (symN(s)) S.push([5, '낯선 기호의 뜻을 스스로 찾아보며 학습함']);
    // ⑥ 성찰
    if (s.surveyed) S.push([6, '수업 후 배운 점과 어려웠던 점을 돌아보는 성찰에 참여함']);
    // 본문 = 단계마다 첫 문장부터 고르게(순서는 그대로) · 6문장 · 500자 안 → 남는 문장 = 더 보기
    const pick = new Set(), len = (ids) => ids.reduce((a, i) => a + S[i][1].length + 2, 0);
    for (let round = 0; round < 3 && pick.size < MEMO_MAX; round++) {
      const firstOf = {}; S.forEach(([k], i) => { if (pick.has(i)) return; if (firstOf[k] == null) firstOf[k] = i; });
      for (const i of Object.values(firstOf).sort((a, b) => a - b)) { if (pick.size >= MEMO_MAX) break; if (len([...pick, i]) <= MEMO_LEN) pick.add(i); }
    }
    const main = S.map((x, i) => i).filter((i) => pick.has(i)).map((i) => S[i][1]), more = S.map((x, i) => i).filter((i) => !pick.has(i)).map((i) => S[i][1]);
    return { main: main.join('. ') + '.', more: more.map((t) => t + '.') };
  }
  const memo = (s) => memoParts(s).main;
  const memoMore = (s) => memoParts(s).more;

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); DS.UI.toast('복사했어요'); }
    catch (e) { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); DS.UI.toast('복사했어요'); }
  }
  // ── 📝 설문 탭 (v0.9.8.2): 반별 열기 · 닫기 · 응답 수 · 회고 비교(중간고사 전 → 지금) · 도움 된 것 · 서술 · CSV · 💬 마지막 한마디 모아 보기
  //   응답은 익명(이름 · 번호 · 시각 없음) — 응답 수 / 응답한 학생 수만 셈. 탭을 열 때 한 번 읽고 「새로 고침」으로 다시
  let sv = null, svFor = '', words = null;
  const svClasses = () => (isAll() ? liveCls() : [cls]);
  async function svLoad() {
    const cs = svClasses(), key = cs.join(',');
    svFor = key; sv = null;
    const parts = await Promise.all(cs.map(async (c) => ({ c, st: await DS.Survey.state(c), list: await DS.Survey.answers(c), done: await DS.Survey.doneCount(c), size: Object.keys(roster[c] || {}).length })));
    if (svFor !== key) return;
    sv = parts; render();
  }
  const bar = (n, max) => `<i class="sv-bar" style="width:${max ? Math.round((100 * n) / max) : 0}%"></i>`;
  const sign = (d) => (d == null ? '-' : `${d > 0 ? '+' : ''}${d.toFixed(2)}`);
  // 📖 기호 톡 (#54 · 2026-11-10): 학생이 많이 누른 기호 순위 (반 · 차시 거르기) · 벌 · 보상 없음 · 헷갈리는 기호 = 다음 수업 짚을 곳
  let symL = '';
  VIEW.sym = function () {
    if (!DS.SymTalk) return '<p class="muted">기호 톡 모듈이 없어요.</p>';
    const studs = (data && data.studs) || [], lids = [...new Set(studs.flatMap((s) => Object.keys(s.symt || {})))].sort();
    const name = (lid) => { const l = DS.Lessons.get(lid); return l ? (l.eval ? `🏰 ${l.title || lid}` : `${DS.Lessons.noText(l.no)}차시`) : lid; };
    const list = DS.SymTalk.rank(Object.fromEntries(studs.map((s, i) => [i, { st: s.symt }])), symL), max = list.length ? list[0].n : 0;
    return `<p class="muted small">학생이 문제 속 기호를 톡 눌러 뜻을 본 횟수 · 많이 누른 기호 = 헷갈리는 기호 (다음 수업 짚을 곳) · 벌 · 보상 없음 · 테스트는 안 셈</p>
      <label>차시 <select id="sym-l"><option value="">모두</option>${lids.map((l) => `<option value="${esc(l)}"${l === symL ? ' selected' : ''}>${esc(name(l))}</option>`).join('')}</select></label>
      ${list.length ? `<table class="r-table">${list.map((r, i) => `<tr><td>${i + 1}</td><td class="math"><b>${DS.UI.pretty(r.sym)}</b></td><td class="muted small">${esc(r.easy)}</td><td style="min-width:120px">${bar(r.n, max)} <b>${r.n}</b>번</td><td class="muted small">${r.who}명</td></tr>`).join('')}</table>` : '<p class="muted">아직 누른 기록이 없어요.</p>'}`;
  };
  VIEW.sv = function () {
    if (!DS.Survey) return '<p class="muted">설문 모듈이 없어요.</p>';
    if (svFor !== svClasses().join(',') || !sv) { if (svFor !== svClasses().join(',')) svLoad(); return '<p class="muted">설문 불러오는 중…</p>'; }
    const maxNo = Math.max(0, ...data.held.map((l) => l.no || 0));
    const ctl = sv.map((p) => `<tr><td>${esc(p.c)}반</td><td>${p.st && p.st.open ? `<b class="gold">열림 · ${DS.Lessons.noText(p.st.no)}차시</b>` : '<span class="muted">닫힘</span>'}</td><td>${p.done}/${p.size}명 응답 · 응답 ${p.list.length}개</td>
      <td>${p.st && p.st.open ? `<button class="btn small" data-svc="${esc(p.c)}" data-on="0">✕ 닫기</button>` : `<button class="btn small" data-svc="${esc(p.c)}" data-on="1">열기</button>`}</td></tr>`).join('');
    const all = sv.flatMap((p) => p.list), S = DS.Survey.summary(all);
    const pMax = Math.max(1, ...S.picks.map((x) => x.n)), cMax = Math.max(1, ...S.cmp.map((x) => x.n));
    const body = !S.n ? '<p class="muted">아직 응답이 없어요. 7~8차시 마무리 때 위에서 「열기」 (또는 교사 리모컨 마무리 화면의 📝 설문 열기)</p>' : `
      <h3>A. 회고 비교 <span class="muted small">(1~5점 평균 · 응답 ${S.n}개)</span></h3>
      <div class="st-scroll"><table class="r-table sv-t"><tr><th>문장</th><th>2학기 중간고사 전</th><th>지금</th><th>변화</th><th>오름 / 같음 / 내림</th></tr>
      ${S.pairs.map((r, i) => `<tr><td>${i + 1}. ${esc(r.q)}</td><td>${r.pre ?? '-'}</td><td><b>${r.now ?? '-'}</b></td><td class="${r.diff > 0 ? 'sv-up' : r.diff < 0 ? 'sv-down' : ''}">${sign(r.diff)}</td><td>${r.up} / ${r.same} / ${r.down}</td></tr>`).join('')}</table></div>
      <h3>B. 지금 수업</h3>
      <div class="sv-cols"><div><p class="gold small">8. 가장 도움이 된 것 (2개까지)</p>${S.picks.slice().sort((a, b) => b.n - a.n).map((x) => `<p class="sv-row"><span>${esc(x.t)}</span>${bar(x.n, pMax)}<b>${x.n}</b></p>`).join('')}</div>
        <div><p class="gold small">9. 쉼터 놀이 vs 예전 5분 퀴즈</p>${S.cmp.map((x) => `<p class="sv-row"><span>${esc(x.t)}</span>${bar(x.n, cMax)}<b>${x.n}</b></p>`).join('')}</div></div>
      <h3>10. 달라진 점 <span class="muted small">(${S.say.length}개)</span></h3><ul class="sv-texts">${S.say.map((t) => `<li>${esc(t)}</li>`).join('') || '<li class="muted">없음</li>'}</ul>
      <h3>11. 바꿨으면 하는 점 <span class="muted small">(${S.want.length}개)</span></h3><ul class="sv-texts">${S.want.map((t) => `<li>${esc(t)}</li>`).join('') || '<li class="muted">없음</li>'}</ul>
      <button class="btn" id="sv-csv">📥 설문 응답 내려받기 (CSV · 이름 없음)</button>`;
    const W = words ? `<h3>💬 마지막 한마디 <span class="muted small">(${words.length}개 · 수업 화면에 이미 보인 말풍선)</span></h3><ul class="sv-texts">${words.map((w) => `<li><span class="muted small">${esc(w.cls)} · ${w.no ? `${DS.Lessons.noText(w.no)}차시` : ''}</span> ${esc(w.t)}</li>`).join('') || '<li class="muted">없음</li>'}</ul>` : '<button class="btn small" id="sv-words">💬 마지막 한마디 모아 보기</button>';
    return `<p class="muted small">🔒 응답에는 이름 · 번호 · 시각이 저장되지 않아요. 「응답한 학생 수」만 따로 세요 (한 번만 · +5 EXP).</p>
      <table class="r-table sv-ctlt"><tr><th>반</th><th>상태</th><th>응답</th><th></th></tr>${ctl}</table>
      <p class="muted small">열 때 차시 (선생님이 고름 · 이 기기 기억 · 기록의 마지막 차시 ${maxNo || '?'}) <input id="sv-no" type="number" min="1" max="30" value="${DS.Survey.pickNo ? DS.Survey.pickNo() : maxNo || 10}" class="sv-no"> · <button class="btn small" id="sv-re">🔄 새로 고침</button></p>
      ${body}${W}`;
  };
  function svBind(el) {
    el.querySelectorAll('[data-svc]').forEach((b) => (b.onclick = () => DS.Control.run(async () => {
      const on = b.dataset.on === '1', no = Number((el.querySelector('#sv-no') || {}).value) || 0; if (on && DS.Survey.keepNo) DS.Survey.keepNo(no);
      if (on && !confirm(`${b.dataset.svc}반 설문을 ${no}차시로 열까요? (학생 폰 대기실 · 캠프에 📝 버튼)`)) return;
      await DS.Survey.setOpen(b.dataset.svc, on, no); svFor = ''; render();
    })));
    const ni = el.querySelector('#sv-no'); if (ni && DS.Survey.keepNo) ni.onchange = () => DS.Survey.keepNo(Number(ni.value) || 10); // 다시 그려도 고른 번호 그대로
    const re = el.querySelector('#sv-re'); if (re) re.onclick = () => { svFor = ''; render(); };
    const c = el.querySelector('#sv-csv'); if (c) c.onclick = () => {
      const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const rows = DS.Survey.csvRows(Object.fromEntries(sv.map((p) => [p.c, p.list])));
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + rows.map((r) => r.map(q).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
      a.download = `수업설문_${isAll() ? '전체' : cls}_${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(a); a.click(); a.remove();
    };
    const w = el.querySelector('#sv-words'); if (w) w.onclick = () => DS.Control.run(async () => {
      w.disabled = true; w.textContent = '모으는 중…';
      const rooms = (await DS.Net.get('rooms').catch(() => null)) || {}, want = new Set(svClasses());
      words = Object.values(rooms).filter((r) => r && r.meta && r.words && want.has(r.meta.cls))
        .flatMap((r) => { const L = DS.Lessons.get(r.meta.lesson) || {}; return Object.values(r.words).filter((x) => x && x.t && !x.bad).map((x) => ({ cls: r.meta.cls, no: L.no || 0, t: x.t })); })
        .sort((a, b) => a.no - b.no || String(a.cls).localeCompare(String(b.cls)));
      render();
    });
  }
  async function downloadCsv() {
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    // 🔁 화폐 전환 기록 (2026-11-07 · gem/{반}/{번호}/conv): 전환 전 깃털 · 💎 로 바뀐 양 · 그때 업적 수 → 분석용
    const gems = {}; for (const c of [...new Set(sorted().map((s) => s.cls))]) gems[c] = (await DS.Net.get(`gem/${String(c).replace(/[.#$/[\]]/g, '_')}`).catch(() => null)) || {};
    const cv = (s) => (((gems[s.cls] || {})[s.n] || {}).conv) || null;
    const cvAt = (x) => (x && Number(x.at) ? new Date(Number(x.at)).toLocaleString('ko-KR') : '');
    const head = [...(isAll() ? ['반'] : []), '번호', '이름', ...data.held.map((l) => `${DS.Lessons.noText(l.no)}차시 형성평가`), '남은 문제(오답노트)', '참여', '형성평가 평균(%)', '첫 시도 정답률(%)', '재도전으로 고친 수', '그림 힌트(소문제)', '업적', '보강 도전', '카드', '레벨', 'EXP', '전환 시각', '전환 때 업적', '전환 전 깃털', '깃털→💎', '💎 소급 카드', '카드→💎', '전환 전 💎', '전환 뒤 💎'];
    const rows = sorted().map((s) => [...(isAll() ? [s.cls] : []), s.n, s.name, ...data.held.map((l) => { const r = s.rec[l.id], fill = !!(((s.bon || {})[l.id] || {}).boss || {}).clear; if (!r) return fill ? '보충' : '불참'; const N = Number(r.bossN) || 0; return `${Math.min(Number(r.boss) || 0, N)}/${N}${fill ? ' (보충)' : ''}`; }), s.left, `${s.went}/${s.heldN}`, s.boss ?? '', s.first ?? '', s.fixed, s.hints || 0, s.seals, s.tries, s.cards, s.lv, s.xp, ...((x) => (x ? [cvAt(x), x.seals, x.feather, x.featherGem, x.cardsUnpaid, x.cardGem, x.gemBefore, x.gemAfter] : ['', '', '', '', '', '', '', '']))(cv(s))]);
    const csv = '﻿' + [head, ...rows].map((r) => r.map(q).join(',')).join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `학급대시보드_${isAll() ? '전체' : cls}_${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(a); a.click(); a.remove();
  }
  function detail(k) {
    const s = data.studs.find((x) => x.key === k); if (!s) return;
    const el = document.createElement('div'); el.className = 'modal camp-modal';
    el.innerHTML = `<div class="quiz-box framed st-detail"><h2>${esc(s.cls)} ${s.n}번 ${esc(s.name)}</h2>
      <p>Lv.${s.lv} ${esc(s.lvTitle || '')} · EXP ${s.xp} · 카드 ${s.cards} · 업적 ${s.seals} · 던전 도전 ${s.tries}회</p>
      <p>형성평가 ${show(s.boss)} · 첫 시도 ${show(s.first)} · 참여 ${s.went}/${s.heldN} · 고친 수 ${s.fixed}</p>
      ${DS.Result ? DS.Result.history(s.rec || {}) : ''}
      <div class="dash-memo"><b>세특 메모 초안</b><p>${esc(memo(s))}</p>${memoMore(s).length ? `<p class="muted small dash-more">더 보기 · ${esc(memoMore(s).join(' '))}</p>` : ''}</div>
      <div class="row"><button class="btn" id="dd-gem">💎 조각 주기</button><button class="btn" id="dd-copy">메모 복사</button><button class="btn" id="dd-x">✕ 닫기</button></div></div>`;
    document.body.appendChild(el);
    el.querySelector('#dd-x').onclick = () => el.remove();
    el.querySelector('#dd-copy').onclick = () => copy(memo(s));
    // 💎 선생님 지급 (2026-11-05): 1회 최대 5 · 이유 한 줄 (기록에 남음 · 세특 근거) · 하루 한도 밖
    el.querySelector('#dd-gem').onclick = () => DS.Control.run(async () => {
      const max = DS.Gem.G.teacherMax, n = Math.round(Number(prompt(`${s.name} 학생에게 줄 💎 조각 수 (1~${max})`, '3')));
      if (!n) return; if (n < 1 || n > max) throw Object.assign(new Error(`1~${max} 사이로 적어 주세요.`), { user: true });
      const why = String(prompt('이유 한 줄 (예: 친구에게 풀이를 설명함)', '') || '').trim(); if (!why) throw Object.assign(new Error('이유를 적어 주세요.'), { user: true });
      const g = await DS.Gem.add({ c: s.cls, n: s.n }, n, `teacher_${Date.now()}`, `👩‍🏫 ${why}`, { free: true });
      DS.UI.toast(`💎 ${g}개를 줬어요 · 「${why}」`);
    });
  }
  return { enter, _build: build, _memo: memoParts };
})();
