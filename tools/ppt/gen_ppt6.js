// 6차시 개념 PPT (2026-11-04 · 사용자 요청): 모션그래픽 「UI 데모」 스타일을 슬라이드로 — 웜그레이 바탕 · 알약 ↔ 흰 카드 · 의미 색 · K.C.W
//   슬라이드를 넘길 때 PowerPoint 「모핑」 전환(같은 이름 「!!…」 도형이 부드럽게 변함, 2019 · 365) · 없는 버전은 페이드
//   개념 6개: 드모르간 · 원소의 개수 · 생활 속 문제 · 명제 · 명제의 부정 · 사각형과 명제 — 숫자는 학습지와 다르게
//   색칠 영역은 SVG 마스크로 정확히 그린 PNG(슬라이드 전체 크기 · 투명) → 선 · 글자는 PowerPoint 도형(고칠 수 있음)
//   사용: NODE_PATH=<pptxgenjs · sharp · jszip 설치 폴더>/node_modules node tools/ppt/gen_ppt6.js <출력.pptx>
const pptxgen = require('pptxgenjs'), sharp = require('sharp'), JSZip = require('jszip'), fs = require('fs');
const OUT = process.argv[2] || '(06차시) 개념PPT_v1.pptx';
const W = 13.333, H = 7.5;
const P = { bg: 'EBE9E5', ink: '111111', sub: '6B7488', card: 'FFFFFF', chip: 'F3F1ED', chipLine: 'D9D5CE', a: '3D63F5', b: 'FF8A1F', c: '8B5CF6', hit: 'E8457C', ok: '16A874', no: 'EF4444' };
const KO = 'Malgun Gothic', MATH = 'Times New Roman';

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = '6차시 개념 · 드모르간의 법칙 · 명제'; pres.author = '김찬우';
pres.theme = { headFontFace: KO, bodyFontFace: KO };
pres.defineSlideMaster({ title: 'CANVAS', background: { color: P.bg },
  objects: [{ text: { text: 'K.C.W', options: { x: 5.67, y: 7.08, w: 2, h: 0.3, align: 'center', fontSize: 9, color: 'A8A49C', charSpacing: 3, fontFace: 'Arial', isTextBox: true } } }] });

// ── 공통 조각 ──────────────────────────────────────────
const CARD = { x: 0.9, y: 0.6, w: 11.53, h: 6.25 };
function pill(s, label) { // 개념 이름 알약 (검정) — 카드와 같은 이름이라 모핑으로 서로 바뀜
  const w = Math.max(3.2, label.length * 0.42 + 1.4);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: (W - w) / 2, y: 3.27, w, h: 0.96, rectRadius: 0.48, fill: { color: P.ink }, line: { color: P.ink, width: 0 }, objectName: '!!shape' });
  s.addText(label, { x: (W - w) / 2, y: 3.27, w, h: 0.96, align: 'center', valign: 'middle', fontSize: 28, bold: true, color: 'FFFFFF', margin: 0, isTextBox: true, objectName: '!!pilltext' });
}
function card(s) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { ...CARD, rectRadius: 0.28, fill: { color: P.card }, line: { color: 'DDD9D2', width: 0.75 }, shadow: { type: 'outer', color: '000000', opacity: 0.12, blur: 10, offset: 3, angle: 90 }, objectName: '!!shape' });
}
// 칩: 식 한 줄 (runs = [[글, {color, italic, bold}]])
function chip(s, runs, y = 5.75, w = 8.2) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: (W - w) / 2, y, w, h: 0.66, rectRadius: 0.33, fill: { color: P.chip }, line: { color: P.chipLine, width: 1 }, objectName: '!!chip' });
  s.addText(runs.map(([t, o = {}]) => ({ text: t, options: { color: o.color || P.ink, italic: !!o.it, bold: o.bold !== false, fontFace: o.it ? MATH : KO, fontSize: o.size || 20 } })), { x: (W - w) / 2, y, w, h: 0.66, align: 'center', valign: 'middle', margin: 0, isTextBox: true, objectName: '!!chiptext' });
}
const top = (s, t, color = P.sub) => s.addText(t, { x: 1.4, y: 0.85, w: W - 2.8, h: 0.5, align: 'center', fontSize: 20, bold: true, color, margin: 0, isTextBox: true, objectName: '!!top' });
const tag = (s, t) => s.addText(t, { x: 1.15, y: 0.78, w: 3, h: 0.3, fontSize: 11, color: 'A8A49C', margin: 0, isTextBox: true, objectName: '!!tag' });
const M = (t, color) => [t, { it: true, color }];  // 수식 글자 (이탤릭)
const K = (t, color, o = {}) => [t, { color, ...o }];

// ── 벤 다이어그램 (인치 좌표) · 색칠 PNG ─────────────────
const URECT = { x: 3.55, y: 1.55, w: 6.25, h: 3.75 };
const CA = { cx: 5.95, cy: 3.42, r: 1.45 }, CB = { cx: 7.45, cy: 3.42, r: 1.45 };
const toSvg = (d) => (d.r != null ? `<circle cx="${d.cx * 100}" cy="${d.cy * 100}" r="${d.r * 100}"` : d.rx != null ? `<ellipse cx="${d.cx * 100}" cy="${d.cy * 100}" rx="${d.rx * 100}" ry="${d.ry * 100}"` : `<rect x="${d.x * 100}" y="${d.y * 100}" width="${d.w * 100}" height="${d.h * 100}" rx="${(d.rr || 0) * 100}"`);
// 영역 = (or 합) − (not 합) ∩ (and 모두) · 여러 영역을 한 장에
async function fillPng(regions) {
  let defs = '', body = '';
  regions.forEach(({ or = [], not = [], and = [], color, op = 0.55 }, i) => {
    defs += `<mask id="m${i}" maskUnits="userSpaceOnUse" x="0" y="0" width="1333" height="750">${or.map((d) => `${toSvg(d)} fill="#fff"/>`).join('')}${not.map((d) => `${toSvg(d)} fill="#000"/>`).join('')}</mask>`;
    and.forEach((d, k) => { defs += `<clipPath id="c${i}_${k}">${toSvg(d)}/></clipPath>`; });
    let el = `<rect x="0" y="0" width="1333" height="750" fill="#${color}" fill-opacity="${op}" mask="url(#m${i})"/>`;
    and.forEach((d, k) => { el = `<g clip-path="url(#c${i}_${k})">${el}</g>`; });
    body += el;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1333" height="750" viewBox="0 0 1333 750"><defs>${defs}</defs>${body}</svg>`;
  return 'image/png;base64,' + (await sharp(Buffer.from(svg), { density: 144 }).png().toBuffer()).toString('base64');
}
async function fill(s, regions) { if (regions && regions.length) s.addImage({ data: await fillPng(regions), x: 0, y: 0, w: W, h: H, objectName: '!!fill' }); }
const oval = (s, d, color, name, wpt = 2) => s.addShape(pres.shapes.OVAL, { x: d.cx - (d.r ?? d.rx), y: d.cy - (d.r ?? d.ry), w: 2 * (d.r ?? d.rx), h: 2 * (d.r ?? d.ry), fill: { type: 'none' }, line: { color, width: wpt }, objectName: name });
const box = (s, d, color, name, wpt = 1.5, rr = 0.12) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: d.x, y: d.y, w: d.w, h: d.h, rectRadius: rr, fill: { type: 'none' }, line: { color, width: wpt }, objectName: name });
const txt = (s, x, y, t, o = {}) => s.addText(t, { x: x - (o.w || 0.9) / 2, y: y - 0.22, w: o.w || 0.9, h: 0.44, align: 'center', valign: 'middle', fontSize: o.size || 22, bold: o.bold !== false, italic: !!o.it, fontFace: o.it ? MATH : KO, color: o.color || P.ink, margin: 0, isTextBox: true, objectName: o.name });
function venn(s, { U = true, la = 'A', lb = 'B', italic = true, bare = false } = {}) {
  if (U) { box(s, URECT, P.ink, '!!U'); if (!bare) txt(s, URECT.x + URECT.w - 0.3, URECT.y + 0.3, 'U', { it: true, size: 22, name: '!!Ulab' }); }
  oval(s, CA, P.a, '!!A'); oval(s, CB, P.b, '!!B');
  if (bare) return;
  txt(s, CA.cx - 1.2, CA.cy - 1.5, la, { it: italic, color: P.a, size: italic ? 26 : 18, w: 1.6, name: '!!Alab' });
  txt(s, CB.cx + 1.2, CB.cy - 1.5, lb, { it: italic, color: P.b, size: italic ? 26 : 18, w: 1.6, name: '!!Blab' });
}
const POS = { A: [[5.15, 3.12], [5.15, 3.72], [5.55, 3.42]], AB: [[6.7, 3.12], [6.7, 3.72]], B: [[8.25, 3.12], [8.25, 3.72]], out: [[4.05, 2.05], [4.05, 4.85], [9.35, 4.85], [9.35, 2.4]] };
function elems(s, groups, hot = []) { // groups: { A: [..], AB: [..], B: [..], out: [..] } — 같은 원소 = 같은 이름(모핑)
  Object.entries(groups).forEach(([k, arr]) => arr.forEach((n, i) => { const [x, y] = POS[k][i]; txt(s, x, y, String(n), { it: false, size: 24, color: hot.includes(n) ? P.hit : P.ink, name: `!!e${n}` }); }));
}
const notes = (s, t) => s.addNotes(t);
const slide = (sec) => pres.addSlide({ masterName: 'CANVAS', sectionTitle: sec });

(async () => {
  // ── 표지 ─────────────────────────────────────────────
  pres.addSection({ title: '표지' });
  let s = slide('표지');
  s.addText('6차시', { x: 0, y: 1.5, w: W, h: 0.6, align: 'center', fontSize: 22, bold: true, color: P.sub, isTextBox: true });
  s.addText('드모르간의 법칙 · 명제', { x: 0, y: 2.1, w: W, h: 1.0, align: 'center', fontSize: 44, bold: true, color: P.ink, isTextBox: true });
  const names = ['드모르간의 법칙', '원소의 개수', '생활 속 문제', '명제', '명제의 부정', '사각형과 명제'];
  names.forEach((n, i) => { const x = 1.05 + (i % 3) * 3.8, y = 3.75 + Math.floor(i / 3) * 1.15; s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 3.45, h: 0.8, rectRadius: 0.4, fill: { color: i === 0 ? P.ink : 'FFFFFF' }, line: { color: P.ink, width: 1 }, objectName: i === 0 ? '!!shape' : undefined });
    s.addText(`${i + 1}. ${n}`, { x, y, w: 3.45, h: 0.8, align: 'center', valign: 'middle', fontSize: 18, bold: true, color: i === 0 ? 'FFFFFF' : P.ink, margin: 0, isTextBox: true }); });
  notes(s, '6차시 개념 6개. 슬라이드를 넘길 때마다 알약 → 카드로 바뀌며 한 단계씩 진행됩니다 (모핑 전환).');

  // ── 1. 드모르간 ──────────────────────────────────────
  pres.addSection({ title: '1 드모르간의 법칙' });
  const G1 = { A: [1, 2], AB: [3, 4], B: [5, 6], out: [7, 8] };
  s = slide('1 드모르간의 법칙'); pill(s, '드모르간의 법칙'); notes(s, '개념 1. 지난 시간 Aᶜ · A − B 를 말로 복습하고 시작.');
  s = slide('1 드모르간의 법칙'); card(s); tag(s, '개념 1'); venn(s); elems(s, G1); chip(s, [M('(A ∪ B)'), M('ᶜ'), K(' = ?')]);
  notes(s, 'U = {1, …, 8}, A = {1, 2, 3, 4}, B = {3, 4, 5, 6}. A ∪ B 의 바깥은?');
  s = slide('1 드모르간의 법칙'); card(s); tag(s, '개념 1'); await fill(s, [{ or: [URECT], not: [CA, CB], color: P.hit, op: 0.35 }]); venn(s); elems(s, G1, [7, 8]);
  top(s, 'A 에도 B 에도 없는 원소'); chip(s, [M('(A ∪ B)'), M('ᶜ'), K(' = '), M('{7, 8}', P.hit)]);
  notes(s, '(A ∪ B)ᶜ = A ∪ B 의 바깥 = {7, 8}');
  s = slide('1 드모르간의 법칙'); card(s); tag(s, '개념 1'); await fill(s, [{ or: [URECT], not: [CA, CB], color: P.hit, op: 0.35 }]); venn(s); elems(s, G1, [7, 8]);
  top(s, 'A 밖이면서 B 밖 = 같은 곳!'); chip(s, [M('A'), M('ᶜ'), K(' ∩ '), M('B'), M('ᶜ'), K(' = '), M('{5, 6, 7, 8}', P.a), K(' ∩ '), M('{1, 2, 7, 8}', P.b), K(' = '), M('{7, 8}', P.hit)], 5.75, 10.2);
  notes(s, 'Aᶜ = {5, 6, 7, 8}, Bᶜ = {1, 2, 7, 8} → 둘 다 있는 것 = {7, 8} → (A ∪ B)ᶜ 와 같다');
  s = slide('1 드모르간의 법칙'); card(s); tag(s, '개념 1'); await fill(s, [{ or: [URECT], not: [CA, CB], color: P.hit, op: 0.35 }]); venn(s); elems(s, G1, [7, 8]);
  top(s, '괄호를 풀면 ᶜ 이 각각 붙고, ∪ ↔ ∩ 이 바뀐다', P.ink);
  chip(s, [M('(A ∪ B)'), M('ᶜ'), K('  =  ', P.ok), M('A'), M('ᶜ'), K(' ∩ '), M('B'), M('ᶜ'), K('      '), M('(A ∩ B)'), M('ᶜ'), K('  =  ', P.ok), M('A'), M('ᶜ'), K(' ∪ '), M('B'), M('ᶜ')], 5.75, 10.2);
  notes(s, '드모르간의 법칙 두 줄. 괄호를 풀 때 ᶜ 이 각각 붙고 ∪ ↔ ∩ 이 바뀐다.');

  // ── 2. 원소의 개수 ────────────────────────────────────
  pres.addSection({ title: '2 원소의 개수' });
  s = slide('2 원소의 개수'); pill(s, '원소의 개수'); notes(s, '개념 2. 여집합 · 차집합의 원소의 개수 — 전체(또는 A)에서 빼기.');
  const cnt = (s, hl) => { txt(s, URECT.x + URECT.w - 1.0, URECT.y + URECT.h - 0.32, 'n(U) = 20', { it: true, size: 20, w: 1.8, name: '!!nU' }); txt(s, CA.cx - 1.05, URECT.y + 0.3, 'n(A) = 8', { it: true, color: P.a, size: 20, w: 1.8, name: '!!nA' }); txt(s, CB.cx + 1.05, URECT.y + 0.3, 'n(B) = 6', { it: true, color: P.b, size: 20, w: 1.8, name: '!!nB' }); txt(s, 6.7, 3.42, '3', { size: 28, name: '!!nAB' }); if (hl) hl(s); };
  s = slide('2 원소의 개수'); card(s); tag(s, '개념 2'); venn(s, { bare: true }); cnt(s); chip(s, [M('n(A'), M('ᶜ'), M(')'), K(' = ?')]);
  notes(s, 'n(U) = 20, n(A) = 8, n(B) = 6, n(A ∩ B) = 3');
  s = slide('2 원소의 개수'); card(s); tag(s, '개념 2'); await fill(s, [{ or: [URECT], not: [CA], color: P.hit, op: 0.3 }]); venn(s, { bare: true }); cnt(s, (s) => txt(s, 4.15, 4.75, '12', { size: 30, color: P.hit, name: '!!r1' }));
  top(s, '전체에서 A 를 빼기'); chip(s, [M('n(A'), M('ᶜ'), M(')'), K(' = '), M('n(U) − n(A)'), K(' = 20 − 8 = '), K('12', P.hit)], 5.75, 9.2);
  notes(s, 'n(Aᶜ) = n(U) − n(A) = 20 − 8 = 12');
  s = slide('2 원소의 개수'); card(s); tag(s, '개념 2'); await fill(s, [{ or: [CA], not: [CB], color: P.a, op: 0.35 }]); venn(s, { bare: true }); cnt(s, (s) => txt(s, 5.2, 3.42, '5', { size: 30, color: P.a, name: '!!r1' }));
  top(s, 'A 에서 겹친 부분을 빼기'); chip(s, [M('n(A − B)'), K(' = '), M('n(A) − n(A ∩ B)'), K(' = 8 − 3 = '), K('5', P.a)], 5.75, 9.6);
  notes(s, 'n(A − B) = n(A) − n(A ∩ B) = 8 − 3 = 5 (또는 n(A ∪ B) − n(B) = 11 − 6 = 5)');

  // ── 3. 생활 속 문제 ───────────────────────────────────
  pres.addSection({ title: '3 생활 속 문제' });
  s = slide('3 생활 속 문제'); pill(s, '생활 속 문제'); notes(s, '개념 3. 벤 다이어그램 칸에 숫자를 직접 — 「둘 다」 칸부터!');
  const lifeTop = (s) => top(s, '우리 반 30명 · 게임 동아리 14명 · 축구 동아리 11명 · 둘 다 4명', P.ink);
  const life = (s, step) => { venn(s, { la: '게임 14', lb: '축구 11', italic: false }); if (step >= 1) txt(s, 6.7, 3.42, '4', { size: 30, color: P.hit, name: '!!l4' }); if (step >= 2) { txt(s, 5.2, 3.42, '10', { size: 30, color: P.a, name: '!!l10' }); txt(s, 8.2, 3.42, '7', { size: 30, color: P.b, name: '!!l7' }); } if (step >= 3) txt(s, 9.0, 4.75, '9', { size: 30, color: P.hit, name: '!!l9' }); };
  s = slide('3 생활 속 문제'); card(s); tag(s, '개념 3'); lifeTop(s); life(s, 0); chip(s, [K('어느 칸부터 채울까?')]); notes(s, '학생에게 먼저 물어보기: 어디부터?');
  s = slide('3 생활 속 문제'); card(s); tag(s, '개념 3'); lifeTop(s); await fill(s, [{ or: [CA], and: [CB], color: P.hit, op: 0.3 }]); life(s, 1); chip(s, [K('① 「둘 다」 칸부터 → '), K('4', P.hit)]);
  notes(s, '겹친 칸 = 둘 다 = 4');
  s = slide('3 생활 속 문제'); card(s); tag(s, '개념 3'); lifeTop(s); await fill(s, [{ or: [CA], not: [CB], color: P.a, op: 0.25 }, { or: [CB], not: [CA], color: P.b, op: 0.25 }, { or: [CA], and: [CB], color: P.hit, op: 0.3 }]); life(s, 2);
  chip(s, [K('② 게임만 14 − 4 = '), K('10', P.a), K('   축구만 11 − 4 = '), K('7', P.b)], 5.75, 9.2); notes(s, '게임만 = 14 − 4 = 10, 축구만 = 11 − 4 = 7 · 게임 또는 축구 = 10 + 4 + 7 = 21');
  s = slide('3 생활 속 문제'); card(s); tag(s, '개념 3'); lifeTop(s); await fill(s, [{ or: [URECT], not: [CA, CB], color: P.hit, op: 0.3 }]); life(s, 3);
  chip(s, [K('③ 둘 다 아님 = 30 − (10 + 4 + 7) = '), K('9', P.hit)], 5.75, 9.2); notes(s, '둘 다 하지 않는 학생 = 30 − 21 = 9');

  // ── 4. 명제 ─────────────────────────────────────────
  pres.addSection({ title: '4 명제' });
  s = slide('4 명제'); pill(s, '명제'); notes(s, '개념 4. 참 · 거짓을 분명히 판별할 수 있으면 명제 — 거짓도 명제!');
  const SENT = [['2 + 5 = 7', '참', P.ok], ['1은 소수이다.', '거짓', P.no], ['급식이 맛있다.', '판별 불가', P.sub]];
  const tiles = (s, show, dim) => SENT.forEach(([t, lab, col], i) => { const x = 1.75 + i * 3.45, y = 2.25;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 3.0, h: 1.7, rectRadius: 0.18, fill: { color: dim && i === 2 ? 'F4F3F0' : 'FFFFFF' }, line: { color: show ? col : P.ink, width: show ? 2.5 : 1.5 }, objectName: `!!t${i}` });
    s.addText(t, { x, y: y + 0.25, w: 3.0, h: 0.7, align: 'center', fontSize: 22, bold: true, color: dim && i === 2 ? P.sub : P.ink, margin: 0, isTextBox: true, objectName: `!!tt${i}` });
    if (show) { s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.75, y: y + 1.05, w: 1.5, h: 0.46, rectRadius: 0.23, fill: { color: col }, line: { color: col, width: 0 }, objectName: `!!tg${i}` });
      s.addText(lab, { x: x + 0.75, y: y + 1.05, w: 1.5, h: 0.46, align: 'center', valign: 'middle', fontSize: 16, bold: true, color: 'FFFFFF', margin: 0, isTextBox: true, objectName: `!!tgt${i}` }); }
    if (show && i < 2) s.addText('명제 ✔', { x, y: y + 1.8, w: 3.0, h: 0.4, align: 'center', fontSize: 16, bold: true, color: P.ok, margin: 0, isTextBox: true, objectName: `!!mk${i}` });
    if (show && i === 2) s.addText('명제 ✘', { x, y: y + 1.8, w: 3.0, h: 0.4, align: 'center', fontSize: 16, bold: true, color: P.no, margin: 0, isTextBox: true, objectName: `!!mk${i}` }); });
  s = slide('4 명제'); card(s); tag(s, '개념 4'); tiles(s, false); chip(s, [K('참 · 거짓을 분명히 판별할 수 있나?')]); notes(s, '세 문장을 보고 참 · 거짓을 가려 보게 하기');
  s = slide('4 명제'); card(s); tag(s, '개념 4'); tiles(s, true); chip(s, [K('명제', P.hit), K(' = 참 · 거짓을 판별할 수 있는 문장이나 식')], 5.75, 9.2); notes(s, '2 + 5 = 7 참 · 1은 소수이다 거짓(1은 소수가 아님) · 급식이 맛있다 = 사람마다 다름');
  s = slide('4 명제'); card(s); tag(s, '개념 4'); tiles(s, true, true); top(s, '거짓인 문장도 명제!', P.no); chip(s, [K('기준이 사람마다 다르면 (맛있다 · 크다 · 멋지다) → 명제가 아니다')], 5.75, 10.2);
  notes(s, '가장 많이 틀리는 곳: 거짓 = 명제가 아니다 (✘) → 거짓도 명제 (✔)');

  // ── 5. 명제의 부정 ────────────────────────────────────
  pres.addSection({ title: '5 명제의 부정' });
  s = slide('5 명제의 부정'); pill(s, '명제의 부정'); notes(s, '개념 5. ʻp 가 아니다’ = ~p · 참 ↔ 거짓이 뒤바뀐다.');
  const pair = (s, lp, tp, lq, tq, showQ, y = 2.15, k = 0) => {
    const row = (x, label, text, tf, name) => { s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 4.6, h: 1.35, rectRadius: 0.18, fill: { color: 'FFFFFF' }, line: { color: tf === '참' ? P.ok : P.no, width: 2.5 }, objectName: `!!${name}` });
      s.addText([{ text: label + '  ', options: { italic: true, fontFace: MATH, color: P.sub, fontSize: 22, bold: true } }, { text, options: { color: P.ink, fontSize: 22, bold: true } }], { x: x + 0.2, y: y + 0.12, w: 4.2, h: 0.65, margin: 0, isTextBox: true, objectName: `!!${name}t` });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 3.2, y: y + 0.82, w: 1.2, h: 0.42, rectRadius: 0.21, fill: { color: tf === '참' ? P.ok : P.no }, line: { width: 0, color: 'FFFFFF' }, objectName: `!!${name}g` });
      s.addText(tf, { x: x + 3.2, y: y + 0.82, w: 1.2, h: 0.42, align: 'center', valign: 'middle', fontSize: 16, bold: true, color: 'FFFFFF', margin: 0, isTextBox: true, objectName: `!!${name}gt` }); };
    row(1.75, 'p', lp, tp, `p${k}`); if (showQ) { s.addText('→', { x: 6.45, y: y + 0.35, w: 0.6, h: 0.6, align: 'center', fontSize: 30, bold: true, color: P.sub, margin: 0, isTextBox: true, objectName: `!!ar${k}` }); row(7.0, '~p', lq, tq, `q${k}`); }
  };
  s = slide('5 명제의 부정'); card(s); tag(s, '개념 5'); pair(s, '6은 짝수이다.', '참', '', '', false); chip(s, [M('~p'), K(' = ?')]); notes(s, 'p : 6은 짝수이다 (참)');
  s = slide('5 명제의 부정'); card(s); tag(s, '개념 5'); pair(s, '6은 짝수이다.', '참', '6은 짝수가 아니다.', '거짓', true); chip(s, [M('p'), K(' 가 참이면 '), M('~p'), K(' 는 '), K('거짓', P.no)]); notes(s, '~p : 6은 짝수가 아니다 (거짓)');
  s = slide('5 명제의 부정'); card(s); tag(s, '개념 5'); pair(s, '6은 짝수이다.', '참', '6은 짝수가 아니다.', '거짓', true); pair(s, '3 > 8', '거짓', '3 ≤ 8', '참', true, 3.85, 1);
  chip(s, [K('부등호의 부정  '), M('>'), K(' ↔ '), M('≤'), K('   '), M('<'), K(' ↔ '), M('≥')], 5.75, 7.4); notes(s, '3 > 8 (거짓) 의 부정 = 3 ≤ 8 (참). 3 < 8 이 아님에 주의 (같을 때도 포함)');
  s = slide('5 명제의 부정'); card(s); tag(s, '개념 5'); pair(s, '6은 짝수이다.', '참', '6은 짝수가 아니다.', '거짓', true); pair(s, '3 > 8', '거짓', '3 ≤ 8', '참', true, 3.85, 1);
  top(s, '두 번 부정하면 처음으로'); chip(s, [M('~(~p)'), K('  =  ', P.ok), M('p')], 5.75, 5.0); notes(s, '~(~p) = p');

  // ── 6. 사각형과 명제 ─────────────────────────────────
  pres.addSection({ title: '6 사각형과 명제' });
  s = slide('6 사각형과 명제'); pill(s, '사각형과 명제'); notes(s, '개념 6. 사각형의 포함 관계로 「p이면 q이다」 — p 가 q 안에 쏙 들어가면 참. (8차시에 진리집합으로 다시)');
  const TR = { x: 2.55, y: 1.5, w: 8.25, h: 4.05, rr: 0.25 }, PA = { x: 3.05, y: 2.05, w: 7.25, h: 3.3, rr: 0.22 }, RE = { cx: 5.75, cy: 3.85, rx: 1.95, ry: 1.25 }, RH = { cx: 7.6, cy: 3.85, rx: 1.95, ry: 1.25 };
  const quad = (s, hot) => { box(s, TR, P.ink, '!!q1', 1.5, 0.25); box(s, PA, '64748B', '!!q2', 1.5, 0.22); oval(s, RE, P.b, '!!q3'); oval(s, RH, P.a, '!!q4');
    txt(s, TR.x + 0.85, TR.y + 0.27, '사다리꼴', { size: 16, w: 1.6, name: '!!ql1' }); txt(s, PA.x + 0.95, PA.y + 0.27, '평행사변형', { size: 16, w: 1.8, color: '475569', name: '!!ql2' });
    txt(s, RE.cx - 0.85, RE.cy - 0.2, '직사각형', { size: 16, w: 1.5, color: P.b, name: '!!ql3' }); txt(s, RH.cx + 0.95, RH.cy - 0.2, '마름모', { size: 16, w: 1.4, color: P.a, name: '!!ql4' });
    txt(s, 6.675, 3.85, '정사각형', { size: 15, w: 1.4, color: hot ? P.ink : P.ink, name: '!!ql5' }); };
  // 정사각형 = 직사각형 ∩ 마름모 → 렌즈 · 반례 = 직사각형 − 마름모
  s = slide('6 사각형과 명제'); card(s); tag(s, '개념 6'); quad(s); chip(s, [K('정사각형', P.hit), K('이면 '), K('직사각형', P.b), K('이다 ?')]); notes(s, '사각형 가족: 사다리꼴 ⊃ 평행사변형 ⊃ 직사각형 · 마름모, 정사각형 = 직사각형 ∩ 마름모');
  s = slide('6 사각형과 명제'); card(s); tag(s, '개념 6'); await fill(s, [{ or: [RE], color: P.b, op: 0.15 }, { or: [RE], and: [RH], color: P.hit, op: 0.4 }]); quad(s, true);
  top(s, '정사각형은 모두 직사각형 안에 쏙'); chip(s, [K('정사각형', P.hit), K(' ⊂ '), K('직사각형', P.b), K('  →  '), K('참', P.ok)]); notes(s, '정사각형 ⊂ 직사각형 → 「정사각형이면 직사각형이다」 참');
  s = slide('6 사각형과 명제'); card(s); tag(s, '개념 6'); await fill(s, [{ or: [RE], not: [RH], color: P.no, op: 0.3 }]); quad(s);
  s.addShape(pres.shapes.RECTANGLE, { x: 4.35, y: 3.95, w: 1.0, h: 0.5, fill: { color: 'FFFFFF' }, line: { color: P.no, width: 2.5 }, objectName: '!!cx' });
  top(s, '반례: 가로 2, 세로 1인 직사각형', P.no); chip(s, [K('직사각형', P.b), K('이면 '), K('정사각형', P.hit), K('이다  →  '), K('거짓', P.no)], 5.75, 9.0);
  notes(s, '직사각형 중 정사각형이 아닌 것(반례)이 있다 → 「직사각형이면 정사각형이다」 거짓');
  s = slide('6 사각형과 명제'); card(s); tag(s, '개념 6'); await fill(s, [{ or: [RE], and: [RH], color: P.hit, op: 0.4 }]); quad(s, true);
  top(s, '8차시에 「진리집합」으로 다시 만나요'); chip(s, [M('p → q'), K(' 가 참  '), K('⇔', P.ok), K('  '), M('P ⊂ Q')]); notes(s, 'p → q 가 참 ⇔ P ⊂ Q (8차시 정식). 오늘은 그림으로 감 잡기.');

  // ── 정리 ─────────────────────────────────────────────
  pres.addSection({ title: '정리' });
  s = slide('정리'); card(s); s.addText('6차시 정리', { x: 1.4, y: 0.85, w: W - 2.8, h: 0.6, align: 'center', fontSize: 30, bold: true, color: P.ink, margin: 0, isTextBox: true, objectName: '!!top' });
  const SUM = [['드모르간', '(A ∪ B)ᶜ = Aᶜ ∩ Bᶜ · (A ∩ B)ᶜ = Aᶜ ∪ Bᶜ'], ['원소의 개수', 'n(Aᶜ) = n(U) − n(A) · n(A − B) = n(A) − n(A ∩ B)'], ['생활 속 문제', '「둘 다」 칸부터 채우기'], ['명제', '참 · 거짓을 판별할 수 있으면 명제 (거짓도 명제)'], ['명제의 부정', 'p 가 참이면 ~p 는 거짓 · ~(~p) = p'], ['사각형과 명제', 'p 가 q 안에 쏙 → 「p이면 q」 참 · 반례가 있으면 거짓']];
  SUM.forEach(([a, b], i) => { const y = 1.7 + i * 0.78; s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 1.55, y, w: 2.6, h: 0.56, rectRadius: 0.28, fill: { color: P.ink }, line: { width: 0, color: P.ink } });
    s.addText(a, { x: 1.55, y, w: 2.6, h: 0.56, align: 'center', valign: 'middle', fontSize: 16, bold: true, color: 'FFFFFF', margin: 0, isTextBox: true });
    s.addText(b, { x: 4.45, y, w: 7.4, h: 0.56, valign: 'middle', fontSize: 17, bold: true, color: P.ink, margin: 0, isTextBox: true }); });
  notes(s, '형성평가 전 한 번 훑기.');

  await pres.writeFile({ fileName: OUT });
  // ── 모핑 전환 넣기 (pptxgenjs 에 없어 XML 에 직접): 지원 안 하는 PowerPoint 는 페이드 ──
  const zip = await JSZip.loadAsync(fs.readFileSync(OUT));
  const TRANS = '<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"><mc:Choice xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" Requires="p159"><p:transition spd="slow" xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" p14:dur="900"><p159:morph option="byObject"/></p:transition></mc:Choice><mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>';
  let n = 0;
  for (const f of Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))) {
    let x = await zip.file(f).async('string');
    if (x.includes('<p:transition')) continue;
    x = x.includes('</p:clrMapOvr>') ? x.replace('</p:clrMapOvr>', '</p:clrMapOvr>' + TRANS) : x.replace('</p:cSld>', '</p:cSld>' + TRANS);
    zip.file(f, x); n++;
  }
  fs.writeFileSync(OUT, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  console.log(`✅ ${OUT} · 슬라이드 ${pres.slides.length}장 · 모핑 ${n}장`);
})();
