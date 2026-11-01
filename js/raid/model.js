// 수업 규칙 (순수 함수 — 화면·서버와 분리, tests/model.test.js 가 검증)
// 방 데이터 rooms/{코드}:
//   meta:    { lesson, created, teacher, code, pct }        pct = 기준% 기본값 (수업 준비 화면에서 정함, 없으면 차시 기본 90)
//   state:   { step, stepAt, headcount, focus, closed, pct: { 몬스터id: % }, skip: { 몬스터id: { uid: true } } }
//            step: -1 = 대기실(입장), 0 … steps.length-1 = 수업 단계, steps.length = 마무리(마지막 한마디), closed = 수업 끝(모닥불로)
//            focus: 집중모드 (학생 폰 멈춤 · 개념 설명 단계에 들어가면 자동으로 켜짐, 교사가 언제든 켜고 끔)
//   online:  { uid: true } (접속 중 — 연결이 끊기면 서버가 지움) · words: { uid: { t, bad, n } } 마지막 한마디 · hide: { uid: true }
//   players: { uid: { num, nick, hero, teacher? } } · active: { uid: true } (수업 시작 때 대기실 인원)
//   subs:    { 몬스터id: { uid: { 0: 답(JSON), 1: …, 2: … } } }   attempt 0 = 첫 시도, 1·2 = 재도전
//   bossAns: { uid: { 1: [답 7개](JSON), 2: [...] } } · help: { uid: true }
// 필드 몬스터 = 공동 체력 레이드: 체력 = ⌊대기실 인원 × 소문제 수 × 기준%⌋, 데미지 = 학생마다 가장 많이 맞힌 소문제 수(늘어난 만큼만)
//   전원이 한 번 이상 제출(제외된 학생 빼고)한 뒤 체력이 0 이하면 격파. 보스는 체력 0 이 되는 즉시 승리.
window.DS = window.DS || {};

DS.Raid = (function () {
  const RETRIES = 2; // 재도전 2번 → 시도는 최대 3번
  const keys = (o) => Object.keys(o || {});
  const num = (R, uid) => ((R.players || {})[uid] || {}).num || 0;
  const activeIds = (R) => keys(R.active).filter((u) => R.active[u]).sort((a, b) => num(R, a) - num(R, b));
  const teacherUid = (R) => (R.meta || {}).teacher;

  function newRoom(code, lessonId, teacher, now, pct) {
    return {
      meta: { lesson: lessonId, created: now, teacher, version: 2, code, ...(pct ? { pct } : {}) },
      hosts: { [teacher]: true },
      state: { step: -1, stepAt: now, headcount: 0 },
      players: { [teacher]: { num: 0, nick: '선생님', hero: 7, at: now, teacher: true } },
    };
  }

  // ── 단계 ─────────────────────────────────────────────────
  const stepOf = (L, R) => { const i = (R.state || {}).step; return i >= 0 && i < L.steps.length ? L.steps[i] : null; };
  const isLobby = (R) => ((R.state || {}).step ?? -1) < 0;
  const isEnd = (L, R) => ((R.state || {}).step ?? -1) >= L.steps.length; // 마무리(마지막 한마디) 이후
  const isFinale = (L, R) => isEnd(L, R) && !(R.state || {}).closed;
  const isClosed = (R) => !!(R.state || {}).closed;
  const focusOn = (R) => !!(R.state || {}).focus;
  const sheetOn = (R) => !!(R.state || {}).sheet; // 📄 문제 화면 (교사 해설)
  const autoFocus = (step) => !!step && (step.kind === 'intro' || step.kind === 'concept'); // 이 단계로 들어가면 집중모드 자동

  // ── 문제·답 ──────────────────────────────────────────────
  const seedOf = (R, uid) => `${(R.meta || {}).code}|${uid}`;
  const itemsFor = (L, R, mid, uid, attempt) => L.items(mid, seedOf(R, uid), attempt);
  const attemptsOf = (R, mid, uid) => {
    const a = (((R.subs || {})[mid]) || {})[uid] || {};
    return keys(a).map(Number).sort((x, y) => x - y).map((k) => ({ attempt: k, given: a[k] }));
  };
  // 한 번의 시도 채점: 소문제마다 정답 여부
  function gradeAttempt(L, R, mid, uid, attempt, given) {
    const items = itemsFor(L, R, mid, uid, attempt);
    const marks = items.map((q, i) => given != null && given[i] != null && DS.Quiz.grade(q, given[i]));
    return { marks, correct: marks.filter(Boolean).length, total: items.length };
  }
  // 학생의 기록: 시도별 결과 · 가장 많이 맞힌 수(=데미지) · 남은 재도전
  function record(L, R, mid, uid) {
    const tries = attemptsOf(R, mid, uid).map((t) => ({ ...t, ...gradeAttempt(L, R, mid, uid, t.attempt, t.given) }));
    const best = tries.reduce((m, t) => Math.max(m, t.correct), 0);
    const total = L.monsters[mid] ? itemsFor(L, R, mid, uid, 0).length : 0;
    const last = tries[tries.length - 1] || null;
    const allRight = !!last && last.correct === last.total;
    return { tries, best, total, last, allRight, submitted: tries.length > 0, canRetry: tries.length > 0 && tries.length <= RETRIES && !tries.some((t) => t.correct === t.total), nextAttempt: tries.length };
  }
  const resultLabel = (t) => (!t ? '' : t.correct === t.total ? 'success' : t.correct === 0 ? 'fail' : 'partial');

  // ── 체력 ─────────────────────────────────────────────────
  const headcount = (R) => (R.state || {}).headcount || activeIds(R).length;
  const pctOf = (L, R, mid) => { const p = ((R.state || {}).pct || {})[mid]; return p != null ? p : ((R.meta || {}).pct || L.defaultPct || 90); };
  const skipped = (R, mid) => ((R.state || {}).skip || {})[mid] || {};
  function monsterHp(L, R, mid) {
    const n = L.monsters[mid] ? itemsFor(L, R, mid, '_', 0).length : 0;
    const pct = pctOf(L, R, mid);
    const max = Math.floor((headcount(R) * n * pct) / 100);
    const dmg = activeIds(R).reduce((a, u) => a + record(L, R, mid, u).best, 0);
    return { max, dmg, left: Math.max(0, max - dmg), pct, items: n };
  }
  const waiting = (L, R, mid) => activeIds(R).filter((u) => !skipped(R, mid)[u] && !record(L, R, mid, u).submitted);
  const allSubmitted = (L, R, mid) => waiting(L, R, mid).length === 0;
  const cleared = (L, R, mid) => allSubmitted(L, R, mid) && monsterHp(L, R, mid).left <= 0;

  // ── 보스 (형성평가) ───────────────────────────────────────
  // 문항별로 세트1·세트2 중 한 번이라도 맞히면 도달. 체력 = ⌊인원 × hpItems(6) × 기준%⌋, 7번(보너스)도 맞히면 1 데미지
  function mastery(L, R, uid) {
    const ans = ((R.bossAns || {})[uid]) || {};
    return Array.from({ length: L.boss.items }, (_, i) => [1, 2].some((set) => {
      const given = (ans[set] || [])[i];
      return given != null && given !== '' && DS.Quiz.grade(L.boss.sets[set][i], given);
    }));
  }
  function bossHp(L, R) {
    const pct = pctOf(L, R, 'boss');
    const max = Math.floor((headcount(R) * L.boss.hpItems * pct) / 100);
    const dmg = activeIds(R).reduce((a, u) => a + mastery(L, R, u).filter(Boolean).length, 0);
    return { max, dmg, left: Math.max(0, max - dmg), pct, won: max > 0 && dmg >= max };
  }

  // 형성평가 만점 (보너스 문항 빼고 체력 문항 전부 도달) → 모루 열림 · 대기실로 이동 가능
  const fullMarks = (L, R, uid) => mastery(L, R, uid).slice(0, L.boss.hpItems).every(Boolean);
  // 대기실로 이동 버튼: 보스 격파(반 전체) 또는 내가 만점
  const canLobby = (L, R, uid) => isEnd(L, R) || bossHp(L, R).won || fullMarks(L, R, uid);
  const online = (R, uid) => !!(R.online || {})[uid];
  // 늦게 온 학생 (v0.8.1): 수업이 시작된 뒤 들어와 참여 명단에 없는 학생 → 교사 · 종합상황실 기기가 다음 몬스터부터 넣는다
  const lateIds = (R) => (((R.state || {}).step ?? -1) < 0 || isClosed(R) ? [] : keys(R.players).filter((u) => !R.players[u].teacher && !(R.active || {})[u]));
  // 차원문이 열린 지 오래되면(기본 2시간) 꺼진 것으로 본다 — 선생님이 수업 끝을 안 누르고 나간 경우
  const LIVE_MS = 2 * 60 * 60 * 1000;
  const liveOpen = (live, now) => !!(live && live.open && !(typeof live.at === 'number' && now - live.at > LIVE_MS));

  // ── 도움 필요 (교사 폰) ───────────────────────────────────
  // 직접 요청 · 재도전까지 다 썼는데 다 맞히지 못함 · 몬스터가 나온 지 2분이 지나도 미제출
  function helpList(L, R, now) {
    const step = stepOf(L, R), out = [];
    activeIds(R).forEach((u) => {
      if ((R.help || {})[u]) { out.push({ uid: u, why: '직접 요청', level: 2 }); return; }
      if (step && step.kind === 'monster') {
        const rec = record(L, R, step.id, u);
        if (rec.submitted && !rec.canRetry && !rec.tries.some((t) => t.correct === t.total)) out.push({ uid: u, why: `재도전까지 ${rec.best}/${rec.total}`, level: 1 });
        else if (!rec.submitted && now - ((R.state || {}).stepAt ?? now) > 120000) out.push({ uid: u, why: '2분째 미제출', level: 0 });
      }
    });
    return out.sort((a, b) => b.level - a.level || num(R, a.uid) - num(R, b.uid));
  }

  return { RETRIES, LIVE_MS, lateIds, liveOpen, activeIds, teacherUid, num, newRoom, stepOf, isLobby, isEnd, isFinale, isClosed, focusOn, sheetOn, autoFocus, fullMarks, canLobby, online, seedOf, itemsFor, attemptsOf, gradeAttempt, record, resultLabel, headcount, pctOf, monsterHp, waiting, allSubmitted, cleared, mastery, bossHp, helpList };
})();
