// 첫 화면: 역할 고르기(학생 · 교사 폰 · 종합상황실 · 수업 준비) · 로그인/가입 · 주소로 바로 입장(?role=student&code=…)
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
  let hero = 0, sMode = 'login', masks = {}, pending = null;

  async function boot() {
    DS.Art.install();
    DS.PWA.init();
    try { await DS.Net.init(); } catch (e) { $('#home-msg').textContent = e.message; return; }
    try { if (await A().endStaleTeacher()) DS.UI.toast('앱을 다시 켜서 교사 계정은 로그아웃했어요.', 3200); } catch (e) { console.error(e); }
    DS.Nav.init();
    $('#mode').innerHTML = DS.Net.mode === 'local' ? '🧪 이 기기 체험 모드 <span class="muted">(Firebase 미설정 — 같은 브라우저 탭끼리만 연결)</span>' : '🌐 실시간 연결 (Firebase)';
    $('#ver').textContent = DS.VERSION;
    $('#lesson').innerHTML = $('#p-lesson').innerHTML = DS.Lessons.list.map((l) => `<option value="${l.id}">${esc(l.unit || '')} · ${esc(l.title)}</option>`).join('');
    bind();
    await studentAuth();
    await teacherAuth();
    const role = q.get('role');
    if (role) form(role);
    if (role === 'hall' && q.get('code')) $('#h-code').value = q.get('code');
    const h = read('citadel-hall');
    if (h) { $('#h-code').value = $('#h-code').value || h.code; $('#h-key').value = h.key; }
    if (q.get('key')) $('#h-key').value = q.get('key');
    const t = read('citadel-teacher');
    // 바로 열기 (체험판·북마크): ?role=teacher&resume · ?role=hall&code=…&key=…
    if (role === 'teacher' && q.has('resume') && t && t.uid === DS.Net.uid()) $('#t-resume').click();
    if (role === 'hall' && q.get('code') && q.get('key')) { $('#h-go').click(); return; }
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
    } catch (e) { DS.Scene.clear(); DS.UI.toast(e.message || String(e), 3200); }
  }
  const info = (m) => ({ num: m.n, nick: m.name, hero: m.hero, fx: m.fx || 'fire', cls: m.c });
  function form(which) {
    document.querySelectorAll('.role-form').forEach((f) => (f.hidden = f.id !== `f-${which}`));
    document.querySelectorAll('.role').forEach((b) => b.classList.toggle('on', b.dataset.role === which));
  }
  const go = (fn) => async (ev) => {
    const b = ev.currentTarget; b.disabled = true;
    try { await fn(); } catch (e) { DS.UI.toast(e.message || String(e), 3600); if (!e.user) console.error(e); } finally { b.disabled = false; }
  };
  let fx = 'fire';
  const fxPicker = (title = '내 공격 이펙트') => `<p class="shelf-title">${title}</p><div class="fxs">${DS.FX.KINDS.map((k) => `<button class="fxpick${k === fx ? ' on' : ''}" data-fx="${k}"><canvas width="150" height="90" data-still="${k}"></canvas><span>${DS.FX.NAMES[k]}</span></button>`).join('')}</div>`;
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
      const needFx = !m.fx;
      box.innerHTML = `<div class="acc-card"><b>${esc(m.c)} · ${m.n}번 ${esc(m.name)}</b><span class="muted small">로그인됨</span></div>
        <div class="me-hero">${DS.Art.hero(m.hero, 'idle', 'big huff')}<div><p class="gold">내 용사 · 고정</p><p>${needFx ? '공격 이펙트를 아직 안 골랐어요' : DS.FX.NAMES[m.fx]}</p></div></div>
        ${needFx ? `${fxPicker('공격 이펙트 고르기 (한 번만 · 고르면 고정)')}<button id="s-fx" class="btn primary">✨ 이 이펙트로 정하기</button>` : '<button id="s-go" class="btn primary big">🔥 모닥불로 가기</button>'}
        <button id="s-out" class="btn small">다른 사람으로 로그인</button>`;
      if (needFx) { bindFx(); $('#s-fx').onclick = go(async () => { await A().setFx(fx); DS.UI.toast('이펙트를 정했어요!'); studentAuth(); }); }
      else $('#s-go').onclick = go(() => DS.Camp.enter(m, q.get('code')));
      $('#s-out').onclick = go(async () => { await A().logout(); studentAuth(); });
      return;
    }
    masks = (await A().masks()) || {};
    const classes = Object.keys(masks).sort();
    const last = read('citadel-acc') || {};
    if (!classes.length) { box.innerHTML = '<p class="muted">아직 학생 명단이 없어요. 선생님이 "수업 준비"에서 명단을 올리면 로그인할 수 있어요.</p>'; return; }
    const c = classes.includes(last.c) ? last.c : classes[0];
    box.innerHTML = `<div class="row2"><label>반 <select id="s-cls">${classes.map((k) => `<option${k === c ? ' selected' : ''}>${esc(k)}</option>`).join('')}</select></label><label>번호 <select id="s-num"></select></label></div>
      <p class="acc-name" id="s-mask"></p><div id="s-form"></div>`;
    const nums = () => {
      const byN = masks[$('#s-cls').value] || {};
      const ns = Object.keys(byN).map(Number).filter(Boolean).sort((a, b) => a - b);
      $('#s-num').innerHTML = ns.map((n) => `<option${n === Number(last.n) ? ' selected' : ''}>${n}</option>`).join('');
      showMask();
    };
    const showMask = () => { const v = (masks[$('#s-cls').value] || {})[$('#s-num').value]; $('#s-mask').innerHTML = v ? `이름: <b>${esc(v)}</b> — 내 이름이 맞나요?` : ''; sMode = 'login'; pending = null; drawForm(); };
    $('#s-cls').onchange = nums; $('#s-num').onchange = showMask;
    nums();
  }
  const pinInput = (id, ph) => `<input id="${id}" type="password" inputmode="numeric" maxlength="4" pattern="[0-9]*" placeholder="${ph}" autocomplete="off">`;
  function drawForm() {
    const f = $('#s-form'), c = () => $('#s-cls').value, n = () => Number($('#s-num').value);
    save('citadel-acc', { c: c(), n: n() });
    if (sMode === 'login') {
      f.innerHTML = `<label>비밀번호 (숫자 4자리) ${pinInput('s-pin', '••••')}</label><button id="s-login" class="btn primary big">🔑 로그인</button><button id="s-new" class="btn">처음이에요 · 가입</button>`;
      $('#s-login').onclick = go(async () => {
        const r = await A().login(c(), n(), $('#s-pin').value);
        if (r && r.needNewPin) { sMode = 'newpin'; drawForm(); return; }
        DS.UI.toast('로그인했어요!'); studentAuth();
      });
      $('#s-new').onclick = () => { sMode = 'signup'; drawForm(); };
    } else if (sMode === 'signup') {
      f.innerHTML = `<p class="muted small">이름이 맞는지 꼭 확인하고 가입해요. 한 번호는 한 명만 가입할 수 있어요.</p>
        <div class="row2"><label>비밀번호 4자리 ${pinInput('s-p1', '숫자 4자리')}</label><label>한 번 더 ${pinInput('s-p2', '다시')}</label></div>${heroPicker()}${fxPicker()}
        <p class="lock-note">🔒 가입하면 용사·이펙트는 고정돼요 (바꾸려면 선생님께 — 비밀번호 초기화 때 다시 골라요)</p>
        <button id="s-make" class="btn primary big">✨ 가입하기</button><button id="s-back" class="btn small">← 로그인으로</button>`;
      bindHeroes(() => { const a = $('#s-p1').value, b = $('#s-p2').value; drawForm(); $('#s-p1').value = a; $('#s-p2').value = b; });
      bindFx();
      $('#s-make').onclick = go(async () => {
        const a = $('#s-p1').value, b = $('#s-p2').value;
        if (a !== b) throw Object.assign(new Error('두 비밀번호가 달라요.'), { user: true });
        await A().signUp(c(), n(), a, hero, fx);
        DS.UI.toast('가입했어요! 비밀번호 4자리를 꼭 기억해요.', 3200); studentAuth();
      });
      $('#s-back').onclick = () => { sMode = 'login'; drawForm(); };
    } else {
      f.innerHTML = `<p class="gold">선생님이 비밀번호를 초기화했어요. 새 비밀번호를 정해요.</p>
        <div class="row2"><label>새 비밀번호 4자리 ${pinInput('s-p1', '숫자 4자리')}</label><label>한 번 더 ${pinInput('s-p2', '다시')}</label></div>
        <p class="muted small">초기화했으니 용사·이펙트도 다시 고를 수 있어요.</p>${heroPicker()}${fxPicker()}
        <button id="s-make" class="btn primary big">🔑 새 비밀번호로 시작</button>`;
      bindHeroes(() => { const a = $('#s-p1').value, b = $('#s-p2').value; drawForm(); $('#s-p1').value = a; $('#s-p2').value = b; });
      bindFx();
      $('#s-make').onclick = go(async () => {
        const a = $('#s-p1').value, b = $('#s-p2').value;
        if (a !== b) throw Object.assign(new Error('두 비밀번호가 달라요.'), { user: true });
        await A().login(c(), n(), '0000', a, hero, fx);
        DS.UI.toast('새 비밀번호로 바꿨어요!', 3000); studentAuth();
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
      const t = read('citadel-teacher');
      if (t && t.uid === DS.Net.uid()) { $('#t-resume').hidden = false; $('#t-resume').textContent = `↩ 수업 ${t.code} 이어서`; }
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
      await DS.Teacher.create($('#lesson').value);
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
  }
  return { boot };
})();
window.addEventListener('DOMContentLoaded', () => DS.App.boot());
