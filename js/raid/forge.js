// 모루 연성창 (대장간 · 번외 특전): 모닥불(수업 코드 없이 언제나) · 단체 대기실(형성평가 만점)에서 연다.
// v0.9.0 C안: 모루 위 카드 3장 [재료] [연산] [재료] → 모루 옆 「연성」 → 엄격 판정 → 처음 만드는 카드는 마력 예제 → 망치가 내려와 덮고 충격파 → 카드 등장.
// 💡 만들 수 있는 카드 목록: 실패하면 힌트 조각 +1 → 재료 → 연산 순서로 공개 (「힌트 한 줄」 결정을 사용자 확정으로 바꿈, 2026-11-01)
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

  let preview = false; // 교사 대기공간: 모든 차시 미리 보기 (저장하지 않음)
  async function open(m, opt = {}) {
    me = m; tab = 'forge'; slots = { l: null, op: null, r: null }; pick = 'l'; preview = !!opt.preview;
    no = preview ? Number(opt.no) || 0 : Number(await N().get(`unlock/${key(m.c)}`).catch(() => 0)) || 0;
    owned = preview ? {} : (await N().get(`cards/${key(m.c)}/${m.n}`).catch(() => null)) || {};
    $('#forge').hidden = false; document.body.classList.add('forge-open');
    render();
  }
  function close() { $('#forge').hidden = true; document.body.classList.remove('forge-open'); if (DS.Camp && DS.Camp.refresh) DS.Camp.refresh(); }
  const opened = () => U().opens(no);
  const have = () => opened().filter((c) => owned[c.id]);

  function render() {
    const el = $('#forge');
    // CSS 변수 안의 url() 은 style.css 기준으로 풀리므로 절대 주소로 넣는다
    const abs = (k) => `url('${new URL(DS.ASSETS.base + DS.ASSETS.forgeC[k], location.href).href}')`;
    el.style.setProperty('--fc-mat', abs('material')); el.style.setProperty('--fc-op', abs('operator'));
    el.innerHTML = `<div class="fg-wrap"><div class="fg-bg" style="background-image:linear-gradient(#07132155,#071321aa),url('${DS.ASSETS.base}${DS.ASSETS.forgeC.bg}')"></div>
      <div class="fg-hud"><b>⚒ 모루</b><span class="fg-pill">${esc(me.c)}반 · ${no ? `${no}차시까지 열림` : '아직 열린 차시 없음'}</span><span class="fg-pill blue">📖 ${have().length} / ${opened().length}</span><button class="btn small" id="fg-x">✕ 닫기</button></div>
      <div class="tabs fg-tabs">${[['forge', '🔨 연성'], ['book', '📖 도감'], ['mine', '🃏 내 카드']].map(([k, t]) => `<button class="tab${tab === k ? ' on' : ''}" data-tab="${k}">${t}</button>`).join('')}</div>
      <div class="fg-body">${!no ? '<p class="fg-empty">선생님이 우리 반에 수업(2차시부터)을 열면 레시피가 나타나요.</p>' : tab === 'book' ? book() : tab === 'mine' ? mine() : forgeTab()}</div></div>`;
    $('#fg-x').onclick = close;
    el.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { tab = b.dataset.tab; render(); }));
    if (tab === 'forge' && no) bindForge();
    el.querySelectorAll('.mcard[data-card]').forEach((c) => (c.onclick = () => zoom(c.dataset.card)));
  }

  // ── 연성 (v0.9.0 C안 「황금 보강 망치」: 모루 위 카드 3장 · 모루 옆 「연성」 · 망치가 내려와 덮고 충격파) ──────
  const FC = () => DS.ASSETS.forgeC, img = (k) => `${DS.ASSETS.base}${FC()[k]}`;
  const matLabel = (t) => (tok(t) ? (tok(t).short || tok(t).name) : symOf(t));
  const tile = (inner, cls = '', attrs = '') => `<button class="fc-tile ${cls}" ${attrs}>${inner}</button>`;
  function forgeTab() {
    const o = slots.op ? U().opOf(slots.op) : null;
    const slot = (k) => {
      const t = slots[k], pickCls = pick === k ? ' pick' : '';
      if (k === 'op') return tile(t ? pretty(U().opOf(t).sym) : '<span class="fc-ph">연산</span>', `op${t ? '' : ' empty'}${pickCls}`, `data-slot="op"`);
      if (k === 'r' && o && o.unary) return tile('<span class="fc-ph">—</span>', `mat empty off`, `data-slot="r"`);
      return tile(t ? `<span class="${tok(t) ? 'fc-cardname' : ''}">${pretty(matLabel(t))}</span>` : '<span class="fc-ph">재료</span>', `mat${t ? '' : ' empty'}${tok(t) ? ' card' : ''}${pickCls}`, `data-slot="${k}"`);
    };
    const opsOpen = U().OPS.filter((x) => x.no <= no), opsLock = U().OPS.filter((x) => x.no > no);
    return `<div class="fc-stage" id="fc-stage">
        <img class="fc-anvil" src="${img('anvil')}" alt="모루">
        <div class="fc-slots">${slot('l')}${slot('op')}${slot('r')}</div>
        <button class="fc-go" id="fg-hit" style="background-image:url('${img('button')}')"><i>⚒</i>연성</button>
        <div class="fc-shade" id="fc-shade"></div>
        <img class="fc-hammer" id="fg-hammer" src="${img('hammer')}" alt="망치">
        <div class="fc-ring" id="fc-ring"></div><div class="fc-sparks" id="fg-spark"></div>
      </div>
      <p class="fg-msg" id="fg-msg">${o && o.unary ? `${esc(o.sym)} 는 한 칸 연산 — 재료 하나만 올려요.` : '재료 · 연산 · 재료를 올려 연성하세요.'}</p>
      <p class="fc-h">◆ 재료</p><div class="fc-grid">${U().MATS.map((m) => tile(pretty(m.sym), `mat${m.sym.length > 3 ? ' long' : ''}`, `data-put="${m.id}" title="${esc(m.tip)}"`)).join('')}</div>
      <p class="fc-h">⚙ 연산</p><div class="fc-grid">${opsOpen.map((x) => tile(pretty(x.sym), `op${x.sym.length > 3 ? ' long' : ''}`, `data-op="${x.id}"`)).join('')}</div>
      ${opsLock.length ? `<details class="fc-lock"><summary>🔒 잠긴 연산 ${opsLock.length}개</summary><div class="fc-grid">${opsLock.map(() => tile('🔒', 'op lock', 'disabled')).join('')}</div><p class="muted small">선생님이 다음 차시를 열면 하나씩 풀려요.</p></details>` : ''}
      ${have().length ? `<div class="fc-row"><p class="fc-h">▣ 내 카드 (재료로)</p><button class="btn small" id="fg-clear">비우기</button></div><div class="fc-grid">${have().map((c) => tile(`<span class="fc-cardname">${esc(c.short || c.name)}</span>`, 'mat card', `data-put="card:${c.id}"`)).join('')}</div>` : '<div class="fc-row"><span></span><button class="btn small" id="fg-clear">비우기</button></div>'}
      ${hintList()}`;
  }
  // 💡 만들 수 있는 카드 (v0.9.0): 이름은 ??? · 힌트 한 줄 + 모양(칸 수). 연성에 실패하면 💡 힌트 조각 +1 → 조각으로 한 단계씩 더 연다 (1단계: 재료 · 2단계: 연산까지)
  const hintKey = () => `citadel-hint-${key(me.c)}-${me.n}`;
  const hintGet = () => { try { return Object.assign({ pts: 2, lv: {} }, JSON.parse(localStorage.getItem(hintKey())) || {}); } catch (e) { return { pts: 2, lv: {} }; } };
  const hintSet = (h) => { try { localStorage.setItem(hintKey(), JSON.stringify(h)); } catch (e) { /* 무시 */ } };
  function hintList() {
    const h = hintGet(), todo = opened().filter((c) => !owned[c.id]);
    if (!todo.length) return '<p class="fc-h">💡 만들 수 있는 카드</p><p class="okc small">🎉 열린 레시피를 모두 모았어요!</p>';
    const chip = (t, show) => `<b class="fc-chip mat">${show ? pretty(matLabel(t)) : '?'}</b>`;
    const row = (c) => {
      const lv = Number(h.lv[c.id] || 0), op = U().opOf(c.op), opChip = `<b class="fc-chip op">${lv >= 2 ? pretty(op.sym) : '?'}</b>`;
      const shape = op.unary ? `${opChip}${chip(c.in[0], lv >= 1)}` : `${chip(c.in[0], lv >= 1)}${opChip}${chip(c.in[1], lv >= 1)}`;
      return `<div class="fc-hint g${c.grade}"><div><b>??? <span class="muted small">${esc(c.sec)}</span></b><p class="small">${esc(c.hint)}</p></div><div class="fc-shape">${shape}</div>
        ${lv < 2 ? `<button class="btn small" data-hint="${c.id}"${h.pts ? '' : ' disabled'}>💡 ${lv ? '연산 보기' : '재료 보기'}</button>` : '<span class="muted small">모두 공개</span>'}</div>`;
    };
    return `<div class="fc-row"><p class="fc-h">💡 만들 수 있는 카드 <span class="muted small">${todo.length}장</span></p><span class="fc-pts">💡 힌트 조각 <b>${h.pts}</b></span></div>
      <p class="muted small">연성에 실패하면 힌트 조각이 1개 생겨요 (벌이 아니라 단서!). 조각으로 재료 → 연산 순서로 열어요.</p>${todo.map(row).join('')}`;
  }
  function bindForge() {
    const el = $('#forge');
    el.querySelectorAll('[data-slot]').forEach((b) => (b.onclick = () => { const k = b.dataset.slot; if (slots[k]) { slots[k] = null; pick = k; } else pick = k; DS.Sound.clank(); render(); }));
    el.querySelectorAll('[data-put]').forEach((b) => (b.onclick = () => {
      const t = b.dataset.put, o = slots.op ? U().opOf(slots.op) : null;
      let k = pick === 'op' ? null : pick;
      if (o && o.unary) k = 'l';
      if (!k || slots[k]) k = !slots.l ? 'l' : !slots.r && !(o && o.unary) ? 'r' : pick === 'op' ? 'l' : pick;
      slots[k] = t; pick = !slots.l ? 'l' : !slots.op ? 'op' : !slots.r ? 'r' : k; DS.Sound.clank(); render();
    }));
    el.querySelectorAll('[data-op]').forEach((b) => (b.onclick = () => { slots.op = b.dataset.op; if (U().opOf(slots.op).unary) slots.r = null; pick = !slots.l ? 'l' : !slots.r ? 'r' : 'op'; DS.Sound.clank(); render(); }));
    el.querySelectorAll('[data-hint]').forEach((b) => (b.onclick = () => { const h = hintGet(); if (!h.pts) return; h.pts--; h.lv[b.dataset.hint] = Number(h.lv[b.dataset.hint] || 0) + 1; hintSet(h); DS.Sound.correct(); render(); }));
    const cl = $('#fg-clear'); if (cl) cl.onclick = () => { slots = { l: null, op: null, r: null }; pick = 'l'; render(); };
    $('#fg-hit').onclick = hit;
  }
  const msg = (t, bad) => { const m = $('#fg-msg'); if (m) { m.textContent = t; m.classList.toggle('bad', !!bad); } };
  async function hit() {
    if (busy) return;
    const r = U().forge(slots.op, slots.l, slots.r, no);
    if (!r.ok) {
      const h = hintGet(); h.pts = Math.min(9, h.pts + 1); hintSet(h);
      msg(`${r.msg} · 💡 힌트 조각 +1`, true);
      const a = document.querySelector('.fc-slots'); a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); DS.Sound.squish();
      const pts = document.querySelector('.fc-pts b'); if (pts) pts.textContent = h.pts;
      document.querySelectorAll('[data-hint]').forEach((b) => { b.disabled = false; });
      return;
    }
    const c = r.card, first = !owned[c.id];
    if (first) {
      const ok = await DS.Quiz.ask({ name: c.name, formula: '마력 예제' }, c.ex, { tag: '🔮 연성을 하려면 마력이 필요해' });
      if (!ok) { msg('마력이 모자라요… 해설을 보고 다시 연성해 봐요!', true); return; }
    }
    busy = true;
    await strike();
    busy = false;
    reveal(c, first);
  }
  // 망치: 위로 들렸다가 → 빠르게 내려와 카드 세 장을 덮음 → 충격파 · 불꽃 · 흔들림 → 제자리 (약 1.3초)
  function strike() {
    return new Promise((res) => {
      const h = $('#fg-hammer'), st = $('#fc-stage'), ring = $('#fc-ring'), sh = $('#fc-shade'), sp = $('#fg-spark');
      if (!h || !h.animate) return res();
      h.animate([{ transform: 'translateY(0) scale(1)' }, { transform: 'translateY(-14%) scale(1.04)', offset: 0.35 }, { transform: 'translateY(92%) scale(.96)', offset: 0.5 }, { transform: 'translateY(88%) scale(1)', offset: 0.75 }, { transform: 'translateY(0) scale(1)' }], { duration: 1300, easing: 'cubic-bezier(.5,0,.5,1)' });
      sh.animate([{ opacity: 0 }, { opacity: 0, offset: 0.4 }, { opacity: 1, offset: 0.5 }, { opacity: 0 }], { duration: 1300 });
      setTimeout(() => {
        DS.Sound.hit(); if (navigator.vibrate) navigator.vibrate(70);
        st.classList.remove('impact'); void st.offsetWidth; st.classList.add('impact');
        ring.animate([{ opacity: 1, transform: 'scale(.3)' }, { opacity: 0, transform: 'scale(1.3)' }], { duration: 600, easing: 'ease-out' });
        for (let i = 0; i < 18; i++) { const s = document.createElement('i'); s.className = 'fc-spark'; s.style.left = `${50 + (Math.random() - 0.5) * 40}%`; s.style.top = '62%'; sp.appendChild(s);
          s.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${(Math.random() - 0.5) * 260}px, ${-60 - Math.random() * 140}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }], { duration: 700 + Math.random() * 300, easing: 'ease-out' }).onfinish = () => s.remove(); }
      }, 650);
      setTimeout(res, 1350);
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
      if (first) { if (!preview) { await N().set(`cards/${key(me.c)}/${me.n}/${c.id}`, true); if (DS.Grow) DS.Grow.add(me, { card: 1 }, `card_${c.id}`).catch(() => {}); } owned[c.id] = true; }
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
