// 교사 폰 (리모컨): 수업 중에는 ◀ 뒤로 / 앞으로 ▶ 두 버튼 + 도움이 필요한 학생 + 기준% 조절만.
// 학생별 정답·도움 요청은 이 화면에만 보인다 (종합상황실에는 정답 글자를 띄우지 않는다).
window.DS = window.DS || {};

DS.Teacher = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  const C = () => DS.Control, Raid = () => DS.Raid;
  let code = null, L = null, R = null, raw = null, stop = null, tick = 0, showKey = 0;
  // 종합상황실 키는 화면에 **** 로 가린다 (교실 화면에 비칠 수 있어서). [보기] 를 누르면 5초만 보인다
  const keyHtml = () => (Date.now() < showKey ? `<b>${esc($('#t-key').textContent)}</b>` : '<b>****</b> <button class="btn small t-keyshow">보기</button>');

  async function create(lessonId) {
    const r = await DS.Act.createRoom(lessonId);
    try { localStorage.setItem('citadel-teacher', JSON.stringify({ code: r.code, hallKey: r.hallKey, uid: DS.Net.uid() })); } catch (e) { /* 무시 */ }
    return open(r.code, r.hallKey);
  }
  async function open(c, hallKey) {
    const R0 = await DS.Net.get(`rooms/${c}`);
    if (!R0 || !R0.meta) throw Object.assign(new Error('수업을 찾을 수 없어요.'), { user: true });
    if (R0.meta.teacher !== DS.Net.uid()) throw Object.assign(new Error('이 기기에서 만든 수업이 아니에요.'), { user: true });
    code = c;
    DS.UI.show('screen-teacher');
    $('#t-key').textContent = hallKey || '';
    if (stop) stop();
    stop = DS.Net.watch(`rooms/${code}`, (v) => { if (!v) return; raw = v; R = DS.Act.unpackRoom(v); L = DS.Lessons.get(R.meta.lesson); render(); });
    clearInterval(tick); tick = setInterval(() => { if (R) render(); }, 15000); // "2분째 미제출" 갱신
  }
  const studentUrl = () => `${location.origin}${location.pathname.replace(/[^/]*$/, '')}index.html?role=student&code=${code}${DS.Net.mode === 'local' ? '&local' : ''}`;

  function render() {
    const studs = Object.keys(R.players || {}).filter((u) => !R.players[u].teacher);
    const total = L.steps.length, i = R.state.step ?? -1;
    $('#t-head').innerHTML = `<div><b>수업 ${code}</b> <span class="muted small">${esc(L.title)}</span><br><span class="muted small">종합상황실 키 ${keyHtml()} · 입장 ${studs.length}${Raid().isLobby(R) ? '' : ` · 대기실 인원 ${Raid().headcount(R)}`}</span></div>
      <div class="phase-pill">${i < 0 ? '대기' : i >= total ? '끝' : `${i + 1}/${total}`}</div>`;
    $('#t-tabs').innerHTML = '';
    const body = $('#t-body');
    body.innerHTML = `<div class="panel framed t-now">${now()}${C().pctHtml(L, R)}</div>
      ${Raid().isLobby(R) ? lobby() : helpPanel()}
      <p class="t-next muted small">다음 ▶ <b>${esc(C().nextName(L, R))}</b></p>
      <div class="t-pad"><button class="btn t-back" id="t-back"${i < 0 ? ' disabled' : ''}>◀<br>뒤로</button><button class="btn primary t-fwd" id="t-fwd"${i >= total ? ' disabled' : ''}>▶<br>앞으로</button></div>`;
    if (Raid().isLobby(R)) drawQR();
    document.querySelectorAll('.t-keyshow').forEach((b) => (b.onclick = () => { showKey = Date.now() + 5000; render(); setTimeout(() => { if (R) render(); }, 5100); }));
    C().bindPct(body, code, R, L);
    body.querySelectorAll('[data-help]').forEach((b) => (b.onclick = () => C().run(() => DS.Act.clearHelp(code, b.dataset.help))));
    $('#t-fwd').onclick = () => C().run(() => C().forward(code, R, L));
    $('#t-back').onclick = () => C().run(() => C().back(code, R, L));
  }
  function now() {
    const step = Raid().stepOf(L, R);
    const head = `<p class="muted small">지금</p><p class="stage-name">${esc(C().stepName(L, R))}</p>`;
    if (!step) return head;
    if (step.kind === 'monster') {
      const ids = Raid().activeIds(R), sub = ids.filter((u) => Raid().record(L, R, step.id, u).submitted).length;
      return `${head}<p>제출 <b>${sub}/${ids.length}</b>${Raid().cleared(L, R, step.id) ? ' · <span class="okc">격파!</span>' : ''}</p>`;
    }
    if (step.kind === 'boss') { const hp = Raid().bossHp(L, R); return `${head}<p>${hp.won ? '<span class="okc">보스 격파!</span>' : `데미지 ${hp.dmg}/${hp.max}`}</p>`; }
    return `${head}<p class="muted small">종합상황실에 학습지가 떠 있어요. 설명이 끝나면 ▶</p>`;
  }
  function lobby() {
    const studs = Object.entries(R.players || {}).filter(([, p]) => !p.teacher).sort((a, b) => a[1].num - b[1].num);
    return `<div class="panel framed"><p class="stage-name">학생 입장</p><div class="qr-row"><div id="t-qr" class="qr"></div><div><p>수업 코드 <b class="big-code">${code}</b></p><p class="muted small break">${esc(studentUrl())}</p><p class="muted small">종합상황실(PC): 첫 화면 → 종합상황실 → 코드 ${code} · 키는 위쪽 [보기]</p></div></div>
      <div class="chips">${studs.map(([, p]) => `<span class="chip">${p.num}번 ${esc(p.nick)}</span>`).join('') || '<span class="muted">아직 아무도 없어요</span>'}</div></div>`;
  }
  function drawQR() {
    const el = $('#t-qr');
    if (el && window.QRCode) { el.innerHTML = ''; new QRCode(el, { text: studentUrl(), width: 132, height: 132 }); }
  }
  function helpPanel() {
    const list = Raid().helpList(L, R, DS.Net.now());
    const why = { 2: 'lv2', 1: 'lv1', 0: 'lv0' };
    return `<div class="panel framed"><p class="t-help-head"><b>도움 필요 <span class="gold">${list.length}</span></b><span class="muted small">해결하면 저절로 사라져요</span></p>
      ${list.map((h) => `<button class="t-help ${why[h.level]}" data-help="${h.uid}"><b>${esc(C().name(R, h.uid))}</b><span>${esc(h.why)}</span></button>`).join('') || '<p class="muted small">지금은 없어요 👍</p>'}</div>`;
  }

  return { create, open };
})();
