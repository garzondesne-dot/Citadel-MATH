// 모닥불 (학생 개인 대기실 · 혼자만의 공간): 로그인하면 여기로 온다. 가로로 넘겨 보는 숲 야영지.
// 왼쪽 ⚒ 모루 → 연성창 (수업 코드 없이 언제나) · 가운데 🔥 모닥불 + 내 용사(씩씩) · 오른쪽 🌀 차원문 → 수업 코드 → 던전 단체 대기실
window.DS = window.DS || {};

DS.Camp = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  const C = () => DS.ASSETS.camp, base = () => DS.ASSETS.base;
  let me = null, fireT = 0, code0 = '';
  const today = () => new Date().toISOString().slice(0, 10);
  const stampToday = () => { try { return localStorage.getItem('citadel-stamp') === today(); } catch (e) { return false; } };

  async function enter(m, code) {
    me = m; code0 = code || '';
    DS.UI.show('screen-camp');
    DS.Scene.save({ role: 'camp' });
    render();
    if (code0) setTimeout(gate, 300); // QR 로 들어왔으면 차원문 창을 바로
  }
  // 그림 칸 하나 (배치표 시트에서 열·행)
  const sheet = (s, col, row, cls, style = '') => `<i class="${cls}" style="background-image:url('${base()}${s.src}');background-size:${s.cols * 100}% ${(s.rows || 1) * 100}%;background-position:${s.cols > 1 ? (col / (s.cols - 1)) * 100 : 0}% ${(s.rows || 1) > 1 ? (row / (s.rows - 1)) * 100 : 0}%;${style}"></i>`;
  function tree(i, cls, style) {
    const t = C().trees, x0 = t.cuts[i] / t.base, x1 = t.cuts[i + 1] / t.base, w = x1 - x0;
    return `<i class="camp-tree ${cls}" style="background-image:url('${base()}${t.src}');background-size:${100 / w}% 100%;background-position:${(x0 / (1 - w)) * 100}% 0;aspect-ratio:${(w * 1038) / 378};${style}"></i>`;
  }
  function render() {
    const c = C();
    $('#camp').innerHTML = `<div class="camp-top"><b>🔥 ${esc(me.name)}의 모닥불</b><span class="muted small">${esc(me.c)} · ${me.n}번 — 왼쪽 ⚒ 모루 · 오른쪽 🌀 차원문</span></div>
      ${stampToday() ? '<div class="stamp-bar">📮 반드시 학습지 확인도장 받아가세요.</div>' : ''}
      <div class="camp-scroll" id="camp-scroll"><div class="camp-stage" style="background-image:url('${base()}${c.bg}')">
        ${tree(0, 'back', 'left:2%;bottom:30%;height:46%')}${tree(2, 'back', 'left:60%;bottom:32%;height:40%')}
        <button class="camp-anvil" id="camp-anvil" aria-label="모루">${sheet(c.anvil, c.anvil.states.idle, 0, 'camp-anvil-img')}<span class="camp-label">⚒ 모루</span></button>
        <div class="camp-fire">${sheet(c.fire, 0, 0, 'camp-fire-img', '')}</div>
        <div class="camp-hero">${DS.Art.hero(me.hero, 'idle', 'huff')}<i class="shadow"></i></div>
        <button class="camp-gate" id="camp-gate" aria-label="차원문">${sheet(c.gate, c.gate.states.on, 0, 'camp-gate-img')}<span class="camp-label">🌀 차원문 · 수업 입장</span></button>
        ${tree(3, 'front', 'left:-4%;bottom:-6%;height:52%')}${tree(1, 'front', 'right:-3%;bottom:-4%;height:58%')}
      </div></div>
      <p class="muted small center">← 화면을 옆으로 밀어 둘러봐요 →</p>`;
    const sc = $('#camp-scroll'); requestAnimationFrame(() => { sc.scrollLeft = (sc.scrollWidth - sc.clientWidth) / 2; });
    $('#camp-anvil').onclick = () => DS.Forge.open(me);
    $('#camp-gate').onclick = gate;
    animateFire();
  }
  function animateFire() {
    clearInterval(fireT);
    const f = C().fire; let i = 0;
    fireT = setInterval(() => {
      const el = document.querySelector('.camp-fire-img');
      if (!el || !document.getElementById('screen-camp').classList.contains('active')) { clearInterval(fireT); return; }
      i = (i + 1) % f.frames;
      const col = i % f.cols, row = Math.floor(i / f.cols);
      el.style.backgroundPosition = `${(col / (f.cols - 1)) * 100}% ${(row / (f.rows - 1)) * 100}%`;
    }, f.ms);
  }
  // 차원문: 수업 코드 → 던전 단체 대기실
  function gate() {
    let last = ''; try { last = (JSON.parse(localStorage.getItem('citadel-student')) || {}).code || ''; } catch (e) { /* 무시 */ }
    const el = document.createElement('div'); el.className = 'modal camp-modal';
    el.innerHTML = `<div class="quiz-box framed"><h2>🌀 차원문</h2><p>선생님이 알려 준 <b>수업 코드 6자리</b>를 넣으면 던전 대기실로 넘어가요.</p>
      <input id="g-code" inputmode="numeric" maxlength="6" placeholder="6자리" autocomplete="off" value="${esc(code0 || last)}">
      <div class="row"><button class="btn" id="g-x">닫기</button><button class="btn primary" id="g-go">⚔ 던전으로</button></div></div>`;
    document.body.appendChild(el);
    el.querySelector('#g-x').onclick = () => el.remove();
    el.querySelector('#g-go').onclick = () => DS.Control.run(async () => {
      const code = el.querySelector('#g-code').value.trim();
      if (!/^\d{6}$/.test(code)) throw Object.assign(new Error('수업 코드 6자리를 넣어 주세요.'), { user: true });
      try { localStorage.setItem('citadel-student', JSON.stringify({ code })); } catch (e) { /* 무시 */ }
      await DS.Student.enter(code, { num: me.n, nick: me.name, hero: me.hero, fx: me.fx || 'fire', cls: me.c });
      el.remove(); code0 = '';
    });
  }
  const back = () => (me ? enter(me) : null);
  return { enter, back, stampToday, markStamp: () => { try { localStorage.setItem('citadel-stamp', today()); } catch (e) { /* 무시 */ } } };
})();
