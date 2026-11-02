// 🏛 교사 대기공간 (v0.9.1): 새 수업을 만들면 공동 던전 대기실이 아니라 여기서 시작한다 (배경 = 푸른 숲 성소, 사용자 제공)
// - 맨 위 가운데: 학생 입장용 QR 코드 크게 + 수업 코드 + 입장 인원(실시간)
// - ⚒ 모루 · 📘 보강던전: 모든 차시 미리 보기 (교사는 기록을 저장하지 않음)
// - 🌀 오른쪽 차원문: 이 수업 던전으로 → 교사 화면(◀ ▶ 리모컨). 수업이 끝나면 꺼진 차원문 + 🏫 우리 반 수업 소식
// - 수업이 없으면 차원문 자리 → 「새 수업 열기」(교사 메뉴)
// v0.9.2 (사용자 결정): 교사 폰은 리모컨에서 바로 시작하고, **종합상황실(PC)이 교사 캠프에서 시작**한다 (아이들에게 모루 · 보강던전을 자연스럽게 소개)
//   hall 모드 = 종합상황실 기기: 교사 로그인 없이 · 차원문/「🖥 종합상황실로」 → 종합상황실 화면 · 수업이 시작되면 저절로 종합상황실로
//   수업 끝 뒤에는 종합상황실 · 교사 폰의 「🏛 교사 캠프 가기」로 다시 온다. 🏫 학급 결과는 마무리(또는 보스 격파)부터 보인다
window.DS = window.DS || {};

DS.TCamp = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  let code = '', hallKey = '', stop = null, R = null, L = null, picking = false, hall = false, wasLobby = null;
  const ME = () => ({ c: '교사', n: 0, name: '선생님', hero: DS.ASSETS.heroes.teacher, fx: 'twinkle', preview: true });
  const maxNo = () => Math.max(0, ...DS.Lessons.list.map((l) => l.no || 0));
  const studentUrl = () => `${location.origin}${location.pathname.replace(/[^/]*$/, '')}index.html?role=student&code=${code}${DS.Net.mode === 'local' ? '&local' : ''}`;

  async function enter(o = {}) {
    hall = !!o.hall;
    if (!hall && !(await DS.Account.isAdmin())) throw Object.assign(new Error('교사 계정으로 로그인해야 해요.'), { user: true });
    code = o.code || ''; hallKey = o.hallKey || ''; R = null; L = null; wasLobby = null;
    DS.UI.show('screen-tcamp');
    document.getElementById('screen-tcamp').classList.toggle('tc-hallmode', hall);
    if (!hall) DS.Scene.save({ role: 'tcamp', code, hallKey }); // 종합상황실 기기는 장면을 종합상황실로 둔다 (새로고침 → 종합상황실)
    render();
    if (stop) stop(); stop = null;
    if (code) stop = DS.Net.watch(`rooms/${code}`, (v) => { if (!v) return; R = DS.Act.unpackRoom(v); L = DS.Lessons.get(R.meta.lesson); drawLive(); autoHall(); });
  }
  function render() {
    const base = DS.ASSETS.base, c = DS.ASSETS.camp;
    $('#tcamp').innerHTML = `<div class="tc-top" style="background-image:linear-gradient(#050b1cdd,#050b1cdd),url('${base}${DS.ASSETS.tcamp.bg}')">${code ? `<div class="tc-qr" id="tc-qr"></div><div class="tc-code"><span class="muted small">${hall ? '📱 휴대폰 카메라로 QR 을 찍고 입장해요' : '학생 입장 · QR 찍기 또는 모닥불 차원문'}</span><b>수업 코드 ${esc(code)}</b><span id="tc-info" class="small"></span></div>` : '<div class="tc-code"><b>🏛 교사 캠프</b><span class="muted small">수업을 열면 여기에 학생 입장 QR 이 크게 떠요</span></div>'}</div>
      <div class="tc-stage" style="background-image:url('${base}${DS.ASSETS.tcamp.bg}')">
        <button class="camp-anvil tc-anvil" id="tc-anvil" aria-label="모루"><i class="camp-anvil-img" style="background-image:url('${base}${c.anvil.src}');background-size:${c.anvil.cols * 100}% 100%;background-position:0 0"></i><span class="camp-label">⚒ 모루 (미리 보기)</span></button>
        <button class="camp-bonus tc-bonus" id="tc-bonus" aria-label="보강던전"><i class="camp-bonus-img" style="background-image:url('${base}${DS.ASSETS.dportals.bonus}')"></i><span class="camp-label">📘 보강던전 (미리 보기)</span></button>
        <div class="tc-hero">${DS.Art.hero(DS.ASSETS.heroes.teacher, 'idle', 'huff')}<i class="shadow"></i></div>
        <button class="camp-gate tc-gate" id="tc-gate" aria-label="차원문"></button>
      </div>
      <div class="tc-bar" id="tc-bar"></div>`;
    if (code && window.QRCode) { const q = $('#tc-qr'); q.innerHTML = ''; new QRCode(q, { text: studentUrl(), width: hall ? 380 : 320, height: hall ? 380 : 320, correctLevel: QRCode.CorrectLevel ? QRCode.CorrectLevel.M : undefined }); }
    $('#tc-anvil').onclick = () => pick('#tc-anvil', () => DS.Forge.open(ME(), { preview: true, no: maxNo() }));
    $('#tc-bonus').onclick = () => pick('#tc-bonus', () => DS.Control.run(() => DS.Bonus.enter(ME(), { preview: true, no: maxNo() })));
    $('#tc-gate').onclick = () => {
      if (!code) return pick('#tc-gate', () => leave());
      if (hall) return pick('#tc-gate', toHall);
      pick('#tc-gate', () => DS.Control.run(() => DS.Teacher.open(code, hallKey)));
    };
    drawLive();
  }
  function drawLive() {
    const g = $('#tc-gate'); if (!g) return;
    const closed = R && DS.Raid.isClosed(R), theme = L ? L.theme : '';
    if (!code) { g.className = 'camp-gate tc-gate empty'; g.innerHTML = '<span class="camp-label">🌀 새 수업 열기 (교사 메뉴)</span>'; }
    else {
      const D = DS.ASSETS.dungeons, i = D.ids.indexOf(theme);
      g.className = `camp-gate tc-gate ${closed ? 'closed' : 'open'}`;
      g.innerHTML = theme ? `<i class="camp-portal" style="background-image:url('${DS.ASSETS.base}${D.portal(theme)}');background-position:${closed ? '100%' : '0%'} 0"></i><span class="camp-label">${closed ? `🔒 수업 끝 · ${hall ? '종합상황실로' : '교사 화면 보기'}` : `⚔ ${L && L.no ? `${L.no}차시 ` : ''}${hall ? (R && DS.Raid.isLobby(R) ? '던전 입장' : '수업 중 · 종합상황실로') : '수업 진행'}`}</span>` : '<span class="camp-label">🌀 던전 불러오는 중…</span>';
    }
    const info = $('#tc-info');
    if (info && R) { const studs = Object.values(R.players || {}).filter((p) => !p.teacher).length; info.innerHTML = `${R.meta.cls ? `${esc(R.meta.cls)}반 · ` : ''}${L ? esc(L.title) : ''} · <b class="gold">입장 ${studs}명</b>${DS.Raid.isLobby(R) ? ' · 대기 중' : closed ? ' · 끝' : ' · 진행 중'}`; }
    const bar = $('#tc-bar');
    if (bar) {
      bar.innerHTML = `${hall ? '<button class="btn small" id="tc-menu">🖥 종합상황실로</button>' : `<button class="btn small" id="tc-menu">≪ 교사 메뉴</button>${code ? `<button class="btn small" id="tc-hall">🖥 종합상황실 키 ${esc(hallKey || '—')}</button>` : ''}`}${DS.ShareCard.klassReady(L, R) ? '<button class="btn small sc-btn" id="tc-news">🏫 학급 결과</button>' : ''}`;
      $('#tc-menu').onclick = leave;
      const hb = $('#tc-hall'); if (hb) hb.onclick = () => DS.UI.toast(`종합상황실(교실 PC)에서 수업 코드 ${code} · 키 ${hallKey} 를 넣어요`, 4000);
      const nb = $('#tc-news'); if (nb) nb.onclick = () => DS.Control.run(() => DS.ShareCard.klassOpen(L, R, { praise: !hall }));
    }
  }
  // 종합상황실 기기: 수업이 시작되면(대기 → 진행) 저절로 종합상황실 화면으로
  function autoHall() {
    if (!hall || !R) return;
    const lobby = DS.Raid.isLobby(R);
    if (wasLobby === true && !lobby && document.getElementById('screen-tcamp').classList.contains('active') && document.getElementById('forge').hidden !== false) toHall();
    wasLobby = lobby;
  }
  function toHall() { if (stop) stop(); stop = null; DS.UI.show('screen-hall'); }
  async function leave() {
    if (hall) return toHall();
    if (code && R && !DS.Raid.isClosed(R) && window.confirm('수업도 끝낼까요?\n\n[확인] 수업 끝내기 — 학생은 결과를 보고 모닥불로, 차원문은 꺼져요\n[취소] 잠깐 나가기 — 수업은 계속돼요 (교사 메뉴 「📋 만든 수업」에서 다시 들어오기)')) await DS.Act.endClass(code).catch(() => {});
    if (stop) stop(); stop = null; DS.Scene.clear(); location.replace(`${location.pathname}?${DS.Net.mode === 'local' ? 'local&' : ''}role=teacher`);
  }
  // 모닥불과 같은 선택 연출
  function pick(sel, then) {
    const el = document.querySelector(sel); if (!el || picking) return;
    picking = true; el.classList.remove('picked'); void el.offsetWidth; el.classList.add('picked'); DS.Sound.clank();
    setTimeout(() => { picking = false; then(); }, 650);
    setTimeout(() => el.classList.remove('picked'), 1300);
  }
  const back = () => enter({ code, hallKey, hall });
  return { enter, back, leave, code: () => code, hallMode: () => hall, open: () => !!(code && R && !DS.Raid.isClosed(R)) };
})();
