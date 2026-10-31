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
      navigator.serviceWorker.register('./sw.js').catch(() => { /* 등록 실패해도 수업은 그대로 */ });
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
      DS.UI.toast('앱으로 설치했어요! 홈 화면의 시타델 매스 아이콘으로 열어요.');
    });
  }
  return { init, standalone };
})();
