// 공통수학2 Ⅱ. 집합과 명제 · 12차시 「귀류법」 (학습과정 12차시 레이드용 v1 · 2026-11-14 선생님 「추천대로」 · 손발 #7)
// 교과서 미래엔 92쪽(귀류법 · 예제 2 √2 · 문제 2 1 + √2) · ★ 칸만 게임 · 몬스터 3 (m3 = ⚔ 소레이드 + ✍ 서술형 📸) · 형성평가 5문항
// 던전 = ⚖ 저울의 공중 정원 (10 · 11차시 이어 씀) · 연습 판 = √2 만 (예제 2 에서 증명한 사실만 씀 · 2026-11-14 결정 2)
// 📦 #64 꼴: ① 맨 위 DATA = 순수 값  ② 아래 GEN = 계산 코드 · 정답은 tests/lesson12.test.js 가 따로 판정한다
(function () {
  // ══ ① 데이터 ═══════════════════════════════════════════════
  const DATA = {
    id: 'set-12', no: 12,
    title: '귀류법',
    unit: '공통수학2 Ⅱ. 집합과 명제 · 12차시',
    sheet: '학습과정 12차시 레이드용 v1',
    theme: '12-skygarden',
    goal: '귀류법을 이해한다 · 귀류법을 이용하여 간단한 명제가 참임을 증명할 수 있다',
    defaultPct: 90,
    steps: [
      { kind: 'intro', id: 'intro', title: '도입 · 🔁 전시 확인', say: '지난 시간: 명제 대신 대우를 증명해도 된다 · n² 이 짝수이면 n 도 짝수 — 생각 열기: 10명을 3개 반 → 「모든 반이 3명 이하」라 가정하면 많아야 9명 → 말이 안 됨', img: 'review' },
      { kind: 'concept', id: 'c1', title: '개념 1 · 귀류법', say: '결론의 부정이 참이라 가정 → 이미 알려진 사실에 모순 → 처음 명제가 참 · 처음 가정 = 결론의 부정 · 「또는」의 부정 = 「이고」 · 「적어도 하나」의 부정 = 「모두 ~ 아님」' },
      { kind: 'monster', id: 'm1' },
      { kind: 'concept', id: 'c2', title: '개념 2 · √2 는 유리수가 아니다 (예제 2)', say: '√2 = n/m (서로소) → n² = 2m² → n 짝수 → n = 2k → m² = 2k² → m 짝수 → 서로소에 모순' },
      { kind: 'monster', id: 'm2' },
      { kind: 'monster', id: 'm3' },
      { kind: 'concept', id: 'sum', title: '📝 오늘 정리', say: '① 결론의 부정을 가정 → ② 식 · 사실로 따라가기 → ③ 알려진 사실과 모순 → ④ 결론 · 대우 = 바꾸고 둘 다 부정 / 귀류법 = 결론만 부정해 모순 찾기' },
      { kind: 'boss', id: 'boss', title: '형성평가 · 필요충분의 천칭 수호자' },
    ],
    monsters: {
      m1: { title: '문제 1 · 처음 가정 쓰기', sprite: 'garden:0' /* 천칭 가고일 */, note: '처음 가정 = 결론의 부정 · 또는 ↔ 이고 · 적어도 하나 ↔ 모두',
        book: { gen: 'assume3', rows: [0, 1, 2] }, retry: { gen: 'assume3' } },
      m2: { title: '문제 2 · √2 증명 빈칸 (예제 2)', sprite: 'garden:4' /* 거울 웅덩이 두꺼비 */, note: '유리수라 가정 → n² = 2m² → m² = 2k² → 서로소에 모순',
        book: { gen: 'root2', v: 0 }, retry: { gen: 'root2' } },
      m3: { title: '문제 3 · 1 + √2 는 유리수가 아니다 (교과서 문제 2)', sprite: 'garden:3' /* 쌍둥이 구름 정령 */, evalQ: true, note: '유리수라 가정 → √2 = 유리수 꼴 → √2 는 유리수가 아니다(예제 2)에 모순',
        book: { gen: 'irr', f: 0, k: 1 }, retry: { gen: 'irr' } },
    },
    words: {
      // 귀류법 처음 가정 [명제, 처음 가정, 함정 둘] — 0 ~ 2 = 학습지 문제 1 · 3 = 형성평가 2 · 9 = 형성평가 5
      ass: [
        ['√3은 유리수가 아니다.', '√3은 유리수이다.', ['√3은 무리수이다.', '√3은 유리수가 아니다.']],
        ['소수는 무수히 많다.', '소수는 유한개이다.', ['소수는 무수히 많다.', '소수는 하나도 없다.']],
        ['실수 a, b에 대하여 a + b > 2이면 a > 1 또는 b > 1이다.', 'a ≤ 1이고 b ≤ 1이다.', ['a ≤ 1 또는 b ≤ 1이다.', 'a > 1이고 b > 1이다.']],
        ['√5는 유리수가 아니다.', '√5는 유리수이다.', ['√5는 무리수이다.', '√5는 유리수가 아니다.']],
        ['자연수 a, b에 대하여 ab가 짝수이면 a, b 중 적어도 하나는 짝수이다.', 'a, b는 모두 홀수이다.', ['a, b는 모두 짝수이다.', 'a, b 중 적어도 하나는 홀수이다.']],
        ['실수 a, b에 대하여 a + b > 4이면 a > 2 또는 b > 2이다.', 'a ≤ 2이고 b ≤ 2이다.', ['a ≤ 2 또는 b ≤ 2이다.', 'a > 2이고 b > 2이다.']],
        ['√7은 유리수가 아니다.', '√7은 유리수이다.', ['√7은 무리수이다.', '√7은 유리수가 아니다.']],
        ['자연수 n에 대하여 n²이 홀수이면 n도 홀수이다.', 'n은 짝수이다.', ['n은 홀수이다.', 'n²은 홀수이다.']],
        ['학생 10명을 3개 반으로 나누면 어떤 반은 4명 이상이다.', '모든 반이 3명 이하이다.', ['모든 반이 4명 이상이다.', '어떤 반은 3명 이하이다.']],
        ['학생 13명을 4개 반으로 나누면 어떤 반은 4명 이상이다.', '모든 반이 3명 이하이다.', ['모든 반이 4명 이상이다.', '어떤 반은 3명 이하이다.']],
        ['실수 a, b에 대하여 a + b > 6이면 a > 3 또는 b > 3이다.', 'a ≤ 3이고 b ≤ 3이다.', ['a ≤ 3 또는 b ≤ 3이다.', 'a > 3이고 b > 3이다.']],
        ['학생 17명을 4개 반으로 나누면 어떤 반은 5명 이상이다.', '모든 반이 4명 이하이다.', ['모든 반이 5명 이상이다.', '어떤 반은 4명 이하이다.']],
      ],
      // 부정 쓰기 [문장, 부정, 함정 둘] — 0 = 형성평가 3
      neg: [
        ['a, b 중 적어도 하나는 짝수이다.', 'a, b는 모두 홀수이다.', ['a, b는 모두 짝수이다.', 'a, b 중 적어도 하나는 홀수이다.']],
        ['a, b 중 적어도 하나는 홀수이다.', 'a, b는 모두 짝수이다.', ['a, b는 모두 홀수이다.', 'a, b 중 적어도 하나는 짝수이다.']],
        ['a > 1 또는 b > 1이다.', 'a ≤ 1이고 b ≤ 1이다.', ['a ≤ 1 또는 b ≤ 1이다.', 'a < 1이고 b < 1이다.']],
        ['a, b는 모두 홀수이다.', 'a, b 중 적어도 하나는 짝수이다.', ['a, b는 모두 짝수이다.', 'a, b 중 적어도 하나는 홀수이다.']],
        ['a ≥ 2이고 b ≥ 2이다.', 'a < 2 또는 b < 2이다.', ['a < 2이고 b < 2이다.', 'a ≤ 2 또는 b ≤ 2이다.']],
      ],
      // 예제 2 글자 묶음 [m, n, k] — 0 = 교과서
      let: [['m', 'n', 'k'], ['p', 'q', 't'], ['a', 'b', 'c'], ['x', 'y', 'z']],
      // 문제 3 꼴: 0 = k + √2 · 1 = k − √2 · 2 = √2 − k · 3 = k√2 (k = 자연수)
      irrK: [1, 2, 3, 4, 5],
    },
    boss: { title: '12차시 형성평가 · 필요충분의 천칭 수호자', sprite: 'gardenboss:0', items: 5, hpItems: 5, tags: ['c1', 'c1', 'c1', 'c2', 'c1'],
      book: [{ gen: 'bName', row: 0 }, { gen: 'bAss', row: 3 }, { gen: 'bNeg', row: 0 }, { gen: 'bSq', v: 0 }, { gen: 'bAss', row: 9 }],
      retry: [{ gen: 'bName' }, { gen: 'bAss' }, { gen: 'bNeg' }, { gen: 'bSq' }, { gen: 'bAss' }] },
    // 칸 위치 (레이드용 v1 PDF · 2026-11-14 crops_pdf.py · review = 두 단 너비)
    crops: { review: [{ p: 1, x: 0.045, y: 0.1263, w: 0.914, h: 0.05 }],
      c1: [{ p: 1, x: 0.045, y: 0.181, w: 0.455, h: 0.3647 }], m1: [{ p: 1, x: 0.045, y: 0.5427, w: 0.455, h: 0.2314 }],
      c2: [{ p: 1, x: 0.507, y: 0.1875, w: 0.452, h: 0.172 }], m2: [{ p: 1, x: 0.507, y: 0.3565, w: 0.452, h: 0.2426 }], sum: [{ p: 1, x: 0.507, y: 0.5961, w: 0.452, h: 0.1762 }],
      m3: [{ p: 2, x: 0.045, y: 0.0902, w: 0.455, h: 0.5075 }],
      boss: [{ p: 2, x: 0.507, y: 0.1052, w: 0.452, h: 0.7202 }] },
    videos: { // 🎬 2026-11-14 모션 #52 귀류법 · #53 루트2는유리수가아니다 · #54 유리수와무리수의합 (드라이브 05 원본 · 워터마크 없음)
      c1: 'assets/video/v12-52.mp4', m1: 'assets/video/v12-52.mp4', sum: 'assets/video/v12-52.mp4',
      c2: 'assets/video/v12-53.mp4', m2: 'assets/video/v12-53.mp4', m3: 'assets/video/v12-54.mp4' },
    next: { title: '13차시 · 절대부등식', ask: '「x² + 1 > 0」 — x 에 무엇을 넣어도 늘 참인 부등식이 있을까?', link: '모든 실수에서 성립하는 부등식 — 절대부등식을 알아봐요' },
  };

  // ══ ② 계산 코드 ═════════════════════════════════════════════
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const ch = (question, choices, ans, solution, check) => ({ type: 'choice', question, choices, answerIndex: choices.indexOf(ans), answer: ans, solution, check });
  const chR = (question, wrongs, ans, solution, check, r) => ch(question, r ? r.shuffle([ans, ...wrongs]) : [ans, ...wrongs], ans, solution, check);
  const sayOf = (q, say) => Object.assign(q, { say });
  const whyOf = (q, pre, choices, post) => Object.assign(q, { why: { pre, post, choices, answer: 0, text: `${pre} ${choices[0]}${post}` } });
  const W = DATA.words;
  const assQ = (row, head, r) => { const [s, a, wr] = W.ass[row]; return chR(`${head}명제 「${s}」를 귀류법으로 증명할 때, 처음에 가정하는 것은?`, wr, a, `처음 가정 = 결론의 부정 → 「${a}」`, { ass: row }, r); };
  // 문제 3 꼴 (a = 유리수로 놓은 값): E = 식 · S = √2 를 a 로 나타낸 식 · 함정
  const IRR = [
    (k) => ({ E: `${k} + √2`, S: `a − ${k}`, T: [`a + ${k}`, `${k} − a`], ops: '합 · 차는' }),
    (k) => ({ E: `${k} − √2`, S: `${k} − a`, T: [`a − ${k}`, `a + ${k}`], ops: '합 · 차는' }),
    (k) => ({ E: `√2 − ${k}`, S: `a + ${k}`, T: [`a − ${k}`, `${k} − a`], ops: '합 · 차는' }),
    (k) => ({ E: `${k}√2`, S: `a ÷ ${k}`, T: [`a × ${k}`, `a − ${k}`], ops: '곱 · 몫(0으로 나누지 않음)은' }),
  ];

  const GEN = {
    // 문제 1: 처음 가정 3개
    assume3({ rows }, r) { return rows.map((k, i) => assQ(k, `(${i + 1}) `, r)); },
    assume3R(r) { for (;;) { const rows = r.shuffle(range(0, W.ass.length - 1)).slice(0, 3); if (rows.join() === '0,1,2') continue; return GEN.assume3({ rows }, r); } },
    // 문제 2 (예제 2): (1) 처음 가정 (2) 제곱 (3) 대입 (4) 무엇에 모순
    root2({ v }, r) { const [m, n, k] = W.let[v];
      return [chR('(1) 명제 「√2 는 유리수가 아니다.」를 귀류법으로 증명할 때, 처음 가정은 「√2 는 ?이다.」', ['무리수', '자연수'], '유리수', '결론의 부정 → √2 는 유리수', { root: 'ass' }, r),
        chR(`(2) √2 = ${n}/${m} (${m}, ${n}은 서로소인 자연수)에서 ${n} = √2${m} 의 양변을 제곱하면 ${n}² = ?`, [`√2${m}²`, `4${m}²`], `2${m}²`, `(√2${m})² = 2${m}²`, { sq: [m, n] }, r),
        chR(`(3) ${n}² 이 짝수이므로 ${n} 도 짝수 → ${n} = 2${k} 를 ${n}² = 2${m}² 에 대입하면 4${k}² = 2${m}², 즉 ${m}² = ?`, [`4${k}²`, `${k}²`], `2${k}²`, `4${k}² = 2${m}² → ${m}² = 2${k}²`, { sub: [m, n, k] }, r),
        chR(`(4) ${m}, ${n} 이 모두 짝수가 되었다. 이것은 무엇에 모순인가?`, [`${m}, ${n}은 자연수`, '√2 는 무리수'], `${m}, ${n}은 서로소`, `둘 다 2 로 나누어떨어짐 → 서로소에 모순`, { root: 'end' }, r)]; },
    root2R(r) { return GEN.root2({ v: r.pick(range(1, W.let.length - 1)) }, r); },
    // 문제 3 (교과서 문제 2) ⚔ 소레이드: ① 처음 가정 ② √2 를 a 로 ③ a 로 만든 수는 유리수 (+ 💡 근거) ④ 무엇에 모순 · 👑 결론
    irr({ f, k }, r) { const X = IRR[f](k), E = X.E;
      const s1 = sayOf(chR(`「${E} 는 유리수가 아니다.」를 귀류법으로 증명할 때, 처음 가정은?`, [`${E} 는 무리수이다.`, '√2 는 유리수이다.'], `${E} 는 유리수이다.`, `결론의 부정 → 「${E} 는 유리수이다.」`, { irr: [f, k], s: 1 }, r),
        `${E} 가 유리수라고 가정하자.`);
      const s2 = sayOf(chR(`${E} = a (a 는 유리수)로 놓으면 √2 = ?`, X.T, X.S, `${E} = a → √2 = ${X.S}`, { irr: [f, k], s: 2 }, r), `${E} = a (a 는 유리수)로 놓으면 √2 = ${X.S} 이다.`);
      const s3 = sayOf(chR(`a 가 유리수이면 ${X.S} 는?`, ['무리수', '정수'], '유리수', `유리수끼리의 ${X.ops.replace(/[은는]$/, '')} → 유리수`, { irr: [f, k], s: 3 }, r), `a 가 유리수이므로 ${X.S} 도 유리수이고, √2 가 유리수가 된다.`);
      whyOf(s3, `∵ 유리수끼리의 ${X.ops}`, ['유리수', '무리수', '정수'], '이다.'); // 💡 근거 줄 = ③ 맞힌 뒤 (R2)
      const s4 = sayOf(chR('√2 가 유리수가 되었다. 이것은 무엇에 모순인가?', ['a 는 유리수이다', `${E} 는 유리수이다`], '√2 는 유리수가 아니다 (예제 2)', '예제 2 에서 √2 는 유리수가 아님을 보였다', { irr: [f, k], s: 4 }, r),
        '이것은 √2 가 유리수가 아니라는 사실(예제 2)에 모순이다.');
      const s5 = sayOf(chR('그러므로 결론은?', [`${E} 는 유리수이다.`, '√2 는 유리수이다.'], `${E} 는 유리수가 아니다.`, '가정이 모순 → 처음 명제가 참', { irr: [f, k], s: 5 }, r), `그러므로 ${E} 는 유리수가 아니다.`);
      return [s1, s2, s3, s4, s5]; },
    irrR(r) { for (;;) { const f = r.pick([0, 1, 2, 3]), k = r.pick(f === 3 ? [2, 3, 4, 5] : W.irrK); if (f === 0 && k === 1) continue; return GEN.irr({ f, k }, r); } },
    // 👑 형성평가 ① 증명법 이름 ② 처음 가정 ③ 부정 ④ 대입 한 줄 ⑤ 반 나누기 처음 가정
    bName({ row }, r) { const Q = ['명제의 결론을 부정하여 모순을 이끌어 내는 증명법은?', '「결론의 부정이 참이라 가정 → 모순 → 처음 명제가 참」 인 증명법은?', '√2 가 유리수가 아님을 보일 때 쓴 증명법은?'][row];
      return chR(Q, ['대우를 이용한 증명법', '절대부등식'], '귀류법', '결론 부정 → 모순 = 귀류법', { name: row }, r); },
    bAss({ row }, r) { return assQ(row, '', r); },
    bNeg({ row }, r) { const [s, a, wr] = W.neg[row]; return chR(`「${s}」의 부정은? (단, a, b 는 자연수 또는 실수)`, wr, a, `부정: 또는 ↔ 이고 · 적어도 하나 ↔ 모두`, { neg: row }, r); },
    bSq({ v }, r) { const [m, n, k] = W.let[v]; return chR(`${n}² = 2${m}² 에 ${n} = 2${k} 를 대입하면 ${m}² = ?`, [`4${k}²`, `${k}²`], `2${k}²`, `4${k}² = 2${m}² → ${m}² = 2${k}²`, { sub: [m, n, k] }, r); },
  };
  const fix = (q, no) => Object.assign(q, { question: `${no}. ${q.question}` });
  const R0 = (k) => DS.Rng(`s12v1|${k}`);
  const RG = { assume3: 'assume3R', root2: 'root2R', irr: 'irrR' };
  const MONSTERS = {};
  Object.entries(DATA.monsters).forEach(([id, M]) => {
    MONSTERS[id] = { title: M.title, sprite: M.sprite, note: M.note, ...(M.evalQ ? { evalQ: true } : {}),
      make: (a, r) => (a === 0 ? GEN[M.book.gen](M.book, R0(id)) : GEN[RG[M.retry.gen]](r, M.retry)) };
  });
  const CHAIN = { m3: (pass, r) => { const items = pass === 0 ? GEN.irr(DATA.monsters.m3.book, R0('m3c')) : GEN.irrR(r);
    if (pass > 0) { const E = /「(.+?) 는 유리수가 아니다\.」/.exec(items[0].question)[1]; items.forEach((it) => { it.problem = `귀류법을 이용하여 다음 명제가 참임을 증명하시오. 「${E} 는 유리수가 아니다.」`; }); } return items; } };
  const ASS_B2 = [0, 6], ASS_B5 = [8, 11];
  const bossMake = (i, a, r) => { const B = DATA.boss.book[i]; let q;
    if (B.gen === 'bName') q = GEN.bName({ row: r.pick([1, 2]) }, r);
    else if (B.gen === 'bAss') q = GEN.bAss({ row: r.pick(i === 1 ? ASS_B2 : ASS_B5) }, r);
    else if (B.gen === 'bNeg') q = GEN.bNeg({ row: r.pick(range(1, W.neg.length - 1)) }, r);
    else q = GEN.bSq({ v: r.pick(range(1, W.let.length - 1)) }, r);
    return fix(q, i + 1); };
  const BOSS1 = DATA.boss.book.map((B, i) => fix(GEN[B.gen](B, R0(`boss${i}`)), i + 1));
  const STEPS = DATA.steps.map((s) => (s.kind === 'monster' ? { ...s, title: DATA.monsters[s.id].title } : { ...s }));

  DS.Lessons.register({
    id: DATA.id, no: DATA.no, title: DATA.title, unit: DATA.unit, sheet: DATA.sheet, crops: DATA.crops, theme: DATA.theme, videos: DATA.videos, goal: DATA.goal, defaultPct: DATA.defaultPct,
    steps: STEPS, monsters: MONSTERS,
    items(id, seed, attempt) { return MONSTERS[id].make(attempt, DS.Rng(`${seed}|${id}|${attempt}`)); },
    chain: Object.keys(CHAIN),
    chainItems(id, seed, pass) { return CHAIN[id] ? CHAIN[id](pass, DS.Rng(`${seed}|${id}|chain|${pass}`)) : []; },
    DATA, GEN,
    next: DATA.next,
    boss: { title: DATA.boss.title, sprite: DATA.boss.sprite, items: DATA.boss.items, hpItems: DATA.boss.hpItems, tags: DATA.boss.tags,
      sets: { 1: BOSS1, 2: BOSS1.map((q, i) => bossMake(i, 1, DS.Rng(`s12v1|boss2|${i}`))) }, make(i, a, rng) { return a ? bossMake(i, a, rng) : BOSS1[i]; } },
  });
})();
