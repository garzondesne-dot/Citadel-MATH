// 🎬 설명 영상: 유튜브 · 구글 드라이브 주소 → 앱 안에서 재생하는 주소 (영상 파일은 저장하지 않고 링크만 저장한다)
// kind(url) → '유튜브' | '구글 드라이브' | '' · embed(url) → iframe 주소 | '' · open(url, title) → 앱 안 창에서 재생
window.DS = window.DS || {};

DS.Video = (function () {
  function parse(url) {
    const u = String(url || '').trim();
    let m = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/.exec(u);
    if (m) return { kind: '유튜브', src: `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0&playsinline=1&modestbranding=1` };
    m = /drive\.google\.com\/(?:file\/d\/|open\?(?:.*&)?id=|uc\?(?:.*&)?id=)([\w-]{10,})/.exec(u);
    if (m) return { kind: '구글 드라이브', src: `https://drive.google.com/file/d/${m[1]}/preview` };
    return null;
  }
  const kind = (url) => (parse(url) || {}).kind || '';
  const embed = (url) => (parse(url) || {}).src || '';
  function open(url, title) {
    const src = embed(url); if (!src || typeof document === 'undefined') return false;
    const el = document.createElement('div'); el.className = 'modal video-modal';
    el.innerHTML = `<div class="quiz-box framed video-box"><div class="quiz-head"><b>🎬 ${DS.UI.esc(title || '설명 영상')}</b><button class="btn small" data-x>✕ 닫기</button></div>
      <div class="video-frame"><iframe src="${src}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
      <p class="muted small">🎧 교실에서는 이어폰을 끼거나 자막으로 봐요.</p></div>`;
    el.querySelector('[data-x]').onclick = () => el.remove();
    document.body.appendChild(el);
    return true;
  }
  return { kind, embed, open };
})();
