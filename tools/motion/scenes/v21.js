// (06차시) 21 명제의 부정 — 「아니다」를 붙이면 참 · 거짓이 뒤바뀐다 (28초)
// 콘티: 0~3 훅 → 3.2~9.4 p : 8은 홀수이다 (거짓) → ~p : 8은 홀수가 아니다 (와! 거짓 도장이 참으로 뒤집힘)
//       → 9.6~14.4 ~(~p) = p (두 번 부정하면 제자리) → 14.6~21.4 부등호의 부정: 큼 · 같음 · 작음 세 칸 (와! 2 > 6 의 부정 = 남은 두 칸 = 2 ≤ 6)
//       → 21.6~23.4 p 참 ↔ ~p 거짓 → 24~28 요약
// 예는 학습지 문제 5 · 형성평가와 겹치지 않게 골랐다
const P = (s) => s.replace(/~/g, '∼').replace(/\bp\b/g, `<tspan font-family="${SERIF}" font-style="italic" font-weight="400">p</tspan>`);
const Q = (s) => s.replace(/~/g, '∼'); // 자막 · 카드용 (서식 없이)
const TP = (x, y, s, o = {}) => T(x, y, P(esc(s)), Object.assign({}, o, { raw: true }));
// 참 · 거짓 도장 (flip 동안 가로로 뒤집힘)
function badge(x, y, t, t0, val, tFlip, val2) {
  const p = pop(t, t0, 0.45); if (p <= 0.002) return '';
  let v = val, sx = 1;
  if (tFlip != null) { const f = seg(t, tFlip, tFlip + 0.5); sx = Math.max(0.03, Math.abs(Math.cos(Math.PI * f))); if (f >= 0.5) v = val2; }
  const col = v === '참' ? COL.OK : COL.NG;
  return `<g transform="translate(${x} ${y}) scale(${(p * sx).toFixed(3)} ${p.toFixed(3)})"><rect x="-80" y="-44" width="160" height="88" rx="18" fill="${col}" fill-opacity="0.16" stroke="${col}" stroke-width="4" filter="url(#g1)"/>${T(0, 18, v, { size: 52, fill: col })}</g>`;
}
window.SCENE = {
  D: 28, punch: [7.4, 12.6, 18.4],
  draw(t) {
    let o = '';
    o += kinetic(960, 470, '「아니다」를 붙이면?', t, 0.2, { size: 108, t1: 2.8 });
    o += T(960, 600, P('명제의 부정 ~p'), { raw: true, size: 50, fill: COL.M, op: vis(t, 1.1, 2.8) });
    // ① p → ~p
    const v1 = vis(t, 3.2, 9.4);
    if (v1 > 0.002) {
      let g = `<g opacity="${v1.toFixed(3)}">`;
      g += TP(330, 370, 'p', { size: 84, fill: COL.A, anchor: 'start', op: vis(t, 3.4, null) }) + T(470, 370, ':  8은 홀수이다.', { size: 72, anchor: 'start', op: vis(t, 3.6, null) }) + badge(1520, 346, t, 4.6, '거짓');
      g += arrow(960, 440, 960, 560, COL.M, seg(t, 5.4, 6.0));
      g += T(1080, 515, '아니다', { size: 40, fill: COL.M, op: vis(t, 5.6, null), anchor: 'start' });
      g += TP(300, 690, '~p', { size: 84, fill: COL.X, anchor: 'start', op: vis(t, 6.0, null) }) + T(470, 690, ':  8은 홀수가 아니다.', { size: 72, anchor: 'start', op: vis(t, 6.2, null) });
      g += badge(1580, 666, t, 6.8, '거짓', 7.1, '참');
      g += sparkle(1580, 666, t, 7.4, { R: 200 }) + ring(1580, 666, t, 7.4, { r: 60, R: 200 });
      o += g + '</g>';
      o += caption(t, 3.6, 5.3, '8은 홀수? 거짓!') + caption(t, 5.5, 7.3, Q('「~이 아니다」를 붙인 것 = 부정 ~p')) + caption(t, 7.4, 9.4, Q('p 가 거짓이면 ~p 는 참!'), { fill: COL.OK });
    }
    // ② ~(~p) = p
    const v2 = vis(t, 9.6, 14.4);
    if (v2 > 0.002) {
      let g = `<g opacity="${v2.toFixed(3)}">`;
      const st = [['p', '8은 홀수이다.', '거짓', 9.8], ['~p', '8은 홀수가 아니다.', '참', 10.6], ['~(~p)', '8은 홀수가 아닌 것이 아니다.', '거짓', 11.4]];
      st.forEach(([l, s, v, t0], i) => {
        const y = 320 + i * 170;
        g += TP(260, y, l, { size: 66, fill: i === 1 ? COL.X : COL.A, anchor: 'start', op: vis(t, t0, null) }) + T(560, y, s, { size: 56, anchor: 'start', op: vis(t, t0 + 0.15, null) }) + badge(1600, y - 20, t, t0 + 0.35, v);
      });
      g += T(960, 830, P('= 8은 홀수이다.  → 처음 p 와 같다!'), { raw: true, size: 58, fill: COL.OK, op: vis(t, 12.6, null), sc: pop(t, 12.6), glow: 'g1' });
      g += sparkle(960, 810, t, 12.6, { R: 300 });
      o += g + '</g>';
      o += caption(t, 10.0, 12.4, '한 번 더 부정하면?') + caption(t, 12.6, 14.4, Q('~(~p) = p  (두 번 뒤집으면 제자리)'), { fill: COL.OK });
    }
    // ③ 부등호의 부정: 세 칸
    const v3 = vis(t, 14.6, 21.4);
    if (v3 > 0.002) {
      let g = `<g opacity="${v3.toFixed(3)}">`;
      g += T(960, 200, '두 수를 비교하면 딱 세 가지뿐', { size: 54, op: vis(t, 14.7, 21.4) });
      const cells = [['2 < 6', '작다'], ['2 = 6', '같다'], ['2 > 6', '크다']];
      cells.forEach(([s, w], i) => {
        const x = 460 + i * 500, y = 480, p = pop(t, 15.0 + i * 0.12, 0.45);
        const isP = i === 2, onP = isP && t >= 16.2 && t < 18.2, onN = !isP && t >= 18.2;
        const col = onP ? COL.A : onN ? COL.X : COL.M;
        g += `<g transform="translate(${x} ${y}) scale(${p})" opacity="${(t >= 18.2 && isP ? 0.35 : 1)}"><rect x="-210" y="-120" width="420" height="240" rx="24" fill="${col}" fill-opacity="${onP || onN ? 0.16 : 0.04}" stroke="${col}" stroke-width="${onP || onN ? 6 : 3}" filter="url(#g1)"/>${T(0, 0, s, { size: 76 })}${T(0, 78, w, { size: 40, fill: COL.M })}</g>`;
      });
      g += TP(1460, 690, 'p : 2 > 6  (거짓)', { size: 52, fill: COL.A, op: vis(t, 16.2, 21.4) });
      // 남은 두 칸을 묶는 괄호
      const br = eo(seg(t, 18.2, 18.7)); if (t >= 18.2) { const x1 = 250, x2 = 1170, yb = 640, L = x2 - x1 + 60; g += `<path d="M${x1} ${yb - 20} V${yb} H${x2} V${yb - 20}" fill="none" stroke="${COL.X}" stroke-width="6" stroke-dasharray="${L}" stroke-dashoffset="${L * (1 - br)}" filter="url(#g2)" opacity="${vis(t, 18.2, 21.4)}"/>`; }
      g += TP(710, 730, '~p : 2 ≤ 6  (참)', { size: 60, fill: COL.X, op: vis(t, 18.4, 21.4), sc: pop(t, 18.4), glow: 'g1' });
      g += sparkle(710, 560, t, 18.4, { R: 420, n: 12 }) + ring(710, 560, t, 18.4, { col: COL.X, r: 150, R: 420 });
      g += T(960, 860, '> 의 부정은 ≤      < 의 부정은 ≥', { size: 58, fill: COL.OK, op: vis(t, 19.6, 21.4), sc: pop(t, 19.6) });
      o += g + '</g>';
      o += caption(t, 16.2, 18.1, '2 > 6 은 「크다」 칸 하나') + caption(t, 18.2, 19.5, '부정 = 나머지 두 칸 (작다 + 같다)', { fill: COL.X }) + caption(t, 19.6, 21.4, '그래서 「같다」가 들어간다!');
    }
    // ④ 참 · 거짓 정리
    const v4 = vis(t, 21.6, 23.4);
    if (v4 > 0.002) {
      o += `<g opacity="${v4.toFixed(3)}">${TP(960, 420, 'p 가 참  →  ~p 는 거짓', { size: 66, sc: pop(t, 21.6) })}${TP(960, 580, 'p 가 거짓  →  ~p 는 참', { size: 66, sc: pop(t, 21.8) })}</g>`;
      o += caption(t, 21.7, 23.4, '부정하면 참 · 거짓이 뒤바뀐다', { fill: COL.OK });
    }
    o += card(t, 24.0, '명제의 부정', [{ s: Q('~p = 「p 가 아니다」') }, { s: Q('p 가 참 ↔ ~p 는 거짓') }, { s: Q('~(~p) = p') }, { s: '> 의 부정은 ≤ ,  < 의 부정은 ≥' }], { lh: 84 });
    o += sparkle(960, 300, t, 24.4, { R: 260 });
    return o;
  },
  over(t) { return wipe(t, 9.4) + wipe(t, 14.4) + wipe(t, 21.4) + wipe(t, 23.6); },
};
