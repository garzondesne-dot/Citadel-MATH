// ⚔ 보강던전 (4차시부터 · 학생 혼자 · 모닥불의 파랑 차원문): 차시마다 학습지 보강 문항이 몬스터로 나온다. 레이드(수업) 중에는 들어가지 않는다.
// - 열린 범위 = 모루와 같음: 우리 반에 배포한 차시까지 (unlock/{반})
// - 처치 조건 = 소문제 전부 맞히기 (혼자라 기준% 없음). 기회 3번(첫 시도 + 재도전 2번) — 틀린 소문제만 새 숫자·새 문장으로 다시. 실패해도 벌 없음
// - 처음 들어가면 학습지 원문(attempt 0), 다시 들어가면 새 시드의 다른 문제
// - 그 차시 보강을 모두 처치하면 📘 보강 인장 1개 → 인장 1 · 2 · 4 · 6 · 8 · 10개에서 화려한 공격 이펙트가 하나씩 열린다
// - 기록: bonus/{반}/{번호}/{차시}/{몬스터} = { clear, tries, at } (성적이 아니라 참여 기록). 🎬 설명 영상 · 📄 학습지 보기 = 수업 준비에서 올린 것
// - 보라(중단원) · 빨강(대단원) 차원문은 자리만 — 단원을 마치면 열린다 (내용은 추후)
window.DS = window.DS || {};

DS.Bonus = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  const N = () => DS.Net;
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const UNLOCK = [1, 2, 4, 6, 8, 10];             // 인장 개수 → 화려한 이펙트 FANCY[i]
  const TRIES = 3;
  let me = null, no = 0, mine = {}, prepCache = {};

  const lessons = () => DS.Lessons.list.filter((l) => (l.bonus || []).length);
  // 인장 = 보강을 모두 처치한 차시 목록 (data = bonus/{반}/{번호})
  function seals(data) {
    data = data || {};
    return lessons().filter((l) => l.bonus.every((b) => ((data[l.id] || {})[b.id] || {}).clear)).map((l) => l.id);
  }
  // 화려한 이펙트 열림 { fire: true, … }
  function fxOpen(data) {
    const n = seals(data).length, out = {};
    DS.FX.FANCY.forEach((k, i) => { if (n >= UNLOCK[i]) out[k] = true; });
    return out;
  }
  const fxCond = (i) => `📘 보강 인장 ${UNLOCK[i]}개`;

  async function enter(m) {
    me = m;
    no = Number(await N().get(`unlock/${ck(m.c)}`).catch(() => 0)) || 0;
    mine = (await N().get(`bonus/${ck(m.c)}/${m.n}`).catch(() => null)) || {};
    DS.UI.show('screen-bonus');
    render();
  }
  async function prepOf(id) {
    if (DS.Test && DS.Test.active() && DS.Test.prep(id)) return DS.Test.prep(id);
    if (!prepCache[id]) prepCache[id] = await DS.Act.prepLite(id); // 이미지는 누를 때 한 장만 (v0.8.8)
    return prepCache[id];
  }
  function render() {
    const open = lessons().filter((l) => l.no <= no), sl = seals(mine), nextFx = UNLOCK.findIndex((u) => sl.length < u);
    $('#bonus').innerHTML = `<div class="bn-top"><button class="btn small" id="bn-back">≪ 모닥불로</button><b>📘 보강던전</b><span class="bn-seal">📘 인장 ${sl.length}개</span></div>
      <div class="bn-portals">
        <div class="bn-portal on"><i style="background-image:url('${DS.ASSETS.base}${DS.ASSETS.dportals.bonus}')"></i><b>보강던전</b><span class="muted small">차시 보강 · 혼자</span></div>
        <div class="bn-portal lock" data-lock="mid"><i style="background-image:url('${DS.ASSETS.base}${DS.ASSETS.dportals.mid}')"></i><b>🔒 중단원던전</b><span class="muted small">중단원을 마치면</span></div>
        <div class="bn-portal lock" data-lock="big"><i style="background-image:url('${DS.ASSETS.base}${DS.ASSETS.dportals.big}')"></i><b>🔒 대단원던전</b><span class="muted small">대단원을 마치면</span></div>
      </div>
      <p class="bn-fx">✨ 화려한 이펙트: ${nextFx < 0 ? '모두 열렸어요!' : `인장 <b>${UNLOCK[nextFx]}개</b>가 되면 「${esc(DS.FX.NAMES[DS.FX.FANCY[nextFx]])}」이 열려요 (지금 ${sl.length}개)`}</p>
      ${open.length ? open.map((l) => card(l, sl.includes(l.id))).join('') : `<div class="panel framed"><p class="muted">${no ? '4차시부터 보강던전이 열려요. (2 · 3차시 보강은 수업 레이드에 있었어요)' : '선생님이 우리 반 수업을 열면 그 차시 보강던전이 열려요.'}</p></div>`}`;
    $('#bn-back').onclick = () => DS.Camp.enter(me);
    document.querySelectorAll('[data-lock]').forEach((b) => (b.onclick = () => DS.UI.toast(b.dataset.lock === 'mid' ? '🔒 중단원던전은 「집합」 단원을 마치면 열려요 (준비 중)' : '🔒 대단원던전은 「집합과 명제」를 마치면 열려요 (준비 중)', 3200)));
    document.querySelectorAll('[data-fight]').forEach((b) => (b.onclick = () => { const [lid, mid] = b.dataset.fight.split('|'); DS.Control.run(() => fight(DS.Lessons.get(lid), mid)); }));
  }
  function card(l, sealed) {
    const rec = mine[l.id] || {};
    return `<div class="panel framed bn-card${sealed ? ' sealed' : ''}"><p class="bn-h"><b>${l.no}차시 · ${esc(l.title)}</b>${sealed ? '<span class="bn-stamp">📘 인장 획득</span>' : `<span class="muted small">${l.bonus.filter((b) => (rec[b.id] || {}).clear).length} / ${l.bonus.length}</span>`}</p>
      <div class="bn-list">${l.bonus.map((b) => { const r = rec[b.id] || {}; return `<div class="bn-row${r.clear ? ' clear' : ''}">${DS.Art.monster(l.monsters[b.id].sprite, r.clear ? 'down' : 'idle')}<span>${esc(b.title)}${r.tries && !r.clear ? ` <span class="muted small">· ${r.tries}번 도전</span>` : ''}</span><button class="btn small${r.clear ? '' : ' primary'}" data-fight="${l.id}|${b.id}">${r.clear ? '✔ 다시 하기' : r.tries ? '⚔ 다시 도전' : '⚔ 도전'}</button></div>`; }).join('')}</div></div>`;
  }

  // ── 1:1 전투 ───────────────────────────────────────────
  async function fight(L, mid) {
    const mon = L.monsters[mid], rec = (mine[L.id] || {})[mid] || {}, prep = await prepOf(L.id);
    const first = !rec.tries && !rec.clear, clearedBefore = !!rec.clear, sealedBefore = seals(mine).includes(L.id);
    const seed = `${N().uid()}|${Date.now()}`;
    let attempt = first ? 0 : 1, left = TRIES;
    const n = L.items(mid, seed, attempt).length;
    const solved = new Array(n).fill(false);
    const el = document.createElement('div'); el.className = 'bn-fight';
    document.body.appendChild(el);
    const img = DS.Act.hasImg(prep, mid), cslot = (L.bonus.find((b) => b.id === mid) || {}).concept, vslot = DS.Video.pick(L, prep.video, mid) ? mid : cslot, vid = DS.Video.pick(L, prep.video, vslot);
    const draw = (cls = '', msg = '') => {
      const pips = Array.from({ length: TRIES }, (_, i) => `<i class="${i < left ? 'on' : ''}"></i>`).join('');
      const segs = solved.map((s) => `<i class="${s ? 'gone' : ''}"></i>`).join('');
      const done = solved.every(Boolean);
      el.innerHTML = `<div class="scene enc bg-scene th-${L.theme || ''} ${cls}"><div class="scene-bar"><div><b>⚔ ${esc(mon.title)}</b><br><span class="muted small">${L.no}차시 보강던전 · 소문제 ${n}개를 모두 맞히면 처치</span></div><button class="btn small" id="bf-x">✕</button></div>
          <div class="enc-hero"><div class="enc-tries" title="남은 도전 기회">${pips}</div>${DS.Art.hero(me.hero || 0, done ? 'attack' : 'idle', done ? 'pairhop' : cls === 'miss' ? 'slump' : 'huff')}<i class="shadow"></i></div>
          <div class="enc-mon">${DS.Art.monster(mon.sprite, done ? 'down' : 'idle', done ? '' : 'float')}<div class="segs">${segs}</div></div></div>
        <div class="bf-body">${msg}${mon.note ? `<p class="muted small">💡 ${esc(mon.note)}</p>` : ''}
          <div class="row">${img ? '<button class="btn small" id="bf-sheet">📄 학습지 보기</button>' : ''}${vid && DS.Video.ok(vid) ? '<button class="btn small" id="bf-vid">🎬 설명 보기</button>' : ''}</div>
          <div class="row" id="bf-act"></div></div>`;
      el.querySelector('#bf-x').onclick = () => { el.remove(); render(); };
      const sh = el.querySelector('#bf-sheet'); if (sh) sh.onclick = () => DS.Control.run(async () => { const src = (prep.img || {})[mid] || (await DS.Act.prepImg(L.id, mid)); if (src) sheet(src, mon.title); else DS.UI.toast('아직 이 칸의 학습지 이미지가 없어요.'); });
      const vb = el.querySelector('#bf-vid'); if (vb) vb.onclick = () => DS.Video.open(vid, mon.title, { lesson: L.id, slot: vslot });
      return el.querySelector('#bf-act');
    };
    const round = async () => {
      const items = L.items(mid, seed, attempt);
      for (let i = 0; i < n; i++) {
        if (solved[i]) continue;
        const ok = await DS.Quiz.ask({ name: mon.title, formula: `${i + 1} / ${n}` }, items[i], { tag: attempt ? '🔄 숫자가 바뀌었어요' : '⚔ 보강던전' });
        if (ok) { solved[i] = true; DS.FX.play(el.querySelector('.scene'), me.fx || 'flame', { scale: 0.3 }); }
        draw(ok ? 'hit' : 'miss');
      }
      left--;
      const cleared = solved.every(Boolean);
      const tries = Number(rec.tries || 0) + 1;
      rec.tries = tries;
      const patch = { tries, at: N().TS };
      if (cleared) patch.clear = true;
      await N().update(`bonus/${ck(me.c)}/${me.n}/${L.id}/${mid}`, patch).catch(() => {});
      mine[L.id] = mine[L.id] || {}; mine[L.id][mid] = Object.assign({}, mine[L.id][mid], { tries, clear: cleared || (mine[L.id][mid] || {}).clear });
      if (cleared) return win();
      if (left <= 0) {
        const act = draw('miss', '<p class="gold">기회를 모두 썼어요. 해설을 다시 보고 다음에 새 문제로 도전해요! (벌은 없어요)</p>');
        act.innerHTML = '<button class="btn primary" id="bf-out">보강던전으로</button>';
        act.querySelector('#bf-out').onclick = () => { el.remove(); render(); };
        return null;
      }
      const act = draw('', `<p>맞힌 소문제 <b>${solved.filter(Boolean).length} / ${n}</b> — 틀린 것만 새 숫자로 다시!</p>`);
      act.innerHTML = '<button class="btn primary" id="bf-again">🔄 다시 도전</button>';
      act.querySelector('#bf-again').onclick = () => { attempt++; round(); };
      return null;
    };
    const win = async () => {
      const sealed = !sealedBefore && seals(mine).includes(L.id);
      DS.Sound.correct();
      if (DS.Grow && !clearedBefore) DS.Grow.add(me, { bonusClear: 1, seal: sealed ? 1 : 0 }).catch(() => {});
      const fx = sealed ? DS.FX.FANCY.find((k, i) => seals(mine).length === UNLOCK[i]) : null;
      const act = draw('', `<p class="okc"><b>🎉 처치!</b>${sealed ? ` <b class="gold">📘 ${L.no}차시 보강 인장을 얻었어요!</b>` : ''}${fx ? `<br>✨ 화려한 이펙트 「${esc(DS.FX.NAMES[fx])}」이 열렸어요! ⚙ 설정에서 바꿀 수 있어요` : ''}</p>`);
      act.innerHTML = '<button class="btn primary" id="bf-out">보강던전으로</button>';
      act.querySelector('#bf-out').onclick = () => { el.remove(); render(); };
    };
    const act = draw('', `<p>${first ? '학습지 보강 문항이에요.' : '다시 들어오면 새 문제가 나와요.'} 기회 ${TRIES}번 — 틀린 소문제만 다시 풀어요.</p>`);
    act.innerHTML = '<button class="btn primary big" id="bf-go">⚔ 전투 시작</button>';
    act.querySelector('#bf-go').onclick = () => round();
  }
  function sheet(src, title) {
    const el = document.createElement('div'); el.className = 'modal sheet-modal';
    el.innerHTML = `<div class="quiz-box framed"><div class="quiz-head"><b>📄 ${esc(title)}</b><button class="btn small" data-x>✕ 닫기</button></div><img class="bn-sheet" src="${src}" alt="학습지"></div>`;
    el.querySelector('[data-x]').onclick = () => el.remove();
    document.body.appendChild(el);
  }
  return { enter, seals, fxOpen, fxCond, UNLOCK };
})();
