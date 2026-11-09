// 🟪 집합 중단원던전 꼭대기 층 검산: node tests/eval1.test.js  (변경 제안 v1 · 2026-11-03 사용자 확정 「숫자만 고친 문제」)
// (1) 첫 시도 = 변경 제안 v1 의 고친 숫자 · 정답 (아래에 따로 적음)
// (2) 첫 시도 + 재도전 시드 300개 × 3번: 문제 글에서 숫자 · 조건을 직접 읽어 내고 전부 세어서(브루트 포스) 다시 계산 — 차시 파일의 계산 · check 를 쓰지 않는다
// (3) 채점: 정답은 맞음 · 오답은 틀림 · 보기 겹침 없음 · 교과서 숫자를 그대로 쓰지 않음
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/eval-1.js']);
const L = DS.Lessons.get('eval-1'), Q = DS.Quiz;
let fail = 0, count = 0;
const check = (c, m) => { count++; if (!c) { fail++; if (fail <= 30) console.error('FAIL:', m); } };

// ── 독립 도구 ──
const R = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const norm = (A) => [...new Set(A)].sort((a, b) => a - b);
const eq = (A, B) => JSON.stringify(norm(A)) === JSON.stringify(norm(B));
const toNum = (s) => Number(String(s).replace('−', '-'));
const parseSet = (s) => (s.trim() === '∅' ? [] : s.replace(/[{}]/g, '').split(',').map((t) => t.trim()).filter(Boolean).map(toNum));
const subsets = (A) => R(0, 2 ** A.length - 1).map((m) => A.filter((_, k) => m & (1 << k)));
const picked = (q) => q.answer.map((i) => q.options[i]);
const nums = (s) => (s.match(/\d+/g) || []).map(Number);
// 조건 집합 {x | x는 …} 을 1~200 안에서 판정 (홀수 · 짝수 · n의 배수 · n의 약수)
function condSet(text) {
  let m = /x는 (\d+)의 약수/.exec(text); if (m) { const n = Number(m[1]); return R(1, 200).filter((x) => n % x === 0); }
  m = /x는 (\d+)의 배수/.exec(text); if (m) return R(1, 200).filter((x) => x % Number(m[1]) === 0);
  if (/x는 홀수/.test(text)) return R(1, 200).filter((x) => x % 2 === 1);
  if (/x는 짝수/.test(text)) return R(1, 200).filter((x) => x % 2 === 0);
  throw new Error('조건 ' + text);
}
const readSet = (s) => (/^\{x \|/.test(s) ? condSet(s) : parseSet(s));
const sub = (A, B) => A.every((x) => B.includes(x));
// 01 표 (교과서 기준 「대상이 분명한가」를 사람이 따로 적음)
const SET01 = { '5보다 작은 자연수의 모임': true, '10의 약수의 모임': true, '한 자리 홀수의 모임': true, '3보다 크고 8보다 작은 자연수의 모임': true, '20 이하의 4의 배수의 모임': true, '1보다 작은 자연수의 모임': true, '두 자리 자연수 중 가장 작은 수의 모임': true,
  '맛있는 과일의 모임': false, '0에 가까운 수의 모임': false, '키가 큰 학생의 모임': false, '아름다운 꽃의 모임': false, '아주 큰 수의 모임': false, '인기 있는 노래의 모임': false, '착한 사람의 모임': false };

function verify(q, tag) {
  const t = q.question;
  check(Q.grade(q, q.type === 'choice' ? q.answerIndex : q.answer) === true, `${tag}: 정답 채점`);
  const wrong = q.type === 'choice' ? (q.answerIndex + 1) % q.choices.length : q.type === 'ox' ? !q.answer : q.type === 'number' ? q.answer + 1 : q.answer.slice(1);
  check(Q.grade(q, wrong) === false, `${tag}: 오답이 정답 처리`);
  if (q.options) check(new Set(q.options).size === q.options.length && q.options.length <= 10, `${tag}: 보기 ${q.options.length}개 · 겹침 없음`);
  let m;
  if ((m = /^01 \S+ 「(.+)」은\(는\) 집합이다/.exec(t))) return check(m[1] in SET01 && q.answer === SET01[m[1]], `${tag}: ${m[1]}`);
  if ((m = /^02 ⑴ \{x \| x는 (\d+)의 약수\}/.exec(t))) { const n = Number(m[1]); return check(eq(picked(q).map(toNum), R(1, n).filter((x) => n % x === 0)), `${tag}: ${n}의 약수`); }
  if ((m = /^02 ⑵ \{x \| x² − (\d+)x \+ (\d+) = 0\}/.exec(t))) { const [s, p] = [Number(m[1]), Number(m[2])]; return check(eq(picked(q).map(toNum), R(-30, 30).filter((x) => x * x - s * x + p === 0)), `${tag}: 이차방정식`); }
  if ((m = /^03 \S+ A = (\{[^}]*\}), B = (\{[^}]*\}) 의 포함 관계는\?/.exec(t))) {
    const A = readSet(m[1]), B = readSet(m[2]), rel = sub(A, B) && sub(B, A) ? 'A = B' : sub(A, B) ? 'A ⊂ B' : sub(B, A) ? 'B ⊂ A' : '포함 관계가 없다';
    return check(q.answer === rel, `${tag}: ${rel} vs ${q.answer}`);
  }
  if ((m = /^04 n\(A\) = (\d+), n\(B\) = (\d+), n\(A ∪ B\) = (\d+)/.exec(t))) { const [a, b, u] = m.slice(1).map(Number); check(u >= Math.max(a, b) && u <= a + b, `${tag}: 가능한 숫자`); return check(q.answer === a + b - u, `${tag}: 04`); }
  if ((m = /^05 \S+ U = \{1, 2, 3, …, 10\}, A = (\{[^}]*\}), B = \{x \| x는 (\d+)의 약수\} 일 때 (.+) 의 원소를 모두/.exec(t))) {
    const U = R(1, 10), A = parseSet(m[1]), n = Number(m[2]), B = U.filter((x) => n % x === 0), e = m[3];
    const want = e === 'A ∩ B' ? A.filter((x) => B.includes(x)) : e === 'A ∪ B' ? U.filter((x) => A.includes(x) || B.includes(x)) : e === 'Aᶜ' ? U.filter((x) => !A.includes(x)) : A.filter((x) => !B.includes(x));
    check(want.length > 0, `${tag}: 답이 공집합 아님`); return check(eq(picked(q).map(toNum), want), `${tag}: ${e}`);
  }
  if ((m = /^06 U = (\{[^}]*\}), A = (\{[^}]*\}) 일 때/.exec(t))) {
    const U = parseSet(m[1]), A = parseSet(m[2]), good = q.options.filter((o) => { const X = parseSet(o); return sub(X, U) && !X.some((x) => A.includes(x)); });
    check(good.length === subsets(U.filter((x) => !A.includes(x))).length, `${tag}: 서로소인 집합이 보기에 모두 있음`);
    return check(eq(picked(q).map((o) => q.options.indexOf(o)), good.map((o) => q.options.indexOf(o))), `${tag}: 서로소 고르기`);
  }
  if ((m = /^07 A = \{x \| x는 (\d+)의 약수\}, B = \{x \| x는 (\d+) 이하의 (\d+)의 배수\}/.exec(t))) {
    const p = Number(m[1]), N = Number(m[2]), k = Number(m[3]), A = R(1, p).filter((x) => p % x === 0), B = R(1, N).filter((x) => x % k === 0);
    const cnt = subsets(B).filter((X) => !X.some((x) => A.includes(x)) && eq([...B, ...X], B)).length; // X ⊂ B 인 경우만 B ∪ X = B (B 밖 원소는 넣을 수 없음)
    return check(q.answer === cnt, `${tag}: X 개수 ${cnt}`);
  }
  if ((m = /^08 A = \{x² \+ (\d+)x, (\d+), (\d+)\}, B = \{x, (\d+)\}/.exec(t))) {
    const [c, b, d] = m.slice(1, 4).map(Number), want = R(-30, 30).filter((x) => x !== d && [x * x + c * x, b, d].includes(x));
    check(q.options.map(toNum).includes(d), `${tag}: 함정 보기 ${d}`); return check(eq(picked(q).map(toNum), want), `${tag}: 08 ${want}`);
  }
  if ((m = /^09 .*n\(A([₀-₉]+) ∩ \(A([₀-₉]+) ∪ A([₀-₉]+)\)\)/.exec(t))) {
    const d = (s) => Number([...s].map((ch) => '₀₁₂₃₄₅₆₇₈₉'.indexOf(ch)).join('')), [a, b, c] = m.slice(1).map(d);
    return check(q.answer === R(1, 100).filter((x) => x % a === 0 && (x % b === 0 || x % c === 0)).length, `${tag}: 09`);
  }
  if ((m = /^10 U = \{x \| x는 (\d+) 이하의 자연수\}, A = \{x \| x는 (\d+)의 배수\}, B = \{x \| x는 (\d+)의 약수\}/.exec(t))) {
    const [N, k, n] = m.slice(1).map(Number); return check(q.answer === R(1, N).filter((x) => x % k !== 0 && n % x !== 0).length, `${tag}: 10`);
  }
  if ((m = /^11 동아리 회원 (\d+)명 중 A 코스를 다녀온 회원은 (\d+)명, B 코스는 (\d+)명이다\. 두 코스를 모두 다녀온 회원 수의 (최댓값|최솟값)은\?/.exec(t))) {
    const [T, a, b] = m.slice(1, 4).map(Number), ok = R(0, Math.min(a, b)).filter((k) => a + b - k <= T);
    return check(q.answer === (m[4] === '최댓값' ? Math.max(...ok) : Math.min(...ok)), `${tag}: 11 ${m[4]}`);
  }
  if ((m = /^12 (\d+) 미만의 자연수 중에서 (\d+)의 배수가 아니거나 (\d+)(?:으로|로) 나누었을 때의 나머지가 (\d+)(?:이|가) 아닌/.exec(t))) {
    const [N, p, k, r] = m.slice(1).map(Number); return check(q.answer === R(1, N - 1).filter((x) => x % p !== 0 || x % k !== r).length, `${tag}: 12`);
  }
  check(false, `${tag}: 문제 글을 읽지 못함 — ${t}`);
}

// (1) 구성 · 첫 시도 = 변경 제안 v1
check(L.eval && L.no === 0 && L.steps.length === 0 && L.rooms.map((b) => b.id).join() === 'q01,q02,q03,q04,q05,q06,q07,q08,q09,q10,q11,q12' && L.rooms.filter((r) => r.boss).map((r) => r.id).join() === 'q12', '🏰 성채 1층 = 12방 (문항 하나씩 · 12번 보스)');
check(L.rooms.map((r) => r.no).join() === '2,2,3,4,5,4,4,4,4,5,4,6', '방마다 해금 차시 (그 문항을 풀 수 있는 차시)');
check(Object.entries(L.legacy).every(([k, ids]) => ids.every((id) => L.monsters[id])) && Object.values(L.legacy).flat().sort().join() === L.rooms.map((r) => r.id).sort().join(), '옛 7마리 → 12방 이어 셈 (빠짐 · 겹침 없음)');
const ROOMOF = { e1: ['q01', 'q02'], e2: ['q03', 'q04'], e3: ['q05'], e4: ['q06', 'q07'], e5: ['q08'], e6: ['q09', 'q10'], eb: ['q11', 'q12'] };
const first = Object.fromEntries(Object.entries(ROOMOF).map(([k, ids]) => [k, ids.flatMap((id) => L.items(id, 'x', 0))]));
check(Object.values(first).flat().length === 20, '소문제 20개 (01 ×3 · 02 ×2 · 03 ×2 · 04 · 05 ×4 · 06 · 07 · 08 · 09 · 10 · 11 ×2 · 12)');
const ans = (q) => (q.type === 'multi' ? picked(q).join(',') : String(q.answer));
const WANT = {
  e1: ['false', 'true', 'false', '1,3,5,15', '1,4'], e2: ['A ⊂ B', 'B ⊂ A', '9'], e3: ['2,10', '1,2,5,6,7,10', '1,3,4,5,8,9', '6,7'],
  e4: [['∅', '{4}', '{6}', '{4, 6}'].sort().join(','), '16'], e5: ['−2,0,5'], e6: ['10', '32'], eb: ['27', '11', '91'],
};
Object.entries(WANT).forEach(([id, w]) => first[id].forEach((q, i) => { const got = id === 'e4' && i === 0 ? picked(q).sort().join(',') : ans(q); check(got === w[i], `${id} (${i + 1}) 제안서 정답 ${w[i]} · 지금 ${got}`); }));
// 교과서 숫자를 그대로 쓰지 않음 (사용자 결정)
const all0 = Object.values(first).flat().map((q) => q.question).join('\n');
['21의 약수', 'x² − 7x + 6', '{1, 3, 7, 15}', 'n(A) = 18', '{1, 5, 9, 10}', '20 이하의 4의 배수', '{x² + 2x, 4, 6}', 'A₁₀ ∩ (A₃ ∪ A₈)', '24의 약수', '40명 중', '7의 배수가 아니거나'].forEach((s) => check(!all0.includes(s), `교과서 숫자 그대로: ${s}`));
check(Object.values(first).flat().every((q) => q.ref), '학습지(평가지) 꼬리표 ref');
const V0 = Object.values(first).flat();
check(V0.filter((q) => q.video).map((q) => q.ref.slice(0, 2)).join() === '03,03,04,05,05,05,05,07,10,11,11' && V0.every((q) => !q.video || require('fs').existsSync(require('path').join(__dirname, '..', q.video))), '소문제 풀이 영상 (03 · 04 · 05 · 07 · 10 · 11) · 파일 있음');
check(Object.values(L.videos).every((u) => require('fs').existsSync(require('path').join(__dirname, '..', u))) && Object.keys(L.videos).every((k) => L.monsters[k]), '영상 32~36 파일 · 칸');

// (2) 첫 시도 + 재도전 독립 검산
for (const b of L.rooms) {
  first[b.id] = L.items(b.id, 'x', 0);
  const n0 = first[b.id].length;
  first[b.id].forEach((q, i) => verify(q, `${b.id}/0(${i + 1})`));
  for (let s = 0; s < 300; s++) for (const a of [1, 2, 3]) {
    const items = L.items(b.id, `seed${s}`, a);
    check(items.length === n0, `${b.id} 재도전 칸 수`);
    items.forEach((q, i) => verify(q, `${b.id}#${s}/${a}(${i + 1})`));
  }
  check(JSON.stringify(L.items(b.id, 'k', 2)) === JSON.stringify(L.items(b.id, 'k', 2)), `${b.id}: 같은 시드 → 같은 문제`);
  check(R(1, 20).some((s) => JSON.stringify(L.items(b.id, `q${s}`, 1)) !== JSON.stringify(first[b.id])), `${b.id}: 재도전 문제가 바뀜`);
}

// ── ⚔ 소레이드 방 q07 ~ q12 (요청 #23): 첫 판 = 방향 방 독립 검산값 · 연습 판 200개 = 마지막 단계 check 의 숫자로 따로 세어 맞춤 ──
{
  const ans = (q) => (q.type === 'multi' ? q.answer.map((i) => toNum(q.options[i])).sort((a, b) => a - b) : q.type === 'choice' ? q.choices[q.answerIndex] : q.answer);
  const want0 = {
    q07: [[1, 2, 3, 6], [3, 6, 9, 12, 15, 18], [9, 12, 15, 18], 16], q08: ['B ⊂ A', '가능하다 (○)', [-2, 0], [-2, 0, 5]],
    q09: ['(A₆ ∩ A₄) ∪ (A₆ ∩ A₁₀)', '8개, 3개', 1, 10], q10: ['(A ∪ B)ᶜ', 'n(A) = 5, n(B) = 6', 8, 32], q11: [61, 27, 11], q12: [99, '(A ∩ B)ᶜ', 8, 91],
  };
  check(JSON.stringify(L.chain) === JSON.stringify(['q07', 'q08', 'q09', 'q10', 'q11', 'q12']), '소레이드 방 = q07 ~ q12');
  for (const id of L.chain) {
    const it = L.chainItems(id, 'x', 0); check(JSON.stringify(it.map(ans)) === JSON.stringify(want0[id]), `${id} 첫 판 정답 = 방향 방 검산 ${JSON.stringify(it.map(ans))}`);
    check(it.every((q) => q.say && q.say.length > 4), `${id} 모든 단계에 나의 풀이 한 줄`);
    check(JSON.stringify(L.chainItems(id, 'other', 0)) === JSON.stringify(it), `${id} 첫 판은 누구에게나 같음`);
    for (let k = 1; k <= 200; k++) {
      const c = L.chainItems(id, 's' + k, k), last = c[c.length - 1], v = Object.assign({}, ...c.map((q) => q.check || {}));
      check(c.every((q) => Q.grade(q, q.type === 'multi' ? q.answer : q.type === 'choice' ? q.answerIndex : [String(q.answer)])), `${id} #${k} 정답으로 채점 = 맞음`);
      if (id === 'q07') { const A = R(1, v.p).filter((x) => v.p % x === 0), B = R(1, v.N).filter((x) => x % v.q === 0), X = subsets(B).filter((S) => S.every((x) => !A.includes(x))); check(last.answer === X.length && eq(ans(c[2]), B.filter((x) => !A.includes(x))), `q07 #${k} 부분집합 직접 셈`); }
      if (id === 'q08') { const good = R(-20, 20).filter((x) => { if (x === v.d) return false; const Aset = [x * x + v.c * x, v.b, v.d]; return Aset.includes(x) && new Set(Aset).size === 3; }); check(eq(ans(last), good), `q08 #${k} x 직접 대입 ${good}`); }
      if (id === 'q09') { const S = (m) => R(1, 100).filter((x) => x % m === 0), t = S(v.a).filter((x) => S(v.b).includes(x) || S(v.c).includes(x)).length; check(last.answer === t, `q09 #${k} 직접 셈 ${t}`); check(new Set(c[1].choices).size === c[1].choices.length, `q09 #${k} 보기 겹침 없음`); }
      if (id === 'q10') { const A = R(1, v.N).filter((x) => x % v.k === 0), B = R(1, v.N).filter((x) => v.m % x === 0), t = R(1, v.N).filter((x) => !A.includes(x) && !B.includes(x)).length; check(last.answer === t && c[2].answer === v.N - t, `q10 #${k} 직접 셈 ${t}`); check(new Set(c[1].choices).size === c[1].choices.length, `q10 #${k} 보기 겹침 없음`); }
      if (id === 'q11') { let mx = -1, mn = 1e9; for (let i = 0; i <= Math.min(v.a, v.b); i++) if (v.a + v.b - i <= v.T) { mx = Math.max(mx, i); mn = Math.min(mn, i); } check(c[1].answer === mx && last.answer === mn, `q11 #${k} 겹침 직접 셈`); }
      if (id === 'q12') { const t = R(1, v.N - 1).filter((x) => x % v.p !== 0 || x % v.q !== v.rem).length; check(last.answer === t, `q12 #${k} 직접 셈 ${t}`); }
    }
  }
}

if (fail) { console.error(`\n${fail}건 실패 / ${count}건`); process.exit(1); }
console.log(`OK: 🏰 성채던전 1층 12방 — 제안서 정답 · 교과서 숫자 안 씀 · 재도전 300×3 독립 검산 ${count}건 통과`);
