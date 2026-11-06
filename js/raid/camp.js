// 모닥불 (학생 개인 대기실 · 혼자만의 공간): 로그인하면 여기로 온다.
// v2 (2026-11-03 사용자 확정): 달빛 숲 야영지 + 먼 성채 (DS.CampScene) · 🏰 성채 = 중단원던전 · ⛺ 텐트 = 책장 · ⚔ 아치 문 = 차시 던전
//   이름표(Lv · 호칭 · 이름)는 용사 밑 · 아래 칸 = 📊 용사 상태창 (능력치 6 · 장착 · 수집 · 다음 보상) · 글씨 없는 오브젝트(누르면 이름표)
// 왼쪽 ⚒ 모루 → 연성창 (수업 코드 없이 언제나) · 가운데 🔥 모닥불 + 내 용사(씩씩) · 오른쪽 🌀 차원문
// 차원문: 선생님이 우리 반 수업을 열면 그 차시 던전 테마의 포털이 실시간으로 나타난다(live/{반}) → 누르면 코드 없이 입장.
//         수업이 끝나면 마지막 포털이 꺼진(봉쇄) 채로 남는다. ⚙ 설정: 용사 · 공격 이펙트 바꾸기 (잠긴 것은 조건 표시)
window.DS = window.DS || {};

DS.Camp = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  const C = () => DS.ASSETS.camp, base = () => DS.ASSETS.base;
  let slotTick = 0;
  let me = null, fireT = 0, code0 = '', live = null, liveStop = null, liveSeen = '', roomSt = null, roomStop = null, roomCode = '';
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const today = () => new Date().toISOString().slice(0, 10);
  const stampToday = () => { try { return localStorage.getItem('citadel-stamp') === today(); } catch (e) { return false; } };

  async function enter(m, code) {
    if (DS.Sound && DS.Sound.bgm) DS.Sound.bgm(null); // 🎵 캠프로 오면 성채 · 허수아비 배경음 끔
    if (m && DS.Usage) DS.Usage.visit(m); // 📈 하루 첫 접속 (2026-11-06)
    if (m && DS.Gem && DS.Gem.watchGifts) DS.Gem.watchGifts(m); // 🎁 선물 알림 = 어디서나 (2026-11-06 · gem.js watchGifts)
    me = m; code0 = code || '';
    DS.UI.show('screen-camp');
    if (!m.test) DS.Scene.save({ role: 'camp' });
    render();
    tut = null; tutLoad().then(tutApply);
    if (liveStop) liveStop();
    // 📅 v0.9.7.0: 교사가 바로 연 수업(live/{반}) + 시간표 예약 수업(slots/{반}, 시각 안이면 열림) → 바로 연 것이 먼저
    let manual = null, slotsV = null;
    const pick = () => { const now = DS.Net.now(), mv = manual && manual.open && DS.Raid.liveOpen(manual, Date.now()) ? manual : null; return mv || (DS.Sched && DS.Sched.active(slotsV, now)) || (manual ? Object.assign({}, manual, { open: false }) : null); };
    const stopLive = DS.Net.watch(`live/${ck(m.c)}`, (v) => { manual = v; onLive(); });
    const stopSlots = DS.Net.watch(`slots/${ck(m.c)}`, (v) => { slotsV = v; onLive(); });
    clearInterval(slotTick); slotTick = setInterval(() => { const a = pick(), b = live; if (!!(a && a.open) !== !!(b && b.open) || (a && b && a.code !== b.code)) onLive(); }, 15000);
    liveStop = () => { stopLive(); stopSlots(); clearInterval(slotTick); };
    function onLive() {
      const v = pick();
      const was = live; live = v;
      if (!document.getElementById('screen-camp').classList.contains('active')) return;
      watchRoom(); drawGate(); tutApply();
      if (live && live.open && (!was || !was.open || was.code !== live.code) && liveSeen !== live.code) { liveSeen = live.code; showGate(); status(); DS.Sound.correct(); DS.UI.toast(`⚔ ${live.no ? `${live.no}차시 ` : ''}던전이 열렸어요! 오른쪽 빛나는 문을 눌러 들어가요`, 4200); }
    }
    if (DS.Survey && !m.test) DS.Survey.watch(m, () => svDraw());
    if (riftStop) riftStop(); riftStop = m.test ? null : DS.Net.watch(`rift/${ck(m.c)}`, (v) => { const had = !!riftNow(); rifts = v || {}; if (document.getElementById('camp-gate')) drawGate(); if (!had && riftNow() && !(live && live.open)) DS.UI.toast(`⏳ ${riftNow().no}차시 이어하기 포털이 열렸어요! 오른쪽 문에서 남은 문제를 마저 해요`, 4200); });
    if (code0) setTimeout(codeGate, 300); // QR 로 들어왔으면 코드 창을 바로
  }
  const D = () => DS.ASSETS.dungeons;
  // 📝 수업 설문 (v0.9.8.2): 선생님이 우리 반 설문을 열었고 아직 안 했으면 아래 칸에 버튼 (수업 대기실에서 못 한 학생도 여기서)
  function svDraw() {
    const z = document.getElementById('camp-sv'); if (!z || !DS.Survey || !me || me.test) return;
    z.innerHTML = DS.Survey.btnHtml('camp-sv-btn');
    const b = document.getElementById('camp-sv-btn'); if (b) b.onclick = () => DS.Survey.open(me, svDraw);
  }
  // 한 화면에 전체가 보이므로 차원문이 열리면 반짝 강조만
  // ⏳ 이어하기 (2026-11-05): rift/{반}/{차시} = { code, lesson, no, until } — 기한 안 · 아직 완주 안 한 것 중 가장 최근
  let rifts = null, riftStop = null;
  const riftNow = () => { const now = Date.now(); const list = Object.values(rifts || {}).filter((r) => r && r.until > now && !((r.done || {})[me && me.n])); return list.sort((a, b) => (b.at || 0) - (a.at || 0))[0] || null; };
  function showGate() { const g = document.getElementById('camp-gate'); if (g) { g.classList.remove('flash'); void g.offsetWidth; g.classList.add('flash'); } }
  // ── 🧭 첫 수업 튜토리얼 (2026-11-03 사용자 확정) ──────────────────────
  //   A 입장: 튜토리얼을 본 적 없고 (수업 중이거나 수업 기록이 아직 없는) 학생 → 모루 · 보강던전 · 소품을 숨기고 차시 던전만, 들어가는 법 안내
  //   B 캠프 안내: A 를 본 뒤 수업이 끝나고 캠프에 오면 → 보강던전 · 허수아비 · 책장 · 우편함 · 모루를 하나씩 보여 주며 역할 설명
  //   반마다 첫 수업 날이 달라도, 가입만 하고 못 본 학생도 각자 한 번씩. 본 기록 = xp/{반}/{번호}/tut { a, b } (+ 이 기기 localStorage)
  let tut = null, tutRecs = null, tutMode = '', tutStep = 0;
  const tutPath = () => `xp/${ck(me.c)}/${me.n}/tut`, tutKey = () => `citadel-tut-${ck(me.c)}-${me.n}`;
  async function tutLoad() {
    if (me.test) { tut = { a: true, b: true }; return; }
    let local = {}; try { local = JSON.parse(localStorage.getItem(tutKey()) || '{}'); } catch (e) { /* 무시 */ }
    tut = Object.assign({}, local, (await DS.Net.get(tutPath()).catch(() => null)) || {});
    if (!tut.a) tutRecs = await DS.Net.get(`records/${ck(me.c)}/${me.n}`).catch(() => null);
  }
  function tutMark(k) {
    tut = Object.assign({}, tut, { [k]: true });
    DS.Net.update(tutPath(), { [k]: true }).catch(() => {});
    try { localStorage.setItem(tutKey(), JSON.stringify(tut)); } catch (e) { /* 무시 */ }
  }
  function tutDecide() {
    if (!tut) return '';
    if (!tut.a) { if (inClass() || !tutRecs || !Object.keys(tutRecs).length) return 'A'; tutMark('a'); } // 이미 수업을 해 본 학생은 입장 안내를 건너뛰고 캠프 안내로
    return !tut.b && !inClass() ? 'B' : '';
  }
  const TUT_B = [
    ['#camp-castle', '🏰 성채던전', '교과서 <b>단원 평가 문제</b>가 방마다 몬스터 한 마리씩 기다려요. 그 차시 진도를 나가면 방이 열리고(🆕 파란 배지), 👑 보스 방은 열린 방의 60%를 처치하면 열려요!'],
    ['#camp-dummy', '🎯 복습 허수아비', '배운 차시를 <b>복습</b>해요. 수업 문제를 숫자만 바꿔 다시 풀고, 틀림 · 안 푼 문제를 맞히면 📕 오답노트에 복습 완료! 👑 형성평가 재대결을 처치하면 🟪 인장.'],
    ['#camp-tent', '⛺ 텐트 · 책장', '텐트 안 책장에서 차시별 🎬 <b>개념 영상</b>과 📄 <b>학습지 개념</b>을 다시 볼 수 있어요.'],
    ['#camp-mail', '📮 우편함', '내 <b>수업 결과</b>와 <b>복습 노트</b>가 도착해요. 틀린 문제를 다시 확인해요.'],
    ['#camp-anvil', '⚒ 모루', '수업에서 배운 개념으로 <b>카드를 만드는 대장간</b>이에요. 수업이 없을 때 여기서만 열려요.'],
  ];
  function tutClear() {
    tutMode = ''; const stg = document.querySelector('#camp .camp-stage'); const co = document.getElementById('tut-coach'); if (co) co.remove();
    document.getElementById('camp').classList.remove('tut-a');
    if (stg) { stg.classList.remove('tut-a', 'tut-b'); stg.querySelectorAll('.tut-spot, .tut-hide').forEach((e) => e.classList.remove('tut-spot', 'tut-hide')); }
  }
  function tutApply() {
    const stg = document.querySelector('#camp .camp-stage'); if (!stg || !document.getElementById('screen-camp').classList.contains('active')) return;
    const mode = tutDecide();
    if (mode !== tutMode) { tutClear(); tutMode = mode; tutStep = 0; }
    if (!mode) return;
    let co = document.getElementById('tut-coach');
    if (!co) { co = document.createElement('div'); co.id = 'tut-coach'; co.className = 'tut-coach'; stg.appendChild(co); }
    const gate = document.getElementById('camp-gate');
    if (mode === 'A') {
      document.getElementById('camp').classList.add('tut-a'); stg.classList.add('tut-a'); co.classList.remove('block');
      if (gate) gate.classList.toggle('tut-spot', inClass());
      co.innerHTML = inClass()
        ? `<div class="tut-box"><p>⚔ <b>${live.no ? `${live.no}차시 ` : ''}던전이 열렸어요!</b><br>오른쪽에 빛나는 <b>아치 문을 눌러</b> 입장해요. 친구들과 함께 몬스터를 물리쳐요! 👉</p></div>`
        : '<div class="tut-box"><p>👋 <b>환영해요, 용사님!</b> 여기는 나만의 <b>모닥불(개인 캠프)</b>이에요.<br>선생님이 수업을 열면 오른쪽 <b>아치 문</b>에 빛이 들어와요. 잠깐 기다려요!</p></div>';
      return;
    }
    // B: 하나씩 나타나며 설명 (아직 소개 안 한 것은 숨김)
    stg.classList.add('tut-b'); co.classList.add('block');
    TUT_B.forEach(([sel], i) => { const e = stg.querySelector(sel); if (e) { e.classList.toggle('tut-hide', i > tutStep); e.classList.toggle('tut-spot', i === tutStep); } });
    const [, h, body] = TUT_B[tutStep], last = tutStep === TUT_B.length - 1;
    co.innerHTML = `<div class="tut-box"><p><b>${h}</b> <span class="tut-n">${tutStep + 1} / ${TUT_B.length}</span><br>${body}</p><button class="btn primary small" id="tut-next">${last ? '시작하기!' : '다음 ▶'}</button></div>`;
    co.querySelector('#tut-next').onclick = () => {
      DS.Sound.clank();
      if (!last) { tutStep++; tutApply(); return; }
      tutMark('b'); tutClear(); DS.UI.toast('🔥 이제 자유롭게 둘러봐요! 다음 수업 때 🌀 차시 던전이 다시 열려요.', 3200);
    };
  }

  // 수업 중(차시 던전 열림)에는 보강던전 · 허수아비 · 모루를 회색으로 (누르면 안내만)
  const inClass = () => DS.Raid.inClass(live, roomSt, Date.now());
  // 그 수업 방의 진행 상태를 지켜본다: 마무리 · 끝 단계가 되면 바로 보강던전 · 허수아비 · 모루가 풀린다
  function watchRoom() {
    const c = live && live.open ? live.code : '';
    if (c === roomCode) return;
    if (roomStop) roomStop(); roomStop = null; roomSt = null; roomCode = c;
    if (c) roomStop = DS.Net.watch(`rooms/${c}/state`, (st) => { roomSt = st || null; if (document.getElementById('screen-camp').classList.contains('active')) { drawGate(); tutApply(); } });
  }
  function lockSide() {
    // 2026-11-03 사용자 결정: 수업 중 잠금 없앰 — 보강던전 · 허수아비 · 모루는 언제나 열림 (차시 던전 차원문은 따로 빛남)
  }
  // ⚔ 차시 던전 = 오른쪽 아치 문 하나 (2026-11-03 사용자 확정): 수업이 열리면 문 빛 겹이 켜지고, 닫히면 꺼짐 · 이름표는 늘 보임
  function drawGate() {
    lockSide();
    const el = document.getElementById('camp-gate'); if (!el) return;
    const on = !!(live && live.open), i = live && live.theme ? D().ids.indexOf(live.theme) : -1, name = i >= 0 ? D().names[i] : '던전';
    const rf = !on ? riftNow() : null; // ⏳ 이어하기 포털 (수업이 열려 있으면 수업이 먼저)
    DS.CampScene.gate(document.querySelector('#camp .camp-stage'), on || !!rf);
    el.classList.toggle('open', on); el.classList.toggle('rift', !!rf); document.querySelector('#camp .camp-stage').classList.toggle('gate-rift', !!rf);
    const lb = el.querySelector('.camp-label');
    if (me && me.teacher) { const t = me.teacher; DS.CampScene.gate(document.querySelector('#camp .camp-stage'), !!t.code); el.classList.toggle('open', !!t.code); if (lb) lb.innerHTML = t.code ? '⚔ 수업 진행 · 리모컨' : '⚔ 새 수업 열기 (교사 메뉴)'; return; } // 🏛 교사 개인 캠프 (2026-11-05)
    if (lb) lb.innerHTML = on ? `⚔ ${live.no ? `${live.no}차시 ` : ''}입장!` : rf ? `⏳ ${rf.no}차시 이어하기 D-${Math.max(1, Math.ceil((rf.until - Date.now()) / 86400e3))}` : '🔒 차시 던전'; el.setAttribute('aria-label', on ? `${live.no ? `${live.no}차시 ` : ''}${name} 입장` : rf ? `${rf.no}차시 이어하기` : '차시 던전 (닫힘)');
  }
  // 그림 칸 하나 (배치표 시트에서 열·행)
  const sheet = (s, col, row, cls, style = '') => `<i class="${cls}" style="background-image:url('${base()}${s.src}');background-size:${s.cols * 100}% ${(s.rows || 1) * 100}%;background-position:${s.cols > 1 ? (col / (s.cols - 1)) * 100 : 0}% ${(s.rows || 1) > 1 ? (row / (s.rows - 1)) * 100 : 0}%;${style}"></i>`;
  function tree(i, cls, style) {
    const t = C().trees, x0 = t.cuts[i] / t.base, x1 = t.cuts[i + 1] / t.base, w = x1 - x0;
    return `<i class="camp-tree ${cls}" style="background-image:url('${base()}${t.src}');background-size:${100 / w}% 100%;background-position:${(x0 / (1 - w)) * 100}% 0;aspect-ratio:${(w * 1038) / 378};${style}"></i>`;
  }
  function render() {
    const c = C(), S = DS.CampScene;
    $('#camp').innerHTML = `<div class="camp-top"><button class="btn small camp-set" id="camp-set">⚙ 설정</button></div>
      ${stampToday() ? '<div class="stamp-bar">📮 반드시 학습지 확인도장 받아가세요.</div>' : ''}
      <div class="camp-stage cs-v2" style="background-image:url('${base()}${c.bg}');aspect-ratio:${c.size[0]} / ${c.size[1]}">
        ${S.layers()}
        ${S.zone('camp-castle', 'castle', '🏰 성채던전')}${S.zone('camp-tent', 'tent', '⛺ 텐트 · 책장')}
        <button class="cs-zone camp-gate-z" id="camp-gate" style="${S.box(c.zones.gate)}" aria-label="차시 던전"><span class="camp-label">🔒 차시 던전</span></button>
        <button class="camp-anvil cs-int" id="camp-anvil" aria-label="모루">${sheet(c.anvil, c.anvil.states.idle, 0, 'camp-anvil-img')}<span class="camp-label">⚒ 모루</span></button>
        <div class="camp-fire"><i class="camp-glow"></i><i class="camp-glow g2"></i>${sheet(c.fire, 0, 0, 'camp-fire-img', '')}</div>
        <div class="camp-hero">${DS.Art.hero(me.hero, 'sit', 'huff')}<i class="shadow"></i><div class="camp-plate"><span class="nm">${DS.Titles ? DS.Titles.nameHtml({ title: me.title || 'none', nick: me.name }, { num: false, size: 14 }) : esc(me.name)}</span></div></div>
        ${prop('dummy', '🎯', '복습 허수아비', '')}${prop('mail', '📮', '우편함', '')}
      </div>
      <div class="camp-bar"><span id="camp-sv"></span><button class="btn small" id="camp-fb">💬 의견 보내기</button><button class="btn small" id="camp-code">코드로 입장</button></div>
      <div class="camp-forge panel framed st-panel" id="camp-forge"><p class="muted small">용사 상태를 불러오는 중…</p></div>`;
    status();
    $('#camp-anvil').onclick = () => pick('#camp-anvil', () => (me.test ? DS.Forge.open(me, { preview: true, no: 99 }) : DS.Forge.open(me))); // 🧪 체험판: 모든 레시피
    $('#camp-castle').onclick = () => pick('#camp-castle', () => DS.Control.run(() => DS.Bonus.enter(me)));
    $('#camp-gate').onclick = () => {
      if (me.teacher) { const t = me.teacher; return pick('#camp-gate', () => DS.Control.run(() => (t.code ? DS.Teacher.open(t.code, t.hallKey) : location.replace(`${location.pathname}?${DS.Net.mode === 'local' ? 'local&' : ''}role=teacher`))), 'portal'); }
      const rf = !(live && live.open) ? riftNow() : null;
      if (rf) return pick('#camp-gate', () => DS.Control.run(() => DS.Bonus.enter(me, { train: true, rift: rf })), 'portal');
      if (live && live.open) { if (tutMode === 'A') { tutMark('a'); tutClear(); } return pick('#camp-gate', () => DS.Control.run(() => enterCode(live.code)), 'portal'); }
      nope('#camp-gate');
      if (live) DS.UI.toast('지난 던전은 닫혔어요. 선생님이 다음 수업을 열면 문에 다시 빛이 들어와요.', 3200);
      else DS.UI.toast('아직 열린 던전이 없어요. 선생님이 수업을 열면 오른쪽 문에 빛이 들어와요.', 3200);
    };
    // v0.9.7.0: 이름표의 Lv 는 뺌 (사용자 — 캠프에서 이질적). 레벨은 아래 상태창에만
    newTitles();
    $('#camp-code').onclick = codeGate;
    { const fb = $('#camp-fb'); if (fb) { if (me.teacher || me.test) fb.hidden = true; else fb.onclick = () => DS.Feedback.open({ c: me.c, n: me.n, name: me.name }, { where: 'camp' }); } } // 💬 2026-11-06
    $('#camp-mail').onclick = () => pick('#camp-mail', () => { if (me.teacher) return DS.Control.run(() => DS.Dash.enter()); if (cues.mark) cues.mark('mail'); DS.Control.run(note); }); // 교사 = 📊 학급 대시보드
    $('#camp-tent').onclick = () => (DS.CampScene.objOn(document.querySelector('#camp .camp-stage'), 'tent', true), pick('#camp-tent', () => { if (cues.mark) cues.mark('tent'); DS.Control.run(shelf); setTimeout(() => DS.CampScene.objOn(document.querySelector('#camp .camp-stage'), 'tent', false), 1500); }));
    $('#camp-dummy').onclick = () => pick('#camp-dummy', () => DS.Control.run(() => DS.Bonus.enter(me, { train: true })));
    $('#camp-set').onclick = () => (me.teacher ? settings({ teacher: true, onSave: async (v) => { me.hero = v.hero; me.fx = v.fx; me.title = v.title; const t = me.teacher; if (t.code) { try { await DS.Net.set(`rooms/${t.code}/state/tlook`, { hero: v.hero, fx: v.fx, at: DS.Net.TS }).catch(() => {}); /* 2026-11-06: 종합상황실도 쓸 수 있는 칸 → 수업 화면이 이 모습을 먼저 씀 */ const R0 = await DS.Net.get(`rooms/${t.code}/meta`); if (R0 && R0.teacher === DS.Net.uid()) await DS.Net.update(`rooms/${t.code}/players/${R0.teacher}`, { hero: v.hero, fx: v.fx }); } catch (e) { /* 다음 수업부터 */ } } render(); drawGate(); } }) : settings());
    if (me.teacher) { const cb = $('#camp-code'); if (cb) cb.hidden = true; }
    drawGate();
    animateFire();
    document.querySelectorAll('#camp .camp-prop').forEach((e) => e.classList.add('cs-int'));
    svDraw();
    DS.CampScene.intro(document.querySelector('#camp .camp-stage')); // 글씨 대신: 들어올 때 차례로 한 번 반짝
  }
  // 선택 연출 (한 번 탭 · 0.7초): 흰 테두리 번쩍 + 눌림 반동 + 소리·진동 → 금빛 외곽선 + ▼ → 내 용사가 그쪽으로 폴짝 → 열림
  let picking = false;
  // pose: 그쪽으로 가는 동안의 용사 동작 (기본 걷기 · 차원문 = 뒷모습으로 들어가기 → 작아지며 사라짐)
  const heroArt = (pose, cls = '') => { const a = document.querySelector('.camp-hero .art'); if (a) a.outerHTML = DS.Art.hero(me.hero, pose, cls); };
  function pick(sel, then, pose = 'walk') {
    const el = document.querySelector(sel); if (!el || picking) return;
    picking = true;
    el.classList.remove('picked'); void el.offsetWidth; el.classList.add('picked');
    DS.Sound.clank(); if (navigator.vibrate) navigator.vibrate(25);
    const hero = document.querySelector('.camp-hero');
    if (hero) {
      const a = el.getBoundingClientRect(), b = hero.getBoundingClientRect();
      const dx = (a.left + a.width / 2) - (b.left + b.width / 2);
      heroArt(pose);
      if (pose === 'portal') {
        // 차원문: 용사 몸 가운데가 포털 그림 정중앙에 닿을 때까지 걸어가며 작아지고 사라짐
        const pe = el.querySelector('.camp-portal') || el, p = pe.getBoundingClientRect(), h = hero.querySelector('.art').getBoundingClientRect();
        hero.style.setProperty('--px', `${p.left + p.width / 2 - (h.left + h.width / 2)}px`);
        hero.style.setProperty('--py', `${p.top + p.height / 2 - (h.top + h.height / 2)}px`);
        hero.classList.remove('face-left'); hero.classList.add('to-portal');
      } else {
        hero.style.setProperty('--dx', `${Math.max(-1, Math.min(1, dx / Math.abs(dx || 1))) * Math.min(Math.abs(dx) * 0.55, 160)}px`);
        hero.classList.remove('dash'); void hero.offsetWidth; hero.classList.add('dash');
        hero.classList.toggle('face-left', dx < 0);
      }
    }
    const wait = pose === 'portal' ? 1150 : 700; // 차원문: 정중앙까지 걸어 들어가 사라지는 걸 다 보고
    setTimeout(() => { picking = false; then(); }, wait);
    setTimeout(() => { el.classList.remove('picked'); if (hero) { hero.classList.remove('dash', 'to-portal'); heroArt('sit', 'huff'); } }, 1300 + wait - 700);
  }
  // 못 들어가는 곳: 회색으로 살짝 흔들림
  function nope(sel) { const el = document.querySelector(sel); if (!el) return; el.classList.remove('nope'); void el.offsetWidth; el.classList.add('nope'); DS.Sound.squish(); }
  // 📊 용사 상태창 (2026-11-03 사용자 확정): 정답률 · 점수 · 순위 없음 — 쌓이기만 하는 누적 횟수 (본인 폰만)
  //   ⚔ 힘 = 레이드 첫 시도 + 형성평가에서 맞힌 소문제 · 🛡 끈기 = 재도전으로 고친 수 · 🎯 집중 = PERFECT · 👑 용기 = 보스 격파 함께
  //   🧭 탐험 = 중단원던전 도전 · ⚒ 연성 = 도감 카드 · ★ 5단계는 능력치마다 학기 안에 닿을 만한 기준
  const STATS = [
    ['str', '⚔', '힘', [10, 30, 60, 120, 200]], ['grit', '🛡', '끈기', [3, 8, 15, 30, 50]], ['focus', '🎯', '집중', [1, 3, 6, 10, 15]],
    ['brave', '👑', '용기', [1, 3, 6, 10, 15]], ['explore', '🧭', '탐험', [3, 10, 20, 40, 70]], ['craft', '⚒', '연성', [3, 10, 20, 35, 54]],
  ];
  function statsOf(rec, bonus, cards) {
    const R = Object.values(rec || {}), n = (v) => Number(v) || 0;
    const tries = Object.values(bonus || {}).reduce((a, l) => a + Object.values(l || {}).reduce((b, m) => b + n((m || {}).tries), 0), 0);
    return {
      str: R.reduce((a, r) => a + Object.values(r.conc || {}).reduce((b, v) => b + n((v || [])[0]), 0) + n(r.boss), 0),
      grit: R.reduce((a, r) => a + n(r.fixed), 0), focus: R.reduce((a, r) => a + n(r.perfects), 0), brave: R.filter((r) => r.won).length,
      explore: tries, craft: Object.keys(cards || {}).length,
    };
  }
  const stars = (v, t) => { const k = t.filter((x) => v >= x).length; return `${'★'.repeat(k)}<s>${'★'.repeat(5 - k)}</s>`; };
  // 🎁 다음 보상: 가장 가까운 하나 (용사 해금 · 화려한 이펙트)
  function nextReward(L, owned, seals) {
    const cand = [], U = DS.Unit ? DS.Unit.CARDS : [], range = (a, b) => U.filter((c) => c.no >= a && c.no <= b), hasN = (arr) => arr.filter((c) => owned[c.id]).length;
    const hn = (id) => ((DS.ASSETS.heroesV2.list[id] || {}).name || '용사');
    const lock = (id) => !((L.heroes || []).find((h) => h.id === id) || {}).open;
    if (lock(16)) cand.push([3 - seals, `인장 ${3 - seals}개 더 모으면 <b class="gold">${hn(16)}</b> 해금!`]);
    const need3 = U.filter((c) => c.no <= 3 && c.id !== 'subcount'); if (lock(8) && need3.length) cand.push([need3.length - hasN(need3), `1~3차시 도감 ${need3.length - hasN(need3)}장 더 → <b class="gold">${hn(8)}</b> 해금!`]);
    const r46 = range(4, 6); if (lock(10) && r46.length) cand.push([r46.length - hasN(r46), `4~6차시 도감 ${r46.length - hasN(r46)}장 더 → <b class="gold">${hn(10)}</b> 해금!`]);
    const ui = DS.Bonus ? DS.Bonus.UNLOCK.findIndex((u) => seals < u) : -1;
    if (ui >= 0) cand.push([DS.Bonus.UNLOCK[ui] - seals, `인장 ${DS.Bonus.UNLOCK[ui] - seals}개 더 → ✨ <b class="gold">${esc(DS.FX.NAMES[DS.FX.FANCY[ui]])}</b> 이펙트!`]);
    const c = cand.filter((x) => x[0] > 0).sort((a, b) => a[0] - b[0])[0];
    return c ? c[1] : '모든 보상을 모았어요! 🎉';
  }
  async function status() {
    const el = document.getElementById('camp-forge'); if (!el) return;
    const k = ck(me.c), get = (p) => DS.Net.get(`${p}/${k}/${me.n}`).catch(() => null);
    const [rec, bonus, cards, no] = await Promise.all([get('records'), get('bonus'), get('cards'), DS.Net.get(`unlock/${k}`).catch(() => 0)]);
    const L = DS.Account ? await DS.Account.looks(me).catch(() => ({ heroes: [], seals: 0 })) : { heroes: [], seals: 0 };
    const g = DS.Grow ? await DS.Grow.mine(me).catch(() => null) : null;
    const TD = DS.Titles ? await DS.Titles.data(me).catch(() => ({})) : {}, earned = DS.Titles ? DS.Titles.earned(TD).filter((t) => !/^lv\d/.test(t.id)) : [];
    if (!document.getElementById('camp-forge')) return;
    const st = statsOf(rec, bonus, cards), owned = cards || {}, sealed = DS.Bonus ? DS.Bonus.seals(bonus || {}) : [], seals = sealed.length;
    const sealMax = DS.Lessons.list.filter((l) => (l.no && l.boss && !l.eval) || l.eval).length, U = DS.Unit ? DS.Unit.CARDS.length : 0;
    const heroOpen = (L.heroes || []).filter((h) => h.open).length, heroAll = (L.heroes || []).length;
    const t = me.title && me.title !== 'none' && DS.Titles ? DS.Titles.get(me.title) : null;
    el.innerHTML = `<div class="st-head"><span class="lvb">Lv.${g ? g.lv : '-'}</span><span class="ttl">${g ? esc(g.title) : ''}</span><div class="st-exp"><i style="width:${g ? Math.round((100 * g.into) / g.next) : 0}%"></i><b>EXP ${g ? `${g.into} / ${g.next}` : '-'}</b></div></div>
      <div class="st-grid">${STATS.map(([id, ic, nm, th]) => `<div class="st-row" title="${nm}"><span class="nm">${ic} ${nm}</span><span class="stars">${stars(st[id], th)}</span><span class="v">${st[id]}</span></div>`).join('')}</div>
      <div class="st-gear"><button data-gear="hero"><span class="gi">${DS.Art.hero(me.hero, 'idle')}</span>${esc(((DS.ASSETS.heroesV2.list[me.hero] || {}).name) || '용사')}</button><button data-gear="fx"><span class="gi">✨</span>${esc((DS.FX.NAMES || {})[me.fx || 'flame'] || '이펙트')}</button><button data-gear="title"><span class="gi">${t ? DS.Titles.medal(t, 24) : '🏅'}</span>${t ? esc(t.name) : '호칭'}</button></div>
      <div class="st-col"><span>🟪 인장 ${seals}/${sealMax}</span><span>📚 도감 ${Object.keys(owned).length}/${U}</span><span>🏅 호칭 ${earned.length}</span>${heroAll ? `<span>🧑 ${heroOpen}/${heroAll}</span>` : ''}</div>
      <div class="st-next">🎁 <b>다음 보상</b> — ${nextReward(L, owned, seals)}</div>`;
    el.querySelectorAll('[data-gear]').forEach((b) => (b.onclick = settings));
    // 장면: 등불 · 깃발 · 상태 표시 (글씨 없이)
    const stage = document.querySelector('#camp .camp-stage'); // 2026-11-05: 성벽 등불(차시 층) 없앰
    DS.CampScene.flag(stage, sealed.includes('eval-1') ? 'gold' : ''); // 🏰 성채 1층 보스 처치 = 금빛 깃발
    cues(rec, owned, Number(no) || 0);
    // 📕 오답노트 배지: 남은 문제(틀림 + 안 풂) 수는 📮 우편함 한 곳에만 (0 이면 금색 도장) · 🎯 허수아비엔 작은 점 (2026-11-05 정신없음 줄이기)
    if (DS.Note && !me.test) {
      const held = await DS.Net.get(`held/${k}`).catch(() => null), nt = DS.Note.all(rec || {}, bonus || {}, no, held);
      const z = document.getElementById('camp-mail'); if (z) { const old = z.querySelector('.nt-badge'); if (old) old.remove(); if (nt.list.length) z.insertAdjacentHTML('beforeend', DS.Note.badge(nt.left)); }
      const d = document.getElementById('camp-dummy'); if (d) d.classList.toggle('nt-dot', nt.left > 0);
    }
    // 🏰 성채던전 NEW (2026-11-05): 진도를 나가 새로 열린 방 수 → 파란 배지 · 늘었으면 한 번 안내
    if (DS.Bonus && !me.test) {
      if (DS.Bonus.loadLocks) await DS.Bonus.loadLocks(); // 🔒 잠긴 층(3층 대단원) 방은 NEW 에 안 셈
      const fresh = DS.Bonus.newRooms(me, bonus || {}, Number(no) || 0).length, z = document.getElementById('camp-castle');
      if (z) { const old = z.querySelector('.cs-newb'); if (old) old.remove(); if (fresh) z.insertAdjacentHTML('beforeend', `<span class="cs-newb">NEW ${fresh}</span>`); }
      const nk = `citadel-castle-new-${k}-${me.n}`; let was = 0; try { was = Number(localStorage.getItem(nk)) || 0; localStorage.setItem(nk, String(fresh)); } catch (e) { /* 무시 */ }
      if (fresh > was) DS.UI.toast(`🏰 성채던전에 새 방 ${fresh - was}개가 열렸어요!`, 3200);
    }
  }
  // 상태가 있을 때만 살아 움직임: 📮 새 결과 · ⚒ 만들 수 있는 카드 · ⛺ 새로 열린 차시 영상
  function cues(rec, owned, no) {
    const k = `citadel-cue-${ck(me.c)}-${me.n}`; let seen = {}; try { seen = JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { /* 무시 */ }
    const lastRec = Math.max(0, ...Object.values(rec || {}).map((r) => Number((r || {}).at) || 0));
    const set = (id, on) => { const e = document.getElementById(id); if (e) e.classList.toggle('cs-new', !!on); };
    set('camp-mail', lastRec > (seen.mail || 0));
    set('camp-anvil', DS.Unit ? DS.Unit.opens(no).some((c) => !owned[c.id]) : false);
    set('camp-tent', no > (seen.tent || 0));
    cues.mark = (what) => { seen[what] = what === 'mail' ? lastRec : no; try { localStorage.setItem(k, JSON.stringify(seen)); } catch (e) { /* 무시 */ } set(`camp-${what}`, false); };
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
  async function enterCode(code) {
    if (me.test && DS.Test.active()) return DS.Test.join(code); // 🧪 테스트 모닥불
    try { localStorage.setItem('citadel-student', JSON.stringify({ code })); } catch (e) { /* 무시 */ }
    await DS.Student.enter(code, { num: me.n, nick: me.name, hero: me.hero, fx: me.fx || 'flame', cls: me.c, title: me.title || 'none' });
  }
  // 캠프 기본 오브젝트 (v0.9.6 · 특전 아님): 그림(DS.ASSETS.camp.props)이 오기 전에는 이모지 팻말
  function prop(id, icon, label, pos) {
    const p = ((C().props || {})[id]) || '', src = typeof p === 'string' ? p : p.src, two = typeof p === 'object' && p.cols === 2; // 2칸 = 평소 | 눌림
    return `<button class="camp-prop" id="camp-${id}" style="${pos}" aria-label="${label}">${src ? `<i class="camp-prop-img${two ? ' two' : ''}" style="background-image:url('${base()}${src}')"></i>` : `<i class="camp-prop-ic">${icon}</i>`}<span class="camp-label">${icon} ${label}</span></button>`;
  }
  // 📚 책장: 열린 차시의 개념별 🎬 설명 영상 · 📄 학습지 개념 (기말 대비 다시 보기)
  async function shelf(all) { // all: 교사 캠프 — 모든 차시
    const no = all != null ? all : me.test ? 99 : Number(await DS.Net.get(`unlock/${ck(me.c)}`).catch(() => 0)) || 0;
    const open = DS.Lessons.list.filter((l) => l.no && l.no <= no).sort((a, b) => b.no - a.no);
    const preps = {};
    for (const l of open) preps[l.id] = (await DS.Act.prepLite(l.id).catch(() => null)) || {};
    const el = document.createElement('div'); el.className = 'modal camp-modal';
    const rows = (l) => l.steps.filter((st) => st.kind === 'concept').map((st) => {
      const p = preps[l.id], vid = DS.Video.pick(l, p.video, st.id), img = DS.Act.hasImg(p, st.id);
      return `<div class="sh-row"><span>${esc(st.title)}</span><span class="row">${vid && DS.Video.ok(vid) ? `<button class="btn small" data-v="${l.id}|${st.id}">🎬 영상</button>` : ''}${img ? `<button class="btn small" data-i="${l.id}|${st.id}">📄 개념</button>` : ''}</span></div>`;
    }).join('');
    el.innerHTML = `<div class="quiz-box framed rs-box"><div class="quiz-head"><b>📚 책장 — 개념 다시 보기</b><button class="btn small" id="sh-x">✕ 닫기</button></div>
      ${open.length ? open.map((l) => `<details class="sh-l"${l === open[0] ? ' open' : ''}><summary><b>${l.no}차시 · ${esc(l.title)}</b></summary>${rows(l)}</details>`).join('') : '<p class="muted">선생님이 우리 반 수업을 열면 그 차시 개념이 꽂혀요.</p>'}</div>`;
    document.body.appendChild(el);
    el.querySelector('#sh-x').onclick = () => el.remove();
    const titleOf = (lid, sid) => (DS.Lessons.get(lid).steps.find((x) => x.id === sid) || {}).title || '';
    el.querySelectorAll('[data-v]').forEach((b) => (b.onclick = () => { const [lid, sid] = b.dataset.v.split('|'); DS.Video.open(DS.Video.pick(DS.Lessons.get(lid), preps[lid].video, sid), titleOf(lid, sid), { lesson: lid, slot: sid }); }));
    el.querySelectorAll('[data-i]').forEach((b) => (b.onclick = () => DS.Control.run(async () => {
      const [lid, sid] = b.dataset.i.split('|'), src = await DS.Act.prepImg(lid, sid);
      if (!src) { DS.UI.toast('아직 이 개념의 학습지 이미지가 없어요.'); return; }
      const v = document.createElement('div'); v.className = 'modal sheet-modal'; v.innerHTML = `<div class="quiz-box framed"><div class="quiz-head"><b>📄 ${esc(titleOf(lid, sid))}</b><button class="btn small" data-x>✕ 닫기</button></div><img class="bn-sheet" src="${src}" alt="학습지"></div>`;
      v.querySelector('[data-x]').onclick = () => v.remove(); document.body.appendChild(v);
    })));
  }
  // 📜 복습 노트: 차시별 결과 · 개념별 첫 시도 · 복습 추천 (records/{반}/{번호})
  async function note() {
    const rec = (await DS.Net.get(`records/${ck(me.c)}/${me.n}`).catch(() => null)) || {};
    const g = DS.Grow ? await DS.Grow.mine(me).catch(() => null) : null;
    // 📕 오답노트 (v0.9.7.9): 차시마다 문제 칩 · 남은 문제 → 중단원던전 그 층에서 보충
    let ntHtml = '';
    if (DS.Note && !me.test) {
      const [bon, no, held] = await Promise.all([DS.Net.get(`bonus/${ck(me.c)}/${me.n}`).catch(() => null), DS.Net.get(`unlock/${ck(me.c)}`).catch(() => 0), DS.Net.get(`held/${ck(me.c)}`).catch(() => null)]);
      const nt = DS.Note.all(rec, bon || {}, no, held);
      if (nt.list.length) ntHtml = `<div class="nt-box${nt.left ? ' open' : ''}"><p class="nt-h">${DS.Note.icon('book')} <b>오답노트</b> ${nt.left ? `<span class="nt-cnt">❗ 남은 문제 ${nt.left}</span>` : `<span class="nt-cnt ok">${DS.Note.icon('done')} 노트 완성!</span>`}</p>
        ${nt.list.slice().reverse().map((x) => { const todo = x.ids.map((id, i) => ({ id, st: x.mons[i] })).filter((o) => DS.Note.OPEN[o.st] || o.st === 'a'), bossTodo = x.boss.slice(0, x.hp).some((st) => DS.Note.OPEN[st] || st === 'a');
          const title = (id) => (x.L.steps.find((s) => s.id === id) || {}).title || id;
          return `<div class="nt-les${x.left ? ' open' : ''}"><b>${x.L.no}차시</b>${x.absent ? ' <span class="muted small">불참</span>' : ''}${DS.Note.rows(x)}
            ${todo.length || bossTodo ? `<div class="nt-go-list">${todo.map((o) => `<button class="btn small primary" data-go="${x.L.id}|${o.id}">🎯 바로 풀기 · ${esc(title(o.id))}</button>`).join('')}${bossTodo ? `<button class="btn small primary" data-go="${x.L.id}|boss">🎯 바로 풀기 · 👑 형성평가</button>` : ''}</div>` : ''}</div>`; }).join('')}
        <p class="muted small">${DS.Note.icon('x')} 틀림 · ${DS.Note.icon('-')} 안 풂 → 「🎯 바로 풀기」로 허수아비에서 풀면 ${DS.Note.icon('p')} 복습 완료</p></div>`;
    }
    let giftHtml = ''; // 🎁 받은 선물 기록 (2026-11-06)
    if (DS.Gem && DS.Gem.giftList && !me.test) { const gl = DS.Gem.giftList(await DS.Gem.mine(me).catch(() => ({}))); if (gl.length) { const md = (t) => { const x = new Date(Number(t) + 9 * 3600e3); return `${x.getUTCMonth() + 1}/${x.getUTCDate()}`; }; giftHtml = `<div class="gift-box2"><p class="nt-h">🎁 <b>선생님 선물</b> <span class="muted small">모두 ${gl.reduce((a, x) => a + (Number(x.g) || 0), 0)}개</span></p>${gl.slice(0, 6).map((x) => `<div class="gift-row"><span>${md(x.at)}</span><b>💎 +${Number(x.g) || 0}</b></div>`).join('')}</div>`; } }
    const el = document.createElement('div'); el.className = 'modal camp-modal';
    el.innerHTML = `<div class="quiz-box framed rs-box"><h2>📮 우편함 · 복습 노트</h2>${giftHtml}${ntHtml}${g ? `<div class="rs-lv"><b>Lv.${g.lv} ${esc(g.title)}</b> <span class="muted small">EXP ${g.total}</span><div class="rs-bar"><i style="width:${Math.round((100 * g.into) / g.next)}%"></i><span>${g.into} / ${g.next}</span></div></div>` : ''}
      <p class="muted small">성적이 아니라 다음에 볼 것을 모아 둔 노트예요. 📌 복습 추천 개념은 🎯 복습 허수아비에서 그 차시를 골라 연습할 수 있어요.</p>${DS.Result.history(rec)}
      <div class="row"><button class="btn" id="nt-x">닫기</button><button class="btn primary" id="nt-bonus">🎯 복습 허수아비로</button></div></div>`;
    document.body.appendChild(el);
    el.querySelector('#nt-x').onclick = () => el.remove();
    el.querySelector('#nt-bonus').onclick = () => { el.remove(); pick('#camp-dummy', () => DS.Control.run(() => DS.Bonus.enter(me, { train: true }))); };
    el.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => { el.remove(); pick('#camp-dummy', () => DS.Control.run(() => DS.Bonus.enter(me, { train: true, go: b.dataset.go.split('|') }))); }));
  }
  // 📕 오답노트 예시 (2026-11-06 · 종합상황실 우편함 = 학생과 같은 창으로 기능 설명): 최근 두 차시에 틀림 · 고침 · 안 풂 예시를 넣어 보여 줌 (기록은 저장 안 함)
  function noteDemo(o = {}) {
    if (!DS.Note) return;
    const ls = DS.Lessons.list.filter((l) => l.no && !l.eval && l.boss).sort((a, b) => a.no - b.no), pick2 = ls.slice(-2);
    const rec = {}; pick2.forEach((L, k) => { const ids = L.steps.filter((s) => s.kind === 'monster' && L.monsters[s.id]).map((s) => s.id), hp = L.boss.hpItems || L.boss.items;
      rec[L.id] = { at: 1, no: L.no, mons: Object.fromEntries(ids.map((id, i) => [id, i === 0 ? 'x' : i === 1 ? 'f' : i === 2 && k ? '-' : 'o'])), bossM: Array.from({ length: hp }, (_, i) => (i === 1 ? 'x' : i === 3 && k ? '-' : 'o')).join(''), boss: hp - 1, bossN: hp }; });
    const nt = DS.Note.all(rec, {}, 99, Object.fromEntries(pick2.map((L) => [L.id, true])));
    const el = document.createElement('div'); el.className = 'modal camp-modal';
    el.innerHTML = `<div class="quiz-box framed rs-box"><h2>📮 우편함 · 복습 노트 <span class="muted small">(예시 화면)</span></h2>
      <div class="nt-box open"><p class="nt-h">${DS.Note.icon('book')} <b>오답노트</b> <span class="nt-cnt">❗ 남은 문제 ${nt.left}</span></p>
        ${nt.list.slice().reverse().map((x) => { const todo = x.ids.map((id, i) => ({ id, st: x.mons[i] })).filter((q) => DS.Note.OPEN[q.st] || q.st === 'a'), bossTodo = x.boss.slice(0, x.hp).some((st) => DS.Note.OPEN[st] || st === 'a');
          const title = (id) => (x.L.steps.find((s) => s.id === id) || {}).title || id;
          return `<div class="nt-les open"><b>${x.L.no}차시</b>${DS.Note.rows(x)}<div class="nt-go-list">${todo.map((q) => `<button class="btn small primary" data-go="${x.L.id}|${q.id}">🎯 바로 풀기 · ${esc(title(q.id))}</button>`).join('')}${bossTodo ? `<button class="btn small primary" data-go="${x.L.id}|boss">👑 형성평가 재대결</button>` : ''}</div></div>`; }).join('')}
        <p class="muted small">${DS.Note.icon('x')} 틀림 · ${DS.Note.icon('-')} 안 풂 → 「🎯 바로 풀기」로 허수아비에서 풀면 ${DS.Note.icon('p')} 복습 완료</p></div>
      <p class="muted small">학생은 자기 기록으로 이 창을 봐요. 성적이 아니라 다음에 볼 것을 모아 둔 노트예요.</p>
      <div class="row"><button class="btn" id="nt-x">닫기</button><button class="btn primary" id="nt-bonus">🎯 복습 허수아비로</button></div></div>`;
    document.body.appendChild(el);
    el.querySelector('#nt-x').onclick = () => el.remove();
    el.querySelector('#nt-bonus').onclick = () => { el.remove(); if (o.train) o.train(); };
    el.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => { el.remove(); if (o.go) o.go(...b.dataset.go.split('|')); }));
  }
  // 코드로 입장 (QR · 만약을 위해)
  function codeGate() {
    let last = ''; try { last = (JSON.parse(localStorage.getItem('citadel-student')) || {}).code || ''; } catch (e) { /* 무시 */ }
    const el = document.createElement('div'); el.className = 'modal camp-modal';
    el.innerHTML = `<div class="quiz-box framed"><h2>🌀 차원문</h2><p>선생님이 알려 준 <b>수업 코드 6자리</b>를 넣으면 던전 대기실로 넘어가요.</p>
      <input id="g-code" name="class-code" inputmode="numeric" maxlength="6" placeholder="6자리" autocomplete="off" data-1p-ignore data-lpignore="true" value="${esc(code0 || last)}">
      <div class="row"><button class="btn" id="g-x">닫기</button><button class="btn primary" id="g-go">⚔ 던전으로</button></div></div>`;
    document.body.appendChild(el);
    el.querySelector('#g-x').onclick = () => el.remove();
    el.querySelector('#g-go').onclick = () => DS.Control.run(async () => {
      const code = el.querySelector('#g-code').value.trim();
      if (!/^\d{6}$/.test(code)) throw Object.assign(new Error('수업 코드 6자리를 넣어 주세요.'), { user: true });
      await enterCode(code);
      el.remove(); code0 = '';
    });
  }
  // v0.9.2: 호칭은 자동으로 달지 않는다 → 새로 얻은 호칭만 알려 주고 ⚙ 설정에서 스스로 고르게 (레벨 칭호는 알리지 않음)
  async function newTitles() {
    if (!DS.Titles || me.test) return;
    const k = `citadel-ttl-seen-${me.c}-${me.n}`;
    let seen = null; try { seen = JSON.parse(localStorage.getItem(k)); } catch (e) { /* 무시 */ }
    const got = DS.Titles.earned(await DS.Titles.data(me).catch(() => ({}))).filter((t) => !/^lv\d/.test(t.id));
    const fresh = got.filter((t) => !(seen || []).includes(t.id));
    try { localStorage.setItem(k, JSON.stringify(got.map((t) => t.id))); } catch (e) { /* 무시 */ }
    if (fresh.length) DS.UI.toast(`🏅 새 호칭 ${fresh.slice(0, 2).map((t) => `[${t.name}]`).join(' ')}${fresh.length > 2 ? ` 외 ${fresh.length - 2}개` : ''} 획득! ⚙ 설정에서 이름 앞에 달 수 있어요`, 4200);
  }
  // ⚙ 설정: 용사 · 공격 이펙트 (잠긴 것은 🔒 + 조건)
  // ⚙ 설정 — opt.teacher (2026-11-04): 교사 캠프에서 선생님 모습 고르기 = 용사 18명 · 이펙트 · 호칭 모두 열림 · 이 기기에 저장 (수업 중이면 그 방 선생님 용사도 바로)
  async function settings(opt = {}) {
    if (opt.me && !opt.teacher) me = Object.assign({}, me || {}, opt.me); // 🏰 던전 안에서 열 때 (2026-11-06): 수업 화면의 내 정보
    const T = !!opt.teacher, tl = T ? DS.Art.teacherLook() : null;
    let L = T ? { heroes: Object.keys(DS.ASSETS.heroesV2.list).map((i) => ({ id: Number(i), open: true })), fx: DS.FX.KINDS.map((k) => ({ id: k, open: true })), seals: 0 } : await DS.Account.looks(me);
    // 💎 상점: 잠긴 것을 누르면 조각으로 해금 (확인 한 번)
    const shopBuy = async (it) => {
      if (!it.shop || me.test) return false;
      if (L.gem < it.shop.price) { DS.UI.toast(`💎 조각이 ${it.shop.price - L.gem}개 모자라요 (지금 ${L.gem}개) · 레이드 · 복습 · 성채에서 모아요`, 3400); return true; }
      if (it.shop.scroll && (L.scroll || 0) < it.shop.scroll) { DS.UI.toast(`📜 서술 조각이 ${it.shop.scroll - (L.scroll || 0)}개 모자라요 — 🏰 성채 서술형 방에서 풀이 사진을 통과하면 모여요`, 3800); return true; }
      if (!confirm(`💎 ${it.shop.price}개${it.shop.scroll ? ` + 📜 ${it.shop.scroll}개` : ''}로 해금할까요? (남는 조각 ${L.gem - it.shop.price}개)`)) return true;
      await DS.Gem.buy(me, it.shop.kind, it.shop.id); DS.Sound.correct(); DS.UI.toast('🎉 해금했어요!'); L = await DS.Account.looks(me); draw(); return true;
    };
    // 2026-11-06 설정 v2: 탭 3개 (🧙 용사 · 💎 결정석 · 🏅 호칭) · 결정석 = 용사마다 1칸 (동시 사용 · 빼기 = 회수) · 친화 ★ = 공명
    let hero = T ? tl.hero : me.hero, title = T ? tl.title : me.title || 'none';
    const sock = Object.assign({}, (T ? tl.socket : me.socket) || {});
    if (sock[hero] == null && (T ? tl.fx : me.fx) && DS.FX.KINDS.includes(T ? tl.fx : me.fx) && (T ? tl.fx : me.fx) !== DS.FX.affOf(hero).ids[0]) sock[hero] = T ? tl.fx : me.fx; // 예전 계정: 쓰던 이펙트를 지금 용사 칸에
    const fxNow = () => DS.FX.crystalOf(hero, sock);
    let tab = (() => { try { return localStorage.getItem('citadel-settab') || 'hero'; } catch (e) { return 'hero'; } })();
    const TD = !T && DS.Titles ? await DS.Titles.data(me).catch(() => ({})) : {}, got = DS.Titles ? (T || me.test ? DS.Titles.all().map((t) => t.id) : DS.Titles.earned(TD).map((t) => t.id)) : []; // 🧪 체험판 · 교사: 호칭 모두
    const nmOf = (id) => (DS.FX.NAMES[id] || id).replace(/^\S+\s/, ''), tierTag = (id) => { const t = DS.FX.tierOf(id); return t === 's' ? '★' : ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ'][t] || ''; };
    const heroName = (h) => esc(((DS.ASSETS.heroesV2.list[h] || {}).name) || '');
    const fxCell = (id) => { const f = L.fx.find((x) => x.id === id) || { id, open: false, cond: '' };
      return `<button class="fxpick${id === fxNow() ? ' on' : ''}${f.open ? '' : ' lock'}" data-fx="${id}"><i class="tier">${tierTag(id)}</i><canvas width="120" height="70" data-still="${id}"></canvas><span>${f.open ? '' : '🔒 '}${esc(nmOf(id))}</span>${f.open ? '' : `<small>${esc(f.cond || '추후 공개')}</small>`}</button>`; };
    let demoN = 0; // ⚔ 미리보기: 고른 용사가 고른 스킬로 공격 (근접 = 돌진 · 원거리 = 탄)
    const demo = () => { const ap = el.querySelector('#ap'); if (!ap || !DS.Attack) return; const n = ++demoN, fx = fxNow(); DS.Attack.preload(hero, fx); setTimeout(() => { if (n === demoN && ap.isConnected) DS.Attack.play(ap, { heroBox: ap.querySelector('.ap-hero'), monBox: ap.querySelector('.ap-mon'), hero, fx, s: 0.85, ps: 1, rest: 'idle' }); }, 120); };
    const el = document.createElement('div'); el.className = 'modal camp-modal';
    const preview = () => { const fx = fxNow(), aff = DS.FX.affOf(hero), reso = DS.FX.resonates(hero, fx);
      return `<div class="atk-prev" id="ap"><span class="ap-cap">${DS.Attack && DS.Attack.isRanged(hero) ? '🏹 원거리' : '🗡 근접'} · ${heroName(hero)} · 친화 ${aff.name} · ⚔ ${esc(nmOf(fx))} ${tierTag(fx)}${reso ? ' <b class="gold">★ 공명</b>' : ''} <span class="muted">(누르면 다시)</span></span><div class="ap-hero">${DS.Art.hero(hero, 'idle')}</div><div class="ap-mon">${DS.Art.monster('castle2:0', 'idle', 'float')}</div></div>`; };
    const heroTab = () => `<div class="heroes set-grid">${L.heroes.map((h) => { const r = DS.Attack && DS.Attack.isRanged(h.id), af = DS.FX.affOf(h.id); return `<button class="hpick${h.id === hero ? ' on' : ''}${h.open ? '' : ' lock'}" data-h="${h.id}" title="${esc(h.cond || '')}"><b class="atk-badge${r ? ' r' : ''}">${r ? '🏹' : '🗡'}</b>${sock[h.id] ? '<i class="gemdot" title="스킬 고름"></i>' : ''}<b class="aff" title="친화 계열">${af.name.split(' ')[0]}</b>${DS.Art.hero(h.id, h.id === hero ? 'attack' : 'idle')}${h.open ? '' : '<b class="lk">🔒</b>'}</button>`; }).join('')}</div>
        <p class="muted small">🗡 근접 = 다가가서 · 🏹 원거리 = 탄을 날려서 · 오른쪽 아래 = 친화 계열 (같은 계열 스킬을 고르면 ★ 공명) · 파란 점 = 스킬 고름 · 데미지 · 보상은 모두 같아요</p>
        ${T ? '' : `<p class="muted small">✨ 업적 용사: ① 1~3차시 도감 <b>${L.got} / ${L.need}</b>장 · ② 🎁 첫 레이드 · ③ 4~6차시 도감 · ④ 7~10차시 도감 · 금발 검사 = 🟪 인장 3개 / 💎 상점 용사 = 조각으로</p>`}`;
    const gemTab = () => { const fx = fxNow(), aff = DS.FX.affOf(hero), reso = DS.FX.resonates(hero, fx), set = sock[hero] != null;
      return `<div class="sock"><canvas width="128" height="80" data-still="${fx}"></canvas><div><small>${heroName(hero)}의 스킬 · 친화 ${aff.name}</small><b>${esc(DS.FX.NAMES[fx] || '')} ${tierTag(fx)}${reso ? ' <span class="reso">★ 공명</span>' : ''}</b><small>${set ? '아래 표에서 누르면 바로 바뀌어요' : '고른 스킬 없음 → 친화 계열 Ⅰ 이 기본으로 나가요'}</small></div><div class="sock-btns">${set ? '<button class="btn small" id="sock-out">🔄 기본으로<br><small>스킬은 계속 가짐</small></button>' : ''}${!T && (L.fx.find((x) => x.id === fx) || {}).bought ? `<button class="btn small sock-sell" id="sock-sell">💰 되팔기<br><small>💎 +${DS.Gem.refundOf('fx', fx)} · 다시 잠김</small></button>` : ''}</div></div>
        ${T ? ([3, 's'].includes(DS.FX.tierOf(fx)) ? '<button class="btn small ult-btn" id="ult-demo">⚡ 필살기 미리보기 <small>(선생님: 시연을 다 맞힌 뒤 ⚔ 일반 · ⚡ 필살기 중 골라요)</small></button>' : '<p class="muted small">⚡ 선생님 필살기는 Ⅳ 전설(9개 모두) · 🪶 특별 스킬일 때 시연 뒤 고를 수 있어요</p>') : DS.Attack && DS.Attack.canUlt(fx, hero) ? '<button class="btn small ult-btn" id="ult-demo">⚡ 필살기 미리보기 <small>(특화 계열 Ⅳ 전설 스킬 + 퍼펙트일 때)</small></button>' : DS.FX.tierOf(fx) === 3 ? `<p class="muted small">⚡ 필살기는 이 용사의 특화(친화 ${DS.FX.affOf(hero).name}) Ⅳ 전설 스킬일 때만 나가요</p>` : ''}
        <p class="muted small">⚔ 한 번 연 스킬은 <b>여러 용사가 동시에</b> 쓸 수 있고, 빼도 사라지지 않아요. ${T ? '' : '잠긴 스킬은 누르면 💎 조각 · 🟪 인장으로 열어요.'}</p>
        <div class="fx-fams">${DS.FX.FAMS.map((fam) => `<div class="fx-fam${fam.id === aff.id ? ' aff' : ''}"><b>${fam.name}${fam.id === aff.id ? ' ★' : ''}</b>${fam.ids.map(fxCell).join('')}</div>`).join('')}<div class="fx-fam sp"><b>🪶 특별</b>${DS.FX.ACHV.map(fxCell).join('')}<span></span></div></div>`; };
    // 🔨 강화 (2026-11-06 · 실패 없음 · 🌟 대성공 10% = 💎 절반 돌려받기): 단계가 오를수록 무기 빛 · 교실 TV 이름표 「+N」
    const enhTab = () => { const lv = L.enh || 0, nx = DS.Gem.ENH[lv + 1], t = DS.Gem.enhTier(lv), nt = DS.Gem.enhTier(lv + 1), LOOK = ['', '은빛 무기', '금빛 무기', '황금 오라', '무지개 오라'];
      return `<div class="enh-box"><div class="enh-stage${t ? ` enh enh-${t}` : ''}" id="enh-stage">${DS.Art.hero(hero, 'idle', 'huff')}<b class="enh-lv">+${lv}</b></div>
        ${nx ? `<p>다음 <b>+${lv + 1}</b> · 💎 <b>${nx.g}</b>${nx.s ? ` + 📜 <b>${nx.s}</b>` : ''}${nt > t ? ` → ✨ <b>${LOOK[nt]}</b>` : ''}</p><button class="btn primary big" id="enh-go">🔨 쾅! 강화</button>` : '<p class="gold">🌈 최고 단계 +10 — 전설의 무기!</p>'}
        <p class="muted small">실패 없음 · 🌟 대성공(10%)이면 낸 💎 의 절반을 돌려받아요 · +3 은빛 · +5 금빛 · +7 오라 (📜 필요) · +10 무지개 · 교실 TV 이름 옆에 「+${lv}」</p>
        <div class="enh-table">${DS.Gem.ENH.slice(1).map((c, i) => `<span class="${i + 1 <= lv ? 'done' : ''}">+${i + 1}<small>💎${c.g}${c.s ? ` 📜${c.s}` : ''}</small></span>`).join('')}</div></div>`; };
    const ttlTab = () => `<p class="muted small">얻은 ${got.length}개 · 고른 호칭이 이름 앞에 붙어요</p><div class="ttl-grid">${[{ id: 'none', name: '달지 않기', tier: 'w', cond: '' }, ...DS.Titles.all()].map((t) => { const has = t.id === 'none' || got.includes(t.id); return `<button class="ttl-pick ${DS.Titles.TIER[t.tier].cls}${t.id === title ? ' on' : ''}${has ? '' : ' lock'}" data-ttl="${t.id}" title="${esc(t.cond || '')}">${has ? DS.Titles.medal(t, 22) : '🔒'}<span>${esc(t.name)}</span>${has ? '' : `<small>${esc(t.cond)}</small>`}</button>`; }).join('')}</div>`;
    const draw = () => { const sb = el.querySelector('.set-box'), keep = sb ? sb.scrollTop : 0;
      el.innerHTML = `<div class="quiz-box framed set-box"><div class="set-head"><h2>⚙ ${T ? '선생님 모습' : '내 용사'}</h2><button class="btn" id="set-x">닫기</button><button class="btn primary" id="set-ok">저장</button></div>
        ${T ? '' : `<div class="gem-bar">💎 <b>${L.gem}</b> 조각 · 📜 <b>${L.scroll || 0}</b> 서술 조각 · 🔨 <b>+${L.enh || 0}</b> <span class="muted small">· 🟪 인장 ${L.seals || 0} · 🎖 메달 ${Object.values(L.medal || {}).reduce((a, b) => a + (Number(b) || 0), 0)}</span></div>`}
        <div class="set-tabs">${[['hero', '🧙 용사'], ['gem', '⚔ 스킬 고르기'], ...(T ? [] : [['enh', `🔨 강화 <small>+${L.enh || 0}</small>`]]), ['ttl', `🏅 호칭 <small>${got.length}</small>`]].map(([k, n]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${n}</button>`).join('')}</div>
        ${tab === 'ttl' || tab === 'enh' ? '' : preview()}
        ${tab === 'hero' ? heroTab() : tab === 'gem' ? gemTab() : tab === 'enh' && !T ? enhTab() : ttlTab()}
      </div>`; // v0.9.3: 닫기 · 저장은 맨 위 (사용자 요청)
      { const sb2 = el.querySelector('.set-box'); if (sb2) sb2.scrollTop = keep; }
      el.querySelectorAll('canvas[data-still]').forEach((c) => DS.FX.still(c, c.dataset.still));
      { const ap = el.querySelector('#ap'); if (ap) ap.onclick = demo; }
      el.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { tab = b.dataset.tab; try { localStorage.setItem('citadel-settab', tab); } catch (e) { /* 이 기기에만 */ } DS.Sound.clank(); const sb3 = el.querySelector('.set-box'); if (sb3) sb3.scrollTop = 0; draw(); if (tab !== 'ttl') demo(); }));
      el.querySelectorAll('[data-h]').forEach((b) => (b.onclick = () => { const h = L.heroes.find((x) => x.id === Number(b.dataset.h)); if (!h.open) { if (h.shop) { DS.Control.run(() => shopBuy(h)); return; } DS.UI.toast(`🔒 ${h.cond}`); return; } hero = h.id; DS.Sound.clank(); draw(); demo(); }));
      el.querySelectorAll('[data-fx]').forEach((b) => (b.onclick = () => { const f = L.fx.find((x) => x.id === b.dataset.fx); if (!f) return; if (!f.open) { if (f.locked) { DS.UI.toast(`🔒 ${f.locked} 열어야 살 수 있어요`, 3200); return; } if (f.shop) { DS.Control.run(() => shopBuy(f)); return; } DS.UI.toast(`🔒 ${f.cond || '해금 조건은 추후 공개'}`, 3200); return; } sock[hero] = f.id; draw(); demo(); DS.Sound.clank(); }));
      { const ub = el.querySelector('#ult-demo'); if (ub) ub.onclick = () => { const ap = el.querySelector('#ap'); if (ap && DS.Attack) { ap.scrollIntoView({ block: 'nearest' }); DS.Attack.play(ap, { heroBox: ap.querySelector('.ap-hero'), monBox: ap.querySelector('.ap-mon'), hero, fx: fxNow(), s: 0.85, ps: 1, rest: 'idle', finish: true, ultimate: true }); } }; }
      { const sl = el.querySelector('#sock-sell'); if (sl) sl.onclick = () => DS.Control.run(async () => { // 💰 되팔기 (2026-11-06): 70% 환불 · 다시 잠김 · 다음 단계를 산 경우는 그것부터
        const id = fxNow(), f = L.fx.find((x) => x.id === id), up = L.fx.find((x) => x.need === id && x.bought);
        if (!f || !f.bought) return; if (up) { DS.UI.toast(`먼저 윗 단계 「${nmOf(up.id)}」을 되팔아야 해요`, 3200); return; }
        const p = DS.Gem.price('fx', id), back = DS.Gem.refundOf('fx', id);
        if (!confirm(`「${nmOf(id)}」을 되팔까요?\n💎 ${back}개를 돌려받아요 (산 값 ${p}개의 70% · 30% 는 수수료).\n이 스킬은 다시 잠기고, 끼워 둔 용사는 기본 스킬로 돌아가요.`)) return;
        await DS.Gem.sell(me, 'fx', id); Object.keys(sock).forEach((h) => { if (sock[h] === id) delete sock[h]; });
        await DS.Account.setSocket(sock).catch(() => {}); me.socket = sock; L = await DS.Account.looks(me); DS.Sound.coin && DS.Sound.coin(); DS.UI.toast(`💰 되팔았어요 · 💎 +${back}`); draw();
      }); }
      { const eg = el.querySelector('#enh-go'); if (eg) eg.onclick = () => DS.Control.run(async () => {
        eg.disabled = true; const st = el.querySelector('#enh-stage');
        const r = await DS.Gem.enhance(me).catch((e) => { eg.disabled = false; throw e; });
        for (let i = 0; i < 3; i++) { if (st) { st.classList.remove('hit'); void st.offsetWidth; st.classList.add('hit'); } if (DS.Sound && DS.Sound.clank) DS.Sound.clank(); await new Promise((res) => setTimeout(res, 330)); }
        if (DS.Sound) DS.Sound.correct(); if (st && DS.FX) DS.FX.play(st, r.great ? 'stars' : 'flame', { scale: r.great ? 0.9 : 0.5 });
        DS.UI.toast(r.great ? `🌟 대성공! +${r.lv} · 💎 ${r.back}개 돌려받았어요!` : `🔨 +${r.lv} 강화 성공!`, 3200);
        L = await DS.Account.looks(me); me.enh = r.lv; draw();
      }); }
      { const out = el.querySelector('#sock-out'); if (out) out.onclick = () => { delete sock[hero]; DS.Sound.clank(); DS.UI.toast('스킬을 뺐어요 (기본 스킬로 · 언제든 다시 고를 수 있어요)', 2600); draw(); demo(); }; }
      el.querySelectorAll('[data-ttl]').forEach((b) => (b.onclick = () => { if (b.classList.contains('lock')) { DS.UI.toast(`🔒 ${b.title}`, 2600); return; } title = b.dataset.ttl; DS.Sound.clank(); draw(); }));
      el.querySelector('#set-x').onclick = () => el.remove();
      el.querySelector('#set-ok').onclick = () => DS.Control.run(async () => { const fx = fxNow();
        if (T) { DS.Art.setTeacherLook({ hero, fx, title, socket: sock }); el.remove(); DS.UI.toast('선생님 모습을 바꿨어요!'); if (opt.onSave) await opt.onSave({ hero, fx, title }); return; }
        if (me.test) DS.Test.setLook(hero, fx); else { await DS.Account.setLook(hero, fx); await DS.Account.setSocket(sock); if (title !== (me.title || 'none')) await DS.Account.setTitle(title); }
        me.title = title; me.hero = hero; me.fx = fx; me.socket = sock; el.remove();
        if (opt.onSave) { await opt.onSave({ hero, fx, title }); DS.UI.toast('저장했어요! 지금 던전에도 바로 적용돼요.'); return; } // 던전 안: 수업 방의 내 용사 · 스킬도 바로
        DS.UI.toast('저장했어요! 다음 입장부터 적용돼요.'); render(); });
    };
    draw(); document.body.appendChild(el); if (tab !== 'ttl') demo();
  }
  const back = () => (me ? enter(me) : null);
  return { teacher: () => !!(me && me.teacher), noteDemo, enter, back, settings, shelf: (all) => shelf(all), refresh: () => { if (document.getElementById('camp-forge')) status(); }, stampToday, markStamp: () => { try { localStorage.setItem('citadel-stamp', today()); } catch (e) { /* 무시 */ } } };
})();
