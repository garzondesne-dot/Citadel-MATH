// (05차시) 12 분배법칙 — 수처럼 나누어 계산 (27초)
// 콘티: 0~4.8 훅 2 × (3 + 4) = 2 × 3 + 2 × 4 → 5.2~19.2 두 벤 다이어그램 A ∩ (B ∪ C) 와 (A ∩ B) ∪ (A ∩ C) 색칠, 와! = 두 그림이 가운데로 모여 똑같이 겹침
//       → 19.6~22.9 주의(괄호만 옮기면 다르다, 예시 원소로) → 23.3~27 요약 카드
// 집합: A = {1, 2, 3, 4}, B = {2, 4, 6}, C = {3, 4, 5} (학습지 문제 2)
const R3 = 150, OA = [0, -78], OB = [-88, 70], OC = [88, 70];
const EL = [['1', 0, -168, COL.A], ['2', -88, -18, COL.X], ['3', 88, -18, COL.X], ['4', 0, 20, COL.X], ['5', 158, 122, COL.C], ['6', -158, 122, COL.B]];
function venn3(cx, cy, t, t0, id, shade) {
  let g = '';
  // 색칠 (shade 는 cx,cy 기준으로 그린다)
  g += shade(cx, cy);
  g += circ(cx + OA[0], cy + OA[1], R3, COL.A, inn(t, t0, 0.8)) + circ(cx + OB[0], cy + OB[1], R3, COL.B, inn(t, t0 + 0.15, 0.8)) + circ(cx + OC[0], cy + OC[1], R3, COL.C, inn(t, t0 + 0.3, 0.8));
  const lo = vis(t, t0 + 0.4, null);
  g += T(cx - 150, cy - 196, 'A', { size: 52, fill: COL.A, op: lo, glow: 'g1' }) + T(cx - 250, cy + 220, 'B', { size: 52, fill: COL.B, op: lo, glow: 'g1' }) + T(cx + 250, cy + 220, 'C', { size: 52, fill: COL.C, op: lo, glow: 'g1' });
  EL.forEach(([l, x, y, c], i) => { g += tok(cx + x, cy + y, l, COL.T, t, t0 + 0.8 + i * 0.07, { r: 28 }); });
  return g;
}
const clipDefs = (id, cx, cy) => `<clipPath id="${id}"><circle cx="${cx + OA[0]}" cy="${cy + OA[1]}" r="${R3}"/></clipPath>`;
window.SCENE = {
  D: 27, punch: [3.6, 15.9],
  geo(t) { const m = eio(seg(t, 15.0, 15.9)); return { lx: lerp(540, 960, m), rx: lerp(1380, 960, m), cy: 600 }; },
  defs(t) { const g = this.geo(t); return `<defs>${clipDefs('cL12', g.lx, g.cy)}${clipDefs('cR12', g.rx, g.cy)}</defs>`; },
  draw(t) {
    let o = '';
    // ── 훅 ──
    o += kinetic(960, 380, '2 × (3 + 4)', t, 0.2, { size: 124, t1: 4.6 });
    const h2 = vis(t, 1.6, 4.6);
    o += T(960, 530, `= <tspan fill="${COL.X}">2 ×</tspan> 3 + <tspan fill="${COL.X}">2 ×</tspan> 4`, { raw: true, size: 92, op: h2, sc: 0.9 + 0.1 * pop(t, 1.6), glow: 'g1' });
    const c1 = Math.round(14 * eo(seg(t, 2.8, 3.5)));
    o += box(700, 700, `2 × 7 = ${c1}`, t, 2.7, { col: COL.T, size: 56, op: 1 - ei(seg(t, 4.6, 4.85)) }) + box(1220, 700, `6 + 8 = ${c1}`, t, 2.8, { col: COL.T, size: 56, op: 1 - ei(seg(t, 4.6, 4.85)) });
    o += T(960, 722, '=', { size: 100, fill: COL.OK, op: vis(t, 3.6, 4.6), sc: pop(t, 3.6), glow: 'g2' }) + sparkle(960, 700, t, 3.6, { R: 180, n: 8 });
    o += caption(t, 1.7, 4.6, '수에서는 나누어 곱해도 결과가 같다');
    // ── 집합 ──
    const vS = vis(t, 5.2, 19.2);
    if (vS > 0.002) {
      const gm = this.geo(t), cy = gm.cy, merged = t >= 15.9;
      let g = `<g opacity="${vS.toFixed(3)}">`;
      g += T(330, 150, 'A = {1, 2, 3, 4}', { size: 46, fill: COL.A, op: vis(t, 5.4, null) }) + T(960, 150, 'B = {2, 4, 6}', { size: 46, fill: COL.B, op: vis(t, 5.55, null) }) + T(1590, 150, 'C = {3, 4, 5}', { size: 46, fill: COL.C, op: vis(t, 5.7, null) });
      g += T(540, 300, 'A ∩ (B ∪ C)', { size: 62, op: vis(t, 7.3, null), glow: 'g1' }) + T(1380, 300, '(A ∩ B) ∪ (A ∩ C)', { size: 62, op: vis(t, 10.6, null), glow: 'g1' });
      g += T(960, 302, '=', { size: 80, fill: COL.OK, op: vis(t, 15.9, null), sc: pop(t, 15.9), glow: 'g2' });
      // 왼쪽: B ∪ C (흰빛) → A 안쪽만 남기면 마젠타
      const bc = 0.3 * eo(seg(t, 7.8, 8.4)) * (1 - eo(seg(t, 9.2, 9.8))), inA = eo(seg(t, 9.2, 9.8));
      const glowM = merged ? 0.25 * Math.sin(Math.PI * seg(t, 15.9, 16.6)) : 0;
      const shadeL = (cx, cy0) => `<g opacity="${bc}"><circle cx="${cx + OB[0]}" cy="${cy0 + OB[1]}" r="${R3}" fill="#dfe5ff"/><circle cx="${cx + OC[0]}" cy="${cy0 + OC[1]}" r="${R3}" fill="#dfe5ff"/></g>
        <g opacity="${(0.5 + glowM) * inA}" clip-path="url(#cL12)"><circle cx="${cx + OB[0]}" cy="${cy0 + OB[1]}" r="${R3}" fill="${COL.X}"/><circle cx="${cx + OC[0]}" cy="${cy0 + OC[1]}" r="${R3}" fill="${COL.X}"/></g>`;
      const pB = eo(seg(t, 11.0, 11.5)), pC = eo(seg(t, 12.4, 12.9));
      const shadeR = (cx, cy0) => `<g opacity="${0.5 + glowM}" clip-path="url(#cR12)"><circle cx="${cx + OB[0]}" cy="${cy0 + OB[1]}" r="${R3}" fill="${COL.X}" opacity="${pB}"/><circle cx="${cx + OC[0]}" cy="${cy0 + OC[1]}" r="${R3}" fill="${COL.X}" opacity="${pC}"/></g>`;
      g += venn3(gm.lx, cy, t, 5.8, 'L', shadeL);
      if (!merged || t < 16.0) g += `<g opacity="${merged ? 1 - seg(t, 15.9, 16.0) : 1}">${venn3(gm.rx, cy, t, 5.95, 'R', shadeR)}</g>`;
      // 결과 꼬리표
      const tagY = 868, tL = 1 - ei(seg(t, 15.0, 15.3));
      g += box(540, tagY, 'B ∪ C = {2, 3, 4, 5, 6}', t, 8.0, { size: 38, col: '#dfe5ff', op: 1 - ei(seg(t, 9.2, 9.4)) });
      g += box(540, tagY, 'A ∩ (B ∪ C) = {2, 3, 4}', t, 9.6, { size: 38, col: COL.X, op: tL });
      g += box(1380, tagY, 'A ∩ B = {2, 4}', t, 11.2, { size: 38, col: COL.X, op: 1 - ei(seg(t, 12.4, 12.6)) });
      g += box(1380, tagY, 'A ∩ C = {3, 4}', t, 12.6, { size: 38, col: COL.X, op: 1 - ei(seg(t, 13.6, 13.8)) });
      g += box(1380, tagY, '(A ∩ B) ∪ (A ∩ C) = {2, 3, 4}', t, 13.8, { size: 38, col: COL.X, op: tL });
      g += box(960, tagY, '둘 다 {2, 3, 4}', t, 15.9, { size: 46, col: COL.OK, glow: 'g2' });
      g += T(1240, 600, '같다!', { size: 70, fill: COL.OK, anchor: 'start', op: vis(t, 15.9, null), sc: pop(t, 15.9), glow: 'g2' });
      g += sparkle(960, 580, t, 15.9, { R: 330, n: 12 }) + ring(960, 580, t, 15.9, { r: 120, R: 420 });
      o += g + '</g>';
      o += caption(t, 7.8, 9.1, '왼쪽: B ∪ C 를 먼저 색칠') + caption(t, 9.2, 10.5, '그중 A 안에 있는 부분만 → {2, 3, 4}') + caption(t, 10.6, 12.3, '오른쪽: A ∩ B 를 색칠하고') + caption(t, 12.4, 14.9, 'A ∩ C 도 색칠해서 합치면 → {2, 3, 4}') + caption(t, 15.0, 17.6, '두 그림이 똑같다! → 분배법칙', { fill: COL.OK }) + caption(t, 17.7, 19.2, 'A ∩ 를 괄호 안의 B 와 C 에 각각 나누어 준다');
    }
    // ── 주의 ──
    const vW = vis(t, 19.6, 22.9);
    if (vW > 0.002) {
      let g = `<g opacity="${vW.toFixed(3)}">`;
      g += T(960, 290, '⚠ 괄호만 옮기면 안 돼요!', { size: 76, fill: COL.NG, sc: pop(t, 19.6), glow: 'g1' });
      g += T(560, 510, 'A ∪ (B ∩ C)', { size: 64, op: vis(t, 20.0, null) }) + T(1360, 510, '(A ∪ B) ∩ C', { size: 64, op: vis(t, 20.2, null) });
      g += box(560, 650, '{1, 2, 3, 4}', t, 20.5, { size: 58, col: COL.T }) + box(1360, 650, '{3, 4}', t, 20.7, { size: 58, col: COL.NG });
      const shake = t >= 21.0 && t < 21.5 ? Math.sin(t * 60) * 8 * (1 - seg(t, 21.0, 21.5)) : 0;
      g += T(960 + shake, 672, '≠', { size: 120, fill: COL.NG, op: vis(t, 21.0, null), sc: pop(t, 21.0), glow: 'g2' });
      o += g + '</g>';
      o += caption(t, 20.5, 22.9, '이 예에서도 결과가 다르다 → 원소를 넣어 꼭 확인!', { fill: COL.NG });
    }
    // ── 요약 ──
    o += card(t, 23.3, '분배법칙', [{ s: 'A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)' }, { s: 'A ∪ (B ∩ C) = (A ∪ B) ∩ (A ∪ C)' }, { s: '수의 2 × (3 + 4) = 2 × 3 + 2 × 4 처럼', size: 42, fill: COL.M }]);
    o += sparkle(960, 330, t, 23.7, { R: 260 });
    return o;
  },
  over(t) { return wipe(t, 4.85) + wipe(t, 19.2) + wipe(t, 22.9); },
};
