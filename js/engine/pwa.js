// 앱 설치(PWA): 서비스 워커 등록 + 첫 화면의 [📲 앱으로 설치] 버튼
//  - https(또는 localhost)로 열렸을 때만 등록 (파일로 열면 아무것도 하지 않음)
//  - 안드로이드 크롬: 설치를 허락하면(beforeinstallprompt) 버튼이 나타난다
//  - 아이폰 사파리: 설치 창이 없으므로 "공유 → 홈 화면에 추가" 안내를 보여 준다
//  - 이미 앱으로 실행 중이면 숨김
window.DS = window.DS || {};

DS.PWA = (function () {
  const $ = (s) => document.querySelector(s);
  let deferred = null;
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ios = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function init() {
    const btn = $('#btn-install'), tip = $('#install-tip');
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
      // 🔄 2026-11-08 사용자 「🧪 테스트 · 체험판은 실시간 업데이트」: 열어 둔 채로도 5분마다 · 화면으로 돌아올 때 새 판을 확인
      navigator.serviceWorker.register('./sw.js').then((r) => {
        const up = () => r.update().catch(() => {}); up();
        setInterval(up, 5 * 60e3); document.addEventListener('visibilitychange', () => { if (!document.hidden) up(); });
      }).catch(() => { /* 등록 실패해도 수업은 그대로 */ });
      // v0.9.8.0: 앱 파일을 캐시에서 바로 쓰므로 새 판이 깔리면 → 첫 화면이면 바로 새로고침 · 수업 중이면 안내만 (다음에 열 때 적용)
      //   👩‍🏫 체험판 · 🧪 테스트 모드: 기록이 남지 않는 연습이라 → 첫 화면이면 바로 새 판 · 진행 중이면 「새 판으로 처음부터」 단추 (누르면 바로)
      let had = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!had) { had = true; return; }
        const trial = document.documentElement.classList.contains('trial'), test = !!(DS.Test && DS.Test.active && DS.Test.active());
        const home = document.querySelector('#screen-home.active, #screen-login.active' + (trial ? ', #screen-splash.active' : ''));
        if (home) { location.reload(); return; }
        if (trial || test) {
          if (document.getElementById('upd-bar')) return;
          const b = document.createElement('button'); b.id = 'upd-bar'; b.type = 'button'; b.className = 'upd-bar';
          b.textContent = '🔄 새 판 나옴 · 눌러서 처음부터'; b.onclick = () => location.reload();
          document.body.appendChild(b); return;
        }
        // 🔄 #24 (2026-11-09 1-4반 「다시 들어와야 돼」): 수업 중에도 눌러서 바로 새 판 (보던 장면 · 기록은 그대로 이어짐)
        if (document.getElementById('upd-bar')) return;
        const b = document.createElement('button'); b.id = 'upd-bar'; b.type = 'button'; b.className = 'upd-bar';
        b.textContent = '🔄 새 판이 나왔어요 · 눌러서 새로 고침 (기록은 그대로)'; b.onclick = () => location.reload();
        document.body.appendChild(b);
      });
    }
    if (!btn || standalone()) return;
    if (ios()) { tip.hidden = false; return; }
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferred = e;
      btn.hidden = false;
    });
    btn.addEventListener('click', async () => {
      if (!deferred) return;
      deferred.prompt();
      await deferred.userChoice.catch(() => null);
      deferred = null;
      btn.hidden = true;
    });
    window.addEventListener('appinstalled', () => {
      btn.hidden = true;
      DS.UI.toast('앱으로 설치했어요! 홈 화면의 모두의 던전 아이콘으로 열어요.');
    });
  }
  return { init, standalone };
})();
