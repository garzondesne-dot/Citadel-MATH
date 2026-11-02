// (03차시) 17 부분집합 모두 구하기 · 진부분집합 — 자기 자신 빼기 (24초)
// 콘티: 0~2.8 훅「빠짐없이 모두!」 → 3~13.5 A = {1, 2, 3} 의 부분집합을 원소 0개 · 1개 · 2개 · 3개 순서로 (카운터 → 와! 2³ = 8)
//       → 13.8~20 진부분집합: 자기 자신 {1, 2, 3} 이 빠져나감 (8 − 1 = 7) → 20.4~24 요약
// 학습지 3차시 문제 3 (A = {1, 2, 3} · 부분집합 8개 · 진부분집합 7개)
const ROWS = [['∅'], ['{1}', '{2}', '{3}'], ['{1, 2}', '{1, 3}', '{2, 3}'], ['{1, 2, 3}']];
const RY = [300, 450, 600, 750], RT = [4.0, 5.6, 7.4, 9.2];
window.SCENE = {
  D: 24, punch: [10.6, 16.6],
  draw(t) {
    let o = '';
    o += kinetic(960, 480, '빠짐없이 모두!', t, 0.2, { size: 124, t1: 2.6 });
    o += T(960, 610, '부분집합 모두 구하기 · 진부분집합', { size: 46, fill: COL.M, op: vis(t, 1.0, 2.6) });
    const v1 = vis(t, 3.0, 20.0);
    if (v1 > 0.002) {
      let g = `<g opacity="${v1.toFixed(3)}">`;
      g += T(150, 170, 'A = {1, 2, 3}', { size: 54, fill: COL.A, anchor: 'start', op: vis(t, 3.2, null), glow: 'g1' });
      // 왼쪽 작은 A
      g += circ(300, 470, 120, COL.A, inn(t, 3.3, 0.8), { fill: 0.14 });
      [['1', 260, 430], ['2', 345, 445], ['3', 300, 530]].forEach(([n, x, y], i) => { g += tok(x, y, n, COL.A, t, 3.6 + i * 0.08, { r: 30 }); });
      // 줄마다: 원소 0개 → 1개 → 2개 → 3개
      let cnt = 0;
      ROWS.forEach((row, ri) => {
        g += T(600, RY[ri] + 16, `원소 ${ri}개`, { size: 40, fill: COL.M, anchor: 'end', op: vis(t, RT[ri] - 0.2, null) });
        row.forEach((s, k) => {
          const t0 = RT[ri] + k * 0.35, self = s === '{1, 2, 3}', gone = self ? eio(seg(t, 15.6, 16.6)) : 0;
          const col = self && t >= 14.6 ? COL.NG : ri === 0 ? COL.OK : COL.T;
          if (t >= t0) cnt++;
          g += box(760 + k * 260 + gone * 700, RY[ri], s, t, t0, { size: 46, col, op: 1 - gone });
          if (self && t >= 14.6 && t < 15.7) g += `<line x1="${650}" y1="${RY[ri]}" x2="${870}" y2="${RY[ri]}" stroke="${COL.NG}" stroke-width="6" opacity="${vis(t, 14.6, 15.5)}" filter="url(#g1)"/>`;
        });
      });
      // 카운터
      const shown = t >= 16.6 ? 7 : cnt;
      g += T(1630, 300, '부분집합', { size: 40, fill: COL.M, op: vis(t, 4.0, null) });
      g += T(1630, 430, `${shown}개`, { size: 110, fill: t >= 16.6 ? COL.OK : COL.T, op: vis(t, 4.0, null), glow: t >= 10.6 ? 'g2' : 'g1' });
      g += T(1630, 520, t >= 16.6 ? '진부분집합' : '', { size: 40, fill: COL.OK, op: vis(t, 16.6, null) });
      g += box(1630, 640, '2³ = 8', t, 10.6, { size: 56, col: COL.OK, glow: 'g2', op: 1 - seg(t, 13.6, 14.0) }) + sparkle(1630, 430, t, 10.6, { R: 220, n: 12 }) + ring(1630, 420, t, 10.6, { r: 70, R: 220 });
      g += box(1630, 640, '8 − 1 = 7', t, 16.6, { size: 56, col: COL.OK, glow: 'g2' }) + sparkle(1630, 430, t, 16.6, { R: 220, n: 10 });
      o += g + '</g>';
      o += caption(t, 4.0, 5.5, '원소 0개: 공집합 ∅ 도 부분집합') + caption(t, 5.6, 7.3, '원소 1개씩') + caption(t, 7.4, 9.1, '원소 2개씩') + caption(t, 9.2, 10.5, '원소 3개: 자기 자신')
        + caption(t, 10.6, 13.6, '빠짐없이 세면 → 모두 8개 (2³ = 8)', { fill: COL.OK }) + caption(t, 13.8, 16.5, '진부분집합 = 부분집합 중 자기 자신을 뺀 것', { fill: COL.NG }) + caption(t, 16.6, 20.0, '8 − 1 = 7개', { fill: COL.OK });
    }
    o += card(t, 20.4, '부분집합 모두 구하기 · 진부분집합', [{ s: '원소 0개 → 1개 → 2개 → 3개 순서로 빠짐없이' }, { s: '부분집합 2³ = 8개 ,  진부분집합 8 − 1 = 7개' }, { s: '진부분집합은 자기 자신만 빼요', size: 40, fill: COL.M }]);
    o += sparkle(960, 330, t, 20.8, { R: 260 });
    return o;
  },
  over(t) { return wipe(t, 20.0); },
};
