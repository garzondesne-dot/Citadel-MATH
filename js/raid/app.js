// 첫 화면: 역할 고르기(학생 · 교사[수업 열기 + 수업 준비] · 종합상황실) · 로그인/가입 · 주소로 바로 입장(?role=student&code=…)
// 학생: 반 · 번호를 고르면 가린 이름(김*우)으로 확인 → 숫자 4자리로 로그인 (처음이면 가입). 이름은 명단에서 나온다.
// 교사: 교사 계정(아이디 · 비밀번호)으로 로그인해야 새 수업 · 수업 준비를 쓸 수 있다.
window.DS = window.DS || {};

DS.App = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  const A = () => DS.Account;
  const q = new URLSearchParams(location.search);
  const read = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 무시 */ } };
  let hero = 0, sMode = 'login', masks = {}, pending = null, pendingTest = null;

  async function boot() {
    DS.Art.install();
    DS.PWA.init();
    try { await DS.Net.init(); } catch (e) { DS.UI.show('screen-home'); $('#home-msg').textContent = e.message; return; }
    try { if (await A().endStaleTeacher()) DS.UI.toast('앱을 다시 켜서 교사 계정은 로그아웃했어요.', 3200); } catch (e) { console.error(e); }
    DS.Nav.init();
    $('#mode').innerHTML = DS.Net.mode === 'local' ? '🧪 이 기기 체험 모드 <span class="muted">(Firebase 미설정 — 같은 브라우저 탭끼리만 연결)</span>' : '🌐 실시간 연결 (Firebase)';
    $('#ver').textContent = DS.VERSION;
    await DS.SheetLesson.loadAll(); // 엑셀로 만든 차시 (서버 sheets/)
    fillLessons();
    bind();
    await studentAuth();
    await teacherAuth();
    const role = q.get('role') === 'prep' ? 'teacher' : q.get('role'); // 수업 준비는 교사 안으로 합침
    if (role) form(role);
    splash(!role && !DS.Scene.get() && !inFrame());
    if (role === 'hall' && q.get('code')) $('#h-code').value = q.get('code');
    const h = read('citadel-hall');
    if (h) { $('#h-code').value = $('#h-code').value || h.code; $('#h-key').value = h.key; }
    if (q.get('key')) $('#h-key').value = q.get('key');
    const t = read('citadel-teacher');
    // 바로 열기 (체험판·북마크): ?role=teacher&resume · ?role=hall&code=…&key=…
    if (role === 'teacher' && q.has('resume') && t && t.uid === DS.Net.uid()) $('#t-resume').click();
    if (role === 'hall' && q.get('code') && q.get('key')) { $('#h-go').click(); return; }
    // 🧪 바로 시작 링크: ?role=teacher&test=set-02 → 교사 로그인돼 있으면 곧바로 테스트 모드 (아니면 로그인 뒤 시작)
    if (role === 'teacher' && DS.Lessons.get(q.get('test'))) {
      $('#x-lesson').value = q.get('test');
      if (await A().isAdmin()) { await DS.Test.start(q.get('test')).catch((e) => DS.UI.toast(e.message)); return; }
      pendingTest = q.get('test'); DS.UI.toast('교사 로그인하면 테스트가 바로 시작돼요.', 3200);
    }
    await resume();
  }
  // 새로고침(아래로 당기기 등) 뒤 보던 장면으로 바로 돌아간다 (같은 탭의 sessionStorage)
  async function resume() {
    const sc = DS.Scene.get();
    if (!sc) return;
    try {
      if (sc.role === 'camp' || sc.role === 'student') {
        const m = await A().me(); if (!m) return;
        if (sc.role === 'student' && sc.code) await DS.Student.enter(sc.code, info(m)); else await DS.Camp.enter(m);
      } else if (sc.role === 'teacher' && sc.code && (await A().isAdmin())) await DS.Teacher.open(sc.code, sc.hallKey);
      else if (sc.role === 'hall' && sc.code) await DS.Hall.enter(sc.code, sc.key);
      else if (sc.role === 'prep' && sc.lesson && (await A().isAdmin())) await DS.Prep.enter(sc.lesson);
      else if (sc.role === 'students' && (await A().isAdmin())) await DS.Students.enter();
    } catch (e) { DS.Scene.clear(); DS.UI.toast(e.message || String(e), 3200); }
  }
  const info = (m) => ({ num: m.n, nick: m.name, hero: m.hero, fx: m.fx || 'flame', cls: m.c });
  // 시작 화면: 큰 제목 그림 → 화면을 터치하면 첫 화면 (주소로 바로 들어오거나 새로고침 복귀 · 체험판 안에서는 건너뜀)
  const inFrame = () => { try { return window.top !== window.self; } catch (e) { return true; } };
  function splash(on) {
    if (!on) { DS.UI.show('screen-home'); return; }
    DS.UI.show('screen-splash');
    $('#splash-ver').textContent = DS.VERSION;
    const go1 = () => { $('#splash').onclick = null; DS.Sound.clank(); DS.UI.show('screen-home'); };
    $('#splash').onclick = go1;
  }
  // 차시 고르기 목록 (코드 차시 + 엑셀 차시)
  function fillLessons() {
    // v0.8.4: 차시 번호 · 제목을 앞에 (칸이 좁아도 무엇인지 보이게), 차시 순서대로
    const unitShort = (u) => String(u || '').replace(/^공통수학2\s*/, '').replace(/\s*·\s*\d+차시$/, '');
    const opts = DS.Lessons.list.slice().sort((a, b) => (a.no || 99) - (b.no || 99)).map((l) => `<option value="${l.id}">${l.sheetLesson ? '📊 ' : ''}${l.no ? `${l.no}차시 · ` : ''}${esc(l.title)}${l.unit ? ` (${esc(unitShort(l.unit))})` : ''}</option>`).join('');
    ['#lesson', '#p-lesson', '#x-lesson'].forEach((k) => { const el = $(k); if (el) { const v = el.value; el.innerHTML = opts; if (v) el.value = v; } });
  }
  function form(which) {
    document.querySelectorAll('.role-form').forEach((f) => (f.hidden = f.id !== `f-${which}`));
    document.querySelectorAll('.role').forEach((b) => b.classList.toggle('on', b.dataset.role === which));
  }
  const go = (fn) => async (ev) => {
    const b = ev.currentTarget; b.disabled = true;
    try { await fn(); } catch (e) { DS.UI.toast(e.message || String(e), 3600); if (!e.user) console.error(e); } finally { b.disabled = false; }
  };
  let fx = 'flame';
  const fxPicker = (title = '내 공격 이펙트') => `<p class="shelf-title">${title}</p><div class="fxs">${DS.FX.BASE.map((k) => `<button class="fxpick${k === fx ? ' on' : ''}" data-fx="${k}"><canvas width="150" height="90" data-still="${k}"></canvas><span>${DS.FX.NAMES[k]}</span></button>`).join('')}</div>`;
  function bindFx(after) {
    document.querySelectorAll('#s-auth canvas[data-still]').forEach((c) => DS.FX.still(c, c.dataset.still));
    document.querySelectorAll('#s-auth .fxpick').forEach((b) => (b.onclick = () => { fx = b.dataset.fx; document.querySelectorAll('#s-auth .fxpick').forEach((x) => x.classList.toggle('on', x === b)); DS.FX.play(b, fx, { scale: 0.22 }); DS.Sound.hit(); if (after) after(); }));
  }
  const heroPicker = () => `<p class="shelf-title">내 용사</p><div class="heroes">${Array.from({ length: DS.ASSETS.heroes.count - 1 }, (_, i) => `<button class="hpick${i === hero ? ' on' : ''}" data-h="${i}">${DS.Art.hero(i, i === hero ? 'attack' : 'idle')}</button>`).join('')}</div>`;
  const bindHeroes = (after) => document.querySelectorAll('#s-auth .hpick').forEach((b) => (b.onclick = () => { hero = Number(b.dataset.h); DS.Sound.clank(); after(); }));

  // ── 학생 로그인 · 가입 ─────────────────────────────────────
  async function studentAuth() {
    const box = $('#s-auth');
    const m = await A().me();
    if (m) {
      hero = m.hero;
      box.innerHTML = `<div class="acc-card"><b>${esc(m.c)} · ${m.n}번 ${esc(m.name)}</b><span class="muted small">로그인됨</span></div>
        <div class="me-hero">${DS.Art.hero(m.hero, 'idle', 'big huff')}<div><p class="gold">내 용사 · ${DS.FX.NAMES[m.fx] || ''}</p><p class="muted small">모닥불 ⚙ 설정에서 바꿀 수 있어요</p></div></div>
        <button id="s-go" class="btn primary big">🔥 모닥불로 가기</button>
        <button id="s-out" class="btn small">다른 사람으로 로그인</button>`;
      $('#s-go').onclick = go(() => DS.Camp.enter(m, q.get('code')));
      $('#s-out').onclick = go(async () => { await A().logout(); studentAuth(); });
      return;
    }
    masks = (await A().masks()) || {};
    const classes = Object.keys(masks).sort();
    // v0.8.3: 반·번호는 미리 고르지 않는다 (여럿이 쓰는 기기에서 남의 이름이 보이지 않게). 예전 버전이 저장한 값도 지움
    try { localStorage.removeItem('citadel-acc'); } catch (e) { /* 무시 */ }
    const last = {};
    if (!classes.length) { box.innerHTML = '<p class="muted">아직 학생 명단이 없어요. 선생님이 "수업 준비"에서 명단을 올리면 로그인할 수 있어요.</p>'; return; }
    // v0.8.1: 처음엔 빈칸 (남의 이름이 보이지 않게). 이 폰에서 로그인한 적 있는 학생만 그 반·번호를 미리 고름
    const c = classes.includes(last.c) ? last.c : '';
    box.innerHTML = `<div class="row2"><label>반 <select id="s-cls"><option value=""${c ? '' : ' selected'}>반 선택</option>${classes.map((k) => `<option${k === c ? ' selected' : ''}>${esc(k)}</option>`).join('')}</select></label><label>번호 <select id="s-num"></select></label></div>
      <p class="acc-name" id="s-mask"></p><div id="s-form"></div>`;
    const nums = () => {
      const byN = masks[$('#s-cls').value] || {};
      const ns = Object.keys(byN).map(Number).filter(Boolean).sort((a, b) => a - b);
      const pre = $('#s-cls').value === last.c ? Number(last.n) : 0;
      $('#s-num').innerHTML = `<option value=""${pre ? '' : ' selected'}>번호 선택</option>` + ns.map((n) => `<option${n === pre ? ' selected' : ''}>${n}</option>`).join('');
      showMask();
    };
    const showMask = () => {
      const v = (masks[$('#s-cls').value] || {})[$('#s-num').value];
      $('#s-mask').innerHTML = v ? `이름: <b>${esc(v)}</b> — 내 이름이 맞나요?` : '<span class="muted small">반과 번호를 골라요</span>';
      sMode = 'login'; pending = null;
      if (v) drawForm(); else $('#s-form').innerHTML = '';
    };
    $('#s-cls').onchange = nums; $('#s-num').onchange = showMask;
    nums();
  }
  const pinInput = (id, ph) => `<input id="${id}" type="password" inputmode="numeric" maxlength="4" pattern="[0-9]*" placeholder="${ph}" autocomplete="off">`;
  function drawForm() {
    const f = $('#s-form'), c = () => $('#s-cls').value, n = () => Number($('#s-num').value);
    const remember = () => {}; // 반·번호는 기억하지 않는다 (v0.8.3)
    if (sMode === 'login') {
      f.innerHTML = `<label>비밀번호 (숫자 4자리) ${pinInput('s-pin', '••••')}</label><button id="s-login" class="btn primary big">🔑 로그인</button><button id="s-new" class="btn">처음이에요 · 가입</button>`;
      $('#s-login').onclick = go(async () => {
        const r = await A().login(c(), n(), $('#s-pin').value);
        if (r && r.needNewPin) { sMode = 'newpin'; drawForm(); return; }
        remember(); DS.UI.toast('로그인했어요!'); studentAuth();
      });
      $('#s-new').onclick = () => { sMode = 'signup'; drawForm(); };
    } else if (sMode === 'signup') {
      f.innerHTML = `<p class="muted small">이름이 맞는지 꼭 확인하고 가입해요. 한 번호는 한 명만 가입할 수 있어요.</p>
        <div class="row2"><label>비밀번호 4자리 ${pinInput('s-p1', '숫자 4자리')}</label><label>한 번 더 ${pinInput('s-p2', '다시')}</label></div>${heroPicker()}${fxPicker()}
        <p class="muted small">용사·이펙트는 나중에 모닥불 ⚙ 설정에서 언제든 바꿀 수 있어요.</p>
        <button id="s-make" class="btn primary big">✨ 가입하기</button><button id="s-back" class="btn small">← 로그인으로</button>`;
      bindHeroes(() => { const a = $('#s-p1').value, b = $('#s-p2').value; drawForm(); $('#s-p1').value = a; $('#s-p2').value = b; });
      bindFx();
      $('#s-make').onclick = go(async () => {
        const a = $('#s-p1').value, b = $('#s-p2').value;
        if (a !== b) throw Object.assign(new Error('두 비밀번호가 달라요.'), { user: true });
        await A().signUp(c(), n(), a, hero, fx);
        remember(); DS.UI.toast('가입했어요! 비밀번호 4자리를 꼭 기억해요.', 3200); studentAuth();
      });
      $('#s-back').onclick = () => { sMode = 'login'; drawForm(); };
    } else {
      f.innerHTML = `<p class="gold">선생님이 비밀번호를 초기화했어요. 새 비밀번호를 정해요.</p>
        <div class="row2"><label>새 비밀번호 4자리 ${pinInput('s-p1', '숫자 4자리')}</label><label>한 번 더 ${pinInput('s-p2', '다시')}</label></div>
        <button id="s-make" class="btn primary big">🔑 새 비밀번호로 시작</button>`;
      $('#s-make').onclick = go(async () => {
        const a = $('#s-p1').value, b = $('#s-p2').value;
        if (a !== b) throw Object.assign(new Error('두 비밀번호가 달라요.'), { user: true });
        await A().login(c(), n(), '0000', a);
        remember(); DS.UI.toast('새 비밀번호로 바꿨어요!', 3000); studentAuth();
      });
    }
  }

  // ── 교사 로그인 (교사 폰 · 수업 준비 공통) ─────────────────────
  async function teacherAuth() {
    const ok = await A().isAdmin();
    document.querySelectorAll('.t-only').forEach((e) => (e.hidden = !ok));
    if (ok) {
      document.querySelectorAll('.t-auth').forEach((e) => { e.innerHTML = '<div class="acc-card"><b>👩‍🏫 교사 계정</b><span class="muted small">로그인됨</span><button class="btn small t-out">로그아웃</button></div>'; });
      document.querySelectorAll('.t-out').forEach((b) => (b.onclick = go(async () => { await A().logout(); await teacherAuth(); await studentAuth(); })));
      const cs = Object.keys((await A().masks()) || {}).sort();
      $('#t-cls').innerHTML = cs.length ? cs.map((c) => `<option>${esc(c)}</option>`).join('') : '<option value="">(명단 없음 — 수업 준비에서 올려요)</option>';
      const t = read('citadel-teacher');
      $('#t-resume').hidden = true; // 「📋 만든 수업」 목록으로 합침 (v0.8.4)
      liveList(cs);
      return;
    }
    const first = !(await A().adminExists());
    document.querySelectorAll('.t-auth').forEach((e) => {
      e.innerHTML = `<p class="muted small">${first ? '처음 한 번: 교사 계정을 만들어요. (학생보다 먼저!)' : '교사 계정으로 로그인해요.'}</p>
        <div class="row2"><label>교사 아이디 <input class="t-id" autocomplete="username" placeholder="영문·숫자"></label><label>비밀번호 <input class="t-pw" type="password" autocomplete="current-password" placeholder="6자 이상"></label></div>
        <button class="btn primary t-login">${first ? '✨ 교사 계정 만들기' : '🔑 교사 로그인'}</button>`;
    });
    document.querySelectorAll('.t-login').forEach((b) => (b.onclick = go(async () => {
      const box = b.closest('.t-auth'), id = box.querySelector('.t-id').value.trim(), pwd = box.querySelector('.t-pw').value;
      if (!id) throw Object.assign(new Error('교사 아이디를 넣어 주세요.'), { user: true });
      if (first) await A().teacherCreate(id, pwd); else await A().teacherLogin(id, pwd);
      DS.UI.toast('교사 계정으로 로그인했어요.'); await teacherAuth(); await studentAuth();
      if (pendingTest) { const t = pendingTest; pendingTest = null; await DS.Test.start(t); }
    })));
  }

  function bind() {
    document.querySelectorAll('.role').forEach((b) => (b.onclick = () => form(b.dataset.role)));
    $('#t-new').onclick = go(async () => {
      const t = read('citadel-teacher');
      if (t && t.code) {
        const R0 = await DS.Net.get(`rooms/${t.code}`).catch(() => null);
        if (R0 && R0.meta && !(R0.state || {}).closed && !confirm(`진행 중인 수업 ${t.code} 가 있어요.\n새로 만들면 학생들은 새 코드로 다시 들어와야 해요.\n정말 새 수업을 만들까요?`)) return;
      }
      const cls = $('#t-cls').value;
      if (!cls) throw Object.assign(new Error('수업을 여는 반을 골라 주세요. (명단에 있는 반)'), { user: true });
      await DS.Teacher.create($('#lesson').value, cls);
    });
    $('#t-resume').onclick = go(() => { const t = read('citadel-teacher'); return DS.Teacher.open(t.code, t.hallKey); });
    $('#t-code-go').onclick = go(async () => {
      const code = $('#t-code').value.trim();
      if (!/^\d{6}$/.test(code)) throw Object.assign(new Error('수업 코드 6자리를 넣어 주세요.'), { user: true });
      const sec = await DS.Net.get(`secrets/${code}`).catch(() => null);
      return DS.Teacher.open(code, sec && sec.hallKey);
    });
    $('#h-go').onclick = go(() => DS.Hall.enter($('#h-code').value.trim(), $('#h-key').value.trim()));
    $('#p-go').onclick = go(async () => DS.Prep.enter($('#p-lesson').value));
    $('#s-go').onclick = go(async () => DS.Students.enter());
    $('#x-go').onclick = go(async () => { if (!(await A().isAdmin())) throw Object.assign(new Error('교사 계정으로 로그인해야 해요.'), { user: true }); await DS.Test.start($('#x-lesson').value); });
  }
  // v0.8.4: 교사 메뉴 「📋 만든 수업」 — 반 · 차시 · 코드 · 진행 중/끝남 → [↩ 들어가기] [✕ 없애기]
  // 목록 = 반마다 마지막 차원문(live/{반}, 다른 기기에서 만든 것도) + 이 기기에서 만든 수업 기록(citadel-rooms)
  const ROOMS = 'citadel-rooms';
  const roomsGet = () => { try { return JSON.parse(localStorage.getItem(ROOMS)) || []; } catch (e) { return []; } };
  const roomsSet = (a) => { try { localStorage.setItem(ROOMS, JSON.stringify(a.slice(0, 30))); } catch (e) { /* 무시 */ } };
  async function liveList(cs) {
    const box = $('#t-live'); if (!box) return;
    const me = DS.Net.uid(), byCode = {};
    roomsGet().filter((r) => r.uid === me).forEach((r) => { byCode[r.code] = { ...r }; });
    for (const c of cs) {
      const lv = await DS.Net.get(`live/${String(c).replace(/[.#$/[\\]]/g, '_')}`).catch(() => null);
      if (lv && lv.code) byCode[lv.code] = { ...(byCode[lv.code] || {}), code: lv.code, cls: c, lesson: lv.lesson, no: lv.no, at: byCode[lv.code] ? byCode[lv.code].at : lv.at, live: lv };
    }
    const list = await Promise.all(Object.values(byCode).map(async (r) => {
      const st = await DS.Net.get(`rooms/${r.code}/state`).catch(() => null), meta = await DS.Net.get(`rooms/${r.code}/meta`).catch(() => null);
      if (!meta) return null; // 이미 없는 수업
      const open = !(st && st.closed) && (!r.live || DS.Raid.liveOpen(r.live, Date.now()));
      return { ...r, lesson: r.lesson || meta.lesson, cls: r.cls || meta.cls, open, step: st ? st.step : -1 };
    }));
    const rows = list.filter(Boolean).sort((x, y) => (y.open - x.open) || ((Number(y.at) || 0) - (Number(x.at) || 0)));
    const when = (t) => { const d = new Date(Number(t)); return Number(t) ? `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : ''; };
    box.innerHTML = rows.length ? `<p class="t-sec"><b>📋 만든 수업</b> <span class="muted small">들어가기 · 없애기</span></p>${rows.map((r) => {
      const L = DS.Lessons.get(r.lesson);
      return `<div class="t-room${r.open ? ' on' : ''}"><div><b>${esc(r.cls || '-')}반 · ${L && L.no ? `${L.no}차시 ` : ''}${esc(L ? L.title : r.lesson || '')}</b>
        <span class="muted small">코드 ${esc(r.code)} · ${r.open ? (r.step >= 0 ? '🟢 진행 중' : '🟡 대기실') : '⚪ 끝남'}${when(r.at) ? ` · ${when(r.at)}` : ''}</span></div>
        <button class="btn small" data-lgo="${esc(r.code)}">↩ 들어가기</button>${r.step >= 0 ? `<button class="btn small" data-lnews="${esc(r.code)}" title="우리 반 수업 소식">🏫</button>` : ''}<button class="btn small t-x" data-lx="${esc(r.code)}" data-lcls="${esc(r.cls || '')}" data-lopen="${r.open ? 1 : 0}" aria-label="없애기">✕</button></div>`;
    }).join('')}` : '';
    box.querySelectorAll('[data-lgo]').forEach((b) => (b.onclick = () => DS.Control.run(async () => { const sec = await DS.Net.get(`secrets/${b.dataset.lgo}`).catch(() => null); await DS.Teacher.open(b.dataset.lgo, sec && sec.hallKey); })));
    box.querySelectorAll('[data-lnews]').forEach((b) => (b.onclick = () => DS.Control.run(async () => {
      const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${b.dataset.lnews}`)); const L = DS.Lessons.get(R.meta.lesson);
      await DS.ShareCard.preview((praise) => DS.ShareCard.klass({ L, R, cls: R.meta.cls, praise }), `우리 반 수업 소식 · ${L.no ? `${L.no}차시 ` : ''}${L.title}`, `🏫 ${R.meta.cls ? `${R.meta.cls}반 ` : ''}공통수학2 ${L.title} 수업 소식`, { praise: true });
    })));
    box.querySelectorAll('[data-lx]').forEach((b) => (b.onclick = () => DS.Control.run(async () => {
      const code = b.dataset.lx, open = b.dataset.lopen === '1';
      if (!confirm(open ? `수업 ${code} 을(를) 끝내고 목록에서 없앨까요?\n학생은 결과를 보고 모닥불로 가고, 차원문은 사라져요.` : `수업 ${code} 을(를) 목록에서 없앨까요?\n(모닥불의 꺼진 차원문도 사라져요)`)) return;
      if (open) await DS.Act.endClass(code);
      const cls = b.dataset.lcls;
      if (cls) { const k = `live/${String(cls).replace(/[.#$/[\\]]/g, '_')}`; const lv = await DS.Net.get(k).catch(() => null); if (lv && lv.code === code) await DS.Net.remove(k).catch(() => {}); }
      roomsSet(roomsGet().filter((r) => r.code !== code));
      DS.UI.toast('목록에서 없앴어요.'); liveList(cs);
    })));
  }
  return { boot, fillLessons };
})();
window.addEventListener('DOMContentLoaded', () => DS.App.boot());
