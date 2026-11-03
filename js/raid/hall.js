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
  let lastHit = '', built = '', seen = {}, queue = [], playing = false, wonFx = '', bubbleT = 0, bubbleK = 0, hallKey = '', camped = false, zoom = '', zoomStep = -9, vanished = '', demo = null;

  async function enter(c, key) {
    await DS.Act.joinHall(c, key);
    code = c; hallKey = String(key); camped = false; L = null; R = null; built = '';
    if (!atkT) atkT = setInterval(hallAtk, 200);
    try { localStorage.setItem('citadel-hall', JSON.stringify({ code: c, key: String(key) })); } catch (e) { /* 무시 */ }
    DS.UI.show('screen-hall');
    DS.Scene.save({ role: 'hall', code: c, key: String(key) });
    if (stop) stop();
    stop = DS.Net.watch(`rooms/${code}`, (v) => {
      if (!v) return;
      raw = v; R = DS.Act.unpackRoom(v);
      const first = !L;
      L = DS.Lessons.get(R.meta.lesson); if (L && L.id !== DS.Art._entered) { DS.Art._entered = L.id; DS.Art.lessonEnter(L); } // v0.9.6 차시별 다운로드
      if (DS.Act.isHost(R)) { DS.Act.admitLate(code, R, L); DS.Act.markBossWin(code, R, L); }
      if (first) { if (stopPrep) stopPrep(); stopPrep = DS.Net.watch(`prep/${L.id}`, (p) => { prep = p || {}; built = ''; if (R) render(); }); }
      render();
      // v0.9.2: 종합상황실은 교사 캠프(학생 입장 QR · 모루 · 보강던전)에서 시작 — 수업이 시작되면 저절로 이 화면으로
      if (first && !camped && Raid().isLobby(R) && DS.TCamp) { camped = true; DS.TCamp.enter({ code, hallKey, hall: true }).catch(() => {}); }
    });
  }
  const toCamp = () => DS.Control.run(() => DS.TCamp.enter({ code, hallKey, hall: true }));
  const klassBtn = () => (DS.ShareCard.klassReady(L, R) ? '<button class="btn sc-btn" id="h-klass">🏫 학급 결과</button>' : '');
  function bindActs() {
    const k = $('#h-klass'); if (k) k.onclick = () => DS.Control.run(() => DS.ShareCard.klassOpen(L, R));
    const c = $('#h-tcamp'); if (c) c.onclick = toCamp;
  }
  const studentUrl = () => `${location.origin}${location.pathname.replace(/[^/]*$/, '')}index.html?role=student&code=${code}${DS.Net.mode === 'local' ? '&local' : ''}`;
  const studs = () => Object.entries(R.players || {}).filter(([, p]) => !p.teacher).sort((a, b) => a[1].num - b[1].num);
  const inClass = () => studs().filter(([u]) => Raid().isLobby(R) || (R.active || {})[u]);
  const dungeonName = () => { const D = DS.ASSETS.dungeons, i = D.ids.indexOf(L.theme); return i >= 0 ? D.names[i] : '던전'; };

  function render() {
    const i = R.state.step ?? -1;
    $('#h-top').innerHTML = `<b>${esc(L.unit)} · ${esc(L.title)}</b><span>${esc(C().stepName(L, R))}</span><span class="muted">수업 코드 <b>${code}</b></span>${DS.UI.fs.btn('h-fs')}`;
    DS.UI.fs.bind('h-fs');
    heroes(); side(i);
    const step = Raid().stepOf(L, R);
    videoOverlay(step);
    const el = $('#h-arena');
    el.classList.toggle('focus-on', Raid().focusOn(R) && !Raid().isLobby(R));
    if (Raid().restOn(R) && !Raid().isLobby(R) && !Raid().isClosed(R)) return restScene();
    if (step && (step.kind === 'monster' || step.kind === 'boss')) { const key = `f${i}`; if (built !== key) buildFight(step, key); else updateFight(step); sheetOverlay(step); return; }
    clearInterval(bubbleT);
    if (Raid().isClosed(R)) { built = 'closed'; el.innerHTML = `<div class="h-victory"><div class="trophy"><i class="trophy-img" style="background-image:url('${DS.ASSETS.base}${DS.ASSETS.trophy}')"></i></div><h1>수업 끝!</h1><p class="muted">모두 모닥불로 돌아갔어요. 게임 기록은 수학 성적이 아니에요.</p><div class="stamp-bar big">📮 반드시 학습지 확인도장 받아가세요.</div><div class="h-acts row">${klassBtn()}<button class="btn primary" id="h-tcamp">🏛 교사 캠프 가기</button></div></div>`; bindActs(); return; }
    if (Raid().isLobby(R) || Raid().isFinale(L, R)) return lobbyScene(Raid().isFinale(L, R));
    // v0.9.2: 개념 설명 = 왼쪽 개념 · 오른쪽 바로 이어지는 문제 (일반 문제 m 만 — ⭐ 스페셜 난입은 미리 보이지 않게). 문제 칸 이미지가 없으면 개념 하나만 크게
    const nx = L.steps[i + 1], prob = nx && nx.kind === 'monster' && !nx.special && !nx.review ? nx : null;
    const img = (prep.img || {})[step.id], pimg = prob ? (prep.img || {})[prob.id] : null, split = !!(img && pimg);
    if (zoomStep !== i) { zoomStep = i; zoom = ''; }
    const key = `c${i}|${img ? img.length : 0}|${pimg ? pimg.length : 0}|${zoom}`;
    if (built === key) return;
    built = key;
    const one = img ? `<img src="${img}" alt="${esc(step.title)} 학습지">` : `<div class="h-sheet-empty">📄 학습지 이미지 칸<br><span class="muted small">수업 준비 화면에서 '${esc(step.title)}' 이미지를 넣으면 여기에 크게 떠요</span><p class="h-intro">${pretty(step.say || '')}</p></div>`;
    el.innerHTML = split
      ? `<div class="h-concept split${zoom ? ` zoom-${zoom} wfull` : ''}">
        <div class="h-half" data-zoom="l"><p class="h-ctitle">📣 ${esc(step.title)}</p><div class="h-sheet"><img src="${img}" alt="${esc(step.title)} 학습지"></div></div>
        <div class="h-half" data-zoom="r"><p class="h-ctitle prob">⚔ 이어지는 문제 · ${esc(prob.title)}</p><div class="h-sheet"><img src="${pimg}" alt="${esc(prob.title)} 학습지"></div></div>
        <p class="h-zoom-tip muted small">${zoom ? '누르면 좌우로 다시 나눠 봐요' : '한쪽을 누르면 그쪽만 크게'}</p>
        <div class="h-focus-badge">⚠ 집중모드 — 학생 폰 멈춤</div></div>`
      : `<div class="h-concept${zoom && img ? ' wfull' : ''}"${img ? ' data-zoom="one"' : ''}><p class="h-ctitle">📣 ${esc(step.title)}</p>
      <div class="h-sheet">${one}</div>${img ? `<p class="h-zoom-tip muted small">${zoom ? '누르면 원래 크기로' : '그림을 누르면 화면 가득 크게'}</p>` : ''}
      <div class="h-focus-badge">⚠ 집중모드 — 학생 폰 멈춤</div></div>`;
    el.querySelectorAll('[data-zoom]').forEach((h) => (h.onclick = (e) => { e.stopPropagation(); zoom = zoom ? '' : h.dataset.zoom; render(); }));
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
      <div class="hrow teach">${DS.Art.hero(DS.Art.teacherHero(R), 'idle', 'mini')}<b>선생님</b><i class="dot"></i></div>
      ${list.map(([u, p]) => `<div class="hrow">${DS.Art.hero(p.hero, 'idle', 'mini')}<span>${DS.Titles.nameHtml(p, { size: 16, short: true })}</span>${st(u, p)}<i class="dot${Raid().online(R, u) || Raid().isLobby(R) ? '' : ' off'}"></i></div>`).join('')}
      <p class="muted small h-legend">● 접속 · ○ 끊김 — 정답·오답 글자는 띄우지 않아요</p>`;
  }

  // ── 가운데: 던전 단체 대기실 (수업 전 · 마무리) ─────────────
  function lobbyScene(finale) {
    const list = inClass().filter(([, p]) => !finale || true);
    const sig = `lobby|${finale}|${list.map(([u, p]) => u + p.hero + (p.title || '')).join()}|${finale ? JSON.stringify([R.words, R.hide]) : ''}|${DS.ShareCard.klassReady(L, R)}`;
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
      ${finale && DS.Result.floorText(L) ? `<p class="lb2-floor">${DS.Result.floorText(L)}</p>` : ''}
      ${finale ? `<div class="lb2-cnt">💬 ${words.length} / ${n}</div>` : `<div class="lb2-qr"><div id="h-qr" class="qr"></div><b>${code}</b><span>QR · 수업 코드</span></div>`}
      <div class="lb2-say teacher">${finale ? '모두 수고했네! 오늘 배운 것 한마디씩 남기게' : `${L.no ? `${L.no}차시 ` : ''}${esc(L.title.split('·')[0].trim())} 던전에 온 것을 환영하네!`}</div>
      <div class="lb2-h teacher" style="left:50%;top:60%">${DS.Art.hero(DS.Art.teacherHero(R), finale ? 'attack' : 'idle', finale ? 'pairhop' : 'huff')}<i class="shadow"></i><span class="nm gold">선생님</span></div>
      ${pos.map((o, i) => `<div class="lb2-h" style="left:${o.x}%;top:${o.y}%;z-index:${5 + Math.round(o.y / 10)};--sz:${size}px;animation-delay:${(i * 0.13) % 0.9}s"><span class="nm">${DS.Titles.nameHtml(o.p, { size: 16, short: true })}</span><div class="${(finale ? i % 2 === 1 : o.flip) ? 'face-l' : ''}">${DS.Art.hero(o.p.hero, 'idle', finale ? 'pairhop' : 'huff')}</div><i class="shadow"></i>${finale && words.includes(o.u) ? `<span class="lb2-bub" data-u="${o.u}">${esc(R.words[o.u].t)}</span>` : ''}</div>`).join('')}
      ${finale ? '<div class="stamp-bar wide">📮 반드시 학습지 확인도장 받아가세요.</div>' : ''}
      ${Raid().focusOn(R) ? '<div class="h-focus-badge">⚠ 집중모드</div>' : ''}
      <div class="h-acts corner${finale ? '' : ' below-qr'}">${finale ? klassBtn() : '<button class="btn small" id="h-tcamp">🏛 교사 캠프</button>'}</div></div>`;
    bindActs();
    if (!finale && window.QRCode) new QRCode($('#h-qr'), { text: studentUrl(), width: 150, height: 150 });
    if (finale) rotateBubbles();
  }
  // 🏕 쉼터 (2026-11-04): 대기실 장면을 편안하게 — 따뜻한 불빛 · 가운데 모닥불 · 모두 둘러앉음 · 타이머 (선생님이 PC 로 퀴즈를 해도 뒤에 깔려 있음)
  function restScene() {
    const list = inClass(), r = (R.state || {}).rest || {}, sig = `rest|${r.at}|${r.min}|${list.map(([u, p]) => u + p.hero).join()}`;
    if (built === sig) return;
    built = sig; clearInterval(bubbleT);
    const n = list.length, size = n > 24 ? 62 : n > 16 ? 72 : 84, per = Math.max(1, Math.ceil(n / 3)), c = DS.ASSETS.camp;
    const pos = list.map(([u, p], i) => {
      const ring = i % 3, k = Math.floor(i / 3), a = Math.PI * (0.04 + 0.92 * ((k + ring * 0.33) / per));
      return { u, p, x: 50 - Math.cos(a) * (23 + ring * 12.5), y: 64 + Math.sin(a) * (7 + ring * 8.5), flip: Math.cos(a) > 0 };
    });
    $('#h-arena').innerHTML = `<div class="h-lobby2 rest bg-scene th-${L.theme || ''}">
      <p class="lb2-title">🏕 쉼터</p><p class="lb2-sub">잠깐 쉬어 가요 — 물 한 모금 · 기지개 쭉!</p>
      <div class="rest-timer">⏱ <b data-rest-end="${C().restEnd(R)}">${C().mmss(C().restLeft(R))}</b></div>
      <div class="rest-fire"><i class="camp-glow"></i><i class="camp-glow g2"></i><i class="camp-fire-img" style="background-image:url('${DS.ASSETS.base}${c.fire.src}');background-size:${c.fire.cols * 100}% ${(c.fire.rows || 1) * 100}%;background-position:0 0"></i></div>
      <div class="lb2-say teacher">잠깐 쉬었다 가세! 🔥</div>
      <div class="lb2-h teacher" style="left:50%;top:44%">${DS.Art.hero(DS.Art.teacherHero(R), 'sit', 'huff')}<i class="shadow"></i><span class="nm gold">선생님</span></div>
      ${pos.map((o, i) => `<div class="lb2-h" style="left:${o.x}%;top:${o.y}%;z-index:${5 + Math.round(o.y / 10)};--sz:${size}px;animation-delay:${(i * 0.13) % 0.9}s"><span class="nm">${DS.Titles.nameHtml(o.p, { size: 16, short: true })}</span><div class="${o.flip ? 'face-l' : ''}">${DS.Art.hero(o.p.hero, 'sit', 'huff')}</div><i class="shadow"></i></div>`).join('')}</div>`;
    const f = c.fire; let k = 0; clearInterval(restFireT);
    restFireT = setInterval(() => { const e = document.querySelector('#h-arena .rest-fire .camp-fire-img'); if (!e) { clearInterval(restFireT); return; } k = (k + 1) % f.frames; e.style.backgroundPosition = `${((k % f.cols) / Math.max(1, f.cols - 1)) * 100}% ${(Math.floor(k / f.cols) / Math.max(1, (f.rows || 1) - 1)) * 100}%`; }, f.ms);
  }
  let restFireT = null;
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
      else { const rec = Raid().record(L, R, step.id, u); out[u] = { n: rec.tries.length, dmg: rec.best, label: Raid().resultLabel(rec.last), prac: rec.practice, h: Raid().healsGiven(R, step.id, u) }; }
    });
    return out;
  }
  function buildFight(step, key) {
    built = key; queue = []; wonFx = ''; vanished = ''; lastHit = ''; if (demo && demo.step !== step) demoClose();
    const f = fightOf(step);
    const hs = studs().filter(([u]) => (R.active || {})[u]);
    const n = hs.length, row0 = Math.ceil(n / 2);
    const pos = hs.map(([u, p], i) => { const r = i < row0 ? 0 : 1, k = r ? i - row0 : i, cnt = r ? n - row0 : row0; const x = 7 + ((k + 0.5) / Math.max(1, cnt)) * 86 + (r ? 2 : 0); return { u, p, x, y: r ? 96 : 82 }; });
    $('#h-arena').innerHTML = `<div class="raid2 bg-scene th-${L.theme || ''} ${step.kind === 'boss' ? 'boss quake' : ''}${step.special ? ' special' : ''}" id="raid">
      <div class="raid-top"><b>${step.kind === 'boss' ? '👑 ' : step.special ? '⭐ ' : step.review ? '📖 ' : ''}${esc(f.title)}</b><div class="raid-bars"><div class="raid-hp"><i id="rh-bar"></i><span id="rh-txt"></span></div><div class="raid-atk" id="rh-atk" title="몬스터 공격 게이지 (학생 폰과 같은 시계)"><i></i><span></span></div></div></div>
      ${step.special ? '<div class="raid-banner">⭐ 스페셜 몬스터 난입!</div>' : step.kind === 'boss' ? '<div class="raid-banner boss">👑 보스 출현!</div>' : ''}
      <div class="raid2-shadow"></div><div class="raid2-mon" id="rm">${DS.Art.monster(f.sprite, 'idle', 'float')}<div id="rm-fx"></div></div>
      ${pos.map((o) => `<div class="fh2" id="fh-${o.u}" style="left:${o.x}%;top:${o.y}%;z-index:${5 + Math.round(o.y / 10)}"><span class="fh-name">${DS.Titles.nameHtml(o.p, { size: 16, short: true })}</span><div class="${o.x > 50 ? 'face-l' : ''}">${DS.Art.hero(o.p.hero, 'idle')}</div><i class="shadow"></i></div>`).join('')}
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
      if (a.n > was.n && !a.prac && a.dmg > was.dmg) lastHit = u; // ⚔ 마무리 일격 후보 = 체력을 깎은 마지막 학생
      if (a.n > was.n) queue.push({ u, dmg: a.prac ? 0 : Math.max(0, a.dmg - was.dmg), label: step.kind === 'boss' ? (a.dmg > was.dmg ? 'partial' : 'fail') : a.prac ? 'practice' : a.label });
      if ((a.h || 0) > (was.h || 0)) queue.push({ u, label: 'heal' }); // v0.9.6 💚 힐: 힐러만 보인다 (받은 학생은 안 보임)
    });
    seen = now;
    const wait = step.kind === 'monster' ? Raid().waiting(L, R, step.id) : [];
    const clr = $('#r-clear');
    if (f.done) {
      clr.hidden = false; clr.className = 'raid-clear'; clr.innerHTML = step.kind === 'boss' ? '🎉 보스 격파! 모두 함께 이겼다!' : '⚔ 몬스터 격파!';
      if (wonFx !== built) { const fin = lastHit; setTimeout(() => finisher(fin, step), 350 * (queue.length + 1) + 300); }
      if (wonFx !== built) { wonFx = built; setTimeout(() => { const m = $('#rm'); if (m && vanished !== built) m.innerHTML = DS.Art.monster(f.sprite, 'down'); DS.Sound.correct(); document.querySelectorAll('.fh2').forEach((h, k) => { const a = h.querySelector('.art'); if (!a) return; a.parentElement.classList.toggle('face-l', k % 2 === 1); a.classList.add('pairhop'); a.style.animationDelay = `${(k % 2) * 0.22}s`; }); }, 600); }
    } else if (step.kind === 'monster' && !wait.length && f.hp.left > 0) {
      clr.hidden = false; clr.className = 'raid-clear note'; clr.innerHTML = `모두 공격했다! 남은 체력 ${f.hp.left} — 재도전으로 더 공격하자`;
    } else clr.hidden = true;
    play();
  }
  // ⚔ 마무리 일격 (2026-11-03 · 0.9.6.9 고침: 이름 배너 없앰): 체력을 0 으로 만든 학생의 용사가 슬로모션으로 돌진 → 하얀 섬광 · 큰 이펙트 두 번 · 강한 흔들림
  function finisher(u, step) {
    const arena = $('#raid'), h = u && document.getElementById(`fh-${u}`), m0 = $('#rm'), p = (R.players || {})[u]; if (!arena || !p) return;
    arena.classList.remove('slowmo', 'fin-flash', 'quake-big'); void arena.offsetWidth; arena.classList.add('slowmo'); // 1) 장면이 느려지며 살짝 어두워지고 다가감
    if (h && m0) {
      const hr = h.getBoundingClientRect(), mr = m0.getBoundingClientRect();
      h.style.setProperty('--tx', `${(mr.left + mr.width / 2 - (hr.left + hr.width / 2)) * 0.82}px`);
      h.style.setProperty('--ty', `${(mr.top + mr.height * 0.7 - (hr.top + hr.height / 2)) * 0.82}px`);
      h.classList.remove('dash', 'swing', 'dash-slow'); void h.offsetWidth; h.classList.add('finisher', 'dash-slow');
      pose(h, p.hero || 0, 'attack', 2400);
    }
    setTimeout(() => { // 2) 임팩트
      arena.classList.remove('slowmo'); arena.classList.add('fin-flash', 'quake-big');
      setTimeout(() => arena.classList.remove('fin-flash', 'quake-big'), 1500);
      const ar = arena.getBoundingClientRect(), mr = m0 ? m0.getBoundingClientRect() : ar;
      const at = { x: mr.left - ar.left + mr.width / 2, y: mr.top - ar.top + mr.height / 2 }, sc = Math.min(ar.width, ar.height) / 520;
      if (DS.FX) { DS.FX.play(arena, p.fx || 'flame', { ...at, scale: sc, perfect: true }); setTimeout(() => DS.FX.play(arena, p.fx || 'flame', { ...at, scale: sc * 0.75, perfect: true }), 220); }
      if (m0) { m0.classList.remove('flash'); void m0.offsetWidth; m0.classList.add('flash'); }
      DS.Sound.hit(); setTimeout(() => DS.Sound.hit(), 140); setTimeout(() => DS.Sound.correct(), 380);
    }, 1450);
    if (h) setTimeout(() => h.classList.remove('finisher', 'dash-slow'), 2600);
  }
  // 👾 몬스터 공격 (학생 폰과 같은 시계 DS.Raid.atkClock): 체력바 바로 밑 게이지 → 다 차면 큰 공격 연출 + 용사 전원 피격 · 헉헉
  let atkT = null, atkMemo = {};
  function hallAtk() {
    const g = document.getElementById('rh-atk'); if (!g || !L || !R) return;
    const c = Raid().atkClock(L, R, DS.Net.now(), window.DS_ATK || null);
    const bar = g.querySelector('i'), txt = g.querySelector('span');
    if (!c) { bar.style.width = '0%'; txt.textContent = ''; g.classList.remove('hot'); atkMemo = {}; return; }
    if (c.paused) { g.classList.add('bound'); txt.textContent = '⏸ 집중모드'; return; }
    const tr = Raid().atkTrack(atkMemo, c, `${code}|${(R.state || {}).step}|${c.kind}`);
    bar.style.width = `${(tr.p * 100).toFixed(1)}%`; g.classList.toggle('hot', tr.p > 0.8); g.classList.remove('bound');
    txt.textContent = `👾 공격까지 ${Math.max(0, Math.ceil((1 - tr.p) * c.per))}초 · ${c.per < 30 ? '🔥 빠름' : c.per < 40 ? '보통' : '🐢 느려짐'}${c.bind ? `  ·  ⛓ 묶기 ${c.bind}초` : ''}`;
    if (tr.strike) hallStrike(c);
  }
  function hallStrike(c) {
    const arena = $('#raid'), m = $('#rm'); if (!arena) return;
    if (m) { m.classList.remove('lunge-big'); void m.offsetWidth; m.classList.add('lunge-big'); setTimeout(() => m.classList.remove('lunge-big'), 700); }
    setTimeout(() => {
      arena.classList.remove('atk-hit'); void arena.offsetWidth; arena.classList.add('atk-hit'); setTimeout(() => arena.classList.remove('atk-hit'), 800);
      const b = document.createElement('div'); b.className = 'atk-banner'; b.innerHTML = `💥 몬스터의 공격! <small>${c.lock}초 멈춤</small>`; arena.appendChild(b); setTimeout(() => b.remove(), 1600);
      if (DS.FX) DS.FX.play(arena, 'flame', { scale: 0.7 });
      DS.Sound.squish(); setTimeout(() => DS.Sound.hit(), 120);
      document.querySelectorAll('.fh2').forEach((h) => {
        const u = h.id.slice(3), hid = ((R.players || {})[u] || {}).hero || 0;
        h.classList.remove('struck'); void h.offsetWidth; h.classList.add('struck'); setTimeout(() => h.classList.remove('struck'), 600);
        pose(h, hid, 'hit', 400); setTimeout(() => pose(h, hid, 'pant', c.lock * 1000 + 900), 400);
      });
    }, 300);
  }
  // 용사 자세 잠깐 바꾸기 (공격 → ms 뒤 서 있는 자세). 승리 점프(pairhop) 중이면 그대로 둔다
  function pose(h, heroId, p, ms) {
    const art = h.querySelector('.art'); if (!art || art.classList.contains('pairhop')) return;
    const box = art.parentElement; box.innerHTML = DS.Art.hero(heroId, p);
    clearTimeout(h._pt); h._pt = setTimeout(() => { const a2 = box.querySelector('.art'); if (a2 && !a2.classList.contains('pairhop')) box.innerHTML = DS.Art.hero(heroId, 'idle'); }, ms);
  }
  // 공격 연출: 0.35초 간격으로 차례차례. 성공 = 몬스터로 뛰어올라 내 이펙트 + 데미지 숫자 (전부 맞힘이면 크게 + PERFECT! + 흔들림)
  function play() {
    if (playing || !queue.length) return;
    playing = true;
    const a = queue.shift();
    const h = document.getElementById(`fh-${a.u}`), arena = $('#raid'), m0 = $('#rm');
    if (h && a.label === 'heal') {
      const t = document.createElement('span'); t.className = 'heal-tag'; t.textContent = `💚 ${(R.players[a.u] || {}).nick || ''}의 응원!`; h.appendChild(t); setTimeout(() => t.remove(), 1900);
      h.classList.remove('healing'); void h.offsetWidth; h.classList.add('healing'); setTimeout(() => h.classList.remove('healing'), 1300);
      DS.Sound.correct();
    } else if (h && arena && m0) {
      // v0.9.2 연습 공격(이미 다 맞힌 학생): 돌진 + 이펙트 + 머리 위 「✔ 이미 성공」 · 데미지 숫자 · PERFECT 흔들림 없음
      const prac = a.label === 'practice', ok = a.label !== 'fail', perfect = a.label === 'success';
      const hr = h.getBoundingClientRect(), mr = m0.getBoundingClientRect(), ar = arena.getBoundingClientRect();
      h.style.setProperty('--tx', `${(mr.left + mr.width / 2 - (hr.left + hr.width / 2)) * (ok ? 0.8 : 0.35)}px`);
      h.style.setProperty('--ty', `${(mr.top + mr.height * 0.7 - (hr.top + hr.height / 2)) * (ok ? 0.8 : 0.35)}px`);
      h.classList.remove('dash', 'swing'); void h.offsetWidth; h.classList.add(ok ? 'dash' : 'swing');
      pose(h, (R.players[a.u] || {}).hero || 0, 'attack', 820); // v0.9.3 (사용자 지적 ⑤): 돌진하는 동안 공격 자세 → 돌아오면 서 있는 자세
      setTimeout(() => {
        if (ok) {
          DS.Sound.hit();
          const p = (R.players[a.u] || {}).fx || 'flame';
          DS.FX.play(arena, p, { x: mr.left - ar.left + mr.width / 2, y: mr.top - ar.top + mr.height / 2, scale: Math.min(ar.width, ar.height) / (perfect ? 900 : 1150), perfect });
          m0.classList.remove('flash'); void m0.offsetWidth; m0.classList.add('flash');
          if (prac) { const t = document.createElement('span'); t.className = 'prac-tag'; t.textContent = '⛓ 몬스터 묶기!'; h.appendChild(t); setTimeout(() => t.remove(), 1600); }
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

  // 🎬 설명 영상 (v0.8.6): 교사 폰 · 이 화면의 「🎬 설명 영상 틀기」 → 큰 화면 위에 재생. 이미지(개념 · 문제 화면)는 그대로 두고 그 위에 뜬다
  let videoKey = '';
  function videoOverlay(step) {
    const url = step && DS.Video.pick(L, prep.video, step.id), on = !!step && Raid().videoOn(R, step.id) && url && DS.Video.ok(url);
    let ov = document.getElementById('h-video-ov');
    if (!on) { if (ov) ov.remove(); videoKey = ''; return; }
    const k = `${step.id}|${url}`;
    if (ov && k === videoKey) return;
    if (!ov) { ov = document.createElement('div'); ov.id = 'h-video-ov'; ov.className = 'h-video-ov'; document.getElementById('screen-hall').appendChild(ov); }
    videoKey = k;
    ov.innerHTML = `<div class="h-video-box"><p class="h-ctitle">🎬 ${esc(step.title || '설명 영상')}</p><div class="video-frame">${DS.Video.frameHtml(url, true)}</div>
      <div class="row"><span class="muted small">드라이브 영상은 ▶ 를 눌러 재생 · 교사 폰 「🎬 영상 닫기」로도 닫혀요</span><button class="btn" id="h-video-x">✕ 영상 닫기</button></div></div>`;
    ov.querySelector('#h-video-x').onclick = () => C().run(() => DS.Act.setVideoOn(code, null));
    DS.Video.attach(ov, url, { lesson: L.id, slot: step.id }).catch((e) => DS.UI.toast(e.message || '영상을 불러오지 못했어요.'));
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
    ov.onclick = () => { if (ov.querySelector('img')) ov.classList.toggle('wfull'); }; // 그림을 누르면 칸 가득 흰 바탕으로 크게 · 다시 누르면 원래대로
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
    el.innerHTML = `${C().pctHtml(L, R)}<p class="muted small">다음 ▶ ${esc(C().nextName(L, R))}</p><div class="row"><button class="btn" id="h-back"${i < 0 ? ' disabled' : ''}>◀ 뒤로</button><button class="btn primary" id="h-fwd"${Raid().isClosed(R) ? ' disabled' : ''}>${Raid().isFinale(L, R) ? '수업 끝 ▶' : '앞으로 ▶'}</button></div>${live ? C().restBtn(R) + (Raid().restOn(R) ? '' : C().videoBtn(L, R, prep.video) + C().sheetBtn(L, R) + C().focusBtn(R)) : ''}${live && Raid().stepOf(L, R) && ['monster', 'boss'].includes(Raid().stepOf(L, R).kind) ? `<button class="btn demo-btn" id="h-demo">🎮 시연: ${Raid().stepOf(L, R).kind === 'boss' ? '형성평가 풀어 보기' : '문제 풀어 보기'}</button>` : ''}`;
    const db = $('#h-demo'); if (db) db.onclick = () => demoOpen(Raid().stepOf(L, R));
    C().bindRest(el, code, R); C().bindPct(el, code, R, L); C().bindFocus(el, code, R); C().bindSheet(el, code, R); C().bindVideo(el, code, R);
    $('#h-fwd').onclick = () => C().run(() => C().forward(code, R, L));
    $('#h-back').onclick = () => C().run(() => C().back(code, R, L));
  }

  // ── 🎮 시연 (v0.9.3 사용자 요청): 교사가 학생과 똑같은 문제 칸으로 풀어 본다 · 데미지 · 기록 없음 (이 PC 화면에서만) ─────────
  //   다 맞히면 선생님 캐릭터가 돌진해 일격 → 이미 공략된(체력 0) 몬스터면 형체가 완전히 사라진다(소멸) · 아직이면 「시연 · 데미지 없음」
  //   정답 · 오답 표시는 교사 본인의 시연 풀이에만 보인다 (학생 답은 여전히 띄우지 않음 — DECISIONS 예외)
  function demoOpen(step, attempt = 0) {
    if (!step || !['monster', 'boss'].includes(step.kind)) return;
    if (step.kind === 'boss') return bossDemo(step, attempt ? 2 : 1);
    const items = L.items(step.id, `demo|${code}|${Date.now()}`, attempt);
    demo = { step, attempt, items, given: items.map((q) => (q.type === 'multi' ? [] : q.type === 'number' ? 0 : q.type === 'text' ? '' : null)), marks: null };
    demoDraw();
  }
  // 👑 보스(형성평가) 시연 (2026-11-03 사용자 요청): 학생 폰과 같은 방식 — 문항 번호를 누르면 학생과 같은 입력 창(DS.Quiz.ask)
  //   세트 1 = 학습지 형성평가 그대로 · 세트 2 = 숫자 바꾼 문제 · 데미지 · 기록 없음 · 체력 문항(1~hpItems)을 다 맞히면 선생님의 일격
  function bossDemo(step, set, ok) {
    demo = { step, boss: true, set, ok: ok || [] };
    const items = L.boss.sets[set], hp = L.boss.hpItems;
    let ov = document.getElementById('h-demo-ov');
    if (!ov) { ov = document.createElement('div'); ov.id = 'h-demo-ov'; ov.className = 'h-demo-ov'; document.getElementById('screen-hall').appendChild(ov); }
    const done = items.slice(0, hp).every((_, i) => demo.ok[i]);
    ov.innerHTML = `<div class="demo-box framed"><div class="demo-head"><b>🎮 시연 · ${esc(L.boss.title)}</b><span class="demo-tag">데미지 · 기록 없음</span>
        <button class="btn small${set === 1 ? ' on' : ''}" data-ds="1">📄 세트 1 (학습지)</button><button class="btn small${set === 2 ? ' on' : ''}" data-ds="2">🔄 세트 2 (숫자 바꿈)</button><button class="btn small" id="demo-x">✕ 닫기</button></div>
      <p class="muted small">문항을 눌러 풀어요 — 학생 폰과 같은 입력 창이에요. 1~${hp}번을 모두 맞히면 선생님의 일격!</p>
      <div class="boss-items">${items.map((p, i) => `<button class="bitem${demo.ok[i] === true ? ' ok' : demo.ok[i] === false ? ' tried' : ''}${i >= hp ? ' bonus' : ''}" data-di="${i}"><b>${i + 1}번${i >= hp ? ' 보너스' : ''}</b>${demo.ok[i] === true ? ' ✔' : demo.ok[i] === false ? ' ✘' : ''}</button>`).join('')}</div>
      ${done ? '<div class="demo-res ok">⚔ 형성평가 완료! 선생님의 일격!</div>' : ''}</div>`;
    ov.querySelector('#demo-x').onclick = demoClose;
    ov.querySelectorAll('[data-ds]').forEach((b) => (b.onclick = () => bossDemo(step, Number(b.dataset.ds))));
    ov.querySelectorAll('[data-di]').forEach((b) => (b.onclick = async () => {
      const i = Number(b.dataset.di);
      const r = await DS.Quiz.ask({ name: `형성평가 ${i + 1}번 (시연)`, formula: set === 1 ? '세트 1' : '세트 2 · 🔄 숫자가 바뀌었어요' }, items[i], { collect: true, tag: '🎮 시연' });
      if (!r || !demo || !demo.boss) return;
      const okNow = DS.Quiz.grade(items[i], r.given), next = demo.ok.slice(); next[i] = okNow;
      if (okNow) DS.Sound.slash(); else DS.Sound.squish();
      const was = items.slice(0, hp).every((_, k) => demo.ok[k]);
      bossDemo(step, set, next);
      if (!was && items.slice(0, hp).every((_, k) => next[k])) setTimeout(() => { demoClose(); teacherStrike(step); }, 1200);
    }));
  }
  function demoClose() { const ov = document.getElementById('h-demo-ov'); if (ov) ov.remove(); demo = null; }
  function demoDraw() {
    let ov = document.getElementById('h-demo-ov');
    if (!ov) { ov = document.createElement('div'); ov.id = 'h-demo-ov'; ov.className = 'h-demo-ov'; document.getElementById('screen-hall').appendChild(ov); }
    const d = demo, S = DS.Student, ready = d.items.every((q, i) => (q.type === 'multi' ? d.given[i].length > 0 : q.type === 'text' ? String(d.given[i] || '').trim() !== '' : d.given[i] != null));
    const res = d.marks ? `<div class="demo-res ${d.marks.every(Boolean) ? 'ok' : 'ng'}">${d.marks.every(Boolean) ? '⚔ 모두 맞혔다! 선생님의 일격!' : `✘ ${d.marks.filter((m) => !m).length}개 틀림 — 해설을 함께 봐요`}</div>
      <div class="marks">${d.items.map((q, i) => `<div class="mark ${d.marks[i] ? 'ok' : 'ng'}"><b>${i + 1}</b> ${d.marks[i] ? '✔' : '✘'} <span class="math">${DS.UI.pretty(S.itemText(q))}</span>${d.marks[i] ? '' : `<br><span class="sol-line math">${DS.UI.pretty(S.solOf(q))}</span>`}</div>`).join('')}</div>` : '';
    ov.innerHTML = `<div class="demo-box framed"><div class="demo-head"><b>🎮 시연 · ${esc(d.step.kind === 'boss' ? L.boss.title : d.step.title)}</b><span class="demo-tag">데미지 · 기록 없음</span>
        <button class="btn small${d.attempt ? '' : ' on'}" data-da="0">📄 ${d.step.kind === 'boss' ? '세트 1 (학습지)' : '학습지 문제'}</button><button class="btn small${d.attempt ? ' on' : ''}" data-da="1">🔄 ${d.step.kind === 'boss' ? '세트 2 (숫자 바꿈)' : '숫자 바꾼 문제'}</button><button class="btn small" id="demo-x">✕ 닫기</button></div>
      ${d.marks ? res : `${(L.monsters[d.step.id] || {}).note ? `<p class="muted small">💡 ${esc(L.monsters[d.step.id].note)}</p>` : ''}<div class="items demo-items">${d.items.map((q, i) => S.itemHtml(q, i, d.given)).join('')}</div>
        <button class="btn primary big" id="demo-go"${ready ? '' : ' disabled'}>⚔ 공격! (시연)</button>`}
      ${d.marks ? '<div class="row demo-row"><button class="btn" data-da="1">↻ 숫자 바꿔 다시</button><button class="btn primary" id="demo-x2">✕ 닫고 레이드로</button></div>' : ''}</div>`;
    ov.querySelector('#demo-x').onclick = demoClose; const x2 = ov.querySelector('#demo-x2'); if (x2) x2.onclick = demoClose;
    ov.querySelectorAll('[data-da]').forEach((b) => (b.onclick = () => demoOpen(d.step, Number(b.dataset.da))));
    ov.querySelectorAll('[data-pick]').forEach((b) => (b.onclick = () => {
      const [i, v] = b.dataset.pick.split('|'), k = Number(i), t = d.items[k].type;
      if (t === 'multi') { const s = new Set(d.given[k]); const n = Number(v); if (s.has(n)) s.delete(n); else s.add(n); d.given[k] = [...s].sort((a, b2) => a - b2); }
      else if (t === 'choice') d.given[k] = Number(v); else if (t === 'ox') d.given[k] = v === 'O'; else d.given[k] = [v];
      DS.Sound.clank(); demoDraw();
    }));
    DS.UI.dial(ov, (i) => d.given[i], (i, v) => { d.given[i] = v; });
    ov.querySelectorAll('[data-text]').forEach((inp) => inp.addEventListener('input', () => { d.given[Number(inp.dataset.text)] = inp.value; const go = ov.querySelector('#demo-go'); if (go) go.disabled = !d.items.every((q, j) => (q.type === 'multi' ? d.given[j].length > 0 : q.type === 'text' ? String(d.given[j] || '').trim() !== '' : d.given[j] != null)); }));
    const go = ov.querySelector('#demo-go');
    if (go) go.onclick = () => {
      const given = d.items.map((q, i) => (q.type === 'number' ? Number(d.given[i]) : d.given[i]));
      d.marks = d.items.map((q, i) => DS.Quiz.grade(q, given[i]));
      demoDraw();
      if (d.marks.every(Boolean)) { DS.Sound.slash(); setTimeout(() => { demoClose(); teacherStrike(d.step); }, 1100); } else DS.Sound.squish();
    };
  }
  // 선생님 일격: 왼쪽에서 등장 → 몬스터로 돌진 → 팍! (이미 공략된 몬스터면 소멸)
  function teacherStrike(step) {
    const arena = $('#raid'), m0 = $('#rm'); if (!arena || !m0 || Raid().stepOf(L, R) !== step) return;
    const kill = step.kind === 'boss' ? Raid().bossHp(L, R).won : Raid().cleared(L, R, step.id), ar = arena.getBoundingClientRect(), mr = m0.getBoundingClientRect();
    const t = document.createElement('div'); t.className = 'teach-strike'; t.innerHTML = DS.Art.hero(DS.Art.teacherHero(R), 'attack');
    arena.appendChild(t);
    t.style.setProperty('--tx', `${mr.left - ar.left + mr.width * 0.2 - ar.width * 0.08}px`); t.style.setProperty('--ty', `${mr.top - ar.top + mr.height * 0.45 - ar.height * 0.62}px`);
    requestAnimationFrame(() => t.classList.add('go'));
    setTimeout(() => {
      DS.Sound.hit(); setTimeout(() => DS.Sound.correct(), 140);
      DS.FX.play(arena, 'twinkle', { x: mr.left - ar.left + mr.width / 2, y: mr.top - ar.top + mr.height / 2, scale: Math.min(ar.width, ar.height) / 700, perfect: true });
      arena.classList.remove('shake'); void arena.offsetWidth; arena.classList.add('shake');
      const tag = document.createElement('div'); tag.className = `perfect ${kill ? 'vanish-txt' : 'demo-txt'}`; tag.textContent = kill ? '💥 소멸!' : '시연 · 데미지 없음'; arena.appendChild(tag); setTimeout(() => tag.remove(), 1600);
      if (kill) {
        vanished = built; m0.classList.remove('flash'); void m0.offsetWidth; m0.classList.add('vanish');
        for (let k = 0; k < 14; k++) { const sh = document.createElement('i'); sh.className = 'shard'; sh.style.setProperty('--a', `${(k / 14) * 360}deg`); sh.style.left = `${mr.left - ar.left + mr.width / 2}px`; sh.style.top = `${mr.top - ar.top + mr.height / 2}px`; arena.appendChild(sh); setTimeout(() => sh.remove(), 1100); }
        setTimeout(() => { m0.classList.remove('vanish'); m0.classList.add('gone'); }, 900);
      } else { m0.classList.remove('flash'); void m0.offsetWidth; m0.classList.add('flash'); }
    }, 520);
    setTimeout(() => t.remove(), 1500);
  }

  return { enter };
})();
