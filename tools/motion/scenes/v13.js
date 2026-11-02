// (05차시) 13 간단히 하기 — 포함 관계로 짧게 (25초)
// 콘티: 0~3 훅「(A ∪ B) ∩ A = ?」 → 3.2~11.6 (A ∪ B) ∩ A: 합친 부분 중 A 만 남김, 와! = 식이 줄어들어 A 하나
//       → 11.8~20.2 (A ∩ B) ∪ A: 겹친 부분에 A 를 합침, 와! = 다시 A 하나 → 20.5~25 요약 카드
const AX = 820, BX = 1100, CY = 590, RR = 230;
// 식 모핑: 마지막 A 만 남고 나머지 글자는 그 자리로 빨려 들어가며 사라진다
function morph(s, y, t, tm, size = 80) {
  const ch = [...s], it = (c) => /[ABCUxn]/.test(c), ws = ch.map((c) => cw(c, size, it(c))), tot = ws.reduce((a, b) => a + b, 0);
  let x = 960 - tot / 2; const xs = ws.map((w) => { const c = x + w / 2; x += w; return c; });
  const last = ch.length - 1, p = eio(seg(t, tm, tm + 0.8)); let out = '';
  ch.forEach((c, i) => {
    if (c === ' ') return;
    if (i === last) { out += T(lerp(xs[i], 960, p), y, c, { size, fill: p > 0.05 ? COL.A : COL.T, sc: 1 + 0.5 * p, glow: p > 0.5 ? 'g2' : 'g1' }); return; }
    out += T(lerp(xs[i], xs[last], p * 0.7), y, c, { size, fill: /[A]/.test(c) ? COL.A : /B/.test(c) ? COL.B : COL.T, op: 1 - p, sc: 1 - 0.4 * p });
  });
  return out;
}
window.SCENE = {
  D: 25, punch: [8.4, 16.2],
  defs(t) {
    const g = RR * eo(seg(t, 14.6, 15.4));
    return `<defs><clipPath id="cA13"><circle cx="${AX}" cy="${CY}" r="${RR}"/></clipPath><clipPath id="grow13"><circle cx="${AX}" cy="${CY}" r="${g}"/></clipPath></defs>`;
  },
  draw(t) {
    let o = '';
    o += kinetic(960, 480, '(A ∪ B) ∩ A = ?', t, 0.2, { size: 116, t1: 2.8 });
    o += T(960, 610, '긴 식, 짧게 만들 수 있을까?', { size: 46, fill: COL.M, op: vis(t, 1.2, 2.8) });
    const vS = vis(t, 3.2, 20.2);
    if (vS > 0.002) {
      let g = `<g opacity="${vS.toFixed(3)}">`;
      // ① (A ∪ B) ∩ A
      const u = 0.3 * eo(seg(t, 4.8, 5.4)), out1 = eo(seg(t, 6.8, 7.5)), toA = eo(seg(t, 7.0, 7.7)), clr1 = 1 - eo(seg(t, 11.4, 11.9));
      g += `<g opacity="${u * (1 - out1) * clr1}"><circle cx="${AX}" cy="${CY}" r="${RR}" fill="#dfe5ff"/><circle cx="${BX}" cy="${CY}" r="${RR}" fill="#dfe5ff"/></g>`;
      g += `<g opacity="${u * out1 * clr1}" clip-path="url(#cA13)"><circle cx="${AX}" cy="${CY}" r="${RR}" fill="#dfe5ff" opacity="${1 - toA}"/><circle cx="${AX}" cy="${CY}" r="${RR}" fill="${COL.A}" opacity="${toA}"/></g>`;
      // ② (A ∩ B) ∪ A
      const lens = 0.5 * eo(seg(t, 12.6, 13.2)), grow = eo(seg(t, 14.6, 15.4));
      g += `<g clip-path="url(#cA13)"><circle cx="${BX}" cy="${CY}" r="${RR}" fill="${COL.X}" opacity="${lens * (1 - grow)}"/></g>`;
      g += `<g clip-path="url(#grow13)"><circle cx="${AX}" cy="${CY}" r="${RR}" fill="${COL.A}" opacity="${0.3 * (t >= 14.6 ? 1 : 0)}"/></g>`;
      const pulseA = (t >= 6.6 && t < 7.4) || (t >= 14.6 && t < 15.4) ? 'g2' : 'g1';
      g += circ(AX, CY, RR, COL.A, inn(t, 3.6, 0.8), { glow: pulseA, sw: pulseA === 'g2' ? 8 : 5 }) + circ(BX, CY, RR, COL.B, inn(t, 3.8, 0.8));
      g += T(AX - 190, CY - 200, 'A', { size: 64, fill: COL.A, op: vis(t, 4.0, null), glow: 'g1' }) + T(BX + 190, CY - 200, 'B', { size: 64, fill: COL.B, op: vis(t, 4.1, null), glow: 'g1' });
      // 식
      g += `<g opacity="${vis(t, 3.4, 11.4)}">${morph('(A ∪ B) ∩ A', 180, t, 8.4)}</g>`;
      g += `<g opacity="${vis(t, 12.0, null)}">${morph('(A ∩ B) ∪ A', 180, t, 16.2)}</g>`;
      g += sparkle(AX, CY, t, 8.4, { R: 300, n: 12 }) + ring(AX, CY, t, 8.4, { r: 200, R: 260, col: COL.A }) + sparkle(AX, CY, t, 16.2, { R: 300, n: 12 }) + ring(AX, CY, t, 16.2, { r: 200, R: 260, col: COL.A });
      o += g + '</g>';
      o += caption(t, 4.8, 6.5, 'A ∪ B : 두 집합을 합친 부분') + caption(t, 6.6, 8.3, '그중 A 와 겹치는 부분만 남기면?') + caption(t, 8.4, 9.9, '(A ∪ B) ∩ A = A !', { fill: COL.OK, size: 52 }) + caption(t, 10.0, 11.5, '왜? A ⊂ A ∪ B  (A 는 A ∪ B 안에 쏙)');
      o += caption(t, 12.6, 14.5, 'A ∩ B : 겹친 부분 (A 안에 들어 있다)') + caption(t, 14.6, 16.1, '여기에 A 를 합치면?') + caption(t, 16.2, 17.8, '(A ∩ B) ∪ A = A !', { fill: COL.OK, size: 52 }) + caption(t, 17.9, 20.2, '왜? A ∩ B ⊂ A  (겹친 부분은 A 안에)');
    }
    o += card(t, 20.5, '포함 관계로 짧게!', [{ s: '(A ∪ B) ∩ A = A' }, { s: '(A ∩ B) ∪ A = A' }, { s: '작은 집합이 큰 집합 안에 쏙 들어가면 식이 짧아진다', size: 40, fill: COL.M }]);
    o += sparkle(960, 330, t, 20.9, { R: 260 });
    return o;
  },
  over(t) { return wipe(t, 20.2); },
};
