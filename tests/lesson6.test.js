// 6차시 검증: node tests/lesson6.test.js  (학습과정 6차시 레이드용 v3 · 2026-11-05 사용자 확정 — 드모르간 + 집합 중단원 마무리)
// (1) 레이드 순서: 개념1 → 문제1 → 개념2 → 문제2 → 개념3 → 문제3 → 개념4(집합 한 장 정리) → 문제4(07) → 문제5(08) → 문제6(11) → 문제7(12) → 형성평가
// (2) 첫 시도 = 학습지 ★ 칸 · 중단원 문항은 교과서 원문 그대로 (정답 = 교과서 해설 148~149쪽, 아래에 따로 적음)
// (3) 재도전 시드 300개 × 3번: 문제 글에서 숫자 · 집합을 직접 읽어 내고 원소를 하나하나 세어 따로 계산 (차시 파일의 계산 결과를 쓰지 않음)
// (4) v2 명제 몬스터(m4 · m42 · m5 · m6 · b1)는 단계에 없음 · 1-6반 기록용으로 남아 있고 여전히 맞게 채점 (명제 · 부정 · 사각형 독립 계산)
// (5) 형성평가 6문항 (드모르간 · n(Aᶜ) · 04 · 05⑷ · 06 · 10) · 재도전 생성기 L.boss.make 독립 검산
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

// v3 중단원 문항: 문제 글만 읽어 원소를 세어 따로 계산
const R = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const toNum = (t) => Number(String(t).replace('−', '-'));
const pickedNums = (q) => q.answer.map((i) => toNum(q.options[i])).sort((a, b) => a - b);
function verifyUnit(mid, q, tag) {
  const t = q.question; let m;
  if (mid === 'u4') {
    m = /^두 집합 A = \{x \| x는 (\d+)의 약수\}, B = \{x \| x는 (\d+) 이하의 (\d+)의 배수\}에 대하여 A ∩ X = ∅ 과 B ∪ X = B 를 만족시키는 집합 X 의 개수는\?/.exec(t);
    check(m, `${tag}: 07 꼴 ${t}`); if (!m) return;
    const [p, N, k] = m.slice(1).map(Number), A = R(1, p).filter((x) => p % x === 0), B = R(1, N).filter((x) => x % k === 0);
    // X 를 B 의 부분집합으로 하나하나 만들어 조건을 센다
    let cnt = 0; for (let mask = 0; mask < 1 << B.length; mask++) { const X = B.filter((_, j) => (mask >> j) & 1); const BuX = new Set([...B, ...X]); if (X.every((x) => !A.includes(x)) && BuX.size === B.length) cnt++; }
    check(q.answer === cnt, `${tag}: X 개수 ${q.answer} ≠ ${cnt}`);
  } else if (mid === 'u5') {
    m = /^두 집합 A = \{x² \+ (\d+)x, (\d+), (\d+)\}, B = \{x, (\d+)\}에 대하여 A ∩ B = B 를 만족시키는 정수 x 를 모두 고르시오\.$/.exec(t);
    check(m && m[3] === m[4], `${tag}: 08 꼴 ${t}`); if (!m) return;
    const [c, b, d] = m.slice(1, 4).map(Number);
    // x = −50..50 을 넣어 보고: A · B 의 원소가 서로 다르고 (집합 표기) B ⊂ A 인 x
    const want = R(-50, 50).filter((x) => { const A = [x * x + c * x, b, d], B = [x, d]; return new Set(A).size === 3 && new Set(B).size === 2 && B.every((y) => A.includes(y)); });
    check(JSON.stringify(pickedNums(q)) === JSON.stringify(want), `${tag}: x = ${pickedNums(q)} ≠ ${want}`);
    check(want.length === 3 && q.options.map(toNum).includes(d) && new Set(q.options).size === q.options.length, `${tag}: 답 3개 · 함정 보기 ${d}`);
  } else if (mid === 'u6') {
    m = /회원 (\d+)명을 대상으로 .* A 코스는 (\d+)명이고 B 코스는 (\d+)명이었다\. 두 코스 A와 B를 모두 다녀온 회원 수의 (최댓값|최솟값)은\?$/.exec(t);
    check(m, `${tag}: 11 꼴 ${t}`); if (!m) return;
    const [T, a, b] = m.slice(1, 4).map(Number), ok = [];
    for (let k = 0; k <= Math.min(a, b); k++) if (a + b - k <= T) ok.push(k); // 겹침 k 명이 가능한지 (합집합이 전체를 넘지 않음)
    check(q.answer === (m[4] === '최댓값' ? Math.max(...ok) : Math.min(...ok)), `${tag}: ${m[4]} ${q.answer}`);
    check(Math.min(...ok) > 0, `${tag}: 최솟값이 0 보다 큼 (문제답게)`);
  } else if (mid === 'u7') {
    m = /^(\d+) 미만의 자연수 중에서 (\d+)의 배수가 아니거나 (\d+)(으로|로) 나누었을 때의 나머지가 (\d+)(이|가) 아닌 자연수의 개수는\?$/.exec(t);
    check(m, `${tag}: 12 꼴 ${t}`); if (!m) return;
    const [N, p, k] = [m[1], m[2], m[3]].map(Number), r = Number(m[5]);
    check(q.answer === R(1, N - 1).filter((x) => x % p !== 0 || x % k !== r).length, `${tag}: 12 개수 ${q.answer}`);
    const read = (n) => '영일이삼사오육칠팔구'[n % 10], bat = (n) => (read(n).charCodeAt(0) - 0xac00) % 28;
    check(m[4] === (bat(k) && read(k) !== '일' && read(k) !== '칠' && read(k) !== '팔' ? '으로' : '로') && m[6] === (bat(r) ? '이' : '가'), `${tag}: 조사 ${m[3]}${m[4]} · ${m[5]}${m[6]}`);
  }
  gradeOk(q, tag);
}

// (1) 순서
const order = L.steps.map((s) => s.id).join(' ');
check(order === 'c1 m1 c2 m2 c3 m3 c4 u4 u5 u6 u7 boss', `순서 ${order}`);
check(L.no === 6 && L.theme === '01-burrow' && !L.bonus && L.sheet.includes('v5') && L.crops.u4[0].p === 2 && L.crops.u7[0].p === 3 && L.crops.boss[0].p === 4 && L.crops.m1[0].p === 1, '차시 번호 · 테마 · 보강 삭제 · 학습지 6차시 v5 + 7차시 v2 칸');
check(Object.keys(L.crops).length === 12 && L.steps.every((st) => L.crops[st.id]), '칸 위치 12칸 · 단계마다');
check(L.parts && L.parts[0].no === 7 && L.steps.findIndex((s) => s.id === L.parts[0].from) > L.steps.findIndex((s) => s.id === 'c4'), '7차시 = 문제 4부터 (6차시 = 문제 1~3 + 한 장 정리)');
check(Object.values(L.crops).every(([c]) => c.p >= 1 && c.p <= 4 && c.x >= 0 && c.y >= 0 && c.x + c.w <= 1 && c.y + c.h <= 1), '칸 위치가 쪽 안');
check(!/명제/.test(L.steps.map((s) => s.title + (s.say || '')).join(' ')), '단계에 명제 없음 (집합 · 명제 안 섞음)');
check(['m4', 'm42', 'm5', 'm6', 'b1'].every((id) => L.monsters[id] && !L.steps.some((s) => s.id === id)), 'v2 몬스터는 기록용으로만 남음');

// (2) 첫 시도 = 학습지 · 교과서 원문 (교사용 정답 · 교과서 해설 148~149쪽)
const first = (mid) => L.items(mid, 'seed', 0);
const ansOf = (q) => (q.type === 'multi' ? `{${(q.options.every((o) => /^[−\d]+$/.test(o)) ? pickedNums(q) : q.answer.map((i) => q.options[i])).join(',')}}` : String(q.answer));
const sheet = {
  m1: ['{5,6}', '{5,6}', '{1,2,4,5,6}', '{1,2,4,5,6}'], // ★ (A∪B)ᶜ · Aᶜ∩Bᶜ · (A∩B)ᶜ · Aᶜ∪Bᶜ
  m2: ['18', '7', '8'], m3: ['25', '15'],
  u4: ['8'], u5: ['{-1,0,4}'], u6: ['21', '9'], u7: ['96'],
};
for (const [mid, want] of Object.entries(sheet)) {
  const got = first(mid).map(ansOf);
  check(JSON.stringify(got) === JSON.stringify(want), `${mid} 첫 시도 ${JSON.stringify(got)} ≠ 학습지 ${JSON.stringify(want)}`);
  first(mid).forEach((q, i) => (mid[0] === 'u' ? verifyUnit : verify)(mid, q, `${mid}#0.${i}`));
}
// 교과서 원문 글자 그대로 (사용자 결정: 첫 시도는 교과서 그대로)
['8의 약수', '20 이하의 4의 배수'].forEach((w) => check(first('u4')[0].question.includes(w), `07 원문 ${w}`));
check(first('u5')[0].question.includes('{x² + 2x, 4, 6}'), '08 원문');
check(first('u6')[0].question.includes('회원 40명') && first('u6')[0].question.includes('28명') && first('u6')[0].question.includes('21명'), '11 원문');
check(first('u7')[0].question.startsWith('100 미만의 자연수 중에서 7의 배수가 아니거나 5로'), '12 원문');

// (3) 재도전 300 시드 × 3번 (기록용 v2 몬스터 포함)
let n = 0;
for (let s = 0; s < 300; s++) for (let a = 1; a <= 3; a++) for (const mid of Object.keys(L.monsters)) L.items(mid, `s${s}`, a).forEach((q, i) => { n++; (mid[0] === 'u' ? verifyUnit : verify)(mid, q, `${mid}#${s}.${a}.${i}`); });
check(JSON.stringify(L.items('m2', 'x', 1)) === JSON.stringify(L.items('m2', 'x', 1)), '같은 시드는 같은 문제');
for (const mid of ['m2', 'u4', 'u5', 'u6', 'u7']) {
  const texts = new Set(); let sameAsBook = 0;
  for (let s = 0; s < 100; s++) for (let a = 1; a <= 3; a++) { const q = L.items(mid, `d${s}`, a)[0]; texts.add(q.question); if (q.question === first(mid)[0].question) sameAsBook++; }
  check(texts.size >= 20 && sameAsBook === 0, `${mid} 재도전: 서로 다른 문제 ${texts.size} · 교과서 그대로 ${sameAsBook}`);
}
// 기록용 v2 문장 묶음 구성 (1-6반 오답노트에서 다시 풀 때)
const kinds = L.items('m4', 'k', 1).map((q) => q.answer).sort().join();
check(kinds === '거짓인 명제,명제 아님,명제 아님,참인 명제', `v2 문제 4 재도전 구성 ${kinds}`);

// (5) 형성평가 6문항
const bossWant = ['∩', '13', '11', '{9}', '{∅,{3},{5},{3, 5}}', '20'];
const b1 = L.boss.sets[1];
check(b1.length === 6 && L.boss.items === 6 && L.boss.hpItems === 6 && L.boss.sets[2].length === 6, '형성평가 6문항 · 세트2(미리보기용) 6문항');
const bAns = (q) => (q.type === 'multi' ? `{${q.answer.map((i) => q.options[i]).sort((x, y) => (x === '∅' ? -1 : y === '∅' ? 1 : x.length - y.length || (x < y ? -1 : 1))).join(',')}}` : String(q.answer));
check(JSON.stringify(b1.map(bAns)) === JSON.stringify(bossWant), `형성평가 정답 ${JSON.stringify(b1.map(bAns))}`);
check(b1.every((q, i) => q.question.startsWith(`${i + 1}.`)), '형성평가 번호');
check(b1[2].question.includes('n(A) = 18, n(B) = 23, n(A ∪ B) = 30') && b1[3].question.includes('{1, 5, 9, 10}') && b1[4].question.includes('{1, 2, 4}') && b1[5].question.includes('24의 약수'), '형성평가 3~6 = 교과서 04 · 05 · 06 · 10 원문 숫자');
check(L.boss.tags.length === 6 && L.boss.sprite === '2@h250', '보스 태그 · 그림자 드래곤');
check(L.boss.tags.every((t) => L.steps.some((s) => s.kind === 'concept' && s.id === t)), '보스 태그 = 이 차시 개념');

// 형성평가 독립 검산 도구 (드모르간 진리표)
function parseDM(s) {
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
function sameSetExpr(s1, s2) {
  const ls = [...new Set((s1 + s2).match(/[A-Z]/g))], f = parseDM(s1), g = parseDM(s2);
  for (let m = 0; m < 1 << ls.length; m++) { const e = {}; ls.forEach((c, k) => { e[c] = !!((m >> k) & 1); }); if (f(e) !== g(e)) return false; }
  return true;
}
check(sameSetExpr('(A ∪ B)ᶜ', 'Aᶜ ∩ Bᶜ') && !sameSetExpr('(A ∪ B)ᶜ', 'Aᶜ ∪ Bᶜ'), '진리표 도구');
const setOf = (s) => (s === '∅' ? [] : s.replace(/[{}]/g, '').split(',').map((x) => Number(x.trim())));
function verifyBoss(i, q, tag) {
  const t = q.question; let m;
  check(t.startsWith(`${i + 1}. `) && !/위 /.test(t), `${tag}: 번호 · 혼자 읽히는 글 ${t}`);
  if (q.type === 'choice') { check(new Set(q.choices).size === q.choices.length && q.choices[q.answerIndex] === q.answer, `${tag}: 보기`); q.choices.forEach((c, k) => check(Q.grade(q, k) === (k === q.answerIndex), `${tag}: 보기 ${k + 1} 채점`)); }
  else if (q.type === 'number') check(Q.grade(q, q.answer) && !Q.grade(q, q.answer + 1) && !Q.grade(q, q.answer - 1), `${tag}: 숫자 채점`);
  else { check(Q.grade(q, q.answer) === true && Q.grade(q, []) === false && new Set(q.options).size === q.options.length, `${tag}: 고르기 채점 · 보기 중복`); }
  if (i === 0) {
    m = /^1\. (.+) = (.+) 의 \( \) 에 알맞은 것은\?$/.exec(t);
    check(m && q.choices.length === 2, `${tag}: 1번 꼴`);
    if (m) { const ok = q.choices.filter((c) => sameSetExpr(m[1].replace('( )', c), m[2].replace('( )', c))); check(ok.length === 1 && ok[0] === q.answer, `${tag}: ${t} → ${ok}`); }
  } else if (i === 1) {
    m = /^2\. n\(U\) = (\d+), n\(([A-Z])\) = (\d+) 일 때 n\(\2ᶜ\) = \?$/.exec(t);
    check(m, `${tag}: 2번 꼴 ${t}`);
    if (m) { const U = R(1, Number(m[1])), A = U.slice(0, Number(m[3])); check(A.length < U.length && q.answer === U.filter((x) => !A.includes(x)).length, `${tag}: n(ᶜ)`); }
  } else if (i === 2) {
    m = /^3\. 두 집합 A 와 B 에 대하여 n\(A\) = (\d+), n\(B\) = (\d+), n\(A ∪ B\) = (\d+) 일 때, n\(A ∩ B\) 는\?$/.exec(t);
    check(m, `${tag}: 3번 꼴 ${t}`);
    if (m) { // 원소를 실제로 배치: A = 1..a, B 는 겹침 k 개 + 나머지 → 합집합 크기가 맞는 k 를 찾는다
      const [a, b, u] = m.slice(1).map(Number), ks = R(0, Math.min(a, b)).filter((k) => { const A = R(1, a), B = [...R(1, k), ...R(a + 1, a + b - k)]; return new Set([...A, ...B]).size === u; });
      check(ks.length === 1 && q.answer === ks[0] && ks[0] > 0, `${tag}: n(A ∩ B) ${q.answer} ≠ ${ks}`);
    }
  } else if (i === 3) {
    m = /^4\. 전체집합 U = \{1, 2, 3, …, 10\}의 두 부분집합 A = (\{[^}]*\}), B = \{x \| x는 (\d+)의 약수\}에 대하여 A − B 의 원소를 모두 고르시오\.$/.exec(t);
    check(m, `${tag}: 4번 꼴 ${t}`);
    if (m) { const A = setOf(m[1]), n2 = Number(m[2]), want = A.filter((x) => n2 % x !== 0); check(JSON.stringify(q.answer.map((k) => Number(q.options[k]))) === JSON.stringify(want) && want.length > 0 && q.options.join() === R(1, 10).join(), `${tag}: A − B ${want}`); }
  } else if (i === 4) {
    m = /^5\. 전체집합 U = (\{[^}]*\})의 부분집합 중에서 집합 A = (\{[^}]*\})와 서로소인 집합을 모두 고르시오\.$/.exec(t);
    check(m, `${tag}: 5번 꼴 ${t}`);
    if (m) {
      const U = setOf(m[1]), A = setOf(m[2]);
      const want = q.options.map((o, k) => (setOf(o).every((x) => U.includes(x) && !A.includes(x)) ? k : -1)).filter((k) => k >= 0);
      check(JSON.stringify(q.answer) === JSON.stringify(want), `${tag}: 서로소 ${q.answer} ≠ ${want}`);
      const all = 2 ** U.filter((x) => !A.includes(x)).length; check(want.length === all, `${tag}: 서로소인 부분집합이 보기에 모두 있음 (${want.length}/${all})`);
    }
  } else if (i === 5) {
    m = /^6\. 전체집합 U = \{x \| x는 (\d+) 이하의 자연수\}의 두 부분집합 A = \{x \| x는 (\d+)의 배수\}, B = \{x \| x는 (\d+)의 약수\}에 대하여 n\(Aᶜ ∩ Bᶜ\) 는\?$/.exec(t);
    check(m, `${tag}: 6번 꼴 ${t}`);
    if (m) { const [N, k, d] = m.slice(1).map(Number); check(d <= N && q.answer === R(1, N).filter((x) => x % k !== 0 && d % x !== 0).length, `${tag}: n(Aᶜ ∩ Bᶜ)`); }
  }
}
b1.forEach((q, i) => verifyBoss(i, q, `보스#0.${i + 1}`));
check(typeof L.boss.make === 'function', '형성평가 생성기 L.boss.make');
const snap = JSON.stringify(b1);
for (let i = 0; i < 6; i++) check(L.boss.make(i, 0, DS.Rng('z')) === b1[i], `시도 0 = 학습지 ${i + 1}번`);
let nb = 0; const texts = Array.from({ length: 6 }, () => new Set()), same12 = [0, 0, 0, 0, 0, 0];
for (let s = 0; s < 300; s++) for (let i = 0; i < 6; i++) {
  const qs = [1, 2, 3].map((a) => L.boss.make(i, a, DS.Rng(`s${s}|boss|${i}|${a}`)));
  qs.forEach((q, k) => { nb++; verifyBoss(i, q, `보스재도전${i + 1}#${s}.${k + 1}`); texts[i].add(q.question); check(q.question !== b1[i].question, `보스재도전${i + 1}#${s}: 학습지와 같은 문제`); });
  if (JSON.stringify(qs[0]) === JSON.stringify(qs[1])) same12[i]++;
}
for (let i = 0; i < 6; i++) { check(texts[i].size >= 5, `보스재도전 ${i + 1}번: 서로 다른 문제 ${texts[i].size}`); check(same12[i] < 45, `보스재도전 ${i + 1}번: 시도 1 · 2 같음 ${same12[i]}/300`); }
check(JSON.stringify(b1) === snap, '생성기가 학습지 문항을 건드리지 않음');

if (fail) { console.error(`\n${fail}건 실패 (${count}건 중)`); process.exit(1); }
console.log(`OK: 6차시 레이드용 v5 + 7차시 v2 — 순서 · 학습지 ★ / 교과서 원문 첫 시도 · 재도전 소문제 ${n}개 독립 검산 · 형성평가 6문항 · 재도전 생성기 ${nb}문항 독립 검산 (${count}건) 통과`);
