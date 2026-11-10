// 🙊 눈치 게임 (쉼터 놀이 · 2026-11-08 선생님 「진행」 · 방향 방 사양 그대로)
//   1부터 차례로 숫자를 외침 · 0.4초 안에 두 명 이상 = 「💥 동시!」 모두 탈락(숫자 그대로) · 혼자 남은 마지막 1명 = 「⌛ 마지막!」 탈락
//   한 판: 준비 3초 → 「다음 = n」 · 8초 무반응 = 「⏳ 긴장감…」 · 20초 무반응 = 남은 사람 모두 탈락
//   생존전: 살아남은 사람만 다음 판 · 3명 이하 남거나 3판 끝 → 남은 사람 모두 우승(호칭 「눈치 백단」 · 🎖 메달 nun)
//   판정 = 교실 TV(종합상황실 · 체험판 작은 TV)가 함 (디펜스와 같은 구조) · 폰 = 누를 때 신호 1개 rooms/{code}/nun/{g}/{판}/{uid} = 서버 시각
//   시작 전 · 탈락 뒤 · 판에 없던 사람(늦게 들어옴)의 입력은 무시 · 보상 모두 같게(참여 💎1 · 우승 💎4 + 메달)
window.DS = window.DS || {};
DS.Nunchi = (() => {
  const N = () => DS.Net, P = (code, x) => `rooms/${code}/${x}`;
  const T = () => (typeof window !== 'undefined' && window.DS_NUN) || {}; // 시험용 시간 줄이기
  const READY = () => T().ready || 3000, CLASH = 400, HINT = 8000, TIMEOUT = () => T().timeout || 20000, SHOW = () => T().show || 3500, ROUNDS = 3, WIN_AT = 3, MIN = 3;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const keys = (o) => Object.keys(o || {});
  const arr = (x) => (Array.isArray(x) ? x : x && typeof x === 'object' ? Object.keys(x).sort((a, b) => a - b).map((k) => x[k]) : []); // 저장소가 배열을 객체로 돌려줄 때
  const studentsIn = (R) => keys(R.players).filter((u) => !R.players[u].teacher && (R.active || {})[u]);
  const nameOf = (R, u) => { const p = (R.players || {})[u] || {}; return `${p.num != null ? `${p.num} ` : ''}${p.nick || ''}`; };
  let code = null;
  const setCode = (c) => { code = c; };

  async function start(c, R) {
    const alive = studentsIn(R);
    if (alive.length < MIN) throw Object.assign(new Error(`🙊 눈치 게임은 ${MIN}명 이상일 때 할 수 있어요 (지금 ${alive.length}명)`), { user: true });
    const now = N().now(), g = now;
    await N().set(P(c, 'fun'), { kind: 'nun', g, round: 1, phase: 'ready', to: now + READY(), alive: Object.fromEntries(alive.map((u) => [u, 1])), n: 1, said: {}, out: {}, done: {}, ev: [], lastAt: now + READY(), at: now });
    code = c;
  }

  // ── 판정 (교실 TV 한 대만: drv) ─────────────────────────
  // 💤 #57 ⑫ (2026-11-10): 20초 무반응(지금 규칙의 시간)까지 한 번도 안 누른 학생 = 탈락이 아니라 💤 관전 (혼자 남은 「⌛ 마지막」 은 게임 규칙이라 그대로 탈락) (남은 수 · 결과 · 상에서 빠짐) · 폰 「🙋 다음 판 참여」(응원 칸 🙋) = 다음 판부터 다시
  function step(f, presses, now, cheers) {
    const x = JSON.parse(JSON.stringify(f)); x.said = x.said || {}; x.out = x.out || {}; x.done = x.done || {}; x.zz = x.zz || {}; x.ev = arr(x.ev); x.hist = arr(x.hist); x.ev.forEach((e) => { e.u = arr(e.u); });
    const ev = (e) => { x.ev.push({ ...e, at: now }); x.ev = x.ev.slice(-6); };
    if (x.phase === 'ready') { if (now < x.to) return null; x.phase = 'play'; x.lastAt = now; return x; }
    if (x.phase === 'show') {
      if (now < x.to) return null;
      const surv = keys(x.alive).filter((u) => x.said[u]);
      if (surv.length <= WIN_AT || x.round >= ROUNDS) { x.phase = 'end'; x.win = surv; x.endAt = now; return x; }
      const back = keys(x.zz).filter((u) => { const c = (cheers || {})[u]; return c && c.e === '🙋' && Number(c.at) >= Number(x.zz[u]); }), zz = { ...x.zz }; back.forEach((u) => { delete zz[u]; });
      return { kind: 'nun', g: x.g, round: x.round + 1, phase: 'ready', to: now + READY(), alive: Object.fromEntries([...surv, ...back].map((u) => [u, 1])), zz, n: 1, said: {}, out: {}, done: {}, ev: [], lastAt: now + READY(), hist: [...x.hist, { round: x.round, surv: surv.length, back: back.length }], at: now };
    }
    if (x.phase !== 'play') return null;
    let changed = false;
    const left = () => keys(x.alive).filter((u) => !x.said[u] && !x.out[u]);
    // 아직 처리 안 한 누름 (판에 있는 사람 · 시작 뒤 · 한 번만)
    const todo = Object.entries(presses || {}).filter(([u, t]) => x.alive[u] && !x.done[u] && !x.said[u] && !x.out[u] && Number(t) >= x.lastAt - 50).map(([u, t]) => [u, Number(t)]).sort((a, b) => a[1] - b[1]);
    while (todo.length) {
      const t0 = todo[0][1]; if (now - t0 < CLASH + 150) break; // 동시 판정 창이 닫힐 때까지 기다림
      const grp = todo.filter(([, t]) => t - t0 <= CLASH); todo.splice(0, grp.length);
      grp.forEach(([u]) => { x.done[u] = 1; });
      if (grp.length === 1) { x.said[grp[0][0]] = x.n; ev({ k: 'say', n: x.n, u: [grp[0][0]] }); x.n += 1; }
      else { grp.forEach(([u]) => { x.out[u] = 'clash'; }); ev({ k: 'clash', n: x.n, u: grp.map(([u]) => u) }); }
      x.lastAt = Math.max(x.lastAt, grp[grp.length - 1][1]); changed = true;
    }
    const L = left();
    if (L.length === 1 && !todo.length) { x.out[L[0]] = 'last'; ev({ k: 'last', n: x.n, u: L }); changed = true; }
    else if (L.length > 1 && !todo.length && now - x.lastAt > TIMEOUT()) { L.forEach((u) => { x.out[u] = 'time'; }); ev({ k: 'time', n: x.n, u: L }); changed = true; }
    if (!left().length) { keys(x.alive).forEach((u) => { if (!x.done[u] && x.out[u] === 'time') { x.out[u] = 'zz'; x.zz[u] = now; } }); x.phase = 'show'; x.to = now + SHOW(); changed = true; } // 💤 한 번도 안 누름
    return changed ? x : null;
  }
  let timer = null, busy = false;
  function drive() {
    if (timer) return;
    timer = setInterval(async () => {
      if (busy || !code) return; busy = true;
      try {
        const f = await N().get(P(code, 'fun')).catch(() => null), me = N().uid(), now = N().now();
        if (!f || f.kind !== 'nun') { clearInterval(timer); timer = null; return; }
        if (f.phase === 'end') { if (now - (f.endAt || now) > (T().endHold || 15000) && (!f.drv || f.drv.u === me || now - (f.drv.at || 0) > 3000) && DS.Fun) await DS.Fun.stop(code); return; } // 2026-11-09: 끝 화면 15초 뒤 저절로 닫힘
        if (f.drv && f.drv.u !== me && now - (f.drv.at || 0) < 3000) return;
        const presses = f.phase === 'play' ? (await N().get(P(code, `nun/${f.g}/${f.round}`)).catch(() => null)) || {} : {};
        const cheers = f.phase === 'show' && f.zz ? (await N().get(P(code, `nunE/${f.g}`)).catch(() => null)) || {} : {};
        const nx = step(f, presses, now, cheers);
        if (nx) { nx.drv = { u: me, at: now }; await N().set(P(code, 'fun'), nx); }
        else if (!f.drv || f.drv.u !== me || now - f.drv.at > 1200) await N().set(P(code, 'fun/drv'), { u: me, at: now });
      } finally { busy = false; }
    }, 150);
  }

  // ── 교사 리모컨 · 종합실 조작 막대 ───────────────────────
  const status = (f) => (f.phase === 'end' ? `🙊 눈치 · 🏆 우승 ${(f.win || []).length}명` : `🙊 눈치 · ${f.round}판 · 남은 ${keys(f.alive).filter((u) => !(f.out || {})[u]).length}명${keys(f.zz).length ? ` · 💤 ${keys(f.zz).length}명 관전` : ''}`);
  const ctlHtml = (R) => `<div class="fun-ctl"><span>${esc(status(R.fun || {}))}</span><button class="btn small" data-fun="stop">⏹ 게임 끝</button><button class="btn small" data-fun="again">🔄 새 게임</button></div>`;
  const bindCtl = () => drive();

  // ── 교실 TV ─────────────────────────────────────────────
  let hallSig = '';
  let hall = function (el, R) {
    drive();
    const f = R.fun || {}, now = N().now(), last = arr(f.ev).slice(-1)[0]; if (last) last.u = arr(last.u); f.win = arr(f.win);
    const fresh = last && now - last.at < 1800;
    const ids = keys(f.alive), said = f.said || {}, out = f.out || {};
    const hint = f.phase === 'play' && now - (f.lastAt || now) > HINT ? '<p class="nn-hint">⏳ 긴장감…</p>' : '';
    const sig = JSON.stringify([f.g, f.round, f.phase, f.n, keys(said).length, keys(out).length, keys(f.zz).length, last && last.at, !!hint, (R.nunE || {})[f.g] ? keys(R.nunE[f.g]).length : 0]);
    if (hallSig === sig && el.querySelector('.nn-wrap')) return; hallSig = sig;
    const hero = (u) => { const p = R.players[u] || {}, st = out[u] === 'zz' ? 'out zz' : out[u] ? 'out' : said[u] ? 'said' : ''; const pop = fresh && (last.u || []).includes(u);
      return `<div class="nn-h ${st}${pop ? ` pop ${last.k}` : ''}">${pop ? `<b class="nn-bub">${last.k === 'say' ? `${last.n}!` : last.k === 'clash' ? '💥' : last.k === 'last' ? '⌛' : '⏳'}</b>` : said[u] ? `<b class="nn-num">${said[u]}</b>` : ''}${DS.Art.hero(p.hero || 0, out[u] ? 'down' : pop && last.k === 'say' ? 'win' : 'idle', '')}<span class="nn-name">${esc(nameOf(R, u))}</span></div>`; };
    const big = f.phase === 'ready' ? `<h1 class="nn-big">${Math.max(1, Math.ceil(((f.to || now) - now) / 1000))}</h1><p>${f.round}판 준비! 1부터 차례로 — 겹치면 탈락</p>`
      : f.phase === 'play' ? (fresh && last.k === 'clash' ? `<h1 class="nn-big bad">💥 동시!</h1><p>${last.u.length}명 탈락 · 다음은 그대로 <b>${f.n}</b></p>` : fresh && last.k === 'last' ? '<h1 class="nn-big bad">⌛ 마지막!</h1><p>끝까지 못 외쳐서 탈락</p>' : `<p>다음</p><h1 class="nn-big">${f.n}</h1>${hint}`)
      : f.phase === 'show' ? `<h1 class="nn-big">${f.round}판 끝</h1><p>살아남은 사람 ${keys(said).length}명</p>`
      : `<h1 class="nn-big win">🏆 눈치 백단!</h1><p>${(f.win || []).map((u) => `<b>${esc(nameOf(R, u))}</b>`).join(' · ') || '우승자 없음 — 모두 아쉬웠어요'}</p>`;
    const emo = Object.values((R.nunE || {})[f.g] || {}).slice(-12).map((e, i) => `<i class="nn-emo" style="left:${(i * 37) % 92 + 3}%;animation-delay:${(i % 4) * 0.3}s">${esc(e.e || '👏')}</i>`).join('');
    el.innerHTML = `<div class="nn-wrap ph-${f.phase}"><div class="nn-top"><b>🙊 눈치 게임</b><span>${f.round} / ${ROUNDS}판 · 남은 ${ids.filter((u) => !out[u]).length}명${keys(f.zz).length ? ` · 💤 ${keys(f.zz).length}명 관전` : ''}</span></div>
      <div class="nn-center">${big}</div><div class="nn-row" style="--cols:${Math.max(1, Math.ceil(ids.length / 2))}">${ids.map(hero).join('')}</div><div class="nn-emos">${emo}</div></div>`;
  }

  // ── 학생 폰 ─────────────────────────────────────────────
  const paid = {}, sent = {}, backSent = {};
  let phoneSig = '';
  let phone = function (body, R, me, c) {
    if (c) code = c;
    const f = R.fun || {}; f.win = arr(f.win); f.hist = arr(f.hist);
    const inRound = !!(f.alive || {})[me], out = (f.out || {})[me], said = (f.said || {})[me], mine = sent[`${f.g}|${f.round}`];
    if (f.phase === 'end' && DS.Gem && !paid[f.g]) {
      const p = (R.players || {})[me] || {}, m = p.cls != null && p.num ? { c: p.cls, n: p.num } : null, G = DS.Gem.G;
      const joined = f.hist.length || inRound || (f.win || []).includes(me);
      if (m && joined) { paid[f.g] = true; DS.Gem.add(m, G.funJoin, `fun_${f.g}`, '쉼터 놀이 참여').catch(() => {}); if ((f.win || []).includes(me)) { DS.Gem.add(m, G.funWin, `funwin_${f.g}`, '눈치 게임 우승').catch(() => {}); DS.Gem.medal(m, 'nun').catch(() => {}); } }
    }
    const sig = JSON.stringify([f.g, f.round, f.phase, f.n, inRound, out, said, !!mine, (f.zz || {})[me] || 0, backSent[f.g] || 0, f.phase === 'ready' ? Math.ceil(((f.to || 0) - N().now()) / 1000) : 0]);
    if (phoneSig === sig && body.querySelector('.nn-phone')) return; phoneSig = sig;
    let mid;
    if (f.phase === 'end') mid = (f.win || []).includes(me) ? '<h1 class="nn-big win">🏆 우승!</h1><p>호칭 「눈치 백단」 · 💎 +4</p>' : '<h1 class="nn-big">끝!</h1><p>다음 판에 도전해요 · 💎 +1</p>';
    else if ((f.zz || {})[me] || out === 'zz') mid = `<p class="nn-say">💤 관전 중 — 이번 판에 한 번도 안 눌렀어요</p><button class="btn primary big" id="nn-back"${backSent[f.g] && backSent[f.g] >= Number((f.zz || {})[me] || 0) ? ' disabled' : ''}>🙋 다음 판 참여</button>`; // #57 ⑫
    else if (!inRound) mid = '<p class="nn-say">👀 관객석 — 응원해요!</p>';
    else if (out) mid = `<h1 class="nn-big bad">${out === 'clash' ? '💥 동시!' : out === 'last' ? '⌛ 마지막!' : '⏳ 시간 끝'}</h1><p>이번 판 탈락 — 응원해요!</p>`;
    else if (said) mid = `<h1 class="nn-big">${said}! ✔</h1><p>살아남았어요 — 판이 끝날 때까지 기다려요</p>`;
    else if (f.phase === 'ready') mid = `<h1 class="nn-big">${Math.max(1, Math.ceil(((f.to || 0) - N().now()) / 1000))}</h1><p>${f.round}판 준비 — 아직 누르지 마세요</p>`;
    else if (f.phase === 'play' && mine) mid = '<h1 class="nn-big">…</h1><p>외쳤어요! 판정 중</p>';
    else if (f.phase === 'play') mid = `<button class="nn-btn" id="nn-go">${f.n}!</button><p class="muted small">한 판에 한 번 · 겹치면 탈락</p>`;
    else mid = '<p class="nn-say">판 정리 중…</p>';
    const cheer = (!inRound || out || f.phase === 'end') ? `<div class="nn-cheer">${['👏', '🔥', '😱'].map((e) => `<button class="btn" data-e="${e}">${e}</button>`).join('')}</div>` : '';
    body.innerHTML = `<div class="panel framed nn-phone"><p class="nn-top"><b>🙊 눈치 게임</b> · ${f.round || 1} / ${ROUNDS}판</p>${mid}${cheer}</div>`;
    const go = body.querySelector('#nn-go');
    if (go) go.onclick = () => { if (sent[`${f.g}|${f.round}`]) return; sent[`${f.g}|${f.round}`] = 1; if (navigator.vibrate) navigator.vibrate(30); N().set(P(code, `nun/${f.g}/${f.round}/${me}`), N().TS).catch(() => {}); phoneSig = ''; phone(body, R, me, code); };
    const bk = body.querySelector('#nn-back'); if (bk) bk.onclick = () => { backSent[f.g] = N().now(); N().set(P(code, `nunE/${f.g}/${me}`), { e: '🙋', at: N().TS }).catch(() => {}); phoneSig = ''; phone(body, R, me, code); };
    body.querySelectorAll('[data-e]').forEach((b) => (b.onclick = () => N().set(P(code, `nunE/${f.g}/${me}`), { e: b.dataset.e, at: N().TS }).catch(() => {})));
  }

  // 카운트다운 · 「긴장감」 · 말풍선 꺼짐은 시간으로 바뀜 → 0.4초마다 마지막 화면을 다시 그림 (바뀐 게 없으면 sig 로 건너뜀)
  let lastH = null, lastP = null;
  setInterval(() => {
    if (lastH && lastH[0].isConnected && lastH[0].querySelector('.nn-wrap')) hall(...lastH, true); else lastH = null; // 2026-11-09: 놀이가 끝나 다른 화면이 되면 다시 그리지 않음
    if (lastP && lastP[0].isConnected && lastP[0].querySelector('.nn-phone')) phone(...lastP, true); else lastP = null;
  }, 400);
  const hall0 = hall, phone0 = phone;
  hall = (el, R, tick) => { if (!tick) lastH = [el, R]; return hall0(el, R); };
  phone = (body, R, me, c, tick) => { if (!tick) lastP = [body, R, me, c]; return phone0(body, R, me, c); };
  return { start, step, hall, phone, ctlHtml, bindCtl, setCode, ROUNDS, CLASH };
})();
