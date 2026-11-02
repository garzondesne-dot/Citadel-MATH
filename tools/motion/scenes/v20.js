// (06차시) 20 명제 — 참 · 거짓을 분명히 판별할 수 있는 문장 (28초)
// 콘티: 0~3 훅 → 3.2 세 상자(참인 명제 · 거짓인 명제 · 명제 아님) → 문장 카드가 날아가 상자로
//       ① 2 + 3 = 5 → 참  ② 9는 짝수이다 → 거짓  (와! 「거짓도 명제!」 두 상자를 묶는 괄호)  ③ 이 노래는 좋은 노래이다 → 명제 아님 (기준이 사람마다)
//       → 정의 · 정리 (명제 중 특별한 것) → 24~28 요약
// 문장은 학습지 문제 4 · 형성평가와 겹치지 않게 골랐다
const BIN = [{ x: 470, label: '참인 명제', col: COL.OK }, { x: 960, label: '거짓인 명제', col: COL.NG }, { x: 1450, label: '명제 아님', col: COL.M }];
const BY = 760, BW = 400, BH = 190;
// 문장 카드: t0 등장 → t1 판정 도장 → t2 상자로 날아감
const SENT = [
  { s: '2 + 3 = 5', bin: 0, t0: 3.9, t1: 5.2, t2: 6.2, why: '분명히 참' },
  { s: '9는 짝수이다.', bin: 1, t0: 6.6, t1: 7.9, t2: 8.9, why: '분명히 거짓' },
  { s: '이 노래는 좋은 노래이다.', bin: 2, t0: 12.4, t1: 13.9, t2: 15.2, why: '사람마다 다름' },
];
function sentCard(t, c) {
  if (t < c.t0) return '';
  const b = BIN[c.bin], fly = eio(seg(t, c.t2, c.t2 + 0.7));
  const x = lerp(960, b.x, fly), y = lerp(380, BY + 30, fly), sc = lerp(1, 0.5, fly) * pop(t, c.t0);
  const w = [...c.s].reduce((a, ch) => a + cw(ch, 64, false), 0) + 110;
  const stamp = t >= c.t1 ? pop(t, c.t1, 0.4) : 0;
  let g = `<g transform="translate(${x} ${y}) scale(${Math.max(0, sc)})"><rect x="${-w / 2}" y="-62" width="${w}" height="124" rx="22" fill="#101736" stroke="${t >= c.t1 ? b.col : '#ffffff'}" stroke-opacity="${t >= c.t1 ? 1 : 0.35}" stroke-width="4" filter="url(#g1)"/>${T(0, 22, c.s, { size: 64 })}`;
  if (stamp > 0 && fly < 0.6) g += `<g transform="translate(${w / 2 - 10} -96) rotate(-8) scale(${stamp})" opacity="${(1 - fly / 0.6).toFixed(3)}"><rect x="-110" y="-34" width="220" height="68" rx="14" fill="${b.col}" fill-opacity="0.18" stroke="${b.col}" stroke-width="3"/>${T(0, 14, c.why, { size: 36, fill: b.col })}</g>`;
  return g + '</g>';
}
window.SCENE = {
  D: 28, punch: [10.0],
  draw(t) {
    let o = '';
    o += kinetic(960, 470, '참? 거짓? 아니면…', t, 0.2, { size: 110, t1: 2.8 });
    o += T(960, 600, '명제', { size: 52, fill: COL.M, op: vis(t, 1.1, 2.8) });
    const vS = vis(t, 3.2, 18.6);
    if (vS > 0.002) {
      let g = `<g opacity="${vS.toFixed(3)}">`;
      BIN.forEach((b, i) => {
        const glow = (i < 2 && t >= 10.0 && t < 12.2);
        g += rectDraw(b.x - BW / 2, BY - BH / 2, BW, BH, b.col, inn(t, 3.3 + i * 0.12, 0.8), { sw: glow ? 8 : 4 });
        g += T(b.x, BY - BH / 2 + 56, b.label, { size: 46, fill: b.col, op: vis(t, 3.5 + i * 0.12, null) });
        const n = SENT.filter((c) => c.bin === i && t >= c.t2 + 0.7).length;
        if (n) g += T(b.x, BY + 60, SENT.find((c) => c.bin === i).s, { size: 34, fill: COL.T, op: 0.85 });
      });
      // 와! 거짓도 명제 — 참 · 거짓 두 상자를 묶는 괄호
      const br = eo(seg(t, 9.8, 10.4)), brOp = vis(t, 9.8, 12.2);
      if (brOp > 0.002) {
        const x1 = BIN[0].x - BW / 2, x2 = BIN[1].x + BW / 2, yb = BY - BH / 2 - 26, L = (x2 - x1) + 60;
        g += `<path d="M${x1} ${yb + 20} V${yb} H${x2} V${yb + 20}" fill="none" stroke="${COL.A}" stroke-width="6" stroke-dasharray="${L}" stroke-dashoffset="${L * (1 - br)}" filter="url(#g2)" opacity="${brOp}"/>`;
        g += T((x1 + x2) / 2, yb - 34, '둘 다 명제!', { size: 58, fill: COL.A, op: brOp, sc: pop(t, 10.0), glow: 'g2' });
      }
      g += sparkle(715, BY, t, 10.0, { R: 380, n: 12 }) + ring(715, BY, t, 10.0, { col: COL.A, r: 120, R: 360 });
      SENT.forEach((c) => { g += sentCard(t, c); });
      // 모호한 말 강조
      g += T(960, 250, '좋다 · 맛있다 · 크다 · 멋지다', { size: 60, fill: COL.B, op: vis(t, 16.0, 18.4), sc: pop(t, 16.0), glow: 'g1' });
      g += T(960, 330, '→ 기준이 사람마다 달라서 판별할 수 없다', { size: 44, fill: COL.M, op: vis(t, 16.5, 18.4) });
      o += g + '</g>';
      o += caption(t, 3.9, 6.4, '참인지 거짓인지 분명하게 정할 수 있나?');
      o += caption(t, 6.6, 9.6, '9는 짝수? 분명히 거짓!') + caption(t, 10.0, 12.2, '거짓인 문장도 명제이다!', { fill: COL.A });
      o += caption(t, 12.5, 15.8, '좋은 노래? 사람마다 생각이 다르다') + caption(t, 16.0, 18.4, '기준이 모호하면 명제가 아니다', { fill: COL.B });
    }
    // 정의 · 정리
    const vD = vis(t, 18.8, 23.6);
    if (vD > 0.002) {
      let g = `<g opacity="${vD.toFixed(3)}">`;
      g += T(960, 190, '명제 중에서 수학의 기초가 되는 두 가지', { size: 54, op: vis(t, 18.9, null) });
      [[530, '정의', '용어의 뜻을 정한 문장', '「두 변의 길이가 같은 삼각형을', '이등변삼각형이라 한다.」', COL.A, 19.4], [1390, '정리', '참임이 증명된 기본 명제', '「삼각형의 세 내각의 합은', '180°이다.」', COL.B, 20.8]].forEach(([x, h, d, e1, e2, col, t0]) => {
        const p = pop(t, t0, 0.55); if (p <= 0.002) return;
        g += `<g transform="translate(${x} 560) scale(${p})"><rect x="-400" y="-230" width="800" height="460" rx="28" fill="#101736" stroke="${col}" stroke-width="4" filter="url(#g1)"/>
          ${T(0, -120, h, { size: 90, fill: col, glow: 'g1' })}${T(0, -20, d, { size: 50 })}${T(0, 90, e1, { size: 40, fill: COL.M })}${T(0, 150, e2, { size: 40, fill: COL.M })}</g>`;
      });
      o += g + '</g>';
      o += caption(t, 19.4, 20.7, '정의 = 이름을 붙이는 약속') + caption(t, 20.8, 23.4, '정리 = 증명된 기본 명제');
    }
    o += card(t, 24.0, '명제', [{ s: '참인지 거짓인지 분명하게 판별할 수 있는 문장' , size: 54 }, { s: '거짓인 문장도 명제이다!', fill: COL.A }, { s: '기준이 모호하면(맛있다 · 크다) 명제가 아니다', size: 50 }, { s: '정의 = 용어의 뜻 · 정리 = 증명된 기본 명제', size: 50 }], { lh: 84, w: 1600 });
    o += sparkle(960, 300, t, 24.4, { R: 260 });
    return o;
  },
  over(t) { return wipe(t, 18.4) + wipe(t, 23.6); },
};
