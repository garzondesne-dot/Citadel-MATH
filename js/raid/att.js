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

  // ── 📅 오늘 수업 (교사 메뉴) — 2026-11-06 진도 예정표: 칸마다 「반 · n차시」 · 눌러서 열기 (방을 미리 만들지 않음) ──
  const md = (date) => { const [, m, d] = date.split('-'); return `${+m}/${+d}`; };
  const tag = (x) => `${x.extra ? '<span class="sc-tag ex">➕ 보충</span>' : ''}${x.resume ? '<span class="sc-tag rz">⏸ 이어서</span>' : ''}`;
  async function today(el) {
    if (!el) return;
    el.innerHTML = '<p class="muted small">📅 오늘 수업 불러오는 중…</p>';
    try { await S().ensure(); } catch (e) { /* 오프라인 · 권한 → 목록만 */ }
    const [eff, all] = await Promise.all([S().effective(), S().plan({ past: true, days: 1 }).catch(() => [])]), now = DS.Net.now();
    const list = all.filter((x) => x.date === S().kst(now).date);
    const head = `<div class="td-head"><b>📅 오늘 수업</b><span class="muted small">${list.length ? `${list.length}개 · 칸을 눌러 그 반 · 그 차시로 열기` : '오늘은 시간표 수업이 없어요'}</span><button class="btn small" data-sc>📅 시간표</button><button class="btn small" data-ex>➕ 보충</button></div>`;
    if (!Object.keys(eff.week).length && !list.length) { el.innerHTML = `<div class="td-empty"><span>📅 시간표를 넣으면 칸마다 「반 · 몇 차시」가 저절로 이어져요 · 보충은 ➕</span><button class="btn small" data-sc>📅 시간표 넣기</button><button class="btn small" data-ex>➕ 보충</button></div>`; bindSc(el); return; }
    const row = (x, i) => { const on = !x.past && now >= x.from - 10 * 60e3 && now < x.to;
      return `<div class="td-row${on ? ' now' : ''}${x.past || x.closed ? ' done' : ''}">
        <span class="td-p"><b>${x.p}교시</b><small>${esc(S().BELLS[x.p][0])}</small></span>
        <span class="td-c"><b>${esc(x.cls)}반</b> ${tag(x)}<br><span class="small">${x.no ? `<b>${x.no}차시</b> · ${esc(x.title)}` : esc(x.title)}${x.resume ? ` <span class="muted">(「${esc(x.resume.title || '')}」부터)</span>` : ''}</span><br><span class="small muted">${x.closed ? (x.doneL ? '✔ 끝 (다음 차시로)' : x.saved ? '⏸ 저장하고 끝 (같은 차시 이어서)' : '끝') : x.past ? '지남' : x.code ? '🟢 열림' : on ? '🟢 지금' : '⏳ 곧'}</span></span>
        <span class="td-b">${x.code && !x.closed ? `<button class="btn small primary" data-rc="${x.code}">▶ 리모컨</button>` : !x.past && x.lesson ? `<button class="btn small primary" data-go="${i}">▶ 열기</button>` : ''}${!x.past && !x.code ? (x.extra ? `<button class="btn small" data-delx="${x.key}">보충 지우기</button>` : `<button class="btn small" data-off="${x.key}">쉼</button>`) : ''}</span></div>`; };
    el.innerHTML = head + list.map(row).join('');
    bindSc(el);
    el.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => run(async () => { await S().openSlot(list[Number(b.dataset.go)]); })));
    el.querySelectorAll('[data-rc]').forEach((b) => (b.onclick = () => run(async () => { const sec = await DS.Net.get(`secrets/${b.dataset.rc}`).catch(() => null); await DS.Teacher.open(b.dataset.rc, (sec || {}).hallKey || ''); })));
    el.querySelectorAll('[data-off]').forEach((b) => (b.onclick = () => run(async () => { if (!window.confirm('이 교시 수업을 이번만 쉴까요? (시간표는 그대로 · 차시는 다음 수업으로 밀려요)')) return; await S().skipSlot(b.dataset.off, true); DS.UI.toast('이번 수업은 쉬어요 — 차시는 다음 칸으로.'); today(el); })));
    el.querySelectorAll('[data-delx]').forEach((b) => (b.onclick = () => run(async () => { if (!window.confirm('이 보충 수업을 지울까요?')) return; await S().removeExtra(b.dataset.delx); today(el); })));
  }
  const bindSc = (el) => { el.querySelectorAll('[data-sc]').forEach((b) => (b.onclick = () => editor(() => today(el)))); el.querySelectorAll('[data-ex]').forEach((b) => (b.onclick = () => extraDlg(() => today(el)))); };
  // ➕ 보충 (한 번짜리 칸 · 그 수업이 끝나면 사라짐)
  async function extraDlg(done) {
    const cs = await classes(), d0 = S().kst(DS.Net.now()).date;
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="quiz-box framed"><div class="quiz-head"><b>➕ 보충 수업</b><button class="btn small" data-x>✕ 닫기</button></div>
      <p class="muted small">한 번만 들어가는 수업이에요 · 그 수업이 끝나면 칸이 사라지고, 그 반 차시가 한 칸씩 당겨져요.</p>
      <div class="sc-ex"><label>날짜 <input type="date" id="ex-d" value="${d0}"></label><label>교시 <select id="ex-p">${[1, 2, 3, 4, 5, 6, 7].map((p) => `<option value="${p}">${p}교시 (${S().BELLS[p][0]})</option>`).join('')}</select></label><label>반 <select id="ex-c">${cs.map((c) => `<option>${esc(c)}</option>`).join('')}</select></label></div>
      <div class="row"><button class="btn primary" id="ex-ok">➕ 보충 넣기</button></div></div>`;
    m.querySelector('[data-x]').onclick = () => m.remove();
    m.querySelector('#ex-ok').onclick = () => run(async () => { const d = m.querySelector('#ex-d').value, p = m.querySelector('#ex-p').value, c = m.querySelector('#ex-c').value; if (!d || !c) throw Object.assign(new Error('날짜와 반을 골라 주세요.'), { user: true }); await S().addExtra(d, p, c); m.remove(); DS.UI.toast(`➕ ${md(d)} ${p}교시 ${c}반 보충을 넣었어요.`); if (done) done(); });
    document.body.appendChild(m);
  }

  // ── 📅 시간표 (요일 × 교시 → 반 · 매주) + 칸마다 다음 차시 · 진도 맞추기 · 앞으로 2주 ───────────────────────
  async function editor(done) {
    const [eff, cs] = await Promise.all([S().effective(), classes()]);
    const auto = eff.auto, man = { ...eff.manual }, L = DS.Lessons.list.filter((l) => !l.eval && !l.sheetLesson && l.no).sort((a, b) => a.no - b.no);
    const m = document.createElement('div'); m.className = 'modal sc-edit';
    const wk = () => { const w = { ...(eff.on ? auto : {}) }; Object.entries(man).forEach(([k, v]) => { if (v === '-') delete w[k]; else w[k] = v; }); return w; };
    const cell = (d, p) => {
      if (!(S().PERIODS[d] || []).includes(p)) return '<td class="sc-no">—</td>';
      if (S().skipped(d, p)) return '<td class="sc-no" title="자율 · 동아리 (담임) — 수업으로 치지 않아요">자율·동아리</td>';
      const v = wk()[`${d}-${p}`] || '';
      return `<td${auto[`${d}-${p}`] && eff.on && !(`${d}-${p}` in man) ? ' class="sc-auto" title="🔄 컴시간에서"' : ''}><select data-dp="${d}-${p}"><option value="">—</option>${cs.map((c) => `<option${c === v ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select><small class="sc-next" data-nx="${d}-${p}"></small></td>`;
    };
    const days = [1, 2, 3, 4, 5], ps = [1, 2, 3, 4, 5, 6, 7];
    const progCls = () => [...new Set([...Object.values(wk()), ...cs])].filter((c) => c && c !== '-').sort();
    m.innerHTML = `<div class="quiz-box framed sc-box"><div class="quiz-head"><b>📅 시간표 · 진도 예정표</b><button class="btn small" data-x>✕ 닫기</button><button class="btn" id="sc-ex">➕ 보충</button><button class="btn primary" id="sc-save">💾 저장</button></div>
      ${eff.comci && (eff.comci.ok || eff.comci.week) ? `<label class="sc-comci"><input type="checkbox" id="sc-comci"${eff.on ? ' checked' : ''}> 🔄 <b>컴시간 시간표 쓰기</b> <span class="muted small">수학 ${eff.comci.n || 0}칸 · 고친 칸이 우선${Number(eff.comci.failAt) > (Number(eff.comci.at) || 0) ? ` · ⚠ ${new Date(Number(eff.comci.failAt)).toLocaleDateString('ko-KR')} 새로 받기 실패 → ${eff.comci.at ? new Date(Number(eff.comci.at)).toLocaleDateString('ko-KR') : '마지막'} 시간표 그대로` : ''}</span></label>` : eff.comci && eff.comci.err ? `<p class="ngc small">⚠ 컴시간 시간표를 받지 못했어요 (${esc(String(eff.comci.err).slice(0, 60))}) — 아래 칸에 직접 넣어 주세요</p>` : ''}
      <p class="muted small">정규 시간표는 한 번 넣으면 매주 반복 · 칸 아래 = 그 칸의 다음 수업이 몇 차시인지 (반마다 시간순으로 6 → 7 → 8 …) · <b>마무리까지 가서 「수업 끝」을 눌러야 다음 차시로</b> 넘어가요 (⏸ 저장 · 안 한 수업 = 같은 차시) · 방은 미리 만들지 않고 「오늘 수업」에서 눌러 열어요</p>
      ${cs.length ? '' : '<p class="ngc">먼저 학생 관리 → 명단 관리에서 반 명단을 올려 주세요.</p>'}
      <div class="sc-wrap"><table class="sc-tbl"><tr><th></th>${days.map((d) => `<th>${S().DOW[d]}</th>`).join('')}</tr>${ps.map((p) => `<tr><th>${p}교시<small>${S().BELLS[p][0]}</small></th>${days.map((d) => cell(d, p)).join('')}</tr>`).join('')}</table></div>
      <div class="sc-prog"><b>🎯 진도 맞추기</b> <span class="muted small">반마다 「다음 수업 = 몇 차시」 (처음 한 번 · 어긋났을 때)</span><div id="sc-prog"></div></div>
      <div class="sc-plan"><b>🗓 앞으로 2주</b> <span class="muted small">보충 · 쉼 · 진도가 바뀌면 저절로 밀리거나 당겨져요</span><div id="sc-plan"></div></div></div>`;
    const draw = async () => {
      const pl = await S().plan({ week: man, reconcile: false, days: 14 }).catch(() => []), first = {};
      pl.forEach((x) => { const k = `${x.dow}-${x.p}`; if (!x.extra && !x.code && !x.past && !first[k]) first[k] = x; }); // 아직 안 한 다음 수업
      m.querySelectorAll('[data-nx]').forEach((e) => { const x = first[e.dataset.nx]; e.innerHTML = x && x.no ? `${md(x.date)} · <b>${x.no}차시</b>${x.resume ? ' ⏸' : ''}` : ''; });
      const prog = await S().getProg();
      const pc = progCls(), ptr = {}; for (const c of pc) ptr[c] = await S().pointer(c, prog).catch(() => null);
      m.querySelector('#sc-prog').innerHTML = pc.map((c) => `<label class="sc-pr">${esc(c)}반 다음 <select data-pg="${esc(c)}">${L.map((l) => `<option value="${l.id}"${ptr[c] && ptr[c].id === l.id ? ' selected' : ''}>${l.no}차시 · ${esc(l.title).slice(0, 14)}</option>`).join('')}</select></label>`).join('');
      m.querySelectorAll('[data-pg]').forEach((s) => (s.onchange = () => run(async () => { await S().setNext(s.dataset.pg, s.value); DS.UI.toast(`🎯 ${s.dataset.pg}반 다음 수업 = ${DS.Lessons.get(s.value).no}차시`); draw(); })));
      const byDay = {}; pl.forEach((x) => (byDay[x.date] = byDay[x.date] || []).push(x));
      m.querySelector('#sc-plan').innerHTML = Object.entries(byDay).map(([d, xs]) => `<div class="sc-day"><b>${md(d)} (${S().DOW[xs[0].dow]})</b>${xs.map((x) => `<span class="sc-it${x.extra ? ' ex' : ''}">${x.p}교시 ${esc(x.cls)}반 · ${x.no ? `${x.no}차시` : '—'} ${tag(x)}${x.extra ? `<button class="btn small" data-delx="${x.key}">✕</button>` : `<button class="btn small" data-off="${x.key}" title="이번만 쉼">쉼</button>`}</span>`).join('')}</div>`).join('') || '<p class="muted small">앞으로 2주 동안 수업 칸이 없어요.</p>';
      m.querySelectorAll('#sc-plan [data-delx]').forEach((b) => (b.onclick = () => run(async () => { await S().removeExtra(b.dataset.delx); draw(); })));
      m.querySelectorAll('#sc-plan [data-off]').forEach((b) => (b.onclick = () => run(async () => { if (!window.confirm('이 수업을 이번만 쉴까요? (차시는 다음 칸으로 밀려요)')) return; await S().skipSlot(b.dataset.off, true); draw(); })));
    };
    m.querySelector('[data-x]').onclick = () => { m.remove(); if (done) done(); };
    m.querySelector('#sc-ex').onclick = () => extraDlg(draw);
    const cb = m.querySelector('#sc-comci'); if (cb) cb.onchange = () => run(async () => { await DS.Net.set('sched/comciOn', cb.checked ? true : null); m.remove(); await editor(done); });
    m.querySelectorAll('[data-dp]').forEach((s) => (s.onchange = () => { const k = s.dataset.dp, a = eff.on ? auto[k] || '' : ''; if (s.value === a) delete man[k]; else man[k] = s.value || '-'; s.parentNode.classList.toggle('sc-auto', !!a && !(k in man)); draw(); }));
    m.querySelector('#sc-save').onclick = () => run(async () => {
      await DS.Net.set('sched/week', Object.keys(man).length ? man : null); await S().ensure().catch(() => {}); m.remove();
      DS.UI.toast('📅 시간표를 저장했어요 — 칸마다 차시가 이어져요.', 3000); if (done) done();
    });
    document.body.appendChild(m); draw();
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
      <button class="btn" id="att-csv">📥 출석부 내려받기 (CSV)</button>`;
  }
  function logHtml() {
    const { rows } = data;
    if (!rows.length) return '<p class="muted">아직 수업 기록이 없어요.</p>';
    const prog = (g) => (!g.sum ? '-' : g.sum.boss ? '👑 보스 격파' : g.sum.end ? '끝까지' : g.sum.step < 0 ? '대기실까지' : `${g.sum.step + 1} / ${g.sum.steps} 단계`);
    return `<div class="att-wrap"><table class="att-tbl log-tbl"><tr><th>날짜</th><th>교시</th><th>차시</th><th>입장</th><th>진행</th><th>메모</th><th></th></tr>
      ${rows.map((g) => { const w = W(g), L = DS.Lessons.get(g.lesson); return `<tr class="${g.hide ? 'hid' : ''}"><td>${w.date} (${w.dow})</td><td>${g.p ? `${g.p}교시` : `${w.hm} 바로`}</td><td>${L ? `${L.no}차시 · ${esc(L.title)}` : esc(g.lesson || '')}</td><td>${g.sum ? g.sum.n : 0}명</td><td>${prog(g)}</td><td>${esc(g.memo || '')}</td><td><button class="btn small" data-gather="${g.code}" title="수업 끝 전에 나간 학생 기록 · EXP 다시 만들기">📥 결과</button><button class="btn small" data-memo="${g.code}">✎</button><button class="btn small" data-hide="${g.code}">${g.hide ? '되살리기' : '빼기'}</button></td></tr>`; }).join('')}</table></div>
      <p class="muted small">「빼기」 = 잘못 연 수업 · 연습을 출석부에서 뺌 (기록은 남음)</p><button class="btn" id="log-csv">📥 수업 일지 내려받기 (CSV)</button>`;
  }
  function bind(el) {
    el.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => { cls = b.dataset.c; load(); }));
    el.querySelectorAll('[data-t]').forEach((b) => (b.onclick = () => { tab = b.dataset.t; draw(); }));
    el.querySelectorAll('.att-c').forEach((td) => (td.onclick = () => fix(td.dataset.code, Number(td.dataset.n))));
    el.querySelectorAll('[data-gather]').forEach((b) => (b.onclick = () => run(async () => { const o = await DS.Result.gather(b.dataset.gather, cls); DS.UI.toast(`📥 ${o.saved.length}명 기록 저장${o.kept.length ? ` · ${o.kept.length}명은 이미 있음` : ''}`, 3000); })));
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
      <label>메모 <input id="att-m" maxlength="60" value="${esc(c.m)}" placeholder="예: 폰 배터리 없음 → 종이로 참여"></label><button class="btn primary big" id="att-ok">💾 저장</button></div>`;
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
