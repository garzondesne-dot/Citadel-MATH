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
  // 📮 도장 안내 = 수업 뒤 캠프에서 한 번만 (2026-11-07 사용자 「계속 뜸」) · 누르면 바로 닫힘 · 같은 날 다시 안 뜸
  const stampSeen = () => { try { return localStorage.getItem('citadel-stamp-seen') === today(); } catch (e) { return false; } };
  const stampMarkSeen = () => { try { localStorage.setItem('citadel-stamp-seen', today()); } catch (e) { /* 무시 */ } };

  async function enter(m, code) {
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
      if (live && live.open && (!was || !was.open || was.code !== live.code) && liveSeen !== live.code) { liveSeen = live.code; showGate(); status(); DS.Sound.correct(); if (tutMode !== 'A') DS.UI.toast(`⚔ ${live.no ? `${DS.Lessons.noText(live.no)}차시 ` : ''}던전이 열렸어요! 오른쪽 빛나는 문을 눌러 들어가요`, 4200); }
    }
    if (DS.Survey && !m.test) DS.Survey.watch(m, () => svDraw());
    if (riftStop) riftStop(); riftStop = m.test ? null : DS.Net.watch(`rift/${ck(m.c)}`, (v) => { const had = !!riftNow(); rifts = v || {}; if (document.getElementById('camp-gate')) drawGate(); if (!had && riftNow() && !(live && live.open)) DS.UI.toast(`⏳ ${riftNow().no}차시 이어하기 포털이 열렸어요! 오른쪽 문에서 남은 문제를 마저 해요`, 4200); });
    if (code0) setTimeout(codeGate, 300); // QR 로 들어왔으면 코드 창을 바로
    if (!code0) { const fromL = afterL; afterL = null; setTimeout(() => campQueue(m, fromL).catch(() => {}), 900); } // 🏰 #69 캠프 알림 차례로 (성채 해금 → 공지 → 새 호칭 → 확인도장 띠)
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
  const riftNow = () => null; // ⏳ 이어하기 포털(빨간 던전) 없앰 (2026-11-09 선생님 「이제 의미 없으니 삭제 · 수업은 선생님이 이어가기」) — 예전에 열린 포털도 안 보임
  function showGate() { const g = document.getElementById('camp-gate'); if (g) { g.classList.remove('flash'); void g.offsetWidth; g.classList.add('flash'); } }
  // ── 🧭 첫 수업 튜토리얼 (2026-11-03 사용자 확정) ──────────────────────
  //   A 입장: 튜토리얼을 본 적 없고 (수업 중이거나 수업 기록이 아직 없는) 학생 → 모루 · 보강던전 · 소품을 숨기고 차시 던전만, 들어가는 법 안내
  //   B 캠프 안내: A 를 본 뒤 수업이 끝나고 캠프에 오면 → 보강던전 · 허수아비 · 책장 · 우편함 · 모루를 하나씩 보여 주며 역할 설명
  //   반마다 첫 수업 날이 달라도, 가입만 하고 못 본 학생도 각자 한 번씩. 본 기록 = xp/{반}/{번호}/tut { a, b } (+ 이 기기 localStorage)
  let tut = null, tutRecs = null, tutMode = '', tutStep = 0;
  const tutPath = () => `xp/${ck(me.c)}/${me.n}/tut`, tutKey = () => `citadel-tut-${ck(me.c)}-${me.n}`;
  async function tutLoad() {
    if (me.test || me.trial) { tut = { a: true, b: true }; return; } // 👩‍🏫 체험판 v2: 테스트 모닥불처럼 처음부터 다 열림 (안내 없음)
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
    ['#camp-dummy', '🎯 복습 허수아비', '배운 차시를 <b>복습</b>해요. 수업 문제를 숫자만 바꿔 다시 풀고, 틀림 · 안 푼 문제를 맞히면 📕 오답노트에 복습 완료! 👑 형성평가 재대결을 처치하면 🏆 업적.'],
    ['#camp-tent', '⛺ 출제 공방', '배운 문제 틀로 <b>내가 문제를 만들어</b> 친구들 복습에 내요. 선생님이 확인하면 출제!'],
    ['#camp-mail', '📮 우편함', '<b>선생님 소식</b>(선물 · 공지 · 답장)이 오고, 편지 · 설문 · 친구 선물을 <b>보내는</b> 곳이에요.'],
    ['#camp-anvil', '⚒ 모루', '수업에서 배운 개념으로 <b>카드를 만드는 대장간</b>이에요. 언제든 열려요.'],
  ];
  function tutClear() {
    tutMode = ''; const stg = document.querySelector('#camp .camp-stage'); const co = document.getElementById('tut-coach'); if (co) co.remove();
    document.getElementById('camp').classList.remove('tut-a', 'tut-on');
    if (stg) { stg.classList.remove('tut-a', 'tut-b'); stg.querySelectorAll('.tut-spot, .tut-hide').forEach((e) => e.classList.remove('tut-spot', 'tut-hide')); }
  }
  function tutApply() {
    const stg = document.querySelector('#camp .camp-stage'); if (!stg || !document.getElementById('screen-camp').classList.contains('active')) return;
    const mode = tutDecide();
    if (mode !== tutMode) { tutClear(); tutMode = mode; tutStep = 0; }
    if (!mode) return;
    document.getElementById('camp').classList.add('tut-on'); // 안내 중엔 위 빨간 띠 · 겹치는 알림을 숨김 (2026-11-07 체험판 「하나도 안 읽혀」)
    let co = document.getElementById('tut-coach');
    if (!co) { co = document.createElement('div'); co.id = 'tut-coach'; co.className = 'tut-coach'; stg.appendChild(co); }
    const gate = document.getElementById('camp-gate');
    if (mode === 'A') {
      document.getElementById('camp').classList.add('tut-a'); stg.classList.add('tut-a'); co.classList.remove('block');
      if (gate) gate.classList.toggle('tut-spot', inClass());
      co.innerHTML = inClass()
        ? `<div class="tut-box"><p>⚔ <b>${live.no ? `${DS.Lessons.noText(live.no)}차시 ` : ''}던전이 열렸어요!</b><br>오른쪽에 빛나는 <b>아치 문을 눌러</b> 입장해요. 친구들과 함께 몬스터를 물리쳐요! 👉</p></div>`
        : '<div class="tut-box"><p>👋 <b>환영해요, 용사님!</b> 여기는 나만의 <b>내 캠프</b>이에요.<br>선생님이 수업을 열면 오른쪽 <b>아치 문</b>에 빛이 들어와요. 잠깐 기다려요!</p></div>';
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
    if (lb) lb.innerHTML = on ? (DS.TRIAL && DS.Lessons.get(live.lesson) ? `<span>⚔ ${live.no ? `${DS.Lessons.noText(live.no)}차시 ` : ''}입장!</span><small class="gate-sub">${esc(DS.Lessons.get(live.lesson).title)}</small>` : `⚔ ${live.no ? `${DS.Lessons.noText(live.no)}차시 ` : ''}입장!`) : rf ? `⏳ ${DS.Lessons.noText(rf.no)}차시 이어하기 D-${Math.max(1, Math.ceil((rf.until - Date.now()) / 86400e3))}` : '🔒 차시 던전'; el.setAttribute('aria-label', on ? `${live.no ? `${DS.Lessons.noText(live.no)}차시 ` : ''}${name} 입장` : rf ? `${DS.Lessons.noText(rf.no)}차시 이어하기` : '차시 던전 (닫힘)');
  }
  // 그림 칸 하나 (배치표 시트에서 열·행)
  const sheet = (s, col, row, cls, style = '') => `<i class="${cls}" style="background-image:url('${base()}${s.src}');background-size:${s.cols * 100}% ${(s.rows || 1) * 100}%;background-position:${s.cols > 1 ? (col / (s.cols - 1)) * 100 : 0}% ${(s.rows || 1) > 1 ? (row / (s.rows - 1)) * 100 : 0}%;${style}"></i>`;
  function tree(i, cls, style) {
    const t = C().trees, x0 = t.cuts[i] / t.base, x1 = t.cuts[i + 1] / t.base, w = x1 - x0;
    return `<i class="camp-tree ${cls}" style="background-image:url('${base()}${t.src}');background-size:${100 / w}% 100%;background-position:${(x0 / (1 - w)) * 100}% 0;aspect-ratio:${(w * 1038) / 378};${style}"></i>`;
  }
  function render() {
    const c = C(), S = DS.CampScene;
    const chip = !me.teacher; // 🧹 2026-11-07 정돈판: 캠프 위 = 던전과 같게 「◀ · · · 💬 · 💎 n」 (선생님은 🧙 선생님 모습)
    $('#camp').innerHTML = `<div class="camp-top${chip ? ' chip' : ''}">${chip && !me.test && !me.trial ? '<button class="sc-rb sm" id="camp-fb" aria-label="의견 보내기">💬</button>' : ''}${chip ? '<button class="sc-gem camp-set" id="camp-set" aria-label="💎 마정석 · 내 용사">💎 <b class="sc-gn">0</b><i>＋</i></button>' : '<button class="btn small camp-set" id="camp-set">🧙 선생님 모습</button>'}</div>
      <div class="camp-stage cs-v2" style="background-image:url('${base()}${c.bg}');aspect-ratio:${c.size[0]} / ${c.size[1]}">
        ${S.layers()}
        ${S.zone('camp-castle', 'castle', '🏰 성채던전')}${S.zone('camp-tent', 'tent', me.teacher ? '⛺ 텐트 · 책장' : '⛺ 출제 공방')}
        <button class="cs-zone camp-gate-z" id="camp-gate" style="${S.box(c.zones.gate)}" aria-label="차시 던전"><span class="camp-label">🔒 차시 던전</span></button>
        <button class="camp-anvil cs-int" id="camp-anvil" aria-label="모루">${sheet(c.anvil, c.anvil.states.idle, 0, 'camp-anvil-img')}<span class="camp-label">⚒ 모루</span></button>
        <div class="camp-fire"><i class="camp-glow"></i><i class="camp-glow g2"></i>${sheet(c.fire, 0, 0, 'camp-fire-img', '')}</div>
        <div class="camp-hero">${DS.Art.hero(DS.Art.look(me), 'sit', 'huff')}<i class="shadow"></i><div class="camp-plate"><span class="nm">${DS.Titles ? DS.Titles.nameHtml({ title: me.title || 'none', nick: me.name, stk: me.stk }, { num: false, size: 14, uid: 'me' }) : esc(me.name)}</span></div></div>
        ${prop('dummy', '🎯', '복습 허수아비', '')}${prop('mail', '📮', '우편함', '')}
      </div>
      <div class="camp-bar"><span id="camp-sv"></span></div>
      <div class="camp-forge panel framed st-panel" id="camp-forge"><p class="muted small">용사 상태를 불러오는 중…</p></div>`;
    status();
    $('#camp-anvil').onclick = () => pick('#camp-anvil', () => (me.test ? DS.Forge.open(me, { preview: true, no: 99 }) : DS.Forge.open(me))); // 🧪 체험판: 모든 레시피
    $('#camp-castle').onclick = () => { if (!picking) DS.CampScene.press(document.querySelector('#screen-camp .cs-v2'), 'castle'); setTimeout(() => { if (DS.CampScene.enter) DS.CampScene.enter(document.querySelector('#screen-camp .cs-v2'), 'castle'); }, 600); pick('#camp-castle', () => DS.Control.run(() => DS.Bonus.enter(me)), 'castle'); }; // 🏰 불빛 번쩍 · 통통 · 쿵 (2026-11-07)
    $('#camp-gate').onclick = () => {
      if (me.teacher) { const t = me.teacher; return pick('#camp-gate', () => DS.Control.run(() => (t.code ? DS.Teacher.open(t.code, t.hallKey) : location.replace(`${location.pathname}?${DS.Net.mode === 'local' ? 'local&' : ''}role=teacher`))), 'portal'); }
      const rf = !(live && live.open) ? riftNow() : null;
      if (rf) return pick('#camp-gate', () => DS.Control.run(() => DS.Bonus.enter(me, { train: true, rift: rf })), 'portal');
      if (live && live.open) { if (tutMode === 'A') { tutMark('a'); tutClear(); } return pick('#camp-gate', () => DS.Control.run(() => enterCode(live.code)), 'portal'); }
      nope('#camp-gate');
      if (!me.trial) return setTimeout(codeGate, 350); // 2026-11-08: 「코드로 입장」 버튼 대신 — 닫힌 문을 누르면 코드 창
      if (live) DS.UI.toast('지난 던전은 닫혔어요. 선생님이 다음 수업을 열면 문에 다시 빛이 들어와요.', 3200);
      else DS.UI.toast('아직 열린 던전이 없어요. 선생님이 수업을 열면 오른쪽 문에 빛이 들어와요.', 3200);
    };
    // v0.9.7.0: 이름표의 Lv 는 뺌 (사용자 — 캠프에서 이질적). 레벨은 아래 상태창에만
    { const fb = $('#camp-fb'); if (fb) fb.onclick = () => DS.Feedback.open({ c: me.c, n: me.n, name: me.name }, { where: 'camp' }); } // 💬 2026-11-06 · 2026-11-07 캠프 위로
    $('#camp-mail').onclick = () => pick('#camp-mail', () => { if (me.teacher) return DS.Control.run(() => DS.Dash.enter()); if (cues.mark) cues.mark('mail'); DS.Control.run(() => (DS.Mail && !me.test ? DS.Mail.open(me, { onClose: () => status() }) : note())); }); // 교사 = 📊 학급 대시보드 · 2026-11-07 6판: 우편함 = 소식 + 보내기 (오답노트는 🎯 허수아비로)
    $('#camp-tent').onclick = () => (DS.CampScene.objOn(document.querySelector('#camp .camp-stage'), 'tent', true), pick('#camp-tent', () => { if (cues.mark) cues.mark('tent'); DS.Control.run(() => (DS.Quest && !me.teacher ? DS.Quest.open(me) : shelf())); setTimeout(() => DS.CampScene.objOn(document.querySelector('#camp .camp-stage'), 'tent', false), 1500); })); // ⛺ 텐트 = ✏ 출제 공방 (2026-11-07 6판 · 책장은 🎯 허수아비 차시 카드로)
    $('#camp-dummy').onclick = () => pick('#camp-dummy', () => DS.Control.run(() => DS.Bonus.enter(me, { train: true })));
    $('#camp-set').onclick = () => (me.teacher ? settings({ teacher: true, onSave: async (v) => { me.hero = v.hero; me.fx = v.fx; me.title = v.title; const t = me.teacher; if (t.code) { try { await DS.Net.set(`rooms/${t.code}/state/tlook`, { hero: v.hero, fx: v.fx, at: DS.Net.TS }).catch(() => {}); /* 2026-11-06: 종합상황실도 쓸 수 있는 칸 → 수업 화면이 이 모습을 먼저 씀 */ const R0 = await DS.Net.get(`rooms/${t.code}/meta`); if (R0 && R0.teacher === DS.Net.uid()) await DS.Net.update(`rooms/${t.code}/players/${R0.teacher}`, { hero: v.hero, fx: v.fx }); } catch (e) { /* 다음 수업부터 */ } } render(); drawGate(); } }) : settings({ buy: true }));
    drawGate();
    animateFire();
    document.querySelectorAll('#camp .camp-prop').forEach((e) => e.classList.add('cs-int'));
    svDraw();
    DS.CampScene.intro(document.querySelector('#camp .camp-stage')); // 글씨 대신: 들어올 때 차례로 한 번 반짝
  }
  // 선택 연출 (한 번 탭 · 0.7초): 흰 테두리 번쩍 + 눌림 반동 + 소리·진동 → 금빛 외곽선 + ▼ → 내 용사가 그쪽으로 폴짝 → 열림
  let picking = false;
  // pose: 그쪽으로 가는 동안의 용사 동작 (기본 걷기 · 차원문 = 뒷모습으로 들어가기 → 작아지며 사라짐)
  const heroArt = (pose, cls = '') => { const a = document.querySelector('.camp-hero .art'); if (a) a.outerHTML = DS.Art.hero(DS.Art.look(me), pose, cls); }; // 🌟 #73 각성한 로안
  function pick(sel, then, pose = 'walk') {
    if ((pose === 'portal' || pose === 'castle') && DS.Sound && DS.Sound.door) DS.Sound.door(); // 🔊 #87 던전 입장 · 차원문 · 성채 문
    const el = document.querySelector(sel); if (!el || picking) return;
    picking = true;
    el.classList.remove('picked'); void el.offsetWidth; el.classList.add('picked');
    DS.Sound.clank(); if (navigator.vibrate) navigator.vibrate(25);
    const hero = document.querySelector('.camp-hero');
    if (hero) {
      const a = el.getBoundingClientRect(), b = hero.getBoundingClientRect();
      const dx = (a.left + a.width / 2) - (b.left + b.width / 2);
      const castle = pose === 'castle'; if (castle) pose = 'portal'; // 🏰 2026-11-08: 성채도 차원문처럼 문으로 걸어 들어감 (뒷모습 · 작아지며 사라짐)
      heroArt(pose);
      if (pose === 'portal') {
        // 차원문: 용사 몸 가운데가 포털 그림 정중앙에 닿을 때까지 걸어가며 작아지고 사라짐
        const pe = el.querySelector('.camp-portal') || el, p = pe.getBoundingClientRect(), h = hero.querySelector('.art').getBoundingClientRect();
        const door = castle ? (DS.ASSETS.camp && DS.ASSETS.camp.objs && DS.ASSETS.camp.objs.castle && DS.ASSETS.camp.objs.castle.door) || [50, 92] : [50, 50]; // 성채 = 문 자리 (배치표 door)
        hero.style.setProperty('--px', `${p.left + (p.width * door[0]) / 100 - (h.left + h.width / 2)}px`);
        hero.style.setProperty('--py', `${p.top + (p.height * door[1]) / 100 - (h.top + h.height * 0.85)}px`);
        hero.classList.remove('face-left'); hero.classList.add('to-portal');
      } else {
        hero.style.setProperty('--dx', `${Math.max(-1, Math.min(1, dx / Math.abs(dx || 1))) * Math.min(Math.abs(dx) * 0.55, 160)}px`);
        hero.classList.remove('dash'); void hero.offsetWidth; hero.classList.add('dash');
        hero.classList.toggle('face-left', dx < 0);
      }
    }
    const wait = el.id === 'camp-castle' ? 1500 : pose === 'portal' ? 1150 : 700; // 🏰 성채: 문으로 빨려 들어가는 확대(0.35~1.25초)를 다 보고 // 차원문: 정중앙까지 걸어 들어가 사라지는 걸 다 보고
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
    const hn = (id) => (DS.Lore ? DS.Lore.label(id) : (DS.ASSETS.heroesV2.list[id] || {}).name || '용사'); // 🧙 #73
    const lock = (id) => !((L.heroes || []).find((h) => h.id === id) || {}).open;
    if (seals < 3) cand.push([3 - seals, `업적 ${3 - seals}개 더 모으면 🏅 호칭 <b class="gold">「만 번째 베기」</b>!`]); // 🌟 #73 (옛 금발 검사 해금 → 호칭)
    const need3 = U.filter((c) => c.no <= 3 && c.id !== 'subcount'); if (lock(8) && need3.length) cand.push([need3.length - hasN(need3), `카드 ${need3.length - hasN(need3)}장 더 → 🧑 <b class="gold">${hn(8)}</b>`]);
    const r46 = range(4, 6); if (lock(10) && r46.length) cand.push([r46.length - hasN(r46), `카드 ${r46.length - hasN(r46)}장 더 → 🧑 <b class="gold">${hn(10)}</b>`]);
    const ui = DS.Bonus ? DS.Bonus.UNLOCK.findIndex((u) => seals < u) : -1;
    if (ui >= 0) cand.push([DS.Bonus.UNLOCK[ui] - seals, `업적 ${DS.Bonus.UNLOCK[ui] - seals}개 더 → ✨ <b class="gold">${esc(DS.FX.NAMES[DS.FX.FANCY[ui]])}</b> 이펙트!`]);
    const c = cand.filter((x) => x[0] > 0).sort((a, b) => a[0] - b[0])[0];
    return c ? c[1] : '모든 보상을 모았어요! 🎉';
  }
  async function status() {
    const el = document.getElementById('camp-forge'); if (!el) return;
    const k = ck(me.c), get = (p) => DS.Net.get(`${p}/${k}/${me.n}`).catch(() => null);
    const [rec, bonus, cards, no] = await Promise.all([get('records'), get('bonus'), get('cards'), DS.Net.get(`unlock/${k}`).catch(() => 0)]);
    { const w = me.teacher ? null : await DS.Net.get(`xp/${k}/${me.n}/wish`).catch(() => null), n = Object.keys(w || {}).filter((id) => !(cards || {})[id]).length, al = document.querySelector('#camp-anvil .camp-label'); if (al) al.innerHTML = `⚒ 모루${n ? `<i class="cf-wish" title="기호 톡에서 찜했지만 아직 안 만든 카드">★${n}</i>` : ''}`; } // ⭐ #106 모루 이름표 배지
    const L = DS.Account ? await DS.Account.looks(me).catch(() => ({ heroes: [], seals: 0 })) : { heroes: [], seals: 0 };
    if (L.enh != null && Number(me.enh || 0) !== Number(L.enh || 0)) { const was = DS.Art.look(me); me.enh = Number(L.enh) || 0; if (DS.Art.look(me) !== was) { const a = document.querySelector('.camp-hero .art'); if (a) a.outerHTML = DS.Art.hero(DS.Art.look(me), 'sit', 'huff'); } } // 🌟 #73 강화 단계 → 각성 모습
    const g = DS.Grow ? await DS.Grow.mine(me).catch(() => null) : null;
    const TD = DS.Titles ? await DS.Titles.data(me).catch(() => ({})) : {}, earned = DS.Titles ? DS.Titles.earned(TD).filter((t) => !/^lv\d/.test(t.id)) : [];
    if (!document.getElementById('camp-forge')) return;
    const st = statsOf(rec, bonus, cards), owned = cards || {}, sealed = DS.Bonus ? DS.Bonus.seals(bonus || {}) : [], seals = sealed.length;
    const sealMax = DS.Lessons.list.filter((l) => (l.no && l.boss && !l.eval) || l.eval).length, U = DS.Unit ? DS.Unit.CARDS.length : 0;
    const heroOpen = (L.heroes || []).filter((h) => h.open).length, heroAll = (L.heroes || []).length;
    const t = me.title && me.title !== 'none' && DS.Titles ? DS.Titles.get(me.title) : null;
    el.innerHTML = `<div class="st-head"><span class="lvb">Lv.${g ? g.lv : '-'}</span><span class="ttl">${g ? esc(g.title) : ''}</span><div class="st-exp"><i style="width:${g ? Math.round((100 * g.into) / g.next) : 0}%"></i><b>EXP ${g ? `${g.into} / ${g.next}` : '-'}</b></div></div>
      <div class="st-next">🎁 <b>다음 보상</b> — ${nextReward(L, owned, seals)}</div>
      ${me.teacher ? '' : `<div class="st-go-row"><button class="btn primary big" id="camp-enter">${live && live.open ? `⚔ ${live.no ? `${DS.Lessons.noText(live.no)}차시 ` : ''}입장` : riftNow() ? `⏳ ${riftNow().no}차시 이어하기` : '🔒 수업 기다리는 중'}</button><button class="btn big" id="camp-me">🧙 내 용사</button></div>`}`; // 🧹 2026-11-07 정돈판: 능력치 · 장착 · 수집 줄 → 「🧙 내 용사」 창 안으로
    { const ce = el.querySelector('#camp-enter'); if (ce) ce.onclick = () => { const g = $('#camp-gate'); if (g) g.click(); }; const cm = el.querySelector('#camp-me'); if (cm) cm.onclick = () => settings({ tab: 'hero' }); }
    document.querySelectorAll('#camp .sc-gn').forEach((e) => { e.textContent = L.gem != null ? L.gem : 0; /* 2026-11-08: 「·」 는 도트 글꼴에 없어 네모(▯)로 보였음 */ });
    void st; void sealMax; void U; void heroOpen; void heroAll; void t; void earned;
    // 장면: 등불 · 깃발 · 상태 표시 (글씨 없이)
    const stage = document.querySelector('#camp .camp-stage'); // 2026-11-05: 성벽 등불(차시 층) 없앰
    DS.CampScene.flag(stage, sealed.includes('eval-1') ? 'gold' : ''); // 🏰 성채 1층 보스 처치 = 금빛 깃발
    cues(rec, owned, Number(no) || 0);
    // 📕 오답노트 배지: 남은 문제(틀림 + 안 풂) 수는 📮 우편함 한 곳에만 (0 이면 금색 도장) · 🎯 허수아비엔 작은 점 (2026-11-05 정신없음 줄이기)
    if (DS.Note && (!me.test || (DS.Test && DS.Test.active && DS.Test.active()))) { // #47
      const held = await DS.Net.get(`held/${k}`).catch(() => null), nt = DS.Note.all(rec || {}, bonus || {}, no, held);
      if (me.title === 'steady' && DS.Gem && DS.Gem.streak) { me.stk = DS.Gem.streak(rec || {}, held); const ic = document.querySelector('.camp-plate .tfx-ic[data-tfx="steady"]'); if (ic) ic.textContent = `🔁${me.stk || ''}`; } // 🏅 #63 🔁n 연속 참여 수
      // 2026-11-07 6판: 남은 복습 수 = 🎯 허수아비 위 · 📮 우편함 = 안 읽은 소식 수
      const d = document.getElementById('camp-dummy'); if (d) { const old = d.querySelector('.nt-badge'); if (old) old.remove(); if (nt.list.length) d.insertAdjacentHTML('beforeend', DS.Note.badge(nt.left)); }
      const z = document.getElementById('camp-mail'); if (z && DS.Mail) { const un = await DS.Mail.unread(me).catch(() => 0), old = z.querySelector('.ml-badge'); if (old) old.remove(); if (un) z.insertAdjacentHTML('beforeend', `<span class="ml-badge">${un}</span>`); }
    }
    // 🏰 성채던전 NEW (2026-11-05): 진도를 나가 새로 열린 방 수 → 파란 배지 · 늘었으면 한 번 안내
    if (DS.Bonus && (!me.test || (DS.Test && DS.Test.active && DS.Test.active()))) { // #47
      if (DS.Bonus.loadLocks) await DS.Bonus.loadLocks(); // 🔒 잠긴 층(3층 대단원) 방은 NEW 에 안 셈
      const fresh = DS.Bonus.newRooms(me, bonus || {}, Number(no) || 0).length, z = document.getElementById('camp-castle');
      if (z) { const old = z.querySelector('.cs-newb'); if (old) old.remove(); if (fresh) z.insertAdjacentHTML('beforeend', `<span class="cs-newb">새 방 ${fresh}</span>`); }
      const nk = `citadel-castle-new-${k}-${me.n}`; let was = 0; try { was = Number(localStorage.getItem(nk)) || 0; localStorage.setItem(nk, String(fresh)); } catch (e) { /* 무시 */ }
      if (fresh > was && !tutMode) DS.UI.toast(`🏰 성채던전에 새 방 ${fresh - was}개가 열렸어요!`, 3200);
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
    if ((me.test || me.trial) && DS.Test.active()) return DS.Test.join(code); // 🧪 테스트 모닥불 · 👩‍🏫 교사 체험판
    try { localStorage.setItem('citadel-student', JSON.stringify({ code })); } catch (e) { /* 무시 */ }
    await DS.Student.enter(code, { num: me.n, nick: me.name, hero: me.hero, fx: me.fx || 'flame', cls: me.c, title: me.title || 'none' });
  }
  // 캠프 기본 오브젝트 (v0.9.6 · 특전 아님): 그림(DS.ASSETS.camp.props)이 오기 전에는 이모지 팻말
  function prop(id, icon, label, pos) {
    const p = ((C().props || {})[id]) || '', src = typeof p === 'string' ? p : p.src, two = typeof p === 'object' && p.cols === 2; // 2칸 = 평소 | 눌림
    return `<button class="camp-prop" id="camp-${id}" style="${pos}" aria-label="${label}">${src ? `<i class="camp-prop-img${two ? ' two' : ''}" style="background-image:url('${base()}${src}')"></i>` : `<i class="camp-prop-ic">${icon}</i>`}<span class="camp-label">${icon} ${label}</span></button>`;
  }
  // 📚 책장: 열린 차시의 개념별 🎬 설명 영상 · 📄 학습지 개념 (기말 대비 다시 보기)
  async function shelf(all, only) { // all: 교사 캠프 — 모든 차시 · only: 그 차시만 (🎯 허수아비 차시 카드에서 · 2026-11-07)
    const no = all != null ? all : me.test ? 99 : Number(await DS.Net.get(`unlock/${ck(me.c)}`).catch(() => 0)) || 0;
    const open = DS.Lessons.list.filter((l) => l.no && l.no <= no && (!only || l.id === only) && (!DS.TRIAL || DS.TRIAL.lessons.includes(l.id))).sort((a, b) => b.no - a.no); // 👩‍🏫 체험판: 3차시만
    const preps = {};
    for (const l of open) preps[l.id] = (await DS.Act.prepLite(l.id).catch(() => null)) || {};
    const el = document.createElement('div'); el.className = 'modal camp-modal';
    const rows = (l) => l.steps.filter((st) => st.kind === 'concept').map((st) => {
      const p = preps[l.id], vid = DS.Video.pick(l, p.video, st.id), img = DS.Act.hasImg(p, st.id);
      return `<div class="sh-row"><span>${esc(st.title)}</span><span class="row">${vid && DS.Video.ok(vid) ? `<button class="btn small" data-v="${l.id}|${st.id}">🎬 영상</button>` : ''}${img ? `<button class="btn small" data-i="${l.id}|${st.id}">📄 개념</button>` : ''}</span></div>`;
    }).join('');
    el.innerHTML = `<div class="quiz-box framed rs-box"><div class="quiz-head"><b>📚 책장 — 개념 다시 보기</b><button class="btn small" id="sh-x">✕ 닫기</button></div>
      ${open.length ? open.map((l) => `<details class="sh-l"${l === open[0] ? ' open' : ''}><summary><b>${DS.Lessons.noText(l.no)}차시 · ${esc(l.title)}</b></summary>${rows(l)}</details>`).join('') : '<p class="muted">선생님이 우리 반 수업을 열면 그 차시 개념이 꽂혀요.</p>'}</div>`;
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
    if (DS.Note && (!me.test || (DS.Test && DS.Test.active && DS.Test.active()))) { // #47
      const [bon, no, held] = await Promise.all([DS.Net.get(`bonus/${ck(me.c)}/${me.n}`).catch(() => null), DS.Net.get(`unlock/${ck(me.c)}`).catch(() => 0), DS.Net.get(`held/${ck(me.c)}`).catch(() => null)]);
      const nt = DS.Note.all(rec, bon || {}, no, held);
      if (nt.list.length) ntHtml = `<div class="nt-box${nt.left ? ' open' : ''}"><p class="nt-h">${DS.Note.icon('book')} <b>오답노트</b> ${nt.left ? `<span class="nt-cnt">❗ 남은 문제 ${nt.left}</span>` : `<span class="nt-cnt ok">${DS.Note.icon('done')} 노트 완성!</span>`}</p>
        ${nt.list.slice().reverse().map((x) => { const todo = x.ids.map((id, i) => ({ id, st: x.mons[i] })).filter((o) => DS.Note.OPEN[o.st] || o.st === 'a'), bossTodo = x.boss.slice(0, x.hp).some((st) => DS.Note.OPEN[st] || st === 'a');
          const title = (id) => (x.L.steps.find((s) => s.id === id) || {}).title || id;
          return `<div class="nt-les${x.left ? ' open' : ''}"><b>${DS.Lessons.noText(x.L.no)}차시</b>${x.absent ? ' <span class="muted small">불참</span>' : ''}${DS.Note.rows(x)}
            ${todo.length || bossTodo ? `<div class="nt-go-list">${todo.map((o) => `<button class="btn small primary" data-go="${x.L.id}|${o.id}">🎯 바로 풀기 · ${esc(title(o.id))}</button>`).join('')}${bossTodo ? `<button class="btn small primary" data-go="${x.L.id}|boss">🎯 바로 풀기 · 👑 형성평가</button>` : ''}</div>` : ''}</div>`; }).join('')}
        <p class="muted small">${DS.Note.icon('x')} 틀림 · ${DS.Note.icon('-')} 안 풂 → 「🎯 바로 풀기」로 허수아비에서 풀면 ${DS.Note.icon('p')} 복습 완료</p></div>`;
    }
    let giftHtml = ''; // 🎁 받은 선물 기록 (2026-11-06)
    if (DS.Gem && DS.Gem.giftList && !me.test) { const gl = DS.Gem.giftList(await DS.Gem.mine(me).catch(() => ({}))); if (gl.length) { const md = (t) => { const x = new Date(Number(t) + 9 * 3600e3); return `${x.getUTCMonth() + 1}/${x.getUTCDate()}`; }; giftHtml = `<div class="gift-box2"><p class="nt-h">🎁 <b>선생님 선물</b> <span class="muted small">모두 ${gl.reduce((a, x) => a + (Number(x.g) || 0), 0)}개</span></p>${gl.slice(0, 6).map((x) => `<div class="gift-row"><span>${md(x.at)}</span><b>💎 +${Number(x.g) || 0}</b></div>`).join('')}</div>`; } }
    const el = document.createElement('div'); el.className = 'modal camp-modal';
    el.innerHTML = `<div class="quiz-box framed rs-box"><h2>📮 우편함 · 복습 노트</h2>${giftHtml}${ntHtml}${g ? `<div class="rs-lv"><b>Lv.${g.lv} ${esc(g.title)}</b> <span class="muted small">EXP ${g.total}</span><div class="rs-bar"><i style="width:${Math.round((100 * g.into) / g.next)}%"></i><span>${g.into} / ${g.next}</span></div></div>` : ''}
      <p class="muted small">성적이 아니라 다음에 볼 것을 모아 둔 노트예요. 📌 복습 추천 개념은 🎯 복습 허수아비에서 그 차시를 골라 연습할 수 있어요.</p>${DS.Result.history(rec)}
      <div class="row"><button class="btn" id="nt-x">✕ 닫기</button><button class="btn primary" id="nt-bonus">🎯 복습 허수아비로</button></div></div>`;
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
          return `<div class="nt-les open"><b>${DS.Lessons.noText(x.L.no)}차시</b>${DS.Note.rows(x)}<div class="nt-go-list">${todo.map((q) => `<button class="btn small primary" data-go="${x.L.id}|${q.id}">🎯 바로 풀기 · ${esc(title(q.id))}</button>`).join('')}${bossTodo ? `<button class="btn small primary" data-go="${x.L.id}|boss">👑 형성평가 재대결</button>` : ''}</div></div>`; }).join('')}
        <p class="muted small">${DS.Note.icon('x')} 틀림 · ${DS.Note.icon('-')} 안 풂 → 「🎯 바로 풀기」로 허수아비에서 풀면 ${DS.Note.icon('p')} 복습 완료</p></div>
      <p class="muted small">학생은 자기 기록으로 이 창을 봐요. 성적이 아니라 다음에 볼 것을 모아 둔 노트예요.</p>
      <div class="row"><button class="btn" id="nt-x">✕ 닫기</button><button class="btn primary" id="nt-bonus">🎯 복습 허수아비로</button></div></div>`;
    document.body.appendChild(el);
    el.querySelector('#nt-x').onclick = () => el.remove();
    el.querySelector('#nt-bonus').onclick = () => { el.remove(); if (o.train) o.train(); };
    el.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => { el.remove(); if (o.go) o.go(...b.dataset.go.split('|')); }));
  }
  // 코드로 입장 (QR · 만약을 위해)
  function codeGate() {
    let last = ''; try { last = (JSON.parse(localStorage.getItem('citadel-student')) || {}).code || ''; } catch (e) { /* 무시 */ }
    const el = document.createElement('div'); el.className = 'modal camp-modal';
    el.innerHTML = `<div class="quiz-box framed"><h2>🌀 차원문</h2><p>아직 문이 닫혀 있어요. 선생님이 알려 준 <b>수업 코드 6자리</b>를 넣으면 던전 대기실로 넘어가요.</p>
      <input id="g-code" name="class-code" inputmode="numeric" maxlength="6" placeholder="6자리" autocomplete="off" data-1p-ignore data-lpignore="true" value="${esc(code0 || last)}">
      <div class="row"><button class="btn" id="g-x">✕ 닫기</button><button class="btn primary" id="g-go">⚔ 던전으로</button></div></div>`;
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
    if (!DS.Titles || (me.test && !(DS.Test && DS.Test.active && DS.Test.active()))) return false; // #47
    const k = `citadel-ttl-seen-${me.c}-${me.n}`;
    let seen = null; try { seen = JSON.parse(localStorage.getItem(k)); } catch (e) { /* 무시 */ }
    const got = DS.Titles.earned(await DS.Titles.data(me).catch(() => ({}))).filter((t) => !/^lv\d/.test(t.id));
    const fresh = got.filter((t) => !(seen || []).includes(t.id));
    try { localStorage.setItem(k, JSON.stringify(got.map((t) => t.id))); } catch (e) { /* 무시 */ }
    if (!fresh.length) return false;
    DS.UI.toast(`🏅 새 호칭 ${fresh.slice(0, 2).map((t) => `[${t.name}]`).join(' ')}${fresh.length > 2 ? ` 외 ${fresh.length - 2}개` : ''} 획득! 💎 상점에서 이름 앞에 달 수 있어요`, 4200);
    return true;
  }
  // 🏰 #69 (2026-11-11 선생님 「차시가 끝나면 성채 해금 팝업 · 던전 나오자마자」): 캠프 알림은 한 번에 하나씩 차례로 (닫으면 다음)
  //   ① 🏰 성채 해금(수업에서 막 나왔을 때만 · 전리품에서 이미 봤으면 건너뜀) → ② 📢 선생님 공지 → ③ 🏅 새 호칭 → ④ 📮 확인도장 띠 · 캠프 화면일 때만
  let afterL = null;
  const afterClass = (lid) => { afterL = lid || null; };
  const onCamp = () => document.getElementById('screen-camp').classList.contains('active') && ![...document.querySelectorAll('.modal:not(.nt-pop):not(.cq-pop)')].some((e) => !e.hidden && getComputedStyle(e).display !== 'none');
  const waitGone = (sel, max = 120e3) => new Promise((res) => { const t0 = Date.now(); const iv = setInterval(() => { if (!document.querySelector(sel) || Date.now() - t0 > max) { clearInterval(iv); res(); } }, 300); });
  // 📣 #96 개편 안내 창 (2026-11-11 선생님 「안내 창 더하고」): 개편 뒤 첫 접속 한 번 (accounts/…/seen96) · 바뀐 것 3줄 + 돌려받은 💎 · 📜 내역
  //   옛 구매(개편 뒤 표시 v: 96 없음)가 아직 남아 있으면 = 일괄 환불 전 → 띄우지 않고 기다림 · 🧪 테스트 · 👩‍🏫 체험판 · 선생님 = 없음
  async function revamp96(m) {
    if (!m || m.test || m.teacher || m.trial || m.c == null || !m.n || !DS.Gem) return false;
    const a = await DS.Net.get(`accounts/${ck(m.c)}/${m.n}`).catch(() => null); if (!a || a.seen96) return false;
    const d = await DS.Gem.mine(m).catch(() => null); if (!d) return false; const log = d.log || {};
    if (Object.keys(d.buy || {}).some((k) => /^(hero|fx)_/.test(k) && !log[`refund_${k}`] && Number((log[`buy_${k}`] || {}).v) !== 96)) return false; // 환불 전
    const rf = Object.entries(log).filter(([k]) => /^refund96_/.test(k)).map(([, v]) => v || {}), g = rf.reduce((x, v) => x + (Number(v.g) || 0), 0), sc = rf.reduce((x, v) => x + (Number(v.s) || 0), 0), nh = rf.reduce((x, v) => x + (Number(v.nh) || 0), 0), nf = rf.reduce((x, v) => x + (Number(v.nf) || 0), 0);
    const el = document.createElement('div'); el.className = 'modal rv96';
    el.innerHTML = `<div class="quiz-box framed rv96-box"><h2>⚔ 용사 · 스킬이 새로워졌어요</h2><ol class="rv96-l"><li>용사마다 자기 속성 스킬 4칸만 배우고 써요</li><li>공통 특화(베기 · 마법)는 없어졌어요</li><li>콤파 · 올드윈 → 🔮 마법 · 칸델 → 🌊 물 · 아바쿠 → ⚙ 기계</li></ol>
      ${g || sc ? `<div class="rv96-r"><span>💎 ${g}${sc ? ` · 📜 ${sc}` : ''} 를 돌려드렸어요</span><small>(용사 ${nh}명 + 스킬 ${nf}개)</small></div>` : ''}
      <p class="rv96-n">이번 한 번만 돌려드려요. 앞으로는 사면 끝! 돌려받은 💎 로 다시 고르면 돼요 · 값은 그대로</p><div class="row rv96-b"><button class="btn primary big" id="rv96-sk">⚔ 내 스킬 보러 가기</button><button class="btn big" id="rv96-ok">닫기</button></div></div>`;
    document.body.appendChild(el);
    const done = () => { el.remove(); DS.Net.update(`accounts/${ck(m.c)}/${m.n}`, { seen96: true, uid: a.uid }).catch(() => {}); };
    el.querySelector('#rv96-ok').onclick = done;
    { const iv = setInterval(() => { if (!el.isConnected) { clearInterval(iv); return; } if (!document.getElementById('screen-camp').classList.contains('active')) { clearInterval(iv); el.remove(); } }, 400); } // 🐞 #115 캠프를 떠나 수업 화면으로 가면 저절로 닫힘(확인 안 한 것 = 다음 캠프에서 다시 · 「확인」 · ✕ = 다시 안 뜸)
    el.querySelector('#rv96-sk').onclick = () => { done(); settings({ tab: 'gem' }); };
    return true;
  }
  let qTok = 0; // 캠프에 다시 들어오면 앞 차례는 멈춤 (두 줄이 겹쳐 뜨지 않게)
  async function campQueue(m, fromL) {
    if (!m || m.teacher) return;
    const tok = ++qTok, live = () => tok === qTok && onCamp();
    if (fromL) await castlePop(m, fromL);
    if (!live()) return;
    if (await revamp96(m).catch(() => false)) await waitGone('.rv96');
    if (!live()) return;
    if (DS.Mail && DS.Mail.noticePop) { const shown = await DS.Mail.noticePop(m, { ok: live, openMail: () => { const z = document.getElementById('camp-mail'); if (z) z.click(); else DS.Mail.open(m); } }).catch(() => false); if (shown) await waitGone('.nt-pop'); }
    if (!live()) return;
    if (await newTitles()) await new Promise((r) => setTimeout(r, 4300));
    if (!live()) return;
    stampBand();
  }
  function stampBand() {
    if (!stampToday() || stampSeen() || document.getElementById('camp-stamp')) return;
    const box = document.querySelector('#camp .camp-stage'); if (!box) return;
    box.insertAdjacentHTML('beforebegin', '<div class="stamp-bar" id="camp-stamp" title="누르면 닫혀요">📮 반드시 학습지 확인도장 받아가세요. <small>✕</small></div>');
    const sb = $('#camp-stamp'); stampMarkSeen(); sb.onclick = () => sb.remove(); setTimeout(() => { if (sb.isConnected) sb.remove(); }, 15000); // 한 번 보여 주고 15초 뒤 · 누르면 닫힘
  }
  async function castlePop(m, lid) {
    const L0 = DS.Lessons.get(lid); if (!L0 || !L0.no || L0.eval || !DS.Bonus || !DS.Bonus.roomsState) return;
    const flag = DS.Result && DS.Result.lootKey ? DS.Result.lootKey(m, L0) : ''; let seen = false; try { seen = !!(flag && localStorage.getItem(flag)); } catch (e) { /* 무시 */ }
    const k = ck(m.c), T = m.test && DS.Test && DS.Test.active && DS.Test.active();
    const [bonus, no] = await Promise.all([DS.Net.get(`bonus/${k}/${m.n}`).catch(() => null), T ? Promise.resolve(L0.no) : DS.Net.get(`unlock/${k}`).catch(() => 0)]);
    if (DS.Bonus.loadLocks) await DS.Bonus.loadLocks().catch(() => {});
    const upto = Math.max(Number(no) || 0, L0.no), rooms = [], bosses = [];
    const bk = `citadel-castle-bossopen-${k}-${m.n}`; let bseen = {}; try { bseen = JSON.parse(localStorage.getItem(bk)) || {}; } catch (e) { /* 무시 */ }
    (DS.Bonus.FLOORS || []).filter((f) => !DS.Bonus.floorIsOpen || DS.Bonus.floorIsOpen(f.id)).map((f) => DS.Lessons.get(f.id)).filter(Boolean).forEach((CL) => {
      const S = DS.Bonus.roomsState(CL, bonus || {}, upto);
      S.rooms.filter((r) => !r.boss && r.no === L0.no && S.isOpen(r)).forEach((r) => rooms.push(r.title || r.id));
      if (S.boss && S.bossOpen && !bseen[CL.id]) { bosses.push(CL.title || CL.id); bseen[CL.id] = 1; }
    });
    try { localStorage.setItem(bk, JSON.stringify(bseen)); if (flag) localStorage.setItem(flag, '1'); } catch (e) { /* 무시 */ }
    if ((seen || !rooms.length) && !bosses.length) return;
    if (!document.getElementById('screen-camp').classList.contains('active')) return;
    const list = seen ? [] : rooms;
    const el = document.createElement('div'); el.className = 'modal camp-modal cq-pop';
    el.innerHTML = `<div class="quiz-box framed rs-box cq-box"><h2>🏰 ${list.length ? `성채던전 새 방 ${list.length}개가 열렸어요!` : '성채던전 소식'}</h2>
      ${bosses.length ? `<p class="cq-boss">👑 보스 방이 열렸어요! <small>${bosses.map(esc).join(' · ')}</small></p>` : ''}
      ${list.length ? `<ul class="cq-list">${list.slice(0, 3).map((t) => `<li>${esc(t)}</li>`).join('')}${list.length > 3 ? `<li class="muted">외 ${list.length - 3}개</li>` : ''}</ul>` : ''}
      <div class="row"><button class="btn primary" id="cq-go">🏰 성채로 가기</button><button class="btn" id="cq-x">닫기</button></div></div>`;
    document.body.appendChild(el); if (DS.Sound && DS.Sound.correct) DS.Sound.correct();
    await new Promise((res) => {
      el.querySelector('#cq-x').onclick = () => { el.remove(); res(); };
      el.querySelector('#cq-go').onclick = () => { el.remove(); res(); const z = document.getElementById('camp-castle'); if (z) z.click(); };
    });
  }
  // ⚙ 설정: 용사 · 공격 이펙트 (잠긴 것은 🔒 + 조건)
  // ⚙ 설정 — opt.teacher (2026-11-04): 교사 캠프에서 선생님 모습 고르기 = 용사 18명 · 이펙트 · 호칭 모두 열림 · 이 기기에 저장 (수업 중이면 그 방 선생님 용사도 바로)
  async function settings(opt = {}) {
    if (opt.me && !opt.teacher) me = Object.assign({}, me || {}, opt.me); // 🏰 던전 안에서 열 때 (2026-11-06): 수업 화면의 내 정보
    const T = !!opt.teacher, tl = T ? DS.Art.teacherLook() : null;
    let L = T ? { heroes: Object.keys(DS.ASSETS.heroesV2.list).map((i) => ({ id: Number(i), open: true })), fx: DS.FX.KINDS.map((k) => ({ id: k, open: true })), seals: 0 } : await DS.Account.looks(me);
    // 2026-11-06 설정 v2: 탭 3개 (🧙 용사 · 💎 결정석 · 🏅 호칭) · 결정석 = 용사마다 1칸 (동시 사용 · 빼기 = 회수) · 친화 ★ = 공명
    let hero = T ? tl.hero : me.hero, title = T ? tl.title : me.title || 'none';
    const sock = Object.assign({}, (T ? tl.socket : me.socket) || {});
    if (sock[hero] == null && (T ? tl.fx : me.fx) && DS.FX.KINDS.includes(T ? tl.fx : me.fx) && (T ? tl.fx : me.fx) !== DS.FX.affOf(hero).ids[0]) sock[hero] = T ? tl.fx : me.fx; // 예전 계정: 쓰던 이펙트를 지금 용사 칸에
    const fxNow = () => DS.FX.crystalOf(hero, sock);
    let tab = opt.tab || (() => { try { return localStorage.getItem('citadel-settab') || 'enh'; } catch (e) { return 'enh'; } })();
    // 🧹 2026-11-07 정돈판: 「🧙 내 용사」 창 하나 (상점 + 능력치 + 업적 + 호칭) — 캠프 상태판에서 뺀 능력치 · 업적을 여기에
    let ST = null;
    if (!T && !me.test && me.c != null && me.n) { const k = ck(me.c), g0 = (p) => DS.Net.get(`${p}/${k}/${me.n}`).catch(() => null); const [rec, bonus, cards] = await Promise.all([g0('records'), g0('bonus'), g0('cards')]); const gr = DS.Grow ? await DS.Grow.mine(me).catch(() => null) : null; ST = { st: statsOf(rec, bonus, cards), cards: cards || {}, seals: DS.Bonus ? DS.Bonus.seals(bonus || {}).length : 0, g: gr }; }
    const TD = !T && DS.Titles ? await DS.Titles.data(me).catch(() => ({})) : {}, got = DS.Titles ? (T || me.test ? DS.Titles.all().map((t) => t.id) : DS.Titles.earned(TD).map((t) => t.id)) : []; // 🧪 체험판 · 교사: 호칭 모두
    const nmOf = (id) => (DS.FX.NAMES[id] || id).replace(/^\S+\s/, ''), tierTag = (id) => { const t = DS.FX.tierOf(id); return t === 's' ? '★' : ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ'][t] || ''; };
    const heroName = (h) => esc(DS.Lore ? DS.Lore.label(h) : ((DS.ASSETS.heroesV2.list[h] || {}).name) || ''); // 🧙 #73 「이름 · 직업」
    // 🧙 #98 내 용사 창 새 구조 (2026-11-11 선생님 「좋아 이대로 진행」 · 시안 v5 · DECISIONS 「🧙 내 용사 창 = 맨 위 내 용사 · 🔨 강화 탭 먼저 · ⚔ 스킬 저장/취소」)
    //   맨 위 = 지금 출전 용사(도트 · 강화 오라 · 이름표) → 누르면 용사 고르기 창 · 탭 🔨 강화(처음) · ⚔ 스킬 · 🏅 기록
    //   용사 사기 · 출전 바꾸기 · 강화 · 스킬 해금 · 스킬 끼우기 · 호칭 = 「고름」(💎 는 화면에서만 빠져 보임) → 아래 막대 [↺ 되돌리기] [💾 저장] · 저장 = 서버에 한 번에(반쯤 저장 없음) · 🌟 대성공 = 저장할 때
    if (!T && !['enh', 'gem', 'ttl'].includes(tab)) tab = 'enh'; if (T && tab === 'enh') tab = 'gem'; if (T && !['gem', 'ttl'].includes(tab)) tab = 'gem';
    const H0 = hero, SOCK0 = JSON.stringify(sock), TTL0 = title, TN = ['—', 'Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ'];
    let P = { heroes: [], enh: 0, sk: [] }; // 고른 것 (저장 전)
    const ENH = DS.Gem.ENH, lv0 = () => L.enh || 0, lvNow = () => lv0() + P.enh;
    const hOf = (id) => L.heroes.find((x) => x.id === id) || { id, open: !!T };
    const fxOf = (id) => L.fx.find((x) => x.id === id) || { id, open: !!T };
    const cost = () => { let g = 0, s = 0; P.heroes.forEach((id) => { const h = hOf(id); if (h.shop) g += h.shop.price; }); for (let k = 1; k <= P.enh; k++) { const c = ENH[lv0() + k]; g += c.g; s += c.s || 0; } P.sk.forEach((id) => { const f = fxOf(id); if (f.shop) { g += f.shop.price; s += f.shop.scroll || 0; } }); return { g, s }; };
    const gemLeft = () => (L.gem || 0) - cost().g, scrLeft = () => (L.scroll || 0) - cost().s;
    const ownsH = (id) => T || !!hOf(id).open || P.heroes.includes(id);
    const ownsF = (id, h = hero) => { if (T || P.sk.includes(id)) return true; const f = fxOf(id); if (f.open) return true; if (f.got) { const lad = DS.FX.ladder(h), i = lad.indexOf(id); return i > 0 && ownsF(lad[i - 1], h); } return false; }; // 🏆 받은 칸 = 앞 칸을 가지면 씀
    const stageOf = (h) => { const lad = DS.FX.ladder(h); let n = 0; lad.forEach((id, i) => { if (ownsF(id, h)) n = i + 1; }); return n; };
    const dirty = () => !!(P.heroes.length || P.enh || P.sk.length || hero !== H0 || JSON.stringify(sock) !== SOCK0 || title !== TTL0);
    const afIc = (h) => DS.FX.affOf(h).name.split(' ')[0];
    // 🔵 #98 ⑦ 「지금 살 수 있는 것 n개」 줄 대신 = 칸 · 탭의 파란 점
    const dot = (on) => (on ? '<i class="mh-dot" title="지금 살 수 있어요"></i>' : '');
    const canH = (id) => { const h = hOf(id); return !T && !ownsH(id) && !!h.shop && gemLeft() >= h.shop.price; };
    const canEnh = () => { const nx = !T && ENH[lvNow() + 1]; return !!nx && gemLeft() >= nx.g && scrLeft() >= (nx.s || 0); };
    const canSk = () => { if (T) return false; const lad = DS.FX.ladder(hero), i = lad.findIndex((id) => !ownsF(id)); if (i < 0) return false; const f = fxOf(lad[i]); return !!f.shop && gemLeft() >= f.shop.price && scrLeft() >= (f.shop.scroll || 0); };
    const MOVED96 = [7, 27, 28, 32], NEW96 = () => Date.now() < Date.parse('2026-11-19T23:59:59+09:00'); // ✨ #96 옮긴 4명 · 사다리 위 한 줄 = 개편 뒤 1주
    const achOpen = (h) => !T && DS.FX.ladder(h).some((id) => { const f = fxOf(id); return (f.open || f.got) && !f.bought && !f.free && DS.FX.FANCY.includes(id); }); // 🏆 이미 열린 칸
    let demoN = 0; // ⚔ 미리보기: 고른 용사가 고른 스킬로 공격 (근접 = 돌진 · 원거리 = 탄)
    const demo = (fx0) => { const ap = el.querySelector('#ap'); if (!ap || !DS.Attack) return; const n = ++demoN, fx = fx0 || fxNow(); DS.Attack.preload(hero, fx); setTimeout(() => { if (n === demoN && ap.isConnected) DS.Attack.play(ap, { heroBox: ap.querySelector('.ap-hero'), monBox: ap.querySelector('.ap-mon'), hero, fx, s: 0.85, ps: 1, rest: 'idle' }); }, 120); };
    const el = document.createElement('div'); el.className = 'modal camp-modal';
    const preview = () => `<div class="atk-prev" id="ap"><div class="ap-hero">${DS.Art.hero(hero, 'idle')}</div><div class="ap-mon">${DS.Art.monster('castle2:0', 'idle', 'float')}</div></div>`;
    const pend = (on) => (on ? '<i class="mh-pend">고름</i>' : '');
    // ── 맨 위 = 지금 출전 용사 ──
    const meTop = () => { const lo = DS.Lore ? DS.Lore.of(hero) : null, st = stageOf(hero), lv = T ? 0 : lvNow();
      const nm = DS.Titles ? DS.Titles.nameHtml({ title, nick: T ? '선생님' : me.name, num: T ? null : me.n }, { size: 16 }) : esc(T ? '선생님' : me.name || '');
      return `<button class="mh-top" id="mh-top" type="button"><div class="mh-stage enh-stage${DS.Gem.auraCls(lv)}">${DS.Art.hero(hero, 'idle', 'huff')}</div>
        <div class="mh-txt"><div class="mh-plate">${!T && ST && ST.g ? `<span class="mh-lv">Lv ${ST.g.lv}</span>` : ''}${nm}</div><b>${esc(lo ? lo.name : '')}${pend(hero !== H0)}</b><small>${esc(lo ? lo.job : '')} · ${esc(DS.FX.affOf(hero).name)} · 스킬 ${TN[st]}${!T && lv ? ` · +${lv}` : ''}</small><small class="mh-chg">🔄 용사 바꾸기${T ? '' : ' · 새로 사기'}${dot(L.heroes.some((x) => canH(x.id)))}</small></div></button>`; };
    // ── 🔨 강화 = 모든 용사 한 판 ──
    const enhTab = () => { const lv = lvNow(), nx = ENH[lv + 1];
      const cells = L.heroes.map((h) => { const o = ownsH(h.id), st = o ? stageOf(h.id) : 0; return `<span class="mh-pc${o ? '' : ' lock'}${h.id === hero ? ' cur' : ''}"><u>${afIc(h.id)}</u>${DS.Art.hero(h.id, 'idle')}${o ? `<em>${TN[st]}</em><i>+${lv}</i>` : '<i>🔒</i>'}</span>`; }).join('');
      return `<div class="mh-lvl"><b>+${lv}</b>${pend(P.enh > 0)}<small>모든 용사에게 함께 붙어요</small></div><div class="mh-party" id="mh-party">${cells}</div>
        ${nx ? `<button class="btn primary big" id="enh-go"${gemLeft() >= nx.g && scrLeft() >= (nx.s || 0) ? '' : ' disabled'}>🔨 +${lv + 1} 으로 강화 · 💎 ${nx.g}${nx.s ? ` · 📜 ${nx.s}` : ''}</button>` : '<p class="gold center">🌈 최고 단계 +10</p>'}`; };
    // ── ⚔ 스킬 = 지금 용사 사다리 4칸 위 Ⅰ → 아래 Ⅳ ──
    const ULT = (t) => (t === 3 ? ['⚡', '🌟'] : t === 2 ? ['⚡'] : []);
    const verdict = (id) => { const t = DS.FX.tierOf(id); return t === 's' ? '🪶 특별 스킬 · 연출 그대로' : t === 3 ? '⚡ 필살기 · 🌟 진필살기 모두 가능' : t === 2 ? '⚡ 필살기 가능 · 🌟 진필살기는 Ⅳ 부터' : '필살기 없음 · ⚡ 는 Ⅲ 부터'; };
    const nextIdx = () => DS.FX.ladder(hero).findIndex((id) => !ownsF(id));
    const skCell = (id, i) => { const f = fxOf(id), t = DS.FX.tierOf(id), mine = ownsF(id), pk = P.sk.includes(id), on = id === fxNow(), nx = i === nextIdx();
      const st = pk ? 'pend' : mine ? 'have' : nx ? 'next' : 'shut';
      const sub = pk ? `고름 · 💎 ${f.shop ? f.shop.price : 0}${f.shop && f.shop.scroll ? ` · 📜 ${f.shop.scroll}` : ''}` : mine ? (on ? '끼움' : '✔ 가짐') : nx ? (f.shop ? `💎 ${f.shop.price}${f.shop.scroll ? ` · 📜 ${f.shop.scroll}` : ''}` : f.cond || '') : `${TN[i]} 먼저`;
      return `<button class="fxpick lad-c ${st}${on ? ' on' : ''}" data-fx="${id}" data-i="${i}"><i class="tier">${TN[i + 1]}</i><canvas width="96" height="56" data-still="${id}"></canvas><span>${esc(nmOf(id))}${ULT(t).map((u) => ` <i class="sk-ult">${u}</i>`).join('')}</span><small>${esc(sub)}</small></button>`; };
    let skPick = null;
    const gemTab = () => { const sp = DS.FX.ACHV.filter((id) => T || fxOf(id).open), pk = skPick || fxNow();
      return `${preview()}${NEW96() ? '<p class="lad-tip">이제 용사마다 자기 속성 스킬만 · 다른 속성은 그 용사로</p>' : ''}<p class="me-sec">${esc(DS.FX.affOf(hero).name)} · 위 Ⅰ → 아래 Ⅳ</p><div class="lad">${DS.FX.ladder(hero).map(skCell).join('<i class="sk-line"></i>')}</div>
        <p class="lad-verdict" id="lad-v"><b>${esc(nmOf(pk))}</b> · ${esc(verdict(pk))}</p>
        ${sp.length ? `<p class="me-sec">🪶 특별</p><div class="sk-sp">${sp.map((id) => `<button class="fxpick lad-c have${id === fxNow() ? ' on' : ''}" data-fx="${id}" data-sp="1"><i class="tier">★</i><canvas width="96" height="56" data-still="${id}"></canvas><span>${esc(nmOf(id))}</span></button>`).join('')}</div>` : ''}
        <div class="lad-rule"><span>⚡ 필살기 = 내 속성 Ⅲ · Ⅳ + 첫 시도 퍼펙트</span><span>🌟 진필살기 = 3연속 퍼펙트 + 내 속성 Ⅳ</span></div>`; };
    const recTab = () => { if (T || !ST) return ttlTab(); const U = DS.Unit ? DS.Unit.CARDS.length : 0, ho = L.heroes.filter((h) => h.open).length, md = Object.values(L.medal || {}).reduce((a, b) => a + (Number(b) || 0), 0);
      return `<p class="me-sec">🏆 업적</p><div class="me-ach"><span>🏆 업적<b>${ST.seals} / ${DS.Bonus ? DS.Bonus.UNLOCK[DS.Bonus.UNLOCK.length - 1] : 10}</b></span><span>📚 도감<b>${Object.keys(ST.cards).length} / ${U}</b></span><span>🧑 용사<b>${ho} / ${L.heroes.length}</b></span><span>🎖 메달<b>${md}</b></span></div>
        <div class="me-stats">${STATS.map(([id, , nm]) => `<span>${({ str: '💪', grit: '🛡', focus: '🎯', brave: '👑', explore: '🧭', craft: '⚒' })[id]} ${nm}<b>${ST.st[id] || 0}</b></span>`).join('')}</div>
        <p class="me-next">다음 업적 · ${nextReward(L, ST.cards, ST.seals)}</p><p class="me-sec">🏅 호칭 고르기</p>${ttlTab()}`; };
    const ttlTab = () => `<div class="ttl-grid">${[{ id: 'none', name: '달지 않기', tier: 'w', cond: '' }, ...DS.Titles.all()].map((t) => { const has = t.id === 'none' || got.includes(t.id); return `<button class="ttl-pick ${DS.Titles.TIER[t.tier].cls}${t.id === title ? ' on' : ''}${has ? '' : ' lock'}" data-ttl="${t.id}" title="${esc(t.cond || '')}">${has ? DS.Titles.medal(t, 22) : '🔒'}<span>${esc(t.name)}</span>${has ? '' : `<small>${esc(t.cond)}</small>`}</button>`; }).join('')}</div>`;
    // ── 용사 고르기 창 (아래에서 올라옴) ──
    let pickH = hero, sheetOn = false;
    const portrait = (n) => { const Pt = DS.ASSETS.heroPortraits, c = Pt && Pt.list && Pt.list[n]; return c ? `<i class="hc-img" style="background-image:url('${DS.ASSETS.base}${Pt.src}');background-size:${Pt.cols * 100}% ${Pt.rows * 100}%;background-position:${(c[0] / Math.max(1, Pt.cols - 1)) * 100}% ${(c[1] / Math.max(1, Pt.rows - 1)) * 100}%"></i>` : DS.Art.hero(n, 'idle'); };
    const ladLine = (h) => DS.FX.ladder(h).map((id, i) => `${esc(nmOf(id))} ${TN[i + 1]}${ULT(DS.FX.tierOf(id)).join('')}`).join(' → ');
    const awkDet = () => { // 🌟 #73 각성한 로안 = 고르는 칸이 아님 · 조건 4개 체크 (로안 · 10강 · 쌍월 참 · 호칭)
      const AW = DS.Art.AWAKE, on = DS.Art.awake({ hero, enh: lvNow(), fx: fxNow(), title }), lo = DS.Lore && DS.Lore.of(AW.to), t2 = DS.Titles && DS.Titles.get(AW.title);
      const ck = [[hero === AW.hero, '로안'], [lvNow() >= AW.enh, `${AW.enh}강`], [DS.FX.crystalOf(AW.hero, sock) === AW.fx, nmOf(AW.fx)], [title === AW.title, '호칭']];
      return `<div class="mh-det"><div class="hc-port${on ? '' : ' dim'}">${portrait(AW.to)}</div><div><b>${on && lo ? esc(lo.name) : '???'}</b><small>호칭으로 깨어나는 모습 · 모습만 바뀌고 데미지 · 보상은 같아요</small>${on && lo ? `<em>「${esc(lo.nick)}」</em><p>${esc(lo.a)}</p>` : `<p>🏅 호칭 「${esc(t2 ? t2.name : '만 번째 베기')}」</p>`}<p class="awk-ck">${ck.map(([ok, t]) => `<span class="${ok ? 'ok' : 'no'}">${ok ? '✔' : '✕'} ${esc(t)}</span>`).join(' ')}</p></div></div>`; };
    const sheetHtml = () => { const h = hOf(pickH), lo = DS.Lore ? DS.Lore.of(pickH) : null, o = ownsH(pickH), r = DS.Attack && DS.Attack.isRanged(pickH), af = DS.FX.affOf(pickH);
      let cta;
      if (o) cta = pickH === hero ? '<button class="btn big" disabled>✔ 지금 출전 중</button>' : '<button class="btn primary big" id="hs-set">⚔ 이 용사로 출전</button>';
      else if (h.shop) cta = P.heroes.includes(pickH) ? '<button class="btn big" disabled>고름 ✔</button>' : `<button class="btn primary big" id="hs-buy"${gemLeft() >= h.shop.price ? '' : ' disabled'}>💎 ${h.shop.price} · 사기</button>`;
      else cta = '<button class="btn big" disabled>🔒 조건으로 열어요</button>';
      const cond = o || !h ? '' : h.chal ? `🔓 ${esc(((DS.Account.CHAL || {})[pickH] || {}).cond || h.cond || '')} · ${h.chal.n} / ${h.chal.need}` : !h.shop ? esc(h.cond || '') : '';
      const list = L.heroes.map((x) => { const ox = ownsH(x.id); return `<button class="mh-hc${ox ? '' : ' lock'}${x.id === pickH ? ' sel' : ''}${x.id === hero ? ' cur' : ''}" data-hp="${x.id}"><u>${afIc(x.id)}</u>${DS.Art.hero(x.id, 'idle')}<small>${ox ? `스킬 ${TN[stageOf(x.id)]}` : x.shop ? `🔒 💎${x.shop.price}` : '🔒'}</small>${P.heroes.includes(x.id) ? '<i class="mh-pend">고름</i>' : dot(canH(x.id))}</button>`; }).join('') + (T ? '' : `<button class="mh-hc lock${pickH === DS.Art.AWAKE.to ? ' sel' : ''}" data-hp="${DS.Art.AWAKE.to}" data-awk="1">${DS.Art.hero(DS.Art.AWAKE.to, 'idle')}<small>?</small></button>`);
      if (pickH === DS.Art.AWAKE.to) return `<div class="mh-sheet" id="mh-sheet">${awkDet()}<div class="row mh-hs-b"><button class="btn big" id="hs-x">↩ 돌아가기</button><button class="btn big" disabled>🌟 조건을 채우면 저절로</button></div><div class="mh-list">${list}</div></div>`;
      return `<div class="mh-sheet" id="mh-sheet"><div class="mh-det"><div class="hc-port${o ? '' : ' dim'}">${portrait(pickH)}</div><div><b>${esc(o && lo ? lo.name : lo ? lo.name : '')}</b><small>${esc(lo ? lo.job : '')} · ${r ? '🏹 원거리' : '🗡 근접'} · ${esc(af.name)}${o ? ` · 스킬 ${TN[stageOf(pickH)]}` : ''}</small>${lo ? `<em>「${esc(lo.nick)}」</em><p>${esc(lo.a)}</p>` : ''}<p class="mh-lad">${ladLine(pickH)}</p>${MOVED96.includes(pickH) && NEW96() ? '<i class="hc-new">속성 바뀜 ✨</i> ' : ''}${achOpen(pickH) ? '<i class="hc-ach">🏆 이미 열린 칸</i>' : ''}${cond ? `<p class="mh-cond">${cond}</p>` : ''}</div></div>
        <div class="row mh-hs-b"><button class="btn big" id="hs-x">↩ 돌아가기</button>${cta}</div><div class="mh-list">${list}</div></div>`; };
    // ── 저장 막대 ──
    const barHtml = () => { if (!dirty()) return ''; const c = cost(), it = [];
      if (hero !== H0) it.push(`출전 용사 → ${esc((DS.Lore && DS.Lore.of(hero) || {}).name || '')}`);
      P.heroes.forEach((id) => it.push(`용사 사기 ${esc((DS.Lore && DS.Lore.of(id) || {}).name || '')}`));
      if (P.enh) it.push(`강화 +${lv0()} → +${lvNow()}`); if (P.sk.length) it.push(`스킬 ${P.sk.length}칸`);
      if (JSON.stringify(sock) !== SOCK0) it.push(`끼울 스킬 → ${esc(nmOf(fxNow()))}`); if (title !== TTL0) it.push('호칭 바꿈');
      return `<div class="mh-bar" id="mh-bar"><p class="mh-list2">바뀔 것: ${it.join(' · ')}${c.g || c.s ? ` · 💎 ${c.g}${c.s ? ` · 📜 ${c.s}` : ''}` : ''}</p><p><b>저장하기 전까진 되돌릴 수 있어요.</b>${c.g || c.s ? ' <span class="w">💾 저장하면 끝 · 이제 못 돌려받아요.</span>' : ''}</p><div class="row"><button class="btn big" id="mh-undo">↺ 되돌리기</button><button class="btn primary big" id="set-ok">💾 저장</button></div></div>`; };
    // ── 저장 = 서버에 한 번에 ──
    async function saveAll() {
      const fx = fxNow();
      if (T) { await DS.Art.setTeacherLook({ hero, fx, title, socket: sock }, { room: opt.room }); el.remove(); DS.UI.toast('선생님 모습을 바꿨어요!'); if (opt.onSave) await opt.onSave({ hero, fx, title }); return; }
      const c = cost(); let great = 0;
      if (P.heroes.length || P.enh || P.sk.length) {
        if (me.test && DS.Test && !DS.Test.active()) throw Object.assign(new Error('테스트 모드에서만 살 수 있어요.'), { user: true });
        const d = await DS.Gem.mine(me), tot = Number(d.total) || 0, sc = Number(d.scroll) || 0, lv = Number(d.enh) || 0;
        if (tot < c.g) throw Object.assign(new Error(`💎 조각이 ${c.g - tot}개 모자라요.`), { user: true });
        if (sc < c.s) throw Object.assign(new Error(`📜 서술 조각이 ${c.s - sc}개 모자라요.`), { user: true });
        if (lv !== lv0()) throw Object.assign(new Error('다른 화면에서 강화가 바뀌었어요 — 창을 다시 열어 주세요.'), { user: true });
        const gp = `gem/${ck(me.c)}/${me.n}`, U = {}, TS = DS.Net.TS; // 🐞 #116 (11/12 학생 「저장 누르면 실패」): 서버 맨 위 한 번 쓰기 → 그동안 잘 되던 💎 칸 한 번 + 용사 칸 한 번
        const buy = (kind, id, p, s) => { const k = `${kind}_${id}`; if ((d.buy || {})[k]) throw Object.assign(new Error('이미 해금한 것이 있어요 — 창을 다시 열어 주세요.'), { user: true }); U[`buy/${k}`] = TS; U[`log/buy_${k}`] = { g: -p, ...(s ? { s: -s } : {}), at: TS, why: '상점 해금', v: 96 }; };
        P.heroes.forEach((id) => buy('hero', id, hOf(id).shop.price, 0));
        P.sk.forEach((id) => { const f = fxOf(id); buy('fx', id, f.shop.price, f.shop.scroll || 0); });
        let back = 0;
        for (let k = 1; k <= P.enh; k++) { const e = ENH[lv + k], g2 = Math.random() < DS.Gem.GREAT, b = g2 ? Math.floor(e.g / 2) : 0; back += b; if (g2) great++; U[`log/enh_${lv + k}`] = { g: -e.g + b, ...(e.s ? { s: -e.s } : {}), at: TS, why: `🔨 강화 +${lv + k}${g2 ? ' 🌟 대성공' : ''}` }; }
        if (P.enh) U.enh = lv + P.enh;
        U.total = tot - c.g + back; if (c.s) U.scroll = sc - c.s;
        try { await DS.Net.update(gp, U); } catch (e) { throw Object.assign(new Error(`💾 저장 실패(💎) — ${e.message || e}`), { user: true }); } // 💎 · 구매 · 강화 = 한 칸 한 번 (반쯤 저장 없음)
        if (great) setTimeout(() => DS.UI.toast(`🌟 강화 대성공 ${great}번! 💎 ${back}개 돌려받았어요`, 3600), 400);
        if (P.enh && DS.Sound) { if (lv + P.enh === 10 && DS.Sound.awaken) DS.Sound.awaken(); else DS.Sound.correct(); }
      }
      { const was = DS.Art.awake({ hero: me.hero, enh: lv0(), fx: me.fx, title: me.title }), now = DS.Art.awake({ hero, enh: lvNow(), fx, title }); let seen = false; try { seen = localStorage.getItem('citadel-awake-seen') === '1'; } catch (e) { /* 무시 */ } if (now && !was && !seen && DS.Attack && DS.Attack.cutin) { try { localStorage.setItem('citadel-awake-seen', '1'); } catch (e) { /* 무시 */ } setTimeout(() => DS.Attack.cutin(DS.Art.AWAKE.to, fx, { peek: true, name: '🌟 각성한 로안' }), 300); } } // 🌟 #73 처음 한 번 변신 컷인
      if (me.test) DS.Test.setLook(hero, fx);
      else { // 용사 · 스킬 · 호칭 = 용사 칸 한 번 (옛 setLook 의 「잠긴 이펙트」 검사 대신 이 창의 가짐 판정 · 사다리 밖 = Ⅰ)
        const fx2 = ownsF(fx) ? fx : DS.FX.ladder(hero)[0], sk2 = {}; Object.entries(sock).forEach(([h, k]) => { if (k && (DS.FX.inLadder(Number(h), k)) && (ownsF(k, Number(h)) || DS.FX.ACHV.includes(k))) sk2[h] = k; });
        const A = { hero: Number(hero), fx: String(fx2), socket: Object.keys(sk2).length ? sk2 : null }; if (title !== TTL0) A.title = title;
        try { await DS.Net.update(`accounts/${me.c}/${me.n}`, A); } catch (e) { throw Object.assign(new Error(`💾 저장 실패(용사) — ${e.message || e}`), { user: true }); }
      }
      me.title = title; me.hero = hero; me.fx = fx; me.socket = sock; me.enh = lvNow(); el.remove();
      if (opt.onSave) { await opt.onSave({ hero, fx, title }); DS.UI.toast('💾 저장했어요 · 지금 던전에도 바로 적용돼요'); return; }
      DS.UI.toast('💾 저장했어요'); render();
    }
    const close = () => { if (!dirty()) { el.remove(); return; } if (el.querySelector('.mh-ask')) return;
      const a = document.createElement('div'); a.className = 'mh-ask'; a.innerHTML = '<div class="framed"><p>저장 안 한 것이 있어요</p><div class="row"><button class="btn big" id="ask-drop">버리기</button><button class="btn primary big" id="ask-save">💾 저장</button></div></div>';
      el.appendChild(a); a.querySelector('#ask-drop').onclick = () => el.remove(); a.querySelector('#ask-save').onclick = () => { a.remove(); DS.Control.run(saveAll); }; a.onclick = (e) => { if (e.target === a) a.remove(); }; };
    const draw = () => { const sb = el.querySelector('.set-box'), keep = sb ? sb.scrollTop : 0;
      const tabs = T ? [['gem', '⚔ 스킬'], ['ttl', `🏅 호칭 <small>${got.length}</small>`]] : [['enh', `🔨 강화${dot(canEnh())}`], ['gem', `⚔ 스킬${dot(canSk())}`], ['ttl', '🏅 기록']];
      el.innerHTML = `<div class="quiz-box framed set-box mh-box"><div class="set-head">${T ? '<h2>🧙 선생님 모습</h2>' : `<h2 class="me-h"><span>🧙 내 용사</span><b class="g">💎 ${gemLeft()}</b><b class="s">📜 ${scrLeft()}</b></h2>`}<button class="btn" id="set-x" aria-label="닫기">✕</button></div>
        ${meTop()}<div class="set-tabs">${tabs.map(([k, n]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${n}</button>`).join('')}</div>
        ${tab === 'enh' && !T ? enhTab() : tab === 'gem' ? gemTab() : recTab()}
        ${barHtml()}${sheetOn ? sheetHtml() : ''}</div>`;
      { const sb2 = el.querySelector('.set-box'); if (sb2) sb2.scrollTop = keep; }
      paintStills(el);
      { const ap = el.querySelector('#ap'); if (ap) ap.onclick = () => demo(); }
      el.querySelector('#set-x').onclick = close;
      el.querySelector('#mh-top').onclick = () => { pickH = hero; sheetOn = true; DS.Sound.clank(); draw(); };
      el.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { tab = b.dataset.tab; try { localStorage.setItem('citadel-settab', tab); } catch (e) { /* 이 기기에만 */ } DS.Sound.clank(); const sb3 = el.querySelector('.set-box'); if (sb3) sb3.scrollTop = 0; draw(); if (tab === 'gem') demo(); }));
      { const eg = el.querySelector('#enh-go'); if (eg) eg.onclick = () => { const nx = ENH[lvNow() + 1]; if (!nx || gemLeft() < nx.g || scrLeft() < (nx.s || 0)) { DS.UI.toast('💎 가 모자라요', 2000); return; } P.enh++; DS.Sound.clank(); draw(); const pa = el.querySelector('#mh-party'); if (pa) { pa.classList.remove('glow'); void pa.offsetWidth; pa.classList.add('glow'); } }; }
      el.querySelectorAll('.lad [data-fx], .sk-sp [data-fx]').forEach((b) => (b.onclick = () => { const id = b.dataset.fx, i = Number(b.dataset.i); skPick = id;
        if (b.dataset.sp || ownsF(id)) { if (P.sk.includes(id)) { P.sk = P.sk.filter((x) => DS.FX.ladder(hero).indexOf(x) < i); } else { sock[hero] = id; demo(id); } DS.Sound.clank(); draw(); return; }
        if (i !== nextIdx()) { DS.UI.toast(`🔒 ${TN[i]} 먼저`, 2200); vPatch(); return; }
        const f = fxOf(id); if (!f.shop) { DS.UI.toast(`🔒 ${f.cond || '해금 조건은 추후 공개'}`, 3000); return; }
        if (gemLeft() < f.shop.price || scrLeft() < (f.shop.scroll || 0)) { DS.UI.toast(gemLeft() < f.shop.price ? `💎 조각이 ${f.shop.price - gemLeft()}개 모자라요` : `📜 서술 조각이 ${(f.shop.scroll || 0) - scrLeft()}개 모자라요`, 2600); demo(id); vPatch(); return; }
        P.sk.push(id); DS.Sound.clank(); draw(); demo(id); }));
      el.querySelectorAll('[data-ttl]').forEach((b) => (b.onclick = () => { if (b.classList.contains('lock')) { DS.UI.toast(`🔒 ${b.title}`, 2600); return; } title = b.dataset.ttl; DS.Sound.clank(); draw(); }));
      { const u = el.querySelector('#mh-undo'); if (u) u.onclick = () => { P = { heroes: [], enh: 0, sk: [] }; hero = H0; title = TTL0; Object.keys(sock).forEach((k) => delete sock[k]); Object.assign(sock, JSON.parse(SOCK0)); skPick = null; DS.Sound.clank(); DS.UI.toast('↺ 모두 되돌렸어요', 1800); draw(); demo(); }; }
      { const s = el.querySelector('#set-ok'); if (s) s.onclick = () => DS.Control.run(saveAll); }
      // 용사 고르기 창
      if (sheetOn) {
        el.querySelector('#hs-x').onclick = () => { sheetOn = false; draw(); };
        el.querySelectorAll('[data-hp]').forEach((b) => (b.onclick = () => { pickH = Number(b.dataset.hp); DS.Sound.clank(); peek(pickH); draw(); }));
        { const s = el.querySelector('#hs-set'); if (s) s.onclick = () => { hero = pickH; skPick = null; sheetOn = false; DS.Sound.clank(); draw(); demo(); }; }
        { const s = el.querySelector('#hs-buy'); if (s) s.onclick = () => { const h = hOf(pickH); if (!h.shop || gemLeft() < h.shop.price) { DS.UI.toast('💎 가 모자라요', 2000); return; } P.heroes.push(pickH); DS.Sound.clank(); draw(); }; }
      }
    };
    const vPatch = () => { const v = el.querySelector('#lad-v'), pk = skPick || fxNow(); if (v) v.innerHTML = `<b>${esc(nmOf(pk))}</b> · ${esc(verdict(pk))}`; };
    const peekSeen = () => { try { return JSON.parse(localStorage.getItem('citadel-hero-peek')) || {}; } catch (e) { return {}; } };
    const peek = (n) => { const sn = peekSeen(); if (sn[n] || !DS.Attack || !DS.Attack.cutin) return; sn[n] = 1; try { localStorage.setItem('citadel-hero-peek', JSON.stringify(sn)); } catch (e) { /* 이 기기에만 */ } const lockd = !ownsH(n) && !T, lo = DS.Lore && DS.Lore.of(n); DS.Attack.cutin(n, DS.FX.crystalOf(n, sock), { peek: true, name: lockd ? '???' : lo ? lo.name : '', sub: !lockd && lo && lo.say ? `「${lo.say}」` : '' }); };
    let skIO = null;
    const paintStills = (root) => {
      root.querySelectorAll('canvas[data-still]:not([data-lazy])').forEach((c) => DS.FX.still(c, c.dataset.still));
      const lz = [...root.querySelectorAll('canvas[data-still][data-lazy]')]; if (!lz.length) return;
      if (typeof IntersectionObserver !== 'function') { lz.forEach((c) => DS.FX.still(c, c.dataset.still)); return; }
      if (skIO) skIO.disconnect();
      skIO = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; skIO.unobserve(e.target); DS.FX.still(e.target, e.target.dataset.still); }), { rootMargin: '60px' });
      lz.forEach((c) => skIO.observe(c));
    };
    el.addEventListener('click', (e) => { if (e.target === el) { e.stopPropagation(); close(); } }, true); // 창 바깥 = 닫기 (저장 안 한 것이 있으면 한 번 물음)
    draw(); document.body.appendChild(el); if (tab === 'gem') demo();
  }
  const back = () => (me ? enter(me) : null);
  return { afterClass, teacher: () => !!(me && me.teacher), noteDemo, enter, back, settings, shelf: (all, only) => shelf(all, only), refresh: () => { if (document.getElementById('camp-forge')) status(); }, stampToday, markStamp: () => { try { localStorage.setItem('citadel-stamp', today()); } catch (e) { /* 무시 */ } } };
})();
