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
  let test = null;          // 🧪 테스트 모드: { prep: 학습지 이미지, exit() } — 이 기기 안에서만, 집중모드 대신 학습지 이미지
  async function enter(c, info, opt = {}) {
    test = opt.test || null;
    cleared0 = false; resulted = false; drawn = ''; shown = ''; form = null; retrying = ''; bossSet = 1; othersSeen = {};
    await DS.Act.join(c, info);
    code = c; info0 = info; lastStep = null; lastOx = null; dirty = false; clearTimeout(saveT);
    me = DS.Net.uid();
    if (!test) { try { localStorage.setItem('citadel-student', JSON.stringify({ code: c, ...info })); } catch (e) { /* 무시 */ } }
    DS.UI.show('screen-student'); atkStart();
    if (!test) DS.Scene.save({ role: 'student', code: c });
    DS.Act.presence(c).catch(() => {});
    locked = !!(info.cls && (await DS.Net.get(`wordLock/${String(info.cls).replace(/[.#$/[\]]/g, '_')}/${info.num}`).catch(() => null)));
    if (stop) stop();
    stop = DS.Net.watch(`rooms/${code}`, (v) => {
      if (!v) return;
      raw = v; R = DS.Act.unpackRoom(v);
      { const nq = Object.keys(R.oxq || {}).length; if (nq !== lastOx) { if (lastOx !== null) dirty = true; lastOx = nq; } } // ⭕ OX 타임 결과도 다음 저장 때 기록에
      { const st = (R.state || {}).step ?? -1; if (lastStep !== null && st !== lastStep && dirty) setTimeout(saveNow, 300 + Math.random() * 2500); lastStep = st; } // 단계가 바뀌면 저장 (18명이 한꺼번에 몰리지 않게 조금씩 늦춤)
      L = DS.Lessons.get(R.meta.lesson); if (L && L.id !== DS.Art._entered) { DS.Art._entered = L.id; DS.Art.lessonEnter(L); } // v0.9.6 차시별 다운로드
      render();
    });
  }
  const acc = () => ({ c: info0.cls, n: info0.num, name: info0.nick, hero: info0.hero, fx: info0.fx, title: info0.title });
  // 💾 진행 저장 (v0.9.7.6 → v0.9.8.0 줄임 · 사용자 확정): ① 선생님이 다음 단계로 넘길 때 ② 형성평가는 마지막 답 10초 뒤 한 번 ③ 앱을 내리거나 닫을 때
  //   → 수업 끝 전에 나가도 대시보드 · EXP 가 남는다 · 기록 목록은 한 번만 읽고 바뀐 게 없으면 안 씀 (테스트 모드는 저장 안 함)
  let saveT = null, lastStep = null, dirty = false, lastOx = null;
  const canSave = () => !test && DS.Result && info0 && info0.cls != null && info0.num && L && R && me && Raid().activeIds(R).includes(me);
  function saveNow() { clearTimeout(saveT); saveT = null; if (!dirty || !canSave()) return; dirty = false; DS.Result.save(L, R, me, acc(), code, null, null, { cache: true }).catch(() => { dirty = true; }); }
  function saveSoon(ms = 10000) { dirty = true; clearTimeout(saveT); saveT = setTimeout(saveNow, ms); }
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveNow(); });
    window.addEventListener('pagehide', saveNow);
  }
  // 수업이 끝나면 모닥불로
  // v0.8.0: 수업이 끝나면 ⚔ 오늘의 전투 결과(개인) → 모닥불 (「⚔ 보강던전」 추천을 누르면 보강던전으로)
  function toCamp() {
    if (stop) stop(); stop = null; focus(false); atkStop();
    const t = test; test = null;
    const go = (bonus) => { if (t) { t.exit(); return; } if (bonus && DS.Bonus) DS.Bonus.enter(acc()); else DS.Camp.enter(acc()); };
    if (DS.Result && L && R && me && Raid().activeIds(R).includes(me)) return DS.Result.show(L, R, me, t ? null : acc(), code, go, { force: true }).catch(() => go()); // 2026-11-03: 수업이 끝나면 언제나 ⚔ 개인 결과 → 모닥불 (학급 결과는 대기실 버튼)
    go();
  }
  const stop0 = () => { saveNow(); if (stop) stop(); stop = null; focus(false); atkStop(); test = null; };
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

  function header() {
    const p = myP(), step = Raid().stepOf(L, R);
    $('#st-head').innerHTML = `${DS.Art.hero(p.hero || 0, 'idle', 'me')}
      <div><b>${DS.Titles ? DS.Titles.nameHtml(p, { beon: true }) : `${p.num}번 ${esc(p.nick || '')}`}</b><br><span class="muted small">${esc(L.unit)} · ${esc(L.title)}</span></div>
      <div class="st-badge">${Raid().isLobby(R) || myP().lobby ? '대기실' : Raid().isEnd(L, R) ? '마무리' : step.kind === 'boss' ? '보스' : step.kind === 'monster' ? (step.special ? '스페셜' : '전투') : '설명'}</div>`;
  }
  // v0.9.3 긴급 (사용자 요청): 🙋 도움 요청 버튼 없앰 — 수업 중에는 학생이 직접 손을 든다. 교사 폰의 「재도전까지 못 맞힘 · 2분째 미제출」 알림은 그대로
  const helpBtn = () => '';
  function bindHelp() {}

  function render() {
    if (Raid().isClosed(R)) return toCamp();
    if (!R.players || !R.players[me]) { $('#st-body').innerHTML = '<div class="panel"><p>입장 정보가 없어요. 처음 화면에서 다시 입장해 주세요.</p></div>'; return; }
    header();
    focus(!test && Raid().focusOn(R) && !Raid().isLobby(R) && !Raid().restOn(R));
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
    if (step.kind === 'monster') { monsterView(body, step); if (test || Raid().activeIds(R).length <= 6) othersFx(step, body); return; }
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
    const sig = `lobby|${after}|${others.length}|${JSON.stringify(w || null)}|${finale}|${full}|${(R.hide || {})[me] ? 1 : 0}|${kr}`;
    if (sig === drawn && body.querySelector('.lobby-scene')) return;
    drawn = sig;
    const crowd = others.map(([, p], k) => `<div class="lb-h${k % 2 ? ' face-l' : ''}" style="left:${12 + ((k * 37) % 76)}%;bottom:${8 + (k % 3) * 9}%;z-index:${30 - (8 + (k % 3) * 9)}">${DS.Art.hero(p.hero, 'idle', `small ${after && finale ? 'pairhop' : 'huff'}`)}<i class="shadow"></i></div>`).join('');
    body.innerHTML = `<div class="panel framed">
      <div class="lobby-scene bg-scene th-${L.theme || ''}"><p class="lb-title">${after ? `<i class="trophy-img sm" style="background-image:url('${DS.ASSETS.base}${DS.ASSETS.trophy}')"></i> ` : '⚔ '}${esc(dungeonName())} ${after ? '클리어!' : '단체 대기실'}</p>
        <div class="lb-h teacher" style="left:50%;bottom:20%">${DS.Art.hero(DS.ASSETS.heroes.teacher, 'idle', after && finale ? 'pairhop' : 'huff')}<i class="shadow"></i></div>
        ${crowd}<div class="lb-h me" style="left:34%;bottom:12%">${DS.Art.hero(myP().hero, 'idle', after && finale ? 'pairhop' : 'huff')}<i class="shadow"></i>${w && !(R.hide || {})[me] ? `<span class="lb-say">${esc(w.t)}</span>` : ''}</div>
        <p class="lb-greet">${after ? '모두 수고했네! 오늘 배운 것 한마디씩 남기게' : `${L.no ? `${L.no}차시 ` : ''}${esc(L.title.split('·')[0].trim())} 던전에 온 것을 환영하네!`}</p></div>
      ${after ? `<div class="stamp-bar">📮 반드시 학습지 확인도장 받아가세요.</div><button class="btn primary" id="st-mine">⚔ 내 전투 결과 보기</button>${kr ? '<button class="btn sc-btn" id="st-klass">🏫 우리 반 학급 결과 보기</button>' : ''}${wordsForm(w)}${'' /* 2026-11-03 사용자 확정: 모루는 개인 캠프(모닥불)에서만 — 대기실에서는 열지 않는다 (수업 중엔 여유가 없음) */}`
        : test ? '<p class="center">친구들이 다 모이면 아래 「수업 시작 ▶」을 눌러요!</p>' : '<p class="center">선생님이 수업을 시작할 때까지 기다려요. 학습지를 꺼내 두세요!</p>'}</div>`;
    if (after) bindWords();
    const kb = $('#st-klass'); if (kb) kb.onclick = () => DS.Control.run(() => DS.ShareCard.klassOpen(L, R));
    const mb = $('#st-mine'); if (mb) mb.onclick = () => DS.Control.run(() => DS.Result.show(L, R, me, test ? null : acc(), code, () => {}, { inClass: true, force: true }));
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
    DS.Result.show(L, R, me, test ? null : acc(), code, () => res(), { inClass: true }).catch(() => res());
  });
  const bindLobby = () => { const b = $('#st-lobby'); if (b) b.onclick = () => DS.Control.run(async () => { await showResult(); await DS.Act.toLobby(code); drawn = ''; }); };

  // ── 몬스터와 1:1 대치 ─────────────────────────────────────
  function sheetModal(step) {
    const img = (test.prep.img || {})[step.id]; if (!img) return;
    const el = document.createElement('div'); el.className = 'modal t-sheet-modal';
    el.innerHTML = `<div class="quiz-box framed"><p class="gold">📄 ${esc(step.title || '형성평가')} · 학습지</p><img class="t-sheet" src="${img}" alt="학습지"><button class="btn primary" id="ts-x">닫기</button></div>`;
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
  function scene(step, rec, hp, cls = '', gauge = '') {
    const segs = Array.from({ length: rec.total }, (_, i) => `<i class="${i < rec.best ? 'gone' : ''}"></i>`).join('');
    const left = rec.left, done = Raid().cleared(L, R, step.id);
    const pips = Array.from({ length: rec.slots }, (_, i) => `<i class="${i < left ? 'on' : ''}${i < Math.min(left, rec.healed) ? ' heal' : ''}"></i>`).join('');
    return `<div class="scene enc bg-scene th-${L.theme || ''} ${cls}${step.special ? ' special' : ''}"><div class="scene-bar"><div><b>${step.special ? '⭐ 난입! ' : step.review ? '📖 ' : ''}${esc(step.title)}</b><br><span class="muted small">레이드 체력 ${hp.left} / ${hp.max}</span></div></div>
      ${test ? `<div class="enc-friends">${Raid().activeIds(R).filter((u) => u !== me).slice(0, 4).map((u) => DS.Art.hero((R.players[u] || {}).hero || 0, 'idle', 'huff')).join('')}</div>` : ''}
      <div class="enc-hero"><div class="enc-tries" title="남은 도전 기회">${pips}</div>${heroNow(pose2(done, cls), done ? 'pairhop' : cls === 'miss' ? 'slump' : 'huff')}<i class="shadow"></i></div>
      <div class="enc-mon">${DS.Art.monster(L.monsters[step.id].sprite, done ? 'down' : 'idle', done ? '' : 'float')}<div class="segs" title="내가 맞힌 만큼 칸이 깨져요">${segs}</div>${gauge}</div></div>`;
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
    if (test) return;
    let k = 0;
    Raid().healsTo(R, mid, me).slice(0, Raid().HEAL_MAX).forEach((h) => {
      if (healSeen(`${code}|${mid}|${h.from}|${h.k}`)) return;
      healPop(`+1 💚 ${nickOf(h.from)} 응원`, (k++) * 700); DS.Sound.correct(); drawn = '';
      heroFx = { pose: 'healed', until: Date.now() + 1800 }; setTimeout(() => heroFlash('healed', 1600), 60);
    });
  }
  function monsterView(body, step) {
    const mid = step.id, rec = Raid().record(L, R, mid, me), hp = Raid().monsterHp(L, R, mid);
    healNotice(mid);
    const wantRetry = retrying === `${mid}|${rec.nextAttempt}` && rec.canRetry;
    if (!rec.submitted || wantRetry) return fightForm(body, step, rec, hp);
    const t = rec.last, label = Raid().resultLabel(t);
    const items = Raid().itemsFor(L, R, mid, me, t.attempt);
    const prac = rec.practice; // v0.9.2 연습 공격: 다 맞힌 뒤의 시도 → 이펙트는 그대로 · 데미지 0 · 「이미 성공」
    const fx = `${mid}|${t.attempt}` !== shown ? (label === 'fail' && !prac ? 'miss' : 'hit') : '';
    if (fx && t.correct < t.total && thinkSec() > 0) thinkUntil[`${mid}|${t.attempt}`] = Date.now() + thinkSec() * 1000;
    if (fx) { shown = `${mid}|${t.attempt}`; if (label === 'fail' && !prac) DS.Sound.squish(); else { DS.Sound.slash(); setTimeout(() => DS.Sound.hit(), 160); setTimeout(() => { const sc = body.querySelector('.scene'); if (sc) DS.FX.play(sc, myP().fx || 'flame', { perfect: label === 'success', scale: label === 'success' ? 0.42 : 0.3 }); }, 60); } }
    // ⚔ 마무리 일격: 내 이번 공격이 몬스터 체력을 0 으로 만들었으면
    const bestBefore = rec.tries.slice(0, -1).reduce((m, x) => Math.max(m, x.correct), 0), gain = rec.best - bestBefore;
    const finish = fx && !prac && gain > 0 && Raid().cleared(L, R, mid) && hp.left + gain > 0;
    if (finish) setTimeout(() => { const sc = body.querySelector('.scene'); if (sc) { sc.classList.add('fin-flash'); DS.FX.play(sc, myP().fx || 'flame', { perfect: true, scale: 0.6 }); } DS.Sound.correct(); }, 500);
    const head = prac ? `⛓ 몬스터 묶기 ${t.correct}/${t.total} — 지금까지 <b>${Raid().bindOf(L, R, mid, me)}초</b> 묶음 <span class="small muted">(최대 ${Raid().BIND_MAX}초)</span>` : { success: '⚔ 공격 성공!', partial: `⚔ 부분 성공 (${t.correct}/${t.total})`, fail: '💨 공격 실패…' }[label];
    const done = Raid().cleared(L, R, mid);
    const sig = `res|${mid}|${t.attempt}|${done}|${rec.canRetry}|${rec.left}|${(R.help || {})[me] ? 1 : 0}`;
    if (sig === drawn && body.querySelector('.marks')) { hpText(body, hp); return; }
    drawn = sig;
    body.innerHTML = `<div class="panel framed">${scene(step, rec, hp, fx)}
      ${finish ? '<div class="fin-me">⚔ 마무리 일격! <small>내 공격으로 몬스터가 쓰러졌어요 — 모두의 과제를 마무리했어요!</small></div>' : ''}<h2 class="res-${prac ? 'success' : label}">${head}</h2>
      <div class="marks">${items.map((q, i) => `<div class="mark ${t.marks[i] ? 'ok' : 'ng'}"><b>${i + 1}</b> ${t.marks[i] ? '✔' : '✘'} <span class="math">${pretty(itemText(q))}</span>${t.marks[i] ? '' : `<br><span class="sol-line math">${pretty(solOf(q))}</span>`}</div>`).join('')}</div>
      ${rec.perfect && rec.canRetry ? `<p class="okc">✔ 이미 성공한 몬스터예요!</p><p>남은 기회 <b>${rec.left}</b>번으로 무엇을 할까요?</p>
        <div class="heal-pick"><button class="btn primary big" id="st-retry">⛓ 몬스터 묶기</button><button class="btn big heal-btn" id="st-heal">💚 친구 힐</button></div>
        <p class="muted small">몬스터 묶기 = 숫자 바뀐 문제를 맞힌 만큼 몬스터 공격을 늦춤 (1개 1초 · 최대 ${Raid().BIND_MAX}초) · 친구 힐 = 기회가 필요한 친구에게 도전 기회 한 칸</p>`
        : done && rec.canRetry ? `<p class="okc big-msg">🎉 몬스터 격파!</p><p>틀린 소문제를 다시 풀어 볼까요? <span class="muted small">(남은 기회 ${rec.left}번 · 숫자가 모두 바뀌어요 · 고친 만큼 경험치가 더 쌓여요)</span></p><button class="btn primary big" id="st-retry">↻ 다시 도전</button>`
        : done ? '<p class="okc big-msg">🎉 몬스터 격파! 다음 신호를 기다려요.</p>'
        : rec.canRetry ? `<p>다시 해 보겠습니까? <span class="muted small">(남은 기회 ${rec.left}번 · 숫자가 모두 바뀌어요)</span></p><button class="btn primary big" id="st-retry">↻ 다시 도전</button>`
        : `<p class="muted">${rec.perfect ? '멋져요! 기회를 모두 썼어요. 다른 용사들을 기다려요.' : '재도전 기회를 모두 썼어요. 해설을 보며 학습지에 정리해요.'} 데미지 <b>${rec.best}</b></p>`}
      ${test && (test.prep.img || {})[mid] ? '<button class="btn small" id="st-sheet">📄 학습지 보기 (문제 해설)</button>' : ''}
      ${test ? '' : helpBtn()}</div>`;
    bindHelp();
    const sb = $('#st-sheet'); if (sb) sb.onclick = () => sheetModal(step);
    // v0.9.3 (⑤): 공격 자세는 잠깐만 → 다시 서 있는 자세 (격파됐으면 승리 자세 그대로)
    if (fx && !done) setTimeout(() => { const a = body.querySelector('.enc-hero .art'); if (a) a.outerHTML = heroNow('idle', fx === 'miss' ? 'slump' : 'huff'); }, 650);
    const rb = $('#st-retry');
    if (rb) { thinkTimer(rb, `${mid}|${t.attempt}`, rec.perfect ? '⛓ 몬스터 묶기' : '↻ 다시 도전'); rb.onclick = () => { retrying = `${mid}|${rec.nextAttempt}`; form = null; DS.Sound.clank(); render(); }; }
    const hb = $('#st-heal');
    if (hb) hb.onclick = () => DS.Control.run(async () => {
      hb.disabled = true;
      const k = Raid().healsGiven(R, mid, me), to = await DS.Act.heal(code, raw, mid);
      DS.Sound.correct(); drawn = '';
      heroFx = { pose: 'heal', until: Date.now() + 1600 }; setTimeout(() => heroFlash('heal', 1400), 60);
      healPop(to ? `💚 ${nickOf(to)}에게 +1` : '💚 응원 보냄!');
      if (DS.Grow && !test) DS.Grow.add(acc(), { heal: 1 }, `heal_${code}_${mid}_${k}`).catch(() => {});
    });
  }
  // 보기 글자: 'venn:B|1 2 3 6' 은 벤 다이어그램 그림으로
  const optHtml = (o) => DS.UI.opt(o); // v0.9.3: 'vshade:영역' 색칠 그림도
  const hpText = (body, hp) => { const t = body.querySelector('.scene-bar .muted'); if (t) t.textContent = `레이드 체력 ${hp.left} / ${hp.max}`; };
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
    body.innerHTML = `<div class="panel framed">${scene(step, rec, hp, '', down ? '' : GAUGE)}
      ${down ? '<p class="okc down-note">🎉 몬스터는 쓰러졌어요! 그래도 풀어서 공격하면 이펙트도 뜨고 경험치가 쌓여요.</p>' : ''}
      ${attempt && rec.perfect ? `<p class="retry-note">⛓ 몬스터 묶기 — 이미 성공한 몬스터예요. 맞힌 소문제 1개마다 반 전체의 몬스터 공격이 1초 늦어져요 (최대 ${Raid().BIND_MAX}초)</p>` : attempt ? `<p class="retry-note">↻ 재도전 ${attempt} — 숫자가 모두 바뀌었어요. 지난번 틀린 칸은 <b class="ngc">✘</b> 표시</p>` : ''}
      ${L.monsters[mid].note ? `<p class="muted small">💡 ${esc(L.monsters[mid].note)}</p>` : ''}
      <div class="items">${items.map((q, i) => itemHtml(q, i, prevWrong[i], attempt ? null : (q.ref || `${step.sheet || step.title} (${i + 1})`))).join('')}</div>
      <button class="btn primary big" id="st-go"${ready ? '' : ' disabled'}>⚔ 공격!</button>
      ${helpBtn()}</div>`;
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
  const hintKey = (i) => `${(form && form.key) || ''}|${i}`;
  const hintCount = (c = code) => { try { return Number(localStorage.getItem(`citadel-hints-${c || ''}`)) || 0; } catch (e) { return 0; } };
  function hintTap(k) {
    if (hintOpen.has(k)) hintOpen.delete(k); else {
      hintOpen.add(k);
      try { const c = `citadel-hints-${code || ''}`, seen = `${c}|seen`, s = new Set(JSON.parse(localStorage.getItem(seen) || '[]')); if (!s.has(k)) { s.add(k); localStorage.setItem(seen, JSON.stringify([...s])); localStorage.setItem(c, String(s.size)); } } catch (e) { /* 무시 */ }
    }
  }
  function itemHtml(q, i, wasWrong, ref, G = form.given, noHint) { // G: 고른 답 (v0.9.3 종합상황실 시연도 같은 칸을 쓴다)
    const tag = `<span class="item-no">${i + 1}${wasWrong ? ' <b class="ngc">✘</b>' : ''}${ref ? ` <span class="sheet-tag">📄 ${esc(ref)}</span>` : ''}</span>`;
    const hk = hintKey(i), hint = noHint || !DS.Hint ? '' : DS.Hint.html(q, hk, hintOpen.has(hk));
    const qText = (t) => `<div class="item-q">${DS.UI.rich(t)}</div>${hint}`;
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

  // ── 보스: 형성평가 1~7번 (세트1 → 틀린 문항은 세트2) ──────────────
  function bossView(body) {
    const m = Raid().mastery(L, R, me), ans = ((R.bossAns || {})[me]) || {};
    const hp = Raid().bossHp(L, R);
    const items = L.boss.sets[bossSet];
    const mine = (ans[bossSet] || []).slice();
    body.innerHTML = `<div class="panel framed">
      <div class="scene enc bg-scene th-${L.theme || ''} boss${hp.won ? '' : ' quake-once'}"><div class="scene-bar"><div><b>👑 ${esc(L.boss.title)}</b><br><span class="muted small">보스 체력 ${hp.left} / ${hp.max}</span></div></div>
        <div class="enc-hero">${heroNow(hp.won ? pose2(true, '') : 'think', hp.won ? 'pairhop' : 'huff')}<i class="shadow"></i></div>
        <div class="enc-mon">${DS.Art.monster(L.boss.sprite, hp.won ? 'down' : 'idle', hp.won ? '' : 'float')}<div class="hpbar"><i style="width:${hp.max ? (100 * hp.left) / hp.max : 0}%"></i></div>${hp.won ? '' : GAUGE}</div></div>
      ${hp.won ? '<h2 class="okc center">🎉 보스 격파! 모두 함께 이겼어요!</h2>' : ''}
      <div class="tabs"><button class="tab${bossSet === 1 ? ' on' : ''}" data-s="1">세트 1</button><button class="tab${bossSet === 2 ? ' on' : ''}" data-s="2">세트 2 (재도전)</button></div>
      <div class="boss-items">${items.map((p, i) => `<button class="bitem${m[i] ? ' ok' : mine[i] != null ? ' tried' : ''}${i >= L.boss.hpItems ? ' bonus' : ''}" data-i="${i}"><b>${i + 1}번${i >= L.boss.hpItems ? ' ⭐' : ''}</b> ${m[i] ? '✔ 도달' : mine[i] != null ? '✘ 다시' : '풀기'}</button>`).join('')}</div>
      <p class="muted small">세트1 = 학습지 형성평가와 같은 문제 · 세트2 = 숫자가 바뀐 문제. 맞힌 문항마다 보스에게 1 데미지!${L.boss.items > L.boss.hpItems ? ` ⭐ ${L.boss.hpItems + 1}번부터는 보너스.` : ''}</p>
      ${Raid().canLobby(L, R, me) ? `<div class="stamp-bar">📮 반드시 학습지 확인도장 받아가세요.</div>${lobbyBtn()}` : ''}</div>`;
    bindLobby();
    body.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => { bossSet = Number(b.dataset.s); render(); }));
    body.querySelectorAll('.bitem').forEach((b) => b.addEventListener('click', async () => {
      const i = Number(b.dataset.i);
      if (m[i]) { DS.UI.toast('이미 도달한 문항이에요.'); return; }
      const wait = Math.ceil((bossThink - Date.now()) / 1000);
      if (wait > 0) { DS.UI.toast(`🤔 생각 시간 ${wait}초 — 방금 틀린 문항을 학습지에서 다시 살펴봐요`); return; }
      const r = await DS.Quiz.ask({ name: `형성평가 ${i + 1}번`, formula: bossSet === 1 ? '세트 1' : '세트 2 · 🔄 숫자가 바뀌었어요' }, items[i], { collect: true, tag: '👑 보스', ref: bossSet === 1 ? `학습지 형성평가 ${i + 1}번` : '' });
      const next = (ans[bossSet] || Array(L.boss.items).fill(null)).slice();
      while (next.length < L.boss.items) next.push(null);
      next[i] = r.given;
      await DS.Act.bossAnswer(code, bossSet, next); saveSoon(10000);
      const ok = DS.Quiz.grade(items[i], r.given);
      if (!ok && thinkSec() > 0) bossThink = Date.now() + thinkSec() * 1000;
      DS.UI.toast(ok ? `✔ ${i + 1}번 도달! 보스에게 데미지` : `✘ ${i + 1}번은 아직… 🤔 ${thinkSec()}초 생각하고 ${bossSet === 1 ? '세트 2 로' : '다시'} 도전!`, 2600);
      if (ok) { DS.Sound.slash(); setTimeout(() => DS.Sound.hit(), 160); const sc = document.querySelector('#st-body .scene'); if (sc) DS.FX.play(sc, myP().fx || 'flame', { scale: 0.32 }); } else DS.Sound.squish();
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
