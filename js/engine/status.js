// 💫 상태이상 오버레이 (2026-11-08 · 선생님 「A로 진행」): DS.Status.on(용사 상자, 'stun', 초) — 0 초 = 지울 때까지
//   그림 = 배치표 status (tools/pfx/status_bake.py 가 구움 · 칸 80×80 = 용사 칸 80×64 + 머리 위 16px · 6프레임 × 8종)
//   용사 그림(.art.hv2 > b)과 같은 left · width 로 붙이고 아래를 맞추므로, 학생 폰 · 종합상황실 · PC 어느 크기든 용사에 딱 맞음
//   몸 색(화상 붉게 · 독 초록 · 감전 깜빡)은 CSS 필터 (용사 24명 모두 자동)
window.DS = window.DS || {};
DS.Status = (() => {
  const S = () => (DS.ASSETS && DS.ASSETS.status) || null;
  function art(el) { return !el ? null : el.matches && el.matches('.art.hv2') ? el : el.querySelector && el.querySelector('.art.hv2'); }
  function off(el, kind) {
    const a = art(el); if (!a) return;
    a.querySelectorAll(kind ? `:scope > s.st-ov[data-k="${kind}"]` : ':scope > s.st-ov').forEach((s) => s.remove());
    if (!a.querySelector(':scope > s.st-ov')) a.removeAttribute('data-st');
  }
  function on(el, kind, sec = 3) {
    const s = S(), a = art(el); if (!s || !a) return null;
    const row = s.kinds.indexOf(kind); if (row < 0) return null;
    off(a, kind);
    const b = a.querySelector(':scope > b'), o = document.createElement('s');
    o.className = 'st-ov'; o.dataset.k = kind;
    o.style.cssText = `left:${b ? b.style.left : '-12%'};width:${b ? b.style.width : '124%'};background-image:url('${DS.ASSETS.base}${s.src}');background-size:${s.cols * 100}% ${s.rows * 100}%;--sty:${(100 * row) / (s.rows - 1)}%;animation-duration:${s.dur || 0.6}s`;
    a.appendChild(o); a.dataset.st = kind;
    if (sec > 0) setTimeout(() => { if (o.isConnected) { o.remove(); if (!a.querySelector(':scope > s.st-ov')) a.removeAttribute('data-st'); } }, sec * 1000);
    return o;
  }
  return { on, off, kinds: () => (S() ? S().kinds.slice() : []) };
})();
