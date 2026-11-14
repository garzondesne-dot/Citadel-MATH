// 11차시 검증: node tests/lesson11.test.js  (학습과정 11차시 레이드용 v1 · 2026-11-14 「대우를 이용한 증명」 · 교과서 91쪽 · 97쪽 중단원 09)
// (1) 순서 · 칸 · 그림 · #64 꼴  (2) 첫 시도 = 확정표(학습지) 정답  (3) 재도전 300 시드 × 3 · 소레이드 연습 판 · 형성평가 재도전 = 문장을 읽어 따로 계산해 판정
//   대우 = 낱말(짝수 · 홀수 · 3의 배수 · 적어도 하나 · 모두)을 수로 바꿔 모든 경우에 「가정 = 처음 결론의 부정 · 결론 = 처음 가정의 부정」인지 확인
//   식 = k 에 수를 넣어 (꼴)ⁿ = 전개 = m(답) + 나머지 확인 · 세 조건 = 명제 두 개로 집합을 만들어 확인
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-11.js', 'lessons/rubrics.js', 'lessons/unit-set.js']);
const L = DS.Lessons.get('set-11'), Q = DS.Quiz;
let fail = 0, count = 0;
const check = (c, m) => { count++; if (!c) { fail++; if (fail <= 30) console.error('FAIL:', m); } };

// ── 독립 판정 도구 ──
const NS = []; for (let i = 1; i <= 60; i++) NS.push({ n: i });
const AB = []; for (let a = 1; a <= 12; a++) for (let b = 1; b <= 12; b++) AB.push({ a, b });
const VAL = { n: (o) => o.n, 'n²': (o) => o.n ** 2, 'n³': (o) => o.n ** 3, 'a + b': (o) => o.a + o.b, ab: (o) => o.a * o.b, 'a² + b²': (o) => o.a ** 2 + o.b ** 2 };
const PROP = { 짝수: (x) => x % 2 === 0, 홀수: (x) => x % 2 === 1, '3의 배수': (x) => x % 3 === 0 };
function atom(t, neg) { // 「n²이 짝수」 「a, b 중 적어도 하나는 홀수」 「a와 b는 모두 홀수」 → { dom, f }
  t = t.trim().replace(/가$/, '').trim(); let m, f, dom;
  // key = 뜻의 이름 (부정을 풀어 씀: 짝수 아님 = 홀수 · 「적어도 하나 홀수」의 부정 = 「모두 짝수」) — 같은 값이 나오는 다른 명제(이 · 역)와 대우를 가르려고
  const SW = { 짝수: '홀수', 홀수: '짝수' }; let key;
  if ((m = /^(n²|n³|n|a \+ b|ab|a² \+ b²)[이가은는도] (짝수|홀수|3의 배수)$/.exec(t))) { const v = VAL[m[1]], p = PROP[m[2]]; f = (o) => p(v(o)); dom = /[ab]/.test(m[1]) ? 'AB' : 'N'; key = { s: m[1], q: 'one', p: m[2], n: false }; }
  else if ((m = /^a, b 중 적어도 하나[는가] (짝수|홀수)$/.exec(t))) { const p = PROP[m[1]]; f = (o) => p(o.a) || p(o.b); dom = 'AB'; key = { s: 'ab', q: 'some', p: m[1], n: false }; }
  else if ((m = /^a(?:와|,) b[는가] 모두 (짝수|홀수)$/.exec(t))) { const p = PROP[m[1]]; f = (o) => p(o.a) && p(o.b); dom = 'AB'; key = { s: 'ab', q: 'all', p: m[1], n: false }; }
  else throw new Error(`모르는 낱말 「${t}」`);
  if (neg) { if (SW[key.p]) { key.p = SW[key.p]; if (key.q !== 'one') key.q = key.q === 'some' ? 'all' : 'some'; } else key.n = !key.n; }
  return { dom, f: neg ? (o) => !f(o) : f, key };
}
function stmt(s) { const m = /^(.+?)(이면|아니면) (.+?)(이다|아니다)\.$/.exec(s.trim()); if (!m) throw new Error(`명제 꼴 ${s}`);
  const h = atom(m[1], m[2] === '아니면'), c = atom(m[3], m[4] === '아니다'); return { h, c, D: h.dom === 'AB' || c.dom === 'AB' ? AB : NS }; }
const NK = (k) => { const SW = { 짝수: '홀수', 홀수: '짝수' }; return SW[k.p] ? { ...k, p: SW[k.p], q: k.q === 'one' ? 'one' : k.q === 'some' ? 'all' : 'some' } : { ...k, n: !k.n }; };
const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
const isContra = (orig, cand) => { const A = stmt(orig), B = stmt(cand); return A.D === B.D && same(B.h.key, NK(A.c.key)) && same(B.c.key, NK(A.h.key)) && A.D.every((o) => B.h.f(o) === !A.c.f(o) && B.c.f(o) === !A.h.f(o)); };
const isTrue = (s) => { const A = stmt(s); return A.D.every((o) => !A.h.f(o) || A.c.f(o)); };
const poly = (s) => new Function('k', `return ${s.replace(/−/g, '-').replace(/k²/g, 'k**2').replace(/k³/g, 'k**3').replace(/(\d)k/g, '$1*k')};`);
const KS = [0, 1, 2, 3, 4, 5, 7, 10, 13];
// 세 조건: 명제 「x → y」 = X ⊂ Y · 「~x → ~y」 = Y ⊂ X → 구체적 집합
function chainSets(prems) {
  const rel = prems.map((s) => { const m = /^(~?)([pqr]) → (~?)([pqr])$/.exec(s); if (!m || m[1] !== m[3]) throw new Error(`전제 꼴 ${s}`); return m[1] ? [m[4], m[2]] : [m[2], m[4]]; });
  const lv = { p: 0, q: 0, r: 0 }; for (let i = 0; i < 4; i++) rel.forEach(([a, b]) => { if (lv[b] <= lv[a]) lv[b] = lv[a] + 1; });
  const order = ['p', 'q', 'r'].sort((x, y) => lv[x] - lv[y]), UNI = [1, 2, 3, 4], S = {}; order.forEach((x, i) => { S[x] = UNI.slice(0, i + 1); });
  return { order, S, UNI, ok: new Set(order.map((x) => lv[x])).size === 3 };
}
const propOk = (C, s) => { const m = /^(~?)([pqr]) → (~?)([pqr])$/.exec(s.replace(/^[ㄱㄴㄷㄹ]\. /, '')), set = (n, x) => (n ? C.UNI.filter((e) => !C.S[x].includes(e)) : C.S[x]); const A = set(m[1], m[2]), B = set(m[3], m[4]); return A.every((e) => B.includes(e)); };

const ans = (q) => (q.type === 'choice' ? q.choices[q.answerIndex] : null);
const picked = (q) => q.answer.map((i) => q.options[i]);
function gradeOk(q, tag) {
  const r = q.type === 'choice' ? q.answerIndex : q.answer, w = q.type === 'choice' ? (q.answerIndex + 1) % q.choices.length : [];
  check(Q.grade(q, r) === true, `${tag}: 정답 채점`); check(Q.grade(q, w) === false, `${tag}: 오답이 정답 처리됨`);
  if (q.type === 'choice') check(q.answerIndex >= 0 && new Set(q.choices).size === q.choices.length && q.choices.length >= 3, `${tag}: 보기 중복 · 정답 없음 ${JSON.stringify(q.choices)}`);
}
function verify(q, tag) {
  gradeOk(q, tag);
  const t = q.question.replace(/^\d+\. /, '').replace(/^(\(\d\)|①|②|③|④|👑) /, ''), a = ans(q); let m;
  if ((m = /^명제 「(.+?)」의 대우는\?/.exec(t))) { check(isTrue(m[1]), `${tag}: 명제가 참이 아님 ${m[1]}`); check(isContra(m[1], a), `${tag}: 대우 아님 ${a}`);
    q.choices.filter((c) => c !== a).forEach((c) => check(!isContra(m[1], c), `${tag}: 함정도 대우 ${c}`)); return; }
  if ((m = /^n 이 (홀수|짝수)이면 n 을 k 로 나타낸 식은\? \(단, k는 자연수\)$/.exec(t)) || (m = /^k 가 자연수일 때, (홀수|짝수|3의 배수|5의 배수)를 k 로 나타낸 식은\?$/.exec(t))) {
    const want = { 홀수: (x) => x % 2 === 1, 짝수: (x) => x % 2 === 0, '3의 배수': (x) => x % 3 === 0, '5의 배수': (x) => x % 5 === 0 }[m[1]];
    const fits = (e) => { const f = poly(e), got = new Set(); for (let k = 1; k <= 40; k++) got.add(f(k)); const all = [...Array(60).keys()].map((i) => i + 1).filter(want); return [...got].every(want) && all.every((x) => got.has(x)); };
    check(fits(a), `${tag}: 꼴 ${a} ≠ ${m[1]}`); q.choices.filter((c) => c !== a).forEach((c) => check(!fits(c), `${tag}: 함정도 맞음 ${c}`)); return; }
  if ((m = /^n 이 3의 배수가 아니면 n 을 어떻게 나타낼 수 있나\? \(단, k는 (자연수|0 또는 자연수)\)$/.exec(t))) { const k0 = m[1] === '자연수' ? 1 : 0;
    const fits = (c) => { const fs = c.split(' 또는 ').map((x) => poly(x.replace(/^n = /, ''))), got = new Set(); for (let k = k0; k <= 30; k++) fs.forEach((f) => got.add(f(k))); const all = [...Array(60).keys()].map((i) => i + 1).filter((x) => x % 3);
      return [...got].every((x) => x > 0 && x % 3 !== 0) && all.every((x) => got.has(x)); };
    check(fits(a), `${tag}: ${a}`); q.choices.filter((c) => c !== a).forEach((c) => check(!fits(c), `${tag}: 함정도 맞음 ${c}`)); return; }
  if ((m = /^n = (.+?) 일 때 n([²³]) = \((.+?)\)[²³] = (.+?) = (\d)\( \? \)(?: \+ (\d))? (?:에서|이므로 n[²³] 은 (?:홀수|짝수)이다\.) \( \) 안의 식은\?$/.exec(t))) {
    const lin = poly(m[1]), p = m[2] === '²' ? 2 : 3, ex = poly(m[4]), md = +m[5], r = +(m[6] || 0), ok = (e) => { const f = poly(e); return KS.every((k) => lin(k) ** p === ex(k) && ex(k) === md * f(k) + r); };
    check(m[1] === m[3] && r < md, `${tag}: 꼴 · 나머지`); check(ok(a), `${tag}: 식 ${a}`); q.choices.filter((c) => c !== a).forEach((c) => check(!ok(c), `${tag}: 함정도 맞음 ${c}`));
    if (/이므로 n[²³] 은 (홀수|짝수)이다/.test(t)) check(/홀수/.test(t) === (r === 1), `${tag}: 홀짝 말`); return; }
  if ((m = /^n([²³]) = 2\((.+?)\)(?: \+ (\d))? 이므로 n[²³] 은\?$/.exec(t))) { check(a === (m[3] === '1' ? '홀수' : '짝수'), `${tag}: ${a}`); return; }
  if (/^그러므로 어느 경우든 n[²³] 은 3으로 나눈 나머지가 0 이 아니다\. 결론은\?$/.test(t)) { check(/3의 배수가 아니므로 대우가 참 → 처음 명제도 참이다\.$/.test(a), `${tag}: 결론 ${a}`); return; }
  if ((m = /^어떤 명제(의 대우)?가 (참|거짓)(임을 보이면|이면) (처음 명제|그 대우)는\?$/.exec(t))) { check(a === `${m[2]}이다`, `${tag}: ${a}`); return; }
  if ((m = /^(?:세 조건 p, q, r 에 대하여 )?두 명제 (.+?), (.+?) 가 모두 참일 때/.exec(t))) { const C = chainSets([m[1], m[2]]); check(C.ok, `${tag}: 세 조건 사슬 아님`);
    let n2;
    if ((n2 = /— 「(~(\w) → ~(\w))」의 대우는\?$/.exec(t))) { check([m[1], m[2]].includes(n2[1]) && a === `${n2[3]} → ${n2[2]}`, `${tag}: 대우 ${a}`); return; }
    if (/진리집합 P, Q, R 사이의 포함 관계는\?$/.test(t)) { check(a === C.order.map((x) => x.toUpperCase()).join(' ⊂ '), `${tag}: 포함 ${a}`); return; }
    if (/항상 참인 명제를 보기에서 모두 고르시오\./.test(t)) { const want = q.options.filter((s) => propOk(C, s)); check(want.length >= 1 && want.length < q.options.length && picked(q).join() === want.join() && q.options.every((s) => ![m[1], m[2]].includes(s.replace(/^[ㄱㄴㄷㄹ]\. /, ''))), `${tag}: 모두 고르기 ${picked(q)} (계산 ${want})`); return; }
    if (/다음 중 항상 참인 명제는\?$/.test(t)) { const want = q.choices.filter((s) => propOk(C, s)); check(want.length === 1 && want[0] === a, `${tag}: 하나 고르기 ${a} (계산 ${want})`); return; }
  }
  check(false, `${tag}: 모르는 꼴 ${t}`);
}

// (1) 순서 · 칸 · 그림 · #64 꼴
check(L.steps.map((s) => s.id).join(',') === 'intro,c1,m1,c2,m2,m3,m4,sum,boss', `레이드 순서 ${L.steps.map((s) => s.id)}`);
check(L.no === 11 && L.theme === '12-skygarden' && DS.ASSETS.dungeons.ids.includes(L.theme), '11차시 · ⚖ 공중 정원 이어 씀');
check(/레이드용 v1/.test(L.sheet) && /12차시/.test(L.next.title), '판 v1 · 다음 = 12차시');
L.steps.forEach((s) => check(L.crops[s.img || s.id] && L.crops[s.img || s.id][0].h > 0.04, `칸 위치 ${s.img || s.id}`));
check(Object.keys(L.monsters).join() === 'm1,m2,m3,m4' && ['garden:4', 'garden:2', 'garden:3', 'garden:1'].every((sp, i) => L.monsters[`m${i + 1}`].sprite === sp), '몬스터 그림 (거울 웅덩이 두꺼비 · 충분 나비 · 쌍둥이 구름 정령 · 필요 덩굴)');
check(L.boss.sprite === 'gardenboss:0' && L.boss.items === 5, '보스 = 천칭 수호자 · 5문항');
check(L.chain.join() === 'm3,m4' && L.monsters.m3.evalQ, 'm3 · m4 = ⚔ 소레이드 · m3 = ✍ 서술형');
check(JSON.stringify(JSON.parse(JSON.stringify(L.DATA))) === JSON.stringify(L.DATA), '📦 #64 DATA = JSON 그대로');
check(Object.values(L.DATA.monsters).every((M) => L.GEN[M.book.gen] && L.GEN[`${M.retry.gen}R`]), '📦 생성기 = 데이터 쪽 이름');
check(L.boss.tags.every((t) => L.steps.some((s) => s.kind === 'concept' && s.id === t)), '보스 태그 = 이 차시 개념');

// (2) 첫 시도 = 학습지 정답
const first = (mid) => L.items(mid, 'seed', 0);
const A = (q) => (q.type === 'multi' ? picked(q).join(',') : ans(q));
check(first('m1').map(A).join('|') === 'n이 홀수이면 n²도 홀수이다.|a, b가 모두 짝수이면 a + b는 짝수이다.|a, b 중 적어도 하나가 짝수이면 ab는 짝수이다.', `문제 1 ${first('m1').map(A).join('|')}`);
check(first('m2').map(A).join('|') === 'n이 홀수이면 n²도 홀수이다.|2k − 1|2k² − 2k|홀수', `문제 2 (예제 1) ${first('m2').map(A).join('|')}`);
const ch3 = L.chainItems('m3', 'seed', 0), ch4 = L.chainItems('m4', 'seed', 0);
check(ch3.map(A).join('|') === 'n이 3의 배수가 아니면 n²도 3의 배수가 아니다.|n = 3k − 1 또는 n = 3k − 2|3k² − 2k|3k² − 4k + 1|n²은 3의 배수가 아니므로 대우가 참 → 처음 명제도 참이다.', `문제 3 소레이드 (교과서 문제 1) ${ch3.map(A).join('|')}`);
check(/9k² − 6k \+ 1 = 3\( \? \) \+ 1/.test(ch3[2].question) && /9k² − 12k \+ 4 = 3\( \? \) \+ 1/.test(ch3[3].question), '문제 3 = 학습지 식 그대로');
check(ch4.map(A).join('|') === 'q → r|P ⊂ Q ⊂ R|ㄱ. q → r,ㄷ. ~r → ~p' && /두 명제 p → q, ~r → ~q/.test(ch4[0].question), `문제 4 소레이드 (중단원 09 답 ㄱ, ㄷ) ${ch4.map(A).join('|')}`);
check(ch4[2].options.join() === 'ㄱ. q → r,ㄴ. ~p → ~q,ㄷ. ~r → ~p,ㄹ. p → ~r', '문제 4 보기 = 교과서 원문');
check(ch3[0].why && ch3[0].why.text === '∵ 명제가 참이면 그 대우도 참이고, 대우가 참이면 처음 명제도 참이다.' && ch3.filter((q) => q.why).length === 1, '💡 근거 줄 = 문제 3 졸개 ① 뒤 하나');
check(ch4[0].why && ch4[0].why.text === '∵ 명제가 참이면 그 대우도 참이다.' && ch4.filter((q) => q.why).length === 1, '💡 근거 줄 = 문제 4 졸개 ① 뒤 하나');
check([...ch3, ...ch4].every((q) => q.say) && /주어진 명제도 참이다\.$/.test(ch3[4].say), '나의 풀이 문장');
check([...ch3, ...ch4].every((q) => !/[○✕]|O\/X|가능한가/.test(q.question)), 'S5 O/X 없음');
const B = L.boss.sets[1].map(A);
check(B.join('|') === '참이다|n이 짝수이면 n²도 짝수이다.|2k − 1|2k²|r → p', `형성평가 ${B.join('|')}`);
check(/두 명제 q → p, ~q → ~r/.test(L.boss.sets[1][4].question) && L.boss.sets[1][4].choices.slice().sort().join() === 'p → q,p → r,r → p,~r → ~p', '형성평가 5 = 학습지 문장 · 보기');

// (3) 첫 시도 + 재도전 독립 검산
for (const mid of Object.keys(L.monsters)) first(mid).forEach((q, i) => verify(q, `${mid}#0(${i})`));
ch3.forEach((q, i) => verify(q, `m3 소레이드 첫 판 (${i})`)); ch4.forEach((q, i) => verify(q, `m4 소레이드 첫 판 (${i})`));
L.boss.sets[1].forEach((q, i) => verify(q, `형성평가 ${i + 1}`)); L.boss.sets[2].forEach((q, i) => verify(q, `형성평가 세트2 ${i + 1}`));
let n = 0;
for (let s = 0; s < 300; s++) {
  for (let a = 1; a <= 3; a++) for (const mid of Object.keys(L.monsters)) L.items(mid, `s${s}`, a).forEach((q, i) => { n++; verify(q, `${mid} s${s} a${a} (${i})`); });
  for (const mid of ['m3', 'm4']) for (let p = 1; p <= 3; p++) L.chainItems(mid, `s${s}`, p).forEach((q, i) => { n++; verify(q, `${mid} 소레이드 s${s} p${p} (${i})`); check(/^(대우를 이용하여 다음 명제가 참임을 증명하시오|세 조건 p, q, r 에 대하여 두 명제)/.test(q.problem || ''), '연습 판 = 원문 카드'); });
  for (let i = 0; i < 5; i++) { const q = L.boss.make(i, 1 + (s % 3), DS.Rng(`b${s}|${i}`)); n++; check(q.question.startsWith(`${i + 1}. `), `형성 ${i + 1} 번호`); verify(q, `형성평가 ${i + 1} s${s}`); }
}
for (const mid of Object.keys(L.monsters)) { let same = 0; for (let s = 0; s < 60; s++) if (L.items(mid, `d${s}`, 1).map((q) => q.question).join() === first(mid).map((q) => q.question).join()) same++; check(same === 0, `${mid}: 재도전이 학습지와 같음 ${same}`); }
for (const mid of ['m3', 'm4']) { let same = 0; for (let s = 0; s < 60; s++) if (L.chainItems(mid, `d${s}`, 1).map((q) => q.question).join() === L.chainItems(mid, 'seed', 0).map((q) => q.question).join()) same++; check(same === 0, `${mid}: 연습 판이 학습지와 같음 ${same}`); }
check(JSON.stringify(L.items('m2', 'x', 1)) === JSON.stringify(L.items('m2', 'x', 1)), '같은 시드는 같은 문제');
// 판정기 자체 점검 (교과서 · 학습지 답)
check(isContra('n²이 짝수이면 n도 짝수이다.', 'n이 홀수이면 n²도 홀수이다.') && !isContra('n²이 짝수이면 n도 짝수이다.', 'n이 짝수이면 n²도 짝수이다.'), '판정기 = 예제 1 대우');
check(isContra('a + b가 홀수이면 a, b 중 적어도 하나는 홀수이다.', 'a, b가 모두 짝수이면 a + b는 짝수이다.') && !isContra('a + b가 홀수이면 a, b 중 적어도 하나는 홀수이다.', 'a, b가 모두 홀수이면 a + b는 짝수이다.'), '판정기 = 적어도 하나 ↔ 모두');
{ const C = chainSets(['p → q', '~r → ~q']); check(C.order.join() === 'p,q,r' && ['q → r', '~r → ~p'].every((s) => propOk(C, s)) && !['~p → ~q', 'p → ~r'].some((s) => propOk(C, s)), '판정기 = 중단원 09 답 ㄱ, ㄷ'); }

// (4) 📸 서술형 채점 기준 (m3) · 모루 카드 「대우를 이용한 증명」 = 11차시
const RB = ((DS.Rubrics || {})['set-11'] || {}).m3;
check(RB && RB.on && RB.raid && RB.total === 4 && RB.steps.length === 4 && RB.steps.reduce((s, x) => s + x.pts, 0) === 4 && RB.pass === 3, '📸 채점 기준 4단계 · 통과 3');
check(RB && /손글씨/.test(RB.note || '') && /3의 배수/.test(RB.ask), '📸 손글씨만 (#58 A) · 교과서 문제 1');
console.log(`${fail ? '❌' : '✅'} 11차시: 확인 ${count}개 (재도전 문항 ${n}개) · 실패 ${fail}`);
if (fail) process.exit(1);
