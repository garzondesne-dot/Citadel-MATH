// 첫 화면: 역할 고르기(학생 · 교사 폰 · 종합상황실) · 입장 양식 · 주소로 바로 입장(?role=student&code=…)
window.DS = window.DS || {};

DS.App = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  const q = new URLSearchParams(location.search);
  const read = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  let hero = 0;

  async function boot() {
    DS.Art.install();
    DS.PWA.init();
    try { await DS.Net.init(); } catch (e) { $('#home-msg').textContent = e.message; return; }
    $('#mode').innerHTML = DS.Net.mode === 'local' ? '🧪 이 기기 체험 모드 <span class="muted">(Firebase 미설정 — 같은 브라우저 탭끼리만 연결)</span>' : '🌐 실시간 연결 (Firebase)';
    $('#ver').textContent = DS.VERSION;
    $('#lesson').innerHTML = DS.Lessons.list.map((l) => `<option value="${l.id}">${esc(l.unit || '')} · ${esc(l.title)}</option>`).join('');
    $('#s-num').innerHTML = Array.from({ length: 30 }, (_, i) => `<option>${i + 1}</option>`).join('');
    const last = read('citadel-student');
    if (last) { $('#s-code').value = last.code; $('#s-num').value = last.num; $('#s-nick').value = last.nick; hero = last.hero || 0; }
    if (q.get('code')) $('#s-code').value = q.get('code');
    heroes();
    bind();
    const role = q.get('role');
    if (role === 'student') form('student');
    if (role === 'hall') { form('hall'); if (q.get('code')) $('#h-code').value = q.get('code'); }
    if (role === 'teacher') form('teacher');
    const t = read('citadel-teacher');
    if (t && t.uid === DS.Net.uid()) { $('#t-resume').hidden = false; $('#t-resume').textContent = `↩ 수업 ${t.code} 이어서 (키 ${t.hallKey})`; }
    const h = read('citadel-hall');
    if (h) { $('#h-code').value = $('#h-code').value || h.code; $('#h-key').value = h.key; }
    if (q.get('key')) $('#h-key').value = q.get('key');
    // 바로 열기 (체험판·북마크): ?role=teacher&resume · ?role=hall&code=…&key=…
    if (role === 'teacher' && q.has('resume') && t && t.uid === DS.Net.uid()) $('#t-resume').click();
    if (role === 'hall' && q.get('code') && q.get('key')) $('#h-go').click();
  }
  function heroes() {
    $('#s-heroes').innerHTML = Array.from({ length: DS.ASSETS.heroes.count - 1 }, (_, i) => `<button class="hpick${i === hero ? ' on' : ''}" data-h="${i}">${DS.Art.hero(i, i === hero ? 'attack' : 'idle')}</button>`).join('');
    $('#s-heroes').querySelectorAll('.hpick').forEach((b) => (b.onclick = () => { hero = Number(b.dataset.h); DS.Sound.clank(); heroes(); }));
  }
  function form(which) {
    document.querySelectorAll('.role-form').forEach((f) => (f.hidden = f.id !== `f-${which}`));
    document.querySelectorAll('.role').forEach((b) => b.classList.toggle('on', b.dataset.role === which));
  }
  const go = (fn) => async (ev) => {
    const b = ev.currentTarget; b.disabled = true;
    try { await fn(); } catch (e) { DS.UI.toast(e.message || String(e), 3200); if (!e.user) console.error(e); } finally { b.disabled = false; }
  };
  function bind() {
    document.querySelectorAll('.role').forEach((b) => (b.onclick = () => form(b.dataset.role)));
    $('#s-go').onclick = go(async () => {
      const code = $('#s-code').value.trim(), nick = $('#s-nick').value.trim();
      if (!/^\d{6}$/.test(code)) throw Object.assign(new Error('수업 코드 6자리를 넣어 주세요.'), { user: true });
      if (!nick) throw Object.assign(new Error('닉네임을 넣어 주세요.'), { user: true });
      await DS.Student.enter(code, { num: Number($('#s-num').value), nick, hero });
    });
    $('#t-new').onclick = go(() => DS.Teacher.create($('#lesson').value));
    $('#t-resume').onclick = go(() => { const t = read('citadel-teacher'); return DS.Teacher.open(t.code, t.hallKey); });
    $('#h-go').onclick = go(() => DS.Hall.enter($('#h-code').value.trim(), $('#h-key').value.trim()));
  }
  return { boot };
})();
window.addEventListener('DOMContentLoaded', () => DS.App.boot());
