// 📅 오늘 수업 · 시간표 편집 · 🗓 출석부 · 📖 수업 일지 화면 (2026-11-04 · v0.9.7.0 · 교사만) — 계산은 DS.Sched
//   교사 메뉴 「수업 열기」 맨 위 = 오늘 수업(예약) 목록 + 「📅 시간표」 버튼 / 학생 관리 = 명단 · 출석부 · 대시보드
//   출석부는 나이스 공식 출결이 아니라 「수업 참여 기록」 (게임 입장 시각으로 자동 표시 · 선생님이 고침)
window.DS = window.DS || {};

DS.Att = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  const S = () => DS.Sched;
  const run = (fn) => DS.Control.run(fn);
  const classes = async () => Object.keys((await DS.Net.get('roster').catch(() => null)) || {}).sort();

  // ── 📅 오늘 수업 (교사 메뉴) ────────────────────────────────
  async function today(el) {
    if (!el) return;
    el.innerHTML = '<p class="muted small">📅 오늘 수업 불러오는 중…</p>';
    let made = { made: 0 };
    try { made = await S().ensure(); } catch (e) { /* 오프라인 · 권한 → 목록만 */ }
    const [list, eff] = await Promise.all([S().today().catch(() => []), S().effective()]), week = eff.week;
    // 컴시간 연동 상태: 켜져 있는데 실패했거나 2일 넘게 안 받아짐 → 경고 (지난 시간표로 운영)
    const c = eff.comci, warn = eff.on && (!c || !c.ok || DS.Net.now() - (c.at || 0) > 2 * 86400e3) ? `<p class="ngc small">⚠ 컴시간 연동 실패 — 지난 시간표로 운영 중${c && c.err ? ` (${esc(c.err)})` : ''}</p>` : eff.on ? '<p class="muted small">🔄 컴시간 연동 중 · 수동으로 고친 칸이 우선</p>' : '';
    if (!Object.keys(week).length) { el.innerHTML = `<div class="td-empty"><span>📅 시간표를 넣으면 그 시각에 던전이 저절로 열려요 · 학생은 코드 없이 입장</span><button class="btn small" data-sc>📅 시간표 넣기</button></div>`; bindSc(el); return; }
    const row = (t) => `<div class="td-row${t.now ? ' now' : ''}${t.done ? ' done' : ''}">
        <span class="td-p"><b>${t.p}교시</b><small>${esc(S().BELLS[t.p][0])}</small></span>
        <span class="td-c"><b>${esc(t.cls)}반</b> <span class="muted small">${esc(t.title)}</span><br><span class="small">${t.now ? '🟢 지금 열림' : t.done ? '끝' : '⏳ 곧'} · 코드 <b>${t.code}</b> · 키 <b>${esc(t.hallKey)}</b></span></span>
        <span class="td-b">${t.done ? '' : `<button class="btn small primary" data-open="${t.code}" data-key="${esc(t.hallKey)}">▶ 리모컨</button>`}${t.started || t.done ? '' : `<button class="btn small" data-rel="${t.key}">차시</button><button class="btn small" data-off="${t.key}">쉼</button>`}</span></div>`;
    el.innerHTML = warn + `<div class="td-head"><b>📅 오늘 수업</b><span class="muted small">${list.length ? `${list.length}개 · 시각이 되면 학생 캠프 문이 저절로 열려요 (끝 + 10분)` : '오늘은 예약 수업이 없어요'}</span><button class="btn small" data-sc>📅 시간표</button></div>${list.map(row).join('')}`;
    bindSc(el);
    el.querySelectorAll('[data-open]').forEach((b) => (b.onclick = () => run(() => DS.Teacher.open(b.dataset.open, b.dataset.key))));
    el.querySelectorAll('[data-off]').forEach((b) => (b.onclick = () => run(async () => { if (!window.confirm('이 교시 수업을 이번만 쉴까요? (시간표는 그대로 · 다음 주는 다시 열림)')) return; await S().skipSlot(b.dataset.off, true); DS.UI.toast('이번 수업은 쉬어요.'); today(el); })));
    el.querySelectorAll('[data-rel]').forEach((b) => (b.onclick = () => pickLesson(b.dataset.rel, () => today(el))));
    if (made.made) DS.UI.toast(`📅 앞으로 7일 예약 수업 ${made.made}개를 준비했어요.`, 2600);
  }
  const bindSc = (el) => el.querySelectorAll('[data-sc]').forEach((b) => (b.onclick = () => editor(() => today(el))));
  function pickLesson(key, done) {
    const L = DS.Lessons.list.filter((l) => !l.eval && !l.sheetLesson && l.no).sort((a, b) => a.no - b.no);
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="quiz-box framed"><div class="quiz-head"><b>이 수업 차시 바꾸기</b><button class="btn small" data-x>✕ 닫기</button></div><p class="muted small">시작 전에만 · 수업 코드가 새로 바뀌어요</p>${L.map((l) => `<button class="btn big" data-l="${l.id}">${l.no}차시 · ${esc(l.title)}</button>`).join('')}</div>`;
    m.querySelector('[data-x]').onclick = () => m.remove();
    m.querySelectorAll('[data-l]').forEach((b) => (b.onclick = () => run(async () => { await S().relesson(key, b.dataset.l); m.remove(); DS.UI.toast('차시를 바꿨어요.'); done(); })));
    document.body.appendChild(m);
  }

  // ── 📅 시간표 편집 (요일 × 교시 → 반) ───────────────────────
  async function editor(done) {
    const [eff, cs] = await Promise.all([S().effective(), classes()]);
    const w = { ...eff.week }, auto = eff.auto, man = { ...eff.manual };
    const m = document.createElement('div'); m.className = 'modal sc-edit';
    const cell = (d, p) => {
      if (!(S().PERIODS[d] || []).includes(p)) return '<td class="sc-no">—</td>';
      if (S().skipped(d, p)) return '<td class="sc-no" title="자율 · 동아리 (담임) — 수업으로 치지 않아요">자율·동아리</td>';
      const v = w[`${d}-${p}`] || '';
      return `<td${auto[`${d}-${p}`] && !(`${d}-${p}` in man) ? ' class="sc-auto" title="🔄 컴시간에서"' : ''}><select data-dp="${d}-${p}"><option value="">—</option>${cs.map((c) => `<option${c === v ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select></td>`;
    };
    const days = [1, 2, 3, 4, 5], ps = [1, 2, 3, 4, 5, 6, 7];
    m.innerHTML = `<div class="quiz-box framed"><div class="quiz-head"><b>📅 시간표 (매주 반복)</b><button class="btn small" data-x>✕ 닫기</button><button class="btn primary" id="sc-save">저장</button></div>
      ${eff.comci && eff.comci.ok ? `<label class="sc-comci"><input type="checkbox" id="sc-comci"${eff.on ? ' checked' : ''}> 🔄 <b>컴시간 시간표 쓰기</b> <span class="muted small">수학 ${eff.comci.n || 0}칸 · ${esc(S().kst(eff.comci.at || 0).date)} 받음 · 매일 새벽 6시 갱신 · 고친 칸이 우선</span></label>` : eff.comci ? `<p class="ngc small">⚠ 컴시간 연동 실패: ${esc(eff.comci.err || '')}</p>` : ''}
      <p class="muted small">칸마다 수학 수업 반을 고르세요. 저장하면 앞으로 7일 수업 방을 미리 만들고, 그 시각(끝 + 10분까지)에 학생 캠프 문이 저절로 열려요. 차시는 그 반의 다음 차시로 저절로.</p>
      ${cs.length ? '' : '<p class="ngc">먼저 학생 관리 → 명단 관리에서 반 명단을 올려 주세요.</p>'}
      <div class="sc-wrap"><table class="sc-tbl"><tr><th></th>${days.map((d) => `<th>${S().DOW[d]}</th>`).join('')}</tr>${ps.map((p) => `<tr><th>${p}교시<small>${S().BELLS[p][0]}</small></th>${days.map((d) => cell(d, p)).join('')}</tr>`).join('')}</table></div>
      <p class="muted small">월 5교시 · 목 7교시 = 자율 · 동아리(담임)라 빼요. 수 7교시 = 특기적성 · 금 6 · 7교시 = 없음.${eff.on ? ' 🔄 노란 칸 = 컴시간에서 가져온 칸 (고치면 수동이 우선)' : ''}</p></div>`;
    m.querySelector('[data-x]').onclick = () => m.remove();
    // 🔄 컴시간 켜기 · 끄기 → 시간표 칸을 다시 그림 (저장을 눌러야 수업 방을 준비)
    const cb = m.querySelector('#sc-comci'); if (cb) cb.onchange = () => run(async () => { await DS.Net.set('sched/comciOn', cb.checked ? true : null); m.remove(); await editor(done); DS.UI.toast(cb.checked ? '🔄 컴시간 시간표를 써요 — 「저장」을 누르면 수업 방을 준비해요' : '컴시간 시간표를 껐어요', 3000); });
    // 수동 칸만 저장: 컴시간과 같으면 수동 기록을 지움 · 컴시간 칸을 비우면 '-'
    m.querySelectorAll('[data-dp]').forEach((s) => (s.onchange = () => { const k = s.dataset.dp, a = auto[k] || ''; if (s.value === a) delete man[k]; else man[k] = s.value || '-'; s.parentNode.classList.toggle('sc-auto', !!a && !(k in man)); }));
    m.querySelector('#sc-save').onclick = () => run(async () => {
      await DS.Net.set('sched/week', Object.keys(man).length ? man : null);
      const r = await S().ensure(); m.remove();
      DS.UI.toast(`저장했어요! 앞으로 7일 수업 ${r.made || 0}개를 새로 준비했어요.`, 3000); if (done) done();
    });
    document.body.appendChild(m);
  }

  // ── 🗓 출석부 · 📖 수업 일지 화면 ───────────────────────────
  let cls = '', tab = 'att', data = null, cs = [];
  async function enter() {
    if (!(await DS.Account.isAdmin())) throw Object.assign(new Error('교사 계정으로 로그인해야 해요.'), { user: true });
    DS.UI.show('screen-att'); DS.Scene.save({ role: 'att' });
    cs = await classes(); if (!cls || !cs.includes(cls)) cls = cs[0] || '';
    await load();
  }
  async function load() { data = null; draw(); if (cls) { data = await S().sheet(cls); draw(); } }
  const W = (g) => S().when(g);
  function draw() {
    const el = $('#att-body'); if (!el) return;
    const head = `<h2>🗓 출석부 · 📖 수업 일지</h2><p class="muted small">교사만 · 게임 입장 기록이에요 (나이스 공식 출결 아님)</p>
      <div class="tabs">${cs.map((c) => `<button class="tab${c === cls ? ' on' : ''}" data-c="${esc(c)}">${esc(c)}</button>`).join('') || '<span class="muted">명단이 없어요</span>'}</div>
      <div class="tabs"><button class="tab${tab === 'att' ? ' on' : ''}" data-t="att">🗓 출석부</button><button class="tab${tab === 'log' ? ' on' : ''}" data-t="log">📖 수업 일지</button></div>`;
    if (!data) { el.innerHTML = head + (cls ? '<p class="muted">불러오는 중…</p>' : ''); bind(el); return; }
    el.innerHTML = head + (tab === 'att' ? attHtml() : logHtml());
    bind(el);
  }
  function attHtml() {
    const { vis, grid } = data;
    if (!vis.length) return '<p class="muted">아직 수업 기록이 없어요. 수업을 하면 학생이 들어온 시각으로 저절로 채워져요.</p>';
    const cnt = (r, k) => r.cells.filter((c) => c.s === k).length;
    return `<p class="muted small">⭕ 출석(시작 + 5분 안) · △ 지각 · ✕ 미입장(게임에 안 들어옴 — 폰 문제일 수 있어요) · 칸을 누르면 바꿀 수 있어요</p>
      <div class="att-wrap"><table class="att-tbl"><tr><th>번호</th><th>이름</th>${vis.map((g) => { const w = W(g); return `<th title="${esc(g.memo || '')}">${w.date.slice(5).replace('-', '/')}<small>${w.dow}${g.p ? ` ${g.p}교시` : ''}<br>${g.no ? `${g.no}차시` : ''}</small></th>`; }).join('')}<th>⭕</th><th>△</th><th>✕·결석</th></tr>
      ${grid.map((r) => `<tr><td>${r.n}</td><td class="nm">${esc(r.name)}</td>${r.cells.map((c) => `<td class="att-c s-${c.s}" data-code="${c.code}" data-n="${r.n}" title="${esc(c.m)}">${S().ST[c.s][0]}${c.m ? '<i>✎</i>' : ''}</td>`).join('')}<td>${cnt(r, 'o') + cnt(r, 'e')}</td><td>${cnt(r, 'l')}</td><td>${cnt(r, 'x') + cnt(r, 'a')}</td></tr>`).join('')}</table></div>
      <button class="btn" id="att-csv">⬇ 출석부 내려받기 (CSV)</button>`;
  }
  function logHtml() {
    const { rows } = data;
    if (!rows.length) return '<p class="muted">아직 수업 기록이 없어요.</p>';
    const prog = (g) => (!g.sum ? '-' : g.sum.boss ? '👑 보스 격파' : g.sum.end ? '끝까지' : g.sum.step < 0 ? '대기실까지' : `${g.sum.step + 1} / ${g.sum.steps} 단계`);
    return `<div class="att-wrap"><table class="att-tbl log-tbl"><tr><th>날짜</th><th>교시</th><th>차시</th><th>입장</th><th>진행</th><th>메모</th><th></th></tr>
      ${rows.map((g) => { const w = W(g), L = DS.Lessons.get(g.lesson); return `<tr class="${g.hide ? 'hid' : ''}"><td>${w.date} (${w.dow})</td><td>${g.p ? `${g.p}교시` : `${w.hm} 바로`}</td><td>${L ? `${L.no}차시 · ${esc(L.title)}` : esc(g.lesson || '')}</td><td>${g.sum ? g.sum.n : 0}명</td><td>${prog(g)}</td><td>${esc(g.memo || '')}</td><td><button class="btn small" data-memo="${g.code}">✎</button><button class="btn small" data-hide="${g.code}">${g.hide ? '되살리기' : '빼기'}</button></td></tr>`; }).join('')}</table></div>
      <p class="muted small">「빼기」 = 잘못 연 수업 · 연습을 출석부에서 뺌 (기록은 남음)</p><button class="btn" id="log-csv">⬇ 수업 일지 내려받기 (CSV)</button>`;
  }
  function bind(el) {
    el.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => { cls = b.dataset.c; load(); }));
    el.querySelectorAll('[data-t]').forEach((b) => (b.onclick = () => { tab = b.dataset.t; draw(); }));
    el.querySelectorAll('.att-c').forEach((td) => (td.onclick = () => fix(td.dataset.code, Number(td.dataset.n))));
    el.querySelectorAll('[data-memo]').forEach((b) => (b.onclick = () => run(async () => { const g = data.rows.find((x) => x.code === b.dataset.memo); const v = window.prompt('수업 메모 (예: 행사로 20분 단축)', g.memo || ''); if (v === null) return; await S().setMemo(cls, g.code, v); await load(); })));
    el.querySelectorAll('[data-hide]').forEach((b) => (b.onclick = () => run(async () => { const g = data.rows.find((x) => x.code === b.dataset.hide); await S().setHide(cls, g.code, !g.hide); await load(); })));
    const a = el.querySelector('#att-csv'); if (a) a.onclick = () => csv('att');
    const l = el.querySelector('#log-csv'); if (l) l.onclick = () => csv('log');
  }
  function fix(code, n) {
    const r = data.grid.find((x) => x.n === n), c = r.cells.find((x) => x.code === code), g = data.vis.find((x) => x.code === code), w = W(g);
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="quiz-box framed"><div class="quiz-head"><b>${r.n}번 ${esc(r.name)} · ${w.date.slice(5)} ${g.p ? `${g.p}교시` : ''}</b><button class="btn small" data-x>✕ 닫기</button></div>
      <div class="att-pick">${S().CYCLE.map((k) => `<button class="btn${k === c.s ? ' on' : ''}" data-s="${k}">${S().ST[k][0]} ${S().ST[k][1]}</button>`).join('')}</div>
      <label>메모 <input id="att-m" maxlength="60" value="${esc(c.m)}" placeholder="예: 폰 배터리 없음 → 종이로 참여"></label><button class="btn primary big" id="att-ok">저장</button></div>`;
    let s = c.s;
    m.querySelector('[data-x]').onclick = () => m.remove();
    m.querySelectorAll('[data-s]').forEach((b) => (b.onclick = () => { s = b.dataset.s; m.querySelectorAll('[data-s]').forEach((x) => x.classList.toggle('on', x === b)); }));
    m.querySelector('#att-ok').onclick = () => run(async () => { await S().setAtt(cls, code, n, s, m.querySelector('#att-m').value.trim()); m.remove(); await load(); });
    document.body.appendChild(m);
  }
  function csv(kind) {
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    let rows;
    if (kind === 'att') { const { vis, grid } = data; rows = [['번호', '이름', ...vis.map((g) => { const w = W(g); return `${w.date} ${w.dow}${g.p ? ` ${g.p}교시` : ''} ${g.no || ''}차시`; })], ...grid.map((r) => [r.n, r.name, ...r.cells.map((c) => S().ST[c.s][1] + (c.m ? ` (${c.m})` : ''))])]; }
    else rows = [['날짜', '요일', '교시', '차시', '제목', '입장', '진행', '메모', '뺌'], ...data.rows.map((g) => { const w = W(g), L = DS.Lessons.get(g.lesson); return [w.date, w.dow, g.p || `${w.hm} 바로`, L ? L.no : '', L ? L.title : g.lesson, g.sum ? g.sum.n : 0, g.sum ? (g.sum.boss ? '보스 격파' : g.sum.end ? '끝까지' : `${g.sum.step + 1}/${g.sum.steps}`) : '', g.memo || '', g.hide ? '뺌' : '']; })];
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + rows.map((r) => r.map(q).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    a.download = `${kind === 'att' ? '출석부' : '수업일지'}_${cls}_${S().kst(DS.Net.now()).date}.csv`; document.body.appendChild(a); a.click(); a.remove();
  }
  return { today, editor, enter };
})();
