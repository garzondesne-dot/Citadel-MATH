// 🧪 테스트 모드 (교사용): 학생 계정 없이 학생 폰 화면으로 수업 한 차시를 처음부터 끝까지 혼자 확인한다.
// - 실제 수업과 완전히 분리: 이 기기 안의 따로 된 저장소(LocalNet 'citadel-test-db')에서만 진행, Firebase 에는 아무것도 쓰지 않는다
// - 학습지 이미지(수업 준비에서 올린 것)만 Firebase 에서 읽어 온다 → 개념 설명 · 「📄 학습지 보기」에 보여 줌
// - v0.8.0: 🧪 테스트 모닥불에서 시작(차원문이 실시간으로 나타남) → 수업 → 모닥불로 돌아옴. 모루 · 보강던전 · 설정도 이 기기 안에서만
// - 가상 친구 용사 4명이 함께 공격(DS.Bots) · 교사 ◀ ▶ 대신 아래 막대의 「◀ · 다음 ▶ · 끝내기」 · 기록은 저장하지 않음
window.DS = window.DS || {};

DS.Test = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  const FRIENDS = 4;
  let real = null, local = null, code = null, L = null, R = null, armed = '';

  let trial = null, tme = null, hallKey = ''; // 👩‍🏫 교사용 체험판 (2026-11-07 v2 · trial/): { name, hero } · tme = 메모리 저장소 안의 학생 계정 · hallKey = 위 TV 창(종합상황실) 열쇠
  const CLS0 = '테스트';
  const cls = () => (trial ? DS.TRIAL.cls : CLS0);
  const ME = () => (trial ? tme : { c: CLS0, n: 1, name: '선생님(테스트)', hero: look.hero, fx: look.fx, test: true });
  let prep = {}, look = { hero: 0, fx: 'flame' }, where = 'camp';
  // v0.8.0: 학생이 실제로 겪는 흐름 그대로 — 🧪 테스트 모닥불 → (1초 뒤) 차원문이 나타남 → 탭해서 입장 → 수업 → 모닥불로 돌아옴
  let demo = null; // 🎮 체험판(DS.DEMO): 한 파일 HTML · 인터넷 없음 · 모닥불 없이 바로 던전 → 끝나면 「다시 하기」
  async function start(lessonId, opt = {}) {
    if (real) return;
    L = DS.Lessons.get(lessonId);
    demo = opt.demo ? opt : null; trial = opt.trial || null;
    // 1) 학습지 이미지 · 영상 링크는 실제 서버에서 읽기만 (체험판은 파일 안에 든 개념 카드)
    if (opt.prep) prep = opt.prep;
    else { try { prep = (await DS.Net.get(`prep/${lessonId}`)) || {}; } catch (e) { prep = {}; } }
    // 2) 이 기기 안의 테스트 저장소로 바꿔 끼움 (실제 수업 · 계정에는 손대지 않음)
    real = DS.Net.impl;
    local = DS.Net.LocalNet('citadel-test-db');
    DS.Net.use(local);
    local.wipe();
    await local.init(); local.setUid('test-teacher');
    if (trial && prep && typeof prep === 'object') await local.set(`prep/${lessonId}`, prep).catch(() => {}); // 👩‍🏫 체험판: 위 TV(종합상황실)도 학습지 그림 · 영상을 읽게 (메모리 저장소라 용량 걱정 없음 · 교사 테스트는 localStorage 라 넣지 않음)
    look = demo ? { hero: demo.hero ?? 16, fx: demo.fx || 'flame' } : { hero: 0, fx: 'flame' };
    if (trial) { // 👩‍🏫 메모리 저장소 안에 진짜 학생 계정 하나 (기록 · 💎 · EXP · 오답노트 · 성채가 실제처럼 · 탭을 닫으면 사라짐)
      look = { hero: trial.hero, fx: DS.FX.affOf(trial.hero).ids[0] };
      await local.signUp('trial@ds.local', '0000');
      await local.set(`roster/${DS.TRIAL.cls}/1`, trial.name);
      await local.set(`accounts/${DS.TRIAL.cls}/1`, { uid: local.uid(), gen: 1, hero: look.hero, fx: look.fx });
      tme = Object.assign({}, (await DS.Account.me()) || { c: DS.TRIAL.cls, n: 1, name: trial.name, hero: look.hero, fx: look.fx }, { trial: true });
      where = 'camp'; bar(true);
      await DS.Camp.enter(tme);
      setTimeout(() => { if (real) DS.Control.run(openGate); }, 1000);
      return;
    }
    if (demo) { where = 'raid'; bar(true); await openGate(); await join(code); return; }
    where = 'camp'; bar(true);
    await DS.Camp.enter(ME());
    DS.UI.toast(`🧪 테스트 모드 · ${L.title} — 학생 캠프이에요. 곧 차원문이 열려요`, 3200);
    setTimeout(() => { if (real) DS.Control.run(openGate); }, 1000);
  }
  // 선생님이 「새 수업 만들기」를 누른 것과 같음 → live/테스트 에 차원문이 실시간으로 나타난다
  async function openGate() {
    const r = await DS.Act.createRoom(L.id, cls(), { noLimit: true }); // 🧪 테스트 모드 = 시간 제한 없음
    code = r.code; hallKey = r.hallKey; R = null; armed = '';
    if (demo) return;
    draw(true);
  }
  // 모닥불에서 차원문을 누르면 (camp.js 가 부름)
  async function join(c) {
    code = c; where = 'raid';
    DS.Bots.start(code, demo ? demo.friends || FRIENDS : FRIENDS, { speed: 2, acc: { item: 0.75, boss: 0.8 } });
    draw(true);
    if (trial) { const a = (await DS.Account.me()) || tme; look = { hero: a.hero, fx: a.fx || look.fx }; }
    await DS.Student.enter(code, { num: 1, nick: demo ? demo.nick || '나' : trial ? trial.name : '선생님(테스트)', hero: look.hero, fx: look.fx, cls: cls() }, {
      test: { prep, exit: () => backToCamp(), onRender: (l, room) => { R = room; draw(); }, real: !!trial },
    });
    if (trial) { tvHall(true); return; }
    DS.UI.toast(demo ? '친구들이 들어오면 아래 「수업 시작 ▶」을 눌러요' : `가상 친구 ${FRIENDS}명이 들어오면 아래 「수업 시작 ▶」`, 3000);
  }
  function backToCamp() {
    let score = '';
    try { if (R && L) { const m = DS.Raid.mastery(L, R, 'test-teacher'); score = ` · 형성평가 ${m.slice(0, L.boss.hpItems).filter(Boolean).length} / ${L.boss.hpItems}`; } } catch (e) { /* 무시 */ }
    if (demo) { DS.Bots.stop(); R = null; return demoEnd(score); }
    DS.Bots.stop(); where = 'camp'; R = null; if (trial) tvHall(false); ['#test-tv', '#test-fun'].forEach((q) => { const e = $(q); if (e) e.remove(); }); document.body.classList.remove('has-test-tv'); draw(true);
    if (trial) return trialEnd();
    DS.Camp.enter(ME());
    DS.UI.toast(`🏆 테스트 수업 끝!${score} — 내 캠프로 돌아왔어요 (기록은 저장하지 않아요)`, 4000);
  }
  // 🎮 체험판 끝 화면: 점수 · 다시 하기 (기록 없음)
  function demoEnd(score) {
    bar(false); DS.Student.stop();
    const el = document.getElementById('st-body'); DS.UI.show('screen-student');
    if (el) el.innerHTML = `<div class="panel framed center win"><h2>🏆 체험 수업 끝!</h2><p>${esc(L.title)}${esc(score)}</p>${DS.Art.hero(look.hero, 'win', 'big')}
      <p class="muted small">「모두의 던전」 체험판 · 기록은 저장하지 않아요</p><button class="btn primary" id="demo-again">↻ 처음부터 다시 하기</button></div>`;
    const b = document.getElementById('demo-again'); if (b) b.onclick = () => location.reload();
  }
  const setLook = (hero, fx) => { look = { hero, fx }; };
  // 아래 막대: ◀ · 지금 단계 · 다음 ▶ · 끝내기
  function bar(on) {
    let el = $('#test-bar');
    if (!on) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement('div'); el.id = 'test-bar'; el.className = 'test-bar'; document.body.appendChild(el); }
    draw();
  }
  function draw(force) {
    const el = $('#test-bar'); if (!el) return;
    if (force) el.dataset.sig = '';
    if (where === 'camp') {
      if (el.dataset.sig === 'camp') return;
      el.dataset.sig = 'camp';
      el.innerHTML = trial ? `<b>👩‍🏫 체험판</b><span class="tb-step">${L.no}차시 · 내 캠프</span><button class="btn small" id="tb-x">↻ 처음부터</button>`
        : `<b>🧪 테스트</b><span class="tb-step">${esc(L.title)} · 내 캠프</span><button class="btn small" id="tb-gate">🌀 차원문 다시 열기</button><button class="btn small" id="tb-x">끝내기</button>`;
      { const g = $('#tb-gate'); if (g) g.onclick = () => DS.Control.run(openGate); }
      $('#tb-x').onclick = () => { if (trial) return again(); if (confirm('테스트를 끝내고 교사 메뉴로 돌아갈까요?')) finish(false); };
      return;
    }
    if (!R) return;
    tv(); funRow();
    if (DS.Raid.restOn(R) && !DS.Raid.isLobby(R)) return restBar(el);
    const i = R.state.step ?? -1, studs = Object.values(R.players || {}).filter((p) => !p.teacher).length;
    const next = DS.Raid.isLobby(R) ? `수업 시작 ▶ (${studs}명)` : DS.Raid.isFinale(L, R) ? '수업 끝 ▶' : '다음 ▶';
    const stp = DS.Raid.stepOf(L, R), media = { id: stp && stp.id, title: stp ? stp.title || '' : '', vid: null, img: null };
    if (stp) { const v = DS.Video.pick(L, (prep || {}).video, stp.id); if (v && DS.Video.ok(v)) media.vid = v; media.img = ((prep || {}).img || {})[stp.id] || null; }
    const foc = !!R.state.focus, sig = `${i}|${studs}|${R.state.closed ? 1 : 0}|${media.vid ? 1 : 0}${media.img ? 1 : 0}|${foc}`;
    if (el.dataset.sig === sig) return;
    el.dataset.sig = sig;
    el.innerHTML = `<b>${demo || trial ? (trial ? '👩‍🏫' : '🎮 체험판') : '🧪 테스트'}</b><span class="tb-step">${esc(DS.Control.stepName(L, R))}</span>
      ${media.vid ? '<button class="btn small tb-ic" id="tb-vid" title="이 단계 설명 영상">🎬</button>' : ''}${media.img ? `<button class="btn small tb-ic" id="tb-img" title="이 단계 학습지 · 문제 이미지">📄</button>` : ''}
      ${i >= 0 && !demo && DS.Fun ? '<button class="btn small tb-ic" id="tb-rest" title="🏕 쉼터 — 쉬는 시간 놀이(⚖ 🔄 ⭕ 🏰)를 친구 봇들과 해 봐요">🏕</button>' : ''}${i >= 0 && !demo && !R.state.closed ? `<button class="btn small tb-ic${foc ? ' on' : ''}" id="tb-focus" title="👀 집중모드 — 학생 폰을 잠그고 앞(교실 TV)을 보게 해요 · 몬스터 공격도 멈춤">👀${foc && !trial ? ' 끄기' : ''}</button>` : ''}<button class="btn small" id="tb-back"${i < 0 ? ' disabled' : ''}>◀</button><button class="btn primary" id="tb-next">${next}</button><button class="btn small" id="tb-x">${trial ? '↻' : '끝내기'}</button>`;
    { const fo = $('#tb-focus'); if (fo) fo.onclick = () => DS.Control.run(() => DS.Act.setFocus(code, !foc)); } // 👀 집중모드 (2026-11-07 사용자 「체험판 막대에 집중모드」)
    // 🎬 · 📄 (2026-11-04 사용자 요청): 테스트 · 체험판에서도 그 단계에 붙은 설명 영상 · 문제(학습지) 이미지를 바로 확인
    const vb = $('#tb-vid'); if (vb) vb.onclick = () => DS.Video.open(media.vid, media.title, { lesson: L.id, slot: media.id });
    const ib = $('#tb-img'); if (ib) ib.onclick = () => { const v = document.createElement('div'); v.className = 'modal sheet-modal'; v.innerHTML = `<div class="quiz-box framed"><div class="quiz-head"><b>📄 ${esc(media.title)}</b><button class="btn small" data-x>✕ 닫기</button></div><img class="bn-sheet" src="${media.img}" alt="학습지"></div>`; v.querySelector('[data-x]').onclick = () => v.remove(); document.body.appendChild(v); };
    const rb = $('#tb-rest'); if (rb) rb.onclick = () => DS.Control.run(() => DS.Act.setRest(code, true, 10));
    $('#tb-back').onclick = () => DS.Control.run(() => DS.Act.go(code, R, L, -1));
    $('#tb-next').onclick = () => DS.Control.run(async () => {
      if (DS.Raid.isLobby(R) && studs < 2) { DS.UI.toast('가상 친구가 들어오는 중이에요…'); return; }
      if (DS.Raid.isFinale(L, R) && armed !== 'end') { armed = 'end'; DS.UI.toast(demo ? '한 번 더 누르면 체험 수업을 끝내요' : '한 번 더 누르면 테스트 수업을 끝내요'); return; }
      armed = ''; await DS.Act.go(code, R, L, 1);
    });
    $('#tb-x').onclick = () => { if (demo || trial) return again(); if (confirm('테스트를 끝내고 교사 메뉴로 돌아갈까요?')) finish(false); };
  }
  // ── 🏕 쉼터 놀이 (2026-11-07 사용자 「테스트모드에서 미니게임」) ─────────────
  //   아래 막대 = 쉼터 막대(▶ 수업으로) · 그 위 줄 = 교사 리모컨과 같은 놀이 단추(⚖ 🔄 ⭕ 🏰 · 방패 · 응원 · 끝) + 🏰 지도 고르기 · ⏩ 빨리 감기
  //   위 = 작은 TV 창(종합상황실 화면을 1280×720 으로 그려 줄임) · 🏰 디펜스는 이 창이 계산을 맡음 (noHost) · 가상 친구 봇도 고르고 자리를 잡음
  let tvOn = true, tdMap = '', fast = false;
  const MAPS = () => (DS.TDMaps ? DS.TDMaps.MAPS : []);
  function restBar(el) {
    const f = R.fun, sig = `rest|${f ? `${f.kind}|${f.phase}` : ''}|${tvOn}`;
    if (el.dataset.sig === sig) return;
    el.dataset.sig = sig;
    el.innerHTML = `<b>${trial ? '🏕' : '🧪 쉼터'}</b><span class="tb-step">${f ? '놀이 중 — 친구 4명도 함께해요' : '위 줄에서 놀이를 골라요'}</span>${f && !trial ? `<button class="btn small tb-ic" id="tb-tv" title="작은 TV 창 켜기 · 끄기">📺${tvOn ? '' : ' 켜기'}</button>` : ''}<button class="btn primary" id="tb-back-class">▶ 수업으로</button><button class="btn small" id="tb-x">${trial ? '↻' : '끝내기'}</button>`;
    $('#tb-back-class').onclick = () => DS.Control.run(() => DS.Act.setRest(code, false));
    const t = $('#tb-tv'); if (t) t.onclick = () => { tvOn = !tvOn; el.dataset.sig = ''; draw(); };
    $('#tb-x').onclick = () => { if (trial) return again(); if (confirm('테스트를 끝내고 교사 메뉴로 돌아갈까요?')) finish(false); };
  }
  function funRow() {
    let row = $('#test-fun');
    const on = R && DS.Fun && DS.Raid.restOn(R) && !DS.Raid.isLobby(R) && !demo;
    if (!on) { if (row) row.remove(); return; }
    if (!row) { row = document.createElement('div'); row.id = 'test-fun'; row.className = 'test-fun'; document.body.appendChild(row); }
    const f = R.fun, extra = trial ? '' : !f ? `<select id="tf-map" title="🏰 디펜스 지도"><option value="">🏰 지도: 차례대로</option>${MAPS().map((m) => `<option value="${m.id}"${tdMap === m.id ? ' selected' : ''}>${esc(m.name)}</option>`).join('')}</select>`
      : f.kind === 'td' ? `<button class="btn small" id="tf-fast" title="화면 확인용 빨리 감기">⏩ ${fast ? '3배속' : '보통'}</button>` : '';
    let html = `${DS.Fun.ctlHtml(R)}${extra}`;
    if (trial) html = html.replace(/<button[^>]*k-td[^>]*>[\s\S]*?<\/button>/g, ''); // 👩‍🏫 체험판: 🏰 디펜스 뺌
    if (row.dataset.html === html) return;
    row.dataset.html = html; row.innerHTML = html;
    DS.Fun.bind(row, code, R, () => ({ noHost: true, map: tdMap || undefined }));
    row.querySelectorAll('[data-oxq]').forEach((b) => (b.onclick = () => DS.Control.run(async () => { await DS.Net.set(`rooms/${code}/state/rest/quiz`, true).catch(() => {}); await DS.Fun.start(code, R, 'quiz', b.dataset.oxq); })));
    const sel = $('#tf-map'); if (sel) sel.onchange = () => { tdMap = sel.value; };
    const fb = $('#tf-fast'); if (fb) fb.onclick = () => { fast = !fast; window.DS_TD = { ...(window.DS_TD || {}), speed: fast ? 3 : 1 }; row.dataset.html = ''; funRow(); };
  }
  function tv() {
    if (trial) return tvHall(where === 'raid' && !!R);
    let box = $('#test-tv');
    const want = tvOn && R && DS.Fun && DS.Raid.restOn(R) && !DS.Raid.isLobby(R) && R.fun && !demo;
    if (!want) { if (box) { box.remove(); document.body.classList.remove('has-test-tv'); } return; }
    if (!box) {
      box = document.createElement('div'); box.id = 'test-tv'; box.className = 'test-tv'; box.innerHTML = '<div class="tt-in"></div><i class="tt-l">📺 종합상황실(교실 TV) 화면</i>';
      document.body.appendChild(box); document.body.classList.add('has-test-tv');
      const fit = () => { const w = Math.min(window.innerWidth, 900), k = w / 1280; box.style.width = `${w}px`; box.style.height = `${720 * k}px`; box.querySelector('.tt-in').style.transform = `scale(${k})`; document.body.style.setProperty('--tvh', `${720 * k}px`); };
      fit(); window.addEventListener('resize', () => { if (box.isConnected) fit(); });
    }
    try { DS.Fun.hall(box.querySelector('.tt-in'), R, code); } catch (e) { console.error(e); }
  }
  // ── 👩‍🏫 교사용 체험판 v2 (2026-11-07 사용자 「테스트 모드 기준 · 3차시 · 디펜스 빼기」) ─────────────
  //   링크 trial/ → 첫 화면 그림(터치) → 테스트 모닥불 → 차원문 → 대기실(가상 친구 4명) → 도입 · 개념1 · 문제1 → 🏕 → 개념2 · 문제2 → 👑 형성평가 3문항 → 결과 → 모닥불 💎 200
  //   진행 = 테스트 막대(◀ · 다음 ▶ · 🏕 · 👀 집중 · 🎬 · 📄 · ↻ 처음부터) · 화면 = 위 TV 창(종합상황실 · DS.Hall embed) + 아래 학생 폰
  //   이 탭 안의 학생 계정(메모리 저장소) → 기록 · EXP · 💎 · 오답노트가 실제처럼 쌓였다가 탭을 닫으면 사라짐
  function trimLesson(L0) { // 3차시를 줄여서: 도입 · 개념1 · 문제1 · 개념2 · 문제2 · 형성평가 3문항
    if (L0._trial) return; L0._trial = true;
    L0.steps = L0.steps.filter((x) => ['intro', 'c1', 'm1', 'c2', 'm2', 'boss'].includes(x.id));
    L0.boss = Object.assign({}, L0.boss, { items: 3, hpItems: 3, tags: (L0.boss.tags || []).slice(0, 3) });
  }
  async function trialBoot() {
    const L0 = DS.Lessons.get(DS.TRIAL.lesson); trimLesson(L0);
    let pr = {}; try { pr = (await DS.Net.get(`prep/${L0.id}`)) || {}; } catch (e) { pr = {}; } // 학습지 개념 그림은 실제 서버에서 읽기만
    const sp = document.getElementById('splash'); if (!sp) return;
    // 첫 화면 (2026-11-07 사용자 「첫 화면에 용사랑 이름 적는 거 다시」): 그림 아래 이름 칸 + 앞줄 용사 6 중 하나 → ⚔ 모험 시작 → 내 캠프
    const HEROES = [0, 1, 2, 3, 4, 5]; let pick = 0;
    sp.onclick = (e) => { if (!sp.classList.contains('done')) sp.classList.add('done'); e.stopPropagation(); };
    let box = sp.querySelector('.trial-pick');
    if (!box) { box = document.createElement('div'); box.className = 'trial-pick'; sp.appendChild(box); }
    box.innerHTML = `<p class="tp-h">👩‍🏫 선생님 체험판 · ${L0.no}차시 「${esc(L0.title)}」</p><input id="tp-name" maxlength="8" placeholder="이름 (예: 김선생)" autocomplete="off">
      <div class="tp-heroes">${HEROES.map((n) => `<button class="tp-h1${n === pick ? ' on' : ''}" data-h="${n}">${DS.Art.hero(n, 'idle')}<span>${esc((DS.ASSETS.heroesV2.list[n] || {}).name || '')}</span></button>`).join('')}</div>
      <button class="btn primary big" id="tp-go">⚔ 모험 시작</button><p class="tp-n">학생이 되어 한 차시를 직접! · 기록은 남지 않아요</p>`;
    box.onclick = (e) => e.stopPropagation();
    box.querySelectorAll('[data-h]').forEach((b) => (b.onclick = () => { pick = Number(b.dataset.h); box.querySelectorAll('[data-h]').forEach((x) => x.classList.toggle('on', x === b)); DS.Sound.clank(); }));
    box.querySelector('#tp-go').onclick = () => DS.Control.run(async () => {
      const name = (box.querySelector('#tp-name').value || '').trim() || '선생님';
      sp.onclick = null; DS.Sound.clank();
      await start(L0.id, { trial: { name, hero: pick }, prep: pr });
    });
  }
  async function trialEnd() {
    try { await DS.Gem.add(tme, 200, 'trial_gift', '🎁 체험판 선물', { free: true }); } catch (e) { /* 무시 */ }
    tme = Object.assign({}, (await DS.Account.me().catch(() => null)) || tme, { trial: true });
    await DS.Camp.enter(tme);
    DS.UI.toast('🏆 체험 수업 끝! 🎁 💎 200 — 💎 상점에서 용사 · 이펙트를 사 봐요', 4200);
  }
  // 위 TV 창 = 종합상황실 (실제 교실 TV 화면을 1280×720 그대로 그려 줄임)
  function tvHall(on) {
    let box = $('#test-tv'); const hs = document.getElementById('screen-hall');
    if (!on) {
      if (DS.Hall && DS.Hall.leave) DS.Hall.leave();
      if (hs && box && box.contains(hs)) { hs.classList.remove('tv-embed'); document.body.appendChild(hs); }
      if (box) box.remove(); document.body.classList.remove('has-test-tv'); return;
    }
    if (!box) {
      box = document.createElement('div'); box.id = 'test-tv'; box.className = 'test-tv tv-hall'; box.innerHTML = '<div class="tt-in"></div><i class="tt-l">📺 교실 TV (종합상황실)</i>';
      document.body.appendChild(box); document.body.classList.add('has-test-tv');
      const fit = () => { const w = Math.min(window.innerWidth, 900), k = w / 1280; box.style.width = `${w}px`; box.style.height = `${720 * k}px`; box.querySelector('.tt-in').style.transform = `scale(${k})`; document.body.style.setProperty('--tvh', `${720 * k}px`); };
      fit(); window.addEventListener('resize', () => { if (box.isConnected) fit(); });
    }
    if (hs && !box.contains(hs)) { hs.classList.add('tv-embed'); box.querySelector('.tt-in').appendChild(hs); DS.Hall.enter(code, hallKey, { embed: true }).catch((e) => console.error(e)); }
  }
  // ≪ 메뉴화면 · 휴대폰 뒤로 (nav.js): 수업 → 모닥불(수업은 멈춰 기다림 · 차원문으로 이어서) · 성채/허수아비 → 모닥불 · 모닥불 → 첫 화면(처음부터)
  function trialNav(id) {
    if (!trial) { if (id === 'screen-splash' || id === 'screen-home') return true; if (confirm('첫 화면으로 갈까요?')) location.reload(); return true; }
    if (id === 'screen-bonus') { const b = $('#bn-back'); if (b) b.click(); else DS.Camp.enter(tme); return true; }
    if (id === 'screen-student' && where === 'raid') {
      if (!confirm('내 캠프로 나갈까요?\n수업은 그대로 기다려요. 오른쪽 빛나는 문으로 다시 들어오면 이어서 해요.')) return true;
      DS.Student.stop(); DS.Bots.stop(); tvHall(false); where = 'camp'; const f = $('#test-fun'); if (f) f.remove();
      draw(true); DS.Camp.enter(tme); return true;
    }
    if (id === 'screen-camp' || id === 'screen-home') { if (confirm('첫 화면으로 갈까요?\n체험판은 처음부터 다시 시작해요.')) location.reload(); return true; }
    DS.Camp.enter(tme); return true;
  }
  const again = () => { if (confirm('체험판을 처음부터 다시 할까요?')) location.reload(); };
  function finish() {
    if (!real) return;
    ['#test-tv', '#test-fun'].forEach((q) => { const e = $(q); if (e) e.remove(); }); document.body.classList.remove('has-test-tv'); window.DS_TD = { ...(window.DS_TD || {}), speed: 1 }; fast = false;
    DS.Bots.stop(); DS.Student.stop(); bar(false);
    local.wipe(); DS.Net.use(real); real = null; local = null; code = null; R = null;
    DS.UI.show('screen-home');
    document.querySelectorAll('.role').forEach((b) => b.classList.toggle('on', b.dataset.role === 'teacher'));
    document.querySelectorAll('.role-form').forEach((f) => (f.hidden = f.id !== 'f-teacher'));
    DS.UI.toast('테스트를 끝냈어요. (기록은 저장하지 않아요)', 3000);
  }
  const active = () => !!real;
  return { start, finish, active, join, setLook, trialBoot, trialNav, CLS: CLS0, prep: (id) => (L && L.id === id ? prep : null) }; // 🧪 학습지 이미지 · 영상은 실제 서버에서 읽어 둔 것
})();
