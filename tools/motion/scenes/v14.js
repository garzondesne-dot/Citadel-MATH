// (05차시) 14 여집합의 성질 — A ∪ Aᶜ = U (28초)
// 콘티: 0~3 훅 → 3.2~6.5 U · A · Aᶜ 소개 → ① A ∪ Aᶜ = U (와! 전체가 빛남) → ② A ∩ Aᶜ = ∅ → ③ (Aᶜ)ᶜ = A (와! 두 번 뒤집으면 제자리)
//       → ④ Uᶜ = ∅, ∅ᶜ = U → 24~28 요약 카드
// U = {1, 2, …, 8}, A = {1, 2, 3} (학습지 문제 3 과 같은 전체집합)
const UX = 410, UY = 300, UW = 1100, UH = 540, CX = 790, CYY = 570, RA = 200;
const TOK = [['1', 730, 500, 'A'], ['2', 850, 500, 'A'], ['3', 790, 640, 'A'], ['4', 1100, 400], ['5', 1260, 480], ['6', 1410, 400], ['7', 1150, 720], ['8', 1360, 720]];
const ACPATH = `M${UX} ${UY} H${UX + UW} V${UY + UH} H${UX} Z M${CX - RA} ${CYY} a${RA} ${RA} 0 1 0 ${2 * RA} 0 a${RA} ${RA} 0 1 0 ${-2 * RA} 0`;
const flipX = (t, a) => { const p = seg(t, a, a + 0.6); return p > 0 && p < 1 ? Math.max(0.02, Math.abs(Math.cos(Math.PI * p))) : 1; };
// 식: 기본 → 덧붙임(민트)
function ex(t, t0, t1, base, add, tAdd) {
  const op = vis(t, t0, t1); if (op <= 0.002) return '';
  const full = tAdd != null && t >= tAdd, q = full ? pop(t, tAdd) : 0;
  const s = full ? `${M(base)} <tspan fill="${COL.OK}">${M(add)}</tspan>` : M(base);
  return T(960, 178, s, { raw: true, size: 80, op, sc: full ? 0.92 + 0.08 * q : 1, glow: 'g1' });
}
window.SCENE = {
  D: 28, punch: [8.0, 16.9],
  draw(t) {
    let o = '';
    o += kinetic(960, 480, 'A 와 A 가 아닌 것을 합치면?', t, 0.2, { size: 92, t1: 2.8, stag: 0.035 });
    o += T(960, 610, '여집합의 성질', { size: 46, fill: COL.M, op: vis(t, 1.2, 2.8) });
    const vS = vis(t, 3.2, 23.6);
    if (vS > 0.002) {
      // 색칠 상태
      let sA = 0, sAc = 0, sU = 0;
      sAc = 0.28 * eo(seg(t, 5.2, 5.8)) * (1 - eo(seg(t, 13.8, 14.2)));
      sA = 0.3 * eo(seg(t, 6.9, 7.4));
      // ③ 두 번 뒤집기: 14.9 에 Aᶜ, 16.5 에 다시 A
      if (t >= 14.9 && t < 16.5) { sA = 0; sAc = 0.28; }
      // ④ 전체 → 공집합 → 전체
      if (t >= 19.6) { const k = eo(seg(t, 19.6, 20.0)); sA *= 1 - k; sU = 0.28 * k; if (t >= 20.5 && t < 21.7) sU = 0; }
      const fx = flipX(t, 14.6) * flipX(t, 16.2) * flipX(t, 20.2) * flipX(t, 21.4);
      const flash = t >= 7.6 && t < 8.4 ? 0.35 * Math.sin(Math.PI * seg(t, 7.6, 8.4)) : 0;
      let g = `<g opacity="${vS.toFixed(3)}"><g transform="translate(960 0) scale(${fx.toFixed(3)} 1) translate(-960 0)">`;
      g += `<path d="${ACPATH}" fill="${COL.U}" fill-rule="evenodd" opacity="${sAc}"/><circle cx="${CX}" cy="${CYY}" r="${RA}" fill="${COL.A}" opacity="${sA}"/><rect x="${UX}" y="${UY}" width="${UW}" height="${UH}" rx="22" fill="${COL.U}" opacity="${sU}"/>`;
      g += `<rect x="${UX}" y="${UY}" width="${UW}" height="${UH}" rx="22" fill="#ffffff" opacity="${flash}"/>`;
      const uGlow = t >= 8.0 && t < 10.2 ? { sw: 8, col: COL.OK } : { sw: 5, col: COL.U };
      g += rectDraw(UX, UY, UW, UH, uGlow.col, inn(t, 3.4, 0.9), { sw: uGlow.sw });
      const ring2 = t >= 10.6 && t < 12.0 ? COL.X : COL.A;
      const dimA = 1 - 0.7 * eo(seg(t, 19.6, 20.0));
      g += circ(CX, CYY, RA, ring2, inn(t, 4.6, 0.7), { sw: ring2 === COL.X ? 8 : 5, glow: ring2 === COL.X ? 'g2' : 'g1', op: dimA });
      g += T(UX + UW - 40, UY + 52, 'U', { size: 56, fill: COL.U, op: vis(t, 3.8, null), glow: 'g1' }) + T(CX - 175, CYY - 175, 'A', { size: 60, fill: COL.A, op: vis(t, 4.8, null) * dimA, glow: 'g1' });
      const showAc = (t >= 5.2 && t < 13.8) || (t >= 14.9 && t < 16.5);
      g += T(1300, 610, 'A^C', { size: 60, fill: COL.U, op: showAc ? vis(t, t < 13.8 ? 5.3 : 14.9, null) : 0, glow: 'g1' });
      TOK.forEach(([l, x, y], i) => { g += tok(x, y, l, COL.T, t, 4.0 + i * 0.07, { r: 32 }); });
      g += '</g>';
      g += T(150, 118, 'U = {1, 2, 3, …, 8}', { size: 44, fill: COL.U, anchor: 'start', op: vis(t, 4.0, null) }) + T(1770, 118, 'A = {1, 2, 3}', { size: 44, fill: COL.A, anchor: 'end', op: vis(t, 4.8, null) });
      g += T(960, 900, '겹치는 원소 0 개', { size: 50, fill: COL.X, op: vis(t, 11.2, 13.8), sc: pop(t, 11.2), glow: 'g1' });
      g += sparkle(960, 570, t, 8.0, { R: 420, n: 12 }) + ring(960, 570, t, 8.0, { r: 150, R: 520 }) + sparkle(CX, CYY, t, 16.9, { R: 280, n: 12 }) + ring(CX, CYY, t, 16.9, { r: 190, R: 260, col: COL.A });
      g += ex(t, 6.6, 10.2, 'A ∪ A^C', '= U', 8.0) + ex(t, 10.4, 13.8, 'A ∩ A^C', '= ∅', 12.0) + ex(t, 14.0, 19.4, '(A^C)^C', '= A', 16.9) + ex(t, 19.6, 23.6, 'U^C = ∅', ',  ∅^C = U', 21.9);
      o += g + '</g>';
      o += caption(t, 5.3, 6.5, 'A 가 아닌 나머지 = A^C = {4, 5, 6, 7, 8}') + caption(t, 6.9, 7.9, 'A 와 A^C 를 합치면?') + caption(t, 8.0, 10.2, '전체집합 U 가 된다!', { fill: COL.OK });
      o += caption(t, 10.5, 11.9, '둘이 겹치는 원소는?') + caption(t, 12.0, 13.8, '하나도 없다 → 공집합 ∅', { fill: COL.OK });
      o += caption(t, 14.2, 16.1, 'A 를 뒤집으면 A^C') + caption(t, 16.2, 16.8, '한 번 더 뒤집으면?') + caption(t, 16.9, 19.4, '다시 A !  (A^C)^C = A', { fill: COL.OK });
      o += caption(t, 19.7, 21.8, '전체 U 를 뒤집으면 아무것도 없다 → U^C = ∅') + caption(t, 21.9, 23.6, '∅ 을 뒤집으면 다시 전체 → ∅^C = U');
    }
    o += card(t, 24.0, '여집합의 성질', [{ s: '①  A ∪ A^C = U' }, { s: '②  A ∩ A^C = ∅' }, { s: '③  (A^C)^C = A' }, { s: '④  U^C = ∅ ,  ∅^C = U' }], { lh: 84 });
    o += sparkle(960, 300, t, 24.4, { R: 260 });
    return o;
  },
  over(t) { return wipe(t, 23.6); },
};
