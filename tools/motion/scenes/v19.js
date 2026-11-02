// (06차시) 19 생활 속 문제 — 「둘 다」 칸부터 채우기 (28초)
// 콘티: 0~3 훅 → 3.2~6.2 문제 · 벤 다이어그램 → ① 둘 다 5 (와! 겹친 칸부터) → ② 게임만 11 → ③ 운동만 8
//       → ④ 또는 = 24 (와! 두 원이 한 덩어리로 빛남) → ⑤ 둘 다 안 = 8 → 24~28 요약
// 예: 우리 반 32명 · 게임 16명 · 운동 13명 · 둘 다 5명 (학습지 문제 3 과 다른 숫자)
const UX = 410, UY = 280, UW = 1100, UH = 570, AX = 820, BX = 1100, CY = 590, R = 215;
function ex(t, t0, t1, s, tAns, ans) {
  const op = vis(t, t0, t1); if (op <= 0.002) return '';
  const full = t >= tAns, q = full ? pop(t, tAns) : 0;
  return T(960, 190, full ? `${M(s)} <tspan fill="${COL.OK}">${M(ans)}</tspan>` : M(s), { raw: true, size: 66, op, sc: full ? 0.94 + 0.06 * q : 1, glow: 'g1' });
}
const num = (x, y, s, col, t, t0, o = {}) => { const op = vis(t, t0, o.t1); if (op <= 0.002) return ''; return T(x, y + 26, s, { size: o.size || 80, fill: col, op, sc: pop(t, t0) * (o.dropY ? 1 : 1), dy: o.drop ? -140 * (1 - eo(inn(t, t0, 0.45))) : 0, glow: 'g2' }); };
window.SCENE = {
  D: 28, punch: [7.6, 18.0],
  defs() {
    return `<defs><mask id="mNotB"><rect width="1920" height="1080" fill="white"/><circle cx="${BX}" cy="${CY}" r="${R}" fill="black"/></mask>
      <mask id="mNotA"><rect width="1920" height="1080" fill="white"/><circle cx="${AX}" cy="${CY}" r="${R}" fill="black"/></mask>
      <mask id="mOut"><rect width="1920" height="1080" fill="white"/><circle cx="${AX}" cy="${CY}" r="${R}" fill="black"/><circle cx="${BX}" cy="${CY}" r="${R}" fill="black"/></mask>
      <clipPath id="cB"><circle cx="${BX}" cy="${CY}" r="${R}"/></clipPath></defs>`;
  },
  draw(t) {
    let o = '';
    o += kinetic(960, 470, '어느 칸부터 채울까?', t, 0.2, { size: 104, t1: 2.8, stag: 0.04 });
    o += T(960, 600, '생활 속 문제 · 벤 다이어그램 칸 채우기', { size: 46, fill: COL.M, op: vis(t, 1.1, 2.8) });
    const vS = vis(t, 3.2, 23.6);
    if (vS > 0.002) {
      let g = `<g opacity="${vS.toFixed(3)}">`;
      const lens = 0.45 * eo(seg(t, 6.6, 7.0)) * (1 - 0.45 * eo(seg(t, 9.2, 9.6)));
      const aOnly = 0.3 * eo(seg(t, 9.4, 9.8)) * (1 - 0.5 * eo(seg(t, 12.8, 13.2)));
      const bOnly = 0.3 * eo(seg(t, 12.9, 13.3)) * (1 - 0.5 * eo(seg(t, 16.0, 16.4)));
      const uni = 0.3 * eo(seg(t, 16.3, 16.8)) * (1 - eo(seg(t, 19.8, 20.2)));
      const out = 0.3 * eo(seg(t, 20.0, 20.5)) * (1 - eo(seg(t, 23.2, 23.6)));
      g += `<circle cx="${AX}" cy="${CY}" r="${R}" fill="${COL.X}" opacity="${lens}" clip-path="url(#cB)"/>`;
      g += `<circle cx="${AX}" cy="${CY}" r="${R}" fill="${COL.A}" opacity="${aOnly}" mask="url(#mNotB)"/>`;
      g += `<circle cx="${BX}" cy="${CY}" r="${R}" fill="${COL.B}" opacity="${bOnly}" mask="url(#mNotA)"/>`;
      g += `<circle cx="${AX}" cy="${CY}" r="${R}" fill="${COL.OK}" opacity="${uni}"/><circle cx="${BX}" cy="${CY}" r="${R}" fill="${COL.OK}" opacity="${uni}" mask="url(#mNotA)"/>`;
      g += `<rect x="${UX}" y="${UY}" width="${UW}" height="${UH}" rx="22" fill="${COL.U}" opacity="${out}" mask="url(#mOut)"/>`;
      g += rectDraw(UX, UY, UW, UH, COL.U, inn(t, 3.4, 0.9));
      const uniGlow = t >= 18.0 && t < 19.8;
      g += circ(AX, CY, R, uniGlow ? COL.OK : COL.A, inn(t, 3.9, 0.7), { sw: uniGlow ? 8 : 5 }) + circ(BX, CY, R, uniGlow ? COL.OK : COL.B, inn(t, 4.2, 0.7), { sw: uniGlow ? 8 : 5 });
      g += T(UX + 40, UY + UH - 34, '우리 반 32명', { size: 44, fill: COL.U, anchor: 'start', op: vis(t, 3.7, null) });
      g += T(AX - 120, CY - R - 22, '게임 16명', { size: 46, fill: COL.A, op: vis(t, 4.1, null) }) + T(BX + 120, CY - R - 22, '운동 13명', { size: 46, fill: COL.B, op: vis(t, 4.4, null) });
      // 칸 숫자
      g += num(960, CY, '5', COL.X, t, 7.6, { drop: true });
      g += num(690, CY, '11', COL.A, t, 11.0);
      g += num(1230, CY, '8', COL.B, t, 14.4);
      g += num(1400, 790, '8', COL.U, t, 21.6);
      // 「둘 다 칸부터!」 화살표
      g += arrow(960, 300, 960, CY - 70, COL.X, seg(t, 6.6, 7.4), { lift: 0, op: vis(t, 6.6, 9.2) }) + T(960, 280, '둘 다', { size: 44, fill: COL.X, op: vis(t, 6.6, 9.2) });
      g += sparkle(960, CY, t, 7.6, { R: 200 }) + ring(960, CY, t, 7.6, { col: COL.X, r: 40, R: 180 });
      g += sparkle(960, CY, t, 18.0, { R: 420, n: 12 }) + ring(960, CY, t, 18.0, { r: 200, R: 360 }) + sparkle(1400, 790, t, 21.6, { R: 180 });
      // 위 문제 줄 → 식
      g += T(960, 190, '32명 중 게임 16명, 운동 13명, 둘 다 5명', { size: 54, op: vis(t, 4.6, 6.4) });
      g += ex(t, 9.4, 12.6, '게임만 = 16 − 5', '= 11', 11.0) + ex(t, 12.8, 15.8, '운동만 = 13 − 5', '= 8', 14.4);
      g += ex(t, 16.0, 19.6, '게임 또는 운동 = 11 + 5 + 8', '= 24', 18.0) + ex(t, 19.8, 23.4, '둘 다 안 함 = 32 − 24', '= 8', 21.6);
      g += T(960, 266, '( = 16 + 13 − 5 )', { size: 42, fill: COL.M, op: vis(t, 18.4, 19.6) });
      o += g + '</g>';
      o += caption(t, 5.0, 6.4, '네 칸을 다 채우면 무엇이든 답할 수 있다');
      o += caption(t, 6.6, 9.2, '「둘 다」 칸부터 채운다!', { fill: COL.X });
      o += caption(t, 9.4, 12.6, '게임만 = 게임 전체 − 둘 다') + caption(t, 12.8, 15.8, '운동만 = 운동 전체 − 둘 다');
      o += caption(t, 16.0, 19.6, '또는 = 두 원 안을 모두 더한다', { fill: COL.OK }) + caption(t, 19.8, 23.4, '둘 다 안 함 = 전체 − (또는)');
    }
    o += card(t, 24.0, '생활 속 문제는 칸 채우기', [{ s: '①  「둘 다」 칸부터 채운다' }, { s: '②  ~만 = 전체 − 둘 다' }, { s: '③  또는 = n(A) + n(B) − n(A ∩ B)' }, { s: '④  둘 다 안 = 전체 − (또는)' }], { lh: 84 });
    o += sparkle(960, 300, t, 24.4, { R: 260 });
    return o;
  },
  over(t) { return wipe(t, 23.6); },
};
