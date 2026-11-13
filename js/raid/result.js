// ⚔ 오늘의 전투 결과 (v0.8.0): 레이드가 끝나면 학생 폰에 개인 결과 → 모닥불. 성적이 아니라 "무엇을 더 보면 좋을지" 알려 주는 화면
// - 몬스터마다 ✔ 처음에 맞힘 / 🔁 재도전으로 고침 / ✖ 끝까지 못 맞힘
// - 개념별 이해도 = 첫 시도 정답률 (몬스터는 바로 앞 개념 칸에 묶임, 보스 문항은 차시 파일의 boss.tags)
// - 복습 추천 = 낮은 개념 1~2개 → 📄 학습지 개념 보기 · 🟪 중단원던전(그 차시 층) · 🎬 설명 영상
// - 저장: records/{반}/{번호}/{차시} (요약만) · EXP 는 DS.Grow (같은 수업은 한 번만)
window.DS = window.DS || {};

DS.Result = (function () {
  const { esc } = DS.UI;
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');

  // 몬스터 · 보스 문항 → 개념 칸
  function conceptMap(L) {
    const map = {}, titles = { review: '지난 시간 복습', boss: '형성평가' };
    let cur = 'review';
    L.steps.forEach((s) => {
      if (s.kind === 'concept') { cur = s.id; titles[s.id] = s.title.replace(/^개념 \d+ · /, ''); }
      if (s.kind === 'monster') map[s.id] = cur;
    });
    return { map, titles };
  }
  // 한 학생의 결과 (수업 방 R 에서 계산 — 새로 모으는 데이터 없음)
  function compute(L, R, uid) {
    const X = DS.Raid, { map, titles } = conceptMap(L), conc = {};
    const bump = (c, ok) => { conc[c] = conc[c] || { ok: 0, total: 0 }; conc[c].total++; if (ok) conc[c].ok++; };
    let submits = 0, best = 0, fixed = 0, perfects = 0, fixEx = null, chainPrac = 0;
    const mis = {}, M = DS.Mis; // 🔎 오개념 (2026-11-03): 틀린 답의 종류 · 나중에 바로잡았는지
    const mons = L.steps.filter((s) => s.kind === 'monster').map((s) => {
      const rec = X.record(L, R, s.id, uid);
      const n = rec.total, first = rec.tries[0];
      const firstOk = rec.chain ? rec.stFirst.slice() : Array.from({ length: n }, (_, i) => !!(first && first.attempt === 0 && first.marks[i])); // ⚔ 소레이드 = 단계별 (model chainRecord stFirst · stOk)
      const everOk = rec.chain ? rec.stOk.slice() : Array.from({ length: n }, (_, i) => rec.tries.some((t) => t.marks[i]));
      const sp = (L.split || {})[s.id]; // v0.9.6.18: 한 몬스터에 두 개념이면 소문제마다 (5차시 문제 3 · 4)
      if (rec.submitted) firstOk.forEach((ok, i) => bump((sp && sp[i]) || map[s.id], ok)); // 안 한 몬스터는 개념 이해도에 넣지 않는다 (늦게 들어온 학생)
      submits += rec.tries.length; best += rec.best; if (rec.chain) chainPrac += rec.pDoneN || 0; else if (rec.hearts) chainPrac += rec.panelsDone || 0; // 🔥 소레이드 연습 사슬 완성 · ⚡ 2026-11-13 밤: 일반 몬스터 🔥 재도전 판 완성도 EXP +1
      const fx = everOk.filter((ok, i) => ok && !firstOk[i]).length; fixed += fx;
      if (M) rec.tries.forEach((t) => { const items = X.itemsFor(L, R, s.id, uid, t.attempt); items.forEach((q, i) => { if (t.marks[i]) return; const later = rec.tries.some((u) => u.attempt > t.attempt && u.marks[i]); M.add(mis, M.classify(q, (t.given || [])[i]), later); }); });
      if (rec.submitted && n && firstOk.every(Boolean)) perfects++; // ⚡ PERFECT = 첫 시도에 모두 맞힘
      if (!fixEx && fx) { // 📘 내가 고친 문제 하나 (처음엔 틀렸다가 고친 것 — 마지막으로 맞힌 시도의 문제와 풀이)
        const i = everOk.findIndex((ok, k) => ok && !firstOk[k]), t = rec.tries.find((x) => x.marks[i]);
        const q = t ? X.itemsFor(L, R, s.id, uid, t.attempt)[i] : null;
        if (q) fixEx = { where: s.title, q, concept: map[s.id] };
      }
      // 📕 오답노트 칸 (v0.9.7.9): o 한 번에 · f 재도전으로 고침 · x 끝까지 못 맞힘 · - 나만 안 함(먼저 나감 · 늦게 옴) · n 반 전체가 수업에서 안 함(시간 부족)
      const st = rec.submitted ? (everOk.every(Boolean) ? (firstOk.every(Boolean) ? 'o' : 'f') : 'x') : X.activeIds(R).some((u) => u !== uid && X.record(L, R, s.id, u).submitted) ? '-' : 'n';
      return { id: s.id, title: s.title, concept: map[s.id], n, tried: rec.submitted, first: firstOk.filter(Boolean).length, fixed: fx, miss: everOk.filter((ok) => !ok).length, st };
    });
    if (X.V4 && X.V4(R) && L.boss) chainPrac += X.bossRec(L, R, uid).panelsDone || 0; // ⚡ 👑 형성평가 🔥 재도전 판 완성도 EXP +1 (2026-11-13 밤)
    const tags = L.boss.tags || [], BS = X.bossState(L, R, uid), tries = X.bossTries(L, R, uid); // 2026-11-05: 문항 · 시도별 (예전 세트 1 · 2 도 시도 0 · 1 로)
    const set1 = BS.map((s) => s.first); // 첫 시도 맞힘
    const mast = X.mastery(L, R, uid), bossTried = BS.some((s) => s.firstTried);
    if (bossTried) set1.forEach((ok, i) => bump(tags[i] || 'boss', ok));
    const bossFixed = mast.filter((ok, i) => ok && !set1[i]).length;
    if (M) tries.forEach((t) => { if (t.ok || !t.q) return; const k = t.a === 0 ? 1 : t.legacy ? 2 : 0; M.add(mis, M.classify(t.q, t.given, k ? M.bossTag(L.id, k, t.i) : undefined), !!mast[t.i]); });
    const anyBoss = X.activeIds(R).some((u) => X.bossAnswered(R, u) > 0);
    const bossM = mast.map((ok, i) => (ok ? 'o' : BS[i].n ? 'x' : anyBoss ? '-' : 'n')).join(''); // 문항마다 (⭐ 도전 문항 포함)
    const perfect = X.fullMarks(L, R, uid), bossWin = X.bossHp(L, R).won && bossTried;
    const words = !!((R.words || {})[uid] || {}).t;
    const oxm = Object.values(R.oxq || {}).map((q) => String(((q || {}).marks || {})[uid] || '')).join(''), ox = oxm ? [(oxm.match(/o/g) || []).length, oxm.length] : null; // ⭕ OX 타임 (v0.9.8.1)
    const order = Object.keys(conc).filter((c) => conc[c].total);
    const me0 = (R.players || {})[uid] || {}, lad = Object.fromEntries((L.chain || []).map((mid) => { const rc = X.isChain(L, R, mid) ? X.record(L, R, mid, uid) : null; return [mid, !rc ? 0 : (me0.wr || {})[mid] === 'ok' ? 4 : rc.whyAll ? 2 : rc.done ? 1 : 0]; }).filter(([, v]) => v)); // 🪜 서술형 사다리 (👣 1 대장 처치 · 🧩 2 근거 줄 · ✍ 4 서술형 통과 · 2026-11-09 #26)
    const ladW = Object.fromEntries((L.chain || []).map((mid) => { const rc = X.isChain(L, R, mid) ? X.record(L, R, mid, uid) : null; return [mid, rc && rc.whyM > 1 ? `${rc.whyN}/${rc.whyM}` : '']; }).filter(([, v]) => v && !/^0\//.test(v))); // 🧩 #52 근거 줄 여러 개 = 맞힌 줄 / 전체 (1줄 차시는 안 적음)
    const hg = Object.keys((((R.players || {})[uid] || {}).hint) || {}).length; // 💡 힌트 준 횟수 (2026-11-09 #26 · #52 근거 줄마다 1번 · EXP +1 씩)
    const weak = order.map((c) => ({ c, r: conc[c].ok / conc[c].total })).filter((x) => x.r < 0.8).sort((a, b) => a.r - b.r).slice(0, 2).map((x) => x.c);
    const parts = { join: 1, submit: submits, correct: best + mast.filter(Boolean).length, fixed: fixed + bossFixed, bossWin: bossWin ? 1 : 0, perfect: perfect ? 1 : 0, chainPrac, hintGive: hg }; // 마지막 한마디 EXP 는 한마디를 남길 때 따로 (v0.8.1)
    const hp = X.bossHp(L, R), bossShare = hp.max ? Math.min(100, Math.round((100 * mast.filter(Boolean).length) / hp.max)) : 0;
    return { ox, mis, lesson: L.id, no: L.no || 0, title: L.title, mons, boss: { set1, mast, bossM, tried: bossTried, hp: L.boss.hpItems, won: hp.won, share: bossShare }, conc, titles, weak, parts, perfects, hg, lad, ladW, fixed: fixed + bossFixed, fixEx,
      words: words ? String(((R.words || {})[uid] || {}).t) : '' };
  }
  // 저장용 요약 (records/{반}/{번호}/{차시})
  const summary = (r, code) => ({ at: (DS.Net || {}).TS || Date.now(), code: String(code || ''), no: r.no,
    conc: Object.fromEntries(Object.entries(r.conc).map(([c, v]) => [c, [v.ok, v.total]])), names: r.titles,
    miss: r.mons.filter((m) => m.miss).map((m) => m.id), weak: r.weak, ...(Object.keys(r.mis || {}).length ? { mis: r.mis } : {}), ...(r.hg ? { hg: r.hg } : {}), ...(r.lad && Object.keys(r.lad).length ? { lad: r.lad } : {}), ...(r.ladW && Object.keys(r.ladW).length ? { ladW: r.ladW } : {}), boss: r.boss.mast.slice(0, r.boss.hp).filter(Boolean).length, bossN: r.boss.hp, bossX: r.boss.mast.slice(r.boss.hp).filter(Boolean).length, bossM: r.boss.bossM, mons: Object.fromEntries(r.mons.map((m) => [m.id, m.st])), ...(r.ox ? { ox: r.ox } : {}), won: !!r.boss.won, fixed: r.fixed || 0, perfects: r.perfects || 0, xp: DS.Grow ? DS.Grow.sum(r.parts) : 0, ...(DS.Student && DS.Student.hintCount && DS.Student.hintCount(code) ? { hints: DS.Student.hintCount(code) } : {}) }); // 💡 그림 힌트를 펼친 소문제 수 (v0.9.7.4 · 성적 아님)

  const dots = (ok, total) => Array.from({ length: Math.min(total, 10) }, (_, i) => `<i class="${i < Math.round((ok / total) * Math.min(total, 10)) ? 'on' : ''}"></i>`).join('');
  // 🔎 자주 하는 실수 한 줄 (오개념 기록 · 점수 아님)
  const misLine = (mis) => { const t = DS.Mis ? DS.Mis.top(mis, 1)[0] : null; return t ? `<p class="rs-mis small">🔎 자주 하는 실수: ${esc(t.kid)} <span class="muted">(${t.wrong}번${t.fixed ? ` · ${t.fixed}번은 스스로 고침 ✔` : ''})</span></p>` : ''; };
  // 🔓 중단원던전 소개 (2026-11-03): 이 차시 수업이 열리면 그 차시 층이 열린다 — 결과 화면 · 종합상황실 마무리에서 한 줄
  const floorText = (L) => { if (!L.no || !L.boss) return ''; const ev = DS.Lessons.list.filter((x) => x.rooms).flatMap((x) => x.rooms.filter((r) => r.no === L.no)).length; return `🔓 🎯 허수아비에서 <b>복습! ${DS.Lessons.noText(L.no)}차시</b>가 열렸어요 — 수업 문제 · 👑 형성평가 재대결${ev ? ` · 🏰 성채던전 새 방 ${ev}개` : ''}`; }; // 2026-11-05 성채던전 · 허수아비 개편
  const floorLine = (L) => (floorText(L) ? `<p class="rs-floor small">${floorText(L)} <span class="muted">(내 캠프 · 혼자 도전)</span></p>` : '');
  // 복습 추천 버튼: 학습지 개념 · 중단원던전(그 차시 층의 보강 · 재대결) · 영상
  function recs(L, r, prep, inClass) {
    if (!r.weak.length) return '<p class="okc">👍 오늘 개념을 고르게 잘 해냈어요! 🏰 성채던전에서 단원 평가 문제에 도전해 보세요.</p>';
    return r.weak.map((c) => {
      const img = DS.Act.hasImg(prep, c), vid = DS.Video.pick(L, prep.video, c);
      return `<div class="rs-rec"><b>📌 ${esc(r.titles[c] || c)}</b> <span class="muted small">첫 시도 ${r.conc[c].ok} / ${r.conc[c].total}</span>
        <div class="row">${img ? `<button class="btn small" data-img="${c}">📄 학습지 개념 보기</button>` : ''}${L.no ? (inClass ? `<span class="muted small">🎯 수업이 끝나면 허수아비에서 복습! ${DS.Lessons.noText(L.no)}차시</span>` : `<button class="btn small" data-bonus="1">🎯 복습! ${DS.Lessons.noText(L.no)}차시 (허수아비)</button>`) : ''}${vid && DS.Video.ok(vid) ? `<button class="btn small" data-vid="${c}">🎬 설명 영상</button>` : ''}</div></div>`;
    }).join('');
  }
  // 학생 폰: 수업이 끝나면 한 번 (같은 수업은 다시 저장하지 않음)
  // opt.inClass: 형성평가 직후(수업 중) — 중단원던전 버튼 대신 「대기실로」 (v0.8.1)
  // 💾 기록 저장 (v0.9.7.6): 결과 화면 · 수업 중 진행 저장 · 교사 「결과 모으기」 · 복구 도구가 모두 이것을 쓴다
  //   records/{반}/{번호}/{차시} 덮어쓰기 + EXP 는 같은 수업 key(raid_코드)에 「늘어난 만큼만」 더함 → 여러 번 불러도 두 번 쌓이지 않음
  //   🎁 첫 레이드 특전: 이 차시 말고 다른 기록이 없으면 · 한 번 정한 특전 EXP 는 기록에 적어 두고 그대로 씀
  //   opt.cache (v0.9.8.0 · 수업 중 저장 줄이기): 기록 목록은 처음 한 번만 읽고 기억 · 바뀐 게 없으면 쓰지 않음 · EXP 도 늘었을 때만
  const memo = {};
  async function save(L, R, uid, m, code, rIn, at, opt = {}) {
    const r = rIn || compute(L, R, uid);
    if (!m || m.c == null || !m.n) return { r, g: null, first: false, raids: 1 };
    const mk = `${ck(m.c)}/${m.n}|${code}`, mm = opt.cache ? (memo[mk] = memo[mk] || {}) : {};
    const prev = mm.prev || (await DS.Net.get(`records/${ck(m.c)}/${m.n}`).catch(() => null)) || {};
    if (opt.cache) mm.prev = prev;
    const mineNow = prev[L.id] && prev[L.id].code === String(code) ? prev[L.id] : null;
    const others = Object.keys(prev).filter((k) => k !== L.id);
    const first = mineNow ? !!mineNow.firstXp : !others.length && !prev[L.id];
    if (first && DS.Grow) {
      if (mineNow && mineNow.firstXp) r.parts.first = mineNow.firstXp;
      else { const cur = await DS.Grow.mine(m).catch(() => DS.Grow.level(0)), base = DS.Grow.sum(r.parts); r.parts.first = Math.max(40, cur.next - cur.into - base + 1); }
    }
    const rec = summary(r, code); if (first && r.parts.first) rec.firstXp = r.parts.first; if (at) rec.at = at;
    if (mineNow && mineNow.loot) rec.loot = mineNow.loot; // 🎒 #71 전리품 요약은 다시 저장해도 남김
    if (R.meta && R.meta.resumeFrom != null && prev[L.id] && prev[L.id].code !== String(code)) { // ▶ 이어서 한 수업: 앞 수업에서 푼 몬스터 기록을 지우지 않고 합침 (2026-11-06)
      const pm = prev[L.id].mons || {}, cut = Number(R.meta.resumeFrom) || 0, before = new Set(L.steps.slice(0, cut).map((s) => s.id));
      rec.mons = Object.fromEntries(Object.keys({ ...pm, ...rec.mons }).map((k) => [k, before.has(k) && pm[k] != null ? pm[k] : rec.mons[k] != null ? rec.mons[k] : pm[k]]));
      rec.miss = [...new Set([...(prev[L.id].miss || []).filter((k) => before.has(k)), ...(rec.miss || []).filter((k) => !before.has(k))])];
      rec.resumeOf = prev[L.id].code || '';
    } // at: 결과 모으기 = 그 수업 시각
    const sig = JSON.stringify({ ...rec, at: 0 });
    if (!opt.cache || mm.sig !== sig) {
      try { await DS.Net.set(`records/${ck(m.c)}/${m.n}/${L.id}`, rec); mm.sig = sig; prev[L.id] = { ...rec }; } catch (e) { /* 저장 실패해도 결과는 보여 준다 */ }
    }
    const g = DS.Grow ? await DS.Grow.add(m, r.parts, `raid_${code}`, { upsert: true, cache: !!opt.cache }).catch(() => null) : null;
    if (DS.Gem && !(g && g.same)) { // 💎 (2026-11-05): 참여 3 + 맞힌 소문제 1개당 1 (처음이든 고쳐서든 · 최대 5) · 🔁 연속 참여 3 · 5 · 10차시 (한도 밖)
      const G = DS.Gem.G; DS.Gem.add(m, G.join + Math.min(G.solvedMax, Number(r.parts.correct) || 0), `raid_${code}`, '레이드', { upsert: true }).catch(() => {});
      if (r.perfects > 0 && G.perfect) DS.Gem.add(m, G.perfect, `perfect_${code}`, '⚡ 퍼펙트').catch(() => {}); // 2026-11-06 실력: 첫 시도 퍼펙트 몬스터가 하나라도
      if (r.parts.perfect && G.bossPerfect) DS.Gem.add(m, G.bossPerfect, `bossperfect_${code}`, '👑 형성평가 만점').catch(() => {});
      (async () => { const ck2 = (c) => String(c).replace(/[.#$/[\]]/g, '_'); const [recs, held] = await Promise.all([DS.Net.get(`records/${ck2(m.c)}/${m.n}`).catch(() => null), DS.Net.get(`held/${ck2(m.c)}`).catch(() => null)]);
        const s = DS.Gem.streak(recs || {}, Object.assign({}, held, { [L.id]: true })); if (G.streak[s]) DS.Gem.add(m, G.streak[s], `streak${s}_${L.id}`, `${s}차시 연속 참여`, { free: true }).catch(() => {}); })().catch(() => {});
    }
    return { r, g, first: first && !!g, raids: others.length + 1 };
  }
  // 📥 결과 모으기 (v0.9.7.6 · 교사 · 복구 도구): 방 기록(rooms/코드)으로 학생마다 save — 수업 끝 전에 나간 학생 기록 · EXP 를 다시 만든다
  //   그 차시 기록이 이미 있으면 그대로 둔다 (학생 폰이 저장함 · 방을 옮긴 학생) · 없는 학생만 새로 · EXP 는 같은 key 라 두 번 쌓이지 않음
  async function gather(code, cls) {
    const v = await DS.Net.get(`rooms/${code}`).catch(() => null);
    if (!v || !v.meta) throw new Error('이 수업의 방 기록이 없어요.');
    const R = DS.Act.unpackRoom(v), L = DS.Lessons.get(R.meta.lesson);
    if (!L) throw new Error('차시를 찾지 못했어요.');
    const out = { saved: [], kept: [], L };
    for (const [uid, p] of Object.entries(R.players || {})) {
      if (!p || p.teacher || p.cls == null || !p.num || (cls && p.cls !== cls)) continue;
      const old = await DS.Net.get(`records/${ck(p.cls)}/${p.num}/${L.id}`).catch(() => null);
      if (old) { out.kept.push(p.num); continue; } // 학생 폰이 이미 저장함 (결과 화면 · 진행 저장 · 다른 방)
      await save(L, R, uid, { c: p.cls, n: p.num }, code, null, p.first || p.at || R.meta.created || null);
      out.saved.push(p.num);
    }
    return out;
  }
  // 🎒 #71 오늘의 전리품 (2026-11-11 선생님 「전투 기록 결과로 대체」): 보물 상자가 열리며 숫자가 차례로 올라감(5초 안팎 · 누르면 건너뜀)
  //   ⭐ EXP(레벨 막대 · 오르면 이 화면에서 🎉) · 💎(이 수업 시각부터 받은 것 · 오늘 a / 100) · 📜 서술 조각 · 🔓 새 호칭 · 🏰 새 성채 방 · 다음 목표 하나
  //   수치는 바꾸지 않음(보여 주는 방식만) · 점수 · 정답률 · 등수는 크게 안 보임 · 요약은 records/…/{차시}/loot 에 남겨 📮 「지난 전리품」
  const lootKey = (me, L) => (me ? `citadel-castle-pop-${me.c}-${me.n}-${L.id}` : '');
  async function lootOf(L, R, uid, me, code, r, g) {
    const t0 = Number((R.meta || {}).created) || 0, real = !!(me && me.c != null && me.n && !(DS.Test && DS.Test.active && DS.Test.active()));
    const G = (DS.Gem && DS.Gem.G) || null;
    const est = G ? G.join + Math.min(G.solvedMax, Number(r.parts.correct) || 0) + (r.perfects > 0 ? G.perfect || 0 : 0) + (r.parts.perfect ? G.bossPerfect || 0 : 0) : 0;
    const out = { xp: g ? g.gained : DS.Grow ? DS.Grow.sum(r.parts) : 0, gem: est, scroll: 0, day: null, titles: [], rooms: [], goal: '', review: 0 };
    let d = null;
    if (real && DS.Gem) {
      await new Promise((res) => setTimeout(res, 600)); // 💎 보상(따로 쌓임)이 들어올 틈
      d = await DS.Gem.mine(me).catch(() => null);
      if (d) {
        let gem = 0, sc = 0;
        Object.entries(d.log || {}).forEach(([k, v]) => { if (!v || Number(v.at) < t0) return; if (/^s_/.test(k)) sc += Math.max(0, Number(v.s) || 0); else if (!/^enh_/.test(k) && Number(v.g) > 0) gem += Number(v.g); });
        out.gem = gem; out.scroll = sc; out.day = DS.Gem.DAY_CAP - DS.Gem.dayLeft(d);
      }
    }
    if (real && DS.Titles) { // 🔓 새 호칭 (캠프 「새 호칭」 알림과 같은 기록 → 여기서 보면 캠프에서 다시 안 알림)
      try {
        const k = `citadel-ttl-seen-${me.c}-${me.n}`; let seen = null; try { seen = JSON.parse(localStorage.getItem(k)); } catch (e) { /* 무시 */ }
        const got = DS.Titles.earned(await DS.Titles.data(me)).filter((t) => !/^lv\d/.test(t.id));
        if (seen) out.titles = got.filter((t) => !seen.includes(t.id)).map((t) => t.name);
        localStorage.setItem(k, JSON.stringify(got.map((t) => t.id)));
      } catch (e) { /* 무시 */ }
    }
    if (L.no && !L.eval) { // 🏰 이 차시로 열리는 성채 방 (#69 팝업은 여기서 보면 다시 안 띄움)
      out.rooms = DS.Lessons.list.filter((x) => x.rooms).flatMap((x) => x.rooms.filter((rm) => rm.no === L.no && !rm.boss).map((rm) => rm.title || rm.id));
      try { if (out.rooms.length && lootKey(me, L)) localStorage.setItem(lootKey(me, L), '1'); } catch (e) { /* 무시 */ }
    }
    if (d && DS.Gem.ENH) { const e = Number(d.enh) || 0, nx = DS.Gem.ENH[e + 1]; if (nx) { const need = nx.g - (Number(d.total) || 0); out.goal = need > 0 ? `⚒ 강화 +${e + 1}까지 💎 ${need} 남음` : `⚒ 지금 강화 +${e + 1} 할 수 있어요!`; } }
    if (!out.goal) out.goal = r.weak.length ? `📌 「${r.titles[r.weak[0]] || r.weak[0]}」 한 번 더 보기` : '🏰 성채던전 새 방에 도전';
    out.review = r.mons.filter((m) => m.st === 'x').length + (r.boss.tried ? r.boss.mast.slice(0, r.boss.hp).filter((ok) => !ok).length : 0);
    if (real) { try { await DS.Net.update(`records/${ck(me.c)}/${me.n}/${L.id}/loot`, { g: out.gem, s: out.scroll, xp: out.xp, u: [...out.titles.map((t) => `🏅 ${t}`), ...(out.rooms.length ? [`🏰 성채 방 ${out.rooms.length}개`] : [])].slice(0, 6) }); } catch (e) { /* 저장 실패해도 화면은 */ } }
    try { (api.last = api.last || {})[code] = { xp: out.xp, gem: out.gem, scroll: out.scroll }; } catch (e) { /* 무시 */ }
    return out;
  }
  function lootHtml(L, r, lt, lv, up, opt) {
    const rooms = lt.rooms.slice(0, 3).map(esc).join(' · ') + (lt.rooms.length > 3 ? ` 외 ${lt.rooms.length - 3}개` : '');
    return `<h2 class="lt-h">🎒 오늘의 전리품</h2><p class="muted small center">${L.no ? `${DS.Lessons.noText(L.no)}차시 ` : ''}${esc(L.title)}</p>
      <div class="lt-chest"><i class="lt-lid"></i><i class="lt-body"></i><i class="lt-glow"></i></div>
      <div class="lt-list">
        <div class="lt-row" data-k="xp"><span>⭐ EXP</span><b class="lt-n" data-to="${lt.xp}">+0</b>${lv ? `<div class="lt-lv${up ? ' up' : ''}"><small>Lv.${lv.lv} ${esc(lv.title)}${up ? ' <b class="lt-up">🎉 레벨 업!</b>' : ''}</small><div class="rs-bar"><i data-w="${Math.round((100 * lv.into) / lv.next)}" style="width:0%"></i><span>${lv.into} / ${lv.next}</span></div></div>` : ''}</div>
        <div class="lt-row" data-k="gem"><span>💎</span><b class="lt-n" data-to="${lt.gem}">+0</b>${lt.day != null ? `<small class="muted">오늘 받은 💎 ${lt.day} / ${DS.Gem.DAY_CAP}</small>` : ''}</div>
        <div class="lt-row" data-k="scroll"><span>📜 서술 조각</span>${lt.scroll ? `<b class="lt-n" data-to="${lt.scroll}">+0</b>` : '<small class="muted">✍ 서술형에 도전하면 📜!</small>'}</div>
        ${lt.titles.length ? `<div class="lt-row" data-k="ttl"><span>🔓 새 호칭</span><b class="lt-txt">${lt.titles.slice(0, 2).map((t) => `[${esc(t)}]`).join(' ')}${lt.titles.length > 2 ? ` 외 ${lt.titles.length - 2}개` : ''}</b></div>` : ''}
        ${lt.rooms.length ? `<div class="lt-row" data-k="room"><span>🏰 새 성채 방</span><b class="lt-txt">${lt.rooms.length}개 <small>${rooms}</small></b></div>` : ''}
        <div class="lt-row goal" data-k="goal"><span>🎯 다음 목표</span><b class="lt-txt">${esc(lt.goal)}</b></div>
      </div>
      ${lt.review ? `<p class="lt-review">📕 다시 볼 문제 <b>${lt.review}</b>개 → ${opt.inClass ? '수업이 끝나면 🎯 허수아비에서' : '<button class="btn small" data-dummy>🎯 허수아비</button>'}</p>` : ''}`;
  }
  function lootPlay(el, lt, lv, up) {
    const rows = [...el.querySelectorAll('.lt-row')], nums = [...el.querySelectorAll('.lt-n')], bar = el.querySelector('.lt-lv .rs-bar i');
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    let done = false; const timers = [];
    const finish = () => { if (done) return; done = true; timers.forEach(clearTimeout); el.classList.add('lt-done'); rows.forEach((x) => x.classList.add('on')); nums.forEach((n) => { n.textContent = `+${n.dataset.to}`; }); if (bar) bar.style.width = `${bar.dataset.w}%`; };
    el.querySelector('.loot-box').classList.add('lt-open');
    if (reduce) return finish();
    const STEP = 650;
    rows.forEach((row, k) => timers.push(setTimeout(() => {
      row.classList.add('on'); const n = row.querySelector('.lt-n');
      if (n) { const to = Number(n.dataset.to) || 0, t0 = performance.now(), dur = 520; const tick = (t) => { if (done) return; const f = Math.min(1, (t - t0) / dur); n.textContent = `+${Math.round(to * f)}`; if (f < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
      if (row.dataset.k === 'xp' && bar) setTimeout(() => { bar.style.width = `${bar.dataset.w}%`; if (up && DS.Sound) (DS.Sound.levelup || DS.Sound.correct)(); }, 300);
      if (row.dataset.k === 'gem' && lt.gem && DS.Sound && DS.Sound.coin) DS.Sound.coin();
    }, 700 + k * STEP)));
    timers.push(setTimeout(finish, 700 + rows.length * STEP + 400));
    el.querySelector('.lt-list').addEventListener('click', finish); el.querySelector('.lt-chest').addEventListener('click', finish);
  }
  async function show(L, R, uid, me, code, then, opt = {}) {
    const r = compute(L, R, uid);
    let g = null, first = false, raids = 1;
    const seenKey = `citadel-result-${code}`;
    let seen = false; try { seen = localStorage.getItem(seenKey) === '1'; } catch (e) { /* 무시 */ }
    api.busy = !(seen && !opt.force); // 🎒 #71: 전리품 화면에서 레벨 업을 보여 주니 따로 레벨업 창은 안 띄움
    if (me && me.c != null && me.n) ({ g, first, raids } = await save(L, R, uid, me, code, r));
    if (seen && !opt.force) { api.busy = false; return then(); } // v0.9.7.6: 진행 저장으로 g 가 늘 있으니 「이미 봄」만 본다 · force: 수업이 끝날 때는 이미 본 학생도 개인 결과를 다시 (2026-11-03)
    try { localStorage.setItem(seenKey, '1'); } catch (e) { /* 무시 */ }
    const prep = (DS.Test && DS.Test.active() && DS.Test.prep(L.id)) || (await DS.Act.prepLite(L.id)); // 이미지는 누를 때 한 장만 (v0.8.8)
    const lv = g ? g.after : DS.Grow && me ? await DS.Grow.mine(me).catch(() => null) : null;
    const up = g && g.after.lv > g.before.lv;
    const el = document.createElement('div'); el.className = 'modal rs-modal';
    const mark = (m) => (!m.tried ? '<span class="muted">— 안 함</span>' : `${m.first ? `<span class="okc">✔ ${m.first}</span>` : ''} ${m.fixed ? `<span class="gold">🔁 ${m.fixed}</span>` : ''} ${m.miss ? `<span class="ngc">✖ ${m.miss}</span>` : ''}`);
    const lt = await lootOf(L, R, uid, me, code, r, g);
    el.innerHTML = `<div class="quiz-box framed rs-box loot-box">${lootHtml(L, r, lt, lv, up, opt)}
      <details class="rs-more"><summary>자세히 ▸ <small class="muted">몬스터별 · 개념별 · 복습 추천 · 📤 카톡</small></summary><p class="muted small">${esc(L.unit || '')} · ${esc(L.title)} — 성적이 아니라 다음에 볼 것을 알려 주는 기록이에요</p>
      ${g && g.gained ? `<p class="rs-why">${DS.Grow.lines(r.parts).map((l) => `${esc(l.why)} ${l.n > 1 ? `×${l.n} ` : ''}<b>+${l.xp}</b>`).join(' · ')}</p>` : ''}
      ${first ? `<div class="rs-perk"><b>🎁 첫 출정 특전!</b> 새 용사가 합류했어요 ${DS.Art.hero(9, 'attack', 'pairhop')}<span class="muted small">내 캠프 💎 상점에서 고를 수 있어요</span></div>` : ''}
      <p class="shelf-title">몬스터별</p><table class="r-table rs-t">${r.mons.map((m) => `<tr><td>${esc(m.title)}</td><td>${mark(m)}</td></tr>`).join('')}
        <tr><td>👑 형성평가</td><td>${r.boss.tried ? `${r.boss.mast.slice(0, r.boss.hp).filter(Boolean).length} / ${r.boss.hp}${r.boss.mast.length > r.boss.hp && r.boss.mast[r.boss.hp] ? ' + 보너스 ✔' : ''}` : '<span class="muted">— 안 함</span>'}</td></tr></table>
      <p class="muted small">✔ 처음에 맞힘 · 🔁 재도전으로 고침 · ✖ 끝까지 못 맞힘</p>
      <p class="shelf-title">개념별 (첫 시도)</p>${Object.entries(r.conc).map(([c, v]) => `<div class="rs-c"><span>${esc(r.titles[c] || c)}</span><span class="rs-dots">${dots(v.ok, v.total)}</span><span class="muted small">${v.ok} / ${v.total}</span></div>`).join('')}
      <p class="shelf-title">복습 추천</p>${floorLine(L)}${misLine(r.mis)}${recs(L, r, prep, opt.inClass)}
      <p class="shelf-title">📤 카톡으로 보내기</p><div class="row rs-share"><button class="btn" id="rs-card1">⚔ 전투 기록 보내기</button><button class="btn" id="rs-card2">📘 수학 노트 보내기</button></div>
      ${(() => { const cs = DS.Unit ? DS.Unit.CARDS.filter((c) => c.no === L.no) : []; return cs.length ? `<p class="rs-forge">⚒ 오늘 배운 개념 카드 <b>${cs.length}장</b>이 모루에서 기다려요 · 장마다 💎 +${DS.Gem ? DS.Gem.G.card : 3}</p>` : ''; })()}
      </details>
      <div class="row"><button class="btn primary big" id="rs-ok">${opt.inClass ? '🏕 대기실로' : '🏕 내 캠프로'}</button></div></div>`;
    document.body.appendChild(el);
    lootPlay(el, lt, lv, up);
    el.querySelectorAll('[data-img]').forEach((b) => (b.onclick = () => DS.Control.run(async () => {
      const src = (prep.img || {})[b.dataset.img] || (await DS.Act.prepImg(L.id, b.dataset.img));
      if (!src) { DS.UI.toast('아직 이 개념의 학습지 이미지가 없어요.'); return; }
      const v = document.createElement('div'); v.className = 'modal sheet-modal'; v.innerHTML = `<div class="quiz-box framed"><div class="quiz-head"><b>📄 ${esc(r.titles[b.dataset.img] || '')}</b><button class="btn small" data-x>✕ 닫기</button></div><img class="bn-sheet" src="${src}" alt="학습지"></div>`; v.querySelector('[data-x]').onclick = () => v.remove(); document.body.appendChild(v);
    })));
    el.querySelectorAll('[data-vid]').forEach((b) => (b.onclick = () => DS.Video.open(DS.Video.pick(L, prep.video, b.dataset.vid), r.titles[b.dataset.vid], { lesson: L.id, slot: b.dataset.vid })));
    el.querySelectorAll('[data-bonus]').forEach((b) => (b.onclick = () => { el.remove(); api.busy = false; then(true); }));
    el.querySelector('#rs-ok').onclick = () => { el.remove(); api.busy = false; then(); };
    el.querySelectorAll('[data-dummy]').forEach((b) => (b.onclick = () => { el.remove(); api.busy = false; then(true); }));
    const who = { name: (me && me.name) || '용사', hero: me ? me.hero : (DS.Test && DS.Test.active() ? 0 : 0) };
    if (!who.name || who.name === '용사') { try { const p = (R.players || {})[uid] || {}; who.name = p.nick || who.name; who.hero = p.hero || who.hero; } catch (e) { /* 무시 */ } }
    const no = L.no ? `${DS.Lessons.noText(L.no)}차시 ` : '';
    el.querySelector('#rs-card1').onclick = () => DS.Control.run(() => DS.ShareCard.preview(() => DS.ShareCard.battle({ L, r, me: who, lv, gained: g ? g.gained : 0, up, first, raids }), `오늘의 전투 기록 · ${no}${L.title}`, `⚔ 모두의 던전 ${no}${L.title} 클리어!${lv ? ` Lv.${lv.lv} ${lv.title}` : ''}${g && g.gained ? ` (+${g.gained} EXP)` : ''}`));
    el.querySelector('#rs-card2').onclick = () => DS.Control.run(() => DS.ShareCard.preview(() => DS.ShareCard.math({ L, r, me: who }), `오늘의 수학 노트 · ${no}${L.title}`, `📘 공통수학2 ${no}${L.title} — 오늘 배운 것과 다음 수업`));
    return null;
  }
  // 📮 🎒 지난 전리품 (#71 · 2026-11-11): 우편함 안에서 펼친 채 · 최근 차시 위로 · 차시마다 카드 하나 (옛 기록은 전리품 요약이 없어 — 로)
  function lootHist(rec) {
    const ids = Object.keys(rec || {}).filter((id) => rec[id] && typeof rec[id] === 'object').sort((a, b) => (rec[b].no || 0) - (rec[a].no || 0) || (Number(rec[b].at) || 0) - (Number(rec[a].at) || 0));
    if (!ids.length) return '<p class="muted">아직 전리품이 없어요. 수업이 끝나면 여기에 쌓여요.</p>';
    return ids.map((id) => {
      const x = rec[id], L = DS.Lessons.get(id), lt = x.loot || null, names = x.names || {}, miss = (x.miss || []).length + Math.max(0, (Number(x.bossN) || 0) - (Number(x.boss) || 0));
      const v = (n) => (lt ? `+${Number(n) || 0}` : '—');
      return `<div class="lh-card"><b class="lh-t">${x.no ? `${DS.Lessons.noText(x.no)}차시 ` : ''}${esc(L ? L.title : id)}</b>
        <div class="lh-got"><span>⭐ <b>+${Number(lt ? lt.xp : x.xp) || 0}</b></span><span>💎 <b>${v(lt && lt.g)}</b></span><span>📜 <b>${v(lt && lt.s)}</b></span><span class="muted small">👑 형성평가 ${x.boss || 0} / ${x.bossN || '-'}</span></div>
        ${lt && (lt.u || []).length ? `<p class="lh-u small">🔓 ${lt.u.map(esc).join(' · ')}</p>` : ''}
        ${miss ? `<p class="lh-rv small">📕 다시 볼 것 <b>${miss}</b>개 → 🎯 허수아비</p>` : ''}
        <div class="lh-dots">${Object.entries(x.conc || {}).map(([c, cv]) => `<span><small>${esc(names[c] || c)}</small><i class="rs-dots">${dots(cv[0], cv[1] || 1)}</i></span>`).join('')}</div></div>`;
    }).join('');
  }
  // 교사 학생 관리 · 학생 복습 노트: 차시별 기록 (records/{반}/{번호})
  function history(rec) {
    const ids = Object.keys(rec || {}).sort((a, b) => (rec[a].no || 0) - (rec[b].no || 0));
    if (!ids.length) return '<p class="muted">아직 기록이 없어요. (v0.8.0 부터 수업이 끝날 때 쌓여요)</p>';
    return ids.map((id) => {
      const x = rec[id], L = DS.Lessons.get(id), names = x.names || {};
      return `<div class="rs-hist"><b>${x.no ? `${DS.Lessons.noText(x.no)}차시` : ''} ${esc(L ? L.title : id)}</b> <span class="muted small">형성평가 ${x.boss || 0} / ${x.bossN || '-'} · +${x.xp || 0} EXP</span>
        ${Object.entries(x.conc || {}).map(([c, v]) => `<div class="rs-c"><span>${esc(names[c] || c)}</span><span class="rs-dots">${dots(v[0], v[1] || 1)}</span><span class="muted small">${v[0]} / ${v[1]}</span></div>`).join('')}
        ${misLine(x.mis)}${(x.weak || []).length ? `<p class="small">📌 복습 추천: <b>${x.weak.map((c) => esc(names[c] || c)).join(', ')}</b></p>` : '<p class="small okc">👍 고르게 잘함</p>'}</div>`;
    }).join('');
  }
  const api = { compute, summary, save, gather, show, history, lootHist, conceptMap, floorText, lootKey, busy: false, last: {} };
  return api;
})();
