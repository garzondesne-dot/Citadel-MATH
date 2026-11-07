// ✏ 종합상황실 필기 (2026-11-07 최종 정돈판 ⑤): 개념 단계(학습지 개념 칸 + 이어지는 문제) · 📄 문제 화면 위에 손가락 · 펜 · 마우스로 쓰기
//   펜 빨강 · 파랑 · 검정 · 형광펜 · 지우개 · ↶ 되돌리기 · 🗑 전체 지우기 · ✕ 끝내기 · 다음 단계로 넘기면 저절로 지움 · 저장 · 전송 없음(이 TV 화면에만)
window.DS = window.DS || {};
DS.Ink = (() => {
  const PENS = [{ k: 'red', c: '#e5383b', w: 4 }, { k: 'blue', c: '#1f6feb', w: 4 }, { k: 'black', c: '#111', w: 4 }, { k: 'hi', c: 'rgba(255,221,0,.38)', w: 22 }, { k: 'er', c: null, w: 30 }];
  let box = null, cv = null, g = null, pen = PENS[0], strokes = [], cur = null, key = '';
  const on = () => !!box;
  function size() { if (!cv) return; const r = box.getBoundingClientRect(), d = window.devicePixelRatio || 1; cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); g.setTransform(d, 0, 0, d, 0, 0); redraw(); }
  function line(s) {
    if (s.pts.length < 1) return;
    g.save(); g.globalCompositeOperation = s.c ? 'source-over' : 'destination-out'; g.strokeStyle = s.c || '#000'; g.lineWidth = s.w; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(s.pts[0][0], s.pts[0][1]); s.pts.forEach(([x, y]) => g.lineTo(x, y)); if (s.pts.length === 1) g.lineTo(s.pts[0][0] + 0.1, s.pts[0][1]); g.stroke(); g.restore();
  }
  function redraw() { if (!g) return; g.clearRect(0, 0, cv.width, cv.height); strokes.forEach(line); }
  const at = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  function open(host, k) {
    close(); if (!host) return;
    key = k || ''; strokes = [];
    box = document.createElement('div'); box.className = 'ink-box';
    box.innerHTML = `<canvas class="ink-cv zoom-ok"></canvas><div class="ink-tool">${PENS.map((p) => `<button class="ink-b ink-${p.k}${p === pen ? ' on' : ''}" data-pen="${p.k}" title="${{ red: '빨강', blue: '파랑', black: '검정', hi: '형광펜', er: '지우개' }[p.k]}">${p.k === 'hi' ? '🖍' : p.k === 'er' ? '🧽' : ''}</button>`).join('')}<hr><button class="ink-b" data-undo title="되돌리기">↶</button><button class="ink-b" data-clear title="전체 지우기">🗑</button><button class="ink-b" data-close title="필기 끝내기">✕</button></div><span class="ink-pill">✏ 필기 중</span>`;
    host.style.position = host.style.position || 'relative'; host.appendChild(box);
    cv = box.querySelector('canvas'); g = cv.getContext('2d'); size();
    cv.onpointerdown = (e) => { e.preventDefault(); cv.setPointerCapture(e.pointerId); cur = { c: pen.c, w: pen.w, pts: [at(e)] }; strokes.push(cur); line(cur); };
    cv.onpointermove = (e) => { if (!cur) return; cur.pts.push(at(e)); redraw(); };
    cv.onpointerup = cv.onpointercancel = () => { cur = null; };
    box.querySelectorAll('[data-pen]').forEach((b) => (b.onclick = () => { pen = PENS.find((p) => p.k === b.dataset.pen); box.querySelectorAll('[data-pen]').forEach((x) => x.classList.toggle('on', x === b)); }));
    box.querySelector('[data-undo]').onclick = () => { strokes.pop(); redraw(); };
    box.querySelector('[data-clear]').onclick = () => { strokes = []; redraw(); };
    box.querySelector('[data-close]').onclick = () => { close(); const b = document.getElementById('h-ink'); if (b) b.classList.remove('on'); };
    window.addEventListener('resize', size);
  }
  function close() { if (box) box.remove(); box = null; cv = null; g = null; strokes = []; window.removeEventListener('resize', size); }
  const toggle = (host, k) => (on() ? close() : open(host, k));
  // 단계가 바뀌면 (또는 개념 ↔ 문제 화면) 필기를 지우고 닫음 · 화면이 다시 그려져 상자가 빠졌으면 닫음
  function sync(k) { if (!on()) return; if (k !== key || !document.body.contains(box)) close(); }
  return { on, open, close, toggle, sync };
})();
