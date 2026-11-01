// 🧪 테스트 모드 (교사용): 학생 계정 없이 학생 폰 화면으로 수업 한 차시를 처음부터 끝까지 혼자 확인한다.
// - 실제 수업과 완전히 분리: 이 기기 안의 따로 된 저장소(LocalNet 'citadel-test-db')에서만 진행, Firebase 에는 아무것도 쓰지 않는다
// - 학습지 이미지(수업 준비에서 올린 것)만 Firebase 에서 읽어 온다 → 개념 설명 · 「📄 학습지 보기」에 보여 줌
// - 가상 친구 용사 4명이 함께 공격(DS.Bots) · 교사 ◀ ▶ 대신 아래 막대의 「◀ · 다음 ▶ · 끝내기」 · 기록은 저장하지 않음
window.DS = window.DS || {};

DS.Test = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  const FRIENDS = 4;
  let real = null, local = null, code = null, L = null, R = null, armed = '';

  async function start(lessonId) {
    if (real) return;
    L = DS.Lessons.get(lessonId);
    // 1) 학습지 이미지는 실제 서버에서 읽기만
    let prep = {};
    try { prep = (await DS.Net.get(`prep/${lessonId}`)) || {}; } catch (e) { prep = {}; }
    // 2) 이 기기 안의 테스트 저장소로 바꿔 끼움 (실제 수업 · 계정에는 손대지 않음)
    real = DS.Net.impl;
    local = DS.Net.LocalNet('citadel-test-db');
    DS.Net.use(local);
    local.wipe();
    await local.init(); local.setUid('test-teacher');
    const r = await DS.Act.createRoom(lessonId, null);
    code = r.code;
    DS.Bots.start(code, FRIENDS, { speed: 2, acc: { item: 0.75, boss: 0.8 } });
    bar(true);
    await DS.Student.enter(code, { num: 1, nick: '선생님(테스트)', hero: 0, fx: 'flame' }, {
      test: { prep, exit: () => finish(true), onRender: (l, room) => { R = room; draw(); } },
    });
    DS.UI.toast(`🧪 테스트 모드 · ${L.title} — 가상 친구 ${FRIENDS}명이 들어오면 「수업 시작 ▶」`, 3600);
  }
  // 아래 막대: ◀ · 지금 단계 · 다음 ▶ · 끝내기
  function bar(on) {
    let el = $('#test-bar');
    if (!on) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement('div'); el.id = 'test-bar'; el.className = 'test-bar'; document.body.appendChild(el); }
    draw();
  }
  function draw() {
    const el = $('#test-bar'); if (!el || !R) return;
    const i = R.state.step ?? -1, studs = Object.values(R.players || {}).filter((p) => !p.teacher).length;
    const next = DS.Raid.isLobby(R) ? `수업 시작 ▶ (${studs}명)` : DS.Raid.isFinale(L, R) ? '수업 끝 ▶' : '다음 ▶';
    const sig = `${i}|${studs}|${R.state.closed ? 1 : 0}`;
    if (el.dataset.sig === sig) return;
    el.dataset.sig = sig;
    el.innerHTML = `<b>🧪 테스트</b><span class="tb-step">${esc(DS.Control.stepName(L, R))}</span>
      <button class="btn small" id="tb-back"${i < 0 ? ' disabled' : ''}>◀</button><button class="btn primary" id="tb-next">${next}</button><button class="btn small" id="tb-x">끝내기</button>`;
    $('#tb-back').onclick = () => DS.Control.run(() => DS.Act.go(code, R, L, -1));
    $('#tb-next').onclick = () => DS.Control.run(async () => {
      if (DS.Raid.isLobby(R) && studs < 2) { DS.UI.toast('가상 친구가 들어오는 중이에요…'); return; }
      if (DS.Raid.isFinale(L, R) && armed !== 'end') { armed = 'end'; DS.UI.toast('한 번 더 누르면 테스트 수업을 끝내요'); return; }
      armed = ''; await DS.Act.go(code, R, L, 1);
    });
    $('#tb-x').onclick = () => { if (confirm('테스트를 끝내고 교사 메뉴로 돌아갈까요?')) finish(false); };
  }
  function finish(cleared) {
    if (!real) return;
    let score = '';
    try { if (R && L) { const m = DS.Raid.mastery(L, R, 'test-teacher'); score = ` · 형성평가 ${m.slice(0, L.boss.hpItems).filter(Boolean).length} / ${L.boss.hpItems}`; } } catch (e) { /* 무시 */ }
    DS.Bots.stop(); DS.Student.stop(); bar(false);
    local.wipe(); DS.Net.use(real); real = null; local = null; code = null; R = null;
    DS.UI.show('screen-home');
    document.querySelectorAll('.role').forEach((b) => b.classList.toggle('on', b.dataset.role === 'teacher'));
    document.querySelectorAll('.role-form').forEach((f) => (f.hidden = f.id !== 'f-teacher'));
    DS.UI.toast(cleared ? `🏆 테스트 수업 끝!${score} (기록은 저장하지 않아요)` : '테스트를 끝냈어요.', 4000);
  }
  const active = () => !!real;
  return { start, finish, active };
})();
