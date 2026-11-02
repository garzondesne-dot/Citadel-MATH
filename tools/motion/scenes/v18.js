// (06차시) 18 여집합 · 차집합의 원소의 개수 — 전체에서 빼기 (28초)
// 콘티: 0~3 훅 → 3.2~5.4 n(U) · n(A) · n(B) · n(A ∩ B) 소개 → ① n(Aᶜ) = n(U) − n(A) (와! A 밖이 빛나며 15)
//       → ② n(A − B) = n(A) − n(A ∩ B) (와! 겹친 칸이 빠져나가고 7) → ③ n(Aᶜ ∩ Bᶜ) = n(U) − n(A ∪ B) (드모르간, 와! 10) → 24~28 요약
// 예: n(U) = 25, n(A) = 10, n(B) = 8, n(A ∩ B) = 3 (학습지 문제 2 와 다른 숫자 — 답을 미리 보여 주지 않기)
const UX = 410, UY = 280, UW = 1100, UH = 570, AX = 820, BX = 1100, CY = 575, R = 210;
const ACP = `M${UX} ${UY} H${UX + UW} V${UY + UH} H${UX} Z M${AX - R} ${CY} a${R} ${R} 0 1 0 ${2 * R} 0 a${R} ${R} 0 1 0 ${-2 * R} 0`;
function ex(t, t0, t1, base, add, tAdd, y = 178) {
  const op = vis(t, t0, t1); if (op <= 0.002) return '';
  const full = tAdd != null && t >= tAdd, q = full ? pop(t, tAdd) : 0;
  const s = full ? `${M(base)} <tspan fill="${COL.OK}">${M(add)}</tspan>` : M(base);
  return T(960, y, s, { raw: true, size: 70, op, sc: full ? 0.94 + 0.06 * q : 1, glow: 'g1' });
}
const num = (x, y, s, col, t, t0, t1) => { const op = vis(t, t0, t1); if (op <= 0.002) return ''; return T(x, y + 26, s, { size: 76, fill: col, op, sc: pop(t, t0), glow: 'g2' }); };
window.SCENE = {
  D: 28, punch: [8.6, 15.2, 21.6],
  defs() {
    return `<defs><mask id="mNotB"><rect width="1920" height="1080" fill="white"/><circle cx="${BX}" cy="${CY}" r="${R}" fill="black"/></mask>
      <mask id="mOut"><rect width="1920" height="1080" fill="white"/><circle cx="${AX}" cy="${CY}" r="${R}" fill="black"/><circle cx="${BX}" cy="${CY}" r="${R}" fill="black"/></mask>
      <clipPath id="cB"><circle cx="${BX}" cy="${CY}" r="${R}"/></clipPath></defs>`;
  },
  draw(t) {
    let o = '';
    o += kinetic(960, 470, '전체에서 빼면 끝!', t, 0.2, { size: 110, t1: 2.8 });
    o += T(960, 600, '여집합 · 차집합의 원소의 개수', { size: 46, fill: COL.M, op: vis(t, 1.1, 2.8) });
    const vS = vis(t, 3.2, 23.6);
    if (vS > 0.002) {
      let g = `<g opacity="${vS.toFixed(3)}">`;
      // 색칠: ① Aᶜ  ② A − B (겹친 칸은 빠져나감)  ③ 바깥
      const sAc = 0.3 * eo(seg(t, 6.6, 7.2)) * (1 - eo(seg(t, 10.8, 11.2)));
      const sA = 0.3 * eo(seg(t, 11.6, 12.1)) * (1 - eo(seg(t, 17.4, 17.8)));
      const lensOut = seg(t, 13.6, 14.6); // 겹친 칸이 위로 빠져나감
      const sLens = t < 13.0 ? sA : t < 13.6 ? 0.45 : 0.45 * (1 - eo(lensOut));
      const sAuB = 0.26 * eo(seg(t, 18.6, 19.1)) * (1 - eo(seg(t, 20.2, 20.6)));
      const sOut = 0.3 * eo(seg(t, 20.4, 20.9)) * (1 - eo(seg(t, 23.2, 23.6)));
      g += `<path d="${ACP}" fill="${COL.U}" fill-rule="evenodd" opacity="${sAc}"/>`;
      g += `<circle cx="${AX}" cy="${CY}" r="${R}" fill="${COL.A}" opacity="${sA}" mask="url(#mNotB)"/>`;
      g += `<g transform="translate(0 ${-120 * eo(lensOut)})"><circle cx="${AX}" cy="${CY}" r="${R}" fill="${t >= 12.9 ? COL.NG : COL.A}" opacity="${sLens}" clip-path="url(#cB)"/></g>`;
      g += `<circle cx="${AX}" cy="${CY}" r="${R}" fill="${COL.X}" opacity="${sAuB}"/><circle cx="${BX}" cy="${CY}" r="${R}" fill="${COL.X}" opacity="${sAuB}"/>`;
      g += `<rect x="${UX}" y="${UY}" width="${UW}" height="${UH}" rx="22" fill="${COL.U}" opacity="${sOut}" mask="url(#mOut)"/>`;
      g += rectDraw(UX, UY, UW, UH, COL.U, inn(t, 3.3, 0.9));
      g += circ(AX, CY, R, COL.A, inn(t, 3.8, 0.7)) + circ(BX, CY, R, COL.B, inn(t, 4.1, 0.7));
      g += T(UX + UW - 40, UY + 56, 'U', { size: 56, fill: COL.U, op: vis(t, 3.6, null) });
      g += T(AX - 165, CY - 170, 'A', { size: 58, fill: COL.A, op: vis(t, 4.0, null) }) + T(BX + 165, CY - 170, 'B', { size: 58, fill: COL.B, op: vis(t, 4.3, null) });
      // 칸 숫자: 겹친 칸 3 은 처음부터 · 나머지는 와! 순간에
      g += num(960, CY, '3', COL.X, t, 4.9, 13.6);
      g += `<g transform="translate(0 ${-120 * eo(lensOut)})" opacity="${(1 - eo(seg(t, 14.6, 15.0))).toFixed(3)}">${t >= 13.6 ? T(960, CY + 26, '− 3', { size: 76, fill: COL.NG, glow: 'g2' }) : ''}</g>`;
      g += num(960, CY, '3', COL.X, t, 17.6, null);
      g += num(1390, 790, '15', COL.U, t, 8.6, 11.0);
      g += num(700, CY, '7', COL.OK, t, 15.2, null);
      g += num(1240, CY, '5', COL.B, t, 17.8, null);
      g += num(530, 790, '10', COL.OK, t, 21.6, null);
      g += sparkle(1390, 790, t, 8.6, { R: 240 }) + ring(1390, 790, t, 8.6, { col: COL.U }) + sparkle(700, CY, t, 15.2, { R: 220 }) + ring(700, CY, t, 15.2, { col: COL.A, r: 50, R: 200 }) + sparkle(530, 790, t, 21.6, { R: 220 }) + ring(530, 790, t, 21.6, { r: 50, R: 220 });
      // 위 정보 줄 (식이 나올 땐 비켜 줌)
      const info = vis(t, 4.6, 6.0);
      g += T(960, 178, 'n(U) = 25  ·  n(A) = 10  ·  n(B) = 8  ·  n(A ∩ B) = 3', { size: 52, op: info });
      g += ex(t, 6.2, 11.0, 'n(A^C) = n(U) − n(A)', '= 25 − 10 = 15', 8.6);
      g += ex(t, 11.4, 17.3, 'n(A − B) = n(A) − n(A ∩ B)', '= 10 − 3 = 7', 15.2);
      g += ex(t, 17.6, 23.4, 'n(A^C ∩ B^C) = n((A ∪ B)^C)', '= 25 − 15 = 10', 21.6);
      g += T(960, 262, 'n(A ∪ B) = 10 + 8 − 3 = 15', { size: 46, fill: COL.X, op: vis(t, 19.0, 23.4), sc: pop(t, 19.0) });
      o += g + '</g>';
      o += caption(t, 4.8, 6.1, '25명 중 A 10명, B 8명, 둘 다 3명');
      o += caption(t, 6.4, 8.5, 'A 가 아닌 것 = 전체 − A') + caption(t, 8.6, 11.0, 'n(A^C) = 25 − 10 = 15', { fill: COL.OK });
      o += caption(t, 11.6, 13.4, 'A − B 는 A 에서 B 와 겹친 칸을 뺀 것') + caption(t, 13.6, 15.1, '겹친 3 을 빼면?') + caption(t, 15.2, 17.3, 'n(A − B) = 10 − 3 = 7', { fill: COL.OK });
      o += caption(t, 17.8, 18.9, 'A 도 아니고 B 도 아닌 것은?') + caption(t, 19.0, 21.5, '드모르간: A^C ∩ B^C = (A ∪ B)^C  →  전체 − (A ∪ B)') + caption(t, 21.6, 23.4, '25 − 15 = 10', { fill: COL.OK });
    }
    o += card(t, 24.0, '여집합 · 차집합의 원소의 개수', [{ s: 'n(A^C) = n(U) − n(A)' }, { s: 'n(A − B) = n(A) − n(A ∩ B)' }, { s: 'n(A^C ∩ B^C) = n(U) − n(A ∪ B)' }], { lh: 92 });
    o += sparkle(960, 330, t, 24.4, { R: 260 });
    return o;
  },
  over(t) { return wipe(t, 23.6); },
};
