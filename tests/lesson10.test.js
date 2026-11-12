// 10차시 검증: node tests/lesson10.test.js  (학습과정 10차시 레이드용 v1 · 2026-11-12 「충분조건 · 필요조건 · 필요충분조건」 · 교과서 89~90쪽 · 96쪽 중단원 04)
// (1) 순서 · 칸 · 그림 · #64 꼴  (2) 첫 시도 = 확정표 정답  (3) 재도전 300 시드 × 3 · 소레이드 연습 판 · 형성평가 재도전 = 조건 글을 읽어 진리집합을 따로 계산해 판정
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-10.js', 'lessons/rubrics.js']);
const L = DS.Lessons.get('set-10'), Q = DS.Quiz;
let fail = 0, count = 0;
const check = (c, m) => { count++; if (!c) { fail++; if (fail <= 30) console.error('FAIL:', m); } };

// ── 독립 판정 도구 (차시 파일의 계산을 쓰지 않음): 조건 글 → 참 · 거짓 함수 → 표본 위에서 진리집합 비교 ──
const XS = []; for (let i = -48; i <= 48; i++) XS.push(i / 4); // 실수 x 표본 (−12 ~ 12, 0.25 간격)
const NS = []; for (let i = 1; i <= 360; i++) NS.push(i); // 배수 조건 = 자연수
const AB = []; for (let a = -4; a <= 4; a++) for (let b = -4; b <= 4; b++) AB.push({ a, b });
function cond(s) {
  s = s.trim().replace(/\.$/, '');
  let m;
  if ((m = /^x는 (\d+)의 배수이다$/.exec(s))) { const k = +m[1]; return { dom: 'N', f: (x) => x % k === 0 }; }
  let t = s.replace(/−/g, '-');
  if ((m = /^(\S+) (<|≤) x (<|≤) (\S+)$/.exec(t))) t = `${m[1]} ${m[2]} x && x ${m[3]} ${m[4]}`;
  t = t.replace(/ 이고 /g, ' && ').replace(/ 또는 /g, ' || ').replace(/\|x\|/g, 'ABS(x)').replace(/([abx])²/g, '($1**2)').replace(/([abx])³/g, '($1**3)')
    .replace(/ab/g, '(a*b)').replace(/(\d)([abx])/g, '$1*$2').replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/≠/g, '!=').replace(/(^|[^<>!=])=(?!=)/g, '$1==');
  t = t.replace(/ABS/g, 'Math.abs'); const two = /\b[ab]\b|\(a\*b\)/.test(t.replace(/Math\.abs/g, ''));
  return { dom: two ? 'AB' : 'X', f: two ? new Function('a', 'b', `return ${t};`) : new Function('x', `return ${t};`) };
}
const domOf = (d) => (d === 'N' ? NS.map((x) => [x]) : d === 'AB' ? AB.map((o) => [o.a, o.b]) : XS.map((x) => [x]));
function kindOf(ps, qs) { // p 는 q 이기 위한 무슨 조건 (독립 계산)
  const p = cond(ps), q = cond(qs); if (p.dom !== q.dom) throw new Error(`정의역 다름 ${ps} / ${qs}`);
  const D = domOf(p.dom), pq = D.every((v) => !p.f(...v) || q.f(...v)), qp = D.every((v) => !q.f(...v) || p.f(...v));
  return pq && qp ? '필요충분조건' : pq ? '충분조건' : qp ? '필요조건' : '없음';
}
const assign = (s) => { const o = {}; s.replace(/−/g, '-').split(',').forEach((kv) => { const [k, v] = kv.split('=').map((x) => x.trim()); o[k] = +v; }); return o; };
const holds = (cs, o) => { const c = cond(cs); return c.dom === 'AB' ? c.f(o.a, o.b) : c.f(o.x); };
// 세 조건: 「u 는 v 이기 위한 충분조건」 → U ⊂ V · 「u 는 v 이기 위한 필요조건」 → V ⊂ U → 구체적 집합으로 놓고 명제를 판정
function chainSets(t) {
  const rel = []; t.replace(/([pqr]) [은는] ([pqr]) 이기 위한 (충분|필요)조건/g, (_, u, v, k) => { rel.push(k === '충분' ? [u, v] : [v, u]); });
  const lv = { p: 0, q: 0, r: 0 }; for (let i = 0; i < 4; i++) rel.forEach(([a, b]) => { if (lv[b] <= lv[a]) lv[b] = lv[a] + 1; });
  const order = ['p', 'q', 'r'].sort((x, y) => lv[x] - lv[y]); const UNI = [1, 2, 3, 4], S = {}; order.forEach((x, i) => { S[x] = UNI.slice(0, i + 1); });
  return { rel, order, S, UNI };
}
const propOk = (C, s) => { const m = /^(~?)([pqr]) → (~?)([pqr])$/.exec(s), set = (n, x) => (n ? C.UNI.filter((e) => !C.S[x].includes(e)) : C.S[x]); const A = set(m[1], m[2]), B = set(m[3], m[4]); return A.every((e) => B.includes(e)); };

const ans = (q) => (q.type === 'choice' ? q.choices[q.answerIndex] : null);
const picked = (q) => q.answer.map((i) => q.options[i]);
function gradeOk(q, tag) {
  const r = q.type === 'choice' ? q.answerIndex : q.answer, w = q.type === 'choice' ? (q.answerIndex + 1) % q.choices.length : [];
  check(Q.grade(q, r) === true, `${tag}: 정답 채점`); check(Q.grade(q, w) === false, `${tag}: 오답이 정답 처리됨`);
  if (q.type === 'choice') check(q.answerIndex >= 0 && new Set(q.choices).size === q.choices.length, `${tag}: 보기 중복 · 정답 없음 ${JSON.stringify(q.choices)}`);
}
function verify(q, tag) {
  gradeOk(q, tag);
  const t = q.question.replace(/^\d+\. /, ''), a = ans(q); let m;
  if ((m = /p : (.+?), q : (.+?) 일 때 (?:p ⇒ q 이다\. )?([pq]) 는 ([pq]) 이기 위한 무슨 조건인가\?/.exec(t))) { const P = m[1], Qs = m[2], k = m[3] === 'p' ? kindOf(P, Qs) : kindOf(Qs, P);
    if (/p ⇒ q 이다/.test(t)) check(kindOf(P, Qs) === '충분조건', `${tag}: 「p ⇒ q」 가 한쪽만 참이 아님`);
    check(k !== '없음' && a === k, `${tag}: ${a} (계산 ${k}) ${t}`); return; }
  if ((m = /^\(3\) (.+?) ⇒ (.+?) 이다\. (.+?) 는 (.+?) 이기 위한 무슨 조건인가\?/.exec(t))) { check(kindOf(m[1], m[2]) === '충분조건', `${tag}: ⇒ 한쪽만`); const k = kindOf(m[3], m[4]); check(a === k, `${tag}: (3) ${a} (계산 ${k})`); return; }
  if ((m = /p : (.+?), q : (.+?) 일 때 두 진리집합 P, Q 사이의 포함 관계는\?/.exec(t))) { const k = kindOf(m[1], m[2]); check(a === { 충분조건: 'P ⊂ Q', 필요조건: 'Q ⊂ P', 필요충분조건: 'P = Q' }[k], `${tag}: 포함 관계 ${a}`); return; }
  if ((m = /p : (.+?), q : (.+?) 일 때 「(.+?) 이면 (.+?) 이다\.」 의 반례는\?/.exec(t))) { const good = q.choices.filter((c) => { const o = assign(c); return holds(m[3], o) && !holds(m[4], o); }); check(m[3] === m[2] && m[4] === m[1] && good.length === 1 && good[0] === a, `${tag}: 반례 ${a} ${good}`); return; }
  if (/세 조건 p, q, r 에 대하여 .+ 포함 관계는\?/.test(t)) { const C = chainSets(t); check(C.rel.length === 2 && a === C.order.map((x) => x.toUpperCase()).join(' ⊂ '), `${tag}: 세 조건 ${a}`); return; }
  if (/세 조건 p, q, r 에 대하여 .+ 참인 명제를 모두 고르시오\./.test(t)) { const C = chainSets(t), want = q.options.filter((s) => propOk(C, s)); check(want.length >= 1 && want.length < q.options.length && picked(q).join() === want.join(), `${tag}: 참인 명제 ${picked(q)} (계산 ${want})`); return; }
  check(false, `${tag}: 모르는 꼴 ${t}`);
}

// (1) 순서 · 칸 · 그림 · #64 꼴
check(L.steps.map((s) => s.id).join(',') === 'intro,c1,m1,c2,m2,c3,m3,m4,sum,boss', `레이드 순서 ${L.steps.map((s) => s.id)}`);
check(L.no === 10 && L.theme === '12-skygarden' && DS.ASSETS.dungeons.ids.includes(L.theme), '10차시 · ⚖ 공중 정원 테마');
check(/레이드용 v1/.test(L.sheet) && /11차시/.test(L.next.title), '판 v1 · 다음 = 11차시');
L.steps.forEach((s) => check(L.crops[s.img || s.id] && L.crops[s.img || s.id][0].h > 0.04, `칸 위치 ${s.img || s.id}`));
check(Object.keys(L.monsters).join() === 'm1,m2,m3,m4' && L.monsters.m1.sprite === 'garden:2' && L.monsters.m2.sprite === 'garden:0' && L.monsters.m3.sprite === 'garden:1' && L.monsters.m4.sprite === 'garden:3', '몬스터 그림 (충분 나비 · 천칭 가고일 · 필요 덩굴 · 쌍둥이 구름 정령)');
check(L.boss.sprite === 'gardenboss:0' && DS.ASSETS.monstersGardenBoss.names[0] === '필요충분의 천칭 수호자', '보스 = 필요충분의 천칭 수호자');
check(L.chain.join() === 'm4' && L.monsters.m4.evalQ, 'm4 = ⚔ 소레이드 (중단원 04)');
check(JSON.stringify(JSON.parse(JSON.stringify(L.DATA))) === JSON.stringify(L.DATA), '📦 #64 DATA = JSON 그대로');
check(Object.values(L.DATA.monsters).every((M) => L.GEN[M.book.gen] && L.GEN[M.retry.gen]), '📦 생성기 = 데이터 쪽 이름');
check(L.boss.tags.every((t) => L.steps.some((s) => s.kind === 'concept' && s.id === t)), '보스 태그 = 이 차시 개념');

// (2) 첫 시도 = 확정표 (학습지 · 교과서 답)
const first = (mid) => L.items(mid, 'seed', 0);
const A = (q) => (q.type === 'multi' ? picked(q).join(',') : ans(q));
check(first('m1').map(A).join('|') === '충분조건|필요조건|필요조건', `문제 1 ${first('m1').map(A).join('|')}`);
check(/^\(3\) x = 2 ⇒ x² = 4 이다\. x² = 4 는 x = 2 이기 위한/.test(first('m1')[2].question), '문제 1 (3) = x = 2 ⇒ x² = 4');
check(first('m2').map(A).join('|') === '필요조건|필요충분조건|충분조건|필요충분조건', `문제 2 (예제 2 ⑴ 필요 ⑵ 필요충분 · 문제 4 ⑴ 충분 ⑵ 필요충분) ${first('m2').map(A).join('|')}`);
check(first('m3').map(A).join('|') === 'R ⊂ Q ⊂ P|r → p,~q → ~r' && first('m3')[1].options.join() === 'r → p,q → ~p,~q → ~r,~p → r', `문제 3 생각 넓히기 ${first('m3').map(A).join('|')}`);
check(/p 는 q 이기 위한 필요조건이고, r 은 q 이기 위한 충분조건/.test(first('m3')[0].question), '문제 3 = 교과서 문장 그대로');
const ch4 = L.chainItems('m4', 'seed', 0);
check(ch4.map(A).join('|') === 'Q ⊂ P|필요조건|a = 1, b = −1|충분조건|필요충분조건', `문제 4 소레이드 (명제 04 답 필요 · 충분 · 필요충분) ${ch4.map(A).join('|')}`);
check(/p : x ≤ 1, q : −3 ≤ x ≤ 0/.test(ch4[0].question) && /p : a = b, q : a² = b²/.test(ch4[2].question) && /p : \|x\| ≤ 1, q : −1 ≤ x ≤ 1/.test(ch4[4].question), '소레이드 첫 판 = 명제 04 원문 숫자');
check(ch4[1].why && ch4[1].why.text === '∵ q ⇒ p 이면 p 는 q 이기 위한 필요조건이다.' && ch4.filter((q) => q.why).length === 1, '💡 근거 줄 = 졸개 ② 뒤 하나');
check(ch4.every((q) => q.say) && /필요충분조건이다\.$/.test(ch4[4].say), '나의 풀이 문장');
check(ch4.every((q) => !/[○✕]|O\/X|가능한가/.test(q.question)), 'S5 O/X 없음');
const B = L.boss.sets[1].map(A);
check(B.join('|') === '필요조건|충분조건|필요충분조건|P ⊂ Q ⊂ R', `형성평가 ${B.join('|')}`);
check(/q 는 p 이기 위한 필요조건이고, r 은 q 이기 위한 필요조건/.test(L.boss.sets[1][3].question), '형성평가 4 = 학습지 문장');

// (3) 첫 시도 + 재도전 독립 검산
for (const mid of Object.keys(L.monsters)) first(mid).forEach((q, i) => verify(q, `${mid}#0(${i})`));
ch4.forEach((q, i) => verify(q, `m4 소레이드 첫 판 (${i})`));
L.boss.sets[1].forEach((q, i) => verify(q, `형성평가 ${i + 1}`)); L.boss.sets[2].forEach((q, i) => verify(q, `형성평가 세트2 ${i + 1}`));
let n = 0;
for (let s = 0; s < 300; s++) {
  for (let a = 1; a <= 3; a++) for (const mid of Object.keys(L.monsters)) L.items(mid, `s${s}`, a).forEach((q, i) => { n++; verify(q, `${mid} s${s} a${a} (${i})`); });
  for (let p = 1; p <= 3; p++) L.chainItems('m4', `s${s}`, p).forEach((q, i) => { n++; verify(q, `m4 소레이드 s${s} p${p} (${i})`); check(/^두 조건 p, q 가 다음과 같을 때/.test(q.problem || ''), '연습 판 = 원문 카드'); });
  for (let i = 0; i < 4; i++) { const q = L.boss.make(i, 1 + (s % 3), DS.Rng(`b${s}|${i}`)); n++; check(q.question.startsWith(`${i + 1}. `), `형성 ${i + 1} 번호`); verify(q, `형성평가 ${i + 1} s${s}`); }
}
for (const mid of Object.keys(L.monsters)) { let sameAsBook = 0; for (let s = 0; s < 60; s++) if (L.items(mid, `d${s}`, 1).map((q) => q.question).join() === first(mid).map((q) => q.question).join()) sameAsBook++; check(sameAsBook === 0, `${mid}: 재도전이 학습지와 같음 ${sameAsBook}`); }
check(JSON.stringify(L.items('m2', 'x', 1)) === JSON.stringify(L.items('m2', 'x', 1)), '같은 시드는 같은 문제');
// 판정기 자체 점검 (교과서 답)
check(kindOf('x는 3의 배수이다.', 'x는 9의 배수이다.') === '필요조건' && kindOf('x² ≤ 25', '|x| ≤ 5') === '필요충분조건' && kindOf('a = 0 이고 b = 0', 'ab = 0') === '충분조건' && kindOf('2x − 1 < 5', '−1 < 2 − x') === '필요충분조건', '판정기 = 교과서 답');
check(kindOf('x ≤ 1', '−3 ≤ x ≤ 0') === '필요조건' && kindOf('a = b', 'a² = b²') === '충분조건' && kindOf('|x| ≤ 1', '−1 ≤ x ≤ 1') === '필요충분조건', '판정기 = 명제 04 답');

// (4) 📸 서술형 채점 기준 (m4)
const RB = ((DS.Rubrics || {})['set-10'] || {}).m4;
check(RB && RB.on && RB.raid && RB.total === 4 && RB.steps.length === 4 && RB.steps.reduce((s, x) => s + x.pts, 0) === 4 && RB.pass === 3, '📸 채점 기준 4단계 · 통과 3');
check(RB && /손글씨/.test(RB.note || ''), '📸 손글씨만 (#58 A)');

console.log(`${fail ? '❌' : '✅'} 10차시: 확인 ${count}개 (재도전 문항 ${n}개) · 실패 ${fail}`);
if (fail) process.exit(1);
