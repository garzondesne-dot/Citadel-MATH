// 종합상황실 (PC · 교실 큰 화면): 몬스터 · 용사단 · 제출 수 · 공동 공격 연출 · 보스 체력 · 트로피
// 개인 정답은 띄우지 않는다 (제출했는지와 전체 결과만). 오른쪽 패널에서 선생님이 시범 연성·마지막 공격을 한다.
window.DS = window.DS || {};

DS.Hall = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc, pretty } = DS.UI;
  const C = () => DS.Control;
  let code = null, L = null, R = null, raw = null, stop = null, forge = null, sideKey = '', lastFx = '';

  async function enter(c, key) {
    await DS.Act.joinHall(c, key);
    code = c;
    try { localStorage.setItem('citadel-hall', JSON.stringify({ code: c, key: String(key) })); } catch (e) { /* 무시 */ }
    DS.UI.show('screen-hall');
    if (stop) stop();
    stop = DS.Net.watch(`rooms/${code}`, (v) => { if (!v) return; raw = v; R = DS.Act.unpackRoom(v); L = DS.Lessons.get(R.meta.lesson); render(); });
  }
  const studentUrl = () => `${location.origin}${location.pathname.replace(/[^/]*$/, '')}index.html?role=student&code=${code}${DS.Net.mode === 'local' ? '&local' : ''}`;
  const ctx = () => ({ code, R, raw, L });

  function render() {
    const ph = R.state.phase, st = L.stages[R.state.stage];
    $('#h-top').innerHTML = `<b>${esc(L.title)}</b><span>${ph === 'boss' || ph === 'victory' ? '👑 보스' : `${esc(st.step)} · ${esc(st.name)}`}</span><span class="muted">수업 코드 <b>${code}</b></span>`;
    arena(ph, st);
    roster(ph);
    side(ph);
    C().controls($('#h-ctrl'), ctx());
  }

  // ── 가운데 무대 ───────────────────────────────────────────
  function arena(ph, st) {
    const el = $('#h-arena'), ids = DS.Raid.activeIds(R);
    let h = '';
    if (ph === 'lobby') {
      h = `<div class="h-lobby"><div id="h-qr" class="qr big"></div><div><h1>입장하세요!</h1><p>QR 을 찍거나 주소 입력 → 코드 <b class="big-code">${code}</b></p><p class="muted break">${esc(studentUrl())}</p><p>입장 <b>${Object.values(R.players || {}).filter((p) => !p.teacher).length}</b>명</p></div></div>`;
    } else if (ph === 'forge') {
      const ready = ids.filter((u) => DS.Raid.stageReady(L, R, u)).length;
      h = `<div class="h-stage"><p class="h-step">⚒ 연성 시간</p><h1>${esc(st.name)}</h1><p class="h-intro">${pretty(st.intro)}</p>
        <div class="h-cards">${st.cards.map((c) => `<div class="h-card">${DS.Art.card(L.cards[c].art)}<b>${esc(L.cards[c].name)}</b><span class="math">${pretty(L.cards[c].formula)}</span></div>`).join('')}</div>
        <p class="h-count">카드 완성 <b>${ready}</b> / ${ids.length}</p></div>`;
    } else if (ph === 'field') {
      h = `<div class="h-mon">${DS.Art.monster(st.monster, 'idle', 'huge float')}</div><p class="h-banner">${esc(DS.ASSETS.monsters.names[st.monster])}의 기척이 느껴진다…</p>`;
    } else if (ph === 'battle') {
      const rd = R.state.round, s = (R.subs || {})[rd.id] || {}, done = ids.filter((u) => s[u]).length;
      const t = !!s[R.meta.teacher];
      h = `<div class="h-mon">${DS.Art.monster(st.monster, 'idle', 'huge float')}</div>
        <p class="h-banner">⚔ ${esc(L.typeNames[rd.type])}${rd.attempt > 1 ? ` · 재도전 ${rd.attempt}` : ''}</p>
        <div class="h-meter"><i style="width:${ids.length ? (100 * done) / ids.length : 0}%"></i><span>제출 ${done} / ${ids.length}</span></div>
        <p class="h-sub">${done < ids.length ? '모두 제출하면 선생님이 마지막 공격!' : t ? '판정 중…' : '전원 제출! 선생님의 마지막 공격을 기다린다'}</p>`;
    } else if (ph === 'result') {
      const ok = R.state.result && R.state.result.success;
      h = `<div class="h-mon ${ok ? 'hit' : ''}">${DS.Art.monster(st.monster, ok ? 'down' : 'attack', 'huge')}</div>
        <p class="h-banner ${ok ? 'okc' : 'ngc'}">${ok ? '⚔ 공동 공격 성공! 몬스터 격파!' : '💥 공동 공격 실패… 몬스터의 반격!'}</p>
        <p class="h-sub">${ok ? '다음 몬스터를 향해!' : '한 사람이라도 틀리면 공격이 막혀요. 설명을 듣고 숫자를 바꿔 다시!'}</p>`;
      const fx = R.state.result.round + ok;
      if (fx !== lastFx) { lastFx = fx; if (ok) DS.Sound.correct(); else DS.Sound.wrong(); }
    } else if (ph === 'boss') {
      const hp = DS.Raid.bossHp(L, R);
      h = `<div class="h-mon">${DS.Art.monster(L.boss.monster, hp.hp ? 'idle' : 'down', 'huge float')}</div><p class="h-banner">👑 ${esc(L.boss.title)}</p>
        <div class="hpbar big"><i style="width:${hp.max ? (100 * hp.hp) / hp.max : 0}%"></i><span>${hp.hp} / ${hp.max}</span></div>
        <p class="h-sub">형성평가 1~6번을 풀어 보스를 쓰러뜨려요. 맞힌 문항마다 100 피해 · 세트 2 로 재도전 가능</p>`;
    } else if (ph === 'victory') {
      const w = R.state.winner;
      h = `<div class="h-victory"><div class="trophy">🏆</div><h1>성채 탈환!</h1>${w ? `<p>최고 용사</p>${DS.Art.hero(w.hero, 'attack', 'huge')}<h2>${w.num}번 ${esc(w.nick)}</h2>` : ''}<p class="muted">모두에게 트로피를! 게임 기록은 수학 성적이 아니에요.</p></div>`;
    }
    el.innerHTML = h;
    if (ph === 'lobby' && window.QRCode) new QRCode($('#h-qr'), { text: studentUrl(), width: 220, height: 220 });
  }

  // ── 용사단: 제출 여부와 연출 자세만 (개인 정답은 보이지 않음) ─────
  function roster(ph) {
    const ok = R.state.result && R.state.result.success;
    const rd = R.state.round, s = (rd && (R.subs || {})[rd.id]) || {};
    const list = Object.entries(R.players || {}).filter(([, p]) => !p.teacher).sort((a, b) => a[1].num - b[1].num);
    const on = (u) => ph === 'lobby' || !!(R.active || {})[u];
    const pose = (u) => (ph === 'battle' ? (s[u] ? 'attack' : 'idle') : ph === 'result' ? (ok ? 'attack' : 'fall') : ph === 'victory' ? 'attack' : ph === 'lobby' ? 'walk' : 'idle');
    const mark = (u) => (ph === 'battle' && s[u] ? '<i class="done">✔</i>' : ph === 'forge' && DS.Raid.stageReady(L, R, u) ? '<i class="done">✓</i>' : '');
    $('#h-roster').innerHTML = list.filter(([u]) => on(u)).map(([u, p]) => `<div class="h-hero">${mark(u)}${DS.Art.hero(p.hero, pose(u))}<span>${p.num} ${esc(p.nick)}</span></div>`).join('')
      + `<div class="h-hero teacher">${DS.Art.hero(DS.ASSETS.heroes.teacher, pose(R.meta.teacher))}<span>선생님</span></div>`;
  }

  // ── 오른쪽: 선생님 시범 연성 / 마지막 공격 ─────────────────────
  function side(ph) {
    const el = $('#h-side');
    el.hidden = false;
    const key = `${ph}|${R.state.stage}|${(R.state.round || {}).id || ''}`;
    if (ph === 'forge' || ph === 'field' || ph === 'result') {
      if (key !== sideKey || !forge) {
        sideKey = key;
        el.innerHTML = `<p class="shelf-title">👩‍🏫 선생님 연성 (시범)</p><div id="h-forge"></div>`;
        forge = C().teacherForge($('#h-forge'), ctx(), { R: () => R });
      } else forge.redraw();
      return;
    }
    forge = null; sideKey = key;
    if (ph === 'battle') { C().teacherAttack(el, ctx(), render); return; }
    el.innerHTML = ph === 'boss' ? '<p class="muted">학생들이 폰으로 형성평가를 풀고 있어요. 교사 폰 학생 탭에서 문항 도달을 볼 수 있어요.</p>' : '';
    el.hidden = !el.innerHTML;
  }

  return { enter };
})();
