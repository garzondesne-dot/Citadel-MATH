// 5차시 검증: node tests/lesson5.test.js  (학습과정 5차시 레이드용 v3 · 2026-11-02 확정)
// (1) 레이드 순서: 개념1 → 문제1 → … → 개념5 → 문제5 → 형성평가 (도입 · 복습 몬스터 없음) · 보강 3마리는 보강던전(bonus)
// (2) 첫 시도 = 학습지 · 교사용 정답 (아래에 따로 적음)
// (3) 재도전 시드 300개 × 3번: 문제 글에서 집합 · 전체집합 · 조건을 직접 읽어 내고, 따로 만든 식 계산기(∪ ∩ − ᶜ 괄호)로 다시 계산 (차시 파일의 계산 결과 · check 를 쓰지 않는다)
// (4) 보강 ①·② · 형성평가 3번: A, B, C 에 {1,2,3} 의 모든 부분집합을 대입해 항등식인지 확인 (정답 보기만 항등식)
// (5) 보강 ③ 그림: 네 칸(A만 · B만 · 겹침 · 바깥)으로 식을 계산해 색칠 영역과 맞춘다
// (6) 형성평가 세트1·2 (7·8번 도전 포함)
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-05.js']);
const L = DS.Lessons.get('set-05'), Q = DS.Quiz;
let fail = 0, count = 0;
const check = (c, m) => { count++; if (!c) { fail++; if (fail <= 30) console.error('FAIL:', m); } };

// ── 독립 계산 도구 ─────────────────────────────────────────
const upto = (n) => Array.from({ length: n }, (_, i) => i + 1);
const norm = (A) => [...new Set(A)].sort((a, b) => a - b);
const eq = (A, B) => JSON.stringify(norm(A)) === JSON.stringify(norm(B));
const parseSet = (s) => (s.trim() === '∅' ? [] : s.replace(/[{}]/g, '').split(',').map((t) => t.trim()).filter((t) => t && t !== '…').map(Number));
// 조건 낱말 → 판정 (교과서 뜻 그대로 따로 적음)
const condOf = (w) => { if (w === '짝수') return (x) => x % 2 === 0; if (w === '홀수') return (x) => x % 2 !== 0; const m = /^(\d+)의 배수$/.exec(w); if (m) return (x) => x % Number(m[1]) === 0; throw new Error('모르는 조건 ' + w); };
// 문제 글에서 U · A · B · C 읽기
function readEnv(q) {
  const env = {};
  let m = /U = \{1, 2, 3, …, (\d+)\}/.exec(q); if (m) env.U = upto(Number(m[1]));
  m = /U = \{x \| x는 (\d+) 이하의 자연수\}/.exec(q); if (m) env.U = upto(Number(m[1]));
  if (!env.U) { m = /U = (\{[^}]*\})/.exec(q); if (m) env.U = parseSet(m[1]); }
  for (const k of ['A', 'B', 'C']) {
    const e = new RegExp(`(?:^|[^A-Za-z])${k} = (\\{[^}x|]*\\})`).exec(q); if (e) { env[k] = parseSet(e[1]); continue; }
    const c = new RegExp(`${k} = \\{x \\| x는 ([^}]+)\\}`).exec(q); if (c) env[k] = (env.U || upto(20)).filter(condOf(c[1].trim()));
  }
  return env;
}
// 식 계산기: atom := A|B|C|U|∅|( expr ) ; term := atom ᶜ* ; expr := term ((∪|∩|−) term)*
function evalExpr(src, env) {
  const s = src.replace(/\s+/g, ''); let i = 0;
  const atom = () => {
    const c = s[i];
    if (c === '(') { i++; const v = expr(); if (s[i] !== ')') throw new Error('괄호 ' + src); i++; return v; }
    if (c === '∅') { i++; return []; }
    if ('ABCU'.includes(c)) { i++; if (!env[c]) throw new Error(`${c} 없음: ${src}`); return env[c]; }
    throw new Error(`읽을 수 없는 글자 ${c} in ${src}`);
  };
  const term = () => { let v = atom(); while (s[i] === 'ᶜ') { i++; v = env.U.filter((x) => !v.includes(x)); } return v; };
  const expr = () => {
    let v = term();
    while (i < s.length && '∪∩−'.includes(s[i])) { const op = s[i++]; const w = term(); v = op === '∪' ? norm([...v, ...w]) : op === '∩' ? v.filter((x) => w.includes(x)) : v.filter((x) => !w.includes(x)); }
    return norm(v);
  };
  const v = expr(); if (i !== s.length) throw new Error('남은 글자 ' + src); return v;
}
// 항등식: A, B, C ⊆ {1,2,3} 모든 경우 (U = {1,2,3})
const SUBS = upto(8).map((m) => [1, 2, 3].filter((x, k) => (m - 1) & (1 << k)));
function identity(l, r) {
  for (const A of SUBS) for (const B of SUBS) for (const C of SUBS) { const env = { A, B, C, U: [1, 2, 3] }; if (!eq(evalExpr(l, env), evalExpr(r, env))) return false; }
  return true;
}
const rightGiven = (p) => (p.type === 'choice' ? p.answerIndex : p.answer);
const wrongGiven = (p) => (p.type === 'choice' ? (p.answerIndex + 1) % p.choices.length : p.type === 'multi' ? p.answer.slice(1) : null);
const pickedSet = (q) => q.answer.map((k) => Number(q.options[k]));

// 원소 고르기 문항 검산
function checkPick(q, tag) {
  const m = /일 때 (.+) 의 원소를 모두 고르시오\.$/.exec(q.question);
  check(m, `${tag}: 식 읽기 ${q.question}`); if (!m) return;
  const env = readEnv(q.question), want = evalExpr(m[1], env);
  check(want.length > 0, `${tag}: 답이 공집합 (고를 것이 없음) ${q.question}`);
  check(want.every((x) => q.options.map(Number).includes(x)), `${tag}: 보기에 답 원소가 없음 ${q.question}`);
  check(eq(pickedSet(q), want), `${tag}: ${m[1]} = ${JSON.stringify(want)} 인데 ${JSON.stringify(pickedSet(q))}`);
  if (env.U) check(Object.keys(env).filter((k) => k !== 'U').every((k) => env[k].every((x) => env.U.includes(x))), `${tag}: U 밖의 원소 ${q.question}`);
}
// 같다 / 다르다 문항
function checkSame(q, tag) {
  const m = /(?:일 때 )?([^일]+?) 와 (.+?) (?:의 결과는|를 색칠한 두 그림은)\?$/.exec(q.question);
  check(m, `${tag}: 같다/다르다 읽기 ${q.question}`); if (!m) return;
  const env = readEnv(q.question);
  const isSame = Object.keys(env).length ? eq(evalExpr(m[1], env), evalExpr(m[2], env)) : identity(m[1], m[2]);
  check(q.answer === (isSame ? '같다' : '다르다'), `${tag}: ${m[1]} vs ${m[2]} → ${isSame}`);
}
function checkItem(q, tag) {
  check(Q.grade(q, rightGiven(q)) === true, `${tag}: 정답 채점 실패`);
  check(Q.grade(q, wrongGiven(q)) === false, `${tag}: 오답이 정답 처리됨`);
  if (q.type === 'multi') checkPick(q, tag);
  else if (q.choices && q.choices.join() === '같다,다르다') checkSame(q, tag);
}

// ── 1. 레이드 순서 · 구성 ─────────────────────────────────
check(L.steps.map((s) => s.id).join() === 'c1,m1,c2,m2,c3,m3,c4,m4,c5,m5,boss', `순서 ${L.steps.map((s) => s.id)}`);
check(!L.steps.some((s) => s.kind === 'intro' || s.id === 'r1'), '도입 · 복습 몬스터 없음 (사용자 결정)');
check(L.bonus.map((b) => b.id).join() === 'b1,b2,b3' && L.bonus.every((b) => L.steps.some((s) => s.id === b.concept)), '보강던전 3마리 · 개념 연결');
check(L.boss.items === 8 && L.boss.hpItems === 6 && L.boss.tags.length === 8 && L.boss.tags.every((t) => L.steps.some((s) => s.id === t)), '형성평가 8문항 (체력 6 + 도전 2) · 개념 표시');
check(L.no === 5 && L.theme === '07-volcano' && DS.ASSETS.dungeons.ids.includes(L.theme), '5차시 · 화산 심연');
const sprites = [...Object.values(L.monsters).map((m) => m.sprite), L.boss.sprite];
check(new Set(sprites).size === sprites.length, '몬스터 그림 겹치지 않음');
const sheetOf = { extra: 'monstersExtra', new: 'monstersNew', crown: 'monstersCrown' };
check(sprites.every((s) => { const [k, n] = String(s).split(':'); const sh = DS.ASSETS[sheetOf[k]]; return sh && Number(n) < sh.rows; }), '몬스터 그림이 시트에 있음');
check(Object.keys(L.videos).every((k) => L.steps.some((s) => s.id === k) || L.bonus.some((b) => b.id === k)) && Object.values(L.videos).every((u) => /^assets\/video\/v05-\d+\.mp4$/.test(u) && require('fs').existsSync(require('path').join(__dirname, '..', u))), '영상 칸 · 게임 서버 영상 파일 (assets/video)');
check([...L.steps.filter((s) => s.kind !== 'intro').map((s) => s.id), ...L.bonus.map((b) => b.id)].every((k) => (L.crops[k] || []).length && L.crops[k].every((c) => c.x >= 0 && c.y >= 0 && c.x + c.w <= 1 && c.y + c.h <= 1)), '학습지 칸 위치(crops) 모두 있음');

// ── 2. 첫 시도 = 학습지 · 교사용 정답 ─────────────────────
const first = (id) => L.items(id, 'x', 0);
const ws = {
  m1: [[1, 2, 3, 4], [1, 2, 3, 4, 5], [2, 3, 4, 5], [1, 2, 3, 4, 5], [3]],
  m2: [[2, 3, 4, 5, 6], [2, 3, 4], [2, 4], [3, 4], [2, 3, 4], '같다'],
  m3: [[4, 5, 6, 7, 8], [1, 3, 5, 7]],
  m4: [[1, 5, 7], [6]],
  m5: [[1, 3, 5], [1, 3], [1, 3], '같다'],
};
Object.entries(ws).forEach(([id, ans]) => first(id).forEach((q, i) => {
  const a = ans[i];
  check(typeof a === 'string' ? q.answer === a : eq(pickedSet(q), a), `${id} (${i + 1}) 학습지 정답 ${JSON.stringify(a)}`);
}));
check(/A = \{1, 2, 3\}, B = \{2, 3, 4\}, C = \{3, 4, 5\}/.test(first('m1')[0].question) && /A = \{1, 2, 3, 4\}, B = \{2, 4, 6\}, C = \{3, 4, 5\}/.test(first('m2')[0].question), '학습지 집합 그대로 (문제 1 · 2)');
check(/U = \{1, 2, 3, …, 8\}/.test(first('m3')[0].question) && /짝수/.test(first('m3')[1].question) && /U = \{1, 2, 3, 4, 5, 6\}/.test(first('m5')[0].question), '학습지 전체집합 그대로 (문제 3 · 5)');
check(first('b1').map((q) => q.answer).join('|') === 'A|A|B ∪ C', '보강 ① 학습지 정답 A · A · B ∪ C');
check(first('b2').map((q) => q.answer).join('|') === 'U|∅|A', '보강 ② 학습지 정답 U · ∅ · A');
check(first('b3').map((q) => q.answer).join('|') === 'vshade:A-B|vshade:A-B|같다', '보강 ③ 학습지: 두 그림 같다');
Object.keys(L.monsters).forEach((id) => { const q0 = first(id); if (q0[0].type === 'choice' && q0[0].choices.join() !== '같다,다르다') check(q0.some((q) => q.answerIndex !== 0), `${id}: 정답이 모두 첫 번째 보기는 아님`); });

// ── 3. 레이드 몬스터 · 재도전 (시드 300 × 0~3번) ─────────────
for (const id of ['m1', 'm2', 'm3', 'm4', 'm5']) {
  const n0 = first(id).length;
  for (let s = 0; s < 300; s++) for (const a of [0, 1, 2, 3]) {
    const items = L.items(id, `seed${s}`, a);
    check(items.length === n0, `${id} 재도전 칸 수`);
    items.forEach((q, k) => checkItem(q, `${id}#${s}/${a}(${k + 1})`));
    if (s === 0) check(JSON.stringify(L.items(id, `seed${s}`, a)) === JSON.stringify(items), `${id}: 같은 시드 → 같은 문제`);
  }
  const a0 = JSON.stringify(first(id));
  check(upto(20).some((s) => JSON.stringify(L.items(id, `q${s}`, 1)) !== a0), `${id}: 재도전 문제가 바뀜`);
}

// ── 4. 보강던전 ① ② (항등식) · ③ (그림) ──────────────────
function checkIdentityChoice(q, tag) {
  let lhs, tpl;
  let m = /^(.+) 를 간단히 하면\?$/.exec(q.question); if (m) { lhs = m[1]; tpl = '□'; }
  m = m || /^(.+) = (.+) 에 알맞은 것은\?$/.exec(q.question); if (m && !tpl) { lhs = m[1]; tpl = m[2].replace('(   )', '□'); }
  if (!lhs) { m = /^(.+) 와 같은 것은\?$/.exec(q.question); if (m) { lhs = m[1]; tpl = '□'; } }
  check(lhs, `${tag}: 식 읽기 ${q.question}`); if (!lhs) return;
  const ok = q.choices.map((c) => identity(lhs, tpl.replace('□', `(${c})`)));
  check(ok[q.answerIndex] && ok.filter(Boolean).length === 1, `${tag}: ${lhs} — 항등식인 보기 ${JSON.stringify(q.choices.filter((_, i) => ok[i]))}, 정답 ${q.answer}`);
}
const REGION = { 'A-B': [1], 'B-A': [2], AnB: [3], AuB: [1, 2, 3], Ac: [2, 4] }; // 1 = A만, 2 = B만, 3 = 겹침, 4 = 바깥
const PT = { A: [1, 3], B: [2, 3], U: [1, 2, 3, 4] };
function checkShade(q, tag) {
  const m = /^(.+) 를 색칠한 그림은\?$/.exec(q.question); check(m, `${tag}: 그림 문항 읽기`); if (!m) return;
  const v = evalExpr(m[1], PT), regs = q.choices.map((c) => REGION[c.replace('vshade:', '')]);
  check(regs.every(Boolean), `${tag}: 모르는 영역 ${q.choices}`);
  check(eq(regs[q.answerIndex], v) && regs.filter((r) => eq(r, v)).length === 1, `${tag}: ${m[1]} = ${JSON.stringify(v)} 인 그림이 정답 하나`);
}
for (let s = 0; s < 300; s++) for (const a of [0, 1, 2, 3]) {
  L.items('b1', `seed${s}`, a).forEach((q, k) => { checkItem(q, `b1#${s}/${a}(${k + 1})`); checkIdentityChoice(q, `b1#${s}/${a}(${k + 1})`); });
  L.items('b2', `seed${s}`, a).forEach((q, k) => { checkItem(q, `b2#${s}/${a}(${k + 1})`); checkIdentityChoice(q, `b2#${s}/${a}(${k + 1})`); check(new Set(q.choices).size === 4, 'b2 보기 4개 서로 다름'); });
  L.items('b3', `seed${s}`, a).forEach((q, k) => { checkItem(q, `b3#${s}/${a}(${k + 1})`); if (q.choices[0].startsWith('vshade:')) checkShade(q, `b3#${s}/${a}(${k + 1})`); });
}
check(['b1', 'b2', 'b3'].every((id) => upto(20).some((s) => JSON.stringify(L.items(id, `q${s}`, 1)) !== JSON.stringify(first(id)))), '보강 재도전 문제가 바뀜');
// 그림 보기는 화면에 그려진다 (UI.vshade)
check(Object.keys(REGION).every((r) => /<svg/.test(DS.UI.vshade(r)) && /mask|fill-opacity/.test(DS.UI.vshade(r))), '색칠 그림 5종');
check(/<svg/.test(DS.UI.opt('vshade:A-B')) && /math/.test(DS.UI.opt('A ∪ B')), '보기 그리기: 그림 · 글');

// ── 5. 형성평가 ───────────────────────────────────────────
const LAW = (q) => { // 법칙 이름: 식 모양으로 따로 판정
  const m = /^1\. (.+) = (.+) 는 어떤 법칙인가\?$/.exec(q); if (!m) return null;
  const [l, r] = [m[1].replace(/\s/g, ''), m[2].replace(/\s/g, '')];
  if (/^([A-C])([∪∩])([A-C])$/.test(l) && r === l.replace(/^([A-C])([∪∩])([A-C])$/, '$3$2$1')) return '교환법칙';
  if (/^\(([A-C])([∪∩])([A-C])\)\2([A-C])$/.test(l) && r === l.replace(/^\(([A-C])([∪∩])([A-C])\)\2([A-C])$/, '$1$2($3$2$4)')) return '결합법칙';
  return '분배법칙';
};
[1, 2].forEach((k) => {
  const S = L.boss.sets[k];
  check(S.length === 8, `세트${k} 8문항`);
  S.forEach((q, i) => {
    const tag = `형성평가 세트${k} ${i + 1}번`;
    check(Q.grade(q, q.answerIndex) && !Q.grade(q, (q.answerIndex + 1) % q.choices.length), `${tag}: 채점`);
    check(new Set(q.choices).size === q.choices.length, `${tag}: 보기 겹침 없음`);
    if (i === 0) { check(q.answer === LAW(q.question), `${tag}: 법칙 ${LAW(q.question)}`); return; }
    if (i === 2) { checkIdentityChoice({ ...q, question: q.question.replace(/^3\. /, '').replace(' 의 (   ) 에 알맞은 것은?', ' 에 알맞은 것은?') }, tag); return; }
    const env = readEnv(q.question);
    if (i === 6) { // (A ∪ B) ∩ (A ∪ C) = A ∪ (빈칸) · 결과
      const ok = q.choices.map((c) => { const [blank, val] = [c.split(', ')[0], c.slice(c.indexOf(', ') + 2)]; return identity('(A ∪ B) ∩ (A ∪ C)', `A ∪ (${blank})`) && eq(parseSet(val), evalExpr('(A ∪ B) ∩ (A ∪ C)', env)); });
      check(ok[q.answerIndex] && ok.filter(Boolean).length === 1, `${tag}: 빈칸 · 결과 짝`); return;
    }
    const m = /(?:일 때|에서) (.+) 는\?$/.exec(q.question); check(m, `${tag}: 식 읽기`); if (!m) return;
    const v = evalExpr(m[1], env), hit = q.choices.map((c) => eq(parseSet(c), v));
    check(hit[q.answerIndex] && hit.filter(Boolean).length === 1, `${tag}: ${m[1]} = ${JSON.stringify(v)}`);
  });
});
// 세트1 = 학습지 형성평가 · 교사용 정답 (6번은 「위 5번에서」 v3 기준)
const want1 = ['교환법칙', '{1, 2, 3, 4}', 'A ∩ C', '{1, 3, 5}', '{1, 3}', '{6}', 'B ∩ C, {1, 2, 3, 4, 5, 6}', '{1, 5, 7}'];
check(L.boss.sets[1].map((q) => q.answer).join('|') === want1.join('|'), `세트1 학습지 정답 ${L.boss.sets[1].map((q) => q.answer)}`);
check(/A = \{1, 2, 3, 4\}, B = \{2, 4, 6\}/.test(L.boss.sets[1][5].question), '6번은 5번의 A, B 를 그대로 보여 준다 (원본 「위 2번」 오타 고침)');
check(L.boss.sets[1].filter((q) => q.answerIndex === 0).length <= 2, '세트1 정답이 첫 보기에 몰리지 않음');

if (fail) { console.error(`\n${fail}건 실패 / ${count}건`); process.exit(1); }
console.log(`OK: 5차시 — 순서(도입·복습 없음)·학습지 정답·재도전 300×4·식 계산기·항등식·그림 영역·형성평가 ${count}건 통과`);
