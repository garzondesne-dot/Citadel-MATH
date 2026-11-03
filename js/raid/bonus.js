// 🟪 중단원던전 (2026-11-03 사용자 확정 · 보강던전을 대신함 · 학생 혼자 · 모닥불의 보라 차원문). 레이드(수업)와 따로.
// - 층 = 차시: 그 반에서 그 차시 수업이 열리면(unlock/{반}) 그 층이 풀림 · 열린 층은 순서 없이 자유
//   층 안 = 그 차시 보강 몬스터(4차시~) + 👑 그 차시 형성평가 재대결(세트 1 → 2 → 1 …, 틀린 소문제만 다른 세트로)
// - 꼭대기 층 = 중단원 마무리 (lessons/eval-1.js) — 선생님이 교사 메뉴에서 반마다 「열기」 (evalOpen/{반}/{평가 id})
// - 🟥 대단원던전 = 잠금 표시만 (명제까지 마친 뒤)
// - 처치 조건 = 소문제 전부 맞히기. 기회 4번(첫 시도 + 재도전 3번) — 틀린 소문제만 새 숫자로. 실패해도 벌 없음
// - 인장 = 한 층을 모두 처치 (보강 몬스터가 있는 층은 보강 몬스터 모두 — 예전 보강 인장 그대로 · 2 · 3층과 꼭대기는 그 층 몬스터 모두)
//   → 인장 1 · 2 · 4 · 6 · 8 · 10개에서 화려한 공격 이펙트가 하나씩 열린다
// - 기록: bonus/{반}/{번호}/{차시}/{몬스터 · boss} = { clear, tries, at, mis } (예전 보강던전 기록 그대로 이어짐 · 성적이 아니라 참여 기록)
window.DS = window.DS || {};

DS.Bonus = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  const N = () => DS.Net;
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const UNLOCK = [1, 2, 4, 6, 8, 10];             // 인장 개수 → 화려한 이펙트 FANCY[i]
  const TRIES = (DS.Raid ? DS.Raid.RETRIES : 3) + 1; // 레이드와 같은 기회 수
  let me = null, no = 0, liveNo = 0, mine = {}, prepCache = {}; // liveNo = 지금 수업 중인 차시 (연습 목록에서 뺀다)
  // 🎯 훈련 허수아비 (v0.9.6, 캠프 기본 오브젝트 · 특전 아님): 열린 차시의 수업 몬스터(문제 칸)를 숫자만 바꿔 혼자 연습 — 기말 대비.
  //   기록은 저장하지 않고 EXP 만 조금 (같은 날 같은 몬스터는 한 번). 중단원던전과 같은 1:1 전투 화면을 쓴다
  let train = false;
  const fieldIds = (l) => l.steps.filter((st) => st.kind === 'monster' && l.monsters[st.id]).map((st) => st.id);
  // 중단원던전: 단원마다 층 범위 · 꼭대기 (명제 중단원은 7~10차시가 생기면 여기에 한 줄)
  const DUNGEONS = [{ id: 'mid1', title: '집합 중단원던전', from: 2, to: 6, top: 'eval-1' }];
  const floorIds = (l) => [...(l.bonus || []).map((b) => b.id), ...(l.boss && l.no ? ['boss'] : [])]; // 층 안의 몬스터
  const lessons = () => (train ? DS.Lessons.list.filter((l) => l.no && fieldIds(l).length) : DS.Lessons.list.filter((l) => l.no && !l.eval && l.boss).sort((a, b) => a.no - b.no));
  // 인장 = 처치한 층 목록 (data = bonus/{반}/{번호}) — 보강 몬스터가 있으면 보강 몬스터 모두 (예전 보강 인장과 같음), 없으면 그 층 몬스터 모두
  const sealIds = (l) => ((l.bonus || []).length ? l.bonus.map((b) => b.id) : floorIds(l));
  function seals(data) {
    data = data || {};
    return DS.Lessons.list.filter((l) => (l.no || l.eval) && sealIds(l).length).filter((l) => sealIds(l).every((id) => ((data[l.id] || {})[id] || {}).clear)).map((l) => l.id);
  }
  // 몬스터 · 소문제 (👑 형성평가 재대결 = 세트 1 · 2 를 번갈아, 체력 문항까지만)
  const monOf = (L, mid) => (mid === 'boss' ? { title: `👑 ${L.no}차시 형성평가 재대결`, sprite: L.boss.sprite, note: '' } : L.monsters[mid]);
  const itemsOf = (L, mid, seed, attempt) => (mid === 'boss' ? (L.boss.sets[attempt % 2 === 0 ? 1 : 2] || L.boss.sets[1]).slice(0, L.boss.hpItems || L.boss.items) : L.items(mid, seed, attempt));
  // 화려한 이펙트 열림 { fire: true, … }
  function fxOpen(data) {
    const n = seals(data).length, out = {};
    DS.FX.FANCY.forEach((k, i) => { if (n >= UNLOCK[i]) out[k] = true; });
    return out;
  }
  const fxCond = (i) => `🟪 던전 인장 ${UNLOCK[i]}개`;

  let preview = false, evalOpen = {}; // preview = 교사 대기공간: 모든 층 미리 보기 (기록 저장 안 함) · evalOpen = 꼭대기 층 열림 { 'eval-1': true }
  async function enter(m, opt = {}) {
    me = m; preview = !!opt.preview; train = !!opt.train;
    if (m && m.test && !opt.train) opt = Object.assign({}, opt, { no: 99 }); // 🧪 테스트 · 🎮 체험판: 모든 층 · 꼭대기 층 열림
    no = preview || (m && m.test) ? Number(opt.no) || 99 : Number(await N().get(`unlock/${ck(m.c)}`).catch(() => 0)) || 0;
    liveNo = 0; // 2026-11-03 사용자 결정: 수업 중 잠금 · 수업 중인 차시를 목록에서 빼기 없앰
    mine = preview ? {} : (await N().get(`bonus/${ck(m.c)}/${m.n}`).catch(() => null)) || {};
    evalOpen = m && m.test ? Object.fromEntries(DS.Lessons.list.filter((l) => l.eval).map((l) => [l.id, true])) : preview ? null : (await N().get(`evalOpen/${ck(m.c)}`).catch(() => null)) || {};
    DS.UI.show('screen-bonus');
    render();
  }
  async function prepOf(id) {
    if (DS.Test && DS.Test.active() && DS.Test.prep(id)) return DS.Test.prep(id);
    if (!prepCache[id]) prepCache[id] = await DS.Act.prepLite(id); // 이미지는 누를 때 한 장만 (v0.8.8)
    return prepCache[id];
  }
  const topOpen = (id) => preview || !!(evalOpen || {})[id];
  function render() {
    if (train) return renderTrain();
    const sl = seals(mine), nextFx = UNLOCK.findIndex((u) => sl.length < u), A = DS.ASSETS;
    const body = DUNGEONS.map((D) => {
      const floors = lessons().filter((l) => l.no >= D.from && l.no <= D.to), open = floors.filter((l) => l.no <= no), top = DS.Lessons.get(D.top);
      const topCard = !top ? '' : topOpen(top.id) ? card(top, sl.includes(top.id), `🏰 꼭대기 층 · ${top.title}`)
        : `<div class="panel framed bn-card bn-locked"><p class="bn-h"><b>🔒 꼭대기 층 · ${esc(top.title)}</b></p><p class="muted small">${D.from}~${D.to}차시를 모두 배운 뒤 선생님이 열어 줘요 (중단원 평가 날). 문제 ${(top.bonus || []).length}마리 · 교과서 중단원 마무리를 숫자만 바꾼 문제</p></div>`;
      return `<p class="bn-dtitle">🟪 ${esc(D.title)} <span class="muted small">${D.from}~${D.to}차시 · 열린 층 ${open.length} / ${floors.length}</span></p>${topCard}
        ${open.length ? open.slice().reverse().map((l) => card(l, sl.includes(l.id), `${l.no}층 · ${l.no}차시 ${l.title}`)).join('') : `<div class="panel framed"><p class="muted">선생님이 우리 반 수업을 열면 그 차시 층이 열려요.</p></div>`}`;
    }).join('');
    $('#bonus').innerHTML = `<div class="bn-top"><button class="btn small" id="bn-back">≪ ${preview ? '교사 캠프' : '모닥불로'}</button><b>🟪 중단원던전</b><span class="bn-seal">🟪 인장 ${sl.length}개</span></div>
      <div class="bn-portals">
        <div class="bn-portal on mid"><i style="background-image:url('${A.base}${A.dportals.mid}')"></i><b>중단원던전</b><span class="muted small">차시마다 한 층 · 혼자</span></div>
        <div class="bn-portal lock" data-lock="big"><i style="background-image:url('${A.base}${A.dportals.big}')"></i><b>🔒 대단원던전</b><span class="muted small">명제까지 마치면</span></div>
      </div>
      <p class="bn-fx">✨ 화려한 이펙트: ${nextFx < 0 ? '모두 열렸어요!' : `인장 <b>${UNLOCK[nextFx]}개</b>가 되면 「${esc(DS.FX.NAMES[DS.FX.FANCY[nextFx]])}」이 열려요 (지금 ${sl.length}개 · 한 층을 모두 처치하면 인장 1개)`}</p>
      ${body}`;
    $('#bn-back').onclick = () => (preview ? DS.TCamp.back() : DS.Camp.enter(me));
    document.querySelectorAll('[data-lock]').forEach((b) => (b.onclick = () => DS.UI.toast('🔒 대단원던전은 「집합과 명제」를 모두 마치면 열려요 (10차시 뒤)', 3200)));
    document.querySelectorAll('[data-fight]').forEach((b) => (b.onclick = () => { const [lid, mid] = b.dataset.fight.split('|'); DS.Control.run(() => fight(DS.Lessons.get(lid), mid)); }));
  }
  function card(l, sealed, head) {
    const rec = mine[l.id] || {}, ids = l.eval ? l.bonus.map((b) => b.id) : floorIds(l), need = sealIds(l);
    return `<div class="panel framed bn-card${sealed ? ' sealed' : ''}${l.eval ? ' bn-topfloor' : ''}"><p class="bn-h"><b>${esc(head)}</b>${sealed ? '<span class="bn-stamp">🟪 인장 획득</span>' : `<span class="muted small">${need.filter((id) => (rec[id] || {}).clear).length} / ${need.length}</span>`}</p>
      <div class="bn-list">${ids.map((id) => { const r = rec[id] || {}, m = monOf(l, id); return `<div class="bn-row${r.clear ? ' clear' : ''}${id === 'boss' ? ' boss' : ''}">${DS.Art.monster(m.sprite, r.clear ? 'down' : 'idle')}<span>${esc(m.title)}${r.tries && !r.clear ? ` <span class="muted small">· ${r.tries}번 도전</span>` : ''}</span><button class="btn small${r.clear ? '' : ' primary'}" data-fight="${l.id}|${id}">${r.clear ? '✔ 다시 하기' : r.tries ? '⚔ 다시 도전' : '⚔ 도전'}</button></div>`; }).join('')}</div></div>`;
  }

  function renderTrain() {
    const open = lessons().filter((l) => l.no <= no && l.no !== liveNo).sort((a, b) => b.no - a.no);
    $('#bonus').innerHTML = `<div class="bn-top"><button class="btn small" id="bn-back">≪ ${preview ? '교사 캠프' : '모닥불로'}</button><b>🎯 훈련 허수아비</b><span class="bn-seal">기말 대비</span></div>
      <p class="bn-fx">지난 차시 수업 문제를 <b>숫자만 바꿔</b> 혼자 연습해요. 기록은 남지 않고, 경험치가 조금 쌓여요 (같은 날 같은 몬스터는 한 번).</p>
      ${open.length ? open.map((l) => `<div class="panel framed bn-card"><p class="bn-h"><b>${l.no}차시 · ${esc(l.title)}</b></p>
        <div class="bn-list">${fieldIds(l).map((mid) => { const st = l.steps.find((x) => x.id === mid); return `<div class="bn-row">${DS.Art.monster(l.monsters[mid].sprite, 'idle')}<span>${esc(st.title || mid)}</span><button class="btn small primary" data-fight="${l.id}|${mid}">🎯 연습</button></div>`; }).join('')}</div></div>`).join('')
        : '<div class="panel framed"><p class="muted">선생님이 우리 반 수업을 열면 그 차시 문제로 연습할 수 있어요.</p></div>'}`;
    $('#bn-back').onclick = () => (preview ? DS.TCamp.back() : DS.Camp.enter(me));
    document.querySelectorAll('[data-fight]').forEach((b) => (b.onclick = () => { const [lid, mid] = b.dataset.fight.split('|'); DS.Control.run(() => fight(DS.Lessons.get(lid), mid)); }));
  }

  // ── 1:1 전투 ───────────────────────────────────────────
  async function fight(L, mid) {
    const mon = monOf(L, mid), rec = train ? {} : (mine[L.id] || {})[mid] || {}, prep = await prepOf(L.id);
    const first = !train && !rec.tries && !rec.clear, clearedBefore = !!rec.clear, sealedBefore = seals(mine).includes(L.id);
    const seed = `${N().uid()}|${Date.now()}`;
    let attempt = first ? 0 : 1, left = TRIES;
    const n = itemsOf(L, mid, seed, attempt).length;
    const solved = new Array(n).fill(false);
    const el = document.createElement('div'); el.className = 'bn-fight';
    document.body.appendChild(el);
    // 👾 몬스터 공격 (중단원던전 · 사용자 확정 2026-11-03): 혼자 하는 곳이라 이 폰에서만 45초마다 1초 잠금. 🎯 허수아비 연습은 공격 없음
    //   학습지 · 영상을 보는 동안 · 화면 꺼짐 동안은 멈춤. 기회 · 경험치는 줄지 않음
    let gT = 0, gLast = Date.now();
    const gTimer = train ? null : setInterval(() => {
      if (!document.body.contains(el)) { clearInterval(gTimer); return; }
      const now = Date.now(), dt = Math.min(1, (now - gLast) / 1000); gLast = now;
      const g = el.querySelector('.atk-gauge'); if (!g || document.hidden || document.querySelector('.sheet-modal, .video-modal')) return;
      const [per, lock] = (window.DS_ATK || DS.Raid.ATK).monster;
      gT += dt; const p = Math.min(1, gT / per), bar = g.querySelector('i');
      bar.style.width = `${(p * 100).toFixed(1)}%`; g.classList.toggle('hot', p > 0.8);
      if (gT < per) return;
      gT = 0; bar.style.width = '0%'; g.classList.remove('hot');
      const m = el.querySelector('.art.monster'), hb = el.querySelector('.enc-hero');
      if (m) { m.classList.remove('lunge'); void m.offsetWidth; m.classList.add('lunge'); setTimeout(() => m.classList.remove('lunge'), 500); }
      setTimeout(() => {
        const art = () => el.querySelector('.enc-hero .art');
        if (hb) { hb.classList.remove('struck'); void hb.offsetWidth; hb.classList.add('struck'); setTimeout(() => hb.classList.remove('struck'), 600); }
        const a1 = art(); if (a1) a1.outerHTML = DS.Art.hero(me.hero || 0, 'hit', '');
        setTimeout(() => { const a2 = art(); if (a2) a2.outerHTML = DS.Art.hero(me.hero || 0, 'pant', ''); }, 350);
        setTimeout(() => { const a3 = art(); if (a3) a3.outerHTML = DS.Art.hero(me.hero || 0, 'think', 'huff'); }, 350 + lock * 1000 + 500);
        DS.Sound.squish(); if (navigator.vibrate) navigator.vibrate(60);
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        const st = document.createElement('div'); st.className = 'stun'; st.innerHTML = `<b>💥 몬스터의 공격! ${lock}초 멈춤</b>`;
        document.body.appendChild(st); setTimeout(() => st.remove(), lock * 1000);
      }, 200);
    }, 200);
    const img = DS.Act.hasImg(prep, mid), cslot = ((L.bonus || []).find((b) => b.id === mid) || {}).concept, vslot = DS.Video.pick(L, prep.video, mid) ? mid : cslot, vid0 = DS.Video.pick(L, prep.video, vslot);
    // 🎬 꼭대기 층(평가): 소문제마다 풀이 영상(q.video) · 한 번 틀린 뒤에 열림 (예제 영상 → 다른 숫자로 직접, 2026-11-03 사용자 확정)
    let cur = itemsOf(L, mid, seed, attempt), wrongSeen = !!rec.tries;
    const vidNow = () => { if (!L.eval) return vid0; const i = solved.findIndex((x) => !x); return i >= 0 && cur[i] ? cur[i].video || null : null; };
    const draw = (cls = '', msg = '') => {
      const pips = Array.from({ length: TRIES }, (_, i) => `<i class="${i < left ? 'on' : ''}"></i>`).join('');
      const segs = solved.map((s) => `<i class="${s ? 'gone' : ''}"></i>`).join('');
      const done = solved.every(Boolean);
      el.innerHTML = `<div class="scene enc bg-scene th-${L.theme || ''} ${cls}"><div class="scene-bar"><div><b>⚔ ${esc(mon.title)}</b><br><span class="muted small">${train ? `${L.no}차시 🎯 허수아비 연습` : L.eval ? '🟪 중단원던전 꼭대기 층' : `🟪 중단원던전 ${L.no}층`} · 소문제 ${n}개를 모두 맞히면 처치</span></div><button class="btn small" id="bf-x">✕</button></div>
          <div class="enc-hero"><div class="enc-tries" title="남은 도전 기회">${pips}</div>${DS.Art.hero(me.hero || 0, done || cls ? 'attack' : 'think', done ? 'pairhop' : cls === 'miss' ? 'slump' : 'huff')}<i class="shadow"></i></div>
          <div class="enc-mon">${DS.Art.monster(mon.sprite, done ? 'down' : 'idle', done ? '' : 'float')}<div class="segs">${segs}</div>${done || train ? '' : '<div class="atk-gauge" title="몬스터 공격 게이지"><i></i></div>'}</div></div>
        <div class="bf-body">${msg}${mon.note ? `<p class="muted small">💡 ${esc(mon.note)}</p>` : ''}
          <div class="row">${img ? '<button class="btn small" id="bf-sheet">📄 학습지 보기</button>' : ''}${(() => { const v = vidNow(); if (!v || !DS.Video.ok(v)) return ''; if (L.eval && !wrongSeen) return '<span class="muted small">🔒🎬 풀이 영상은 한 번 틀리면 열려요 — 먼저 스스로!</span>'; return `<button class="btn small" id="bf-vid">🎬 ${L.eval ? '풀이 영상 (예제)' : '설명 보기'}</button>`; })()}</div>
          <div class="row" id="bf-act"></div></div>`;
      el.querySelector('#bf-x').onclick = () => { el.remove(); render(); };
      const sh = el.querySelector('#bf-sheet'); if (sh) sh.onclick = () => DS.Control.run(async () => { const src = (prep.img || {})[mid] || (await DS.Act.prepImg(L.id, mid)); if (src) sheet(src, mon.title); else DS.UI.toast('아직 이 칸의 학습지 이미지가 없어요.'); });
      const vb = el.querySelector('#bf-vid'); if (vb) vb.onclick = () => DS.Video.open(vidNow(), mon.title, { lesson: L.id, slot: vslot });
      return el.querySelector('#bf-act');
    };
    const wrongs = [], misBase = (DS.Mis && rec.mis) ? DS.Mis.merge({}, rec.mis) : {}; // 🔎 이 판에서 틀린 소문제 (판이 끝날 때마다 다시 계산 · 겹쳐 세지 않음)
    const round = async () => {
      const items = itemsOf(L, mid, seed, attempt); cur = items;
      for (let i = 0; i < n; i++) {
        if (solved[i]) continue;
        const ok = await DS.Quiz.ask({ name: mon.title, formula: `${i + 1} / ${n}` }, items[i], { tag: attempt ? (mid === 'boss' ? '🔄 세트가 바뀌었어요' : '🔄 숫자가 바뀌었어요') : '🟪 중단원던전' });
        if (!ok && DS.Mis && DS.Quiz.lastGiven !== undefined) wrongs.push({ i, codes: DS.Mis.classify(items[i], DS.Quiz.lastGiven, mid === 'boss' ? DS.Mis.bossTag(L.id, attempt % 2 === 0 ? 1 : 2, i) : null) }); // 🔎 오개념 (중단원던전만 저장 · 재대결은 형성평가 꼬리표)
        if (ok) { solved[i] = true; DS.FX.play(el.querySelector('.scene'), me.fx || 'flame', { scale: 0.3 }); } else wrongSeen = true;
        draw(ok ? 'hit' : 'miss');
      }
      left--;
      const cleared = solved.every(Boolean);
      const tries = Number(rec.tries || 0) + 1;
      rec.tries = tries;
      const patch = { tries, at: N().TS };
      if (cleared) patch.clear = true;
      if (DS.Mis && wrongs.length) { // 오개념: 이번 판에서 틀린 소문제 → 그 소문제를 결국 맞혔으면 「바로잡음」
        const acc = DS.Mis.merge({}, misBase); wrongs.forEach((w) => DS.Mis.add(acc, w.codes, !!solved[w.i])); if (Object.keys(acc).length) patch.mis = acc;
      }
      if (!preview && !train) await N().update(`bonus/${ck(me.c)}/${me.n}/${L.id}/${mid}`, patch).catch(() => {});
      if (!train) mine[L.id] = mine[L.id] || {}, mine[L.id][mid] = Object.assign({}, mine[L.id][mid], { tries, clear: cleared || (mine[L.id][mid] || {}).clear }, patch.mis ? { mis: patch.mis } : {});
      if (cleared) return win();
      if (left <= 0) {
        const act = draw('miss', '<p class="gold">기회를 모두 썼어요. 해설을 다시 보고 다음에 새 문제로 도전해요! (벌은 없어요)</p>');
        act.innerHTML = `<button class="btn primary" id="bf-out">${train ? '허수아비로' : '던전 층 목록으로'}</button>`;
        act.querySelector('#bf-out').onclick = () => { el.remove(); render(); };
        return null;
      }
      const act = draw('', `<p>맞힌 소문제 <b>${solved.filter(Boolean).length} / ${n}</b> — 틀린 것만 새 숫자로 다시!</p>`);
      act.innerHTML = '<button class="btn primary" id="bf-again">🔄 다시 도전</button>';
      act.querySelector('#bf-again').onclick = () => { attempt++; round(); };
      return null;
    };
    const win = async () => {
      if (train) {
        DS.Sound.correct();
        if (DS.Grow && !preview) DS.Grow.add(me, { train: 1 }, `train_${new Date().toISOString().slice(0, 10)}_${L.id}_${mid}`).catch(() => {});
        const a2 = draw('', '<p class="okc"><b>🎯 명중!</b> 다른 몬스터도 연습해 볼까요?</p>');
        a2.innerHTML = '<button class="btn primary" id="bf-out">허수아비로</button>'; a2.querySelector('#bf-out').onclick = () => { el.remove(); render(); };
        return;
      }
      const sealed = !sealedBefore && seals(mine).includes(L.id);
      DS.Sound.correct();
      if (DS.Grow && !clearedBefore && !preview) DS.Grow.add(me, { bonusClear: 1, seal: sealed ? 1 : 0 }).catch(() => {});
      const fx = sealed ? DS.FX.FANCY.find((k, i) => seals(mine).length === UNLOCK[i]) : null;
      const act = draw('', `<p class="okc"><b>🎉 처치!</b>${sealed ? ` <b class="gold">🟪 ${L.eval ? '꼭대기 층' : `${L.no}층`} 인장을 얻었어요!</b>` : ''}${fx ? `<br>✨ 화려한 이펙트 「${esc(DS.FX.NAMES[fx])}」이 열렸어요! ⚙ 설정에서 바꿀 수 있어요` : ''}</p>`);
      act.innerHTML = `<button class="btn primary" id="bf-out">${train ? '허수아비로' : '던전 층 목록으로'}</button>`;
      act.querySelector('#bf-out').onclick = () => { el.remove(); render(); };
    };
    const act = draw('', `<p>${train ? '🎯 숫자가 바뀐 연습 문제예요.' : first ? (mid === 'boss' ? '수업 때 형성평가 문제 그대로예요.' : L.eval ? '교과서 중단원 마무리를 숫자만 바꾼 문제예요. 서술형은 풀이를 학습지에 써요.' : '학습지 보강 문항이에요.') : '다시 들어오면 새 문제가 나와요.'} 기회 ${TRIES}번 — 틀린 소문제만 다시 풀어요.</p>`);
    act.innerHTML = '<button class="btn primary big" id="bf-go">⚔ 전투 시작</button>';
    act.querySelector('#bf-go').onclick = () => round();
  }
  function sheet(src, title) {
    const el = document.createElement('div'); el.className = 'modal sheet-modal';
    el.innerHTML = `<div class="quiz-box framed"><div class="quiz-head"><b>📄 ${esc(title)}</b><button class="btn small" data-x>✕ 닫기</button></div><img class="bn-sheet" src="${src}" alt="학습지"></div>`;
    el.querySelector('[data-x]').onclick = () => el.remove();
    document.body.appendChild(el);
  }
  return { enter, seals, fxOpen, fxCond, UNLOCK, DUNGEONS };
})();
