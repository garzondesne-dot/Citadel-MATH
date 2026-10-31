// 차시 묶음 등록소: 차시마다 lessons/<id>.js 파일 하나가 DS.Lessons.register(pack) 로 붙는다.
// 차시를 추가하려면 → lessons/ 에 파일 하나 + index.html 의 <script> 한 줄 + tests 에 검산 (docs/HANDOVER.md "차시 추가")
//
// pack = {
//   id, title, unit, goal,
//   parts: { id: { name, sym } },            // 연성 재료 (무한, 소모 안 됨)
//   ops: { id: { sym, name, unary? } },       // 연산
//   recipes: [{ op, in: ['part:x', 'card:y'], ordered?, out: { kind: 'card'|'part', id } }],  // 엄격한 연성
//   mistakes: { 'op>왼쪽,오른쪽': '개념 메시지', 'op|정렬': … },
//   cards: { id: { name, formula, art, desc } },       // art: 카드 그림 번호 (assets 배치표)
//   stages: [{ name, intro, cards: [...], types: [...], monster }],  // 단계 = 연성할 카드 + 몬스터 문제 유형
//   question(type, seed) → 문제 (DS.Quiz 형식 + cards: [이 문제에 맞는 공격 카드] + check: 검산 정보)
//   example(cardId, seed) → 첫 연성 예제
//   boss: { title, items: 6, sets: { 1: [문제 6개], 2: [문제 6개] } }   // 형성평가 (세트1 = 학습지, 세트2 = 숫자 바꾼 재도전)
// }
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
