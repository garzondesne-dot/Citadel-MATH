// 12차시 검증: node tests/lesson12.test.js  (학습과정 12차시 레이드용 v1 · 2026-11-14 「귀류법」 · 교과서 92쪽)
// (1) 순서 · 칸 · 그림 · #64 꼴  (2) 첫 시도 = 학습지 정답  (3) 재도전 300 시드 × 3 · 소레이드 연습 판 · 형성평가 재도전 = 문장을 읽어 따로 판정
//   처음 가정 · 부정 = 문장을 수 조건으로 바꿔 모든 경우에 「결론의 부정」과 같은지 · 식 = 수 대입 · 반 나누기 = (기준 − 1) × 반 수 < 인원
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-12.js', 'lessons/rubrics.js']);
const L = DS.Lessons.get('set-12'), Q = DS.Quiz;
let fail = 0, count = 0;
const check = (c, m) => { count++; if (!c) { fail++; if (fail <= 30) console.error('FAIL:', m); } };

// ── 독립 판정 도구 ──
const R2 = Math.SQRT2, near = (x, y) => Math.abs(x - y) < 1e-9;
const GRID = []; for (let a = -3; a <= 8; a += 0.5) for (let b = -3; b <= 8; b += 0.5) GRID.push({ a, b, n: a });
const NAT = []; for (let a = 1; a <= 12; a++) for (let b = 1; b <= 12; b++) NAT.push({ a, b, n: a });
const ev = (x) => x % 2 === 0, od = (x) => Math.abs(x % 2) === 1;
function sent(t) { // 문장 → { dom, f } (수 조건만)
  t = t.trim().replace(/이다\.?$/, '').replace(/\.$/, ''); let m;
  const cmp = (x, op, k) => ({ '>': x > k, '<': x < k, '≥': x >= k, '≤': x <= k }[op]);
  if ((m = /^a ([<>≤≥]) (\d+)(이고| 또는) b ([<>≤≥]) (\d+)$/.exec(t))) { const [, o1, k1, j, o2, k2] = m; return { dom: GRID, f: (o) => (j === '이고' ? cmp(o.a, o1, +k1) && cmp(o.b, o2, +k2) : cmp(o.a, o1, +k1) || cmp(o.b, o2, +k2)) }; }
  if ((m = /^a, b 중 적어도 하나는 (짝수|홀수)$/.exec(t))) { const p = m[1] === '짝수' ? ev : od; return { dom: NAT, f: (o) => p(o.a) || p(o.b) }; }
  if ((m = /^a, b는 모두 (짝수|홀수)$/.exec(t))) { const p = m[1] === '짝수' ? ev : od; return { dom: NAT, f: (o) => p(o.a) && p(o.b) }; }
  if ((m = /^n은 (짝수|홀수)$/.exec(t))) { const p = m[1] === '짝수' ? ev : od; return { dom: NAT, f: (o) => p(o.n) }; }
  if ((m = /^n²은 (짝수|홀수)$/.exec(t))) { const p = m[1] === '짝수' ? ev : od; return { dom: NAT, f: (o) => p(o.n * o.n) }; }
  return null;
}
const conclOf = (s) => { const m = /이면 (.+)$/.exec(s); let c = m ? m[1] : s; c = c.replace(/^n도 /, 'n은 '); return c; };
const isNeg = (target, cand) => { const A = sent(target), B = sent(cand); if (!A || !B) return null; return A.dom === B.dom && A.dom.every((o) => B.f(o) === !A.f(o)); };
function assumeOk(stmt, cand) { // 귀류법 처음 가정 = 결론의 부정
  let m;
  if ((m = /^(√\d+)([은는]) 유리수가 아니다\.$/.exec(stmt))) return cand === `${m[1]}${m[2]} 유리수이다.`;
  if (stmt === '소수는 무수히 많다.') return cand === '소수는 유한개이다.';
  if ((m = /^학생 (\d+)명을 (\d+)개 반으로 나누면 어떤 반은 (\d+)명 이상이다\.$/.exec(stmt))) { const [N, c, t] = [+m[1], +m[2], +m[3]]; const k = /^모든 반이 (\d+)명 이하이다\.$/.exec(cand); return !!k && +k[1] === t - 1 && (t - 1) * c < N; }
  const r = isNeg(conclOf(stmt), cand); if (r === null) throw new Error(`판정 못 함 ${stmt} / ${cand}`); return r;
}
const val = (s, env) => { let t = s.replace(/−/g, '-').replace(/÷/g, '/').replace(/×/g, '*').replace(/√2/g, 'S').replace(/([a-zS])²/g, '($1**2)');
  t = t.replace(/([0-9a-zS)])(?=[a-zS(])/g, '$1*'); return new Function('S', ...Object.keys(env), `return ${t};`)(R2, ...Object.values(env)); };

const ans = (q) => q.choices[q.answerIndex];
function gradeOk(q, tag) { check(Q.grade(q, q.answerIndex) === true, `${tag}: 정답 채점`); check(Q.grade(q, (q.answerIndex + 1) % q.choices.length) === false, `${tag}: 오답이 정답 처리됨`);
  check(q.type === 'choice' && q.answerIndex >= 0 && new Set(q.choices).size === q.choices.length && q.choices.length >= 3, `${tag}: 보기 ${JSON.stringify(q.choices)}`); }
function verify(q, tag) {
  gradeOk(q, tag); const t = q.question.replace(/^\d+\. /, '').replace(/^\(\d\) /, ''), a = ans(q); let m;
  if ((m = /^명제 「(.+?)」를 귀류법으로 증명할 때, 처음에 가정하는 것은\?$/.exec(t))) { check(assumeOk(m[1], a), `${tag}: 처음 가정 ${a}`); q.choices.filter((c) => c !== a).forEach((c) => check(!assumeOk(m[1], c), `${tag}: 함정도 맞음 ${c}`)); return; }
  if ((m = /^「(.+?)」의 부정은\?/.exec(t))) { check(isNeg(m[1], a) === true, `${tag}: 부정 ${a}`); q.choices.filter((c) => c !== a).forEach((c) => check(isNeg(m[1], c) === false, `${tag}: 함정도 부정 ${c}`)); return; }
  if (/^명제 「√2 는 유리수가 아니다\.」를 귀류법으로 증명할 때, 처음 가정은 「√2 는 \?이다\.」$/.test(t)) { check(a === '유리수', `${tag}: ${a}`); return; }
  if ((m = /^√2 = (\w)\/(\w) \((\w), (\w)은 서로소인 자연수\)에서 (\w) = √2(\w) 의 양변을 제곱하면 (\w)² = \?$/.exec(t))) { const [, n, mm] = m; const ok = (c) => [1, 2, 3, 7].every((x) => near(val(c, { [mm]: x }), (R2 * x) ** 2));
    check(m[5] === n && m[6] === mm && m[7] === n && ok(a), `${tag}: 제곱 ${a}`); q.choices.filter((c) => c !== a).forEach((c) => check(!ok(c), `${tag}: 함정도 맞음 ${c}`)); return; }
  if ((m = /(\w)² = 2(\w)² 에 (\w) = 2(\w) 를 대입하면 (?:4\w² = 2\w², 즉 )?(\w)² = \?$/.exec(t))) { const [, n, mm, n2, k, m2] = m; const ok = (c) => [1, 2, 3, 5].every((x) => near(val(c, { [k]: x }), (2 * x) ** 2 / 2));
    check(n === n2 && mm === m2 && ok(a), `${tag}: 대입 ${a}`); q.choices.filter((c) => c !== a).forEach((c) => check(!ok(c), `${tag}: 함정도 맞음 ${c}`)); return; }
  if ((m = /^(\w)² 이 짝수이므로 (\w) 도 짝수 → (\w) = 2(\w) 를 (\w)² = 2(\w)² 에 대입하면 4(\w)² = 2(\w)², 즉 (\w)² = \?$/.exec(t))) { const k = m[4]; const ok = (c) => [1, 2, 3, 5].every((x) => near(val(c, { [k]: x }), (2 * x) ** 2 / 2));
    check(ok(a), `${tag}: 대입 ${a}`); q.choices.filter((c) => c !== a).forEach((c) => check(!ok(c), `${tag}: 함정도 맞음 ${c}`)); return; }
  if ((m = /^(\w), (\w) 이 모두 짝수가 되었다\. 이것은 무엇에 모순인가\?$/.exec(t))) { check(a === `${m[1]}, ${m[2]}은 서로소`, `${tag}: ${a}`); return; }
  if ((m = /^「(.+?) 는 유리수가 아니다\.」를 귀류법으로 증명할 때, 처음 가정은\?$/.exec(t))) { check(a === `${m[1]} 는 유리수이다.`, `${tag}: ${a}`); return; }
  if ((m = /^(.+?) = a \(a 는 유리수\)로 놓으면 √2 = \?$/.exec(t))) { const A = val(m[1], {}), ok = (c) => near(val(c, { a: A }), R2); check(ok(a), `${tag}: √2 = ${a}`); q.choices.filter((c) => c !== a).forEach((c) => check(!ok(c), `${tag}: 함정도 맞음 ${c}`)); return; }
  if (/^a 가 유리수이면 .+ 는\?$/.test(t)) { check(a === '유리수', `${tag}: ${a}`); return; }
  if (/^√2 가 유리수가 되었다\. 이것은 무엇에 모순인가\?$/.test(t)) { check(/^√2 는 유리수가 아니다/.test(a), `${tag}: ${a}`); return; }
  if (/^그러므로 결론은\?$/.test(t)) { check(/^.+ 는 유리수가 아니다\.$/.test(a) && !/^√2 는 /.test(a) && q.choices.filter((c) => /유리수가 아니다\.$/.test(c)).length === 1, `${tag}: ${a}`); return; }
  if (/증명법은\?$/.test(t)) { check(a === '귀류법', `${tag}: ${a}`); return; }
  check(false, `${tag}: 모르는 꼴 ${t}`);
}

// (1) 순서 · 칸 · 그림 · #64 꼴
check(L.steps.map((s) => s.id).join(',') === 'intro,c1,m1,c2,m2,m3,sum,boss', `레이드 순서 ${L.steps.map((s) => s.id)}`);
check(L.no === 12 && L.theme === '12-skygarden' && DS.ASSETS.dungeons.ids.includes(L.theme), '12차시 · ⚖ 공중 정원 이어 씀');
check(/레이드용 v1/.test(L.sheet) && /13차시/.test(L.next.title), '판 v1 · 다음 = 13차시');
L.steps.forEach((s) => check(L.crops[s.img || s.id] && L.crops[s.img || s.id][0].h > 0.04, `칸 위치 ${s.img || s.id}`));
check(Object.keys(L.monsters).join() === 'm1,m2,m3' && ['garden:0', 'garden:4', 'garden:3'].every((sp, i) => L.monsters[`m${i + 1}`].sprite === sp), '몬스터 그림 (천칭 가고일 · 거울 웅덩이 두꺼비 · 쌍둥이 구름 정령)');
check(L.boss.sprite === 'gardenboss:0' && L.boss.items === 5, '보스 = 천칭 수호자 · 5문항');
check(L.chain.join() === 'm3' && L.monsters.m3.evalQ, 'm3 = ⚔ 소레이드 + ✍ 서술형 (소레이드 하나)');
check(JSON.stringify(JSON.parse(JSON.stringify(L.DATA))) === JSON.stringify(L.DATA), '📦 #64 DATA = JSON 그대로');
check(Object.values(L.DATA.monsters).every((M) => L.GEN[M.book.gen] && L.GEN[`${M.retry.gen}R`]), '📦 생성기 = 데이터 쪽 이름');
check(L.boss.tags.every((t) => L.steps.some((s) => s.kind === 'concept' && s.id === t)), '보스 태그 = 이 차시 개념');

// (2) 첫 시도 = 학습지 정답
const first = (mid) => L.items(mid, 'seed', 0);
check(first('m1').map(ans).join('|') === '√3은 유리수이다.|소수는 유한개이다.|a ≤ 1이고 b ≤ 1이다.', `문제 1 ${first('m1').map(ans).join('|')}`);
check(first('m2').map(ans).join('|') === '유리수|2m²|2k²|m, n은 서로소', `문제 2 (예제 2) ${first('m2').map(ans).join('|')}`);
const ch3 = L.chainItems('m3', 'seed', 0);
check(ch3.map(ans).join('|') === '1 + √2 는 유리수이다.|a − 1|유리수|√2 는 유리수가 아니다 (예제 2)|1 + √2 는 유리수가 아니다.', `문제 3 소레이드 (교과서 문제 2) ${ch3.map(ans).join('|')}`);
check(ch3[2].why && ch3[2].why.text === '∵ 유리수끼리의 합 · 차는 유리수이다.' && ch3.filter((q) => q.why).length === 1, `💡 근거 줄 = 졸개 ③ 뒤 하나 (${ch3[2].why && ch3[2].why.text})`);
check(ch3.every((q) => q.say) && /그러므로 1 \+ √2 는 유리수가 아니다\.$/.test(ch3[4].say), '나의 풀이 문장');
check(ch3.every((q) => !/[○✕]|O\/X|가능한가/.test(q.question)), 'S5 O/X 없음');
const B = L.boss.sets[1].map(ans);
check(B.join('|') === '귀류법|√5는 유리수이다.|a, b는 모두 홀수이다.|2k²|모든 반이 3명 이하이다.', `형성평가 ${B.join('|')}`);

// (3) 첫 시도 + 재도전 독립 검산
for (const mid of Object.keys(L.monsters)) first(mid).forEach((q, i) => verify(q, `${mid}#0(${i})`));
ch3.forEach((q, i) => verify(q, `m3 소레이드 첫 판 (${i})`));
L.boss.sets[1].forEach((q, i) => verify(q, `형성평가 ${i + 1}`)); L.boss.sets[2].forEach((q, i) => verify(q, `형성평가 세트2 ${i + 1}`));
let n = 0;
for (let s = 0; s < 300; s++) {
  for (let a = 1; a <= 3; a++) for (const mid of Object.keys(L.monsters)) L.items(mid, `s${s}`, a).forEach((q, i) => { n++; verify(q, `${mid} s${s} a${a} (${i})`); });
  for (let p = 1; p <= 3; p++) L.chainItems('m3', `s${s}`, p).forEach((q, i) => { n++; verify(q, `m3 소레이드 s${s} p${p} (${i})`); check(/^귀류법을 이용하여 다음 명제가 참임을 증명하시오\. 「.+ 는 유리수가 아니다\.」$/.test(q.problem || '') && /√2/.test(q.problem) && !/√[3-9]/.test(q.problem), '연습 판 = 원문 카드 · √2 만'); });
  for (let i = 0; i < 5; i++) { const q = L.boss.make(i, 1 + (s % 3), DS.Rng(`b${s}|${i}`)); n++; check(q.question.startsWith(`${i + 1}. `), `형성 ${i + 1} 번호`); verify(q, `형성평가 ${i + 1} s${s}`); }
}
for (const mid of Object.keys(L.monsters)) { let same = 0; for (let s = 0; s < 60; s++) if (L.items(mid, `d${s}`, 1).map((q) => q.question).join() === first(mid).map((q) => q.question).join()) same++; check(same === 0, `${mid}: 재도전이 학습지와 같음 ${same}`); }
{ let same = 0; for (let s = 0; s < 60; s++) if (L.chainItems('m3', `d${s}`, 1).map((q) => q.question).join() === ch3.map((q) => q.question).join()) same++; check(same === 0, `m3 연습 판이 학습지와 같음 ${same}`); }
// 판정기 자체 점검
check(assumeOk('실수 a, b에 대하여 a + b > 2이면 a > 1 또는 b > 1이다.', 'a ≤ 1이고 b ≤ 1이다.') && !assumeOk('실수 a, b에 대하여 a + b > 2이면 a > 1 또는 b > 1이다.', 'a ≤ 1 또는 b ≤ 1이다.'), '판정기 = 또는 ↔ 이고');
check(assumeOk('학생 10명을 3개 반으로 나누면 어떤 반은 4명 이상이다.', '모든 반이 3명 이하이다.') && near(val('a − 1', { a: 1 + R2 }), R2), '판정기 = 반 나누기 · 1 + √2');

// 🎬 영상 (#52 · #53 · #54)
{ const fs = require('fs'), path = require('path'); const V = L.videos || {};
  check(V.c1 === 'assets/video/v12-52.mp4' && V.m1 === V.c1 && V.c2 === 'assets/video/v12-53.mp4' && V.m2 === V.c2 && V.m3 === 'assets/video/v12-54.mp4', '🎬 영상 칸');
  Object.values(V).forEach((f) => check(fs.existsSync(path.join(__dirname, '..', f)) && fs.statSync(path.join(__dirname, '..', f)).size < 1.05e6, `🎬 ${f} 있음 · 1MB 이내`)); }

// (4) 📸 서술형 채점 기준 (m3)
const RB = ((DS.Rubrics || {})['set-12'] || {}).m3;
check(RB && RB.on && RB.raid && RB.total === 4 && RB.steps.length === 4 && RB.steps.reduce((s, x) => s + x.pts, 0) === 4 && RB.pass === 3, '📸 채점 기준 4단계 · 통과 3');
check(RB && /손글씨/.test(RB.note || '') && /1 \+ √2/.test(RB.ask), '📸 손글씨만 (#58 A) · 교과서 문제 2');
console.log(`${fail ? '❌' : '✅'} 12차시: 확인 ${count}개 (재도전 문항 ${n}개) · 실패 ${fail}`);
if (fail) process.exit(1);
