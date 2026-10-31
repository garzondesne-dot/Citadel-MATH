// 차시 묶음 등록소: 차시마다 lessons/<id>.js 파일 하나가 DS.Lessons.register(pack) 로 붙는다.
// 차시를 추가하려면 → lessons/ 에 파일 하나 + index.html 의 <script> 한 줄 + tests 에 검산 (docs/HANDOVER.md "차시 추가")
//
// pack = {   (v0.2.0 레이드 형식)
//   id, title, unit, sheet(학습지 이름), goal, defaultPct(몬스터 체력 기준%, 90),
//   steps: [{ kind: 'intro'|'concept'|'monster'|'boss', id, title, say?, special? }],   // 학습지 순서 = 수업 순서
//   monsters: { id: { title, sprite, special?, note?, make(attempt, rng) → [소문제] } },  // attempt 0 = 학습지 그대로, 1·2 = 숫자 바꾼 재도전
//   items(id, seed, attempt) → 소문제 배열 (DS.Quiz 형식 + check: 검산 정보)
//   boss: { title, sprite, items: 7, hpItems: 6, sets: { 1: [학습지], 2: [숫자 바꿈] } }   // hpItems 뒤 문항은 보너스
// }
// 연성(대장간)용 parts·ops·recipes·mistakes 는 5단계에서 단원 공통 파일(lessons/unit-set.js)로 붙는다 — DS.Craft 는 그대로 둔다.
window.DS = window.DS || {};

DS.Lessons = (function () {
  const list = [];
  function register(pack) {
    if (list.some((p) => p.id === pack.id)) return;
    list.push(pack);
  }
  const get = (id) => list.find((p) => p.id === id) || null;
  return { list, register, get };
})();

// 엄격한 연성 판정 (차시 묶음의 recipes·mistakes 로)
DS.Craft = (function () {
  const key = (t) => `${t.kind}:${t.id}`;
  function match(L, op, a, b) {
    const mats = [a, b].filter(Boolean);
    if (!op) return { ok: false, msg: '가운데 연산 칸이 비어 있어요.' };
    const o = L.ops[op];
    const keys = mats.map(key), sorted = keys.slice().sort().join(',');
    const hint = () => L.mistakes[`${op}>${keys.join(',')}`] || L.mistakes[`${op}|${sorted}`] || (L.generalMistake ? L.generalMistake(op, keys) : '');
    if (o.unary && mats.length !== 1) return { ok: false, msg: `${o.sym} 는 재료 하나에만 씌워요.` };
    if (!o.unary && (!a || !b)) return { ok: false, msg: `${o.sym} 는 왼쪽 칸과 오른쪽 칸에 재료가 하나씩 필요해요.` };
    for (const r of L.recipes) {
      if (r.op !== op) continue;
      if (r.ordered ? keys.join(',') === r.in.join(',') : sorted === r.in.slice().sort().join(',')) return { ok: true, out: r.out };
    }
    return { ok: false, msg: hint() || '이 조합으로는 개념이 되지 않아요. 레시피 힌트를 보세요.' };
  }
  return { key, match };
})();
