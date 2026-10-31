// 공격 이펙트 6종 (캔버스 애니메이션). 학생이 가입할 때 하나 고르고 고정 → 공격 성공 때 몬스터 위에서 터진다.
// play(상자, 종류, { x, y, scale, perfect }) : 상자(position: relative) 위에 캔버스를 잠깐 띄워 0.9초(만점 1.3초) 동안 그린다.
// still(캔버스, 종류) : 고르기 화면용 정지 그림.
window.DS = window.DS || {};

DS.FX = (function () {
  const KINDS = ['fire', 'lightning', 'ice', 'stars', 'slash', 'vortex'];
  const NAMES = { fire: '🔥 화염 폭발', lightning: '⚡ 천둥 낙뢰', ice: '❄ 얼음 파쇄', stars: '✨ 별빛 폭죽', slash: '⚔ 삼연 참격', vortex: '🌀 차원 소용돌이' };
  const rng = (s) => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  function star(g, x, y, r, n = 5, ins = 0.45) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = (Math.PI * i) / n - Math.PI / 2, rr = i % 2 ? r * ins : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); }
  function glow(g, x, y, r, c0, c1) { if (r <= 0) return; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  // t: 0→1 진행, k: 크기, R: 이번 재생의 난수(같은 재생 안에서는 같은 모양)
  const DRAW = {
    fire(g, x, y, k, t, R) {
      g.globalCompositeOperation = 'lighter';
      glow(g, x, y, 170 * k, 'rgba(255,240,180,.95)', 'rgba(255,80,0,0)');
      for (let i = 0; i < 14; i++) { const a = R() * 7, l = (90 + R() * 90) * k; g.fillStyle = `rgba(255,${(100 + R() * 120) | 0},0,.75)`; g.beginPath(); g.moveTo(x + Math.cos(a + 0.25) * 30 * k, y + Math.sin(a + 0.25) * 30 * k); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.lineTo(x + Math.cos(a - 0.25) * 30 * k, y + Math.sin(a - 0.25) * 30 * k); g.fill(); }
      for (let i = 0; i < 60; i++) { const a = R() * 7, d = (60 + R() * 170) * k * (0.6 + t); g.fillStyle = `rgba(255,${(150 + R() * 100) | 0},60,${0.5 + R() * 0.5})`; g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d - t * 30 * k, (2 + R() * 5) * k, 0, 7); g.fill(); }
      glow(g, x, y, 60 * k, 'rgba(255,255,255,1)', 'rgba(255,200,80,0)');
    },
    lightning(g, x, y, k, t, R, frame) {
      g.globalCompositeOperation = 'lighter';
      glow(g, x, y, 190 * k, 'rgba(220,240,255,.9)', 'rgba(80,120,255,0)');
      const B = rng(7 + Math.floor(frame / 3)); // 3프레임마다 번개 모양이 바뀌어 번쩍인다
      const bolt = (x0, y0, x1, y1, w, seg) => { g.beginPath(); g.moveTo(x0, y0); for (let i = 1; i < seg; i++) { const s = i / seg; g.lineTo(x0 + (x1 - x0) * s + (B() - 0.5) * 60 * k, y0 + (y1 - y0) * s); } g.lineTo(x1, y1); g.strokeStyle = 'rgba(140,190,255,.6)'; g.lineWidth = w * 3; g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = w; g.stroke(); };
      if (t < 0.75) { bolt(x - 40 * k, y - 330 * k, x, y, 7 * k, 10); bolt(x + 30 * k, y - 300 * k, x + 10 * k, y, 4 * k, 8); for (let i = 0; i < 6; i++) { const a = B() * 7; bolt(x, y, x + Math.cos(a) * 130 * k, y + Math.sin(a) * 100 * k, 2.5 * k, 5); } }
      for (let i = 0; i < 40; i++) { const a = R() * 7, d = R() * 150 * k * (0.5 + t); g.fillStyle = 'rgba(200,230,255,.9)'; g.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d, 3 * k, 3 * k); }
      glow(g, x, y, 70 * k, '#fff', 'rgba(150,200,255,0)');
    },
    ice(g, x, y, k, t, R) {
      g.globalCompositeOperation = 'lighter'; glow(g, x, y, 170 * k, 'rgba(200,250,255,.85)', 'rgba(60,160,255,0)'); g.globalCompositeOperation = 'source-over';
      for (let i = 0; i < 16; i++) { const a = (i / 16) * 7 + R() * 0.2, l = (80 + R() * 90) * k, w = (10 + R() * 8) * k, off = 25 * k + t * 40 * k; g.save(); g.translate(x, y); g.rotate(a); const gr = g.createLinearGradient(off, 0, off + l, 0); gr.addColorStop(0, '#e8fbff'); gr.addColorStop(1, '#5ac8ff'); g.fillStyle = gr; g.strokeStyle = '#fff'; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(off, 0); g.lineTo(off + l * 0.4, -w); g.lineTo(off + l, 0); g.lineTo(off + l * 0.4, w); g.closePath(); g.fill(); g.stroke(); g.restore(); }
      g.strokeStyle = 'rgba(220,250,255,.8)'; g.lineWidth = 4 * k; g.beginPath(); g.arc(x, y, 190 * k * (0.7 + t * 0.4), 0, 7); g.stroke();
      g.fillStyle = '#fff'; for (let i = 0; i < 50; i++) { const a = R() * 7, d = R() * 200 * k; star(g, x + Math.cos(a) * d, y + Math.sin(a) * d + t * 20 * k, (2 + R() * 4) * k, 6, 0.4); }
    },
    stars(g, x, y, k, t, R) {
      const C = ['#ff5ad1', '#ffd84a', '#5affc8', '#6ab6ff', '#ff8a3d', '#c38cff'];
      g.globalCompositeOperation = 'lighter'; glow(g, x, y, 150 * k, 'rgba(255,255,230,.8)', 'rgba(255,200,255,0)');
      for (let ring = 0; ring < 3; ring++) for (let i = 0; i < 14; i++) { const a = (i / 14) * 7 + ring * 0.3 + t * 0.6, d = (70 + ring * 60) * k * (0.5 + t * 0.7); g.fillStyle = C[(i + ring) % 6]; star(g, x + Math.cos(a) * d, y + Math.sin(a) * d, (16 - ring * 4) * k); }
      for (let i = 0; i < 70; i++) { const a = R() * 7, d = R() * 230 * k * (0.4 + t); g.fillStyle = C[i % 6]; g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, (1.5 + R() * 3) * k, 0, 7); g.fill(); }
      g.fillStyle = '#fff'; star(g, x, y, 46 * k, 4, 0.25);
    },
    slash(g, x, y, k, t, R) {
      g.globalCompositeOperation = 'lighter'; glow(g, x, y, 150 * k, 'rgba(255,250,220,.7)', 'rgba(255,200,80,0)');
      const sweep = Math.min(1, t * 2.2); // 검기가 휘둘러지며 그려진다
      const arc = (rot, delay) => { const p = Math.max(0, Math.min(1, (sweep - delay) / 0.5)); if (!p) return; g.save(); g.translate(x, y); g.rotate(rot); for (let w = 0; w < 3; w++) { g.strokeStyle = ['rgba(255,190,60,.5)', 'rgba(255,240,170,.8)', '#fff'][w]; g.lineWidth = [34, 16, 6][w] * k; g.lineCap = 'round'; g.beginPath(); g.ellipse(0, 0, 230 * k, 60 * k, 0, Math.PI * 1.1, Math.PI * (1.1 + 0.8 * p)); g.stroke(); } g.restore(); };
      arc(0.7, 0); arc(-0.7, 0.2); arc(Math.PI / 2 + 0.05, 0.4);
      for (let i = 0; i < 30; i++) { const a = R() * 7, d = (120 + R() * 120) * k; g.strokeStyle = 'rgba(255,240,200,.8)'; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d); g.lineTo(x + Math.cos(a) * (d + 40 * k), y + Math.sin(a) * (d + 40 * k)); g.stroke(); }
    },
    vortex(g, x, y, k, t, R) {
      g.globalCompositeOperation = 'lighter'; glow(g, x, y, 200 * k, 'rgba(200,120,255,.7)', 'rgba(80,0,160,0)');
      const spin = t * 5;
      for (let arm = 0; arm < 5; arm++) { g.beginPath(); for (let s = 0; s < 1; s += 0.02) { const a = (arm / 5) * 7 + s * 6 + spin, r = (20 + s * 190) * k; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.75); } g.strokeStyle = `rgba(${180 + arm * 15},90,255,.8)`; g.lineWidth = 7 * k; g.stroke(); }
      g.strokeStyle = 'rgba(255,210,120,.9)'; g.lineWidth = 3 * k; g.beginPath(); g.ellipse(x, y, 200 * k, 150 * k, 0, 0, 7); g.stroke(); g.beginPath(); g.ellipse(x, y, 170 * k, 127 * k, 0, 0, 7); g.stroke();
      for (let i = 0; i < 24; i++) { const a = (i / 24) * 7 - spin * 0.5; g.fillStyle = 'rgba(255,220,140,.9)'; g.fillRect(x + Math.cos(a) * 185 * k - 3 * k, y + Math.sin(a) * 138 * k - 3 * k, 6 * k, 6 * k); }
      for (let i = 0; i < 50; i++) { const a = R() * 7 + spin, d = R() * 200 * k * (1 - t * 0.6); g.fillStyle = 'rgba(230,180,255,.9)'; g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.75, (1.5 + R() * 3) * k, 0, 7); g.fill(); }
      g.globalCompositeOperation = 'source-over'; glow(g, x, y, 50 * k, 'rgba(20,0,40,1)', 'rgba(60,0,120,0)');
    },
  };
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  function frameAt(g, kind, x, y, scale, t, seed, frame) {
    const R = rng(seed), k = scale * (0.35 + 0.85 * ease(Math.min(1, t * 1.4)));
    g.save(); g.globalAlpha = t < 0.65 ? 1 : Math.max(0, 1 - (t - 0.65) / 0.35);
    (DRAW[kind] || DRAW.fire)(g, x, y, k, t, R, frame); g.restore();
  }
  // 상자 위에서 한 번 터뜨린다 (x·y: 상자 안 좌표, 없으면 가운데)
  function play(box, kind, opt = {}) {
    if (!box || !KINDS.includes(kind)) kind = 'fire';
    const r = box.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    const cv = document.createElement('canvas'); cv.className = 'fx-canvas';
    cv.width = Math.max(1, r.width * dpr); cv.height = Math.max(1, r.height * dpr);
    cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:20';
    box.appendChild(cv);
    const g = cv.getContext('2d'); g.scale(dpr, dpr);
    const x = opt.x ?? r.width / 2, y = opt.y ?? r.height / 2;
    const scale = (opt.scale || Math.min(r.width, r.height) / 520) * (opt.perfect ? 1.35 : 1);
    const dur = opt.perfect ? 1300 : 900, seed = (Math.random() * 1e9) | 0, t0 = performance.now();
    let frame = 0;
    (function step(now) {
      const t = Math.min(1, (now - t0) / dur);
      g.clearRect(0, 0, r.width, r.height); frameAt(g, kind, x, y, scale, t, seed, frame++);
      if (t < 1) requestAnimationFrame(step); else cv.remove();
    })(t0);
  }
  function still(cv, kind) {
    const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height);
    frameAt(g, kind, cv.width / 2, cv.height * 0.5, Math.min(cv.width, cv.height) / 480, 0.45, 7, 0);
  }
  return { KINDS, NAMES, play, still };
})();
