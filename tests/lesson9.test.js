// 9차시 검증: node tests/lesson9.test.js  (학습과정 9차시 레이드용 v1 · 2026-11-10 #66 「명제 사이의 관계 · 역과 대우」 · 교과서 86~89쪽 · 96쪽 중단원 03)
// (1) 순서 · 칸 · 그림 · #64 꼴(DATA = JSON 그대로)  (2) 첫 시도 = 확정표 정답  (3) 재도전 300 시드 × 3 · 소레이드 연습 판 · 형성평가 재도전 = 문제 글을 읽어 따로 판정
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-09.js', 'lessons/rubrics.js']);
const L = DS.Lessons.get('set-09'), Q = DS.Quiz;
let fail = 0, count = 0;
const check = (c, m) => { count++; if (!c) { fail++; if (fail <= 30) console.error('FAIL:', m); } };

// ── 독립 판정 도구 (차시 파일의 계산을 쓰지 않음) ─────────────
const numOf = (o) => { const t = String(o).replace('−', '-'); return t === '½' ? 0.5 : t === '√2' ? Math.SQRT2 : t === '-½' ? -0.5 : Number(t); };
const picked = (q, idx) => (idx || q.answer).map((i) => q.options[i]);
const nums = (q, idx) => picked(q, idx).filter((o) => !/^∅/.test(o)).map(numOf).sort((a, b) => a - b);
const same = (A, B) => A.length === B.length && A.every((x, i) => Math.abs(x - B[i]) < 1e-9);
const ans = (q) => (q.type === 'choice' ? q.choices[q.answerIndex] : null);
const parseSet = (s) => (s.trim() === '∅' ? [] : s.replace(/[{}]/g, '').split(',').map((t) => numOf(t.trim())));
const divisors = (n) => { const d = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; };
const isPrime = (n) => n > 1 && divisors(n).length === 2;
const NEG = { '=': '≠', '≠': '=', '>': '≤', '≤': '>', '<': '≥', '≥': '<' };
const negate = (c) => c.replace(/ (=|≠|>|≤|<|≥) /, (m, op) => ` ${NEG[op]} `);
// 수의 종류 (자연수 ⊂ 정수 ⊂ 유리수 ⊂ 실수)
const KIND = { 자연수: (x) => Number.isInteger(x) && x >= 1, 정수: (x) => Number.isInteger(x), 유리수: (x) => Math.abs(x - Math.SQRT2) > 1e-9 && Math.abs(x + Math.SQRT2) > 1e-9, 실수: () => true };
const INC = { 자연수: 0, 정수: 1, 유리수: 2, 실수: 3 }; // 앞이 뒤에 포함 (A ⊂ B ⇔ INC[A] ≤ INC[B])
// 문장 → 반례 판정 (가정은 맞고 결론이 틀린 수)
const SENT = { '소수는 홀수이다.': (x) => isPrime(x) && x % 2 === 0, '4의 배수는 8의 배수이다.': (x) => x % 4 === 0 && x % 8 !== 0, '홀수는 소수이다.': (x) => x % 2 === 1 && !isPrime(x), '6의 약수는 짝수이다.': (x) => 6 % x === 0 && x % 2 === 1 };

function gradeOk(q, tag) {
  const r = q.type === 'choice' ? q.answerIndex : q.answer, w = q.type === 'choice' ? (q.answerIndex + 1) % q.choices.length : [];
  check(Q.grade(q, r) === true, `${tag}: 정답 채점`); check(Q.grade(q, w) === false, `${tag}: 오답이 정답 처리됨`);
  if (q.type === 'choice') check(q.answerIndex >= 0 && new Set(q.choices).size === q.choices.length, `${tag}: 보기 중복 · 정답 없음 ${JSON.stringify(q.choices)}`);
  if (q.type === 'multi' && q.empty) check(q.empty.every((k) => /^∅/.test(q.options[k])), `${tag}: ∅ 단추`);
}
const grp = (q, gi) => { let b0 = 0; for (let k = 0; k < gi; k++) b0 += q.groups[k].n; return q.answer.filter((i) => i >= b0 && i < b0 + q.groups[gi].n); };

function verify(q, tag) {
  gradeOk(q, tag);
  const t = q.question, a = ans(q); let m;
  if ((m = /p : x는 (\d+)의 약수 일 때 진리집합 P 의/.exec(t)) || (m = /q : x는 (\d+)의 약수 일 때 진리집합 Q 의/.exec(t))) { check(same(nums(q), divisors(+m[1])), `${tag}: 약수 진리집합 ${m[1]}`); return; }
  if ((m = /두 진리집합 P = (\{[^}]*\}), Q = (\{[^}]*\}) 사이의 관계는\?/.exec(t))) { const P = parseSet(m[1]), Qs = parseSet(m[2]); check(a === (P.every((x) => Qs.includes(x)) ? 'P ⊂ Q' : 'P ⊄ Q'), `${tag}: ⊂ ${a}`); return; }
  if ((m = /명제 「(\d+)의 약수는 (\d+)의 약수이다\.」 는 참인가/.exec(t))) { check(a === (+m[2] % +m[1] === 0 ? '참' : '거짓'), `${tag}: 약수 명제 ${a}`); return; }
  if ((m = /가정 p : x − (\d+) = 0 의 진리집합 P 의/.exec(t))) { check(same(nums(q), [+m[1]]), `${tag}: x − a = 0`); return; }
  if ((m = /결론 q : x² = (\d*)x 의 진리집합 Q 의/.exec(t))) { const k = m[1] ? +m[1] : 1; check(same(nums(q), [0, k].sort((x, y) => x - y)), `${tag}: x² = ax`); return; }
  if ((m = /「x − (\d+) = 0 이면 x² = (\d*)x 이다\.」 는 참인가/.exec(t))) { const k = m[2] ? +m[2] : 1; check(+m[1] === k && a === '참', `${tag}: 일차 → 이차 참`); return; }
  if ((m = /「(.+?)」 는 참인가 거짓인가\?/.exec(t)) && m[1] in SENT) { check(a === '거짓', `${tag}: 문장 거짓`); return; }
  if ((m = /「(.+?)」 의 반례를 모두 고르시오\./.exec(t)) && m[1] in SENT) { const want = q.options.map(numOf).filter(SENT[m[1]]).sort((x, y) => x - y); check(want.length > 0 && same(nums(q), want), `${tag}: 반례 ${m[1]}`); return; }
  if ((m = /x 가 실수일 때 「x ≤ (\d+) 이면 x² ≤ (\d+) 이다\.」 는 참인가/.exec(t))) { check(+m[1] * +m[1] === +m[2] && a === '거짓', `${tag}: x ≤ c 거짓`); return; }
  if ((m = /x 가 실수일 때 「x ≤ (\d+) 이면 x² ≤ (\d+) 이다\.」 의 반례는\?/.exec(t))) { const c = +m[1], good = q.choices.filter((o) => numOf(o) <= c && numOf(o) ** 2 > c * c); check(good.length === 1 && good[0] === a, `${tag}: 반례 고르기 ${a}`); return; }
  if ((m = /「(.+?) 이면 (.+?) 이다\.」 의 (역|대우)[은는]\?/.exec(t))) { const p = m[1], qq = m[2], want = m[3] === '역' ? `${qq} 이면 ${p} 이다.` : `${negate(qq)} 이면 ${negate(p)} 이다.`; check(a === want, `${tag}: ${m[3]} ${a} (기대 ${want})`); return; }
  if ((m = /「x 가 (\d+)의 배수이면 x 는 (짝수|\d+의 배수)이다\.」 의 대우는\?/.exec(t))) { check(a === `x 가 ${m[2]}가 아니면 x 는 ${m[1]}의 배수가 아니다.`, `${tag}: 배수 대우 ${a}`); return; }
  if ((m = /대우 「x 가 (짝수|(\d+)의 배수)가 아니면 x 는 (\d+)의 배수가 아니다\.」 는 참인가/.exec(t))) { const mm = m[1] === '짝수' ? 2 : +m[2], k = +m[3]; check(a === (k % mm === 0 ? '참' : '거짓'), `${tag}: 대우 참거짓 ${k} → ${mm}`); return; }
  // ⚔ 소레이드 (수의 포함 관계)
  if ((m = /^「x 가 (\S+)이면 x 는 (\S+)이다\.」 의 (역은|대우는)\?/.exec(t))) { const A = m[1], B = m[2], want = m[3] === '역은' ? `x 가 ${B}이면 x 는 ${A}이다.` : `x 가 ${B}가 아니면 x 는 ${A}가 아니다.`; check(a === want, `${tag}: 소레이드 ${m[3]} ${a}`); return; }
  if ((m = /^역 「x 가 (\S+)이면 x 는 (\S+)이다\.」 의 참 · 거짓을 고르고, 반례를 모두 고르시오\./.exec(t))) { const B = m[1], A = m[2], tf = picked(q, grp(q, 0)), ce = nums(q, grp(q, 1)); const opts = q.options.slice(q.groups[0].n).map(numOf), want = opts.filter((x) => KIND[B](x) && !KIND[A](x)).sort((x, y) => x - y);
    check(tf.join() === (want.length ? '거짓' : '참') && same(ce, want) && want.length > 0, `${tag}: 역 참거짓 · 반례 ${tf} ${ce}`); return; }
  if ((m = /^원래 명제 「x 가 (\S+)이면 x 는 (\S+)이다\.」 는 참인가/.exec(t))) { check(a === (INC[m[1]] <= INC[m[2]] ? '참' : '거짓'), `${tag}: 원래 명제`); return; }
  if (/^그러므로 역과 대우의 참 · 거짓은\?/.test(t)) { check(a === '역은 거짓, 대우는 참', `${tag}: 결론 ${a}`); return; }
  // 👑 형성평가
  if ((m = /명제 「x = (\d+) 이면 x² = (\d+) 이다\.」 의 가정과 결론을/.exec(t))) { check((+m[1]) ** 2 === +m[2] && a === `가정: x = ${m[1]} · 결론: x² = ${m[2]}`, `${tag}: 가정 · 결론 ${a}`); return; }
  if ((m = /U = (\{[^}]*\}) 일 때 명제 「x 가 (\d+)의 배수이면 x 는 (\d+)의 배수이다\.」 에서 P · Q/.exec(t))) { const U = parseSet(m[1]), k = +m[2], mm = +m[3], P = U.filter((x) => x % k === 0), Qs = U.filter((x) => x % mm === 0);
    check(same(nums(q, grp(q, 0)), P) && same(nums(q, grp(q, 1)), Qs) && picked(q, grp(q, 2)).join() === (k % mm === 0 ? '참' : '거짓'), `${tag}: P · Q · 참거짓 ${k} → ${mm}`); return; }
  if ((m = /명제 「x > (\d+) 이면 x > (\d+) 이다\.」 의 참 · 거짓을 고르고/.exec(t))) { const A = +m[1], B = +m[2], opts = q.options.slice(q.groups[0].n).map(numOf), want = opts.filter((x) => x > A && !(x > B));
    check(picked(q, grp(q, 0)).join() === (want.length ? '거짓' : '참') && same(nums(q, grp(q, 1)), want), `${tag}: x > a → x > b`); return; }
  if ((m = /명제 「x = (\d+) 이면 x² = (\d+) 이다\.」 의 역과 대우, 그 참 · 거짓을/.exec(t))) { const k = +m[1], s = +m[2]; check(k * k === s && a === `역 「x² = ${s} 이면 x = ${k} 이다.」 거짓 · 대우 「x² ≠ ${s} 이면 x ≠ ${k} 이다.」 참`, `${tag}: 역 · 대우 ${a}`); return; }
  check(false, `${tag}: 모르는 꼴 ${t}`);
}

// (1) 순서 · 칸 · 그림 · #64 꼴
check(L.steps.map((s) => s.id).join(',') === 'intro,c1,cp1,m1,m2,c2,m3,c3,m4,cp2,m5,boss', `레이드 순서 ${L.steps.map((s) => s.id)}`);
check(L.no === 9 && L.theme === '11-keyvault' && DS.ASSETS.dungeons.ids.includes(L.theme), '9차시 · 🔑 묘실 테마');
check(/레이드용 v1/.test(L.sheet) && /충분조건과 필요조건/.test(L.next.title), '판 v1 · 다음 = 10차시 충분 · 필요');
L.steps.forEach((s) => check(L.crops[s.img || s.id] && L.crops[s.img || s.id][0].h > 0.04, `칸 위치 ${s.img || s.id}`));
check(['cp1', 'cp2'].every((id) => L.steps.find((s) => s.id === id).kind === 'concept'), '개념 플러스 2칸 = 개념 칸 (몬스터 없음)');
check(/P ⊂ Q 이면 참/.test(L.steps.find((s) => s.id === 'c1').say) && /반례/.test(L.steps.find((s) => s.id === 'c1').say), '개념 1 say');
check(Object.keys(L.monsters).join() === 'm1,m2,m3,m4,m5' && L.monsters.m1.sprite === 'keyvault:0' && L.monsters.m2.sprite === 'keyvault:2' && L.monsters.m3.sprite === 'keyvault:1' && /^keyvault:2@h\d+$|^keyvault:3$/.test(L.monsters.m4.sprite) && L.monsters.m5.sprite === 'keyvault:4', '몬스터 그림 (m4 = 봉인 석상 · 그림 오기 전 임시 색 변형)');
check(L.boss.sprite === 'keyvaultboss:0' && DS.ASSETS.monstersKeyvaultBoss.names[0] === '역과 대우의 문지기', '보스 = 역과 대우의 문지기');
check(L.chain.join() === 'm5' && L.monsters.m5.evalQ, 'm5 = ⚔ 소레이드 (중단원 문제)');
check(JSON.stringify(JSON.parse(JSON.stringify(L.DATA))) === JSON.stringify(L.DATA), '📦 #64 DATA = JSON 그대로 (함수 · 정규식 없음)');
check(Object.values(L.DATA.monsters).every((M) => L.GEN[M.book.gen] && L.GEN[M.retry.gen]), '📦 생성기 = 데이터 쪽 이름');
check(L.boss.tags.every((t) => L.steps.some((s) => s.kind === 'concept' && s.id === t)), '보스 태그 = 이 차시 개념');

// (2) 첫 시도 = 확정표
const first = (mid) => L.items(mid, 'seed', 0);
const A = (q) => (q.type === 'multi' ? (q.groups ? q.groups.map((g, gi) => picked(q, grp(q, gi)).join(',')).join(' / ') : picked(q).join(',')) : ans(q));
check(first('m1').map(A).join('|') === '1,3|1,3,9|P ⊂ Q|참', `문제 1 ${first('m1').map(A).join('|')}`);
check(first('m2').map(A).join('|') === '1|0,1|참|거짓|2|거짓|−7', `문제 2 ${first('m2').map(A).join('|')}`);
check(first('m2')[6].choices.slice().sort().join() === ['−7', '6', '0', '7'].sort().join(), '문제 2 (3) 보기 = −7 · 함정 6 · 0 · 7');
check(first('m3').map(A).join('|') === 'a² = b² 이면 a = b 이다.|a² ≠ b² 이면 a ≠ b 이다.|x > 2 이면 x² > 4 이다.|x ≤ 2 이면 x² ≤ 4 이다.', `문제 3 ${first('m3').map(A).join('|')}`);
check(first('m4').map(A).join('|') === 'x 가 짝수가 아니면 x 는 4의 배수가 아니다.|참', `문제 4 ${first('m4').map(A).join('|')}`);
const ch5 = L.chainItems('m5', 'seed', 0);
check(ch5.map(A).join('|') === 'x 가 유리수이면 x 는 자연수이다.|거짓 / ½,−1|참|x 가 유리수가 아니면 x 는 자연수가 아니다.|역은 거짓, 대우는 참', `문제 5 소레이드 ${ch5.map(A).join('|')}`);
check(ch5[1].options.slice(2).join() === '½,−1,2,3', '졸개 ② 반례 칩 = ½ · −1 · 함정 2 · 3');
check(ch5[3].why && ch5[3].why.text === '∵ 명제와 그 대우의 참 · 거짓은 같다.' && ch5.filter((q) => q.why).length === 1, '💡 근거 줄 = 졸개 ④ 뒤 하나');
check(ch5.every((q) => q.say) && ch5[4].say === '그러므로 역은 거짓, 대우는 참이다.', '나의 풀이 문장');
check(ch5[0].choices.includes('x 가 유리수가 아니면 x 는 자연수가 아니다.') && ch5[0].choices.includes('x 가 자연수가 아니면 x 는 유리수가 아니다.') && ch5[0].choices.includes('x 가 자연수이면 x 는 유리수이다.'), '졸개 ① 함정 = 대우 · 이 · 원래 명제');
const B = L.boss.sets[1].map(A);
check(B.join('|') === '가정: x = 2 · 결론: x² = 4|4,8 / 2,4,6,8,10 / 참|거짓 / 2,3|역 「x² = 9 이면 x = 3 이다.」 거짓 · 대우 「x² ≠ 9 이면 x ≠ 3 이다.」 참', `형성평가 ${B.join('|')}`);

// (3) 첫 시도 + 재도전 독립 검산
for (const mid of Object.keys(L.monsters)) first(mid).forEach((q, i) => verify(q, `${mid}#0(${i})`));
ch5.forEach((q, i) => verify(q, `m5 소레이드 첫 판 (${i})`));
L.boss.sets[1].forEach((q, i) => verify(q, `형성평가 ${i + 1}`)); L.boss.sets[2].forEach((q, i) => verify(q, `형성평가 세트2 ${i + 1}`));
let n = 0;
for (let s = 0; s < 300; s++) {
  for (let a = 1; a <= 3; a++) for (const mid of Object.keys(L.monsters)) L.items(mid, `s${s}`, a).forEach((q, i) => { n++; verify(q, `${mid} s${s} a${a} (${i})`); });
  for (let p = 1; p <= 3; p++) L.chainItems('m5', `s${s}`, p).forEach((q, i) => { n++; verify(q, `m5 소레이드 s${s} p${p} (${i})`); check(/^다음 명제의 역과 대우를/.test(q.problem || ''), '연습 판 = 원문 카드'); });
  for (let i = 0; i < 4; i++) { const q = L.boss.make(i, 1 + (s % 3), DS.Rng(`b${s}|${i}`)); n++; check(q.question.startsWith(`${i + 1}. `), `형성 ${i + 1} 번호`); verify(q, `형성평가 ${i + 1} s${s}`); }
}
for (const mid of Object.keys(L.monsters)) { let sameAsBook = 0; for (let s = 0; s < 60; s++) if (L.items(mid, `d${s}`, 1).map((q) => q.question).join() === first(mid).map((q) => q.question).join()) sameAsBook++; check(sameAsBook === 0, `${mid}: 재도전이 학습지와 같음 ${sameAsBook}`); }
check(JSON.stringify(L.items('m2', 'x', 1)) === JSON.stringify(L.items('m2', 'x', 1)), '같은 시드는 같은 문제');

// (4) 📸 서술형 채점 기준 (m5)
const RB = ((DS.Rubrics || {})['set-09'] || {}).m5;
check(RB && RB.total === 4 && RB.steps.length === 4 && RB.steps.reduce((s, x) => s + x.pts, 0) === 4 && RB.pass === 3, '📸 채점 기준 4단계 · 통과 3');
check(RB && /손글씨/.test(RB.note || '') , '📸 손글씨만 (#58 A)');

console.log(`${fail ? '❌' : '✅'} 9차시: 확인 ${count}개 (재도전 문항 ${n}개) · 실패 ${fail}`);
if (fail) process.exit(1);
