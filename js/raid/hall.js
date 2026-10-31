// 종합상황실 (PC · 교실 큰 화면): 대기실 · 개념 설명(학습지 이미지 화면 절반) · 몬스터 레이드 · 보스 · 끝
// 레이드: 학생이 제출할 때마다 그 용사가 움직인다 — 성공·부분 성공은 몬스터 앞까지 달려가 타격(데미지 숫자 + 빨강·하양 번쩍),
// 실패는 다가가 휘두르지만 물렁한 소리만. 정답·오답 글자는 띄우지 않는다.
window.DS = window.DS || {};

DS.Hall = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc, pretty } = DS.UI;
  const C = () => DS.Control, Raid = () => DS.Raid;
  let code = null, L = null, R = null, raw = null, stop = null, stopPrep = null, prep = {};
  let built = '', seen = {}, queue = [], playing = false, wonFx = '';

  async function enter(c, key) {
    await DS.Act.joinHall(c, key);
    code = c;
    try { localStorage.setItem('citadel-hall', JSON.stringify({ code: c, key: String(key) })); } catch (e) { /* 무시 */ }
    DS.UI.show('screen-hall');
    if (stop) stop();
    stop = DS.Net.watch(`rooms/${code}`, (v) => {
      if (!v) return;
      raw = v; R = DS.Act.unpackRoom(v);
      const first = !L;
      L = DS.Lessons.get(R.meta.lesson);
      if (first) { if (stopPrep) stopPrep(); stopPrep = DS.Net.watch(`prep/${L.id}`, (p) => { prep = p || {}; built = ''; if (R) render(); }); }
      render();
    });
  }
  const studentUrl = () => `${location.origin}${location.pathname.replace(/[^/]*$/, '')}index.html?role=student&code=${code}${DS.Net.mode === 'local' ? '&local' : ''}`;
  const studs = () => Object.entries(R.players || {}).filter(([, p]) => !p.teacher).sort((a, b) => a[1].num - b[1].num);

  function render() {
    const i = R.state.step ?? -1;
    $('#h-top').innerHTML = `<b>${esc(L.unit)} · ${esc(L.title)}</b><span>${esc(C().stepName(L, R))}</span><span class="muted">수업 코드 <b>${code}</b></span>`;
    side(i);
    const step = Raid().stepOf(L, R);
    const key = `${i}`;
    if (step && (step.kind === 'monster' || step.kind === 'boss')) { if (built !== key) buildFight(step, key); else updateFight(step); return; }
    built = key;
    const el = $('#h-arena');
    if (Raid().isLobby(R)) {
      el.innerHTML = `<div class="h-lobby"><div id="h-qr" class="qr big"></div><div><h1>던전 입장!</h1><p>QR 을 찍거나 주소 입력 → 코드 <b class="big-code">${code}</b></p><p class="muted break">${esc(studentUrl())}</p><p>입장 <b>${studs().length}</b>명</p></div></div>`;
      if (window.QRCode) new QRCode($('#h-qr'), { text: studentUrl(), width: 220, height: 220 });
    } else if (Raid().isEnd(L, R)) {
      el.innerHTML = `<div class="h-victory"><div class="trophy">🏆</div><h1>던전 클리어!</h1><p class="muted">모두 수고했어요! 게임 기록은 수학 성적이 아니에요.</p></div>`;
    } else {
      const img = (prep.img || {})[step.id];
      el.innerHTML = `<div class="h-concept"><div class="h-sheet">${img ? `<img src="${img}" alt="${esc(step.title)} 학습지">` : `<div class="h-sheet-empty">📄 학습지 이미지 칸<br><span class="muted small">수업 준비 화면에서 '${esc(step.title)}' 이미지를 올리면 여기에 떠요</span></div>`}</div>
        <div class="h-say"><p class="h-step">${step.kind === 'intro' ? '📣 도입' : '📣 개념 설명'}</p><h1>${esc(step.title)}</h1><p class="h-intro">${pretty(step.say || '')}</p><p class="muted">선생님에게 주목하세요!</p></div></div>`;
    }
    roster();
  }

  // 아래쪽 용사단 (대기실·설명 때): 머리 위 번호·이름
  function roster() {
    const end = Raid().isEnd(L, R), lobby = Raid().isLobby(R);
    const list = studs().filter(([u]) => lobby || (R.active || {})[u]);
    $('#h-roster').hidden = false;
    $('#h-roster').innerHTML = `<div class="h-hero teacher">${DS.Art.hero(DS.ASSETS.heroes.teacher, end ? 'attack' : 'idle')}<span>선생님</span></div>`
      + list.map(([, p]) => `<div class="h-hero"><span>${p.num} ${esc(p.nick)}</span>${DS.Art.hero(p.hero, end ? 'attack' : lobby ? 'walk' : 'idle')}</div>`).join('');
  }

  // ── 레이드 무대 ───────────────────────────────────────────
  const fightOf = (step) => (step.kind === 'boss'
    ? { sprite: L.boss.sprite, hp: Raid().bossHp(L, R), done: Raid().bossHp(L, R).won, title: L.boss.title }
    : { sprite: L.monsters[step.id].sprite, hp: Raid().monsterHp(L, R, step.id), done: Raid().cleared(L, R, step.id), title: step.title });
  // 학생마다 지금까지 몇 번 공격했는지 (새 공격 = 연출)
  function attacks(step) {
    const out = {};
    Raid().activeIds(R).forEach((u) => {
      if (step.kind === 'boss') { const m = Raid().mastery(L, R, u).filter(Boolean).length; const n = Object.values(((R.bossAns || {})[u]) || {}).reduce((a, s) => a + (s || []).filter((x) => x != null).length, 0); out[u] = { n, dmg: m }; }
      else { const rec = Raid().record(L, R, step.id, u); out[u] = { n: rec.tries.length, dmg: rec.best, label: Raid().resultLabel(rec.last) }; }
    });
    return out;
  }
  function buildFight(step, key) {
    built = key; queue = []; wonFx = '';
    const f = fightOf(step);
    const heroes = studs().filter(([u]) => (R.active || {})[u]);
    $('#h-roster').hidden = true;
    $('#h-arena').innerHTML = `<div class="raid bg-scene th-${L.theme || ''} ${step.kind === 'boss' ? 'boss quake' : ''}${step.special ? ' special' : ''}">
      <div class="raid-top"><b>${step.kind === 'boss' ? '👑 ' : step.special ? '⭐ ' : step.review ? '📖 ' : ''}${esc(f.title)}</b><div class="raid-hp"><i id="rh-bar"></i><span id="rh-txt"></span></div></div>
      ${step.special ? '<div class="raid-banner">⭐ 스페셜 몬스터 난입!</div>' : step.kind === 'boss' ? '<div class="raid-banner boss">👑 보스 출현!</div>' : ''}
      <div class="raid-field">${heroes.map(([u, p], k) => `<div class="fh" id="fh-${u}" style="--r:${k % 3};--c:${Math.floor(k / 3)}"><span class="fh-name">${p.num} ${esc(p.nick)}</span>${DS.Art.hero(p.hero, 'idle')}</div>`).join('')}</div>
      <div class="raid-mon" id="rm">${DS.Art.monster(f.sprite, 'idle', 'float')}<div id="rm-fx"></div></div>
      <div class="raid-clear" id="r-clear" hidden></div>
    </div>`;
    seen = attacks(step); // 이미 한 공격은 다시 연출하지 않는다
    if (step.kind === 'boss') DS.Sound.rumble();
    updateFight(step);
  }
  function updateFight(step) {
    const f = fightOf(step);
    $('#rh-bar').style.width = `${f.hp.max ? (100 * f.hp.left) / f.hp.max : 0}%`;
    $('#rh-txt').textContent = `${f.hp.left} / ${f.hp.max}  ·  기준 ${f.hp.pct}%`;
    const now = attacks(step);
    Object.entries(now).forEach(([u, a]) => {
      const was = seen[u] || { n: 0, dmg: 0 };
      if (a.n > was.n) queue.push({ u, dmg: Math.max(0, a.dmg - was.dmg), label: step.kind === 'boss' ? (a.dmg > was.dmg ? 'success' : 'fail') : a.label });
    });
    seen = now;
    const wait = step.kind === 'monster' ? Raid().waiting(L, R, step.id) : [];
    const clr = $('#r-clear');
    if (f.done) {
      clr.hidden = false; clr.innerHTML = step.kind === 'boss' ? '🎉 보스 격파! 모두 함께 이겼다!' : '⚔ 몬스터 격파!';
      if (wonFx !== built) { wonFx = built; setTimeout(() => { const m = $('#rm'); if (m) m.innerHTML = DS.Art.monster(f.sprite, 'down'); DS.Sound.correct(); document.querySelectorAll('.fh .art').forEach((h) => h.classList.add('cheer')); }, 600); }
    } else if (step.kind === 'monster' && !wait.length && f.hp.left > 0) {
      clr.hidden = false; clr.innerHTML = `모두 공격했다! 남은 체력 ${f.hp.left} — 재도전으로 더 공격하자`;
    } else clr.hidden = true;
    play();
  }
  // 공격 연출을 하나씩 (여러 명이 동시에 내면 0.3초 간격으로)
  function play() {
    if (playing || !queue.length) return;
    playing = true;
    const a = queue.shift();
    const h = document.getElementById(`fh-${a.u}`);
    if (h) {
      const ok = a.label !== 'fail';
      const m0 = $('#rm');
      if (m0) h.style.setProperty('--to', `${Math.max(80, m0.getBoundingClientRect().left - h.getBoundingClientRect().left - 30)}px`);
      h.classList.remove('dash', 'swing'); void h.offsetWidth;
      h.classList.add(ok ? 'dash' : 'swing');
      setTimeout(() => {
        const m = $('#rm'), fx = $('#rm-fx');
        if (ok) {
          DS.Sound.hit();
          if (m) { m.classList.remove('flash'); void m.offsetWidth; m.classList.add('flash'); }
          if (fx && a.dmg) { const d = document.createElement('span'); d.className = 'dmg'; d.textContent = `−${a.dmg}`; d.style.left = `${30 + Math.random() * 40}%`; fx.appendChild(d); setTimeout(() => d.remove(), 1200); }
        } else DS.Sound.squish();
      }, 330);
      setTimeout(() => h.classList.remove('dash', 'swing'), 800);
    }
    setTimeout(() => { playing = false; play(); }, 320);
  }

  // ── 오른쪽: 수업 순서 · ◀ ▶ · 기준% ──────────────────────
  function side(i) {
    $('#h-side').innerHTML = `<p class="shelf-title">수업 순서</p><ol class="h-steps">${L.steps.map((s, k) => `<li class="${k < i ? 'done' : k === i ? 'now' : ''}${s.special ? ' sp' : ''}">${esc(s.title)}</li>`).join('')}</ol>`;
    const el = $('#h-ctrl');
    el.innerHTML = `${C().pctHtml(L, R)}<p class="muted small">다음 ▶ ${esc(C().nextName(L, R))}</p><div class="row"><button class="btn" id="h-back"${i < 0 ? ' disabled' : ''}>◀ 뒤로</button><button class="btn primary" id="h-fwd"${i >= L.steps.length ? ' disabled' : ''}>앞으로 ▶</button></div>`;
    C().bindPct(el, code, R, L);
    $('#h-fwd').onclick = () => C().run(() => C().forward(code, R, L));
    $('#h-back').onclick = () => C().run(() => C().back(code, R, L));
  }

  return { enter };
})();
