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
    let submits = 0, best = 0, fixed = 0, perfects = 0, fixEx = null;
    const mis = {}, M = DS.Mis; // 🔎 오개념 (2026-11-03): 틀린 답의 종류 · 나중에 바로잡았는지
    const mons = L.steps.filter((s) => s.kind === 'monster').map((s) => {
      const rec = X.record(L, R, s.id, uid);
      const n = rec.total, first = rec.tries[0];
      const firstOk = Array.from({ length: n }, (_, i) => !!(first && first.attempt === 0 && first.marks[i]));
      const everOk = Array.from({ length: n }, (_, i) => rec.tries.some((t) => t.marks[i]));
      const sp = (L.split || {})[s.id]; // v0.9.6.18: 한 몬스터에 두 개념이면 소문제마다 (5차시 문제 3 · 4)
      if (rec.submitted) firstOk.forEach((ok, i) => bump((sp && sp[i]) || map[s.id], ok)); // 안 한 몬스터는 개념 이해도에 넣지 않는다 (늦게 들어온 학생)
      submits += rec.tries.length; best += rec.best;
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
    const ans = ((R.bossAns || {})[uid]) || {}, tags = L.boss.tags || [];
    const set1 = Array.from({ length: L.boss.items }, (_, i) => { const g = (ans[1] || [])[i]; return g != null && g !== '' && DS.Quiz.grade(L.boss.sets[1][i], g); });
    const mast = X.mastery(L, R, uid), bossTried = !!ans[1];
    if (bossTried) set1.forEach((ok, i) => bump(tags[i] || 'boss', ok));
    const bossFixed = mast.filter((ok, i) => ok && !set1[i]).length;
    if (M) [1, 2].forEach((k) => (ans[k] || []).forEach((g, i) => { const q = L.boss.sets[k] && L.boss.sets[k][i]; if (!q || g == null || g === '' || DS.Quiz.grade(q, g)) return; M.add(mis, M.classify(q, g, M.bossTag(L.id, k, i)), !!mast[i]); }));
    const anyBoss = X.activeIds(R).some((u) => ((R.bossAns || {})[u] || {})[1]);
    const bossM = mast.map((ok, i) => (ok ? 'o' : [1, 2].some((k) => { const g = (ans[k] || [])[i]; return g != null && g !== ''; }) ? 'x' : anyBoss ? '-' : 'n')).join(''); // 문항마다 (⭐ 도전 문항 포함)
    const perfect = X.fullMarks(L, R, uid), bossWin = X.bossHp(L, R).won && bossTried;
    const words = !!((R.words || {})[uid] || {}).t;
    const order = Object.keys(conc).filter((c) => conc[c].total);
    const weak = order.map((c) => ({ c, r: conc[c].ok / conc[c].total })).filter((x) => x.r < 0.8).sort((a, b) => a.r - b.r).slice(0, 2).map((x) => x.c);
    const parts = { join: 1, submit: submits, correct: best + mast.filter(Boolean).length, fixed: fixed + bossFixed, bossWin: bossWin ? 1 : 0, perfect: perfect ? 1 : 0 }; // 마지막 한마디 EXP 는 한마디를 남길 때 따로 (v0.8.1)
    const hp = X.bossHp(L, R), bossShare = hp.max ? Math.min(100, Math.round((100 * mast.filter(Boolean).length) / hp.max)) : 0;
    return { mis, lesson: L.id, no: L.no || 0, title: L.title, mons, boss: { set1, mast, bossM, tried: bossTried, hp: L.boss.hpItems, won: hp.won, share: bossShare }, conc, titles, weak, parts, perfects, fixed: fixed + bossFixed, fixEx,
      words: words ? String(((R.words || {})[uid] || {}).t) : '' };
  }
  // 저장용 요약 (records/{반}/{번호}/{차시})
  const summary = (r, code) => ({ at: (DS.Net || {}).TS || Date.now(), code: String(code || ''), no: r.no,
    conc: Object.fromEntries(Object.entries(r.conc).map(([c, v]) => [c, [v.ok, v.total]])), names: r.titles,
    miss: r.mons.filter((m) => m.miss).map((m) => m.id), weak: r.weak, ...(Object.keys(r.mis || {}).length ? { mis: r.mis } : {}), boss: r.boss.mast.slice(0, r.boss.hp).filter(Boolean).length, bossN: r.boss.hp, bossX: r.boss.mast.slice(r.boss.hp).filter(Boolean).length, bossM: r.boss.bossM, mons: Object.fromEntries(r.mons.map((m) => [m.id, m.st])), won: !!r.boss.won, fixed: r.fixed || 0, perfects: r.perfects || 0, xp: DS.Grow ? DS.Grow.sum(r.parts) : 0, ...(DS.Student && DS.Student.hintCount && DS.Student.hintCount(code) ? { hints: DS.Student.hintCount(code) } : {}) }); // 💡 그림 힌트를 펼친 소문제 수 (v0.9.7.4 · 성적 아님)

  const dots = (ok, total) => Array.from({ length: Math.min(total, 10) }, (_, i) => `<i class="${i < Math.round((ok / total) * Math.min(total, 10)) ? 'on' : ''}"></i>`).join('');
  // 🔎 자주 하는 실수 한 줄 (오개념 기록 · 점수 아님)
  const misLine = (mis) => { const t = DS.Mis ? DS.Mis.top(mis, 1)[0] : null; return t ? `<p class="rs-mis small">🔎 자주 하는 실수: ${esc(t.kid)} <span class="muted">(${t.wrong}번${t.fixed ? ` · ${t.fixed}번은 스스로 고침 ✔` : ''})</span></p>` : ''; };
  // 🔓 중단원던전 소개 (2026-11-03): 이 차시 수업이 열리면 그 차시 층이 열린다 — 결과 화면 · 종합상황실 마무리에서 한 줄
  const floorText = (L) => { const b = (L.bonus || []).length; return L.no && L.boss ? `🔓 🟪 중단원던전 <b>${L.no}층</b>이 열렸어요 — ${b ? `보강 몬스터 ${b}마리 · ` : ''}👑 형성평가 재대결` : ''; };
  const floorLine = (L) => (floorText(L) ? `<p class="rs-floor small">${floorText(L)} <span class="muted">(모닥불의 보라 차원문 · 혼자 도전)</span></p>` : '');
  // 복습 추천 버튼: 학습지 개념 · 중단원던전(그 차시 층의 보강 · 재대결) · 영상
  function recs(L, r, prep, inClass) {
    if (!r.weak.length) return '<p class="okc">👍 오늘 개념을 고르게 잘 해냈어요! 🟪 중단원던전에서 인장을 모아 보세요.</p>';
    return r.weak.map((c) => {
      const img = DS.Act.hasImg(prep, c), vid = DS.Video.pick(L, prep.video, c), bon = (L.bonus || []).filter((b) => b.concept === c);
      return `<div class="rs-rec"><b>📌 ${esc(r.titles[c] || c)}</b> <span class="muted small">첫 시도 ${r.conc[c].ok} / ${r.conc[c].total}</span>
        <div class="row">${img ? `<button class="btn small" data-img="${c}">📄 학습지 개념 보기</button>` : ''}${L.no ? (inClass ? `<span class="muted small">🟪 수업이 끝나면 중단원던전 ${L.no}층 · ${esc(bon.length ? bon[0].title : '👑 형성평가 재대결')}</span>` : `<button class="btn small" data-bonus="1">🟪 중단원던전 ${L.no}층 · ${esc(bon.length ? bon[0].title : '👑 형성평가 재대결')}</button>`) : ''}${vid && DS.Video.ok(vid) ? `<button class="btn small" data-vid="${c}">🎬 설명 영상</button>` : ''}</div></div>`;
    }).join('');
  }
  // 학생 폰: 수업이 끝나면 한 번 (같은 수업은 다시 저장하지 않음)
  // opt.inClass: 형성평가 직후(수업 중) — 중단원던전 버튼 대신 「대기실로」 (v0.8.1)
  // 💾 기록 저장 (v0.9.7.6): 결과 화면 · 수업 중 진행 저장 · 교사 「결과 모으기」 · 복구 도구가 모두 이것을 쓴다
  //   records/{반}/{번호}/{차시} 덮어쓰기 + EXP 는 같은 수업 key(raid_코드)에 「늘어난 만큼만」 더함 → 여러 번 불러도 두 번 쌓이지 않음
  //   🎁 첫 레이드 특전: 이 차시 말고 다른 기록이 없으면 · 한 번 정한 특전 EXP 는 기록에 적어 두고 그대로 씀
  async function save(L, R, uid, m, code, rIn, at) {
    const r = rIn || compute(L, R, uid);
    if (!m || m.c == null || !m.n) return { r, g: null, first: false, raids: 1 };
    const prev = (await DS.Net.get(`records/${ck(m.c)}/${m.n}`).catch(() => null)) || {};
    const mineNow = prev[L.id] && prev[L.id].code === String(code) ? prev[L.id] : null;
    const others = Object.keys(prev).filter((k) => k !== L.id);
    const first = mineNow ? !!mineNow.firstXp : !others.length;
    if (first && DS.Grow) {
      if (mineNow && mineNow.firstXp) r.parts.first = mineNow.firstXp;
      else { const cur = await DS.Grow.mine(m).catch(() => DS.Grow.level(0)), base = DS.Grow.sum(r.parts); r.parts.first = Math.max(40, cur.next - cur.into - base + 1); }
    }
    const rec = summary(r, code); if (first && r.parts.first) rec.firstXp = r.parts.first; if (at) rec.at = at; // at: 결과 모으기 = 그 수업 시각
    try { await DS.Net.set(`records/${ck(m.c)}/${m.n}/${L.id}`, rec); } catch (e) { /* 저장 실패해도 결과는 보여 준다 */ }
    const g = DS.Grow ? await DS.Grow.add(m, r.parts, `raid_${code}`, { upsert: true }).catch(() => null) : null;
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
  async function show(L, R, uid, me, code, then, opt = {}) {
    const r = compute(L, R, uid);
    let g = null, first = false, raids = 1;
    const seenKey = `citadel-result-${code}`;
    let seen = false; try { seen = localStorage.getItem(seenKey) === '1'; } catch (e) { /* 무시 */ }
    if (me && me.c != null && me.n) ({ g, first, raids } = await save(L, R, uid, me, code, r));
    if (seen && !opt.force) return then(); // v0.9.7.6: 진행 저장으로 g 가 늘 있으니 「이미 봄」만 본다 · force: 수업이 끝날 때는 이미 본 학생도 개인 결과를 다시 (2026-11-03)
    try { localStorage.setItem(seenKey, '1'); } catch (e) { /* 무시 */ }
    const prep = (DS.Test && DS.Test.active() && DS.Test.prep(L.id)) || (await DS.Act.prepLite(L.id)); // 이미지는 누를 때 한 장만 (v0.8.8)
    const lv = g ? g.after : DS.Grow && me ? await DS.Grow.mine(me).catch(() => null) : null;
    const up = g && g.after.lv > g.before.lv;
    const el = document.createElement('div'); el.className = 'modal rs-modal';
    const mark = (m) => (!m.tried ? '<span class="muted">— 안 함</span>' : `${m.first ? `<span class="okc">✔ ${m.first}</span>` : ''} ${m.fixed ? `<span class="gold">🔁 ${m.fixed}</span>` : ''} ${m.miss ? `<span class="ngc">✖ ${m.miss}</span>` : ''}`);
    el.innerHTML = `<div class="quiz-box framed rs-box"><h2>⚔ 오늘의 전투 결과</h2><p class="muted small">${esc(L.unit || '')} · ${esc(L.title)} — 성적이 아니라 다음에 볼 것을 알려 주는 기록이에요</p>
      ${lv ? `<div class="rs-lv${up ? ' up' : ''}"><b>${up ? '🎉 레벨 업! ' : ''}Lv.${lv.lv} ${esc(lv.title)}</b>${g && g.gained ? ` <span class="gold">+${g.gained} EXP</span>` : ''}<div class="rs-bar"><i style="width:${Math.round((100 * lv.into) / lv.next)}%"></i><span>${lv.into} / ${lv.next}</span></div></div>` : ''}
      ${g && g.gained ? `<p class="rs-why">${DS.Grow.lines(r.parts).map((l) => `${esc(l.why)} ${l.n > 1 ? `×${l.n} ` : ''}<b>+${l.xp}</b>`).join(' · ')}</p>` : ''}
      ${first ? `<div class="rs-perk"><b>🎁 첫 출정 특전!</b> 새 용사가 합류했어요 ${DS.Art.hero(9, 'attack', 'pairhop')}<span class="muted small">모닥불 ⚙ 설정에서 고를 수 있어요</span></div>` : ''}
      <p class="shelf-title">몬스터별</p><table class="r-table rs-t">${r.mons.map((m) => `<tr><td>${esc(m.title)}</td><td>${mark(m)}</td></tr>`).join('')}
        <tr><td>👑 형성평가</td><td>${r.boss.tried ? `${r.boss.mast.slice(0, r.boss.hp).filter(Boolean).length} / ${r.boss.hp}${r.boss.mast.length > r.boss.hp && r.boss.mast[r.boss.hp] ? ' + 보너스 ✔' : ''}` : '<span class="muted">— 안 함</span>'}</td></tr></table>
      <p class="muted small">✔ 처음에 맞힘 · 🔁 재도전으로 고침 · ✖ 끝까지 못 맞힘</p>
      <p class="shelf-title">개념별 (첫 시도)</p>${Object.entries(r.conc).map(([c, v]) => `<div class="rs-c"><span>${esc(r.titles[c] || c)}</span><span class="rs-dots">${dots(v.ok, v.total)}</span><span class="muted small">${v.ok} / ${v.total}</span></div>`).join('')}
      <p class="shelf-title">복습 추천</p>${floorLine(L)}${misLine(r.mis)}${recs(L, r, prep, opt.inClass)}
      <p class="shelf-title">📤 카톡으로 보내기</p><div class="row rs-share"><button class="btn" id="rs-card1">⚔ 전투 기록 보내기</button><button class="btn" id="rs-card2">📘 수학 노트 보내기</button></div>
      <div class="row"><button class="btn primary big" id="rs-ok">${opt.inClass ? '🏕 대기실로' : '🔥 모닥불로'}</button></div></div>`;
    document.body.appendChild(el);
    if (up) DS.Sound.correct();
    el.querySelectorAll('[data-img]').forEach((b) => (b.onclick = () => DS.Control.run(async () => {
      const src = (prep.img || {})[b.dataset.img] || (await DS.Act.prepImg(L.id, b.dataset.img));
      if (!src) { DS.UI.toast('아직 이 개념의 학습지 이미지가 없어요.'); return; }
      const v = document.createElement('div'); v.className = 'modal sheet-modal'; v.innerHTML = `<div class="quiz-box framed"><div class="quiz-head"><b>📄 ${esc(r.titles[b.dataset.img] || '')}</b><button class="btn small" data-x>✕ 닫기</button></div><img class="bn-sheet" src="${src}" alt="학습지"></div>`; v.querySelector('[data-x]').onclick = () => v.remove(); document.body.appendChild(v);
    })));
    el.querySelectorAll('[data-vid]').forEach((b) => (b.onclick = () => DS.Video.open(DS.Video.pick(L, prep.video, b.dataset.vid), r.titles[b.dataset.vid], { lesson: L.id, slot: b.dataset.vid })));
    el.querySelectorAll('[data-bonus]').forEach((b) => (b.onclick = () => { el.remove(); then(true); }));
    el.querySelector('#rs-ok').onclick = () => { el.remove(); then(); };
    const who = { name: (me && me.name) || '용사', hero: me ? me.hero : (DS.Test && DS.Test.active() ? 0 : 0) };
    if (!who.name || who.name === '용사') { try { const p = (R.players || {})[uid] || {}; who.name = p.nick || who.name; who.hero = p.hero || who.hero; } catch (e) { /* 무시 */ } }
    const no = L.no ? `${L.no}차시 ` : '';
    el.querySelector('#rs-card1').onclick = () => DS.Control.run(() => DS.ShareCard.preview(() => DS.ShareCard.battle({ L, r, me: who, lv, gained: g ? g.gained : 0, up, first, raids }), `오늘의 전투 기록 · ${no}${L.title}`, `⚔ 모두의 던전 ${no}${L.title} 클리어!${lv ? ` Lv.${lv.lv} ${lv.title}` : ''}${g && g.gained ? ` (+${g.gained} EXP)` : ''}`));
    el.querySelector('#rs-card2').onclick = () => DS.Control.run(() => DS.ShareCard.preview(() => DS.ShareCard.math({ L, r, me: who }), `오늘의 수학 노트 · ${no}${L.title}`, `📘 공통수학2 ${no}${L.title} — 오늘 배운 것과 다음 수업`));
    return null;
  }
  // 교사 학생 관리 · 학생 복습 노트: 차시별 기록 (records/{반}/{번호})
  function history(rec) {
    const ids = Object.keys(rec || {}).sort((a, b) => (rec[a].no || 0) - (rec[b].no || 0));
    if (!ids.length) return '<p class="muted">아직 기록이 없어요. (v0.8.0 부터 수업이 끝날 때 쌓여요)</p>';
    return ids.map((id) => {
      const x = rec[id], L = DS.Lessons.get(id), names = x.names || {};
      return `<div class="rs-hist"><b>${x.no ? `${x.no}차시` : ''} ${esc(L ? L.title : id)}</b> <span class="muted small">형성평가 ${x.boss || 0} / ${x.bossN || '-'} · +${x.xp || 0} EXP</span>
        ${Object.entries(x.conc || {}).map(([c, v]) => `<div class="rs-c"><span>${esc(names[c] || c)}</span><span class="rs-dots">${dots(v[0], v[1] || 1)}</span><span class="muted small">${v[0]} / ${v[1]}</span></div>`).join('')}
        ${misLine(x.mis)}${(x.weak || []).length ? `<p class="small">📌 복습 추천: <b>${x.weak.map((c) => esc(names[c] || c)).join(', ')}</b></p>` : '<p class="small okc">👍 고르게 잘함</p>'}</div>`;
    }).join('');
  }
  return { compute, summary, save, gather, show, history, conceptMap, floorText };
})();
