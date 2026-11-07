// 🏰 성채던전 2층 「명제 중단원」 (2026-11-06 사용자 컨펌 · 변경 제안 v1 · 교과서 96~97쪽 중단원 마무리 11문항)
//   방 하나 = 문항 하나 · no = 그 문항을 풀 수 있는 차시 (7 명제와 조건 · 부정 · 진리집합 · 모든/어떤 / 8 참 · 거짓 · 역과 대우 / 9 충분 · 필요 / 10 절대부등식)
//   교과서 숫자 · 보기를 그대로 쓰지 않음: 첫 시도 = 변경 제안 v1 의 바꾼 문제 · 재도전 = 숫자 · 보기를 또 바꿈 (같은 시드 → 같은 문제)
//   서술형 07 · 10 은 photo: true → 📷 사진 분석 전까지 잠금 · 👑 11번 = 보스 방 (열린 방의 60%) · 호칭 「논리의 탐정」
//   몬스터 그림: 성채 2(명제 몬스터)를 색 바꿔 씀 · 보스 = 새 그림 오기 전까지 대단원 군주 색 변형
//   검산: tests/eval2.test.js 가 문제 글 · check 값으로 정답을 따로 계산 (이 파일의 계산을 쓰지 않음)
(function () {
  const S = DS.SetGen;
  const st = (a) => (a.length ? S.setStr(a) : '∅');
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const nm = (question, answer, solution, check) => ({ type: 'number', question, answer, solution, check });
  const ch = (question, choices, ans, solution, check) => ({ type: 'choice', question, choices, answerIndex: choices.indexOf(ans), answer: ans, solution, check });
  const multi = (question, opts, want, solution, check) => ({ type: 'multi', question, options: opts.map(String), answer: opts.map((x, i) => (want.includes(x) ? i : -1)).filter((i) => i >= 0), solution, check });
  const R0 = () => DS.Rng('e2|first'); // 첫 시도에서 보기 순서 섞기용 (고정)
  const sgnX = (k, x = 'x') => (k === 0 ? '' : k === 1 ? ` + ${x}` : k === -1 ? ` − ${x}` : k > 0 ? ` + ${k}${x}` : ` − ${-k}${x}`);
  const sgnN = (k) => (k === 0 ? '' : k > 0 ? ` + ${k}` : ` − ${-k}`);
  const show = (n) => String(n).replace(/^-/, '−');
  const KIND = ['참인 명제', '거짓인 명제', '명제 아님'];
  const eun = (n) => `${n}${'2459'.includes(String(n).slice(-1)) ? '는' : '은'}`; // 숫자 끝 읽기: 이 · 사 · 오 · 구 → 는 / 영 · 일 · 삼 · 육 · 칠 · 팔 → 은

  // ── 01 명제 찾기 · 참 · 거짓 ────────────────────────────────
  const VAGUE = ['우리 학교는 멋진 학교이다.', '수학은 재미있는 과목이다.', '이 노래는 좋은 노래이다.', '우리 반 교실은 넓다.', '떡볶이는 맛있는 음식이다.', '가을 하늘은 아름답다.'];
  const q01 = (k, s, kind) => ch(`01 ${k} 「${s}」 는?`, KIND, kind, kind === '명제 아님' ? (/^x/.test(s) ? 'x 의 값에 따라 참 · 거짓이 달라지는 조건 → 명제가 아니다' : '기준이 사람마다 달라 참 · 거짓을 가릴 수 없다 → 명제가 아니다') : `참 · 거짓을 분명히 가릴 수 있다 → ${kind}`, { s01: s });
  function m01(r) {
    if (!r) return [q01('⑴', '√9는 유리수이다.', '참인 명제'), q01('⑵', 'x는 50보다 작은 수이다.', '명제 아님'), q01('⑶', '28은 3의 배수이다.', '거짓인 명제'), q01('⑷', '우리 학교는 멋진 학교이다.', '명제 아님')];
    const sq = r.pick([9, 16, 25, 36, 49]), nsq = r.pick([2, 3, 5, 6, 7, 8, 10]), useSq = r() < 0.5; // √4 = 교과서 숫자라 뺌
    let a, b; do { a = r.int(12, 60); b = r.pick([3, 4, 6, 7]); } while (a === 26 && b === 3); const ok = a % b === 0;
    const list = r.shuffle([
      [`√${eun(useSq ? sq : nsq)} 유리수이다.`.replace(/^√(\d+)(은|는) /, '√$1$2 '), useSq ? '참인 명제' : '거짓인 명제'],
      [`x는 ${r.int(10, 90)}보다 ${r.pick(['작은', '큰'])} 수이다.`, '명제 아님'],
      [`${eun(a)} ${b}의 배수이다.`, ok ? '참인 명제' : '거짓인 명제'],
      [r.pick(VAGUE), '명제 아님'],
    ]);
    return list.map(([s, k], i) => q01('⑴⑵⑶⑷'[i], s, k));
  }

  // ── 02 진리집합 (p · q · ~p · ~q) ────────────────────────────
  function m02(r) {
    let N = 8, r1 = 3, r2 = 4, c = 4;
    if (r) for (;;) { N = r.int(6, 9); r1 = r.int(1, N - 1); r2 = r.int(r1 + 1, N); c = r.int(1, N); if (!(N === 8 && r1 === 3 && r2 === 4 && c === 4) && !(N === 7 && r1 === 2 && r2 === 4 && c === 3)) break; } // 첫 시도 · 교과서 숫자 피함
    const U = range(1, N), P = [r1, r2], Q = U.filter((x) => x !== c);
    const head = `U = {x | x는 ${N} 이하의 자연수}, p: x²${sgnX(-(r1 + r2))}${sgnN(r1 * r2)} = 0, q: x²${sgnX(-2 * c)}${sgnN(c * c)} > 0 일 때`;
    const q = (k, label, want, sol) => multi(`02 ${k} ${head} 조건 ${label} 의 진리집합의 원소를 모두 고르시오.`, U, want, sol, { N, r1, r2, c, ask: label });
    return [q('⑴', 'p', P, `(x − ${r1})(x − ${r2}) = 0 → P = ${st(P)}`), q('⑵', 'q', Q, `(x − ${c})² > 0 → x ≠ ${c} → Q = ${st(Q)}`),
      q('⑶', '~p', U.filter((x) => !P.includes(x)), `Pᶜ = ${st(U.filter((x) => !P.includes(x)))}`), q('⑷', '~q', [c], `Qᶜ = {${c}}`)];
  }

  // ── 03 역 · 대우와 참 · 거짓 (문장 + 참 · 거짓을 함께 고르기) ─────────
  const NUMS = [['자연수', '정수'], ['정수', '유리수'], ['자연수', '유리수'], ['유리수', '실수'], ['자연수', '실수']];
  const pair4 = (r, conv, contra, tConv, tContra, which) => { const tf = (t) => (t ? '참' : '거짓'), ans = which === '역' ? `${conv} — ${tf(tConv)}` : `${contra} — ${tf(tContra)}`;
    const opts = [`${conv} — 참`, `${conv} — 거짓`, `${contra} — 참`, `${contra} — 거짓`]; return { ans, opts: r ? r.shuffle(opts) : opts }; };
  function q03(k, which, p, qq, conv, contra, tConv, tContra, r, check) {
    const { ans, opts } = pair4(r, conv, contra, tConv, tContra, which);
    return ch(`03 ${k} 명제 「${p}이면 ${qq}이다.」 의 ${which}${which === '역' ? '과' : '와'} 그 참 · 거짓으로 알맞은 것은?`, opts, ans, which === '역' ? `역 = 가정과 결론을 바꿈 → ${conv} (${tConv ? '참' : '거짓'})` : `대우 = 바꾸고 둘 다 부정 → ${contra} (${tContra ? '참' : '거짓'} · 처음 명제와 참 · 거짓이 같다)`, check);
  }
  function m03(r) {
    let A = '정수', B = '유리수', k = 2;
    if (r) for (;;) { [A, B] = r.pick(NUMS); k = r.int(1, 6); if (!(A === '정수' && B === '유리수' && k === 2) && !(A === '자연수' && B === '유리수')) break; } // 교과서 ⑴ = 자연수 → 유리수 뺌
    const p1 = `x가 ${A}`, q1 = `x는 ${B}`;
    const c1 = `x가 ${B}이면 x는 ${A}이다`, d1 = `x가 ${B}가 아니면 x는 ${A}가 아니다`; // 자연수 · 정수 · 유리수 · 실수 = 받침 없음 → 「가」
    const p2 = `x(x − ${k}) = 0`, q2 = `x − ${k} = 0`;
    const c2 = `x − ${k} = 0 이면 x(x − ${k}) = 0 이다`, d2 = `x − ${k} ≠ 0 이면 x(x − ${k}) ≠ 0 이다`;
    const rr = r || R0();
    return [q03('⑴', '역', p1, q1, c1, d1, false, true, rr, { num: [A, B], which: '역' }), q03('⑴', '대우', p1, q1, c1, d1, false, true, rr, { num: [A, B], which: '대우' }),
      q03('⑵', '역', p2, q2, c2, d2, true, false, rr, { k, which: '역' }), q03('⑵', '대우', p2, q2, c2, d2, true, false, rr, { k, which: '대우' })];
  }

  // ── 04 충분 · 필요 · 필요충분 ───────────────────────────────
  const COND = ['충분조건', '필요조건', '필요충분조건', '아무것도 아니다'];
  const iv = (lo, hi) => `${show(lo)} ≤ x ≤ ${show(hi)}`;
  const q04 = (k, p, q, ans, sol, check) => ch(`04 ${k} p: ${p}, q: ${q} 일 때 p 는 q 이기 위한 어떤 조건인가?`, COND, ans, sol, check);
  const ALG = [ // [p, q, 답] — 실수 a, b
    ['a = b', '|a| = |b|', '충분조건'], ['a = −b', 'a² = b²', '충분조건'], ['a² = b²', '|a| = |b|', '필요충분조건'], // 교과서 ⑵ (a = b, a² = b²) 는 뺌 ['a > 0 이고 b > 0', 'ab > 0', '충분조건'], ['ab = 0', 'a = 0', '필요조건'], ['a = 0 이고 b = 0', 'a² + b² = 0', '필요충분조건'],
  ];
  function m04(r) {
    if (!r) return [q04('⑴', 'x ≤ 2', iv(-4, 1), '필요조건', 'Q = [−4, 1] ⊂ P = (x ≤ 2) → q ⇒ p → p 는 필요조건', { lin: { p: [null, 2], q: [-4, 1] } }),
      q04('⑵', 'a = b', '|a| = |b|', '충분조건', 'a = b 이면 |a| = |b| (참) · 거꾸로는 a = 1, b = −1 반례 → 충분조건', { alg: ['a = b', '|a| = |b|'] }),
      q04('⑶', '|x| ≤ 2', iv(-2, 2), '필요충분조건', '|x| ≤ 2 ⇔ −2 ≤ x ≤ 2 → 필요충분조건', { abs: { k: 2, m: 0 } })];
    let a, lo, hi, swap; do { a = r.int(-1, 5); lo = r.int(-6, a - 2); hi = r.int(lo + 1, a - 1); swap = r() < 0.5; } while ((!swap && a === 1 && lo === -3 && hi === 0) || (!swap && a === 2 && lo === -4 && hi === 1)); // 구간 [lo, hi] ⊂ (x ≤ a) 진부분 · 교과서 · 첫 시도 피함
    const l1 = swap ? q04('⑴', iv(lo, hi), `x ≤ ${show(a)}`, '충분조건', `P = [${show(lo)}, ${show(hi)}] ⊂ Q → p ⇒ q → 충분조건`, { lin: { p: [lo, hi], q: [null, a] } })
      : q04('⑴', `x ≤ ${show(a)}`, iv(lo, hi), '필요조건', `Q = [${show(lo)}, ${show(hi)}] ⊂ P → q ⇒ p → 필요조건`, { lin: { p: [null, a], q: [lo, hi] } });
    const [p2, q2, a2] = r.pick(ALG);
    let k, m, useM; do { k = r.int(1, 5); m = r.int(-3, 3); useM = r() < 0.5; } while ((!useM || m === 0) && (k === 1 || k === 2)); // |x| ≤ 1 (교과서) · |x| ≤ 2 (첫 시도) 피함
    const l3 = useM ? q04('⑶', `|x${sgnN(-m)}| ≤ ${k}`, iv(m - k, m + k), '필요충분조건', `|x${sgnN(-m)}| ≤ ${k} ⇔ ${iv(m - k, m + k)} → 필요충분조건`, { abs: { k, m } })
      : q04('⑶', `|x| ≤ ${k}`, iv(-k, k), '필요충분조건', `|x| ≤ ${k} ⇔ ${iv(-k, k)} → 필요충분조건`, { abs: { k, m: 0 } });
    return [l1, q04('⑵', p2, q2, a2, `p ⇒ q · q ⇒ p 를 각각 따져 봄 → ${a2}`, { alg: [p2, q2] }), l3];
  }

  // ── 05 「모든 · 어떤」 명제의 부정과 참 · 거짓 ─────────────────
  function m05(r) {
    let m = 1, c = 2, a = 2, b = 5;
    if (r) for (;;) { m = r.int(1, 4); c = r.int(1, 20); a = r.int(2, 5); b = r.int(1, 9); if (c !== m * m && !(m === 1 && c === 2 && a === 2 && b === 5) && !(a === 3 && b === 2) && b % a) break; }
    const rhs = `${2 * m === 1 ? '' : 2 * m}x − ${c}`, p1 = `모든 실수 x에 대하여 x² > ${rhs}`, neg1 = `어떤 실수 x에 대하여 x² ≤ ${rhs}`;
    const t1 = c > m * m; // x² − 2mx + c = (x − m)² + c − m² > 0 이 늘 참 ⇔ c > m²
    const p2 = `어떤 실수 x에 대하여 |${a}x − ${b}| < 0`, neg2 = `모든 실수 x에 대하여 |${a}x − ${b}| ≥ 0`;
    const rr = r || R0();
    return [
      ch(`05 ⑴ 명제 「${p1}이다.」 의 부정은?`, rr.shuffle([neg1, `모든 실수 x에 대하여 x² ≤ ${rhs}`, `어떤 실수 x에 대하여 x² < ${rhs}`]), neg1, '「모든」 ↔ 「어떤」 · > 의 부정은 ≤', { neg: p1 }),
      ch(`05 ⑴ 「${neg1}이다.」 는 참인가 거짓인가?`, ['참', '거짓'], t1 ? '거짓' : '참', `x² − ${2 * m}x + ${c} = (x − ${m})² ${sgnN(c - m * m).trim()} ${t1 ? '> 0 이 늘 참 → 처음 명제 참 → 부정은 거짓' : '≤ 0 이 되는 x 가 있음 → 부정은 참'}`, { m, c }),
      ch(`05 ⑵ 명제 「${p2}이다.」 의 부정은?`, rr.shuffle([neg2, `모든 실수 x에 대하여 |${a}x − ${b}| > 0`, `어떤 실수 x에 대하여 |${a}x − ${b}| ≥ 0`]), neg2, '「어떤」 ↔ 「모든」 · < 의 부정은 ≥', { neg: p2 }),
      ch(`05 ⑵ 「${neg2}이다.」 는 참인가 거짓인가?`, ['참', '거짓'], '참', '절댓값은 늘 0 이상 → 참', { abs2: [a, b] }),
    ];
  }

  // ── 06 · 09 보기 고르기 (집합 · 명제 사이의 관계) ─────────────────
  const KO = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'];
  // 집합 관계 (P, Q 는 전체집합 U 의 부분집합): 원소마다 (p 에 듦, q 에 듦) 네 칸 중 어떤 칸이 비어 있어야 하는지로 판정
  const REL = { // 문장 → 비어 있어야 하는 칸들 (pq: 11 · 10 · 01 · 00)
    'P ⊂ Q': ['10'], 'Q ⊂ P': ['01'], 'P ∩ Q = ∅': ['11'], 'P ∪ Q = U': ['00'], 'Pᶜ ⊂ Q': ['00'], 'Qᶜ ⊂ P': ['00'], 'P ∩ Q = P': ['10'], 'P ∪ Q = Q': ['10'],
    'Pᶜ ∩ Q = Pᶜ': ['00'], 'P ∩ Qᶜ = ∅': ['10'], 'Pᶜ ∪ Qᶜ = U': ['11'], 'P ∩ Qᶜ = P': ['11'], 'Pᶜ ∩ Q = Q': ['11'], 'P ⊂ Qᶜ': ['11'], 'Q ⊂ Pᶜ': ['11'],
  };
  const PREM = { 'p → q': ['10'], 'p → ~q': ['11'], '~p → q': ['00'], 'q → p': ['01'] };
  const relTrue = (prem, s) => REL[s].every((cell) => PREM[prem].includes(cell));
  function pick4(r, pool, isT) { for (;;) { const o = r.shuffle(pool.slice()).slice(0, 4), t = o.filter(isT).length; if (t >= 1 && t <= 3) return o; } }
  function m06(r) {
    const prem = r ? r.pick(Object.keys(PREM)) : '~p → q';
    const opts = r ? pick4(r, Object.keys(REL), (s) => relTrue(prem, s)) : ['Qᶜ ⊂ P', 'P ∪ Q = U', 'Pᶜ ∩ Q = Pᶜ', 'P ∩ Q = ∅'];
    const lab = opts.map((s, i) => `${KO[i]}. ${s}`), want = lab.filter((_, i) => relTrue(prem, opts[i]));
    return [multi(`06 전체집합 U 에 대하여 두 조건 p, q 의 진리집합을 각각 P, Q 라 하자. 명제 ${prem} 가 참일 때, 옳은 것을 모두 고르시오.`, lab, want,
      `${prem} 참 ⇔ ${({ 'p → q': 'P ⊂ Q', 'p → ~q': 'P ⊂ Qᶜ (P ∩ Q = ∅)', '~p → q': 'Pᶜ ⊂ Q (P ∪ Q = U)', 'q → p': 'Q ⊂ P' })[prem]} → ${want.map((x) => x.slice(0, 1)).join(', ')}`, { prem, opts })];
  }
  // 09: 두 명제가 참일 때 항상 참인 명제 (조건 p, q, r · 원소마다 참 · 거짓 8가지로 판정)
  const LIT = ['p', 'q', 'r', '~p', '~q', '~r'];
  const val = (lit, e) => (lit[0] === '~' ? !e[lit[1]] : e[lit]);
  const imp = (s) => s.split(' → ');
  const ENV = []; [0, 1].forEach((p) => [0, 1].forEach((q) => [0, 1].forEach((rv) => ENV.push({ p: !!p, q: !!q, r: !!rv }))));
  const entails = (prems, s) => ENV.every((e) => !prems.every((pm) => { const [a, b] = imp(pm); return !val(a, e) || val(b, e); }) || (() => { const [a, b] = imp(s); return !val(a, e) || val(b, e); })());
  function m09(r) {
    let prems = ['p → ~q', 'r → q'], opts = ['q → ~p', '~q → ~r', 'r → ~p', '~p → q'];
    if (r) {
      for (;;) {
        const L = r.shuffle(['p', 'q', 'r']), neg = () => (r() < 0.5 ? '~' : '');
        prems = [`${neg()}${L[0]} → ${neg()}${L[1]}`, `${neg()}${L[2]} → ${neg()}${L[1]}`].map((s) => s.replace(/~~/g, ''));
        const pool = []; LIT.forEach((a) => LIT.forEach((b) => { if (a.slice(-1) !== b.slice(-1)) pool.push(`${a} → ${b}`); }));
        if (prems[0] === prems[1] || (prems.includes('p → q') && prems.includes('~r → ~q'))) continue; // 같은 명제 · 교과서 짝 피함
        const cand = pool.filter((s) => !prems.includes(s));
        const t = cand.filter((s) => entails(prems, s)), f = cand.filter((s) => !entails(prems, s));
        if (t.length < 2 || f.length < 2) continue;
        const nt = r.int(1, 3); opts = r.shuffle([...r.shuffle(t).slice(0, nt), ...r.shuffle(f).slice(0, 4 - nt)]); break;
      }
    }
    const lab = opts.map((s, i) => `${KO[i]}. ${s}`), want = lab.filter((_, i) => entails(prems, opts[i]));
    return [multi(`09 세 조건 p, q, r 에 대하여 두 명제 ${prems[0]} 와 ${prems[1]} 가 모두 참일 때, 항상 참인 명제를 모두 고르시오.`, lab, want,
      `참인 명제의 대우도 참 · p → q, q → r 이면 p → r (삼단논법) → ${want.map((x) => x.slice(0, 1)).join(', ')}`, { prems, opts })];
  }

  // ── 07 역이 참이 되는 자연수 a 의 최솟값 (서술형 · 답만) ─────────────
  function m07(r) {
    let k = 3, m = 2, d = 7;
    if (r) for (;;) { k = r.int(2, 4); m = r.int(1, 5); d = r.int(3, 9); const need = Math.ceil(Math.max(Math.abs(m - d), m + d) / k); if (need >= 2 && !(k === 3 && m === 2 && d === 7) && !(k === 2 && m === 3 && d === 4)) break; }
    const need = Math.ceil(Math.max(Math.abs(m - d), m + d) / k);
    return [nm(`07 실수 x 에 대하여 두 조건 p: x² − ${k * k}a² ≤ 0, q: |x − ${m}| ≤ ${d} 일 때, 명제 p → q 의 역이 참이 되는 자연수 a 의 최솟값은? (풀이는 학습지에)`, need,
      `p: −${k}a ≤ x ≤ ${k}a · q: ${show(m - d)} ≤ x ≤ ${m + d} · 역 q → p 참 ⇔ Q ⊂ P ⇔ ${k}a ≥ ${Math.max(Math.abs(m - d), m + d)} → a ≥ ${need}`, { k, m, d })];
  }
  // ── 08 충분조건이 되는 a (최솟값 · 최댓값) ───────────────────────
  function m08(r) {
    let r1 = 1, r2 = 7, up = true;
    if (r) for (;;) { r1 = r.int(-3, 6); r2 = r.int(r1 + 2, 12); up = r() < 0.6; if (!(r1 === 1 && r2 === 7 && up) && !(r1 === 1 && r2 === 9 && up)) break; }
    const q = up ? 'x ≤ a' : 'x ≥ a', ans = up ? r2 : r1;
    return [nm(`08 실수 x 에 대하여 두 조건 p: x²${sgnX(-(r1 + r2))}${sgnN(r1 * r2)} ≤ 0, q: ${q} 일 때, p 가 q 이기 위한 충분조건이 되는 실수 a 의 ${up ? '최솟값' : '최댓값'}은?`, ans,
      `p: ${show(r1)} ≤ x ≤ ${show(r2)} · 충분조건 ⇔ P ⊂ Q ⇔ ${up ? `a ≥ ${show(r2)}` : `a ≤ ${show(r1)}`}`, { r1, r2, up })];
  }
  // ── 10 두 명제가 모두 거짓 → M + m (서술형 · 답만) ─────────────────
  function m10(r) {
    let u = 2, w = 2, c = 4;
    if (r) for (;;) { u = r.int(1, 3); w = r.int(1, 4); c = r.int(3, 7); if (!(u === 2 && w === 2 && c === 4) && !(u === 1 && w === 4 && c === 5)) break; }
    let M = -1; while (!(M < 0 && u * u + M * w < 0)) M--; // (가) 거짓 ⇔ 모든 x 에 대해 ax² + 2ux − w < 0 ⇔ a < 0 이고 u² + aw < 0
    const m = c, ans = M + m;
    return [nm(`10 실수 x 에 대하여 두 조건 p: ax² + ${2 * u}x − ${w} ≥ 0, q: x² + 2bx + ${c * c} > 0 이다. (가) 어떤 실수 x 에 대하여 p 이다. (나) ~p 는 q 이기 위한 충분조건이다. — 두 명제가 모두 거짓이 되도록 하는 정수 a 의 최댓값을 M, 자연수 b 의 최솟값을 m 이라 할 때 M + m 의 값은? (풀이는 학습지에)`, ans,
      `(가) 거짓 ⇔ 모든 x 에 대하여 ax² + ${2 * u}x − ${w} < 0 ⇔ a < 0, ${u * u} + ${w}a < 0 → M = ${M} · (나) 거짓 ⇔ q 가 늘 참은 아님 ⇔ b² − ${c * c} ≥ 0 → m = ${m} → ${ans}`, { u, w, c })];
  }
  // ── 11 👑 절대부등식 최솟값 ────────────────────────────────────
  function m11(r) {
    let h = 1, s = 3;
    if (r) for (;;) { h = r.int(1, 3); s = r.int(h * h + 1, h * h + 5); if (s >= 2 && !(h === 1 && s === 3) && !(h === 2 && s === 5)) break; }
    const ans = 2 * s - h * h - 1;
    return [nm(`11 실수 x, y 에 대하여 2x² + y²${sgnX(-2 * h)} + ${s * s} / (x² + y² + 1) 의 최솟값은?`, ans,
      `x² + y² + 1 = t 로 두면 (t + ${s * s}/t) + (x − ${h})² − ${h * h + 1} · 산술 · 기하 평균 → t + ${s * s}/t ≥ ${2 * s} (t = ${s}) · x = ${h} 일 때 y² = ${s - h * h - 1} 로 가능 → ${2 * s} − ${h * h + 1} = ${ans}`, { h, s })];
  }

  const R = (id, no, title, sprite, fn, extra = {}) => ({ id, no, title, sprite, make: (a, r) => fn(a ? r : null).map((q) => Object.assign(q, { ref: id.slice(1) })), ...extra });
  const ROOMS = [
    R('q01', 8, '01 명제 찾기 · 참 · 거짓', 'castle2:0@h120', m01),
    R('q02', 8, '02 진리집합', 'castle2:1@h120', m02),
    R('q03', 9, '03 역과 대우', 'castle2:2@h120', m03),
    R('q04', 10, '04 충분 · 필요 · 필요충분', 'castle2:3@h120', m04),
    R('q05', 8, '05 「모든 · 어떤」의 부정', 'castle2:4@h120', m05),
    R('q06', 9, '06 명제와 진리집합', 'castle2:0@h240', m06),
    R('q07', 9, '07 역이 참이 되는 a (서술형)', 'castle2:2@h240', m07, { photo: true }),
    R('q08', 10, '08 충분조건이 되는 a', 'castle2:3@h240', m08),
    R('q09', 9, '09 항상 참인 명제', 'castle2:1@h240', m09),
    R('q10', 10, '10 두 명제가 거짓 (서술형)', 'castle2:4@h240', m10, { photo: true }),
    R('q11', 11, '👑 11 절대부등식 최솟값', 'castleboss2:0', m11, { boss: true }),
  ];
  const MONSTERS = Object.fromEntries(ROOMS.map((r) => [r.id, r]));

  DS.Lessons.register({
    id: 'eval-2', no: 0, eval: true, after: 11, floor: 2, // 🏰 성채던전 2층 (레이드 아님 · 차시 목록 · 테스트 모드에 안 나옴)
    title: '명제 중단원', unit: '공통수학2 Ⅱ-2 명제 · 평가2', sheet: '(평가2) 명제_중단원평가',
    theme: '08-crypt',
    goal: '명제 단원 개념을 스스로 점검한다 · 틀린 문항으로 보충할 부분을 찾는다',
    steps: [],
    monsters: MONSTERS,
    rooms: ROOMS.map(({ id, no, title, boss, photo }) => ({ id, no, title, boss: !!boss, photo: !!photo })),
    legacy: {},
    WORDS: { VAGUE, NUMS, ALG, REL: Object.keys(REL), PREM: Object.keys(PREM) },
    items(id, seed, attempt) { return MONSTERS[id].make(attempt, DS.Rng(`${seed}|${id}|${attempt}`)); },
  });
})();
