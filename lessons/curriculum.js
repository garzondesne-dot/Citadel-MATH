// 📚 성취기준 태그(A) · 🔎 오개념 기록(B) — 2026-11-03 사용자 확정 (생활기록부 연계 준비)
//   A. 개념 칸(c1, c2 …) → 성취기준. 기존 기록(records 의 conc · 형성평가 boss.tags)이 개념 단위라서 지난 수업에도 바로 적용된다
//      ⚠ 성취기준 코드 · 문구는 초안 (2022 개정 공통수학2 「집합과 명제」) — 교육과정 문서로 확인한 뒤 LIST 만 고치면 된다
//   B. 틀린 답 → 오개념 코드 (M01~M16). ① 기호 고르기 · 부분집합 만들기 · 숫자 답은 자동 규칙 ② 형성평가 오답 보기는 아래 BOSS 표
//      기록: records/{반}/{번호}/{차시}.mis = { 코드: [틀린 횟수, 나중에 바로잡은 횟수] } · 보강던전 bonus/…/{몬스터}.mis (같은 모양)
//      쓰임: 학생 「자주 하는 실수」 한 줄 · 교사 대시보드 ⑥ 성취기준 · ⑦ 오개념 · 세특 초안 문장. 점수에는 쓰지 않는다
window.DS = window.DS || {};

DS.Standards = (function () {
  const LIST = [ // 초안 — 코드 · 문구 확인 필요
    { id: '02-01', code: '[10공수2-02-01]', name: '집합의 뜻과 표현' },
    { id: '02-02', code: '[10공수2-02-02]', name: '집합 사이의 포함 관계' },
    { id: '02-03', code: '[10공수2-02-03]', name: '집합의 연산' },
    { id: '02-04', code: '[10공수2-02-04]', name: '명제와 조건 · 모든 · 어떤' },
    { id: '02-05', code: '[10공수2-02-05]', name: '명제의 역과 대우' },
    { id: '02-06', code: '[10공수2-02-06]', name: '충분조건 · 필요조건' },
    { id: '02-07', code: '[10공수2-02-07]', name: '대우를 이용한 증명 · 귀류법' },
    { id: '02-08', code: '[10공수2-02-08]', name: '절대부등식' },
  ];
  // 차시 → { 개념: 성취기준 } (없는 개념은 차시 기본값 _)
  const MAP = {
    'set-02': { _: '02-01' },
    'set-03': { _: '02-02' },
    'set-04': { _: '02-03' },
    'set-05': { _: '02-03' },
    'set-06': { _: '02-03' }, // v3 (2026-11-05): 드모르간 + 집합 중단원 마무리 — 명제는 7차시로
  };
  const BY_NO = { 2: '02-01', 3: '02-02', 4: '02-03', 5: '02-03', 6: '02-03', 8: '02-04', 9: '02-05', 10: '02-06', 11: '02-07' }; // 2026-11-07 선생님: 7차시 = 6차시 이어서(새 차시 없음) · 명제 8~11차시 · // 2026-11-05 재배열: 7 명제와 조건 · 8 참·거짓 · 역·대우(+대우 증명) · 9 충분·필요 · 10 귀류법 · 절대부등식 (02-08 은 차시 파일 std 로) // 새 차시 기본값 (차시 파일 std 가 있으면 그쪽)
  function of(lessonId, concept, no) {
    if (concept === 'review') return null; // 지난 시간 복습은 그 차시 성취기준에 넣지 않는다
    const L = DS.Lessons && DS.Lessons.get(lessonId), own = (L && L.std) || MAP[lessonId] || {};
    return own[concept] || own._ || BY_NO[no || (L && L.no)] || null;
  }
  const get = (id) => LIST.find((s) => s.id === id) || null;
  const level = (p) => (p == null ? '' : p >= 80 ? '도달' : p >= 50 ? '근접' : '미도달');
  return { LIST, MAP, of, get, level };
})();

DS.Mis = (function () {
  // 오개념 사전: name = 교사용 · kid = 학생 한 줄 · seteuk = 세특 초안 문장 조각 (「…을/를 혼동하였으나」 앞부분)
  const CODES = {
    M01: { name: '원소와 집합 기호 혼동 (∈ ↔ ⊂)', kid: '∈ 와 ⊂ 를 헷갈렸어요 — ∈ 는 원소와 집합, ⊂ 는 집합과 집합!', seteuk: '원소와 집합 사이의 기호(∈)와 집합 사이의 기호(⊂)' },
    M02: { name: '포함 판단 오류 (⊂ ↔ ⊄)', kid: '포함 관계를 반대로 봤어요 — 왼쪽 집합의 원소가 모두 오른쪽에 있는지 하나씩!', seteuk: '두 집합 사이의 포함 관계 판단' },
    M03: { name: '공집합을 빠뜨림 · 공집합 개념', kid: '∅ 을 빠뜨렸어요 — 공집합은 모든 집합의 부분집합!', seteuk: '공집합의 의미와 부분집합으로서의 공집합' },
    M04: { name: '자기 자신 · 진부분집합 혼동 (2ⁿ ↔ 2ⁿ − 1)', kid: '자기 자신을 넣을지 헷갈렸어요 — 부분집합 2ⁿ개, 진부분집합은 자기 자신을 빼서 2ⁿ − 1개!', seteuk: '부분집합과 진부분집합의 구분' },
    M05: { name: '{0}과 ∅ 혼동', kid: '{0} 과 ∅ 을 헷갈렸어요 — {0} 은 원소 0 이 하나 있는 집합!', seteuk: '{0}과 공집합(∅)의 차이' },
    M06: { name: '같은 집합 판단 오류', kid: '같은 집합인지 헷갈렸어요 — 순서 · 표현이 달라도 원소가 같으면 같은 집합!', seteuk: '서로 같은 집합의 판단' },
    M07: { name: '조건제시법 해석 오류 (약수 ↔ 배수 등)', kid: '조건을 거꾸로 읽었어요 — 약수 · 배수 · 이하를 다시 확인!', seteuk: '조건제시법으로 나타낸 집합의 해석' },
    M08: { name: '교집합 ↔ 합집합 혼동', kid: '∩ 와 ∪ 를 헷갈렸어요 — ∩ 는 「그리고(둘 다)」, ∪ 는 「또는(모두 모으기)」!', seteuk: '교집합과 합집합' },
    M09: { name: '합집합 개수에서 겹친 부분 처리', kid: '겹친 부분을 두 번 셌어요 — n(A∪B) = n(A) + n(B) − n(A∩B)!', seteuk: '합집합의 원소의 개수에서 공통부분의 처리' },
    M10: { name: '여집합 · 차집합 방향 오류', kid: '빼는 방향을 헷갈렸어요 — A − B 와 B − A 는 달라요!', seteuk: '여집합과 차집합의 방향' },
    M11: { name: '드모르간에서 ∪ ↔ ∩ 미변환', kid: '괄호를 풀 때 ∪ ↔ ∩ 를 바꾸지 않았어요 — ᶜ 이 각각 붙고 연산이 바뀐다!', seteuk: '드모르간의 법칙에서 연산의 변환' },
    M12: { name: '명제 판단 오류', kid: '명제인지 헷갈렸어요 — 참 · 거짓을 분명히 가릴 수 있어야 명제!', seteuk: '명제의 뜻(참 · 거짓의 판별 가능성)' },
    M13: { name: '부정 오류 (모든 / 어떤 포함)', kid: '부정을 헷갈렸어요 — ‘p 가 아니다’, 모든 ↔ 어떤 도 바뀐다!', seteuk: '명제와 조건의 부정' },
    M14: { name: '역 ↔ 대우 혼동', kid: '역과 대우를 헷갈렸어요 — 대우는 바꾸고 둘 다 부정!', seteuk: '명제의 역과 대우' },
    M15: { name: '원소 나열 · 개수 세기 오류', kid: '원소를 쓰거나 세다가 실수했어요 — 쉼표로 구분하고 하나씩 세기!', seteuk: '원소나열법과 원소의 개수' },
    M16: { name: '연산 법칙 이름 · 모양 혼동', kid: '연산 법칙을 헷갈렸어요 — 교환(순서) · 결합(괄호) · 분배(나누어 주기)!', seteuk: '집합의 연산 법칙(교환 · 결합 · 분배)' },
  };
  // 형성평가 오답 보기 꼬리표: 차시 → 세트 → 문항 번호(0부터) → { 보기 번호: 코드 } · num = 숫자 답 · any = 어떤 오답이든
  const BOSS = {
    'set-02': {
      1: [{ 0: 'M07', 2: 'M07' }, { any: 'M07' }, { 1: 'M15', 2: 'M15', 3: 'M15' }, { 0: 'M05', 2: 'M03' }, { 1: 'M05', 2: 'M03', 3: 'M05' }],
      2: [{ 0: 'M07', 2: 'M07' }, { any: 'M07' }, { 1: 'M15', 2: 'M15', 3: 'M15' }, { 0: 'M05', 1: 'M03' }, { 1: 'M03', 2: 'M15', 3: 'M15' }],
    },
    'set-03': {
      1: [null, { 0: 'M01', 1: 'M01', 2: 'M03' }, null, null, { num: { 4: 'M04', 2: 'M03' } }, { any: 'M06' }, null],
      2: [null, { 0: 'M01', 2: 'M03', 3: 'M04' }, null, null, { num: { 4: 'M04', 2: 'M03' } }, { any: 'M06' }, null],
    },
    'set-04': {
      1: [{ 0: 'M08', 1: 'M08', 3: 'M08' }, { 0: 'M08', 2: 'M08' }, { num: { 11: 'M09' } }, { 0: 'M08' }, { 1: 'M08', 2: 'M08' }, null],
      2: [{ 0: 'M08', 1: 'M08', 2: 'M08' }, { 0: 'M08', 1: 'M08' }, { num: { 11: 'M09' } }, { 1: 'M08' }, { 0: 'M08', 2: 'M08' }, null],
    },
    'set-05': {
      1: [{ any: 'M16' }, { any: 'M08' }, { any: 'M16' }, { any: 'M10' }, { 0: 'M10', 1: 'M08', 2: 'M10' }, { 0: 'M10', 2: 'M08', 3: 'M10' }], // v4: 6문항
      2: [{ any: 'M16' }, { any: 'M08' }, { any: 'M16' }, { any: 'M10' }, { 1: 'M10', 2: 'M08', 3: 'M10' }, { 0: 'M10', 1: 'M08', 3: 'M10' }],
    },
    'set-06': {
      // v3 (2026-11-05): 드모르간 · n(Aᶜ) · 04 n(A ∩ B) · 05⑷ A − B · 06 서로소 · 10 n(Aᶜ ∩ Bᶜ)
      1: [{ any: 'M11' }, { num: { 7: 'M10', 27: 'M10' } }, { num: { 41: 'M09' }, any: 'M09' }, { any: 'M10' }, { any: 'M03' }, { num: { 10: 'M11' }, any: 'M09' }],
      2: [{ any: 'M11' }, { any: 'M10' }, { any: 'M09' }, { any: 'M10' }, { any: 'M03' }, { any: 'M09' }],
    },
  };
  const ELEM = ['∈', '∉'], SUB = ['⊂', '⊄'], EQ = ['=', '≠'];
  const isPow2 = (n) => n >= 4 && Number.isInteger(Math.log2(n));
  // 틀린 답 하나 → 오개념 코드 목록 (모르면 빈 목록). tag = 형성평가 꼬리표 (없으면 자동 규칙만)
  function classify(q, given, tag) {
    if (!q || given == null) return [];
    const out = new Set();
    if (tag) {
      if (q.type === 'number' && tag.num && tag.num[Number(given)]) out.add(tag.num[Number(given)]);
      else if (q.type === 'choice' && tag[given]) out.add(tag[given]);
      if (!out.size && tag.any) out.add(tag.any);
    }
    if (q.type === 'blanks') (q.items || []).forEach((it, k) => {
      const g = (given || [])[k], a = it.answer; if (g == null || g === a) return;
      if ((SUB.includes(a) && ELEM.includes(g)) || (ELEM.includes(a) && SUB.includes(g))) out.add('M01');
      else if (SUB.includes(a) && SUB.includes(g)) out.add('M02');
      else if (EQ.includes(a) && EQ.includes(g)) out.add('M06');
    });
    if (q.type === 'subsets' && DS.SetGen) {
      const keys = (given || []).map(DS.SetGen.key);
      if (!keys.includes('')) out.add('M03');
      if (!keys.includes(DS.SetGen.key(q.base))) out.add('M04');
    }
    if (q.type === 'multi' && q.check && q.check.base && q.check.options) { // 부분집합 모두 고르기 (3차시): ∅ · 자기 자신 빠뜨림 · 부분집합이 아닌 것 고름
      const pick = new Set((given || []).map(Number)), ans = new Set((q.answer || []).map(Number)), base = q.check.base;
      q.check.options.forEach((o, j) => {
        if (ans.has(j) && !pick.has(j) && !o.length) out.add('M03');
        if (ans.has(j) && !pick.has(j) && o.length === base.length) out.add('M04');
        if (pick.has(j) && !ans.has(j) && o.some((x) => !base.includes(x))) out.add('M02');
      });
    }
    if (q.type === 'number' && !out.size) { // 부분집합 개수 문항: 2ⁿ ↔ 2ⁿ − 1
      const a = Number(q.answer), g = Number(given);
      if ((isPow2(a) && g === a - 1) || (isPow2(a + 1) && g === a + 1)) out.add('M04');
    }
    return [...out];
  }
  const bossTag = (lessonId, set, i) => ((((BOSS[lessonId] || {})[set]) || [])[i]) || null;
  // 누적: acc[code] = [틀린 횟수, 바로잡은 횟수]
  function add(acc, codes, fixed) { codes.forEach((c) => { acc[c] = acc[c] || [0, 0]; acc[c][0]++; if (fixed) acc[c][1]++; }); return acc; }
  function merge(a, b) { Object.entries(b || {}).forEach(([c, v]) => { a[c] = a[c] || [0, 0]; a[c][0] += Number(v[0]) || 0; a[c][1] += Number(v[1]) || 0; }); return a; }
  // 학생에게 보여 줄 한 줄 (가장 많이 틀린 것 · 아직 못 고친 것 먼저)
  function top(acc, n = 1) { return Object.entries(acc || {}).filter(([c]) => CODES[c]).sort((x, y) => (y[1][0] - y[1][1]) - (x[1][0] - x[1][1]) || y[1][0] - x[1][0]).slice(0, n).map(([c, v]) => ({ code: c, ...CODES[c], wrong: v[0], fixed: v[1] })); }
  return { CODES, BOSS, classify, bossTag, add, merge, top };
})();
