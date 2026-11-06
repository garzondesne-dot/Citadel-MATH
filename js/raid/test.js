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

  const CLS = '테스트', ME = () => ({ c: CLS, n: 1, name: '선생님(테스트)', hero: look.hero, fx: look.fx, test: true });
  let prep = {}, look = { hero: 0, fx: 'flame' }, where = 'camp';
  // v0.8.0: 학생이 실제로 겪는 흐름 그대로 — 🧪 테스트 모닥불 → (1초 뒤) 차원문이 나타남 → 탭해서 입장 → 수업 → 모닥불로 돌아옴
  let demo = null; // 🎮 체험판(DS.DEMO): 한 파일 HTML · 인터넷 없음 · 모닥불 없이 바로 던전 → 끝나면 「다시 하기」
  async function start(lessonId, opt = {}) {
    if (real) return;
    L = DS.Lessons.get(lessonId);
    demo = opt.demo ? opt : null;
    // 1) 학습지 이미지 · 영상 링크는 실제 서버에서 읽기만 (체험판은 파일 안에 든 개념 카드)
    if (opt.prep) prep = opt.prep;
    else { try { prep = (await DS.Net.get(`prep/${lessonId}`)) || {}; } catch (e) { prep = {}; } }
    // 2) 이 기기 안의 테스트 저장소로 바꿔 끼움 (실제 수업 · 계정에는 손대지 않음)
    real = DS.Net.impl;
    local = DS.Net.LocalNet('citadel-test-db');
    DS.Net.use(local);
    local.wipe();
    await local.init(); local.setUid('test-teacher');
    look = demo ? { hero: demo.hero ?? 16, fx: demo.fx || 'flame' } : { hero: 0, fx: 'flame' };
    if (demo) { where = 'raid'; bar(true); await openGate(); await join(code); return; }
    where = 'camp'; bar(true);
    await DS.Camp.enter(ME());
    DS.UI.toast(`🧪 테스트 모드 · ${L.title} — 학생 모닥불이에요. 곧 차원문이 열려요`, 3200);
    setTimeout(() => { if (real) DS.Control.run(openGate); }, 1000);
  }
  // 선생님이 「새 수업 만들기」를 누른 것과 같음 → live/테스트 에 차원문이 실시간으로 나타난다
  async function openGate() {
    const r = await DS.Act.createRoom(L.id, CLS, { noLimit: true }); // 🧪 테스트 모드 = 시간 제한 없음
    code = r.code; R = null; armed = '';
    if (demo) return;
    draw(true);
  }
  // 모닥불에서 차원문을 누르면 (camp.js 가 부름)
  async function join(c) {
    code = c; where = 'raid';
    DS.Bots.start(code, demo ? demo.friends || FRIENDS : FRIENDS, { speed: 2, acc: { item: 0.75, boss: 0.8 } });
    draw(true);
    await DS.Student.enter(code, { num: 1, nick: demo ? demo.nick || '나' : '선생님(테스트)', hero: look.hero, fx: look.fx, cls: CLS }, {
      test: { prep, exit: () => backToCamp(), onRender: (l, room) => { R = room; draw(); } },
    });
    DS.UI.toast(demo ? '친구들이 들어오면 아래 「수업 시작 ▶」을 눌러요' : `가상 친구 ${FRIENDS}명이 들어오면 아래 「수업 시작 ▶」`, 3000);
  }
  function backToCamp() {
    let score = '';
    try { if (R && L) { const m = DS.Raid.mastery(L, R, 'test-teacher'); score = ` · 형성평가 ${m.slice(0, L.boss.hpItems).filter(Boolean).length} / ${L.boss.hpItems}`; } } catch (e) { /* 무시 */ }
    if (demo) { DS.Bots.stop(); R = null; return demoEnd(score); }
    DS.Bots.stop(); where = 'camp'; R = null; ['#test-tv', '#test-fun'].forEach((q) => { const e = $(q); if (e) e.remove(); }); document.body.classList.remove('has-test-tv'); draw(true);
    DS.Camp.enter(ME());
    DS.UI.toast(`🏆 테스트 수업 끝!${score} — 모닥불로 돌아왔어요 (기록은 저장하지 않아요)`, 4000);
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
      el.innerHTML = `<b>🧪 테스트</b><span class="tb-step">${esc(L.title)} · 모닥불</span><button class="btn small" id="tb-gate">🌀 차원문 다시 열기</button><button class="btn small" id="tb-x">끝내기</button>`;
      $('#tb-gate').onclick = () => DS.Control.run(openGate);
      $('#tb-x').onclick = () => { if (confirm('테스트를 끝내고 교사 메뉴로 돌아갈까요?')) finish(false); };
      return;
    }
    if (!R) return;
    tv(); funRow();
    if (DS.Raid.restOn(R) && !DS.Raid.isLobby(R)) return restBar(el);
    const i = R.state.step ?? -1, studs = Object.values(R.players || {}).filter((p) => !p.teacher).length;
    const next = DS.Raid.isLobby(R) ? `수업 시작 ▶ (${studs}명)` : DS.Raid.isFinale(L, R) ? '수업 끝 ▶' : '다음 ▶';
    const stp = DS.Raid.stepOf(L, R), media = { id: stp && stp.id, title: stp ? stp.title || '' : '', vid: null, img: null };
    if (stp) { const v = DS.Video.pick(L, (prep || {}).video, stp.id); if (v && DS.Video.ok(v)) media.vid = v; media.img = ((prep || {}).img || {})[stp.id] || null; }
    const sig = `${i}|${studs}|${R.state.closed ? 1 : 0}|${media.vid ? 1 : 0}${media.img ? 1 : 0}`;
    if (el.dataset.sig === sig) return;
    el.dataset.sig = sig;
    el.innerHTML = `<b>${demo ? '🎮 체험판' : '🧪 테스트'}</b><span class="tb-step">${esc(DS.Control.stepName(L, R))}</span>
      ${media.vid ? '<button class="btn small tb-ic" id="tb-vid" title="이 단계 설명 영상">🎬</button>' : ''}${media.img ? `<button class="btn small tb-ic" id="tb-img" title="이 단계 학습지 · 문제 이미지">📄</button>` : ''}
      ${i >= 0 && !demo && DS.Fun ? '<button class="btn small tb-ic" id="tb-rest" title="🏕 쉼터 — 쉬는 시간 놀이(⚖ 🔄 ⭕ 🏰)를 친구 봇들과 해 봐요">🏕</button>' : ''}<button class="btn small" id="tb-back"${i < 0 ? ' disabled' : ''}>◀</button><button class="btn primary" id="tb-next">${next}</button><button class="btn small" id="tb-x">끝내기</button>`;
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
    $('#tb-x').onclick = () => { if (demo) { if (confirm('처음부터 다시 할까요?')) location.reload(); return; } if (confirm('테스트를 끝내고 교사 메뉴로 돌아갈까요?')) finish(false); };
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
    el.innerHTML = `<b>🧪 쉼터</b><span class="tb-step">${f ? '놀이 중 — 친구 봇 4명도 함께해요' : '위 줄에서 놀이를 골라요'}</span>${f ? `<button class="btn small tb-ic" id="tb-tv" title="작은 TV 창 켜기 · 끄기">📺${tvOn ? '' : ' 켜기'}</button>` : ''}<button class="btn primary" id="tb-back-class">▶ 수업으로</button><button class="btn small" id="tb-x">끝내기</button>`;
    $('#tb-back-class').onclick = () => DS.Control.run(() => DS.Act.setRest(code, false));
    const t = $('#tb-tv'); if (t) t.onclick = () => { tvOn = !tvOn; el.dataset.sig = ''; draw(); };
    $('#tb-x').onclick = () => { if (confirm('테스트를 끝내고 교사 메뉴로 돌아갈까요?')) finish(false); };
  }
  function funRow() {
    let row = $('#test-fun');
    const on = R && DS.Fun && DS.Raid.restOn(R) && !DS.Raid.isLobby(R) && !demo;
    if (!on) { if (row) row.remove(); return; }
    if (!row) { row = document.createElement('div'); row.id = 'test-fun'; row.className = 'test-fun'; document.body.appendChild(row); }
    const f = R.fun, extra = !f ? `<select id="tf-map" title="🏰 디펜스 지도"><option value="">🏰 지도: 차례대로</option>${MAPS().map((m) => `<option value="${m.id}"${tdMap === m.id ? ' selected' : ''}>${esc(m.name)}</option>`).join('')}</select>`
      : f.kind === 'td' ? `<button class="btn small" id="tf-fast" title="화면 확인용 빨리 감기">⏩ ${fast ? '3배속' : '보통'}</button>` : '';
    const html = `${DS.Fun.ctlHtml(R)}${extra}`;
    if (row.dataset.html === html) return;
    row.dataset.html = html; row.innerHTML = html;
    DS.Fun.bind(row, code, R, () => ({ noHost: true, map: tdMap || undefined }));
    row.querySelectorAll('[data-oxq]').forEach((b) => (b.onclick = () => DS.Control.run(async () => { await DS.Net.set(`rooms/${code}/state/rest/quiz`, true).catch(() => {}); await DS.Fun.start(code, R, 'quiz', b.dataset.oxq); })));
    const sel = $('#tf-map'); if (sel) sel.onchange = () => { tdMap = sel.value; };
    const fb = $('#tf-fast'); if (fb) fb.onclick = () => { fast = !fast; window.DS_TD = { ...(window.DS_TD || {}), speed: fast ? 3 : 1 }; row.dataset.html = ''; funRow(); };
  }
  function tv() {
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
  return { start, finish, active, join, setLook, CLS, prep: (id) => (L && L.id === id ? prep : null) }; // 🧪 학습지 이미지 · 영상은 실제 서버에서 읽어 둔 것
})();
