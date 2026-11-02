// (05차시) 11 교환법칙 · 결합법칙 — 순서를 바꿔도 같다 (26초)
// 콘티: 0~2.8 훅「순서를 바꾸면?」 → 2.8~10.4 교환(벤 다이어그램 A·B 자리 바꾸기, 와! = 같은 결과) → 10.6~21.3 결합(두 길로 계산, 와! = 같은 결과) → 21.7~26 요약 카드
window.SCENE = {
  D: 26, punch: [7.6, 18.2],
  draw(t) {
    let o = '';
    // ── 훅 ──
    o += kinetic(960, 500, '순서를 바꾸면?', t, 0.2, { size: 124, t1: 2.5 });
    o += T(960, 630, '교환법칙 · 결합법칙', { size: 46, fill: COL.M, op: vis(t, 1.0, 2.5) });
    // ── 교환법칙 ──
    const vA = vis(t, 2.8, 10.4);
    if (vA > 0.002) {
      const sw = eio(seg(t, 6.2, 7.4)), arc = Math.sin(Math.PI * sw);
      const ax = lerp(820, 1100, sw), ay = 540 - arc * 70, bx = lerp(1100, 820, sw), by = 540 + arc * 70, r = 240;
      const fillOn = 0.24 * eo(seg(t, 4.6, 5.2));
      let g = `<g opacity="${vA.toFixed(3)}">`;
      g += `<g style="mix-blend-mode:screen">${circ(ax, ay, r, COL.A, inn(t, 3.0, 0.8), { fill: fillOn })}${circ(bx, by, r, COL.B, inn(t, 3.3, 0.8), { fill: fillOn })}</g>`;
      // 교집합(렌즈) 강조: 9.2~
      const lens = 0.45 * eo(seg(t, 9.2, 9.7));
      if (lens > 0) g += `<g clip-path="url(#cA11)"><circle cx="${bx}" cy="${by}" r="${r}" fill="${COL.X}" opacity="${lens}"/></g>`;
      const lo = lerp(-170, 170, sw);
      g += T(ax + lo, 300, 'A', { size: 64, fill: COL.A, op: vis(t, 3.4, null), glow: 'g1' }) + T(bx - lo, 300, 'B', { size: 64, fill: COL.B, op: vis(t, 3.6, null), glow: 'g1' });
      // 원소: 1 은 A 만, 4 는 B 만, 2·3 은 겹친 곳
      g += tok(ax + lerp(-150, 150, sw), ay, '1', COL.A, t, 3.9) + tok(960, 478, '2', COL.X, t, 4.0) + tok(960, 604, '3', COL.X, t, 4.1) + tok(bx + lerp(150, -150, sw), by, '4', COL.B, t, 4.2);
      g += T(150, 175, 'A = {1, 2, 3}', { size: 46, fill: COL.A, anchor: 'start', op: vis(t, 3.6, null) }) + T(1770, 175, 'B = {2, 3, 4}', { size: 46, fill: COL.B, anchor: 'end', op: vis(t, 3.8, null) });
      // 식: A ∪ B → (글자가 자리 바꿈) → B ∪ A → A ∩ B = B ∩ A
      const e1 = vis(t, 4.4, 9.0);
      if (e1 > 0.002) g += T(lerp(870, 1050, sw), 180 - arc * 78, 'A', { size: 80, fill: COL.A, op: e1, glow: 'g1' }) + T(960, 180, '∪', { size: 80, op: e1 * (1 - 0.7 * arc) }) + T(lerp(1050, 870, sw), 180 + arc * 78, 'B', { size: 80, fill: COL.B, op: e1, glow: 'g1' });
      g += T(960, 180, 'A ∩ B = B ∩ A', { size: 76, op: vis(t, 9.2, null) });
      // 결과 상자
      const same = t >= 7.6 ? 1 + 0.12 * Math.sin(Math.PI * seg(t, 7.6, 8.1)) : 1;
      g += box(960, 868, '= {1, 2, 3, 4}', t, 5.2, { op: (t > 6.2 && t < 7.6 ? 0.45 : 1) * (1 - ei(seg(t, 9.0, 9.25))), sc: t >= 5.2 ? pop(t, 5.2) * same : 0, col: t >= 7.6 ? COL.OK : COL.T, glow: t >= 7.6 && t < 9 ? 'g2' : 'g1' });
      g += T(1260, 890, '같다!', { size: 64, fill: COL.OK, anchor: 'start', op: vis(t, 7.6, 9.0), sc: pop(t, 7.6), glow: 'g2' });
      g += box(960, 868, '= {2, 3}', t, 9.3, { col: COL.X });
      g += sparkle(960, 868, t, 7.6) + ring(960, 540, t, 7.6, { r: 120, R: 420 });
      o += g + '</g>';
      o += caption(t, 4.6, 6.1, 'A ∪ B : 두 집합을 합친 것') + caption(t, 6.2, 7.5, '순서를 바꾸면?  B ∪ A') + caption(t, 7.6, 9.1, '결과가 같다! → 교환법칙', { fill: COL.OK }) + caption(t, 9.2, 10.4, 'A ∩ B = B ∩ A 도 마찬가지');
    }
    // ── 결합법칙 ──
    const vB = vis(t, 10.6, 21.3);
    if (vB > 0.002) {
      let g = `<g opacity="${vB.toFixed(3)}" transform="translate(0 55)">`;
      const cA = [420, 210], cB = [960, 210], cC = [1500, 210];
      const pl = (ts) => 1 + 0.14 * Math.sin(Math.PI * seg(t, ts, ts + 0.6));
      const hA = pl(12.2) * pl(16.6), hB = pl(12.2) * pl(15.2), hC = pl(13.8) * pl(15.2);
      g += box(cA[0], cA[1], 'A = {1, 2, 3}', t, 10.9, { col: COL.A, size: 48, sc: t >= 10.9 ? pop(t, 10.9) * hA : 0, glow: hA > 1.02 ? 'g2' : 'g1' }) + box(cB[0], cB[1], 'B = {2, 3, 4}', t, 11.05, { col: COL.B, size: 48, sc: t >= 11.05 ? pop(t, 11.05) * hB : 0, glow: hB > 1.02 ? 'g2' : 'g1' }) + box(cC[0], cC[1], 'C = {3, 4, 5}', t, 11.2, { col: COL.C, size: 48, sc: t >= 11.2 ? pop(t, 11.2) * hC : 0, glow: hC > 1.02 ? 'g2' : 'g1' });
      g += T(560, 385, '(A ∪ B) ∪ C', { size: 60, op: vis(t, 11.6, null), glow: 'g1' }) + T(1360, 385, 'A ∪ (B ∪ C)', { size: 60, op: vis(t, 11.6, null), glow: 'g1' });
      // 왼쪽 길
      g += arrow(500, 420, 520, 485, COL.A, inn(t, 12.2, 0.5)) + arrow(620, 420, 600, 485, COL.B, inn(t, 12.3, 0.5));
      g += box(560, 530, 'A ∪ B = {1, 2, 3, 4}', t, 12.8, { size: 44, col: COL.T });
      g += arrow(560, 572, 560, 672, COL.T, inn(t, 13.8, 0.5)) + T(590, 635, '∪ C', { size: 46, fill: COL.C, anchor: 'start', op: vis(t, 13.9, null), glow: 'g1' });
      // 오른쪽 길
      g += arrow(1430, 420, 1410, 485, COL.B, inn(t, 15.2, 0.5)) + arrow(1540, 420, 1490, 485, COL.C, inn(t, 15.3, 0.5));
      g += box(1360, 530, 'B ∪ C = {2, 3, 4, 5}', t, 15.8, { size: 44, col: COL.T });
      g += arrow(1360, 572, 1360, 672, COL.T, inn(t, 16.6, 0.5)) + T(1330, 635, 'A ∪', { size: 46, fill: COL.A, anchor: 'end', op: vis(t, 16.7, null), glow: 'g1' });
      const win = t >= 18.2 ? 1 + 0.12 * Math.sin(Math.PI * seg(t, 18.2, 18.7)) : 1;
      g += box(560, 730, '{1, 2, 3, 4, 5}', t, 14.4, { size: 56, col: t >= 18.2 ? COL.OK : COL.T, sc: t >= 14.4 ? pop(t, 14.4) * win : 0, glow: t >= 18.2 ? 'g2' : 'g1' });
      g += box(1360, 730, '{1, 2, 3, 4, 5}', t, 17.2, { size: 56, col: t >= 18.2 ? COL.OK : COL.T, sc: t >= 17.2 ? pop(t, 17.2) * win : 0, glow: t >= 18.2 ? 'g2' : 'g1' });
      g += T(960, 752, '=', { size: 110, fill: COL.OK, op: vis(t, 18.2, null), sc: pop(t, 18.2), glow: 'g2' });
      g += sparkle(960, 730, t, 18.2, { R: 300, n: 12 }) + ring(960, 730, t, 18.2, { r: 80, R: 380 });
      o += g + '</g>';
      o += caption(t, 11.6, 13.7, '(A ∪ B) 를 먼저 계산하면?') + caption(t, 13.8, 14.9, '그다음 C 를 합친다') + caption(t, 15.0, 18.0, '이번엔 (B ∪ C) 를 먼저!') + caption(t, 18.2, 19.8, '어느 것부터 계산해도 같다 → 결합법칙', { fill: COL.OK }) + caption(t, 19.9, 21.3, '그래서 괄호 없이 A ∪ B ∪ C 로 써도 된다');
    }
    // ── 요약 카드 ──
    o += card(t, 21.7, '핵심 정리', [{ s: '교환법칙   A ∪ B = B ∪ A' }, { s: '결합법칙   (A ∪ B) ∪ C = A ∪ (B ∪ C)' }, { s: '∩ 도 똑같이 성립해요', size: 42, fill: COL.M }]);
    o += sparkle(960, 330, t, 22.1, { R: 260 });
    return o;
  },
  defs(t) { // 교집합 렌즈용: 지금 A 원 위치로 자르기
    const sw = eio(seg(t, 6.2, 7.4)), arc = Math.sin(Math.PI * sw);
    return `<defs><clipPath id="cA11"><circle cx="${lerp(820, 1100, sw)}" cy="${540 - arc * 70}" r="240"/></clipPath></defs>`;
  },
  over(t) { return wipe(t, 10.4) + wipe(t, 21.3); },
};
