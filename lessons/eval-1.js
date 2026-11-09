// 🟪 집합 중단원던전 꼭대기 층 「평가1 · 중단원 마무리」 (2026-11-03 사용자 확정 · 변경 제안 v1)
// 근거: 교과서 78~79쪽 중단원 마무리 12문항 — 게임은 누구나 열 수 있는 웹이라 교과서 숫자를 그대로 쓰지 않고 「숫자만 고친 문제」 (사용자 결정)
//   01 은 숫자가 없어 예시 문장만 바꿈 · 09 는 겹침(A₆₀)이 생기게 바꿈 · 서술형 07 · 11 은 답만 (풀이는 종이)
// 몬스터 6 + 보스(발전) — 레이드가 아니라 중단원던전에서 혼자 · 첫 시도 = 아래 고친 숫자, 재도전 = 숫자를 또 바꿈 (같은 시드 → 같은 문제)
// 해설 영상 (평가1) 32~36 은 교과서 숫자로 푼 예제 → 게임은 같은 방법으로 다른 숫자 (예제 → 연습 짝)
// 정답은 tests/eval1.test.js 에서 문제 글을 읽어 따로 계산한다 (차시 파일의 계산을 쓰지 않음)
(function () {
  const S = DS.SetGen;
  const st = (a) => (a.length ? S.setStr(a) : '∅');
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const sorted = (a) => a.slice().sort((x, y) => x - y);
  const inter = (A, B) => sorted(A.filter((x) => B.includes(x)));
  const union = (A, B) => sorted([...new Set([...A, ...B])]);
  const minus = (A, B) => sorted(A.filter((x) => !B.includes(x)));
  const divs = (n) => range(1, n).filter((d) => n % d === 0);
  const mults = (k, N) => range(1, N).filter((x) => x % k === 0);
  const gcd = (a, b) => (b ? gcd(b, a % b) : a), lcm = (a, b) => (a / gcd(a, b)) * b;
  const sup = (s) => String(s).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]), sub = (s) => String(s).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[d]);
  const sgn = (k, x = 'x') => (k === 0 ? '' : k === 1 ? ` + ${x}` : k === -1 ? ` − ${x}` : k > 0 ? ` + ${k}${x}` : ` − ${-k}${x}`);
  const last = (n) => Number(String(n).slice(-1));
  const iga = (n) => ([2, 4, 5, 9].includes(last(n)) ? `${n}가` : `${n}이`), ro = (n) => ([0, 3, 6].includes(last(n)) ? `${n}으로` : `${n}로`); // 숫자 뒤 조사
  const num = (k) => (k === 0 ? '' : k > 0 ? ` + ${k}` : ` − ${-k}`);
  const ox = (question, answer, solution, check) => ({ type: 'ox', question, answer, solution, check });
  const nm = (question, answer, solution, check) => ({ type: 'number', question, answer, solution, check });
  const ch = (question, choices, ans, solution, check) => ({ type: 'choice', question, choices, answerIndex: choices.indexOf(ans), answer: ans, solution, check });
  const multi = (question, opts, want, solution, check) => {
    const show = (x) => String(x).replace(/^-/, '−'), o = opts.map(show), w = want.map(show);
    return { type: 'multi', question, options: o, answer: o.map((x, i) => (w.includes(x) ? i : -1)).filter((i) => i >= 0), solution, check };
  };
  const fill = (r, want, pool, k) => sorted([...want, ...r.shuffle(pool.filter((x) => !want.includes(x))).slice(0, k - want.length)]);

  // ── 01 집합인 것 · 아닌 것 (O = 집합이다) ──────────────────
  const YES = ['5보다 작은 자연수의 모임', '10의 약수의 모임', '한 자리 홀수의 모임', '3보다 크고 8보다 작은 자연수의 모임', '20 이하의 4의 배수의 모임', '1보다 작은 자연수의 모임', '두 자리 자연수 중 가장 작은 수의 모임'];
  const NO = ['맛있는 과일의 모임', '0에 가까운 수의 모임', '키가 큰 학생의 모임', '아름다운 꽃의 모임', '아주 큰 수의 모임', '인기 있는 노래의 모임', '착한 사람의 모임'];
  const q01 = (k, text, yes) => ox(`01 ${k} 「${text}」은(는) 집합이다. (O · X)`, yes,
    yes ? '대상이 분명하게 정해진다 → 집합' : '「맛있는 · 가까운 · 큰」은 사람마다 기준이 달라 대상이 분명하지 않다 → 집합이 아니다', { set01: yes });
  function m01(r) {
    if (!r) return [q01('⑴', NO[0], false), q01('⑵', YES[0], true), q01('⑶', NO[1], false)];
    const n = r.int(1, 2), picks = r.shuffle([...r.shuffle(YES).slice(0, n).map((t) => [t, true]), ...r.shuffle(NO).slice(0, 3 - n).map((t) => [t, false])]);
    return picks.map(([t, y], i) => q01('⑴⑵⑶'[i], t, y));
  }
  // ── 02 원소나열법 (약수 · 이차방정식의 해) ─────────────────
  function m02(r) {
    const n = r ? r.pick([12, 14, 16, 18, 20, 21, 22]) : 15;
    const [a, b] = r ? sorted(r.shuffle(range(1, 7)).slice(0, 2)) : [1, 4];
    const d = divs(n), roots = [a, b];
    return [
      multi(`02 ⑴ {x | x는 ${n}의 약수} 를 원소나열법으로 — 원소를 모두 고르시오.`, fill(r || DS.Rng('e1|02'), d, range(1, n), Math.min(10, d.length + 4)), d, `${n} 의 약수 → ${st(d)}`, { div: n }),
      multi(`02 ⑵ {x | x²${sgn(-(a + b))}${num(a * b)} = 0} 를 원소나열법으로 — 원소를 모두 고르시오.`, sorted([...new Set([-b, -a, ...range(1, 7)])]), roots,
        `(x − ${a})(x − ${b}) = 0 → x = ${a} 또는 ${b} → ${st(roots)}`, { quad: [-(a + b), a * b] }),
    ];
  }
  // ── 03 포함 관계 (기호 ⊂) ─────────────────────────────
  const REL = ['A ⊂ B', 'B ⊂ A', 'A = B', '포함 관계가 없다'];
  const CONDS = { 홀수: (x) => x % 2 === 1, 짝수: (x) => x % 2 === 0, '3의 배수': (x) => x % 3 === 0, '5의 배수': (x) => x % 5 === 0 };
  function m03(r) {
    let w1 = '홀수', F1 = [1, 5, 9, 13], swap1 = false, n2 = 12, F2 = [3, 6], swap2 = true;
    if (r) {
      w1 = r.pick(Object.keys(CONDS)); F1 = sorted(r.shuffle(range(1, 30).filter(CONDS[w1])).slice(0, 4)); swap1 = r() < 0.5;
      n2 = r.pick([12, 18, 20, 24, 30]); F2 = sorted(r.shuffle(divs(n2).filter((x) => x > 1 && x < n2)).slice(0, 2)); swap2 = r() < 0.5;
    }
    const pair = (fin, cond, swap) => (swap ? [cond, fin] : [fin, cond]);
    const [a1, b1] = pair(st(F1), `{x | x는 ${w1}}`, swap1), [a2, b2] = pair(`{x | x는 ${n2}의 약수}`, st(F2), !swap2);
    return [
      ch(`03 ⑴ A = ${a1}, B = ${b1} 의 포함 관계는?`, REL, swap1 ? 'B ⊂ A' : 'A ⊂ B', `${st(F1)} 의 원소는 모두 ${w1} → ${swap1 ? 'B ⊂ A' : 'A ⊂ B'}`, { fin: F1, cond: w1, finIs: swap1 ? 'B' : 'A' }),
      ch(`03 ⑵ A = ${a2}, B = ${b2} 의 포함 관계는?`, REL, swap2 ? 'B ⊂ A' : 'A ⊂ B', `${n2} 의 약수 = ${st(divs(n2))} 가 ${st(F2)} 를 모두 포함 → ${swap2 ? 'B ⊂ A' : 'A ⊂ B'}`, { fin: F2, div: n2, finIs: swap2 ? 'B' : 'A' }),
    ];
  }
  // ── 04 n(A ∩ B) ────────────────────────────────────────
  function m04(r) {
    let a = 16, b = 21, k = 9;
    if (r) { a = r.int(10, 20); b = r.int(10, 25); k = r.int(2, Math.min(a, b) - 2); }
    const u = a + b - k;
    return [nm(`04 n(A) = ${a}, n(B) = ${b}, n(A ∪ B) = ${u} 일 때 n(A ∩ B) 는?`, k, `n(A ∩ B) = n(A) + n(B) − n(A ∪ B) = ${a} + ${b} − ${u} = ${k}`, { a, b, u })];
  }
  // ── 05 U = {1, …, 10} 에서 ∩ ∪ ᶜ − ───────────────────────
  function m05(r) {
    let A = [2, 6, 7, 10], n = 10;
    if (r) for (;;) { n = r.pick([6, 8, 10]); A = sorted(r.shuffle(range(1, 10)).slice(0, 4)); const B = divs(n); if (inter(A, B).length && minus(A, B).length && minus(B, A).length) break; }
    const U = range(1, 10), B = divs(n), head = `U = {1, 2, 3, …, 10}, A = ${st(A)}, B = {x | x는 ${n}의 약수} 일 때 `;
    const q = (k, label, want, sol) => multi(`05 ${k} ${head}${label} 의 원소를 모두 고르시오.`, U, want, `B = ${st(B)} → ${sol} → ${label} = ${st(want)}`, { expr: label });
    return [q('⑴', 'A ∩ B', inter(A, B), '둘 다 있는 것'), q('⑵', 'A ∪ B', union(A, B), '모두 모으기'), q('⑶', 'Aᶜ', minus(U, A), 'U 에서 A 를 빼기'), q('⑷', 'A − B', minus(A, B), 'A 에서 B 에 있는 것 빼기')];
  }
  // ── 06 서로소인 집합 모두 · 07 X 의 개수 ───────────────────
  function m06(r) {
    let m = 6, A = [1, 2, 3, 5];
    if (r) { m = r.int(5, 7); A = sorted(r.shuffle(range(1, m)).slice(0, m - 2)); }
    const U = range(1, m), C = minus(U, A), want = [[], [C[0]], [C[1]], C];
    const rr = r || DS.Rng('e1|06'), traps = [[A[0], C[0]], [A[1]], [A[2], C[1]], [C[0], A[A.length - 1]]].map(sorted);
    const opts = rr.shuffle([...want, ...traps]).map(st);
    return [multi(`06 U = ${st(U)}, A = ${st(A)} 일 때 U 의 부분집합 중 A 와 서로소인 집합을 모두 고르시오.`, opts, want.map(st),
      `A 와 겹치지 않으려면 U − A = ${st(C)} 의 부분집합 → ${want.map(st).join(', ')} (4개)`, { U, A })];
  }
  function m07(r) {
    let p = 6, q = 3, N = 18;
    if (r) for (;;) { p = r.pick([4, 6, 8, 9, 10, 12]); q = r.pick([2, 3, 4]); N = q * r.int(4, 7); const B = mults(q, N), D = minus(B, divs(p)); if (inter(B, divs(p)).length && D.length >= 2 && D.length <= 5) break; }
    const A = divs(p), B = mults(q, N), D = minus(B, A);
    return [nm(`07 A = {x | x는 ${p}의 약수}, B = {x | x는 ${N} 이하의 ${q}의 배수} 일 때 A ∩ X = ∅, B ∪ X = B 를 만족시키는 집합 X 의 개수는? (풀이는 학습지에)`,
      2 ** D.length, `B ∪ X = B → X ⊂ B, A ∩ X = ∅ → A 의 원소 ${st(inter(A, B))} 는 X 에 없음 → X ⊂ ${st(D)} → 2${sup(D.length)} = ${2 ** D.length}개`, { p, q, N })];
  }
  // ── 08 A ∩ B = B 인 모든 정수 x ──────────────────────────
  function m08(r) {
    let c = 3, b = 5, d = 7;
    if (r) for (;;) { c = r.int(2, 5); b = r.int(2, 6); d = r.int(6, 9); if (b !== d && b !== 1 - c) break; }
    const want = range(-10, 10).filter((x) => x !== d && (x === x * x + c * x || x === b));
    const opts = fill(r || DS.Rng('e1|08'), [...want, d], range(-5, 9), 10);
    return [multi(`08 A = {x² + ${c}x, ${b}, ${d}}, B = {x, ${d}} 에 대하여 A ∩ B = B 를 만족시키는 정수 x 를 모두 고르시오.`, opts, want,
      `A ∩ B = B → B ⊂ A → x ∈ A (x ≠ ${d}) → x = ${b} 또는 x² + ${c}x = x → x(x + ${c - 1}) = 0 → x = 0, ${1 - c} → ${want.join(', ')}`, { c, b, d })];
  }
  // ── 09 배수의 집합 · 10 n(Aᶜ ∩ Bᶜ) ─────────────────────────
  function m09(r) {
    let a = 6, b = 4, c = 10;
    if (r) for (;;) { a = r.int(2, 6); [b, c] = r.shuffle(range(3, 10)).slice(0, 2); if (b !== a && c !== a && lcm(a, b) <= 50 && lcm(a, c) <= 50 && lcm(a, b) !== lcm(a, c)) break; }
    const set = (k) => mults(k, 100), L1 = lcm(a, b), L2 = lcm(a, c), L3 = lcm(L1, L2), ans = inter(set(a), union(set(b), set(c))).length;
    return [nm(`09 100 이하의 자연수 중 k 의 배수의 집합을 Aₖ 라 할 때, n(A${sub(a)} ∩ (A${sub(b)} ∪ A${sub(c)})) 은?`, ans,
      `분배법칙 → A${sub(L1)} ∪ A${sub(L2)} → ${set(L1).length} + ${set(L2).length} − n(A${sub(L3)}) ${set(L3).length} = ${ans}`, { a, b, c })];
  }
  function m10(r) {
    let N = 40, k = 8, m = 32;
    if (r) for (;;) { N = r.pick([30, 36, 40, 48, 50]); k = r.int(4, 9); m = r.pick([24, 30, 32, 36, 40, 48].filter((x) => x <= N)); if (inter(mults(k, N), divs(m)).length >= 2) break; }
    const A = mults(k, N), B = divs(m), n = N - union(A, B).length;
    return [nm(`10 U = {x | x는 ${N} 이하의 자연수}, A = {x | x는 ${k}의 배수}, B = {x | x는 ${m}의 약수} 일 때 n(Aᶜ ∩ Bᶜ) 은?`, n,
      `Aᶜ ∩ Bᶜ = (A ∪ B)ᶜ → n(A ∪ B) = ${A.length} + ${B.length} − ${inter(A, B).length} = ${union(A, B).length} → ${N} − ${union(A, B).length} = ${n}`, { N, k, m })];
  }
  // ── 보스(발전): 11 최댓값 · 최솟값 · 12 「~이 아니거나」 개수 ─────
  function m11(r) {
    let T = 50, a = 34, b = 27;
    if (r) for (;;) { T = r.int(30, 50); a = r.int(Math.ceil(T / 2), T - 3); b = r.int(Math.ceil(T / 3), T - 5); if (a + b > T + 2 && b < a) break; }
    const mx = Math.min(a, b), mn = a + b - T, head = `11 동아리 회원 ${T}명 중 A 코스를 다녀온 회원은 ${a}명, B 코스는 ${b}명이다. 두 코스를 모두 다녀온 회원 수의`;
    const sol = `n(A ∩ B) = ${a} + ${b} − n(A ∪ B), ${a} ≤ n(A ∪ B) ≤ ${T}`;
    return [nm(`${head} 최댓값은?`, mx, `${sol} → n(A ∪ B) = ${a} 일 때 최대 ${mx} (B ⊂ A)`, { T, a, b, ask: 'max' }), nm(`${head} 최솟값은?`, mn, `${sol} → n(A ∪ B) = ${T} 일 때 최소 ${mn}`, { T, a, b, ask: 'min' })];
  }
  function m12(r) {
    let N = 100, p = 6, q = 4, rem = 2;
    if (r) for (;;) { N = r.pick([50, 60, 80, 100]); p = r.int(3, 8); q = r.int(3, 6); rem = r.int(1, q - 1); if (range(1, N - 1).some((x) => x % p === 0 && x % q === rem)) break; }
    const bad = range(1, N - 1).filter((x) => x % p === 0 && x % q === rem), n = N - 1 - bad.length;
    return [nm(`12 ${N} 미만의 자연수 중에서 ${p}의 배수가 아니거나 ${ro(q)} 나누었을 때의 나머지가 ${iga(rem)} 아닌 자연수의 개수는?`, n,
      `「아니거나 아닌」 = (${p}의 배수 그리고 나머지 ${rem})의 여집합 (드모르간) → 빼는 수 ${st(bad)} ${bad.length}개 → ${N - 1} − ${bad.length} = ${n}`, { N, p, q, rem })];
  }

  // ⚔ 소레이드 방 (2026-11-09 요청 #23 · 선생님 「추천대로 진행」): q07 ~ q12 = 졸개(소문제) … 👑 대장(마지막) · 혼자 하는 성채용
  //   pass 0 = 위 첫 시도 숫자 · pass ≥ 1 = 숫자 바뀐 사슬 (각 방 r 생성기와 같은 조건) · say = 「📜 나의 풀이」 한 줄 (6차시 CHAIN 말투)
  const sayOf = (q, say) => Object.assign(q, { say }), show = (x) => String(x).replace(/^-/, '−');
  // 🔁 #48 (2026-11-09 선생님 「#48 진행」): 성채 1층 소레이드 4방 = 7차시 문제 4~7 새 꼴 (근거 줄 없음 · 첫 판 숫자 = 성채 것)
  const multi2 = (question, parts, solution, check) => { const show = (x) => String(x).replace(/^-/, '−'), options = [], answer = [], groups = []; parts.forEach(({ label, opts, want }) => { const o = opts.map(show), w = want.map(show), base = options.length; o.forEach((x, k) => { options.push(x); if (w.includes(x)) answer.push(base + k); }); groups.push({ label, n: o.length }); }); return { type: 'multi', question, options, answer, groups, solution, check }; };
  const gwa = (n) => ([2, 4, 5, 9].includes(last(n)) ? `${n} 와` : `${n} 과`);
  function c07(p, q, N, r) {
    const A = divs(p), B = mults(q, N), D = minus(B, A), U = union(A, B), n = D.length;
    return [
      sayOf(multi2('A 와 B 의 원소를 각각 모두 고르시오.', [{ label: `A = {x | x는 ${p}의 약수}`, opts: fill(r, A, range(1, Math.max(12, p + 3)), Math.min(10, A.length + 4)), want: A }, { label: `B = {x | x는 ${N} 이하의 ${q}의 배수}`, opts: fill(r, B, range(1, N + 4), Math.min(12, B.length + 4)), want: B }], `${p}의 약수 → ${st(A)} · ${N} 이하의 ${q}의 배수 → ${st(B)}`, { p, q, N, step: 1 }), `A = ${st(A)}, B = ${st(B)} 이다.`),
      sayOf(ch('B ∪ X = B, A ∩ X = ∅ 이 뜻하는 것은?', ['X ⊂ B 이고 X 와 A 는 서로소', 'B ⊂ X 이고 X ⊂ A', 'X ⊂ A 이고 X 와 B 는 서로소'], 'X ⊂ B 이고 X 와 A 는 서로소', 'B ∪ X = B → X ⊂ B · A ∩ X = ∅ → 서로소', { step: 2 }), 'B ∪ X = B 이므로 X ⊂ B, A ∩ X = ∅ 이므로 X 와 A 는 서로소이다.'),
      sayOf(multi(`A ∩ X = ∅ 이고 B ∪ X = B 일 때, X 에 들어갈 수 있는 원소를 모두 고르시오.`, U, D, `X ⊂ B 이고 A 와 서로소 → B − A = ${st(D)}`, { step: 3 }), `따라서 X ⊂ B − A = ${st(D)} 이다.`),
      sayOf(nm(`집합 X 의 개수는?`, 2 ** n, `B − A 의 원소 ${n}개로 만들 수 있는 부분집합 → 2${sup(n)} = ${2 ** n}`, { p, q, N, step: 4 }), `그러므로 집합 X 의 개수는 2${sup(n)} = ${2 ** n} 이다.`),
    ];
  }
  function c08(c, b, d, r) {
    const want = sorted([1 - c, 0, b]), opts = fill(r, [...want, d], range(-5, 9), 9), show = (x) => String(x).replace(/^-/, '−');
    const eq = r.shuffle([`x = ${b}`, `x = x² + ${c}x`, `x² + ${c}x = ${b}`, `x² + ${c}x = ${d}`, 'x = 2x']); // #48 = 7차시 문제 5 꼴 (「x = d」 넣지 않음)
    return [
      sayOf(ch(`A = {x² + ${c}x, ${b}, ${d}}, B = {x, ${d}} 에서 A ∩ B = B 이면 두 집합 A, B 사이의 관계는?`, ['B ⊂ A', 'A ⊂ B', 'A ∩ B = ∅'], 'B ⊂ A', 'A ∩ B 가 B 전체 → B 의 원소가 모두 A 에 있음 → B ⊂ A', { step: 1 }), `A ∩ B = B 이므로 B ⊂ A, 곧 x 는 A 의 원소이다 (x ≠ ${d}).`),
      sayOf(multi(`B ⊂ A 가 성립하기 위해 맞는 식을 모두 고르시오.`, eq, [`x = ${b}`, `x = x² + ${c}x`], `x 는 A 의 원소 → x = ${b} 또는 x = x² + ${c}x`, { step: 2 }), `x 는 A 의 원소이므로 x = ${b} 또는 x = x² + ${c}x 이다.`),
      sayOf(multi(`x = x² + ${c}x 를 만족시키는 x 를 모두 고르시오.`, opts, [0, 1 - c], `x² + ${c - 1 === 1 ? '' : c - 1}x = 0 → x(x + ${c - 1}) = 0 → x = 0, ${show(1 - c)}`, { step: 3 }), `x = x² + ${c}x 에서 x² + ${c - 1 === 1 ? '' : c - 1}x = 0 이므로 x = 0 또는 x = ${show(1 - c)} 이다.`),
      sayOf(multi(`A ∩ B = B 를 만족시키는 정수 x 를 모두 고르시오.`, opts, want, `x = ${b} · 0 · ${show(1 - c)} 모두 가능`, { c, b, d, step: 4 }), `그러므로 x = ${want.map(show).join(', ')} 이다.`),
    ];
  }
  function c09(a, b, c, r) {
    const n100 = (k) => Math.floor(100 / k), L1 = lcm(a, b), L2 = lcm(a, c), L3 = lcm(L1, L2), A = (k) => `A${sub(k)}`;
    const ok = `${n100(L1)}개, ${n100(L2)}개`, pool = [ok, `${n100(a * b)}개, ${n100(a * c)}개`, `${n100(b)}개, ${n100(c)}개`, `${n100(L2)}개, ${n100(L1)}개`, `${n100(L1) + 1}개, ${n100(L2) + 1}개`];
    const pairs = [...new Set(pool)].slice(0, 4), choices = (r || DS.Rng(`e1|c09|${a}|${b}|${c}`)).shuffle(pairs.slice());
    return [
      sayOf(ch(`${A(a)} ∩ (${A(b)} ∪ ${A(c)}) 을 분배법칙으로 바르게 나타낸 것은?`, [`(${A(a)} ∩ ${A(b)}) ∪ (${A(a)} ∩ ${A(c)})`, `(${A(a)} ∪ ${A(b)}) ∩ (${A(a)} ∪ ${A(c)})`, `(${A(a)} ∩ ${A(b)}) ∩ (${A(a)} ∩ ${A(c)})`], `(${A(a)} ∩ ${A(b)}) ∪ (${A(a)} ∩ ${A(c)})`, '∩ 가 ∪ 위에 분배됨', { step: 1 }),
        `분배법칙에 의해 ${A(a)} ∩ (${A(b)} ∪ ${A(c)}) = (${A(a)} ∩ ${A(b)}) ∪ (${A(a)} ∩ ${A(c)}) 이다.`),
      sayOf(ch(`n(${A(a)} ∩ ${A(b)}), n(${A(a)} ∩ ${A(c)}) 를 차례로 구하면? (100 이하)`, choices, ok, `${A(a)} ∩ ${A(b)} = ${A(L1)} (최소공배수) → ${n100(L1)}개 · ${A(a)} ∩ ${A(c)} = ${A(L2)} → ${n100(L2)}개`, { a, b, c, step: 2 }),
        `${A(a)} ∩ ${A(b)} = ${A(L1)} 이므로 ${n100(L1)}개, ${A(a)} ∩ ${A(c)} = ${A(L2)} 이므로 ${n100(L2)}개이다.`),
      sayOf(nm(`두 집합 ${A(L1)}, ${A(L2)} 에 함께 들어 있는 원소는 몇 개인가?`, n100(L3), `${A(L1)} ∩ ${A(L2)} = ${A(L3)} → ${n100(L3)}개`, { step: 3 }), `${A(L1)} ∩ ${A(L2)} = ${A(L3)} 이므로 겹치는 원소는 ${n100(L3)}개이다.`),
      sayOf(nm(`n(${A(a)} ∩ (${A(b)} ∪ ${A(c)})) 의 값은?`, n100(L1) + n100(L2) - n100(L3), `${n100(L1)} + ${n100(L2)} − ${n100(L3)} = ${n100(L1) + n100(L2) - n100(L3)}`, { a, b, c, step: 4 }),
        `그러므로 n(${A(a)} ∩ (${A(b)} ∪ ${A(c)})) = ${n100(L1)} + ${n100(L2)} − ${n100(L3)} = ${n100(L1) + n100(L2) - n100(L3)} 이다.`),
    ];
  }
  function c10(N, k, m, r) {
    const A = mults(k, N), B = divs(m), I = inter(A, B), u = A.length + B.length - I.length;
    const ok = `n(A) = ${A.length}, n(B) = ${B.length}`, pool = [ok, `n(A) = ${A.length}, n(B) = ${B.length - 1}`, `n(A) = ${A.length + 1}, n(B) = ${B.length}`, `n(A) = ${B.length}, n(B) = ${A.length}`, `n(A) = ${A.length - 1}, n(B) = ${B.length - 1}`];
    const choices = (r || DS.Rng(`e1|c10|${N}|${k}|${m}`)).shuffle([...new Set(pool)].slice(0, 4));
    return [
      sayOf(ch(`Aᶜ ∩ Bᶜ 와 같은 집합은?`, ['(A ∪ B)ᶜ', '(A ∩ B)ᶜ', 'A ∪ B'], '(A ∪ B)ᶜ', '드모르간의 법칙', { step: 1 }), `드모르간의 법칙에 의해 Aᶜ ∩ Bᶜ = (A ∪ B)ᶜ 이다.`),
      sayOf(ch(`U = {x | x는 ${N} 이하의 자연수}, A = {x | x는 ${k}의 배수}, B = {x | x는 ${m}의 약수} 일 때 n(A), n(B) 는?`, choices, ok, `A = ${st(A)} · B = ${st(B)}`, { N, k, m, step: 2 }), `A = ${st(A)} 이므로 n(A) = ${A.length}, B = ${st(B)} 이므로 n(B) = ${B.length} 이다.`),
      sayOf(nm(`n(A ∪ B) 의 값은?`, u, `A ∩ B = ${st(I)} → ${A.length} + ${B.length} − ${I.length} = ${u}`, { step: 3 }), `A ∩ B = ${st(I)} 이므로 n(A ∪ B) = ${A.length} + ${B.length} − ${I.length} = ${u} 이다.`),
      sayOf(nm(`n(Aᶜ ∩ Bᶜ) 의 값은?`, N - u, `${N} − ${u} = ${N - u}`, { N, k, m, step: 4 }), `그러므로 n(Aᶜ ∩ Bᶜ) = n(U) − n(A ∪ B) = ${N} − ${u} = ${N - u} 이다.`),
    ];
  }
  function c11(T, a, b) { // #48 = 7차시 문제 6 꼴 4단계
    const inc = a >= b ? 'B ⊂ A' : 'A ⊂ B', rev = a >= b ? 'A ⊂ B' : 'B ⊂ A', mx = Math.min(a, b), mn = a + b - T;
    return [
      sayOf(ch(`동아리 회원 ${T}명 중 A 코스 ${a}명, B 코스 ${b}명일 때 두 코스를 모두 다녀온 회원 수가 가장 많을 때는?`, [inc, rev, 'A ∩ B = ∅', 'A ∪ B = U'], inc, `작은 쪽이 큰 쪽 안에 쏙 들어갈 때 A ∩ B 가 가장 큼`, { step: 1 }), `${inc} 일 때 두 코스를 모두 다녀온 회원 수가 가장 많다.`),
      sayOf(nm(`두 코스를 모두 다녀온 회원 수의 최댓값은?`, mx, `${inc} 이면 n(A ∩ B) = ${mx}`, { step: 2 }), `그러므로 최댓값은 ${mx} 이다.`),
      sayOf(ch(`두 코스를 모두 다녀온 회원 수가 가장 적을 때는?`, [`A ∪ B = U (곧 n(A ∪ B) = ${T})`, 'A ∩ B = ∅', 'B ⊂ A', 'A ⊂ B'], `A ∪ B = U (곧 n(A ∪ B) = ${T})`, `n(A ∪ B) 가 가장 클 때(= ${T})`, { step: 3 }), `A ∪ B = U, 곧 n(A ∪ B) = ${T} 일 때 가장 적다.`),
      sayOf(nm(`두 코스를 모두 다녀온 회원 수의 최솟값은?`, mn, `${a} + ${b} − ${T} = ${mn}`, { T, a, b, step: 4 }), `그러므로 최솟값은 ${a} + ${b} − ${T} = ${mn} 이다.`),
    ];
  }
  function c12(N, p, q, rem, r) { // #48 = 7차시 문제 7 꼴 5단계
    const bad = range(1, N - 1).filter((x) => x % p === 0 && x % q === rem), n = N - 1 - bad.length, L2 = lcm(p, q);
    return [
      sayOf(nm(`${N} 미만의 자연수는 모두 몇 개인가?`, N - 1, `1, 2, …, ${N - 1} → ${N - 1}개`, { step: 1 }), `${N} 미만의 자연수는 ${N - 1}개이다.`),
      sayOf(ch(`A = {${p}의 배수}, B = {${ro(q)} 나눈 나머지가 ${rem}} 일 때 「${p}의 배수가 아니거나 ${ro(q)} 나눈 나머지가 ${iga(rem)} 아닌 수」의 집합은?`, ['(A ∩ B)ᶜ', '(A ∪ B)ᶜ', 'A ∩ Bᶜ'], '(A ∩ B)ᶜ', 'Aᶜ ∪ Bᶜ = (A ∩ B)ᶜ (드모르간)', { step: 2 }), `「A 가 아니거나 B 가 아닌」 수의 집합은 Aᶜ ∪ Bᶜ = (A ∩ B)ᶜ 이다.`),
      sayOf(nm(`A ∩ B 의 가장 작은 원소는?`, bad[0], `${p}의 배수 중 ${ro(q)} 나눈 나머지가 ${rem}인 가장 작은 수 → ${bad[0]}`, { step: 3 }), `A ∩ B 의 가장 작은 원소는 ${bad[0]} 이다.`),
      sayOf(ch(`A ∩ B 의 원소는 몇씩 커지는가?`, r.shuffle([...new Set([L2, p, q, p + q, p * q])]).map(String), String(L2), `${gwa(p)} ${q} 의 최소공배수 → ${L2}`, { step: 4 }), `${gwa(p)} ${q} 의 최소공배수 ${L2} 씩 커지므로 A ∩ B = ${st(bad)} 이다.`),
      sayOf(nm(`구하는 자연수의 개수는?`, n, `${N - 1} − ${bad.length} = ${n}`, { N, p, q, rem, step: 5 }), `그러므로 구하는 개수는 ${N - 1} − ${bad.length} = ${n} 이다.`),
    ];
  }
  const CARGS = { // 숫자 바뀐 사슬 (각 방 r 생성기와 같은 조건 · 첫 시도 숫자 빼기 · 집합 원소가 겹치지 않게)
    q07: (r) => { for (;;) { const p = r.pick([4, 6, 8, 9, 10, 12]), q = r.pick([2, 3, 4]), N = q * r.int(4, 7), B = mults(q, N), D = minus(B, divs(p)); if (p === 6 && q === 3 && N === 18) continue; if (inter(B, divs(p)).length && D.length >= 2 && D.length <= 5) return [p, q, N]; } },
    q08: (r) => { for (;;) { const c = r.int(2, 5), b = r.int(2, 6), d = r.int(6, 9); if (b === d || b === 1 - c || b * b + c * b === d || (c === 3 && b === 5 && d === 7)) continue; return [c, b, d]; } },
    q09: (r) => { for (;;) { const a = r.int(2, 6), [b, c] = r.shuffle(range(3, 10)).slice(0, 2); if (b === a || c === a || lcm(a, b) > 50 || lcm(a, c) > 50 || lcm(a, b) === lcm(a, c) || (a === 6 && b === 4 && c === 10)) continue; return [a, b, c]; } },
    q10: (r) => { for (;;) { const N = r.pick([30, 36, 40, 48, 50]), k = r.int(4, 9), m = r.pick([24, 30, 32, 36, 40, 48].filter((x) => x <= N)); if (N === 40 && k === 8 && m === 32) continue; if (inter(mults(k, N), divs(m)).length >= 2) return [N, k, m]; } },
    q11: (r) => { for (;;) { const T = r.int(30, 50), a = r.int(Math.ceil(T / 2), T - 3), b = r.int(Math.ceil(T / 3), T - 5); if (T === 50 && a === 34 && b === 27) continue; if (a + b > T + 2 && b < a) return [T, a, b]; } },
    q12: (r) => { for (;;) { const N = r.pick([50, 60, 80, 100]), p = r.int(3, 8), q = r.int(3, 6), rem = r.int(1, q - 1); if (N === 100 && p === 6 && q === 4 && rem === 2) continue; const k = range(1, N - 1).filter((x) => x % p === 0 && x % q === rem).length; if (k >= 2 && k <= 8) return [N, p, q, rem]; } },
  };
  // 📜 #48 · #44 ⑤ 한 판 더(숫자 바뀐 사슬) = 문제 카드 맨 위 원문 문제 (첫 판 없음)
  const PROB = {
    q07: (p, q, N) => `두 집합 A = {x | x는 ${p}의 약수}, B = {x | x는 ${N} 이하의 ${q}의 배수}에 대하여 A ∩ X = ∅ 과 B ∪ X = B 를 만족시키는 집합 X 의 개수를 구하시오.`,
    q08: (c, b, d) => `두 집합 A = {x² + ${c}x, ${b}, ${d}}, B = {x, ${d}}에 대하여 A ∩ B = B 를 만족시키는 정수 x 를 모두 구하시오.`,
    q11: (T, a, b) => `동아리 회원 ${T}명 중 A 코스를 다녀온 회원은 ${a}명, B 코스는 ${b}명이다. 두 코스를 모두 다녀온 회원 수의 최댓값과 최솟값을 구하시오.`,
    q12: (N, p, q, rem) => `${N} 미만의 자연수 중에서 ${p}의 배수가 아니거나 ${ro(q)} 나누었을 때의 나머지가 ${iga(rem)} 아닌 자연수의 개수를 구하시오.`,
  };
  const withProb = (id, fn, book) => (pass, r) => { const args = pass === 0 ? book : CARGS[id](r), items = fn(...args, r); if (pass > 0 && PROB[id]) items.forEach((it) => { it.problem = PROB[id](...args); }); return items; };
  const CHAIN = {
    q07: withProb('q07', c07, [6, 3, 18]),
    q08: withProb('q08', c08, [3, 5, 7]),
    q09: (pass, r) => c09(...(pass === 0 ? [6, 4, 10] : CARGS.q09(r)), r),
    q10: (pass, r) => c10(...(pass === 0 ? [40, 8, 32] : CARGS.q10(r)), r),
    q11: withProb('q11', c11, [50, 34, 27]),
    q12: withProb('q12', c12, [100, 6, 4, 2]),
  };
  const CHAIN_VIDEO = { q07: 'assets/video/e1-34.mp4', q10: 'assets/video/e1-35.mp4', q11: 'assets/video/e1-36-v3.mp4' }; // 기회 1칸 남으면 여는 해설 영상 (없는 방 = 📜 풀이 첫 두 줄)

  // 소문제마다 학습지 번호(ref) · 풀이 영상(video = 교과서 숫자로 푼 예제, 한 번 틀린 뒤 열림). 영상이 없는 문항(01 · 02 · 06 · 08 · 09 · 12)은 주문서 37~40 대기
  const V = { '03': 'assets/video/v03-22.mp4', '04': 'assets/video/e1-32.mp4', '05': 'assets/video/e1-33.mp4', '07': 'assets/video/e1-34.mp4', '10': 'assets/video/e1-35.mp4', '11': 'assets/video/e1-36-v3.mp4' };
  const tagRefs = (arr, refs) => arr.map((q, i) => Object.assign(q, { ref: refs[i] }, V[refs[i].slice(0, 2)] ? { video: V[refs[i].slice(0, 2)] } : {}));
  // 🏰 성채던전 1층 (2026-11-05 사용자 확정): 방 하나 = 문항 하나 (12방) · no = 그 문항을 풀 수 있는 차시 (우리 반이 그 차시 수업을 열면 방이 열림)
  //   12번 = 👑 보스 방: 열린 방(보스 제외)의 60% 이상(올림)을 처치해야 열림 · 옛 7마리(e1~eb) 기록은 LEGACY 로 이어 셈
  const R = (id, no, title, sprite, fn, refs, extra = {}) => ({ id, no, title, sprite, make: (a, r) => tagRefs(fn(a ? r : null), refs), ...extra });
  const ROOMS = [
    R('q01', 2, '01 집합인 것 · 아닌 것', 'castle1:1', m01, ['01 ⑴', '01 ⑵', '01 ⑶']),
    R('q02', 2, '02 원소나열법', 'castle1:0', m02, ['02 ⑴', '02 ⑵']),
    R('q03', 3, '03 포함 관계', 'castle1:2', m03, ['03 ⑴', '03 ⑵']),
    R('q04', 4, '04 교집합의 원소의 개수', 'castle1:3', m04, ['04']),
    R('q05', 5, '05 교 · 합 · 여 · 차집합', 'castle1:4', m05, ['05 ⑴', '05 ⑵', '05 ⑶', '05 ⑷']),
    R('q06', 4, '06 서로소인 집합', 'castle1:3@h300', m06, ['06']),
    R('q07', 4, '07 조건을 만족하는 X (서술형)', 'castle1:2@h300', m07, ['07 서술형'], { photo: true }),
    R('q08', 4, '08 미지수 x', 'castle1:0@h60', m08, ['08'], { note: 'B 의 원소가 모두 A 에 있어야 해요 — x 가 A 의 어느 원소와 같을 수 있을까?' }),
    R('q09', 4, '09 배수의 집합', 'castle1:1@h300', m09, ['09']),
    R('q10', 5, '10 여집합의 원소의 개수', 'castle1:4@h60', m10, ['10']),
    R('q11', 4, '11 겹침의 최대 · 최소 (서술형)', 'castle1:3@h60', m11, ['11 서술형', '11 서술형'], { photo: true }),
    R('q12', 6, '👑 12 「~이 아니거나」의 개수', 'castleboss:0', m12, ['12'], { boss: true }),
  ];
  const MONSTERS = Object.fromEntries(ROOMS.map((r) => [r.id, r]));
  // 옛 7마리 → 방 (예전 중단원던전 꼭대기 층에서 처치한 기록을 이어 셈)
  const LEGACY = { e1: ['q01', 'q02'], e2: ['q03', 'q04'], e3: ['q05'], e4: ['q06', 'q07'], e5: ['q08'], e6: ['q09', 'q10'], eb: ['q11', 'q12'] };

  DS.Lessons.register({
    id: 'eval-1', no: 0, eval: true, after: 6, floor: 1, // 🏰 성채던전 1층 (레이드 아님 · 차시 목록 · 테스트 모드에 안 나옴) · after = 마지막 차시
    title: '집합 중단원 마무리', unit: '공통수학2 Ⅱ-1 집합 · 평가1', sheet: '(평가1) 집합_중단원평가',
    theme: '08-crypt', // 보라 차원문 안 (묘실 배경)
    goal: '집합 단원 개념을 스스로 점검한다 · 틀린 문항으로 보충할 부분을 찾는다',
    // 🎬 (평가1) 32~36 — 교과서 숫자로 푼 예제 (모션그래픽 방 제작 · 2026-11-03)
    videos: { q04: 'assets/video/e1-32.mp4', q05: 'assets/video/e1-33.mp4', q07: 'assets/video/e1-34.mp4', q10: 'assets/video/e1-35.mp4', q11: 'assets/video/e1-36-v3.mp4' },
    steps: [],
    monsters: MONSTERS,
    rooms: ROOMS.map(({ id, no, title, boss, photo }) => ({ id, no, title, boss: !!boss, photo: !!photo, chain: !!CHAIN[id] })), // photo = 서술형 → 📷 사진 분석 전까지 잠금 (2026-11-05)
    legacy: LEGACY,
    items(id, seed, attempt) { return MONSTERS[id].make(attempt, DS.Rng(`${seed}|${id}|${attempt}`)); },
    chain: Object.keys(CHAIN), chainVideo: CHAIN_VIDEO, // ⚔ 소레이드 방 (혼자 · 성채용 규칙은 js/raid/bonus.js chainFight)
    chainItems(id, seed, pass) { return CHAIN[id](pass, DS.Rng(pass === 0 ? `e1|chain|${id}` : `${seed}|${id}|c${pass}`)); },
  });
})();
