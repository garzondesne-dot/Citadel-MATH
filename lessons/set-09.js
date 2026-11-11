// 공통수학2 Ⅱ. 집합과 명제 · 9차시 「명제 사이의 관계 — p → q · 역과 대우」 (학습과정 9차시 레이드용 v1 · 2026-11-10 선생님 「추천대로 컨펌」 · 요청 #66 · DECISIONS 4d5aaa9)
// 교과서 86~89쪽 + 96쪽 중단원 03 · ★ 칸만 게임 · 몬스터 5 (m5 = ⚔ 소레이드 + ✍ 서술형 📸) · 형성평가 4문항 · 던전 = 🔑 열쇠와 자물쇠의 묘실 (테마 11-keyvault)
// 📦 #64 꼴: ① 맨 위 DATA = 순수 값(JSON 으로 옮길 수 있는 것) · 재도전은 「어떤 생성기를 어떤 매개변수로」 이름만
//           ② 아래 GEN = 계산 코드(재도전 숫자 바꾸기 · 오개념 보기 · 정답 계산) · 정답은 tests/lesson9.test.js 가 문제 글을 읽어 따로 계산한다
(function () {
  // ══ ① 데이터 ═══════════════════════════════════════════════
  const DATA = {
    id: 'set-09', no: 9,
    title: '명제 사이의 관계 · 역과 대우',
    unit: '공통수학2 Ⅱ. 집합과 명제 · 9차시',
    sheet: '학습과정 9차시 레이드용 v1',
    theme: '11-keyvault', // 🔑 열쇠와 자물쇠의 묘실 (bg-09)
    goal: '명제 p → q 의 참 · 거짓을 진리집합으로 판별하고 반례를 찾을 수 있다 · 명제의 역과 대우를 말하고, 명제와 그 대우의 참 · 거짓이 같음을 안다',
    defaultPct: 90,
    steps: [
      { kind: 'intro', id: 'intro', title: '도입 · 🔁 전시 확인', say: '지난 시간: ~p 의 진리집합 = Pᶜ · 「모든 x 에 대하여 p」의 부정 = 「어떤 x 에 대하여 ~p」 — 학습지 맨 위 칸을 같이 확인해요', img: 'review' },
      { kind: 'concept', id: 'c1', title: '개념 1 · 명제 p → q 의 참 · 거짓', say: 'p 이면 q = p → q · p 가정, q 결론 · P ⊂ Q 이면 참, P ⊄ Q 이면 거짓 · 거짓임을 보이는 예 = 반례' },
      { kind: 'concept', id: 'cp1', title: '➕ 개념 플러스 · 📐 사각형의 포함 관계', say: '정사각형 ⊂ 직사각형 · 마름모 ⊂ 평행사변형 ⊂ 사다리꼴 ⊂ 사각형 → 「정사각형이면 마름모」 참 · 「평행사변형이면 직사각형」 거짓' },
      { kind: 'monster', id: 'm1' },
      { kind: 'monster', id: 'm2' },
      { kind: 'concept', id: 'c2', title: '개념 2 · 역과 대우', say: '역 = q → p · 대우 = ~q → ~p · 보기 「x = 1 이면 x² = 1」 → 역 「x² = 1 이면 x = 1」 · 대우 「x² ≠ 1 이면 x ≠ 1」' },
      { kind: 'monster', id: 'm3' },
      { kind: 'concept', id: 'c3', title: '개념 3 · 명제와 그 대우의 참 · 거짓', say: '명제가 참이면 대우도 참 · 거짓이면 대우도 거짓 · 역은 같지 않을 수 있다' },
      { kind: 'monster', id: 'm4' },
      { kind: 'concept', id: 'cp2', title: '➕ 개념 플러스 · 🔢 수의 포함 관계', say: '자연수 ⊂ 정수 ⊂ 유리수 ⊂ 실수 · 무리수 ⊂ 실수 · 유리수와 무리수는 서로소' },
      { kind: 'monster', id: 'm5' },
      { kind: 'boss', id: 'boss', title: '형성평가 · 역과 대우의 문지기' },
    ],
    // 몬스터: 첫 시도(attempt 0) = 학습지 숫자 · 재도전 = retry 의 생성기 이름 + 매개변수
    monsters: {
      m1: { title: '문제 1 · p → q 와 진리집합', sprite: 'keyvault:0' /* 자물쇠 미믹 */, note: 'P ⊂ Q 이면 참 · P ⊄ Q 이면 거짓',
        book: { gen: 'divImp', a: 3, b: 9 }, retry: { gen: 'divImp', a: [2, 3, 4, 5, 6], b: [4, 6, 8, 9, 10, 12] } },
      m2: { title: '문제 2 · 참 · 거짓과 반례', sprite: 'keyvault:2' /* 사슬 기사 */, note: '거짓이면 반례 하나면 끝! · x 가 실수이면 음수도 생각해요',
        book: { gen: 'truthCounter', a: 1, s: 0, c: 6 }, retry: { gen: 'truthCounter', a: [2, 3, 4, 5], s: [1, 2, 3], c: [3, 4, 5, 7] } },
      m3: { title: '문제 3 · 역과 대우', sprite: 'keyvault:1' /* 열쇠 유령 */, note: '역 = 앞뒤만 바꿈 · 대우 = 앞뒤를 바꾸고 둘 다 부정',
        book: { gen: 'convContra', rows: [0, 1] }, retry: { gen: 'convContra', from: 2 } },
      m4: { title: '문제 4 · 대우로 참 · 거짓', sprite: 'keyvault:3' /* 봉인 석상 (2026-11-10 그림 넣음) */, note: '명제와 그 대우는 참 · 거짓이 같아요',
        book: { gen: 'multContra', k: 4, m: 2 }, retry: { gen: 'multContra', pairs: [[6, 3], [6, 4], [9, 3], [8, 4], [10, 5], [4, 8], [12, 6], [6, 9]] } },
      m5: { title: '문제 5 · 역과 대우 (중단원)', sprite: 'keyvault:4' /* 뒤집개 박쥐 */, evalQ: true, chain: true, note: '역 · 대우를 하나씩 · 반례는 모두 골라요',
        book: { gen: 'numSets', row: 0 }, retry: { gen: 'numSets', from: 1 } },
    },
    // 문장 표 (고르기 보기 · 반례)
    words: {
      // 역 · 대우 (p, q, ~p, ~q) — 첫 두 줄 = 88쪽 문제 2
      cc: [['a = b', 'a² = b²', 'a ≠ b', 'a² ≠ b²'], ['x² > 4', 'x > 2', 'x² ≤ 4', 'x ≤ 2'], ['x = 1', 'x² = 1', 'x ≠ 1', 'x² ≠ 1'], ['x = 2', 'x² = 4', 'x ≠ 2', 'x² ≠ 4'],
        ['x > 3', 'x > 1', 'x ≤ 3', 'x ≤ 1'], ['x² > 9', 'x > 3', 'x² ≤ 9', 'x ≤ 3'], ['a = 0', 'ab = 0', 'a ≠ 0', 'ab ≠ 0'], ['x < 2', 'x < 5', 'x ≥ 2', 'x ≥ 5']],
      // 「소수는 홀수이다」 꼴 · 거짓 + 반례 (문장 · 칩 · 반례)
      sent: [['소수는 홀수이다.', [1, 2, 3, 5, 9], [2]], ['4의 배수는 8의 배수이다.', [4, 8, 12, 16, 24], [4, 12]], ['홀수는 소수이다.', [1, 3, 5, 7, 9], [1, 9]], ['6의 약수는 짝수이다.', [1, 2, 3, 6, 4], [1, 3]]],
      // 수의 포함 관계: [가정, 결론, 반례 칩, 역의 반례(정답)] — 0 = 96쪽 중단원 03 (1)
      sets: [['자연수', '유리수', ['½', '−1', '2', '3'], ['½', '−1']], ['자연수', '정수', ['−1', '0', '2', '5'], ['−1', '0']], ['정수', '유리수', ['½', '−3', '0', '4'], ['½']],
        ['정수', '실수', ['√2', '½', '−2', '0'], ['√2', '½']], ['자연수', '실수', ['√2', '−1', '1', '7'], ['√2', '−1']]],
    },
    boss: { title: '9차시 형성평가 · 역과 대우의 문지기', sprite: 'keyvaultboss:0', items: 4, hpItems: 4, tags: ['c1', 'c1', 'c1', 'c3'],
      book: [{ gen: 'bHyp', a: 2 }, { gen: 'bPQ', N: 10, k: 4, m: 2 }, { gen: 'bCounter', a: 1, b: 3 }, { gen: 'bCC', a: 3 }],
      retry: [{ gen: 'bHyp', a: [3, 4, 5] }, { gen: 'bPQ', N: [8, 10, 12], k: [2, 3, 4, 6], m: [2, 3, 4, 6] }, { gen: 'bCounter', a: [0, 1, 2], b: [3, 4, 5] }, { gen: 'bCC', a: [2, 4, 5] }] },
    // 칸 위치 (레이드용 v1 PDF · 2026-11-10 · tools/worksheet/crops_pdf.py · 빨간 상자 눈 확인 · boss = 「더 해 보고 싶다면」 위까지)
    crops: { review: [{ p: 1, x: 0.045, y: 0.1557, w: 0.914, h: 0.0642 }],
      c1: [{ p: 1, x: 0.045, y: 0.2169, w: 0.455, h: 0.1836 }], m1: [{ p: 1, x: 0.045, y: 0.3975, w: 0.455, h: 0.1625 }], m2: [{ p: 1, x: 0.045, y: 0.557, w: 0.455, h: 0.2212 }],
      cp1: [{ p: 1, x: 0.045, y: 0.7752, w: 0.455, h: 0.1798 }], c2: [{ p: 1, x: 0.507, y: 0.2169, w: 0.452, h: 0.1702 }], m3: [{ p: 1, x: 0.507, y: 0.3841, w: 0.452, h: 0.2162 }],
      c3: [{ p: 1, x: 0.507, y: 0.5973, w: 0.452, h: 0.1337 }], m4: [{ p: 1, x: 0.507, y: 0.728, w: 0.452, h: 0.227 }], cp2: [{ p: 2, x: 0.045, y: 0.1017, w: 0.455, h: 0.3024 }],
      m5: [{ p: 2, x: 0.045, y: 0.4011, w: 0.455, h: 0.39 }], boss: [{ p: 2, x: 0.507, y: 0.115, w: 0.452, h: 0.56 }] },
    videos: { // 🎬 #83 (2026-11-11): 43 p → q · 반례 · 44 역과 대우 · 45 포함 관계로 보는 명제 (드라이브 05 원본 · K.C.W 워터마크 없는 판이 오면 -v2 로 바꿔 끼움)
      c1: 'assets/video/v09-43-v2.mp4', m1: 'assets/video/v09-43-v2.mp4', m2: 'assets/video/v09-43-v2.mp4',
      c2: 'assets/video/v09-44-v2.mp4', c3: 'assets/video/v09-44-v2.mp4', m3: 'assets/video/v09-44-v2.mp4', m4: 'assets/video/v09-44-v2.mp4', m5: 'assets/video/v09-44-v2.mp4',
      cp1: 'assets/video/v09-45-v2.mp4', cp2: 'assets/video/v09-45-v2.mp4' },
    next: { title: '10차시 · 충분조건과 필요조건', ask: '「비가 오면 땅이 젖는다」 — 땅이 젖으려면 비가 꼭 와야 할까?', link: '오늘 배운 p → q 의 참 · 거짓으로 충분조건 · 필요조건을 알아봐요' },
  };

  // ══ ② 계산 코드 ═════════════════════════════════════════════
  const S = DS.SetGen, st = (a) => (a.length ? S.setStr(a) : '∅'), range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const num = (x) => (x < 0 ? `−${-x}` : String(x)), EMPTY = '∅ (공집합)';
  const ch = (question, choices, ans, solution, check) => ({ type: 'choice', question, choices, answerIndex: choices.indexOf(ans), answer: ans, solution, check });
  const chR = (question, wrongs, ans, solution, check, r) => ch(question, r ? r.shuffle([ans, ...wrongs]) : [ans, ...wrongs], ans, solution, check);
  const TF = (question, t, solution, check) => ch(question, ['참', '거짓'], t ? '참' : '거짓', solution, check);
  const chips = (question, cands, want, solution, check) => { const c = [...new Set(cands)].sort((a, b) => a - b);
    return { type: 'multi', question: `${question} 원소를 모두 고르시오.`, options: [...c.map(num), EMPTY], answer: want.length ? c.map((x, i) => (want.includes(x) ? i : -1)).filter((i) => i >= 0) : [c.length], empty: [c.length], solution, check }; };
  const groups = (question, gs, solution, check) => { const options = [], answer = [], empty = [], gr = []; // 칸마다 보기 (집합 칸은 ∅ 단추 · 참/거짓 칸은 없음)
    gs.forEach((g) => { const b0 = options.length; g.opts.forEach((o, i) => { options.push(o); if (g.want.includes(o)) answer.push(b0 + i); }); if (g.set) { options.push(EMPTY); empty.push(options.length - 1); if (!g.want.length) answer.push(options.length - 1); } gr.push({ label: g.label, n: options.length - b0 }); });
    return { type: 'multi', question, options, answer, empty, groups: gr, solution, check }; };
  const divs = (n) => range(1, n).filter((d) => n % d === 0);
  const pk = (r, v) => (Array.isArray(v) ? r.pick(v) : v);
  const sayOf = (q, say) => Object.assign(q, { say });
  const whyOf = (q, pre, choices, post) => Object.assign(q, { why: { pre, post, choices, answer: 0, text: `${pre} ${choices[0]}${post}` } });
  const W = DATA.words, ifThen = (p, q) => `${p} 이면 ${q} 이다.`;
  const nOf = (m) => (m === 2 ? '짝수' : `${m}의 배수`);

  const GEN = {
    // 문제 1 (86쪽 함께하기): p : x는 a의 약수 · q : x는 b의 약수 → P · Q 칩 · ⊂/⊄ · 참 · 거짓
    divImp({ a, b }) { const P = divs(a), Q = divs(b), inc = P.every((x) => Q.includes(x)), c = range(1, Math.max(a, b));
      return [chips(`(2) p : x는 ${a}의 약수 일 때 진리집합 P 의`, c, P, `${a}의 약수 → P = ${st(P)}`, { kind: 'div', m: a }),
        chips(`(2) q : x는 ${b}의 약수 일 때 진리집합 Q 의`, c, Q, `${b}의 약수 → Q = ${st(Q)}`, { kind: 'div', m: b }),
        ch(`(3) 두 진리집합 P = ${st(P)}, Q = ${st(Q)} 사이의 관계는?`, ['P ⊂ Q', 'P ⊄ Q'], inc ? 'P ⊂ Q' : 'P ⊄ Q', inc ? 'P 의 원소가 모두 Q 에 있다 → P ⊂ Q' : `${P.filter((x) => !Q.includes(x)).join(', ')} 은(는) Q 에 없다 → P ⊄ Q`, { P, Q }),
        TF(`(3) 명제 「${a}의 약수는 ${b}의 약수이다.」 는 참인가 거짓인가?`, inc, inc ? 'P ⊂ Q 이므로 참' : `P ⊄ Q → 거짓 (반례 ${P.filter((x) => !Q.includes(x))[0]})`, { a, b })]; },
    divImpR(r, R) { for (;;) { const a = pk(r, R.a), b = pk(r, R.b); if (a === b || (a === 3 && b === 9)) continue; return GEN.divImp({ a, b }); } },
    // 문제 2 (87쪽): (1) x − a = 0 이면 x² = ax (P · Q 칩 · ⊂ · 참) (2) 문장 거짓 + 반례 칩 (3) x ≤ c 이면 x² ≤ c² (실수) → 거짓 · 반례 고르기
    truthCounter({ a, s, c }, r) { const row = W.sent[s], cand = [-1, 0, 1, a, -a, a * a];
      const q3 = [num(-(c + 1)), String(c), '0', String(c + 1)];
      return [chips(`(1) 「x − ${a} = 0 이면 x² = ${a === 1 ? '' : a}x 이다.」 에서 가정 p : x − ${a} = 0 의 진리집합 P 의`, cand, [a], `x − ${a} = 0 → x = ${a} → P = {${a}}`, { lin: a }),
        chips(`(1) 결론 q : x² = ${a === 1 ? '' : a}x 의 진리집합 Q 의`, cand, [0, a], `x² − ${a === 1 ? '' : a}x = 0 → x(x − ${a}) = 0 → Q = {0, ${a}}`, { quad: a }),
        TF(`(1) 「x − ${a} = 0 이면 x² = ${a === 1 ? '' : a}x 이다.」 는 참인가 거짓인가?`, true, `P = {${a}} ⊂ Q = {0, ${a}} → 참`, { lin: a }),
        TF(`(2) 「${row[0]}」 는 참인가 거짓인가?`, false, `반례가 있다 (${row[2].join(', ')}) → 거짓`, { sent: row[0] }),
        { type: 'multi', question: `(2) 「${row[0]}」 의 반례를 모두 고르시오.`, options: row[1].map(String), answer: row[1].map((x, i) => (row[2].includes(x) ? i : -1)).filter((i) => i >= 0), solution: `가정은 맞는데 결론이 틀린 수 = ${row[2].join(', ')}`, check: { sent: row[0] } },
        TF(`(3) x 가 실수일 때 「x ≤ ${c} 이면 x² ≤ ${c * c} 이다.」 는 참인가 거짓인가?`, false, `x = ${num(-(c + 1))} 이면 x ≤ ${c} 이지만 x² = ${(c + 1) * (c + 1)} > ${c * c} → 거짓`, { le: c }),
        chR(`(3) x 가 실수일 때 「x ≤ ${c} 이면 x² ≤ ${c * c} 이다.」 의 반례는?`, q3.slice(1), q3[0], `음수 ${num(-(c + 1))} : 가정 ${num(-(c + 1))} ≤ ${c} 은 맞고 결론 ${(c + 1) * (c + 1)} ≤ ${c * c} 은 틀림`, { le: c }, r)]; },
    truthCounterR(r, R) { for (;;) { const a = pk(r, R.a), s = pk(r, R.s), c = pk(r, R.c); return GEN.truthCounter({ a, s, c }, r); } },
    // 문제 3 (88쪽 문제 2): 역 · 대우 고르기 (함정 = 역 ↔ 대우 · 이 ~p → ~q · 원래 명제)
    ccPick(no, row, which, r) { const [p, q, np, nq] = row, conv = ifThen(q, p), contra = ifThen(nq, np), inv = ifThen(np, nq), orig = ifThen(p, q);
      const ans = which === '역' ? conv : contra, wr = which === '역' ? [contra, inv, orig] : [conv, inv, orig];
      return chR(`(${no}) 「${orig}」 의 ${which === '역' ? '역은' : '대우는'}?`, wr, ans, which === '역' ? `역 = 가정과 결론을 바꿈 → ${conv}` : `대우 = 바꾸고 둘 다 부정 → ${contra}`, { cc: row, which }, r); },
    convContra({ rows }, r) { return rows.flatMap((k, i) => [GEN.ccPick(i + 1, W.cc[k], '역', r), GEN.ccPick(i + 1, W.cc[k], '대우', r)]); },
    convContraR(r, R) { const pool = range(R.from, W.cc.length - 1), a = r.pick(pool); let b = r.pick(pool); while (b === a) b = r.pick(pool); return GEN.convContra({ rows: [a, b] }, r); },
    // 문제 4 (89쪽 문제 3 (1)): 「x 가 k의 배수이면 x 는 m 이다」 의 대우 고르기 + 참 · 거짓
    multContra({ k, m }, r) { const K = `${k}의 배수`, M = nOf(m), t = k % m === 0;
      const ans = `x 가 ${M}가 아니면 x 는 ${K}가 아니다.`;
      return [chR(`(1) 「x 가 ${K}이면 x 는 ${M}이다.」 의 대우는?`, [`x 가 ${M}이면 x 는 ${K}이다.`, `x 가 ${K}가 아니면 x 는 ${M}가 아니다.`, `x 가 ${M}가 아니면 x 는 ${K}이다.`], ans, '대우 = 가정과 결론을 바꾸고 둘 다 부정', { mult: [k, m] }, r),
        TF(`(1) 대우 「${ans}」 는 참인가 거짓인가?`, t, t ? `${k}의 배수는 모두 ${M} → 원래 명제 참 → 대우도 참` : `${k}는 ${M}가 아니다 (반례) → 원래 명제 거짓 → 대우도 거짓`, { mult: [k, m] })]; },
    multContraR(r, R) { const [k, m] = r.pick(R.pairs); return GEN.multContra({ k, m }, r); },
    // 문제 5 (96쪽 중단원 03 (1)) ⚔ 소레이드: 「x 가 A 이면 x 는 B 이다」 → 역 → 역 거짓 + 반례 → 원래 참 → 대우 (+ 💡 근거) → 👑 결론
    numSets({ row }, r) { const [A, B, cands, ce] = W.sets[row], orig = `x 가 ${A}이면 x 는 ${B}이다.`, conv = `x 가 ${B}이면 x 는 ${A}이다.`, contra = `x 가 ${B}가 아니면 x 는 ${A}가 아니다.`, inv = `x 가 ${A}가 아니면 x 는 ${B}가 아니다.`;
      const q4 = sayOf(chR(`「${orig}」 의 대우는?`, [conv, inv, `x 가 ${B}가 아니면 x 는 ${A}이다.`], contra, '대우 = 가정과 결론을 바꾸고 둘 다 부정 (부정을 빼먹지 않기!)', { step: 4, row }, r), `대우는 「${contra}」 이다.`);
      whyOf(q4, '∵ 명제와 그 대우의 참 · 거짓은', ['같다', '다르다', '알 수 없다'], '.'); // 💡 근거 줄 = ④ 맞힌 뒤 (R2)
      return [
        sayOf(chR(`「${orig}」 의 역은?`, [contra, inv, orig], conv, '역 = 가정과 결론을 서로 바꿈', { step: 1, row }, r), `역은 「${conv}」 이다.`),
        sayOf(groups(`역 「${conv}」 의 참 · 거짓을 고르고, 반례를 모두 고르시오.`, [{ label: '역은', opts: ['참', '거짓'], want: ['거짓'] }, { label: '반례 (모두)', opts: cands, want: ce }], `${ce.join(', ')} 은(는) ${B}이지만 ${A}가 아니다 → 역은 거짓`, { step: 2, row }), `역은 거짓이다. (반례: x = ${ce.join(', x = ')})`),
        sayOf(TF(`원래 명제 「${orig}」 는 참인가 거짓인가?`, true, `${A}는 모두 ${B}이다 → 참`, { step: 3, row }), `원래 명제는 참이다. (${A}는 모두 ${B})`),
        q4,
        sayOf(chR('그러므로 역과 대우의 참 · 거짓은?', ['역은 참, 대우는 거짓', '역 · 대우 모두 참', '역 · 대우 모두 거짓'], '역은 거짓, 대우는 참', '역은 반례가 있어 거짓 · 대우는 원래 명제와 같이 참', { step: 5, row }, r), '그러므로 역은 거짓, 대우는 참이다.'),
      ]; },
    numSetsR(r, R) { return GEN.numSets({ row: r.pick(range(R.from, W.sets.length - 1)) }, r); },
    // 👑 형성평가 ① 가정 · 결론 ② U 에서 P · Q 칩 + 참 · 거짓 ③ 참 · 거짓 + 반례 칩 ④ 역 · 대우와 참 · 거짓
    bHyp({ a }, r) { const p = `x = ${a}`, q = `x² = ${a * a}`;
      return chR(`명제 「x = ${a} 이면 x² = ${a * a} 이다.」 의 가정과 결론을 바르게 짝지은 것은?`, [`가정: ${q} · 결론: ${p}`, `가정: ${p} · 결론: x = −${a}`, `가정: ${q} · 결론: x = ±${a}`], `가정: ${p} · 결론: ${q}`, '「p 이면 q」 → p 가정 · q 결론', { hyp: a }, r); },
    bPQ({ N, k, m }) { const U = range(1, N), P = U.filter((x) => x % k === 0), Q = U.filter((x) => x % m === 0), t = P.every((x) => Q.includes(x)), Kn = `${k}의 배수`, Mn = `${m}의 배수`;
      return groups(`U = ${st(U)} 일 때 명제 「x 가 ${Kn}이면 x 는 ${Mn}이다.」 에서 P · Q 의 원소를 모두 고르고 참 · 거짓을 고르시오.`, [{ label: 'P', opts: U.map(String), want: P.map(String), set: true }, { label: 'Q', opts: U.map(String), want: Q.map(String), set: true }, { label: '명제는', opts: ['참', '거짓'], want: [t ? '참' : '거짓'] }],
        `P = ${st(P)} · Q = ${st(Q)} → ${t ? 'P ⊂ Q → 참' : 'P ⊄ Q → 거짓'}`, { U, k, m }); },
    bCounter({ a, b }) { const c = range(a - 1, b + 1), bad = c.filter((x) => x > a && !(x > b));
      return groups(`x 가 실수일 때 명제 「x > ${a} 이면 x > ${b} 이다.」 의 참 · 거짓을 고르고, 아래 수 중 반례를 모두 고르시오.`, [{ label: '명제는', opts: ['참', '거짓'], want: ['거짓'] }, { label: '반례 (모두)', opts: c.map(num), want: bad.map(num) }],
        `${a} < x ≤ ${b} 인 수는 가정은 맞고 결론이 틀림 → 거짓 (반례 ${bad.map(num).join(', ')})`, { gt: [a, b] }); },
    bCC({ a }, r) { const conv = `x² = ${a * a} 이면 x = ${a} 이다.`, contra = `x² ≠ ${a * a} 이면 x ≠ ${a} 이다.`, inv = `x ≠ ${a} 이면 x² ≠ ${a * a} 이다.`;
      return chR(`명제 「x = ${a} 이면 x² = ${a * a} 이다.」 의 역과 대우, 그 참 · 거짓을 바르게 짝지은 것은?`, [`역 「${conv}」 참 · 대우 「${contra}」 거짓`, `역 「${contra}」 거짓 · 대우 「${conv}」 참`, `역 「${conv}」 거짓 · 대우 「${inv}」 참`],
        `역 「${conv}」 거짓 · 대우 「${contra}」 참`, `역: x = −${a} 이면 x² = ${a * a} 이지만 x ≠ ${a} → 거짓 · 대우: 원래 명제가 참이므로 참`, { cc: a }, r); },
  };
  const fix = (q, no) => Object.assign(q, { question: `${no}. ${q.question}` });
  const R0 = (k) => DS.Rng(`s9v1|${k}`); // 첫 시도도 보기 순서만 섞음 (정답이 늘 첫 번째가 되지 않게)
  const RG = { divImp: 'divImpR', truthCounter: 'truthCounterR', convContra: 'convContraR', multContra: 'multContraR', numSets: 'numSetsR' };
  const MONSTERS = {};
  Object.entries(DATA.monsters).forEach(([id, M]) => {
    MONSTERS[id] = { title: M.title, sprite: M.sprite, note: M.note, ...(M.evalQ ? { evalQ: true } : {}),
      make: (a, r) => (a === 0 ? GEN[M.book.gen](M.book, R0(id)) : GEN[RG[M.retry.gen]](r, M.retry)) };
  });
  // ⚔ 소레이드 (m5): 첫 판 = 학습지 · 한 판 더 = 다른 수 · 문제 카드 원문
  const CHAIN = { m5: (pass, r) => { const M = DATA.monsters.m5, row = pass === 0 ? M.book.row : r.pick(range(M.retry.from, W.sets.length - 1)), items = GEN.numSets({ row }, pass === 0 ? R0('m5c') : r);
    if (pass > 0) { const [A, B] = W.sets[row]; items.forEach((it) => { it.problem = `다음 명제의 역과 대우를 말하고, 그 참 · 거짓을 판별하시오. 「x 가 ${A}이면 x 는 ${B}이다.」`; }); } return items; } };
  const bossMake = (i, a, r) => { const R = DATA.boss.retry[i]; const args = Object.fromEntries(Object.entries(R).map(([k, v]) => [k, k === 'gen' ? v : pk(r, v)]));
    if (R.gen === 'bPQ' && args.k === args.m) args.m = args.k === 2 ? 4 : 2; if (R.gen === 'bCounter' && args.b <= args.a) args.b = args.a + 2;
    return fix(GEN[R.gen](args, r), i + 1); };
  const BOSS1 = DATA.boss.book.map((B, i) => fix(GEN[B.gen](B, R0(`boss${i}`)), i + 1));
  const STEPS = DATA.steps.map((s) => (s.kind === 'monster' ? { ...s, title: DATA.monsters[s.id].title } : { ...s }));

  DS.Lessons.register({
    id: DATA.id, no: DATA.no, title: DATA.title, unit: DATA.unit, sheet: DATA.sheet, crops: DATA.crops, theme: DATA.theme, videos: DATA.videos, goal: DATA.goal, defaultPct: DATA.defaultPct,
    steps: STEPS, monsters: MONSTERS,
    items(id, seed, attempt) { return MONSTERS[id].make(attempt, DS.Rng(`${seed}|${id}|${attempt}`)); },
    chain: Object.keys(CHAIN),
    chainItems(id, seed, pass) { return CHAIN[id] ? CHAIN[id](pass, DS.Rng(`${seed}|${id}|chain|${pass}`)) : []; },
    DATA, GEN, // 📦 #64 차시 팩 준비 (시험 · 나중 팩 엔진)
    next: DATA.next,
    boss: { title: DATA.boss.title, sprite: DATA.boss.sprite, items: DATA.boss.items, hpItems: DATA.boss.hpItems, tags: DATA.boss.tags,
      sets: { 1: BOSS1, 2: BOSS1.map((q, i) => bossMake(i, 1, DS.Rng(`s9v1|boss2|${i}`))) }, make(i, a, rng) { return a ? bossMake(i, a, rng) : BOSS1[i]; } },
  });
})();
