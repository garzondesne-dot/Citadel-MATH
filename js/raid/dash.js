// 📊 학급 대시보드 (2026-11-03 · 교사 계정만 · 교사 메뉴): 서버에 쌓인 기록을 반 단위로 한눈에 — 학생 화면 · 종합상황실에는 나오지 않는다
//   읽는 곳 (교사만 읽을 수 있는 경로 · 규칙 변경 없음): roster/{반} · records/{반}/{번호}/{차시} · xp/{반} · cards/{반} · bonus/{반}
//   탭: ① 한눈에 표(칸 누르면 정렬 · CSV) ② 랭킹(형성평가 · 첫 시도 정답률 · 참여 각각 + 끈기 · 자기주도 · 성장) ③ 주의 학생 ④ 개념별 약점 ⑤ 세특 메모 초안
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
    if (!cls || !roster[cls]) cls = Object.keys(roster).sort()[0] || '';
    await load();
  }
  async function load() {
    data = null; render();
    if (!cls) return;
    const k = A().classKey(cls);
    const [records, xp, cards, bonus] = await Promise.all(['records', 'xp', 'cards', 'bonus'].map((p) => DS.Net.get(`${p}/${k}`).catch(() => null)));
    data = build(roster[cls] || {}, records || {}, xp || {}, cards || {}, bonus || {});
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
      const conc = {};
      went.forEach((l) => {
        const r = rec[l.id];
        Object.entries(r.conc || {}).forEach(([c, v]) => { ok += v[0]; tot += v[1]; const key = `${l.id}|${c}`; conc[key] = { name: (r.names || {})[c] || c, lesson: l, ok: v[0], total: v[1] }; });
        bo += Number(r.boss) || 0; bt += Number(r.bossN) || 0; fixed += Number(r.fixed) || 0; perf += Number(r.perfects) || 0;
      });
      const total = Number((xp[n] || {}).total || 0), lv = DS.Grow ? DS.Grow.level(total) : { lv: 1, title: '' };
      const seals = DS.Bonus ? DS.Bonus.seals(bonus[n]).length : 0;
      const tries = Object.values(bonus[n] || {}).reduce((a, l) => a + Object.values(l || {}).reduce((b, m) => b + (Number((m || {}).tries) || 0), 0), 0);
      return { n, name: byN[n], rec, went: went.length, part: pct(went.length, held.length), boss: pct(bo, bt), bossRaw: [bo, bt], first: pct(ok, tot), firstRaw: [ok, tot],
        fixed, perf, seals, tries, cards: Object.keys(cards[n] || {}).length, xp: total, lv: lv.lv, lvTitle: lv.title, conc };
    });
    return { held, studs };
  }

  // ── 그리기 ───────────────────────────────────────────
  const heat = (v) => (v == null ? '' : v >= 90 ? 'h5' : v >= 75 ? 'h4' : v >= 60 ? 'h3' : v >= 40 ? 'h2' : 'h1');
  const show = (v, unit = '%') => (v == null ? '<span class="muted">-</span>' : `${v}${unit}`);
  function render() {
    const el = $('#dash-body'); if (!el) return;
    const classes = Object.keys(roster).sort();
    const TABS = [['table', '① 한눈에 표'], ['rank', '② 랭킹'], ['watch', '③ 주의 학생'], ['weak', '④ 개념별 약점'], ['memo', '⑤ 세특 메모']];
    el.innerHTML = `<div class="panel framed"><h2>📊 학급 대시보드 <span class="muted small">교사만 · 학생 화면과 종합상황실에는 나오지 않아요</span></h2>
        <div class="tabs st-cls">${classes.map((c) => `<button class="tab${c === cls ? ' on' : ''}" data-cls="${esc(c)}">${esc(c)}</button>`).join('') || '<span class="muted">명단이 없어요 — 학생 관리에서 먼저 올려 주세요</span>'}</div>
        <div class="tabs dash-tabs">${TABS.map(([k, t]) => `<button class="tab${k === tab ? ' on' : ''}" data-tab="${k}">${t}</button>`).join('')}</div></div>
      <div class="panel framed dash-main">${!cls ? '' : !data ? '<p class="muted">불러오는 중…</p>' : !data.held.length ? '<p class="muted">이 반은 아직 저장된 수업 기록이 없어요. (학생이 수업 끝 결과를 보면 저장돼요)</p>' : VIEW[tab]()}</div>`;
    el.querySelectorAll('[data-cls]').forEach((b) => (b.onclick = () => { cls = b.dataset.cls; load(); }));
    el.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { tab = b.dataset.tab; render(); }));
    el.querySelectorAll('[data-sort]').forEach((b) => (b.onclick = () => { const k = b.dataset.sort; sortDir = sortKey === k ? -sortDir : (k === 'n' || k === 'name' ? 1 : -1); sortKey = k; render(); }));
    el.querySelectorAll('[data-who]').forEach((b) => (b.onclick = () => detail(Number(b.dataset.who))));
    const csv = el.querySelector('#dash-csv'); if (csv) csv.onclick = downloadCsv;
    el.querySelectorAll('[data-copy]').forEach((b) => (b.onclick = () => copy(b.dataset.copy === 'all' ? data.studs.map((s) => `${s.n}번 ${s.name}: ${memo(s)}`).join('\n\n') : memo(data.studs.find((s) => s.n === Number(b.dataset.copy))))));
  }
  const COLS = [['n', '번호'], ['name', '이름'], ['part', '참여'], ['boss', '형성평가'], ['first', '첫 시도'], ['fixed', '고친 수'], ['seals', '인장'], ['tries', '보강 도전'], ['cards', '카드'], ['xp', 'Lv']];
  function sorted() {
    const v = (s) => (s[sortKey] == null ? -1 : s[sortKey]);
    return data.studs.slice().sort((a, b) => (typeof v(a) === 'string' ? String(v(a)).localeCompare(String(v(b))) : v(a) - v(b)) * sortDir || a.n - b.n);
  }
  const VIEW = {
    table() {
      const arrow = (k) => (sortKey === k ? (sortDir > 0 ? ' ▲' : ' ▼') : '');
      const lessonCell = (s, l) => { const r = s.rec[l.id]; if (!r) return '<td class="dash-c off">불참</td>'; const p = pct(Number(r.boss) || 0, Number(r.bossN) || 0); return `<td class="dash-c ${heat(p)}" title="${esc(l.title)}">${Number(r.boss) || 0}/${Number(r.bossN) || 0}${r.won ? '' : ''}</td>`; };
      return `<p class="muted small">칸 제목을 누르면 정렬 · 차시 칸 = 형성평가(맞힌 문항 / 문항) · 색이 진할수록 높음 · 이름을 누르면 개인 기록</p>
        <div class="st-scroll"><table class="r-table dash-t"><tr>${COLS.slice(0, 2).map(([k, t]) => `<th data-sort="${k}">${t}${arrow(k)}</th>`).join('')}${data.held.map((l) => `<th>${l.no}차시</th>`).join('')}${COLS.slice(2).map(([k, t]) => `<th data-sort="${k}">${t}${arrow(k)}</th>`).join('')}</tr>
        ${sorted().map((s) => `<tr><td>${s.n}</td><td><button class="linkish" data-who="${s.n}">${esc(s.name)}</button></td>${data.held.map((l) => lessonCell(s, l)).join('')}
          <td class="dash-c ${heat(s.part)}">${s.went}/${data.held.length}</td><td class="dash-c ${heat(s.boss)}">${show(s.boss)}</td><td class="dash-c ${heat(s.first)}">${show(s.first)}</td>
          <td>${s.fixed}</td><td>${s.seals}</td><td>${s.tries}</td><td>${s.cards}</td><td>Lv.${s.lv}</td></tr>`).join('')}</table></div>
        <button class="btn" id="dash-csv">⬇ 표 내려받기 (엑셀에서 열리는 CSV)</button>`;
    },
    rank() {
      const board = (title, note, key, fmt, n = 99) => {
        const list = data.studs.filter((s) => s[key] != null).slice().sort((a, b) => b[key] - a[key] || a.n - b.n).slice(0, n);
        let rank = 0, prev = null;
        return `<div class="dash-board"><h3>${title} <span class="muted small">${note}</span></h3><ol class="dash-rank">${list.map((s, i) => { if (s[key] !== prev) { rank = i + 1; prev = s[key]; } return `<li class="${rank <= 3 ? `top${rank}` : ''}"><b>${rank}</b><span>${s.n}번 ${esc(s.name)}</span><em>${fmt(s)}</em></li>`; }).join('')}</ol></div>`;
      };
      return `<p class="muted small">교사만 보는 순위예요. 학생에게는 보이지 않아요 (게임 안에서는 「기록은 성적이 아니다」 그대로).</p>
        <div class="dash-boards">
          ${board('🎯 형성평가', '참여한 차시 평균', 'boss', (s) => `${s.boss}% <small>(${s.bossRaw[0]}/${s.bossRaw[1]})</small>`)}
          ${board('✅ 첫 시도 정답률', '재도전 전 첫 답', 'first', (s) => `${s.first}% <small>(${s.firstRaw[0]}/${s.firstRaw[1]})</small>`)}
          ${board('🙋 참여', `수업한 ${data.held.length}차시 중`, 'went', (s) => `${s.went}차시`)}
        </div>
        <div class="dash-boards small3">
          ${board('🔁 끈기 TOP 5', '재도전으로 고친 문제', 'fixed', (s) => `${s.fixed}개`, 5)}
          ${board('📘 자기주도 TOP 5', '보강던전 도전 횟수', 'tries', (s) => `${s.tries}회 · 인장 ${s.seals}`, 5)}
          ${board('⭐ 성장 TOP 5', 'EXP', 'xp', (s) => `Lv.${s.lv} · ${s.xp}`, 5)}
        </div>`;
    },
    watch() {
      const last2 = data.held.slice(-2);
      const rows = data.studs.map((s) => {
        const why = [];
        const miss = last2.filter((l) => !s.rec[l.id]);
        if (miss.length) why.push(`최근 불참: ${miss.map((l) => `${l.no}차시`).join(', ')}`);
        if (s.boss != null && s.boss < 50) why.push(`형성평가 평균 ${s.boss}%`);
        if (s.first != null && s.first < 50) why.push(`첫 시도 정답률 ${s.first}%`);
        if (s.went && !s.tries) why.push('보강던전 0회');
        return { s, why };
      }).filter((r) => r.why.length);
      return `<p class="muted small">최근 2차시(${last2.map((l) => `${l.no}차시`).join(' · ')}) 불참 · 형성평가 50% 미만 · 첫 시도 50% 미만 · 보강던전 0회</p>
        ${rows.length ? `<table class="r-table">${rows.map(({ s, why }) => `<tr><td>${s.n}번</td><td><button class="linkish" data-who="${s.n}">${esc(s.name)}</button></td><td>${why.map((w) => `<span class="dash-tag">${esc(w)}</span>`).join(' ')}</td></tr>`).join('')}</table>` : '<p class="okc">👍 지금 눈에 띄는 학생이 없어요.</p>'}`;
    },
    weak() {
      const agg = {};
      data.studs.forEach((s) => Object.entries(s.conc).forEach(([k, v]) => { const a = (agg[k] = agg[k] || { name: v.name, lesson: v.lesson, ok: 0, total: 0, who: 0 }); a.ok += v.ok; a.total += v.total; a.who += 1; }));
      const list = Object.values(agg).map((a) => ({ ...a, p: pct(a.ok, a.total) })).sort((a, b) => a.p - b.p);
      return `<p class="muted small">반 전체 첫 시도 정답률이 낮은 개념부터 — 다음 수업 복습 1순위</p>
        <table class="r-table">${list.map((a, i) => `<tr><td>${i + 1}</td><td>${a.lesson.no}차시</td><td>${esc(a.name)}</td><td class="dash-c ${heat(a.p)}">${a.p}%</td><td class="muted small">${a.ok}/${a.total} · ${a.who}명</td></tr>`).join('')}</table>`;
    },
    memo() {
      return `<p class="muted small">기록에 있는 사실만으로 만든 초안이에요. 그대로 쓰지 말고 관찰 내용을 더해 다듬어 주세요.</p>
        <button class="btn" data-copy="all">📋 전체 복사</button>
        ${data.studs.map((s) => `<div class="dash-memo"><b>${s.n}번 ${esc(s.name)}</b><p>${esc(memo(s))}</p><button class="btn small" data-copy="${s.n}">복사</button></div>`).join('')}`;
    },
  };

  // ── 세특 메모 초안: 기록에 있는 사실만 ───────────────
  function memo(s) {
    if (!s || !s.went) return '저장된 수업 기록이 없음.';
    const parts = [];
    parts.push(`게임 기반 협동 레이드 수업(집합 단원) ${data.held.length}차시 중 ${s.went}차시에 참여함${s.went === data.held.length ? '(전 차시 참여)' : ''}`);
    const cs = Object.values(s.conc).filter((c) => c.total >= 2).map((c) => ({ ...c, p: pct(c.ok, c.total) }));
    const best = cs.filter((c) => c.p >= 80).sort((a, b) => b.p - a.p || b.total - a.total)[0];
    if (best) parts.push(`특히 '${best.name}' 개념에서 첫 시도 정답률 ${best.p}%로 정확한 이해를 보임`);
    if (s.boss != null) parts.push(`형성평가 평균 ${s.boss}%를 기록함`);
    if (s.fixed) parts.push(`틀린 문제를 숫자를 바꾼 재도전 문제로 ${s.fixed}개 스스로 바로잡으며 끝까지 해결하려는 태도를 보임`);
    if (s.tries) parts.push(`수업 뒤 보강던전에 ${s.tries}회 도전${s.seals ? `하여 보강 인장 ${s.seals}개를 모으는` : '하는'} 등 자기주도적으로 복습함`);
    if (s.cards) parts.push(`모루(개념 카드 만들기)에서 기호와 개념을 연결한 카드 ${s.cards}장을 완성함`);
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
    const head = ['번호', '이름', ...data.held.map((l) => `${l.no}차시 형성평가`), '참여', '형성평가 평균(%)', '첫 시도 정답률(%)', '재도전으로 고친 수', '보강 인장', '보강 도전', '카드', '레벨', 'EXP'];
    const rows = sorted().map((s) => [s.n, s.name, ...data.held.map((l) => (s.rec[l.id] ? `${Number(s.rec[l.id].boss) || 0}/${Number(s.rec[l.id].bossN) || 0}` : '불참')), `${s.went}/${data.held.length}`, s.boss ?? '', s.first ?? '', s.fixed, s.seals, s.tries, s.cards, s.lv, s.xp]);
    const csv = '﻿' + [head, ...rows].map((r) => r.map(q).join(',')).join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `학급대시보드_${cls}_${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(a); a.click(); a.remove();
  }
  function detail(n) {
    const s = data.studs.find((x) => x.n === n); if (!s) return;
    const el = document.createElement('div'); el.className = 'modal camp-modal';
    el.innerHTML = `<div class="quiz-box framed st-detail"><h2>${esc(cls)} ${n}번 ${esc(s.name)}</h2>
      <p>Lv.${s.lv} ${esc(s.lvTitle || '')} · EXP ${s.xp} · 카드 ${s.cards} · 보강 인장 ${s.seals} · 보강 도전 ${s.tries}회</p>
      <p>형성평가 ${show(s.boss)} · 첫 시도 ${show(s.first)} · 참여 ${s.went}/${data.held.length} · 고친 수 ${s.fixed}</p>
      ${DS.Result ? DS.Result.history(s.rec || {}) : ''}
      <div class="dash-memo"><b>세특 메모 초안</b><p>${esc(memo(s))}</p></div>
      <div class="row"><button class="btn" id="dd-copy">메모 복사</button><button class="btn" id="dd-x">닫기</button></div></div>`;
    document.body.appendChild(el);
    el.querySelector('#dd-x').onclick = () => el.remove();
    el.querySelector('#dd-copy').onclick = () => copy(memo(s));
  }
  return { enter, _build: build };
})();
