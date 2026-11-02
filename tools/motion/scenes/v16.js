// (03차시) 16 서로 같은 집합 — 서로 포함하면 같다 (26초)
// 콘티: 0~2.8 훅 → 3~10.4 {2, 4, 6} 과 {6, 4, 2}: A ⊂ B ✔ · B ⊂ A ✔ → 와! 두 원이 하나로 겹침 A = B
//       → 10.6~18.4 꼭 기억할 두 가지 A ⊂ A · ∅ ⊂ A → 18.6~22 {2, 4, 6} 과 {x | x는 8 이하의 짝수}: 8 이 짝이 없음 (≠) → 22.4~26 요약
// 학습지 3차시 문제 2 (1) {2, 4, 6} = {6, 4, 2}, (3) {2, 4, 6} ≠ {x | x는 8 이하의 짝수}
const REL = { 2: [-70, -60], 4: [75, -20], 6: [-20, 85], 8: [90, 90] };
window.SCENE = {
  D: 26, punch: [8.6, 20.2],
  draw(t) {
    let o = '';
    o += kinetic(960, 480, '순서가 달라도 같을까?', t, 0.2, { size: 112, t1: 2.6 });
    o += T(960, 610, '서로 같은 집합', { size: 46, fill: COL.M, op: vis(t, 1.0, 2.6) });
    // ① A = {2, 4, 6}, B = {6, 4, 2}
    const v1 = vis(t, 3.0, 10.4);
    if (v1 > 0.002) {
      const m = eio(seg(t, 8.6, 9.4)), ax = lerp(620, 960, m), bx = lerp(1300, 960, m), cy = 560, r = 200;
      let g = `<g opacity="${v1.toFixed(3)}">`;
      g += T(150, 175, 'A = {2, 4, 6}', { size: 50, fill: COL.A, anchor: 'start', op: vis(t, 3.2, null) }) + T(1770, 175, 'B = {6, 4, 2}', { size: 50, fill: COL.B, anchor: 'end', op: vis(t, 3.4, null) });
      g += `<g style="mix-blend-mode:screen">${circ(ax, cy, r, COL.A, inn(t, 3.4, 0.8), { fill: 0.14, glow: t >= 8.6 && t < 9.8 ? 'g2' : 'g1' })}${circ(bx, cy, r, COL.B, inn(t, 3.6, 0.8), { fill: 0.14, glow: t >= 8.6 && t < 9.8 ? 'g2' : 'g1' })}</g>`;
      g += T(ax - 150, cy - 190, 'A', { size: 60, fill: COL.A, op: vis(t, 3.8, null) * (1 - m), glow: 'g1' }) + T(bx + 150, cy - 190, 'B', { size: 60, fill: COL.B, op: vis(t, 3.9, null) * (1 - m), glow: 'g1' });
      [2, 4, 6].forEach((n, i) => { g += tok(ax + REL[n][0], cy + REL[n][1], String(n), COL.A, t, 4.2 + i * 0.1, { r: 34 }); g += tok(bx + REL[n][0], cy + REL[n][1], String(n), COL.B, t, 4.5 + i * 0.1, { r: 34, op: 1 - m }); });
      if (m < 0.05) {
        [2, 4, 6].forEach((n, i) => { g += arrow(ax + REL[n][0] + 40, cy + REL[n][1], bx + REL[n][0] - 40, cy + REL[n][1], COL.A, inn(t, 5.2 + i * 0.15, 0.5), { lift: 30, op: 1 - seg(t, 7.0, 7.3) }); });
        [2, 4, 6].forEach((n, i) => { g += arrow(bx + REL[n][0] - 40, cy + REL[n][1] + 14, ax + REL[n][0] + 40, cy + REL[n][1] + 14, COL.B, inn(t, 7.0 + i * 0.15, 0.5), { lift: -30, op: 1 - seg(t, 8.4, 8.6) }); });
      }
      g += T(960, 870, 'A ⊂ B ✔', { size: 54, fill: COL.A, op: vis(t, 6.0, 8.5), anchor: 'end', dy: 0 }) + T(1010, 870, 'B ⊂ A ✔', { size: 54, fill: COL.B, anchor: 'start', op: vis(t, 7.8, 8.5) });
      g += box(960, 880, 'A = B', t, 9.0, { size: 76, col: COL.OK, glow: 'g2' }) + sparkle(960, cy, t, 9.0, { R: 300, n: 12 }) + ring(960, cy, t, 9.0, { r: 200, R: 240 });
      o += g + '</g>';
      o += caption(t, 5.2, 6.9, 'A 의 원소가 모두 B 에 있다 → A ⊂ B') + caption(t, 7.0, 8.5, 'B 의 원소도 모두 A 에 있다 → B ⊂ A') + caption(t, 8.6, 10.4, '서로 포함하면 → A = B  (순서는 상관없다)', { fill: COL.OK });
    }
    // ② 꼭 기억할 두 가지: A ⊂ A · ∅ ⊂ A
    const v2 = vis(t, 10.6, 18.4);
    if (v2 > 0.002) {
      let g = `<g opacity="${v2.toFixed(3)}">`;
      g += T(960, 175, '꼭 기억할 두 가지', { size: 60, fill: COL.T, op: vis(t, 10.8, null), glow: 'g1' });
      // 왼쪽: 자기 자신
      const L0 = [560, 540], gh = eo(seg(t, 11.8, 12.8));
      g += circ(L0[0], L0[1], 180, COL.A, inn(t, 11.0, 0.8), { fill: 0.14 });
      [2, 4, 6].forEach((n, i) => { g += tok(L0[0] + REL[n][0], L0[1] + REL[n][1], String(n), COL.A, t, 11.3 + i * 0.08, { r: 32 }); });
      g += `<circle cx="${L0[0] + 120 * (1 - gh)}" cy="${L0[1] - 60 * (1 - gh)}" r="180" fill="none" stroke="${COL.OK}" stroke-width="5" stroke-dasharray="14 10" opacity="${(0.9 * vis(t, 11.6, null)).toFixed(3)}" filter="url(#g1)"/>`;
      g += box(L0[0], 830, 'A ⊂ A', t, 13.0, { size: 60, col: COL.OK });
      // 오른쪽: 공집합
      const R0 = [1360, 540], pE = eio(seg(t, 14.6, 15.4));
      g += circ(R0[0], R0[1], 180, COL.A, inn(t, 14.0, 0.8), { fill: 0.14 });
      [2, 4, 6].forEach((n, i) => { g += tok(R0[0] + REL[n][0], R0[1] + REL[n][1], String(n), COL.A, t, 14.2 + i * 0.08, { r: 32 }); });
      g += tok(lerp(1760, R0[0] + 95, pE), lerp(300, R0[1] + 70, pE) - Math.sin(Math.PI * pE) * 80, '∅', COL.OK, t, 14.3, { r: 34 });
      g += box(R0[0], 830, '∅ ⊂ A', t, 15.6, { size: 60, col: COL.OK }) + sparkle(R0[0] + 95, R0[1] + 70, t, 15.4, { R: 120, n: 8 });
      o += g + '</g>';
      o += caption(t, 11.8, 13.9, '모든 집합은 자기 자신의 부분집합 → A ⊂ A') + caption(t, 14.0, 18.4, '원소가 없는 ∅ 은 어디에나 쏙 → ∅ ⊂ A');
    }
    // ③ {2, 4, 6} 과 {x | x는 8 이하의 짝수} = {2, 4, 6, 8}
    const v3 = vis(t, 18.6, 22.0);
    if (v3 > 0.002) {
      let g = `<g opacity="${v3.toFixed(3)}">`;
      g += T(150, 175, '{2, 4, 6}', { size: 50, fill: COL.A, anchor: 'start' }) + T(1770, 175, '{x | x는 8 이하의 짝수} = {2, 4, 6, 8}', { size: 44, fill: COL.B, anchor: 'end' });
      g += circ(620, 560, 200, COL.A, inn(t, 18.7, 0.6), { fill: 0.14 }) + circ(1300, 560, 200, COL.B, inn(t, 18.8, 0.6), { fill: 0.14 });
      [2, 4, 6].forEach((n, i) => { g += tok(620 + REL[n][0], 560 + REL[n][1], String(n), COL.A, t, 19.0 + i * 0.06, { r: 34 }); });
      [2, 4, 6, 8].forEach((n, i) => { g += tok(1300 + REL[n][0], 560 + REL[n][1], String(n), n === 8 && t >= 20.2 ? COL.NG : COL.B, t, 19.1 + i * 0.06, { r: 34 }); });
      g += T(1300 + REL[8][0] + 50, 560 + REL[8][1] - 30, '짝이 없다!', { size: 36, fill: COL.NG, anchor: 'start', op: vis(t, 20.2, null), sc: pop(t, 20.2) });
      g += T(960, 600, '≠', { size: 130, fill: COL.NG, op: vis(t, 20.2, null), sc: pop(t, 20.2), glow: 'g2' });
      o += g + '</g>';
      o += caption(t, 19.2, 20.1, '이 둘은 같을까?') + caption(t, 20.2, 22.0, '8 은 왼쪽에 없다 → 서로 같은 집합이 아니다 (≠)', { fill: COL.NG });
    }
    o += card(t, 22.4, '서로 같은 집합', [{ s: 'A ⊂ B 이고 B ⊂ A 이면  A = B' }, { s: 'A ⊂ A ,   ∅ ⊂ A' }, { s: '순서가 달라도 원소가 모두 같으면 같은 집합', size: 40, fill: COL.M }]);
    o += sparkle(960, 330, t, 22.8, { R: 260 });
    return o;
  },
  over(t) { return wipe(t, 10.4) + wipe(t, 18.4) + wipe(t, 22.0); },
};
