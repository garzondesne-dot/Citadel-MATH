// 6차시 검증: node tests/lesson6.test.js  (학습과정 6차시 레이드용 v1 · 2026-11-02 변경 제안 v1 컨펌)
// (1) 레이드 순서: 도입 → 개념1 → 문제1 → … → 개념5 → 문제5 → 형성평가 · 보강 4마리는 보강던전(bonus)
// (2) 첫 시도 = 학습지 · 교사용 정답 (아래에 따로 적음)
// (3) 재도전 시드 300개 × 3번: 문제 글에서 U · A · B · n(…) · 인원을 직접 읽어 내고 따로 계산 (차시 파일의 계산 결과를 쓰지 않음)
// (4) 명제 · 부정 문장: 아래에 따로 적은 참 · 거짓 표로 확인 · 부정 보기는 「~이 아니다 / 부등호 뒤집기」 규칙으로 따로 만들어 비교
// (5) 형성평가 세트1·2 (7·8번 도전 포함) · 보기 순서 섞임 · 채점
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
const DEF_WORDS = /(라 한다|이라 한다)\.$/;

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
  } else if (mid === 'b2') {
    const m = / (\d+)명, .*? (\d+)명, 두 가지 모두 (\d+)명/.exec(text);
    check(q.answer === Number(m[1]) + Number(m[2]) - Number(m[3]), `${tag}: ${q.answer}`);
  } else if (mid === 'b3' && q.type === 'multi') {
    const want = q.options.map((s, i) => (TRUTH[s] !== null && s in TRUTH ? i : -1)).filter((i) => i >= 0);
    check(q.options.every((s) => s in TRUTH), `${tag}: 표에 없는 문장`);
    check(JSON.stringify(q.answer) === JSON.stringify(want), `${tag}: 명제 고르기 ${q.answer} ≠ ${want}`);
  } else if (mid === 'b3') {
    check(text.includes('모든') && q.choices.includes(q.answer), `${tag}: 삼단논법`);
  } else if (mid === 'b4') {
    const s = q.check.dt;
    check(q.answer === (DEF_WORDS.test(s) ? '정의' : '정리'), `${tag}: ${s} → ${q.answer}`);
  }
  gradeOk(q, tag);
}

// (1) 순서
const order = L.steps.map((s) => s.id).join(' ');
check(order === 'intro c1 m1 c2 m2 c3 m3 c4 m4 c5 m5 boss', `순서 ${order}`);
check(L.no === 6 && L.theme === '01-burrow' && L.bonus.map((b) => b.id).join() === 'b1,b2,b3,b4', '차시 번호 · 테마 · 보강던전');
check(Object.keys(L.crops).length === 16, '칸 위치 16칸');

// (2) 첫 시도 = 학습지 (교사용 정답)
const first = (mid) => L.items(mid, 'seed', 0);
const ansOf = (q) => (q.type === 'multi' ? `{${chosen(q).join(',')}}` : String(q.answer));
const sheet = {
  m1: ['{5,6}', '{4,5,6}', '{1,2,5,6}', '{5,6}', '{1,2,4,5,6}', '{1,2,4,5,6}'],
  m2: ['18', '7', '10', '22', '8'], m3: ['25', '13', '15'],
  m4: ['참인 명제', '거짓인 명제', '명제 아님', '참인 명제', '명제 아님', '참인 명제'],
  m5: ['4는 2의 배수가 아니다', '거짓', '3 ≤ 5', '참', '√4는 무리수가 아니다', '참'],
  b1: ['5', '4'], b2: ['65'], b3: ['죽는다', '{0,3,5}'], b4: ['정의', '정리'],
};
for (const [mid, want] of Object.entries(sheet)) {
  const got = first(mid).map((q) => (mid === 'b3' && q.type === 'multi' ? `{${q.answer.join(',')}}` : ansOf(q)));
  check(JSON.stringify(got) === JSON.stringify(want), `${mid} 첫 시도 ${JSON.stringify(got)} ≠ 학습지 ${JSON.stringify(want)}`);
  first(mid).forEach((q, i) => verify(mid, q, `${mid}#0.${i}`));
}

// (3) 재도전 300 시드 × 3번
let n = 0;
for (let s = 0; s < 300; s++) for (let a = 1; a <= 3; a++) for (const mid of Object.keys(L.monsters)) L.items(mid, `s${s}`, a).forEach((q, i) => { n++; verify(mid, q, `${mid}#${s}.${a}.${i}`); });
// 같은 시드 → 같은 문제 · 다른 시도 → 다른 문제
check(JSON.stringify(L.items('m2', 'x', 1)) === JSON.stringify(L.items('m2', 'x', 1)), '같은 시드는 같은 문제');
check(JSON.stringify(L.items('m2', 'x', 1)) !== JSON.stringify(L.items('m2', 'x', 2)), '재도전마다 숫자가 바뀜');

// (4) 문장 묶음: 재도전 문제 4 는 참 2 · 거짓 2 · 명제 아님 2, 부정 정답이 늘 ① 이 아님
const kinds = L.items('m4', 'k', 1).map((q) => q.answer).sort().join();
check(kinds === '거짓인 명제,거짓인 명제,명제 아님,명제 아님,참인 명제,참인 명제', `문제 4 재도전 구성 ${kinds}`);
let firstPos = 0, negN = 0;
for (let s = 0; s < 200; s++) L.items('m5', `n${s}`, 1).filter((q) => q.check.neg).forEach((q) => { negN++; if (q.answerIndex === 0) firstPos++; });
check(firstPos < negN * 0.6, `부정 정답이 ①에 쏠림 (${firstPos}/${negN})`);

// (5) 형성평가
const bossWant = { 1: ['∩', 'Aᶜ ∪ Bᶜ', '13', '명제', '떡볶이는 맛있다.', '5는 홀수가 아니다', '3', '2는 짝수이다 · 참'],
  2: ['∪', 'Aᶜ ∩ Bᶜ', '16', '부정', '이 영화는 재미있다.', '8은 짝수가 아니다', '3', '3은 홀수이다 · 참'] };
for (const set of [1, 2]) {
  const qs = L.boss.sets[set];
  check(qs.length === L.boss.items && L.boss.hpItems === 6, `세트${set} 문항 수`);
  check(JSON.stringify(qs.map((q) => String(q.answer))) === JSON.stringify(bossWant[set]), `세트${set} 정답 ${JSON.stringify(qs.map((q) => q.answer))}`);
  qs.forEach((q, i) => gradeOk(q, `보스${set}-${i + 1}`));
  // 7번 독립 계산: 둘 다 = 두 수의 합 − (전체 − 둘 다 아닌)
  const m = /(\d+)명 중 \S+ ?\S* (\d+)명, \S+ ?\S* (\d+)명, 둘 다 아닌 학생이 (\d+)명/.exec(qs[6].question);
  check(m && qs[6].answer === Number(m[2]) + Number(m[3]) - (Number(m[1]) - Number(m[4])), `세트${set} 7번 계산`);
  check(qs.filter((q) => q.type === 'choice').some((q) => q.answerIndex !== 0), `세트${set} 보기 섞임`);
}
check(L.boss.tags.length === 8 && L.boss.sprite === '2@h250', '보스 태그 · 그림자 드래곤(성채 드래곤 색 변형)');

if (fail) { console.error(`\n${fail}건 실패 (${count}건 중)`); process.exit(1); }
console.log(`OK: 6차시 레이드용 v1 — 순서 · 학습지 첫 시도 · 재도전 소문제 ${n}개 독립 검산 · 명제/부정 문장 묶음 · 형성평가 세트1·2 (${count}건) 통과`);
