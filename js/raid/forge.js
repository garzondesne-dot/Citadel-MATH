// 모루 연성창 (대장간 · 번외 특전): 모닥불(수업 코드 없이 언제나) · 단체 대기실(형성평가 만점)에서 연다.
// 모루 작업면에 [재료] [연산] [재료] → 🔨 내려치기 → 엄격 판정 → 처음 만드는 카드는 마력 예제를 맞혀야 완성 → 망치 3번 쾅 → 카드 등장.
// 열린 범위 = unlock/{반} (교사가 그 반에 배포한 차시). 가진 카드 = cards/{반}/{번호}/{카드id} (비밀번호 초기화해도 남는다)
window.DS = window.DS || {};

DS.Forge = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc, pretty } = DS.UI;
  const U = () => DS.Unit, N = () => DS.Net;
  let me = null, no = 0, owned = {}, tab = 'forge', slots = { l: null, op: null, r: null }, pick = 'l', busy = false;
  const key = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const tok = (t) => (t && t.startsWith('card:') ? U().card(t.slice(5)) : null);
  const symOf = (t) => { if (!t) return ''; const c = tok(t); if (c) return c.short || c.name; const m = U().MATS.find((x) => x.id === t); return m ? m.sym : t; };

  async function open(m) {
    me = m; tab = 'forge'; slots = { l: null, op: null, r: null }; pick = 'l';
    no = Number(await N().get(`unlock/${key(m.c)}`).catch(() => 0)) || 0;
    owned = (await N().get(`cards/${key(m.c)}/${m.n}`).catch(() => null)) || {};
    $('#forge').hidden = false; document.body.classList.add('forge-open');
    render();
  }
  function close() { $('#forge').hidden = true; document.body.classList.remove('forge-open'); }
  const opened = () => U().opens(no);
  const have = () => opened().filter((c) => owned[c.id]);

  function render() {
    const el = $('#forge');
    el.innerHTML = `<div class="fg-wrap"><div class="fg-bg"></div>
      <div class="fg-hud"><b>⚒ 모루</b><span class="fg-pill">${esc(me.c)}반 · ${no ? `${no}차시까지 열림` : '아직 열린 차시 없음'}</span><span class="fg-pill blue">📖 ${have().length} / ${opened().length}</span><button class="btn small" id="fg-x">✕ 닫기</button></div>
      <div class="tabs fg-tabs">${[['forge', '🔨 연성'], ['book', '📖 도감'], ['mine', '🃏 내 카드']].map(([k, t]) => `<button class="tab${tab === k ? ' on' : ''}" data-tab="${k}">${t}</button>`).join('')}</div>
      <div class="fg-body">${!no ? '<p class="fg-empty">선생님이 우리 반에 수업(2차시부터)을 열면 레시피가 나타나요.</p>' : tab === 'book' ? book() : tab === 'mine' ? mine() : forgeTab()}</div></div>`;
    $('#fg-x').onclick = close;
    el.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { tab = b.dataset.tab; render(); }));
    if (tab === 'forge' && no) bindForge();
    el.querySelectorAll('.mcard[data-card]').forEach((c) => (c.onclick = () => zoom(c.dataset.card)));
  }

  // ── 연성 ────────────────────────────────────────────────
  function forgeTab() {
    const F = DS.ASSETS.forge, f = F.anvil.face, base = DS.ASSETS.base;
    const o = slots.op ? U().opOf(slots.op) : null;
    const slot = (k, cls, label) => `<button class="fg-slot ${cls}${pick === k ? ' pick' : ''}${slots[k] ? ' full' : ''}" data-slot="${k}">${slots[k] ? (k === 'op' ? `<span class="fg-op">${esc(U().opOf(slots.op).sym)}</span>` : `<span class="fg-mat${tok(slots[k]) ? ' card' : ''}">${pretty(symOf(slots[k]))}</span>`) : `<span class="fg-ph">${label}</span>`}</button>`;
    return `<div class="fg-stage"><div class="fg-anvil" style="--fx:${f[0] * 100}%;--fy:${f[1] * 100}%;--fw:${(f[2] - f[0]) * 100}%;--fh:${(f[3] - f[1]) * 100}%">
        <img class="fg-anvil-img" src="${base}${F.anvil.src}" alt="모루">
        <div class="fg-face">${slot('l', 'mat', '재료')}${slot('op', 'op', '연산')}${slot('r', 'mat', o && o.unary ? '—' : '재료')}</div>
        <img class="fg-hammer" id="fg-hammer" src="${base}${F.hammer.src}" alt="망치"><div class="fg-spark" id="fg-spark"></div></div></div>
      <p class="fg-msg" id="fg-msg">${o && o.unary ? `${esc(o.sym)} 는 한 칸 연산 — 재료 하나만 올려요.` : '칸을 누르고, 아래에서 재료·연산을 골라요.'}</p>
      <div class="fg-tray"><p class="fg-h">◆ 재료</p><div class="fg-parts">${U().MATS.map((m) => `<button class="fg-mat-t" data-put="${m.id}" title="${esc(m.tip)}">${pretty(m.sym)}</button>`).join('')}</div>
        <p class="fg-h">⚙ 연산</p><div class="fg-parts">${U().OPS.map((x) => `<button class="fg-op-t${x.no > no ? ' lock' : ''}" data-op="${x.id}"${x.no > no ? ' disabled' : ''}>${x.no > no ? '🔒' : pretty(x.sym)}</button>`).join('')}</div>
        ${have().length ? `<p class="fg-h">🃏 내 카드 (재료로)</p><div class="fg-parts">${have().map((c) => `<button class="fg-mat-t card" data-put="card:${c.id}">${esc(c.short || c.name)}</button>`).join('')}</div>` : ''}</div>
      <div class="fg-act"><button class="btn small" id="fg-clear">비우기</button><button class="btn primary big" id="fg-hit">🔨 내려치기!</button></div>`;
  }
  function bindForge() {
    const el = $('#forge');
    el.querySelectorAll('[data-slot]').forEach((b) => (b.onclick = () => { const k = b.dataset.slot; if (slots[k]) { slots[k] = null; pick = k; } else pick = k; DS.Sound.clank(); render(); }));
    el.querySelectorAll('[data-put]').forEach((b) => (b.onclick = () => {
      const t = b.dataset.put;
      let k = pick === 'op' ? null : pick;
      if (!k || slots[k]) k = !slots.l ? 'l' : !slots.r ? 'r' : pick === 'op' ? 'l' : pick;
      slots[k] = t; pick = !slots.l ? 'l' : !slots.op ? 'op' : !slots.r ? 'r' : k; DS.Sound.clank(); render();
    }));
    el.querySelectorAll('[data-op]').forEach((b) => (b.onclick = () => { slots.op = b.dataset.op; pick = !slots.l ? 'l' : !slots.r ? 'r' : 'op'; DS.Sound.clank(); render(); }));
    $('#fg-clear').onclick = () => { slots = { l: null, op: null, r: null }; pick = 'l'; render(); };
    $('#fg-hit').onclick = hit;
  }
  const msg = (t, bad) => { const m = $('#fg-msg'); if (m) { m.textContent = t; m.classList.toggle('bad', !!bad); } };
  async function hit() {
    if (busy) return;
    const r = U().forge(slots.op, slots.l, slots.r, no);
    if (!r.ok) { msg(r.msg, true); const a = document.querySelector('.fg-anvil'); a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); DS.Sound.squish(); return; }
    const c = r.card, first = !owned[c.id];
    if (first) {
      const ok = await DS.Quiz.ask({ name: c.name, formula: '마력 예제' }, c.ex, { tag: '🔮 연성을 하려면 마력이 필요해' });
      if (!ok) { msg('마력이 모자라요… 해설을 보고 다시 내려쳐 봐요!', true); return; }
    }
    busy = true;
    await strike();
    busy = false;
    reveal(c, first);
  }
  // 망치: 들어 올렸다가(커짐) 모루 가운데로 쾅 × 3 → 불꽃
  function strike() {
    return new Promise((res) => {
      const h = $('#fg-hammer'), sp = $('#fg-spark');
      if (!h) return res();
      h.classList.remove('swing'); void h.offsetWidth; h.classList.add('swing');
      [380, 760, 1140].forEach((ms, i) => setTimeout(() => { DS.Sound.hit(); if (sp) { sp.classList.remove('on'); void sp.offsetWidth; sp.classList.add('on'); } if (i === 2 && navigator.vibrate) navigator.vibrate(60); }, ms));
      setTimeout(res, 1450);
    });
  }
  function reveal(c, first) {
    const el = document.createElement('div'); el.className = 'fg-reveal';
    const n = have().length + (first ? 1 : 0);
    el.innerHTML = `<div class="fg-burst"></div><b class="fg-new">${first ? 'NEW CARD!' : '이미 가진 카드'}</b>${DS.Card.html(c, { w: Math.min(260, innerWidth * 0.62) })}
      <b class="fg-name">${esc(c.name)}</b><span class="muted small">도감 ${n} / ${opened().length}</span><button class="btn primary big" id="fg-keep">${first ? '🃏 내 카드에 넣기' : '확인'}</button>`;
    $('#forge').appendChild(el);
    DS.Sound.correct();
    el.querySelector('#fg-keep').onclick = () => DS.Control.run(async () => {
      if (first) { await N().set(`cards/${key(me.c)}/${me.n}/${c.id}`, true); owned[c.id] = true; }
      slots = { l: null, op: null, r: null }; pick = 'l'; el.remove(); render();
      if (first && have().length === opened().length) DS.UI.toast('🎉 열린 레시피를 모두 모았어요! (도감 완성 특전은 곧)', 4000);
    });
  }

  // ── 도감 · 내 카드 ──────────────────────────────────────
  function book() {
    const secs = [...new Set(U().CARDS.map((c) => c.sec))];
    return secs.map((s) => {
      const cs = U().CARDS.filter((c) => c.sec === s);
      if (cs[0].no > no) return '';
      return `<p class="fg-h">${esc(s)} <span class="muted">${cs.filter((c) => owned[c.id]).length} / ${cs.length}</span></p><div class="fg-grid">${cs.map((c) => DS.Card.html(c, { w: 104, unknown: !owned[c.id] })).join('')}</div>`;
    }).join('') + (U().CARDS.some((c) => c.no > no) ? '<p class="fg-lock">🔒 다음 소단원은 선생님이 차시를 배포하면 나타나요</p>' : '');
  }
  function mine() {
    const h = have();
    return h.length ? `<div class="fg-grid">${h.map((c) => DS.Card.html(c, { w: 104 })).join('')}</div><p class="muted small">카드를 누르면 크게 볼 수 있어요. 카드는 공격에 쓰지 않아요 — 꾸미기 특전용이에요.</p>` : '<p class="fg-empty">아직 만든 카드가 없어요. 🔨 연성에서 첫 카드를 만들어 봐요!</p>';
  }
  function zoom(id) {
    const c = U().card(id); if (!c) return;
    const un = !owned[id];
    const el = document.createElement('div'); el.className = 'fg-zoom';
    el.innerHTML = `${DS.Card.html(c, { w: Math.min(300, innerWidth * 0.75), unknown: un })}<p>${un ? '아직 만들지 않은 카드 — 힌트를 보고 연성해 봐요' : `<b>${esc(c.name)}</b> · ${pretty(c.fm)}`}</p>`;
    el.onclick = () => el.remove();
    $('#forge').appendChild(el);
  }
  return { open, close };
})();
