// 수업 준비 학습지 이미지 배치 검증: node tests/prep.test.js
// v0.9.3 사용자 결정 ②A: 세로로 긴 개념 칸은 좌우 단으로 나란히 (큰 화면에서 글자가 커지게) · 넓은 칸은 그대로
const load = require('./load');
const DS = load(['js/engine/ui.js', 'js/raid/prep.js']);
const plan = DS.Prep.plan, mid = (sg) => sg.h / 2;
let fail = 0; const check = (c, m) => { if (!c) { fail++; console.error('FAIL:', m); } };
const asp = (P) => P.W / P.H;
const wide = plan([{ w: 940, h: 500 }], mid);
check(wide.cols.length === 1 && wide.cols[0].length === 1 && wide.cols[0][0].h === 500, '가로로 넓은 칸은 그대로 (자르지 않음)');
const scale = (P) => Math.min(1.4 / P.W, 1 / P.H); // 종합상황실 칸에 넣었을 때 배율
const short2 = plan([{ w: 940, h: 300 }, { w: 940, h: 320 }], mid);
check(short2.cols.length === 1, '낮은 조각 두 개는 위아래 그대로 (그게 더 크게 보임)');
const two = plan([{ w: 940, h: 700 }, { w: 940, h: 760 }], mid);
check(two.cols.length === 2 && two.cols.map((c) => c.length).join() === '1,1', `높은 조각 두 개 → 좌우로 (${asp(two).toFixed(2)})`);
const tall = plan([{ w: 940, h: 2200 }], mid);
check(tall.cols.length >= 2 && scale(tall) > 1.5 * (1 / 2200), `한 조각이 길면 잘라서 옆 단으로 — 글자 1.5배 이상 (단 ${tall.cols.length}, ×${(scale(tall) * 2200).toFixed(2)})`);
const sum = (P) => P.cols.flat().reduce((a, s) => a + s.h, 0);
check(Math.abs(sum(tall) - 2200) < 1e-6, '잘라도 빠지는 부분 없음 (높이 합 그대로)');
check(tall.cols.flat().every((s, i, a) => i === 0 || (s.pi === a[i - 1].pi && Math.abs(s.y0 - (a[i - 1].y0 + a[i - 1].h)) < 1e-6)), '잘린 조각은 위에서 아래 순서대로 이어진다');
const three = plan([{ w: 940, h: 300 }, { w: 940, h: 300 }, { w: 940, h: 900 }], mid);
check(three.cols.flat().map((s) => s.pi).join() === three.cols.flat().map((s) => s.pi).slice().sort().join(), '학습지 순서가 바뀌지 않는다 (왼쪽 단 → 오른쪽 단)');
check(scale(three) > 1 / (1500 + 2 * 37.6), '세 조각도 위아래로만 쌓을 때보다 크게 보인다');
const nosplit = plan([{ w: 940, h: 2200 }], () => NaN);
check(nosplit.cols.length === 1, '빈 줄을 못 찾으면 자르지 않는다');
if (fail) { console.error(`\n${fail}건 실패`); process.exit(1); }
console.log('OK: 학습지 이미지 배치 — 넓으면 그대로 · 여러 조각/긴 조각은 좌우 단 · 순서 · 빠짐 없음 통과');
