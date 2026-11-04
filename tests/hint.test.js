// 💡 그림 힌트 검산 (v0.9.7.4): 5 · 6차시 집합 문제마다 그림이 나오고, 원소가 모두 맞는 칸에 한 번씩 · 명제 문제는 그림 없음 · 보스는 부르는 쪽에서 막음 — node tests/hint.test.js
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/hint.js', 'js/engine/lessons.js', 'lessons/set-05.js', 'lessons/set-06.js']);
let fail = 0, count = 0, figs = 0;
const check = (c, m) => { count++; if (!c) { fail++; if (fail <= 20) console.error('FAIL:', m); } };
const want = { 'set-05': { m1: 1, m2: 1, m3: 1, m5: 1 }, 'set-06': { m1: 1, m2: 1, m3: 1, m6: 1, b1: 1, m4: 0, m42: 0, m5: 0 } };
for (const [lid, mons] of Object.entries(want)) {
  const L = DS.Lessons.get(lid);
  for (const [mid, has] of Object.entries(mons)) for (let s = 0; s < 60; s++) for (const a of [0, 1, 2]) L.items(mid, `h${s}`, a).forEach((q, i) => {
    const tag = `${lid} ${mid}#${s}.${a}.${i}`, svg = DS.Hint.svg(q);
    if (!has) { check(svg === null, `${tag}: 명제 문제에 그림이 나옴`); return; }
    if (q.type === 'choice' && q.check && q.check.eq) return; // 5차시 m2 「같은 집합?」 고르기는 그림 없어도 됨
    check(typeof svg === 'string' && svg.startsWith('<svg'), `${tag}: 그림 없음`); if (svg) figs++;
    const k = q.check || {};
    if (k.sets) { // 칸 배치를 따로 확인: 원소마다 속한 집합 이름을 이어 붙인 칸에 정확히 한 번
      const names = ['A', 'B', 'C'].filter((n) => Array.isArray(k.sets[n])), U = k.U || k.sets.U || [];
      const all = [...new Set([...U, ...names.flatMap((n) => k.sets[n])])];
      const g = DS.Hint.groupsOf(k.sets, k.U || k.sets.U);
      all.forEach((x) => { const where = names.filter((n) => k.sets[n].includes(x)).join(''); check((g[where] || []).filter((y) => y === x).length === 1, `${tag}: ${x} 는 ${where || '바깥'} 칸`); });
      check(Object.values(g).flat().length === all.length, `${tag}: 원소 수`);
      // 답 영역은 칠하지 않음: 그림에 색칠 마스크 없음
      check(!/mask|fill-opacity="\.[3-9]/.test(svg), `${tag}: 답 영역이 칠해짐`);
    }
  });
}
check(DS.Hint.svg({ question: '보스', check: {} }) === null, '집합 정보 없으면 그림 없음');
if (fail) { console.error(`\n${fail}건 실패 (${count}건 중)`); process.exit(1); }
console.log(`OK: 그림 힌트 — 5 · 6차시 집합 문제 그림 ${figs}장 · 원소 칸 배치 독립 확인 · 명제 문제는 그림 없음 (${count}건)`);
