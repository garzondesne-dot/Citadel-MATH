// 🏰 성채던전 2층 「명제 중단원」 검산: node tests/eval2.test.js  (변경 제안 v1 · 2026-11-06 사용자 컨펌)
// (1) 방 11개 · 차시 · 서술형 잠금 · 👑 보스 (2) 첫 시도 = 제안서 정답 (3) 교과서 숫자를 쓰지 않음 (첫 시도 · 재도전 모두)
// (4) 재도전 시드 300 × 3: 문제 글만 읽어 따로 계산 — 원소 하나하나 넣어 보기 · 진리표 · 구간 포함 · 격자 탐색 (차시 파일의 계산을 쓰지 않음)
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/eval-2.js']);
const L = DS.Lessons.get('eval-2'), Q = DS.Quiz;
let fail = 0, count = 0;
const check = (c, m) => { count++; if (!c) { fail++; if (fail <= 30) console.error('FAIL:', m); } };
const R = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const num = (s) => Number(String(s).replace('−', '-'));
const picked = (q) => q.answer.map((i) => q.options[i]);
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// 따로 적은 표 (차시 파일과 별개)
const VAGUE_OK = ['우리 학교는 멋진 학교이다.', '수학은 재미있는 과목이다.', '이 노래는 좋은 노래이다.', '우리 반 교실은 넓다.', '떡볶이는 맛있는 음식이다.', '가을 하늘은 아름답다.'];
const NUMSET = { 자연수: 1, 정수: 2, 유리수: 3, 실수: 4 }; // 포함 사슬: 작은 쪽이 큰 쪽에 포함
const josa = (n) => ('2459'.includes(String(n).slice(-1)) ? '는' : '은');
// 실수 a, b 조건: 정수 −4~4 를 모두 넣어 보아 p ⇒ q, q ⇒ p 를 따로 판정
const ALGF = { 'a = b': (a, b) => a === b, '|a| = |b|': (a, b) => Math.abs(a) === Math.abs(b), 'a² = b²': (a, b) => a * a === b * b, 'a = −b': (a, b) => a === -b, 'a > 0 이고 b > 0': (a, b) => a > 0 && b > 0, 'ab > 0': (a, b) => a * b > 0, 'ab = 0': (a, b) => a * b === 0, 'a = 0': (a) => a === 0, 'a = 0 이고 b = 0': (a, b) => a === 0 && b === 0, 'a² + b² = 0': (a, b) => a * a + b * b === 0 };
const condName = (pq, qp) => (pq && qp ? '필요충분조건' : pq ? '충분조건' : qp ? '필요조건' : '아무것도 아니다');
// 구간 조건 글 → x 판정 함수
function xCond(t) {
  let m;
  if ((m = /^x ≤ (\S+)$/.exec(t))) { const a = num(m[1]); return (x) => x <= a; }
  if ((m = /^x ≥ (\S+)$/.exec(t))) { const a = num(m[1]); return (x) => x >= a; }
  if ((m = /^(\S+) ≤ x ≤ (\S+)$/.exec(t))) { const lo = num(m[1]), hi = num(m[2]); return (x) => lo <= x && x <= hi; }
  if ((m = /^\|x\| ≤ (\d+)$/.exec(t))) { const k = num(m[1]); return (x) => Math.abs(x) <= k; }
  if ((m = /^\|x ([+−]) (\d+)\| ≤ (\d+)$/.exec(t))) { const s = m[1] === '+' ? 1 : -1, c = num(m[2]), k = num(m[3]); return (x) => Math.abs(x + s * c) <= k; }
  throw new Error('모르는 조건 ' + t);
}
const XS = R(-40, 40).map((i) => i / 2); // −20 ~ 20, 0.5 간격
// 집합 관계 판정: 원소 셋짜리 U 에서 P, Q 를 모두 만들어 봄
const U3 = [0, 1, 2], subsets = (A) => A.reduce((acc, x) => acc.concat(acc.map((s) => [...s, x])), [[]]);
const inc = (A, B) => A.every((x) => B.includes(x)), comp = (A) => U3.filter((x) => !A.includes(x)), cap = (A, B) => A.filter((x) => B.includes(x)), cup = (A, B) => U3.filter((x) => A.includes(x) || B.includes(x));
const sameSet = (A, B) => inc(A, B) && inc(B, A);
function relHolds(s, P, Qs) {
  const map = { 'P ⊂ Q': () => inc(P, Qs), 'Q ⊂ P': () => inc(Qs, P), 'P ∩ Q = ∅': () => !cap(P, Qs).length, 'P ∪ Q = U': () => sameSet(cup(P, Qs), U3), 'Pᶜ ⊂ Q': () => inc(comp(P), Qs), 'Qᶜ ⊂ P': () => inc(comp(Qs), P), 'P ∩ Q = P': () => sameSet(cap(P, Qs), P), 'P ∪ Q = Q': () => sameSet(cup(P, Qs), Qs),
    'Pᶜ ∩ Q = Pᶜ': () => sameSet(cap(comp(P), Qs), comp(P)), 'P ∩ Qᶜ = ∅': () => !cap(P, comp(Qs)).length, 'Pᶜ ∪ Qᶜ = U': () => sameSet(cup(comp(P), comp(Qs)), U3), 'P ∩ Qᶜ = P': () => sameSet(cap(P, comp(Qs)), P), 'Pᶜ ∩ Q = Q': () => sameSet(cap(comp(P), Qs), Qs), 'P ⊂ Qᶜ': () => inc(P, comp(Qs)), 'Q ⊂ Pᶜ': () => inc(Qs, comp(P)) };
  if (!map[s]) throw new Error('모르는 관계 ' + s); return map[s]();
}
const premHolds = (prem, P, Qs) => ({ 'p → q': inc(P, Qs), 'p → ~q': inc(P, comp(Qs)), '~p → q': inc(comp(P), Qs), 'q → p': inc(Qs, P) })[prem];
// 진리표 (조건 p, q, r)
const lit = (s, e) => (s[0] === '~' ? !e[s[1]] : e[s]);
const impHolds = (s, e) => { const [a, b] = s.split(' → '); return !lit(a, e) || lit(b, e); };

function verify(id, q, tag) {
  const t = q.question; let m;
  if (q.type === 'choice') { check(q.choices[q.answerIndex] === q.answer && new Set(q.choices).size === q.choices.length, `${tag}: 보기`); q.choices.forEach((c, k) => check(Q.grade(q, k) === (k === q.answerIndex), `${tag}: 채점 ${k}`)); }
  if (q.type === 'number') check(Q.grade(q, q.answer) && !Q.grade(q, q.answer + 1), `${tag}: 숫자 채점`);
  if (q.type === 'multi') check(Q.grade(q, q.answer) && !Q.grade(q, []) && new Set(q.options).size === q.options.length && q.answer.length > 0, `${tag}: 고르기 채점`);
  if (id === 'q01') {
    m = /^01 \S+ 「(.+)」 는\?$/.exec(t); check(m, `${tag}: 01 꼴`); if (!m) return; const s = m[1]; let want, mm;
    if ((mm = /^√(\d+)(은|는) 유리수이다\.$/.exec(s))) { const n = num(mm[1]); want = Number.isInteger(Math.sqrt(n)) ? '참인 명제' : '거짓인 명제'; check(mm[2] === josa(n), `${tag}: 조사 √${n}${mm[2]}`); }
    else if ((mm = /^x는 \d+보다 (작은|큰) 수이다\.$/.exec(s))) want = '명제 아님';
    else if ((mm = /^(\d+)(은|는) (\d+)의 배수이다\.$/.exec(s))) { want = num(mm[1]) % num(mm[3]) === 0 ? '참인 명제' : '거짓인 명제'; check(mm[2] === josa(mm[1]), `${tag}: 조사 ${mm[1]}${mm[2]}`); }
    else if (VAGUE_OK.includes(s)) want = '명제 아님';
    check(want && q.answer === want, `${tag}: 「${s}」 → ${q.answer} ≠ ${want}`);
  } else if (id === 'q02') {
    m = /U = \{x \| x는 (\d+) 이하의 자연수\}, p: x² − (\d+)x \+ (\d+) = 0, q: x² − (\d+)x \+ (\d+) > 0 일 때 조건 (~?[pq]) 의/.exec(t); check(m, `${tag}: 02 꼴 ${t}`); if (!m) return;
    const N = num(m[1]), U = R(1, N), [b1, c1, b2, c2] = [m[2], m[3], m[4], m[5]].map(num), ask = m[6];
    const P = U.filter((x) => x * x - b1 * x + c1 === 0), Qs = U.filter((x) => x * x - b2 * x + c2 > 0);
    const want = { p: P, q: Qs, '~p': U.filter((x) => !P.includes(x)), '~q': U.filter((x) => !Qs.includes(x)) }[ask];
    check(eq(picked(q).map(num), want) && eq(q.options.map(num), U), `${tag}: ${ask} ${picked(q)} ≠ ${want}`);
    check(P.length === 2 && U.length - Qs.length === 1, `${tag}: p 근 두 개 · ~q 원소 하나`);
  } else if (id === 'q03') {
    m = /^03 \S+ 명제 「(.+)이면 (.+)이다\.」 의 (역|대우)(과|와) 그 참 · 거짓으로 알맞은 것은\?$/.exec(t); check(m, `${tag}: 03 꼴 ${t}`); if (!m) return;
    check(m[4] === (m[3] === '역' ? '과' : '와'), `${tag}: 조사 ${m[3]}${m[4]}`);
    const [stmt, tf] = q.answer.split(' — '), truth = tf === '참'; let mm, wantS, wantT;
    if ((mm = /^x가 (\S+)$/.exec(m[1]))) { const A = mm[1], B = /^x는 (\S+)$/.exec(m[2])[1]; check(NUMSET[A] < NUMSET[B], `${tag}: 처음 명제 참 (${A} ⊂ ${B})`);
      if (m[3] === '역') { wantS = `x가 ${B}이면 x는 ${A}이다`; wantT = NUMSET[B] <= NUMSET[A]; } else { wantS = `x가 ${B}가 아니면 x는 ${A}가 아니다`; wantT = NUMSET[A] <= NUMSET[B]; } }
    else { const k = num(/^x\(x − (\d+)\) = 0$/.exec(m[1])[1]); const p = (x) => x * (x - k) === 0, qq = (x) => x - k === 0, xs = R(-10, 10);
      if (m[3] === '역') { wantS = `x − ${k} = 0 이면 x(x − ${k}) = 0 이다`; wantT = xs.every((x) => !qq(x) || p(x)); } else { wantS = `x − ${k} ≠ 0 이면 x(x − ${k}) ≠ 0 이다`; wantT = xs.every((x) => qq(x) || !p(x)); } }
    check(stmt === wantS && truth === wantT, `${tag}: ${q.answer} ≠ ${wantS} — ${wantT}`);
    check(q.choices.length === 4, `${tag}: 보기 4개`);
  } else if (id === 'q04') {
    m = /^04 \S+ p: (.+), q: (.+) 일 때 p 는 q 이기 위한 어떤 조건인가\?$/.exec(t); check(m, `${tag}: 04 꼴`); if (!m) return;
    let pq, qp;
    if (ALGF[m[1]] && ALGF[m[2]]) { const pts = []; R(-4, 4).forEach((a) => R(-4, 4).forEach((b) => pts.push([a, b]))); pq = pts.every(([a, b]) => !ALGF[m[1]](a, b) || ALGF[m[2]](a, b)); qp = pts.every(([a, b]) => !ALGF[m[2]](a, b) || ALGF[m[1]](a, b)); }
    else { const fp = xCond(m[1]), fq = xCond(m[2]); pq = XS.every((x) => !fp(x) || fq(x)); qp = XS.every((x) => !fq(x) || fp(x)); }
    check(q.answer === condName(pq, qp), `${tag}: ${m[1]} / ${m[2]} → ${q.answer} ≠ ${condName(pq, qp)}`);
  } else if (id === 'q05') {
    if ((m = /^05 ⑴ 명제 「모든 실수 x에 대하여 x² > (\d*)x − (\d+)이다\.」 의 부정은\?$/.exec(t))) check(q.answer === `어떤 실수 x에 대하여 x² ≤ ${m[1]}x − ${m[2]}`, `${tag}: ⑴ 부정`);
    else if ((m = /^05 ⑴ 「어떤 실수 x에 대하여 x² ≤ (\d*)x − (\d+)이다\.」 는 참인가 거짓인가\?$/.exec(t))) { const b = num(m[1] || 1), c = num(m[2]); const truth = XS.concat(R(-200, 200).map((i) => i / 20)).some((x) => x * x <= b * x - c); check(q.answer === (truth ? '참' : '거짓'), `${tag}: ⑴ 참 · 거짓 (x² ≤ ${b}x − ${c})`); }
    else if ((m = /^05 ⑵ 명제 「어떤 실수 x에 대하여 \|(\d+)x − (\d+)\| < 0이다\.」 의 부정은\?$/.exec(t))) check(q.answer === `모든 실수 x에 대하여 |${m[1]}x − ${m[2]}| ≥ 0`, `${tag}: ⑵ 부정`);
    else if (/^05 ⑵ 「모든 실수 x에 대하여 \|\d+x − \d+\| ≥ 0이다\.」/.test(t)) check(q.answer === '참', `${tag}: ⑵ 참`);
    else check(false, `${tag}: 05 꼴 ${t}`);
  } else if (id === 'q06') {
    m = /명제 (.+) 가 참일 때, 옳은 것을 모두 고르시오\.$/.exec(t); check(m, `${tag}: 06 꼴`); if (!m) return; const prem = m[1];
    const models = []; subsets(U3).forEach((P) => subsets(U3).forEach((Qs) => { if (premHolds(prem, P, Qs)) models.push([P, Qs]); }));
    const want = q.options.filter((o) => models.every(([P, Qs]) => relHolds(o.replace(/^[ㄱㄴㄷㄹ]\. /, ''), P, Qs)));
    check(eq(picked(q), want) && q.options.length === 4 && want.length >= 1 && want.length <= 3, `${tag}: ${prem} → ${picked(q)} ≠ ${want}`);
  } else if (id === 'q09') {
    m = /두 명제 (.+) 와 (.+) 가 모두 참일 때/.exec(t); check(m, `${tag}: 09 꼴`); if (!m) return; const prems = [m[1], m[2]];
    const envs = []; [false, true].forEach((p) => [false, true].forEach((qq) => [false, true].forEach((r) => envs.push({ p, q: qq, r }))));
    const want = q.options.filter((o) => envs.every((e) => !prems.every((s) => impHolds(s, e)) || impHolds(o.replace(/^[ㄱㄴㄷㄹ]\. /, ''), e)));
    check(eq(picked(q), want) && want.length >= 1 && want.length <= 3, `${tag}: ${prems} → ${picked(q)} ≠ ${want}`);
    check(!(prems.includes('p → q') && prems.includes('~r → ~q')), `${tag}: 교과서 전제 그대로`);
  } else if (id === 'q07') {
    m = /p: x² − (\d+)a² ≤ 0, q: \|x − (\d+)\| ≤ (\d+) 일 때, 명제 p → q 의 역이 참이 되는 자연수 a 의 최솟값은/.exec(t); check(m, `${tag}: 07 꼴`); if (!m) return;
    const k2 = num(m[1]), k = Math.round(Math.sqrt(k2)), c = num(m[2]), d = num(m[3]);
    const ok = (a) => XS.concat(R(-60, 60)).every((x) => !(Math.abs(x - c) <= d) || x * x <= k2 * a * a); // Q ⊂ P 를 x 하나하나로
    const want = R(1, 50).find(ok); check(k * k === k2 && q.answer === want, `${tag}: 07 ${q.answer} ≠ ${want}`);
  } else if (id === 'q08') {
    m = /p: x²(?: ([+−]) (\d*)x)?(?: ([+−]) (\d+))? ≤ 0, q: x (≤|≥) a 일 때, p 가 q 이기 위한 충분조건이 되는 실수 a 의 (최솟값|최댓값)은/.exec(t); check(m, `${tag}: 08 꼴 ${t}`); if (!m) return;
    const b = m[1] ? (m[1] === '+' ? 1 : -1) * (m[2] === '' ? 1 : num(m[2])) : 0, c = m[3] ? (m[3] === '+' ? 1 : -1) * num(m[4]) : 0, up = m[5] === '≤'; // 계수 1 은 「x」 로만 씀
    const P = R(-400, 400).map((i) => i / 20).filter((x) => x * x + b * x + c <= 1e-9); // 진리집합 (0.05 간격)
    const want = up ? Math.max(...P) : Math.min(...P); // P ⊂ Q 가 되는 경계
    check((up ? m[6] === '최솟값' : m[6] === '최댓값') && Math.abs(q.answer - want) < 1e-6, `${tag}: 08 ${q.answer} ≠ ${want}`);
  } else if (id === 'q10') {
    m = /p: ax² \+ (\d+)x − (\d+) ≥ 0, q: x² \+ 2bx \+ (\d+) > 0/.exec(t); check(m, `${tag}: 10 꼴`); if (!m) return;
    const B = num(m[1]), W = num(m[2]), C = num(m[3]), xs = R(-200, 200).map((i) => i / 10);
    // (가) 거짓: 어떤 x 에서도 ax² + Bx − W ≥ 0 이 아님 — 정수 a 마다 꼭짓점 · 격자로 따로 확인
    const gaFalse = (a) => { if (a >= 0) return false; const vx = -B / (2 * a), top = a * vx * vx + B * vx - W; return top < 0 && xs.every((x) => a * x * x + B * x - W < 0); };
    const M = Math.max(...R(-60, -1).filter(gaFalse));
    // (나) 거짓: q 가 늘 참은 아님 ⇔ x² + 2bx + C ≤ 0 인 x 가 있음 (꼭짓점 x = −b)
    const naFalse = (b) => b * b - C >= 0 || xs.some((x) => x * x + 2 * b * x + C <= 0);
    const mm = R(1, 60).find(naFalse);
    check(q.answer === M + mm, `${tag}: 10 ${q.answer} ≠ ${M} + ${mm}`);
  } else if (id === 'q11') {
    m = /2x² \+ y²(?: − (\d*)x) \+ (\d+) \/ \(x² \+ y² \+ 1\) 의 최솟값은\?$/.exec(t); check(m, `${tag}: 11 꼴 ${t}`); if (!m) return;
    const b = num(m[1] || 1), K = num(m[2]); let best = Infinity;
    for (let x = -3; x <= 5; x += 0.01) { // y² = u ≥ 0 에 대해 f 는 u 만의 함수 → u 도 훑음
      for (let u = 0; u <= 25; u += 0.01) { const f = 2 * x * x + u - b * x + K / (x * x + u + 1); if (f < best) best = f; }
    }
    check(Math.abs(best - q.answer) < 0.01, `${tag}: 11 격자 최솟값 ${best.toFixed(3)} ≠ ${q.answer}`);
  }
}

// (1) 방 구성
check(L.eval && L.floor === 2 && L.steps.length === 0 && L.rooms.map((r) => r.id).join() === 'q01,q02,q03,q04,q05,q06,q07,q08,q09,q10,q11', '2층 = 11방');
check(L.rooms.filter((r) => r.boss).map((r) => r.id).join() === 'q11' && L.rooms.filter((r) => r.photo).map((r) => r.id).join() === 'q07,q10', '👑 11 · 📷 07 · 10');
check(L.rooms.map((r) => r.no).join() === '8,8,9,10,8,9,9,10,9,10,11', '열리는 차시 (제안서)');

// (2) 첫 시도 = 제안서 정답
const ans = (q) => (q.type === 'multi' ? picked(q).join(',') : String(q.answer));
const want0 = {
  q01: ['참인 명제', '명제 아님', '거짓인 명제', '명제 아님'], q02: ['3,4', '1,2,3,5,6,7,8', '1,2,5,6,7,8', '4'],
  q03: ['x가 유리수이면 x는 정수이다 — 거짓', 'x가 유리수가 아니면 x는 정수가 아니다 — 참', 'x − 2 = 0 이면 x(x − 2) = 0 이다 — 참', 'x − 2 ≠ 0 이면 x(x − 2) ≠ 0 이다 — 거짓'],
  q04: ['필요조건', '충분조건', '필요충분조건'], q05: ['어떤 실수 x에 대하여 x² ≤ 2x − 2', '거짓', '모든 실수 x에 대하여 |2x − 5| ≥ 0', '참'],
  q06: ['ㄱ. Qᶜ ⊂ P,ㄴ. P ∪ Q = U,ㄷ. Pᶜ ∩ Q = Pᶜ'], q07: ['3'], q08: ['7'], q09: ['ㄱ. q → ~p,ㄴ. ~q → ~r,ㄷ. r → ~p'], q10: ['1'], q11: ['4'],
};
for (const [id, w] of Object.entries(want0)) {
  const got = L.items(id, 'seed', 0); check(eq(got.map(ans), w), `${id} 첫 시도 ${JSON.stringify(got.map(ans))}`);
  got.forEach((q, i) => verify(id, q, `${id}#0.${i}`));
}
// (3) 교과서 숫자 · 문장을 쓰지 않음
// 교과서 문제 그대로 = 그 문항의 숫자 · 문장이 모두 같을 때 (일부만 같은 것은 괜찮음 — 1층 · 대단원과 같은 기준)
const BOOK = [['「√4는 유리수이다.」'], ['「26은 3의 배수이다.」'], ['7 이하의 자연수', 'x² − 6x + 8 = 0', 'x² − 6x + 9 > 0'], ['x가 자연수이면 x는 유리수'], ['x(x + 1) = 0'],
  ['p: x ≤ 1, q: −3 ≤ x ≤ 0'], ['p: a = b, q: a² = b²'], ['p: |x| ≤ 1, q: −1 ≤ x ≤ 1'], ['x² > x − 1'], ['|3x − 2|'], ['x² − 4a²', '|x − 3| ≤ 4'], ['x² − 10x + 9', 'x ≤ a'], ['ax² + 2x − 4', '2bx + 25'], ['− 4x + 25 /']];
let n = 0;
for (let s = 0; s < 300; s++) for (let a = 0; a <= 3; a++) for (const r of L.rooms) {
  if (a === 0 && s > 0) continue;
  L.items(r.id, `s${s}`, a).forEach((q, i) => { n++; const all = [q.question, ...(q.choices || []), ...(q.options || [])].join(' | ');
    BOOK.forEach((parts) => check(!parts.every((b) => all.includes(b)), `${r.id}#${s}.${a}: 교과서 문제 그대로 「${parts.join(' · ')}」 — ${q.question.slice(0, 70)}`));
    if (a) verify(r.id, q, `${r.id}#${s}.${a}.${i}`); });
}
check(JSON.stringify(L.items('q04', 'x', 1)) === JSON.stringify(L.items('q04', 'x', 1)), '같은 시드 = 같은 문제');
const diff = (id) => new Set(R(0, 99).map((s) => L.items(id, `d${s}`, 1).map((q) => q.question + (q.options || q.choices || []).join('/')).join('|'))).size;
L.rooms.forEach((r) => check(diff(r.id) >= (r.id === 'q11' ? 10 : 15), `${r.id} 재도전 문제가 충분히 다양 (${diff(r.id)})`));

if (fail) { console.error(`\n${fail}건 실패 (${count}건 중)`); process.exit(1); }
console.log(`OK: 🏰 성채던전 2층 「명제 중단원」 11방 — 제안서 정답 · 교과서 숫자 안 씀 · 재도전 ${n}문항 독립 검산 (${count}건) 통과`);
