// 「≪ 뒤로」: 화면 왼쪽 위 버튼 · 휴대폰 뒤로 가기(버튼·제스처) 를 같은 동작으로 묶는다
// - v0.8.5: 바로 전 화면으로 (수업 화면 → 모닥불, 교사 화면 · 수업 준비 · 학생 관리 → 교사 메뉴 …). 수업 화면이면 한 번 확인. 수업은 계속되고, 다시 들어오면 기록 그대로
// - 첫 화면에서 휴대폰 뒤로 가기 → "한 번 더 누르면 앱이 꺼져요" 경고 뒤, 2.5초 안에 한 번 더 누르면 꺼진다
// 체험판(demo.html)처럼 다른 화면 안(iframe)에 들어 있으면 방문 기록은 건드리지 않고 버튼만 쓴다.
window.DS = window.DS || {};

DS.Nav = (function () {
  const EXIT_MS = 2500;
  const embedded = (() => { try { return window.top !== window.self; } catch (e) { return true; } })();
  let warnAt = null, leaving = false;
  const current = () => { const id = (document.querySelector('.screen.active') || {}).id || 'screen-home'; return id === 'screen-splash' ? 'screen-home' : id; };
  const ASK = {
    'screen-camp': null,
    'screen-student': '수업 화면에서 나갈까요?\n수업은 계속되고, 다시 들어오면 기록은 그대로예요.',
    'screen-teacher': '교사 화면에서 나갈까요?\n수업은 계속돼요. "수업 코드로 이어서" 로 다시 들어올 수 있어요.',
    'screen-hall': '종합상황실을 닫고 첫 화면으로 갈까요?\n수업은 계속돼요.',
  };
  const homeUrl = () => `${location.pathname}${new URLSearchParams(location.search).has('local') ? '?local' : ''}`;

  // 첫 화면으로: 화면을 새로 열어 실시간 연결·타이머를 깨끗이 끊는다 (교사 로그인은 같은 탭이라 유지).
  // 방문 기록이 쌓이지 않게 맨 앞 기록(base) 자리에서 새로 연다.
  const ask = (id) => !ASK[id] || window.confirm(ASK[id]);
  // v0.8.5: ≪ 뒤로 = 바로 전 화면 (화면을 새로 열어 실시간 연결은 깨끗이 끊되, 시작 화면부터가 아니라 한 단계 위로)
  //  수업 화면(학생) · 보강던전 → 모닥불 / 교사 화면 · 수업 준비 · 학생 관리 → 교사 메뉴 / 모닥불 → 학생 첫 화면 / 종합상황실 → 종합상황실 입력
  const UP = { 'screen-student': 'camp', 'screen-bonus': 'camp', 'screen-teacher': 'teacher', 'screen-prep': 'teacher', 'screen-students': 'teacher', 'screen-camp': 'student', 'screen-hall': 'hall' };
  const reopen = () => {
    leaving = true;
    const up = UP[current()];
    DS.Scene.clear();
    if (up === 'camp') DS.Scene.save({ role: 'camp' });
    const q = new URLSearchParams(location.search), out = new URLSearchParams();
    if (q.has('local')) out.set('local', '');
    if (up && up !== 'camp') out.set('role', up);
    const qs = out.toString().replace('local=', 'local');
    location.replace(`${location.pathname}${qs ? `?${qs}` : ''}`);
  };
  // v0.8.1: 교사 화면에서 나갈 때 한 번 더 — [확인] 수업 끝내기 / [취소] 잠깐 나가기 (수업은 계속 · 교사 메뉴에서 이어서)
  const END = '수업도 끝낼까요?\n\n[확인] 수업 끝내기 — 학생은 결과를 보고 모닥불로, 차원문은 꺼져요\n[취소] 잠깐 나가기 — 수업은 계속돼요 (교사 메뉴에서 이어서)';
  const endHook = (id) => (id === 'screen-teacher' && DS.Teacher && DS.Teacher.code && DS.Teacher.code() && window.confirm(END) ? DS.Act.endClass(DS.Teacher.code()).catch(() => {}) : null);
  function leave() { // 화면 왼쪽 위 ≪ 뒤로 (지금 위치 = top)
    const id = current();
    if (id === 'screen-home' || leaving || !ask(id)) return false;
    const go = () => { if (embedded || !(history.state && history.state.cm === 'top')) reopen(); else { leaving = 'back'; history.back(); } }; // → popstate 에서 base 자리에 새로 연다
    const p = endHook(id); if (p) { leaving = true; p.then(() => { leaving = false; go(); }); } else go();
    return true;
  }
  function onBack() { // 휴대폰 뒤로 가기 (지금 위치 = base)
    if (leaving === 'back') { reopen(); return; }
    if (leaving) return;
    const id = current();
    if (id !== 'screen-home') { if (ask(id)) { const p = endHook(id); if (p) { leaving = true; p.then(reopen); } else reopen(); } else history.pushState({ cm: 'top' }, ''); return; }
    // 경고하는 동안은 막지 않으므로 그사이 한 번 더 누르면 앱이 꺼진다. 시간이 지나면 다시 막는다
    DS.UI.toast('한 번 더 누르면 앱이 꺼져요', EXIT_MS);
    clearTimeout(warnAt);
    warnAt = setTimeout(() => history.pushState({ cm: 'top' }, ''), EXIT_MS);
  }
  function init() {
    document.querySelectorAll('.nav-back').forEach((b) => (b.onclick = leave));
    if (embedded) return;
    history.replaceState({ cm: 'base' }, '');
    history.pushState({ cm: 'top' }, '');
    window.addEventListener('popstate', onBack);
  }
  return { init, leave, onBack };
})();

// 지금 보고 있는 장면 (새로고침해도 그 장면으로 돌아가게): 같은 탭의 sessionStorage
DS.Scene = (function () {
  const K = `citadel-scene-${(typeof window !== 'undefined' && window.name) || 'main'}`; // 체험판처럼 한 탭에 여러 화면(iframe)이 있어도 섞이지 않게
  return {
    save(v) { try { sessionStorage.setItem(K, JSON.stringify(v)); } catch (e) { /* 무시 */ } },
    get() { try { return JSON.parse(sessionStorage.getItem(K)); } catch (e) { return null; } },
    clear() { try { sessionStorage.removeItem(K); } catch (e) { /* 무시 */ } },
  };
})();
