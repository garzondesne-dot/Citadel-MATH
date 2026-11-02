// (03차시) 15 부분집합 — 포함과 포함되지 않음 (24초)
// 콘티: 0~2.8 훅「다 들어 있을까?」 → 3~11.5 {1, 2} 의 원소가 {1, 2, 3} 안의 같은 원소에 쏙 (와! A ⊂ B) → 11.8~20 {2, 5}: 5 가 튕겨 나감 (⊄) → 20.4~24 요약
// 학습지 3차시 문제 1 (1) {1, 2} ⊂ {1, 2, 3}, (2) {2, 5} ⊄ {1, 2, 3, 4}
const BC = [1000, 560], BR = 260;
function fly(t, t0, from, to, d = 0.8) { const p = eio(seg(t, t0, t0 + d)); return [lerp(from[0], to[0], p), lerp(from[1], to[1], p) - Math.sin(Math.PI * p) * 120]; }
window.SCENE = {
  D: 24, punch: [8.0, 16.4],
  draw(t) {
    let o = '';
    o += kinetic(960, 480, '다 들어 있을까?', t, 0.2, { size: 124, t1: 2.6 });
    o += T(960, 610, '부분집합 · ⊂ 와 ⊄', { size: 46, fill: COL.M, op: vis(t, 1.0, 2.6) });
    // ① A = {1, 2}, B = {1, 2, 3}
    const v1 = vis(t, 3.0, 11.5);
    if (v1 > 0.002) {
      let g = `<g opacity="${v1.toFixed(3)}">`;
      g += T(150, 175, 'A = {1, 2}', { size: 50, fill: COL.A, anchor: 'start', op: vis(t, 3.2, null) }) + T(1770, 175, 'B = {1, 2, 3}', { size: 50, fill: COL.B, anchor: 'end', op: vis(t, 3.4, null) });
      g += circ(BC[0], BC[1], BR, COL.B, inn(t, 3.4, 0.9), { fill: 0.12 * eo(seg(t, 3.6, 4.2)) }) + T(BC[0] + 200, BC[1] - 230, 'B', { size: 64, fill: COL.B, op: vis(t, 3.8, null), glow: 'g1' });
      const P = { 1: [900, 500], 2: [920, 640], 3: [1150, 560] };
      [1, 2, 3].forEach((n, i) => { g += tok(P[n][0], P[n][1], String(n), COL.B, t, 4.0 + i * 0.1, { r: 36 }); });
      // A 의 원소가 날아와 같은 원소 위에 쏙 → ✔
      [[1, [330, 470]], [2, [330, 650]]].forEach(([n, st], i) => {
        const t0 = 5.0 + i * 0.6, [x, y] = fly(t, t0, st, P[n]);
        const land = t >= t0 + 0.8;
        g += tok(x, y, String(n), COL.A, t, 4.4 + i * 0.1, { r: 36, op: land ? 1 - seg(t, t0 + 0.8, t0 + 1.1) * 0.0 : 1 });
        if (land) g += T(P[n][0] + 52, P[n][1] - 30, '✔', { size: 44, fill: COL.OK, op: vis(t, t0 + 0.8, null), sc: pop(t, t0 + 0.8), glow: 'g1' });
      });
      g += circ(910, 570, 125, COL.A, inn(t, 6.8, 0.8), { fill: 0.18 * eo(seg(t, 7.2, 7.6)), glow: t >= 8 && t < 9 ? 'g2' : 'g1' }) + T(780, 450, 'A', { size: 60, fill: COL.A, op: vis(t, 7.0, null), glow: 'g1' });
      g += box(960, 880, 'A ⊂ B', t, 8.0, { size: 70, col: COL.OK, glow: 'g2' }) + sparkle(910, 570, t, 8.0, { R: 260, n: 12 }) + ring(910, 570, t, 8.0, { r: 125, R: 240, col: COL.A });
      o += g + '</g>';
      o += caption(t, 4.6, 6.7, 'A 의 원소를 B 에서 하나씩 찾아보자') + caption(t, 6.8, 7.9, '모두 있다!') + caption(t, 8.0, 11.5, 'A 의 원소가 모두 B 에 있다 → A ⊂ B  (A 는 B 의 부분집합)', { fill: COL.OK });
    }
    // ② C = {2, 5}, D = {1, 2, 3, 4}
    const v2 = vis(t, 11.8, 20.0);
    if (v2 > 0.002) {
      let g = `<g opacity="${v2.toFixed(3)}">`;
      g += T(150, 175, '{2, 5}', { size: 50, fill: COL.A, anchor: 'start', op: vis(t, 12.0, null) }) + T(1770, 175, '{1, 2, 3, 4}', { size: 50, fill: COL.B, anchor: 'end', op: vis(t, 12.2, null) });
      g += circ(BC[0], BC[1], BR, COL.B, inn(t, 12.2, 0.8), { fill: 0.12 });
      const P = { 1: [880, 470], 2: [900, 650], 3: [1100, 460], 4: [1120, 650] };
      [1, 2, 3, 4].forEach((n, i) => { g += tok(P[n][0], P[n][1], String(n), COL.B, t, 12.6 + i * 0.1, { r: 36 }); });
      // 2 는 쏙 ✔ · 5 는 들어갈 자리가 없어 원 가장자리에서 튕겨 나간다 ✘
      const [x2, y2] = fly(t, 13.6, [330, 640], P[2]);
      g += tok(x2, y2, '2', COL.A, t, 13.0, { r: 36 });
      if (t >= 14.4) g += T(P[2][0] + 52, P[2][1] - 30, '✔', { size: 44, fill: COL.OK, op: vis(t, 14.4, null), sc: pop(t, 14.4), glow: 'g1' });
      const pIn = eio(seg(t, 14.8, 15.5)), pOut = eo(seg(t, 15.5, 16.2)), edge = [BC[0] - BR + 10, 400];
      let x5 = lerp(330, edge[0], pIn), y5 = lerp(420, edge[1], pIn) - Math.sin(Math.PI * pIn) * 80;
      if (t >= 15.5) { x5 = lerp(edge[0], 380, pOut); y5 = lerp(edge[1], 330, pOut); }
      const shake = t >= 15.5 && t < 16.1 ? Math.sin(t * 70) * 10 * (1 - seg(t, 15.5, 16.1)) : 0;
      g += tok(x5 + shake, y5, '5', t >= 15.5 ? COL.NG : COL.A, t, 13.1, { r: 36 });
      if (t >= 15.5) g += T(x5 + 54, y5 - 30, '✘', { size: 48, fill: COL.NG, op: vis(t, 15.5, null), sc: pop(t, 15.5), glow: 'g1' });
      g += box(960, 880, '{2, 5} ⊄ {1, 2, 3, 4}', t, 16.4, { size: 62, col: COL.NG, glow: 'g2' });
      o += g + '</g>';
      o += caption(t, 13.4, 15.3, '이번엔 {2, 5} 를 넣어 보자') + caption(t, 15.4, 16.3, '5 는 들어갈 자리가 없다!', { fill: COL.NG }) + caption(t, 16.4, 20.0, '하나라도 없으면 → ⊄  (포함되지 않는다)', { fill: COL.NG });
    }
    o += card(t, 20.4, '부분집합', [{ s: 'A 의 모든 원소가 B 에 있으면  A ⊂ B' }, { s: '하나라도 없으면  A ⊄ B', fill: COL.NG }, { s: '⊂ 는 「포함된다」, ⊄ 는 「포함되지 않는다」', size: 40, fill: COL.M }]);
    o += sparkle(960, 330, t, 20.8, { R: 260 });
    return o;
  },
  over(t) { return wipe(t, 11.5) + wipe(t, 20.0); },
};
