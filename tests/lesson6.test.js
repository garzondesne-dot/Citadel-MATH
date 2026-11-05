// 6차시 검증: node tests/lesson6.test.js  (학습과정 6차시 레이드용 v2 · 2026-11-04 사용자 확정)
// (1) 레이드 순서: 개념1 → 문제1 → … → 문제4 → 문제4-2 → 개념5 → 문제5 → 개념6 → 문제6 → 형성평가 · 보강 ① 만 중단원던전 6층
// (사각형 명제) 「X이면 Y」 참 · 거짓을 사각형의 성질(평행한 대변 쌍 · 네 각 직각 · 네 변 같음)로 따로 계산 — 차시 파일의 표를 쓰지 않음
// (2) 첫 시도 = 학습지 · 교사용 정답 (아래에 따로 적음)
// (3) 재도전 시드 300개 × 3번: 문제 글에서 U · A · B · n(…) · 인원을 직접 읽어 내고 따로 계산 (차시 파일의 계산 결과를 쓰지 않음)
// (4) 명제 · 부정 문장: 아래에 따로 적은 참 · 거짓 표로 확인 · 부정 보기는 「~이 아니다 / 부등호 뒤집기」 규칙으로 따로 만들어 비교
// (5) 형성평가 세트1·2 (6문항 · 4번 사각형 명제) · 보기 순서 섞임 · 채점
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-06.js']);
const L = DS.Lessons.get('set-06'), Q = DS.Quiz;
let fail = 0, count = 0;
const check = (c, m) => { count++; if (!c) { fail++; if (fail <= 30) console.error('FAIL:', m); } };

// ── 독립 계산 도구 ─────────────────────────────────────────
const norm = (A) => [...new Set(A)].sort((a, b) => a - b);
const parseSet = (s) => (s.trim() === '∅' ? [] : s.replace(/[{}]/g, '').split(',').map((t) => t.trim()).filter(Boolean).map(Number));
const has = (A, x) => A.includes(x);
// 식 계산 (이 차시에 나오는 꼴만): (A ∪ B)ᶜ · Aᶜ · Bᶜ · Aᶜ ∩ Bᶜ · (A ∩ B)ᶜ · Aᶜ ∪ Bᶜ — 원소마다 정의대로 판정
function evalExpr(expr, U, A, B) {
  const inA = (x) => has(A, x), inB = (x) => has(B, x);
  const f = {
    '(A ∪ B)ᶜ': (x) => !(inA(x) || inB(x)), 'Aᶜ': (x) => !inA(x), 'Bᶜ': (x) => !inB(x),
    'Aᶜ ∩ Bᶜ': (x) => !inA(x) && !inB(x), '(A ∩ B)ᶜ': (x) => !(inA(x) && inB(x)), 'Aᶜ ∪ Bᶜ': (x) => !inA(x) || !inB(x),
  }[expr];
  if (!f) throw new Error('모르는 식 ' + expr);
  return U.filter(f);
}
const readU = (q) => parseSet(/U = (\{[^}]*\})/.exec(q)[1]);
const readSet = (q, n) => parseSet(new RegExp(`${n} = (\\{[^}]*\\})`).exec(q)[1]);
const chosen = (q) => q.answer.map((i) => Number(q.options[i]));

// 문장의 참 · 거짓 (교과서 · 학습지 뜻 그대로, 차시 파일과 따로 적음). null = 명제 아님
const TRUTH = {
  '3은 홀수이다.': true, '2는 소수이다.': true, '정사각형은 직사각형이다.': true, '6은 3의 배수이다.': true, '2 + 3 = 5': true, '삼각형의 세 내각의 합은 180°이다.': true,
  '5 + 4 = 10': false, '2 + 3 = 7': false, '9는 짝수이다.': false, '1은 소수이다.': false, '태양은 지구를 중심으로 돈다.': false, '4 < 1': false,
  '축구는 재미있다.': null, '부산은 큰 도시이다.': null, '떡볶이는 맛있다.': null, '수학 선생님은 키가 크다.': null, '이 노래는 좋은 노래이다.': null, '우리 반 교실은 넓다.': null,
  '순천시는 대한민국의 수도이다.': false, '맛초킹은 가장 맛있는 치킨이다.': null, '우리 반 착한 친구의 비중이 전국에서 가장 높다.': null, '제주도는 대한민국에서 가장 큰 섬이다.': true,
  '4는 2의 배수이다.': true, '3 > 5': false, '√4 는 무리수이다.': false, '7은 소수이다.': true, '2 < 7': true, '√9 는 무리수이다.': false, '8 ≤ 3': false,
};
// 부정 만들기 (규칙): 부등호는 뒤집고, 「~이다.」는 「~이 아니다」 (차시 파일 보기와 글자 비교)
function negate(p) {
  const m = /^(\S+) ([<>≤≥]) (\S+)$/.exec(p);
  if (m) return `${m[1]} ${{ '>': '≤', '<': '≥', '≤': '>', '≥': '<' }[m[2]]} ${m[3]}`;
  const t = p.replace(/\.$/, '').replace(/^√(\d) 는/, '√$1는');
  if (/는 무리수이다$/.test(t)) return t.replace(/이다$/, '가 아니다');
  return t.replace(/이다$/, '가 아니다');
}
// 사각형: (평행한 대변 쌍 0 · 1 · 2, 네 각 직각, 네 변 같음) — 직각이나 변이 모두 같으면 두 쌍 평행 (가능한 사각형만)
const SHAPES = []; [0, 1, 2].forEach((pp) => [false, true].forEach((rt) => [false, true].forEach((eq) => { if ((rt || eq) && pp !== 2) return; SHAPES.push({ pp, rt, eq }); })));
const FAM = { 사다리꼴: (q) => q.pp >= 1, 평행사변형: (q) => q.pp === 2, 직사각형: (q) => q.rt, 마름모: (q) => q.eq, 정사각형: (q) => q.rt && q.eq };
const quadTruth = (x, y) => SHAPES.every((q) => !FAM[x](q) || FAM[y](q));

function gradeOk(q, tag) {
  const right = q.type === 'choice' ? q.answerIndex : q.answer;
  const wrong = q.type === 'choice' ? (q.answerIndex + 1) % q.choices.length : q.type === 'number' ? q.answer + 1 : [];
  check(Q.grade(q, right) === true, `${tag}: 정답 채점`);
  check(Q.grade(q, wrong) === false, `${tag}: 오답이 정답 처리됨`);
  if (q.type === 'choice') check(q.answerIndex >= 0 && new Set(q.choices).size === q.choices.length, `${tag}: 보기 중복 · 정답 없음`);
}

// 문항 하나를 문제 글만 보고 독립 확인
function verify(mid, q, tag) {
  const text = q.question;
  if (mid === 'm1') {
    const U = readU(text), A = readSet(text, 'A'), B = readSet(text, 'B'), expr = q.check.expr;
    check(JSON.stringify(chosen(q)) === JSON.stringify(evalExpr(expr, U, A, B)), `${tag} ${expr}: ${chosen(q)} ≠ ${evalExpr(expr, U, A, B)}`);
    check(JSON.stringify(q.options.map(Number)) === JSON.stringify(U), `${tag}: 보기는 U 의 원소`);
  } else if (mid === 'm2') {
    const g = (k) => Number(new RegExp(`${k} = (\\d+)`).exec(text)[1]);
    const u = g('n\\(U\\)'), a = g('n\\(A\\)'), b = g('n\\(B\\)'), ab = g('n\\(A ∩ B\\)');
    // 원소를 실제로 만들어 센다: A ∩ B = 1..ab, A 만 · B 만 · 바깥
    const U = Array.from({ length: u }, (_, i) => i + 1), A = U.slice(0, a), B = [...U.slice(0, ab), ...U.slice(a, a + b - ab)];
    check(A.length === a && B.length === b && A.filter((x) => B.includes(x)).length === ab && a + b - ab <= u, `${tag}: 조건이 가능한 수`);
    const want = { 'n(Aᶜ)': U.filter((x) => !A.includes(x)).length, 'n(A − B)': A.filter((x) => !B.includes(x)).length, 'n(B − A)': B.filter((x) => !A.includes(x)).length,
      'n(A ∪ B)': U.filter((x) => A.includes(x) || B.includes(x)).length, 'n(Aᶜ ∩ Bᶜ)': U.filter((x) => !A.includes(x) && !B.includes(x)).length };
    const key = Object.keys(want).find((k) => text.includes(`${k} =`) && text.lastIndexOf(k) > text.indexOf('일 때'));
    check(key && q.answer === want[key], `${tag} ${key}: ${q.answer} ≠ ${want[key]}`);
  } else if (mid === 'm3') {
    const m = /(\d+)명 중 (\S+) 동아리 (\d+)명, (\S+) 동아리 (\d+)명, 둘 다 (\d+)명/.exec(text), [T, x, y, both] = [m[1], m[3], m[5], m[6]].map(Number);
    const people = Array.from({ length: T }, (_, i) => ({ p: i < x, q: i < both || (i >= x && i < x + y - both) }));
    check(people.filter((s) => s.p).length === x && people.filter((s) => s.q).length === y && people.filter((s) => s.p && s.q).length === both, `${tag}: 인원 배치`);
    const want = text.includes('또는') ? people.filter((s) => s.p || s.q).length : text.includes('만 하는') ? people.filter((s) => s.p && !s.q).length : people.filter((s) => !s.p && !s.q).length;
    check(q.answer === want, `${tag}: ${q.answer} ≠ ${want}`);
  } else if (mid === 'm4') {
    const s = q.check.sentence, t = TRUTH[s];
    check(s in TRUTH, `${tag}: 표에 없는 문장 ${s}`);
    check(q.answer === (t === true ? '참인 명제' : t === false ? '거짓인 명제' : '명제 아님'), `${tag} ${s}: ${q.answer}`);
  } else if (mid === 'm5' && q.check.neg) {
    check(q.answer === negate(q.check.neg), `${tag}: 부정 ${q.answer} ≠ ${negate(q.check.neg)}`);
    check(q.choices.filter((c) => c === negate(q.check.neg)).length === 1, `${tag}: 부정 보기는 하나`);
  } else if (mid === 'm5') {
    const t = TRUTH[q.check.negTruth];
    check(typeof t === 'boolean' && q.answer === (t ? '거짓' : '참'), `${tag}: ~p 참거짓`);
  } else if (mid === 'b1') {
    const g = (re) => Number(re.exec(text)[1]), u = g(/1, 2, …, (\d+)\}/), nAB = g(/n\(A ∩ B\) = (\d+)/), nOut = g(/n\(\(A ∪ B\)ᶜ\) = (\d+)/);
    check(q.answer === (text.includes('뺀 부분') ? u - nOut - nAB : u - nOut), `${tag}: ${q.answer}`);
  } else if (mid === 'm42' && q.type === 'multi') {
    const want = q.options.map((s, i) => (TRUTH[s] !== null && s in TRUTH ? i : -1)).filter((i) => i >= 0);
    check(q.options.every((s) => s in TRUTH), `${tag}: 표에 없는 문장`);
    check(JSON.stringify(q.answer) === JSON.stringify(want), `${tag}: 명제 고르기 ${q.answer} ≠ ${want}`);
  } else if (mid === 'm42') {
    check(text.includes('모든') && q.choices.includes(q.answer), `${tag}: 삼단논법`);
  } else if (mid === 'm6' || q.check && q.check.quad) {
    const m = /「(\S+)이면 (\S+)이다\.」/.exec(text);
    check(m && FAM[m[1]] && FAM[m[2]] && m[1] !== m[2], `${tag}: 사각형 이름 ${text}`);
    if (m) check(q.answer === (quadTruth(m[1], m[2]) ? '참' : '거짓'), `${tag}: ${m[1]} → ${m[2]} 은 ${quadTruth(m[1], m[2])} 인데 ${q.answer}`);
  }
  gradeOk(q, tag);
}

// (1) 순서
const order = L.steps.map((s) => s.id).join(' ');
check(order === 'c1 m1 c2 m2 c3 m3 c4 m4 m42 c5 m5 c6 m6 boss', `순서 ${order}`);
check(L.no === 6 && L.theme === '01-burrow' && !L.bonus, '차시 번호 · 테마 · 보강 삭제 (2026-11-05)');
check(Object.keys(L.crops).length === 14 && L.steps.every((st) => L.crops[st.id]), '칸 위치 14칸 · 단계마다');

// (2) 첫 시도 = 학습지 (교사용 정답)
const first = (mid) => L.items(mid, 'seed', 0);
const ansOf = (q) => (q.type === 'multi' ? `{${chosen(q).join(',')}}` : String(q.answer));
const sheet = {
  m1: ['{5,6}', '{5,6}', '{1,2,4,5,6}', '{1,2,4,5,6}'], // ★ (A∪B)ᶜ · Aᶜ∩Bᶜ · (A∩B)ᶜ · Aᶜ∪Bᶜ
  m2: ['18', '7', '8'], m3: ['25', '15'],
  m4: ['거짓인 명제', '명제 아님', '참인 명제', '명제 아님'],
  m42: ['죽는다', '{0,3,5}'],
  m5: ['4는 2의 배수가 아니다', '거짓', '3 ≤ 5', '참'],
  m6: ['참', '거짓', '참', '거짓'],
  b1: ['5', '4'],
};
for (const [mid, want] of Object.entries(sheet)) {
  const got = first(mid).map((q) => (mid === 'm42' && q.type === 'multi' ? `{${q.answer.join(',')}}` : ansOf(q)));
  check(JSON.stringify(got) === JSON.stringify(want), `${mid} 첫 시도 ${JSON.stringify(got)} ≠ 학습지 ${JSON.stringify(want)}`);
  first(mid).forEach((q, i) => verify(mid, q, `${mid}#0.${i}`));
}

// (3) 재도전 300 시드 × 3번
let n = 0;
for (let s = 0; s < 300; s++) for (let a = 1; a <= 3; a++) for (const mid of Object.keys(L.monsters)) L.items(mid, `s${s}`, a).forEach((q, i) => { n++; verify(mid, q, `${mid}#${s}.${a}.${i}`); });
// 같은 시드 → 같은 문제 · 다른 시도 → 다른 문제
check(JSON.stringify(L.items('m2', 'x', 1)) === JSON.stringify(L.items('m2', 'x', 1)), '같은 시드는 같은 문제');
check(JSON.stringify(L.items('m2', 'x', 1)) !== JSON.stringify(L.items('m2', 'x', 2)), '재도전마다 숫자가 바뀜');

// (4) 문장 묶음: 재도전 문제 4 는 참 1 · 거짓 1 · 명제 아님 2, 문제 6 은 참 2 · 거짓 2, 부정 정답이 늘 ① 이 아님
const kinds = L.items('m4', 'k', 1).map((q) => q.answer).sort().join();
check(kinds === '거짓인 명제,명제 아님,명제 아님,참인 명제', `문제 4 재도전 구성 ${kinds}`);
for (let s = 0; s < 100; s++) { const a6 = L.items('m6', `q${s}`, 1).map((q) => q.answer).sort().join(); check(a6 === '거짓,거짓,참,참', `문제 6 재도전 구성 ${a6}`); }
let firstPos = 0, negN = 0;
for (let s = 0; s < 200; s++) L.items('m5', `n${s}`, 1).filter((q) => q.check.neg).forEach((q) => { negN++; if (q.answerIndex === 0) firstPos++; });
check(firstPos < negN * 0.6, `부정 정답이 ①에 쏠림 (${firstPos}/${negN})`);

// (5) 형성평가
const bossWant = { 1: ['∩', 'Aᶜ ∪ Bᶜ', '13', '참', '떡볶이는 맛있다.', '5는 홀수가 아니다'],
  2: ['∪', 'Aᶜ ∩ Bᶜ', '16', '거짓', '이 영화는 재미있다.', '8은 짝수가 아니다'] };
for (const set of [1, 2]) {
  const qs = L.boss.sets[set];
  check(qs.length === 6 && L.boss.items === 6 && L.boss.hpItems === 6, `세트${set} 문항 수`);
  check(JSON.stringify(qs.map((q) => String(q.answer))) === JSON.stringify(bossWant[set]), `세트${set} 정답 ${JSON.stringify(qs.map((q) => q.answer))}`);
  qs.forEach((q, i) => gradeOk(q, `보스${set}-${i + 1}`));
  verify('m6', qs[3], `보스${set}-4 사각형`); // 4번 독립 계산
  check(qs.every((q, i) => q.question.startsWith(`${i + 1}.`)), `세트${set} 번호`);
  check(qs.filter((q) => q.type === 'choice').some((q) => q.answerIndex !== 0), `세트${set} 보기 섞임`);
}
check(L.boss.tags.length === 6 && L.boss.sprite === '2@h250', '보스 태그 · 그림자 드래곤(성채 드래곤 색 변형)');

// (6) 형성평가 재도전 생성기 L.boss.make(i, a, rng) (2026-11-05 · 문항마다 4번: 시도 0 = 세트1 그대로 · 1~3 = 같은 꼴 · 새 값)
//   문제 글에서 식 · 수 · 문장을 읽어 따로 계산 (차시 파일의 정답 · 표를 쓰지 않음) · 식은 벤 다이어그램 칸(원소가 A · B 에 드는지)마다 진리표로 비교
function parseDM(s) { // 'Aᶜ ∪ Bᶜ' · '(A ∩ B)ᶜ' · 'A ∪ Bᶜ' → (칸) => 그 칸이 식에 드는지
  const t = s.replace(/\s+/g, ''); let p = 0;
  const term = () => {
    let f;
    if (t[p] === '(') { p++; f = expr(); if (t[p++] !== ')') throw new Error('괄호 ' + s); }
    else if (/[A-Z]/.test(t[p] || '')) { const c = t[p++]; f = (e) => e[c]; }
    else throw new Error('모르는 식 ' + s);
    while (t[p] === 'ᶜ') { p++; const g = f; f = (e) => !g(e); }
    return f;
  };
  const expr = () => { let f = term(); while (t[p] === '∪' || t[p] === '∩') { const o = t[p++], g = term(), h = f; f = o === '∪' ? (e) => h(e) || g(e) : (e) => h(e) && g(e); } return f; };
  const f = expr(); if (p !== t.length) throw new Error('남은 글자 ' + s); return f;
}
function sameSetExpr(s1, s2) { // 모든 칸에서 같으면 같은 집합
  const ls = [...new Set((s1 + s2).match(/[A-Z]/g))], f = parseDM(s1), g = parseDM(s2);
  for (let m = 0; m < 1 << ls.length; m++) { const e = {}; ls.forEach((c, k) => { e[c] = !!((m >> k) & 1); }); if (f(e) !== g(e)) return false; }
  return true;
}
check(sameSetExpr('(A ∪ B)ᶜ', 'Aᶜ ∩ Bᶜ') && sameSetExpr('(A ∩ B)ᶜ', 'Aᶜ ∪ Bᶜ') && !sameSetExpr('(A ∪ B)ᶜ', 'Aᶜ ∪ Bᶜ') && !sameSetExpr('(A ∩ B)ᶜ', 'Aᶜ ∪ B'), '진리표 도구 (드모르간 · 틀린 꼴)');
// 사각형 포함 사슬 (교과서 그대로 따로 적음): 정사각형 ⊂ 직사각형 ⊂ 평행사변형 ⊂ 사다리꼴 · 정사각형 ⊂ 마름모 ⊂ 평행사변형 → 참인 「X이면 Y」 9개, 나머지 11개 거짓
const QUAD_TRUE = ['정사각형|직사각형', '정사각형|마름모', '정사각형|평행사변형', '정사각형|사다리꼴', '직사각형|평행사변형', '직사각형|사다리꼴', '마름모|평행사변형', '마름모|사다리꼴', '평행사변형|사다리꼴'];
const QN = ['사다리꼴', '평행사변형', '직사각형', '마름모', '정사각형'];
QN.forEach((x) => QN.forEach((y) => { if (x !== y) check(quadTruth(x, y) === QUAD_TRUE.includes(`${x}|${y}`), `사각형 사슬 ${x} → ${y}`); }));
// 문장 묶음 하나하나: 따로 적은 참 · 거짓 표와 맞는지 (TRUE → 참 · FALSE → 거짓 · NONE2 → 명제 아님 · PROP_EXTRA 는 명제)
const W = L.WORDS;
W.TRUE.forEach((s) => check(TRUTH[s] === true, `참 묶음 ${s}`));
W.FALSE.forEach((s) => check(TRUTH[s] === false, `거짓 묶음 ${s}`));
W.NONE2.forEach((s) => check(s in TRUTH && TRUTH[s] === null, `명제 아님 묶음 ${s}`));
W.PROP_EXTRA.forEach((s) => check(typeof TRUTH[s] === 'boolean', `명제 묶음 ${s}`));
// 수 읽기 받침 (따로): 끝자리 영 · 일 · 이 · 삼 · 사 · 오 · 육 · 칠 · 팔 · 구, 10 의 배수는 십
const readLast = (n) => (n % 10 === 0 ? '십' : '영일이삼사오육칠팔구'[n % 10]);
const josa = (n) => ((readLast(n).charCodeAt(0) - 0xac00) % 28 ? '은' : '는');

check(typeof L.boss.make === 'function', '형성평가 생성기 L.boss.make');
const set1Snap = JSON.stringify(L.boss.sets[1]);
for (let i = 0; i < 6; i++) check(L.boss.make(i, 0, DS.Rng('z')) === L.boss.sets[1][i], `시도 0 = 세트1 ${i + 1}번`);
const bossTexts = Array.from({ length: 6 }, () => new Set()), bossFull = Array.from({ length: 6 }, () => new Set()), ansPos = Array.from({ length: 6 }, () => new Set());
const tfCount = { 참: 0, 거짓: 0 }, same12 = [0, 0, 0, 0, 0, 0];
let nb = 0;
function verifyBoss(i, q, tag) {
  const text = q.question;
  check(q.check && typeof q.check === 'object', `${tag}: check 없음`);
  check(text.startsWith(`${i + 1}. `), `${tag}: 번호 ${text}`);
  const all = [text, q.solution, ...(q.choices || [])].join(' ');
  check(!/위 /.test(all) && !/번의/.test(all), `${tag}: 혼자 읽히지 않는 글 ${text}`);
  if (q.type === 'choice') {
    check(new Set(q.choices).size === q.choices.length && q.choices[q.answerIndex] === q.answer && q.choices.filter((c) => c === q.answer).length === 1, `${tag}: 보기 중복 · 정답 위치`);
    q.choices.forEach((c, k) => check(Q.grade(q, k) === (k === q.answerIndex), `${tag}: 보기 ${k + 1} 채점`));
    ansPos[i].add(q.answerIndex);
  } else {
    check(Q.grade(q, q.answer) === true && Q.grade(q, q.answer + 1) === false && Q.grade(q, q.answer - 1) === false, `${tag}: 숫자 채점`);
  }
  if (i === 0) { // ( ) 에 각 보기를 넣어 두 식이 같은 집합인지 진리표로
    const m = /^1\. (.+) = (.+) 의 \( \) 에 알맞은 것은\?$/.exec(text);
    check(m && q.choices.length === 2 && q.choices.includes('∪') && q.choices.includes('∩'), `${tag}: 1번 꼴 ${text}`);
    if (m) {
      const ok = q.choices.filter((c) => sameSetExpr(m[1].replace('( )', c), m[2].replace('( )', c)));
      check(ok.length === 1 && ok[0] === q.answer, `${tag}: ${text} → ${ok} ≠ ${q.answer}`);
    }
  } else if (i === 1) { // 보기 중 식과 같은 집합은 정확히 하나
    const m = /^2\. (.+) 과 같은 것은\?$/.exec(text);
    check(m && q.choices.length === 4, `${tag}: 2번 꼴 ${text}`);
    if (m) {
      const ok = q.choices.filter((c) => sameSetExpr(m[1], c));
      check(ok.length === 1 && ok[0] === q.answer, `${tag}: ${m[1]} 과 같은 것 ${ok} ≠ ${q.answer}`);
      // 틀린 보기에 「∪ ↔ ∩ 안 바꿈」이 늘 있다 (식의 ᶜ 자리는 정답과 같고 기호만 다름)
      const flipOnly = q.answer.replace(/[∪∩]/, (o) => (o === '∪' ? '∩' : '∪'));
      check(q.choices.includes(flipOnly), `${tag}: 틀린 보기 「기호 안 바꿈」 ${flipOnly}`);
    }
  } else if (i === 2) { // U 를 실제로 만들어 센다
    const m = /^3\. n\(U\) = (\d+), n\(([A-Z])\) = (\d+) 일 때 n\(\2ᶜ\) = \?$/.exec(text);
    check(m, `${tag}: 3번 꼴 ${text}`);
    if (m) {
      const U = Array.from({ length: Number(m[1]) }, (_, k) => k + 1), A = U.slice(0, Number(m[3]));
      check(A.length === Number(m[3]) && A.length > 0 && A.length < U.length, `${tag}: 가능한 수`);
      check(q.answer === U.filter((x) => !A.includes(x)).length, `${tag}: n(ᶜ) ${q.answer}`);
    }
  } else if (i === 3) {
    check(JSON.stringify(q.choices) === JSON.stringify(['참', '거짓']), `${tag}: 참 · 거짓 보기`);
    verify('m6', q, tag); // 사각형 성질로 따로 계산
    tfCount[q.answer]++;
  } else if (i === 4) { // 따로 적은 표: 명제 아님은 하나 · 참인 명제 하나 · 거짓인 명제 하나
    check(q.choices.length === 3 && q.choices.every((s) => s in TRUTH), `${tag}: 표에 없는 문장 ${q.choices}`);
    const none = q.choices.filter((s) => TRUTH[s] === null);
    check(none.length === 1 && none[0] === q.answer, `${tag}: 명제 아닌 것 ${none} ≠ ${q.answer}`);
    check(q.choices.filter((s) => TRUTH[s] === true).length === 1 && q.choices.filter((s) => TRUTH[s] === false).length === 1, `${tag}: 참 1 · 거짓 1 · 명제 아님 1`);
  } else if (i === 5) { // 부정 규칙 · p 의 참 · 조사
    const m = /^6\. “(.+)” 의 부정은\?$/.exec(text);
    check(m, `${tag}: 6번 꼴 ${text}`);
    if (m) {
      const p = m[1], neg = negate(p);
      check(q.answer === neg && q.choices.filter((c) => c === neg).length === 1 && q.choices.length === 3, `${tag}: 부정 ${q.answer} ≠ ${neg}`);
      check(q.choices.includes(p.replace(/\.$/, '')), `${tag}: 틀린 보기 「p 그대로」`);
      const k = /^(\d+)(은|는) (홀수|짝수|(\d+)의 배수)이다\.$/.exec(p);
      check(k, `${tag}: p 꼴 ${p}`);
      if (k) {
        const n = Number(k[1]);
        check(k[2] === josa(n), `${tag}: 조사 ${n}${k[2]}`);
        const t = k[3] === '홀수' ? n % 2 === 1 : k[3] === '짝수' ? n % 2 === 0 : n % Number(k[4]) === 0 && n > Number(k[4]);
        check(t, `${tag}: p 가 참 (${p})`);
      }
    }
  }
}
for (let s = 0; s < 300; s++) for (let i = 0; i < 6; i++) {
  const qs = [1, 2, 3].map((a) => L.boss.make(i, a, DS.Rng(`s${s}|boss|${i}|${a}`)));
  qs.forEach((q, k) => { nb++; verifyBoss(i, q, `보스재도전${i + 1}#${s}.${k + 1}`); bossTexts[i].add(q.question); bossFull[i].add(`${q.question}|${(q.choices || []).slice().sort().join('/')}`); });
  check(JSON.stringify(qs[0]) !== JSON.stringify(L.boss.sets[1][i]) && qs.every((q) => q.question !== L.boss.sets[1][i].question || i === 4), `보스재도전${i + 1}#${s}: 학습지와 같은 문제`);
  if (JSON.stringify(qs[0]) === JSON.stringify(qs[1])) same12[i]++;
}
for (let i = 0; i < 6; i++) {
  const want = i === 4 ? 3 : 5, got = i === 4 ? bossFull[i].size : bossTexts[i].size;
  check(got >= want, `보스재도전 ${i + 1}번: 서로 다른 문제 ${got}개 (≥ ${want})`);
  check(same12[i] < 300 * 0.15, `보스재도전 ${i + 1}번: 시도 1 · 2 가 같은 문제 ${same12[i]}/300`);
  if (i !== 2 && i !== 3) check(ansPos[i].size >= 2, `보스재도전 ${i + 1}번: 정답 자리가 섞임`);
}
check(tfCount.참 > 300 && tfCount.거짓 > 300, `보스재도전 4번: 참 · 거짓 고루 (${tfCount.참} · ${tfCount.거짓})`);
check(JSON.stringify(L.boss.make(1, 2, DS.Rng('x|boss|1|2'))) === JSON.stringify(L.boss.make(1, 2, DS.Rng('x|boss|1|2'))), '보스재도전: 같은 시드는 같은 문제');
check(JSON.stringify(L.boss.sets[1]) === set1Snap, '보스재도전: 세트1(학습지) 그대로 · 생성기가 건드리지 않음');

if (fail) { console.error(`\n${fail}건 실패 (${count}건 중)`); process.exit(1); }
console.log(`OK: 6차시 레이드용 v2 — 순서 · 학습지 ★ 첫 시도 · 재도전 소문제 ${n}개 독립 검산 · 명제/부정/사각형 명제 · 형성평가 6문항 세트1·2 · 재도전 생성기 ${nb}문항 독립 검산 (${count}건) 통과`);
