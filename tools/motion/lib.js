// 모션그래픽 공통 엔진 — render(t) 가 시간 t(초)의 화면을 SVG 로 그린다 (Playwright 가 프레임마다 호출)
const W = 1920, H = 1080;
const COL = { A: '#3ee6ff', B: '#ffb547', C: '#7f9cff', X: '#ff4fa3', U: '#9b7bff', OK: '#4dffb0', NG: '#ff6b6b', T: '#eef2ff', M: '#9aa6c8' };
const SANS = "'DejaVu Sans','WenQuanYi Zen Hei',sans-serif", SERIF = "'Liberation Serif','DejaVu Serif',serif";
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, p) => a + (b - a) * p;
const eo = (x) => 1 - Math.pow(1 - x, 3);
const ei = (x) => x * x * x;
const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const back = (x) => { const c1 = 1.35, c3 = c1 + 1; return x <= 0 ? 0 : x >= 1 ? 1 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }; // 오버슈트 약 7%
// 등장(스프링) × 퇴장(0.25초 빠르게)
const inn = (t, t0, d = 0.45) => seg(t, t0, t0 + d);
const vis = (t, t0, t1, d = 0.45) => eo(inn(t, t0, d)) * (t1 == null ? 1 : 1 - ei(seg(t, t1, t1 + 0.25)));
const pop = (t, t0, d = 0.5) => back(inn(t, t0, d));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 수식 글자: A B C U x n 은 이탤릭 세리프, ^C 는 위 첨자 C
function M(s) {
  return String(s).split(/(\^C|[ABCUxn](?![a-z]))/).filter((p) => p !== '').map((p) => {
    if (p === '^C') return `<tspan baseline-shift="super" font-size="62%" font-family="${SERIF}" font-style="italic">C</tspan>`;
    if (/^[ABCUxn]$/.test(p)) return `<tspan font-family="${SERIF}" font-style="italic" font-weight="400">${p}</tspan>`;
    return esc(p);
  }).join('');
}
function T(x, y, s, o = {}) {
  const op = o.op == null ? 1 : o.op; if (op <= 0.002) return '';
  const sz = o.size || 48, sc = o.sc == null ? 1 : o.sc;
  const tr = sc !== 1 || o.dy ? ` transform="translate(${x} ${y + (o.dy || 0)}) scale(${sc}) translate(${-x} ${-y})"` : '';
  return `<text x="${x}" y="${y}" font-family="${SANS}" font-size="${sz}" fill="${o.fill || COL.T}" text-anchor="${o.anchor || 'middle'}" font-weight="${o.weight || 700}" opacity="${op.toFixed(3)}"${o.glow ? ` filter="url(#${o.glow})"` : ''}${tr}>${o.raw ? s : M(s)}</text>`;
}
// 글자 폭 재기 (브라우저에서 직접)
const _cw = {};
function cw(ch, size, italic) {
  const k = `${ch}|${italic ? 1 : 0}`;
  if (_cw[k] == null) {
    const m = document.getElementById('measure');
    m.setAttribute('font-family', italic ? SERIF : SANS); m.setAttribute('font-style', italic ? 'italic' : 'normal'); m.setAttribute('font-weight', italic ? 400 : 700);
    m.textContent = ch === ' ' ? ' ' : ch; _cw[k] = m.getComputedTextLength() / 100;
  }
  return _cw[k] * size;
}
// 키네틱 타이포: 글자 단위로 위로 튀어오르며 등장
function kinetic(x, y, s, t, t0, o = {}) {
  const size = o.size || 110, stag = o.stag || 0.045, chars = [...s];
  const ws = chars.map((c) => cw(c, size, /[ABCUxn]/.test(c)));
  const total = ws.reduce((a, b) => a + b, 0);
  let cx = x - (o.anchor === 'start' ? 0 : total / 2), out = '';
  const out1 = o.t1 == null ? 1 : 1 - ei(seg(t, o.t1, o.t1 + 0.3));
  chars.forEach((c, i) => {
    const p = inn(t, t0 + i * stag, 0.5), op = eo(p) * out1;
    if (op > 0.002 && c !== ' ') out += T(cx + ws[i] / 2, y, c, { size, fill: o.fill, op, dy: (1 - back(p)) * 60 - (1 - out1) * 30, glow: o.glow || 'g1' });
    cx += ws[i];
  });
  return out;
}
// 유리 자막 패널 (한 줄, 아래)
function caption(t, t0, t1, s, o = {}) {
  const op = vis(t, t0, t1, 0.35); if (op <= 0.002) return '';
  const size = o.size || 44, w = [...s.replace(/\^C/g, 'C')].reduce((a, c) => a + cw(c, size, /[ABCUxn]/.test(c)), 0) + 90, y = o.y || 985;
  return `<g opacity="${op.toFixed(3)}" transform="translate(0 ${(1 - eo(inn(t, t0, 0.35))) * 18})"><rect x="${960 - w / 2}" y="${y - 50}" width="${w}" height="74" rx="18" fill="#141b36" fill-opacity="0.82" stroke="#ffffff" stroke-opacity="0.16"/>${T(960, y, s, { size, fill: o.fill || COL.T, raw: false })}</g>`;
}
// 원 그리기 (선이 그려지며 등장)
function circ(cx, cy, r, col, p, o = {}) {
  if (p <= 0.002 && !o.fill) return '';
  const L = 2 * Math.PI * r;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${o.fill ? col : 'none'}" fill-opacity="${o.fill || 0}" stroke="${col}" stroke-width="${o.sw || 5}" stroke-dasharray="${L}" stroke-dashoffset="${L * (1 - eo(p))}" transform="rotate(-90 ${cx} ${cy})" filter="url(#${o.glow || 'g1'})" opacity="${o.op == null ? 1 : o.op}"/>`;
}
function rectDraw(x, y, w, h, col, p, o = {}) {
  const L = 2 * (w + h);
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx || 22}" fill="none" stroke="${col}" stroke-width="${o.sw || 5}" stroke-dasharray="${L}" stroke-dashoffset="${L * (1 - eo(p))}" filter="url(#g1)" opacity="${o.op == null ? 1 : o.op}"/>`;
}
// 원소 공 (팝 등장)
function tok(x, y, label, col, t, t0, o = {}) {
  const s = o.sc != null ? o.sc : pop(t, t0, 0.45), op = (o.op == null ? 1 : o.op) * clamp(s * 1.4); if (op <= 0.002) return '';
  const r = o.r || 34;
  return `<g transform="translate(${x} ${y}) scale(${Math.max(0, s)})" opacity="${op.toFixed(3)}"><circle r="${r}" fill="#0d1430" stroke="${col}" stroke-width="3.5" filter="url(#g1)"/>${T(0, r * 0.36, label, { size: r * 1.05, fill: COL.T })}</g>`;
}
// 결과 상자 (글로우 테두리)
function box(cx, cy, s, t, t0, o = {}) {
  const sc = o.sc != null ? o.sc : pop(t, t0, 0.5), op = (o.op == null ? 1 : o.op) * clamp(sc * 1.3); if (op <= 0.002) return '';
  const size = o.size || 54, w = [...s.replace(/\^C/g, 'C')].reduce((a, c) => a + cw(c, size, /[ABCUxn]/.test(c)), 0) + 80, h = size * 1.6, col = o.col || COL.OK;
  return `<g transform="translate(${cx} ${cy}) scale(${sc})" opacity="${op.toFixed(3)}"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="18" fill="${col}" fill-opacity="0.10" stroke="${col}" stroke-width="3.5" filter="url(#${o.glow || 'g1'})"/>${T(0, size * 0.36, s, { size, fill: o.fill || COL.T })}</g>`;
}
// 반짝이 파티클 · 링 웨이브 (핵심 반전에만)
function sparkle(cx, cy, t, t0, o = {}) {
  const p = seg(t, t0, t0 + 0.75); if (p <= 0 || p >= 1) return '';
  const n = o.n || 10, R = o.R || 220, cols = o.cols || [COL.OK, COL.X, COL.A, '#ffffff'];
  let out = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.4, d = R * eo(p) * (0.7 + 0.3 * ((i * 37) % 10) / 10), s = (1 - p) * (o.size || 16) * (0.7 + ((i * 13) % 5) / 10);
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
    out += `<path d="M${x} ${y - s} L${x + s * 0.28} ${y - s * 0.28} L${x + s} ${y} L${x + s * 0.28} ${y + s * 0.28} L${x} ${y + s} L${x - s * 0.28} ${y + s * 0.28} L${x - s} ${y} L${x - s * 0.28} ${y - s * 0.28}Z" fill="${cols[i % cols.length]}" filter="url(#g1)" opacity="${(1 - p).toFixed(3)}"/>`;
  }
  return out;
}
function ring(cx, cy, t, t0, o = {}) {
  let out = '';
  for (let k = 0; k < 2; k++) { const p = seg(t, t0 + k * 0.18, t0 + k * 0.18 + 0.8); if (p <= 0 || p >= 1) continue; out += `<circle cx="${cx}" cy="${cy}" r="${(o.r || 60) + (o.R || 260) * eo(p)}" fill="none" stroke="${o.col || COL.OK}" stroke-width="${6 * (1 - p)}" opacity="${(1 - p).toFixed(3)}" filter="url(#g1)"/>`; }
  return out;
}
// 화살표 (그려지며 등장)
function arrow(x1, y1, x2, y2, col, p, o = {}) {
  if (p <= 0.002) return '';
  const mx = (x1 + x2) / 2 + (o.bend || 0), my = (y1 + y2) / 2 - (o.lift || 0);
  const d = `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`, L = o.len || Math.hypot(x2 - x1, y2 - y1) * 1.15;
  const e = eo(p), ang = Math.atan2(y2 - my, x2 - mx), hs = 16;
  const head = e > 0.95 ? `<path d="M${x2} ${y2} L${x2 - hs * Math.cos(ang - 0.45)} ${y2 - hs * Math.sin(ang - 0.45)} L${x2 - hs * Math.cos(ang + 0.45)} ${y2 - hs * Math.sin(ang + 0.45)}Z" fill="${col}"/>` : '';
  return `<g filter="url(#g1)" opacity="${o.op == null ? 1 : o.op}"><path d="${d}" fill="none" stroke="${col}" stroke-width="${o.sw || 4}" stroke-linecap="round" stroke-dasharray="${L}" stroke-dashoffset="${L * (1 - e)}"/>${head}</g>`;
}
// 요약 카드 (글로우 박스 · 공식 크게)
function card(t, t0, title, lines, o = {}) {
  const p = pop(t, t0, 0.6), op = clamp(p * 1.3); if (op <= 0.002) return '';
  const lh = o.lh || 96, h = 150 + lines.length * lh, w = o.w || 1500, y0 = 540 - h / 2;
  let out = `<g opacity="${op.toFixed(3)}" transform="translate(960 540) scale(${0.92 + 0.08 * p}) translate(-960 -540)">
    <rect x="${960 - w / 2}" y="${y0}" width="${w}" height="${h}" rx="30" fill="#101736" fill-opacity="0.92" stroke="${COL.OK}" stroke-width="4" filter="url(#g2)"/>
    ${T(960, y0 + 82, title, { size: 46, fill: COL.OK })}`;
  lines.forEach((ln, i) => { const q = eo(inn(t, t0 + 0.35 + i * 0.22, 0.45)); out += T(960, y0 + 170 + i * lh, ln.s || ln, { size: ln.size || 62, fill: ln.fill || COL.T, op: q, dy: (1 - q) * 24 }); });
  return out + '</g>';
}
// 장면 전환 와이프 (0.4초)
function wipe(t, t0) {
  const p = seg(t, t0, t0 + 0.4); if (p <= 0 || p >= 1) return '';
  const x = lerp(-W * 0.2, W * 1.2, eio(p));
  return `<rect x="${x - 260}" y="0" width="520" height="${H}" fill="url(#wipeG)"/>`;
}
// 카메라: 천천히 줌인 + 핵심 순간 줌 펀치
function camera(t, D, punches = []) {
  let z = 1 + 0.06 * (t / D);
  punches.forEach((tp) => { if (t >= tp) z += 0.05 * (1 - eo(seg(t, tp, tp + 0.35))) * (t < tp + 0.35 ? 1 : 0); });
  return `translate(960 540) scale(${z.toFixed(4)}) translate(-960 -540)`;
}
const DEFS = `<defs>
  <filter id="g1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b1"/><feGaussianBlur in="SourceGraphic" stdDeviation="12" result="b2"/><feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="g2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b1"/><feGaussianBlur in="SourceGraphic" stdDeviation="26" result="b2"/><feMerge><feMergeNode in="b2"/><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="wipeG" x1="0" x2="1"><stop offset="0" stop-color="#3ee6ff" stop-opacity="0"/><stop offset="0.5" stop-color="#9b7bff" stop-opacity="0.55"/><stop offset="1" stop-color="#ff4fa3" stop-opacity="0"/></linearGradient>
</defs>`;
// 한 프레임
function frame(t) {
  const S = window.SCENE;
  document.getElementById('stage').innerHTML = `${DEFS}${S.defs ? S.defs(t) : ''}<g transform="${camera(t, S.D, S.punch || [])}">${S.draw(t)}</g>${S.over ? S.over(t) : ''}`;
}
window.render = frame;
