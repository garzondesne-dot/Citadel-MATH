// 🔥 반 콤보 · ✨ 퍼펙트 · ⛓ 묶기 상한 · 👑 보스 단계 · 🦇 황금 박쥐 · 🎁 보물 상자 · 🏁 반대항 점수 (v0.9.11 · 2026-11-05 사용자 확정 · NEXT-ROOM 3절)
// 순수 함수만 (화면 · 서버와 분리 · tests/combo.test.js 가 검증). 모든 화면이 같은 방 값으로 같은 결과를 계산한다.
// 방 데이터에 더해지는 것:
//   hits/{uid}/{키} = { at: 서버 시각, ac: 콤보 시계(ms) }  ← 학생 폰이 공격할 때 남김 (Firebase 규칙: at === now)
//       몬스터 m_{몬스터id}_{시도} · 보스 b{세트}_{문항}_{그 문항 몇 번째} + ok(맞힘)
//   state.cpAt · cpMs = 콤보 시계 멈춤 (쉼터 · OX 타임 · 영상 · 집중모드) — 교사 기기가 켜고 끌 때 같이 적음
//   state.batPlan = { mid, d } (수업 시작 때 정함) · state.bat = { mid, at, ac, q, n } (나타난 순간) · batA/{uid} = 'o' | 'x'
//   meta.comboBest = 이 반의 지난 최고 콤보 (방을 만들 때 combo/{반} 에서 복사)
window.DS = window.DS || {};

DS.Combo = (function () {
  const GAP = 40e3;                          // 40초 동안 반 전체에서 콤보가 없으면 끊김 (멈춘 시간은 빼고)
  const TIERS = [[30, '👑', 'crown'], [20, '🌈', 'rainbow'], [10, '⚡', 'bolt'], [5, '🔥', 'fire']];
  const TIER_BIND = { 10: 3, 20: 5, 30: 8 }; // 단계에 닿는 순간 몬스터 묶기 (초)
  const PF_BIND = [2, 3, 4];                 // ✨ 퍼펙트 개인 연속 1 · 2 · 3번째 이상
  const BOSS_PF_BIND = [1, 1.5, 2];          // 👑 보스 문항 퍼펙트
  const PRAC_PER = 1, PRAC_MAX = 4;          // 연습 공격 묶기 (기존): 맞힌 소문제 1개 1초 · 학생 한 명 몬스터당 4초
  // ⛓ 묶기 상한: 「한 번 공격 사이 묶기 합계 ≤ 그 공격 주기의 절반」 = 실제 시간의 1/3 이하
  //   (주기 p 동안 묶기 b → 실제 간격 p + b, b ≤ (p + b)/3 ⇔ b ≤ p/2) → 단계 시작부터 30초 창마다 10초까지
  const CAP_WIN = 30, CAP = 10, ULT_BIND = 15; // ULT_BIND = ⚡ 필살기 대묶기 (초)
  const BOSS_LOCK = [[67, 4], [34, 3], [0, 2]]; // 👑 보스 단계 멈춤: 체력 100~67% 4초 · 66~34% 3초 · 33~0% 2초
  const BAT = { min: 30, max: 90, dur: 20, need: 0.3, gem: 3, combo: 3, bind: 5, late: 5 * 60e3 };
  const CHEST = { p: 0.15, streakBonus: 0.10, day: 2, pity: 3, feathers: 5,
    table: [{ id: 'common', name: '흔함', p: 0.60, gem: [1, 2] }, { id: 'rare', name: '희귀', p: 0.30, gem: [3, 5] }, { id: 'hero', name: '영웅', p: 0.09, gem: [10, 10], rare: 1 }, { id: 'legend', name: '전설', p: 0.01, gem: [30, 30], rare: 1 }] }; // 2026-11-07 🪶 깃털 없앰 → 💎 (깃털 1 = 💎 10 · 영웅 = 깃털 1 · 전설 = 깃털 3 과 같은 값) · rare = 🌟 황금 날개 업적 셈
  const PUNCH_W = { join: 25, fix: 25, combo: 20, first: 20, heal: 10 };
  const PUNCH_NAMES = { join: '참여', fix: '고침', combo: '콤보', first: '첫 시도', heal: '돕기' }; // 교실 TV 에 이모지 글꼴이 없어 글자만 (2026-11-05)

  const keys = (o) => Object.keys(o || {});
  const Raid = () => DS.Raid;
  // ── 콤보 시계 (멈춘 시간을 뺀 시각) ─────────────────────────
  const pausedNow = (st) => !!(st && (st.focus || st.rest || st.video));
  function activeNow(R, now) {
    const st = (R && R.state) || {};
    return now - (Number(st.cpMs) || 0) - (st.cpAt != null && pausedNow(st) ? Math.max(0, now - st.cpAt) : 0);
  }
  // 교사 기기가 집중 · 쉼터 · 영상을 바꿀 때 같이 적을 값 (next = 바뀐 뒤 state 일부)
  function cpPatch(st, next, now) {
    st = st || {}; const was = pausedNow(st), will = pausedNow({ ...st, ...next });
    if (!was && will) return { cpAt: now };
    if (was && !will) return { cpAt: null, cpMs: (Number(st.cpMs) || 0) + Math.max(0, now - (st.cpAt != null ? st.cpAt : now)) };
    return {};
  }

  // ── 공격 기록 → 사건 목록 ─────────────────────────────────
  const tierOf = (n) => { const t = TIERS.find(([k]) => n >= k); return t ? { n: t[0], icon: t[1], id: t[2] } : null; };
  function events(L, R, now = Infinity) {
    const out = [], hits = R.hits || {};
    Raid().activeIds(R).forEach((u) => {
      const recs = {};
      Object.entries(hits[u] || {}).forEach(([k, h]) => {
        if (!h || typeof h.at !== 'number') return;
        const ac = typeof h.ac === 'number' ? h.ac : h.at;
        let mm = /^m_(.+)_(\d)$/.exec(k);
        if (mm) {
          const mid = mm[1], a = Number(mm[2]); if (!L.monsters[mid]) return;
          const rec = recs[mid] || (recs[mid] = Raid().record(L, R, mid, u));
          const t = rec.tries.find((x) => x.attempt === a); if (!t) return;
          const pAt = rec.perfectAt >= 0 ? rec.tries[rec.perfectAt].attempt : -1, all = t.total > 0 && t.correct === t.total;
          out.push({ k, u, at: h.at, ac, m: mid, kind: 'm', a, correct: t.correct, total: t.total, pf: a === 0 && all, fx: a > 0 && a === pAt, prac: pAt >= 0 && a > pAt });
          return;
        }
        mm = /^b([12])_(\d+)_(\d+)$/.exec(k);
        if (mm) out.push({ k, u, at: h.at, ac, m: 'boss', kind: 'b', set: Number(mm[1]), i: Number(mm[2]), n: Number(mm[3]), ok: !!h.ok });
      });
    });
    const b = bat(L, R, now);
    if (b && b.ok) out.push({ k: 'bat', u: null, at: b.end, ac: b.acEnd, m: b.mid, kind: 'bat' });
    return out.sort((x, y) => x.at - y.at || String(x.u).localeCompare(String(y.u)) || x.k.localeCompare(y.k));
  }

  // ── 한 번에 계산: 퍼펙트 연속 · 콤보 사슬 · 묶기 사건 ──────────────
  function analyze(L, R, now = Infinity) {
    const ev = events(L, R, now), streak = {}, bstreak = {}, prac = {}, mastered = {}, binds = [], marks = [];
    let cur = 0, lastAc = null, chain = new Set(), best = 0, bestUsers = [], bestAt = null;
    const endChain = () => { if (cur > best) { best = cur; bestUsers = [...chain]; } cur = 0; chain = new Set(); };
    ev.forEach((e) => {
      let inc = 0;
      if (e.kind === 'm') {
        if (e.a === 0) streak[e.u] = e.pf ? (streak[e.u] || 0) + 1 : 0;
        if (e.pf) { e.streak = streak[e.u]; e.bind = PF_BIND[Math.min(e.streak, 3) - 1]; binds.push({ at: e.at, sec: e.bind, m: e.m, why: 'pf', u: e.u }); inc = 1; }
        if (e.fx) inc = 1;
        if (e.prac) { const pk = `${e.u}|${e.m}`, had = prac[pk] || 0, s = Math.min(PRAC_MAX - had, e.correct * PRAC_PER); if (s > 0) { prac[pk] = had + s; binds.push({ at: e.at, sec: s, m: e.m, why: 'prac', u: e.u }); e.bind = s; } }
      } else if (e.kind === 'b') {
        if (e.set === 1 && e.n === 0) {
          bstreak[e.u] = e.ok ? (bstreak[e.u] || 0) + 1 : 0;
          if (e.ok) { e.pf = true; e.streak = bstreak[e.u]; e.bind = BOSS_PF_BIND[Math.min(e.streak, 3) - 1]; binds.push({ at: e.at, sec: e.bind, m: 'boss', why: 'pf', u: e.u }); }
        }
        const mk = `${e.u}|${e.i}`;
        if (e.ok && !mastered[mk]) { mastered[mk] = true; inc = 1; }
      } else if (e.kind === 'bat') { inc = BAT.combo; binds.push({ at: e.at, sec: BAT.bind, m: e.m, why: 'bat' }); }
      if (!inc) return;
      if (lastAc != null && e.ac - lastAc > GAP) endChain();
      const before = cur; cur += inc; lastAc = e.ac; if (e.u) chain.add(e.u);
      if (cur > best) bestAt = e.at;
      [10, 20, 30].forEach((t) => { if (before < t && cur >= t) { binds.push({ at: e.at, sec: TIER_BIND[t], m: e.m, why: `tier${t}` }); marks.push({ at: e.at, n: t, m: e.m }); } });
      e.combo = cur;
    });
    const live = cur, liveUsers = [...chain];
    if (cur > best) { best = cur; bestUsers = [...chain]; }
    return { ev, streak, bstreak, binds, marks, cur: live, curUsers: liveUsers, lastAc, best, bestUsers, bestAt };
  }
  // 지금 콤보 (끊겼으면 0) · left = 끊기기까지 남은 비율
  function comboNow(an, R, now) {
    if (!an || an.lastAc == null || !an.cur) return { n: 0, left: 0, tier: null };
    const gap = activeNow(R, now) - an.lastAc;
    if (gap > GAP) return { n: 0, left: 0, tier: null };
    return { n: an.cur, left: Math.max(0, 1 - gap / GAP), tier: tierOf(an.cur), paused: pausedNow(R.state) };
  }

  // ── ⛓ 묶기 합계 (상한 적용) ──────────────────────────────
  //   그 단계(몬스터 id · 'boss')의 묶기만 · 단계 시작부터 30초 창마다 10초까지 · hits 가 없는 예전 기록의 연습 묶기는 그대로 더함
  function bindFor(L, R, mid, an, now = Infinity) {
    an = an || analyze(L, R, now);
    const st = R.state || {}, t0 = st.stepAt || 0, win = {};
    an.binds.filter((b) => b.m === mid && b.at <= now).forEach((b) => { const w = Math.max(0, Math.floor((b.at - t0) / (CAP_WIN * 1000))); win[w] = (win[w] || 0) + b.sec; });
    let total = Object.values(win).reduce((a, s) => a + Math.min(CAP, s), 0);
    // ⚡ 필살기 대묶기 (2026-11-06 사용자 「필살기는 파격적인 묶기」): 수업 필살기('!ult') · 형성평가 퍼펙트 필살기 1번마다 ULT_BIND 초 · 상한 밖
    if (mid !== 'boss') Object.values(((R.heals || {})[mid]) || {}).forEach((byK) => Object.values(byK || {}).forEach((v) => { if (v === '!ult') total += ULT_BIND; else if (Raid().isTrue && Raid().isTrue(v)) total += Raid().TRUE_SEC; }));
    else if (DS.Attack && L.boss) Raid().activeIds(R).forEach((u) => { const p = (R.players || {})[u] || {}, f = Raid().bossFirst(L, R, u); if (f.length && f.every(Boolean) && DS.Attack.canUlt(p.fx, p.hero)) total += ULT_BIND; });
    if (mid !== 'boss' && L.monsters[mid]) { // 예전 기록 (hits 없음): 학생마다 기존 계산 그대로
      const hits = R.hits || {};
      Raid().activeIds(R).forEach((u) => { if (!keys(hits[u]).some((k) => k.startsWith(`m_${mid}_`))) total += Raid().bindOf(L, R, mid, u); });
    }
    return Math.round(total * 10) / 10;
  }
  // 👑 보스 단계: 체력 비율 → [단계 1·2·3, 멈춤 초]
  function bossPhase(ratio) {
    const pct = Math.round(Math.max(0, Math.min(1, ratio)) * 100);
    const i = BOSS_LOCK.findIndex(([p]) => pct >= p);
    return { phase: i + 1, lock: BOSS_LOCK[i][1], pct };
  }

  // ── 🦇 황금 박쥐 ───────────────────────────────────────
  // 수업 시작 때: 몬스터 단계 하나 + 그 단계 시작 30~90초 뒤 (rnd 0~1 두 개)
  function batPlan(L, r1, r2) {
    const ids = L.steps.filter((s) => s.kind === 'monster' && L.monsters[s.id]).map((s) => s.id);
    if (!ids.length) return null;
    return { mid: ids[Math.min(ids.length - 1, Math.floor(r1 * ids.length))], d: Math.round(BAT.min + r2 * (BAT.max - BAT.min)) };
  }
  // 이 반의 지금 차시까지 OX 문장 중 하나 (방 코드로 고정)
  function batQ(L, code) {
    const list = (DS.FunOX ? DS.FunOX.list : []).map((q, i) => ({ q, i })).filter(({ q }) => !L.no || q.no <= L.no);
    if (!list.length) return -1;
    return list[hash(`bat|${code}`) % list.length].i;
  }
  // 나타날 때인가 (교사 · 종합상황실 기기가 확인해 state.bat 을 적음)
  function batDue(L, R, now) {
    const st = R.state || {}, plan = st.batPlan; if (!plan || st.bat || st.closed) return false;
    const step = Raid().stepOf(L, R); if (!step || step.kind !== 'monster' || step.id !== plan.mid || Raid().cleared(L, R, step.id)) return false;
    if (st.focus || st.rest || st.video) return false;
    const tl = Raid().timeLeft(R, now); if (tl != null && tl < BAT.late) return false;
    const held = st.focus ? now - (st.focusAt != null ? st.focusAt : now) : 0;
    return (now - (st.stepAt != null ? st.stepAt : now) - (st.pauseMs || 0) - held) / 1000 >= plan.d;
  }
  // 상태: none · live(20초 동안) · done(결과)
  function bat(L, R, now) {
    const b = (R.state || {}).bat; if (!b || typeof b.at !== 'number') return null;
    const q = DS.FunOX && DS.FunOX.list[b.q], end = b.at + BAT.dur * 1000;
    const ans = R.batA || {}, ids = Raid().activeIds(R);
    const answered = ids.filter((u) => ans[u] === 'o' || ans[u] === 'x');
    const right = q ? answered.filter((u) => (ans[u] === 'o') === !!q.a) : [];
    const n = Number(b.n) || ids.length, need = Math.max(1, Math.ceil(n * BAT.need));
    const live = now < end;
    return { mid: b.mid, at: b.at, end, acEnd: (typeof b.ac === 'number' ? b.ac : b.at) + BAT.dur * 1000, q, qi: b.q, live, left: Math.max(0, end - now), answered: answered.length, right: live ? null : right, rightN: right.length, need, n, ok: !live && right.length >= need };
  }

  // ── 🎁 보물 상자 ───────────────────────────────────────
  function hash(s) { // FNV-1a + 마무리 섞기 (끝 글자만 다른 씨앗끼리 비슷한 값이 나오지 않게)
    let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return h >>> 0;
  }
  const rnd = (s) => hash(s) / 4294967296;
  // seed = `${코드}|${uid}|${몬스터}` (새로 고쳐도 같은 결과) · streak3 = 퍼펙트 3연속 이상 · sure = 확정(천장 · 박쥐)
  function chestRoll(seed, streak3, sure) {
    const p = CHEST.p + (streak3 ? CHEST.streakBonus : 0);
    if (!sure && rnd(`${seed}|a`) >= p) return null;
    let r = rnd(`${seed}|b`), t = CHEST.table[CHEST.table.length - 1];
    for (const x of CHEST.table) { if (r < x.p) { t = x; break; } r -= x.p; }
    const r3 = rnd(`${seed}|c`);
    return { tier: t.id, name: t.name, gem: t.gem ? t.gem[0] + Math.floor(r3 * (t.gem[1] - t.gem[0] + 1)) : 0, rare: t.rare || 0 };
  }

  // ── 🏁 반대항 경주 점수 (A안) ─────────────────────────
  function punch(L, R, an) {
    an = an || analyze(L, R);
    const ids = Raid().activeIds(R), cur = (R.state || {}).step ?? -1, closed = Raid().isClosed(R) || Raid().isEnd(L, R);
    const mons = L.steps.map((s, i) => ({ s, i })).filter(({ s, i }) => s.kind === 'monster' && L.monsters[s.id] && (closed || i <= cur)).map(({ s }) => s.id);
    // 🙋 참여: 몬스터마다 (낸 학생 / 빠지지 않은 학생) 평균 (+ 보스: 한 문항이라도 낸 학생)
    const parts = mons.map((mid) => { const sk = Raid().skipped(R, mid), pool = ids.filter((u) => !sk[u]); return pool.length ? pool.filter((u) => Raid().record(L, R, mid, u).submitted).length / pool.length : null; }).filter((x) => x != null);
    const bossIdx = L.steps.findIndex((s) => s.kind === 'boss');
    if (bossIdx >= 0 && (closed || cur >= bossIdx) && ids.length) parts.push(ids.filter((u) => Raid().bossAnswered(R, u) > 0).length / ids.length);
    const join = parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 0;
    // 🔁 고침 · 🎯 첫 시도 · 💚 돕기
    let need = 0, fixed = 0, c0 = 0, t0 = 0; const stuck = new Set(), healed = new Set(), who = new Set();
    mons.forEach((mid) => ids.forEach((u) => {
      const rec = Raid().record(L, R, mid, u); if (!rec.submitted) return; who.add(u);
      const f = rec.tries[0]; c0 += f.correct; t0 += f.total;
      if (f.correct < f.total) { need++; stuck.add(u); if (rec.perfect) fixed++; if (rec.healed > 0) healed.add(u); }
    }));
    ids.forEach((u) => { if (Raid().bossAnswered(R, u) > 0) who.add(u); });
    const fix = need ? fixed / need : 1, first = t0 ? c0 / t0 : 0, heal = stuck.size ? healed.size / stuck.size : 1;
    const combo = Math.min(1, an.best / Math.max(1, who.size));
    const m = { join, fix, combo, first, heal };
    const s = Object.entries(PUNCH_W).reduce((a, [k, w]) => a + w * m[k], 0);
    return { s: Math.round(s * 10), m: Object.fromEntries(Object.entries(m).map(([k, v]) => [k, Math.round(v * 100)])), best: an.best, n: who.size };
  }
  // 연장전: 🙋 참여를 「이어하기 완주율」로 다시 잼 (수업 중 참여보다 높을 때만)
  function overtime(entry, doneRate) {
    const m = { ...(entry.m || {}) }, j = Math.round(Math.max(0, Math.min(1, doneRate)) * 100);
    if (j > (m.join || 0)) m.join = j;
    const s = Object.entries(PUNCH_W).reduce((a, [k, w]) => a + (w * (m[k] || 0)) / 100, 0);
    return { ...entry, m, s: Math.round(s * 10), ot: null, otDone: true };
  }
  // 같은 차시 반들 순위 · 지난 차시 대비 · 시즌 누적 (all = punch 전체 { 차시: { 반: 기록 } })
  function board(all, lessonId, cls) {
    all = all || {};
    const order = (DS.Lessons ? DS.Lessons.list : []).filter((l) => l.no && !l.eval).sort((a, b) => a.no - b.no).map((l) => l.id);
    const rows = Object.entries(all[lessonId] || {}).map(([c, e]) => ({ cls: c, ...e }));
    // 2026-11-05 사용자: 다른 반이 아직 이 차시를 안 했으면 그 반의 「가장 가까운 차시」 기록으로 비교 (같은 거리면 앞 차시) · near = 그 차시 id
    const noOf = (id) => { const L = DS.Lessons && DS.Lessons.get(id); return (L && L.no) || 0; }, here = noOf(lessonId);
    const classes = new Set(); Object.values(all).forEach((byC) => Object.keys(byC || {}).forEach((c) => classes.add(c)));
    classes.forEach((c) => {
      if ((all[lessonId] || {})[c]) return;
      let best = null;
      Object.entries(all).forEach(([lid, byC]) => { const e = (byC || {})[c]; if (!e || e.ot || !(e.s > 0) || lid === lessonId || !noOf(lid)) return; const d = Math.abs(noOf(lid) - here), k = d * 2 + (noOf(lid) > here ? 1 : 0); if (!best || k < best.k) best = { k, lid, e }; });
      if (best) rows.push({ cls: c, ...best.e, near: best.lid, nearNo: noOf(best.lid) });
    });
    const scored = rows.filter((r) => !r.ot).sort((a, b) => b.s - a.s || String(a.cls).localeCompare(String(b.cls)));
    scored.forEach((r, i) => { r.rank = i + 1; });
    const idx = order.indexOf(lessonId);
    rows.forEach((r) => {
      if (r.near) { r.last = scored.length > 1 && r.rank === scored.length; return; } // 가까운 차시 기록은 지난 차시 비교 안 함
      for (let i = idx - 1; i >= 0; i--) { const p = (all[order[i]] || {})[r.cls]; if (p && !p.ot && p.s > 0) { r.prev = p.s; r.prevLesson = order[i]; r.delta = Math.round(((r.s - p.s) / p.s) * 100); break; } }
      r.last = scored.length > 1 && r.rank === scored.length; // 꼴찌 대신 「도전 중」
    });
    const season = {};
    Object.values(all).forEach((byC) => Object.entries(byC || {}).forEach(([c, e]) => { if (!e || e.ot) return; season[c] = season[c] || { cls: c, total: 0, n: 0 }; season[c].total += e.s || 0; season[c].n++; }));
    return { rows: scored.concat(rows.filter((r) => r.ot)), season: Object.values(season).sort((a, b) => b.total - a.total), me: rows.find((r) => r.cls === String(cls) && !r.near) || null };
  }
  // 받을 조각: 1등 반 💎 +5 (그 차시를 한 반이 둘 이상일 때) · 지난 차시보다 +10% 이상 💎 +3
  const punchGems = (me, b) => (!me || me.ot ? [] : [me.rank === 1 && (!b || b.rows.filter((r) => !r.ot).length >= 2) ? ['first', 5, '🏁 반대항 1등'] : null, me.delta != null && me.delta >= 10 ? ['up', 3, `🏁 지난 차시보다 +${me.delta}%`] : null].filter(Boolean));

  return { GAP, TIERS, TIER_BIND, PF_BIND, BOSS_PF_BIND, CAP_WIN, CAP, ULT_BIND, BOSS_LOCK, BAT, CHEST, PUNCH_W, PUNCH_NAMES,
    pausedNow, activeNow, cpPatch, tierOf, events, analyze, comboNow, bindFor, bossPhase, batPlan, batQ, batDue, bat, hash, rnd, chestRoll, punch, overtime, board, punchGems };
})();
