// ⚖ 밸런스 게임 (v0.9.7.7 · 쉼터 놀이 · 사용자 확정 2026-11-04): 둘 중 하나 고르기 → 시간이 끝나면 우르르 → 적은 쪽 탈락 → 2명 이하 남으면 우승
//   방 rooms/{코드}/fun = 진행 상태(교사 · 종합상황실만 씀) · rooms/{코드}/fv/{판}/{uid} = 'a' | 'b' (학생 자기 것만 · 고르는 시간에만)
//   규칙: 비기면 · 모두 같은 쪽이면 탈락 없음 · 안 고르면 탈락 · 모두 탈락하게 되면 그 판은 없던 일 · 탈락자 = 관객석(골라도 결과엔 영향 없음)
//   시간: 1 · 2판 15초 · 3판부터 5초 (2026-11-05 사용자: 10초 → 5초) · 공개 6초 · 4분이 지나면 다음 판이 마지막(살아 있는 사람 모두 우승)
//   ✊✌✋ 가위바위보 (2026-11-05 사용자: 인원이 적으면 한쪽으로 몰려 안 끝남): ⚖ · 🔄 에서 살아 있는 사람이 5명 이하면 그 판부터 선생님(컴퓨터) 손과 가위바위보
//     → 진 사람 · 안 낸 사람 탈락 · 이기거나 비기면 살아남음 · 모두 지면 그 판은 없던 일 · 선생님 손 = 판마다 정해진 무작위(g · 판 번호)
//   진행(시계)은 교사 폰 · 종합상황실 중 한 대가 맡음 (drv: 4초 넘게 소식이 없으면 다른 기기가 이어받음)
//   v0.9.8.0 놀이 종류 (fun.kind): bal ⚖ 밸런스(적은 쪽 탈락 · 무너지는 다리) · rev 🔄 반대로(많은 쪽 탈락 · 침대 숙소 · 스프링으로 띠용) · ox ⭕ 수학 OX(틀리면 탈락 · 얼음 시험장 · 그 반 지금 차시까지)
window.DS = window.DS || {};

DS.Fun = (function () {
  const N = () => DS.Net, Q = () => DS.FunQ.list, OXL = () => (DS.FunOX || { list: [] }).list;
  const KIND = {
    bal: { name: '⚖ 밸런스 게임', short: '⚖ 밸런스', rule: '적은 쪽이 탈락!', out: '적은 쪽이라', list: Q, pre: '' },
    rev: { name: '🔄 반대로 밸런스', short: '🔄 반대로', rule: '이번엔 많은 쪽이 탈락!', out: '많은 쪽이라', list: Q, pre: '' },
    ox: { name: '⭕ 수학 OX', short: '⭕ 수학 OX', rule: '틀리면 탈락!', out: '틀려서', list: OXL, pre: 'x' },
    quiz: { name: '⭕ OX 타임', short: '⭕ OX 타임', rule: '탈락 없는 복습!', out: '', list: OXL, pre: 'q' }, // v0.9.8.1 수업 중 · 5문장 · 반 정답률
  };
  if (DS.OFF && DS.OFF('ox')) { delete KIND.ox; delete KIND.quiz; } // 🏫 학교판 = ⭕ OX 없음 (집합 · 명제 문장이라)
  const K = (f) => KIND[(f && f.kind) || 'bal'] || KIND.bal;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const T = () => (typeof window !== 'undefined' && window.DS_FUN) || {}; // 시험용 시간 줄이기 (e2e48)
  const QN = 5; // OX 타임 문장 수
  const PICK = (n, kind) => T().pick || (kind === 'quiz' ? 10000 : n <= 2 ? 15000 : 5000), SHOW = 6500, LIMIT = 240000, MIN = 3, QUEUE = 24;
  const RPS_AT = 5, HANDS = ['✊ 바위', '✌️ 가위', '✋ 보'], HAND_EMO = { a: '✊', b: '✌️', c: '✋' }, HAND_KO = { a: '바위', b: '가위', c: '보' }; // 교실 TV 는 이모지 글꼴이 없을 수 있어 글자도 함께
  const BEATS = { a: 'b', b: 'c', c: 'a' }; // 바위 > 가위 > 보 > 바위 (선생님 손이 이기는 손)
  const rpsOn = (f) => (f.kind === 'bal' || f.kind === 'rev' || !f.kind) && Object.keys(f.alive || {}).length <= RPS_AT;
  const tHand = (g, n) => { let h = 2166136261; for (const ch of `${g}|${n}|rps`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15; return 'abc'[(h >>> 0) % 3]; };
  // ✊✌✋ 판정 (순수 함수): hand = 선생님 손 · 그 손에 지는 손을 낸 사람 + 안 낸 사람 탈락 · 모두 탈락이면 없던 일
  function judgeRps(alive, votes, hand) {
    votes = votes || {};
    const by = (k) => alive.filter((u) => votes[u] === k), a = by('a'), b = by('b'), c = by('c'), none = alive.filter((u) => !['a', 'b', 'c'].includes(votes[u]));
    const lose = BEATS[hand];
    let out = [...none, ...by(lose)], left = alive.filter((u) => !out.includes(u)), voided = false;
    if (!left.length) { out = []; left = alive.slice(); voided = true; }
    return { a, b, c, none, lose, hand, out, left, voided };
  }
  const SHOWMS = () => T().show || SHOW;
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const P = (code, s) => `rooms/${code}/${s}`;

  // DB 는 배열을 객체로 돌려주거나 빈 배열을 지운다 → 읽을 때 배열로 맞춤
  const arr = (x) => (Array.isArray(x) ? x : x && typeof x === 'object' ? Object.keys(x).sort((p, q) => p - q).map((k) => x[k]) : []);
  function norm(f) {
    if (!f) return f;
    const r = f.res ? { ...f.res, a: arr(f.res.a), b: arr(f.res.b), c: arr(f.res.c), none: arr(f.res.none), out: arr(f.res.out) } : f.res;
    return { ...f, queue: arr(f.queue), q: arr(f.q), win: arr(f.win), res: r };
  }
  // ── 판정 (순수 함수 · tests/fun.test.js) ─────────────────
  //   kind: bal = 적은 쪽 · rev = 많은 쪽 · ox = 정답(ans)이 아닌 쪽 (사람이 없어도 그쪽)
  function judge(alive, votes, kind = 'bal', ans = '') {
    votes = votes || {};
    const a = alive.filter((u) => votes[u] === 'a'), b = alive.filter((u) => votes[u] === 'b'), none = alive.filter((u) => votes[u] !== 'a' && votes[u] !== 'b');
    const lose = kind === 'ox' ? (ans === 'a' ? 'b' : 'a')
      : a.length && b.length && a.length !== b.length ? ((kind === 'rev' ? a.length > b.length : a.length < b.length) ? 'a' : 'b') : '';
    let out = [...none, ...(lose === 'a' ? a : lose === 'b' ? b : [])];
    let left = alive.filter((u) => !out.includes(u)), voided = false;
    if (!left.length) { out = []; left = alive.slice(); voided = true; } // 모두 탈락 → 이 판은 없던 일
    return { a, b, none, lose, out, left, voided };
  }
  // 질문 줄: 이 반이 안 쓴 것부터 섞어서 (다 쓰면 처음부터)
  // 쏠린 질문 (실제로 2번 이상 해서 적은 쪽이 평균 25% 아래) → 줄에서 뺌 · 심리전이 되는 반반 질문만 남김
  const tilted = (st) => !!(st && st.n >= 2 && st.m / st.n < 0.25);
  //   pool = 고를 수 있는 번호(수학 OX: 그 반 지금 차시까지) · pre = 쓴 질문 기록 앞글자(OX 는 'x')
  function queue(used, n = QUEUE, rnd = Math.random, stats = null, pool = null, pre = '') {
    const base = pool || Q().map((_, i) => i);
    n = Math.min(n, base.length);
    const ok = base.filter((i) => !tilted((stats || {})[i]));
    const all = ok.length >= n ? ok : base, fresh = all.filter((i) => !(used || {})[pre + i]);
    const mix = (arr) => { const x = arr.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
    const q = mix(fresh).slice(0, n);
    return { q: q.length < n ? [...q, ...mix(all.filter((i) => !q.includes(i))).slice(0, n - q.length)] : q, reset: fresh.length < n };
  }
  const round = (f, n, now) => {
    const qi = f.queue[(n - 1) % f.queue.length], x = K(f).list()[qi], ox = f.kind === 'ox' || f.kind === 'quiz';
    const rps = !ox && rpsOn(f);
    return { n, rk: `r${n}`, qi, rps, q: rps ? HANDS.slice() : ox ? ['⭕ 맞다', '❌ 아니다'] : [x[0], x[1]], s: ox ? x.t : null, ans: ox ? (x.a ? 'a' : 'b') : null, why: ox ? x.why : null, phase: 'pick', from: now, to: now + PICK(n, f.kind), final: now - f.at0 >= LIMIT, res: null, until: null };
  };
  // 다음 상태 (바뀔 게 없으면 null) — 시계를 맡은 기기가 부름
  function step(f, votes, now) {
    f = norm(f);
    if (!f || f.phase === 'end') return null;
    if (f.phase === 'pick' && now >= f.to) {
      const alive = Object.keys(f.alive || {});
      if (f.kind === 'quiz') { // ⭕ OX 타임: 탈락 없음 · 사람마다 o / x / - 를 쌓고 · 판마다 반 정답률
        const r = judge(alive, votes, 'ox', f.ans), ok = f.ans === 'a' ? r.a : r.b, marks = { ...(f.marks || {}) };
        alive.forEach((u) => { marks[u] = (marks[u] || '') + (ok.includes(u) ? 'o' : r.none.includes(u) ? '-' : 'x'); });
        const hist = [...arr(f.hist), { qi: f.qi, ok: ok.length, n: alive.length }];
        return { ...f, phase: 'show', until: now + SHOWMS(), res: { a: r.a, b: r.b, none: r.none, lose: r.lose, out: [], voided: false, sa: 0, sb: 0 }, marks, hist };
      }
      // 💤 #57 ⑫ (2026-11-10): ⚖ · 🔄 (가위바위보 판 포함) 에서 시간 안에 안 고른 학생 = 탈락이 아니라 💤 관전 (남은 수 · 결과 · 상에서 빠짐) · 관전 중에 아무거나 고르면 다음 판부터 다시
      const zzOn = f.kind === 'bal' || f.kind === 'rev' || !f.kind, spect = Object.keys(votes || {}).filter((u) => !(f.alive || {})[u]), back = zzOn ? spect.filter((u) => (f.zz || {})[u]) : [];
      const sleep = (r) => (zzOn && !r.voided ? r.none : []), zzOf = (r) => ({ ...(f.zz || {}), ...Object.fromEntries(sleep(r).map((u) => [u, f.n])) }), outOf = (r) => r.out.filter((u) => !sleep(r).includes(u));
      if (f.rps) { // ✊✌✋
        const r = judgeRps(alive, votes, tHand(f.g, f.n)), out = outOf(r);
        return { ...f, phase: 'show', until: now + SHOWMS(), res: { a: r.a, b: r.b, c: r.c, none: r.none, zz: sleep(r), lose: r.lose, hand: r.hand, out, voided: r.voided, sa: 0, sb: 0 }, alive: Object.fromEntries(r.left.map((u) => [u, true])), outAt: { ...(f.outAt || {}), ...Object.fromEntries(out.map((u) => [u, f.n])) }, zz: zzOf(r), back };
      }
      const r = judge(alive, votes, f.kind || 'bal', f.ans), out = outOf(r);
      const sa = spect.filter((u) => votes[u] === 'a').length;
      return { ...f, phase: 'show', until: now + SHOWMS(), res: { a: r.a, b: r.b, none: r.none, zz: sleep(r), lose: r.lose, out, voided: r.voided, sa, sb: spect.length - sa }, alive: Object.fromEntries(r.left.map((u) => [u, true])), outAt: { ...(f.outAt || {}), ...Object.fromEntries(out.map((u) => [u, f.n])) }, zz: zzOf(r), back };
    }
    if (f.phase === 'show' && now >= f.until) {
      const back = arr(f.back).filter((u) => (f.zz || {})[u]), left = [...new Set([...Object.keys(f.alive || {}), ...back])], zz = { ...(f.zz || {}) }; back.forEach((u) => { delete zz[u]; }); // 💤 → 다음 판부터 다시
      if (back.length) f = { ...f, alive: Object.fromEntries(left.map((u) => [u, true])), zz, back: [] };
      if (f.kind === 'quiz') return f.n >= Math.min(QN, f.queue.length) ? { ...f, phase: 'end', win: [], endAt: now } : { ...f, ...round(f, f.n + 1, now) };
      if (left.length <= 2 || f.final) return { ...f, phase: 'end', win: left, endAt: now };
      return { ...f, ...round(f, f.n + 1, now) };
    }
    return null;
  }

  // ── 교사 · 종합상황실 ───────────────────────────────────
  const studentsIn = (R) => Object.keys(R.players || {}).filter((u) => !R.players[u].teacher && (R.active || {})[u]);
  async function start(code, R, kind = 'bal', which = 'now', opt = {}) { // which (OX 타임): prev = 지난 차시 · now = 이번 차시 · opt = 🏰 디펜스 옵션 (테스트 모드)
    if (kind === 'td' && DS.TD) { await N().set(P(code, 'fv'), null).catch(() => {}); return DS.TD.start(code, R, opt); } // 🏰 타워 디펜스 (2026-11-07)
    if (kind === 'nun' && DS.Nunchi) { await N().set(P(code, 'fv'), null).catch(() => {}); return DS.Nunchi.start(code, R); } // 🙊 눈치 게임 (2026-11-08)
    kind = KIND[kind] ? kind : 'bal';
    const k = KIND[kind], alive = studentsIn(R);
    if (kind !== 'quiz' && alive.length < MIN) throw Object.assign(new Error(`${k.name}은 ${MIN}명 이상일 때 할 수 있어요 (지금 ${alive.length}명)`), { user: true });
    const cls = (R.meta || {}).cls, now = N().now();
    const L = DS.Lessons && DS.Lessons.get((R.meta || {}).lesson), no = (L && L.no) || 99;
    const pickNo = (want) => OXL().map((x, i) => (x.no === want ? i : -1)).filter((i) => i >= 0);
    const pool = kind === 'ox' ? OXL().map((x, i) => (x.no <= no ? i : -1)).filter((i) => i >= 0)
      : kind === 'quiz' ? ((which === 'prev' && pickNo(no - 1).length) ? pickNo(no - 1) : pickNo(no).length ? pickNo(no) : pickNo(no - 1)) : null;
    if (kind === 'quiz' && alive.length < 1) throw Object.assign(new Error('입장한 학생이 없어요'), { user: true });
    if (pool && !pool.length) throw Object.assign(new Error('이 차시까지는 수학 OX 문제가 없어요'), { user: true });
    const used = cls ? await N().get(`funUsed/${ck(cls)}`).catch(() => null) : null, stats = kind === 'ox' ? null : await N().get('funStats').catch(() => null);
    const { q, reset } = queue(used, QUEUE, Math.random, stats, pool, k.pre);
    if (cls && reset) await N().update(`funUsed/${ck(cls)}`, Object.fromEntries((pool || Q().map((_, i) => i)).map((i) => [k.pre + i, null]))).catch(() => {}); // 그 종류 질문만 처음부터
    const f0 = { g: now, kind, which, lesson: (R.meta || {}).lesson || null, total: alive.length, at0: now, queue: q, alive: Object.fromEntries(alive.map((u) => [u, true])), outAt: {}, drv: { u: N().uid(), at: now } };
    await N().set(P(code, 'fv'), null);
    await N().set(P(code, 'fun'), { ...f0, ...round(f0, 1, now) });
    mark(cls, k.pre + q[0]);
    drive(code);
  }
  // 쏠림 재기: 이 판에 고른 사람(관객 포함)이 4명 이상이면 funStats/{질문} 에 적은 쪽 비율을 더함
  async function tally(f) {
    const r = f.res || {}, a = arr(r.a).length + (r.sa || 0), b = arr(r.b).length + (r.sb || 0);
    if (a + b < 4 || f.qi == null) return;
    const st = (await N().get(`funStats/${f.qi}`).catch(() => null)) || { n: 0, m: 0 };
    await N().set(`funStats/${f.qi}`, { n: (st.n || 0) + 1, m: Math.round(((st.m || 0) + Math.min(a, b) / (a + b)) * 1000) / 1000 }).catch(() => {});
  }
  const mark = (cls, qi) => { if (cls != null && qi != null) N().set(`funUsed/${ck(cls)}/${qi}`, true).catch(() => {}); };
  async function stop(code) { await N().set(P(code, 'fun'), null); await N().set(P(code, 'fv'), null).catch(() => {}); }
  // ⏸ #117 (2026-11-12 선생님 「모든 시간 멈춤」): 쉼터 중에 선생님이 켠 집중(state.fzAt) 동안 놀이 시계를 멈춤 → 끄면 멈춘 만큼 to · lastAt 을 뒤로 (잃는 시간 없음)
  //   fun/frz = 멈춘 시각 (기기가 바뀌어도 같은 값) · 🏰 디펜스(실시간 계산)는 아직 그대로
  async function hold(code, f, now) {
    const fz = await N().get(P(code, 'state/fzAt')).catch(() => null);
    if (fz != null) { if (f.frz == null) await N().set(P(code, 'fun/frz'), Number(fz)).catch(() => {}); return true; }
    if (f.frz != null) { const span = Math.max(0, now - Number(f.frz)), up = { frz: null }; ['to', 'lastAt'].forEach((k) => { if (typeof f[k] === 'number') up[k] = f[k] + span; }); await N().update(P(code, 'fun'), up).catch(() => {}); return true; }
    return false;
  }
  // 시계: 0.7초마다 · 맡은 기기만 씀
  const drivers = {};
  function drive(code) {
    if (drivers[code]) return;
    let busy = false;
    drivers[code] = setInterval(async () => {
      if (busy) return; busy = true;
      try {
        const f = await N().get(P(code, 'fun')).catch(() => null), me = N().uid(), now = N().now();
        if (!f) { clearInterval(drivers[code]); delete drivers[code]; return; }
        if (f.kind === 'td' || f.kind === 'nun') return; // 🏰 디펜스 · 🙊 눈치는 교실 TV 가 진행
        if (f.drv && f.drv.u !== me && now - (f.drv.at || 0) < 4000) return; // 다른 기기가 맡고 있음
        if (f.phase !== 'end' && await hold(code, f, now)) return; // ⏸ #117 집중 = 놀이 시계 멈춤
        if (f.phase === 'end' && f.kind === 'quiz' && !f.saved) { await N().set(P(code, `oxq/${f.g}`), { qs: arr(f.queue).slice(0, f.n), marks: f.marks || {}, lesson: f.lesson || null, at: f.g }).catch(() => {}); await N().set(P(code, 'fun/saved'), true).catch(() => {}); } // 📊 OX 타임 결과 → 개인 기록(ox) · 대시보드
        if (f.phase === 'end') { if (now - (f.endAt || now) > 60000) await stop(code); else if (!f.drv || f.drv.u !== me || now - f.drv.at > 1500) await N().set(P(code, 'fun/drv'), { u: me, at: now }); return; }
        const votes = f.phase === 'pick' && now >= f.to ? (await N().get(P(code, `fv/${f.rk}`)).catch(() => null)) || {} : null;
        const nx = step(f, votes, now);
        if (nx) {
          nx.drv = { u: me, at: now };
          await N().set(P(code, 'fun'), nx);
          if (nx.phase === 'show' && nx.kind !== 'ox' && !nx.rps) tally(nx);
          if (nx.phase === 'pick' && nx.n !== f.n && !nx.rps) { const R = await N().get(P(code, 'meta')).catch(() => null); mark(R && R.cls, K(nx).pre + nx.qi); }
        } else if (!f.drv || f.drv.u !== me || now - f.drv.at > 1500) await N().set(P(code, 'fun/drv'), { u: me, at: now });
      } finally { busy = false; }
    }, 700);
  }
  // 교사 폰 쉼터 칸 · 종합상황실 아이콘 줄
  const status = (R) => {
    const f = R.fun; if (!f) return '';
    if (f.kind === 'td') return '🏰 타워 디펜스';
    if (f.kind === 'nun') return '🙊 눈치 게임';
    const n = Object.keys(f.alive || {}).length;
    if (f.kind === 'quiz') return `${K(f).short} · ${f.phase === 'end' ? '끝' : `${f.n} / ${Math.min(QN, arr(f.queue).length)}`}`;
    return `${K(f).short} · ${f.phase === 'end' ? `🏆 우승 ${arr(f.win).length}명` : `${f.n}판 · 생존 ${n}명`}`;
  };
  const ctlHtml = (R) => (R.fun && R.fun.kind === 'td' && DS.TD ? DS.TD.ctlHtml(R) : R.fun && R.fun.kind === 'nun' && DS.Nunchi ? DS.Nunchi.ctlHtml(R) : R.fun
    ? `<div class="fun-ctl"><span>${esc(status(R))}</span><button class="btn small" data-fun="stop">⏹ 게임 끝</button><button class="btn small" data-fun="again">🔄 새 게임</button></div>`
    : `<div class="fun-ctl pick"><span class="muted small">쉬는 시간 놀이</span>${Object.entries(KIND).filter(([k]) => k !== 'quiz').map(([k, v]) => `<button class="btn small fun-btn k-${k}" data-fun="start:${k}" title="${esc(v.rule)}">${esc(v.short)}</button>`).join('')}<button class="btn small fun-btn k-quiz" data-oxq="prev" title="탈락 없는 복습 5문장">⭕ OX 지난</button><button class="btn small fun-btn k-quiz" data-oxq="now" title="이번 차시 점검 5문장">⭕ OX 오늘</button><button class="btn small fun-btn k-nun" data-fun="start:nun" title="1부터 차례로 외치기 · 겹치면 탈락 (교실 TV 필요)">🙊 눈치</button><button class="btn small fun-btn k-td" data-fun="start:td" title="반 모두 타워가 되어 성을 지켜요 (교실 TV 필요)">🏰 디펜스</button></div>`); // 2026-11-05: OX 타임은 쉼터 안에서만
  function bind(el, code, R, opt) { // opt (🧪 테스트 모드): 🏰 디펜스 옵션을 돌려주는 함수
    if (R.fun) drive(code);
    if (R.fun && R.fun.kind === 'td' && DS.TD) DS.TD.bindCtl(el, code, R);
    if (R.fun && R.fun.kind === 'nun' && DS.Nunchi) { DS.Nunchi.setCode(code); DS.Nunchi.bindCtl(el, code, R); }
    el.querySelectorAll('[data-fun]').forEach((b) => (b.onclick = () => DS.Control.run(async () => {
      const k = b.dataset.fun;
      if (k === 'stop') return stop(code);
      if (k === 'again' && !window.confirm('새 게임을 시작할까요? (지금 판은 끝나요)')) return;
      await start(code, R, k === 'again' ? (R.fun || {}).kind : k.split(':')[1], k === 'again' ? (R.fun || {}).which : 'now', typeof opt === 'function' ? opt() : opt || {});
    })));
  }

  // ── 그리기 (학생 폰 · 종합상황실 공용 조각) ──────────────
  const A = () => DS.ASSETS.fun || {};
  const nameOf = (R, u) => (R.players[u] || {}).nick || '';
  const heroOf = (R, u) => DS.Art.hero((R.players[u] || {}).hero || 0, 'idle', 'small');
  // 무대 그림: 종류마다 (rev = 침대 숙소 그림이 오기 전엔 CSS · ox = 다리 그림을 얼음빛으로)
  const bgOf = (kind) => (kind === 'rev' ? A().bgRev : kind === 'quiz' ? A().bgQuiz || A().bgOx || A().bg : kind === 'ox' ? A().bgOx || A().bg : A().bg) || null;
  // ⭕ OX 전용 발판 그림 (2026-11-07): 서바이벌 = ⭕ · ❌ 발판이 낭떠러지 위에 · 틀린 쪽은 무너지는 그림으로 바뀌고 아래로 / OX 타임 = 바닥이 다 있는 배경(발판 그림 없음)
  const oxArt = (kind) => !!(A().ox && (kind === 'ox' || kind === 'quiz'));
  const oxImg = (side, broken) => `url('${DS.ASSETS.base}${A().ox[side + (broken ? 'Break' : '')]}')`;
  const platAt = (kind, side) => (oxArt(kind) ? (kind === 'ox' ? ` style="background-image:${oxImg(side)}"` : '') : platStyle());
  const platStyle = () => (A().plat ? ` style="background-image:url('${DS.ASSETS.base}${A().plat}')${A().platFrames > 1 ? `;background-size:${A().platFrames * 100}% auto;background-position:0 0` : ''}"` : ''); // 발판 그림 2칸 = 멀쩡 · 금 감 (2026-11-05)
  const left = (f) => Math.max(0, Math.round((f.to - N().now()) / 1000));
  if (typeof document !== 'undefined') setInterval(() => document.querySelectorAll('[data-fun-end]').forEach((e) => { e.textContent = Math.max(0, Math.round((Number(e.dataset.funEnd) - N().now()) / 1000)); }), 250);
  // 자리: 무리 안에서 i 번째 (가로 cols 칸)
  const spot = (i, n, x0, x1, y0, cols, dy = 9) => { const c = Math.max(1, Math.min(cols, n)), r = Math.floor(i / c), k = i % c, w = (x1 - x0) / c; return { x: x0 + w * (k + 0.5) + (r % 2 ? w * 0.25 : 0), y: y0 + r * dy }; };
  // 종합상황실 · 학생 폰 같은 무대 (big: 종합상황실)
  function stage(R, f, big, me) {
    const alive = Object.keys(f.alive || {}), res = f.res || {}, show = f.phase === 'show';
    const inPlay = show ? [...res.a, ...res.b, ...(res.c || []), ...res.none] : f.phase === 'end' && f.kind !== 'quiz' ? (f.win || []) : alive;
    const spect = Object.keys(R.players || {}).filter((u) => !R.players[u].teacher && !inPlay.includes(u) && (R.active || {})[u]);
    const cols = big ? 6 : 4;
    const bib = (u) => String((R.players[u] || {}).num || 0).padStart(2, '0'); // 🔄 반대로: 이름 대신 번호표
    const fig = (u, x, y, cls = '') => `<div class="fa-h${cls}${u === me ? ' me' : ''}" data-u="${u}" style="left:${x}%;top:${y}%" ${show ? `data-go="${res.a.includes(u) ? 'a' : res.b.includes(u) ? 'b' : (res.c || []).includes(u) ? 'c' : 'n'}"` : ''}>${show && f.rps ? `<i class="fa-hand${res.out.includes(u) ? ' lose' : ''}">${res.a.includes(u) ? HAND_KO.a : res.b.includes(u) ? HAND_KO.b : (res.c || []).includes(u) ? HAND_KO.c : '안 냄'}</i>` : ''}${heroOf(R, u)}${(f.kind || 'bal') === 'rev' ? `<b class="bib">${bib(u)}</b>${big ? `<b class="fa-nm">${esc(nameOf(R, u))}</b>` : ''}` : big || u === me ? `<b>${esc(u === me ? '나' : nameOf(R, u))}</b>` : ''}</div>`;
    const py = (f.kind || 'bal') === 'rev' ? 68 : 50; // 🔄 숙소 그림: 바닥이 아래쪽
    const wide = big && (f.kind || 'bal') === 'rev'; // 🔄 2026-11-13 TV 이름 크게: 반대로 = 숙소 바닥을 넓게 써서 이름이 겹치지 않게 (8칸 · 줄 간격 넓게 · 위로 당김)
    const plaza = inPlay.map((u, i) => { const s = wide ? spot(i, inPlay.length, 16, 84, inPlay.length > 16 ? 50 : 58, 8, 12) : spot(i, inPlay.length, 34, 66, py, big ? 5 : 4); return wide ? fig(u, s.x, s.y).replace('style="', `style="z-index:${3 + Math.max(0, 9 - Math.floor(s.y / 10))};`) : fig(u, s.x, s.y); }).join(''); // 윗줄 이름이 아랫줄 용사에 가리지 않게
    const gal = spect.slice(0, big ? 24 : 10).map((u, i) => `<div class="fa-g${u === me ? ' me' : ''}" style="left:${4 + (i * (92 / Math.max(1, Math.min(spect.length, big ? 24 : 10))))}%">${heroOf(R, u)}</div>`).join('');
    const lose = show ? res.lose : '';
    const kind = f.kind || 'bal', bg = bgOf(kind), spring = kind === 'rev' ? '<i class="fa-spring"></i>' : '';
    return `<div class="fa-arena k-${kind}${big ? ' big' : ''}${bg || kind === 'rev' ? ' img' : ''}${oxArt(kind) ? ' oxart' : A().plat ? ' pimg' : ''}">${bg ? `<i class="fa-bg" style="background-image:url('${DS.ASSETS.base}${bg}')"></i>` : kind === 'rev' ? '<i class="fa-bg dorm"></i>' : ''}
      <div class="fa-gal">${gal}${spect.length ? `<span class="fa-gn">👀 관객 ${spect.length}</span>` : ''}</div>
      <div class="fa-pit l"></div><div class="fa-pit r"></div>
      ${f.rps ? `<div class="fa-rps">${show ? `<p>선생님</p><b>${HAND_EMO[res.hand] || '❔'}</b><em>${HAND_KO[res.hand] || ''}</em>` : '<p>선생님 손은…</p><b class="spin">✊✌️✋</b><em>바위 · 가위 · 보</em>'}</div>` : `<div class="fa-plat a${lose === 'a' ? ' doom' : ''}"${platAt(kind, 'a')}><i class="fa-flag">${kind === 'ox' || kind === 'quiz' ? '⭕' : esc(f.q[0])}</i>${show ? `<em class="fa-cnt">${res.a.length}</em>` : ''}${spring}</div>
      <div class="fa-plat b${lose === 'b' ? ' doom' : ''}"${platAt(kind, 'b')}><i class="fa-flag">${kind === 'ox' || kind === 'quiz' ? '❌' : esc(f.q[1])}</i>${show ? `<em class="fa-cnt">${res.b.length}</em>` : ''}${spring}</div>`}
      <div class="fa-plaza"></div>${plaza}${kind === 'rev' ? board(f) : ''}</div>`;
  }
  // 🔄 생존자 전광판 (그림의 아치 위 검은 판) · 안내 방송 자막 (판 시작 때 한 글자씩)
  function board(f) {
    const res = f.res || {}, now = Object.keys(f.alive || {}).length, before = f.phase === 'show' ? arr(res.a).length + arr(res.b).length + arr(res.none).length : now;
    const pad = (n) => String(n).padStart(2, '0');
    return `<div class="fa-board"><b data-after="${pad(now)}">${pad(before)}</b><span>/${pad(f.total || before)}</span></div><i class="fa-board-l">생존자</i>${f.phase === 'pick' ? `<div class="fa-ann"><i>📢</i><span>${f.n === 1 ? '참가자 여러분, ' : ''}이번 판은… 많은 쪽이 탈락합니다</span></div>` : ''}`;
  }
  // 공개 연출: 광장 → 자기 쪽 발판으로 우르르 → 적은 쪽 무너짐
  function animate(root, f, big) {
    if (f.rps) { const out = (f.res || {}).out || []; setTimeout(() => { root.querySelectorAll('.fa-h[data-u]').forEach((h) => { if (out.includes(h.dataset.u)) h.classList.add('fa-lost'); }); if (DS.Sound) { if (out.length && DS.Sound.buzz) DS.Sound.buzz(); else if (DS.Sound.card) DS.Sound.card(); } }, 900); return; } // ✊✌✋ 진 사람 회색
    const res = f.res || {}, cols = big ? 3 : 3, rev = f.kind === 'rev';
    const go = { a: res.a, b: res.b };
    setTimeout(() => {
      root.querySelectorAll('.fa-h[data-go]').forEach((h) => {
        const u = h.dataset.u, side = h.dataset.go;
        if (side === 'n') { h.classList.add('fa-lost'); return; }
        const i = go[side].indexOf(u), ox = oxArt(f.kind), s = ox ? spot(i, go[side].length, side === 'a' ? 7 : 75, side === 'a' ? 25 : 93, 47, cols) : spot(i, go[side].length, side === 'a' ? 2 : 81, side === 'a' ? 19 : 98, rev ? 50 : 46, cols); // ⭕ OX 발판 그림: 발판 윗면 위 // 발판 위 (그림 v1: 양옆 허공 위 떠 있는 발판)
        h.style.left = `${s.x}%`; h.style.top = `${s.y}%`; h.classList.add(side === 'a' ? 'run-l' : 'run-r');
      });
      if (DS.Sound && DS.Sound.card) DS.Sound.card();
    }, 300);
    if (res.lose && rev) setTimeout(() => { // 🔄 버저 → 전광판 빨갛게 · 숫자 줄어듦 → 띠용
      if (DS.Sound && DS.Sound.buzz) DS.Sound.buzz();
      const b = root.querySelector('.fa-board'); if (b) { b.classList.add('hot'); const n = b.querySelector('b'); if (n) setTimeout(() => { n.textContent = n.dataset.after; }, 500); }
    }, 1900);
    // 💥 바닥 꺼짐 (2026-11-05 사용자): 금이 감 → 발판이 조각조각 무너짐 → 용사가 빙글 떨어짐 · 먼지 · 흔들림 (폰은 내 쪽이면 진동)
    if (res.lose && f.kind !== 'quiz') setTimeout(() => {
      const plat = root.querySelector(`.fa-plat.${res.lose}`); if (plat && oxArt(f.kind)) plat.style.backgroundImage = oxImg(res.lose, true); /* ⭕ OX: 무너지는 발판 그림으로 */ else if (plat) { const c = document.createElement('i'); c.className = 'fa-crack'; plat.appendChild(c); if (A().platFrames > 1) plat.style.backgroundPosition = '100% 0'; } // 그림이 있으면 금 간 칸으로
      if (DS.Sound && DS.Sound.clank) DS.Sound.clank();
    }, 2000);
    if (res.lose && f.kind !== 'quiz') setTimeout(() => {
      const plat = root.querySelector(`.fa-plat.${res.lose}`);
      if (plat && oxArt(f.kind)) { plat.classList.add('ox-drop'); const dust = document.createElement('i'); dust.className = 'fa-dust'; plat.appendChild(dust); } // ⭕ OX: 무너진 발판이 통째로 떨어짐
      else if (plat) {
        const n = 6, bg = getComputedStyle(plat).backgroundImage, F = A().platFrames > 1 ? A().platFrames : 1; // 조각도 금 간 칸(마지막 칸)에서 자름
        plat.classList.add('broken');
        for (let i = 0; i < n; i++) {
          const pc = document.createElement('i'); pc.className = 'fa-piece';
          pc.style.cssText = `left:${(i * 100) / n}%;width:${100 / n + 0.6}%;background-image:${bg};background-size:${n * F * 100}% ${F > 1 ? 'auto' : '100%'};background-position:${F > 1 ? (((F - 1) * n + i) / (F * n - 1)) * 100 : (i / (n - 1)) * 100}% 0;--r:${(i % 2 ? 1 : -1) * (12 + ((i * 37) % 30))}deg;--dx:${(i - n / 2) * 6}px;animation-delay:${(Math.abs(i - (n - 1) / 2) * 0.09).toFixed(2)}s`;
          plat.appendChild(pc);
        }
        const dust = document.createElement('i'); dust.className = 'fa-dust'; plat.appendChild(dust);
      }
      root.querySelectorAll(`.fa-h[data-go="${res.lose}"]`).forEach((h, k) => { h.style.transitionDelay = `${0.12 + (k % 5) * 0.06}s`; h.classList.add('fall', 'tumble'); });
      root.classList.remove('fa-quake'); void root.offsetWidth; root.classList.add('fa-quake'); setTimeout(() => root.classList.remove('fa-quake'), 700);
      const me = root.querySelector(`.fa-h.me[data-go="${res.lose}"]`); if (me && navigator.vibrate) navigator.vibrate([120, 60, 200]);
      if (DS.Sound) { if (DS.Sound.hit) DS.Sound.hit(); if (DS.Sound.rumble) DS.Sound.rumble(); if (rev && DS.Sound.boing) setTimeout(() => DS.Sound.boing(), 350); }
    }, 2600);
  }
  const zzTag = (f) => { const n = Object.keys(f.zz || {}).length; return n && f.phase !== 'end' ? `<span class="fa-zz">💤 ${n}명 관전</span>` : ''; }; // #57 ⑫
  const head = (f) => zzTag(f) + (f.phase === 'end' ? `<b>${f.kind === 'quiz' ? '' : '🏆 '}${esc(K(f).name)} 끝!</b>`
    : f.rps ? `<b>✊✌️✋ 가위바위보 ${f.n}판${f.final ? ' · 마지막 판' : ''}</b><span class="fa-st">${Object.keys(f.alive || {}).length}명 남음 — 선생님과 가위바위보! 지면 탈락 · 이기거나 비기면 살아남아요</span>`
    : `<b>${esc(K(f).short)} ${f.kind === 'quiz' ? `${f.n} / ${Math.min(QN, arr(f.queue).length)}` : `${f.n}판`}${f.final && f.kind !== 'quiz' ? ' · 마지막 판' : ''}</b>${f.kind === 'ox' || f.kind === 'quiz' ? `<span class="fa-st">${esc(f.s)}</span>` : `<span class="fa-vs"><i class="a">${esc(f.q[0])}</i> vs <i class="b">${esc(f.q[1])}</i></span>`}<em class="fa-rule">${esc(K(f).rule)}</em>${f.phase === 'pick' ? `<span class="fa-t">⏱ <b data-fun-end="${f.to}">${left(f)}</b></span>` : ''}`);
  const verdict = (f) => {
    const r = f.res || {};
    if (f.kind === 'quiz') { const n = r.a.length + r.b.length + r.none.length, ok = (f.ans === 'a' ? r.a : r.b).length; return `정답 ${f.ans === 'a' ? '⭕' : '❌'} — ${esc(f.why)} · 반 정답률 ${n ? Math.round((100 * ok) / n) : 0}%`; }
    if (f.rps) { const lost = (r.lose === 'a' ? r.a : r.lose === 'b' ? r.b : r.c || []).length, nn = (r.none || []).length;
      return r.voided ? `선생님 ${HAND_EMO[r.hand]} — 모두 져서 이번 판은 없던 일! 다시 한 번` : !r.out.length ? `선생님 ${HAND_EMO[r.hand]} — 아무도 안 졌어요! 다시 한 번` : `선생님 ${HANDS['abc'.indexOf(r.hand)]} → ${HANDS['abc'.indexOf(r.lose)]}를 낸 ${lost}명 탈락!${nn ? ` (안 낸 ${nn}명도)` : ''}`; }
    if (r.voided) return `모두 탈락하게 돼서 이번 판은 없던 일!${f.kind === 'ox' ? ` (정답 ${f.ans === 'a' ? '⭕' : '❌'} · ${esc(f.why)})` : ' 다시 한 번'}`;
    if (f.kind === 'ox') { const n = (r.lose === 'a' ? r.a : r.b).length + r.none.length; return `정답 ${f.ans === 'a' ? '⭕' : '❌'} — ${esc(f.why)}${n ? ` · ${n}명 탈락` : ' · 모두 정답!'}`; }
    if (!r.lose) return r.a.length && r.b.length ? `${r.a.length} : ${r.b.length} 비김 — 아무도 탈락 안 해요` : '모두 같은 쪽! 아무도 탈락 안 해요';
    return `${esc(f.q[r.lose === 'a' ? 0 : 1])} 쪽${f.kind === 'rev' ? '이 더 많아서' : ''} ${(r.lose === 'a' ? r.a : r.b).length}명 탈락!${f.kind === 'rev' ? ' 띠용~' : ''}`;
  };

  // 종합상황실
  let hallSig = '';
  function hall(el, R, code) {
    if (R.fun && R.fun.kind === 'td' && DS.TD) { if (code) DS.TD.setCode(code); return DS.TD.hall(el, R); }
    if (R.fun && R.fun.kind === 'nun' && DS.Nunchi) { if (code) DS.Nunchi.setCode(code); return DS.Nunchi.hall(el, R); }
    const f = norm(R.fun), sig = `${f.g}|${f.rk}|${f.phase}|${Object.keys(f.alive || {}).length}`;
    const voted = Object.keys(((R.fv || {})[f.rk]) || {}).filter((u) => (f.alive || {})[u]).length;
    if (hallSig === sig && el.querySelector('.fa-wrap')) { const v = el.querySelector('.fa-voted'); if (v) v.textContent = `고른 사람 ${voted} / ${Object.keys(f.alive || {}).length}`; return; }
    hallSig = sig;
    const quizEnd = () => { const h = arr(f.hist), tot = h.reduce((a, x) => a + x.n, 0), ok = h.reduce((a, x) => a + x.ok, 0), worst = h.filter((x) => x.n && x.ok / x.n < 0.8).sort((a, b) => a.ok / a.n - b.ok / b.n).slice(0, 2);
      return `<div class="fa-win quiz"><h1>⭕ 반 정답률 ${tot ? Math.round((100 * ok) / tot) : 0}%</h1>${worst.length ? `<p class="fa-worst">📌 다시 짚어 볼 문장</p>${worst.map((x) => { const q = OXL()[x.qi] || {}; return `<p class="fa-wq">「${esc(q.t)}」 → ${q.a ? '⭕' : '❌'} <small>${esc(q.why)} · 정답률 ${Math.round((100 * x.ok) / x.n)}%</small></p>`; }).join('')}` : '<p>👍 모든 문장 80% 이상!</p>'}</div>`; };
    const win = f.phase === 'end' && f.kind === 'quiz' ? quizEnd() : f.phase === 'end' ? `<div class="fa-win"><h1>🏆 우승!</h1><p>${(f.win || []).map((u) => `<b>${esc((R.players[u] || {}).num)}번 ${esc(nameOf(R, u))}</b>`).join(' · ')}</p></div>` : '';
    el.innerHTML = `<div class="fa-wrap big"><div class="fa-head">${head(f)}</div>${stage(R, f, true)}${win}
      <p class="fa-foot">${f.phase === 'pick' ? `<span class="fa-voted">고른 사람 ${voted} / ${Object.keys(f.alive || {}).length}</span> · 누가 어디를 골랐는지는 시간이 끝나면 공개!` : f.phase === 'show' ? `${verdict(f)}${(f.res.sa + f.res.sb) && !f.rps ? ` <span class="muted">(관객 ${esc(f.q[0])} ${f.res.sa} · ${esc(f.q[1])} ${f.res.sb})</span>` : ''}` : f.kind === 'quiz' ? '선생님이 「수업으로」를 누르면 하던 단계로 돌아가요' : '쉼터가 끝나면 하던 수업으로 돌아가요'}</p></div>`;
    if (f.phase === 'show') animate(el.querySelector('.fa-arena'), f, true);
  }
  // 학생 폰
  const funPaid = {}; // 💎 이 기기에서 이미 받은 판
  let phoneSig = '';
  let funSnd = '';
  function phone(body, R, me, code) {
    if (R.fun && R.fun.kind === 'td' && DS.TD) return DS.TD.phone(body, R, me, code);
    if (R.fun && R.fun.kind === 'nun' && DS.Nunchi) return DS.Nunchi.phone(body, R, me, code);
    const f = norm(R.fun), alive = !!(f.alive || {})[me], mine = ((R.fv || {})[f.rk] || {})[me] || pend[`${f.g}|${f.rk}`] || '';
    const sig = `${f.g}|${f.rk}|${f.phase}|${alive}|${mine}`;
    if (phoneSig === sig && body.querySelector('.fa-wrap')) return;
    phoneSig = sig;
    const r = f.res || {}, wasIn = f.phase !== 'pick' && (r.a || []).concat(r.b || [], r.c || [], r.none || []).includes(me);
    const mk = String((f.marks || {})[me] || ''), myOk = (mk.match(/o/g) || []).length;
    if (f.kind === 'quiz' && f.phase === 'end' && myOk && DS.Grow) { const p = (R.players || {})[me] || {}; if (p.cls != null && p.num) DS.Grow.add({ c: p.cls, n: p.num }, { ox: myOk }, `oxq_${f.g}`).catch(() => {}); } // 맞힌 문장 × 2 EXP (같은 OX 타임은 한 번)
    if (f.phase === 'end' && DS.Gem && !funPaid[f.g]) { // 💎 · 🎖 (2026-11-05): 운 놀이는 작게 · 실력(OX)은 크게 · 참여만 해도 +1 · 같은 판은 한 번
      const p = (R.players || {})[me] || {}, m = p.cls != null && p.num ? { c: p.cls, n: p.num } : null, G = DS.Gem.G;
      const joined = f.kind === 'quiz' ? mk.length > 0 : (f.outAt || {})[me] != null || (f.win || []).includes(me) || (f.alive || {})[me];
      if (m && joined) {
        funPaid[f.g] = true;
        if (f.kind === 'quiz') { if (mk.length && myOk === mk.length) DS.Gem.add(m, G.quizAll, `quizall_${f.g}`, 'OX 타임 모두 정답').catch(() => {}); }
        else {
          DS.Gem.add(m, G.funJoin, `fun_${f.g}`, '쉼터 놀이 참여').catch(() => {});
          if ((f.win || []).includes(me)) { DS.Gem.add(m, f.kind === 'ox' ? G.oxWin : G.funWin, `funwin_${f.g}`, '놀이 우승').catch(() => {}); DS.Gem.medal(m, f.kind).catch(() => {}); }
        }
      }
    }
    const me2 = f.kind === 'quiz' ? (f.phase === 'show' ? (mk.slice(-1) === 'o' ? '<p class="fa-me ok">⭕ 정답!</p>' : `<p class="fa-me ng">${mk.slice(-1) === '-' ? '⏱ 시간이 지났어요' : '❌ 아쉬워요'} — 해설을 확인해요</p>`)
        : f.phase === 'end' ? `<p class="fa-me ok">⭕ ${myOk} / ${mk.length} 정답${myOk ? ` · +${myOk * 2} EXP` : ''}</p>${arr(f.hist).map((h, i) => (mk[i] && mk[i] !== 'o' ? (() => { const q = OXL()[h.qi] || {}; return `<p class="fa-wq me">📌 「${esc(q.t)}」 → ${q.a ? '⭕' : '❌'}<small>${esc(q.why)}</small></p>`; })() : '')).join('')}` : '<p class="fa-me">맞을까 틀릴까? <b>탈락 없이 끝까지!</b> · 시간 안에는 바꿀 수 있어요</p>')
      : f.phase === 'show' ? (wasIn ? (alive ? '<p class="fa-me ok">🎉 살아남았다!</p>' : (f.zz || {})[me] ? '<p class="fa-me">💤 안 골라서 관전 — 다음 판에 아무거나 고르면 그다음 판부터 다시 참여</p>' : `<p class="fa-me ng">💥 ${(r.none || []).includes(me) ? '안 골라서' : f.rps ? '가위바위보에 져서' : K(f).out} 탈락… 관객석으로</p>`) : (f.zz || {})[me] ? `<p class="fa-me">💤 관전 중${arr(f.back).includes(me) ? ' — 🙋 다음 판부터 참여!' : ''}</p>` : '<p class="fa-me">👀 관객석</p>')
      : f.phase === 'end' ? ((f.win || []).includes(me) ? '<p class="fa-me ok">🏆 우승! 끝까지 살아남았어요</p>' : `<p class="fa-me">우승: ${(f.win || []).map((u) => esc(nameOf(R, u))).join(' · ')}</p>`)
      : alive && f.rps ? '<p class="fa-me">✊✌️✋ <b>선생님과 가위바위보!</b> 지면 탈락 · 시간 안에는 바꿀 수 있어요</p>'
      : alive ? `<p class="fa-me">${f.kind === 'ox' ? '맞을까 틀릴까?' : '둘 중 하나!'} <b>${esc(K(f).rule)}</b> · 시간 안에는 바꿀 수 있어요</p>` : (f.zz || {})[me] ? '<p class="fa-me">💤 관전 중 — <b>아무거나 고르면 다음 판부터 다시 참여</b></p>' : '<p class="fa-me">👀 관객석 — 골라도 결과엔 영향 없어요</p>';
    body.innerHTML = `<div class="panel framed fa-wrap"><div class="fa-head">${head(f)}</div>${stage(R, f, false, me)}${me2}
      ${f.phase === 'pick' && f.rps ? `<div class="fa-pick rps">${['a', 'b', 'c'].map((k, i) => `<button class="btn big fa-${k}${mine === k ? ' on' : ''}" data-pick="${k}">${HANDS[i]}</button>`).join('')}</div>` : f.phase === 'pick' ? `<div class="fa-pick"><button class="btn big fa-a${mine === 'a' ? ' on' : ''}" data-pick="a">${esc(f.q[0])}</button><button class="btn big fa-b${mine === 'b' ? ' on' : ''}" data-pick="b">${esc(f.q[1])}</button></div>` : ''}
      ${f.phase === 'show' ? `<p class="fa-res">${verdict(f)}</p>` : ''}</div>`;
    if (f.phase === 'show' && wasIn && f.kind !== 'quiz' && funSnd !== `${f.g}|${f.rk}` && DS.Sound && DS.Sound.fx) { funSnd = `${f.g}|${f.rk}`; const outL = arr(r.out); setTimeout(() => DS.Sound.fx(outL.includes(me) ? 'game-no' : 'game-ok', 0.8), 1900); } // 🔊 2차 ⭕ · ❌ (공개 연출 뒤)
    body.querySelectorAll('[data-pick]').forEach((b) => (b.onclick = () => {
      if (N().now() > f.to) return;
      pend[`${f.g}|${f.rk}`] = b.dataset.pick; phoneSig = '';
      if (DS.Sound && DS.Sound.card) DS.Sound.card();
      phone(body, R, me, code);
      N().set(P(code, `fv/${f.rk}/${me}`), b.dataset.pick).catch(() => DS.UI.toast('시간이 끝났어요'));
    }));
    if (f.phase === 'show') animate(body.querySelector('.fa-arena'), f, false);
  }
  const pend = {};
  const on = (R) => !!(R && R.fun && DS.Raid.restOn(R));
  return { hold, KIND, judge, judgeRps, tHand, RPS_AT, HANDS, queue, tilted, step, round, start, stop, drive, ctlHtml, bind, hall, phone, on, PICK, SHOW, LIMIT, MIN };
})();
