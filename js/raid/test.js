// 🧪 테스트 모드 (교사용): 학생 계정 없이 학생 폰 화면으로 수업 한 차시를 처음부터 끝까지 혼자 확인한다.
// - 실제 수업과 완전히 분리: 이 기기 안의 따로 된 저장소(LocalNet 'citadel-test-db')에서만 진행, Firebase 에는 아무것도 쓰지 않는다
// - 학습지 이미지(수업 준비에서 올린 것)만 Firebase 에서 읽어 온다 → 개념 설명 · 「📄 학습지 보기」에 보여 줌
// - v0.8.0: 🧪 테스트 모닥불에서 시작(차원문이 실시간으로 나타남) → 수업 → 모닥불로 돌아옴. 모루 · 보강던전 · 설정도 이 기기 안에서만
// - 가상 친구 용사 4명이 함께 공격(DS.Bots) · 교사 ◀ ▶ 대신 아래 막대의 「◀ · 다음 ▶ · 끝내기」 · 기록은 저장하지 않음
window.DS = window.DS || {};

DS.Test = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  const FRIENDS = 4, TEST_GEM = 9999, TEST_SCROLL = 30;
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
    let photoCfg = null, photoRub = null; // 📷 #47 사진 채점 설정 · 기준표도 실제 서버에서 읽어 테스트 저장소에 (채점은 진짜 중계소)
    if (!trial && !demo) { try { [photoCfg, photoRub] = await Promise.all([DS.Net.get('gcfg/photo'), DS.Net.get('photo_rubric')]); } catch (e) { /* 없음 */ } }
    let ntCopy = null; // 📢 #61 테스트도 학생과 같은 길: 실제 공지 중 가장 최근 것(모든 반 중) → 테스트 반 공지로 (팝업 · 우편함 확인)
    if (!trial && !demo) { try { const all = (await DS.Net.get('notice')) || {}, by = {}; Object.values(all).forEach((c) => Object.entries(c || {}).forEach(([id, x]) => { if (x && x.t) by[id] = x; })); const top = Object.entries(by).sort((a, b) => (Number(b[1].at) || 0) - (Number(a[1].at) || 0))[0]; if (top) ntCopy = { [top[0]]: top[1] }; } catch (e) { /* 없음 */ } }
    // 2) 이 기기 안의 테스트 저장소로 바꿔 끼움 (실제 수업 · 계정에는 손대지 않음)
    real = DS.Net.impl;
    local = DS.Net.LocalNet('citadel-test-db');
    DS.Net.use(local);
    local.wipe();
    await local.init(); local.setUid('test-teacher');
    if (trial && prep && typeof prep === 'object') await local.set(`prep/${lessonId}`, prep).catch(() => {});
    if (ntCopy) await local.set(`notice/${CLS0}`, ntCopy).catch(() => {});
    if (photoCfg) await local.set('gcfg/photo', photoCfg).catch(() => {}); if (photoRub) await local.set('photo_rubric', photoRub).catch(() => {}); if (DS.Photo && DS.Photo.load) DS.Photo.load(true).catch(() => {}); // 👩‍🏫 체험판: 위 TV(종합상황실)도 학습지 그림 · 영상을 읽게 (메모리 저장소라 용량 걱정 없음 · 교사 테스트는 localStorage 라 넣지 않음)
    look = demo ? { hero: demo.hero ?? 16, fx: demo.fx || 'flame' } : { hero: 0, fx: 'flame' };
    if (trial) { // 👩‍🏫 메모리 저장소 안에 진짜 학생 계정 하나 (기록 · 💎 · EXP · 오답노트 · 성채가 실제처럼 · 탭을 닫으면 사라짐)
      look = { hero: trial.hero, fx: DS.FX.affOf(trial.hero).ids[0] };
      await local.signUp('trial@ds.local', '0000');
      await local.set(`roster/${DS.TRIAL.cls}/1`, trial.name);
      await local.set(`accounts/${DS.TRIAL.cls}/1`, { uid: local.uid(), gen: 1, hero: look.hero, fx: look.fx });
      tme = Object.assign({}, (await DS.Account.me()) || { c: DS.TRIAL.cls, n: 1, name: trial.name, hero: look.hero, fx: look.fx }, { trial: true });
      try { await DS.Gem.add(tme, 200, 'trial_gift', '🎁 체험판 선물', { free: true }); } catch (e) { /* 무시 */ } // 👩‍🏫 #80: 시작 💎 200 (3차시를 끝내면 한 번 💎 620 · 📜 9)
      tme = Object.assign({}, (await DS.Account.me().catch(() => null)) || tme, { trial: true });
      where = 'camp'; bar(true);
      await DS.Camp.enter(tme);
      setTimeout(() => { if (real) DS.Control.run(openGate); }, 1000);
      return;
    }
    if (demo) { where = 'raid'; bar(true); await openGate(); await join(code); return; }
    // 💎 넉넉히 (2026-11-09 선생님 「테스트 모드에서 마정석 많이 · 해금 요소는 전부 잠가 두고」): 이 기기 테스트 저장소(시작마다 비움)에 💎 9,999 · 📜 30 → 상점 · 강화 · 홀리 방패까지 시험
    if (DS.Gem) { try { await DS.Gem.add(ME(), TEST_GEM, 'test_gift', '🧪 테스트 선물', { free: true }); await DS.Gem.addScroll(ME(), TEST_SCROLL, 'test_scroll', '🧪 테스트 선물'); } catch (e) { /* 무시 */ } }
    where = 'camp'; bar(true);
    await DS.Camp.enter(ME());
    DS.UI.toast(`🧪 테스트 모드 · ${L.title} — 학생 캠프이에요. 곧 차원문이 열려요`, 3200);
    setTimeout(() => { if (real) DS.Control.run(openGate); }, 1000);
  }
  // 선생님이 「새 수업 만들기」를 누른 것과 같음 → live/테스트 에 차원문이 실시간으로 나타난다
  async function openGate() {
    const r = await DS.Act.createRoom(L.id, cls(), { noLimit: true, ...(demo ? {} : { solve: 5 }) }); // 🧪 테스트 모드 · 👩‍🏫 체험판 = 시간 제한 없음 · #43 정찰 5초 (CLAUDE.md 체험판 규칙 · 실제 수업은 그대로)
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
      <p class="muted small">「모두의 던전」 체험판 · 기록은 저장하지 않아요</p><button class="btn primary" id="demo-again">🔄 처음부터 다시 하기</button></div>`;
    const b = document.getElementById('demo-again'); if (b) b.onclick = () => location.reload();
  }
  const setLook = (hero, fx) => { look = { hero, fx }; };
  // 아래 막대: ◀ · 지금 단계 · 다음 ▶ · 끝내기
  function bar(on) {
    let el = $('#test-bar');
    if (!on) { if (el) el.remove(); document.documentElement.style.removeProperty('--tbh'); return; }
    if (!el) {
      el = document.createElement('div'); el.id = 'test-bar'; el.className = 'test-bar'; document.body.appendChild(el);
      // 2026-11-08 사용자 「체험판 다 풀었는데 제출 버튼이 없어」: 아래 막대 높이를 알려 → 학생 「⚔ 공격!」 줄이 막대 바로 위에 뜸
      const sync = () => document.documentElement.style.setProperty('--tbh', `${el.offsetHeight}px`);
      if (typeof ResizeObserver === 'function') new ResizeObserver(sync).observe(el); setTimeout(sync, 0);
    }
    draw();
  }
  function draw(force) {
    const el = $('#test-bar'); if (!el) return;
    if (force) el.dataset.sig = '';
    if (where === 'camp') {
      if (el.dataset.sig === 'camp') return;
      el.dataset.sig = 'camp';
      el.innerHTML = trial ? `<b>👩‍🏫 체험판</b><span class="tb-step">${DS.Lessons.noText(L.no)}차시 · 내 캠프</span>${trialLessons().filter((x) => x.id !== L.id).map((x) => `<button class="btn small" data-tl="${x.id}" title="${esc(x.title)} — 차원문이 이 차시로 바뀌어요">⚔ ${DS.Lessons.noText(x.no)}차시로</button>`).join('')}<button class="btn small" id="tb-x">🔄 처음부터</button>`
        : `<b>🧪 테스트</b><span class="tb-step">${esc(L.title)} · 내 캠프</span><button class="btn small" id="tb-gate">🌀 차원문 다시 열기</button><button class="btn small" id="tb-x">끝내기</button>`;
      { const g = $('#tb-gate'); if (g) g.onclick = () => DS.Control.run(openGate); }
      el.querySelectorAll('[data-tl]').forEach((b) => (b.onclick = () => DS.Control.run(() => trialLesson(b.dataset.tl))));
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
  // 👩‍🏫 #80 (2026-11-11): 체험판 차시 = 3차시(위) + 7차시(아래) · 7차시 = 6·7차시 파일의 체험판 판(trial7 · 문제 4 · 6 · 👑 7 · 체험판 학습지 숫자)
  const trialLessons = () => (DS.TRIAL.lessons || [DS.TRIAL.lesson]).map((id) => DS.Lessons.get(id)).filter(Boolean);
  const preps = {}; // 차시마다 학습지 칸 그림 (실제 서버에서 읽기만 · 연결 끊기 전에 모두)
  function trialRegister() {
    const S6 = DS.Lessons.get('set-06');
    if (S6 && S6.trial7 && !DS.Lessons.get('trial-07')) DS.Lessons.register(S6.trial7());
    const L3 = DS.Lessons.get('set-03'); if (L3) trimLesson(L3);
  }
  // 캠프에서 「⚔ n차시로」: 같은 메모리 저장소(💎 · 기록 그대로)에서 차원문만 그 차시로 바꿈
  async function trialLesson(id) {
    const L1 = DS.Lessons.get(id); if (!L1 || !local) return;
    L = L1; prep = preps[id] || {};
    await local.set(`prep/${id}`, prep).catch(() => {});
    await openGate(); draw(true);
    DS.UI.toast(`🌀 차원문이 ${DS.Lessons.noText(L.no)}차시 「${L.title}」 로 바뀌었어요 — 오른쪽 빛나는 문으로!`, 3200);
  }
  async function trialBoot() {
    trialRegister();
    const LS = trialLessons();
    for (const x of LS) { try { preps[x.id] = (await DS.Net.get(`prep/${x.id}`)) || {}; } catch (e) { preps[x.id] = {}; } } // 학습지 개념 그림은 실제 서버에서 읽기만
    try { if (DS.Net.impl && DS.Net.impl.offline) DS.Net.impl.offline(); } catch (e) { /* 무시 */ } // 🔌 읽은 뒤 바로 연결 끊기 (체험판은 끝까지 이 기기 메모리에서만)
    const sp = document.getElementById('splash'); if (!sp) return;
    // 🖼 #80 첫 화면 = 대표 그림 key-1 (PC = 그림 전체 · 폰 = 가운데 세로로 자름) · 아래 반투명 판 위에 제목 · 이름 · 용사 · 차시 카드
    const key = (DS.ASSETS.brand || {}).trialKey;
    if (key && !sp.querySelector('.sp-key')) { sp.classList.add('has-key', 'done'); sp.insertAdjacentHTML('afterbegin', `<div class="sp-key" aria-hidden="true"><img src="${DS.ASSETS.base}${key}" alt=""></div>`); }
    // 첫 화면 (2026-11-07 사용자 「첫 화면에 용사랑 이름 적는 거 다시」): 그림 아래 이름 칸 + 앞줄 용사 6 중 하나 → ⚔ 차시 카드(3차시 위 · 7차시 아래) → 내 캠프
    const HEROES = [0, 1, 2, 3, 4, 5]; let pick = 0;
    sp.onclick = (e) => { if (!sp.classList.contains('done')) sp.classList.add('done'); e.stopPropagation(); };
    let box = sp.querySelector('.trial-pick');
    if (!box) { box = document.createElement('div'); box.className = 'trial-pick'; sp.appendChild(box); }
    const SUB = { 'set-03': '개념 2 · 문제 2 · 👑 형성평가 3문항', 'trial-07': '⚔ 소레이드 문제 4 · 6 · 👑 문제 7 · ✍ 서술형' };
    box.innerHTML = `<h1 class="tp-title">모두의 던전 <small>체험판</small></h1><p class="tp-h">👩‍🏫 선생님이 학생이 되어 한 차시를 직접!</p><input id="tp-name" maxlength="8" placeholder="이름 (예: 김선생)" autocomplete="off">
      <div class="tp-heroes">${HEROES.map((n) => `<button class="tp-h1${n === pick ? ' on' : ''}" data-h="${n}">${DS.Art.hero(n, 'idle')}<span>${esc(DS.Lore ? DS.Lore.label(n) : (DS.ASSETS.heroesV2.list[n] || {}).name || '')}</span></button>`).join('')}</div>
      <div class="tp-lessons">${LS.map((x) => `<button class="btn primary tp-go" data-go="${x.id}"><b>⚔ ${DS.Lessons.noText(x.no)}차시 「${esc(x.title.replace(/ \(체험판\)$/, ''))}」</b><small>${esc(SUB[x.id] || '')}</small></button>`).join('')}</div>
      <p class="tp-n">기록은 남지 않아요 · 한 차시를 끝내면 캠프에서 다른 차시도</p><p class="tp-ver">v${String(DS.VERSION || '').replace(/^citadel-/, '')} · ${DS.CREDIT || ''}</p>`; // 2026-11-08 사용자 「체험판 버전 확인이 어려워」: 첫 화면 꼬리표는 고르기 칸에 가려서 칸 안에
    box.onclick = (e) => e.stopPropagation();
    box.querySelectorAll('[data-h]').forEach((b) => (b.onclick = () => { pick = Number(b.dataset.h); box.querySelectorAll('[data-h]').forEach((x) => x.classList.toggle('on', x === b)); DS.Sound.clank(); }));
    box.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => DS.Control.run(async () => {
      const name = (box.querySelector('#tp-name').value || '').trim() || '선생님', id = b.dataset.go;
      sp.onclick = null; DS.Sound.clank();
      await start(id, { trial: { name, hero: pick }, prep: preps[id] || {} });
    })));
  }
  let gift3 = false; // 3차시를 끝내면 한 번
  async function trialEnd() {
    const L1 = L, given = !!(L1 && L1.id === 'set-03' && !gift3);
    if (given) {
      gift3 = true;
      try { await DS.Gem.add(tme, 620, 'trial_gift3', '🎁 체험판 3차시 선물', { free: true }); await DS.Gem.addScroll(tme, 9, 'trial_scroll3', '🎁 체험판 3차시 선물'); } catch (e) { /* 무시 */ }
    }
    tme = Object.assign({}, (await DS.Account.me().catch(() => null)) || tme, { trial: true });
    await DS.Camp.enter(tme);
    DS.UI.toast(given ? '🏆 체험 수업 끝! 🎁 💎 620 · 📜 9 — 💎 상점에서 10강 🛡 홀리 방패 · 내 속성 Ⅳ 🌟 진필살기까지 해 봐요 · 아래 「⚔ 7차시로」도!' : '🏆 체험 수업 끝! — 내 캠프로 돌아왔어요', 5200);
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
      // ⛶ 2026-11-08 요청 #9: TV 를 누르면 가로 전체 화면 · 어디든 누르면 원래대로 (투명 누름 막 = 보기 전용 · 조작은 아래 막대)
      //   안드로이드 크롬 = requestFullscreen + 가로 고정 · 아이폰(요소 전체 화면 없음) = 화면 가득 + 세로면 90° 돌림 · PC = 전체 화면만 · 16:9 유지(남는 곳 검정)
      box = document.createElement('div'); box.id = 'test-tv'; box.className = 'test-tv tv-hall'; box.innerHTML = '<div class="tt-in"></div><button type="button" class="tt-tap" aria-label="교실 TV 크게 보기"></button><i class="tt-l">📺 교실 TV (종합상황실) · ⛶ 누르면 크게</i><i class="tt-hint">아무 데나 누르면 돌아가요</i>';
      document.body.appendChild(box); document.body.classList.add('has-test-tv');
      let big = false, fsUsed = false;
      const fit = () => {
        const inn = box.querySelector('.tt-in');
        if (big) {
          const vw = window.innerWidth, vh = window.innerHeight, rot = vh > vw; // 세로 화면이면 돌림 (가로 고정이 된 안드로이드 · PC 는 돌리지 않음)
          const W = rot ? vh : vw, H = rot ? vw : vh, k = Math.min(W / 1280, H / 720);
          box.classList.toggle('rot', rot);
          box.style.width = `${vw}px`; box.style.height = `${vh}px`;
          inn.style.transform = rot ? `translate(${((vw + 720 * k) / 2).toFixed(1)}px, ${((vh - 1280 * k) / 2).toFixed(1)}px) rotate(90deg) scale(${k})` : `translate(${((vw - 1280 * k) / 2).toFixed(1)}px, ${((vh - 720 * k) / 2).toFixed(1)}px) scale(${k})`;
          return;
        }
        const w = Math.min(window.innerWidth, 900), k = w / 1280; box.style.width = `${w}px`; box.style.height = `${720 * k}px`; inn.style.transform = `scale(${k})`; document.body.style.setProperty('--tvh', `${720 * k}px`);
      };
      const setBig = async (on) => {
        if (on === big) return; big = on; box.classList.toggle('tv-big', on); if (!on) box.classList.remove('rot');
        if (on) {
          box.classList.remove('hint'); void box.offsetWidth; box.classList.add('hint'); setTimeout(() => box.classList.remove('hint'), 2000);
          const req = box.requestFullscreen || box.webkitRequestFullscreen;
          if (req) { try { await req.call(box); fsUsed = true; } catch (e) { fsUsed = false; } }
          try { if (fsUsed && screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape'); } catch (e) { /* 안 되면 돌림으로 */ }
        } else {
          try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) { /* 무시 */ }
          if (document.fullscreenElement || document.webkitFullscreenElement) { try { await (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) { /* 무시 */ } }
          fsUsed = false;
        }
        fit(); setTimeout(fit, 250); // 전체 화면 · 회전이 끝난 뒤 한 번 더
      };
      box.querySelector('.tt-tap').addEventListener('click', () => setBig(!big));
      document.addEventListener('fullscreenchange', () => { if (big && fsUsed && !document.fullscreenElement) { fsUsed = false; setBig(false); } }); // 뒤로 가기 · 제스처로 나가도 맞춤
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
  const testing = () => !!real && !trial && !demo, realToken = () => (real && real.idToken ? real.idToken() : Promise.resolve(null)); // 📷 #47 테스트 사진 = 교사 로그인 토큰으로 진짜 중계소
  return { testing, realToken, start, finish, active, join, setLook, trialBoot, trialNav, CLS: CLS0, prep: (id) => (L && L.id === id ? prep : null) }; // 🧪 학습지 이미지 · 영상은 실제 서버에서 읽어 둔 것
})();
