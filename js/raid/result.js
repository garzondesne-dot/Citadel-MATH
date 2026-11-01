// ⚔ 오늘의 전투 결과 (v0.8.0): 레이드가 끝나면 학생 폰에 개인 결과 → 모닥불. 성적이 아니라 "무엇을 더 보면 좋을지" 알려 주는 화면
// - 몬스터마다 ✔ 처음에 맞힘 / 🔁 재도전으로 고침 / ✖ 끝까지 못 맞힘
// - 개념별 이해도 = 첫 시도 정답률 (몬스터는 바로 앞 개념 칸에 묶임, 보스 문항은 차시 파일의 boss.tags)
// - 복습 추천 = 낮은 개념 1~2개 → 📄 학습지 개념 보기 · ⚔ 보강던전 · 🎬 설명 영상
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
    let submits = 0, best = 0, fixed = 0;
    const mons = L.steps.filter((s) => s.kind === 'monster').map((s) => {
      const rec = X.record(L, R, s.id, uid);
      const n = rec.total, first = rec.tries[0];
      const firstOk = Array.from({ length: n }, (_, i) => !!(first && first.attempt === 0 && first.marks[i]));
      const everOk = Array.from({ length: n }, (_, i) => rec.tries.some((t) => t.marks[i]));
      if (rec.submitted) firstOk.forEach((ok) => bump(map[s.id], ok)); // 안 한 몬스터는 개념 이해도에 넣지 않는다 (늦게 들어온 학생)
      submits += rec.tries.length; best += rec.best;
      const fx = everOk.filter((ok, i) => ok && !firstOk[i]).length; fixed += fx;
      return { id: s.id, title: s.title, concept: map[s.id], n, tried: rec.submitted, first: firstOk.filter(Boolean).length, fixed: fx, miss: everOk.filter((ok) => !ok).length };
    });
    const ans = ((R.bossAns || {})[uid]) || {}, tags = L.boss.tags || [];
    const set1 = Array.from({ length: L.boss.items }, (_, i) => { const g = (ans[1] || [])[i]; return g != null && g !== '' && DS.Quiz.grade(L.boss.sets[1][i], g); });
    const mast = X.mastery(L, R, uid), bossTried = !!ans[1];
    if (bossTried) set1.forEach((ok, i) => bump(tags[i] || 'boss', ok));
    const bossFixed = mast.filter((ok, i) => ok && !set1[i]).length;
    const perfect = X.fullMarks(L, R, uid), bossWin = X.bossHp(L, R).won && bossTried;
    const words = !!((R.words || {})[uid] || {}).t;
    const order = Object.keys(conc).filter((c) => conc[c].total);
    const weak = order.map((c) => ({ c, r: conc[c].ok / conc[c].total })).filter((x) => x.r < 0.8).sort((a, b) => a.r - b.r).slice(0, 2).map((x) => x.c);
    const parts = { join: 1, submit: submits, correct: best + mast.filter(Boolean).length, fixed: fixed + bossFixed, bossWin: bossWin ? 1 : 0, perfect: perfect ? 1 : 0 }; // 마지막 한마디 EXP 는 한마디를 남길 때 따로 (v0.8.1)
    return { lesson: L.id, no: L.no || 0, title: L.title, mons, boss: { set1, mast, tried: bossTried, hp: L.boss.hpItems }, conc, titles, weak, parts };
  }
  // 저장용 요약 (records/{반}/{번호}/{차시})
  const summary = (r, code) => ({ at: (DS.Net || {}).TS || Date.now(), code: String(code || ''), no: r.no,
    conc: Object.fromEntries(Object.entries(r.conc).map(([c, v]) => [c, [v.ok, v.total]])), names: r.titles,
    miss: r.mons.filter((m) => m.miss).map((m) => m.id), weak: r.weak, boss: r.boss.mast.filter(Boolean).length, bossN: r.boss.hp, xp: DS.Grow ? DS.Grow.sum(r.parts) : 0 });

  const dots = (ok, total) => Array.from({ length: Math.min(total, 10) }, (_, i) => `<i class="${i < Math.round((ok / total) * Math.min(total, 10)) ? 'on' : ''}"></i>`).join('');
  // 복습 추천 버튼: 학습지 개념 · 보강던전(그 개념의 보강) · 영상
  function recs(L, r, prep, inClass) {
    if (!r.weak.length) return '<p class="okc">👍 오늘 개념을 고르게 잘 해냈어요! 보강던전에서 인장을 모아 보세요.</p>';
    return r.weak.map((c) => {
      const img = (prep.img || {})[c], vid = (prep.video || {})[c], bon = (L.bonus || []).filter((b) => b.concept === c);
      return `<div class="rs-rec"><b>📌 ${esc(r.titles[c] || c)}</b> <span class="muted small">첫 시도 ${r.conc[c].ok} / ${r.conc[c].total}</span>
        <div class="row">${img ? `<button class="btn small" data-img="${c}">📄 학습지 개념 보기</button>` : ''}${bon.length ? (inClass ? `<span class="muted small">📘 수업이 끝나면 보강던전 · ${esc(bon[0].title)}</span>` : `<button class="btn small" data-bonus="1">⚔ 보강던전 · ${esc(bon[0].title)}</button>`) : ''}${vid && DS.Video.embed(vid) ? `<button class="btn small" data-vid="${c}">🎬 설명 영상</button>` : ''}</div></div>`;
    }).join('');
  }
  // 학생 폰: 수업이 끝나면 한 번 (같은 수업은 다시 저장하지 않음)
  // opt.inClass: 형성평가 직후(수업 중) — 보강던전 버튼 대신 「대기실로」 (v0.8.1)
  async function show(L, R, uid, me, code, then, opt = {}) {
    const r = compute(L, R, uid);
    let g = null, first = false;
    const seenKey = `citadel-result-${code}`;
    let seen = false; try { seen = localStorage.getItem(seenKey) === '1'; } catch (e) { /* 무시 */ }
    if (me && me.c != null && me.n) {
      // 🎁 첫 레이드 특전 (v0.8.1): 처음 쌓는 기록이면 「첫 출정 축하」 EXP 로 레벨업 보장 + 추가 용사(두 번째) 해금
      const prev = await DS.Net.get(`records/${ck(me.c)}/${me.n}`).catch(() => null);
      first = !prev || !Object.keys(prev).length;
      if (first && DS.Grow) {
        const cur = await DS.Grow.mine(me).catch(() => DS.Grow.level(0)), base = DS.Grow.sum(r.parts);
        r.parts.first = Math.max(40, cur.next - cur.into - base + 1);
      }
      try { await DS.Net.set(`records/${ck(me.c)}/${me.n}/${L.id}`, summary(r, code)); } catch (e) { /* 저장 실패해도 결과는 보여 준다 */ }
      if (DS.Grow) g = await DS.Grow.add(me, r.parts, `raid_${code}`).catch(() => null);
      if (!g) first = false;
    }
    if (seen && !g) return then();
    try { localStorage.setItem(seenKey, '1'); } catch (e) { /* 무시 */ }
    const prep = (DS.Test && DS.Test.active() && DS.Test.prep(L.id)) || (await DS.Net.get(`prep/${L.id}`).catch(() => null)) || {};
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
      <p class="shelf-title">복습 추천</p>${recs(L, r, prep, opt.inClass)}
      <div class="row"><button class="btn primary big" id="rs-ok">${opt.inClass ? '🏕 대기실로' : '🔥 모닥불로'}</button></div></div>`;
    document.body.appendChild(el);
    if (up) DS.Sound.correct();
    el.querySelectorAll('[data-img]').forEach((b) => (b.onclick = () => { const v = document.createElement('div'); v.className = 'modal sheet-modal'; v.innerHTML = `<div class="quiz-box framed"><div class="quiz-head"><b>📄 ${esc(r.titles[b.dataset.img] || '')}</b><button class="btn small" data-x>✕ 닫기</button></div><img class="bn-sheet" src="${prep.img[b.dataset.img]}" alt="학습지"></div>`; v.querySelector('[data-x]').onclick = () => v.remove(); document.body.appendChild(v); }));
    el.querySelectorAll('[data-vid]').forEach((b) => (b.onclick = () => DS.Video.open(prep.video[b.dataset.vid], r.titles[b.dataset.vid])));
    el.querySelectorAll('[data-bonus]').forEach((b) => (b.onclick = () => { el.remove(); then(true); }));
    el.querySelector('#rs-ok').onclick = () => { el.remove(); then(); };
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
        ${(x.weak || []).length ? `<p class="small">📌 복습 추천: <b>${x.weak.map((c) => esc(names[c] || c)).join(', ')}</b></p>` : '<p class="small okc">👍 고르게 잘함</p>'}</div>`;
    }).join('');
  }
  return { compute, summary, show, history, conceptMap };
})();
