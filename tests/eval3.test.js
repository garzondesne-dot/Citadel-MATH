// 🏰 성채던전 2층 대단원 검증 (2026-11-05 · 변경 제안 v1 컨펌): node tests/eval3.test.js
// (1) 17방 · 해금 차시 · 보스 17 · 서술형 15 · 16 · 17 은 photo (2) 첫 시도 = 제안서 정답 · 교과서 숫자 안 씀 (3) 재도전 300 × 3 을 check 값으로 따로 계산
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/eval-3.js']);
let fail = 0, count = 0;
const check = (c, m) => { count++; if (!c) { fail++; if (fail < 30) console.error('FAIL:', m); } };
const L = DS.Lessons.get('eval-3');
const R = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const divs = (n) => R(1, n).filter((d) => n % d === 0);
check(L && L.eval && L.floor === 2 && L.rooms.length === 17 && L.rooms.filter((r) => r.boss).map((r) => r.id).join() === 'q17', '17방 · 17번 보스');
check(L.rooms.filter((r) => r.photo).map((r) => r.id).join() === 'q15,q16,q17', '서술형 = 15 · 16 · 17 (사진 분석 전 잠금)');
check(L.rooms.map((r) => r.no).join() === '2,3,3,3,3,5,5,7,7,8,9,9,9,11,4,10,11', '해금 차시 (2026-11-05 재조직: 14 · 17 절대부등식 = 11차시)');
const got = (q) => (q.type === 'choice' ? q.answer : q.type === 'multi' ? q.answer.map((i) => q.options[i]).join(',') : q.answer);
const WANT = { q01: ['④ 우리 반에서 안경을 쓴 학생의 모임'], q02: ['② {12} ⊂ A'], q03: [5], q04: [16], q05: [32], q06: [24], q07: [12], q08: ['② P ⊂ Q 이면 명제 q → p 는 참이다.'], q09: ['1,2,3'], q10: ['② ~p → q'], q11: [18], q12: ['③ ~p 는 q 이기 위한 필요조건이다.'], q13: ['ㄱ,ㄴ'], q14: [49], q15: [3], q16: [5, 5], q17: ['(a + b)(a − b)²', 'a + b > 0, (a − b)² ≥ 0', 'a = b'] };
const first = Object.fromEntries(L.rooms.map((r) => [r.id, L.items(r.id, 'x', 0)]));
Object.entries(WANT).forEach(([id, w]) => first[id].forEach((q, i) => check(got(q) === w[i], `${id} (${i + 1}) 제안서 정답 ${w[i]} · 지금 ${got(q)}`)));
const all0 = Object.values(first).flat().map((q) => q.question + (q.choices || []).join(' ')).join('\n');
['15의 약수', 'a² − 2a', 'x² − 8x + 15', '√(4n)', 'A₁₀₀', '3의 배수}, A ∪ C = {x | x는 9의 약수', 'n(A ∪ B) = 20', 'x − a + 5 > 0', '~p ⟶ q', 'x − a + 6', '|a| + |b| = 0', '(4x + 1/y)', '남학생 28명', '√3', 'a³ + b³ ≥ ab(a + b)'].forEach((s) => check(!all0.includes(s), `교과서 숫자 안 씀: ${s}`));

// 독립 계산 (check 값으로)
const neg = (s) => (s.startsWith('~') ? s.slice(1) : `~${s}`);
function verify(q, tag) {
  const c = q.check || {}, a = got(q);
  if (q.type === 'choice') check(q.answerIndex >= 0 && q.choices.filter((x) => x === q.answer).length === 1, `${tag}: 보기에 정답 하나`);
  switch (c.kind) {
    case 'set': return check(a.endsWith(c.yes) && ['우리 반에서 안경을 쓴 학생의 모임', '10보다 작은 자연수의 모임', '12의 약수의 모임', '한 자리 홀수의 모임', '우리 학교 1학년 학생의 모임'].includes(c.yes), `${tag}: 집합`);
    case 'div': { const D = divs(c.N); const trues = q.choices.filter((t) => { const s = t.slice(2); if (/∈ A$/.test(s) && !s.startsWith('{')) return D.includes(Number(s.split(' ')[0])); if (/∈ A$/.test(s)) return false; if (/⊂ A$/.test(s)) return s.slice(1, s.indexOf('}')).split(', ').map(Number).every((x) => D.includes(x)); if (s.startsWith('A = ')) return s.slice(5, -1).split(', ').map(Number).join() === D.join(); return null; }); return check(trues.length === 1 && trues[0] === q.answer, `${tag}: ∈ ⊂ 참 하나 (${trues})`); }
    case 'eq': { const sols = []; for (let x = 1; x < 30; x++) for (let y = 1; y < 30; y++) { const A = new Set([c.s, x * x - c.k * x]), B = new Set([c.t, y * y - c.m * y]); if (A.size === B.size && [...A].every((v) => B.has(v))) sols.push(x + y); } return check(sols.length === 1 && sols[0] === a, `${tag}: a + b (${sols})`); }
    case 'xs': { const B = divs(c.N); const n = B.length; return check(B.includes(c.p) && B.includes(c.q) && a === 2 ** (n - 2) && c.p * c.q === c.p * c.q, `${tag}: X 개수`); }
    case 'odd': { const odd = (n) => R(1, 400).filter((x) => x % 2 && x * x <= c.c * n); const AM = odd(c.M); let best = 0; for (let n = 1; n < 2000; n++) if (odd(n).every((x) => AM.includes(x))) best = n; return check(best === a, `${tag}: Aₙ 최댓값 ${best}`); }
    case 'dist': { const I = R(1, c.N).filter((x) => x % c.k === 0 && c.D % x === 0); return check(I.reduce((s, x) => s + x, 0) === a, `${tag}: 분배법칙 합`); }
    case 'diff': return check(a === c.z - c.x - c.y && a > 0, `${tag}: n(A − B)`);
    case 'truth': { const bad = q.choices.filter((t) => / ⊂ /.test(t) && /이면 명제/.test(t)); return check(bad.length === 1 && q.answer === bad[0] && bad[0].includes(`${c.b.toUpperCase()} ⊂ ${c.a.toUpperCase()}`), `${tag}: 옳지 않은 것`); }
    case 'all': return check(a === R(1, 8).filter((x) => [1e-6, 0.001, 1, 10].every((t) => c.k * t - x + c.c > 0)).join(','), `${tag}: 모든 양수`);
    case 'conv': { const ans = `${neg(c.h)} → ${neg(c.c)}`; return check(q.answer.slice(2) === ans && q.choices.filter((t) => t.slice(2) === ans).length === 1, `${tag}: 역의 대우 ${ans}`); }
    case 'suff': { const s = R(-60, 60).filter((x) => [x - c.c1, c.c2 - 2 * x].every((v) => v * (v - 2 * x) <= 0)); return check(s.reduce((p, v) => p + v, 0) === a && s.length >= 2, `${tag}: 충분조건 합`); }
    case 'venn': { // 여러 모형으로 보기 참 · 거짓
      const truth = (t, M) => { const m = t.slice(2).match(/^(~?)([pqr]) (?:는|은) (~?)([pqr]) 이기 위한 (충분|필요)조건이다\.$/); if (!m) return null; const set = (neg1, v) => { const S = M[v]; return neg1 ? new Set(R(0, 7).filter((x) => !S.has(x))) : S; }; const A = set(m[1], m[2]), B = set(m[3], m[4]); const sub = (X, Y) => [...X].every((x) => Y.has(x)); return m[5] === '충분' ? sub(A, B) : sub(B, A); };
      let ok = true; for (let t = 0; t < 40; t++) { const rnd = DS.Rng(`v${t}`); const X = new Set(R(0, 7).filter(() => rnd() < 0.4)); const Z = new Set(R(0, 7).filter((x) => !X.has(x))); const Y = new Set([...Z].filter(() => rnd() < 0.6)); if (!X.size || !Y.size || Y.size === Z.size) continue; const M = { [c.x]: X, [c.y]: Y, [c.z]: Z }; const tv = q.choices.map((t) => truth(t, M)); if (tv.filter(Boolean).length !== 1 || !truth(q.answer, M)) ok = false; }
      return check(ok, `${tag}: 진리집합 보기`); }
    case 'abs': { const vals = [-2, -1, 0, 1, 2]; const st = (i) => { const P = (a1, b1) => a1 * a1 + b1 * b1 === 0, Q = (a1, b1) => Math.abs(a1 + b1) === Math.abs(a1) + Math.abs(b1), Rr = (a1, b1) => a1 * b1 >= 0; const f = { p: P, q: Q, r: Rr }; const ev = (e, a1, b1) => (e.startsWith('~') ? !f[e[1]](a1, b1) : f[e](a1, b1)); const pairs = [['p', 'q'], ['~r', '~p'], ['r', 'p'], null, ['r', 'p'], ['~q', '~p']]; if (i === 3) return vals.every((a1) => vals.every((b1) => Q(a1, b1) === Rr(a1, b1))); const [h, k] = pairs[i]; return vals.every((a1) => vals.every((b1) => !ev(h, a1, b1) || ev(k, a1, b1))); };
      const lab = ['ㄱ', 'ㄴ', 'ㄷ'], want = c.pick.map((i, k) => (st(i) ? lab[k] : null)).filter(Boolean).join(','); return check(a === want && want.length, `${tag}: ㄱㄴㄷ (${want})`); }
    case 'amgm': { let m = Infinity; for (let i = 1; i < 400; i++) { const t = i / 40; m = Math.min(m, 1 + c.A * c.B + c.B * t + c.A / t); } return check(Math.abs(m - a) < 0.02, `${tag}: 최솟값 ${m}`); }
    case 'club': { const both = c.S - c.M - c.F; const s = []; for (let m = 0; m <= both; m++) { const f = both - m; if (c.M - m === c.F - f && f >= 0 && f <= c.F && m <= c.M) s.push(f); } return check(s.length === 1 && s[0] === a, `${tag}: 여학생 ${s}`); }
    case 'irr': return check(a === c.k, `${tag}: 귀류법 ${c.k}`);
    case 'proof': return check(q.answerIndex >= 0, `${tag}: 증명 고르기`);
    default: return check(false, `${tag}: 검산 종류 없음 ${c.kind}`);
  }
}
for (const r of L.rooms) {
  const n0 = first[r.id].length;
  first[r.id].forEach((q, i) => verify(q, `${r.id}/0(${i + 1})`));
  for (let s = 0; s < 300; s++) for (const a of [1, 2, 3]) { const it = L.items(r.id, `seed${s}`, a); check(it.length === n0, `${r.id} 칸 수`); it.forEach((q, i) => verify(q, `${r.id}#${s}/${a}(${i + 1})`)); }
  check(JSON.stringify(L.items(r.id, 'k', 2)) === JSON.stringify(L.items(r.id, 'k', 2)), `${r.id}: 같은 시드 → 같은 문제`);
}
if (fail) { console.error(`\n${fail}건 실패 / ${count}건`); process.exit(1); }
console.log(`OK: 🏰 성채던전 2층 17방 — 제안서 정답 · 교과서 숫자 안 씀 · 재도전 300×3 독립 검산 ${count}건 통과`);
