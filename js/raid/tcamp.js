// 🏛 교사 대기공간 (v0.9.1): 새 수업을 만들면 공동 던전 대기실이 아니라 여기서 시작한다 (배경 = 푸른 숲 성소, 사용자 제공)
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
  let code = '', hallKey = '', stop = null, R = null, L = null, picking = false, hall = false, wasLobby = null;
  // 선생님 모습이 수업 방에서 바뀌면(교사 메뉴 · 처음 불러올 때) 교사 캠프 용사도 바꾼다
  let shownHero = null;
  function tHero() { const h = DS.Art.teacherHero(R), el = document.querySelector('.tc-hero'); if (!el || h === shownHero) return; shownHero = h; const a = el.querySelector('.art'); if (a) a.outerHTML = DS.Art.hero(h, 'idle', 'huff'); }
  const ME = () => ({ c: '교사', n: 0, name: '선생님', hero: DS.Art.teacherHero(R), fx: DS.Art.teacherLook().fx, preview: true });
  const plate = () => `<div class="camp-plate"><span class="nm">${DS.Titles ? DS.Titles.nameHtml({ title: DS.Art.teacherLook().title, nick: '선생님' }, { num: false, size: 14 }) : '선생님'}</span></div>`;
  const maxNo = () => Math.max(0, ...DS.Lessons.list.map((l) => l.no || 0));
  const studentUrl = () => `${location.origin}${location.pathname.replace(/[^/]*$/, '')}index.html?role=student&code=${code}${DS.Net.mode === 'local' ? '&local' : ''}`;

  async function enter(o = {}) {
    if (DS.Sound && DS.Sound.bgm) DS.Sound.bgm(null); // 🎵 캠프로 오면 성채 · 허수아비 배경음 끔
    hall = !!o.hall;
    if (!hall && !(await DS.Account.isAdmin())) throw Object.assign(new Error('교사 계정으로 로그인해야 해요.'), { user: true });
    code = o.code || ''; hallKey = o.hallKey || ''; R = null; L = null; wasLobby = null; shownHero = null;
    DS.UI.show('screen-tcamp'); DS.UI.wake.on(); // 교사 캠프 · 종합상황실 캠프도 화면 켜 둠
    document.getElementById('screen-tcamp').classList.toggle('tc-hallmode', hall);
    if (!hall) DS.Scene.save({ role: 'tcamp', code, hallKey }); // 종합상황실 기기는 장면을 종합상황실로 둔다 (새로고침 → 종합상황실)
    // 🏛 교사 개인 캠프 (2026-11-05 사용자 「학생들과 똑같이 · 차시 전부 해금」): 학생 캠프 화면 그대로 · 체험 계정(기록 저장 안 함) · 모든 차시 · 성채 방 열림
    //   다른 점: 차원문 = 수업 진행(리모컨) / 새 수업 열기 · 우편함 = 📊 대시보드 · ⚙ = 선생님 모습 (종합상황실 캠프는 예전 그대로)
    if (!hall) { const tl = DS.Art.teacherLook(); return DS.Camp.enter({ c: '교사', n: 1, name: '선생님', hero: tl.hero, fx: tl.fx, title: tl.title || 'none', test: true, teacher: { code, hallKey } }); }
    render();
    if (stop) stop(); stop = null;
    if (code) stop = DS.Net.watch(`rooms/${code}`, (v) => { if (!v) return; R = DS.Act.unpackRoom(v); L = DS.Lessons.get(R.meta.lesson); drawLive(); autoHall(); tHero(); });
    if (hall) setTimeout(watchNext, 4000);
  }
  function render() {
    const base = DS.ASSETS.base, c = DS.ASSETS.camp;
    $('#tcamp').innerHTML = `${hall ? '' : '<button class="btn small ui-back" id="tc-back">≪ 교사 메뉴</button>'}<div class="tc-top" style="background-image:linear-gradient(#050b1cdd,#050b1cdd),url('${base}${DS.ASSETS.tcamp.bg}')">${code ? `<div class="tc-qr" id="tc-qr"></div><div class="tc-code"><span class="muted small">${hall ? '📱 휴대폰 카메라로 QR 을 찍고 입장해요' : '학생 입장 · QR 찍기 또는 모닥불 차원문'}</span><b>수업 코드 ${esc(code)}</b><span id="tc-info" class="small"></span></div>` : '<div class="tc-code"><b>🏛 교사 캠프</b><span class="muted small">수업을 열면 여기에 학생 입장 QR 이 크게 떠요</span></div>'}</div>
      <div class="tc-stage camp-like cs-v2" style="background-image:url('${base}${c.bg}');aspect-ratio:${c.size[0]} / ${c.size[1]}">
        ${DS.CampScene.layers()}
        ${DS.CampScene.zone('tc-castle', 'castle', '🏰 성채던전')}${DS.CampScene.zone('tc-tent', 'tent', '⛺ 텐트 · 책장')}
        <div class="camp-fire"><i class="camp-glow"></i><i class="camp-glow g2"></i><i class="camp-fire-img" style="background-image:url('${base}${c.fire.src}');background-size:${c.fire.cols * 100}% ${(c.fire.rows || 1) * 100}%;background-position:0 0"></i></div>
        ${prop('dummy', '🎯', '허수아비')}${prop('mail', '📮', hall ? '우편함' : '대시보드')}
        <button class="camp-anvil tc-anvil" id="tc-anvil" aria-label="모루"><i class="camp-anvil-img" style="background-image:url('${base}${c.anvil.src}');background-size:${c.anvil.cols * 100}% 100%;background-position:0 0"></i><span class="camp-label">⚒ 모루</span></button>
        <div class="tc-hero">${DS.Art.hero(DS.Art.teacherHero(R), 'idle', 'huff')}<i class="shadow"></i>${plate()}</div>
        <button class="btn small tc-set" id="tc-set">⚙ 설정</button>
        <button class="cs-zone camp-gate-z tc-gate" id="tc-gate" style="${DS.CampScene.box(c.zones.gate)}" aria-label="차시 던전"><span class="camp-label"></span></button>
      </div>
      <div class="tc-bar" id="tc-bar"></div>`;
    if (code && window.QRCode) { const q = $('#tc-qr'); q.innerHTML = ''; new QRCode(q, { text: studentUrl(), width: hall ? 380 : 320, height: hall ? 380 : 320, correctLevel: QRCode.CorrectLevel ? QRCode.CorrectLevel.M : undefined }); }
    // ⚙ 설정 (2026-11-04): 선생님 모습 · 이펙트 · 호칭 — 모두 열림. 수업 방이 있으면 그 방 선생님 용사 · 이펙트도 바로 바꿈
    $('#tc-set').onclick = () => DS.Control.run(() => DS.Camp.settings({ teacher: true, onSave: async (v) => {
      if (code) { await DS.Net.set(`rooms/${code}/state/tlook`, { hero: v.hero, fx: v.fx, at: DS.Net.TS }).catch(() => {}); } /* 2026-11-06: 종합상황실도 쓸 수 있는 칸 → 던전(수업 화면)에 바로 반영 */ if (code && R && R.meta && R.meta.teacher === DS.Net.uid()) { try { await DS.Net.update(`rooms/${code}/players/${R.meta.teacher}`, { hero: v.hero, fx: v.fx }); } catch (e) { /* 권한 없음 */ } } DS.UI.toast('선생님 모습을 바꿨어요 — 지금 수업 화면에도 바로 보여요');
      shownHero = null; tHero(); const p = document.querySelector('.tc-hero .camp-plate'); if (p) p.outerHTML = plate();
    } }));
    $('#tc-anvil').onclick = () => pick('#tc-anvil', () => DS.Forge.open(ME(), { preview: true, no: maxNo() }));
    $('#tc-castle').onclick = () => pick('#tc-castle', () => DS.Control.run(() => DS.Bonus.enter(ME(), { preview: true, no: maxNo() })));
    $('#tc-dummy').onclick = () => pick('#tc-dummy', () => DS.Control.run(() => DS.Bonus.enter(ME(), { preview: true, train: true, no: maxNo() })));
    $('#tc-tent').onclick = () => { const st = document.querySelector('#tcamp .tc-stage'); DS.CampScene.objOn(st, 'tent', true); pick('#tc-tent', () => { DS.Control.run(() => DS.Camp.shelf(maxNo())); setTimeout(() => DS.CampScene.objOn(st, 'tent', false), 1500); }); };
    // 📮 우편함 (2026-11-06 사용자 「화면 배치는 그대로 · 우편함이 오답노트라던지 기능은 학생과 똑같이」): 종합상황실 = 학생과 같은 📕 오답노트 창(예시 기록) — 기능 설명용
    //   🏫 우리 반 수업 소식은 아래 줄 「🏫 우리 반 소식」 버튼으로
    $('#tc-mail').onclick = () => pick('#tc-mail', () => DS.Control.run(async () => {
      if (!hall) return DS.Dash.enter();
      return DS.Camp.noteDemo({ go: (lid, mid) => DS.Control.run(() => DS.Bonus.enter(ME(), { preview: true, train: true, no: maxNo(), go: [lid, mid] })), train: () => DS.Control.run(() => DS.Bonus.enter(ME(), { preview: true, train: true, no: maxNo() })) });
    }));
    fire();
    $('#tc-gate').onclick = () => {
      if (!code) return pick('#tc-gate', () => leave());
      if (hall) return pick('#tc-gate', toHall);
      pick('#tc-gate', () => DS.Control.run(() => DS.Teacher.open(code, hallKey)));
    };
    document.querySelectorAll('#tcamp .camp-prop, #tcamp .camp-anvil').forEach((e) => e.classList.add('cs-int'));
    drawLive();
    DS.CampScene.intro(document.querySelector('#tcamp .tc-stage'));
  }
  // 성벽 등불 = 우리 반 진행도: 열린 층(unlock) 켜짐 · 학생 절반 이상이 인장을 얻은 층은 금빛 (교사 폰만 · 종합상황실은 켜짐까지)
  let lampCls = '';
  async function drawLamps() {
    const cls = R && R.meta && R.meta.cls; if (!cls || cls === lampCls) return; lampCls = cls;
    const k = String(cls).replace(/[.#$/[\]]/g, '_'), no = Number(await DS.Net.get(`unlock/${k}`).catch(() => 0)) || 0;
    let sealed = [];
    if (!hall) {
      const all = (await DS.Net.get(`bonus/${k}`).catch(() => null)) || {}, studs = Object.values(all), cnt = {};
      studs.forEach((b) => DS.Bonus.seals(b || {}).forEach((id) => { cnt[id] = (cnt[id] || 0) + 1; }));
      const n = Object.keys((await DS.Net.get(`roster/${k}`).catch(() => null)) || {}).length || studs.length;
      sealed = Object.keys(cnt).filter((id) => n && cnt[id] * 2 >= n);
    }
    const stage = document.querySelector('#tcamp .tc-stage');
    DS.CampScene.flag(stage, ''); // 2026-11-05: 성채 꼭대기 층 「열기」 없앰 (방은 진도로 저절로)
  }
  function drawLive() {
    const g = $('#tc-gate'); if (!g) return;
    const closed = R && DS.Raid.isClosed(R), theme = L ? L.theme : '';
    const lb = g.querySelector('.camp-label'), on = !!(code && !closed && theme);
    DS.CampScene.gate(document.querySelector('#tcamp .tc-stage'), on); g.classList.toggle('open', on);
    if (lb) lb.innerHTML = !code ? '⚔ 새 수업 열기 (교사 메뉴)' : !theme ? '⚔ 던전 불러오는 중…' : closed ? `🔒 수업 끝 · ${hall ? '종합상황실로' : '교사 화면 보기'}` : `⚔ ${L && L.no ? `${L.no}차시 ` : ''}${hall ? (R && DS.Raid.isLobby(R) ? '던전 입장' : '수업 중 · 종합상황실로') : '수업 진행'}`;
    drawLamps();
    const info = $('#tc-info');
    if (info && R) { const studs = Object.values(R.players || {}).filter((p) => !p.teacher).length; info.innerHTML = `${R.meta.cls ? `${esc(R.meta.cls)}반 · ` : ''}${L ? esc(L.title) : ''} · <b class="gold">입장 ${studs}명</b>${DS.Raid.isLobby(R) ? ' · 대기 중' : closed ? ' · 끝' : ' · 진행 중'}`; }
    const bar = $('#tc-bar');
    if (bar) {
      bar.innerHTML = `${hall ? `<button class="btn small" id="tc-menu">🖥 종합상황실로</button>${DS.UI.fs.btn('tc-fs')}` : `${code ? `<button class="btn small" id="tc-hall">🖥 종합상황실 키 ${esc(hallKey || '—')}</button>` : ''}`}${DS.ShareCard.klassReady(L, R) ? '<button class="btn small sc-btn" id="tc-news">🏫 학급 결과</button>' : ''}${DS.ShareCard.klassReady(L, R) && DS.Punch && R.meta.cls && L.no && !L.eval && !DS.Act.punchOff(R) ? '<button class="btn small" id="tc-punch">🏁 반대항</button>' : ''}`;
      const tm = $('#tc-menu'); if (tm) tm.onclick = leave; DS.UI.fs.bind('tc-fs'); const tb = $('#tc-back'); if (tb) tb.onclick = leave; // 2026-11-04: 「≪ 교사 메뉴」는 다른 화면처럼 왼쪽 위
      const hb = $('#tc-hall'); if (hb) hb.onclick = () => DS.UI.toast(`종합상황실(교실 PC)에서 수업 코드 ${code} · 키 ${hallKey} 를 넣어요`, 4000);
      const nb = $('#tc-news'); if (nb) nb.onclick = () => DS.Control.run(() => DS.ShareCard.klassOpen(L, R, { praise: !hall }));
      const pb = $('#tc-punch'); if (pb) pb.onclick = () => DS.Control.run(() => DS.Punch.open(L, R, { big: !!hall }));
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
  // 🖥 종합상황실 캠프: 수업이 끝난 뒤 다음 수업이 열리면 저절로 그 수업으로 (같은 비밀번호면 입력 없이 · 2026-11-05 사용자)
  let nextT = null, nextTried = '';
  async function watchNext() {
    clearTimeout(nextT); if (!hall || !document.getElementById('screen-tcamp').classList.contains('active')) return;
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
  // 캠프 소품 (학생 캠프와 같은 그림 · 이모지 팻말 대신)
  function prop(id, icon, label) {
    const p = ((DS.ASSETS.camp.props || {})[id]) || '', src = typeof p === 'string' ? p : p.src, two = typeof p === 'object' && p.cols === 2;
    return `<button class="camp-prop" id="tc-${id}" aria-label="${label}">${src ? `<i class="camp-prop-img${two ? ' two' : ''}" style="background-image:url('${DS.ASSETS.base}${src}')"></i>` : `<i class="camp-prop-ic">${icon}</i>`}<span class="camp-label">${icon} ${label}</span></button>`;
  }
  // 🔥 모닥불 불꽃 (학생 캠프와 같은 프레임)
  let fireT = null;
  function fire() {
    clearInterval(fireT);
    const f = DS.ASSETS.camp.fire; let i = 0;
    fireT = setInterval(() => {
      const el = document.querySelector('#tcamp .camp-fire-img');
      if (!el || !document.getElementById('screen-tcamp').classList.contains('active')) { clearInterval(fireT); return; }
      i = (i + 1) % f.frames;
      el.style.backgroundPosition = `${((i % f.cols) / Math.max(1, f.cols - 1)) * 100}% ${((Math.floor(i / f.cols)) / Math.max(1, (f.rows || 1) - 1)) * 100}%`;
    }, f.ms);
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
