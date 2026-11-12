// 공통수학2 Ⅱ. 집합과 명제 · 10차시 「충분조건 · 필요조건 · 필요충분조건」 (학습과정 10차시 레이드용 v1 · 2026-11-12 선생님 「진행」 · 손발 #7 · 📚 정식 차시 추가)
// 교과서 미래엔 89~90쪽(정의 · 예제 2 · 문제 4 · 🔭 생각 넓히기) + 96쪽 중단원 04 · ★ 칸만 게임 · 몬스터 4 (m4 = ⚔ 소레이드 + ✍ 서술형 📸) · 형성평가 4문항 · 던전 = ⚖ 저울의 공중 정원 (테마 12-skygarden)
// 📦 #64 꼴: ① 맨 위 DATA = 순수 값 · 재도전은 「어떤 생성기를 어떤 매개변수로」 이름만
//           ② 아래 GEN = 계산 코드 · 정답은 tests/lesson10.test.js 가 조건 글을 읽어 진리집합을 따로 계산해 판정한다
(function () {
  // ══ ① 데이터 ═══════════════════════════════════════════════
  const DATA = {
    id: 'set-10', no: 10,
    title: '충분조건 · 필요조건 · 필요충분조건',
    unit: '공통수학2 Ⅱ. 집합과 명제 · 10차시',
    sheet: '학습과정 10차시 레이드용 v1',
    theme: '12-skygarden', // ⚖ 저울의 공중 정원 (bg-10)
    goal: '충분조건 · 필요조건 · 필요충분조건의 뜻을 안다 · 진리집합의 포함 관계로 충분조건 · 필요조건 · 필요충분조건을 판정할 수 있다',
    defaultPct: 90,
    steps: [
      { kind: 'intro', id: 'intro', title: '도입 · 🔁 전시 확인', say: '지난 시간: p → q 가 참이면 P ⊂ Q · 명제와 그 대우의 참 · 거짓은 같다 — 학습지 맨 위 칸을 같이 확인해요', img: 'review' },
      { kind: 'concept', id: 'c1', title: '개념 1 · 충분조건과 필요조건', say: 'p → q 가 참 = p ⇒ q · p 는 q 이기 위한 충분조건 · q 는 p 이기 위한 필요조건 · 화살표가 나가는 쪽 = 충분 · 받는 쪽 = 필요' },
      { kind: 'monster', id: 'm1' },
      { kind: 'concept', id: 'c2', title: '개념 2 · 필요충분조건 · 진리집합으로 판정', say: 'p ⇒ q 이고 q ⇒ p 이면 p ⇔ q = 필요충분조건 · P ⊂ Q → 충분 · Q ⊂ P → 필요 · P = Q → 필요충분' },
      { kind: 'monster', id: 'm2' },
      { kind: 'concept', id: 'c3', title: '개념 3 · 🔭 생각 넓히기 — 세 조건', say: 'p 는 q 이기 위한 필요조건 → Q ⊂ P · r 은 q 이기 위한 충분조건 → R ⊂ Q · 따라서 R ⊂ Q ⊂ P' },
      { kind: 'monster', id: 'm3' },
      { kind: 'monster', id: 'm4' },
      { kind: 'concept', id: 'sum', title: '📝 오늘 정리', say: 'P ⊂ Q → 충분 · Q ⊂ P → 필요 · P = Q → 필요충분 · 한쪽 화살표만 참인지 볼 때 = 반례 하나로 끝' },
      { kind: 'boss', id: 'boss', title: '형성평가 · 필요충분의 천칭 수호자' },
    ],
    monsters: {
      m1: { title: '문제 1 · 충분조건과 필요조건', sprite: 'garden:2' /* 충분 나비 */, note: '화살표가 나가는 쪽 = 충분 · 받는 쪽 = 필요',
        book: { gen: 'defSN', row: 0, pair: 0, ask: 'q' }, retry: { gen: 'defSN', rows: [1, 2, 3, 4, 5], pairs: [1, 2, 3, 4, 5, 6] } },
      m2: { title: '문제 2 · 어떤 조건인지 판정', sprite: 'garden:0' /* 천칭 가고일 */, note: 'P ⊂ Q → 충분 · Q ⊂ P → 필요 · P = Q → 필요충분',
        book: { gen: 'judge4', rows: [0, 1, 2, 3] }, retry: { gen: 'judge4', from: 4 } },
      m3: { title: '문제 3 · 세 조건 (생각 넓히기)', sprite: 'garden:1' /* 필요 덩굴 */, note: '필요조건 = 바깥 집합 · 충분조건 = 안쪽 집합',
        book: { gen: 'chain3', order: ['r', 'q', 'p'], say: ['nec', 'suf'], props: ['r → p', 'q → ~p', '~q → ~r', '~p → r'] }, retry: { gen: 'chain3' } },
      m4: { title: '문제 4 · 어떤 조건인지 (중단원)', sprite: 'garden:3' /* 쌍둥이 구름 정령 */, evalQ: true, chain: true, note: '포함 관계 → 반례 → 어떤 조건인지 차례로',
        book: { gen: 'soraid', a: 1, b: -3, c: 0, ab: 0, k: 1, lt: false }, retry: { gen: 'soraid' } },
    },
    words: {
      // m1 (1)(2): 한쪽만 ⇒ 인 배수 쌍 [p, q] (p ⇒ q) — 0 = 89쪽 보기
      def: [['x는 4의 배수이다.', 'x는 2의 배수이다.'], ['x는 6의 배수이다.', 'x는 3의 배수이다.'], ['x는 8의 배수이다.', 'x는 4의 배수이다.'], ['x는 9의 배수이다.', 'x는 3의 배수이다.'], ['x는 10의 배수이다.', 'x는 5의 배수이다.'], ['x는 12의 배수이다.', 'x는 6의 배수이다.']],
      // m1 (3): [a, b] (a ⇒ b · 거꾸로는 아님) — 0 = 학습지
      pair: [['x = 2', 'x² = 4'], ['x = 3', 'x² = 9'], ['x = −1', 'x² = 1'], ['x = 4', 'x² = 16'], ['x = −2', 'x² = 4'], ['x > 3', 'x > 1'], ['x = 5', 'x² = 25']],
      // m2 판정 [p, q, 답] — 0~3 = 90쪽 예제 2 ⑴⑵ · 문제 4 ⑴⑵ (첫 판) · 4~ = 재도전
      kinds: [['x는 3의 배수이다.', 'x는 9의 배수이다.', '필요'], ['x² ≤ 25', '|x| ≤ 5', '필요충분'], ['a = 0 이고 b = 0', 'ab = 0', '충분'], ['2x − 1 < 5', '−1 < 2 − x', '필요충분'],
        ['x는 2의 배수이다.', 'x는 6의 배수이다.', '필요'], ['x는 12의 배수이다.', 'x는 4의 배수이다.', '충분'], ['x² ≤ 9', '|x| ≤ 3', '필요충분'], ['x² = 16', 'x = 4', '필요'], ['x = 3', 'x² = 9', '충분'],
        ['a = 0', 'ab = 0', '충분'], ['ab = 0', 'a = 0 또는 b = 0', '필요충분'], ['3x + 1 < 7', '−2 < 2 − x', '충분'], ['x − 2 > 1', '5 − x < 2', '필요충분'], ['x > 2', 'x > 5', '필요'],
        ['|x| < 2', '−2 < x < 2', '필요충분'], ['x² < 4', 'x < 2', '충분'], ['a² + b² = 0', 'a = 0 이고 b = 0', '필요충분'], ['x는 4의 배수이다.', 'x는 8의 배수이다.', '필요']],
      // m4 (2): [p, q, 「q 이면 p」 의 반례, 함정 둘] — 0 = 96쪽 중단원 04 (2)
      ab: [['a = b', 'a² = b²', 'a = 1, b = −1', ['a = 2, b = 2', 'a = 0, b = 0']], ['a = 0', 'ab = 0', 'a = 1, b = 0', ['a = 0, b = 1', 'a = 0, b = 0']],
        ['x = 2', 'x² = 4', 'x = −2', ['x = 2', 'x = 0']], ['x = −3', 'x² = 9', 'x = 3', ['x = −3', 'x = 0']], ['x = 1', 'x² = x', 'x = 0', ['x = 1', 'x = 2']]],
    },
    boss: { title: '10차시 형성평가 · 필요충분의 천칭 수호자', sprite: 'gardenboss:0', items: 4, hpItems: 4, tags: ['c1', 'c2', 'c2', 'c3'],
      book: [{ gen: 'bMult', k: 2, m: 4 }, { gen: 'bGt', a: 3, b: 1 }, { gen: 'bAbs', k: 2, form: 0 }, { gen: 'bChain', order: ['p', 'q', 'r'], say: ['nec', 'nec'], flip: true }],
      retry: [{ gen: 'bMult' }, { gen: 'bGt' }, { gen: 'bAbs' }, { gen: 'bChain' }] },
    // 칸 위치 (레이드용 v1 PDF · 2026-11-12 crops_pdf.py · review = 두 단 너비)
    crops: { review: [{ p: 1, x: 0.045, y: 0.1557, w: 0.914, h: 0.0464 }],
      c1: [{ p: 1, x: 0.045, y: 0.1991, w: 0.455, h: 0.242 }], m1: [{ p: 1, x: 0.045, y: 0.4358, w: 0.455, h: 0.214 }], sum: [{ p: 1, x: 0.045, y: 0.6424, w: 0.455, h: 0.1985 }],
      c2: [{ p: 1, x: 0.507, y: 0.1991, w: 0.452, h: 0.172 }], m2: [{ p: 1, x: 0.507, y: 0.3681, w: 0.452, h: 0.227 }],
      c3: [{ p: 2, x: 0.045, y: 0.1017, w: 0.455, h: 0.2044 }], m3: [{ p: 2, x: 0.045, y: 0.3031, w: 0.455, h: 0.212 }], m4: [{ p: 2, x: 0.045, y: 0.5017, w: 0.455, h: 0.4203 }],
      boss: [{ p: 2, x: 0.507, y: 0.115, w: 0.452, h: 0.7104 }] },
    videos: { // 🎬 2026-11-12 모션 #46 충분조건과필요조건 · #47 필요충분조건과진리집합 · #48 세조건의포함관계 (드라이브 05 원본 · 워터마크 없음)
      c1: 'assets/video/v10-46.mp4', m1: 'assets/video/v10-46.mp4',
      c2: 'assets/video/v10-47.mp4', m2: 'assets/video/v10-47.mp4', m4: 'assets/video/v10-47.mp4', sum: 'assets/video/v10-47.mp4',
      c3: 'assets/video/v10-48.mp4', m3: 'assets/video/v10-48.mp4' },
    next: { title: '11차시 · 명제의 증명', ask: '「x² 이 짝수이면 x 도 짝수」 — 바로 보이기 어려울 때 대우로 돌아가 볼까?', link: '오늘 배운 진리집합 · 대우로 명제를 증명하는 방법을 알아봐요' },
  };

  // ══ ② 계산 코드 ═════════════════════════════════════════════
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const num = (x) => (x < 0 ? `−${-x}` : String(x));
  const ch = (question, choices, ans, solution, check) => ({ type: 'choice', question, choices, answerIndex: choices.indexOf(ans), answer: ans, solution, check });
  const chR = (question, wrongs, ans, solution, check, r) => ch(question, r ? r.shuffle([ans, ...wrongs]) : [ans, ...wrongs], ans, solution, check);
  const pk = (r, v) => (Array.isArray(v) ? r.pick(v) : v);
  const sayOf = (q, say) => Object.assign(q, { say });
  const whyOf = (q, pre, choices, post) => Object.assign(q, { why: { pre, post, choices, answer: 0, text: `${pre} ${choices[0]}${post}` } });
  const W = DATA.words, KIND3 = ['충분조건', '필요조건', '필요충분조건'], J = { p: '는', q: '는', r: '은' };
  const dot = (s) => s.replace(/\.$/, ''), pq = (p, q) => `p : ${dot(p)}, q : ${dot(q)}`;
  const kindQ = (no, p, q, k, r, check) => chR(`${no ? `(${no}) ` : ''}${pq(p, q)} 일 때 p 는 q 이기 위한 무슨 조건인가?`, KIND3.filter((x) => x !== `${k}조건`), `${k}조건`,
    k === '필요충분' ? 'p ⇒ q 이고 q ⇒ p (P = Q) → 필요충분조건' : k === '충분' ? 'p ⇒ q 이지만 q ⇏ p (P ⊂ Q) → 충분조건' : 'q ⇒ p 이지만 p ⇏ q (Q ⊂ P) → 필요조건', check, r);
  // 세 조건: order = [안, 가운데, 바깥] (안 ⊂ 가운데 ⊂ 바깥) · say = [가운데 ⊂ 바깥 을, 안 ⊂ 가운데 를] 'suf'(안쪽이 충분) 또는 'nec'(바깥이 필요)로 말함 · flip = 안쪽 사실을 먼저
  const fact = (inner, outer, how) => (how === 'suf' ? `${inner} ${J[inner]} ${outer} 이기 위한 충분조건` : `${outer} ${J[outer]} ${inner} 이기 위한 필요조건`);
  const facts = (o, say, flip) => { const f = [fact(o[1], o[2], say[0]), fact(o[0], o[1], say[1])]; return flip ? f.reverse() : f; }; // 학습지 문제 3 = 바깥 쪽 사실 먼저 (p 는 q 이기 위한 필요조건 · r 은 q 이기 위한 충분조건)
  const U = (s) => s.toUpperCase();
  const chainStr = (o) => o.map(U).join(' ⊂ ');
  const propTrue = (o, s) => { const m = /^(~?)([pqr]) → (~?)([pqr])$/.exec(s), lv = (x) => o.indexOf(x); // 안(0) ⊂ 가운데(1) ⊂ 바깥(2) · 모두 공집합 아님 · 바깥 ≠ 전체
    const [, n1, a, n2, b] = m; if (!n1 && !n2) return lv(a) <= lv(b); if (n1 && n2) return lv(b) <= lv(a); return false; };
  const PERMS = [['p', 'q', 'r'], ['p', 'r', 'q'], ['q', 'p', 'r'], ['q', 'r', 'p'], ['r', 'p', 'q'], ['r', 'q', 'p']];

  const GEN = {
    // 문제 1 (89쪽): (1) p 는 q 의 (충분/필요) (2) q 는 p 의 (충분/필요) (3) a ⇒ b 에서 b(또는 a) 는 …
    defSN({ row, pair, ask }, r) { const [p, q] = W.def[row], [a, b] = W.pair[pair], two = ['충분조건', '필요조건'];
      const sub = ask === 'q' ? b : a, obj = ask === 'q' ? a : b;
      return [chR(`(1) ${pq(p, q)} 일 때 p ⇒ q 이다. p 는 q 이기 위한 무슨 조건인가?`, ['필요조건'], '충분조건', 'p ⇒ q → p 는 q 이기 위한 충분조건 (화살표가 나가는 쪽)', { def: row }, r),
        chR(`(2) ${pq(p, q)} 일 때 p ⇒ q 이다. q 는 p 이기 위한 무슨 조건인가?`, ['충분조건'], '필요조건', 'p ⇒ q → q 는 p 이기 위한 필요조건 (화살표를 받는 쪽)', { def: row }, r),
        chR(`(3) ${a} ⇒ ${b} 이다. ${sub} 는 ${obj} 이기 위한 무슨 조건인가?`, two.filter((x) => x !== (ask === 'q' ? '필요조건' : '충분조건')), ask === 'q' ? '필요조건' : '충분조건',
          ask === 'q' ? `${a} ⇒ ${b} → ${b} 는 받는 쪽 = 필요조건` : `${a} ⇒ ${b} → ${a} 는 나가는 쪽 = 충분조건`, { pair }, r)]; },
    defSNR(r, R) { return GEN.defSN({ row: pk(r, R.rows), pair: pk(r, R.pairs), ask: r.pick(['p', 'q']) }, r); },
    // 문제 2 (90쪽 예제 2 · 문제 4): 판정 4개
    judge4({ rows }, r) { return rows.map((k, i) => kindQ(i + 1, W.kinds[k][0], W.kinds[k][1], W.kinds[k][2], r, { kinds: k })); },
    judge4R(r, R) { for (;;) { const pool = r.shuffle(range(R.from, W.kinds.length - 1)).slice(0, 4); if (new Set(pool.map((k) => W.kinds[k][2])).size >= 2) return GEN.judge4({ rows: pool }, r); } },
    // 문제 3 (90쪽 생각 넓히기): (1) 포함 관계 (2) 참인 명제 모두
    chain3({ order, say, flip, props }, r) { const [f1, f2] = facts(order, say, flip), head = `세 조건 p, q, r 에 대하여 ${f1}이고, ${f2}일 때`;
      const right = chainStr(order), wr = [chainStr([...order].reverse()), chainStr([order[1], order[0], order[2]]), chainStr([order[0], order[2], order[1]])];
      const ans = props.map((s, i) => (propTrue(order, s) ? i : -1)).filter((i) => i >= 0);
      return [chR(`(1) ${head} 진리집합 P, Q, R 사이의 포함 관계는?`, wr, right, `${f1} · ${f2} → ${right}`, { order }, r),
        { type: 'multi', question: `(2) ${head} 참인 명제를 모두 고르시오.`, options: props, answer: ans, solution: `${right} → 안쪽 ⇒ 바깥쪽 · 그 대우도 참 → ${ans.map((i) => props[i]).join(', ')}`, check: { order } }]; },
    chain3R(r) { for (;;) { const order = r.pick(PERMS), say = [r.pick(['suf', 'nec']), r.pick(['suf', 'nec'])]; if (order.join() === 'r,q,p' && say.join() === 'nec,suf') continue;
      const [i, m, o] = order, T = [`${i} → ${o}`, `${i} → ${m}`, `${m} → ${o}`, `~${o} → ~${i}`, `~${m} → ~${i}`, `~${o} → ~${m}`], F = [`${o} → ${i}`, `${m} → ${i}`, `${o} → ${m}`, `${m} → ~${o}`, `${i} → ~${m}`, `~${o} → ${i}`, `~${i} → ~${o}`, `~${m} → ${i}`];
      return GEN.chain3({ order, say, flip: r.pick([false, true]), props: r.shuffle([...r.shuffle(T).slice(0, 2), ...r.shuffle(F).slice(0, 2)]) }, r); } },
    // 문제 4 (96쪽 중단원 04) ⚔ 소레이드: ① (1) 포함 관계 ② (1) 판정 (+ 💡 근거) ③ (2) 반례 ④ (2) 판정 · 👑 (3) 판정
    soraid({ a, b, c, ab, k, lt }, r) { const p1 = `x ≤ ${num(a)}`, q1 = `${num(b)} ≤ x ≤ ${num(c)}`, [p2, q2, ce, wr] = W.ab[ab], le = lt ? '<' : '≤', p3 = `|x| ${le} ${k}`, q3 = `−${k} ${le} x ${le} ${k}`;
      const s2 = sayOf(kindQ(0, p1, q1, '필요', r, { step: 2 }), 'q ⇒ p 이므로 p 는 q 이기 위한 필요조건이다.'); s2.question = `(1) ${s2.question}`;
      whyOf(s2, '∵ q ⇒ p 이면 p 는 q 이기 위한', ['필요조건', '충분조건', '필요충분조건'], '이다.'); // 💡 근거 줄 = ② 맞힌 뒤 (R2)
      const s4 = sayOf(kindQ(0, p2, q2, '충분', r, { step: 4 }), 'p ⇒ q 이지만 q ⇏ p 이므로 p 는 q 이기 위한 충분조건이다.'); s4.question = `(2) ${s4.question}`;
      const s5 = sayOf(kindQ(0, p3, q3, '필요충분', r, { step: 5 }), `그러므로 (3) ${p3} ⇔ ${q3}, P = Q 이므로 p 는 q 이기 위한 필요충분조건이다.`); s5.question = `(3) ${s5.question}`;
      return [
        sayOf(chR(`(1) ${pq(p1, q1)} 일 때 두 진리집합 P, Q 사이의 포함 관계는?`, ['P ⊂ Q', 'P = Q'], 'Q ⊂ P', `Q 의 수는 모두 ${num(a)} 이하 → Q ⊂ P (P 의 ${num(a)} 같은 수는 Q 에 없음)`, { step: 1 }, r), `(1) P = {x | ${p1}}, Q = {x | ${q1}} 이므로 Q ⊂ P 이다.`),
        s2,
        sayOf(chR(`(2) ${pq(p2, q2)} 일 때 「${q2} 이면 ${p2} 이다.」 의 반례는?`, wr, ce, `${ce} : ${q2} 는 맞지만 ${p2} 는 틀림`, { step: 3 }, r), `(2) 반례 ${ce} 가 있으므로 q ⇏ p 이다.`),
        s4, s5]; },
    soraidR(r) { for (;;) { const a = r.pick([1, 2, 3, 4]), b = r.pick([-5, -4, -3, -2, -1]), c = r.pick(range(b + 1, a - 1)), ab = r.pick(range(0, W.ab.length - 1)), k = r.pick([2, 3, 4, 5]), lt = r.pick([false, true]);
      if (a === 1 && b === -3 && c === 0) continue; return GEN.soraid({ a, b, c, ab, k, lt }, r); } },
    // 👑 형성평가 ① 배수 ② 부등식 ③ 절댓값 ④ 세 조건 포함 관계
    bMult({ k, m }, r) { const kd = k === m ? '필요충분' : m % k === 0 ? '필요' : '충분'; return kindQ(0, `x는 ${k}의 배수이다.`, `x는 ${m}의 배수이다.`, kd, r, { mult: [k, m] }); },
    bGt({ a, b }, r) { return kindQ(0, `x > ${a}`, `x > ${b}`, a > b ? '충분' : '필요', r, { gt: [a, b] }); },
    bAbs({ k, form }, r) { const F = [[`−${k} ≤ x ≤ ${k}`, '필요충분'], [`0 ≤ x ≤ ${k}`, '필요'], [`x ≤ ${k}`, '충분']][form]; return kindQ(0, `|x| ≤ ${k}`, F[0], F[1], r, { abs: [k, form] }); },
    bChain({ order, say, flip }, r) { const [f1, f2] = facts(order, say, flip), right = chainStr(order);
      return chR(`세 조건 p, q, r 에 대하여 ${f1}이고, ${f2}일 때 진리집합 P, Q, R 사이의 포함 관계는?`, [chainStr([...order].reverse()), chainStr([order[1], order[0], order[2]]), chainStr([order[0], order[2], order[1]])], right, `${f1} · ${f2} → ${right}`, { order }, r); },
  };
  const fix = (q, no) => Object.assign(q, { question: `${no}. ${q.question}` });
  const R0 = (k) => DS.Rng(`s10v1|${k}`);
  const RG = { defSN: 'defSNR', judge4: 'judge4R', chain3: 'chain3R', soraid: 'soraidR' };
  const MONSTERS = {};
  Object.entries(DATA.monsters).forEach(([id, M]) => {
    MONSTERS[id] = { title: M.title, sprite: M.sprite, note: M.note, ...(M.evalQ ? { evalQ: true } : {}),
      make: (a, r) => (a === 0 ? GEN[M.book.gen](M.book, R0(id)) : GEN[RG[M.retry.gen]](r, M.retry)) };
  });
  const CARD = '두 조건 p, q 가 다음과 같을 때, p 는 q 이기 위한 어떤 조건인지 말하시오.';
  const CHAIN = { m4: (pass, r) => { const items = pass === 0 ? GEN.soraid(DATA.monsters.m4.book, R0('m4c')) : GEN.soraidR(r);
    if (pass > 0) { const t = items.map((q) => /p : (.+?), q : (.+?) 일 때/.exec(q.question)); const card = `${CARD} (1) ${pq(t[0][1], t[0][2])} (2) ${pq(t[2][1], t[2][2])} (3) ${pq(t[4][1], t[4][2])}`; items.forEach((it) => { it.problem = card; }); } return items; } };
  const MULT = [[2, 4], [3, 6], [4, 2], [6, 3], [5, 10], [10, 5], [3, 9], [9, 3], [4, 12], [12, 4], [2, 6], [6, 2]];
  const bossMake = (i, a, r) => { const B = DATA.boss.book[i]; let q;
    if (B.gen === 'bMult') { for (;;) { const [k, m] = r.pick(MULT); if (k === 2 && m === 4) continue; q = GEN.bMult({ k, m }, r); break; } }
    else if (B.gen === 'bGt') { for (;;) { const x = r.pick(range(0, 6)), y = r.pick(range(0, 6)); if (x === y || (x === 3 && y === 1)) continue; q = GEN.bGt({ a: x, b: y }, r); break; } }
    else if (B.gen === 'bAbs') { for (;;) { const k = r.pick([1, 2, 3, 4, 5]), form = r.pick([0, 1, 2]); if (k === 2 && form === 0) continue; q = GEN.bAbs({ k, form }, r); break; } }
    else { for (;;) { const order = r.pick(PERMS), say = [r.pick(['suf', 'nec']), r.pick(['suf', 'nec'])]; if (order.join() === 'p,q,r' && say.join() === 'nec,nec') continue; q = GEN.bChain({ order, say, flip: r.pick([false, true]) }, r); break; } }
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
      sets: { 1: BOSS1, 2: BOSS1.map((q, i) => bossMake(i, 1, DS.Rng(`s10v1|boss2|${i}`))) }, make(i, a, rng) { return a ? bossMake(i, a, rng) : BOSS1[i]; } },
  });
})();
