// 학생 화면 (스마트폰): 모닥불 → 차원문(수업 코드) → 던전 단체 대기실 → [개념 설명(집중모드) → 몬스터와 1:1 대치] … → 보스(형성평가)
//   → 클리어(📮 확인도장 · 🏕 대기실로 이동) → 단체 대기실(마지막 한마디 · 만점이면 ⚒ 모루) → 수업 끝 → 모닥불
// 몬스터: 소문제를 모두 풀고 제출하면 바로 채점 → 공격 성공(내 이펙트) / 부분 성공 / 실패 → 재도전 3번까지(숫자가 모두 바뀜)
// 문제는 언제나 앱에 전부 보인다. 첫 시도(세트1)는 위에 작은 "📄 학습지 문제 n (k)" 꼬리표, 재도전(세트2)은 "🔄 숫자가 바뀌었어요".
// 집중모드(state.focus)가 켜지면 어떤 장면이든 위에 반투명 막 + 빨간 ⚠ WARNING 으로 멈춘다.
window.DS = window.DS || {};

DS.Student = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc, pretty } = DS.UI;
  const Raid = () => DS.Raid;
  let code = null, L = null, R = null, raw = null, me = null, stop = null;
  let form = null;          // 풀고 있는 시도 { key, given: [] }
  let retrying = '';        // '몬스터id|다음 시도' — "다시 도전"을 누른 상태
  let shown = '';           // 결과 연출을 한 번만
  let bossSet = 1, bossThink = 0;
  let drawn = '';           // 지금 그려 둔 화면의 서명 — 다른 학생의 제출로 방 값이 바뀌어도 내 화면은 다시 그리지 않는다 (터치가 씹히지 않게)

  let info0 = null, focusWas = false, cleared0 = false, locked = false;
  let heroFx = null, heroFxT = null, heroBack = ['idle', 'huff']; // v2 용사 잠깐 동작 (힐 받음 · 힐 쓰기) · 끝나면 돌아갈 자세
  let test = null;
  const real = () => !test || !!test.real; // 👩‍🏫 교사 체험판 (2026-11-07): 테스트 화면 + 실제 학생처럼 기록 · 💎 · EXP (메모리 저장소라 남지 않음)          // 🧪 테스트 모드: { prep: 학습지 이미지, exit() } — 이 기기 안에서만, 집중모드 대신 학습지 이미지
  async function enter(c, info, opt = {}) {
    test = opt.test || null;
    cleared0 = false; resulted = false; drawn = ''; shown = ''; form = null; retrying = ''; bossSet = 1; othersSeen = {};
    an = null; thSeen = null; phaseWas = 0; chestDone = {}; chestQ = []; chestBusy = false; batPaid = ''; endPaid = ''; // v0.9.11
    if (DS.Gem && info && info.cls != null && info.num) { const gd = await DS.Gem.mine({ c: info.cls, n: info.num }).catch(() => null); if (gd && gd.enh) info.enh = Number(gd.enh); } // 🔨 강화 단계 → 교실 TV 이름표 · 빛
    await DS.Act.join(c, info);
    if (DS.Attack && DS.Attack.preloadFaces && DS.Attack.canUlt(info.fx, info.hero)) DS.Attack.preloadFaces(); // ⚡ 필살기 조건이면 얼굴 그림 미리
    if (DS.Gem && DS.Gem.watchGifts && !test) DS.Gem.watchGifts({ c: info.cls, n: info.num });
    if (DS.Usage && !test) { const um = { c: info.cls, n: info.num }; DS.Usage.visit(um); DS.Usage.join(um, c); } // 📈 접속 · 수업 참여 // 🎁 던전 · 대기실에서도 선물 알림
    code = c; info0 = info; lastStep = null; lastOx = null; dirty = false; clearTimeout(saveT);
    me = DS.Net.uid();
    if (!test) { try { localStorage.setItem('citadel-student', JSON.stringify({ code: c, ...info })); } catch (e) { /* 무시 */ } }
    DS.UI.show('screen-student'); atkStart();
    if (!test) DS.Scene.save({ role: 'student', code: c });
    DS.Act.presence(c).catch(() => {});
    if (DS.Survey && !test && info.cls != null) DS.Survey.watch({ c: info.cls, n: info.num }, () => { if (R && L) { drawn = ''; render(); } });
    locked = !!(info.cls && (await DS.Net.get(`wordLock/${String(info.cls).replace(/[.#$/[\]]/g, '_')}/${info.num}`).catch(() => null)));
    if (stop) stop();
    stop = DS.Net.watch(`rooms/${code}`, (v) => {
      if (!v) return;
      raw = v; R = DS.Act.unpackRoom(v);
      { const nq = Object.keys(R.oxq || {}).length; if (nq !== lastOx) { if (lastOx !== null) dirty = true; lastOx = nq; } } // ⭕ OX 타임 결과도 다음 저장 때 기록에
      { const st = (R.state || {}).step ?? -1; if (lastStep !== null && st !== lastStep && dirty) setTimeout(saveNow, 300 + Math.random() * 2500); lastStep = st; } // 단계가 바뀌면 저장 (18명이 한꺼번에 몰리지 않게 조금씩 늦춤)
      L = DS.Lessons.get(R.meta.lesson); if (L && L.id !== DS.Art._entered) { DS.Art._entered = L.id; DS.Art.lessonEnter(L); } // v0.9.6 차시별 다운로드
      if (real() && DS.Gem && R.state && R.state.clearLeft != null && Raid().activeIds(R).includes(me) && clearPaid !== code) { clearPaid = code; DS.Gem.add(acc(), DS.Gem.G.clear, `clear_${code}`, '⏰ 시간 안 클리어').catch(() => {}); }
      xpWatch();
      render();
      thrillWatch();
    });
  }
  // ── v0.9.11 🔥 반 콤보 · ✨ 퍼펙트 · 👑 보스 단계 · 🦇 황금 박쥐 · 🎁 보물 상자 ─────────────
  let an = null, thSeen = null, phaseWas = 0, chestDone = {}, chestQ = [], chestBusy = false, batPaid = '', endPaid = '';
  function thrillWatch() {
    if (!L || !R || !DS.Combo || !DS.Thrill) return;
    an = DS.Combo.analyze(L, R, DS.Net.now());
    const first = !thSeen; if (first) thSeen = {};
    an.ev.forEach((e) => { const k = `${e.u}|${e.k}`; if (thSeen[k]) return; thSeen[k] = true; if (!first && e.u === me && e.pf) setTimeout(() => DS.Thrill.perfect(e.streak, e.bind), 700); });
    an.marks.forEach((m) => { const k = `t${m.at}|${m.n}`; if (thSeen[k]) return; thSeen[k] = true; if (!first) DS.Thrill.tierNote(m.n); });
    const st = Raid().stepOf(L, R), bh = Raid().bossHp(L, R);
    if (st && st.kind === 'boss' && !bh.won && !Raid().isClosed(R)) { const ph = DS.Combo.bossPhase(bh.max ? bh.left / bh.max : 1); if (phaseWas && ph.phase > phaseWas) DS.Thrill.phaseNote(ph); phaseWas = ph.phase; } else phaseWas = 0;
    if (real()) chestCheck();
    comboTick();
  }
  function chestCheck() {
    if (!DS.Gem || !info0 || info0.cls == null || !Raid().activeIds(R).includes(me)) return;
    L.steps.filter((s) => s.kind === 'monster' && L.monsters[s.id]).forEach((s) => {
      if (chestDone[s.id] || !Raid().cleared(L, R, s.id)) return; chestDone[s.id] = true;
      if (Raid().record(L, R, s.id, me).best > 0) chestQ.push({ code, mid: s.id, uid: me, streak3: ((an && an.streak[me]) || 0) >= 3 });
    });
    const b = DS.Combo.bat(L, R, DS.Net.now());
    if (b && !b.live && b.ok && batPaid !== `${code}|${b.at}`) {
      batPaid = `${code}|${b.at}`;
      DS.Gem.add(acc(), DS.Gem.G.bat, `bat_${code}`, '🦇 황금 박쥐 포획').catch(() => {});
      const mine = (R.batA || {})[me]; if (mine && (mine === 'o') === !!(b.q || {}).a) chestQ.push({ code, mid: 'bat', uid: me, force: true });
    }
    chestNext();
  }
  function chestNext() {
    if (chestBusy || !chestQ.length) return; chestBusy = true;
    const c = chestQ.shift();
    DS.Gem.chest(acc(), c).then((r) => { if (!r) { chestBusy = false; chestNext(); return; } setTimeout(() => DS.Thrill.chestOpen(r, () => { chestBusy = false; chestNext(); }), 1400); }).catch(() => { chestBusy = false; });
  }
  // 200ms 마다: 콤보 배지 · 박쥐 창 (박쥐가 끝나는 순간 콤보 +3 이 들어가게 다시 계산)
  function comboTick() {
    if (!L || !R || !DS.Combo || !DS.Thrill) return;
    const now = DS.Net.now(), b = DS.Combo.bat(L, R, now);
    if (b && !b.live && b.ok && an && !an.ev.some((e) => e.kind === 'bat')) return thrillWatch();
    const cb = document.getElementById('st-combo');
    if (cb) { const live = !Raid().isLobby(R) && !Raid().isClosed(R) && !myP().lobby; const h = live ? DS.Thrill.badge(DS.Combo.comboNow(an, R, now)) : ''; if (cb.innerHTML !== h) cb.innerHTML = h; }
    if (!(R.active || {})[me] || DS.Thrill.batShut(b) || Raid().isClosed(R)) { DS.Thrill.batPhone(null); return; }
    DS.Thrill.batPhone(b, (R.batA || {})[me], (v) => DS.Act.batAnswer(code, v).then(() => DS.Sound.clank()).catch((e) => DS.UI.toast(e.message || '시간이 끝났어요.')));
  }
  // 수업이 끝날 때: 🔥 반 최고 콤보를 깬 사슬에 낀 용사 💎 +3 · 🏁 반대항 보상
  function endRewards() {
    if (!real() || !DS.Gem || !DS.Combo || !info0 || info0.cls == null || !L || !R || endPaid === code || !Raid().activeIds(R).includes(me)) return;
    endPaid = code;
    const a = DS.Combo.analyze(L, R), was = Number((R.meta || {}).comboBest) || 0;
    if (a.best >= 10 && a.best > was && a.bestUsers.includes(me)) DS.Gem.add(acc(), DS.Gem.G.comboBest, `combo_${code}`, `🔥 반 최고 콤보 ${a.best}!`, { free: true }).catch(() => {});
    if (DS.Punch && !DS.Act.punchOff(R)) DS.Punch.reward(acc(), L, R, code).catch(() => {});
  }
  // 🆙 몬스터를 쓰러뜨리는 순간 내 용사 머리 위 +EXP · 보스 처치 +EXP (처음 들어왔을 때 이미 쓰러진 것은 빼고)
  let xpSeen = null;
  function xpWatch() {
    if (!L || !R || !real()) return;
    const ids = L.steps.filter((s) => s.kind === 'monster' && L.monsters[s.id]).map((s) => s.id), first = !xpSeen;
    if (first) xpSeen = {};
    ids.forEach((mid) => { if (!Raid().cleared(L, R, mid) || xpSeen[mid]) return; xpSeen[mid] = true; const x = DS.Control.xpOf(Raid().record(L, R, mid, me)); if (!first && x) setTimeout(() => DS.Control.xpFloat(document.querySelector('#st-body .enc-hero') || document.querySelector('#st-body'), `+${x} EXP`), 400); });
    if (Raid().bossHp(L, R).won && !xpSeen.boss) { xpSeen.boss = true; if (!first && Raid().bossAnswered(R, me)) setTimeout(() => DS.Control.xpFloat(document.querySelector('#st-body .enc-hero') || document.querySelector('#st-body'), '+10 EXP 보스 처치!', 'big'), 500); }
  }
  // 🎉 레벨업 (모두가 봄 · 2026-11-05): 폰 축하 + 수업 중이면 종합상황실에 알림 (rooms/{코드}/lvup/{uid})
  if (typeof window !== 'undefined') window.addEventListener('ds-levelup', (e) => {
    const { after, m } = e.detail || {}; if (!after || !info0 || !m || Number(m.n) !== Number(info0.num)) return;
    // 2026-11-05 수업에서: 개념 설명 · 형성평가 중에 화면 전체 덮개가 문제를 가림 → 수업 중에는 위쪽 작은 띠 (화면을 덮지 않음) · 수업 밖(캠프 등)은 크게
    const inClass = !!(code && R && !Raid().isClosed(R));
    const o = document.createElement('div'); o.className = inClass ? 'lvup-mini' : 'lvup-full';
    o.innerHTML = inClass ? `<b>🎉 LEVEL UP!</b> Lv.${after.lv} <span>${esc(after.title)}</span>` : `<div><p>🎉 LEVEL UP!</p><b>Lv.${after.lv}</b><span>${esc(after.title)}</span></div>`;
    document.body.appendChild(o); if (DS.Sound.levelup) DS.Sound.levelup(); else DS.Sound.correct(); setTimeout(() => o.remove(), inClass ? 3200 : 2800);
    if (code && R && real() && !Raid().isClosed(R)) DS.Net.set(`rooms/${code}/lvup/${me}`, { lv: after.lv, at: DS.Net.TS }).catch(() => {});
  });
  let clearPaid = '';
  const acc = () => ({ c: info0.cls, n: info0.num, name: info0.nick, hero: info0.hero, fx: info0.fx, title: info0.title });
  // 💾 진행 저장 (v0.9.7.6 → v0.9.8.0 줄임 · 사용자 확정): ① 선생님이 다음 단계로 넘길 때 ② 형성평가는 마지막 답 10초 뒤 한 번 ③ 앱을 내리거나 닫을 때
  //   → 수업 끝 전에 나가도 대시보드 · EXP 가 남는다 · 기록 목록은 한 번만 읽고 바뀐 게 없으면 안 씀 (테스트 모드는 저장 안 함)
  let saveT = null, lastStep = null, dirty = false, lastOx = null;
  const canSave = () => real() && DS.Result && info0 && info0.cls != null && info0.num && L && R && me && Raid().activeIds(R).includes(me);
  function saveNow() { clearTimeout(saveT); saveT = null; if (!dirty || !canSave()) return; dirty = false; DS.Result.save(L, R, me, acc(), code, null, null, { cache: true }).catch(() => { dirty = true; }); }
  function saveSoon(ms = 10000) { dirty = true; clearTimeout(saveT); saveT = setTimeout(saveNow, ms); }
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveNow(); });
    window.addEventListener('pagehide', saveNow);
  }
  // 수업이 끝나면 모닥불로
  // v0.8.0: 수업이 끝나면 ⚔ 오늘의 전투 결과(개인) → 모닥불 (「⚔ 보강던전」 추천을 누르면 보강던전으로)
  function toCamp() {
    endRewards();
    if (stop) stop(); stop = null; focus(false); atkStop(); DS.Thrill && DS.Thrill.batPhone(null); { const cb = document.getElementById('st-combo'); if (cb) cb.innerHTML = ''; }
    const t = test; test = null;
    const go = (bonus) => { if (t) { t.exit(); return; } if (bonus && DS.Bonus) DS.Bonus.enter(acc(), { train: true }); else DS.Camp.enter(acc()); };
    if (DS.Result && L && R && me && Raid().activeIds(R).includes(me)) return DS.Result.show(L, R, me, t ? null : acc(), code, go, { force: true }).catch(() => go()); // 2026-11-03: 수업이 끝나면 언제나 ⚔ 개인 결과 → 모닥불 (학급 결과는 대기실 버튼)
    go();
  }
  const stop0 = () => { saveNow(); if (stop) stop(); stop = null; focus(false); atkStop(); test = null; if (DS.Thrill) DS.Thrill.batPhone(null); const cb = document.getElementById('st-combo'); if (cb) cb.innerHTML = ''; };
  // 집중모드 막
  function focus(on) {
    const el = $('#focus');
    if (!on) { el.hidden = true; focusWas = false; return; }
    const step = Raid().stepOf(L, R);
    el.hidden = false;
    el.innerHTML = `<div class="focus-top"><b>⚠ WARNING</b><span>선생님에게 주목하세요</span></div>
      <div class="focus-body"><p class="focus-step">${step ? esc(step.title) : ''}</p>${step && step.say ? `<p class="focus-say">${pretty(step.say)}</p>` : ''}<p class="muted small">화면이 잠깐 멈췄어요. 선생님이 풀어 주면 이어서 해요.</p></div>`;
    if (!focusWas) { focusWas = true; DS.Sound.warn(); if (navigator.vibrate) navigator.vibrate([80, 60, 80]); }
  }
  const myP = () => (R.players || {})[me] || {};

  // 🧹 2026-11-07 정돈판: 전투(몬스터 · 보스) 중에는 위 카드 대신 장면 위에 ◀ · 무대 이름 · 💬 · 💎 칩 (scTop) — 버튼 id 는 한 곳에만
  const battleNow = () => { if (!R || Raid().isLobby(R) || Raid().restOn(R) || Raid().isEnd(L, R) || myP().lobby || !(R.active || {})[me]) return false; const st = Raid().stepOf(L, R); return !!st && (st.kind === 'monster' || st.kind === 'boss'); };
  let gemN = null, gemAt = 0;
  function gemRefresh(force) {
    if (!real() || !DS.Gem || !info0 || info0.cls == null || (!force && Date.now() - gemAt < 15000)) return;
    gemAt = Date.now();
    DS.Gem.mine(acc()).then((d) => { const n = Number((d || {}).total) || 0, up = gemN != null && n > gemN; gemN = n; document.querySelectorAll('.sc-gn').forEach((e) => { e.textContent = n; if (up) { e.classList.remove('up'); void e.offsetWidth; e.classList.add('up'); } }); }).catch(() => {});
  }
  const openFb = () => (focusLock() ? DS.UI.toast('👀 집중모드가 끝나면 보내 주세요') : DS.Feedback.open({ c: info0.cls, n: info0.num, name: info0.nick }, { code, where: 'dungeon' }));
  const openShop = () => (focusLock() ? DS.UI.toast('👀 집중모드에는 상점을 열 수 없어요') : DS.Control.run(() => DS.Camp.settings({ me: { c: info0.cls, n: info0.num, name: info0.nick, hero: myP().hero, fx: myP().fx, title: myP().title, socket: info0.socket }, onSave: async (v) => {
    await DS.Net.update(`rooms/${code}/players/${me}`, { hero: v.hero, fx: v.fx, title: v.title || 'none' }).catch(() => {}); info0.hero = v.hero; info0.fx = v.fx; info0.title = v.title; drawn = ''; render(); gemRefresh(true);
  } })));
  function bindTop() {
    const fb = $('#st-fb'); if (fb) fb.onclick = openFb;
    const sb = $('#st-set'); if (sb) sb.onclick = openShop;
    const bk = $('#st-back'); if (bk) bk.onclick = () => DS.Nav.leave(); // 확인 창 = nav.js ASK (수업에서 나갈까요?)
  }
  const unitShort = () => String(L.unit || '').replace(/^공통수학\s*\d\s*/, '').replace(/\s*·\s*[\d·]+차시\s*$/, '');
  const titleShort = () => { const t = String(L.title || '').split(' · ')[0]; return t.length > 11 ? `${t.slice(0, 10)}…` : t; };
  const scTop = () => `<div class="sc-top"><button class="sc-rb" id="st-back" aria-label="메뉴화면 (수업에서 나가기)">◀</button><span class="sc-stage"><small>${esc(unitShort())}</small><b>${L.no ? `${DS.Lessons.noText(L.no)}차시 · ` : ''}${esc(titleShort())}</b></span>${test ? '' : `<button class="sc-rb sm" id="st-fb" aria-label="의견 보내기"${focusLock() ? ' disabled' : ''}>💬</button><button class="sc-gem${focusLock() ? ' off' : ''}" id="st-set" aria-label="💎 마정석 · 내 용사"${focusLock() ? ' disabled' : ''}>💎 <b class="sc-gn">${gemN == null ? '·' : gemN}</b><i>＋</i></button>`}</div>`;
  // HP 칸: HP 막대 · 몬스터 공격 게이지(주황 줄) · ⏳ 보스 문 남은 시간 (2026-11-07 결정 3: HP 칸 안에 한 줄)
  const hpBox = (left, max, gauge, label = 'HP') => `<div class="sc-hp"><b class="sc-l">${label}</b><div class="sc-bar"><i style="width:${max ? (100 * left) / max : 0}%"></i></div><span class="sc-n">${left} / ${max}</span>${gauge ? `<span class="sc-a">공격</span>${gauge}` : '<span></span><span></span>'}<span class="sc-door"></span></div>`;
  function header() {
    const p = myP(), step = Raid().stepOf(L, R);
    document.getElementById('screen-student').classList.toggle('st-battle', battleNow());
    gemRefresh();
    Promise.resolve().then(() => { const lk = focusLock(); document.querySelectorAll('#st-set, #st-fb').forEach((b) => { b.disabled = lk; b.classList.toggle('off', lk); }); }); // 👀 집중모드 = 💬 · 💎 잠금 (장면을 다시 그리지 않아도)
    if (battleNow()) { $('#st-head').innerHTML = ''; return; }
    // 2026-11-07 정돈판 비교 10: 대기실 · 설명 · 마무리도 전투와 같은 위 칸 (동그란 ◀ · 무대 이름 · 💬 · 💎 칩) — 장면 대신 얇은 띠
    const badge = Raid().isLobby(R) || myP().lobby ? '대기실' : Raid().isEnd(L, R) ? '마무리' : step.kind === 'boss' ? '보스' : step.kind === 'monster' ? (step.special ? '스페셜' : '전투') : '설명';
    $('#st-head').innerHTML = `<div class="sc-top flat">${scTop().replace(/^<div class="sc-top">/, '').replace(/<\/div>$/, '')}</div><div class="st-plate">${DS.Art.hero(p.hero || 0, 'idle', 'me')}<b>${DS.Titles ? DS.Titles.nameHtml(p, { beon: true }) : `${p.num}번 ${esc(p.nick || '')}`}</b><span class="st-badge">${badge}</span></div>`;
    bindTop(); // 💬 버그 · 의견 (2026-11-06) · 💎 = 내 용사 창
  }
  const focusLock = () => !!(R && Raid().focusOn(R) && !Raid().isLobby(R)); // 👀 집중모드: 학생 설정 잠금 (2026-11-06 사용자)
  // v0.9.3 긴급 (사용자 요청): 🙋 도움 요청 버튼 없앰 — 수업 중에는 학생이 직접 손을 든다. 교사 폰의 「재도전까지 못 맞힘 · 2분째 미제출」 알림은 그대로
  const helpBtn = () => '';
  function bindHelp() {}

  function render() {
    if (Raid().isClosed(R)) return toCamp();
    if (!R.players || !R.players[me]) { $('#st-body').innerHTML = '<div class="panel"><p>입장 정보가 없어요. 처음 화면에서 다시 입장해 주세요.</p></div>'; return; }
    header();
    { const tb = $('#st-tbar'); if (tb) { const sig = `${Raid().deadline(R)}|${Raid().isClosed(R)}|${Raid().bossHp(L, R).won}`; if (tb.dataset.sig !== sig) { tb.dataset.sig = sig; tb.innerHTML = test ? '' : DS.Control.tbarHtml(L, R, { mini: true, compact: true }); } } }
    focus((!test || !!test.real) && Raid().focusOn(R) && !Raid().isLobby(R) && !Raid().restOn(R)); // 👩‍🏫 체험판은 집중모드 화면도 실제처럼
    if (test && test.onRender) test.onRender(L, R);
    const body = $('#st-body');
    const st0 = Raid().stepOf(L, R);
    if (!st0 || st0.kind !== 'monster') drawn = '';
    if (Raid().isLobby(R)) return lobbyView(body, false);
    if (Raid().restOn(R)) return DS.Fun && DS.Fun.on(R) ? DS.Fun.phone(body, R, me, code) : restView(body); // 🏕 쉼터: 쓰던 답(form)은 그대로 두고 장면만
    if (!(R.active || {})[me]) { body.innerHTML = '<div class="panel framed center"><p>⏳ 늦게 들어왔어요 — <b>다음 몬스터부터</b> 함께해요!</p><p class="muted small">잠시 뒤에도 그대로면 선생님께 말씀드려요 (선생님 폰이나 큰 화면이 켜져 있어야 들어가져요)</p></div>'; return; }
    if (Raid().canLobby(L, R, me) && !cleared0) { cleared0 = true; DS.Camp.markStamp(); }
    if (Raid().isEnd(L, R) && !resulted) showResult(); // 마무리 단계가 되면 아직 못 본 학생도 결과를 본다
    if (myP().lobby) return lobbyView(body, true);
    if (Raid().isEnd(L, R)) return endView(body);
    const step = Raid().stepOf(L, R);
    if (step.kind === 'monster') { const pt = Raid().petrify(R, step.id); sage = !!(pt && DS.Net.now() < pt.until && !Raid().record(L, R, step.id, me).perfect); monsterView(body, step); petri(body, step); if (test || Raid().activeIds(R).length <= 6) othersFx(step, body); return; }
    if (step.kind === 'boss') return bossView(body);
    if (test) { // 테스트 모드: 개념 설명 = 학습지 이미지를 폰에 크게
      const img = (test.prep.img || {})[step.id], sig = `concept|${step.id}|${img ? img.length : 0}`;
      if (drawn === sig && body.querySelector('.t-concept')) return;
      drawn = sig;
      body.innerHTML = `<div class="panel framed t-concept"><p class="attend-tag">📣 ${step.kind === 'intro' ? '도입' : '개념 설명'}</p><h2>${esc(step.title)}</h2>
        ${img ? `<img class="t-sheet" src="${img}" alt="${esc(step.title)} 학습지">` : '<p class="muted small">수업 준비에서 이 단계 학습지 이미지를 넣으면 여기에 보여요.</p>'}
        <p class="intro">${pretty(step.say || '')}</p></div>`;
      return;
    }
    body.innerHTML = `<div class="panel framed center attend"><p class="attend-tag">📣 알림</p><h2>선생님에게 주목하세요</h2><p>${step.kind === 'intro' ? '수업을 시작합니다.' : '개념 설명을 시작합니다.'}</p>
      <p class="stage-name">${esc(step.title)}</p><p class="intro">${pretty(step.say || '')}</p>${DS.Art.hero(myP().hero, 'idle', 'big huff')}<p class="muted small">학습지를 펴고 선생님 설명을 들어요.</p></div>`;
  }
  // 🏕 쉼터 (2026-11-04): 대기실을 편안하게 — 내 용사와 친구들이 앉아 쉼 · 타이머 · 선생님이 「쉼터 끝」을 누르면 하던 단계로
  function restView(body) {
    const r = (R.state || {}).rest || {}, others = Object.entries(R.players || {}).filter(([u, p]) => !p.teacher && u !== me).slice(0, 10);
    const sig = `rest|${r.at}|${r.min}|${others.length}`;
    if (sig === drawn && body.querySelector('.lobby-scene.rest')) return;
    drawn = sig;
    const crowd = others.map(([, p], k) => `<div class="lb-h${k % 2 ? ' face-l' : ''}" style="left:${12 + ((k * 37) % 76)}%;bottom:${8 + (k % 3) * 9}%;z-index:${30 - (8 + (k % 3) * 9)}">${DS.Art.hero(p.hero, 'sit', 'small huff')}</div>`).join('');
    body.innerHTML = `<div class="panel framed"><div class="lobby-scene rest bg-scene th-${L.theme || ''}"><p class="lb-title">🏕 쉼터</p>
        <div class="rest-timer sm">⏱ <b data-rest-end="${DS.Control.restEnd(R)}">${DS.Control.mmss(DS.Control.restLeft(R))}</b></div>${crowd}
        <div class="lb-h me" style="left:50%;bottom:22%">${DS.Art.hero(myP().hero, 'sit', 'huff')}<i class="shadow"></i></div></div>
      <p class="center">잠깐 쉬어 가요 — 물 한 모금 · 기지개 쭉! 🔥</p><p class="muted small center">선생님이 다시 시작하면 하던 문제로 돌아가요 (쓰던 답은 그대로)</p></div>`;
  }
  // 던전 단체 대기실: 수업 전(입장) · 클리어 뒤(마지막 한마디 · 모루)
  const dungeonName = () => { const D = DS.ASSETS.dungeons, i = D.ids.indexOf(L.theme); return i >= 0 ? D.names[i] : '던전'; };
  function lobbyView(body, after) {
    const others = Object.entries(R.players || {}).filter(([u, p]) => !p.teacher && u !== me && (!after || p.lobby)).slice(0, 10);
    const w = (R.words || {})[me], finale = Raid().isFinale(L, R), full = Raid().fullMarks(L, R, me);
    const kr = after && DS.ShareCard && DS.ShareCard.klassReady(L, R); // v0.9.2: 🏫 학급 결과 (마무리 · 보스 격파부터)
    const sv = after && !test && DS.Survey ? DS.Survey.pending() : 0;
    const sig = `lobby|${L.id}|${after}|${sv}|${others.length}|${JSON.stringify(w || null)}|${finale}|${full}|${(R.hide || {})[me] ? 1 : 0}|${kr}`;
    if (sig === drawn && body.querySelector('.lobby-scene')) return;
    drawn = sig;
    const crowd = others.map(([, p], k) => `<div class="lb-h${k % 2 ? ' face-l' : ''}" style="left:${12 + ((k * 37) % 76)}%;bottom:${8 + (k % 3) * 9}%;z-index:${30 - (8 + (k % 3) * 9)}">${DS.Art.hero(p.hero, 'idle', `small ${after && finale ? 'pairhop' : 'huff'}`)}<i class="shadow"></i></div>`).join('');
    body.innerHTML = `<div class="panel framed">
      <div class="lobby-scene bg-scene th-${L.theme || ''}"><p class="lb-title">${after ? `<i class="trophy-img sm" style="background-image:url('${DS.ASSETS.base}${DS.ASSETS.trophy}')"></i> ` : '⚔ '}${esc(dungeonName())} ${after ? '클리어!' : '단체 대기실'}</p>
        <div class="lb-h teacher" style="left:50%;bottom:20%">${DS.Art.hero(DS.ASSETS.heroes.teacher, 'idle', after && finale ? 'pairhop' : 'huff')}<i class="shadow"></i></div>
        ${crowd}<div class="lb-h me" style="left:34%;bottom:12%">${DS.Art.hero(myP().hero, 'idle', after && finale ? 'pairhop' : 'huff')}<i class="shadow"></i>${w && !(R.hide || {})[me] ? `<span class="lb-say">${esc(w.t)}</span>` : ''}</div>
        <p class="lb-greet">${after ? '모두 수고했네! 오늘 배운 것 한마디씩 남기게' : `${L.no ? `${DS.Lessons.noText(L.no)}차시 ` : ''}${esc(L.title.split('·')[0].trim())} 던전에 온 것을 환영하네!`}</p></div>
      ${after ? `<div class="stamp-bar">📮 반드시 학습지 확인도장 받아가세요.</div>${sv ? DS.Survey.btnHtml('st-survey') : ''}<button class="btn primary" id="st-mine">⚔ 내 전투 결과 보기</button>${kr ? '<button class="btn sc-btn" id="st-klass">🏫 우리 반 학급 결과 보기</button>' : ''}${kr && DS.Punch && !DS.Act.punchOff(R) && R.meta.cls && L.no && !L.eval ? '<button class="btn" id="st-punch">🏁 반대항 경주</button>' : ''}${wordsForm(w)}${'' /* 2026-11-03 사용자 확정: 모루는 개인 캠프(모닥불)에서만 — 대기실에서는 열지 않는다 (수업 중엔 여유가 없음) */}`
        : test ? '<p class="center">친구들이 다 모이면 아래 「수업 시작 ▶」을 눌러요!</p>' : '<p class="center">선생님이 수업을 시작할 때까지 기다려요. 학습지를 꺼내 두세요!</p>'}</div>`;
    if (after) bindWords();
    const svb = $('#st-survey'); if (svb) svb.onclick = () => DS.Survey.open(acc(), () => { drawn = ''; render(); });
    const kb = $('#st-klass'); if (kb) kb.onclick = () => DS.Control.run(() => DS.ShareCard.klassOpen(L, R));
    const pb = $('#st-punch'); if (pb) pb.onclick = () => DS.Control.run(() => DS.Punch.open(L, R));
    const mb = $('#st-mine'); if (mb) mb.onclick = () => DS.Control.run(() => DS.Result.show(L, R, me, !real() ? null : acc(), code, () => {}, { inClass: true, force: true }));
  }
  function wordsForm(w) {
    if (locked) return '<p class="muted small center">💬 한마디는 선생님이 잠가 두었어요.</p>';
    if (w && (w.n || 0) >= 2) return `<p class="center">💬 남긴 한마디: <b>${esc(w.t)}</b></p>`;
    return `<div class="words"><p class="gold">💬 마지막 한마디 <span class="muted small">(${DS.Words.MAX}자 · ${w ? '한 번 고칠 수 있어요' : '오늘 배운 것을 한마디로'})</span></p>
      <input id="st-word" maxlength="${DS.Words.MAX}" value="${esc(w ? w.t : '')}" placeholder="벤 다이어그램 이제 알겠다!">
      <div class="chips">${DS.Words.CHIPS.map((t) => `<button class="chip" data-chip="${esc(t)}">${esc(t)}</button>`).join('')}</div>
      <button class="btn primary" id="st-say">💬 ${w ? '고치기' : '남기기'}</button></div>`;
  }
  function bindWords() {
    document.querySelectorAll('[data-chip]').forEach((b) => (b.onclick = () => { $('#st-word').value = b.dataset.chip; }));
    const sb = $('#st-say'); if (sb) sb.onclick = () => DS.Control.run(async () => { await DS.Act.say(code, R, $('#st-word').value); DS.UI.toast('한마디를 남겼어요!'); drawn = ''; if (DS.Grow && !test) DS.Grow.add(acc(), { words: 1 }, `words_${code}`).catch(() => {}); });
  }
  const lobbyBtn = () => (Raid().canLobby(L, R, me) ? '<button class="btn primary big" id="st-lobby">🏕 대기실로 이동</button>' : '<button class="btn big" disabled>🏕 대기실로 이동 (보스를 쓰러뜨리거나 다 맞히면 켜져요)</button>');
  // v0.8.1: 형성평가를 마치고 「대기실로 이동」 → ⚔ 오늘의 전투 결과 → 단체 대기실 (결과는 수업 끝이 아니라 여기서)
  let resulted = false;
  const showResult = () => new Promise((res) => {
    if (resulted || !DS.Result || !Raid().activeIds(R).includes(me)) return res();
    resulted = true;
    DS.Result.show(L, R, me, !real() ? null : acc(), code, () => res(), { inClass: true }).catch(() => res());
  });
  const bindLobby = () => { const b = $('#st-lobby'); if (b) b.onclick = () => DS.Control.run(async () => { await showResult(); await DS.Act.toLobby(code); drawn = ''; }); };

  // ── 몬스터와 1:1 대치 ─────────────────────────────────────
  function sheetModal(step) {
    const img = (test.prep.img || {})[step.id]; if (!img) return;
    const el = document.createElement('div'); el.className = 'modal t-sheet-modal';
    el.innerHTML = `<div class="quiz-box framed"><p class="gold">📄 ${esc(step.title || '형성평가')} · 학습지</p><img class="t-sheet" src="${img}" alt="학습지"><button class="btn primary" id="ts-x">✕ 닫기</button></div>`;
    document.body.appendChild(el); el.querySelector('#ts-x').onclick = () => el.remove();
  }
  // 함께 싸우는 친구(테스트 모드의 가상 친구 · 인원이 적을 때)의 공격을 내 대치 화면에도 작게 보여 준다
  let othersSeen = {};
  function othersFx(step, body) {
    const now = {};
    Raid().activeIds(R).forEach((u) => { if (u !== me) now[u] = Raid().record(L, R, step.id, u); });
    const key = step.id;
    const was = othersSeen[key] || {};
    othersSeen[key] = Object.fromEntries(Object.entries(now).map(([u, r]) => [u, { n: r.tries.length, best: r.best }]));
    const sc = body.querySelector('.scene'); if (!sc || !Object.keys(was).length && !test) return;
    Object.entries(now).forEach(([u, r]) => {
      const w = was[u] || { n: 0, best: 0 };
      if (r.tries.length <= w.n) return;
      const p = R.players[u] || {}, dmg = Math.max(0, r.best - w.best);
      if (dmg || r.practice) DS.FX.play(sc, p.fx || 'flame', { scale: 0.18, x: sc.clientWidth * (0.7 + Math.random() * 0.1), y: sc.clientHeight * 0.55 });
      const t = document.createElement('span'); t.className = 'ally-hit'; t.textContent = r.practice ? `${p.nick} ✔ 이미 성공` : dmg ? `${p.nick} −${dmg}` : `${p.nick} 💨`;
      t.style.left = `${55 + Math.random() * 25}%`; sc.appendChild(t); setTimeout(() => t.remove(), 1300);
    });
  }
  // 1:1 대치: 왼쪽 내 용사(머리 위 = 남은 도전 기회 ●●●, 같이 움직임) vs 오른쪽 몬스터(아래 체력 칸)
  // cls: 'hit'(공격 성공 → 용사 돌진) · 'miss'(실패 → 축 처짐, 잠깐)
  const enhCls = (p) => { const t = p && DS.Gem && DS.Gem.enhTier ? DS.Gem.enhTier(Number(p.enh) || 0) : 0; return t ? ` enh enh-${t}` : ''; };
  // 🧪 테스트 · 👩‍🏫 체험판: 가상 친구 용사 (작은 줄)
  const partyHtml = () => (test ? `<div class="enc-friends">${Raid().activeIds(R).filter((u) => u !== me).slice(0, 4).map((u) => DS.Art.hero((R.players[u] || {}).hero || 0, 'idle', 'huff')).join('')}</div>` : '');
  const pipsOf = (rec) => Array.from({ length: rec.slots }, (_, i) => `<i class="${i < rec.left ? 'on' : ''}${i < Math.min(rec.left, rec.healed) ? ' heal' : ''}"></i>`).join('');
  const plate = () => `<span class="sc-plate">${esc(`${info0.num || myP().num || ''}번 ${info0.nick || myP().nick || ''}`)}</span>`;
  // 아래 고정 줄: 기회 ●●●● n · ⚔ 공격! (또는 지금 할 일 한 줄)
  const dock = (rec, right) => `<div class="st-dock"><span class="dock-tries">기회 <span class="enc-tries">${pipsOf(rec)}</span> ${rec.left}</span>${right}</div>`;
  function scene(step, rec, hp, cls = '', gauge = '', banner = '') {
    const segs = Array.from({ length: rec.total }, (_, i) => `<i class="${i < rec.best ? 'gone' : ''}"></i>`).join('');
    const done = Raid().cleared(L, R, step.id);
    return `<div class="scene enc bg-scene th-${L.theme || ''} ${cls}${step.special ? ' special' : ''}">${scTop()}${hpBox(hp.left, hp.max, gauge)}
      ${partyHtml(step.id)}
      <div class="enc-hero${enhCls(info0)}">${heroNow(pose2(done, cls), done ? 'pairhop' : cls === 'miss' ? 'slump' : 'huff')}<i class="shadow"></i>${plate()}</div>
      <div class="enc-mon">${DS.Art.monster(L.monsters[step.id].sprite, done ? 'down' : 'idle', done ? '' : 'float')}<div class="segs" title="내가 맞힌 만큼 칸이 깨져요">${segs}</div></div>${banner}</div>`;
  }
  // 생각 시간: 틀린 칸이 있으면 해설은 읽을 수 있고 「다시 도전」만 잠깐 잠긴다 (수업 준비에서 0·5·10·15초, 기본 5초)
  const thinkSec = () => { const t = (R.meta || {}).think; return t != null ? Number(t) : 5; };
  const thinkUntil = {};
  function thinkTimer(btn, key, label) {
    const tick = () => {
      const left = Math.ceil(((thinkUntil[key] || 0) - Date.now()) / 1000);
      if (!btn.isConnected) return;
      if (left > 0) { btn.disabled = true; btn.innerHTML = `🤔 생각 시간 ${left}… <span class="small">해설을 읽어 봐요</span>`; setTimeout(tick, 250); }
      else { btn.disabled = false; btn.innerHTML = label; }
    };
    tick();
  }
  // 👾 몬스터 공격 (사용자 확정 2026-11-03): 문제를 푸는 동안 몬스터 아래 게이지가 차고, 다 차면 용사를 공격 → 입력 잠깐 잠금
  //   일반 45초마다 1초 · 보스 60초마다 2초. 도전 기회 · 데미지 · 경험치는 그대로 (실패해도 벌 없음 원칙 — 잠깐 멈출 뿐)
  //   🔴 집중모드 · 📄 학습지 · 🎬 영상 · 화면 꺼짐 동안은 게이지가 멈춘다. 풀이 화면(문제 입력 · 보스 문항 목록)에서만 돈다
  // 게이지는 반 전체 공통 (DS.Raid.atkClock: 서버 시각 기준) → 종합상황실 · 모든 학생 폰이 같은 순간에 공격받는다
  const GAUGE = '<div class="atk-gauge" title="몬스터 공격 게이지 (반 전체 공통)"><i></i></div>';
  let atkTimer = null, stunUntil = 0, atkMemo = {};
  function atkTick() {
    if (!L || !R || !code) return;
    comboTick();
    { const dEl = document.querySelector('#st-body .sc-door'), dl = Raid().deadline(R); if (dEl) { if (!dl || Raid().isClosed(R)) dEl.textContent = ''; else { const sec = Math.max(0, Math.ceil((dl - DS.Net.now()) / 1000)); dEl.textContent = `⏳ ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; dEl.classList.toggle('hot', sec <= 600); } } } // 👑 보스 문 남은 시간 (HP 칸 안 · 10분 남으면 빨갛게)
    const c = Raid().atkClock(L, R, DS.Net.now(), window.DS_ATK || null); // DS_ATK = 브라우저 시험용 짧은 시간 (e2e21)
    const g = document.querySelector('#st-body .atk-gauge');
    if (!c) { if (g) g.querySelector('i').style.width = '0%'; atkMemo = {}; return; }
    if (c.paused) { if (g) g.classList.add('bound'); return; }
    const tr = Raid().atkTrack(atkMemo, c, `${code}|${(R.state || {}).step}|${c.kind}`);
    if (g) { g.querySelector('i').style.width = `${(tr.p * 100).toFixed(1)}%`; g.classList.toggle('hot', tr.p > 0.8); g.classList.remove('bound'); }
    if (tr.strike) monsterStrike(c.lock, !!g);
  }
  function monsterStrike(lock, stun) { // stun: 문제 입력 화면이면 잠금, 아니면 맞는 모습만
    if (stun) stunUntil = Date.now() + lock * 1000;
    const sc = document.querySelector('#st-body .scene'), mon = sc && sc.querySelector('.art.monster'), hb = sc && sc.querySelector('.enc-hero');
    if (mon) { mon.classList.remove('lunge'); void mon.offsetWidth; mon.classList.add('lunge'); setTimeout(() => mon.classList.remove('lunge'), 500); }
    setTimeout(() => {
      if (hb) { hb.classList.remove('struck'); void hb.offsetWidth; hb.classList.add('struck'); setTimeout(() => hb.classList.remove('struck'), 600); }
      if (sc && DS.FX) DS.FX.play(sc, 'flame', { scale: 0.2 });
      heroFlash('hit', 350); setTimeout(() => heroFlash('pant', lock * 1000 + 500), 350); // 맞고 → 헉헉
      DS.Sound.squish(); if (navigator.vibrate) navigator.vibrate(60);
      if (!stun) return;
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      const st = document.createElement('div'); st.className = 'stun'; st.innerHTML = `<b>💥 몬스터의 공격! ${lock}초 멈춤</b>`;
      document.body.appendChild(st); setTimeout(() => st.remove(), lock * 1000);
    }, 200);
  }
  const atkStart = () => { if (!atkTimer) atkTimer = setInterval(atkTick, 200); };
  const atkStop = () => { clearInterval(atkTimer); atkTimer = null; atkMemo = {}; const st = document.querySelector('.stun'); if (st) st.remove(); };
  // 용사 자세: 잠깐 동작(heroFx)이 살아 있으면 그것 · 아니면 기본 (풀 때 = 생각 중)
  // v2 용사: 격파 = 승리 · 틀림 = 피격 (v1 은 그대로 공격 자세)
  const pose2 = (done, cls) => { const v2 = DS.Art.isV2(myP().hero); return done ? (v2 ? 'win' : 'attack') : cls === 'hit' ? 'attack' : cls === 'miss' ? (v2 ? 'hit' : 'attack') : 'think'; };
  function heroNow(pose, cls) {
    heroBack = [pose, cls];
    return heroFx && Date.now() < heroFx.until ? DS.Art.hero(myP().hero, heroFx.pose, '') : DS.Art.hero(myP().hero, pose, cls);
  }
  function heroFlash(pose, ms) {
    heroFx = { pose, until: Date.now() + ms };
    const a = document.querySelector('.enc-hero .art'); if (a) a.outerHTML = DS.Art.hero(myP().hero, pose, '');
    clearTimeout(heroFxT);
    heroFxT = setTimeout(() => { heroFx = null; const b = document.querySelector('.enc-hero .art'); if (b) b.outerHTML = DS.Art.hero(myP().hero, heroBack[0], heroBack[1]); }, ms);
  }
  // 💚 힐 알림 (v0.9.6): 받은 학생은 누가 줬는지 안다 (종합상황실엔 힐러만). 한 번 본 알림은 다시 안 띄움
  const healSeen = (k) => { try { const s = JSON.parse(sessionStorage.getItem('ds-heal-seen') || '{}'); if (s[k]) return true; s[k] = 1; sessionStorage.setItem('ds-heal-seen', JSON.stringify(s)); } catch (e) { /* 저장 못 하면 매번 확인 */ } return false; };
  const who = (u) => { const p = (R.players || {})[u] || {}; return `${p.num || ''}번 ${p.nick || '친구'}`; };
  // 💚 힐 표시 (v0.9.7.7 · 사용자 요청): 아래 배너 대신 게임 화면 용사 머리 위에 「+1 💚 김민수 응원」이 떠오름
  // 🗿 석화 (🌟 진필살기 · 2026-11-06): 남은 초 띠 · 몬스터 회색 · 끝나면 다시 그림
  let petriT = null;
  function petri(body, step) {
    const pt = Raid().petrify(R, step.id), left = pt ? Math.ceil((pt.until - DS.Net.now()) / 1000) : 0;
    const old = body.querySelector('.petri-bn');
    if (!pt || left <= 0) { if (old) old.remove(); return; }
    body.querySelectorAll('.enc-mon').forEach((m) => m.classList.add('petrified'));
    if (old) return;
    const by = (R.players || {})[pt.by] || {}, el = document.createElement('div'); el.className = 'petri-bn';
    el.innerHTML = `🗿 <b>석화 <span>${left}</span>초</b> — ${esc(by.nick || '친구')}의 진필살기! 지금 맞히면 <b>💎</b> (최대 ${PETRI_CAP})${sage ? '<br><small>💡 현자의 빛: 그림 힌트가 열렸어요</small>' : ''}`;
    const host = body.querySelector('.panel') || body; host.prepend(el);
    clearInterval(petriT); petriT = setInterval(() => { const s = Math.ceil((pt.until - DS.Net.now()) / 1000), sp = el.querySelector('span'); if (s <= 0 || !el.isConnected) { clearInterval(petriT); el.remove(); drawn = ''; render(); return; } if (sp) sp.textContent = s; }, 500);
  }
  // 석화 중 공격 성공 → 데미지(늘어난 맞힌 소문제 수) × 💎1 · 석화 한 번에 학생당 최대 PETRI_CAP (하루 한도 안)
  const PETRI_CAP = 3;
  function petriGem(mid, gain) {
    const pt = Raid().petrify(R, mid); if (!pt || DS.Net.now() >= pt.until || !DS.Gem || !real()) return;
    const k = `citadel-petri-${code}-${mid}-${pt.at}`; let had = 0; try { had = Number(localStorage.getItem(k)) || 0; } catch (e) { /* 무시 */ }
    const tot = Math.min(PETRI_CAP, had + gain); if (tot <= had) return;
    try { localStorage.setItem(k, String(tot)); } catch (e) { /* 무시 */ }
    DS.Gem.add(acc(), tot, `petri_${code}_${mid}`, '🗿 석화 찬스', { upsert: true }).then((g) => { if (g) healPop(`💎 +${g} 석화 찬스!`, 900); }).catch(() => {});
  }
  function healPop(text, delay = 0) {
    setTimeout(() => {
      const h = document.querySelector('#st-body .scene .enc-hero') || document.querySelector('#st-body .scene');
      if (!h) { DS.UI.toast(text, 3000); return; }
      const e = document.createElement('i'); e.className = 'heal-pop'; e.textContent = text; h.appendChild(e);
      setTimeout(() => e.remove(), 2600);
    }, 120 + delay);
  }
  const nickOf = (u) => ((R.players || {})[u] || {}).nick || '친구';
  function healNotice(mid) {
    if (!real()) return;
    let k = 0;
    Raid().healsTo(R, mid, me, L).slice(0, Raid().HEAL_MAX).forEach((h) => {
      if (healSeen(`${code}|${mid}|${h.from}|${h.k}`)) return;
      healPop(`+1 💚 ${nickOf(h.from)} 응원`, (k++) * 700); DS.Sound.correct(); drawn = '';
      heroFx = { pose: 'healed', until: Date.now() + 1800 }; setTimeout(() => heroFlash('healed', 1600), 60);
    });
  }
  // ❄ 📝 풀이 시간 (2026-11-06 사용자 「60초간 큰 기술을 써서 학생들이 꽁꽁 묶이는 이펙트」): 아직 안 낸 학생은 시간이 끝날 때까지 입력 잠금 → 학습지에 먼저
  let solveT = null, solveCast = '';
  function frozenView(body, step, lk) {
    const sig = `solve|${lk.id}|${lk.end}`; if (drawn === sig && body.querySelector('.sl-scene')) return; drawn = sig;
    const spr = step.kind === 'boss' ? L.boss.sprite : L.monsters[step.id].sprite, title = step.kind === 'boss' ? `👑 ${L.boss.title}` : step.title;
    body.innerHTML = `<div class="panel framed"><div class="scene enc bg-scene th-${L.theme || ''} sl-scene"><div class="scene-bar"><div><b>${esc(title)}</b><br><span class="muted small">📝 풀이 시간</span></div></div>
        <div class="enc-hero frozen">${heroNow('idle', '')}<i class="shadow"></i><i class="sl-ice"></i></div><div class="enc-mon">${DS.Art.monster(spr, 'attack', '')}</div><i class="sl-frost"></i></div>
      <div class="sl-box"><b>❄ 꽁꽁 묶기!</b><p>몬스터가 얼음 마법을 썼어요 — <b>학습지에 먼저 다 풀어요</b></p><p class="sl-time">얼음이 깨지기까지 <b class="sl-left" data-sl-end="${lk.end}">${Math.ceil(lk.left / 1000)}초</b></p><small>시간이 끝나면 얼음이 깨지고 답을 넣을 수 있어요 · 다 푼 답을 그대로 옮겨 적으면 한 번에 퍼펙트!</small></div></div>`;
    const sc = body.querySelector('.sl-scene'), hb = body.querySelector('.enc-hero');
    if (solveCast !== sig) { solveCast = sig; setTimeout(() => { if (!sc.isConnected) return; if (DS.FX) DS.FX.play(sc, 'nova', { scale: 0.7, perfect: true }); if (DS.Thrill) DS.Thrill.bindFx(hb, true); if (DS.Sound && DS.Sound.fxHit) DS.Sound.fxHit('nova'); }, 200); }
    clearTimeout(solveT); solveT = setTimeout(() => { drawn = ''; render(); const sc2 = document.querySelector('#st-body .scene'), h2 = sc2 && sc2.querySelector('.enc-hero'); if (sc2 && DS.FX && h2) { const a = h2.getBoundingClientRect(), b = sc2.getBoundingClientRect(); DS.FX.play(sc2, 'ice', { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2, scale: 0.5 }); } if (DS.Sound && DS.Sound.correct) DS.Sound.correct(); DS.UI.toast('❄ 얼음이 깨졌어요 — 이제 답을 넣어요!'); }, lk.left + 250);
  }
  function monsterView(body, step) {
    const mid = step.id, rec = Raid().record(L, R, mid, me), hp = Raid().monsterHp(L, R, mid);
    { const lk = Raid().solveLock(L, R, DS.Net.now()); if (lk && lk.on && !rec.submitted) return frozenView(body, step, lk); }
    healNotice(mid);
    const wantRetry = retrying === `${mid}|${rec.nextAttempt}` && rec.canRetry;
    if (!rec.submitted || wantRetry) return fightForm(body, step, rec, hp);
    const t = rec.last, label = Raid().resultLabel(t);
    const items = Raid().itemsFor(L, R, mid, me, t.attempt);
    const prac = rec.practice; // v0.9.2 연습 공격: 다 맞힌 뒤의 시도 → 이펙트는 그대로 · 데미지 0 · 「이미 성공」
    const fx = `${mid}|${t.attempt}` !== shown ? (label === 'fail' && !prac ? 'miss' : 'hit') : '';
    if (fx && t.correct < t.total && thinkSec() > 0) thinkUntil[`${mid}|${t.attempt}`] = Date.now() + thinkSec() * 1000;
    const atk = !!(fx && DS.Attack); // ⚔ 공격 개편 2단계 (2026-11-06): 근접 = 돌진 · 원거리 = 탄 → 그림을 그린 뒤 DS.Attack.play (아래)
    if (fx) { shown = `${mid}|${t.attempt}`; if (!atk) { if (label === 'fail' && !prac) DS.Sound.squish(); else { DS.Sound.slash(); setTimeout(() => DS.Sound.hit(), 160); setTimeout(() => { const sc = body.querySelector('.scene'); if (sc) DS.FX.play(sc, myP().fx || 'flame', { perfect: label === 'success', scale: label === 'success' ? 0.42 : 0.3 }); }, 60); } } }
    // ⚔ 마무리 일격: 내 이번 공격이 몬스터 체력을 0 으로 만들었으면
    const bestBefore = rec.tries.slice(0, -1).reduce((m, x) => Math.max(m, x.correct), 0), gain = rec.best - bestBefore;
    const finish = fx && !prac && gain > 0 && Raid().cleared(L, R, mid) && hp.left + gain > 0;
    if (fx && !prac && gain > 0) petriGem(mid, gain);
    // ⚡ 필살기 (2026-11-06 확정): 첫 시도에 다 맞힘 + 특화 Ⅲ 이상 → 그 공격이 저절로 필살기 (기회를 쓰지 않음 · 연출만)
    const autoUlt = !!(fx && !prac && real() && t.attempt === 0 && t.total > 0 && t.correct === t.total && DS.Attack && DS.Attack.canUlt(myP().fx, myP().hero));
    // 🔥 끈기의 일격: 두 번 넘게 틀린 뒤 드디어 다 맞힘 (연출만)
    const grit = !!(fx && !prac && t.attempt >= 2 && rec.perfectAt === t.attempt);
    if (finish) setTimeout(() => { const sc = body.querySelector('.scene'); if (sc) { sc.classList.add('fin-flash'); DS.FX.play(sc, myP().fx || 'flame', { perfect: true, scale: 0.6 }); } DS.Sound.correct(); }, atk ? 1300 : 500);
    const head = prac ? `몬스터 묶기 ${t.correct}/${t.total} — 지금까지 <b>${Raid().bindOf(L, R, mid, me)}초</b> 묶음 <span class="small muted">(최대 ${Raid().BIND_MAX}초)</span>` : { success: '⚔ 공격 성공!', partial: `⚔ 부분 성공 (${t.correct}/${t.total})`, fail: '💨 공격 실패…' }[label];
    const done = Raid().cleared(L, R, mid);
    // ⚡ 수업 필살기 (2026-11-06 확정 ①): 첫 시도 퍼펙트 + 묶기 2번 퍼펙트 = 3연속 · 특화 Ⅳ 전설 스킬 · 마지막 기회가 남아 있을 때
    // 🌟 진필살기 (2026-11-06 확정): 3연속 퍼펙트 + 특화 Ⅳ · 마지막 기회 · 이 몬스터가 아직 안 굳었을 때 (반 전체 한 번)
    const ult = real() && rec.perfectAt === 0 && Raid().perfStreak(rec) >= 3 && rec.left > 0 && !Raid().ultUsed(R, mid, me) && !Raid().petrify(R, mid) && DS.Attack && DS.Attack.canTrue(myP().fx, myP().hero);
    const sig = `res|${mid}|${t.attempt}|${done}|${rec.canRetry}|${rec.left}|${ult ? 'u' : ''}|${(R.help || {})[me] ? 1 : 0}`;
    if (sig === drawn && body.querySelector('.marks')) { hpText(body, hp); return; }
    drawn = sig;
    // 🧹 2026-11-07 정돈판: 마무리 일격 = 장면 위 띠 · 결과 = 한 줄 · 문항 다시 보기 = 접힌 양피지
    const banner = `${finish ? '<div class="fin-me sc-banner">⚔ 마무리 일격!</div>' : ''}${grit ? `<div class="fin-me grit sc-banner${finish ? ' second' : ''}">🔥 끈기의 일격!</div>` : ''}`;
    const resLine = prac ? head : label === 'success' ? `✔ ${t.correct} / ${t.total} 성공!` : label === 'partial' ? `◐ ${t.correct} / ${t.total} 부분 성공` : `✘ ${t.correct} / ${t.total} — 다시 도전해요`;
    body.innerHTML = `<div class="panel framed st-fight st-after">${scene(step, rec, hp, atk ? '' : fx, '', banner)}
      <div class="st-res res-${prac ? 'success' : label}"><b>${esc(step.title)} · ${resLine}</b></div>
      <details class="paper-fold"><summary>▸ ${esc(step.title)} 다시 보기</summary><div class="paper"><div class="marks">${items.map((q, i) => `<div class="mark ${t.marks[i] ? 'ok' : 'ng'}"><b>(${i + 1})</b> ${t.marks[i] ? '✔' : '✘'} <span class="math">${pretty(itemText(q))}</span>${t.marks[i] ? '' : `<br><span class="sol-line math">${pretty(solOf(q))}</span>`}</div>`).join('')}</div></div></details>
      ${ult ? `<p class="okc">🌟 <b>3연속 퍼펙트!</b> 전설 스킬이 진짜 힘을 깨웠어요</p><p>마지막 기회로 <b>진필살기</b>를 쓸까요?</p>
        <div class="heal-pick"><button class="btn primary big ult-go true" id="st-ult">🌟 ${esc(String(DS.FX.NAMES[myP().fx] || '').replace(/^\S+\s/, ''))}<br><small>진필살기</small></button><button class="btn big heal-btn" id="st-party">💚 파티 힐<br><small>못 맞힌 친구 모두 +1</small></button></div>
        <p class="muted small">진필살기 = 몬스터가 ${Raid().TRUE_SEC}초 돌로 굳음 (공격 멈춤) + 못 맞힌 친구 모두 기회 +1 · 💡 힌트 + 그동안 맞힌 친구에게 💎 · 파티 힐 = 기회 +1 만</p>`
        : rec.perfect && rec.canRetry ? `<p class="muted small st-ask">남은 기회 <b>${rec.left}</b>번 · 무엇을 할까요?</p>
        <div class="heal-pick"><button class="btn primary big" id="st-retry">몬스터 묶기</button><button class="btn big heal-btn" id="st-heal">💚 친구 힐</button></div>
        <p class="muted small">몬스터 묶기 = 숫자 바뀐 문제를 맞힌 만큼 몬스터 공격을 늦춤 (1개 1초 · 최대 ${Raid().BIND_MAX}초) · 친구 힐 = 기회가 필요한 친구에게 도전 기회 한 칸</p>`
        : done && rec.canRetry ? `<p class="okc big-msg">🎉 몬스터 격파!</p><p>틀린 소문제를 다시 풀어 볼까요? <span class="muted small">(남은 기회 ${rec.left}번 · 숫자가 모두 바뀌어요 · 고친 만큼 경험치가 더 쌓여요)</span></p><button class="btn primary big" id="st-retry">🔄 다시 도전</button>`
        : done ? '<p class="okc big-msg">🎉 몬스터 격파! 다음 신호를 기다려요.</p>'
        : rec.canRetry ? `<p>다시 해 보겠습니까? <span class="muted small">(남은 기회 ${rec.left}번 · 숫자가 모두 바뀌어요)</span></p><button class="btn primary big" id="st-retry">🔄 다시 도전</button>`
        : `<p class="muted">${rec.perfect ? '멋져요! 기회를 모두 썼어요. 다른 용사들을 기다려요.' : '재도전 기회를 모두 썼어요. 해설을 보며 학습지에 정리해요.'} 데미지 <b>${rec.best}</b></p>`}
      ${test && (test.prep.img || {})[mid] ? '<button class="btn small" id="st-sheet">📄 학습지 보기 (문제 해설)</button>' : ''}
      ${dock(rec, done && !rec.canRetry ? '<span class="dock-wait">다음 단계를 기다려요</span>' : '')}
      ${test ? '' : helpBtn()}</div>`;
    bindHelp(); bindTop();
    const sb = $('#st-sheet'); if (sb) sb.onclick = () => sheetModal(step);
    // v0.9.3 (⑤): 공격 자세는 잠깐만 → 다시 서 있는 자세 (격파됐으면 승리 자세 그대로)
    if (atk) { const sc = body.querySelector('.scene'); if (sc) DS.Attack.play(sc, { heroBox: sc.querySelector('.enc-hero'), monBox: sc.querySelector('.enc-mon'), hero: myP().hero || 0, fx: myP().fx || 'flame', miss: label === 'fail' && !prac, s: grit ? 1.3 : 1, rest: done ? 'win' : 'idle', noDmg: prac, ultimate: autoUlt, finish: grit }).then(() => { if (prac && t.correct > 0 && DS.Thrill && sc.isConnected) DS.Thrill.bindFx(sc.querySelector('.enc-mon .art.monster') || sc.querySelector('.enc-mon')); }); } // ⛓ 묶기 공격 = 사슬 이펙트
    else if (fx && !done) setTimeout(() => { const a = body.querySelector('.enc-hero .art'); if (a) a.outerHTML = heroNow('idle', fx === 'miss' ? 'slump' : 'huff'); }, 650);
    const rb = $('#st-retry');
    if (rb) { thinkTimer(rb, `${mid}|${t.attempt}`, rec.perfect ? '몬스터 묶기' : '🔄 다시 도전'); rb.onclick = () => { retrying = `${mid}|${rec.nextAttempt}`; form = null; DS.Sound.clank(); render(); }; }
    const ub = $('#st-ult');
    if (ub) ub.onclick = () => DS.Control.run(async () => {
      ub.disabled = true; await DS.Act.heal(code, raw, mid, { true: true }); drawn = '';
      if (DS.Attack) { await DS.Attack.cutin(myP().hero || 0, myP().fx, { gold: true }); const sc = document.querySelector('#st-body .scene') || body.querySelector('.scene'); if (sc) { const mon = sc.querySelector('.enc-mon .art.monster') || sc.querySelector('.enc-mon'); DS.Attack.ultBlast(sc, mon, myP().fx); if (DS.Thrill && DS.Thrill.petrify) setTimeout(() => DS.Thrill.petrify(mon), 500); } } // 🌟 진필살기 → 🗿 석화
      healPop('💚 못 맞힌 친구 모두 기회 +1 · 🗿 석화!', 1600);
      if (DS.Grow && real()) DS.Grow.add(acc(), { heal: 1 }, `ult_${code}_${mid}`).catch(() => {});
    });
    const pb2 = $('#st-party');
    if (pb2) pb2.onclick = () => DS.Control.run(async () => {
      pb2.disabled = true; await DS.Act.heal(code, raw, mid, { party: true }); DS.Sound.correct(); drawn = '';
      heroFx = { pose: 'heal', until: Date.now() + 1600 }; setTimeout(() => heroFlash('heal', 1400), 60); healPop('💚 파티 힐 — 못 맞힌 친구 모두 +1!');
      if (DS.Grow && real()) DS.Grow.add(acc(), { heal: 1 }, `party_${code}_${mid}`).catch(() => {});
    });
    const hb = $('#st-heal');
    if (hb) hb.onclick = () => DS.Control.run(async () => {
      hb.disabled = true;
      const k = Raid().healsGiven(R, mid, me), to = await DS.Act.heal(code, raw, mid);
      DS.Sound.correct(); drawn = '';
      heroFx = { pose: 'heal', until: Date.now() + 1600 }; setTimeout(() => heroFlash('heal', 1400), 60);
      healPop(to ? `💚 ${nickOf(to)}에게 +1` : '💚 응원 보냄!');
      if (DS.Grow && real()) DS.Grow.add(acc(), { heal: 1 }, `heal_${code}_${mid}_${k}`).catch(() => {});
    });
  }
  // 보기 글자: 'venn:B|1 2 3 6' 은 벤 다이어그램 그림으로
  const optHtml = (o) => DS.UI.opt(o); // v0.9.3: 'vshade:영역' 색칠 그림도
  const hpText = (body, hp) => { const t = body.querySelector('.sc-hp .sc-n'), b = body.querySelector('.sc-hp .sc-bar i'); if (t) t.textContent = `${hp.left} / ${hp.max}`; if (b) b.style.width = `${hp.max ? (100 * hp.left) / hp.max : 0}%`; };
  const itemText = (q) => (q.type === 'blanks' ? q.items.map((it) => `${it.left} □ ${it.right}`).join('   ') : DS.UI.plain(q.question));
  const solOf = (q) => q.solution || (q.type === 'text' ? `정답: ${q.answers.join(' / ')}` : '');

  function fightForm(body, step, rec, hp) {
    const mid = step.id, attempt = rec.nextAttempt, key = `${mid}|${attempt}`;
    const items = Raid().itemsFor(L, R, mid, me, attempt);
    if (!form || form.key !== key) form = { key, given: items.map((q) => (q.type === 'multi' ? [] : q.type === 'number' ? 0 : q.type === 'text' ? '' : null)) };
    const prevWrong = rec.last ? rec.last.marks.map((m) => !m) : [];
    const ready = items.every((q, i) => (q.type === 'multi' ? form.given[i].length > 0 : q.type === 'text' ? String(form.given[i] || '').trim() !== '' : form.given[i] != null));
    const down = Raid().cleared(L, R, mid); // v0.9.2: 체력 0 → 쓰러졌어도 계속 풀고 공격할 수 있다
    const sig = `form|${key}|${JSON.stringify(form.given)}|${(R.help || {})[me] ? 1 : 0}|${down}`;
    if (sig === drawn && body.querySelector('.items')) { hpText(body, hp); return; }
    drawn = sig;
    // 🧹 2026-11-07 정돈판: 문제 = 「다듬은 양피지」 한 장 (장면은 위에 고정 · 문제가 길면 양피지 안에서만 스크롤) · ⚔ 공격! 은 아래 고정 줄
    // 2026-11-08 사용자 「문제 체크할 때마다 위로 스크롤이 올라감」: 같은 문제를 다시 그릴 때는 양피지 · 화면 스크롤 자리를 그대로 둠
    const keepKey = `form|${key}`, keep = body._keep === keepKey ? { p: (body.querySelector('.paper') || {}).scrollTop || 0, w: window.scrollY, b: body.scrollTop } : null; body._keep = keepKey;
    body.innerHTML = `<div class="panel framed st-fight">${scene(step, rec, hp, '', down ? '' : GAUGE)}
      <div class="paper"><div class="paper-h"><b>${step.special ? '⭐ ' : step.review ? '📖 ' : ''}${esc(step.title)}</b><small>${items.length > 1 ? `(1)~(${items.length}) 모두 풀고 공격` : '풀고 공격'}</small></div>
      ${down ? '<p class="paper-note ok">🎉 몬스터는 쓰러졌어요! 그래도 풀어서 공격하면 이펙트도 뜨고 경험치가 쌓여요.</p>' : ''}
      ${attempt && rec.perfect ? `<p class="paper-note">⛓ 몬스터 묶기 — 맞힌 소문제 1개마다 반 전체의 몬스터 공격이 1초 늦어져요 (최대 ${Raid().BIND_MAX}초)</p>` : attempt ? `<p class="paper-note">🔄 재도전 ${attempt} — 숫자가 모두 바뀌었어요 · 지난번 틀린 문항은 <b class="ngc">✘</b></p>` : ''}
      ${L.monsters[mid].note ? `<p class="paper-note">💡 ${esc(L.monsters[mid].note)}</p>` : ''}
      <div class="items">${items.map((q, i) => itemHtml(q, i, prevWrong[i], null)).join('')}</div></div>
      ${dock(rec, `<button class="btn primary big dock-go" id="st-go"${ready ? '' : ' disabled'}>⚔ 공격!</button>`)}
      ${helpBtn()}</div>`;
    if (keep) { const pp = body.querySelector('.paper'); if (pp) pp.scrollTop = keep.p; body.scrollTop = keep.b; window.scrollTo(0, keep.w); }
    bindTop();
    bindHelp();
    body.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => {
      const [i, v] = b.dataset.pick.split('|'); const k = Number(i);
      const t = items[k].type;
      if (t === 'multi') { const s = new Set(form.given[k]); const n = Number(v); if (s.has(n)) s.delete(n); else s.add(n); form.given[k] = [...s].sort((a, b2) => a - b2); }
      else if (t === 'choice') form.given[k] = Number(v);
      else if (t === 'ox') form.given[k] = v === 'O';
      else form.given[k] = [v];
      DS.Sound.clank(); render();
    }));
    body.querySelectorAll('[data-hint]').forEach((b) => b.addEventListener('click', () => { hintTap(b.dataset.hint); drawn = ''; render(); }));
    // 단답 입력: 다시 그리지 않고 값만 기억 (글자 입력 중에 화면이 바뀌지 않게) · 공격 버튼만 켜고 끔
    body.querySelectorAll('[data-text]').forEach((inp) => inp.addEventListener('input', () => {
      form.given[Number(inp.dataset.text)] = inp.value;
      const ok = items.every((q, j) => (q.type === 'multi' ? form.given[j].length > 0 : q.type === 'text' ? String(form.given[j] || '').trim() !== '' : form.given[j] != null));
      const go = $('#st-go'); if (go) go.disabled = !ok;
      drawn = `form|${key}|${JSON.stringify(form.given)}|${(R.help || {})[me] ? 1 : 0}`;
    }));
    DS.UI.dial(body, (i) => form.given[i], (i, v) => { form.given[i] = v; drawn = `form|${key}|${JSON.stringify(form.given)}|${(R.help || {})[me] ? 1 : 0}|${down}`; }); // 꾹 누르면 계속 · 숫자만 바꿈 (v0.9.6.16)
    $('#st-go').onclick = async () => {
      const given = items.map((q, i) => (q.type === 'blanks' ? form.given[i] : q.type === 'number' ? Number(form.given[i]) : form.given[i]));
      try { await DS.Act.submit(code, raw, mid, attempt, given); retrying = ''; form = null; dirty = true; } catch (e) { DS.UI.toast(e.message); }
    };
  }
  // ref: 첫 시도면 '문제 1 (2)' 처럼 학습지 문항 이름 → 문제 위에 작은 꼬리표 (같은 문제를 학습지에서 바로 찾게)
  // 💡 그림 힌트 (v0.9.7.4): 집합 문제면 문제 아래 버튼 → 벤 다이어그램 (학생 폰 · 몬스터만 · 종합상황실 시연에는 안 보임) · 처음 펼칠 때 한 번 센다(결과 기록 hints)
  const hintOpen = new Set();
  let sage = false; // 🌟 진필살기 석화 중 · 아직 못 맞힘
  const hintKey = (i) => `${(form && form.key) || ''}|${i}`;
  const hintCount = (c = code) => { try { return Number(localStorage.getItem(`citadel-hints-${c || ''}`)) || 0; } catch (e) { return 0; } };
  function hintTap(k) {
    if (hintOpen.has(k)) hintOpen.delete(k); else {
      hintOpen.add(k);
      try { const c = `citadel-hints-${code || ''}`, seen = `${c}|seen`, s = new Set(JSON.parse(localStorage.getItem(seen) || '[]')); if (!s.has(k)) { s.add(k); localStorage.setItem(seen, JSON.stringify([...s])); localStorage.setItem(c, String(s.size)); } } catch (e) { /* 무시 */ }
    }
  }
  function itemHtml(q, i, wasWrong, ref, G = form.given, noHint) { // G: 고른 답 (v0.9.3 종합상황실 시연도 같은 칸을 쓴다)
    const tag = wasWrong || ref ? `<span class="item-no">${wasWrong ? '<b class="ngc">✘ 지난번</b>' : ''}${ref ? ` <span class="sheet-tag">📄 ${esc(ref)}</span>` : ''}</span>` : ''; // 2026-11-07 정돈판: 번호는 문제 앞 (1) 하나
    const qno = (h) => (/^\s*\(\d+\)/.test(h) ? h.replace(/^(\s*)\((\d+)\)/, '$1<b class="q-no">($2)</b>') : `<b class="q-no">(${i + 1})</b> ${h}`);
    const hk = hintKey(i), hint = noHint || !DS.Hint ? '' : DS.Hint.html(q, hk, hintOpen.has(hk) || sage); // 🗿 석화 동안 못 맞힌 친구 = 💡 현자의 빛 (그림 힌트 저절로 펼침)
    const qText = (t) => `<div class="item-q">${qno(DS.UI.rich(t))}</div>${hint}`;
    if (q.type === 'blanks') {
      const it = q.items[0], v = (G[i] || [])[0];
      // 문제 상황(예: A = {1, 3, 5} 일 때 …)을 먼저 보여 주고, 그 아래에 □ 식
      return `<div class="item">${tag}${q.question ? `<div class="item-q bl-q">${DS.UI.rich(q.question)}</div>` : ''}<div class="item-q math">${pretty(it.left)} <b class="bl-box">${v ? esc(v) : '□'}</b> ${pretty(it.right)}</div>
        <div class="item-opts">${q.options.map((o) => `<button class="choice sym${v === o ? ' on' : ''}" data-pick="${i}|${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`;
    }
    if (q.type === 'multi') {
      const on = new Set(G[i]);
      return `<div class="item">${tag}${qText(q.question)}
        <div class="item-opts pickset">${q.options.map((o, k) => `<button class="choice chipset${on.has(k) ? ' on' : ''}" data-pick="${i}|${k}"><span class="math">${pretty(o)}</span></button>`).join('')}</div></div>`;
    }
    if (q.type === 'choice') {
      return `<div class="item">${tag}${qText(q.question)}
        <div class="item-opts col">${q.choices.map((o, k) => `<button class="choice opt${G[i] === k ? ' on' : ''}" data-pick="${i}|${k}">${optHtml(o)}</button>`).join('')}</div></div>`;
    }
    if (q.type === 'ox') {
      const v = G[i];
      return `<div class="item">${tag}${qText(q.question)}
        <div class="item-opts">${['O', 'X'].map((o) => `<button class="choice sym${v === (o === 'O') ? ' on' : ''}" data-pick="${i}|${o}">${o}</button>`).join('')}</div></div>`;
    }
    if (q.type === 'text') { // 단답: 글자 입력
      return `<div class="item">${tag}${qText(q.question)}<input class="item-text" data-text="${i}" maxlength="40" placeholder="답을 입력하세요" value="${esc(G[i] || '')}" autocomplete="off"></div>`;
    }
    // number: 다이얼 (십의 자리 · 일의 자리)
    const v = G[i], t = Math.floor(v / 10), o = v % 10;
    return `<div class="item">${tag}${qText(q.question)}
      <div class="dial"><div class="wheel"><button data-dial="${i}|10">▲</button><b>${t}</b><button data-dial="${i}|-10">▼</button></div><div class="wheel"><button data-dial="${i}|1">▲</button><b>${o}</b><button data-dial="${i}|-1">▼</button></div><span class="dial-val">= ${v}</span></div></div>`;
  }

  // ── 보스: 형성평가 1~7번 (2026-11-05 사용자 (나): 문항마다 첫 시도 = 학습지 그대로 · 재도전 3번은 숫자 · 문자가 바뀐 새 문제) ──
  function bossView(body) {
    { const lk = Raid().solveLock(L, R, DS.Net.now()); if (lk && lk.on && !Raid().bossAnswered(R, me)) return frozenView(body, Raid().stepOf(L, R), lk); } // ❄ 형성평가도 선생님이 켜면
    const S = Raid().bossState(L, R, me), hp = Raid().bossHp(L, R), N0 = Raid().BOSS_TRIES;
    const lab = (s) => (s.ok ? '✔ 도달' : !s.n ? '풀기' : s.left ? `✘ 다시 · 기회 ${s.left}` : '해설 보기');
    body.innerHTML = `<div class="panel framed">
      <div class="scene enc bg-scene th-${L.theme || ''} boss${hp.won ? '' : ' quake-once'}">${scTop()}${hpBox(hp.left, hp.max, hp.won ? '' : GAUGE, '👑 HP')}
        <div class="enc-hero">${heroNow(hp.won ? pose2(true, '') : 'think', hp.won ? 'pairhop' : 'huff')}<i class="shadow"></i>${plate()}</div>
        <div class="enc-mon">${DS.Art.monster(L.boss.sprite, hp.won ? 'down' : 'idle', hp.won ? '' : 'float')}</div></div>
      ${hp.won ? '<h2 class="okc center">🎉 보스 격파! 모두 함께 이겼어요!</h2>' : ''}
      <div class="boss-items">${S.map((s, i) => `<button class="bitem${s.ok ? ' ok' : s.n ? (s.left ? ' tried' : ' spent') : ''}${i >= L.boss.hpItems ? ' bonus' : ''}" data-i="${i}"><b>${i + 1}번${i >= L.boss.hpItems ? ' ⭐' : ''}</b> ${lab(s)}</button>`).join('')}</div>
      <p class="muted small">처음엔 학습지 형성평가와 같은 문제 · 틀리면 숫자가 바뀐 새 문제로 ${N0 - 1}번 더 (문항마다 기회 ${N0}번). 맞힌 문항마다 보스에게 1 데미지!${L.boss.items > L.boss.hpItems ? ` ⭐ ${L.boss.hpItems + 1}번부터는 보너스.` : ''}</p>
      ${Raid().canLobby(L, R, me) ? `<div class="stamp-bar">📮 반드시 학습지 확인도장 받아가세요.</div>${lobbyBtn()}` : ''}</div>`;
    bindLobby(); bindTop();
    body.querySelectorAll('.bitem').forEach((b) => b.addEventListener('click', async () => {
      const i = Number(b.dataset.i), st = Raid().bossState(L, R, me)[i];
      if (st.ok) { DS.UI.toast('이미 도달한 문항이에요.'); return; }
      if (!st.left) { // 기회를 다 씀 → 마지막 문제의 풀이
        const last = Raid().bossTries(L, R, me).filter((t) => t.i === i).pop();
        DS.UI.toast(`📖 ${i + 1}번 기회를 모두 썼어요 — ${last && last.q && last.q.solution ? String(last.q.solution).replace(/<[^>]+>/g, '') : '해설을 보며 학습지에 정리해요'}`, 5200); return;
      }
      const wait = Math.ceil((bossThink - Date.now()) / 1000);
      if (wait > 0) { DS.UI.toast(`🤔 생각 시간 ${wait}초 — 방금 틀린 문항을 학습지에서 다시 살펴봐요`); return; }
      const a = st.next, q = Raid().bossItem(L, R, me, i, a);
      const r = await DS.Quiz.ask({ name: `형성평가 ${i + 1}번`, formula: a === 0 ? '첫 시도' : `🔄 숫자가 바뀌었어요 · 재도전 ${a} / ${N0 - 1}` }, q, { collect: true, tag: '👑 보스', ref: a === 0 ? `학습지 형성평가 ${i + 1}번` : '' });
      try { await DS.Act.bossTry(code, i, a, r.given); } catch (e) { DS.UI.toast(e.message || '저장하지 못했어요'); return; }
      saveSoon(10000);
      const ok = DS.Quiz.grade(q, r.given);
      DS.Act.hit(code, raw, `b1_${i}_${a}`, { ok }); // ✨ 보스 문항 퍼펙트(첫 시도) · 🔥 콤보
      if (!ok && thinkSec() > 0) bossThink = Date.now() + thinkSec() * 1000;
      DS.UI.toast(ok ? `✔ ${i + 1}번 도달! 보스에게 데미지` : st.left - 1 > 0 ? `✘ ${i + 1}번은 아직… 🤔 ${thinkSec()}초 생각하고 숫자가 바뀐 문제로 다시! (기회 ${st.left - 1})` : `✘ ${i + 1}번 기회를 모두 썼어요 — 해설을 보며 학습지에 정리해요`, 2800);
      if (ok) { DS.Sound.slash(); setTimeout(() => DS.Sound.hit(), 160); const sc = document.querySelector('#st-body .scene'); if (sc) DS.FX.play(sc, myP().fx || 'flame', { scale: 0.32 }); } else DS.Sound.squish();
      // ⚡ 형성평가 퍼펙트 (2026-11-06): 모든 문항을 첫 시도에 맞힘 + 특화 Ⅳ 전설 스킬 → 마지막 문항에서 필살기 (형성평가는 맞히면 그 문항이 끝나서 「세트 2 · 3」 퍼펙트는 없음)
      if (ok && a === 0 && DS.Attack && DS.Attack.canUlt(myP().fx, myP().hero)) { const fr = Raid().bossState(L, R, me).map((x, k) => (k === i ? true : x.first)); if (fr.length && fr.every(Boolean)) setTimeout(() => DS.Attack.cutin(myP().hero || 0, myP().fx), 300); }
    }));
  }
  function endView(body) {
    const m = Raid().mastery(L, R, me).slice(0, L.boss.hpItems).filter(Boolean).length;
    body.innerHTML = `<div class="panel framed center win"><h2><i class="trophy-img sm" style="background-image:url('${DS.ASSETS.base}${DS.ASSETS.trophy}')"></i> 오늘의 던전 클리어!</h2><p class="muted small">형성평가 ${m} / ${L.boss.hpItems}${Raid().fullMarks(L, R, me) ? ' 만점!' : ''}</p>${DS.Art.hero(myP().hero, 'attack', 'big pairhop')}
      <div class="stamp-bar">📮 반드시 학습지 확인도장 받아가세요.</div>${lobbyBtn()}
      <p class="muted small">게임 기록은 수학 성적이 아니에요. 오늘 배운 것을 학습지에 정리해요.</p></div>`;
    bindLobby();
  }
  // v0.9.3 종합상황실 시연: 학생 폰과 같은 문항 칸 · 해설 줄
  return { enter, stop: stop0, itemHtml: (q, i, G) => itemHtml(q, i, false, null, G, true), solOf, itemText, hintCount };
})();
