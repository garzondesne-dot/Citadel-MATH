// 8차시 검증: node tests/lesson8.test.js  (학습과정 8차시 레이드용 v5 · 2026-11-10 #60 「명제와 조건」 · 교과서 82~84쪽 · v1 의 ‘모든’ · ‘어떤’ = 9차시 · 그 검산 함수는 아래에 그대로 둠)
// (1) 레이드 순서: 생각 열기 → 개념1 → 문제1 → 개념2 → 문제2 → 개념3 → 문제3 → 개념4 → 문제4 → 개념5 → 문제5 → 형성평가(부정의 수정 여왕)
// (2) 첫 시도 = 학습지 ★ 칸 · 정답 = 방향 방 확정표(요청 #5) 그대로 아래에 따로 적음
// (3) 재도전 시드 300개 × 3번: 문제 글에서 U · 조건 · 문장을 직접 읽어 따로 판정 (차시 파일의 계산 결과를 쓰지 않음)
// (4) 형성평가 6문항 + 재도전 생성기 L.boss.make 독립 검산
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-08.js']);
const L = DS.Lessons.get('set-08'), Q = DS.Quiz;
let fail = 0, count = 0;
const check = (c, m) => { count++; if (!c) { fail++; if (fail <= 30) console.error('FAIL:', m); } };

// ── 독립 판정 도구 ─────────────────────────────────────────
const parseSet = (s) => (s.trim() === '∅' ? [] : s.replace(/[{}]/g, '').split(',').map((t) => t.trim()).filter(Boolean).map(Number));
const readU = (q) => parseSet(/U = (\{[^}]*\})/.exec(q)[1]);
const chosen = (q) => q.answer.map((i) => Number(q.options[i])).sort((a, b) => a - b);
const right = (q) => (q.type === 'choice' ? q.choices[q.answerIndex] : null);
const same = (A, B) => A.length === B.length && A.every((x, i) => x === B[i]);
const quote = (q) => /「([^」]*)」/.exec(q)[1];
const opf = { '>': (x, c) => x > c, '<': (x, c) => x < c, '≥': (x, c) => x >= c, '≤': (x, c) => x <= c, '=': (x, c) => x === c };
const NOT = { '>': '≤', '<': '≥', '≥': '<', '≤': '>' };
const iga = (n) => ({ 2: '가', 4: '가', 5: '가', 9: '가' })[n % 10] || '이'; // 2 이 · 4 사 · 5 오 · 9 구
// 문장의 참 · 거짓 (교과서 뜻 · 차시 파일과 따로). null = 명제 아님
const TRUTH = {
  'π는 유리수이다.': false, '섬진강은 아름답다.': null, '4 − 1 = 3': true, '정삼각형은 이등변삼각형이다.': true,
  '√2는 무리수이다.': true, '2는 짝수이다.': true, '정사각형은 직사각형이다.': true, '6 × 7 = 42': true, '12는 3의 배수이다.': true,
  '9는 소수이다.': false, '3 + 5 = 9': false, '1은 소수이다.': false, '모든 직사각형은 정사각형이다.': false, '7은 짝수이다.': false,
  '김치는 맛있다.': null, '수학은 재미있다.': null, '우리 학교 운동장은 넓다.': null, '그 영화는 감동적이다.': null, '봄 하늘은 아름답다.': null, '그 노래는 좋은 노래이다.': null,
  '2 + 3 = 6': false, '7은 소수이다.': true, '모든 정사각형은 직사각형이다.': true, '9는 3의 배수이다.': true, '3 × 4 = 13': false,
};
// 사각형 (평행 대변 쌍 · 직각 · 네 변 같음) — 「모든 X 는 Y 이다」 참 거짓
const SHAPES = []; [0, 1, 2].forEach((pp) => [false, true].forEach((rt) => [false, true].forEach((eq) => { if ((rt || eq) && pp !== 2) return; SHAPES.push({ pp, rt, eq }); })));
const FAM = { 평행사변형: (q) => q.pp === 2, 직사각형: (q) => q.rt, 마름모: (q) => q.eq, 정사각형: (q) => q.rt && q.eq };
const allIs = (x, y) => SHAPES.every((q) => !FAM[x](q) || FAM[y](q));
// 「모든 ~이다」의 부정 = 「어떤 ~가 아니다」 · 「어떤 ~이다」의 부정 = 「모든 ~가 아니다」 (말 바꾸기 표 · 따로 적음)
const NEGS = {
  '우리 반 모든 학생은 지각하지 않았다.': '우리 반 어떤 학생은 지각했다.', '모든 학생은 휴대폰이 있다.': '어떤 학생은 휴대폰이 없다.',
  '모든 고양이는 생선을 좋아한다.': '어떤 고양이는 생선을 좋아하지 않는다.', '어떤 학생은 수학을 좋아한다.': '모든 학생은 수학을 좋아하지 않는다.',
  '모든 정사각형은 마름모이다.': '어떤 정사각형은 마름모가 아니다.', '모든 학생은 안경을 썼다.': '어떤 학생은 안경을 쓰지 않았다.',
  '모든 마름모는 정사각형이다.': '어떤 마름모는 정사각형이 아니다.', '모든 직사각형은 정사각형이다.': '어떤 직사각형은 정사각형이 아니다.',
  '모든 정사각형은 직사각형이다.': '어떤 정사각형은 직사각형이 아니다.', '모든 평행사변형은 마름모이다.': '어떤 평행사변형은 마름모가 아니다.',
};
const KIND = (t) => (t === null ? '명제가 아니다' : t ? '명제 · 참' : '명제 · 거짓');

function gradeOk(q, tag) {
  const r = q.type === 'choice' ? q.answerIndex : q.answer, w = q.type === 'choice' ? (q.answerIndex + 1) % q.choices.length : q.answer.length ? [] : [0];
  check(Q.grade(q, r) === true, `${tag}: 정답 채점`); check(Q.grade(q, w) === false, `${tag}: 오답이 정답 처리됨`);
  if (q.type === 'choice') check(q.answerIndex >= 0 && new Set(q.choices).size === q.choices.length && q.choices.length >= 2, `${tag}: 보기 중복 · 정답 없음 ${JSON.stringify(q.choices)}`);
  if (q.type === 'multi') check(q.answer.length > 0, `${tag}: 고를 원소가 없음`);
}
// 진리집합 조건 읽기: 「x는 k의 배수」 · 「x + a = b」 · 「x는 m의 약수」 · 「x op c」 · 「x는 홀수/짝수/3의 배수」
function truthSet(U, cond) {
  let m;
  if ((m = /x는 (\d+)의 배수/.exec(cond))) return U.filter((x) => x % Number(m[1]) === 0);
  if ((m = /x는 (\d+)의 약수/.exec(cond))) return U.filter((x) => Number(m[1]) % x === 0);
  if (/x는 홀수/.test(cond)) return U.filter((x) => x % 2 === 1);
  if (/x는 짝수/.test(cond)) return U.filter((x) => x % 2 === 0);
  if ((m = /x \+ (\d+) = (\d+)/.exec(cond))) return U.filter((x) => x + Number(m[1]) === Number(m[2]));
  if ((m = /x² ([><≥≤=]) (\d+)/.exec(cond))) return U.filter((x) => opf[m[1]](x * x, Number(m[2])));
  if ((m = /x ([><≥≤=]) (\d+)/.exec(cond))) return U.filter((x) => opf[m[1]](x, Number(m[2])));
  throw new Error('모르는 조건 ' + cond);
}
// 실수 범위 이차식 x² ± bx ± c (= 0 이 되는 실수가 있나 · 늘 > 0 인가)
function quad(s) { const m = /x² (?:([+−]) (\d+)x )?([+−]) (\d+)/.exec(s); const b = m[1] ? (m[1] === '−' ? -1 : 1) * Number(m[2]) : 0, c = (m[3] === '−' ? -1 : 1) * Number(m[4]); return b * b - 4 * c; }

function verify(mid, q, tag) {
  gradeOk(q, tag);
  const t = q.question, ans = right(q);
  if (/는 명제인가\?/.test(t)) { const s = quote(t); check(s in TRUTH, `${tag}: 표에 없는 문장 ${s}`); check(ans === KIND(TRUTH[s]), `${tag}: 명제 판별 ${s} → ${ans}`); return; }
  let m;
  if ((m = /「(\d+)의 약수의 개수는 (\d+)이다\.」 의 부정은\?/.exec(t))) { check(ans === `${m[1]}의 약수의 개수는 ${m[2]}${iga(Number(m[2]))} 아니다.`, `${tag}: 약수 부정 ${ans}`); return; }
  if ((m = /「(\d+)의 약수의 개수는 (\d+)[이가] 아니다\.」 는 참인가/.exec(t))) { const n = Number(m[1]); let d = 0; for (let i = 1; i <= n; i++) if (n % i === 0) d++; check(ans === (d !== Number(m[2]) ? '참' : '거짓'), `${tag}: 약수 개수 ${n} → ${d}`); return; }
  if (q.type === 'multi' && /진리집합 [PQR] 의|일 때 P 의/.test(t)) { const U = readU(t), cond = /: (x.*?) (?:의 진리집합|일 때)/.exec(t)[1]; check(same(chosen(q), truthSet(U, cond)), `${tag}: 진리집합 ${cond}`); return; }
  // v5 (#60): 부등식 부정 · U 에 따라 바뀌는 진리집합 · 자연수 범위 x² 부정
  if ((m = /「(\d+) ([≤<≥>]) (\d+) \+ √(\d+)」 의 부정은\?/.exec(t))) { check(ans === `${m[1]} ${NOT[m[2]]} ${m[3]} + √${m[4]}`, `${tag}: 부등식 부정 ${ans}`); return; }
  if ((m = /「(\d+) ([≤<≥>]) (\d+) \+ √(\d+)」 는 참인가/.exec(t))) { const v = opf[m[2]](Number(m[1]), Number(m[3]) + Math.sqrt(Number(m[4]))); check(ans === (v ? '참' : '거짓'), `${tag}: 부등식 참거짓 ${m[0]}`); return; }
  const roots = (N) => { const r = Math.round(Math.sqrt(N)); return r * r === N ? r : null; }, fmt = (A) => (A.length ? `{${A.map((x) => String(x).replace('-', '−')).join(', ')}}` : '∅');
  if ((m = /U = (자연수|정수) 전체의 집합일 때 조건 p : x² = (\d+) 의 진리집합 P 는\?/.exec(t))) { const r = roots(Number(m[2])); check(r && ans === (m[1] === '자연수' ? fmt([r]) : fmt([-r, r])), `${tag}: U 에 따라 ${m[0]} → ${ans}`); return; }
  if ((m = /p : x² = (\d+) 의 진리집합을 U = 자연수 전체의 집합, U = 정수 전체의 집합일 때 각각 고르면\?/.exec(t))) { const r = roots(Number(m[1])); check(r && ans === `${fmt([r])} / ${fmt([-r, r])}`, `${tag}: 형성 3 ${ans}`); return; }
  if ((m = /U 가 자연수 전체의 집합일 때, 조건 p : x² > (\d+) 의 부정 ~p 의 진리집합은\?/.exec(t))) { const c = Number(m[1]), P = []; for (let x = 1; x * x <= c; x++) P.push(x); check(ans === fmt(P), `${tag}: x² > ${c} 의 부정 → ${ans}`); return; }
  if (q.type === 'multi' && /부정 ~[pqr] 의 진리집합|일 때 ~p 의 진리집합/.test(t)) { const U = readU(t), cond = /: (x.*?) (?:의 부정|일 때)/.exec(t)[1]; const P = truthSet(U, cond); check(same(chosen(q), U.filter((x) => !P.includes(x))), `${tag}: ~p 진리집합 ${cond}`); return; }
  if ((m = /「x = (\d+) 또는 x = (\d+)」 의 부정은\?/.exec(t))) { check(ans === `x ≠ ${m[1]} 그리고 x ≠ ${m[2]}`, `${tag}: 또는의 부정 ${ans}`); return; }
  if ((m = /「x ([><≥≤]) (\d+) 그리고 y \1 \2」 의 부정은\?/.exec(t))) { check(ans === `x ${NOT[m[1]]} ${m[2]} 또는 y ${NOT[m[1]]} ${m[2]}`, `${tag}: 그리고의 부정 ${ans}`); return; }
  if ((m = /U = \{[^}]*\} 일 때 「(모든|어떤) x에 대하여 (.*)이다\.」 의 반례가 되는/.exec(t))) { const U = readU(t), P = truthSet(U, m[2]); check(same(chosen(q), U.filter((x) => !P.includes(x))), `${tag}: 반례 ${m[2]}`); return; }
  if ((m = /U = \{[^}]*\} 일 때 「(모든|어떤) x에 대하여 (.*)이다\.」/.exec(t))) { const U = readU(t), P = truthSet(U, m[2]), v = m[1] === '모든' ? P.length === U.length : P.length > 0; check(ans === (v ? '참' : '거짓'), `${tag}: ${m[1]} ${m[2]} → ${ans}`); return; }
  if (/「모든 실수 x에 대하여 \|x\| ≥ 0이다\.」/.test(t)) { check(ans === '참', `${tag}: |x| ≥ 0`); return; }
  if ((m = /「어떤 실수 x에 대하여 (x².*) = 0이다\.」/.exec(t))) { check(ans === (quad(m[1]) >= 0 ? '참' : '거짓'), `${tag}: 어떤 실수 ${m[1]} = 0`); return; }
  if ((m = /「모든 실수 x에 대하여 (x².*) > 0이다\.」/.exec(t))) { check(ans === (quad(m[1]) < 0 ? '참' : '거짓'), `${tag}: 모든 실수 ${m[1]} > 0`); return; }
  if ((m = /「(모든|어떤) (실수|자연수) x에 대하여 (x(?: \+ \d+)?) ([><≥≤]) (\d+)이다\.」 의 부정은\?/.exec(t))) { check(ans === `${m[1] === '모든' ? '어떤' : '모든'} ${m[2]} x에 대하여 ${m[3]} ${NOT[m[4]]} ${m[5]}이다.`, `${tag}: 부등식 부정 ${ans}`); check(!/x \+ 0/.test(t), `${tag}: x + 0 꼴`); return; }
  if ((m = /「(어떤 (\S+?)[은는] (\S+?)[이가] 아니다)\.」 는 참인가/.exec(t))) { check(m[2] in FAM && m[3] in FAM, `${tag}: 모르는 사각형 ${m[1]}`); check(ans === (!allIs(m[2], m[3]) ? '참' : '거짓'), `${tag}: 사각형 부정 ${m[1]}`); return; }
  if ((m = /「(.*)」 의 부정은\?/.exec(t)) && m[1] in NEGS) { check(ans === NEGS[m[1]], `${tag}: 문장 부정 ${m[1]} → ${ans}`); check(!q.choices.some((c) => c !== ans && c === m[1]), `${tag}: 원래 문장이 보기에`); return; }
  if (/명제가 아닌 것은\?/.test(t)) { const np = q.choices.filter((c) => TRUTH[c] === null); check(np.length === 1 && np[0] === ans, `${tag}: 명제 아닌 것 ${ans}`); q.choices.forEach((c) => check(c in TRUTH, `${tag}: 표에 없는 보기 ${c}`)); return; }
  check(false, `${tag}: 모르는 꼴 ${t}`);
}

// (1) 순서 · 칸
const order = L.steps.map((s) => s.id).join(',');
check(order === 'intro,c1,m1,c2,m2,m3,c3,m4,boss', `레이드 순서 (v5) ${order}`);
check(L.steps[0].kind === 'intro' && L.steps[0].img === 'review' && L.crops.review, '도입 = 🔁 전시 확인 그림 (crops review)');
check(/레이드용 v5/.test(L.sheet) && /모든/.test(L.next.title), `판 v5 · 다음 = 9차시 모든과 어떤 (${L.sheet} · ${L.next.title})`);
check(L.KEEP9 && L.KEEP9.m4 && L.KEEP9.m5 && L.KEEP9.c4 && L.KEEP9.c5 && /v08-42/.test(L.KEEP9.video), '‘모든’과 ‘어떤’ = 9차시로 보관 (버리지 않음)');
check(L.monsters.m1.sprite === 'mirror:0' && L.monsters.m2.sprite === 'mirror:1' && L.monsters.m3.sprite === 'mirror:3' && L.monsters.m4.sprite === 'mirror:2', '몬스터 그림 = 거울 박쥐 · 반사 골렘 · 수정 광부 유령 · 뒤집힌 거미');
check(DS.ASSETS.monstersMirror.names[3] === '수정 광부 유령' && DS.ASSETS.monstersMirror.names[2] === '뒤집힌 거미', '배치표 이름');
check(L.no === 8 && L.theme === '04-mine' && ['c1', 'c2', 'c3', 'm1', 'm2', 'm3', 'm4'].every((k) => /^assets\/video\/v08-4[012](-v[0-9]+)?\.mp4$/.test(L.videos[k]) && require('fs').existsSync(require('path').join(__dirname, '..', L.videos[k]))), '8차시 · 04 광산 · 영상 40~42 연결 (파일 있음)');
L.steps.forEach((s) => check(L.crops[s.img || s.id] && L.crops[s.img || s.id][0].h > 0.04, `칸 위치 ${s.img || s.id}`));
check(DS.ASSETS.dungeons.ids.includes(L.theme), '테마가 배치표에 있음');
const [sk, si] = L.boss.sprite.split(':'); check(sk === 'mirrorboss8' && DS.ASSETS.monstersMirrorBoss8 && DS.ASSETS.monstersMirrorBoss8.names[0] === '부정의 수정 여왕' && si === '0', '보스 = 부정의 수정 여왕 (mirrorboss8:0)');
check(/부정의 수정 여왕/.test(L.boss.title), '보스 이름');
Object.values(L.monsters).forEach((m) => check(/^mirror:[0-4]$/.test(m.sprite), `몬스터 그림 ${m.sprite}`)); check(Object.keys(L.monsters).join() === 'm1,m2,m3,m4', '몬스터 4');

// (2) 첫 시도 = 확정표 정답
const first = (mid) => L.items(mid, 'seed', 0);
const A = (mid) => first(mid).map((q) => (q.type === 'multi' ? chosen(q).join(',') : right(q)));
check(A('m1').join('|') === '명제 · 거짓|명제가 아니다|명제 · 참|명제 · 참|15의 약수의 개수는 3이 아니다.|참|2 > 1 + √2|거짓', `문제 1 · 2 ${A('m1').join('|')}`);
check(A('m2').join('|') === '3,6,9|5|1,2,3,6', `문제 3 ${A('m2').join('|')}`);
check(A('m3').join('|') === '{2}|{−2, 2}', `문제 4 ${A('m3').join('|')}`);
check(A('m4').join('|') === '2,4,6|1,2,3,4|1,3,4,5,6|{1, 2, 3}', `문제 5 · 6 ${A('m4').join('|')}`);
const B1 = L.boss.sets[1].map((q) => (q.type === 'multi' ? chosen(q).join(',') : right(q)));
check(B1.join('|') === '수학은 재미있다.|1,2,4|{3} / {−3, 3}|1,2', `형성평가 ${B1.join('|')}`);
check(L.boss.sets[1][0].answerIndex === 2, '형성 1 = ③');
check(first('m1')[6].choices.includes('2 ≥ 1 + √2') && first('m1')[6].choices.includes('2 < 1 + √2'), '오개념 보기: 부등호 반대 · 등호 빠짐');
check(first('m3')[0].choices.includes('{−2, 2}') && first('m3')[1].choices.includes('{2}'), '오개념 보기: U 를 안 봄');
check(first('m4')[3].choices.includes('{1, 2, 3, 4}'), '오개념 보기: x² ≤ 10 에 4 넣음');

// (3) 첫 시도 + 재도전 독립 검산
for (const mid of Object.keys(L.monsters)) first(mid).forEach((q, i) => verify(mid, q, `${mid}#0(${i})`));
L.boss.sets[1].forEach((q, i) => verify('boss', q, `형성평가 ${i + 1}`));
let n = 0;
for (let s = 0; s < 300; s++) for (let a = 1; a <= 3; a++) for (const mid of Object.keys(L.monsters)) L.items(mid, `s${s}`, a).forEach((q, i) => { n++; verify(mid, q, `${mid} s${s} a${a} (${i})`); });
check(JSON.stringify(L.items('m2', 'x', 1)) === JSON.stringify(L.items('m2', 'x', 1)), '같은 시드는 같은 문제');
for (const mid of Object.keys(L.monsters)) { let sameAsBook = 0; for (let s = 0; s < 60; s++) if (L.items(mid, `d${s}`, 1).map((q) => q.question).join() === first(mid).map((q) => q.question).join()) sameAsBook++; check(sameAsBook === 0, `${mid}: 재도전에 학습지 그대로가 나옴 ${sameAsBook}`); }

// (4) 형성평가 재도전
check(L.boss.items === 4 && L.boss.hpItems === 4 && L.boss.sets[1].length === 4 && L.boss.sets[2].length === 4, '형성평가 4문항 (v5)');
check(L.boss.tags.every((t) => L.steps.some((s) => s.kind === 'concept' && s.id === t)), '보스 태그 = 이 차시 개념');
for (let s = 0; s < 300; s++) for (let i = 0; i < 4; i++) { const q = L.boss.make(i, 1 + (s % 3), DS.Rng(`b${s}|${i}`)); n++; check(q.question.startsWith(`${i + 1}. `), `형성 ${i + 1} 번호`); verify('boss', q, `형성평가 ${i + 1} s${s}`); }

console.log(`${fail ? '❌' : '✅'} 8차시: 확인 ${count}개 (재도전 문항 ${n}개) · 실패 ${fail}`);
if (fail) process.exit(1);
