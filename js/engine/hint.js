// 💡 그림 힌트 (2026-11-04 · v0.9.7.4 · 사용자 확정): 집합 문제에 문제 데이터로 벤 다이어그램을 그때그때 그려 학생 폰에서 힌트로 보여 준다
//   ① 원소형 (check.sets · check.U): 원 2개(A · B) 또는 3개(A · B · C)에 원소를 제자리에 — 답 영역은 칠하지 않는다
//   ② 개수형 (check.n · {T, x, y, both} · {u, nAB, nOut}): 주어진 수만 (겹친 칸부터) · 나머지 칸은 「?」
//   ③ 사각형 명제 (check.quad): 사각형 가족 포함 그림 (참 · 거짓은 표시 안 함)
//   형성평가(보스) · 종합상황실에는 쓰지 않는다 (부르는 쪽에서 막음). 재도전으로 숫자가 바뀌면 그림도 같이 바뀐다
window.DS = window.DS || {};

DS.Hint = (function () {
  const C = { a: '#3d63f5', b: '#ff8a1f', c: '#8b5cf6', ink: '#26201a', sub: '#8c7661' };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${o.size || 13}" fill="${o.color || C.ink}"${o.bold ? ' font-weight="700"' : ''}${o.it ? ' font-style="italic"' : ''}>${esc(s)}</text>`;
  const circ = (cx, cy, r, color) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" fill-opacity=".07" stroke="${color}" stroke-width="2"/>`;
  // 한 칸에 숫자 여러 개: 칸 가운데를 중심으로 줄 맞춤
  const pack = (cx, cy, nums, w = 22, per = 3) => nums.map((n, i) => { const row = Math.floor(i / per), col = i % per, inRow = Math.min(per, nums.length - row * per); return T(cx + (col - (inRow - 1) / 2) * w, cy + row * 17 - ((Math.ceil(nums.length / per) - 1) * 17) / 2 + 5, n, { size: 14 }); }).join('');

  // 원소 → 칸 (A만 'A' · 겹침 'AB' · 셋 다 'ABC' · 바깥 '') — 시험에서도 씀
  function groupsOf(sets, U) {
    const names = ['A', 'B', 'C'].filter((k) => Array.isArray(sets[k]));
    const all = [...new Set([...(U || []), ...names.flatMap((k) => sets[k])])].sort((a, b) => a - b);
    const key = (x) => names.map((k) => (sets[k].includes(x) ? k : '')).join('');
    const g = {}; all.forEach((x) => { (g[key(x)] = g[key(x)] || []).push(x); });
    return g;
  }
  // ① 원소형
  function elems(sets, U) {
    const names = ['A', 'B', 'C'].filter((k) => Array.isArray(sets[k]));
    if (!names.length || (names.length === 1 && !U)) return null;
    const groups = groupsOf(sets, U);
    if (names.length === 1) { // 여집합: U 네모 + 원 하나 (안 · 바깥)
      const n = names[0], col = { A: C.a, B: C.b, C: C.c }[n];
      return `<svg viewBox="0 0 320 170" class="hint-svg"><rect x="6" y="8" width="308" height="156" rx="8" fill="none" stroke="${C.ink}" stroke-width="1.5"/>${T(296, 28, 'U', { it: true, bold: true })}
        ${circ(120, 86, 62, col)}${T(70, 30, n, { it: true, bold: true, color: col, size: 15 })}${groups[n] ? pack(120, 86, groups[n], 22, 3) : ''}${groups[''] ? pack(250, 86, groups[''], 22, 3) : ''}</svg>`;
    }
    if (names.length === 2) {
      // 원 A(120,92) · B(200,92) r 62 · 칸: A만 · 겹침 · B만 · 바깥
      const at = { A: [88, 92], AB: [160, 92], B: [232, 92], '': [160, 172] };
      return `<svg viewBox="0 0 320 190" class="hint-svg">${U ? `<rect x="6" y="8" width="308" height="176" rx="8" fill="none" stroke="${C.ink}" stroke-width="1.5"/>${T(296, 28, 'U', { it: true, bold: true })}` : ''}
        ${circ(120, 92, 62, C.a)}${circ(200, 92, 62, C.b)}${T(70, 30, 'A', { it: true, bold: true, color: C.a, size: 15 })}${T(250, 30, 'B', { it: true, bold: true, color: C.b, size: 15 })}
        ${Object.entries(at).map(([k, [x, y]]) => (groups[k] ? pack(x, y, groups[k], k === '' ? 24 : 18, k === '' ? 8 : 2) : '')).join('')}</svg>`;
    }
    // 원 3개: A(130,85) · B(190,85) · C(160,138) r 52
    const at = { A: [104, 70], B: [216, 70], C: [160, 168], AB: [160, 58], AC: [124, 122], BC: [196, 122], ABC: [160, 100], '': [160, 214] };
    return `<svg viewBox="0 0 320 232" class="hint-svg">${U ? `<rect x="6" y="8" width="308" height="220" rx="8" fill="none" stroke="${C.ink}" stroke-width="1.5"/>${T(296, 28, 'U', { it: true, bold: true })}` : ''}
      ${circ(130, 85, 52, C.a)}${circ(190, 85, 52, C.b)}${circ(160, 138, 52, C.c)}
      ${T(76, 40, 'A', { it: true, bold: true, color: C.a, size: 15 })}${T(244, 40, 'B', { it: true, bold: true, color: C.b, size: 15 })}${T(100, 190, 'C', { it: true, bold: true, color: C.c, size: 15 })}
      ${Object.entries(at).map(([k, [x, y]]) => (groups[k] ? pack(x, y, groups[k], 17, k === '' ? 8 : 2) : '')).join('')}</svg>`;
  }
  // ② 개수형: 겹친 칸 · 바깥 · 원 옆 n(A) · n(B) · 네모 n(U) 만, 나머지 칸 「?」
  function counts({ U, A, B, AB, out }, label = {}) {
    const q = (v) => (v == null ? '?' : String(v));
    return `<svg viewBox="0 0 320 196" class="hint-svg"><rect x="6" y="8" width="308" height="182" rx="8" fill="none" stroke="${C.ink}" stroke-width="1.5"/>${T(250, 182, U != null ? `${label.U || 'n(U)'} = ${U}` : 'U', { it: true, bold: true })}
      ${circ(120, 98, 62, C.a)}${circ(200, 98, 62, C.b)}
      ${T(84, 30, A != null ? `${label.A || 'n(A)'} = ${A}` : (label.A || 'A'), { bold: true, color: C.a })}${T(236, 30, B != null ? `${label.B || 'n(B)'} = ${B}` : (label.B || 'B'), { bold: true, color: C.b })}
      ${T(88, 104, '?', { size: 18, color: C.sub })}${T(160, 104, q(AB), { size: 20, bold: true })}${T(232, 104, '?', { size: 18, color: C.sub })}${T(70, 182, out != null ? `바깥 ${out}` : '바깥 ?', { size: 14, color: out != null ? C.ink : C.sub })}
      ${T(160, 70, '① 겹친 칸부터', { size: 11, color: C.sub })}</svg>`;
  }
  // ③ 사각형 가족 포함 그림 (학습지 6차시 STEP 6 과 같은 모양)
  const QUAD = `<svg viewBox="0 0 220 128" class="hint-svg"><rect x="3" y="3" width="214" height="122" rx="10" fill="#f7f7f7" stroke="${C.ink}" stroke-width="1.2"/>${T(40, 18, '사다리꼴', { size: 10.5, bold: true })}
    <rect x="18" y="24" width="184" height="96" rx="10" fill="#eef3ff" stroke="${C.a}" stroke-width="1.2"/>${T(58, 38, '평행사변형', { size: 10.5, bold: true, color: C.a })}
    <ellipse cx="82" cy="76" rx="50" ry="34" fill="#fff4d6" fill-opacity=".85" stroke="#b07a0a" stroke-width="1.2"/>${T(62, 72, '직사각형', { size: 10, bold: true, color: '#8a5a00' })}
    <ellipse cx="138" cy="76" rx="50" ry="34" fill="#ffe3ef" fill-opacity=".7" stroke="#c0396b" stroke-width="1.2"/>${T(166, 72, '마름모', { size: 10, bold: true, color: '#a02a58' })}
    ${T(110, 80, '정사각형', { size: 9.5, bold: true })}</svg>`;

  // 문제 하나 → 힌트 그림 (없으면 null)
  function svg(q) {
    const k = (q && q.check) || {};
    if (k.quad) return QUAD;
    if (k.sets && typeof k.sets === 'object') return elems(k.sets, k.U || (k.sets.U || null));
    if (k.n && k.n.U != null && k.n.A != null) return counts({ U: k.n.U, A: k.n.A, B: k.n.B, AB: k.n.AB });
    if (k.T != null && k.x != null && k.both != null) { const m = /(\S+) 동아리 \d+명, (\S+) 동아리/.exec(q.question || '') || []; return counts({ U: k.T, A: k.x, B: k.y, AB: k.both }, { U: '전체', A: m[1] || '첫째', B: m[2] || '둘째' }); }
    if (k.u != null && k.nAB != null && k.nOut != null) return counts({ U: k.u, AB: k.nAB, out: k.nOut }, { U: 'n(U)', A: 'A', B: 'B' });
    return null;
  }
  // 버튼 + 접힌 그림 (open = 펼친 상태)
  const html = (q, key, open) => { const s = svg(q); return s ? `<div class="hint-wrap${open ? ' open' : ''}"><button type="button" class="btn small hint-btn" data-hint="${esc(key)}">💡 그림 힌트${open ? ' 접기' : ''}</button>${open ? `<div class="hint-fig">${s}</div>` : ''}</div>` : ''; };
  return { svg, html, groupsOf };
})();
