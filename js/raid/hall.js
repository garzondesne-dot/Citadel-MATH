// 종합상황실 (PC · 교실 큰 화면) — 왼쪽: 용사단(접속 ●/○ · 상태) · 가운데: 장면 · 오른쪽: 수업 순서 · ◀ ▶ · 기준% · 🔴 집중모드 · 말풍선 관리
// 장면: 던전 단체 대기실(선생님 주위로 옹기종기) → 개념 설명(학습지 이미지 가운데 크게) → 레이드(큰 몬스터 위 가운데 · 용사는 아래에서 올려 침)
//       → 보스 → 마무리(마지막 한마디 말풍선 · 모두 제자리 점프 · 📮 확인도장 띠) → 수업 끝
// 정답·오답 글자는 띄우지 않는다. 공격 연출(이펙트 · PERFECT! · 데미지 숫자)만 보인다.
window.DS = window.DS || {};

DS.Hall = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc, pretty } = DS.UI;
  const C = () => DS.Control, Raid = () => DS.Raid;
  let code = null, L = null, R = null, raw = null, stop = null, stopPrep = null, prep = {};
  let built = '', seen = {}, queue = [], playing = false, wonFx = '', bubbleT = 0, bubbleK = 0;

  async function enter(c, key) {
    await DS.Act.joinHall(c, key);
    code = c;
    try { localStorage.setItem('citadel-hall', JSON.stringify({ code: c, key: String(key) })); } catch (e) { /* 무시 */ }
    DS.UI.show('screen-hall');
    DS.Scene.save({ role: 'hall', code: c, key: String(key) });
    if (stop) stop();
    stop = DS.Net.watch(`rooms/${code}`, (v) => {
      if (!v) return;
      raw = v; R = DS.Act.unpackRoom(v);
      const first = !L;
      L = DS.Lessons.get(R.meta.lesson);
      if (DS.Act.isHost(R)) DS.Act.admitLate(code, R, L);
      if (first) { if (stopPrep) stopPrep(); stopPrep = DS.Net.watch(`prep/${L.id}`, (p) => { prep = p || {}; built = ''; if (R) render(); }); }
      render();
    });
  }
  const studentUrl = () => `${location.origin}${location.pathname.replace(/[^/]*$/, '')}index.html?role=student&code=${code}${DS.Net.mode === 'local' ? '&local' : ''}`;
  const studs = () => Object.entries(R.players || {}).filter(([, p]) => !p.teacher).sort((a, b) => a[1].num - b[1].num);
  const inClass = () => studs().filter(([u]) => Raid().isLobby(R) || (R.active || {})[u]);
  const dungeonName = () => { const D = DS.ASSETS.dungeons, i = D.ids.indexOf(L.theme); return i >= 0 ? D.names[i] : '던전'; };

  function render() {
    const i = R.state.step ?? -1;
    $('#h-top').innerHTML = `<b>${esc(L.unit)} · ${esc(L.title)}</b><span>${esc(C().stepName(L, R))}</span><span class="muted">수업 코드 <b>${code}</b></span>`;
    heroes(); side(i);
    const step = Raid().stepOf(L, R);
    const el = $('#h-arena');
    el.classList.toggle('focus-on', Raid().focusOn(R) && !Raid().isLobby(R));
    if (step && (step.kind === 'monster' || step.kind === 'boss')) { const key = `f${i}`; if (built !== key) buildFight(step, key); else updateFight(step); sheetOverlay(step); return; }
    clearInterval(bubbleT);
    if (Raid().isClosed(R)) { built = 'closed'; el.innerHTML = `<div class="h-victory"><div class="trophy"><i class="trophy-img" style="background-image:url('${DS.ASSETS.base}${DS.ASSETS.trophy}')"></i></div><h1>수업 끝!</h1><p class="muted">모두 모닥불로 돌아갔어요. 게임 기록은 수학 성적이 아니에요.</p><div class="stamp-bar big">📮 반드시 학습지 확인도장 받아가세요.</div></div>`; return; }
    if (Raid().isLobby(R) || Raid().isFinale(L, R)) return lobbyScene(Raid().isFinale(L, R));
    const key = `c${i}|${(prep.img || {})[step.id] ? 1 : 0}`;
    if (built === key) return;
    built = key;
    const img = (prep.img || {})[step.id];
    el.innerHTML = `<div class="h-concept"><p class="h-ctitle">📣 ${esc(step.title)}</p>
      <div class="h-sheet">${img ? `<img src="${img}" alt="${esc(step.title)} 학습지">` : `<div class="h-sheet-empty">📄 학습지 이미지 칸<br><span class="muted small">수업 준비 화면에서 '${esc(step.title)}' 이미지를 넣으면 여기에 크게 떠요</span><p class="h-intro">${pretty(step.say || '')}</p></div>`}</div>
      <div class="h-focus-badge">⚠ 집중모드 — 학생 폰 멈춤</div></div>`;
  }

  // ── 왼쪽: 용사단 ─────────────────────────────────────────
  function heroes() {
    const list = inClass(), step = Raid().stepOf(L, R), fin = Raid().isEnd(L, R);
    const st = (u, p) => {
      if (!Raid().online(R, u) && !Raid().isLobby(R)) return '<span class="st off">끊김</span>';
      if (Raid().isLobby(R)) return '<span class="st">대기</span>';
      if (fin || p.lobby) return (R.words || {})[u] ? '<span class="st ok">💬 남김</span>' : '<span class="st">대기실</span>';
      if (Raid().focusOn(R)) return '<span class="st">👀 집중</span>';
      if (step && step.kind === 'monster') return Raid().record(L, R, step.id, u).submitted ? '<span class="st ok">제출 ✔</span>' : '<span class="st">풀이 중…</span>';
      if (step && step.kind === 'boss') return Object.keys(((R.bossAns || {})[u]) || {}).length ? '<span class="st ok">제출 ✔</span>' : '<span class="st">풀이 중…</span>';
      return '<span class="st">수업 중</span>';
    };
    const on = list.filter(([u]) => Raid().online(R, u)).length;
    $('#h-heroes').innerHTML = `<p class="shelf-title">⚔ 용사단 <span class="muted">${Raid().isLobby(R) ? `입장 ${list.length}` : `접속 ${on} / ${list.length}`}</span></p>
      <div class="hrow teach">${DS.Art.hero(DS.ASSETS.heroes.teacher, 'idle', 'mini')}<b>선생님</b><i class="dot"></i></div>
      ${list.map(([u, p]) => `<div class="hrow">${DS.Art.hero(p.hero, 'idle', 'mini')}<span>${p.num} ${esc(p.nick)}</span>${st(u, p)}<i class="dot${Raid().online(R, u) || Raid().isLobby(R) ? '' : ' off'}"></i></div>`).join('')}
      <p class="muted small h-legend">● 접속 · ○ 끊김 — 정답·오답 글자는 띄우지 않아요</p>`;
  }

  // ── 가운데: 던전 단체 대기실 (수업 전 · 마무리) ─────────────
  function lobbyScene(finale) {
    const list = inClass().filter(([, p]) => !finale || true);
    const sig = `lobby|${finale}|${list.map(([u, p]) => u + p.hero).join()}|${finale ? JSON.stringify([R.words, R.hide]) : ''}`;
    if (built === sig) return;
    built = sig;
    const n = list.length, size = n > 24 ? 62 : n > 16 ? 72 : 84, per = Math.max(1, Math.ceil(n / 3));
    const pos = list.map(([u, p], i) => {
      const ring = i % 3, k = Math.floor(i / 3), a = Math.PI * (0.04 + 0.92 * ((k + ring * 0.33) / per));
      const rx = 23 + ring * 12.5, ry = 7 + ring * 8.5;
      return { u, p, x: 50 - Math.cos(a) * rx, y: 66 + Math.sin(a) * ry, flip: Math.cos(a) < 0 };
    });
    const words = finale ? Object.entries(R.words || {}).filter(([u]) => !(R.hide || {})[u]).map(([u]) => u) : [];
    $('#h-arena').innerHTML = `<div class="h-lobby2 bg-scene th-${L.theme || ''}${finale ? ' finale' : ''}">
      <p class="lb2-title">${finale ? `<i class="trophy-img sm" style="background-image:url('${DS.ASSETS.base}${DS.ASSETS.trophy}')"></i> ${esc(dungeonName())} 클리어!` : `⚔ ${esc(dungeonName())} · 던전 입장!`}</p>
      <p class="lb2-sub">${finale ? '오늘 배운 것 한마디씩 남기고 가자' : `${esc(L.title)} — 선생님 주위로 모여라`}</p>
      ${finale ? `<div class="lb2-cnt">💬 ${words.length} / ${n}</div>` : `<div class="lb2-qr"><div id="h-qr" class="qr"></div><b>${code}</b><span>QR · 수업 코드</span></div>`}
      <div class="lb2-say teacher">${finale ? '모두 수고했네! 오늘 배운 것 한마디씩 남기게' : `${L.no ? `${L.no}차시 ` : ''}${esc(L.title.split('·')[0].trim())} 던전에 온 것을 환영하네!`}</div>
      <div class="lb2-h teacher" style="left:50%;top:60%">${DS.Art.hero(DS.ASSETS.heroes.teacher, finale ? 'attack' : 'idle', finale ? 'pairhop' : 'huff')}<i class="shadow"></i><span class="nm gold">선생님</span></div>
      ${pos.map((o, i) => `<div class="lb2-h" style="left:${o.x}%;top:${o.y}%;--sz:${size}px;animation-delay:${(i * 0.13) % 0.9}s"><span class="nm">${o.p.num} ${esc(o.p.nick)}</span><div class="${(finale ? i % 2 === 1 : o.flip) ? 'face-l' : ''}">${DS.Art.hero(o.p.hero, 'idle', finale ? 'pairhop' : 'huff')}</div><i class="shadow"></i>${finale && words.includes(o.u) ? `<span class="lb2-bub" data-u="${o.u}">${esc(R.words[o.u].t)}</span>` : ''}</div>`).join('')}
      ${finale ? '<div class="stamp-bar wide">📮 반드시 학습지 확인도장 받아가세요.</div>' : ''}
      ${Raid().focusOn(R) ? '<div class="h-focus-badge">⚠ 집중모드</div>' : ''}</div>`;
    if (!finale && window.QRCode) new QRCode($('#h-qr'), { text: studentUrl(), width: 150, height: 150 });
    if (finale) rotateBubbles();
  }
  // 말풍선은 한 번에 6개까지, 4초마다 돌아가며
  function rotateBubbles() {
    clearInterval(bubbleT);
    const show = () => {
      const b = [...document.querySelectorAll('.lb2-bub')];
      if (!b.length) return;
      const n = Math.min(6, b.length), start = (bubbleK * n) % b.length;
      b.forEach((x, i) => x.classList.toggle('on', ((i - start + b.length) % b.length) < n));
      bubbleK++;
    };
    show(); bubbleT = setInterval(show, 4000);
  }

  // ── 레이드: 큰 몬스터 위 가운데 · 용사들은 아래 두 줄 (왼쪽 절반은 오른쪽을, 오른쪽 절반은 왼쪽을 본다) ──
  const fightOf = (step) => (step.kind === 'boss'
    ? { sprite: L.boss.sprite, hp: Raid().bossHp(L, R), done: Raid().bossHp(L, R).won, title: L.boss.title }
    : { sprite: L.monsters[step.id].sprite, hp: Raid().monsterHp(L, R, step.id), done: Raid().cleared(L, R, step.id), title: step.title });
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
    const hs = studs().filter(([u]) => (R.active || {})[u]);
    const n = hs.length, row0 = Math.ceil(n / 2);
    const pos = hs.map(([u, p], i) => { const r = i < row0 ? 0 : 1, k = r ? i - row0 : i, cnt = r ? n - row0 : row0; const x = 7 + ((k + 0.5) / Math.max(1, cnt)) * 86 + (r ? 2 : 0); return { u, p, x, y: r ? 96 : 82 }; });
    $('#h-arena').innerHTML = `<div class="raid2 bg-scene th-${L.theme || ''} ${step.kind === 'boss' ? 'boss quake' : ''}${step.special ? ' special' : ''}" id="raid">
      <div class="raid-top"><b>${step.kind === 'boss' ? '👑 ' : step.special ? '⭐ ' : step.review ? '📖 ' : ''}${esc(f.title)}</b><div class="raid-hp"><i id="rh-bar"></i><span id="rh-txt"></span></div></div>
      ${step.special ? '<div class="raid-banner">⭐ 스페셜 몬스터 난입!</div>' : step.kind === 'boss' ? '<div class="raid-banner boss">👑 보스 출현!</div>' : ''}
      <div class="raid2-shadow"></div><div class="raid2-mon" id="rm">${DS.Art.monster(f.sprite, 'idle', 'float')}<div id="rm-fx"></div></div>
      ${pos.map((o) => `<div class="fh2" id="fh-${o.u}" style="left:${o.x}%;top:${o.y}%"><span class="fh-name">${o.p.num} ${esc(o.p.nick)}</span><div class="${o.x > 50 ? 'face-l' : ''}">${DS.Art.hero(o.p.hero, 'idle')}</div><i class="shadow"></i></div>`).join('')}
      <div class="raid-clear" id="r-clear" hidden></div><div class="h-focus-badge">⚠ 집중모드</div>
    </div>`;
    seen = attacks(step);
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
      if (a.n > was.n) queue.push({ u, dmg: Math.max(0, a.dmg - was.dmg), label: step.kind === 'boss' ? (a.dmg > was.dmg ? 'partial' : 'fail') : a.label });
    });
    seen = now;
    const wait = step.kind === 'monster' ? Raid().waiting(L, R, step.id) : [];
    const clr = $('#r-clear');
    if (f.done) {
      clr.hidden = false; clr.className = 'raid-clear'; clr.innerHTML = step.kind === 'boss' ? '🎉 보스 격파! 모두 함께 이겼다!' : '⚔ 몬스터 격파!';
      if (wonFx !== built) { wonFx = built; setTimeout(() => { const m = $('#rm'); if (m) m.innerHTML = DS.Art.monster(f.sprite, 'down'); DS.Sound.correct(); document.querySelectorAll('.fh2').forEach((h, k) => { const a = h.querySelector('.art'); if (!a) return; a.parentElement.classList.toggle('face-l', k % 2 === 1); a.classList.add('pairhop'); a.style.animationDelay = `${(k % 2) * 0.22}s`; }); }, 600); }
    } else if (step.kind === 'monster' && !wait.length && f.hp.left > 0) {
      clr.hidden = false; clr.className = 'raid-clear note'; clr.innerHTML = `모두 공격했다! 남은 체력 ${f.hp.left} — 재도전으로 더 공격하자`;
    } else clr.hidden = true;
    play();
  }
  // 공격 연출: 0.35초 간격으로 차례차례. 성공 = 몬스터로 뛰어올라 내 이펙트 + 데미지 숫자 (전부 맞힘이면 크게 + PERFECT! + 흔들림)
  function play() {
    if (playing || !queue.length) return;
    playing = true;
    const a = queue.shift();
    const h = document.getElementById(`fh-${a.u}`), arena = $('#raid'), m0 = $('#rm');
    if (h && arena && m0) {
      const ok = a.label !== 'fail', perfect = a.label === 'success';
      const hr = h.getBoundingClientRect(), mr = m0.getBoundingClientRect(), ar = arena.getBoundingClientRect();
      h.style.setProperty('--tx', `${(mr.left + mr.width / 2 - (hr.left + hr.width / 2)) * (ok ? 0.8 : 0.35)}px`);
      h.style.setProperty('--ty', `${(mr.top + mr.height * 0.7 - (hr.top + hr.height / 2)) * (ok ? 0.8 : 0.35)}px`);
      h.classList.remove('dash', 'swing'); void h.offsetWidth; h.classList.add(ok ? 'dash' : 'swing');
      setTimeout(() => {
        if (ok) {
          DS.Sound.hit();
          const p = (R.players[a.u] || {}).fx || 'flame';
          DS.FX.play(arena, p, { x: mr.left - ar.left + mr.width / 2, y: mr.top - ar.top + mr.height / 2, scale: Math.min(ar.width, ar.height) / (perfect ? 900 : 1150), perfect });
          m0.classList.remove('flash'); void m0.offsetWidth; m0.classList.add('flash');
          const fx = $('#rm-fx');
          if (fx && a.dmg) { const d = document.createElement('span'); d.className = `dmg${perfect ? ' big' : ''}`; d.textContent = `−${a.dmg}`; d.style.left = `${55 + Math.random() * 25}%`; fx.appendChild(d); setTimeout(() => d.remove(), 1300); }
          if (perfect) {
            const t = document.createElement('div'); t.className = 'perfect'; t.textContent = 'PERFECT!'; arena.appendChild(t); setTimeout(() => t.remove(), 1300);
            arena.classList.remove('shake'); void arena.offsetWidth; arena.classList.add('shake'); setTimeout(() => DS.Sound.correct(), 120);
          }
        } else DS.Sound.squish();
      }, 330);
      setTimeout(() => h.classList.remove('dash', 'swing'), 850);
    }
    setTimeout(() => { playing = false; play(); }, 350);
  }

  // 📄 문제 화면: 교사가 켜면 지금 문제의 학습지 이미지를 레이드 위에 크게 (레이드는 뒤에서 계속, 끄면 그대로 보임)
  let sheetKey = '';
  function sheetOverlay(step) {
    const arena = $('#h-arena'), img = (prep.img || {})[step.id], on = Raid().sheetOn(R);
    let ov = document.getElementById('h-sheet-ov');
    if (!on) { if (ov) ov.remove(); sheetKey = ''; return; }
    if (!ov) { ov = document.createElement('div'); ov.id = 'h-sheet-ov'; ov.className = 'h-sheet-ov'; arena.appendChild(ov); sheetKey = ''; }
    const k = `${step.id}|${img ? img.length : 0}`;
    if (k === sheetKey) return;
    sheetKey = k;
    ov.innerHTML = `<p class="h-ctitle">📄 ${esc(step.kind === 'boss' ? L.boss.title : step.title)} · 문제 해설</p>
      <div class="h-sheet">${img ? `<img src="${img}" alt="${esc(step.title || '')} 학습지">` : `<div class="h-sheet-empty">📄 이 문제의 학습지 이미지가 아직 없어요<br><span class="muted small">교사 → 수업 준비 → '${esc(step.title || '형성평가')}' 칸에 넣으면 여기에 떠요</span></div>`}</div>`;
  }

  // ── 오른쪽: 수업 순서 · ◀ ▶ · 기준% · 집중모드 · 말풍선 ──────
  function side(i) {
    const titles = C().stepTitles(L);
    $('#h-side').innerHTML = `<p class="shelf-title">📜 수업 순서</p><ol class="h-steps">${titles.map((s, k) => `<li class="${k < i || Raid().isClosed(R) ? 'done' : k === i ? 'now' : ''}${s.sp ? ' sp' : ''}">${esc(s.title)}</li>`).join('')}</ol>
      ${Raid().isEnd(L, R) ? `<div class="h-words">${C().wordsHtml(R)}</div>` : ''}`;
    C().bindWords($('#h-side'), code, R);
    const el = $('#h-ctrl'), live = !Raid().isLobby(R) && !Raid().isClosed(R);
    el.innerHTML = `${C().pctHtml(L, R)}<p class="muted small">다음 ▶ ${esc(C().nextName(L, R))}</p><div class="row"><button class="btn" id="h-back"${i < 0 ? ' disabled' : ''}>◀ 뒤로</button><button class="btn primary" id="h-fwd"${Raid().isClosed(R) ? ' disabled' : ''}>${Raid().isFinale(L, R) ? '수업 끝 ▶' : '앞으로 ▶'}</button></div>${live ? C().sheetBtn(L, R) + C().focusBtn(R) : ''}`;
    C().bindPct(el, code, R, L); C().bindFocus(el, code, R); C().bindSheet(el, code, R);
    $('#h-fwd').onclick = () => C().run(() => C().forward(code, R, L));
    $('#h-back').onclick = () => C().run(() => C().back(code, R, L));
  }

  return { enter };
})();
