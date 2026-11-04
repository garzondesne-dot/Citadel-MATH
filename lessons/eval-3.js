// 🏰 성채던전 2층 「집합과 명제 대단원」 (2026-11-05 사용자 컨펌 · 변경 제안 v1 · (평가3) 집합과명제_대단원평가 교과서 99~101쪽 17문항)
//   방 하나 = 문항 하나 · no = 그 문항을 풀 수 있는 차시 (명제 7~10차시는 차시 파일을 만들 때 다시 확인) · 17번 = 👑 보스(대단원의 군주)
//   교과서 숫자 · 보기를 그대로 쓰지 않음: 첫 시도 = 변경 제안 v1 의 바꾼 문제 · 재도전 = 숫자 · 보기를 또 바꿈 (같은 시드 → 같은 문제)
//   서술형 15 · 16 · 17 은 photo: true → 📷 사진 분석(v0.9.10)이 생기기 전까지 잠금 (사용자 2026-11-05). 아래 문항은 사진 분석 때 「답 확인」 칸으로도 씀
//   검산: tests/eval3.test.js 가 각 문항의 check 값으로 정답을 따로 계산 (이 파일의 계산을 쓰지 않음)
(function () {
  const S = DS.SetGen;
  const st = (a) => (a.length ? S.setStr(a) : '∅');
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const sorted = (a) => a.slice().sort((x, y) => x - y);
  const divs = (n) => range(1, n).filter((d) => n % d === 0);
  const nm = (question, answer, solution, check) => ({ type: 'number', question, answer, solution, check });
  const ch = (question, choices, ans, solution, check) => ({ type: 'choice', question, choices, answerIndex: choices.indexOf(ans), answer: ans, solution, check });
  const multi = (question, opts, want, solution, check) => ({ type: 'multi', question, options: opts.map(String), answer: opts.map((x, i) => (want.includes(x) ? i : -1)).filter((i) => i >= 0), solution, check });
  const circ = ['①', '②', '③', '④', '⑤'];
  const numbered = (arr) => arr.map((t, i) => `${circ[i]} ${t}`);
  const sq = (n) => { const r = Math.round(Math.sqrt(n)); return r * r === n ? r : null; };
  const sgn = (k) => (k >= 0 ? `+ ${k}` : `− ${-k}`);

  // 01 집합인 것
  const NOT = ['노래를 잘 부르는 사람의 모임', '귀여운 동물의 모임', '빠른 자동차의 모임', '맛있는 음식의 모임', '키가 큰 학생의 모임', '재미있는 책의 모임', '큰 수의 모임', '멋진 옷의 모임'];
  const YES = ['우리 반에서 안경을 쓴 학생의 모임', '10보다 작은 자연수의 모임', '12의 약수의 모임', '한 자리 홀수의 모임', '우리 학교 1학년 학생의 모임'];
  function m01(r) {
    let opts = [NOT[0], NOT[1], NOT[2], YES[0], NOT[3]], yes = YES[0];
    if (r) { yes = r.pick(YES); opts = r.shuffle([...r.shuffle(NOT).slice(0, 4), yes]); }
    const ch5 = numbered(opts);
    return [ch('01 다음에서 집합인 것은?', ch5, ch5[opts.indexOf(yes)], `「${yes}」만 대상이 분명하다 · 나머지는 기준이 사람마다 다르다`, { kind: 'set', yes, opts })];
  }
  // 02 ∈ · ⊂ 옳은 것
  function m02(r) {
    let N = 12;
    if (r) N = r.pick([12, 18, 20, 28, 30]);
    const D = divs(N), non = range(2, N - 1).filter((x) => N % x !== 0);
    const k = r ? r.pick(non) : 8, d1 = D[1], d2 = D[2], x = r ? r.pick(non.filter((v) => v !== k)) : 8;
    const t3 = r ? `{${d1}, ${d2}, ${x}}` : '{2, 4, 8}'; // 첫 시도 = 변경 제안 v1 그대로
    const ops = [`${k} ∈ A`, `{${N}} ⊂ A`, `${t3} ⊂ A`, `{${d1}, ${d2}} ∈ A`, `A = ${st(D.slice(0, -1))}`];
    const order = r ? r.shuffle([0, 1, 2, 3, 4]) : [0, 1, 2, 3, 4], c5 = numbered(order.map((i) => ops[i]));
    return [ch(`02 집합 A = {x | x는 ${N}의 약수} 에 대하여 다음에서 옳은 것은?`, c5, c5[order.indexOf(1)], `A = ${st(D)} → {${N}} 은 원소 ${N} 하나짜리 부분집합 · {…} ∈ A 는 틀린 표현`, { kind: 'div', N, k, d1, d2, x, order })];
  }
  // 03 A = B 일 때 a + b
  function m03(r) {
    let a0 = 2, b0 = 3, m = 2;
    if (r) { a0 = r.int(1, 5); b0 = r.int(2, 6); m = r.int(1, b0 - 1); }
    const k = 2 * a0, t = -a0 * a0, s = b0 * b0 - m * b0;
    const tb = (c) => (c === 1 ? '' : c);
    return [nm(`03 자연수 a 와 b 에 대하여 두 집합 A = {${s}, a² − ${tb(k)}a}, B = {${String(t).replace('-', '−')}, b² − ${tb(m)}b} 가 서로 같을 때, a + b 의 값은?`, a0 + b0,
      `a² − ${k}a = ${t} → (a − ${a0})² = 0 → a = ${a0} · b² − ${m}b = ${s} → b = ${b0} (자연수) → ${a0 + b0}`, { kind: 'eq', k, t, m, s })];
  }
  // 04 A ⊂ X ⊂ B 인 X 의 개수
  function m04(r) {
    let N = 12, p = 2, q = 3;
    if (r) { N = r.pick([12, 18, 20, 24, 30, 36]); const D = divs(N).filter((d) => d > 1 && d < N); [p, q] = sorted(r.shuffle(D).slice(0, 2)); }
    const n = divs(N).length;
    return [nm(`04 두 집합 A = {x | x² − ${p + q}x + ${p * q} = 0}, B = {x | x는 ${N}의 약수} 에 대하여 A ⊂ X ⊂ B 를 만족시키는 집합 X 의 개수는?`, 2 ** (n - 2),
      `A = {${p}, ${q}}, n(B) = ${n} → ${p} · ${q} 를 반드시 포함 → 2^(${n} − 2) = ${2 ** (n - 2)}`, { kind: 'xs', p, q, N })];
  }
  // 05 Aₙ ⊂ A_M 인 n 의 최댓값 (상)
  function m05(r) {
    let c = 9, M = 25;
    if (r) { c = r.pick([2, 3, 4, 5, 9]); M = r.int(8, 40); }
    const L = (() => { let x = Math.floor(Math.sqrt(c * M)); while (x * x > c * M) x--; return x % 2 ? x : x - 1; })();
    const ans = Math.floor(((L + 2) ** 2 - 1) / c);
    const sub = (s) => String(s).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[d]);
    return [nm(`05 자연수 n 에 대하여 Aₙ = {x | x는 √(${c}n) 이하의 홀수} 일 때, Aₙ ⊂ A${sub(M)} 을 만족시키는 n 의 최댓값은?`, ans,
      `A${sub(M)} = ${L} 이하의 홀수 → √(${c}n) < ${L + 2} → ${c}n < ${(L + 2) ** 2} → n = ${ans}`, { kind: 'odd', c, M })];
  }
  // 06 (A ∪ B) ∩ (A ∪ C) 원소의 합 (분배법칙)
  function m06(r) {
    let N = 12, k = 2, D = 12;
    if (r) for (;;) { N = r.pick([10, 12, 15, 18, 20]); k = r.pick([2, 3]); D = r.pick(range(6, N).filter((d) => divs(d).length >= 4)); const I = range(1, N).filter((x) => x % k === 0 && D % x === 0); if (I.length >= 2) break; }
    const I = range(1, N).filter((x) => x % k === 0 && D % x === 0), sum = I.reduce((a, b) => a + b, 0);
    return [nm(`06 전체집합 U = {1, 2, 3, …, ${N}} 의 세 부분집합 A, B, C 에 대하여 A ∪ B = {x | x는 ${k}의 배수}, A ∪ C = {x | x는 ${D}의 약수} 일 때, A ∪ (B ∩ C) 의 모든 원소의 합은?`, sum,
      `A ∪ (B ∩ C) = (A ∪ B) ∩ (A ∪ C) = ${st(I)} → ${sum}`, { kind: 'dist', N, k, D })];
  }
  // 07 n(A − B)
  function m07(r) {
    let x = 8, y = 5, z = 25;
    if (r) { x = r.int(3, 12); y = r.int(2, 9); z = x + y + r.int(4, 15); }
    return [nm(`07 전체집합 U 의 두 부분집합 A 와 B 에 대하여 n(Aᶜ ∩ B) = ${x}, n(A ∩ B) = ${y}, n(A ∪ B) = ${z} 일 때, n(A − B) 는?`, z - x - y,
      `n(A − B) = n(A ∪ B) − n(Aᶜ ∩ B) − n(A ∩ B) = ${z} − ${x} − ${y} = ${z - x - y}`, { kind: 'diff', x, y, z })];
  }
  // 08 진리집합 · 모든 · 어떤 — 옳지 않은 것 (글자 바꿔 재도전)
  function m08(r) {
    const [a, b] = r ? r.pick([['q', 'p'], ['p', 'q'], ['r', 's'], ['s', 'r']]) : ['q', 'p'];
    const A = a.toUpperCase(), B = b.toUpperCase();
    const good = [`~${a} 의 진리집합은 ${A}ᶜ 이다.`, `명제 ${a} → ${b} 가 참이면 ${B}ᶜ ⊂ ${A}ᶜ 이다.`, `${A} ≠ U 이면 「모든 x 에 대하여 ${a} 이다.」는 거짓이다.`, `${A} ≠ ∅ 이면 「어떤 x 에 대하여 ${a} 이다.」는 참이다.`];
    const bad = `${B} ⊂ ${A} 이면 명제 ${a} → ${b} 는 참이다.`;
    const opts = r ? r.shuffle([...good, bad]) : [good[0], bad, good[1], good[2], good[3]];
    const c5 = numbered(opts);
    return [ch(`08 전체집합 U 에 대하여 두 조건 ${a < b ? `${a}, ${b}` : `${b}, ${a}`} 의 진리집합을 각각 ${a < b ? `${A}, ${B}` : `${B}, ${A}`} 라 할 때, 다음에서 옳지 않은 것은?`, c5, c5[opts.indexOf(bad)],
      `${a} → ${b} 가 참 ⇔ ${A} ⊂ ${B} · 「${B} ⊂ ${A}」는 반대`, { kind: 'truth', a, b, bad })];
  }
  // 09 모든 양수 x 에 대하여 kx − a + c > 0 → a ≤ c
  function m09(r) {
    let k = 2, c = 3;
    if (r) { k = r.int(1, 5); c = r.int(2, 6); }
    const want = range(1, c);
    return [multi(`09 명제 「모든 양수 x 에 대하여 ${k === 1 ? '' : k}x − a + ${c} > 0 이다.」가 참이 되도록 하는 자연수 a 의 값을 모두 고르시오.`, range(1, 8), want,
      `x 가 0 에 가까워져도 성립해야 함 → −a + ${c} ≥ 0 → a ≤ ${c} → ${want.join(', ')}`, { kind: 'all', k, c })];
  }
  // 10 X 의 역이 참일 때 항상 참인 것 (역의 대우)
  const neg = (s) => (s.startsWith('~') ? s.slice(1) : `~${s}`);
  function m10(r) {
    let [h, c] = r ? r.pick([['p', '~q'], ['~p', 'q'], ['p', 'q'], ['~p', '~q']]) : ['p', '~q'];
    const conv = [c, h], ans = `${neg(conv[1])} → ${neg(conv[0])}`;
    const pool = ['p → q', '~p → q', 'q → p', '~q → ~p', 'q → ~p', 'p → ~q', '~p → ~q', '~q → p'].filter((x) => x !== ans && x !== `${conv[0]} → ${conv[1]}`);
    const wrongs = r ? r.shuffle(pool).slice(0, 4) : ['p → q', 'q → p', '~q → ~p', 'q → ~p'];
    const opts = r ? r.shuffle([...wrongs, ans]) : [wrongs[0], ans, wrongs[1], wrongs[2], wrongs[3]];
    const c5 = numbered(opts);
    return [ch(`10 명제 ${h} → ${c} 의 역이 참일 때, 다음에서 항상 참인 것은?`, c5, c5[opts.indexOf(ans)], `역 ${conv[0]} → ${conv[1]} 가 참 → 그 대우 ${ans} 도 참`, { kind: 'conv', h, c })];
  }
  // 11 p 가 q 의 충분조건인 정수 a 의 합 (상)
  const sol11 = (c1, c2) => range(-60, 60).filter((a) => { const lo = Math.min(0, 2 * a), hi = Math.max(0, 2 * a); return [a - c1, c2 - 2 * a].every((x) => x >= lo && x <= hi); });
  function m11(r) {
    let c1 = 5, c2 = 14;
    if (r) for (;;) { c1 = r.int(2, 7); c2 = r.int(8, 20); if (sol11(c1, c2).length >= 2) break; }
    const s = sol11(c1, c2), sum = s.reduce((x, y) => x + y, 0);
    return [nm(`11 실수 x 에 대하여 두 조건 p: (x − a + ${c1})(x + 2a − ${c2}) = 0, q: x(x − 2a) ≤ 0 일 때, p 가 q 이기 위한 충분조건이 되도록 하는 모든 정수 a 의 값의 합은?`, sum,
      `P = {a − ${c1}, ${c2} − 2a} ⊂ Q (0 과 2a 사이) → a = ${s.join(', ')} → ${sum}`, { kind: 'suff', c1, c2 })];
  }
  // 12 진리집합 관계 → 옳은 것 (글자 바꿔 재도전): Y ⊂ Z, X ∩ Z = ∅, X ∪ Z = U
  function m12(r) {
    const [x, y, z] = r ? r.pick([['p', 'q', 'r'], ['q', 'p', 'r'], ['r', 'q', 'p'], ['p', 'r', 'q'], ['q', 'r', 'p']]) : ['p', 'q', 'r'];
    const U = (s) => s.toUpperCase();
    const ok = `~${x} 는 ${y} 이기 위한 필요조건이다.`;
    const opts0 = [`${x} 는 ${y} 이기 위한 충분조건이다.`, `${y} 는 ${z} 이기 위한 필요조건이다.`, ok, `${z} 은 ${x} 이기 위한 충분조건이다.`, `~${z} 은 ~${y} 이기 위한 필요조건이다.`];
    const opts = r ? r.shuffle(opts0) : opts0, c5 = numbered(opts);
    return [ch(`12 전체집합 U 에 대하여 세 조건 p, q, r 의 진리집합을 각각 P, Q, R 이라 하자. ${U(y)} ⊂ ${U(z)}, ${U(x)} ∩ ${U(z)} = ∅, ${U(x)} ∪ ${U(z)} = U 일 때, 다음에서 옳은 것은?`, c5, c5[opts.indexOf(ok)],
      `${U(z)} = ${U(x)}ᶜ 이고 ${U(y)} ⊂ ${U(x)}ᶜ → ${y} ⇒ ~${x} → ~${x} 는 ${y} 의 필요조건`, { kind: 'venn', x, y, z, opts })];
  }
  // 13 ㄱ · ㄴ · ㄷ 모두 고르기 (p: a² + b² = 0, q: |a + b| = |a| + |b|, r: ab ≥ 0)
  const POOL13 = [
    ['p 는 q 이기 위한 충분조건이다.', 'p', 'q'], ['~r 은 ~p 이기 위한 충분조건이다.', '~r', '~p'], ['r 은 p 이기 위한 충분조건이다.', 'r', 'p'],
    ['q 는 r 이기 위한 필요충분조건이다.', 'q<>r', ''], ['p 는 r 이기 위한 필요조건이다.', 'r', 'p'], ['~q 는 ~p 이기 위한 충분조건이다.', '~q', '~p'],
  ];
  function m13(r) {
    const pick = r ? (() => { for (;;) { const s = r.shuffle([0, 1, 2, 3, 4, 5]).slice(0, 3); if (s.some((i) => [0, 1, 3, 5].includes(i)) && s.some((i) => [2, 4].includes(i))) return s; } })() : [0, 1, 2];
    const lab = ['ㄱ', 'ㄴ', 'ㄷ'], lines = pick.map((i, k) => `${lab[k]}. ${POOL13[i][0]}`);
    const want = pick.map((i, k) => ([0, 1, 3, 5].includes(i) ? lab[k] : null)).filter(Boolean);
    return [multi(`13 실수 a 와 b 에 대하여 세 조건 p: a² + b² = 0, q: |a + b| = |a| + |b|, r: ab ≥ 0 일 때, 옳은 것을 모두 고르시오.\n${lines.join('\n')}`, lab, want,
      'p ⇔ (a = b = 0) · q ⇔ ab ≥ 0 ⇔ r · p ⇒ q, p ⇒ r 이지만 r 이어도 p 가 아닐 수 있다', { kind: 'abs', pick })];
  }
  // 14 (x + A/y)(1/x + By) 의 최솟값 (AB 는 제곱수)
  function m14(r) {
    let A = 4, B = 9;
    if (r) for (;;) { A = r.int(1, 9); B = r.int(1, 16); if (sq(A * B) && A * B > 1) break; }
    const s = sq(A * B), ans = (1 + s) ** 2;
    return [nm(`14 x > 0 이고 y > 0 일 때, (x + ${A}/y)(1/x + ${B === 1 ? '' : B}y) 의 최솟값은?`, ans,
      `${1 + A * B} + ${B}xy + ${A}/(xy) ≥ ${1 + A * B} + 2√${A * B} = ${ans}`, { kind: 'amgm', A, B })];
  }
  // 15 (서술형) 두 동아리 · 둘 다 가입한 여학생 수 — 📷 사진 분석 전까지 잠금
  function m15(r) {
    let M = 26, F = 22, both = 10;
    if (r) for (;;) { M = r.int(18, 32); F = r.int(14, M - 1); both = r.int(6, 14); if ((both - (M - F)) % 2 === 0 && both - (M - F) >= 0 && both <= F) break; }
    const f = (both - (M - F)) / 2;
    return [nm(`15 두 동아리 A 또는 B 에 가입한 남학생 ${M}명과 여학생 ${F}명을 조사하였더니, A 에 가입한 학생 수와 B 에 가입한 학생 수의 합은 ${M + F + both} 이고, 한 동아리에만 가입한 남학생 수와 여학생 수가 같았다. 두 동아리에 모두 가입한 여학생 수는? (풀이는 학습지에)`, f,
      `n(A ∩ B) = ${M + F + both} − ${M + F} = ${both} · ${M} − m = ${F} − f, m + f = ${both} → f = ${f}`, { kind: 'club', M, F, S: M + F + both })];
  }
  // 16 (서술형) 귀류법 √k — 📷 사진 분석 전까지 잠금
  function m16(r) {
    const k = r ? r.pick([2, 3, 5, 7]) : 5;
    return [nm(`16 「√${k} 은 유리수가 아니다」 귀류법: √${k} = m/n (m, n 은 서로소인 자연수) 이라 하면 m² = ☐ × n² 이다. ☐ 는?`, k, `양변을 제곱 → m² = ${k}n²`, { kind: 'irr', k, step: 1 }),
      nm(`16 (이어서) m 은 ${k}의 배수이므로 m = ${k}t 라 하면 n² = ☐ × t² 이다. ☐ 는?`, k, `${k * k}t² = ${k}n² → n² = ${k}t² → n 도 ${k}의 배수 → 서로소에 모순`, { kind: 'irr', k, step: 2 })];
  }
  // 17 (서술형 · 👑 보스) 2(a³ + b³) ≥ (a + b)(a² + b²) — 📷 사진 분석 전까지 잠금
  function m17(r) {
    const f1 = ['(a + b)(a − b)²', '(a − b)(a + b)²', '(a + b)²(a − b)', '(a − b)³'], f2 = ['a + b > 0, (a − b)² ≥ 0', 'a − b > 0, (a + b)² ≥ 0', 'a > b', 'ab > 0'], f3 = ['a = b', 'a = −b', 'a = 0', 'b = 0'];
    const sh = (a) => (r ? r.shuffle(a) : a);
    return [ch('17 a > 0, b > 0 일 때 2(a³ + b³) − (a + b)(a² + b²) 를 인수분해하면?', sh(f1), f1[0], 'a³ + b³ − a²b − ab² = (a + b)(a − b)²', { kind: 'proof', step: 1 }),
      ch('17 (이어서) 위 식이 0 이상인 까닭은?', sh(f2), f2[0], 'a > 0, b > 0 → a + b > 0, (a − b)² ≥ 0', { kind: 'proof', step: 2 }),
      ch('17 (이어서) 등호가 성립하는 조건은?', sh(f3), f3[0], '(a − b)² = 0 → a = b', { kind: 'proof', step: 3 })];
  }

  const R = (id, no, title, sprite, fn, extra = {}) => ({ id, no, title, sprite, make: (a, r) => fn(a ? r : null).map((q) => Object.assign(q, { ref: id.slice(1) })), ...extra });
  const ROOMS = [
    R('q01', 2, '01 집합인 것', 'castle2:4@h200', m01),
    R('q02', 3, '02 ∈ 와 ⊂', 'castle2:2', m02),
    R('q03', 3, '03 서로 같은 집합', 'castle2:3', m03),
    R('q04', 3, '04 A ⊂ X ⊂ B', 'castle2:1', m04),
    R('q05', 3, '05 Aₙ ⊂ Aₘ 의 최댓값', 'castle2:0', m05),
    R('q06', 5, '06 분배법칙', 'castle2:3@h300', m06),
    R('q07', 5, '07 차집합의 원소의 개수', 'castle2:4', m07),
    R('q08', 7, '08 진리집합 · 모든 · 어떤', 'castle2:0@h60', m08),
    R('q09', 7, '09 「모든」 명제의 참', 'castle2:1@h300', m09),
    R('q10', 8, '10 역과 대우', 'castle2:2@h300', m10),
    R('q11', 9, '11 충분조건 (상)', 'castle2:1@h60', m11),
    R('q12', 9, '12 진리집합의 포함과 조건', 'castle2:2@h60', m12),
    R('q13', 9, '13 필요 · 충분 ㄱㄴㄷ', 'castle2:0@h200', m13),
    R('q14', 10, '14 절대부등식 최솟값', 'castle2:3@h60', m14),
    R('q15', 4, '15 두 동아리 (서술형)', 'castle2:4@h60', m15, { photo: true }),
    R('q16', 10, '16 귀류법 (서술형)', 'castle2:2@h200', m16, { photo: true }),
    R('q17', 10, '👑 17 절대부등식 증명 (서술형)', 'castleboss:1', m17, { boss: true, photo: true }),
  ];
  const MONSTERS = Object.fromEntries(ROOMS.map((r) => [r.id, r]));

  DS.Lessons.register({
    id: 'eval-3', no: 0, eval: true, after: 10, floor: 2, // 🏰 성채던전 2층 (레이드 아님 · 차시 목록 · 테스트 모드에 안 나옴)
    title: '집합과 명제 대단원', unit: '공통수학2 Ⅱ 집합과 명제 · 평가3', sheet: '(평가3) 집합과명제_대단원평가',
    theme: '08-crypt',
    goal: '집합과 명제 단원 전체를 스스로 점검한다',
    steps: [],
    monsters: MONSTERS,
    rooms: ROOMS.map(({ id, no, title, boss, photo }) => ({ id, no, title, boss: !!boss, photo: !!photo })),
    legacy: {},
    items(id, seed, attempt) { return MONSTERS[id].make(attempt, DS.Rng(`${seed}|${id}|${attempt}`)); },
  });
})();
