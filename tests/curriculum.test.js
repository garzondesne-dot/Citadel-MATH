// 성취기준(A) · 오개념(B) 검증: node tests/curriculum.test.js  (2026-11-03 A+B)
// (1) 모든 차시의 모든 개념 칸이 성취기준에 연결 (review 는 제외) · 코드가 LIST 에 있음
// (2) 형성평가 오답 꼬리표: 문항 모양과 맞음 (보기 번호는 범위 안 · 정답 보기에는 꼬리표 없음 · 숫자 꼬리표는 정답이 아님) · 코드는 사전에 있음
// (3) 자동 규칙: 부분집합 모두 고르기 ∅ M03 · 자기 자신 M04 · 아닌 것 M02 · 기호 고르기 ∈↔⊂ M01 · ⊂↔⊄ M02 · =↔≠ M06 · 부분집합 ∅ 빠뜨림 M03 · 자기 자신 빠뜨림 M04 · 2ⁿ ↔ 2ⁿ−1 M04
// (4) 누적 · 합치기 · 한 줄 고르기
const load = require('./load');
const SETS = ['set-02', 'set-03', 'set-04', 'set-05', 'set-06'];
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', ...SETS.map((s) => `lessons/${s}.js`), 'lessons/curriculum.js']);
const S = DS.Standards, M = DS.Mis;
let fail = 0, count = 0;
const check = (c, m) => { count++; if (!c) { fail++; if (fail <= 40) console.error('FAIL:', m); } };

// (1) 성취기준 연결
for (const id of SETS) {
  const L = DS.Lessons.get(id); check(L, `${id} 차시 있음`); if (!L) continue;
  const concepts = new Set((L.steps || []).filter((s) => s.kind === 'concept').map((s) => s.id));
  (L.boss.tags || []).forEach((c) => concepts.add(c));
  concepts.delete('review');
  for (const c of concepts) { const sid = S.of(id, c, L.no); check(sid && S.get(sid), `${id}/${c} → 성취기준 (${sid})`); }
  check(S.of(id, 'review', L.no) === null, `${id} 복습은 성취기준 없음`);
}
check(S.LIST.every((s) => /^\[10공수2-02-0\d\]$/.test(s.code)), '코드 모양');
check(S.level(85) === '도달' && S.level(80) === '도달' && S.level(79) === '근접' && S.level(50) === '근접' && S.level(49) === '미도달' && S.level(null) === '', '도달 구간');
check(S.of('set-99', 'c1', 8) === '02-04', '새 차시 기본값(차시 번호)');

// (2) 형성평가 꼬리표
for (const id of SETS) {
  const L = DS.Lessons.get(id), B = M.BOSS[id];
  check(B, `${id} 꼬리표 표 있음`); if (!B) continue;
  for (const k of [1, 2]) {
    const qs = L.boss.sets[k], tags = B[k] || [];
    check(tags.length <= qs.length, `${id} 세트${k} 꼬리표 수 ${tags.length} ≤ 문항 ${qs.length}`);
    tags.forEach((t, i) => {
      if (!t) return; const q = qs[i], where = `${id} 세트${k} ${i + 1}번(${q.type})`;
      Object.entries(t).forEach(([key, v]) => {
        if (key === 'any') return check(M.CODES[v], `${where} any 코드 ${v}`);
        if (key === 'num') {
          check(q.type === 'number', `${where} 숫자 꼬리표는 숫자 문항에만`);
          return Object.entries(v).forEach(([n, c]) => { check(M.CODES[c], `${where} ${c}`); check(Number(n) !== Number(q.answer), `${where} 숫자 꼬리표 ${n} 는 정답이 아님`); });
        }
        check(q.type === 'choice', `${where} 보기 꼬리표는 고르기 문항에만`);
        const ix = Number(key);
        check(Number.isInteger(ix) && ix >= 0 && ix < (q.choices || []).length, `${where} 보기 ${key} 범위`);
        check(ix !== q.answerIndex, `${where} 보기 ${key} 는 정답 보기 아님 (정답 ${q.answerIndex}: ${(q.choices || [])[q.answerIndex]})`);
        check(M.CODES[v], `${where} 코드 ${v}`);
      });
    });
  }
}
// 꼬리표가 실제로 분류에 쓰임
{
  const L = DS.Lessons.get('set-03'), k = 1, i = 4, q = L.boss.sets[k][i];
  if (q && q.type === 'number') check(M.classify(q, 4, M.bossTag('set-03', k, i)).includes('M04'), 'set-03 숫자 꼬리표 4 → M04');
  const wrong = (q2) => [0, 1, 2, 3].find((j) => j !== q2.answerIndex && j < q2.choices.length);
  const q4 = DS.Lessons.get('set-04').boss.sets[1][0], w = Object.keys(M.BOSS['set-04'][1][0]).map(Number).find((j) => j !== q4.answerIndex);
  check(M.classify(q4, w, M.bossTag('set-04', 1, 0)).includes('M08'), 'set-04 오답 보기 → M08');
  void wrong;
}

// (3) 자동 규칙
const blanks = (answers) => ({ type: 'blanks', items: answers.map((a) => ({ left: 'A', right: 'B', answer: a })) });
check(M.classify(blanks(['⊂']), ['∈']).join() === 'M01', '∈ ↔ ⊂ → M01');
check(M.classify(blanks(['∉']), ['⊄']).join() === 'M01', '⊄ ↔ ∉ → M01');
check(M.classify(blanks(['⊂']), ['⊄']).join() === 'M02', '⊂ ↔ ⊄ → M02');
check(M.classify(blanks(['=']), ['≠']).join() === 'M06', '= ↔ ≠ → M06');
check(M.classify(blanks(['⊂', '∈']), ['⊂', '∈']).length === 0, '맞은 칸은 분류 없음');
check(M.classify(blanks(['∈', '⊂']), ['⊂', '⊄']).sort().join() === 'M01,M02', '여러 칸 → 여러 코드');
const sub = { type: 'subsets', base: [1, 2] };
check(M.classify(sub, [[1], [2], [1, 2]]).join() === 'M03', '∅ 빠뜨림 → M03');
check(M.classify(sub, [[], [1], [2]]).join() === 'M04', '자기 자신 빠뜨림 → M04');
check(M.classify(sub, [[1], [2]]).sort().join() === 'M03,M04', '둘 다 빠뜨림');
{ const L3 = DS.Lessons.get('set-03'), qs = L3.items('m3', 'seed', 0);
  const q0 = qs.find((q) => q.type === 'multi' && q.check.size === 0), q3 = qs.find((q) => q.type === 'multi' && q.check.size === 3), q1 = qs.find((q) => q.type === 'multi' && q.check.size === 1);
  check(M.classify(q0, []).join() === 'M03', '부분집합 고르기: ∅ 빠뜨림 → M03');
  check(M.classify(q3, []).join() === 'M04', '부분집합 고르기: 자기 자신 빠뜨림 → M04');
  const bad = q1.check.options.findIndex((o) => o.some((x) => !q1.check.base.includes(x)));
  check(M.classify(q1, [...q1.answer, bad]).join() === 'M02', '부분집합 고르기: 부분집합 아닌 것 고름 → M02'); }
check(M.classify({ type: 'number', answer: 8 }, 7).join() === 'M04', '2ⁿ → 2ⁿ−1 → M04');
check(M.classify({ type: 'number', answer: 7 }, 8).join() === 'M04', '2ⁿ−1 → 2ⁿ → M04');
check(M.classify({ type: 'number', answer: 5 }, 4).length === 0, '그 밖의 숫자 오답은 분류 없음');
check(M.classify({ type: 'choice', options: ['a', 'b'], answerIndex: 0 }, 1).length === 0, '꼬리표 없는 고르기 → 분류 없음');
check(M.classify(null, 1).length === 0 && M.classify(blanks(['⊂']), null).length === 0, '빈 입력');

// (4) 누적 · 합치기 · 한 줄
const acc = {}; M.add(acc, ['M01'], false); M.add(acc, ['M01'], true); M.add(acc, ['M03'], true);
check(JSON.stringify(acc) === JSON.stringify({ M01: [2, 1], M03: [1, 1] }), '누적 ' + JSON.stringify(acc));
const mg = M.merge(M.merge({}, acc), { M01: [1, 0], M08: [2, 2] });
check(mg.M01[0] === 3 && mg.M01[1] === 1 && mg.M08[0] === 2 && acc.M01[0] === 2, '합치기 (원본 그대로)');
check(M.top(mg, 1)[0].code === 'M01', '한 줄: 못 고친 것 먼저');
check(M.top({ M99: [5, 0] }).length === 0, '모르는 코드는 안 보임');
check(Object.values(M.CODES).every((c) => c.name && c.kid && c.seteuk), '사전 문구');

console.log(fail ? `❌ ${fail}/${count} 실패` : `✅ 성취기준 · 오개념 ${count}개 확인`);
process.exit(fail ? 1 : 0);
