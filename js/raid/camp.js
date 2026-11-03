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
  let me = null, fireT = 0, code0 = '', live = null, liveStop = null, liveSeen = '', roomSt = null, roomStop = null, roomCode = '';
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const today = () => new Date().toISOString().slice(0, 10);
  const stampToday = () => { try { return localStorage.getItem('citadel-stamp') === today(); } catch (e) { return false; } };

  async function enter(m, code) {
    me = m; code0 = code || '';
    DS.UI.show('screen-camp');
    if (!m.test) DS.Scene.save({ role: 'camp' });
    render();
    tut = null; tutLoad().then(tutApply);
    if (liveStop) liveStop();
    liveStop = DS.Net.watch(`live/${ck(m.c)}`, (v) => {
      const was = live; live = v && v.open && !DS.Raid.liveOpen(v, Date.now()) ? Object.assign({}, v, { open: false }) : v;
      if (!document.getElementById('screen-camp').classList.contains('active')) return;
      watchRoom(); drawGate(); tutApply();
      if (live && live.open && (!was || !was.open || was.code !== live.code) && liveSeen !== live.code) { liveSeen = live.code; showGate(); status(); DS.Sound.correct(); DS.UI.toast(`⚔ ${live.no ? `${live.no}차시 ` : ''}던전이 열렸어요! 오른쪽 빛나는 문을 눌러 들어가요`, 4200); }
    });
    if (code0) setTimeout(codeGate, 300); // QR 로 들어왔으면 코드 창을 바로
  }
  const D = () => DS.ASSETS.dungeons;
  // 한 화면에 전체가 보이므로 차원문이 열리면 반짝 강조만
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
    ['#camp-castle', '🏰 성채 · 중단원던전', '배운 차시마다 <b>성벽 등불이 하나씩 켜지는</b> 혼자 도전 던전이에요. 보강 몬스터 · 형성평가 재대결 · 꼭대기 집합 관문! 한 층을 다 깨면 등불이 금빛(🟪 인장), 인장을 모으면 화려한 공격 이펙트가 열려요!'],
    ['#camp-dummy', '🎯 훈련 허수아비', '지난 차시 문제를 <b>숫자만 바꿔</b> 연습해요. 기록은 남지 않고 경험치가 조금 쌓여요. 시험 전에 딱!'],
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
    DS.CampScene.gate(document.querySelector('#camp .camp-stage'), on);
    el.classList.toggle('open', on);
    const lb = el.querySelector('.camp-label');
    if (lb) lb.innerHTML = on ? `⚔ ${live.no ? `${live.no}차시 ` : ''}입장!` : '🔒 차시 던전'; el.setAttribute('aria-label', on ? `${live.no ? `${live.no}차시 ` : ''}${name} 입장` : '차시 던전 (닫힘)');
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
        ${S.zone('camp-castle', 'castle', '🏰 집합 중단원던전')}${S.zone('camp-tent', 'tent', '⛺ 텐트 · 책장')}
        <button class="cs-zone camp-gate-z" id="camp-gate" style="${S.box(c.zones.gate)}" aria-label="차시 던전"><span class="camp-label">🔒 차시 던전</span></button>
        <button class="camp-anvil cs-int" id="camp-anvil" aria-label="모루">${sheet(c.anvil, c.anvil.states.idle, 0, 'camp-anvil-img')}<span class="camp-label">⚒ 모루</span></button>
        <div class="camp-fire"><i class="camp-glow"></i><i class="camp-glow g2"></i>${sheet(c.fire, 0, 0, 'camp-fire-img', '')}</div>
        <div class="camp-hero">${DS.Art.hero(me.hero, 'sit', 'huff')}<i class="shadow"></i><div class="camp-plate"><span class="lv" id="camp-lv">Lv.-</span><span class="nm">${DS.Titles ? DS.Titles.nameHtml({ title: me.title || 'none', nick: me.name }, { num: false, size: 14 }) : esc(me.name)}</span></div></div>
        ${prop('dummy', '🎯', '허수아비', '')}${prop('mail', '📮', '우편함', '')}
      </div>
      <div class="camp-bar"><button class="btn small" id="camp-code">코드로 입장</button></div>
      <div class="camp-forge panel framed st-panel" id="camp-forge"><p class="muted small">용사 상태를 불러오는 중…</p></div>`;
    status();
    $('#camp-anvil').onclick = () => pick('#camp-anvil', () => (me.test ? DS.Forge.open(me, { preview: true, no: 99 }) : DS.Forge.open(me))); // 🧪 체험판: 모든 레시피
    $('#camp-castle').onclick = () => pick('#camp-castle', () => DS.Control.run(() => DS.Bonus.enter(me)));
    $('#camp-gate').onclick = () => {
      if (live && live.open) { if (tutMode === 'A') { tutMark('a'); tutClear(); } return pick('#camp-gate', () => DS.Control.run(() => enterCode(live.code)), 'portal'); }
      nope('#camp-gate');
      if (live) DS.UI.toast('지난 던전은 닫혔어요. 선생님이 다음 수업을 열면 문에 다시 빛이 들어와요.', 3200);
      else DS.UI.toast('아직 열린 던전이 없어요. 선생님이 수업을 열면 오른쪽 문에 빛이 들어와요.', 3200);
    };
    if (DS.Grow) DS.Grow.mine(me).then((g) => { const el = document.getElementById('camp-lv'); if (el && g) el.textContent = `Lv.${g.lv}`; }).catch(() => {});
    newTitles();
    $('#camp-code').onclick = codeGate;
    $('#camp-mail').onclick = () => pick('#camp-mail', () => { if (cues.mark) cues.mark('mail'); DS.Control.run(note); });
    $('#camp-tent').onclick = () => pick('#camp-tent', () => { if (cues.mark) cues.mark('tent'); DS.Control.run(shelf); });
    $('#camp-dummy').onclick = () => pick('#camp-dummy', () => DS.Control.run(() => DS.Bonus.enter(me, { train: true })));
    $('#camp-set').onclick = settings;
    drawGate();
    animateFire();
    document.querySelectorAll('#camp .camp-prop').forEach((e) => e.classList.add('cs-int'));
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
    const [rec, bonus, cards, no, evo] = await Promise.all([get('records'), get('bonus'), get('cards'), DS.Net.get(`unlock/${k}`).catch(() => 0), DS.Net.get(`evalOpen/${k}`).catch(() => null)]);
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
    const stage = document.querySelector('#camp .camp-stage'), states = DS.CampScene.floorStates(me.test ? 99 : Number(no) || 0, sealed);
    DS.CampScene.lamps(stage, states, me.test ? [] : DS.CampScene.freshLamps(`citadel-lamps-${k}-${me.n}`, states));
    DS.CampScene.flag(stage, TD.bonus && ((TD.bonus['eval-1'] || {}).eb || {}).clear ? 'gold' : (evo || {})['eval-1'] ? 'open' : '');
    cues(rec, owned, Number(no) || 0);
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
    const el = document.createElement('div'); el.className = 'modal camp-modal';
    el.innerHTML = `<div class="quiz-box framed rs-box"><h2>📮 우편함 · 복습 노트</h2>${g ? `<div class="rs-lv"><b>Lv.${g.lv} ${esc(g.title)}</b> <span class="muted small">EXP ${g.total}</span><div class="rs-bar"><i style="width:${Math.round((100 * g.into) / g.next)}%"></i><span>${g.into} / ${g.next}</span></div></div>` : ''}
      <p class="muted small">성적이 아니라 다음에 볼 것을 모아 둔 노트예요. 📌 복습 추천 개념은 🟪 중단원던전(그 차시 층)에서 연습할 수 있어요.</p>${DS.Result.history(rec)}
      <div class="row"><button class="btn" id="nt-x">닫기</button><button class="btn primary" id="nt-bonus">🟪 중단원던전으로</button></div></div>`;
    document.body.appendChild(el);
    el.querySelector('#nt-x').onclick = () => el.remove();
    el.querySelector('#nt-bonus').onclick = () => { el.remove(); pick('#camp-castle', () => DS.Control.run(() => DS.Bonus.enter(me))); };
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
  async function settings() {
    const L = await DS.Account.looks(me);
    let hero = me.hero, fx = me.fx || 'flame', title = me.title || 'none';
    const TD = DS.Titles ? await DS.Titles.data(me).catch(() => ({})) : {}, got = DS.Titles ? (me.test ? DS.Titles.all().map((t) => t.id) : DS.Titles.earned(TD).map((t) => t.id)) : []; // 🧪 체험판: 호칭 모두
    const el = document.createElement('div'); el.className = 'modal camp-modal';
    const draw = () => {
      el.innerHTML = `<div class="quiz-box framed set-box"><div class="set-head"><h2>⚙ 설정</h2><button class="btn" id="set-x">닫기</button><button class="btn primary" id="set-ok">저장</button></div>
        <p class="shelf-title">내 용사</p><div class="heroes set-grid">${L.heroes.map((h) => `<button class="hpick${h.id === hero ? ' on' : ''}${h.open ? '' : ' lock'}" data-h="${h.id}" title="${esc(h.cond || '')}">${DS.Art.hero(h.id, h.id === hero ? 'attack' : 'idle')}${h.open ? '' : '<b class="lk">🔒</b>'}</button>`).join('')}</div>
        <p class="muted small">✨ 추가 용사: ① 1~3차시 도감 <b>${L.got} / ${L.need}</b>장 · ② 🎁 첫 레이드 클리어 · ③ 4~6차시 도감 · ④ 7~10차시 도감 · 나머지는 추후 공개</p>
        <p class="shelf-title">🏅 호칭 <span class="muted small">얻은 ${got.length}개 · 고른 호칭이 이름 앞에 붙어요</span></p>
        <div class="ttl-grid">${[{ id: 'none', name: '달지 않기', tier: 'w', cond: '' }, ...DS.Titles.all()].map((t) => { const has = t.id === 'none' || got.includes(t.id); return `<button class="ttl-pick ${DS.Titles.TIER[t.tier].cls}${t.id === title ? ' on' : ''}${has ? '' : ' lock'}" data-ttl="${t.id}" title="${esc(t.cond || '')}">${has ? DS.Titles.medal(t, 22) : '🔒'}<span>${esc(t.name)}</span>${has ? '' : `<small>${esc(t.cond)}</small>`}</button>`; }).join('')}</div>
        <p class="shelf-title">공격 이펙트 <span class="muted small">화려한 이펙트 = 🟪 던전 인장 ${L.seals || 0}개 모음</span></p><div class="fxs">${L.fx.map((f) => `<button class="fxpick${f.id === fx ? ' on' : ''}${f.open ? '' : ' lock'}" data-fx="${f.id}"><canvas width="150" height="90" data-still="${f.id}"></canvas><span>${f.open ? DS.FX.NAMES[f.id] : `🔒 ${esc(f.cond || '추후 공개')}`}</span></button>`).join('')}</div>
      </div>`; // v0.9.3: 닫기 · 저장은 맨 위 (사용자 요청)
      el.querySelectorAll('canvas[data-still]').forEach((c) => DS.FX.still(c, c.dataset.still));
      el.querySelectorAll('[data-h]').forEach((b) => (b.onclick = () => { const h = L.heroes.find((x) => x.id === Number(b.dataset.h)); if (!h.open) { DS.UI.toast(`🔒 ${h.cond}`); return; } hero = h.id; DS.Sound.clank(); draw(); }));
      el.querySelectorAll('[data-fx]').forEach((b) => (b.onclick = () => { const f = L.fx.find((x) => x.id === b.dataset.fx); if (!f.open) { DS.UI.toast(`🔒 ${f.cond || '해금 조건은 추후 공개'} — 중단원던전에서 인장을 모아요`, 3200); return; } fx = f.id; draw(); DS.FX.play(el.querySelector(`[data-fx="${fx}"]`), fx, { scale: 0.45 }); DS.Sound.hit(); }));
      el.querySelectorAll('[data-ttl]').forEach((b) => (b.onclick = () => { if (b.classList.contains('lock')) { DS.UI.toast(`🔒 ${b.title}`, 2600); return; } title = b.dataset.ttl; DS.Sound.clank(); draw(); }));
      el.querySelector('#set-x').onclick = () => el.remove();
      el.querySelector('#set-ok').onclick = () => DS.Control.run(async () => { if (me.test) DS.Test.setLook(hero, fx); else { await DS.Account.setLook(hero, fx); if (title !== (me.title || 'none')) await DS.Account.setTitle(title); } me.title = title; me.hero = hero; me.fx = fx; el.remove(); DS.UI.toast('저장했어요! 다음 입장부터 적용돼요.'); render(); });
    };
    draw(); document.body.appendChild(el);
  }
  const back = () => (me ? enter(me) : null);
  return { enter, back, settings, shelf: (all) => shelf(all), refresh: () => { if (document.getElementById('camp-forge')) status(); }, stampToday, markStamp: () => { try { localStorage.setItem('citadel-stamp', today()); } catch (e) { /* 무시 */ } } };
})();
