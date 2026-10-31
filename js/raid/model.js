// 협동 레이드 규칙 (화면·서버와 분리된 순수 함수 — tests/model.test.js 로 검증)
// 방 상태(room) 모양 (Firebase rooms/{code} 아래 그대로):
//   meta:    { lesson, created, teacher(uid), version }
//   hosts:   { uid: true }                  교사 기기(교사 폰·종합상황실)
//   state:   { phase, stage, monster, round, result, boss, winner }
//            phase: lobby → forge → field → battle → result → (forge/field …) → boss → victory
//   active:  { uid: true }                  이번 수업 참여 학생 (교사가 시작할 때 정함)
//   players: { uid: { num, nick, hero, at, teacher? } }
//   cards:   { uid: { cardId: true } }      연성한 카드 (교사도)
//   help:    { uid: true }                  도움 요청
//   seen:    { roundId: { uid: ms } }       문제를 처음 본 시각 (공격력 110 → 100)
//   subs:    { roundId: { uid: { card, given, at } } }
//   credits: { uid: { monsterKey: 점수 } }  몬스터마다 첫 정답만
//   bossAns: { uid: { 1: [답 6개], 2: [...] } }
// citadel 수업 규칙: docs/DECISIONS.md "수업 규칙"
window.DS = window.DS || {};

DS.Raid = (function () {
  const PHASES = ['lobby', 'forge', 'field', 'battle', 'result', 'boss', 'victory'];
  const keys = (o) => Object.keys(o || {});
  const activeIds = (R) => keys(R.active).filter((u) => R.active[u]).sort((a, b) => num(R, a) - num(R, b));
  const num = (R, uid) => ((R.players || {})[uid] || {}).num || 0;
  const teacherUid = (R) => (R.meta || {}).teacher;
  const owns = (R, uid, card) => !!(((R.cards || {})[uid] || {})[card]);
  // 시드: 라운드 + 사람 → 학생마다 숫자가 다른 문제 (교사도 같은 함수로 채점)
  const seedOf = (roundId, uid) => `${roundId}|${uid}`;

  function newRoom(code, lessonId, teacher, now) {
    return {
      meta: { lesson: lessonId, created: now, teacher, version: 1, code },
      hosts: { [teacher]: true },
      state: { phase: 'lobby', stage: 0, monster: 0, round: null, result: null, boss: null, winner: null },
      players: { [teacher]: { num: 0, nick: '선생님', hero: 7, at: now, teacher: true } },
    };
  }

  // 공격력: 문제를 본 뒤 110 에서 1초에 1씩 줄어 최저 100. 교사는 100. 제출 시각으로 고정
  const points = (ms) => 100 + Math.max(0, 10 - Math.floor(Math.max(0, ms) / 1000));

  // 이 라운드에서 각자 받는 문제
  function questionFor(L, R, uid) {
    const rd = R.state.round;
    return rd ? L.question(rd.type, seedOf(rd.id, uid)) : null;
  }
  // 참여자(학생 + 교사) 중 이 유형에 맞는 카드가 하나도 없는 사람 → 소환을 막는다
  function missingFor(L, R, type) {
    const probe = L.question(type, 'probe');
    return [...activeIds(R), teacherUid(R)].filter((u) => !probe.cards.some((c) => owns(R, u, c)));
  }
  // 단계 카드를 모두 갖췄는지 (교사 화면 준비 표시용)
  function stageReady(L, R, uid) {
    const st = L.stages[R.state.stage];
    return st.cards.every((c) => owns(R, uid, c));
  }

  // 교사 마지막 제출 가능: 학생 전원 제출 뒤
  function allStudentsSubmitted(R) {
    const rd = R.state.round, subs = ((R.subs || {})[rd && rd.id]) || {};
    return !!rd && activeIds(R).every((u) => subs[u]);
  }

  // 판정: 카드가 그 문제에 맞고 답이 맞아야 정답. 교사 포함 전원 정답이면 공동 공격 성공
  function judge(L, R, uid) {
    const rd = R.state.round, s = (((R.subs || {})[rd.id]) || {})[uid];
    if (!s) return { submitted: false, correct: false };
    const q = questionFor(L, R, uid);
    const cardOk = q.cards.includes(s.card) && owns(R, uid, s.card);
    const answerOk = DS.Quiz.grade(q, s.given);
    return { submitted: true, correct: cardOk && answerOk, cardOk, answerOk, card: s.card };
  }
  function resolve(L, R) {
    const rd = R.state.round, t = teacherUid(R);
    const people = [...activeIds(R), t];
    const per = {}, credits = {};
    const mkey = `m${R.state.monster}`;
    people.forEach((u) => {
      const j = judge(L, R, u);
      per[u] = j;
      if (u === t || !j.correct) return;
      if ((((R.credits || {})[u]) || {})[mkey] != null) return; // 같은 몬스터는 첫 정답만
      const sub = R.subs[rd.id][u], seen = (((R.seen || {})[rd.id]) || {})[u];
      credits[u] = { [mkey]: points(seen != null ? sub.at - seen : 0) };
    });
    const success = people.every((u) => per[u].correct);
    return { success, per, credits };
  }

  // 보스(형성평가): 문항별로 세트1·세트2 중 한 번이라도 맞히면 도달. 문항당 기여 100
  function mastery(L, R, uid) {
    const ans = ((R.bossAns || {})[uid]) || {};
    return Array.from({ length: L.boss.items }, (_, i) => [1, 2].some((set) => {
      const given = (ans[set] || [])[i];
      return given != null && given !== '' && DS.Quiz.grade(L.boss.sets[set][i], given);
    }));
  }
  function bossHp(L, R) {
    const ids = activeIds(R);
    const max = ids.length * L.boss.items * 100;
    const dmg = ids.reduce((a, u) => a + mastery(L, R, u).filter(Boolean).length * 100, 0);
    return { max, hp: Math.max(0, max - dmg), allReached: ids.every((u) => mastery(L, R, u).every(Boolean)) };
  }

  // 최고 용사: 일반전 점수 + 보스 기여. 동점이면 추첨, 교사 제외
  function winner(L, R, rnd = Math.random) {
    const ids = activeIds(R);
    if (!ids.length) return null;
    const total = (u) => keys((R.credits || {})[u]).reduce((a, k) => a + R.credits[u][k], 0) + mastery(L, R, u).filter(Boolean).length * 100;
    const max = Math.max(...ids.map(total));
    const tied = ids.filter((u) => total(u) === max);
    const u = tied[Math.floor(rnd() * tied.length)];
    return { uid: u, num: num(R, u), nick: R.players[u].nick, hero: R.players[u].hero, score: max, tie: tied.length > 1 };
  }

  return { PHASES, activeIds, teacherUid, owns, seedOf, newRoom, points, questionFor, missingFor, stageReady, allStudentsSubmitted, judge, resolve, mastery, bossHp, winner };
})();
