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
  let roster = {}, cls = '', tab = 'table', sortKey = 'n', sortDir = 1, data = null;

  async function enter() {
    if (!(await A().isAdmin())) throw Object.assign(new Error('교사 계정으로 로그인해야 해요.'), { user: true });
    DS.UI.show('screen-dash');
    DS.Scene.save({ role: 'dash' });
    roster = (await DS.Net.get('roster').catch(() => null)) || {};
    if (!cls || (cls !== ALL && !roster[cls])) cls = Object.keys(roster).sort()[0] || '';
    await load();
  }
  const ALL = '*';
  const isAll = () => cls === ALL;
  async function one(c) {
    const k = A().classKey(c);
    const [records, xp, cards, bonus] = await Promise.all(['records', 'xp', 'cards', 'bonus'].map((p) => DS.Net.get(`${p}/${k}`).catch(() => null)));
    const d = build(roster[c] || {}, records || {}, xp || {}, cards || {}, bonus || {});
    d.studs.forEach((st) => { st.cls = c; st.key = `${c}|${st.n}`; st.held = d.held; });
    return d;
  }
  async function load() {
    data = null; render();
    if (!cls) return;
    if (!isAll()) { data = await one(cls); render(); return; }
    // 🏫 전체: 반마다 따로 계산(참여율은 그 반이 수업한 차시 기준) → 합침
    const parts = await Promise.all(Object.keys(roster).sort().map(one));
    const held = [...new Map(parts.flatMap((d) => d.held).map((l) => [l.id, l])).values()].sort((a, b) => a.no - b.no);
    data = { held, studs: parts.flatMap((d) => d.studs), classes: parts.map((d, i) => ({ cls: Object.keys(roster).sort()[i], d })) };
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
      let ok = 0, tot = 0, bo = 0, bt = 0, fixed = 0, perf = 0;
      const conc = {}, std = {}, mis = {}; // 📚 성취기준별 첫 시도 · 🔎 오개념 (2026-11-03)
      went.forEach((l) => {
        const r = rec[l.id];
        Object.entries(r.conc || {}).forEach(([c, v]) => { ok += v[0]; tot += v[1]; const key = `${l.id}|${c}`; conc[key] = { name: (r.names || {})[c] || c, lesson: l, ok: v[0], total: v[1] };
          const sd = DS.Standards ? DS.Standards.of(l.id, c, l.no) : null; if (sd) { std[sd] = std[sd] || [0, 0]; std[sd][0] += v[0]; std[sd][1] += v[1]; } });
        if (DS.Mis && r.mis) DS.Mis.merge(mis, r.mis);
        bo += Number(r.boss) || 0; bt += Number(r.bossN) || 0; fixed += Number(r.fixed) || 0; perf += Number(r.perfects) || 0;
      });
      const total = Number((xp[n] || {}).total || 0), lv = DS.Grow ? DS.Grow.level(total) : { lv: 1, title: '' };
      const seals = DS.Bonus ? DS.Bonus.seals(bonus[n]).length : 0;
      if (DS.Mis) Object.values(bonus[n] || {}).forEach((l) => Object.values(l || {}).forEach((m) => { if (m && m.mis) DS.Mis.merge(mis, m.mis); }));
      const tries = Object.values(bonus[n] || {}).reduce((a, l) => a + Object.values(l || {}).reduce((b, m) => b + (Number((m || {}).tries) || 0), 0), 0);
      return { n, name: byN[n], rec, went: went.length, heldN: held.length, part: pct(went.length, held.length), boss: pct(bo, bt), bossRaw: [bo, bt], first: pct(ok, tot), firstRaw: [ok, tot],
        fixed, perf, seals, tries, cards: Object.keys(cards[n] || {}).length, xp: total, lv: lv.lv, lvTitle: lv.title, conc, std, mis };
    });
    return { held, studs };
  }

  // ── 그리기 ───────────────────────────────────────────
  const heat = (v) => (v == null ? '' : v >= 90 ? 'h5' : v >= 75 ? 'h4' : v >= 60 ? 'h3' : v >= 40 ? 'h2' : 'h1');
  const show = (v, unit = '%') => (v == null ? '<span class="muted">-</span>' : `${v}${unit}`);
  function render() {
    const el = $('#dash-body'); if (!el) return;
    const classes = Object.keys(roster).sort();
    const TABS = [['table', '① 한눈에 표'], ['rank', '② 랭킹'], ['watch', '③ 주의 학생'], ['weak', '④ 개념별 약점'], ['std', '⑤ 성취기준'], ['mis', '⑥ 오개념'], ['memo', '⑦ 세특 메모']];
    el.innerHTML = `<div class="panel framed"><h2>📊 학급 대시보드 <span class="muted small">교사만 · 학생 화면과 종합상황실에는 나오지 않아요</span></h2>
        <div class="tabs st-cls">${classes.length > 1 ? `<button class="tab${isAll() ? ' on' : ''}" data-cls="${ALL}">🏫 전체</button>` : ''}${classes.map((c) => `<button class="tab${c === cls ? ' on' : ''}" data-cls="${esc(c)}">${esc(c)}</button>`).join('') || '<span class="muted">명단이 없어요 — 학생 관리에서 먼저 올려 주세요</span>'}</div>
        <div class="tabs dash-tabs">${TABS.map(([k, t]) => `<button class="tab${k === tab ? ' on' : ''}" data-tab="${k}">${t}</button>`).join('')}</div></div>
      <div class="panel framed dash-main">${!cls ? '' : !data ? '<p class="muted">불러오는 중…</p>' : !data.held.length ? '<p class="muted">아직 저장된 수업 기록이 없어요. (학생이 수업 끝 결과를 보면 저장돼요)</p>' : VIEW[tab]()}</div>`;
    el.querySelectorAll('[data-cls]').forEach((b) => (b.onclick = () => { cls = b.dataset.cls; load(); }));
    el.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { tab = b.dataset.tab; render(); }));
    el.querySelectorAll('[data-sort]').forEach((b) => (b.onclick = () => { const k = b.dataset.sort; sortDir = sortKey === k ? -sortDir : (k === 'n' || k === 'name' ? 1 : -1); sortKey = k; render(); }));
    el.querySelectorAll('[data-who]').forEach((b) => (b.onclick = () => detail(b.dataset.who)));
    const csv = el.querySelector('#dash-csv'); if (csv) csv.onclick = downloadCsv;
    el.querySelectorAll('[data-copy]').forEach((b) => (b.onclick = () => copy(b.dataset.copy === 'all' ? data.studs.map((s) => `${who(s)}: ${memo(s)}`).join('\n\n') : memo(data.studs.find((s) => s.key === b.dataset.copy)))));
  }
  const who = (s) => `${isAll() ? `${s.cls}반 ` : ''}${s.n}번 ${s.name}`;
  const COLS = [['n', '번호'], ['name', '이름'], ['part', '참여'], ['boss', '형성평가'], ['first', '첫 시도'], ['fixed', '고친 수'], ['seals', '인장'], ['tries', '던전 도전'], ['cards', '카드'], ['xp', 'Lv']];
  function sorted() {
    const v = (s) => (s[sortKey] == null ? -1 : s[sortKey]);
    const base = (a, b) => String(a.cls).localeCompare(String(b.cls)) || a.n - b.n;
    if (sortKey === 'n') return data.studs.slice().sort((a, b) => base(a, b) * sortDir);
    return data.studs.slice().sort((a, b) => (typeof v(a) === 'string' ? String(v(a)).localeCompare(String(v(b))) : v(a) - v(b)) * sortDir || base(a, b));
  }
  const VIEW = {
    table() {
      const arrow = (k) => (sortKey === k ? (sortDir > 0 ? ' ▲' : ' ▼') : '');
      const lessonCell = (s, l) => { const r = s.rec[l.id]; if (!r) return `<td class="dash-c off">${(s.held || []).some((h) => h.id === l.id) || !isAll() ? '불참' : '-'}</td>`; const p = pct(Number(r.boss) || 0, Number(r.bossN) || 0); return `<td class="dash-c ${heat(p)}" title="${esc(l.title)}">${Number(r.boss) || 0}/${Number(r.bossN) || 0}${r.won ? '' : ''}</td>`; };
      return `<p class="muted small">칸 제목을 누르면 정렬 · 차시 칸 = 형성평가(맞힌 문항 / 문항) · 색이 진할수록 높음 · 이름을 누르면 개인 기록</p>
        <div class="st-scroll"><table class="r-table dash-t"><tr>${isAll() ? '<th>반</th>' : ''}${COLS.slice(0, 2).map(([k, t]) => `<th data-sort="${k}">${t}${arrow(k)}</th>`).join('')}${data.held.map((l) => `<th>${l.no}차시</th>`).join('')}${COLS.slice(2).map(([k, t]) => `<th data-sort="${k}">${t}${arrow(k)}</th>`).join('')}</tr>
        ${sorted().map((s) => `<tr>${isAll() ? `<td>${esc(s.cls)}</td>` : ''}<td>${s.n}</td><td><button class="linkish" data-who="${s.key}">${esc(s.name)}</button></td>${data.held.map((l) => lessonCell(s, l)).join('')}
          <td class="dash-c ${heat(s.part)}">${s.went}/${s.heldN}</td><td class="dash-c ${heat(s.boss)}">${show(s.boss)}</td><td class="dash-c ${heat(s.first)}">${show(s.first)}</td>
          <td>${s.fixed}</td><td>${s.seals}</td><td>${s.tries}</td><td>${s.cards}</td><td>Lv.${s.lv}</td></tr>`).join('')}</table></div>
        <button class="btn" id="dash-csv">⬇ 표 내려받기 (엑셀에서 열리는 CSV)</button>`;
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
          ${board('🟪 자기주도 TOP 5', '중단원던전 도전 횟수', 'tries', (s) => `${s.tries}회 · 인장 ${s.seals}`, 5)}
          ${board('⭐ 성장 TOP 5', 'EXP', 'xp', (s) => `Lv.${s.lv} · ${s.xp}`, 5)}
        </div>`;
    },
    watch() {
      const last2 = data.held.slice(-2);
      const rows = data.studs.map((s) => {
        const why = [];
        const miss = (s.held || data.held).slice(-2).filter((l) => !s.rec[l.id]);
        if (miss.length) why.push(`최근 불참: ${miss.map((l) => `${l.no}차시`).join(', ')}`);
        if (s.boss != null && s.boss < 50) why.push(`형성평가 평균 ${s.boss}%`);
        if (s.first != null && s.first < 50) why.push(`첫 시도 정답률 ${s.first}%`);
        if (s.went && !s.tries) why.push('중단원던전 0회');
        return { s, why };
      }).filter((r) => r.why.length);
      return `<p class="muted small">최근 2차시(${isAll() ? '반마다' : last2.map((l) => `${l.no}차시`).join(' · ')}) 불참 · 형성평가 50% 미만 · 첫 시도 50% 미만 · 중단원던전 0회</p>
        ${rows.length ? `<table class="r-table">${rows.map(({ s, why }) => `<tr><td>${isAll() ? `${esc(s.cls)} ` : ''}${s.n}번</td><td><button class="linkish" data-who="${s.key}">${esc(s.name)}</button></td><td>${why.map((w) => `<span class="dash-tag">${esc(w)}</span>`).join(' ')}</td></tr>`).join('')}</table>` : '<p class="okc">👍 지금 눈에 띄는 학생이 없어요.</p>'}`;
    },
    weak() {
      const agg = {};
      data.studs.forEach((s) => Object.entries(s.conc).forEach(([k, v]) => { const a = (agg[k] = agg[k] || { name: v.name, lesson: v.lesson, ok: 0, total: 0, who: 0 }); a.ok += v.ok; a.total += v.total; a.who += 1; }));
      const list = Object.values(agg).map((a) => ({ ...a, p: pct(a.ok, a.total) })).sort((a, b) => a.p - b.p);
      return `<p class="muted small">반 전체 첫 시도 정답률이 낮은 개념부터 — 다음 수업 복습 1순위</p>
        <table class="r-table">${list.map((a, i) => `<tr><td>${i + 1}</td><td>${a.lesson.no}차시</td><td>${esc(a.name)}</td><td class="dash-c ${heat(a.p)}">${a.p}%</td><td class="muted small">${a.ok}/${a.total} · ${a.who}명</td></tr>`).join('')}</table>`;
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
        ${data.studs.map((s) => `<div class="dash-memo"><b>${esc(who(s))}</b><p>${esc(memo(s))}</p><button class="btn small" data-copy="${s.key}">복사</button></div>`).join('')}`;
    },
  };

  // ── 세특 메모 초안: 기록에 있는 사실만 ───────────────
  function memo(s) {
    if (!s || !s.went) return '저장된 수업 기록이 없음.';
    const parts = [];
    parts.push(`게임 기반 협동 레이드 수업(집합 단원) ${s.heldN}차시 중 ${s.went}차시에 참여함${s.went === s.heldN ? '(전 차시 참여)' : ''}`);
    const cs = Object.values(s.conc).filter((c) => c.total >= 2).map((c) => ({ ...c, p: pct(c.ok, c.total) }));
    const best = cs.filter((c) => c.p >= 80).sort((a, b) => b.p - a.p || b.total - a.total)[0];
    if (best) parts.push(`특히 '${best.name}' 개념에서 첫 시도 정답률 ${best.p}%로 정확한 이해를 보임`);
    if (s.boss != null) parts.push(`형성평가 평균 ${s.boss}%를 기록함`);
    if (s.fixed) parts.push(`틀린 문제를 숫자를 바꾼 재도전 문제로 ${s.fixed}개 스스로 바로잡으며 끝까지 해결하려는 태도를 보임`);
    if (s.tries) parts.push(`수업 뒤 중단원던전에 ${s.tries}회 도전${s.seals ? `하여 ${s.seals}개 층을 모두 해결하는` : '하는'} 등 자기주도적으로 복습함`);
    if (s.cards) parts.push(`모루(개념 카드 만들기)에서 기호와 개념을 연결한 카드 ${s.cards}장을 완성함`);
    if (DS.Standards) { const good = Object.entries(s.std || {}).filter(([, v]) => v[1] >= 4 && pct(v[0], v[1]) >= 80).map(([id, v]) => ({ sd: DS.Standards.get(id), p: pct(v[0], v[1]) })).filter((x) => x.sd).sort((a, b) => b.p - a.p);
      if (good.length) parts.push(`${good.slice(0, 2).map((g) => `'${g.sd.name}'`).join('과 ')} 성취기준에 안정적으로 도달함(첫 시도 정답률 ${good[0].p}%)`); }
    if (DS.Mis) { const t = DS.Mis.top(s.mis, 3).find((x) => x.fixed > 0); if (t) parts.push(`초기에 ${t.seteuk}을(를) 혼동하였으나 재도전 과제와 보충 과제를 통해 스스로 바로잡음`); }
    const weak = cs.filter((c) => c.p < 50).sort((a, b) => a.p - b.p)[0];
    if (weak && s.fixed) parts.push(`'${weak.name}' 개념은 처음에 어려워했으나 재도전을 통해 보완해 나감`);
    return parts.join('. ') + '.';
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); DS.UI.toast('복사했어요'); }
    catch (e) { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); DS.UI.toast('복사했어요'); }
  }
  function downloadCsv() {
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = [...(isAll() ? ['반'] : []), '번호', '이름', ...data.held.map((l) => `${l.no}차시 형성평가`), '참여', '형성평가 평균(%)', '첫 시도 정답률(%)', '재도전으로 고친 수', '보강 인장', '보강 도전', '카드', '레벨', 'EXP'];
    const rows = sorted().map((s) => [...(isAll() ? [s.cls] : []), s.n, s.name, ...data.held.map((l) => (s.rec[l.id] ? `${Number(s.rec[l.id].boss) || 0}/${Number(s.rec[l.id].bossN) || 0}` : '불참')), `${s.went}/${s.heldN}`, s.boss ?? '', s.first ?? '', s.fixed, s.seals, s.tries, s.cards, s.lv, s.xp]);
    const csv = '﻿' + [head, ...rows].map((r) => r.map(q).join(',')).join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `학급대시보드_${isAll() ? '전체' : cls}_${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(a); a.click(); a.remove();
  }
  function detail(k) {
    const s = data.studs.find((x) => x.key === k); if (!s) return;
    const el = document.createElement('div'); el.className = 'modal camp-modal';
    el.innerHTML = `<div class="quiz-box framed st-detail"><h2>${esc(s.cls)} ${s.n}번 ${esc(s.name)}</h2>
      <p>Lv.${s.lv} ${esc(s.lvTitle || '')} · EXP ${s.xp} · 카드 ${s.cards} · 던전 인장 ${s.seals} · 던전 도전 ${s.tries}회</p>
      <p>형성평가 ${show(s.boss)} · 첫 시도 ${show(s.first)} · 참여 ${s.went}/${s.heldN} · 고친 수 ${s.fixed}</p>
      ${DS.Result ? DS.Result.history(s.rec || {}) : ''}
      <div class="dash-memo"><b>세특 메모 초안</b><p>${esc(memo(s))}</p></div>
      <div class="row"><button class="btn" id="dd-copy">메모 복사</button><button class="btn" id="dd-x">닫기</button></div></div>`;
    document.body.appendChild(el);
    el.querySelector('#dd-x').onclick = () => el.remove();
    el.querySelector('#dd-copy').onclick = () => copy(memo(s));
  }
  return { enter, _build: build };
})();
