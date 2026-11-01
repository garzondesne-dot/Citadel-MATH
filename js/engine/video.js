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
  const kind = (url) => (url === 'file' ? '🎞 올린 영상 파일' : (parse(url) || {}).kind || '');
  const embed = (url) => (parse(url) || {}).src || '';
  // v0.8.7: 영상 파일 직접 올리기 — prep/{차시}/video/{칸} = 'file', 실제 파일은 prepVideo/{차시}/{칸} (재생할 때만 받아 옴)
  const MAX = 3 * 1024 * 1024; // 3MB 까지
  const ok = (v) => v === 'file' || !!embed(v);
  const blobs = {};
  async function fileUrl(lesson, slot) {
    const k = `${lesson}/${slot}`;
    if (blobs[k]) return blobs[k];
    const d = await DS.Net.get(`prepVideo/${lesson}/${slot}`);
    if (!d) throw Object.assign(new Error('올린 영상을 찾지 못했어요.'), { user: true });
    const bin = atob(d.slice(d.indexOf(',') + 1)), u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    blobs[k] = URL.createObjectURL(new Blob([u8], { type: d.slice(5, d.indexOf(';')) || 'video/mp4' }));
    return blobs[k];
  }
  // 재생 칸 HTML (iframe 또는 video). 파일이면 그린 뒤 attach(el, …) 로 주소를 넣는다
  const frameHtml = (url, autoplay) => (url === 'file' ? `<video class="vf" controls playsinline${autoplay ? ' autoplay' : ''}></video>`
    : `<iframe src="${embed(url)}${autoplay && /youtube/.test(embed(url)) ? '&autoplay=1' : ''}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`);
  async function attach(root, url, ref) { if (url !== 'file' || !ref) return; const v = root.querySelector('video.vf'); if (!v) return; v.src = await fileUrl(ref.lesson, ref.slot); v.play().catch(() => {}); }
  function open(url, title, ref) {
    if (!ok(url) || typeof document === 'undefined') return false;
    const el = document.createElement('div'); el.className = 'modal video-modal';
    el.innerHTML = `<div class="quiz-box framed video-box"><div class="quiz-head"><b>🎬 ${DS.UI.esc(title || '설명 영상')}</b><button class="btn small" data-x>✕ 닫기</button></div>
      <div class="video-frame">${frameHtml(url, true)}</div>
      <p class="muted small">🎧 교실에서는 이어폰을 끼거나 자막으로 봐요.</p></div>`;
    el.querySelector('[data-x]').onclick = () => el.remove();
    document.body.appendChild(el);
    attach(el, url, ref).catch((e) => DS.UI.toast(e.message || '영상을 불러오지 못했어요.'));
    return true;
  }
  return { kind, embed, ok, open, frameHtml, attach, fileUrl, MAX };
})();
