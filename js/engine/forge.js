// 연성 모루 (DIMENSION SLASHER 엔진): [왼쪽 재료] [연산] [오른쪽 재료] → ⚒ 연성
//  - 엄격: 순서·자리가 틀리면 실패 + 개념 메시지 (DS.Craft.match)
//  - 처음 만드는 카드는 반짝이며 예제가 뜨고, 맞혀야 완성 (틀리면 숫자가 바뀐 예제로 다시)
//  - 재료는 무한(소모 안 됨). 중간 부품(B ⊂ A 등)은 이 기기에서 만든 만큼 가방에 남는다
// mount(el, { lesson, stage, owned(): Set, onCraft(cardId) → Promise, seed })
window.DS = window.DS || {};

DS.Forge = (function () {
  const { esc, pretty } = DS.UI;
  function mount(el, o) {
    const L = o.lesson;
    let slots = { a: null, op: null, b: null }, mid = {}, busy = false, msg = '', msgCls = '';
    const owned = () => o.owned();
    const label = (t) => (t.kind === 'card' ? L.cards[t.id].name : t.kind === 'mid' ? L.midParts[t.id].sym : L.parts[t.id].sym);
    function place(t) {
      if (busy) return;
      if (t.kind === 'op') slots.op = t.id;
      else if (!slots.a) slots.a = t;
      else if (!slots.b) slots.b = t;
      else { DS.UI.toast('재료 칸이 가득 찼어요. 모루 칸을 눌러 빼세요.'); return; }
      DS.Sound.clank();
      draw();
    }
    async function forge() {
      if (busy) return;
      const tok = (t) => t && { kind: t.kind === 'mid' ? 'part' : t.kind, id: t.id };
      const res = DS.Craft.match(L, slots.op, tok(slots.a), tok(slots.b));
      if (!res.ok) {
        DS.Sound.wrong();
        msg = `<b>연성 실패</b> — ${pretty(res.msg)}`; msgCls = 'ng';
        slots = { a: null, op: slots.op, b: null };
        draw(true);
        return;
      }
      const out = res.out;
      if (out.kind === 'part') {
        mid[out.id] = (mid[out.id] || 0) + 1;
        DS.Sound.forge();
        msg = `<b>부품 완성:</b> <span class="math">${pretty(L.midParts[out.id].sym)}</span> — 가방에 들어갔어요. 이어서 연성하세요.`; msgCls = 'ok';
        slots = { a: null, op: null, b: null };
        draw();
        return;
      }
      if (!owned().has(out.id)) { // 처음 만드는 카드: 예제
        busy = true;
        el.querySelector('.anvil').classList.add('spark');
        DS.Sound.magic();
        await new Promise((r) => setTimeout(r, 600));
        const ok = await DS.Quiz.ask(L.cards[out.id], L.example(out.id, `${o.seed || 'x'}|${out.id}|${Date.now()}`), { tag: '✨ 연성 예제' });
        busy = false;
        if (o.onExample) o.onExample(out.id, ok);
        if (!ok) {
          msg = '<b>아직 개념이 흐릿하다…</b> 해설을 떠올리며 다시 연성하면 <b>숫자가 바뀐 예제</b>가 나와요.'; msgCls = 'ng';
          slots = { a: null, op: null, b: null };
          draw();
          return;
        }
      }
      DS.Sound.forge();
      await o.onCraft(out.id);
      msg = `<b>✨ ${esc(L.cards[out.id].name)}</b> 카드 완성!`; msgCls = 'ok';
      slots = { a: null, op: null, b: null };
      draw();
    }
    function draw(shake) {
      const st = L.stages[o.stage()];
      const have = owned();
      const chip = (t, sym, name, extra = '') => `<button class="part${extra}" data-t='${esc(JSON.stringify(t))}'><span class="psym math">${pretty(sym)}</span><span class="pname">${esc(name)}</span></button>`;
      const slot = (k) => { const t = slots[k]; return `<button class="slot${t ? ' filled' : ''}" data-k="${k}">${t ? `<span class="math">${pretty(label(t))}</span>` : '<span class="muted">재료</span>'}</button>`; };
      el.innerHTML = `
        <div class="need">${st.cards.map((c) => `<span class="need-chip${have.has(c) ? ' ok' : ''}">${have.has(c) ? '✓' : '○'} ${esc(L.cards[c].name)}</span>`).join('')}</div>
        <p class="shelf-title">연산</p>
        <div class="shelf">${Object.entries(L.ops).map(([id, op]) => chip({ kind: 'op', id }, op.sym, op.name, ' op')).join('')}</div>
        <p class="shelf-title">재료 <span class="muted small">무한</span></p>
        <div class="shelf">${Object.entries(L.parts).map(([id, p]) => chip({ kind: 'part', id }, p.sym, p.name)).join('')}${Object.entries(mid).filter(([, n]) => n > 0).map(([id]) => chip({ kind: 'mid', id }, L.midParts[id].sym, L.midParts[id].name, ' mid')).join('')}${[...have].filter((c) => L.cards[c]).map((c) => chip({ kind: 'card', id: c }, L.cards[c].formula, L.cards[c].name, ' cardmat')).join('')}</div>
        <div class="anvil${shake ? ' shake' : ''}">${slot('a')}<button class="slot op-slot${slots.op ? ' filled' : ''}" data-k="op">${slots.op ? `<span class="math">${pretty(L.ops[slots.op].sym)}</span>` : '<span class="muted">연산</span>'}</button>${slot('b')}<button class="btn primary forge-btn"${slots.op && (slots.a || slots.b) ? '' : ' disabled'}>⚒<br>연성</button></div>
        <div class="forge-msg ${msgCls}">${msg || '<span class="muted">왼쪽 칸부터 채워져요 — 순서가 뜻을 바꿔요. 모루 칸을 누르면 빠져요.</span>'}</div>
        <p class="shelf-title">레시피 힌트</p>
        <div class="book">${st.cards.map((c) => `<div class="recipe${have.has(c) ? ' known' : ''}">${DS.Art.card(L.cards[c].art)}<div><b>${esc(L.cards[c].name)}</b> <span class="math">${pretty(L.cards[c].formula)}</span><br>${have.has(c) ? `<span class="math">${pretty(L.book[c].chain)}</span>` : `<span class="muted">힌트: ${esc(L.book[c].hint)}</span>`}</div></div>`).join('')}</div>`;
      el.querySelectorAll('.part').forEach((b) => b.addEventListener('click', () => place(JSON.parse(b.dataset.t))));
      el.querySelectorAll('.slot').forEach((b) => b.addEventListener('click', () => { if (busy) return; slots[b.dataset.k] = null; draw(); }));
      el.querySelector('.forge-btn').addEventListener('click', forge);
    }
    draw();
    return { redraw: () => draw(), slots: () => slots };
  }
  return { mount };
})();
