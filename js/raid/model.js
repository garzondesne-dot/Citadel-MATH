// 수업 규칙 (순수 함수 — 화면·서버와 분리, tests/model.test.js 가 검증)
// 방 데이터 rooms/{코드}:
//   meta:    { lesson, created, teacher, code, pct }        pct = 기준% 기본값 (수업 준비 화면에서 정함, 없으면 차시 기본 90)
//   state:   { step, stepAt, headcount, focus, closed, pct: { 몬스터id: % }, skip: { 몬스터id: { uid: true } } }
//            step: -1 = 대기실(입장), 0 … steps.length-1 = 수업 단계, steps.length = 마무리(마지막 한마디), closed = 수업 끝(모닥불로)
//            focus: 집중모드 (학생 폰 멈춤 · 개념 설명 단계에 들어가면 자동으로 켜짐, 교사가 언제든 켜고 끔)
//   online:  { uid: true } (접속 중 — 연결이 끊기면 서버가 지움) · words: { uid: { t, bad, n } } 마지막 한마디 · hide: { uid: true }
//   players: { uid: { num, nick, hero, teacher? } } · active: { uid: true } (수업 시작 때 대기실 인원)
//   subs:    { 몬스터id: { uid: { 0: 답(JSON), 1: …, 2: …, 3: … } } }   attempt 0 = 첫 시도, 1·2·3 = 재도전
//   bossAns: { uid: { 1: [답 7개](JSON), 2: [...] } } · help: { uid: true }
//   heals:   { 몬스터id: { 힐러uid: { 0: 받은uid | '_'(받을 친구 없음 = 응원), 1: … } } }   v0.9.6 💚 힐: 다 맞힌 학생이 남은 기회 한 칸을 친구에게 (받는 쪽 몬스터당 최대 +2)
// 필드 몬스터 = 공동 체력 레이드: 체력 = ⌊대기실 인원 × 소문제 수 × 기준%⌋, 데미지 = 학생마다 가장 많이 맞힌 소문제 수(늘어난 만큼만)
//   전원이 한 번 이상 제출(제외된 학생 빼고)한 뒤 체력이 0 이하면 격파. 보스는 체력 0 이 되는 즉시 승리.
window.DS = window.DS || {};

DS.Raid = (function () {
  const RETRIES = 3; // v0.9.2: 재도전 3번 → 시도는 최대 4번 (사용자 결정)
  const HEAL_MAX = 2; // v0.9.6: 힐로 받는 기회는 몬스터마다 최대 +2 → 시도는 최대 6번 (Firebase 규칙 $attempt 0~5)
  const keys = (o) => Object.keys(o || {});
  const num = (R, uid) => ((R.players || {})[uid] || {}).num || 0;
  const activeIds = (R) => keys(R.active).filter((u) => R.active[u]).sort((a, b) => num(R, a) - num(R, b));
  const teacherUid = (R) => (R.meta || {}).teacher;

  function newRoom(code, lessonId, teacher, now, pct, thero = 7, tfx) { // thero: 선생님 모습 (2026-11-04: 모든 용사) · tfx: 선생님 시연 이펙트
    return {
      meta: { lesson: lessonId, created: now, teacher, version: 3, code, ...(pct ? { pct } : {}) },
      hosts: { [teacher]: true },
      state: { step: -1, stepAt: now, headcount: 0 },
      players: { [teacher]: { num: 0, nick: '선생님', hero: Number.isFinite(Number(thero)) ? Number(thero) : 7, at: now, teacher: true, ...(tfx ? { fx: String(tfx) } : {}) } },
    };
  }

  // ── 단계 ─────────────────────────────────────────────────
  const stepOf = (L, R) => { const i = (R.state || {}).step; return i >= 0 && i < L.steps.length ? L.steps[i] : null; };
  const isLobby = (R) => ((R.state || {}).step ?? -1) < 0;
  const isEnd = (L, R) => ((R.state || {}).step ?? -1) >= L.steps.length; // 마무리(마지막 한마디) 이후
  const isFinale = (L, R) => isEnd(L, R) && !(R.state || {}).closed;
  const isClosed = (R) => !!(R.state || {}).closed;
  const focusOn = (R) => !!(R.state || {}).focus;
  // 🏕 쉼터 (2026-11-04): 교사가 아무 단계에서나 켜고 끔 · state.rest = { at, min } · 쉬는 동안 몬스터 공격 게이지 멈춤 (pauseMs 에 더함)
  const restOn = (R) => !!((R.state || {}).rest);
  const sheetOn = (R) => !!(R.state || {}).sheet; // 📄 문제 화면 (교사 해설)
  const videoOn = (R, stepId) => !!stepId && ((R.state || {}).video === stepId); // 🎬 설명 영상 (교사가 켠 단계에서만, v0.8.6)
  const autoFocus = (step) => !!step && (step.kind === 'intro' || step.kind === 'concept'); // 이 단계로 들어가면 집중모드 자동

  // ── 문제·답 ──────────────────────────────────────────────
  const seedOf = (R, uid) => `${(R.meta || {}).code}|${uid}`;
  // 🔁 재도전 규칙 v3 (2026-11-09 선생님): 방 meta.version ≥ 3 → 문제(숫자)는 「다 맞혔을 때만」 바뀜
  //   틀린 학생 = 같은 문제 그대로 다시 · 퍼펙트 뒤 = 새 문제 → 맞히면 다음 새 문제 · 틀리면 같은 문제를 고쳐서 다시 (기회 −1)
  //   옛 방(version 2)은 예전대로 시도마다 숫자가 바뀜 (지난 수업 기록이 다시 채점되지 않게)
  const NEWR = (R) => Number((R.meta || {}).version || 0) >= 3;
  function variantOf(L, R, mid, uid, attempt) {
    if (!NEWR(R) || !attempt) return attempt;
    const seed = seedOf(R, uid); let v = 0;
    for (const t of attemptsOf(R, mid, uid)) {
      if (t.attempt >= attempt) break;
      const items = L.items(mid, seed, v), ok = items.length > 0 && items.every((q, i) => t.given != null && t.given[i] != null && DS.Quiz.grade(q, t.given[i]));
      if (ok) v = t.attempt + 1;
    }
    return v;
  }
  const itemsFor = (L, R, mid, uid, attempt) => L.items(mid, seedOf(R, uid), variantOf(L, R, mid, uid, attempt));
  const attemptsOf = (R, mid, uid) => {
    const a = (((R.subs || {})[mid]) || {})[uid] || {};
    return keys(a).map(Number).sort((x, y) => x - y).map((k) => ({ attempt: k, given: a[k] }));
  };
  // ── 💚 힐 (v0.9.6) ───────────────────────────────────────
  const healsOf = (R, mid) => ((R.heals || {})[mid]) || {};
  const healsGiven = (R, mid, uid) => keys(healsOf(R, mid)[uid]).length;
  // 받은 힐 목록 (시간 순서 없음 → 힐러 번호 · 칸 순서로 고정) · 앞의 HEAL_MAX 개만 기회가 된다
  // 2026-11-06 ⚡ 수업 필살기: 힐 칸 값 '*' = 💚 파티 힐 (아직 다 못 맞힌 친구 모두에게 +1) · '!ult' = 필살기 (마지막 기회를 씀 · 받는 사람 없음)
  // 🌟 진필살기 (2026-11-06): 힐 칸 값 '!true@시각' = 파티 힐(못 맞힌 친구 모두 +1) + 🗿 석화 TRUE_SEC 초 (몬스터 공격 멈춤 · 그동안 맞히면 💎) · 한 몬스터에 반 전체 한 번
  const TRUE_SEC = 20;
  const isTrue = (v) => typeof v === 'string' && v.startsWith('!true');
  const partyLike = (v) => v === '*' || isTrue(v);
  function petrify(R, mid) { let out = null; Object.entries(healsOf(R, mid)).forEach(([from, byK]) => Object.values(byK || {}).forEach((v) => { if (isTrue(v)) { const at = Number(String(v).split('@')[1]) || 0; if (!out || at > out.at) out = { by: from, at, until: at + TRUE_SEC * 1000 }; } })); return out; }
  const perfectRaw = (L, R, mid, uid) => !!L && attemptsOf(R, mid, uid).some((t) => { const g = gradeAttempt(L, R, mid, uid, t.attempt, t.given); return g.total > 0 && g.correct === g.total; });
  function healsTo(R, mid, uid, L) {
    const out = [];
    Object.entries(healsOf(R, mid)).forEach(([from, byK]) => Object.entries(byK || {}).forEach(([k, to]) => { if (to === uid || (partyLike(to) && from !== uid && uid !== teacherUid(R) && perfectRaw(L, R, mid, uid) === false && L)) out.push({ from, k: Number(k) }); }));
    return out.sort((a, b) => num(R, a.from) - num(R, b.from) || a.k - b.k);
  }
  const healsReceived = (R, mid, uid, L) => Math.min(HEAL_MAX, healsTo(R, mid, uid, L).length);
  const ultUsed = (R, mid, uid) => Object.values(healsOf(R, mid)[uid] || {}).some((v) => v === '!ult' || isTrue(v));
  // 퍼펙트 연속: 첫 시도부터 다 맞힌 시도가 몇 번 이어졌나 (첫 시도가 아니면 0)
  const perfStreak = (rec) => { let n = 0; for (const t of rec.tries) { if (t.total > 0 && t.correct === t.total) n++; else break; } return n; };
  // 받을 친구 고르기: 아직 다 못 맞힌 친구 전원이 후보 · 남은 기회가 적을수록 무게가 크다 (0칸 8 · 1칸 4 · 2칸 2 · 그 밖 1)
  // → 대부분 막힌 친구에게 가지만 가끔 다른 친구에게도 가서 티가 나지 않는다. rnd = 0~1 난수 (없으면 Math.random)
  function healTarget(L, R, mid, healer, rnd) {
    const cand = activeIds(R).filter((u) => u !== healer && u !== teacherUid(R)).map((u) => ({ u, rec: record(L, R, mid, u) }))
      .filter(({ u, rec }) => rec.submitted && !rec.perfect && healsTo(R, mid, u, L).length < HEAL_MAX)
      .map(({ u, rec }) => ({ u, w: rec.left <= 0 ? 8 : rec.left === 1 ? 4 : rec.left === 2 ? 2 : 1 }));
    const sum = cand.reduce((a, c) => a + c.w, 0);
    if (!sum) return null;
    let r = (rnd == null ? Math.random() : rnd) * sum;
    for (const c of cand) { r -= c.w; if (r < 0) return c.u; }
    return cand[cand.length - 1].u;
  }
  // 한 번의 시도 채점: 소문제마다 정답 여부
  function gradeAttempt(L, R, mid, uid, attempt, given) {
    const items = itemsFor(L, R, mid, uid, attempt);
    const marks = items.map((q, i) => given != null && given[i] != null && DS.Quiz.grade(q, given[i]));
    return { marks, correct: marks.filter(Boolean).length, total: items.length };
  }
  // 학생의 기록: 시도별 결과 · 가장 많이 맞힌 수(=데미지) · 남은 재도전
  // v0.9.2 연습 공격: 다 맞힌 뒤에도 남은 기회만큼 숫자 바뀐 문제를 풀 수 있다 (데미지는 가장 많이 맞힌 수라 늘지 않음 = 0)
  //   perfectAt = 처음 다 맞힌 시도 번호(-1 = 아직) · practice = 마지막 시도가 다 맞힌 뒤의 연습인지
  // ⚔ 소레이드 (2026-11-09 #18 · 방 version 3 · 차시 L.chain 에 든 문제): 학생마다 졸개 ① → … → 👑 대장을 자기 속도로
  //   저장 chain/{mid}/{uid}/{k} = { s: 단계, p: 판(0 = 진짜 · 1~ = 숫자 바뀐 연습), g: 답(pack) } · 틀려도 같은 숫자
  //   기회 4칸: 졸개 오답 0.5 · 대장 오답 1 · 남은 기회 ≤ 1 이면 잠김 → 선생님 chainOk/{mid}/{uid} = true (✔ 풀어주기) 뒤 마지막 칸 · 0 이하 = 못 맞힘
  //   데미지(반 전체 체력) = 맞힌 단계 수 (졸개 · 대장 모두 1) · 퍼펙트 = 한 번도 안 틀리고 대장까지
  const isChain = (L, R, mid) => NEWR(R) && !!L && Array.isArray(L.chain) && L.chain.includes(mid) && typeof L.chainItems === 'function';
  const chainItems = (L, R, mid, uid, pass) => L.chainItems(mid, seedOf(R, uid), pass || 0);
  const chainSubs = (R, mid, uid) => { const a = (((R.chain || {})[mid]) || {})[uid] || {}; return keys(a).map(Number).sort((x, y) => x - y).map((k) => ({ k, ...(a[k] || {}) })); };
  function chainRecord(L, R, mid, uid) {
    const items = chainItems(L, R, mid, uid, 0), n = items.length, subs = chainSubs(R, mid, uid);
    const ok = !!((((R.chainOk || {})[mid]) || {})[uid]);
    let stage = 0, cost = 0, wrong = 0, lastWrong = null; const says = [];
    let pass = 0, pStage = 0, pItems = null, pSays = [], pDoneN = 0, pWhy = -1, whyOk = false; // 💡 pWhy = 연습 판에서 근거 빈칸을 기다리는 단계 · whyOk = 근거 줄을 한 번이라도 맞힘(💡 힌트 주기 열림) // pDoneN = 연습 사슬 완성 횟수 (🔥 1번당 EXP +1 · 2026-11-09 선생님)
    subs.forEach((t) => {
      const raw0 = t.g, it0 = !t.p ? items[stage] : null; // 저장소는 빈 배열을 지움 · 배열을 객체로 줄 수도 → 고르기 답은 늘 배열로
      const fixG = (q, g) => (q && q.type === 'multi' ? (Array.isArray(g) ? g : g && typeof g === 'object' ? Object.values(g) : []) : g);
      const given = fixG(it0, raw0);
      if (!t.p) {
        if (stage >= n || cost >= CHAIN_SLOTS || t.s !== stage) return;
        if (DS.Quiz.grade(items[stage], given)) { says.push(items[stage].say || ''); if (items[stage].why) says.push(items[stage].why.text); stage += 1; lastWrong = null; } // 💡 첫 판 = 근거 줄을 완성 문장으로
        else { cost += stage === n - 1 ? 1 : 0.5; wrong += 1; lastWrong = { s: stage, given }; }
      } else {
        if (t.p !== pass) { pass = t.p; pStage = 0; pSays = []; pWhy = -1; pItems = chainItems(L, R, mid, uid, pass); }
        if (t.w) { const q = pItems[t.s]; if (t.s === pWhy && q && q.why && Number(raw0) === q.why.answer) { pSays.push(q.why.text); pWhy = -1; whyOk = true; if (pStage >= pItems.length) pDoneN += 1; } return; } // 💡 근거 빈칸 (틀려도 벌 없음 · 다시 고름)
        if (pWhy >= 0 || t.s !== pStage || pStage >= pItems.length) return;
        if (DS.Quiz.grade(pItems[pStage], fixG(pItems[pStage], raw0))) { pSays.push(pItems[pStage].say || ''); if (pItems[pStage].why) pWhy = pStage; pStage += 1; if (pStage >= pItems.length && pWhy < 0) pDoneN += 1; }
      }
    });
    const left = Math.max(0, CHAIN_SLOTS - cost), done = stage >= n, fail = !done && left <= 0;
    const locked = !done && !fail && left <= 1 && !ok;
    return { chain: true, items, n, stage, cost, left, slots: CHAIN_SLOTS, wrong, lastWrong, says, done, fail, locked, ok, perfect: done && wrong === 0, perfectAt: done && wrong === 0 ? 0 : -1,
      best: stage, total: n, submitted: subs.length > 0, tries: [], last: null, allRight: done, practice: pass > 0, pass, pStage, pSays, pItems, pDoneN, pWhy, whyOk,
      healed: 0, canRetry: false, canHeal: false, nextAttempt: subs.length, nextK: subs.length ? subs[subs.length - 1].k + 1 : 0 };
  }
  const CHAIN_SLOTS = 4;
  // 💥 졸개 쓰러짐 (2026-11-09 선생님 「추천대로」): 졸개 k 단계를 넘은 학생 ≥ 기준%(체력 기준과 같은 값) 이면 그 졸개가 쓰러짐 · 리모컨 「💥 쓰러뜨리기」 = state.chainDown[mid][k]
  //   머릿수 = 들어와 있는 학생 − 기회를 다 쓴 학생(못 맞힘) · 체력 계산과는 따로 (연출만) · 대장(마지막 단계)은 체력 0 으로만
  function chainDown(L, R, mid) {
    if (!isChain(L, R, mid)) return [];
    const ids = activeIds(R).filter((u) => u !== (R.meta || {}).teacher), recs = ids.map((u) => chainRecord(L, R, mid, u)), live = recs.filter((r) => !r.fail);
    const n = chainItems(L, R, mid, '_', 0).length, need = Math.ceil((live.length * pctOf(L, R, mid)) / 100), man = ((R.state || {}).chainDown || {})[mid] || {};
    return Array.from({ length: Math.max(0, n - 1) }, (_, k) => { const past = live.filter((r) => r.done || r.stage > k).length; return { k, past, all: live.length, need, down: !!man[k] || (live.length > 0 && past >= need) }; });
  }
  function record(L, R, mid, uid) {
    if (isChain(L, R, mid)) return chainRecord(L, R, mid, uid);
    const tries = attemptsOf(R, mid, uid).map((t) => ({ ...t, ...gradeAttempt(L, R, mid, uid, t.attempt, t.given) }));
    const best = tries.reduce((m, t) => Math.max(m, t.correct), 0);
    const total = L.monsters[mid] ? itemsFor(L, R, mid, uid, 0).length : 0;
    const last = tries[tries.length - 1] || null;
    const allRight = !!last && last.correct === last.total;
    const perfectAt = tries.findIndex((t) => t.total > 0 && t.correct === t.total), practice = perfectAt >= 0 && tries.length - 1 > perfectAt;
    // 기회 = 기본 4 + 받은 힐(최대 2) · 쓴 기회 = 시도 + 내가 준 힐
    //   🔁 v3: 퍼펙트 뒤 새 문제를 맞히면 기회를 안 씀 (대신 💚 힐 / ⛓ 묶기 한 번) · 틀리면 기회 −1 · 힐 · 묶기는 기회를 안 씀
    const slots = RETRIES + 1 + healsReceived(R, mid, uid, L);
    if (NEWR(R)) {
      const prac = perfectAt >= 0 ? tries.slice(perfectAt + 1) : [], ok = prac.filter((t) => t.total > 0 && t.correct === t.total).length;
      const used = (perfectAt >= 0 ? perfectAt + 1 : tries.length) + (prac.length - ok), left = Math.max(0, slots - used), tokens = ok, tokLeft = Math.max(0, tokens - healsGiven(R, mid, uid));
      const fix = perfectAt >= 0 && !!last && prac.length > 0 && last.correct < last.total; // 방금 새 문제를 틀림 → 같은 문제 고치기
      return { tries, best, total, last, allRight, perfectAt, perfect: perfectAt >= 0, practice, submitted: tries.length > 0, slots, left, healed: healsReceived(R, mid, uid, L), v3: true, tokens, tokLeft, fix,
        canRetry: tries.length > 0 && left > 0, canHeal: tokLeft > 0, nextAttempt: tries.length };
    }
    const used = tries.length + healsGiven(R, mid, uid), left = Math.max(0, slots - used);
    return { tries, best, total, last, allRight, perfectAt, perfect: perfectAt >= 0, practice, submitted: tries.length > 0, slots, left, healed: healsReceived(R, mid, uid, L),
      canRetry: tries.length > 0 && left > 0, canHeal: perfectAt >= 0 && left > 0, nextAttempt: tries.length };
  }
  const resultLabel = (t) => (!t ? '' : t.correct === t.total ? 'success' : t.correct === 0 ? 'fail' : 'partial');

  // ── 체력 ─────────────────────────────────────────────────
  const headcount = (R) => (R.state || {}).headcount || activeIds(R).length;
  const pctOf = (L, R, mid) => { const p = ((R.state || {}).pct || {})[mid]; return p != null ? p : ((R.meta || {}).pct || L.defaultPct || 90); };
  const skipped = (R, mid) => ((R.state || {}).skip || {})[mid] || {};
  function monsterHp(L, R, mid) {
    const n = isChain(L, R, mid) ? chainItems(L, R, mid, '_', 0).length : L.monsters[mid] ? itemsFor(L, R, mid, '_', 0).length : 0; // ⚔ 소레이드 = 인원 × 단계 수 × 기준%
    const pct = pctOf(L, R, mid);
    const max = Math.floor((headcount(R) * n * pct) / 100);
    const dmg = activeIds(R).reduce((a, u) => a + record(L, R, mid, u).best, 0);
    return { max, dmg, left: Math.max(0, max - dmg), pct, items: n };
  }
  const waiting = (L, R, mid) => activeIds(R).filter((u) => !skipped(R, mid)[u] && !record(L, R, mid, u).submitted);
  const allSubmitted = (L, R, mid) => waiting(L, R, mid).length === 0;
  // v0.9.2: 체력이 0 이 되면 그 자리에서 쓰러진다 (아직 안 낸 학생도 계속 풀고 공격 · 이펙트 · 경험치 그대로)
  const cleared = (L, R, mid) => { const h = monsterHp(L, R, mid); return h.max > 0 && h.left <= 0; };

  // ── 보스 (형성평가) ───────────────────────────────────────
  // 2026-11-05 사용자 결정 (나): 문항마다 첫 시도(학습지 그대로) + 재도전 3번 = 4번 · 재도전은 숫자 · 문자가 바뀐 새 문제 (L.boss.make)
  //   저장 bossTry/{uid}/{문항}/{시도} = 답(JSON) · 예전 수업 bossAns/{uid}/{1|2} = [답 …] 은 시도 0 · 1 로 읽음
  //   문항을 한 번이라도 맞히면 도달 · 체력 = ⌊인원 × hpItems × 기준%⌋ · 보너스 문항도 맞히면 1 데미지
  const BOSS_TRIES = 4;
  const bossMade = new Map(); // 재도전 문항은 (차시 · 방 · 학생 · 문항 · 시도)로 정해짐 → 한 번 만든 것은 다시 씀 (2026-11-06 검증: 25명 형성평가 단계에서 0.2초마다 다시 만들어 TV · 폰이 버벅이던 것)
  function bossItem(L, R, uid, i, a) {
    if (!a) return L.boss.sets[1][i];
    if (L.boss.make) { const k = `${L.id}|${seedOf(R, uid)}|${i}|${a}`; let q = bossMade.get(k); if (!q) { if (bossMade.size > 4000) bossMade.clear(); q = L.boss.make(i, a, DS.Rng(`${seedOf(R, uid)}|boss|${i}|${a}`)); bossMade.set(k, q); } return q; }
    return (L.boss.sets[2] || L.boss.sets[1])[i]; // 생성기가 없는 차시(엑셀 차시 등): 세트2 고정
  }
  // 그 학생의 시도 목록 [{ i, a, given, q, ok }] (문항 · 시도 순)
  function bossTries(L, R, uid) {
    const out = [], t = ((R.bossTry || {})[uid]) || {}, old = ((R.bossAns || {})[uid]) || {};
    Object.entries(t).forEach(([i, byA]) => Object.entries(byA || {}).forEach(([a, given]) => { if (given == null || given === '') return; const q = bossItem(L, R, uid, Number(i), Number(a)); out.push({ i: Number(i), a: Number(a), given, q, ok: !!q && DS.Quiz.grade(q, given) }); }));
    [1, 2].forEach((set) => (old[set] || []).forEach((given, i) => { if (given == null || given === '' || !L.boss.sets[set] || !L.boss.sets[set][i]) return; const q = L.boss.sets[set][i]; out.push({ i, a: set - 1, given, q, ok: DS.Quiz.grade(q, given), legacy: true }); }));
    return out.sort((x, y) => x.i - y.i || x.a - y.a);
  }
  // 문항별 [시도 수, 맞힘, 첫 시도 맞힘, 남은 기회]
  function bossState(L, R, uid) {
    const tr = bossTries(L, R, uid);
    return Array.from({ length: L.boss.items }, (_, i) => {
      const mine = tr.filter((t) => t.i === i), ok = mine.some((t) => t.ok), first = mine.find((t) => t.a === 0);
      return { n: mine.length, ok, first: !!(first && first.ok), firstTried: !!first, left: ok ? 0 : Math.max(0, BOSS_TRIES - mine.length), next: mine.length ? Math.max(...mine.map((t) => t.a)) + 1 : 0 };
    });
  }
  const mastery = (L, R, uid) => bossState(L, R, uid).map((s) => s.ok);
  const bossFirst = (L, R, uid) => bossState(L, R, uid).map((s) => s.first);
  const bossAnswered = (R, uid) => keys(((R.bossTry || {})[uid]) || {}).length + keys(((R.bossAns || {})[uid]) || {}).length;
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
  // 수업 중 = 차원문이 열려 있고, 그 수업이 아직 마무리(마지막 한마디) · 끝 단계가 아님 (2026-11-03: 선생님이 목록에서 끝내기 전에도 풀리게)
  const roomDone = (st, live) => { const L = live && DS.Lessons && DS.Lessons.get(live.lesson); return !!(st && (st.closed || (L && (st.step ?? -1) >= L.steps.length))); };
  const inClass = (live, st, now) => liveOpen(live, now) && !roomDone(st, live);

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

  // ── 👾 몬스터 공격 시계 (2026-11-03 사용자 확정) ─────────────────
  // 반 전체가 같은 게이지: 모든 기기가 서버 시각으로 같은 값을 계산한다 (종합상황실 · 학생 폰 동시 공격)
  //   경과 = 서버 시각 − 단계 시작(state.stepAt) − 집중모드로 멈춘 시간(state.pauseMs · 지금 켜져 있으면 focusAt 부터) − ⛓ 몬스터 묶기 합계
  //   일반 45초마다 1초 잠금 · 보스 60초마다 2초 잠금 · 쓰러진 몬스터 · 이긴 보스는 공격 안 함
  //   ⛓ 몬스터 묶기 = 이미 다 맞힌 학생의 재도전에서 맞힌 소문제 1개당 1초, 학생 한 명 몬스터당 최대 4초 (성취감용, 늘어지지 않게)
  // 2026-11-03 수업 뒤 변경: 체력이 많을 때 빠르게 → 닳을수록 느리게 (폰만 보고 서두르는 학생이 펜을 들게, 끝까지 푸는 학생은 여유 있게)
  //   [가득일 때 주기, 거의 0 일 때 주기, 잠금 초] · 주기 = 빠름 + (느림 − 빠름) × (1 − 남은 체력 비율)
  const ATK = { monster: [20, 45, 1], boss: [30, 60, 2] }, BIND_PER = 1, BIND_MAX = 4;
  // 🟪 혼자 하는 중단원던전 공격 (2026-11-04 버그 고침): 레이드 값 [가장 빠름, 가장 느림, 멈춤] 중 「가장 느림마다 멈춤」 = 45초마다 1초
  //   (0.9.6.6 에서 ATK 가 세 칸이 된 뒤 중단원던전이 앞 두 칸을 [간격, 멈춤]으로 읽어 「20초마다 45초 멈춤」이 되던 것)
  const soloAtk = (cfg) => { const a = (cfg || ATK).monster; return a.length >= 3 ? { per: a[1], lock: a[2] } : { per: a[0], lock: a[1] }; };
  const BIND_TOKEN = 3; // 🔁 v3: 새 문제 해결 1번 = ⛓ 묶기 3초 (반 전체 상한은 DS.Combo 창 상한)
  const tokBinds = (R, mid, uid) => Object.values(healsOf(R, mid)[uid] || {}).filter((v) => typeof v === 'string' && v.startsWith('!bind')).map((v) => Number(v.split('@')[1]) || 0);
  function bindOf(L, R, mid, uid) {
    if (NEWR(R)) return tokBinds(R, mid, uid).length * BIND_TOKEN;
    const r = record(L, R, mid, uid); if (!r.perfect) return 0;
    return Math.min(BIND_MAX, r.tries.slice(r.perfectAt + 1).reduce((a, t) => a + t.correct, 0) * BIND_PER);
  }
  const bindTotal = (L, R, mid) => activeIds(R).reduce((a, u) => a + bindOf(L, R, mid, u), 0);
  // 📝 풀이 시간 (2026-11-06 사용자 「다 풀고 입력 · 60초 기본 · 내가 조절 · 어려운 문제 = 중단원 평가 기준」): 단계가 시작되면 sec 초 동안 입력 잠금 (학습지에 먼저)
  //   기본 = 중단원 평가 문항(monsters[id].evalQ)만 meta.solve(준비 · 기본 60초) · 교사가 state.solve(초) · state.solveOn[id] = { sec, at } 로 켜고 끄고 · state.solveEnd[id] = 지금 풀기
  function solveLock(L, R, now) {
    const st = R.state || {}, step = stepOf(L, R); if (!step || st.closed || !L || !['monster', 'boss'].includes(step.kind)) return null;
    const id = step.kind === 'boss' ? 'boss' : step.id, mon = step.kind === 'boss' ? L.boss || {} : (L.monsters || {})[id] || {};
    const man = (st.solveOn || {})[id], base = st.solve != null ? Number(st.solve) : (R.meta || {}).solve != null ? Number(R.meta.solve) : 60;
    const sec = man ? Number(man.sec) : man === 0 ? 0 : (NEWR(R) || mon.evalQ) ? base : 0; // 🌫 v3 (2026-11-09 #17): 모든 몬스터 · 보스 앞에 정찰 (기본 60초 · 선생님 「⚔ 등장!」으로 일찍)
    if (!(sec > 0)) return null;
    const t0 = man && man.at ? Number(man.at) : st.stepAt != null ? Number(st.stepAt) : now, end = Math.min(t0 + sec * 1000, Number((st.solveEnd || {})[id]) || Infinity);
    return { id, sec, t0, end, left: Math.max(0, end - now), on: now < end };
  }
  const readyOf = (R, id) => keys(((R.ready || {})[id]) || {}).filter((u) => (R.active || {})[u]); // 🌫 정찰 「✋ 준비 완료」 누른 학생
  function atkClock(L, R, now, cfg) {
    const st = R.state || {}, step = stepOf(L, R); if (!step || st.closed) return null;
    const kind = step.kind === 'monster' && L.monsters[step.id] && !cleared(L, R, step.id) ? 'monster' : step.kind === 'boss' && !bossHp(L, R).won ? 'boss' : null;
    if (!kind) return null;
    // v0.9.11: ⛓ 묶기 = 연습 공격 + ✨ 퍼펙트 + 🔥 콤보 단계 + 🦇 박쥐 (DS.Combo · 30초 창마다 10초 상한) · 보스도 묶임
    const a = (cfg || ATK)[kind], bind = DS.Combo ? DS.Combo.bindFor(L, R, kind === 'monster' ? step.id : 'boss', null, now) : kind === 'monster' ? bindTotal(L, R, step.id) : 0;
    const hp = kind === 'monster' ? monsterHp(L, R, step.id) : bossHp(L, R), ratio = hp.max ? Math.max(0, Math.min(1, hp.left / hp.max)) : 1;
    const per = a.length >= 3 ? a[0] + (a[1] - a[0]) * (1 - ratio) : a[0];
    // 👑 보스 단계 멈춤 (v0.9.11): 체력 100~67% 4초 · 66~34% 3초 · 33~0% 2초 (시험용 cfg 를 주면 그 값 그대로)
    const phase = kind === 'boss' && !cfg && DS.Combo ? DS.Combo.bossPhase(ratio) : null, lock = phase ? phase.lock : a[a.length - 1];
    const sl = solveLock(L, R, now), slHeld = sl ? Math.max(0, Math.min(now, sl.end) - sl.t0) : 0; // 📝 풀이 시간 동안 몬스터도 꽁꽁 (공격 시계 멈춤)
    const rest = st.rest && st.rest.at != null ? st.rest : null, paused = !!st.focus || !!rest || !!(sl && sl.on), start = st.stepAt != null ? st.stepAt : now;
    const held = (st.focus ? now - (st.focusAt != null ? st.focusAt : now) : 0) + (rest ? Math.max(0, now - rest.at) : 0) + slHeld;
    const t = Math.max(0, (now - start - (st.pauseMs || 0) - held) / 1000 - bind);
    return { kind, mid: step.id || 'boss', per, lock, phase: phase ? phase.phase : 0, bind, paused, ratio, t, k: Math.floor(t / per), p: (t % per) / per };
  }
  // 게이지 진행 (기기마다 같은 규칙): 주기가 체력에 따라 바뀌어도 게이지가 거꾸로 튀지 않게 「이번 바퀴 시작 시각」을 기억한다
  //   memo = { key, start } (기기에서 들고 있음) · 모든 기기가 같은 서버 시각 t 와 같은 체력으로 계산 → 거의 같은 순간 공격
  function atkTrack(memo, c, key) {
    if (memo.key !== key) { memo.key = key; memo.start = c.t - (c.t % c.per); }
    if (c.t < memo.start) memo.start = Math.max(0, c.t - (c.t % c.per)); // ⛓ 묶기로 시계가 뒤로 → 이번 바퀴 다시
    const p = (c.t - memo.start) / c.per;
    if (p >= 1) { memo.start += c.per; return { p: 0, strike: true }; }
    return { p, strike: false };
  }
  // ⏳ 보스 타임바: 마감 = 교시 끝 (+5분 연장 한 번) · null = 제한 없음
  const deadline = (R) => { const d = R && ((R.state && R.state.deadline) || (R.meta && R.meta.deadline)); return d ? d + (Number((R.state || {}).extend) || 0) * 60e3 : null; }; // state.deadline = 수업 시작 때 잡은 50분 (2026-11-06)
  const timeLeft = (R, now) => { const d = deadline(R); return d == null ? null : Math.max(0, d - now); };
  // 던전 진행: 지나온 단계 / 전체 (마무리 = 끝)
  const progress = (L, R) => { const i = (R.state || {}).step ?? -1, n = L.steps.length; return Math.max(0, Math.min(1, (i + (isEnd(L, R) || bossHp(L, R).won ? 1 : 0)) / n)); };
  return { chainDown, isChain, chainItems, chainSubs, CHAIN_SLOTS, readyOf, NEWR, variantOf, BIND_TOKEN, tokBinds, solveLock, BOSS_TRIES, bossItem, bossTries, bossState, bossFirst, bossAnswered, skipped, deadline, timeLeft, progress, ATK, soloAtk, BIND_PER, BIND_MAX, bindOf, bindTotal, atkClock, atkTrack, RETRIES, HEAL_MAX, healsOf, healsGiven, healsTo, healsReceived, healTarget, ultUsed, perfStreak, TRUE_SEC, isTrue, petrify, LIVE_MS, lateIds, liveOpen, roomDone, inClass, activeIds, teacherUid, num, newRoom, stepOf, isLobby, isEnd, isFinale, isClosed, focusOn, restOn, sheetOn, videoOn, autoFocus, fullMarks, canLobby, online, seedOf, itemsFor, attemptsOf, gradeAttempt, record, resultLabel, headcount, pctOf, monsterHp, waiting, allSubmitted, cleared, mastery, bossHp, helpList };
})();
