// 🏛 교사 대기공간 (v0.9.1 → 2026-11-05: 교사 폰 · 종합상황실 모두 학생 캠프 화면(DS.Camp)을 그대로 씀 — 아래 옛 설명 중 화면 구성은 지난 내용)
// - 맨 위 가운데: 학생 입장용 QR 코드 크게 + 수업 코드 + 입장 인원(실시간)
// - ⚒ 모루 · 🏰 성채(중단원던전): 모든 층 미리 보기 (교사는 기록을 저장하지 않음) · ⛺ 텐트 = 책장
// - v2 (2026-11-03): 학생 캠프와 같은 달빛 숲 + 성채 (DS.CampScene) · 성벽 등불 = 우리 반 진행도 (열린 층 · 반 절반 이상 인장이면 금빛)
// - 🌀 오른쪽 차원문: 이 수업 던전으로 → 교사 화면(◀ ▶ 리모컨). 수업이 끝나면 꺼진 차원문 + 🏫 우리 반 수업 소식
// - 수업이 없으면 차원문 자리 → 「새 수업 열기」(교사 메뉴)
// v0.9.2 (사용자 결정): 교사 폰은 리모컨에서 바로 시작하고, **종합상황실(PC)이 교사 캠프에서 시작**한다 (아이들에게 모루 · 보강던전을 자연스럽게 소개)
//   hall 모드 = 종합상황실 기기: 교사 로그인 없이 · 차원문/「🖥 종합상황실로」 → 종합상황실 화면 · 수업이 시작되면 저절로 종합상황실로
//   수업 끝 뒤에는 종합상황실 · 교사 폰의 「🏛 교사 캠프 가기」로 다시 온다. 🏫 학급 결과는 마무리(또는 보스 격파)부터 보인다
window.DS = window.DS || {};

DS.TCamp = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  let code = '', hallKey = '', stop = null, R = null, L = null, hall = false, wasLobby = null;
  const studentUrl = () => `${location.origin}${location.pathname.replace(/[^/]*$/, '')}index.html?role=student&code=${code}${DS.Net.mode === 'local' ? '&local' : ''}`;

  async function enter(o = {}) {
    hall = !!o.hall;
    if (!hall && !(await DS.Account.isAdmin())) throw Object.assign(new Error('교사 계정으로 로그인해야 해요.'), { user: true });
    code = o.code || ''; hallKey = o.hallKey || ''; R = null; L = null; wasLobby = null;
    DS.UI.wake.on(); // 교사 캠프 · 종합상황실 캠프도 화면 켜 둠
    if (!hall) DS.Scene.save({ role: 'tcamp', code, hallKey }); // 종합상황실 기기는 장면을 종합상황실로 둔다 (새로고침 → 종합상황실)
    // 🏛 교사 캠프 = 학생 캠프 화면 그대로 (교사 폰 2026-11-05 「학생들과 똑같이 · 차시 전부 해금」 · 종합상황실도 같은 날 「기능 설명하고 싶은데 달라서 못 해」)
    //   체험 계정(기록 저장 안 함) · 모든 차시 · 성채 방 열림 · 교사 폰: 차원문 = 리모컨 · 우편함 = 📊 대시보드
    //   종합상황실(hall): 위에 학생 입장 QR · 수업 소식 줄 · 차원문 = 종합상황실 화면 · 우편함 = 🏫 우리 반 수업 소식 · 수업이 시작되면 저절로 종합상황실 · 다음 수업 저절로
    const tl = DS.Art.teacherLook();
    if (stop) stop(); stop = null;
    if (hall && code) stop = DS.Net.watch(`rooms/${code}`, (v) => { if (!v) return; R = DS.Act.unpackRoom(v); L = DS.Lessons.get(R.meta.lesson); drawLive(); autoHall(); });
    if (hall) setTimeout(watchNext, 4000);
    return DS.Camp.enter({ c: '교사', n: 1, name: '선생님', hero: hall && R ? DS.Art.teacherHero(R) : tl.hero, fx: tl.fx, title: tl.title || 'none', test: true, teacher: { code, hallKey, hall } });
  }
  const campOn = () => !!(document.getElementById('screen-camp') || {}).classList && document.getElementById('screen-camp').classList.contains('active') && DS.Camp.hallMode && DS.Camp.hallMode();
  // ── 🖥 종합상황실 캠프 덧붙이기 (camp.js 가 부름) ─────────────────
  function hallGate() {
    const closed = R && DS.Raid.isClosed(R), on = !!(code && R && !closed);
    const label = !code ? '🖥 종합상황실로' : !R ? '⚔ 던전 불러오는 중…' : closed ? '🔒 수업 끝 · 종합상황실로' : `⚔ ${L && L.no ? `${L.no}차시 ` : ''}${DS.Raid.isLobby(R) ? '던전 입장 (종합상황실)' : '수업 중 · 종합상황실로'}`;
    return { on, label };
  }
  const hallGo = () => toHall();
  async function hallMail() {
    if (R && L && DS.ShareCard) return DS.ShareCard.klassOpen(L, R, { praise: false });
    DS.UI.toast('수업이 끝나면 우리 반 수업 소식이 도착해요.', 2600);
  }
  function hallBar() {
    const bar = $('#tc-hallbar'); if (!bar) return;
    bar.innerHTML = `${code ? '<div class="tc-qr" id="tc-qr"></div>' : ''}<div class="tc-hb-r"><p class="tc-hb-t">${code ? `📱 학생 입장 · 수업 코드 <b class="gold">${esc(code)}</b>` : '🖥 종합상황실 캠프'}</p><p class="tc-info" id="tc-info"></p><div class="tc-bar" id="tc-bar"></div></div>`;
    if (code && window.QRCode) { const q = $('#tc-qr'); q.innerHTML = ''; new QRCode(q, { text: studentUrl(), width: 220, height: 220, correctLevel: QRCode.CorrectLevel ? QRCode.CorrectLevel.M : undefined }); }
    drawLive();
  }
  function drawLive() {
    if (!campOn()) return;
    if (DS.Camp.drawGate) DS.Camp.drawGate();
    const closed = R && DS.Raid.isClosed(R);
    const info = $('#tc-info');
    if (info) info.innerHTML = R ? `${R.meta.cls ? `${esc(R.meta.cls)}반 · ` : ''}${L ? esc(L.title) : ''} · <b class="gold">입장 ${Object.values(R.players || {}).filter((p) => !p.teacher).length}명</b>${DS.Raid.isLobby(R) ? ' · 대기 중' : closed ? ' · 끝' : ' · 진행 중'}` : code ? '수업을 불러오는 중…' : '열린 수업이 없어요 — 교사 폰에서 수업을 열면 저절로 들어가요';
    const bar = $('#tc-bar');
    if (bar) {
      bar.innerHTML = `<button class="btn small" id="tc-menu">🖥 종합상황실로</button>${DS.UI.fs.btn('tc-fs')}${DS.ShareCard.klassReady(L, R) ? '<button class="btn small sc-btn" id="tc-news">🏫 우리 반 소식</button>' : ''}${L && R && closed && DS.Combo ? '<button class="btn small" id="tc-punch">🏁 반대항 경주</button>' : ''}`;
      const tm = $('#tc-menu'); if (tm) tm.onclick = toHall; DS.UI.fs.bind('tc-fs');
      const nb = $('#tc-news'); if (nb) nb.onclick = () => DS.Control.run(() => DS.ShareCard.klassOpen(L, R, { praise: false }));
      const pb = $('#tc-punch'); if (pb) pb.onclick = () => DS.Control.run(() => DS.Punch.open(L, R, { big: true }));
    }
  }
  // 종합상황실 기기: 수업이 시작되면(대기 → 진행) 저절로 종합상황실 화면으로
  function autoHall() {
    if (!hall || !R) return;
    const lobby = DS.Raid.isLobby(R);
    if (wasLobby === true && !lobby && campOn() && document.getElementById('forge').hidden !== false) toHall();
    wasLobby = lobby;
  }
  function toHall() { if (stop) stop(); stop = null; DS.UI.show('screen-hall'); }
  // 🖥 종합상황실 캠프: 수업이 끝난 뒤 다음 수업이 열리면 저절로 그 수업으로 (같은 비밀번호면 입력 없이 · 2026-11-05 사용자)
  let nextT = null, nextTried = '';
  async function watchNext() {
    clearTimeout(nextT); if (!hall || !campOn()) return;
    if (!code || (R && DS.Raid.isClosed(R))) {
      const rooms = await DS.Act.openRooms().catch(() => []), nx = rooms.find((r) => r.code !== code);
      if (nx && nextTried !== nx.code) {
        nextTried = nx.code;
        try { await DS.Hall.enter(nx.code, hallKey); return; } catch (e) {
          const info = $('#tc-info'); if (info) info.innerHTML = `🔔 새 수업 <b class="gold">${esc(nx.cls)}반 ${nx.no ? `${nx.no}차시` : ''}</b> — <button class="btn small" id="tc-next">🖥 비밀번호 넣고 열기</button>`;
          const b = $('#tc-next'); if (b) b.onclick = () => { const k = window.prompt('종합상황실 비밀번호 (교사 폰 위쪽 4자리)'); if (k) DS.Control.run(() => DS.Hall.enter(nx.code, k.trim())); };
        }
      }
    }
    nextT = setTimeout(watchNext, 15000);
  }
  async function leave() {
    if (hall) return toHall();
    if (code && R && !DS.Raid.isClosed(R) && window.confirm('수업도 끝낼까요?\n\n[확인] 수업 끝내기 — 학생은 결과를 보고 모닥불로, 차원문은 꺼져요\n[취소] 잠깐 나가기 — 수업은 계속돼요 (교사 메뉴 「📋 만든 수업」에서 다시 들어오기)')) await DS.Act.endClassAsk(code).catch(() => {});
    if (stop) stop(); stop = null; DS.Scene.clear(); location.replace(`${location.pathname}?${DS.Net.mode === 'local' ? 'local&' : ''}role=teacher`);
  }
  const back = () => enter({ code, hallKey, hall });
  return { enter, back, leave, hallGate, hallGo, hallMail, hallBar, code: () => code, hallMode: () => hall, open: () => !!(code && R && !DS.Raid.isClosed(R)) };
})();
